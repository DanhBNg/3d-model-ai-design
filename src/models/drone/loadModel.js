import { Group, Object3D, Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PARTS, MOTOR_LAYOUT, SCENARIOS } from './metadata.js';
import { configureMaterials } from './materials.js';

export async function loadDroneModel({url='/models/drone.glb',buffer,signal}={}){
 if(!buffer){const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Không tải được model (${response.status})`);buffer=await response.arrayBuffer();}
 if(signal?.aborted)throw new DOMException('Load cancelled','AbortError');
 const gltf=await new GLTFLoader().parseAsync(buffer,'');
 if(signal?.aborted){disposeScene(gltf.scene);throw new DOMException('Load cancelled','AbortError');}
 try{return createDroneRuntime(gltf.scene,{assetBytes:buffer.byteLength,url});}
 catch(e){disposeScene(gltf.scene);throw e;}
}
function disposeScene(scene){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
export function createDroneRuntime(scene,{assetBytes=0,url=''}={}){
 const root=new Group();root.name='aero_q4';
 const flightRoot=new Group();flightRoot.name='flightRoot';root.add(flightRoot);flightRoot.add(scene);
 const nodes={flightRoot},meshes={},pivots={},sockets={},assemblies={};
 const lookup={};scene.traverse(o=>{lookup[o.name]=o});
 for(const p of PARTS){
  const node=lookup[p.id];if(!node)throw new Error(`Thiếu cụm trong GLB: ${p.id}`);
  nodes[p.id]=node;meshes[p.id]=[];
  node.traverse(o=>{if(o.isMesh){o.userData.partId=p.id;meshes[p.id].push(o);}});
  const socket=new Object3D();socket.name=p.id+'_inspect';socket.position.fromArray(p.anchor);node.add(socket);sockets[p.id]=socket;
  assemblies[p.id]={node,parent:node.parent,restPosition:node.position.clone(),restQuaternion:node.quaternion.clone(),restScale:node.scale.clone(),offset:new Vector3().fromArray(p.offset),stage:p.stage};
 }
 for(const m of MOTOR_LAYOUT){pivots['rotor_'+m.id]=lookup['rotor_'+m.id];pivots['prop_'+m.id]=nodes['prop_'+m.id];if(!pivots['rotor_'+m.id])throw new Error('Thiếu rotor pivot');}
 for(const [alias,name] of [['gimbalYaw','gimbal_yaw'],['gimbalRoll','gimbal_roll'],['gimbalPitch','gimbal_pitch']]){pivots[alias]=lookup[name];if(!pivots[alias])throw new Error('Thiếu gimbal pivot');}
 const box=new Box3().setFromObject(root);
 let triangles=0,drawCalls=0;scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;drawCalls++;}});
 const materials=configureMaterials(scene);let disposed=false;
 root.userData.sculptRuntime={schemaVersion:1,id:'aero_q4',coordinates:{unit:'meter',up:'+Y',forward:'-Z',origin:'ground_center'},nodes,meshes,pivots,sockets,assemblies,colliders:{},
  animations:Object.fromEntries(['explode',...Object.keys(SCENARIOS)].map(id=>[id,{kind:'procedural',loop:id==='explode',duration:null,ends:'controller stop/reset; flight maneuvers settle into hold'}])),
  bounds:{space:'model-local',pose:'rest',min:box.min.toArray(),max:box.max.toArray()},
  stats:{triangles,drawCalls,assetBytes,textures:0},
  provenance:{route:'imported-static',sources:[{path:url||'public/models/drone.glb',format:'glb',author:'Original AERO Q4 project',generation:'blender/drone/build.py'}],modifications:['Named rigid-body pivots animated by controller'],limitations:['Concept educational geometry; no flight certification','No aerodynamic or structural solver']},
  highlight:id=>materials.highlight(meshes[id]||[]),
  dispose(){if(disposed)return;disposed=true;materials.clear();disposeScene(scene);}
 };
 return root;
}
