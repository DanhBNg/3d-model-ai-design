import { createFlowLines } from '../../viewer/flowLines.js';
import * as T from 'three';
import { LESSONS } from '../../models/hydroelectric/lesson.js';
import { ELECTRIC_PATH } from '../../models/hydroelectric/metadata.js';
import { createHydroWater } from './water.js';
export function createHydroEffects(scene){
 const group=new T.Group();scene.add(group);const tracks=[],water=createHydroWater(scene);
 for(const [points,color,count,kind]of [[ELECTRIC_PATH,'#ffb52e',22,'electric']]){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
  const flow=createFlowLines(curve,{color,count:6,size:.09,track:true});group.add(flow.group);tracks.push({flow,kind});
 }
 const beacon=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:49},(_,i)=>new T.Vector3(.38*Math.cos(i/48*Math.PI*2),0,.38*Math.sin(i/48*Math.PI*2)))),new T.LineBasicMaterial({color:'#49dce2',depthTest:false,transparent:true,opacity:.55}));beacon.renderOrder=6;group.add(beacon);
 const mechanical=new T.Group();mechanical.position.set(1.6,1.98,0);group.add(mechanical);
 const arcCurve=new T.CatmullRomCurve3(Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*1.65;return new T.Vector3(.33*Math.cos(a),0,.33*Math.sin(a));}));
 const rotationFlow=createFlowLines(arcCurve,{color:'#b8e59a',count:1,size:.065,speed:.3});mechanical.add(rotationFlow.group);
 const matrix=new T.Matrix4();return {group,water,update(s){water.update(s);group.visible=s.mode==='principle'&&!s.transition&&!s.isolated;
  const lesson=LESSONS[s.lesson];beacon.position.set(...lesson.position);beacon.material.color.set(lesson.color);beacon.scale.setScalar(1+.12*Math.sin(s.time*3));mechanical.visible=s.rpm>1;rotationFlow.update(s.time);
  for(const t of tracks){const active=t.kind==='water'?s.flow>.005:s.powerMW>.005;t.flow.group.visible=active;if(!active)continue;
   t.flow.update(s.time);}
 },dispose(){water.dispose();scene.remove(group);group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();if(o.isInstancedMesh)o.dispose();});}};
}
