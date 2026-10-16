(function(root){
'use strict';
function num(v,re){var m=String(v==null?'':v).match(re);return m?Number(String(m[1]).replace(',','.')):null;}
function level(v){return v==='good'?'good':v==='warn'?'warn':v==='bad'?'bad':'neutral';}
function verdict(profile,key,value,ctx){
 ctx=ctx||{};var v=String(value==null?'':value),out={level:'neutral',label:'À interpréter',why:''};
 function set(l,label,why){out={level:level(l),label:label,why:why};}
 if(key==='ram'){var n=num(v,/(\d+(?:[.,]\d+)?)\s*(?:go|gb)/i);if(n==null)return out;
  if(profile==='gamer'&&!ctx.apple){set(n>=12?'good':n>=8?'warn':'bad',n>=12?'Très confortable pour jouer':n>=8?'Correct, mais limite pour les jeux récents':'Insuffisant pour jouer confortablement','Pour les jeux lourds, 12 Go offrent plus de marge ; 8 Go restent corrects pour beaucoup de jeux.');}
  else if(profile==='professionnel'){set(n>=8?'good':n>=6?'warn':'bad',n>=8?'Confortable pour applications et fichiers lourds':'Correct pour un usage professionnel courant','8 Go permettent de garder plusieurs applications ouvertes ; les grands fichiers, plans et tableurs demandent aussi une puce efficace.');}
  else if(profile==='photographe'){set(n>=12?'good':n>=8?'warn':'bad',n>=12?'Très confortable pour la photo et le montage':'Correct pour photographier','La RAM aide à garder applications et photos ouvertes ; elle ne remplace pas la qualité du capteur.');}
  else{set(n>=8?'good':n>=6?'warn':'bad',n>=8?'Confortable pour le multitâche':'Suffisant pour un usage simple','Pour les usages courants, 6 à 8 Go suffisent généralement.');}
  return out;}
 if(key==='stockage'){var st=num(v,/(\d+(?:[.,]\d+)?)\s*(?:go|gb|to|tb)/i);if(st==null)return out;var gb=st*(/to|tb/i.test(v)?1024:1);
  if(profile==='photographe'){set(gb>=256?'good':gb>=128?'warn':'bad',gb>=256?'Espace confortable pour photos et vidéos':gb>=128?'Correct, à surveiller avec beaucoup de vidéos':'Limité pour beaucoup de photos/vidéos','Les photos et vidéos 4K occupent vite de la place.');}
  else if(profile==='professionnel'){set(gb>=256?'good':gb>=128?'warn':'bad',gb>=256?'Espace confortable pour documents et fichiers':'Correct pour documents courants','Les plans, PDF, photos de chantier et fichiers bureautiques occupent rapidement de l’espace.');}
  else{set(gb>=256?'good':gb>=128?'warn':'bad',gb>=256?'Espace confortable':'Correct pour un usage courant','128 Go conviennent à un usage simple ; 256 Go évitent de gérer l’espace.');}
  return out;}
 if(key==='batterie'){var b=num(v,/(\d{3,5})\s*mah/i);if(b==null)return out;
  if(profile==='gamer'){set(b>=5500?'good':b>=5000?'warn':'bad',b>=5500?'Grande batterie, favorable aux longues sessions':b>=5000?'Batterie standard':'Batterie limitée pour le jeu intensif','En jeu, l’autonomie baisse vite : capacité, efficacité et chauffe comptent.');}
  else if(profile==='professionnel'){set(b>=5000?'good':b>=4500?'warn':'bad',b>=5000?'Favorable pour une journée d’appels et de déplacements':'Autonomie à vérifier en usage réel','Pour les appels, la navigation et la visio, une batterie de 5 000 mAh ou plus aide ; l’autonomie réelle dépend surtout des tests.');}
  else{set(b>=5000?'good':b>=4500?'warn':'bad',b>=5000?'Autonomie potentiellement confortable':'Autonomie à vérifier en usage réel','La capacité est un indicateur, pas une mesure.');}
  return out;}
 if(key==='charge'){var w=num(v,/(\d{2,3})\s*w\b/i);if(w==null)return out;
  set(w>=67?'good':w>=33?'warn':'bad',w>=67?'Recharge rapide':w>=33?'Recharge correcte':'Recharge lente','Une recharge rapide aide surtout en déplacement ; le chargeur fourni compte aussi.');return out;}
 if(key==='refresh'){var hz=num(v,/(\d{2,3})\s*hz/i);if(hz==null)return out;
  if(profile==='gamer'){set(hz>=120?'good':hz>=90?'warn':'bad',hz>=120?'Écran fluide pour les jeux':hz>=90?'Fluidité correcte':'60 Hz limite la fluidité','Un écran 120 Hz rend les déplacements plus fluides ; il ne garantit pas un framerate stable.');}
  else{set(hz>=120?'good':hz>=90?'warn':'bad',hz>=120?'Affichage fluide au quotidien':'Affichage standard','120 Hz rend le défilement plus fluide.');}
  return out;}
 if(key==='ecran'){var oled=/oled|amoled|ltpo/i.test(v),bright=num(v,/(\d{3,4})\s*(?:nits|cd\/m)/i);
  if(profile==='professionnel'){set(oled&&bright>=1500?'good':oled?'warn':'bad',oled&&bright>=1500?'Lisible dehors et confortable':'Écran à considérer selon l’usage','Pour travailler dehors, la luminosité réelle compte autant que la technologie.');}
  else{set(oled?'good':'neutral',oled?'Bel affichage':'Écran standard','La technologie influence contraste et confort.');}
  return out;}
 if(key==='photo'){var tele=/telephoto|periscope|téléobjectif/i.test(v),ois=/ois|stabilisation optique/i.test(v);
  if(profile==='photographe'){set(tele&&ois?'good':(ois||tele)?'warn':'bad',tele&&ois?'Configuration photo intéressante':(ois||tele)?'Photo correcte, avec des limites':'Photo basique','Capteur, OIS et téléobjectif comptent plus que les mégapixels.');}
  else{set(ois?'good':'neutral',ois?'Stabilisation optique présente':'Photo à évaluer selon vos besoins','L’OIS aide en basse lumière et en vidéo.');}
  return out;}
 if(key==='processeur'){var high=/snapdragon\s*8|dimensity\s*9|a1[7-9]|a2\d|tensor\s*g[4-5]/i.test(v),mid=/snapdragon\s*7|dimensity\s*[678]|exynos\s*1|tensor\s*g[23]|a1[0-6]/i.test(v);
  if(profile==='gamer'){set(high?'good':mid?'warn':'bad',high?'Puce adaptée aux jeux exigeants':mid?'Correct pour les jeux courants':'Peu adapté aux jeux exigeants','La puissance brute ne garantit pas des FPS stables sans refroidissement.');}
  else if(profile==='professionnel'){set(high?'good':mid?'warn':'bad',high?'Réactif pour fichiers et multitâche':'Correct pour la bureautique','Pour les plans, tableurs lourds et visioconférences, une puce récente évite les ralentissements.');}
  else{set(high?'good':mid?'warn':'bad',high?'Très réactif':'Correct pour l’usage courant','Une puce récente rend les applications plus fluides.');}
  return out;}
 if(key==='etancheite'){var ip=num(v,/ip\s*(\d{2})/i);
  if(ip==null)return out;
  if(profile==='professionnel'){set(ip>=68?'good':ip>=67?'warn':'bad',ip>=68?'Intéressant pour les environnements exigeants':'Protection limitée','IP68 aide contre poussière et projections, mais ne garantit pas une immersion prolongée.');}
  else{set(ip>=68?'good':ip>=67?'warn':'bad',ip>=68?'Bonne résistance aux projections':'Résistance limitée','IP68 protège mieux que IP67, sans garantie d’immersion prolongée.');}
  return out;}
 return out;
}
var api={verdict:verdict};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PhoneSpecInsights=api;
})(typeof window!=='undefined'?window:globalThis);
