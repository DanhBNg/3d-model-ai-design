import { Quaternion, Euler, Vector3 } from 'three';
import { PARTS, PART_BY_ID, MOTOR_LAYOUT, SCENARIOS } from './metadata.js';
import { clamp, smooth, sampleFlight } from './flight.js';

export function createDroneController(root){
 const r=root.userData.sculptRuntime;if(!r||r.id!=='aero_q4')throw new Error('Expected AERO Q4 runtime');
 const flight=r.nodes.flightRoot,identity=new Quaternion();
 const state={mode:'explore',scenario:'hover',playing:true,speed:1,time:0,explode:0,explodeTarget:0,explodeAuto:false,coversHidden:false,isolated:null,selected:null,transition:false,phase:'Sẵn sàng',speeds:[0,0,0,0],thrust:[0,0,0,0],gimbalTilt:0};
 let disposed=false,savedExplode=0,autoDirection=1,scenarioBlend=1,altitudeFloor=0,fromPosition=new Vector3(),fromQuaternion=new Quaternion(),rotorPhase=[0,0,0,0];
 function visibility(){for(const p of PARTS)r.nodes[p.id].visible=state.mode==='flight'||(!state.isolated||state.isolated===p.id)&&!(state.coversHidden&&p.id.startsWith('shell_'));}
 function assemblyPose(){
  for(const a of Object.values(r.assemblies)){
   const progress=smooth((state.explode-a.stage[0])/(a.stage[1]-a.stage[0]));
   a.node.position.copy(a.restPosition).addScaledVector(a.offset,progress);
   a.node.quaternion.copy(a.restQuaternion);a.node.scale.copy(a.restScale);
  }
 }
 function approach(a,b,amount){if(Math.abs(a-b)<amount)return b;return a+Math.sign(b-a)*amount;}
 function restPivots(){for(const m of MOTOR_LAYOUT)r.pivots['rotor_'+m.id].rotation.set(0,0,0);for(const p of ['gimbalYaw','gimbalRoll','gimbalPitch'])r.pivots[p].rotation.set(0,0,0);}
 const api={state,
  setMode(mode){
   if(!['explore','explode','flight'].includes(mode))return false;
   if(mode===state.mode)return true;
   if(mode==='flight'){savedExplode=state.explodeTarget;state.explodeAuto=false;state.time=0;state.playing=true;fromPosition.copy(flight.position);fromQuaternion.copy(flight.quaternion);scenarioBlend=0;altitudeFloor=flight.position.y;state.explodeTarget=0;}
   if(state.mode==='flight'){state.explodeTarget=mode==='explode'?savedExplode:0;state.time=0;}
   if(mode==='explore')state.explodeTarget=0;
   if(mode==='explode'&&state.mode==='explore')state.explodeTarget=savedExplode;
   state.mode=mode;visibility();return true;
  },
  select(id){if(id!==null&&!PART_BY_ID[id])return false;state.selected=id;r.highlight(id);return true;},
  setCoversHidden(v){state.coversHidden=!!v;visibility();},
  isolate(id){if(id!==null&&!PART_BY_ID[id])return false;state.isolated=id;visibility();return true;},
  setExplode(v){if(!Number.isFinite(v)||state.mode==='flight')return false;state.explodeTarget=clamp(v);savedExplode=state.explodeTarget;state.explodeAuto=false;return true;},
  setAuto(v){state.explodeAuto=state.mode==='explode'&&!!v;autoDirection=state.explode>.99?-1:1;},
  setPlaying(v){state.playing=!!v;},
  setSpeed(v){if(!Number.isFinite(v))return false;state.speed=clamp(v,.1,2);return true;},
  setGimbalTilt(v){if(Number.isFinite(v))state.gimbalTilt=clamp(v,-.75,.35);},
  play(id){
   if(id==='explode'){api.setMode('explode');api.setAuto(true);return true;}
   if(!SCENARIOS[id])return false;
   fromPosition.copy(flight.position);fromQuaternion.copy(flight.quaternion);scenarioBlend=0;altitudeFloor=flight.position.y;
   state.scenario=id;state.time=0;state.playing=true;return true;
  },
  reset(){
   state.time=0;state.explode=0;state.explodeTarget=0;state.explodeAuto=false;state.playing=false;state.transition=false;state.phase='Sẵn sàng';state.gimbalTilt=0;
   state.speeds.fill(0);state.thrust.fill(0);savedExplode=0;rotorPhase.fill(0);scenarioBlend=1;altitudeFloor=0;
   flight.position.set(0,0,0);flight.quaternion.identity();assemblyPose();restPivots();visibility();
  },
  update(delta){
   if(disposed||!Number.isFinite(delta)||delta<0)return;
   const dt=Math.min(delta,.05),flightMode=state.mode==='flight';
   let returning=false;
   if(!flightMode){
    flight.position.multiplyScalar(Math.exp(-dt*9));flight.quaternion.slerp(identity,1-Math.exp(-dt*9));
    returning=flight.position.length()>.0001||flight.quaternion.angleTo(identity)>.0001;
    if(!returning){flight.position.set(0,0,0);flight.quaternion.identity();}
    state.speeds.fill(0);state.thrust.fill(0);
   }
   if(state.mode==='explode'&&state.explodeAuto&&!returning){
    state.explodeTarget=clamp(state.explodeTarget+autoDirection*dt*.17);
    if(state.explodeTarget===0||state.explodeTarget===1)autoDirection*=-1;
    savedExplode=state.explodeTarget;
   }
   const target=returning?0:state.explodeTarget;
   state.explode=approach(state.explode,target,dt*.85);assemblyPose();
   state.transition=returning||(flightMode&&state.explode>0);
   if(flightMode&&!state.transition&&state.playing){
    state.time+=dt*state.speed;scenarioBlend=Math.min(1,scenarioBlend+dt*state.speed*1.8);
    const pose=sampleFlight(state.scenario,state.time),blend=smooth(scenarioBlend);
    pose.position[1]=Math.max(altitudeFloor,pose.position[1]);
    flight.position.fromArray(pose.position);flight.quaternion.setFromEuler(new Euler(...pose.rotation,'YXZ'));
    if(blend<1){flight.position.lerpVectors(fromPosition,flight.position,blend);flight.quaternion.slerpQuaternions(fromQuaternion,flight.quaternion,blend);}
    state.speeds=pose.speeds;state.thrust=pose.thrust;state.phase=pose.phase;
    for(let i=0;i<MOTOR_LAYOUT.length;i++)rotorPhase[i]=(rotorPhase[i]+MOTOR_LAYOUT[i].spin*state.speeds[i]*dt*state.speed*12)%(Math.PI*2);
   }
   for(let i=0;i<MOTOR_LAYOUT.length;i++){
    const id=MOTOR_LAYOUT[i].id;r.pivots['rotor_'+id].rotation.y=rotorPhase[i];r.pivots['prop_'+id].rotation.y=rotorPhase[i];
   }
   const euler=new Euler().setFromQuaternion(flight.quaternion,'YXZ');
   r.pivots.gimbalYaw.rotation.y=clamp(-euler.y,-.6,.6);
   r.pivots.gimbalRoll.rotation.z=-euler.z;
   r.pivots.gimbalPitch.rotation.x=-euler.x+state.gimbalTilt;
  },
  dispose(){if(disposed)return;disposed=true;state.playing=false;state.explodeAuto=false;}
 };
 visibility();return api;
}
