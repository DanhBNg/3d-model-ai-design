import {PARTS,PART_BY_ID,COVER_IDS} from './metadata.js';
import {clamp,sampleEngine,ENGINE_SPEC,sampleBelt,BELT_LENGTH} from './simulation.js';
const approach=(a,b,dt)=>Math.abs(a-b)<.0001?b:a+(b-a)*(1-Math.exp(-dt*6));
export function createEngineController(root){
 const r=root.userData.sculptRuntime;
 const defaults=()=>({mode:'explore',angle:0,rpm:600,playing:true,slow:false,time:0,selected:null,isolated:false,cutaway:false,cover:0,explode:0,explodeTarget:0,auto:false,focusCylinder:0,transition:false,sample:sampleEngine(0)});
 const state=defaults();let dead=false,saved=.8,autoDirection=1;
 const optional={};root.traverse(o=>{optional[o.name]=o;});
 const beltMarkers=Object.values(optional).filter(o=>/^belt_marker_\d+$/.test(o.name)).sort((a,b)=>Number(a.name.split('_').at(-1))-Number(b.name.split('_').at(-1)));
 const markerX=beltMarkers.map(o=>o.position.x);
 function pose(){
  state.sample=sampleEngine(state.angle);
  const open=state.cover>.98||state.focusCylinder!==0;
  for(const p of PARTS){const a=r.assemblies[p.id],node=a.node;node.position.copy(a.restPosition).addScaledVector(a.offset,state.explode);node.quaternion.copy(a.restQuaternion);node.scale.copy(a.restScale);
   const match=p.id.match(/_(\d)$/),other=state.focusCylinder&&match&&Number(match[1])!==state.focusCylinder;
   const hiddenCover=open&&(COVER_IDS.includes(p.id)||p.id==='intake_manifold'||p.id==='exhaust_manifold');
   for(const mesh of r.meshes[p.id])mesh.visible=state.isolated?p.id===state.selected:!other&&!hiddenCover;
  }
  for(let i=1;i<=4;i++){const front=optional[`cylinder_${i}_front_shell`];if(front)front.visible=!open||state.isolated;}
  if(optional.head_front_shell)optional.head_front_shell.visible=!open||state.isolated;
  const rad=state.angle*Math.PI/180;
  for(const id of ['crank_spin','flywheel_spin']){r.pivots[id].position.set(0,.1,0);r.pivots[id].rotation.set(rad,0,0);}
  for(const [id,z]of [['cam_intake_spin',-.04],['cam_exhaust_spin',.04]]){r.pivots[id].position.set(0,.35,z);r.pivots[id].rotation.set(rad/2,0,0);}
  for(const c of state.sample.cylinders){const i=c.index,x=ENGINE_SPEC.cylinderX[i-1];r.pivots[`piston_${i}_slide`].position.set(x,c.pinY,0);r.pivots[`rod_${i}_pose`].position.set(x,c.crankY,c.crankZ);r.pivots[`rod_${i}_pose`].rotation.set(c.rodAngle,0,0);
   for(const [kind,z,lift]of [['intake',-.021,c.intakeLift],['exhaust',.021,c.exhaustLift]]){r.pivots[`${kind}_${i}_slide`].position.set(x,.280-lift,z);const spring=optional[`${kind}_${i}_spring`];if(spring)spring.scale.y=(.022-lift)/.022;}
  }
  beltMarkers.forEach((o,i)=>{const p=sampleBelt(i*BELT_LENGTH/beltMarkers.length+rad*.019);o.position.set(markerX[i],p.y,p.z);o.rotation.set(p.angle,0,0);});
 }
 const api={state,
  setMode(mode){if(!['explore','explode','principle'].includes(mode))return false;if(state.mode==='explode')saved=state.explodeTarget;state.mode=mode;state.auto=false;state.isolated=false;state.explodeTarget=mode==='explode'?saved:0;state.transition=mode==='principle'&&(state.explode!==0||state.cover!==1);pose();return true;},
  select(id){if(id!==null&&!PART_BY_ID[id])return false;state.selected=id;if(id===null)state.isolated=false;r.highlight(id);pose();return true;},
  setIsolated(v){state.isolated=!!v&&!!state.selected;pose();},setCutaway(v){state.cutaway=!!v;},
  setExplode(v){state.explodeTarget=clamp(v);state.auto=false;},toggleAuto(){state.auto=!state.auto;autoDirection=state.explode>.5?-1:1;},
  setPlaying(v){state.playing=!!v;},setSlow(v){state.slow=!!v;},setRPM(v){state.rpm=clamp(v,600,2400,600);},
  setAngle(v){state.angle=clamp(v,0,720);pose();},
  setCylinder(v){const n=Number(v);if(!Number.isInteger(n)||n<0||n>4)return false;state.focusCylinder=n;state.isolated=false;pose();return true;},
  reset(){Object.assign(state,defaults());saved=.8;autoDirection=1;r.highlight(null);pose();},
  update(dt){if(dead||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);
   if(state.mode==='explode'&&state.auto){state.explodeTarget=clamp(state.explodeTarget+autoDirection*dt*.16);if(state.explodeTarget===0||state.explodeTarget===1)autoDirection*=-1;}
   const wantsOpen=state.mode==='principle'||(state.mode==='explore'&&state.cutaway);
   if(wantsOpen){state.explode=approach(state.explode,0,dt);state.cover=approach(state.cover,state.explode===0?1:0,dt);}
   else{state.cover=approach(state.cover,0,dt);state.explode=approach(state.explode,state.mode==='explode'&&state.cover===0?state.explodeTarget:0,dt);}
   state.transition=state.mode==='principle'&&(state.explode!==0||state.cover!==1);
   if(state.playing&&state.mode!=='explode'&&!state.transition&&state.explode===0){const t=dt*(state.slow?.25:1);state.time+=t;state.angle=(state.angle+t*45*state.rpm/600)%720;}pose();
  },dispose(){dead=true;}
 };pose();return api;
}
