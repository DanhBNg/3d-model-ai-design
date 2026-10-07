import {Raycaster,Vector2,Vector3} from 'three';
import {loadWirelessModel} from '../../models/wireless-charging/loadModel.js';
import {createWirelessController} from '../../models/wireless-charging/controller.js';
import {PART_BY_ID} from '../../models/wireless-charging/metadata.js';
import {createWirelessStudio} from './studio.js';
import {createWirelessEffects} from './effects.js';
import {createPhoneDisplay} from './display.js';
import {mountWirelessUI,connectWirelessUI} from './ui.js';
import './style.css';

function isVisible(node){while(node){if(!node.visible)return false;node=node.parent;}return true;}
function partId(node){while(node){if(node.userData.partId)return node.userData.partId;node=node.parent;}return null;}

export function mountWirelessExperience({modelUrl,onExit}){
 const host=document.querySelector('#app');mountWirelessUI(host);document.body.dataset.screen='wireless';delete document.body.dataset.mode;delete document.body.dataset.ready;
 const abort=new AbortController();let dead=false,cleaned=false,root,studio,controller,effects,display,ui,raf=0;
 host.querySelector('#wireless-back').addEventListener('click',()=>{if(!ui)onExit();},{signal:abort.signal});
 function cleanup(){if(cleaned)return;cleaned=true;cancelAnimationFrame(raf);ui?.dispose();ui=null;display?.dispose();effects?.dispose();controller?.dispose();root?.userData.sculptRuntime?.dispose();studio?.dispose();}
 function dispose(){if(dead)return;dead=true;abort.abort();cleanup();if(window.__wireless?.dispose===dispose)delete window.__wireless;}
 async function start(){try{
  const viewport=host.querySelector('#wireless-viewport');studio=createWirelessStudio(viewport);root=await loadWirelessModel({url:modelUrl,signal:abort.signal});if(dead){root.userData.sculptRuntime.dispose();return;}
  studio.scene.add(root);const runtime=root.userData.sculptRuntime;controller=createWirelessController(root);effects=createWirelessEffects(studio.scene,root);ui=connectWirelessUI(host,controller,studio,onExit,runtime);
  display=createPhoneDisplay(root);
  host.querySelector('#wireless-loading').remove();host.querySelector('#wireless-stats').textContent=`${runtime.stats.triangles.toLocaleString('vi-VN')} Δ · ${(runtime.stats.assetBytes/1e6).toFixed(2)} MB`;
  document.body.dataset.ready='true';window.__wireless={root,runtime,controller,state:controller.state,studio,effects,dispose};
  let down=null;const ray=new Raycaster(),pointer=new Vector2(),canvas=studio.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,id:e.pointerId};},{signal:abort.signal});
  canvas.addEventListener('pointercancel',()=>{down=null;},{signal:abort.signal});
  canvas.addEventListener('pointerup',e=>{const start=down;down=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;const b=canvas.getBoundingClientRect();if(!b.width||!b.height)return;pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,studio.camera);const hit=ray.intersectObject(root,true).find(h=>isVisible(h.object)&&partId(h.object));if(hit)ui.selected(partId(hit.object));},{signal:abort.signal});
  let last=performance.now();const label=host.querySelector('#wireless-label'),v=new Vector3();
  function frame(now){if(dead)return;const dt=Math.min((now-last)/1000,.05);last=now;controller.update(dt);effects.update(controller.state);display.update(controller.state,dt);studio.update(dt);ui.update(now);
   const id=controller.state.selected,socket=runtime.sockets[id];
   if(id&&socket&&runtime.meshes[id]?.some(isVisible)){socket.getWorldPosition(v).project(studio.camera);label.hidden=Math.abs(v.x)>.9||Math.abs(v.y)>.9||Math.abs(v.z)>1;label.style.left=`${(v.x+1)*viewport.clientWidth/2}px`;label.style.top=`${(1-v.y)*viewport.clientHeight/2}px`;label.textContent=PART_BY_ID[id]?.name||'';}else label.hidden=true;
   raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
 }catch(error){if(dead||error.name==='AbortError')return;cleanup();const loading=host.querySelector('#wireless-loading')||document.createElement('div');loading.id='wireless-loading';loading.textContent='Không mở được mô hình: '+error.message;if(!loading.parentNode)host.querySelector('.wireless-stage').append(loading);console.error(error);}}
 start();return dispose;
}


