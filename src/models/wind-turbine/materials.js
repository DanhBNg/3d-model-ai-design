import {DoubleSide} from 'three';
export function configureMaterials(scene){
 const originals=new Set(),copies=new Map(),saved=new Map();
 scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{
   originals.add(m);const key=`${o.userData.partId}:${m.uuid}`;
   if(!copies.has(key)){const c=m.clone();c.side=DoubleSide;c.envMapIntensity=.8;copies.set(key,c);saved.set(c,c.emissive.clone());}return copies.get(key);
  });o.material=Array.isArray(o.material)?mats:mats[0];
 });originals.forEach(m=>m.dispose());
 return {highlight(meshes=[]){for(const [m,color]of saved){m.emissive.copy(color);m.emissiveIntensity=1;}for(const o of meshes)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.emissive.set('#44c7c0');m.emissiveIntensity=.35;}},clear(){saved.clear();copies.clear();}};
}
