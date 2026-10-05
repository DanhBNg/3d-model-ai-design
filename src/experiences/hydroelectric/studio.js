import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createHydroStudio(host){
 const scene=new T.Scene();scene.background=new T.Color('#202a30');
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Nhà máy thủy điện 3D — kéo xoay, cuộn hoặc chụm để thu phóng');
 const camera=new T.PerspectiveCamera(36,1,.05,180);camera.position.set(12,10,-17);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,1.8,0);controls.minDistance=3;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.49;
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.05);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xdbf4ff,0x62614b,1.3));
 const key=new T.DirectionalLight(0xffead1,3.3);key.position.set(-4,14,-8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:35});key.shadow.bias=-.0003;key.shadow.normalBias=.025;scene.add(key);
 const fill=new T.DirectionalLight(0xc3e7ff,1.1);fill.position.set(5,5,7);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.23}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.42;floor.receiveShadow=true;scene.add(floor);
 let desired=null,mode='explore',first=true;
 function framing(){const portrait=Math.max(1,1.25/camera.aspect);return (mode==='explode'?25:22)*portrait;}
 function fit(){desired={target:new T.Vector3(0,mode==='explode'?3:1.7,0),distance:framing()};}
 const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);if(first){camera.position.sub(controls.target).setLength(framing()).add(controls.target);first=false;}else fit();});resize.observe(host);
 controls.addEventListener('start',()=>desired=null);
 return {scene,renderer,camera,controls,setMode(value){mode=value;fit();},fit,
  focus(node){const box=new T.Box3().setFromObject(node),size=box.getSize(new T.Vector3());desired={target:box.getCenter(new T.Vector3()),distance:Math.max(3,size.length()*1.8*Math.max(1,1/camera.aspect))};},
  view(id){const points={hero:[12,10,-17],top:[0,22,-.1],rear:[-12,10,17],machine:[5,4.5,-6],section:[0,3,-22]};const target=id==='machine'?new T.Vector3(1.6,2,0):new T.Vector3(0,1.7,0);const offset=new T.Vector3(...(points[id]||points.hero)).sub(target);desired={target,distance:id==='machine'?8:framing(),direction:offset.normalize()};},
  update(dt){if(desired){const s=1-Math.exp(-dt*5),offset=camera.position.clone().sub(controls.target),direction=desired.direction||offset.clone().normalize();controls.target.lerp(desired.target,s);offset.lerp(direction.clone().multiplyScalar(desired.distance),s);camera.position.copy(controls.target).add(offset);if(controls.target.distanceTo(desired.target)<.001&&Math.abs(offset.length()-desired.distance)<.01)desired=null;}controls.update();renderer.render(scene,camera);},
  dispose(){resize.disconnect();controls.dispose();env.dispose();floor.geometry.dispose();floor.material.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
