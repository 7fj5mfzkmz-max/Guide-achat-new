'use strict';

/*
 * PhonesData = référentiel technique principal de Guide·Achat.
 * Le marchand sert uniquement à identifier le modèle ; ses caractéristiques
 * ne sont volontairement plus utilisées pour calculer le score.
 */
const { URL } = require('node:url');
const net = require('../server/net.js');
const ex = require('../server/extract.js');
const identity = require('../phone-analyzer/identity.js');
const categoryKit = require('../category-kit/index.js').get('smartphones');

const BASE = 'https://phonesdata.com/fr/';
const SEARCH_URLS = [
  q => BASE + 'search/?q=' + encodeURIComponent(q),
  q => BASE + 'search/?search=' + encodeURIComponent(q),
  q => BASE + 'search/?query=' + encodeURIComponent(q),
  q => BASE + 'search/?model=' + encodeURIComponent(q)
];

function clean(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
function norm(v) { return clean(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function abs(href) { try { return new URL(href, BASE).toString(); } catch (_) { return null; } }

function queryName(name) {
  return clean(name)
    .replace(/\b(?:smartphone|telephone|t[eé]l[eé]phone)\b/gi, ' ')
    .replace(/\b(?:\d{1,2})\s?(?:GB|Go)\s*[+/x]\s*\d{2,4}\s?(?:GB|Go)\b/gi, ' ')
    .replace(/\b(?:\d{1,2})\s?(?:GB|Go)\b\s+(?:\d{2,4})\s?(?:GB|Go)\b/gi, ' ')
    .replace(/\b(?:noir|noire|blanc|blanche|bleu|bleue|vert|verte|rouge|rose|gris|grise|argent|or|gold|black|white|blue|green|red|pink|silver)\b/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

function scoreLink(label, href, query) {
  const a = norm(label), q = norm(query), u = norm(href);
  let s = 0;
  if (!href || !/\/fr\/smartphones\//i.test(href)) return -1;
  const qt = q.split(' ').filter(Boolean);
  qt.forEach(t => { if (t.length > 1 && a.includes(t)) s += 3; });
  if (a === q) s += 20;
  if (a.includes(q) || q.includes(a)) s += 10;
  if (u.includes(q.replace(/\s+/g, '-'))) s += 8;
  return s;
}

function searchLinks(html, query) {
  const out = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = abs(m[1]);
    const label = ex.clean(ex.decodeHtml(m[2].replace(/<[^>]+>/g, ' ')));
    const score = scoreLink(label, href, query);
    if (score >= 4) out.push({ href, label, score });
  }
  const seen = new Set();
  return out.filter(x => { if (seen.has(x.href)) return false; seen.add(x.href); return true; })
    .sort((a,b) => b.score - a.score).slice(0, 5);
}

function tablePairs(html) {
  const pairs = [];
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let r;
  while ((r = rowRe.exec(html))) {
    const cells = [];
    const cellRe = /<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi;
    let c;
    while ((c = cellRe.exec(r[1]))) cells.push(ex.clean(ex.decodeHtml(c[1].replace(/<[^>]+>/g, ' '))));
    if (cells.length >= 2 && cells[0] && cells[1]) pairs.push([cells[0], cells.slice(1).join(' | ')]);
  }
  return pairs;
}

function valueFor(pairs, patterns) {
  for (const [label, value] of pairs) {
    if (patterns.some(re => re.test(label))) return clean(value);
  }
  return null;
}

function number(value, re) { const m = String(value || '').match(re); return m ? m[1].replace(',', '.') : null; }

function parseSpecs(html, canonicalUrl) {
  const pairs = tablePairs(html);
  const text = ex.htmlToText(html);
  const specs = {};
  const sources = {};
  const put = (k, v) => { if (v != null && clean(v)) { specs[k] = clean(v); sources[k] = 'phonesdata'; } };

  const battery = valueFor(pairs, [/^batterie$/i, /battery/i]) || ((text.match(/Batterie\s+([^|]{0,100}?\d{3,5}\s*mAh[^|]*)/i) || [])[1]);
  put('batterie', number(battery, /(\d{3,5})\s*mAh/i) ? number(battery, /(\d{3,5})\s*mAh/i) + ' mAh' : null);

  const screen = valueFor(pairs, [/^taille de l.?écran$/i, /screen size/i, /display diagonal/i]) || '';
  put('ecran', number(screen || text, /(\d+(?:[.,]\d+)?)\s*(?:"|pouces?)/i) ? number(screen || text, /(\d+(?:[.,]\d+)?)\s*(?:"|pouces?)/i) + ' pouces' : null);

  const displayTech = valueFor(pairs, [/^technologie$/i, /display type/i, /type of display/i]);
  if (displayTech) put('technologie_ecran', displayTech);

  const refreshText = (valueFor(pairs, [/refresh rate/i, /taux de rafraîchissement/i, /fréquence/i]) || '') + ' ' + text;
  const hz = refreshText.match(/\b(\d{2,3})\s*Hz\b/i);
  if (hz) put('refresh', hz[1] + ' Hz');

  const chipset = valueFor(pairs, [/^chipset$/i, /^processor/i, /processeur/i]);
  put('processeur', chipset);

  const memory = valueFor(pairs, [/^mémoire interne$/i, /^internal memory$/i, /storage/i]);
  if (memory) {
    const ram = memory.match(/(\d{1,2})\s*GB\s*RAM/i) || memory.match(/(\d{1,2})\s*Go\s*RAM/i);
    const storage = memory.match(/(\d{2,4})\s*(?:GB|Go|TB|To)(?!\s*RAM)/i);
    if (ram && Number(ram[1]) <= 24) put('ram', ram[1] + ' Go');
    if (storage) put('stockage', storage[1] + ' ' + (/TB|To/i.test(storage[0]) ? 'To' : 'Go'));
  }

  const camera = valueFor(pairs, [/^appareil photo principal$/i, /rear camera/i, /caméra arrière/i]) || '';
  const mp = (camera + ' ' + text).match(/\b(\d{2,3})\s*MP\b/i);
  if (mp) put('photo', mp[1] + ' MP');

  const os = (valueFor(pairs, [/^système d.?exploitation/i, /^operating system/i]) || text).match(/\b(?:Android|iOS|HarmonyOS)\s*[\d.]+/i);
  if (os) put('os', os[0]);

  const weight = valueFor(pairs, [/^poids$/i, /^weight$/i]);
  const wg = (weight || '').match(/(\d+(?:[.,]\d+)?)\s*g/i);
  if (wg) put('poids', wg[1] + ' g');

  const dimensions = valueFor(pairs, [/^dimensions/i, /^dimensions \(h/i]);
  if (dimensions) put('dimensions', dimensions);

  const all = text;
  const watts = all.match(/\b(\d{2,3})\s*W\b[^.]{0,80}(?:recharge|charge|charging)/i) || all.match(/(?:recharge|charge|charging)[^.]{0,80}\b(\d{2,3})\s*W\b/i);
  if (watts) put('charge', watts[1] + ' W');

  const ip = all.match(/\bIP\s?(\d{2})\b/i);
  if (ip) put('etancheite', 'IP' + ip[1]);

  return { specs, specSources: sources, pairs };
}

async function fetchPage(url, timeout) {
  await net.assertPublicHost(new URL(url).hostname);
  const r = await net.fetchHtml(url, { timeout });
  if (r.status >= 400 || !r.html) return null;
  return r;
}

async function resolve(model, options) {
  const query = queryName(model);
  if (query.length < 3) return null;
  const timeout = Math.max(1500, (options && options.timeout) || 5000);
  const trace = [];
  const searchResults = [];
  for (const makeUrl of SEARCH_URLS) {
    if (searchResults.length) break;
    try {
      const url = makeUrl(query);
      const page = await fetchPage(url, Math.min(2200, timeout));
      if (!page) continue;
      const links = searchLinks(page.html, query);
      searchResults.push(...links);
      trace.push({ step: 'phonesdata-search', outcome: links.length ? 'trouvé' : 'aucun résultat', url });
    } catch (e) {
      trace.push({ step: 'phonesdata-search', outcome: 'erreur', detail: e.message });
    }
  }
  const unique = Array.from(new Map(searchResults.map(x => [x.href, x])).values())
    .filter(x => identity.compare(query, x.label, categoryKit).verdict !== 'different')
    .sort((a,b) => b.score-a.score).slice(0, 3);
  if (!unique.length) return null;

  for (const candidate of unique) {
    try {
      const page = await fetchPage(candidate.href, Math.min(2800, timeout));
      if (!page) continue;
      const parsed = parseSpecs(page.html, candidate.href);
      const title = ex.pageTitle(page.html) || candidate.label || query;
      const modelLine = (ex.htmlToText(page.html).match(/Modèle\s*:\s*([^|]{3,120})/i) || [])[1];
      const name = clean(modelLine || candidate.label || title)
        .split(/\b(?:Marque|Note|Prix|Année|Taille|Écran|Batterie|Processeur|Mémoire|Appareil photo)\s*:/i)[0]
        .replace(/\s*:\s*prix.*$/i, '').trim();
      const match = identity.compare(query, name, categoryKit);
      const count = Object.keys(parsed.specs).length;
      trace.push({ step: 'phonesdata-detail', outcome: match.verdict === 'same' ? 'modèle confirmé' : 'nom non concordant', url: candidate.href, name, match: match.verdict, specs: count });
      if (match.verdict === 'same' && count >= 2) {
        return {
          found: true,
          name,
          url: candidate.href,
          confidence: Math.min(0.99, 0.82 + Math.min(0.17, count * 0.02)),
          specs: parsed.specs,
          specSources: parsed.specSources,
          sourceLabel: 'PhonesData',
          sourceUrl: candidate.href,
          trace
        };
      }
    } catch (e) {
      trace.push({ step: 'phonesdata-detail', outcome: 'erreur', detail: e.message, url: candidate.href });
    }
  }
  return null;
}

module.exports = { resolve, parseSpecs, queryName };
