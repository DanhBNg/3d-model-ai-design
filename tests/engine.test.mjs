import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial,Object3D,Vector3} from 'three';
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const advance=(c,n=900)=>{for(let i=0;i<n;i++)c.update(1/60);};
test('analytic crank keeps exact rod length and piston stroke through 720 degrees',async()=>{
 const {sampleEngine,ENGINE_SPEC:s}=await import('../src/models/inline-four-engine/simulation.js');
 for(let a=0;a<=720;a++){const q=sampleEngine(a);near(q.camAngle,a/2);for(const c of q.cylinders){near(Math.hypot(c.pinY-c.crankY,c.crankZ),s.rodLength);assert.ok(c.pinY>=.183-1e-9&&c.pinY<=.247+1e-9);}}
 near(sampleEngine(0).cylinders[0].pinY,.247);near(sampleEngine(180).cylinders[0].pinY,.183);assert.equal(sampleEngine(720).angle,720);assert.deepEqual(sampleEngine(0).cylinders,sampleEngine(720).cylinders);
});
test('ideal valve timing and power order use one four stroke angle',async()=>{
 const {sampleEngine}=await import('../src/models/inline-four-engine/simulation.js');
 assert.deepEqual([360,540,0,180].map(a=>sampleEngine(a).cylinders.find(c=>c.localAngle===360).index),[1,3,4,2]);
 for(let a=0;a<720;a++){for(const c of sampleEngine(a).cylinders){assert.ok(c.intakeLift>=0&&c.intakeLift<=.006);assert.ok(c.exhaustLift>=0&&c.exhaustLift<=.006);if(c.phase!=='intake')assert.equal(c.intakeLift,0);if(c.phase!=='exhaust')assert.equal(c.exhaustLift,0);}}
 near(sampleEngine(90).cylinders[0].intakeLift,.006);near(sampleEngine(630).cylinders[0].exhaustLift,.006);
});
test('cam profile and moving belt agree with the crank clock',async()=>{
 const {sampleEngine,camRadius,sampleBelt,BELT_LENGTH}=await import('../src/models/inline-four-engine/simulation.js');
 for(let a=0;a<720;a+=3){for(const c of sampleEngine(a).cylinders){near(camRadius(Math.PI-a*Math.PI/360,c.index)-.023,c.intakeLift);near(camRadius(Math.PI-a*Math.PI/360,c.index,'exhaust')-.023,c.exhaustLift);}}
 const p=sampleBelt(0),q=sampleBelt(BELT_LENGTH);near(p.y,q.y);near(p.z,q.z);
 for(let d=0;d<BELT_LENGTH;d+=.0005){const p=sampleBelt(d),q=sampleBelt(d+.000001);near(Math.hypot(q.y-p.y,q.z-p.z),.000001,1e-9);for(const [y,z,r]of [[.1,0,.019],[.35,-.04,.038],[.35,.04,.038]])assert.ok(Math.hypot(p.y-y,p.z-z)>=r-1e-8);}
});
async function fixture(asset=false){
 const {PARTS,PIVOT_IDS,PIVOT_PART}=await import('../src/models/inline-four-engine/metadata.js');
 const {createEngineRuntime,loadEngineModel}=await import('../src/models/inline-four-engine/loadModel.js');
 const {createEngineController}=await import('../src/models/inline-four-engine/controller.js');let root;
 if(asset){const b=await readFile('public/models/inline-four-engine.glb');root=await loadEngineModel({buffer:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)});}
 else{const scene=new Group();for(const p of PARTS){const g=new Group();g.name=p.id;g.add(new Mesh(new BoxGeometry(.001,.001,.001),new MeshStandardMaterial()));scene.add(g);}for(const id of PIVOT_IDS){const o=new Object3D();o.name=id;scene.getObjectByName(PIVOT_PART[id]).add(o);}root=createEngineRuntime(scene);}
 return {root,r:root.userData.sculptRuntime,c:createEngineController(root)};
}
test('engine controls preserve placement, phase, pause and independent instances',async()=>{
 const a=await fixture(),b=await fixture();a.root.position.set(4,2,1);a.c.setAngle(720);a.c.setCylinder(2);assert.equal(a.c.state.angle,720);assert.equal(a.c.state.sample.cylinders.length,4);a.c.setPlaying(false);advance(a.c);assert.equal(a.c.state.angle,720);assert.ok(a.r.meshes.piston_1.every(m=>!m.visible));assert.ok(b.r.meshes.piston_1.every(m=>m.visible));
 a.c.setCylinder(0);a.c.setAngle(0);a.c.setPlaying(true);a.c.setSlow(true);advance(a.c,60);near(a.c.state.angle,11.25);a.c.setRPM(2400);advance(a.c,60);near(a.c.state.angle,56.25);a.c.setMode('explode');a.c.setExplode(1);advance(a.c);assert.equal(a.c.state.explode,1);a.c.setMode('principle');a.c.update(1/60);assert.ok(a.c.state.transition);assert.equal(a.c.state.cover,0);advance(a.c);assert.equal(a.c.state.explode,0);assert.equal(a.c.state.cover,1);
 a.c.reset();assert.deepEqual(a.root.position.toArray(),[4,2,1]);for(const q of Object.values(a.r.assemblies))assert.deepEqual(q.node.position.toArray(),q.restPosition.toArray());assert.notEqual(a.r.meshes.piston_1[0].material,b.r.meshes.piston_1[0].material);let count=0;a.r.meshes.piston_1[0].geometry.addEventListener('dispose',()=>count++);a.r.dispose();a.r.dispose();assert.equal(count,1);a.c.dispose();b.c.dispose();b.r.dispose();
});
test('exploded and reassembling mechanisms hold crank phase',async()=>{
 const a=await fixture();a.c.setAngle(120);a.c.setMode('explode');a.c.setExplode(1);advance(a.c);assert.equal(a.c.state.angle,120);a.c.setMode('principle');a.c.update(1/60);assert.equal(a.c.state.angle,120);a.c.dispose();a.r.dispose();
});
test('actual engine GLB validates pivots, contact positions, budget and abort lifecycle',async()=>{
 const {loadEngineModel}=await import('../src/models/inline-four-engine/loadModel.js');
 await assert.rejects(loadEngineModel({signal:AbortSignal.abort()}),{name:'AbortError'});
 const a=await fixture(true),b=await fixture(true);assert.equal(Object.keys(a.r.nodes).length,37);assert.ok(a.r.stats.triangles<180000);assert.ok(a.r.stats.assetBytes<8000000);assert.notEqual(a.r.meshes.piston_1[0].material,b.r.meshes.piston_1[0].material);
 a.c.setPlaying(false);
 for(let angle=0;angle<=720;angle+=15){a.c.setAngle(angle);a.root.updateMatrixWorld(true);for(const c of a.c.state.sample.cylinders){const i=c.index,pin=a.r.pivots[`piston_${i}_slide`].getWorldPosition(new Vector3()),rodEnd=a.r.pivots[`rod_${i}_pose`].localToWorld(new Vector3(0,.115,0));assert.ok(pin.distanceTo(rodEnd)<1e-6);near(a.r.pivots[`intake_${i}_slide`].getWorldPosition(new Vector3()).y,.280-c.intakeLift,1e-6);}}
 a.c.setCutaway(true);advance(a.c);for(let i=1;i<=4;i++)assert.equal(a.root.getObjectByName(`cylinder_${i}_front_shell`).visible,false);
 a.c.reset();assert.equal(a.c.state.angle,0);a.c.dispose();b.c.dispose();a.r.dispose();b.r.dispose();
});
