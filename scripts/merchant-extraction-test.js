'use strict';
const assert = require('node:assert/strict');
const extract = require('../server/extract');
const merchants = require('../server/merchant-adapters');
const resolver = require('../server/resolve');

const variants = [
  { '@type':'Product', name:'Samsung Galaxy A56 5G 128GB', sku:'A56-128', offers:{price:'329.99',priceCurrency:'EUR'} },
  { '@type':'Product', name:'Samsung Galaxy A56 5G 256GB', sku:'A56-256', offers:{price:'379.99',priceCurrency:'EUR'} }
];
const amazonHtml = `<html><head><script type="application/ld+json">${JSON.stringify(variants)}</script></head><body><span id="productTitle">Samsung Galaxy A56 5G 256 Go</span><span class="a-offscreen">369,99 €</span></body></html>`;
const amazonUrl = 'https://www.amazon.fr/Samsung-Galaxy-A56-256-Go/dp/B0ABCDE123';
const amazon = resolver.inspectHtml({status:200,finalUrl:amazonUrl,html:amazonHtml,headers:{}},{url:amazonUrl,urlHint:'Samsung Galaxy A56 5G 256 Go'});
assert.equal(amazon.product.sku,'A56-256','sélectionner la variante 256 Go demandée, pas la première variante JSON-LD');
assert.equal(amazon.product.price,'369.99','prendre le prix marchand visible lorsqu’il complète le prix structuré');
assert.equal(amazon.product.priceSource,'amazon-price-selector','conserver la provenance du prix');
assert.equal(amazon.identityConflict,false);
assert.equal(resolver.classifyContent({urlClass:{kind:'product'},ld:amazon.ld,html:amazon.html,text:amazon.text,product:amazon.product}).kind,'product','une fiche avec plusieurs variantes JSON-LD reste une fiche produit lorsque la variante est identifiée');

const wrongVariant = resolver.inspectHtml({status:200,finalUrl:amazonUrl,html:amazonHtml,headers:{}},{url:amazonUrl,urlHint:'Samsung Galaxy A55 5G'});
assert.equal(wrongVariant.identityConflict,true,'un lien vers A55 ne doit pas consommer une fiche A56');
assert.equal(wrongVariant.usable,false,'une identité contradictoire ne doit pas être analysée comme produit');
const conflictingTitle=resolver.inspectHtml({status:200,finalUrl:amazonUrl,html:`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:'Samsung Galaxy A56 5G'})}</script><span id="productTitle">Samsung Galaxy A55 5G</span>`,headers:{}},{url:amazonUrl,urlHint:'Samsung Galaxy A56 5G'});
assert.equal(conflictingTitle.identityConflict,true,'JSON-LD et titre visible en désaccord doivent bloquer toute fusion');

const fnacHtml = `<html><body><h1 class="f-productHeader-Title">Samsung Galaxy A56 5G 256 Go</h1><span class="f-priceBox-price">379,99 €</span><table id="product-characteristics"><tr><th>Écran</th><td>6,7 pouces AMOLED 120 Hz</td></tr><tr><th>Capacité de la batterie</th><td>5 000 mAh</td></tr><tr><th>Charge</th><td>45 W</td></tr><tr><th>Processeur</th><td>Exynos 1580</td></tr></table></body></html>`;
const fnacUrl='https://www.fnac.com/a123456/Samsung-Galaxy-A56-256-Go';
const fnac=resolver.inspectHtml({status:200,finalUrl:fnacUrl,html:fnacHtml,headers:{}},{url:fnacUrl,urlHint:'Samsung Galaxy A56 5G 256 Go'});
assert.equal(fnac.product.name,'Samsung Galaxy A56 5G 256 Go');
assert.equal(fnac.product.price,'379.99');
assert.equal(fnac.product.source,'fnac');
assert.equal(fnac.product.priceSource,'fnac-price-selector');
const structured=resolver.candidateFromText('',fnac.product,resolver.kit.get(),fnac.merchant.specPairs);
assert.match(structured.batterie,/5\s?000\s*mAh/i);
assert.match(structured.charge,/45\s*W/i);
assert.match(structured.processeur,/Exynos 1580/i);
assert.match(structured.ecran,/6,7 pouces/i);
const appleMarketing=resolver.candidateFromText('PUCE A18 ULTRA-BRILLANTE – La puce A18 saute une génération par rapport à la puce A16 Bionic de l’iPhone 15. Elle offre des fonctionnalités photo et vidéo de niveau supérieur.',null,resolver.kit.get());
assert.equal(appleMarketing.processeur,'A18','le nom de la puce doit être extrait sans le slogan marketing qui suit');
const amazonOverviewHtml='<span id="productTitle">Apple iPhone 16 (128 Go) - Noir</span><div id="poExpander"><table><tr class="a-spacing-small po-operating_system"><td>Système d\'exploitation</td><td>iOS 18</td></tr><tr class="a-spacing-small po-ram_memory.installed_size"><td>Taille de la mémoire RAM installée</td><td>8 Go</td></tr><tr class="a-spacing-small po-memory_storage_capacity"><td>Capacité de stockage mémoire</td><td>128 Go</td></tr><tr class="a-spacing-small po-display.size"><td>Taille de l\'écran</td><td>6,1 Pouces</td></tr><tr class="a-spacing-small po-refresh_rate"><td>Fréquence de rafraîchissement</td><td>60 Hz</td></tr></table></div>';
const amazonOverview=resolver.inspectHtml({status:200,finalUrl:'https://www.amazon.fr/Apple-iPhone-16-128-Go/dp/B0DGHY5KG8',html:amazonOverviewHtml,headers:{}},{urlHint:'Apple iPhone 16 128 Go'});
const amazonSpecs=resolver.candidateFromText('',amazonOverview.product,resolver.kit.get(),amazonOverview.merchant.specPairs);
assert.match(amazonSpecs.stockage,/128 Go/);
assert.match(amazonSpecs.ecran,/6,1 Pouces/);
assert.match(amazonSpecs.refresh,/60 Hz/);

const conflictingGtin=resolver.inspectHtml({status:200,finalUrl:'https://www.fnac.com/a123456',html:`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:'Samsung Galaxy A56 5G',gtin13:'4006381333931'})}</script><h1>Samsung Galaxy A56 5G</h1>`,headers:{}},{url:'https://www.fnac.com/a123456',urlGtin:'8717418289506'});
assert.equal(conflictingGtin.identityConflict,true,'un GTIN de page différent du GTIN du lien doit être rejeté');
const conflictingAsin=resolver.inspectHtml({status:200,finalUrl:'https://www.amazon.fr/dp/B0ABCDE123',html:`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:'Samsung Galaxy A56 5G',asin:'B0WRONG123'})}</script><span id="productTitle">Samsung Galaxy A56 5G</span>`,headers:{}},{url:'https://www.amazon.fr/dp/B0ABCDE123',urlAsin:'B0ABCDE123'});
assert.equal(conflictingAsin.identityConflict,true,'un ASIN JSON-LD différent de celui de l’URL doit être rejeté');
const genericProductId=resolver.inspectHtml({status:200,finalUrl:'https://www.amazon.fr/dp/B0ABCDE123',html:`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:'Samsung Galaxy A56 5G',productID:'VENDEUR123'})}</script><span id="productTitle">Samsung Galaxy A56 5G</span>`,headers:{}},{url:'https://www.amazon.fr/dp/B0ABCDE123',urlAsin:'B0ABCDE123'});
assert.equal(genericProductId.identityConflict,false,'un productID générique ne doit pas être interprété comme un ASIN');

assert.equal(merchants.hostMerchant('www.fnac.com'),'fnac');
assert.equal(merchants.hostMerchant('www.amazon.fr'),'amazon');
assert.equal(merchants.extract('<h1 class="product-title">Google Pixel 9</h1><span class="product-price">799,00 €</span>','https://www.darty.com/nav/achat/telephonie/google_pixel_9.html').merchant,'darty');
assert.equal(extract.pickProduct(extract.extractJsonLd(amazonHtml),'Samsung Galaxy A56 5G 256 Go').sku,'A56-256');
const multiOffer=extract.pickProduct(extract.extractJsonLd(`<script type="application/ld+json">${JSON.stringify({'@type':'Product',name:'Apple iPhone 15',offers:[{price:'799',priceCurrency:'EUR'},{price:'849',priceCurrency:'EUR'}]})}</script>`),'Apple iPhone 15');
assert.equal(multiOffer.price,null,'des offres structurées divergentes ne doivent pas être présentées comme le prix certain de la fiche');

async function endToEndConflict() {
  const net=require('../server/net');
  const originalAssert=net.assertPublicHost, originalFetch=net.fetchHtml;
  net.assertPublicHost=async()=>{};
  net.fetchHtml=async url=>({status:200,finalUrl:url,headers:{},html:'<html><body><h1 class="f-productHeader-Title">Samsung Galaxy A55 5G</h1><span class="f-priceBox-price">299,99 €</span></body></html>'});
  try {
    const result=await resolver.resolve('https://www.amazon.fr/Samsung-Galaxy-A56-5G/dp/B0ABCDE123',{category:'smartphones'});
    assert.equal(result.ok,false,'une contradiction claire doit arrêter le résolveur au lieu de retourner un autre modèle');
    assert.equal(result.reason,'identity-conflict');
    assert.match(result.error,/Aucune caractéristique n’a été fusionnée/);
  } finally { net.assertPublicHost=originalAssert; net.fetchHtml=originalFetch; }
}
endToEndConflict().then(()=>console.log('OK : variantes JSON-LD, adaptateurs Amazon/Fnac, caractéristiques structurées et conflit d’identité bloqué de bout en bout.'))
  .catch(error=>{console.error(error);process.exitCode=1;});
