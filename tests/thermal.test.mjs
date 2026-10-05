import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Vector3} from 'three';
async function fixture(){const {loadThermalModel}=await import('../src/models/thermal-power/loadModel.js');const {createThermalController}=await import('../src/models/thermal-power/controller.js');const d=await readFile('public/models/thermal-power.glb');const root=await loadThermalModel({buffer:d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)});return {root,r:root.userData.sculptRuntime,c:createThermalController(root)};}
const advance=(c,n=900)=>{for(let i=0;i<n;i++)c.update(1/60);};
test('thermal GLB pivots align on real shaft and independent runtimes dispose once',async()=>{
 const a=await fixture(),b=await fixture();assert.equal(Object.keys(a.r.nodes).length,26);
 for(const id of ['hp_spin','lp_spin','generator_spin']){const p=a.r.pivots[id].getWorldPosition(new Vector3());assert.ok(Math.abs(p.y-2.1)<1e-4);assert.ok(Math.abs(p.z+1.3)<1e-4);}
 assert.ok(a.r.stats.triangles<180000);assert.ok(a.r.stats.assetBytes<8000000);assert.notEqual(a.r.meshes.site[0].material,b.r.meshes.site[0].material);
 let n=0;a.r.meshes.site[0].geometry.addEventListener('dispose',()=>n++);a.r.dispose();a.r.dispose();assert.equal(n,1);b.r.dispose();
});
test('thermal controller reassembles before running, pauses, resets and retains app placement',async()=>{
 const {root,r,c}=await fixture();root.position.set(4,2,1);c.setMode('explode');c.setExplode(1);advance(c);assert.equal(c.state.explode,1);
 c.setMode('principle');c.update(1/60);assert.ok(c.state.transition);assert.equal(c.state.powerMW,0);
 advance(c,1800);assert.equal(c.state.explode,0);assert.ok(c.state.powerMW>60);assert.ok(Math.abs(c.state.rpm-3000)<1);
 c.setPlaying(false);const before=[c.state.angle,c.state.pumpAngle,c.state.time,c.state.warmup];advance(c);assert.deepEqual([c.state.angle,c.state.pumpAngle,c.state.time,c.state.warmup],before);
 c.setMode('explode');advance(c);assert.equal(c.state.explode,1);c.reset();for(const a of Object.values(r.assemblies))assert.ok(a.node.position.distanceTo(a.restPosition)<1e-7);assert.deepEqual(root.position.toArray(),[4,2,1]);c.dispose();r.dispose();
});
test('explosion zero restores every assembly; roof opens before caps and extraction follows shaft',async()=>{
 const {r,c}=await fixture();c.setMode('explode');c.setExplode(.03);advance(c);
 assert.ok(r.nodes.hall_shell.position.y>0);assert.equal(r.nodes.turbine_hp_shell.position.y,0);
 c.setExplode(1);advance(c);assert.equal(r.nodes.turbine_hp_rotor.position.z,0);assert.notEqual(r.nodes.turbine_hp_rotor.position.x,0);
 const socket=r.sockets.turbine_hp_rotor.getWorldPosition(new Vector3());assert.ok(Math.abs(socket.x-(-1.8+r.nodes.turbine_hp_rotor.position.x))<1e-5);
 c.setExplode(0);advance(c,1500);for(const a of Object.values(r.assemblies))assert.ok(a.node.position.distanceTo(a.restPosition)<1e-7,a.node.name);
 for(let i=0;i<3;i++){c.setMode('principle');advance(c);c.setMode('explore');c.setCutaway(false);advance(c);}
 c.select('generator_rotor');c.setIsolated(true);assert.ok(r.meshes.site.every(m=>!m.visible));c.setIsolated(false);assert.ok(r.meshes.site.every(m=>m.visible));
 c.dispose();r.dispose();
});
test('large slider jumps and mode exit keep caps clear before rotor lift',async()=>{
 const {r,c}=await fixture();c.setMode('explode');c.setExplode(1);
 const clearance=()=>{for(const type of ['hp','lp'])assert.ok(r.nodes[`turbine_${type}_shell`].position.y>=r.nodes[`turbine_${type}_rotor`].position.y,`${type} cap must clear rotor`);};
 for(let i=0;i<300;i++){c.update(1/60);clearance();}
 c.setMode('explore');for(let i=0;i<300;i++){c.update(1/60);clearance();}
 c.dispose();r.dispose();
});
test('cooling loss stops heat and generation, lessons and flow filters validate IDs',async()=>{
 const {r,c}=await fixture();c.setMode('principle');advance(c,1200);c.setCooling(false);c.update(1/60);assert.equal(c.state.powerMW,0);assert.equal(c.state.steamFlow,0);assert.equal(c.state.heatMW,0);
 assert.equal(c.setLesson(50),false);assert.equal(c.setFlowFilter('bad'),false);assert.equal(c.setFlowFilter('cooling'),true);assert.equal(c.select('bad'),false);
 c.reset();c.setMode('principle');advance(c);c.setSlow(true);const a=c.state.time;advance(c,60);assert.ok(Math.abs(c.state.time-a-.25)<1e-7);c.dispose();r.dispose();
});
test('thermal steady state conserves illustrative heat and holds grid RPM under load',async()=>{
 const {sampleThermal}=await import('../src/models/thermal-power/simulation.js');
 const a=sampleThermal({load:.5,cooling:true,running:true}),b=sampleThermal({load:1,cooling:true,running:true});
 assert.equal(a.powerMW,50);assert.equal(b.powerMW,100);assert.equal(b.steamFlow,a.steamFlow*2);
 assert.equal(a.rpm,3000);assert.equal(b.rpm,3000);assert.ok(Math.abs(b.heatMW-b.powerMW-b.rejectedMW)<1e-8);
});
test('no generation without load, running command or cooling; invalid inputs stay finite',async()=>{
 const {sampleThermal}=await import('../src/models/thermal-power/simulation.js');
 for(const arg of [{load:0,cooling:true,running:true},{load:1,cooling:false,running:true},{load:1,cooling:true,running:false}])assert.equal(sampleThermal(arg).powerMW,0);
 assert.equal(sampleThermal({load:5,cooling:true,running:true}).powerMW,100);
 for(const v of Object.values(sampleThermal({load:NaN,cooling:true,running:true})))assert.ok(Number.isFinite(v));
});
