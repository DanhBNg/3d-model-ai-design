export const THERMAL_SPEC=Object.freeze({ratedMW:100,efficiency:.36,rpm:3000,steamKgPerSecond:100,coolingM3PerSecond:6,visualRPM:8});
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
// A normalized teaching model, not a steam-table or Rankine-cycle solver.
export function sampleThermal({load=.7,cooling=true,running=true}={}){
 const fraction=running&&cooling?clamp(load):0,powerMW=100*fraction,heatMW=powerMW/.36;
 return {powerMW,heatMW,rejectedMW:heatMW-powerMW,steamFlow:100*fraction,coolingFlow:cooling&&running?6*Math.max(.25,fraction):0,rpm:fraction>0?3000:0};
}
