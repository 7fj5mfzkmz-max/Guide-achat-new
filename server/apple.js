'use strict';
/* Pages Apple : la page produit (marketing) ne contient presque aucune caractéristique ;
   elles sont sur la page « Caractéristiques techniques » (/specs/). On la déduit de l'URL et on la lit.
   Apple ne publie ni la RAM ni la capacité de batterie en mAh : ces deux valeurs restent « inconnues »
   ici et sont cherchées ailleurs (GSMArena, Kimovil). */

function specsUrl(target) {
  let u; try { u = new URL(target); } catch (e) { return null; }
  if (!/(^|\.)apple\.com$/i.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\/(iphone-[a-z0-9-]+)\/?/i);
  if (!m) return null;
  return 'https://www.apple.com/' + m[1].toLowerCase() + '/' + m[2].toLowerCase() + '/specs/';
}
function isApple(target) { try { return /(^|\.)apple\.com$/i.test(new URL(target).hostname); } catch (e) { return false; } }

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();

function parseSpecs(text) {
  const t = clean(String(text || '').replace(/\u00a0/g, ' '));
  const specs = {};
  // Écran : « Écran Super Retina XDR … de 6,3 pouces (diagonale) »
  const screen = t.match(/(?:Écran|Ecran)\s+((?:Super Retina|Retina|OLED|LTPO)[^.]{0,160}?)(\d+(?:[.,]\d+)?)\s*pouces/i);
  const inches = screen ? screen[2] : (t.match(/(\d+(?:[.,]\d+)?)\s*pouces\s*\(diagonale\)/i) || [])[1];
  if (inches) specs.ecran = (screen ? clean(screen[1]).replace(/\s*(?:de|d’|d')?\s*$/i, '') + ' ' : '') + inches + ' pouces';
  // Fréquence : « jusqu’à 120 Hz » (on garde le maximum annoncé)
  const hz = (t.match(/\b(\d{2,3})\s*Hz\b/g) || []).map(x => parseInt(x, 10)).filter(n => n >= 60 && n <= 240);
  if (hz.length) specs.refresh = Math.max.apply(null, hz) + ' Hz';
  // Puce
  const chip = t.match(/\bPuce\s+(A\d{2}(?:\s+(?:Pro|Bionic))?)/i) || t.match(/\b(A\d{2}\s+(?:Pro|Bionic))\b/);
  if (chip) specs.processeur = 'Apple ' + clean(chip[1]);
  // Stockage proposé
  const sto = Array.from(new Set((t.match(/\b(\d{2,4}\s*(?:Go|To))\b/g) || []).map(x => x.replace(/\s+/, ' ')))).slice(0, 4);
  if (sto.length) specs.stockage = sto.join(' / ');
  // Autonomie : Apple annonce des heures, pas des mAh
  const vid = t.match(/lecture vidéo[^.]{0,40}?jusqu['’]à\s*(\d{1,2})\s*h/i) || t.match(/jusqu['’]à\s*(\d{1,2})\s*h(?:eures)?\s*de lecture vidéo/i);
  if (vid) specs.batterie = 'jusqu’à ' + vid[1] + ' h de lecture vidéo (Apple ne publie pas les mAh)';
  // Charge : « adaptateur de 20 W (ou plus) »
  const w = t.match(/adaptateur[^.]{0,40}?(\d{2,3})\s*W/i) || t.match(/(\d{2,3})\s*W[^.]{0,30}adaptateur/i);
  if (w) specs.charge = w[1] + ' W (adaptateur Apple recommandé)';
  const os = t.match(/\biOS\s+\d+(?:\.\d+)?/i); if (os) specs.os = os[0];
  return specs;
}

module.exports = { specsUrl, isApple, parseSpecs };
