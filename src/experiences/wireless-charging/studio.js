import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createWirelessStudio(host){
 const scene=new T.Scene();scene.background=new T.Color('#111e29');
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Điện thoại và đế sạc 3D: kéo để xoay, cuộn hoặc chụm để thu phóng');
 const camera=new T.PerspectiveCamera(35,1,.001,10);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.055;controls.maxDistance=1.5;controls.maxPolarAngle=Math.PI*.93;
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.05);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xe5f7ff,0x4c606c,2));
 const key=new T.DirectionalLight(0xffe3c4,3);key.position.set(-.2,.4,.1);scene.add(key);
 const rim=new T.DirectionalLight(0x7dece9,2.4);rim.position.set(.2,.12,-.2);scene.add(rim);
 let desired,current='hero',first=true,disposed=false;
 function view(id='hero'){
  current=id;const portrait=Math.max(1,1.16/camera.aspect);
  const configs={hero:[[-.035,.013,0],[.7,.95,1.1],.37],coils:[[-.015,.022,0],[.4,.5,1],.34],phone:[[0,.033,0],[.3,1,1],.29],pad:[[0,.008,0],[.7,1,1],.245],explode:[[0,.048,0],[.7,.45,1],.50]};
  const [target,direction,distance]=configs[id]||configs.hero;desired={target:new T.Vector3(...target),direction:new T.Vector3(...direction).normalize(),distance:distance*portrait};
 }
 const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height||disposed)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);view(current);if(first){controls.target.copy(desired.target);camera.position.copy(desired.direction).multiplyScalar(desired.distance).add(desired.target);desired=null;first=false;}});resize.observe(host);
 const onStart=()=>{desired=null;};controls.addEventListener('start',onStart);
 return {scene,camera,controls,renderer,view,
  focus(node){if(!node)return;const box=new T.Box3().setFromObject(node);if(box.isEmpty())return;desired={target:box.getCenter(new T.Vector3()),direction:camera.position.clone().sub(controls.target).normalize(),distance:Math.max(.09,box.getSize(new T.Vector3()).length()*1.65*Math.max(1,.9/camera.aspect))};},
  update(dt){if(disposed)return;if(desired){const k=1-Math.exp(-dt*4),offset=camera.position.clone().sub(controls.target);controls.target.lerp(desired.target,k);offset.lerp(desired.direction.clone().multiplyScalar(desired.distance),k);camera.position.copy(controls.target).add(offset);if(controls.target.distanceTo(desired.target)<.00002&&Math.abs(offset.length()-desired.distance)<.0002)desired=null;}controls.update();renderer.render(scene,camera);},
  dispose(){if(disposed)return;disposed=true;resize.disconnect();controls.removeEventListener('start',onStart);controls.dispose();env.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
