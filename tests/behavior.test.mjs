import test from 'node:test';import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Vector3,Quaternion } from 'three';
import { loadDroneModel } from '../src/models/drone/loadModel.js';
import { createDroneController } from '../src/models/drone/controller.js';
import { sampleFlight } from '../src/models/drone/flight.js';
import { MOTOR_LAYOUT } from '../src/models/drone/metadata.js';
async function fixture(){const d=await readFile('public/models/drone.glb');const root=await loadDroneModel({buffer:d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)});return {root,r:root.userData.sculptRuntime,c:createDroneController(root)}}
const step=(c,t)=>{for(let i=0;i<t*60;i++)c.update(1/60)};
test('all flight scenarios have correct motion direction, braking and stable finite hold',()=>{
 for(const [id,axis,sign]of [['forward',2,-1],['backward',2,1],['left',0,-1],['right',0,1]]){
  const a=sampleFlight(id,3),b=sampleFlight(id,7),end=sampleFlight(id,10);
  assert.equal(Math.sign(a.position[axis]),sign);assert.equal(Math.sign(end.position[axis]),sign);
  const angle=axis===2?0:2;assert.ok(a.rotation[angle]*b.rotation[angle]<0,'bank reverses during braking');
  assert.ok(Math.abs(end.rotation[angle])<1e-8);assert.deepEqual(end,sampleFlight(id,100));
 }
 for(const id of ['takeoff','hover','yaw_left','yaw_right'])for(let t=0;t<20;t+=.05){const p=sampleFlight(id,t);assert.ok([...p.position,...p.rotation,...p.speeds,...p.thrust].every(Number.isFinite));assert.ok(p.thrust.every(v=>v>0&&v<1));}
 assert.ok(sampleFlight('yaw_left',10).rotation[1]>0);assert.ok(sampleFlight('yaw_right',10).rotation[1]<0);
});
test('selecting one part does not tint another part or another instance',async()=>{
 const a=await fixture(),b=await fixture();const target=a.r.meshes.shell_upper.find(o=>o.material.name.includes('Ceramic')),other=a.r.meshes.shell_lower.find(o=>o.material.name.includes('Ceramic'));
 const before=other.material.emissive.clone();a.c.select('shell_upper');assert.ok(other.material.emissive.equals(before));assert.ok(!target.material.emissive.equals(before));
 assert.notEqual(target.material,b.r.meshes.shell_upper[0].material);a.r.dispose();b.r.dispose();
});
test('scenario transitions preserve altitude; reset preserves selection and application placement',async()=>{
 const {root,r,c}=await fixture();c.setMode('flight');step(c,4);const altitude=r.nodes.flightRoot.position.y;c.play('forward');step(c,.6);assert.ok(r.nodes.flightRoot.position.y>=altitude-1e-6);
 root.rotation.y=.7;c.select('gimbal');c.reset();assert.equal(c.state.selected,'gimbal');assert.equal(root.rotation.y,.7);assert.ok(c.play('explode'));c.dispose();r.dispose();
});
test('sockets follow assemblies; motor and prop pivots stay coaxial; phase pairs oppose',async()=>{
 const {root,r,c}=await fixture();c.setMode('explode');c.setExplode(1);step(c,3);root.updateMatrixWorld(true);
 const anchor=r.sockets.battery.getWorldPosition(new Vector3()),offset=r.assemblies.battery.offset;
 assert.ok(anchor.y>.28);c.reset();c.setMode('flight');step(c,3);assert.ok(r.pivots.prop_fl.rotation.y<0);assert.ok(r.pivots.prop_fr.rotation.y>0);
 for(const m of MOTOR_LAYOUT){const a=r.pivots['prop_'+m.id].getWorldPosition(new Vector3()),b=r.pivots['rotor_'+m.id].getWorldPosition(new Vector3());assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<1e-7);}
 c.dispose();r.dispose();
});
test('invalid GLB and aborted load reject with clear errors',async()=>{
 await assert.rejects(loadDroneModel({buffer:new ArrayBuffer(32)}));const a=new AbortController();a.abort();await assert.rejects(loadDroneModel({buffer:new ArrayBuffer(32),signal:a.signal}),{name:'AbortError'});
});
test('rapid flight re-entry blends from current pose instead of teleporting',async()=>{
 const {r,c}=await fixture();c.setMode('flight');c.play('forward');step(c,7);c.setMode('explore');c.update(1/60);
 const before=r.nodes.flightRoot.position.clone();c.setMode('flight');c.update(1/60);
 assert.ok(r.nodes.flightRoot.position.distanceTo(before)<.01);c.dispose();r.dispose();
});
