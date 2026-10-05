import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export function createWindStudio(host){
 const scene=new T.Scene();scene.background=new T.Color('#17262e');
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Tua-bin gió 3D: kéo để xoay, cuộn hoặc chụm để thu phóng');
 const camera=new T.PerspectiveCamera(36,1,.05,500);camera.position.set(-35,42,-74);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,35.7,0);controls.minDistance=2;controls.maxDistance=180;controls.maxPolarAngle=Math.PI*.85;
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.05);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xdcf5ff,0x566a73,1.2));
 const key=new T.DirectionalLight(0xffeedb,3);key.position.set(-8,45,-10);key.target.position.set(0,35,0);scene.add(key,key.target);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:45});key.shadow.bias=-.0003;key.shadow.normalBias=.02;
 const rim=new T.DirectionalLight(0x8bc8ed,2);rim.position.set(10,45,15);scene.add(rim);
 const ground=new T.Mesh(new T.CircleGeometry(4,64),new T.MeshStandardMaterial({color:'#29424a',roughness:.85}));ground.rotation.x=-Math.PI/2;ground.position.y=-.01;scene.add(ground);
 let desired=null,current='hero',first=true;
 function view(id='hero'){
  current=id;const mobile=Math.max(1,1.1/camera.aspect);
  const configs={hero:[[0,35.7,0],[-.42,.10,-1],75*mobile],whole:[[0,27,0],[-.45,.12,-1],104*mobile],machine:[[.7,35.9,0],[-.38,.23,-1],10.8*mobile],explode:[[.8,36.4,0],[-.4,.27,-1],17*mobile],rear:[[.7,35.9,0],[.5,.25,1],11*mobile]};
  const [target,direction,distance]=configs[id]||configs.hero;desired={target:new T.Vector3(...target),direction:new T.Vector3(...direction).normalize(),distance};
 }
 const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);view(current);if(first){controls.target.copy(desired.target);camera.position.copy(desired.direction).multiplyScalar(desired.distance).add(desired.target);desired=null;first=false;}});resize.observe(host);
 controls.addEventListener('start',()=>desired=null);
 return {scene,camera,controls,renderer,view,
  focus(node){const b=new T.Box3().setFromObject(node);if(b.isEmpty())return;const size=b.getSize(new T.Vector3());desired={target:b.getCenter(new T.Vector3()),direction:camera.position.clone().sub(controls.target).normalize(),distance:Math.max(2.2,size.length()*1.7*Math.max(1,1/camera.aspect))};},
  update(dt){if(desired){const k=1-Math.exp(-dt*4),offset=camera.position.clone().sub(controls.target);controls.target.lerp(desired.target,k);offset.lerp(desired.direction.clone().multiplyScalar(desired.distance),k);camera.position.copy(controls.target).add(offset);if(controls.target.distanceTo(desired.target)<.002&&Math.abs(offset.length()-desired.distance)<.02)desired=null;}controls.update();renderer.render(scene,camera);},
  dispose(){resize.disconnect();controls.dispose();env.dispose();ground.geometry.dispose();ground.material.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
