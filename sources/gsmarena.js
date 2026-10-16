'use strict';

/* Source publique de secours pour les smartphones.
 * Elle ne contourne ni CAPTCHA, ni authentification : elle lit uniquement les pages publiques.
 * Le résultat est volontairement marqué "specs" : ce sont des caractéristiques techniques,
 * pas des mesures indépendantes de qualité photo/autonomie.
 */
const { cleanName, usableName } = require('../server/extract.js');
const identity = require('../phone-analyzer/identity.js');
const netlib = require('../server/net.js');

const HOST = 'www.gsmarena.com';
const SEARCH = 'https://' + HOST + '/search.php3?sQuickSearch=yes&sName=';

/* GSMArena bloque sa page de recherche interne pour les serveurs. La fiche directe
   reste lisible : on découvre son URL par une recherche web publique (DuckDuckGo HTML,
   puis Bing si DuckDuckGo limite les requêtes), puis on lit la fiche. Aucune clé API,
   aucun contournement de CAPTCHA ; en cas d'échec, la source renvoie null sans bloquer
   la cascade. */
const SEARCH_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function parseDdgResults(html) {
  const out = [];
  const re = /<a[^>]+class=["'][^"']*(?:result__a|result-link)[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html || '')) && out.length < 8) {
    let href = decode(m[1]);
    if (/duckduckgo\.com\/l\/\?uddg=/.test(href)) {
      try { href = decodeURIComponent((href.match(/uddg=([^&]+)/) || [])[1] || ''); } catch (_) { continue; }
    }
    const name = cleanName(text(m[2]));
    if (usableName(name) && /gsmarena\.com\/[^\"]+-\d+\.php/i.test(href)) out.push({ name, url: href });
  }
  return out;
}

function parseBingResults(html) {
  const out = [];
  /* Bing enveloppe les liens dans /ck/a?…&u=a1<base64url>. On décode u=a1… */
  const re = /<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html || '')) && out.length < 8) {
    let href = decode(m[1]);
    const u = href.match(/[?&]u=a1([^&]+)/);
    if (u) {
      try {
        let b = u[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b.length % 4) b += '=';
        href = Buffer.from(b, 'base64').toString('utf-8');
      } catch (_) { continue; }
    }
    const name = cleanName(text(m[2]));
    if (usableName(name) && /gsmarena\.com\/[^\"]+-\d+\.php/i.test(href)) out.push({ name, url: href });
  }
  return out;
}

function parseBingRss(xml) {
  const out = [];
  /* Le flux RSS de Bing donne directement les liens et titres, sans enveloppe. */
  const re = /<item>\s*<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>/gi;
  let m;
  while ((m = re.exec(xml || '')) && out.length < 8) {
    const name = cleanName(text(m[1]));
    const href = text(m[2]);
    if (usableName(name) && /gsmarena\.com\/[^\"]+-\d+\.php/i.test(href)) out.push({ name, url: href });
  }
  return out;
}

async function searchWebTitles(query, timeout) {
  const ms = Math.max(2500, Math.min(5000, timeout || 5000));
  try {
    const response = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query + ' site:gsmarena.com'), {
      headers: { 'user-agent': SEARCH_USER_AGENT, 'accept-language': 'fr-FR,fr;q=0.9' },
      signal: AbortSignal.timeout(ms)
    });
    if (response.ok) {
      const found = parseDdgResults(await response.text());
      if (found.length) return found;
    }
  } catch (_) {}
  try {
    const response = await fetch('https://www.bing.com/search?format=rss&q=' + encodeURIComponent(query + ' gsmarena'), {
      headers: { 'user-agent': SEARCH_USER_AGENT, 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.5' },
      signal: AbortSignal.timeout(ms)
    });
    if (response.ok) {
      const found = parseBingRss(await response.text());
      if (found.length) return found;
    }
  } catch (_) {}
  try {
    const response = await fetch('https://www.bing.com/search?q=' + encodeURIComponent(query + ' gsmarena') + '&setlang=en', {
      headers: { 'user-agent': SEARCH_USER_AGENT, 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.5' },
      signal: AbortSignal.timeout(ms)
    });
    if (response.ok) {
      const found = parseBingResults(await response.text());
      if (found.length) return found;
    }
  } catch (_) {}
  return [];
}

function timer(timeout) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.max(500, timeout || 7000));
  return { signal: controller.signal, close: () => clearTimeout(t) };
}
function decode(s) {
  return String(s || '')
    .replace(/&#39;|&#x27;/gi, "'").replace(/&quot;|&#x22;/gi, '"').replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}
function text(s) { return decode(String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()); }
function abs(href) { try { return new URL(href, 'https://' + HOST).toString(); } catch (_) { return null; } }

function candidates(html) {
  const out = [];
  const re = /<a\b[^>]*href=["'](\/[^"']+?-\d+\.php)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html || '')) && out.length < 12) {
    const name = cleanName(text(m[2]));
    if (!usableName(name)) continue;
    const url = abs(m[1]);
    if (!url || /(?:news|compare|review|blog|forum|pictures|videos)/i.test(url)) continue;
    if (!out.some(x => x.url === url)) out.push({ name, url });
  }
  return out;
}

function rows(html) {
  const out = [];
  const re = /<tr[^>]*>[\s\S]*?<td[^>]*class=["'][^"']*ttl[^"']*["'][^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*class=["'][^"']*nfo[^"']*["'][^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
  let m;
  while ((m = re.exec(html || ''))) out.push({ key: text(m[1]), value: text(m[2]) });
  return out;
}
function rowMap(html) {
  const map = {};
  for (const r of rows(html)) { if (!map[r.key]) map[r.key] = []; map[r.key].push(r.value); }
  return map;
}
function first(map, key) { return map[key] && map[key][0] || ''; }
function findKey(map, re) { for (const k of Object.keys(map)) if (re.test(k)) return first(map, k); return ''; }

function parseSpecs(html) {
  const map = rowMap(html);
  const summary = text((html.match(/<div[^>]*class=["'][^"']*specs-brief[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) || [])[1] || '');
  const displayType = first(map, 'Type');
  const displaySize = first(map, 'Size');
  const resolution = first(map, 'Resolution');
  const os = first(map, 'OS');
  const chipset = first(map, 'Chipset');
  const internal = first(map, 'Internal');
  /* Sur les fiches GSMArena, la ligne caméra principale est « Triple » (td class="ttl")
     avec les modules dans la cellule suivante (td class="nfo", data-spec="cam1modules").
     L'étiquette de tableau est « Main Camera » mais rows() ne garde que td.ttl/td.nfo :
     la valeur est donc sous la clé « Triple » (ou « Single », « Dual », « Quad »). */
  const mainCameraText = ['Triple', 'Dual', 'Quad', 'Single']
    .map(k => first(map, k)).filter(v => /\b\d{2,3}\s*MP/.test(v))[0] || '';
  const batteryType = first(map, 'Type');
  const charging = first(map, 'Charging');
  const allText = Object.values(map).flat().join(' ');
  const specs = {};
  if (displayType || displaySize || resolution) specs.ecran = [displayType, displaySize, resolution].filter(Boolean).join(' — ');
  if (os) specs.os = os;
  if (chipset) specs.processeur = chipset;
  if (internal) {
    const ram = internal.match(/(?:^|[,;/]\s*)(\d+(?:\.\d+)?)\s*GB\s*RAM/i) || internal.match(/(\d+(?:\.\d+)?)\s*GB\s*RAM/i);
    if (ram) specs.ram = ram[1] + ' GB';
    const stor = internal.match(/(\d+(?:\.\d+)?)\s*(?:GB|TB)\s*(?=\d+(?:\.\d+)?\s*GB\s*RAM)/i);
    if (stor) specs.stockage = stor[1] + ' GB';
    if (!specs.ram) {
      const quick = summary.match(/(\d+(?:\/\d+)?)\s*GB\s*RAM/i);
      if (quick) specs.ram = quick[1] + ' GB';
    }
  }
  if (mainCameraText) specs.photo = mainCameraText;
  const video = findKey(map, /^Video$/i); if (video) specs.video = video;
  const battery = findKey(map, /^(?:Battery|Capacity)$/i) || allText.match(/\b\d{4,5}\s*mAh\b/i)?.[0];
  if (battery) specs.batterie = battery;
  if (charging) specs.charge = charging;
  const cam = [mainCameraText, findKey(map, /^Features$/i), video].filter(Boolean).join(' ');
  if (/OIS|optical image stabilization/i.test(cam)) specs.photo_ois = 'OIS';
  if (/telephoto|periscope/i.test(cam)) specs.photo_zoom = /periscope/i.test(cam) ? 'periscope' : 'telephoto';
  if (/ultrawide|ultra-wide|ultra wide/i.test(cam)) specs.photo_ultrawide = 'ultrawide';
  /* Capteur : taille de capteur dédiée (ex. « 1/2.76" ») et ouverture — indices matériels du potentiel photo. */
  const sensor = mainCameraText.match(/(1\/[\d.]+"|\d+\.?\d*\s*\u00b5m)/g);
  if (sensor && sensor.length) specs.photo_sensor = sensor.join(', ');
  const aperture = mainCameraText.match(/f\/[\d.]+/g);
  if (aperture && aperture.length) specs.photo_aperture = aperture.join(', ');
  /* Nombre de modules principaux utiles : chaque module « NN MP » du bloc caméra principale. */
  const moduleCount = (mainCameraText.match(/\b\d{2,3}\s*MP/g) || []).length;
  if (moduleCount) specs.photo_modules = String(moduleCount);
  /* Largeur du bloc (fps vidéo max) : 4K indique un ISP plus capable que 1080p. */
  const videoText = findKey(map, /^Video$/i);
  if (/4k/i.test(videoText)) specs.photo_video4k = '4K';
  const refresh = allText.match(/\b(\d{2,3})\s*Hz\b/i); if (refresh) specs.refresh = refresh[1] + ' Hz';
  const ip = allText.match(/\bIP\s*\d{2}\b/i); if (ip) specs.etancheite = ip[0].replace(/\s+/g, '');
  if (/HDR/i.test(cam)) specs.photo_hdr = 'HDR';
  const chem = allText.match(/\b(?:Li-Po|Li-Ion|Lithium Polymer|Silicon[- ]Carbon|Si\/C)\b/i); if (chem) specs.chimie_batterie = chem[0];
  return specs;
}

function scoreCandidate(query, name) {
  const q = identity.tokens(query).words || [];
  const n = identity.tokens(name).words || [];
  if (!q.length || !n.length) return 0;
  const overlap = q.filter(x => n.includes(x)).length / Math.max(1, q.length);
  const brandQ = identity.brandOf(query), brandN = identity.brandOf(name);
  if (brandQ && brandN && brandQ !== brandN) return 0;
  let score = overlap;
  if (name.toLowerCase() === query.toLowerCase()) score += 0.6;
  return Math.min(1, score);
}

async function fetchText(url, timeout) {
  try {
    const u = new URL(url);
    await netlib.assertPublicHost(u.hostname);
    const r = await netlib.fetchHtml(url, { timeout: timeout || 7000 });
    return r && r.status < 400 && r.html ? r.html : null;
  } catch (_) { return null; }
}

async function resolve(query, options) {
  query = String(query || '').trim();
  if (!query) return null;
  const timeout = (options && options.timeout) || 7000;
  /* 1) Recherche web publique -> URL de fiche GSMArena (la recherche interne est bloquée). */
  let best = null;
  const web = await searchWebTitles(query, Math.min(5000, timeout));
  for (const item of web) {
    const clean = item.name.replace(/\s*-\s*Full phone specifications.*$/i, '');
    const confidence = scoreCandidate(query, clean);
    if (confidence >= 0.62 && (!best || confidence > best.confidence)) best = { name: clean, url: item.url, confidence };
  }
  /* 2) Repli : recherche interne GSMArena (si elle redevient accessible). */
  if (!best) {
    const html = await fetchText(SEARCH + encodeURIComponent(query), Math.min(5000, timeout));
    if (html) {
      const cs = candidates(html).map(c => Object.assign(c, { confidence: scoreCandidate(query, c.name) })).sort((a,b) => b.confidence - a.confidence);
      if (cs[0] && cs[0].confidence >= 0.62) best = cs[0];
    }
  }
  if (!best) return null;
  const detail = await fetchText(best.url, Math.max(2500, timeout - 1500));
  if (!detail) return { found: true, name: best.name, url: best.url, confidence: best.confidence, specs: {}, source: 'gsmarena-search' };
  const specs = parseSpecs(detail);
  /* Le nom affiché vient de la fiche elle-même (h1 « Samsung Galaxy A16 5G - Specifications »),
     pas du titre du moteur : la marque est garantie présente. */
  const pageName = cleanName(text((detail.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || ''))
    .replace(/\s*-\s*Specifications\s*$/i, '').replace(/\s*Full phone specifications.*$/i, '').trim();
  const name = usableName(pageName) ? pageName : best.name;
  return { found: true, name, url: best.url, confidence: best.confidence, specs, source: 'gsmarena', evidence: Object.keys(specs).length + ' caractéristiques extraites' };
}

module.exports = { resolve, parseSpecs, candidates, rows };
