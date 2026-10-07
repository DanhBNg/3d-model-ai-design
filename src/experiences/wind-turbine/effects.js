import {createFlowArrow,createFlowLines,createStroke,disposeFlowArrow,setFlowArrowPose} from '../../viewer/flowLines.js';
import * as T from 'three';
export function createWindEffects(scene,root){
 const wind=new T.Group();wind.name='Wind trails';scene.add(wind);
 const lines=[];const seeds=Array.from({length:32},(_,i)=>{const radius=i<12?.35+i*.14:Math.sqrt((i-11)/20)*17;return {y:35.7+Math.sin(i*2.4)*radius,z:Math.cos(i*2.4)*radius,phase:(i*.618)%1};});
 for(const seed of seeds){const data=new Float32Array(17*6),stroke=createStroke(data,{color:'#59d6ed',width:2,opacity:.9,depthTest:true}),arrow=createFlowArrow({color:'#59d6ed',size:.65,opacity:.9,depthTest:true});wind.add(stroke.group,arrow);lines.push({data,stroke,arrow,seed});}
 const energy=new T.Group();energy.name='Electricity';root.userData.sculptRuntime.pivots.yaw.add(energy);
 const curve=new T.CatmullRomCurve3([new T.Vector3(2.8,.7,.2),new T.Vector3(3.1,.95,.6),new T.Vector3(2.4,.9,.8),new T.Vector3(.3,-.1,.5),new T.Vector3(0,-1,0),new T.Vector3(0,-6,0)]);
 const electric=createFlowLines(curve,{color:'#ffb52e',count:5,size:.09,speed:.17});energy.add(electric.group);
 return {wind,energy,update(s){
  const active=s.mode==='principle'&&!s.transition&&!s.isolated;wind.visible=active&&s.wind>.1;energy.visible=active&&s.power>1;
  wind.rotation.y=s.direction;
  for(const {data,stroke,arrow,seed}of lines){const head=((s.windTime*.09+seed.phase)%1)*72-36;
   const point=x=>{const wake=Math.max(0,x+2)/38;return [x,seed.y+Math.sin(x*.2+seed.phase*8)*wake*.6,seed.z*(1+wake*.10)];};
   for(let j=0;j<17;j++){data.set(point(Math.max(-36,head-j*.25)),j*6);data.set(point(Math.max(-36,head-(j+1)*.25)),j*6+3);}
   const tip=new T.Vector3(...point(head)),previous=new T.Vector3(...point(Math.max(-36,head-.12))),direction=tip.clone().sub(previous).normalize();setFlowArrowPose(arrow,tip,direction,.65);stroke.set(data);
  }
  electric.update(s.time);
 },dispose(){wind.removeFromParent();energy.removeFromParent();for(const {stroke,arrow}of lines){stroke.dispose();disposeFlowArrow(arrow);}electric.dispose();}};
}
