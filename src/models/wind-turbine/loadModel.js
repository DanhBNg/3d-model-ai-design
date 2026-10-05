import {Group,Object3D,Box3,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PARTS,PIVOT_IDS} from './metadata.js';
import {configureMaterials} from './materials.js';
function disposeScene(scene){const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])ms.add(m);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());}
export async function loadWindModel({url,buffer,signal}={}){
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 if(!buffer){const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Không tải được tua-bin (${response.status})`);buffer=await response.arrayBuffer();}
 const {scene}=await new GLTFLoader().parseAsync(buffer,'');
 if(signal?.aborted){disposeScene(scene);throw new DOMException('Cancelled','AbortError');}
 try{return createWindRuntime(scene,{assetBytes:buffer.byteLength,url});}catch(e){disposeScene(scene);throw e;}
}
export function createWindRuntime(scene,{assetBytes=0,url=''}={}){
 const root=new Group();root.name='wind-turbine';root.add(scene);
 const nodes={},meshes={},assemblies={},pivots={},sockets={},lookup={};scene.traverse(o=>lookup[o.name]=o);
 for(const p of PARTS){const node=lookup[p.id.startsWith('blade_')?p.id.replace('blade_','blade_mount_'):p.id];if(!node)throw new Error(`Thiếu cụm ${p.id}`);nodes[p.id]=node;meshes[p.id]=[];
  node.traverse(o=>{if(o.isMesh){o.userData.partId=p.id;meshes[p.id].push(o);}});
  const socket=new Object3D();node.add(socket);sockets[p.id]=socket;
  assemblies[p.id]={node,parent:node.parent,restPosition:node.position.clone(),restQuaternion:node.quaternion.clone(),restScale:node.scale.clone(),offset:new Vector3(...p.offset)};
 }
 for(const id of PIVOT_IDS){if(!lookup[id])throw new Error(`Thiếu pivot ${id}`);pivots[id]=lookup[id];}
 let triangles=0,drawCalls=0;scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;drawCalls++;}});
 const materials=configureMaterials(scene),box=new Box3().setFromObject(root);let dead=false;
 root.userData.sculptRuntime={schemaVersion:1,id:'wind-turbine',nodes,meshes,assemblies,pivots,sockets,colliders:{},
 coordinates:{unit:'meter',up:'+Y',forward:'-X',origin:'tower_base',scaleNote:'Inferred educational dimensions, not a specific turbine'},
 animations:{explode:{kind:'procedural',duration:null},generate:{kind:'procedural',duration:null}},bounds:{space:'model-local',pose:'rest',min:box.min.toArray(),max:box.max.toArray()},
 stats:{triangles,drawCalls,assetBytes,textures:0},provenance:{route:'imported-static',sources:[{path:url||'public/models/wind-turbine.glb',generation:'blender/wind-turbine/build.py',format:'glb',author:'Original project'}],limitations:['Inferred dimensions','Illustrative gearbox 6:1','No CFD']},
 highlight:id=>materials.highlight(meshes[id]||[]),dispose(){if(dead)return;dead=true;materials.clear();disposeScene(scene);}};
 return root;
}
