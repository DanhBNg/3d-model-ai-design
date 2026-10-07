export const clamp=(value,min=0,max=1,fallback=min)=>Math.min(max,Math.max(min,Number.isFinite(value)?value:fallback));
export const WIRELESS_SPEC=Object.freeze({defaultGap:6,minGap:6,maxGap:18,maxAlignment:35,inputW:15,displayGapExtra:.014});
// Pedagogical curve only: neither an electromagnetic solver nor measured efficiency.
export function sampleWireless({alignment=0,gap=6,powered=true}={}){
 const offset=clamp(alignment,-35,35,0),distance=clamp(gap,6,18,6);
 const coupling=Math.exp(-Math.pow(offset/22,2))*Math.exp(-(distance-2)/15);
 const inputW=powered?15:0,receivedW=inputW*.84*coupling;
 return {coupling,inputW,receivedW,charging:receivedW>=.5};
}
