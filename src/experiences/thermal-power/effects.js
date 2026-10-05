import * as T from 'three';
import layout from '../../models/thermal-power/layout.json';
import {LESSONS} from '../../models/thermal-power/lesson.js';
import {createFlowLines} from '../../viewer/flowLines.js';
const kinds={steam:'steam',reheatCold:'steam',reheatHot:'steam',exhaust:'steam',feed:'feed',coolingCold:'cooling',coolingHot:'cooling',flue:'flue',electricity:'electric'};
const colors={steam:'#ff963d',feed:'#2ee3e5',cooling:'#49a9ff',flue:'#c4cbd4',electric:'#ffca37'};
function path(points){const c=new T.CurvePath();for(let i=1;i<points.length;i++)c.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));return c;}
export function createThermalEffects(scene,root){
 const group=new T.Group();group.name='Thermal energy paths';root.add(group);
 const tracks=Object.entries(layout.routes).map(([id,route])=>{
  const kind=kinds[id],flow=createFlowLines(path(route.points),{color:colors[kind],count:id==='exhaust'?1:4,size:.10,speed:.09});group.add(flow.group);return {id,kind,flow};
 });
 const stackFlow=createFlowLines(path([[-1,1.2,4.7],[-1,8.1,4.7]]),{color:colors.flue,count:3,size:.13,speed:.08});group.add(stackFlow.group);
 const fire=new T.Group();fire.name='Illustrative combustion';root.add(fire);
 const flames=[];
 for(let i=0;i<9;i++){
  const material=new T.MeshBasicMaterial({color:i%2?'#ffb236':'#f06c24',transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false,toneMapped:false});
  const shape=new T.Shape();shape.moveTo(-.12,0);shape.quadraticCurveTo(-.23,.35,0,.8);shape.quadraticCurveTo(.22,.32,.12,0);shape.closePath();
  const mesh=new T.Mesh(new T.ShapeGeometry(shape,12),material);mesh.position.set(-5.1+(i%3-1)*.52,1.76,-.1+(Math.floor(i/3)-1)*.6);mesh.rotation.y=(i%3-1)*.5;fire.add(mesh);flames.push(mesh);
 }
 const heat=new T.PointLight('#ff8b30',0,5,2);heat.position.set(-5.1,2.2,-.1);fire.add(heat);
 const mechanical=createFlowLines(new T.CatmullRomCurve3(Array.from({length:50},(_,i)=>{const a=i/49*Math.PI*1.7;return new T.Vector3(5.35,2.1+.65*Math.cos(a),-1.3+.65*Math.sin(a));})),{color:'#a4e98d',count:1,size:.10});group.add(mechanical.group);
 return {group,fire,tracks,update(s){
  const visible=s.mode==='principle'&&!s.transition&&!s.isolated;group.visible=visible;
  const filter=s.flowFilter==='lesson'?LESSONS[s.lesson].flow:s.flowFilter;
  for(const t of tracks){const active=t.kind==='cooling'?s.coolingFlow>0:s.steamFlow>0;t.flow.group.visible=active&&(filter==='all'||filter===t.kind);t.flow.update(s.time);}
  stackFlow.group.visible=s.steamFlow>0&&(filter==='all'||filter==='flue');stackFlow.update(s.time);
  mechanical.group.visible=s.rpm>1&&(filter==='all'||filter==='electric');mechanical.update(s.time);
  fire.visible=visible&&s.heatMW>0&&(filter==='all'||filter==='flue'||filter==='steam');
  const strength=Math.min(1,s.heatMW/277.78);heat.intensity=1.3*strength;
  flames.forEach((m,i)=>{m.scale.set(1,.3+strength*(.7+.16*Math.sin(s.time*5+i*2)),1);m.material.opacity=.65+.1*Math.sin(s.time*3+i);});
 },dispose(){tracks.forEach(t=>t.flow.dispose());stackFlow.dispose();mechanical.dispose();group.removeFromParent();fire.removeFromParent();flames.forEach(m=>{m.geometry.dispose();m.material.dispose();});}};
}
