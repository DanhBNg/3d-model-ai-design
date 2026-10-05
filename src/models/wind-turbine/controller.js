import {PARTS,PART_BY_ID,LESSONS} from './metadata.js';
import {sampleWind,WIND_SPEC} from './simulation.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=(a,b,dt,s=4)=>Math.abs(a-b)<.0001?b:a+(b-a)*(1-Math.exp(-dt*s));
const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function createWindController(root){
 const r=root.userData.sculptRuntime;
 const state={mode:'explore',selected:null,isolated:false,cutaway:false,cover:0,explode:0,explodeTarget:0,auto:false,playing:true,slow:false,wind:9,direction:0,yaw:0,pitch:2,rpm:0,power:0,angle:0,time:0,windTime:0,transition:false,lesson:0,lessonAuto:false,lessonTime:0,status:'Sẵn sàng khám phá'};
 const rest=Object.fromEntries(Object.entries(r.pivots).map(([id,p])=>[id,p.quaternion.clone()]));
 let dead=false,saved=.7,autoDirection=1;
 function spin(id,axis,a){r.pivots[id].quaternion.copy(rest[id]);r.pivots[id][axis](a);}
 function pose(){
  for(const p of PARTS){const a=r.assemblies[p.id],u=p.id==='nacelle_shell'?state.cover:p.id==='sensors'?(state.mode==='explode'?state.cover:0):clamp((state.explode-.22)/.78,0,1);a.node.position.copy(a.restPosition).addScaledVector(a.offset,u*u*(3-2*u));}
  spin('yaw','rotateY',state.yaw);
  for(const id of ['rotor_spin','shaft_spin','input_spin'])spin(id,'rotateX',state.angle);
  spin('intermediate_spin','rotateX',-3*state.angle);
  for(const id of ['output_spin','brake_spin','generator_spin'])spin(id,'rotateX',6*state.angle);
  for(let i=0;i<3;i++)spin(`blade_${i}`,'rotateY',state.pitch*Math.PI/180);
  spin('anemometer_spin','rotateY',state.windTime*2);spin('vane_spin','rotateY',state.direction-state.yaw);
  for(const p of PARTS){const visible=!state.isolated||p.id===state.selected;for(const mesh of r.meshes[p.id])mesh.visible=visible;}
  const shellVisible=state.isolated?state.selected==='nacelle_shell':state.mode==='explode'||state.cover<.995;
  for(const mesh of r.meshes.nacelle_shell)mesh.visible=shellVisible;
  if(!state.isolated)for(const mesh of r.meshes.sensors)mesh.visible=state.mode==='explode'||state.cover<.995;
 }
 const api={state,
  setMode(mode){if(!['explore','explode','principle'].includes(mode))return false;if(state.mode==='explode')saved=state.explodeTarget;state.mode=mode;state.auto=false;state.isolated=false;state.explodeTarget=mode==='explode'?saved:0;state.playing=true;state.transition=true;return true;},
  select(id){if(id!==null&&!PART_BY_ID[id])return false;state.selected=id;if(!id)state.isolated=false;r.highlight(id);pose();return true;},
  setCutaway(v){state.cutaway=!!v;},setIsolated(v){state.isolated=!!v&&!!state.selected;pose();},
  setExplode(v){if(Number.isFinite(v))state.explodeTarget=clamp(v,0,1);state.auto=false;},toggleAuto(){state.auto=!state.auto;autoDirection=state.explode>.5?-1:1;},
  setWind(v){if(Number.isFinite(v))state.wind=clamp(v,0,30);},setDirection(v){if(Number.isFinite(v))state.direction=clamp(v,-Math.PI,Math.PI);},
  setPlaying(v){state.playing=!!v;},setSlow(v){state.slow=!!v;},setLesson(i){if(!LESSONS[i])return false;state.lesson=i;state.lessonTime=0;return true;},toggleLesson(){state.lessonAuto=!state.lessonAuto;},
  reset(){Object.assign(state,{mode:'explore',selected:null,isolated:false,cutaway:false,cover:0,explode:0,explodeTarget:0,auto:false,playing:true,slow:false,wind:9,direction:0,yaw:0,pitch:2,rpm:0,power:0,angle:0,time:0,windTime:0,transition:false,lesson:0,lessonAuto:false,lessonTime:0,status:'Sẵn sàng khám phá'});saved=.7;r.highlight(null);pose();},
  update(dt){if(dead||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);
   const open=state.cutaway||state.mode!=='explore';state.cover=ease(state.cover,open?1:0,dt);
   if(state.auto){state.explodeTarget=clamp(state.explodeTarget+dt*.15*autoDirection,0,1);if(state.explodeTarget===0||state.explodeTarget===1)autoDirection*=-1;}
   state.explode=ease(state.explode,state.mode==='explode'&&state.cover>.99?state.explodeTarget:0,dt);
   state.transition=state.mode==='principle'&&(state.explode>0||state.cover<.995);
   if(state.mode==='principle'&&!state.transition&&state.playing){
    const t=dt*(state.slow?.25:1);state.time+=t;state.windTime+=t*state.wind*.13;
    state.yaw+=clamp(angleDelta(state.yaw,state.direction),-t*.25,t*.25);
    const sample=sampleWind(state.wind,angleDelta(state.yaw,state.direction));
    state.pitch=ease(state.pitch,sample.pitch,t,1.2);state.rpm=ease(state.rpm,sample.rpm,t,.65);
    state.power=ease(state.power,sample.power,t,1.8);state.status=sample.status;
    state.angle=(state.angle+state.rpm*Math.PI/30*t*WIND_SPEC.visualRate)%(Math.PI*2);
    if(state.lessonAuto){state.lessonTime+=t;if(state.lessonTime>9){state.lesson=(state.lesson+1)%LESSONS.length;state.lessonTime=0;}}
   }else if(state.mode!=='principle'||state.transition){state.power=0;state.rpm=0;}
   pose();
  },dispose(){dead=true;}
 };pose();return api;
}
