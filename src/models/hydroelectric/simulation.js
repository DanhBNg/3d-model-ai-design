export const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function sampleHydro({opening=0,head=50,connected=true}={}){
 const h=clamp(head,20,80),g=clamp(opening,0,1),flow=12*g*Math.sqrt(h/50);
 return {flow,head:h,powerMW:connected?1000*9.81*flow*h*.88/1e6:0,rpm:connected&&g>.001?300:0};
}
