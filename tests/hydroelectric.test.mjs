import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Vector3 } from 'three';
test('hydro power follows rho*g*Q*H*eta and synchronous rpm stays fixed under load',async()=>{
 const {sampleHydro}=await import('../src/models/hydroelectric/simulation.js');
 const a=sampleHydro({opening:.5,head:50,connected:true}),b=sampleHydro({opening:1,head:50,connected:true});
 assert.equal(a.flow,6);assert.ok(Math.abs(a.powerMW-2.58984)<1e-8);assert.equal(b.powerMW,a.powerMW*2);assert.equal(a.rpm,300);assert.equal(b.rpm,300);
 assert.equal(sampleHydro({opening:1,head:50,connected:false}).powerMW,0);
 assert.equal(sampleHydro({opening:0,head:50,connected:true}).flow,0);
});
async function fixture(){
 const {loadHydroelectricModel}=await import('../src/models/hydroelectric/loadModel.js');
 const {createHydroController}=await import('../src/models/hydroelectric/controller.js');
 const d=await readFile('public/models/hydroelectric.glb');const root=await loadHydroelectricModel({buffer:d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)});
 return {root,r:root.userData.sculptRuntime,c:createHydroController(root)};
}
const advance=(c,n=300)=>{for(let i=0;i<n;i++)c.update(1/60)};
test('water phases follow flow, pause and reset without motion at a closed wicket gate',async()=>{
 const {r,c}=await fixture();c.setMode('principle');advance(c,700);assert.ok(c.state.flowTime>0);
 c.setPlaying(false);const before=[c.state.waterTime,c.state.flowTime];advance(c);assert.deepEqual([c.state.waterTime,c.state.flowTime],before);
 c.setPlaying(true);c.setOpening(0);advance(c,800);const stopped=c.state.flowTime;advance(c);assert.equal(c.state.flowTime,stopped);
 c.reset();assert.equal(c.state.flowTime,0);assert.equal(c.state.waterTime,0);c.dispose();r.dispose();
});
test('hydro factory has independent parts, coaxial pivots, bounded asset and idempotent disposal',async()=>{
 const a=await fixture(),b=await fixture();assert.equal(Object.keys(a.r.assemblies).length,22);
 for(const id of ['runner','shaft','generator_rotor']){const p=a.r.nodes[id].getWorldPosition(new Vector3());assert.ok(Math.abs(p.x-1.6)<1e-5);assert.ok(Math.abs(p.z)<1e-5);}
 assert.ok(a.r.stats.triangles<180000);assert.ok(a.r.stats.assetBytes<8000000);
 assert.notEqual(a.r.meshes.runner[0].material,b.r.meshes.runner[0].material);
 let disposed=0;a.r.meshes.runner[0].geometry.addEventListener('dispose',()=>disposed++);a.r.dispose();a.r.dispose();assert.equal(disposed,1);b.r.dispose();
});
test('hydro controller assembles before generation and preserves rest transforms and placement',async()=>{
 const {root,r,c}=await fixture();root.position.set(4,2,1);c.setMode('explode');c.setExplode(1);advance(c);
 assert.equal(c.state.explode,1);c.setMode('principle');c.update(1/60);assert.equal(c.state.powerMW,0);assert.ok(c.state.transition);
 advance(c,700);assert.equal(c.state.explode,0);assert.ok(c.state.powerMW>0);
 const t=c.state.time;c.setPlaying(false);advance(c);assert.equal(c.state.time,t);
 c.setPlaying(true);c.setConnected(false);advance(c,800);assert.equal(c.state.powerMW,0);assert.ok(c.state.opening<.001);
 c.reset();advance(c);assert.deepEqual(root.position.toArray(),[4,2,1]);
 for(const a of Object.values(r.assemblies))assert.ok(a.node.position.distanceTo(a.restPosition)<1e-7);
 assert.equal(c.setMode('unknown'),false);c.dispose();r.dispose();
});
test('rotor lifts clear before stator translates, and vanes stay still until later extraction',async()=>{
 const {r,c}=await fixture();c.setMode('explode');c.setExplode(.49);advance(c,600);
 assert.ok(r.nodes.generator_rotor.position.y>4.9);
 assert.ok(r.nodes.generator_stator.position.distanceTo(r.assemblies.generator_stator.restPosition)<1e-7);
 assert.ok(r.nodes.runner.position.distanceTo(r.assemblies.runner.restPosition)<1e-7);
 c.setExplode(1);advance(c,600);c.setExplode(0);advance(c,600);
 for(const [id,a]of Object.entries(r.assemblies))if(id!=='roof')assert.ok(a.node.position.distanceTo(a.restPosition)<1e-7);
 c.dispose();r.dispose();
});
