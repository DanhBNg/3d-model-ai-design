import {Raycaster,Vector2,Vector3} from 'three';
import {loadEngineModel} from '../../models/inline-four-engine/loadModel.js';
import {createEngineController} from '../../models/inline-four-engine/controller.js';
import {PART_BY_ID} from '../../models/inline-four-engine/metadata.js';
import {createEngineStudio} from './studio.js';
import {createEngineEffects} from './effects.js';
import {mountEngineUI,connectEngineUI} from './ui.js';
import './style.css';
function isVisible(node){while(node){if(!node.visible)return false;node=node.parent;}return true;}
function partId(node){while(node){if(node.userData.partId)return node.userData.partId;node=node.parent;}return null;}
export function mountEngineExperience({modelUrl,onExit}){
 const host=document.querySelector('#app');mountEngineUI(host);document.body.dataset.screen='engine';delete document.body.dataset.mode;delete document.body.dataset.ready;
 const abort=new AbortController();let dead=false,cleaned=false,root,studio,controller,effects,ui,raf=0;
 host.querySelector('#engine-back').addEventListener('click',event=>{event.preventDefault();if(!ui)onExit();},{signal:abort.signal});
 function cleanup(){if(cleaned)return;cleaned=true;cancelAnimationFrame(raf);ui?.dispose();ui=null;effects?.dispose();controller?.dispose();root?.userData.sculptRuntime?.dispose();studio?.dispose();}
 function dispose(){if(dead)return;dead=true;abort.abort();cleanup();if(window.__engine?.dispose===dispose)delete window.__engine;}
 async function start(){try{
  const viewport=host.querySelector('#engine-viewport');studio=createEngineStudio(viewport);root=await loadEngineModel({url:modelUrl,signal:abort.signal});if(dead){root.userData.sculptRuntime?.dispose();return;}
  studio.scene.add(root);const runtime=root.userData.sculptRuntime;controller=createEngineController(root);effects=createEngineEffects(studio.scene,root);ui=connectEngineUI(host,controller,studio,onExit,runtime);host.querySelector('#engine-loading').remove();host.querySelector('#engine-stats').textContent=`${(runtime.stats.triangles||0).toLocaleString('vi-VN')} Δ · ${((runtime.stats.assetBytes||0)/1e6).toFixed(2)} MB`;document.body.dataset.ready='true';window.__engine={root,runtime,controller,studio,effects,dispose};
  let down=null;const ray=new Raycaster(),pointer=new Vector2(),canvas=studio.renderer.domElement;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,id:e.pointerId};},{signal:abort.signal});canvas.addEventListener('pointercancel',()=>{down=null;},{signal:abort.signal});canvas.addEventListener('pointerup',e=>{const start=down;down=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;const b=canvas.getBoundingClientRect();if(!b.width||!b.height)return;pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,studio.camera);const hit=ray.intersectObject(root,true).find(h=>isVisible(h.object)&&partId(h.object));if(hit)ui.selected(partId(hit.object));},{signal:abort.signal});
  let last=performance.now();const label=host.querySelector('#engine-label'),v=new Vector3();function frame(now){if(dead)return;const dt=Math.min((now-last)/1000,.05);last=now;controller.update(dt);effects.update(controller.state);studio.update(dt);ui.update(now);const id=controller.state.selected,socket=runtime.sockets[id];if(id&&socket&&runtime.meshes[id]?.some(isVisible)){socket.getWorldPosition(v).project(studio.camera);label.hidden=Math.abs(v.x)>.9||Math.abs(v.y)>.9||Math.abs(v.z)>1;label.style.left=`${(v.x+1)*viewport.clientWidth/2}px`;label.style.top=`${(1-v.y)*viewport.clientHeight/2}px`;label.textContent=PART_BY_ID[id]?.name||'';}else label.hidden=true;raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);
 }catch(error){if(dead||error.name==='AbortError')return;cleanup();const loading=host.querySelector('#engine-loading')||document.createElement('div');loading.id='engine-loading';loading.textContent='Không mở được động cơ: '+error.message;if(!loading.parentNode)host.querySelector('.engine-stage').append(loading);console.error(error);}}
 start();return dispose;
}
