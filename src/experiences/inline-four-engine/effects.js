import * as T from 'three';
import {createFlowLines} from '../../viewer/flowLines.js';
const colors={intake:'#66cdeb',compression:'#e5c769',power:'#ff8847',exhaust:'#c5a5de'};
export function createEngineEffects(scene,root){
 const group=new T.Group();group.name='Engine teaching overlays';root.add(group);
 const cylinders=[-.15,-.05,.05,.15].map((x,i)=>{
  const assembly=new T.Group();assembly.name=`Cylinder ${i+1} gas and flow`;group.add(assembly);
  const gas=new T.Mesh(new T.CylinderGeometry(.0365,.0365,1,48),new T.MeshBasicMaterial({color:colors.intake,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide}));assembly.add(gas);
  const intake=createFlowLines(new T.CatmullRomCurve3([new T.Vector3(x,.305,-.12),new T.Vector3(x,.296,-.06),new T.Vector3(x,.273,-.021),new T.Vector3(x,.252,0)]),{color:colors.intake,count:2,size:.002,speed:.5,depthTest:true});
  const exhaust=createFlowLines(new T.CatmullRomCurve3([new T.Vector3(x,.255,0),new T.Vector3(x,.273,.021),new T.Vector3(x,.296,.06),new T.Vector3(x,.31,.12)]),{color:colors.exhaust,count:2,size:.002,speed:.5,depthTest:true});assembly.add(intake.group,exhaust.group);
  const spark=new T.Mesh(new T.IcosahedronGeometry(.0055,1),new T.MeshBasicMaterial({color:'#fff3c1',toneMapped:false}));spark.position.set(x,.278,0);assembly.add(spark);
  const light=new T.PointLight('#ff9847',0,.095,2);light.position.set(x,.269,0);assembly.add(light);
  return {assembly,gas,intake,exhaust,spark,light,x};
 });
 return {group,cylinders,update(s){group.visible=s.mode==='principle'&&!s.isolated&&!s.transition&&s.explode<.001&&(s.cutaway||s.cover>.95||s.focusCylinder>0);for(const [i,c] of cylinders.entries()){const v=s.sample?.cylinders[i];c.assembly.visible=!!v&&(!s.focusCylinder||s.focusCylinder===i+1);if(!v)continue;const bottom=v.pinY+.0205,top=.2825,height=Math.max(.0001,top-bottom);c.gas.position.set(c.x,(top+bottom)/2,0);c.gas.scale.y=height;c.gas.material.color.set(colors[v.phase]);c.gas.material.opacity=v.phase==='power'?.3:.19;c.intake.group.visible=v.phase==='intake'&&v.intakeLift>.00005;c.exhaust.group.visible=v.phase==='exhaust'&&v.exhaustLift>.00005;c.intake.update(s.time);c.exhaust.update(s.time);c.spark.visible=v.localAngle>=360&&v.localAngle<369;c.light.intensity=v.phase==='power'?.003*Math.max(0,1-(v.localAngle-360)/180):0;}},dispose(){group.removeFromParent();for(const c of cylinders){c.intake.dispose();c.exhaust.dispose();c.gas.geometry.dispose();c.gas.material.dispose();c.spark.geometry.dispose();c.spark.material.dispose();}}};
}
