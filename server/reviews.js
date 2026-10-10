'use strict';
/* Recherche d'analyses publiques après identification.
 * Aucun contournement de CAPTCHA/authentification : on interroge des pages de recherche publiques
 * puis, si possible, les pages d'analyses accessibles publiquement.
 */
const net = require('./net.js');

const REVIEW_DOMAINS = [
  'notebookcheck.net','notebookcheck.com','notebookcheck.org',
  'androidauthority.com','tomsguide.com','techradar.com','gsmarena.com',
  'trustedreviews.com','expertreviews.co.uk','phonearena.com','xda-developers.com',
  'xataka.com','lesnumeriques.com','01net.com','frandroid.com'
];

function esc(s){ return String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function strip(s){ return esc(String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')); }
function resultBlocks(html){
  const out=[];
  const re=/<li[^>]*class=["'][^"']*(?:b_algo|result|search-result)[^"']*["'][\s\S]*?<\/li>/gi; let m;
  while((m=re.exec(html||'')) && out.length<12){
    const block=m[0];
    const a=block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if(!a) continue;
    const url=a[1]; const title=strip(a[2]);
    const snippet=strip((block.match(/<(?:p|div)[^>]*(?:class=["'][^"']*(?:b_caption|snippet|description)[^"']*)[^>]*>([\s\S]*?)<\/(?:p|div)>/i)||[])[1]||block);
    if(/^https?:/i.test(url) && title) out.push({url,title,snippet});
  }
  return out;
}
async function search(q, timeout){
  const u='https://www.bing.com/search?q='+encodeURIComponent(q)+'&count=10&setlang=fr-FR';
  try{
    const r=await net.fetchHtml(u,{timeout:Math.max(2500,timeout||5000)});
    if(r && r.status<400){ const found=resultBlocks(r.html); if(found.length) return found; }
  }catch(_){}
  // Fallback sans clé : le lecteur public transforme une page de résultats en Markdown.
  try{
    const controller=new AbortController(); const t=setTimeout(()=>controller.abort(),Math.max(2500,timeout||5000));
    const rr=await fetch('https://r.jina.ai/http://www.google.com/search?q='+encodeURIComponent(q),{headers:{'accept':'text/plain','user-agent':'GuideAchat/1.0'},signal:controller.signal});
    clearTimeout(t);
    if(!rr.ok) return [];
    const md=await rr.text(); const out=[];
    const re=/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g; let m;
    while((m=re.exec(md)) && out.length<12){
      const title=strip(m[1]), url=m[2];
      if(/google\.com|accounts\.google|support\.google/i.test(url)) continue;
      const tail=strip(md.slice(m.index+m[0].length, m.index+m[0].length+500));
      if(title && /^https?:/i.test(url)) out.push({url,title,snippet:tail});
    }
    return out;
  }catch(_){return []}
}
function sentiment(text){
  const t=String(text||'').toLowerCase();
  const pos=(t.match(/excellent|tr[eè]s bon|bonne qualit[eé]|bon appareil photo|bonne photo|impressionnant|excellent[e]?|solide|fluide|rapide|bonne autonomie|longue autonomie|brillant|lumineux|sharp|great|excellent|good performance|good camera|long battery|bright display/g)||[]).length;
  const neg=(t.match(/faible|mauvais|m[eé]diocre|d[eé]cevant|lent|limit[eé]|pauvre|mauvaise photo|photos? de qualit[eé] moyenne|poor|weak|slow|mediocre|disappointing|average performance|average camera|poor display|low performance/g)||[]).length;
  return Math.max(-2,Math.min(2,pos-neg));
}
function category(text){
  const t=String(text||'').toLowerCase();
  const map={
    performance:/(performance|performances|processor|processeur|chipset|gaming|jeu|lent|rapide|slow|fast|benchmark|geekbench|3dmark)/,
    photo:/(camera|cam[eé]ra|photo|photographie|photography|selfie|zoom|ois|low light|night)/,
    ecran:/(display|screen|[eé]cran|brightness|luminos|120hz|90hz|oled|amoled|lcd|ips|resolution|r[eé]solution)/,
    autonomie:/(battery|batterie|autonomie|endurance|charging|charge|mah)/
  };
  return Object.keys(map).filter(k=>map[k].test(t));
}
function extractNumericScore(text){
  const m=String(text||'').match(/(?:score|rating|note|overall|total)[^\d]{0,20}(\d{1,3})(?:\s*\/\s*100|%|\s*\/\s*10)?/i);
  if(!m) return null;
  const n=Number(m[1]);
  if(n>100) return null;
  return n>10?n/10:n;
}
function buildEvidence(results){
  const evidence=[];
  for(const r of results){
    const text=(r.title+' '+r.snippet).trim();
    const cats=category(text);
    if(!cats.length) continue;
    evidence.push({source:r.url,title:r.title,snippet:r.snippet,categories:cats,sentiment:sentiment(text),numericScore:extractNumericScore(text)});
  }
  return evidence;
}
async function analyze(name, timeout){
  const model=String(name||'').trim(); if(model.length<3) return null;
  const queries=[
    '"'+model+'" review camera performance display battery',
    '"'+model+'" test photo performances écran autonomie',
    'site:notebookcheck.net "'+model+'" review',
    'site:lesnumeriques.com "'+model+'" test',
    'site:frandroid.com "'+model+'" test'
  ];
  const all=[]; const seen=new Set();
  for(const q of queries){
    const rs=await search(q,Math.max(2200,timeout||5000));
    for(const r of rs){ if(!seen.has(r.url)){seen.add(r.url); all.push(r);} }
    if(all.length>=20) break;
  }
  const evidence=buildEvidence(all).slice(0,24);
  const by={performance:[],photo:[],ecran:[],autonomie:[]};
  evidence.forEach(e=>e.categories.forEach(c=>by[c].push(e)));
  const reviewScores={};
  for(const c of Object.keys(by)){
    const es=by[c];
    if(!es.length) continue;
    const vals=[];
    es.forEach(e=>{ if(e.numericScore!=null) vals.push(e.numericScore); else if(e.sentiment) vals.push(5 + e.sentiment*1.5); });
    if(vals.length) reviewScores[c]=Math.round(Math.max(0,Math.min(9,vals.reduce((a,b)=>a+b,0)/vals.length))*10)/10;
  }
  return {name,results:all.slice(0,30),evidence,reviewScores,confidence:Object.keys(reviewScores).length/4};
}
module.exports={analyze,resultBlocks,buildEvidence,sentiment,category};
