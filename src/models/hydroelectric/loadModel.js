import { Group, Object3D, Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PARTS } from './metadata.js';
import { configureHydroMaterials } from './materials.js';
function disposeScene(scene){const g=new Set(),m=new Set(),t=new Set();scene.traverse(o=>{if(o.geometry)g.add(o.geometry);for(const mat of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){m.add(mat);for(const v of Object.values(mat))if(v?.isTexture)t.add(v);}});g.forEach(v=>v.dispose());m.forEach(v=>v.dispose());t.forEach(v=>v.dispose());}
export async function loadHydroelectricModel({url,buffer,signal}={}){
 if(signal?.aborted)throw new DOMException('Load cancelled','AbortError');
 if(!buffer){const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Không tải được nhà máy (${response.status})`);buffer=await response.arrayBuffer();}
 const gltf=await new GLTFLoader().parseAsync(buffer,'');
 if(signal?.aborted){disposeScene(gltf.scene);throw new DOMException('Load cancelled','AbortError');}
 try{return createHydroRuntime(gltf.scene,{assetBytes:buffer.byteLength,url});}catch(e){disposeScene(gltf.scene);throw e;}
}
export function createHydroRuntime(scene,{assetBytes=0,url=''}={}){
 const root=new Group();root.name='hydroelectric';root.add(scene);
 const nodes={},meshes={},assemblies={},sockets={},lookup={};scene.traverse(o=>lookup[o.name]=o);
 for(const p of PARTS){const node=lookup[p.id];if(!node)throw new Error(`Thiếu cụm: ${p.id}`);nodes[p.id]=node;meshes[p.id]=[];
  node.traverse(o=>{if(o.isMesh){o.userData.partId=p.id;meshes[p.id].push(o);}});
  const socket=new Object3D();socket.position.fromArray(p.anchor);node.add(socket);sockets[p.id]=socket;
  assemblies[p.id]={node,restPosition:node.position.clone(),restQuaternion:node.quaternion.clone(),restScale:node.scale.clone(),offset:new Vector3().fromArray(p.offset)};
 }
 const pivots={};for(const id of ['runner_spin','shaft_spin','rotor_spin',...Array.from({length:16},(_,i)=>`guide_${String(i).padStart(2,'0')}`)]){if(!lookup[id])throw new Error(`Thiếu pivot: ${id}`);pivots[id]=lookup[id];}
 let triangles=0,drawCalls=0;scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;drawCalls++;}});
 const materials=configureHydroMaterials(scene),box=new Box3().setFromObject(root);let disposed=false;
 root.userData.sculptRuntime={schemaVersion:1,id:'hydroelectric',coordinates:{unit:'meter',up:'+Y',forward:'-Z',origin:'diorama_base_center',scaleNote:'compressed educational layout; not an engineering scale model'},nodes,meshes,assemblies,sockets,pivots,colliders:{},animations:{explode:{kind:'procedural',duration:null},generate:{kind:'procedural',duration:null}},bounds:{space:'model-local',pose:'rest',min:box.min.toArray(),max:box.max.toArray()},stats:{triangles,drawCalls,assetBytes,textures:0},provenance:{route:'imported-static',sources:[{path:url||'public/models/hydroelectric.glb',generation:'blender/hydroelectric/build.py',format:'glb',author:'Original project'}],limitations:['Educational proportions','Cut sections in machinery','No CFD or structural qualification']},highlight:id=>materials.highlight(meshes[id]||[]),dispose(){if(disposed)return;disposed=true;materials.clear();disposeScene(scene);}};
 return root;
}
