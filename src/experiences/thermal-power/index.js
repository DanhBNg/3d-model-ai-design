import {Raycaster,Vector2,Vector3} from 'three';
import {loadThermalModel} from '../../models/thermal-power/loadModel.js';
import {createThermalController} from '../../models/thermal-power/controller.js';
import {PART_BY_ID} from '../../models/thermal-power/metadata.js';
import {createThermalStudio} from './studio.js';
import {createThermalEffects} from './effects.js';
import {mountThermalUI,connectThermalUI} from './ui.js';
import './style.css';

function isVisible(node){while(node){if(!node.visible)return false;node=node.parent;}return true;}
function partId(node){while(node){if(node.userData.partId)return node.userData.partId;node=node.parent;}return null;}

export function mountThermalExperience({modelUrl,onExit}){
 const host=document.querySelector('#app');mountThermalUI(host);document.body.dataset.screen='thermal';delete document.body.dataset.mode;delete document.body.dataset.ready;
 const abort=new AbortController();let dead=false,cleaned=false,root,studio,controller,effects,ui,raf=0;
 host.querySelector('#thermal-back').addEventListener('click',event=>{event.preventDefault();if(!ui)onExit();},{signal:abort.signal});
 function cleanup(){if(cleaned)return;cleaned=true;cancelAnimationFrame(raf);ui?.dispose();ui=null;effects?.dispose();controller?.dispose();root?.userData.sculptRuntime?.dispose();studio?.dispose();}
 function dispose(){if(dead)return;dead=true;abort.abort();cleanup();if(window.__thermal?.dispose===dispose)delete window.__thermal;}
 async function start(){try{
  const viewport=host.querySelector('#thermal-viewport');studio=createThermalStudio(viewport);root=await loadThermalModel({url:modelUrl,signal:abort.signal});if(dead){root.userData.sculptRuntime.dispose();return;}
  studio.scene.add(root);const runtime=root.userData.sculptRuntime;controller=createThermalController(root);effects=createThermalEffects(studio.scene,root);ui=connectThermalUI(host,controller,studio,onExit,runtime);
  host.querySelector('#thermal-loading').remove();host.querySelector('#thermal-stats').textContent=`${runtime.stats.triangles.toLocaleString('vi-VN')} Δ · ${(runtime.stats.assetBytes/1e6).toFixed(2)} MB`;
  document.body.dataset.ready='true';window.__thermal={root,runtime,controller,studio,effects,dispose};
  let down=null;const ray=new Raycaster(),pointer=new Vector2(),canvas=studio.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,id:e.pointerId};},{signal:abort.signal});
  canvas.addEventListener('pointercancel',()=>{down=null;},{signal:abort.signal});
  canvas.addEventListener('pointerup',e=>{const start=down;down=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;const b=canvas.getBoundingClientRect();if(!b.width||!b.height)return;pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,studio.camera);const hit=ray.intersectObject(root,true).find(h=>isVisible(h.object)&&partId(h.object));if(hit)ui.selected(partId(hit.object));},{signal:abort.signal});
  let last=performance.now();const label=host.querySelector('#thermal-label'),v=new Vector3();
  function frame(now){if(dead)return;const dt=Math.min((now-last)/1000,.05);last=now;controller.update(dt);effects.update(controller.state);studio.update(dt);ui.update(now);
   const id=controller.state.selected,socket=runtime.sockets[id];
   if(id&&socket&&runtime.meshes[id]?.some(isVisible)){socket.getWorldPosition(v).project(studio.camera);label.hidden=Math.abs(v.x)>.9||Math.abs(v.y)>.9||Math.abs(v.z)>1;label.style.left=`${(v.x+1)*viewport.clientWidth/2}px`;label.style.top=`${(1-v.y)*viewport.clientHeight/2}px`;label.textContent=PART_BY_ID[id]?.name||'';}else label.hidden=true;
   raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
 }catch(error){if(dead||error.name==='AbortError')return;cleanup();const loading=host.querySelector('#thermal-loading')||document.createElement('div');loading.id='thermal-loading';loading.textContent='Không mở được nhà máy: '+error.message;if(!loading.parentNode)host.querySelector('.thermal-stage').append(loading);console.error(error);}}
 start();return dispose;
}
