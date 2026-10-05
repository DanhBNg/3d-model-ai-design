import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleWind } from '../src/models/wind-turbine/simulation.js';
import {readFile} from 'node:fs/promises';
import {Vector3,Raycaster} from 'three';
import {loadWindModel} from '../src/models/wind-turbine/loadModel.js';
import {createWindController} from '../src/models/wind-turbine/controller.js';
async function fixture(){const d=await readFile('public/models/wind-turbine.glb');const root=await loadWindModel({buffer:d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)});return {root,r:root.userData.sculptRuntime,c:createWindController(root)};}
const advance=(c,n=900)=>{for(let i=0;i<n;i++)c.update(1/60);};
test('full rotation envelopes of gearbox gears clear the far wall and sump',async()=>{
 const {root,r,c}=await fixture();root.updateMatrixWorld(true);
 try{
  for(const id of ['input_spin','intermediate_spin','output_spin']){
   const pivot=r.pivots[id],center=pivot.getWorldPosition(new Vector3());let radius=0;
   pivot.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++){const v=new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).sub(center);radius=Math.max(radius,Math.hypot(v.y,v.z));}
   });
   for(const direction of [new Vector3(0,0,1),new Vector3(0,-1,0)]){
    const hit=new Raycaster(center,direction).intersectObject(r.nodes.gearbox_case,true)[0];
    assert.ok(hit,`${id}: housing must exist behind/below gear`);
    assert.ok(hit.distance>radius+.01,`${id}: housing distance ${hit.distance.toFixed(3)} < swept radius ${radius.toFixed(3)} + clearance`);
   }
  }
 }finally{c.dispose();r.dispose();}
});
test('actual GLB has independent runtimes, aligned shafts and tall proportions',async()=>{
 const a=await fixture(),b=await fixture();assert.equal(Object.keys(a.r.nodes).length,20);
 const hub=a.r.pivots.rotor_spin.getWorldPosition(new Vector3());assert.ok(Math.abs(hub.y-35.79)<.001);assert.ok(Math.abs(hub.z)<.001);
 const shaft=a.r.nodes.main_shaft.getWorldPosition(new Vector3());assert.ok(Math.abs(shaft.y-hub.y)<.001);assert.ok(Math.abs(shaft.z-hub.z)<.001);
 assert.ok(a.r.bounds.max[1]>57);assert.ok(a.r.stats.triangles<150000);assert.ok(a.r.stats.assetBytes<6000000);
 assert.notEqual(a.r.meshes.tower[0].material,b.r.meshes.tower[0].material);
 let n=0;a.r.meshes.tower[0].geometry.addEventListener('dispose',()=>n++);a.r.dispose();a.r.dispose();assert.equal(n,1);b.r.dispose();
});
test('operation waits for reassembly; pause freezes all operational clocks and reset restores local poses',async()=>{
 const {root,r,c}=await fixture();root.position.set(1,2,3);c.setMode('explode');c.setExplode(1);advance(c);assert.equal(c.state.explode,1);
 const frozen=c.state.angle;c.setMode('principle');c.update(1/60);assert.ok(c.state.transition);assert.equal(c.state.angle,frozen);
 advance(c);assert.ok(c.state.rpm>0);assert.equal(c.state.explode,0);c.setPlaying(false);
 const before=[c.state.time,c.state.windTime,c.state.angle,c.state.yaw,c.state.pitch];advance(c);assert.deepEqual([c.state.time,c.state.windTime,c.state.angle,c.state.yaw,c.state.pitch],before);
 c.setMode('explode');advance(c);assert.equal(c.state.explode,1);
 c.reset();for(const a of Object.values(r.assemblies))assert.ok(a.node.position.distanceTo(a.restPosition)<1e-7);assert.deepEqual(root.position.toArray(),[1,2,3]);
 assert.equal(c.setMode('bad'),false);assert.equal(c.select('bad'),false);c.dispose();r.dispose();
});
test('yaw follows wind and storm feathers blades then brings rotor to rest',async()=>{
 const {r,c}=await fixture();c.setMode('principle');c.setDirection(Math.PI/2);advance(c,1200);assert.ok(Math.abs(c.state.yaw-Math.PI/2)<.001);
 c.setWind(27);advance(c,1600);assert.ok(c.state.pitch>84);assert.equal(c.state.rpm,0);assert.equal(c.state.power,0);c.dispose();r.dispose();
});
test('wind power is zero below cut-in and at storm cut-out',()=>{
 assert.equal(sampleWind(2,0).power,0);assert.equal(sampleWind(25,0).power,0);
 assert.equal(sampleWind(25,0).rpm,0);assert.equal(sampleWind(25,0).pitch,85);
});
test('wind curve rises to rated and is capped above rated',()=>{
 assert.ok(sampleWind(8,0).power>sampleWind(5,0).power);
 assert.equal(sampleWind(12,0).power,2000);assert.equal(sampleWind(20,0).power,2000);
 assert.ok(sampleWind(20,0).pitch>sampleWind(12,0).pitch);
});
test('misalignment reduces capture, high speed shaft follows six to one gearing',()=>{
 assert.ok(sampleWind(9,Math.PI/3).power<sampleWind(9,0).power);
 assert.equal(sampleWind(9,Math.PI).power,0);
 assert.equal(sampleWind(9,0).generatorRpm,sampleWind(9,0).rpm*6);
});
