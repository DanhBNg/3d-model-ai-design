import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createThermalStudio(host){
 const scene=new T.Scene();scene.background=new T.Color('#17262e');
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Nhà máy nhiệt điện 3D: kéo để xoay, cuộn hoặc chụm để thu phóng');
 const camera=new T.PerspectiveCamera(37,1,.05,250);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=90;controls.maxPolarAngle=Math.PI*.49;
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.05);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xdcf5ff,0x566a73,1.3));
 const key=new T.DirectionalLight(0xffeedb,3);key.position.set(-10,18,-12);key.target.position.set(0,1,0);scene.add(key,key.target);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-14,right:14,top:12,bottom:-12,near:1,far:55});key.shadow.bias=-.0003;key.shadow.normalBias=.025;
 const rim=new T.DirectionalLight(0x8bc8ed,2);rim.position.set(10,15,12);scene.add(rim);
 let desired=null,current='hero',first=true,disposed=false;
 function view(id='hero'){
  current=id;const portrait=Math.max(1,1.12/camera.aspect);
  const configs={hero:[[0,2,0],[-.55,.48,-1],29*portrait],machine:[[1.7,1.8,-1.3],[-.27,.37,-1],15*portrait],boiler:[[-5,3,0],[-.65,.3,-1],15*portrait],cooling:[[5,2,3.7],[.8,.4,1],14*portrait],rear:[[0,2,1],[.55,.5,1],29*portrait],explode:[[.3,2.3,-.5],[-.45,.5,-1],31*portrait]};
  const [target,direction,distance]=configs[id]||configs.hero;desired={target:new T.Vector3(...target),direction:new T.Vector3(...direction).normalize(),distance};
 }
 const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height||disposed)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);view(current);if(first){controls.target.copy(desired.target);camera.position.copy(desired.direction).multiplyScalar(desired.distance).add(desired.target);desired=null;first=false;}});resize.observe(host);
 const onStart=()=>{desired=null;};controls.addEventListener('start',onStart);
 return {scene,camera,controls,renderer,view,
  focus(node){if(!node)return;const box=new T.Box3().setFromObject(node);if(box.isEmpty())return;desired={target:box.getCenter(new T.Vector3()),direction:camera.position.clone().sub(controls.target).normalize(),distance:Math.max(3,box.getSize(new T.Vector3()).length()*1.6*Math.max(1,.9/camera.aspect))};},
  update(dt){if(disposed)return;if(desired){const k=1-Math.exp(-dt*4),offset=camera.position.clone().sub(controls.target);controls.target.lerp(desired.target,k);offset.lerp(desired.direction.clone().multiplyScalar(desired.distance),k);camera.position.copy(controls.target).add(offset);if(controls.target.distanceTo(desired.target)<.002&&Math.abs(offset.length()-desired.distance)<.02)desired=null;}controls.update();renderer.render(scene,camera);},
  dispose(){if(disposed)return;disposed=true;resize.disconnect();controls.removeEventListener('start',onStart);controls.dispose();env.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
