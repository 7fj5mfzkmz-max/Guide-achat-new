'use strict';
/* Rejoue l'extraction du serveur sur des pages enregistrées (tests/fixtures/*.json), sans réseau.
   Pages réelles : voir tools/README.md (scraper_lab.py --save). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const resolve = require('../server/resolve');
const identity = require('../phone-analyzer/identity');
const identify = require('../phone-analyzer/identify');
const kit = resolve.kit.get('smartphones');
const dir = path.join(__dirname, '..', 'tests', 'fixtures');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
let ok = 0, skipped = 0;
for (const file of files) {
  const fx = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (!fx.expected_name) { skipped++; console.log('· ' + file + ' : expected_name non renseigné, ignoré'); continue; }
  const html = fs.readFileSync(path.join(dir, fx.html_file), 'utf8');
  const local = identify.identifyFromUrl(fx.url);
  const page = resolve.inspectHtml({ status: 200, finalUrl: fx.final_url || fx.url, html, headers: {} },
    { url: fx.url, urlHint: local.titleHint, urlGtin: null, urlAsin: local.asin, profile: kit });
  const got = (page.product && page.product.name) || (page.list[0] && page.list[0].name) || '';
  assert.ok(got, file + ' : aucun nom de produit extrait');
  assert.equal(identity.compare(fx.expected_name, got, kit).verdict, 'same', file + ' : « ' + got + ' » ≠ « ' + fx.expected_name + ' »');
  if (fx.unexpected_name) assert.notEqual(identity.compare(fx.unexpected_name, got, kit).verdict, 'same', file + ' : confondu avec « ' + fx.unexpected_name + ' »');
  ok++;
}
console.log(ok + ' fixture(s) vérifiée(s), ' + skipped + ' ignorée(s).');
