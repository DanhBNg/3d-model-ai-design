import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadDroneModel } from '../src/models/drone/loadModel.js';
const controllerModule=await import('../src/models/drone/controller.js').catch(()=>({}));
const flightModule=await import('../src/models/drone/flight.js').catch(()=>({}));
async function setup(){
 assert.equal(typeof controllerModule.createDroneController,'function','controller must exist');
 const data=await readFile(new URL('../public/models/drone.glb',import.meta.url));
 const root=await loadDroneModel({buffer:data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)});
 return {root,r:root.userData.sculptRuntime,c:controllerModule.createDroneController(root)};
}
const step=(c,secs)=>{for(let i=0;i<secs*60;i++)c.update(1/60)};
test('physical mixer signs: hover balances; forward, roll and reaction yaw match pose',()=>{
 assert.equal(typeof flightModule.mixThrust,'function','mixer must exist');
 const {mixThrust,moments}=flightModule;
 const h=moments(mixThrust(.3,0,0,0));for(const a of ['pitch','roll','yaw'])assert.ok(Math.abs(h[a])<1e-10);
 for(const [pitch,roll,yaw,key,sign] of [[-.05,0,0,'pitch',-1],[.05,0,0,'pitch',1],[0,-.05,0,'roll',-1],[0,.05,0,'roll',1],[0,0,-.05,'yaw',-1],[0,0,.05,'yaw',1]]){
   assert.equal(Math.sign(moments(mixThrust(.3,pitch,roll,yaw))[key]),sign);
 }
});
test('explode is reversible, clamped, no transform drift and placement preserved',async()=>{
 const {root,r,c}=await setup();root.position.set(2,3,4);
 const rest=r.nodes.battery.position.clone();
 for(let n=0;n<12;n++){c.setMode('explode');c.setExplode(1);step(c,3);c.setExplode(0);step(c,3);}
 assert.ok(r.nodes.battery.position.distanceTo(rest)<1e-8);
 c.setExplode(999);step(c,3);assert.equal(c.state.explode,1);
 c.reset();assert.ok(r.nodes.battery.position.distanceTo(rest)<1e-8);assert.deepEqual(root.position.toArray(),[2,3,4]);
 c.dispose();r.dispose();
});
test('flight assembles before motion and restores previous exploded state on exit',async()=>{
 const {r,c}=await setup();c.setMode('explode');c.setExplode(.8);step(c,3);c.setMode('flight');
 for(let i=0;i<120;i++){c.update(1/60);if(c.state.explode>.001)assert.ok(r.nodes.flightRoot.position.length()<1e-9);}
 step(c,5);assert.equal(c.state.explode,0);assert.ok(r.nodes.flightRoot.position.y>.05);
 c.setMode('explode');step(c,5);assert.ok(Math.abs(c.state.explode-.8)<1e-8);assert.equal(r.nodes.flightRoot.position.length(),0);
 c.dispose();r.dispose();
});
test('pause, slow motion, unknown actions and reset have explicit behavior',async()=>{
 const {r,c}=await setup();assert.equal(c.play('unknown'),false);c.setMode('flight');step(c,4);
 c.setPlaying(false);const t=c.state.time,rot=r.pivots.prop_fl.rotation.y;step(c,2);
 assert.equal(c.state.time,t);assert.equal(r.pivots.prop_fl.rotation.y,rot);
 c.setSpeed(.25);c.setPlaying(true);step(c,4);assert.ok(Math.abs(c.state.time-t-1)<1e-8);
 c.reset();assert.equal(c.state.time,0);assert.equal(r.pivots.prop_fl.rotation.y,0);assert.equal(r.nodes.flightRoot.position.length(),0);
 c.dispose();r.dispose();
});
test('isolation and covers persist across flight without hiding other parts',async()=>{
 const {r,c}=await setup();c.setCoversHidden(true);c.isolate('battery');assert.equal(r.nodes.frame.visible,false);
 c.setMode('flight');step(c,3);assert.equal(r.nodes.frame.visible,true);assert.equal(r.nodes.shell_upper.visible,true);
 c.setMode('explore');step(c,3);assert.equal(r.nodes.frame.visible,false);assert.equal(r.nodes.battery.visible,true);
 c.isolate(null);assert.equal(r.nodes.frame.visible,true);assert.equal(r.nodes.shell_upper.visible,false);
 c.dispose();r.dispose();
});
