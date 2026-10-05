import { Color } from 'three';
export function configureMaterials(scene){
 const saved=new Map(),copies=new Map(),originals=new Set();
 scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  const source=Array.isArray(o.material)?o.material:[o.material];
  const assigned=source.map(m=>{originals.add(m);const key=o.userData.partId+':'+m.uuid;if(!copies.has(key))copies.set(key,m.clone());return copies.get(key);});
  o.material=Array.isArray(o.material)?assigned:assigned[0];
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   m.envMapIntensity=.85;
   if(!saved.has(m))saved.set(m,{emissive:m.emissive?.clone(),intensity:m.emissiveIntensity});
  }
 });
 originals.forEach(m=>m.dispose());
 return { highlight(meshes=[]){
   for(const [m,s] of saved){if(s.emissive)m.emissive.copy(s.emissive);m.emissiveIntensity=s.intensity;}
   for(const o of meshes)for(const m of Array.isArray(o.material)?o.material:[o.material]){
    if(m.emissive){m.emissive.copy(new Color('#ed7c32'));m.emissiveIntensity=.3;}
   }
 },clear(){saved.clear()}};
}
