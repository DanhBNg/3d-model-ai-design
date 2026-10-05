import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export function createStudio(host){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#252930');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Mô hình drone 3D — kéo để xoay, cuộn để thu phóng');
 const camera=new THREE.PerspectiveCamera(34,1,.005,15);camera.position.set(.56,.42,-.67);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.09,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.25;controls.maxDistance=2.2;controls.maxPolarAngle=Math.PI*.9;controls.enablePan=true;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xffffff,0x737a71,2.1));
 const key=new THREE.DirectionalLight(0xfff8ed,3.2);key.position.set(-.4,1,-.5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-.65,right:.65,top:.65,bottom:-.65,near:.01,far:3});key.shadow.bias=-.00015;key.shadow.normalBias=.003;scene.add(key);
 const fill=new THREE.DirectionalLight(0xd5e6f4,1.7);fill.position.set(.6,.35,.4);scene.add(fill);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));ground.rotation.x=-Math.PI/2;ground.position.y=-.006;ground.receiveShadow=true;scene.add(ground);
 const grid=new THREE.GridHelper(2,40,0x59616b,0x424953);grid.position.y=-.005;grid.material.transparent=true;grid.material.opacity=.22;scene.add(grid);
 let exploded=false,mode='explore',firstResize=true,desiredTarget=null,desiredDistance=null;
 const distance=()=> (exploded?(window.innerWidth>760?1.02:1.14):mode==='flight'?.99:.91)*Math.max(1,1.17/camera.aspect);
 const targetY=()=>exploded?.14:mode==='flight'?.2:.09;
 const observer=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);if(firstResize){camera.position.sub(controls.target).setLength(distance()).add(controls.target);firstResize=false;}else desiredDistance=distance();});observer.observe(host);
 controls.addEventListener('start',()=>{desiredTarget=null;desiredDistance=null;});
 return {scene,renderer,camera,controls,ground,grid,
  frame(value=false){mode=value===true?'explode':typeof value==='string'?value:'explore';exploded=mode==='explode';desiredTarget=new THREE.Vector3(0,targetY(),0);desiredDistance=distance();},
  view(name){const poses={front:[0,.23,-.82],top:[0,.88,-.001],rear:[-.5,.37,.62],hero:[.56,.42,-.67]};camera.position.fromArray(poses[name]||poses.hero);controls.target.set(0,targetY(),0);camera.position.sub(controls.target).setLength(distance()).add(controls.target);desiredTarget=null;desiredDistance=null;controls.update();},
  update(dt){if(desiredTarget){controls.target.lerp(desiredTarget,1-Math.exp(-dt*5));if(controls.target.distanceTo(desiredTarget)<.0001){controls.target.copy(desiredTarget);desiredTarget=null;}}if(desiredDistance!==null){const dir=camera.position.clone().sub(controls.target);const d=THREE.MathUtils.lerp(dir.length(),desiredDistance,1-Math.exp(-dt*4));camera.position.copy(controls.target).add(dir.setLength(d));if(Math.abs(d-desiredDistance)<.001)desiredDistance=null;}controls.update();renderer.render(scene,camera);},
  dispose(){observer.disconnect();controls.dispose();ground.geometry.dispose();ground.material.dispose();grid.geometry.dispose();grid.material.dispose();env.dispose();key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
