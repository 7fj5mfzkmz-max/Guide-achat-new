(function (root) {
  'use strict';

  /*
   * Score d'adéquation (0–9), pas note de qualité absolue.
   * Les domaines absents sont omis puis la couverture est signalée/capée : une
   * caractéristique inconnue n'est jamais transformée en défaut.
   * Les valeurs de spécification restent des proxys ; seuls les tests terrain
   * (lorsqu'ils sont explicitement fournis) permettent d'évaluer le résultat réel.
   */
  var MAX = 9;
  var PROFILES = {
    etudiant: { autonomie: .22, prix: .24, durabilite: .17, performance: .11, ecran: .10, connectivite: .04, photo: .05, recharge: .07 },
    professionnel: { autonomie: .19, performance: .21, ecran: .15, connectivite: .13, durabilite: .15, photo: .06, prix: .04, recharge: .07 },
    gamer: { gaming: .50, ecran: .14, autonomie: .10, connectivite: .10, durabilite: .04, prix: .05, recharge: .07 },
    photographe: { photo: .48, ecran: .15, performance: .11, durabilite: .08, stockage: .06, autonomie: .04, prix: .03, connectivite: .02, recharge: .03 }
  };
  var CRITICAL = { gamer: 'gaming', photographe: 'photo' };
  var REFERENCE = { method: 'pondération par profil, couverture explicite et proxys documentés; aucune prime liée au nom du modèle' };

  function text(v) { return String(v == null ? '' : v).toLowerCase(); }
  function clamp(x) { return Math.max(0, Math.min(MAX, Math.round(Number(x) * 10) / 10)); }
  function firstNumber(values, re, min, max) {
    values = Array.isArray(values) ? values : [values];
    for (var i = 0; i < values.length; i++) {
      var m = String(values[i] == null ? '' : values[i]).match(re);
      if (m) {
        var x = Number(String(m[1]).replace(',', '.'));
        if (isFinite(x) && x >= min && x <= max) return x;
      }
    }
    return null;
  }
  function numericPrice(value) {
    if (typeof value === 'number') return isFinite(value) && value > 0 && value < 10000 ? value : null;
    var s = String(value == null ? '' : value).replace(/\s/g, '').replace(/€/g, '').replace(/EUR/ig, '');
    var m = s.match(/\d[\d.,]*/);
    if (!m) return null;
    s = m[0];
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
    var n = Number(s);
    return isFinite(n) && n > 0 && n < 10000 ? n : null;
  }
  function chipTier(v) {
    var s = text(v);
    if (!s) return null;
    var rules = [
      [/snapdragon\s*(?:8\s*elite\s*gen\s*5|8\s*elite|8\s*gen\s*5|8\s*gen\s*4|8\s*gen\s*3|8\s*gen\s*2|8\s*gen\s*1|8\+\s*gen\s*1)/, 9.0],
      [/dimensity\s*(?:9500|9400|9300|9200|9000|8500)/, 8.7],
      [/(?:a19\s*pro|a19|a18\s*pro|a18|a17\s*pro|a17)/, 9.0],
      [/tensor\s*g5/, 8.0], [/tensor\s*g4/, 7.6], [/tensor\s*g3/, 7.2],
      [/snapdragon\s*7\+\s*gen\s*2/, 7.5], [/snapdragon\s*7\s*gen\s*4/, 7.0],
      [/snapdragon\s*7\s*gen\s*[2-3]/, 6.7], [/snapdragon\s*7\s*gen\s*1/, 6.2],
      [/snapdragon\s*6\s*gen\s*[1-4]/, 5.5], [/snapdragon\s*4/, 4.0],
      [/dimensity\s*(?:8|7|6)\d{2}/, 5.8], [/exynos\s*2[45]\d{3}/, 6.3],
      [/exynos\s*1\d{3}/, 5.2], [/kirin\s*9/, 7.2], [/helio\s*g\d+/, 4.5], [/unisoc\s*t\d+/, 3.5]
    ];
    for (var i = 0; i < rules.length; i++) if (rules[i][0].test(s)) return rules[i][1];
    return null;
  }
  function ramScore(ram) {
    if (ram == null) return null;
    if (ram < 4) return 3.5;
    if (ram < 6) return 5.0;
    if (ram < 8) return 6.2;
    if (ram < 12) return 7.2;
    if (ram < 16) return 8.0;
    return 8.5;
  }
  function refreshScore(hz) {
    if (hz == null) return null;
    if (hz < 60) return 2.5;
    if (hz < 90) return 4.5;
    if (hz < 120) return 6.0;
    if (hz < 144) return 7.2;
    if (hz < 165) return 8.0;
    return 8.4;
  }
  function chargeScore(w) {
    if (w == null) return null;
    if (w < 20) return 3.5;
    if (w < 30) return 4.5;
    if (w < 45) return 5.8;
    if (w < 67) return 6.8;
    if (w < 100) return 7.7;
    if (w < 150) return 8.3;
    return 8.6;
  }
  function screenScore(specs) {
    var hz = firstNumber([specs.refresh, specs.frequence, specs.ecran], /(\d{2,3})\s*hz/i, 30, 240);
    var bright = firstNumber([specs.luminosite, specs.brightness, specs.ecran], /(\d{3,4})\s*(?:nits?|cd\/m2|cd\/m²)/i, 200, 5000);
    var tech = text(specs.technologie_ecran || specs.display || specs.ecran);
    var vals = [], r = refreshScore(hz);
    if (r != null) vals.push(r);
    if (bright != null) vals.push(bright < 600 ? 4.5 : bright < 1000 ? 6 : bright < 1500 ? 7.2 : bright < 2000 ? 8.0 : bright < 2500 ? 8.5 : 8.8);
    if (tech) vals.push(/ltpo/.test(tech) ? 8.4 : /amoled|oled|p-?oled/.test(tech) ? 7.6 : /lcd|ips/.test(tech) ? 6.0 : 5.0);
    return vals.length ? vals.reduce(function(a,b){return a+b;},0) / vals.length : null;
  }
  function photoScore(specs) {
    var vals = [];
    var mp = firstNumber([specs.photo, specs.camera, specs.capteur], /(\d{2,3})\s*(?:mp|mpx|mégapixels?)/i, 8, 250);
    if (mp != null) vals.push(mp < 20 ? 4.5 : mp < 40 ? 5.8 : mp < 50 ? 6.2 : mp < 108 ? 6.7 : 7.1);
    var cam = text([specs.photo, specs.photo_ois, specs.photo_zoom, specs.photo_ultrawide, specs.photo_sensor, specs.video].join(' '));
    if (/ois|optical image stabilization/.test(cam)) vals.push(6.8);
    if (/periscope/.test(cam)) vals.push(8.0); else if (/telephoto/.test(cam)) vals.push(7.2);
    if (/ultrawide|ultra-wide/.test(cam)) vals.push(6.4);
    if (/4k.*(?:60|120)|(?:60|120).*4k/.test(cam)) vals.push(7.0);
    if (!vals.length) return null;
    /* Les seuls chiffres marketing ne prouvent pas la qualité d'image : limite sans test. */
    var test = firstNumber([specs.photo_test_score, specs.camera_test_score], /(\d+(?:[.,]\d+)?)/, 0, 10);
    var score = vals.reduce(function(a,b){return a+b;},0) / vals.length;
    return test == null ? Math.min(7.4, score) : score * .55 + test * .45;
  }
  function performanceScore(specs) {
    var chip = chipTier(specs.processeur || specs.chipset || specs.soc);
    var ram = ramScore(firstNumber([specs.ram], /(\d{1,2})\s*(?:gb|go)/i, 1, 32));
    if (chip == null && ram == null) return null;
    if (chip == null) return Math.min(5.8, ram);
    return clamp(Math.min(9, chip * .88 + (ram == null ? 0 : (ram - 5) * .12)));
  }
  function batteryCapacityScore(mah, diagonal) {
    if (mah == null) return null;
    /* Comparaison de capacité à taille d'écran proche ; ce n'est pas un test d'autonomie. */
    var equivalent = mah * (diagonal ? Math.pow(6.7 / diagonal, 2) : 1);
    if (equivalent < 3500) return 4.0;
    if (equivalent < 4200) return 5.0 + (equivalent - 3500) * (1.0 / 700);
    if (equivalent < 4800) return 6.0 + (equivalent - 4200) * (1.0 / 600);
    if (equivalent < 5400) return 7.0 + (equivalent - 4800) * (0.8 / 600);
    if (equivalent < 6200) return 7.8 + (equivalent - 5400) * (0.8 / 800);
    return 8.6;
  }
  function autonomyScore(specs) {
    var mah = firstNumber([specs.batterie, specs.battery], /(\d{4,5})\s*mah/i, 1000, 15000);
    var diagonal = firstNumber([specs.ecran, specs.screen_size, specs.diagonale], /(\d(?:[.,]\d)?)\s*(?:pouces?|inches?|in\b|")/i, 4, 9);
    var measuredHours = firstNumber([specs.autonomie_test, specs.battery_test, specs.battery_life], /(\d+(?:[.,]\d+)?)\s*(?:h|heures?)/i, 1, 40);
    if (measuredHours != null) return measuredHours < 8 ? 4.5 : measuredHours < 10 ? 5.8 : measuredHours < 12 ? 6.8 : measuredHours < 14 ? 7.6 : measuredHours < 16 ? 8.3 : 8.8;
    return batteryCapacityScore(mah, diagonal);
  }
  function numericPriceScore(value) {
    var price = numericPrice(value);
    if (price == null) return null;
    var points = [[150,9],[250,8.6],[400,8.0],[600,7.2],[800,6.5],[1100,5.8],[1500,5.0],[2200,4.0],[3000,3.2]];
    if (price <= points[0][0]) return points[0][1];
    for (var i = 1; i < points.length; i++) {
      if (price <= points[i][0]) {
        var a=points[i-1], b=points[i], f=(price-a[0])/(b[0]-a[0]);
        return a[1] + (b[1]-a[1])*f;
      }
    }
    return 3.2;
  }
  function storageScore(specs) {
    var values = [], re = /(\d+(?:[.,]\d+)?)\s*(tb|to|gb|go)\b/ig;
    [specs.stockage, specs.storage, specs.memoire_interne].forEach(function(v) {
      var m; re.lastIndex=0;
      while ((m=re.exec(String(v||''))) !== null) {
        var n=Number(m[1].replace(',','.')) * (/^(?:tb|to)$/i.test(m[2]) ? 1024 : 1);
        if (n>=16 && n<=4096) values.push(n);
      }
    });
    if (!values.length) return null;
    var gb=Math.max.apply(Math,values);
    return gb<64?3.5:gb<128?4.8:gb<256?6.2:gb<512?7.5:gb<1024?8.3:8.8;
  }
  function durabilityScore(specs) {
    var vals=[];
    var supportKeys=['support_years','software_support_years','updates_years','duree_mises_a_jour','suivi_logiciel','duree_support','os_support'];
    var years=firstNumber(supportKeys.map(function(k){return specs[k];}), /(\d+(?:[.,]\d+)?)\s*(?:years?|ans?)/i, 1, 12);
    if (years==null) years=firstNumber(supportKeys.map(function(k){return specs[k];}), /(\d+(?:[.,]\d+)?)/, 1, 12);
    if(years!=null) vals.push(years<2?4.5:years<3?5.4:years<4?6.2:years<5?7.0:years<6?7.8:years<7?8.4:8.9);
    var repair=firstNumber(['repairability_score','indice_reparabilite','reparabilite','repairability','repair_score'].map(function(k){return specs[k];}), /(\d+(?:[.,]\d+)?)/, 0, 100);
    if(repair!=null) vals.push(repair<=10?repair:repair<=20?repair*.45:repair*.09);
    return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;
  }
  function gamingScore(specs, performance) {
    if(performance==null) return null;
    var test=firstNumber([specs.gaming_test_score,specs.thermal_test_score,specs.fps_stability_score,specs.sustained_performance_score], /(\d+(?:[.,]\d+)?)/, 0, 10);
    var score=performance;
    if(test!=null) score=performance*.7+test*.3;
    else score=Math.min(7.4,score); // sans mesure prolongée, on note le potentiel matériel, pas les FPS stables.
    return clamp(score);
  }
  function connectivityScore(specs) {
    var s=text(Object.keys(specs).map(function(k){return specs[k];}).join(' ')), vals=[];
    if(/5g/.test(s)) vals.push(8.0); else if(/4g|lte/.test(s)) vals.push(6.0);
    if(/wifi\s*7/.test(s)) vals.push(9); else if(/wifi\s*6e/.test(s)) vals.push(8.5); else if(/wifi\s*6/.test(s)) vals.push(7.5);
    if(/bluetooth\s*6|bluetooth\s*5\.4/.test(s)) vals.push(8.5); else if(/bluetooth\s*5/.test(s)) vals.push(7);
    return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;
  }
  function externalScore(value) {
    var x=Number(value);
    /* Les sources passent déjà par une calibration 0–9 ; ne pas recalibrer deux fois. */
    return isFinite(x) && x>=0 && x<=10 ? clamp(x) : null;
  }
  function criteria(specs, sourceScores, price) {
    specs=specs||{}; sourceScores=sourceScores||{};
    var performance=performanceScore(specs), autonomy=autonomyScore(specs);
    var out={
      performance:performance,
      autonomy:autonomy,
      photo:photoScore(specs),
      ecran:screenScore(specs),
      connectivite:connectivityScore(specs),
      prix:numericPriceScore(price),
      stockage:storageScore(specs),
      durabilite:durabilityScore(specs),
      recharge:chargeScore(firstNumber([specs.charge,specs.charging], /(\d{2,3})\s*w\b/i, 5, 300))
    };
    out.gaming=gamingScore(specs,performance);
    Object.keys(out).forEach(function(k){
      var ext=externalScore(sourceScores[k]);
      if(ext!=null && out[k]!=null) out[k]=clamp(out[k]*.80+ext*.20);
      else if(ext!=null) out[k]=ext;
    });
    return out;
  }
  function estimate(input) {
    input=input||{};
    var crit=criteria(input.specs||{},input.sourceScores||{},input.price), profiles={};
    var specs=input.specs||{}, sourceScores=input.sourceScores||{};
    var gamingTest=firstNumber([specs.gaming_test_score,specs.thermal_test_score,specs.fps_stability_score,specs.sustained_performance_score], /(\d+(?:[.,]\d+)?)/, 0, 10);
    var photoTest=firstNumber([specs.photo_test_score,specs.camera_test_score], /(\d+(?:[.,]\d+)?)/, 0, 10);
    Object.keys(PROFILES).forEach(function(profile){
      var weights=PROFILES[profile], sum=0, observed=0, full=0;
      Object.keys(weights).forEach(function(k){
        full+=weights[k];
        if(crit[k]!=null){sum+=crit[k]*weights[k];observed+=weights[k];}
      });
      if(!observed) return;
      var score=sum/observed, coverage=observed/full;
      var critical=CRITICAL[profile], criticalValue=critical?crit[critical]:null;
      if(profile==='gamer' && criticalValue!=null && criticalValue<5.5) score=Math.min(score,5.8);
      if(profile==='gamer' && criticalValue!=null && criticalValue<6.5) score=Math.min(score,6.8);
      if(profile==='photographe' && criticalValue!=null && criticalValue<5.5) score=Math.min(score,5.8);
      if(profile==='photographe' && criticalValue!=null && criticalValue<6.5) score=Math.min(score,6.8);
      if(profile==='gamer' && gamingTest==null) score=Math.min(score,7.4);
      if(profile==='photographe' && photoTest==null) score=Math.min(score,7.4);
      /* Forte lacune d'information => note plafonnée et marquée provisoire. */
      if(coverage<.38) score=Math.min(score,6.0);
      else if(coverage<.62) score=Math.min(score,7.2);
      var untestedSpecialty=(profile==='gamer' && gamingTest==null) || (profile==='photographe' && photoTest==null);
      profiles[profile]={score:clamp(score),coverage:Math.round(coverage*100)/100,provisional:coverage<.78 || (critical!=null && criticalValue==null) || untestedSpecialty};
    });
    return {criteria:crit,documented:Object.keys(crit).filter(function(k){return crit[k]!=null;}),profiles:profiles,reference:REFERENCE};
  }
  var api={estimate:estimate,criteria:criteria,weights:PROFILES,WEIGHTS:PROFILES,REFERENCE:REFERENCE,helpers:{numericPrice:numericPrice,chipTier:chipTier}};
  if(typeof module!=='undefined'&&module.exports) module.exports=api; else root.PhoneAnalyzerSpecScore=api;
})(typeof window!=='undefined'?window:globalThis);
