import {DoubleSide} from 'three';
export function configureMaterials(scene){
 const originals=new Set(),copies=new Map(),saved=new Map();
 scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{
   originals.add(m);const key=`${o.userData.partId}:${m.uuid}`;
   if(!copies.has(key)){const copy=m.clone();copy.side=DoubleSide;copy.envMapIntensity=.22;copies.set(key,copy);saved.set(copy,{emissive:copy.emissive?.clone(),intensity:copy.emissiveIntensity});}return copies.get(key);
  });o.material=Array.isArray(o.material)?materials:materials[0];
 });originals.forEach(m=>m.dispose());
 return {highlight(meshes=[]){for(const [m,s]of saved){if(s.emissive)m.emissive.copy(s.emissive);m.emissiveIntensity=s.intensity;}for(const mesh of meshes)for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])if(m.emissive){m.emissive.set('#39c7c1');m.emissiveIntensity=.35;}},clear(){copies.clear();saved.clear();}};
}
