(function(){
  'use strict';
  var MAX=9;
  var DOMAINS=[['performance','Performance'],['autonomie','Autonomie'],['photo','Photo'],['ecran','Écran'],['connectivite','Connectivité']];
  var PROFILE_WEIGHTS={
    etudiant:{autonomie:.30,ecran:.20,performance:.15,photo:.10,connectivite:.10},
    professionnel:{autonomie:.20,performance:.27,photo:.12,ecran:.18,connectivite:.13},
    gamer:{performance:.43,gaming:.24,ecran:.14,autonomie:.10,connectivite:.09},
    photographe:{photo:.48,ecran:.17,performance:.16,autonomie:.10,connectivite:.09}
  };
  function clamp(n){return Math.max(0,Math.min(MAX,Number(n)||0));}
  function profileScore(domains,profile){var w=PROFILE_WEIGHTS[profile]||PROFILE_WEIGHTS.etudiant,sum=0,total=0;Object.keys(w).forEach(function(k){if(domains[k]!=null){sum+=clamp(domains[k])*w[k];total+=w[k];}});return total?Math.round(clamp(sum/total)*10)/10:null;}
  function confidence(domains){var known=Object.keys(domains||{}).filter(function(k){return domains[k]!=null;}).length;return known>=5?'forte':known>=3?'bonne':known>=1?'partielle':'indisponible';}
  function profileLabel(k){return {etudiant:'Étudiant',professionnel:'Professionnel',gamer:'Gamer',photographe:'Photographe'}[k]||k;}
  window.GuideDecisionEngine={MAX_SCORE:MAX,DOMAINS:DOMAINS,PROFILE_WEIGHTS:PROFILE_WEIGHTS,profileScore:profileScore,confidence:confidence,profileLabel:profileLabel};
})();
