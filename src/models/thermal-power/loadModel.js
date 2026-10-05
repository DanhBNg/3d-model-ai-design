import {Group,Object3D,Box3,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PARTS,PIVOT_IDS} from './metadata.js';
import {configureMaterials} from './materials.js';
function disposeScene(scene){const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());}
export async function loadThermalModel({url,buffer,signal}={}){
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 if(!buffer){const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Không tải được nhà máy nhiệt điện (${response.status})`);buffer=await response.arrayBuffer();}
 const {scene}=await new GLTFLoader().parseAsync(buffer,'');
 if(signal?.aborted){disposeScene(scene);throw new DOMException('Cancelled','AbortError');}
 try{return createThermalRuntime(scene,{assetBytes:buffer.byteLength,url});}catch(e){disposeScene(scene);throw e;}
}
export function createThermalRuntime(scene,{assetBytes=0,url=''}={}){
 const root=new Group();root.name='thermal-power';root.add(scene);
 const nodes={},meshes={},assemblies={},pivots={},sockets={},lookup={};scene.traverse(o=>lookup[o.name]=o);
 for(const p of PARTS){const node=lookup[p.id];if(!node)throw new Error(`Thiếu cụm ${p.id}`);nodes[p.id]=node;meshes[p.id]=[];
  node.traverse(o=>{if(o.isMesh){o.userData.partId=p.id;meshes[p.id].push(o);}});
  const socket=new Object3D();socket.name=p.id+'_label';socket.position.fromArray(p.anchor);node.add(socket);sockets[p.id]=socket;
  assemblies[p.id]={node,parent:node.parent,restPosition:node.position.clone(),restQuaternion:node.quaternion.clone(),restScale:node.scale.clone(),offset:new Vector3(...p.offset)};
 }
 for(const id of PIVOT_IDS){if(!lookup[id])throw new Error(`Thiếu pivot ${id}`);pivots[id]=lookup[id];}
 let triangles=0,drawCalls=0;scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;drawCalls++;}});
 const materials=configureMaterials(scene),box=new Box3().setFromObject(root);let dead=false;
 root.userData.sculptRuntime={schemaVersion:1,id:'thermal-power',nodes,meshes,assemblies,pivots,sockets,colliders:{},
 coordinates:{unit:'meter',up:'+Y',forward:'-Z',origin:'site_center',scaleNote:'Educational compressed site, inferred dimensions'},
 animations:{explode:{kind:'procedural',duration:null},generate:{kind:'procedural',duration:null}},bounds:{space:'model-local',pose:'rest',min:box.min.toArray(),max:box.max.toArray()},
 stats:{triangles,drawCalls,assetBytes,textures:0},provenance:{route:'imported-static',sources:[{path:url||'public/models/thermal-power.glb',generation:'blender/thermal-power/build.py',format:'glb',author:'Original project'}],limitations:['Inferred dimensions','Simplified reheat cycle','No CFD or steam tables','No engineering qualification']},
 highlight:id=>materials.highlight(meshes[id]||[]),dispose(){if(dead)return;dead=true;materials.clear();disposeScene(scene);}};
 return root;
}
