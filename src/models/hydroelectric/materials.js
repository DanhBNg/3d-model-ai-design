import { DoubleSide } from 'three';
export function configureHydroMaterials(scene){
 const originals=new Set(),copies=new Map(),saved=new Map();
 scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  const ms=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{
   originals.add(m);const key=`${o.userData.partId}:${m.uuid}`;
   if(!copies.has(key)){const c=m.clone();c.side=DoubleSide;c.envMapIntensity=.7;copies.set(key,c);saved.set(c,{color:c.emissive.clone(),intensity:c.emissiveIntensity});}return copies.get(key);
  });o.material=Array.isArray(o.material)?ms:ms[0];
 });originals.forEach(m=>m.dispose());
 return {highlight(meshes=[]){for(const [m,s]of saved){m.emissive.copy(s.color);m.emissiveIntensity=s.intensity;}for(const o of meshes)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.emissive.set('#e3a354');m.emissiveIntensity=.28;}},clear(){saved.clear();copies.clear();}};
}
