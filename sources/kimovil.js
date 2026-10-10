'use strict';
/* Kimovil-first public reference. We read public product pages only; no auth/CAPTCHA bypass. */
const net = require('../server/net.js');
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function escRe(s){return String(s||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function val(text,label){const re=new RegExp(escRe(label)+'\\s*(?:</?[^>]+>\\s*){0,3}([^|]{1,120}?)(?=\\s+(?:See more details|More smartphones|$))','i'); const m=text.match(re); return m?clean(m[1]):null}
function slug(q){return String(q||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\+/g,' plus ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function parse(html, url){
 const t=clean(html); const specs={};
 const titleMatch=t.match(/Price and specifications on ([^\n]{2,100}?)(?=\s+(?:International|Global|China|India)\b|\s+\d+(?:\.\d+)?"|\s+Design & Materials\b|$)/i);
 const title=(titleMatch&&titleMatch[1]?titleMatch[1].trim():null);
 const h1=t.match(/(?:Price and specifications on|Prix et caractéristiques du|Precio y características del)\s+([^|]{2,100}?)(?=\s+(?:Global|International|China|India)\b|$)/i);
 const finalTitle=title||((h1&&h1[1])?h1[1].trim():null);
 const screen=(t.match(/\b(\d+(?:\.\d+)?)"\s*(LCD IPS|AMOLED|Super AMOLED|OLED|pOLED|LTPO[^\s]*|TFT[^\s]*)[^\n]{0,100}/i)||[]); if(screen[0]) specs.ecran=screen[0];
 const ram=t.match(/\bRAM\s*(?:\|\s*)?(\d+)\s*GB/i); if(ram) specs.ram=ram[1]+' GB';
 const storage=t.match(/\b(?:Storage|Capacity)\s*(?:\|\s*)?(\d+)\s*GB/i); if(storage) specs.stockage=storage[1]+' GB';
 const chipset=t.match(/\b(?:Processor|Model)\s+([A-Z][^\n]{2,70}?)(?=\s+CPU\s+|\s+Type\s+|\s+Octa-Core|\s+Hexa-Core)/i); if(chipset) specs.processeur=clean(chipset[1]);
 const antutu=t.match(/Antutu[^\d]{0,30}([\d.,]+)\s*•\s*Antutu\s*v(\d+)/i); if(antutu) specs.antutu=antutu[1]+' v'+antutu[2];
 const hz=t.match(/Refresh rate\s+(\d{2,3})\s*Hz/i); if(hz) specs.refresh=hz[1]+' Hz';
 const bright=t.match(/Peak brightness\s*[-:|]?\s*(\d+)\s*cd\/m²/i); if(bright) specs.luminosite=bright[1]+' cd/m²';
 const battery=t.match(/Capacity\s*\|?\s*(\d{4,5})\s*mAh/i); if(battery) specs.batterie=battery[1]+' mAh';
 const charge=t.match(/Fast charge\s+(?:Yes\s*,\s*)?(\d+(?:\.\d+)?)W/i); if(charge) specs.charge=charge[1]+' W';
 const camera=t.match(/Camera[\s\S]{0,700}?\b(\d+)\s*Mpx/i); if(camera) specs.photo=camera[1]+' MP';
 const ois=/OIS|optical image stabilization/i.test(t); if(ois) specs.photo_ois='OIS';
 const tele=/telephoto|periscope/i.test(t); if(tele) specs.photo_zoom='telephoto';
 const ultra=/ultrawide|ultra-wide|ultra wide/i.test(t); if(ultra) specs.photo_ultrawide='ultrawide';
 const os=t.match(/\bAndroid\s+(\d+)[^\n]{0,50}/i); if(os) specs.os='Android '+os[1];
 const scores={};
 for(const [k,re] of Object.entries({global:/Ki Cost-effective[\s\S]{0,250}?Score\s+([\d.]+)/i,design:/Design & Materials\s+([\d.]+)/i,performance:/Performance & Hardware\s+([\d.]+)/i,camera:/Camera\s+([\d.]+)/i,connectivity:/Connectivity\s+([\d.]+)/i,batteryScore:/Battery\s+([\d.]+)/i})) {const m=t.match(re); if(m)scores[k]=Number(m[1]);}
 return {name:finalTitle, specs, scores, url, source:'kimovil'};
}
async function resolve(query, options={}){
 const q=String(query||'').trim(); if(q.length<3)return null;
 const s=slug(q); const candidates=[`https://www.kimovil.com/en/where-to-buy-${s}`,`https://www.kimovil.com/en/where-to-buy-${s.replace(/-+/g,'-')}`];
 for(const url of [...new Set(candidates)]){try{const r=await net.fetchHtml(url,{timeout:Math.max(2500,options.timeout||6000)}); if(r&&r.status<400&&/Kimovil|Price and specifications on/i.test(r.html)){const p=parse(r.html,r.finalUrl||url); if(p.name||Object.keys(p.specs).length||Object.keys(p.scores).length)return Object.assign({found:true,confidence:p.name?0.97:0.8},p);}}catch(_){} }
 return null;
}
module.exports={resolve,parse,slug};
