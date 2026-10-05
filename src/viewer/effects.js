import * as THREE from 'three';
import { MOTOR_LAYOUT } from '../models/drone/metadata.js';
export function createEffects(runtime,scene){
 const group=new THREE.Group();group.name='educational_overlays';scene.add(group);
 const arrows=[],spinArcs=[],paths=[],dots=[],point=new THREE.Vector3();
 const colors={energy:0xc57920,control:0x16847a};
 const mat=color=>new THREE.LineBasicMaterial({color,transparent:true,opacity:.7,depthTest:false});
 const definitions=[['battery','esc','energy'],['flight_controller','esc','control'],...MOTOR_LAYOUT.flatMap(m=>[['esc','motor_'+m.id,'energy'],['flight_controller','motor_'+m.id,'control'],['motor_'+m.id,'prop_'+m.id,'energy']])];
 for(const [from,to,type] of definitions){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(24*3),3));
  const line=new THREE.Line(geo,mat(colors[type]));line.renderOrder=3;group.add(line);paths.push({line,from,to,type});
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.002,8,6),new THREE.MeshBasicMaterial({color:colors[type],depthTest:false}));dot.renderOrder=4;group.add(dot);dots.push(dot);
 }
 for(const m of MOTOR_LAYOUT){
  const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.08,0x43876c,.012,.006);arrow.line.material.depthTest=false;arrow.cone.material.depthTest=false;group.add(arrow);arrows.push(arrow);
  const arc=new THREE.Group(),points=Array.from({length:41},(_,i)=>{const a=m.spin*i/40*Math.PI*1.65;return new THREE.Vector3(.029*Math.cos(a),0,-.029*Math.sin(a));});
  arc.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),mat(m.spin<0?0xc57920:0x16847a)));
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.0026,.007,10),new THREE.MeshBasicMaterial({color:m.spin<0?0xc57920:0x16847a,depthTest:false}));cone.position.copy(points.at(-1));cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),points.at(-1).clone().sub(points.at(-2)).normalize());arc.add(cone);group.add(arc);spinArcs.push(arc);
 }
 const guideMaterial=new THREE.LineDashedMaterial({color:0x89968a,dashSize:.006,gapSize:.004,transparent:true,opacity:.45});
 const guides=Object.values(runtime.assemblies).filter(a=>a.offset.length()>0).map(a=>{const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),guideMaterial);scene.add(line);return {line,a};});
 let flow='energy';
 return {setFlow(type){flow=type},update(state){
  const visible=state.mode==='flight'&&!state.transition;group.visible=visible;runtime.nodes.flightRoot.updateWorldMatrix(true,true);
  for(const {line,a} of guides){line.visible=state.mode==='explode'&&state.explode>.03&&a.node.visible;if(!line.visible)continue;line.geometry.setFromPoints([a.parent.localToWorld(a.restPosition.clone()),a.node.getWorldPosition(new THREE.Vector3())]);line.computeLineDistances();}
  if(!visible)return;
  const orientation=runtime.nodes.flightRoot.getWorldQuaternion(new THREE.Quaternion()),dir=new THREE.Vector3(0,1,0).applyQuaternion(orientation);
  for(let i=0;i<arrows.length;i++){
   runtime.sockets['prop_'+MOTOR_LAYOUT[i].id].getWorldPosition(point);arrows[i].position.copy(point);arrows[i].setDirection(dir);arrows[i].setLength(.025+state.thrust[i]*.17,.012,.006);spinArcs[i].position.copy(point).addScaledVector(dir,.008);spinArcs[i].quaternion.copy(orientation);
  }
  paths.forEach((p,i)=>{
   const show=flow==='both'||p.type===flow;p.line.visible=dots[i].visible=show;if(!show)return;
   const a=runtime.sockets[p.from].getWorldPosition(new THREE.Vector3()),b=runtime.sockets[p.to].getWorldPosition(new THREE.Vector3()),mid=a.clone().lerp(b,.5).addScaledVector(dir,p.type==='control'?.034:.014),curve=new THREE.QuadraticBezierCurve3(a,mid,b),positions=p.line.geometry.attributes.position;
   for(let j=0;j<24;j++){curve.getPoint(j/23,point);positions.setXYZ(j,point.x,point.y,point.z);}positions.needsUpdate=true;p.line.geometry.computeBoundingSphere();dots[i].position.copy(curve.getPoint((state.time*.65+i*.17)%1));
  });
 },dispose(){scene.remove(group);for(const {line}of guides){scene.remove(line);line.geometry.dispose();}guideMaterial.dispose();group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}};
}
