import * as T from 'three';
import {createFlowLines,createStroke} from '../../viewer/flowLines.js';
import {LESSONS} from '../../models/wireless-charging/lesson.js';

export function createWirelessEffects(scene,root){
 const group=new T.Group();group.name='Wireless energy / alternating magnetic field';root.add(group);
 const runtime=root.userData.sculptRuntime;
 const point=(id,fallback)=>{const node=runtime.sockets[id]||root.getObjectByName(id);return node?group.worldToLocal(node.getWorldPosition(new T.Vector3())):new T.Vector3(...fallback);};
 function track(color,count=3){const curve=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(0,.01,0),new T.Vector3(.01,.01,0)]);const flow=createFlowLines(curve,{color,count,size:.0015,speed:.2,track:false});const stroke=createStroke(new Float32Array(80*6),{color,width:2,opacity:.7});const holder=new T.Group();holder.add(flow.group,stroke.group);group.add(holder);return {curve,flow,stroke,group:holder,set(points,closed=false){curve.points=points;curve.closed=closed;curve.updateArcLengths();const p=curve.getPoints(80),data=new Float32Array(480);for(let i=0;i<80;i++){p[i].toArray(data,i*6);p[i+1].toArray(data,i*6+3);}stroke.set(data);},dispose(){flow.dispose();stroke.dispose();}};}
 const power=[track('#ffc579'),track('#7bf3da'),track('#7bf3da')];
 const fields=Array.from({length:6},()=>track('#56cbe5',2));
 return {group,tracks:power,fields,update(s){
  group.visible=s.mode==='principle'&&!s.transition&&!s.isolated;
  if(!group.visible)return;root.updateWorldMatrix(true,true);group.updateWorldMatrix(true,false);
  const tx=point('tx_center',[0,.007,0]),rx=point('rx_center',[0,.033,0]);
  const adapter=point('adapter',[-.115,.012,0]),board=point('pad_pcb',[0,-.015,0]),rectifier=point('phone_board',[-.052,.055,-.055]),battery=point('battery',[.045,.067,.02]);
  const filter=s.flowFilter==='lesson'?(LESSONS[s.lesson]?.flow||'all'):s.flowFilter;
  power[0].set([adapter,adapter.clone().add(new T.Vector3(.025,.015,.03)),board,tx]);
  power[1].set([rx,rx.clone().add(new T.Vector3(-.022,.014,-.025)),rectifier]);
  power[2].set([rectifier,rectifier.clone().lerp(battery,.5).add(new T.Vector3(0,.018,0)),battery]);
  power.forEach((p,i)=>{p.group.visible=(filter==='all'||filter==='power')&&(i===0?s.inputW>0:s.receivedW>0);p.flow.update(s.time);});
  fields.forEach((f,i)=>{
   const angle=i*Math.PI/3,radial=new T.Vector3(Math.cos(angle),0,Math.sin(angle));
   const at=(base,r,y=0)=>base.clone().addScaledVector(radial,r).add(new T.Vector3(0,y,0));
   // Inner leg threads both coil bores; outer leg returns beyond their winding radius.
   const points=[at(tx,.003),at(rx,.003),at(rx,.010,.012),at(rx,.029,.008),at(tx.clone().lerp(rx,.5),.034),at(tx,.029,-.008),at(tx,.010,-.012)];
   const phase=Math.sin(s.time*2.4);if(phase<0)points.reverse();f.set(points,true);
   f.group.visible=(filter==='all'||filter==='field')&&s.inputW>0;f.flow.update(s.time*.65+i*.2);
   f.flow.group.traverse(node=>{if(node.material)node.material.opacity=Math.abs(phase);});
   f.stroke.group.children.forEach(line=>{line.material.opacity=.35+.4*Math.abs(phase);});
  });
 },dispose(){[...power,...fields].forEach(p=>p.dispose());group.removeFromParent();}};
}

