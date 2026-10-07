import {Group,Object3D,Box3,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PARTS,PIVOT_IDS} from './metadata.js';
import {configureMaterials} from './materials.js';
function disposeScene(scene){const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());}
export async function loadEngineModel({url,buffer,signal}={}){
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 if(!buffer){const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Cannot load engine (${response.status})`);buffer=await response.arrayBuffer();}
 const {scene}=await new GLTFLoader().parseAsync(buffer,'');
 if(signal?.aborted){disposeScene(scene);throw new DOMException('Cancelled','AbortError');}
 try{return createEngineRuntime(scene,{assetBytes:buffer.byteLength,url});}catch(error){disposeScene(scene);throw error;}
}
export function createEngineRuntime(scene,{assetBytes=0,url=''}={}){
 const lookup={};scene.traverse(o=>lookup[o.name]=o);
 for(const id of [...PARTS.map(p=>p.id),...PIVOT_IDS])if(!lookup[id])throw new Error(`Missing assembly or pivot ${id}`);
 const root=new Group();root.name='inline-four-engine';root.add(scene);
 const nodes={},meshes={},assemblies={},sockets={};
 for(const p of PARTS){const node=lookup[p.id];nodes[p.id]=node;meshes[p.id]=[];node.traverse(o=>{if(o.isMesh){o.userData.partId=p.id;meshes[p.id].push(o);}});
  const label=new Object3D();label.name=p.id+'_label';label.position.fromArray(p.anchor);node.add(label);sockets[p.id]=label;
  assemblies[p.id]={node,parent:node.parent,restPosition:node.position.clone(),restQuaternion:node.quaternion.clone(),restScale:node.scale.clone(),offset:new Vector3(...p.offset)};
 }
 for(const id of PIVOT_IDS)sockets[id]=lookup[id];
 let triangles=0,drawCalls=0;const textures=new Set();scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;drawCalls+=Array.isArray(o.material)?o.geometry.groups.length||o.material.length:1;for(const m of Array.isArray(o.material)?o.material:[o.material])for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
 const materials=configureMaterials(scene),box=new Box3().setFromObject(root);let dead=false;
 root.userData.sculptRuntime={schemaVersion:1,id:'inline-four-engine',nodes,meshes,assemblies,pivots:Object.fromEntries(PIVOT_IDS.map(id=>[id,lookup[id]])),sockets,colliders:{},
  coordinates:{unit:'meter',up:'+Y',forward:'-Z',origin:'crank_axis_y_0.10',scaleNote:'Original generic product; inferred dimensions'},
  animations:{explode:{kind:'procedural',duration:null},cycle:{kind:'procedural',duration:null}},bounds:{space:'model-local',pose:'rest',min:box.min.toArray(),max:box.max.toArray()},
  stats:{triangles,drawCalls,assetBytes,textures:textures.size},provenance:{route:'imported-static',sources:[{path:url||'public/models/inline-four-engine.glb',generation:'blender/inline-four-engine/build.py',format:'glb',author:'Original project'}],limitations:['Inferred educational dimensions','Ideal four stroke timing without overlap','Radial cam and translating bridge follower are simplified','No combustion, fluid or torque solver']},
  highlight:id=>materials.highlight(meshes[id]||[]),dispose(){if(dead)return;dead=true;materials.clear();disposeScene(scene);}};
 return root;
}


