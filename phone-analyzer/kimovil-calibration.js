'use strict';
/* Guide·Achat calibration: Kimovil domain scores are evidence, not our final score.
   Reference floor: Nothing Phone (3) = 6/10 for core technology/process domains.
   Photo reference: OPPO Find X9 Ultra = 9/10.
   Below the reference floor, the score decreases proportionally; above it, the range
   is compressed into the 6→9 band so marketing/spec inflation cannot create 9/10. */
const ANCHORS = {
  ecran: { floor: 7.5, floorScore: 6, ceiling: 9.8, ceilingScore: 9, reference: 'Nothing Phone (3)' },
  performance: { floor: 8.3, floorScore: 6, ceiling: 9.8, ceilingScore: 9, reference: 'Nothing Phone (3)' },
  photo: { floor: 7.9, floorScore: 6, ceiling: 9.8, ceilingScore: 9, reference: 'Nothing Phone (3) + OPPO Find X9 Ultra' },
  autonomie: { floor: 7.2, floorScore: 6, ceiling: 9.8, ceilingScore: 9, reference: 'Nothing Phone (3)' },
  connectivite: { floor: 8.9, floorScore: 6, ceiling: 9.8, ceilingScore: 9, reference: 'Nothing Phone (3)' }
};
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function calibrate(value,key){
  const a=ANCHORS[key]; const x=Number(value); if(!a || !Number.isFinite(x)) return null;
  let out;
  if(x <= a.floor) out = a.floorScore * x / a.floor;
  else out = a.floorScore + (a.ceilingScore-a.floorScore) * (x-a.floor)/(a.ceiling-a.floor);
  return Math.round(clamp(out,0,9)*10)/10;
}
function calibrateAll(scores){
  const out={}; for(const [k,v] of Object.entries(scores||{})){const c=calibrate(v,k); if(c!=null) out[k]=c;}
  return out;
}
module.exports={ANCHORS,calibrate,calibrateAll};
