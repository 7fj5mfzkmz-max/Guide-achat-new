'use strict';
const assert = require('node:assert/strict');
const score = require('../phone-analyzer/spec-score');
const identity = require('../phone-analyzer/identity');
const phones = require('../sources/phonesdata');
const gsm = require('../sources/gsmarena');

const phone = {
  specs: {
    processeur:'Snapdragon 8 Gen 3', ram:'12 GB', batterie:'5000 mAh', charge:'100 W',
    ecran:'6.8 pouces AMOLED 120 Hz 1800 nits', refresh:'120 Hz', photo:'50 MP + téléobjectif periscope',
    photo_ois:'OIS', stockage:'512 GB', connectivite:'5G Wi-Fi 7 Bluetooth 5.4'
  },
  price: 899
};
const baseline = score.estimate({...phone, modelName:'Téléphone test'});
assert.deepEqual(Object.keys(baseline.profiles).sort(), ['etudiant','gamer','photographe','professionnel']);
for (const weights of Object.values(score.WEIGHTS)) assert(Math.abs(Object.values(weights).reduce((a,b)=>a+b,0)-1)<1e-9, 'les poids d’un profil doivent totaliser 100 %');
assert(baseline.profiles.gamer.score <= 7.5, 'sans benchmark soutenu, le score gamer doit rester prudent');
assert(baseline.profiles.gamer.provisional, 'le profil gamer doit signaler l’absence de test de jeu');
assert(baseline.profiles.photographe.provisional, 'les caractéristiques photo seules ne sont pas un essai photo');
assert(baseline.criteria.recharge > 8, 'la puissance de charge rapide doit être notée séparément');
assert.equal(baseline.criteria.autonomie, score.criteria({...phone.specs, charge:undefined}).autonomie,
  'la puissance de charge ne doit pas artificiellement améliorer l’autonomie');

const sameHardwareDifferentName = score.estimate({...phone, modelName:'OPPO Find X9 Ultra'});
assert.deepEqual(sameHardwareDifferentName.profiles, baseline.profiles, 'le nom du modèle ne doit apporter aucun bonus');

const lowPrice = score.estimate({...phone, price:'199,99 €'});
const highPrice = score.estimate({...phone, price:'1 999 €'});
assert(lowPrice.criteria.prix > highPrice.criteria.prix, 'le prix réellement transmis doit influencer le score');
assert(lowPrice.profiles.etudiant.score - highPrice.profiles.etudiant.score > lowPrice.profiles.photographe.score - highPrice.profiles.photographe.score,
  'le prix doit compter davantage pour le profil étudiant que pour le profil photo');
const slowCharge = score.estimate({...phone, specs:{...phone.specs,charge:'15 W'}});
assert(slowCharge.profiles.etudiant.score < baseline.profiles.etudiant.score, 'la recharge doit pouvoir influer séparément sur le profil étudiant');
assert.equal(score.helpers.numericPrice('1 299,99 €'), 1299.99, 'les prix français avec séparateurs doivent être parsés');

const cameraOnly = score.estimate({specs:{photo:'200 MP',photo_ois:'OIS'}});
assert(cameraOnly.criteria.photo <= 7.4, 'les mégapixels seuls ne doivent pas faire croire à une note photo exceptionnelle');
const withPhotoTest = score.criteria({photo:'50 MP',photo_test_score:'9/10'});
assert(withPhotoTest.photo > cameraOnly.criteria.photo, 'un test photo explicite doit pouvoir améliorer l’évaluation');
const withGamingTest = score.estimate({...phone, specs:{...phone.specs, gaming_test_score:'9/10'}});
assert(withGamingTest.profiles.gamer.score > baseline.profiles.gamer.score, 'un résultat de test jeu doit améliorer le profil gamer');
const withPhotoProfileTest = score.estimate({...phone, specs:{...phone.specs, photo_test_score:'9/10'}});
assert(withPhotoProfileTest.profiles.photographe.score > baseline.profiles.photographe.score, 'un résultat d’essai photo doit améliorer le profil photographe');
assert.equal(score.estimate({specs:{}}).profiles.etudiant, undefined, 'sans données, ne pas inventer une note');
assert.equal(score.criteria({}, {}, null).prix, null, 'prix absent = critère inconnu, non pénalisant');
const trustedExternal = score.criteria({}, {photo:8.6}).photo;
assert.equal(trustedExternal, 8.6, 'une note externe déjà calibrée ne doit pas être calibrée deux fois');

assert.equal(phones.queryName('Samsung Galaxy A56 5G 8GB 256GB Black'), 'Samsung Galaxy A56 5G');
assert.equal(identity.compare('Samsung Galaxy A56 5G', 'Samsung Galaxy A56 5G 8GB 256GB Noir').verdict, 'same');
assert.equal(identity.compare('Samsung Galaxy A56 5G', 'Samsung Galaxy A55 5G').verdict, 'different');

const g = gsm.parseSpecs('<tr><td class="ttl">Chipset</td><td class="nfo">Exynos 1580</td></tr><tr><td class="ttl">Internal</td><td class="nfo">128GB 8GB RAM</td></tr><tr><td class="ttl">Battery</td><td class="nfo">5000 mAh</td></tr><tr><td class="ttl">Charging</td><td class="nfo">45W</td></tr>');
assert.equal(g.processeur, 'Exynos 1580');
assert.equal(g.ram, '8 GB');
assert.equal(g.batterie, '5000 mAh');

console.log(JSON.stringify({ok:true,profiles:baseline.profiles,priceSensitivity:{student:lowPrice.profiles.etudiant.score-highPrice.profiles.etudiant.score,photographer:lowPrice.profiles.photographe.score-highPrice.profiles.photographe.score}},null,2));
