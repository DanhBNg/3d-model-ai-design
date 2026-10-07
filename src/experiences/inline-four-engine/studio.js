import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export function createEngineStudio(host){
 const scene=new T.Scene();scene.background=new T.Color('#171c21');
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Động cơ 3D: kéo để xoay, cuộn hoặc chụm để thu phóng');
 const camera=new T.PerspectiveCamera(38,1,.001,30),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.12;controls.maxDistance=3;controls.target.set(0,.21,0);
 scene.add(new T.HemisphereLight(0xe7f0ff,0x6b6054,2.5));
 for(const [color,intensity,pos] of [[0xffeed7,3,[-1,2,-2]],[0xc8deff,2,[1,1,1]],[0xffffff,1,[0,.5,-1]]]){const light=new T.DirectionalLight(color,intensity);light.position.set(...pos);scene.add(light);}
 let desired=null,current='hero',cylinder=1,disposed=false,first=true;
 function view(id='hero',index=cylinder){current=id;cylinder=index||1;const x=[-.15,-.05,.05,.15][cylinder-1],portrait=Math.max(1,.92/camera.aspect);const configs={hero:[[0,.21,0],[-.65,.4,1],.94],rear:[[0,.21,0],[.65,.4,-1],.94],cylinder:[[x,.23,0],[-.22,.12,1],.43],timing:[[-.225,.235,0],[-1,.15,.25],.57],explode:[[0,.23,0],[-.65,.4,1],1.48]};const [target,direction,distance]=configs[id]||configs.hero;desired={target:new T.Vector3(...target),direction:new T.Vector3(...direction).normalize(),distance:distance*portrait};}
 const observer=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(disposed||!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);view(current);if(first){controls.target.copy(desired.target);camera.position.copy(desired.direction).multiplyScalar(desired.distance).add(desired.target);desired=null;first=false;}});observer.observe(host);
 const onStart=()=>{desired=null;};controls.addEventListener('start',onStart);
 return {scene,camera,renderer,controls,view,focus(node){if(!node)return;const box=new T.Box3().setFromObject(node);if(box.isEmpty())return;desired={target:box.getCenter(new T.Vector3()),direction:camera.position.clone().sub(controls.target).normalize(),distance:Math.max(.22,box.getSize(new T.Vector3()).length()*1.7)*Math.max(1,.9/camera.aspect)};},update(dt){if(disposed)return;if(desired){const k=1-Math.exp(-dt*5),offset=camera.position.clone().sub(controls.target);controls.target.lerp(desired.target,k);offset.lerp(desired.direction.clone().multiplyScalar(desired.distance),k);camera.position.copy(controls.target).add(offset);if(controls.target.distanceTo(desired.target)<.0002&&Math.abs(offset.length()-desired.distance)<.0005)desired=null;}controls.update();renderer.render(scene,camera);},dispose(){if(disposed)return;disposed=true;observer.disconnect();controls.removeEventListener('start',onStart);controls.dispose();renderer.dispose();renderer.domElement.remove();}};
}
