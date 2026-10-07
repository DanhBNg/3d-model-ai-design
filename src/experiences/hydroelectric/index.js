import { Raycaster,Vector2,Vector3 } from 'three';
import { loadHydroelectricModel } from '../../models/hydroelectric/loadModel.js';
import { createHydroController } from '../../models/hydroelectric/controller.js';
import { PART_BY_ID } from '../../models/hydroelectric/metadata.js';
import { createHydroStudio } from './studio.js';
import { createHydroEffects } from './effects.js';
import { mountHydroUI,connectHydroUI } from './ui.js';
import './style.css';

export function mountHydroExperience({modelUrl,onExit}){
 const host=document.querySelector('#app');mountHydroUI(host);document.body.dataset.screen='hydro';delete document.body.dataset.mode;
 const abort=new AbortController();let dead=false,root,studio,controller,effects,ui,raf=0;
 const exit=()=>onExit();host.querySelector('#hydro-back').addEventListener('click',event=>{event.preventDefault();if(!ui)exit();},{signal:abort.signal});
 function dispose(){if(dead)return;dead=true;abort.abort();cancelAnimationFrame(raf);ui?.dispose();effects?.dispose();controller?.dispose();root?.userData.sculptRuntime.dispose();studio?.dispose();if(window.__hydro?.dispose===dispose)delete window.__hydro;}
 async function start(){try{
  const viewport=host.querySelector('#hydro-viewport');studio=createHydroStudio(viewport);root=await loadHydroelectricModel({url:modelUrl,signal:abort.signal});if(dead){root.userData.sculptRuntime.dispose();return;}
  studio.scene.add(root);const runtime=root.userData.sculptRuntime;controller=createHydroController(root);effects=createHydroEffects(studio.scene);ui=connectHydroUI(host,controller,studio,exit,runtime);
  host.querySelector('#hydro-loading').remove();host.querySelector('#hydro-stats').textContent=`${runtime.stats.triangles.toLocaleString('vi-VN')} Δ · ${(runtime.stats.assetBytes/1e6).toFixed(2)} MB`;
  document.body.dataset.ready='true';window.__hydro={root,runtime,controller,studio,effects,dispose};
  let down=null;const ray=new Raycaster(),pointer=new Vector2();const canvas=studio.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY],{signal:abort.signal});
  canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,studio.camera);const hit=ray.intersectObject(root,true).find(h=>{let n=h.object;while(n){if(!n.visible)return false;n=n.parent;}return h.object.userData.partId;});if(hit)ui.selected(hit.object.userData.partId);},{signal:abort.signal});
  let last=performance.now();const label=host.querySelector('#hydro-label'),v=new Vector3();
  function frame(now){if(dead)return;const dt=Math.min((now-last)/1000,.05);last=now;controller.update(dt);effects.update(controller.state);studio.update(dt);ui.update(now);
   const id=controller.state.selected;if(id&&runtime.nodes[id].visible){runtime.sockets[id].getWorldPosition(v).project(studio.camera);label.hidden=Math.abs(v.x)>1||Math.abs(v.y)>1||v.z>1;label.style.left=`${(v.x+1)*viewport.clientWidth/2}px`;label.style.top=`${(1-v.y)*viewport.clientHeight/2}px`;label.textContent=PART_BY_ID[id].name;}else label.hidden=true;
   raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
 }catch(e){if(dead||e.name==='AbortError')return;const l=host.querySelector('#hydro-loading');l.innerHTML='<b>Chưa mở được nhà máy</b><span></span><button>Thử lại</button>';l.querySelector('span').textContent=e.message;l.querySelector('button').onclick=()=>location.reload();console.error(e);}}
 start();return dispose;
}
