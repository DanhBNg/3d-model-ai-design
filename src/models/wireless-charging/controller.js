import {PARTS,PART_BY_ID,PHONE_IDS,COVER_IDS,FLOW_OPTIONS} from './metadata.js';
import {LESSONS} from './lesson.js';
import {clamp,sampleWireless,WIRELESS_SPEC} from './simulation.js';
const approach=(a,b,dt,speed=6)=>Math.abs(a-b)<.0001?b:a+(b-a)*(1-Math.exp(-dt*speed));
const teachingOffsets={pad_base:[0,-.028,0],pad_pcb:[-.018,-.018,0],pad_cover:[-.075,.022,0],phone_back:[.075,.025,0],rx_ferrite:[.055,.015,-.035],battery:[.065,.038,.02],phone_board:[-.052,.026,-.015],phone_frame:[.075,.045,0],screen:[0,.065,.04]};
export function createWirelessController(root){
 const r=root.userData.sculptRuntime;
 const defaults=()=>({mode:'explore',selected:null,isolated:false,cutaway:false,explode:0,explodeTarget:0,auto:false,playing:true,slow:false,time:0,alignment:0,gap:6,receivedW:0,inputW:0,coupling:sampleWireless().coupling,charging:false,soc:42,lesson:0,lessonAuto:false,lessonTime:0,flowFilter:'lesson',transition:false,cover:0});
 const state=Object.assign(defaults(),{docked:true,dockProgress:0,screenTime:0});let dead=false,saved=.8,autoDirection=1,displayGap=0;
 function sample(){const teaching=state.mode==='principle'&&!state.transition&&state.explode===0&&state.cover===1;const placed=state.mode==='explore'&&!state.cutaway&&state.cover===0&&state.explode===0&&state.docked&&state.dockProgress===0;Object.assign(state,sampleWireless({alignment:state.alignment,gap:state.gap,powered:teaching||placed}));}
 function pose(){
  for(const p of PARTS){const a=r.assemblies[p.id],node=a.node;node.position.copy(a.restPosition);node.quaternion.copy(a.restQuaternion);node.scale.copy(a.restScale);node.position.addScaledVector(a.offset,state.explode);
   if(PHONE_IDS.includes(p.id)){node.position.x+=state.alignment/1000+.028*state.dockProgress;node.position.y+=(state.gap-6)/1000+displayGap+.06*state.dockProgress;}
   const offset=teachingOffsets[p.id];if(offset){node.position.x+=offset[0]*state.cover;node.position.y+=offset[1]*state.cover;node.position.z+=offset[2]*state.cover;}
   for(const mesh of r.meshes[p.id])mesh.visible=state.isolated?p.id===state.selected:!(COVER_IDS.includes(p.id)&&state.cover>.98);
  }
 }
 const api={state,
  setMode(mode){if(!['explore','explode','principle'].includes(mode))return false;if(state.mode==='explode')saved=state.explodeTarget;state.mode=mode;state.auto=false;state.isolated=false;state.explodeTarget=mode==='explode'?saved:0;state.transition=mode==='principle'&&(state.explode!==0||state.cover!==1);sample();pose();return true;},
  select(id){if(id!==null&&!PART_BY_ID[id])return false;state.selected=id;if(!id)state.isolated=false;r.highlight(id);pose();return true;},
  setIsolated(v){state.isolated=!!v&&!!state.selected;pose();},setCutaway(v){state.cutaway=!!v;},
  setDocked(v){state.docked=!!v;sample();},
  setExplode(v){state.explodeTarget=clamp(v);state.auto=false;},toggleAuto(){state.auto=!state.auto;autoDirection=state.explode>.5?-1:1;},
  setAlignment(v){state.alignment=clamp(v,-35,35,0);sample();pose();},setGap(v){state.gap=clamp(v,6,18,6);sample();pose();},
  setPlaying(v){state.playing=!!v;},setSlow(v){state.slow=!!v;},
  setLesson(i){if(!Number.isInteger(i)||!LESSONS[i])return false;state.lesson=i;state.lessonTime=0;return true;},toggleLesson(){state.lessonAuto=!state.lessonAuto;},
  setFlowFilter(id){if(!Object.hasOwn(FLOW_OPTIONS,id))return false;state.flowFilter=id;return true;},
  reset(){Object.assign(state,defaults(),{docked:true,dockProgress:0,screenTime:0});saved=.8;autoDirection=1;displayGap=0;r.highlight(null);sample();pose();},
  update(dt){if(dead||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);
   if(state.playing){state.screenTime+=dt*(state.slow?.25:1);state.dockProgress=approach(state.dockProgress,state.mode==='explore'&&!state.cutaway&&!state.docked?1:0,dt*(state.slow?.25:1),4);}
   if(state.mode==='explode'&&state.auto){state.explodeTarget=clamp(state.explodeTarget+autoDirection*dt*.16);if(state.explodeTarget===0||state.explodeTarget===1)autoDirection*=-1;}
   // Restore the prior layout first; teaching and exploded offsets never coexist.
   const wantsTeaching=state.mode==='principle'||(state.mode==='explore'&&state.cutaway);
   if(wantsTeaching){state.explode=approach(state.explode,0,dt);state.cover=approach(state.cover,state.explode===0?1:0,dt);}
   else{state.cover=approach(state.cover,0,dt);state.explode=approach(state.explode,state.mode==='explode'&&state.cover===0?state.explodeTarget:0,dt);}
   displayGap=approach(displayGap,state.mode==='principle'?WIRELESS_SPEC.displayGapExtra*state.cover:0,dt);
   state.transition=state.mode==='principle'&&(state.explode!==0||state.cover!==1||displayGap!==WIRELESS_SPEC.displayGapExtra||state.dockProgress!==0);sample();
   if(state.mode==='principle'&&!state.transition&&state.playing){const t=dt*(state.slow?.25:1);state.time+=t;if(state.charging)state.soc=clamp(state.soc+t*state.receivedW*.018,0,100);
    if(state.lessonAuto){state.lessonTime+=t;if(state.lessonTime>=9){state.lesson=(state.lesson+1)%LESSONS.length;state.lessonTime=0;}}
   }pose();
  },dispose(){dead=true;}
 };pose();return api;
}
