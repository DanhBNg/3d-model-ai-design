import {PARTS,PART_BY_ID,COVER_IDS,FLOW_OPTIONS} from './metadata.js';
import {LESSONS} from './lesson.js';
import {sampleThermal,clamp,THERMAL_SPEC} from './simulation.js';
const approach=(a,b,dt,speed=4)=>Math.abs(a-b)<.0001?b:a+(b-a)*(1-Math.exp(-dt*speed));
const smooth=t=>t*t*(3-2*t);
const ROTORS=['turbine_hp_rotor','turbine_lp_rotor','generator_rotor','condenser_bundle'];
const PIPES=['steam_pipes','feed_pipes','cooling_pipes','flue_duct'];
export function createThermalController(root){
 const r=root.userData.sculptRuntime;
 const defaults=()=>({mode:'explore',selected:null,isolated:false,cutaway:false,cover:0,explode:0,explodeTarget:0,auto:false,playing:true,slow:false,load:.7,cooling:true,time:0,angle:0,pumpAngle:0,rpm:0,powerMW:0,steamFlow:0,coolingFlow:0,heatMW:0,rejectedMW:0,transition:false,lesson:0,lessonAuto:false,lessonTime:0,flowFilter:'lesson',warmup:0,status:'Sẵn sàng khám phá'});
 const state=defaults(),rest=Object.fromEntries(Object.entries(r.pivots).map(([k,p])=>[k,p.quaternion.clone()]));
 let dead=false,saved=.8,autoDirection=1;
 function pose(){
  for(const p of PARTS){const a=r.assemblies[p.id];a.node.position.copy(a.restPosition);
   if(COVER_IDS.includes(p.id)){
    const exterior=['boiler_shell','hall_shell'].includes(p.id);
    const phase=exterior?clamp(state.cover/.5):clamp((state.cover-.4)/.6);
    a.node.position.addScaledVector(a.offset,smooth(phase));
   }
   else if(ROTORS.includes(p.id)){
    const lift=smooth(clamp((state.explode-.28)/.34)),slide=smooth(clamp((state.explode-.62)/.38));
    a.node.position.y+=a.offset.y*lift;a.node.position.x+=a.offset.x*slide;a.node.position.z+=a.offset.z*slide;
   }
   for(const m of r.meshes[p.id])m.visible=!state.isolated||p.id===state.selected;
  }
  if(!state.isolated){
   for(const id of COVER_IDS)for(const m of r.meshes[id])m.visible=state.mode==='explode'||state.cover<.995;
   for(const id of PIPES)for(const m of r.meshes[id])m.visible=state.explode<.15;
  }
  for(const id of ['hp_spin','lp_spin','generator_spin']){r.pivots[id].quaternion.copy(rest[id]);r.pivots[id].rotateX(state.angle);}
  for(const id of ['feed_spin','cooling_spin']){r.pivots[id].quaternion.copy(rest[id]);r.pivots[id].rotateX(state.pumpAngle);}
 }
 const api={state,
  setMode(mode){if(!['explore','explode','principle'].includes(mode))return false;if(state.mode==='explode')saved=state.explodeTarget;state.mode=mode;state.auto=false;state.isolated=false;state.explodeTarget=mode==='explode'?saved:0;state.playing=true;return true;},
  select(id){if(id!==null&&!PART_BY_ID[id])return false;state.selected=id;if(!id)state.isolated=false;r.highlight(id);pose();return true;},
  setCutaway(v){state.cutaway=!!v;},setIsolated(v){state.isolated=!!v&&!!state.selected;pose();},
  setExplode(v){state.explodeTarget=clamp(v);state.auto=false;},toggleAuto(){state.auto=!state.auto;autoDirection=state.explode>.5?-1:1;},
  setLoad(v){state.load=clamp(v);},setCooling(v){state.cooling=!!v;},setPlaying(v){state.playing=!!v;},setSlow(v){state.slow=!!v;},
  setLesson(i){if(!Number.isInteger(i)||!LESSONS[i])return false;state.lesson=i;state.lessonTime=0;return true;},toggleLesson(){state.lessonAuto=!state.lessonAuto;},
  setFlowFilter(id){if(!(id in FLOW_OPTIONS))return false;state.flowFilter=id;return true;},
  reset(){Object.assign(state,defaults());saved=.8;r.highlight(null);pose();},
  update(dt){if(dead||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);
   if(state.auto){state.explodeTarget=clamp(state.explodeTarget+autoDirection*dt*.14);if(state.explodeTarget===0||state.explodeTarget===1)autoDirection*=-1;}
   state.explode=approach(state.explode,state.mode==='explode'?state.explodeTarget:0,dt);
   const requiredCover=clamp(state.explode/.28);
   const coverTarget=state.mode==='explode'?requiredCover:state.cutaway||state.mode==='principle'?1:requiredCover;
   // One eased explosion phase prevents the cap lagging behind rotor extraction.
   state.cover=Math.max(requiredCover,approach(state.cover,coverTarget,dt,8));
   state.transition=state.mode==='principle'&&(state.cover<.995||state.explode>0);
   if(state.mode==='principle'&&!state.transition&&state.playing){
    const t=dt*(state.slow?.25:1);state.time+=t;
    const active=state.cooling&&state.load>0;state.warmup=approach(state.warmup,active?1:0,t,active?.8:1.5);
    const sample=sampleThermal({load:state.load*state.warmup,cooling:state.cooling,running:active});
    // Normalized spin-up is visual only. Under stable load, frequency fixes RPM.
    state.rpm=active?3000*state.warmup:approach(state.rpm,0,t,.8);
    Object.assign(state,{powerMW:sample.powerMW,steamFlow:sample.steamFlow,coolingFlow:sample.coolingFlow,heatMW:sample.heatMW,rejectedMW:sample.rejectedMW});
    state.angle=(state.angle+state.rpm/3000*THERMAL_SPEC.visualRPM*Math.PI/30*t)%(2*Math.PI);
    if(state.coolingFlow>0)state.pumpAngle=(state.pumpAngle+t*2)%(2*Math.PI);
    state.status=!state.cooling?'Mất làm mát · dừng phát':state.load===0?'Không yêu cầu phát điện':state.warmup<.99?'Khởi động minh họa':'Đang phát điện · 50 Hz';
    if(state.lessonAuto){state.lessonTime+=t;if(state.lessonTime>=9){state.lesson=(state.lesson+1)%LESSONS.length;state.lessonTime=0;}}
   }else if(state.mode!=='principle'||state.transition){state.rpm=0;state.powerMW=0;state.steamFlow=0;state.coolingFlow=0;state.heatMW=0;state.rejectedMW=0;state.warmup=0;}
   pose();
  },dispose(){dead=true;}
 };pose();return api;
}
