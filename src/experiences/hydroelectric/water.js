import {createFlowLines} from '../../viewer/flowLines.js';
import * as T from 'three';
import hydraulics from '../../models/hydroelectric/hydraulics.json';

// Same elliptical sections and tangent frames as Blender's hydraulics.duct.
export function waterVolumeGeometry(sections){
 const positions=[],uv=[],indices=[],N=32;let length=0;
 for(let i=0;i<sections.length;i++){
  const [x,y,z,h,w]=sections[i],a=sections[Math.max(0,i-1)],b=sections[Math.min(sections.length-1,i+1)];
  const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);
  if(i)length+=Math.hypot(x-sections[i-1][0],y-sections[i-1][1]);
  for(let j=0;j<=N;j++){const angle=j/N*Math.PI*2;positions.push(x-dy/l*h*.94*Math.cos(angle),y+dx/l*h*.94*Math.cos(angle),z+w*.94*Math.sin(angle));uv.push(length,j/N);}
  if(i)for(let j=0;j<N;j++){const k=(i-1)*(N+1)+j;indices.push(k,k+1,k+N+2,k,k+N+2,k+N+1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

function waterMaterial(surface=false){
 const clock={value:0},motion={value:0};
 const m=new T.MeshPhysicalMaterial({color:surface?'#087f91':'#159db6',metalness:.18,roughness:.23,transparent:!surface,opacity:surface?1:.55,depthWrite:surface,side:T.DoubleSide,clearcoat:.8,clearcoatRoughness:.18});
 m.onBeforeCompile=shader=>{
  shader.uniforms.hydroTime=clock;shader.uniforms.hydroMotion=motion;
  shader.vertexShader='varying vec2 hydroUV;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nhydroUV=uv;');
  shader.fragmentShader='uniform float hydroTime;uniform float hydroMotion;varying vec2 hydroUV;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float ripples=sin(hydroUV.x*${surface?'64.0':'15.0'}-hydroTime*2.5+sin(hydroUV.y*31.0+hydroTime)*0.65);
   float flecks=smoothstep(0.84,1.0,ripples)*${surface?'0.08':'0.20'};
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.44,0.91,0.94),flecks*hydroMotion);
  `);
 };
 m.customProgramCacheKey=()=>surface?'hydro-surface-v1':'hydro-volume-v1';
 return {material:m,clock,motion};
}

export function createHydroWater(scene){
 const group=new T.Group();group.name='Hydraulic water visualization';scene.add(group);
 const internal=new T.Group();group.add(internal);const materials=[];
 const fluid=waterMaterial();materials.push(fluid);
 for(const sections of [hydraulics.intake,hydraulics.draft])internal.add(new T.Mesh(waterVolumeGeometry(sections),fluid.material));
 // Flow around the volute converges into the runner, then down the draft tube.
 const spiral=[];for(let i=0;i<=64;i++){const t=i/64,a=Math.PI-t*Math.PI*1.8,r=.89*(1-t)+.10;spiral.push(new T.Vector3(1.6+r*Math.cos(a),1.25-.17*t,r*Math.sin(a)));}
 const spiralCurve=new T.CatmullRomCurve3(spiral);internal.add(new T.Mesh(new T.TubeGeometry(spiralCurve,80,.16,12,false),fluid.material));
 const surfaces=[];
 for(const spec of [hydraulics.reservoir,hydraulics.tailwater]){
  const material=waterMaterial(true);materials.push(material);
  const geometry=new T.PlaneGeometry(...spec.size,40,28);geometry.rotateX(-Math.PI/2);
  const base=geometry.attributes.position.array.slice();const mesh=new T.Mesh(geometry,material.material);mesh.position.set(...spec.center);group.add(mesh);surfaces.push({mesh,base});
 }
 const trailCurves=[new T.CatmullRomCurve3(hydraulics.intake.map(s=>new T.Vector3(...s.slice(0,3)))),spiralCurve,new T.CatmullRomCurve3(hydraulics.draft.map(s=>new T.Vector3(...s.slice(0,3))))];
 const trails=trailCurves.map(curve=>createFlowLines(curve,{color:'#24d9f2',count:3,size:.065,speed:.20,track:false,opacity:.65}));
 for(const t of trails)internal.add(t.group);
 const discharge=createFlowLines(new T.LineCurve3(new T.Vector3(4.05,.62,0),new T.Vector3(5.7,.62,0)),{color:'#24d9f2',count:3,size:.075,speed:.19,track:false,depthTest:true,opacity:.6});
 const foam=discharge.group;group.add(foam); // Compatibility visibility handle, now line arrows.
 return {group,internal,surfaces,foam,update(s){
  group.visible=!s.isolated;
  internal.visible=s.coverOpen>.98&&s.explode<.001&&s.mode!=='explode'&&!s.transition;
  const strength=Math.min(1,s.flow/10),active=s.mode==='principle'&&!s.transition&&s.flow>.005;
  fluid.clock.value=s.flowTime;fluid.motion.value=active?strength:0;
  for(let k=0;k<surfaces.length;k++){
   const {mesh,base}=surfaces[k],pos=mesh.geometry.attributes.position;
   materials[k+1].clock.value=s.waterTime;materials[k+1].motion.value=k===0?.6:.3+strength*.7;
   for(let i=0;i<pos.count;i++){const x=base[i*3],z=base[i*3+2];pos.setY(i,.009*Math.sin(x*6+s.waterTime*1.4)*Math.cos(z*7-s.waterTime));}pos.needsUpdate=true;mesh.geometry.computeVertexNormals();
  }
  for(const t of trails){t.group.visible=active;t.update(s.flowTime);}
  foam.visible=active&&s.explode<.001;
  discharge.update(s.flowTime);
 },dispose(){scene.remove(group);const geometries=new Set(),mats=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)mats.add(o.material);if(o.isInstancedMesh)o.dispose();});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}};
}
