'use strict';

/* Adaptateurs d'extraction ciblés. Aucun contournement de CAPTCHA, fingerprint ou paywall. */
const { URL } = require('node:url');

function decodeHtml(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function clean(value) {
  return decodeHtml(String(value == null ? '' : value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}

function attrs(tag) {
  const out = {};
  const re = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = re.exec(tag || ''))) {
    out[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return out;
}

function hostMerchant(host) {
  host = String(host || '').toLowerCase().replace(/^www\./, '');
  if (/(^|\.)amazon\./.test(host)) return 'amazon';
  if (/(^|\.)fnac\./.test(host)) return 'fnac';
  if (/(^|\.)darty\./.test(host)) return 'darty';
  if (/(^|\.)cdiscount\./.test(host)) return 'cdiscount';
  if (/(^|\.)ldlc\./.test(host)) return 'ldlc';
  if (/(^|\.)boulanger\./.test(host)) return 'boulanger';
  if (/(^|\.)rakuten\./.test(host)) return 'rakuten';
  return 'other';
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
function innerHtml(source, tagName, start) {
  const tag = String(tagName || '').replace(/[^a-z0-9:-]/gi, '');
  if (!tag || VOID_TAGS.has(tag.toLowerCase())) return '';
  const re = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 1;
  let match;
  while ((match = re.exec(source))) {
    const closing = /^<\//.test(match[0]);
    const selfClosing = /\/\s*>$/.test(match[0]);
    if (closing) depth--;
    else if (!selfClosing) depth++;
    if (depth === 0) return source.slice(start, match.index);
  }
  return source.slice(start, start + 5000);
}

function readIdHtml(html, id) {
  const source = String(html || '');
  const safe = String(id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<([a-z][\\w:-]*)\\b(?=[^>]*\\bid\\s*=\\s*["']${safe}["'])[^>]*>`, 'i');
  const match = re.exec(source);
  return match ? innerHtml(source, match[1], match.index + match[0].length) : null;
}

function readId(html, id) {
  const raw = readIdHtml(html, id);
  return raw ? clean(raw) : null;
}

function readClass(html, names) {
  const source = String(html || '');
  const wanted = names.map(name => name.toLowerCase());
  const re = /<([a-z][\w:-]*)\b([^>]*\bclass\s*=\s*(?:"[^"]*"|'[^']*')[^>]*)>/gi;
  let match;
  while ((match = re.exec(source))) {
    const classes = String(attrs(match[2]).class || '').toLowerCase().split(/\s+/);
    if (!wanted.some(name => classes.includes(name))) continue;
    const text = clean(innerHtml(source, match[1], match.index + match[0].length));
    if (text) return text;
  }
  return null;
}

function readH1(html) {
  const source = String(html || '');
  const match = /<h1\b[^>]*>/i.exec(source);
  return match ? clean(innerHtml(source, 'h1', match.index + match[0].length)) : null;
}

function readMeta(html, matcher) {
  const re = /<meta\b[^>]*>/gi;
  let match;
  while ((match = re.exec(String(html || '')))) {
    const values = attrs(match[0]);
    if (matcher(values)) {
      const value = clean(values.content || values.value);
      if (value) return value;
    }
  }
  return null;
}

function normalizePrice(value, allowBare) {
  const text = String(value || '').replace(/\u00a0/g, ' ').trim();
  const re = allowBare
    ? /(?:€\s*)?(\d[\d\s.,]*\d|\d)\s*(?:€|EUR)?(?!\w)/i
    : /(?:€\s*)?(\d[\d\s.,]*\d|\d)\s*(?:€|EUR)(?!\w)/i;
  const match = text.match(re);
  if (!match || !/\d/.test(match[1])) return null;
  let number = match[1].replace(/\s+/g, '');
  const comma = number.lastIndexOf(',');
  const dot = number.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    number = comma > dot ? number.replace(/\./g, '').replace(',', '.') : number.replace(/,/g, '');
  } else if (comma >= 0) {
    number = number.replace(',', '.');
  }
  return /^\d+(?:\.\d+)?$/.test(number) ? number : null;
}

function firstPrice(values, allowBare) {
  for (const value of values) {
    const normalized = normalizePrice(value, allowBare);
    if (normalized != null) return normalized;
  }
  return null;
}

function specPairs(html, merchant) {
  const source = String(html || '');
  const pairs = [];
  const tableRe = /<table\b([^>]*)>([\s\S]*?)<\/table>/gi;
  let table;
  while ((table = tableRe.exec(source))) {
    const tableAttrs = attrs(table[1]);
    const signature = (String(tableAttrs.id || '') + ' ' + String(tableAttrs.class || '')).toLowerCase();
    if (!/(spec|technical|character|detail|fiche|caracteristique)/i.test(signature)) continue;
    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let row;
    while ((row = rowRe.exec(table[2]))) {
      const cells = [];
      const cellRe = /<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
      let cell;
      while ((cell = cellRe.exec(row[1]))) {
        const text = clean(cell[1]);
        if (text) cells.push(text);
      }
      if (cells.length < 2) continue;
      const name = cells[0];
      const value = cells.slice(1).join(' ');
      const usefulLabel = /(?:écran|screen|display|batter|autonom|processor|processeur|chipset|ram|memory|mémoire|stockage|storage|charge|charging|camera|caméra|photo|refresh|fréquence|refresh rate|os|système|poids|weight|protection|ip\d|résolution|resolution|nits|gpu|sim|wifi|bluetooth)/i;
      if (usefulLabel.test(name)) pairs.push({ name, value });
    }
  }
  if (merchant === 'amazon') {
    // Amazon's product overview uses `po-*` rows inside #poExpander, not a
    // table whose id/class contains "spec". Scope strictly to that product block.
    const overview = readIdHtml(source, 'poExpander');
    if (overview) {
      const rowRe = /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi;
      let row;
      while ((row = rowRe.exec(overview))) {
        if (!/\bpo-[\w.-]+/.test(String(attrs(row[1]).class || ''))) continue;
        const cells = [];
        const cellRe = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
        let cell;
        while ((cell = cellRe.exec(row[2]))) {
          const text = clean(cell[1]);
          if (text) cells.push(text);
        }
        if (cells.length >= 2) pairs.push({ name:cells[0], value:cells.slice(1).join(' ') });
      }
    }
  }
  return pairs;
}

const SELECTORS = {
  amazon: {
    titleIds: ['productTitle'], titleClasses: ['product-title-word-break'],
    priceIds: ['priceblock_ourprice', 'priceblock_dealprice', 'price_inside_buybox'],
    priceRootIds: ['corePrice_feature_div', 'apex_desktop_newAccordionRow'], priceClasses: ['a-offscreen']
  },
  fnac: {
    titleIds: [], titleClasses: ['f-productHeader-Title', 'f-productHeader-TitleLink', 'product-title'],
    priceIds: [], priceRootIds: [], priceClasses: ['f-priceBox-price', 'f-priceBox-price--reco', 'price']
  },
  darty: {
    titleIds: ['product_title'], titleClasses: ['product-title', 'product-title__heading'],
    priceIds: [], priceRootIds: [], priceClasses: ['product-price__amount', 'product-price', 'price']
  },
  cdiscount: {
    titleIds: ['fpSectionTitle'], titleClasses: ['fpProductTitle', 'product-title'],
    priceIds: ['fpPrice'], priceRootIds: [], priceClasses: ['fpPrice', 'price']
  },
  ldlc: {
    titleIds: [], titleClasses: ['title-1', 'product-title'], priceIds: [], priceRootIds: [], priceClasses: ['price', 'price-tag']
  },
  boulanger: {
    titleIds: [], titleClasses: ['product-title', 'productTitle'], priceIds: [], priceRootIds: [], priceClasses: ['product-price', 'price']
  },
  rakuten: {
    titleIds: [], titleClasses: ['product-title', 'productName'], priceIds: [], priceRootIds: [], priceClasses: ['price', 'product-price']
  },
  other: { titleIds: [], titleClasses: [], priceIds: [], priceRootIds: [], priceClasses: [] }
};

function firstMatch(values) {
  return values.find(value => value) || null;
}

function extract(html, rawUrl) {
  let host = '';
  try { host = new URL(rawUrl).hostname; } catch (_) { host = String(rawUrl || ''); }
  const merchant = hostMerchant(host);
  const source = String(html || '');
  const selectors = SELECTORS[merchant];

  const title = firstMatch(selectors.titleIds.map(id => readId(source, id)))
    || readClass(source, selectors.titleClasses)
    || readH1(source);

  let priceText = firstMatch(selectors.priceIds.map(id => readId(source, id)));
  if (!priceText && selectors.priceRootIds.length) {
    const root = firstMatch(selectors.priceRootIds.map(id => readIdHtml(source, id)));
    if (root) priceText = readClass(root, selectors.priceClasses);
  }
  if (!priceText) priceText = readClass(source, selectors.priceClasses);

  const structuredPrice = readMeta(source, values => String(values.itemprop || '').toLowerCase() === 'price'
    || String(values.property || '').toLowerCase() === 'product:price:amount' || String(values.name || '').toLowerCase() === 'price');
  const structuredCurrency = readMeta(source, values => String(values.itemprop || '').toLowerCase() === 'pricecurrency'
    || String(values.property || '').toLowerCase() === 'product:price:currency');
  const price = firstPrice([priceText]) || firstPrice([structuredPrice], true);
  const readIdentifier = name => readMeta(source, values => String(values.itemprop || '').toLowerCase() === name
    || String(values.name || '').toLowerCase() === name || String(values.property || '').toLowerCase() === 'product:' + name);

  return {
    merchant,
    title: title || null,
    price,
    priceSource: priceText && firstPrice([priceText]) ? merchant + '-price-selector'
      : (structuredPrice ? 'page-price-metadata' : null),
    currency: structuredCurrency || (/€/.test(String(priceText || structuredPrice || '')) ? 'EUR' : null),
    gtin: readMeta(source, values => /^gtin(?:8|12|13|14)?$/.test(String(values.itemprop || '').toLowerCase())
      || /^product:(?:gtin|ean)$/.test(String(values.property || '').toLowerCase())) || readIdentifier('ean'),
    mpn: readIdentifier('mpn'),
    sku: readIdentifier('sku'),
    asin: readIdentifier('asin'),
    specPairs: specPairs(source, merchant),
    evidence: title ? merchant + ': titre marchand' : null
  };
}

module.exports = { extract, hostMerchant, firstPrice, readClass, readId, specPairs };
