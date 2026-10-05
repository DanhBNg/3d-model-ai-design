import {Raycaster,Vector2,Vector3} from 'three';
import {loadWindModel} from '../../models/wind-turbine/loadModel.js';
import {createWindController} from '../../models/wind-turbine/controller.js';
import {PART_BY_ID} from '../../models/wind-turbine/metadata.js';
import {createWindStudio} from './studio.js';
import {createWindEffects} from './effects.js';
import {mountWindUI,connectWindUI} from './ui.js';
import './style.css';
export function mountWindExperience({modelUrl,onExit}){
 const host=document.querySelector('#app');mountWindUI(host);document.body.dataset.screen='wind';delete document.body.dataset.mode;
 const abort=new AbortController();let dead=false,root,studio,c,effects,ui,raf=0;
 host.querySelector('#wind-back').addEventListener('click',()=>{if(!ui)onExit();},{signal:abort.signal});
 function dispose(){if(dead)return;dead=true;abort.abort();cancelAnimationFrame(raf);ui?.dispose();effects?.dispose();c?.dispose();root?.userData.sculptRuntime.dispose();studio?.dispose();if(window.__wind?.dispose===dispose)delete window.__wind;}
 async function start(){try{
  const viewport=host.querySelector('#wind-viewport');studio=createWindStudio(viewport);root=await loadWindModel({url:modelUrl,signal:abort.signal});if(dead){root.userData.sculptRuntime.dispose();return;}
  studio.scene.add(root);const r=root.userData.sculptRuntime;c=createWindController(root);effects=createWindEffects(studio.scene,root);ui=connectWindUI(host,c,studio,onExit,r);
  host.querySelector('#wind-loading').remove();host.querySelector('#wind-stats').textContent=`${r.stats.triangles.toLocaleString('vi-VN')} Δ · ${(r.stats.assetBytes/1e6).toFixed(2)} MB`;
  document.body.dataset.ready='true';window.__wind={root,runtime:r,controller:c,studio,effects,dispose};
  let down=null;const ray=new Raycaster(),pointer=new Vector2(),canvas=studio.renderer.domElement;
  canvas.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY],{signal:abort.signal});
  canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,studio.camera);const hit=ray.intersectObject(root,true).find(h=>{let n=h.object;while(n){if(!n.visible)return false;n=n.parent;}return !!h.object.userData.partId;});if(hit)ui.selected(hit.object.userData.partId);},{signal:abort.signal});
  let last=performance.now();const label=host.querySelector('#wind-label'),v=new Vector3();
  function frame(now){if(dead)return;const dt=Math.min((now-last)/1000,.05);last=now;c.update(dt);effects.update(c.state);studio.update(dt);ui.update(now);
   const id=c.state.selected;if(id&&r.meshes[id].some(m=>m.visible)){r.sockets[id].getWorldPosition(v).project(studio.camera);label.hidden=Math.abs(v.x)>1||Math.abs(v.y)>1||v.z>1;label.style.left=`${(v.x+1)*viewport.clientWidth/2}px`;label.style.top=`${(1-v.y)*viewport.clientHeight/2}px`;label.textContent=PART_BY_ID[id].name;}else label.hidden=true;
   raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
 }catch(e){if(dead||e.name==='AbortError')return;const l=host.querySelector('#wind-loading');l.textContent='Không mở được tua-bin: '+e.message;console.error(e);}}
 start();return dispose;
}
