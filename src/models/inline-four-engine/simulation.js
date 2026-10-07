export const ENGINE_SPEC=Object.freeze({crankY:.1,crankRadius:.032,rodLength:.115,cylinderX:[-.15,-.05,.05,.15],phaseOffsets:[0,180,540,360],crankPhases:[0,180,180,0],boreRadius:.038,pistonRadius:.037,pistonCrown:.020,chamberRoof:.283,valveLift:.006,camY:.350,camZ:.040,camBaseRadius:.023,crankPulleyRadius:.019,camPulleyRadius:.038});
export const clamp=(v,min=0,max=1,fallback=min)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export const wrap=(v,period=720)=>((v%period)+period)%period;
export const valveLift=(localAngle,kind='intake')=>{const a=wrap(localAngle),start=kind==='intake'?0:540;return a>start&&a<start+180?.006*Math.sin(Math.PI*(a-start)/180)**2:0;};
export function sampleEngine(angleDeg=0){
 const angle=clamp(angleDeg,0,720),camAngle=angle/2;
 return {angle,camAngle,cylinders:ENGINE_SPEC.cylinderX.map((x,i)=>{
  const localAngle=wrap(angle+ENGINE_SPEC.phaseOffsets[i]),theta=wrap(localAngle,360)*Math.PI/180;
  const crankY=.1+.032*Math.cos(theta),crankZ=.032*Math.sin(theta),pinY=crankY+Math.sqrt(.115**2-crankZ**2);
  return {index:i+1,x,phase:['intake','compression','power','exhaust'][Math.floor(localAngle/180)],localAngle,progress:(localAngle%180)/180,pinY,crankY,crankZ,rodAngle:Math.atan2(-crankZ,pinY-crankY),intakeLift:valveLift(localAngle),exhaustLift:valveLift(localAngle,'exhaust'),spark:localAngle>=360&&localAngle<378};
 })};
}
// Radial approximation to the ideal valve lift; the model uses a translating bridge follower.
export const camRadius=(polarRadians,cylinderIndex,kind='intake')=>.023+valveLift(2*(Math.PI-polarRadians)*180/Math.PI+ENGINE_SPEC.phaseOffsets[cylinderIndex-1],kind);
// External tangent belt around three circular pulleys, counterclockwise in the (Y,Z) plane.
const pulley=[{y:.1,z:0,r:.019},{y:.35,z:-.04,r:.038},{y:.35,z:.04,r:.038}];
const normals=pulley.map((a,i)=>{const b=pulley[(i+1)%3],dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dy,dz),phi=Math.atan2(dz,dy);return phi-Math.acos((a.r-b.r)/d);});
const segments=[];let beltLength=0;
for(let i=0;i<3;i++){
 const a=pulley[i],b=pulley[(i+1)%3],n=normals[i],next=normals[(i+1)%3],p={y:a.y+a.r*Math.cos(n),z:a.z+a.r*Math.sin(n)},q={y:b.y+b.r*Math.cos(n),z:b.z+b.r*Math.sin(n)},length=Math.hypot(q.y-p.y,q.z-p.z);
 segments.push({start:beltLength,length,p,q});beltLength+=length;const sweep=wrap(next-n,Math.PI*2),arc=b.r*sweep;segments.push({start:beltLength,length:arc,center:b,n,sweep});beltLength+=arc;
}
export const BELT_LENGTH=beltLength;
export function sampleBelt(distance){const d=wrap(distance,BELT_LENGTH),s=segments.find(s=>d<s.start+s.length)||segments.at(-1),t=(d-s.start)/s.length;if(s.center){const a=s.n+s.sweep*t;return {y:s.center.y+s.center.r*Math.cos(a),z:s.center.z+s.center.r*Math.sin(a),angle:a+Math.PI/2};}return {y:s.p.y+(s.q.y-s.p.y)*t,z:s.p.z+(s.q.z-s.p.z)*t,angle:Math.atan2(s.q.z-s.p.z,s.q.y-s.p.y)};}
