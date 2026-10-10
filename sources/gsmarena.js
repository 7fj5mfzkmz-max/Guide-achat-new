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
  const mainCamera = first(map, 'Modules') || findKey(map, /main camera/i);
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
  if (mainCamera) specs.photo = mainCamera;
  const video = findKey(map, /^Video$/i); if (video) specs.video = video;
  const battery = findKey(map, /^(?:Battery|Capacity)$/i) || allText.match(/\b\d{4,5}\s*mAh\b/i)?.[0];
  if (battery) specs.batterie = battery;
  if (charging) specs.charge = charging;
  const refresh = allText.match(/\b(\d{2,3})\s*Hz\b/i); if (refresh) specs.refresh = refresh[1] + ' Hz';
  const ip = allText.match(/\bIP\s*\d{2}\b/i); if (ip) specs.etancheite = ip[0].replace(/\s+/g, '');
  const cam = [mainCamera, findKey(map, /^Features$/i), video].filter(Boolean).join(' ');
  if (/OIS|optical image stabilization/i.test(cam)) specs.photo_ois = 'OIS';
  if (/telephoto|periscope/i.test(cam)) specs.photo_zoom = /periscope/i.test(cam) ? 'periscope' : 'telephoto';
  if (/ultrawide|ultra-wide|ultra wide/i.test(cam)) specs.photo_ultrawide = 'ultrawide';
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
  const u = new URL(url); await netlib.assertPublicHost(u.hostname);
  const t = timer(timeout);
  try { const r = await fetch(url, { headers: { 'user-agent': 'GuideAchat/1.0 (+public-spec-reader)', accept: 'text/html,application/xhtml+xml' }, signal: t.signal, redirect: 'follow' }); if (!r.ok) return null; return await r.text(); }
  catch (_) { return null; } finally { t.close(); }
}

async function resolve(query, options) {
  query = String(query || '').trim();
  if (!query) return null;
  const timeout = (options && options.timeout) || 7000;
  const html = await fetchText(SEARCH + encodeURIComponent(query), timeout);
  if (!html) return null;
  const cs = candidates(html).map(c => Object.assign(c, { confidence: scoreCandidate(query, c.name) })).sort((a,b) => b.confidence - a.confidence);
  const best = cs[0];
  if (!best || best.confidence < 0.62) return null;
  const detail = await fetchText(best.url, Math.max(2500, timeout - 1000));
  if (!detail) return { found: true, name: best.name, url: best.url, confidence: best.confidence, specs: {}, source: 'gsmarena-search' };
  const specs = parseSpecs(detail);
  return { found: true, name: best.name, url: best.url, confidence: best.confidence, specs, source: 'gsmarena', evidence: Object.keys(specs).length + ' caractéristiques extraites' };
}

module.exports = { resolve, parseSpecs, candidates, rows };
