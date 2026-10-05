import {Group,Vector3} from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
export function createStroke(points,{color,width=2.4,opacity=1,depthTest=false,order=5}={}){
 const geometry=new LineSegmentsGeometry();geometry.setPositions(points);
 const group=new Group();
 for(const [c,w,o,layer] of [['#14262e',width+2.2,.85,order],[color,width,opacity,order+1]]){
  const material=new LineMaterial({color:c,linewidth:w,transparent:true,opacity:o,depthTest,depthWrite:false,toneMapped:false});
  const line=new LineSegments2(geometry,material);line.frustumCulled=false;line.renderOrder=layer;group.add(line);
 }
 return {group,set(points){const a=geometry.attributes.instanceStart,b=geometry.attributes.instanceEnd;for(let i=0;i<points.length/6;i++){a.setXYZ(i,...points.subarray(i*6,i*6+3));b.setXYZ(i,...points.subarray(i*6+3,i*6+6));}a.data.needsUpdate=true;},dispose(){group.removeFromParent();geometry.dispose();group.children.forEach(o=>o.material.dispose());}};
}
// Open arrowheads follow the path tangent; no solid cones or particles.
export function createFlowLines(curve,{color='#ffcf76',count=5,size=.09,speed=.16,track=true,depthTest=false,opacity=1}={}){
 const group=new Group();
 const strokes=[];
 if(track){const points=curve.getPoints(100),segments=[];for(let i=1;i<points.length;i++)segments.push(...points[i-1].toArray(),...points[i].toArray());const stroke=createStroke(segments,{color,width:2,depthTest,order:4});strokes.push(stroke);group.add(stroke.group);}
 const data=new Float32Array(count*18),stroke=createStroke(data,{color,width:2.8,opacity:Math.max(.95,opacity),depthTest,order:6});strokes.push(stroke);group.add(stroke.group);
 const positions={setXYZ(i,x,y,z){data[i*3]=x;data[i*3+1]=y;data[i*3+2]=z;}};
 size*=2.5;
 const p=new Vector3(),t=new Vector3(),side=new Vector3(),back=new Vector3(),a=new Vector3(),ref=new Vector3();
 return {group,update(time){
  for(let i=0;i<count;i++){
   const u=((time*speed+i/count)%1+1)%1;curve.getPointAt(u,p);curve.getTangentAt(u,t).normalize();
   ref.set(0,Math.abs(t.y)>.9?0:1,Math.abs(t.y)>.9?1:0);side.crossVectors(t,ref).normalize();back.copy(p).addScaledVector(t,-size);
   a.copy(p).addScaledVector(t,-size*2.5);positions.setXYZ(i*6,a.x,a.y,a.z);positions.setXYZ(i*6+1,p.x,p.y,p.z);
   a.copy(back).addScaledVector(side,size*.45);positions.setXYZ(i*6+2,a.x,a.y,a.z);positions.setXYZ(i*6+3,p.x,p.y,p.z);
   a.copy(back).addScaledVector(side,-size*.45);positions.setXYZ(i*6+4,a.x,a.y,a.z);positions.setXYZ(i*6+5,p.x,p.y,p.z);
  }stroke.set(data);
 },dispose(){group.removeFromParent();strokes.forEach(s=>s.dispose());}};
}
