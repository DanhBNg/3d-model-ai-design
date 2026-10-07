import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial,Object3D,Vector3} from 'three';
const advance=(c,n=900)=>{for(let i=0;i<n;i++)c.update(1/60);};
async function fixture(asset=false){
 const {PARTS}=await import('../src/models/wireless-charging/metadata.js');
 const {createWirelessRuntime,loadWirelessModel}=await import('../src/models/wireless-charging/loadModel.js');
 const {createWirelessController}=await import('../src/models/wireless-charging/controller.js');
 let root;
 if(asset){const b=await readFile('public/models/wireless-charging.glb');root=await loadWirelessModel({buffer:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)});}
 else{const scene=new Group();for(const p of PARTS){const node=new Group();node.name=p.id;node.add(new Mesh(new BoxGeometry(.001,.001,.001),new MeshStandardMaterial()));scene.add(node);}for(const [id,part,y]of [['tx_center','tx_coil',.007],['rx_center','rx_coil',.013]]){const s=new Object3D();s.name=id;s.position.y=y;scene.getObjectByName(part).add(s);}root=createWirelessRuntime(scene);}
 return {root,r:root.userData.sculptRuntime,c:createWirelessController(root)};
}
test('wireless coupling decreases with absolute offset and physical gap; power stays bounded',async()=>{
 const {sampleWireless}=await import('../src/models/wireless-charging/simulation.js');
 for(let gap=2;gap<=18;gap++){let previous=1;for(let alignment=0;alignment<=35;alignment++){const a=sampleWireless({alignment,gap,powered:true});assert.ok(a.coupling<=previous);previous=a.coupling;assert.ok(a.receivedW<=a.inputW);assert.deepEqual(a,sampleWireless({alignment:-alignment,gap,powered:true}));}}
 for(let alignment=0;alignment<=35;alignment++){let previous=1;for(let gap=2;gap<=18;gap++){const a=sampleWireless({alignment,gap});assert.ok(a.coupling<=previous);previous=a.coupling;}}
 assert.equal(sampleWireless({powered:false}).receivedW,0);assert.equal(sampleWireless({powered:false}).inputW,0);
 for(const v of [NaN,Infinity,-Infinity,1e10,-1e10]){const a=sampleWireless({alignment:v,gap:v});for(const key of ['coupling','inputW','receivedW'])assert.ok(Number.isFinite(a[key]));assert.ok(a.coupling>=0&&a.coupling<=1);}
});
test('wireless phone movement is coherent and reset preserves host placement',async()=>{
 const {root,r,c}=await fixture();root.position.set(4,2,1);c.setAlignment(20);c.setGap(12);c.update(1/60);
 for(const id of ['phone_back','rx_coil','rx_ferrite','battery','phone_board','phone_frame','screen']){assert.ok(Math.abs(r.nodes[id].position.x-.02)<1e-8);assert.ok(Math.abs(r.nodes[id].position.y-.006)<1e-8);}
 c.reset();assert.deepEqual(root.position.toArray(),[4,2,1]);for(const a of Object.values(r.assemblies))assert.deepEqual(a.node.position.toArray(),a.restPosition.toArray());c.dispose();r.dispose();
});
test('physical gap cannot push the phone through the pad',async()=>{
 const {c,r}=await fixture();c.setGap(2);assert.equal(c.state.gap,6);assert.equal(r.nodes.phone_back.position.y,0);const {sampleWireless}=await import('../src/models/wireless-charging/simulation.js');assert.deepEqual(sampleWireless({gap:2}),sampleWireless({gap:6}));c.dispose();r.dispose();
});
test('wireless reassembles before teaching cutaway; pause and slow preserve clocks',async()=>{
 const {r,c}=await fixture();c.setMode('explode');c.setExplode(1);advance(c);assert.equal(c.state.explode,1);assert.equal(c.state.inputW,0);
 c.setMode('principle');c.update(1/60);assert.ok(c.state.transition);assert.equal(c.state.receivedW,0);assert.equal(c.state.cover,0);
 advance(c);assert.equal(c.state.explode,0);assert.equal(c.state.cover,1);assert.ok(c.state.receivedW>0);
 const tx=r.sockets.tx_center.getWorldPosition(new Vector3()),rx=r.sockets.rx_center.getWorldPosition(new Vector3());assert.ok(Math.abs(rx.y-tx.y-.02)<1e-7);
 for(const id of ['phone_back','phone_frame','screen','pad_cover'])assert.ok(r.meshes[id].every(m=>!m.visible));
 c.setPlaying(false);const before=[c.state.time,c.state.soc];advance(c);assert.deepEqual([c.state.time,c.state.soc],before);c.setPlaying(true);c.setSlow(true);const t=c.state.time;advance(c,60);assert.ok(Math.abs(c.state.time-t-.25)<1e-8);
 c.setMode('explore');advance(c);assert.equal(c.state.cover,0);assert.ok(c.state.receivedW>0);c.reset();assert.equal(c.select('invalid'),false);assert.equal(c.setLesson(9),false);assert.equal(c.setFlowFilter('bad'),false);c.dispose();r.dispose();
});
test('wireless isolation and disposal do not affect another instance',async()=>{
 const a=await fixture(),b=await fixture();a.c.select('tx_coil');a.c.setIsolated(true);assert.equal(a.r.meshes.battery[0].visible,false);assert.equal(b.r.meshes.battery[0].visible,true);assert.notEqual(a.r.meshes.tx_coil[0].material,b.r.meshes.tx_coil[0].material);let count=0;a.r.meshes.tx_coil[0].geometry.addEventListener('dispose',()=>count++);a.r.dispose();a.r.dispose();assert.equal(count,1);a.c.dispose();b.c.dispose();b.r.dispose();
});
test('ordinary cutaway does not exaggerate the physical coil distance',async()=>{
 const {r,c}=await fixture();c.setCutaway(true);advance(c);const tx=r.sockets.tx_center.getWorldPosition(new Vector3()),rx=r.sockets.rx_center.getWorldPosition(new Vector3());assert.ok(Math.abs(rx.y-tx.y-.006)<1e-7);c.dispose();r.dispose();
});
test('leaving principle preserves current coil pose before smooth reassembly',async()=>{
 const {r,c}=await fixture();c.setMode('principle');advance(c);
 const before=r.sockets.rx_center.getWorldPosition(new Vector3());c.setMode('explore');
 assert.ok(r.sockets.rx_center.getWorldPosition(new Vector3()).distanceTo(before)<1e-9);
 c.update(1/60);assert.ok(r.sockets.rx_center.getWorldPosition(new Vector3()).distanceTo(before)<.002);
 advance(c);assert.ok(Math.abs(r.sockets.rx_center.getWorldPosition(new Vector3()).y-.013)<1e-7);c.dispose();r.dispose();
});
test('lifting phone stops charge immediately; placing charges only after landing and pauses smoothly',async()=>{
 const {r,c}=await fixture();advance(c);assert.ok(c.state.charging);c.setDocked(false);assert.equal(c.state.charging,false);advance(c);assert.equal(c.state.dockProgress,1);
 c.setDocked(true);c.update(1/60);assert.equal(c.state.charging,false);c.setPlaying(false);const y=r.nodes.screen.position.y;advance(c);assert.equal(r.nodes.screen.position.y,y);
 c.setPlaying(true);advance(c);assert.equal(c.state.dockProgress,0);assert.ok(c.state.charging);c.setMode('explode');advance(c);assert.equal(c.state.charging,false);c.dispose();r.dispose();
});
test('wireless actual GLB meets runtime contract and abort lifecycle',async()=>{
 const a=await fixture(true),b=await fixture(true);assert.equal(Object.keys(a.r.nodes).length,14);assert.ok(a.r.stats.triangles<100000);assert.ok(a.r.stats.assetBytes<5000000);assert.notEqual(a.r.meshes.tx_coil[0].material,b.r.meshes.tx_coil[0].material);
 for(const [id,y]of [['tx_center',.007],['rx_center',.013]])assert.ok(Math.abs(a.r.sockets[id].getWorldPosition(new Vector3()).y-y)<1e-6);
 a.c.setMode('explode');a.c.setExplode(1);advance(a.c);a.c.reset();for(const q of Object.values(a.r.assemblies))assert.deepEqual(q.node.position.toArray(),q.restPosition.toArray());
 const {loadWirelessModel}=await import('../src/models/wireless-charging/loadModel.js');await assert.rejects(loadWirelessModel({signal:AbortSignal.abort()}),{name:'AbortError'});a.c.dispose();b.c.dispose();a.r.dispose();b.r.dispose();
});
