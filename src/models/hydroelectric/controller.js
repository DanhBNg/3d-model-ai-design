import { LESSONS,advanceLesson } from './lesson.js';
import { PARTS,PART_BY_ID,EXPLODE_STAGES } from './metadata.js';
import { sampleHydro,clamp } from './simulation.js';
const approach=(a,b,dt,speed)=>Math.abs(a-b)<.0001?b:a+(b-a)*(1-Math.exp(-dt*speed));
export function createHydroController(root){
 const r=root.userData.sculptRuntime;
 const state={lesson:0,lessonTime:0,lessonAuto:false,mode:'explore',selected:null,isolated:false,cutaway:false,explode:0,explodeTarget:0,explodeAuto:false,playing:true,slow:false,head:50,openingTarget:.65,opening:0,intake:0,connected:true,rpm:0,flow:0,powerMW:0,waterTime:0,flowTime:0,time:0,angle:0,transition:false,coverOpen:0};
 let dead=false,savedExplode=.7,autoDirection=1;
 const guides=Object.entries(r.pivots).filter(([k])=>k.startsWith('guide_')).map(([,p])=>({p,q:p.quaternion.clone()}));
 function visibility(){
  for(const p of PARTS){const node=r.nodes[p.id];node.visible=state.isolated?p.id===state.selected:true;}
  if(!state.isolated){for(const id of ['facade','conduit_cover'])r.nodes[id].visible=state.coverOpen<.98;r.nodes.roof.visible=state.mode==='explode'||state.coverOpen<.98;}
  if(!state.isolated&&state.coverOpen>.98)for(const id of ['spillway','site_details'])r.nodes[id].visible=state.selected===id;
  for(const id of ['facade','conduit_cover'])for(const o of r.meshes[id])for(const m of Array.isArray(o.material)?o.material:[o.material]){m.transparent=!state.isolated&&state.coverOpen>0;m.opacity=state.isolated?1:1-state.coverOpen;m.depthWrite=m.opacity>.98;}
 }
 function applyPose(){
  // Open architecture first. Machine extraction only starts when the covers are clear.
  const t=state.explode;
  for(const p of PARTS){const [start,end]=EXPLODE_STAGES[p.id]||[0,1],u=clamp((t-start)/(end-start),0,1),e=u*u*(3-2*u);const a=r.assemblies[p.id];a.node.position.copy(a.restPosition).addScaledVector(a.offset,p.id==='roof'?state.coverOpen:e);}
  for(const id of ['runner_spin','shaft_spin','rotor_spin'])r.pivots[id].rotation.y=state.angle;
  for(const {p,q}of guides){p.quaternion.copy(q);p.rotateY(state.opening*.85);}
  r.nodes.intake_gate.position.y+=state.intake*1.4;
  visibility();
 }
 const api={state,
  setMode(mode){if(!['explore','explode','principle'].includes(mode))return false;if(state.mode==='explode')savedExplode=state.explodeTarget;state.mode=mode;state.explodeAuto=false;state.isolated=false;state.explodeTarget=mode==='explode'?savedExplode:0;state.playing=true;return true;},
  select(id){if(id!==null&&!PART_BY_ID[id])return false;state.selected=id;r.highlight(id);if(!id)state.isolated=false;visibility();return true;},
  setCutaway(v){state.cutaway=!!v;},
  setIsolated(v){state.isolated=!!v&&!!state.selected;visibility();},
  setExplode(v){state.explodeTarget=clamp(v,0,1);state.explodeAuto=false;},
  toggleAuto(){state.explodeAuto=!state.explodeAuto;autoDirection=state.explode>.5?-1:1;},
  setLesson(index){if(!Number.isInteger(index)||!LESSONS[index])return false;state.lesson=index;state.lessonTime=0;return true;},toggleLesson(){state.lessonAuto=!state.lessonAuto;},
  setOpening(v){state.openingTarget=clamp(v,0,1);},setHead(v){state.head=clamp(v,20,80);},setConnected(v){state.connected=!!v;},setPlaying(v){state.playing=!!v;},setSlow(v){state.slow=!!v;},
  reset(){Object.assign(state,{lesson:0,lessonTime:0,lessonAuto:false,explode:0,explodeTarget:0,explodeAuto:false,cutaway:false,coverOpen:0,opening:0,intake:0,openingTarget:.65,head:50,connected:true,rpm:0,flow:0,powerMW:0,waterTime:0,flowTime:0,time:0,angle:0,playing:false,transition:false,isolated:false});state.mode='explore';savedExplode=.7;applyPose();},
  update(dt){if(dead||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);if(state.mode!=='principle'||state.playing)state.waterTime+=dt*(state.slow?.25:1);
   const open=state.cutaway||state.mode==='principle'||state.mode==='explode';state.coverOpen=approach(state.coverOpen,open?1:0,dt,4);
   if(state.explodeAuto){state.explodeTarget=clamp(state.explodeTarget+autoDirection*dt*.18,0,1);if(state.explodeTarget===0||state.explodeTarget===1)autoDirection*=-1;}
   const target=state.mode==='explode'&&state.coverOpen>.98?state.explodeTarget:0;state.explode=approach(state.explode,target,dt,4);
   state.transition=state.mode==='principle'&&(state.explode>0||state.coverOpen<.98);
   if(state.mode==='principle'&&!state.transition&&state.playing){const t=dt*(state.slow?.25:1);state.time+=t;advanceLesson(state,t);state.intake=approach(state.intake,state.connected||state.opening>.02?1:0,t,2);state.opening=approach(state.opening,state.connected&&state.intake>.95?state.openingTarget:0,t,1.8);const sample=sampleHydro({opening:state.opening,head:state.head,connected:state.connected});state.flow=sample.flow;state.flowTime+=t*sample.flow/10;state.powerMW=sample.powerMW;state.rpm=approach(state.rpm,sample.rpm,t,state.connected?1.8:.65);state.angle=(state.angle+state.rpm*Math.PI/30*t/20)%(Math.PI*2);}
   if(state.mode!=='principle'||state.transition){state.flow=0;state.powerMW=0;state.rpm=0;state.opening=0;state.intake=0;}
   if(!state.connected)state.powerMW=0;applyPose();
  },dispose(){dead=true;}
 };applyPose();return api;
}
