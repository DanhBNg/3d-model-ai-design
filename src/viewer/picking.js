import { Raycaster,Vector2,Vector3 } from 'three';
export function createPicking(studio,root,onSelect){
 const canvas=studio.renderer.domElement,ray=new Raycaster(),pointer=new Vector2();let down=null;
 function pick(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,studio.camera);return ray.intersectObject(root,true).find(hit=>{let n=hit.object;while(n){if(!n.visible)return false;n=n.parent;}return !!hit.object.userData.partId;});}
 const start=e=>{down={x:e.clientX,y:e.clientY,time:performance.now()}};
 const end=e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&performance.now()-down.time<600)onSelect(pick(e)?.object.userData.partId||null);down=null;};
 const move=e=>{if(e.pointerType==='mouse'&&!e.buttons)canvas.style.cursor=pick(e)?'pointer':'grab';};
 canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointermove',move);
 return ()=>{canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointermove',move)};
}
export function projectSocket(socket,camera,host){const p=socket.getWorldPosition(new Vector3()).project(camera),{width,height}=host.getBoundingClientRect();return {x:(p.x*.5+.5)*width,y:(-.5*p.y+.5)*height,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<.95&&Math.abs(p.y)<.95};}
