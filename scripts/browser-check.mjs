import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const url=process.env.DEMO_URL||'http://127.0.0.1:5173',out='output/validation';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const report={url,browser:browser.version(),date:new Date().toISOString().slice(0,10),assetSha256:createHash('sha256').update(readFileSync('public/models/drone.glb')).digest('hex'),checks:[],errors:[],requests:[],viewports:[]};
function check(name,passed=true){assert.ok(passed,name);report.checks.push(name);console.log('PASS',name);}
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>report.requests.push(r.url()));
 await page.goto(url);await page.getByRole('heading',{name:'Chọn một hệ thống để khám phá.'}).waitFor();
 check('catalog lists drone and hydroelectric plant',await page.locator('.catalog-card').count()>=2);
 check('hydroelectric model is available',await page.locator('[data-open-model=hydroelectric]').count()===1);
 check('catalog route has no hash',new URL(page.url()).hash==='');
 await page.screenshot({path:out+'/catalog-desktop.png',fullPage:true});
 await page.locator('[data-open-model=drone]').click();
 check('drone uses clean pathname',new URL(page.url()).pathname.endsWith('/models/drone')&&new URL(page.url()).hash==='');
 await page.waitForFunction(()=>document.body.dataset.ready==='true');
 check('GLB rendered and no load error');await page.screenshot({path:out+'/desktop.png'});
 const target=await page.evaluate(()=>{const d=window.__demo,p=d.runtime.sockets.shell_upper.getWorldPosition(d.studio.camera.position.clone()).project(d.studio.camera),b=d.studio.renderer.domElement.getBoundingClientRect();return {x:b.x+(p.x+1)*b.width/2,y:b.y+(1-p.y)*b.height/2}});
 await page.mouse.click(target.x,target.y);await page.waitForFunction(()=>window.__demo.controller.state.selected==='shell_upper');check('direct mesh picking selects correct assembly');
 const before=await page.evaluate(()=>window.__demo.studio.camera.position.toArray());await page.mouse.move(450,480);await page.mouse.down();await page.mouse.move(560,500,{steps:10});await page.mouse.up();await page.waitForTimeout(300);const after=await page.evaluate(()=>window.__demo.studio.camera.position.toArray());check('orbit changes camera',before.some((v,i)=>Math.abs(v-after[i])>.01));await page.locator('[data-view=hero]').click();
 await page.locator('#covers').click();check('covers hidden',await page.evaluate(()=>!window.__demo.runtime.nodes.shell_upper.visible&&!window.__demo.runtime.nodes.shell_lower.visible));
 await page.locator('[data-part=battery]').click();await page.locator('#isolate').click();check('isolate battery',await page.evaluate(()=>window.__demo.runtime.nodes.battery.visible&&!window.__demo.runtime.nodes.frame.visible));await page.locator('#isolate').click();await page.locator('#covers').click();
 await page.locator('[data-part=gimbal]').click();await page.locator('#gimbal-tilt').fill('-30');await page.waitForFunction(()=>Math.abs(window.__demo.runtime.pivots.gimbalPitch.rotation.x+Math.PI/6)<.001);check('gimbal pitch control moves correct pivot');
 await page.locator('[data-mode=explode]').click();await page.locator('#explode-slider').fill('50');await page.waitForFunction(()=>window.__demo.controller.state.explode===.5);await page.screenshot({path:out+'/exploded-half.png'});
 await page.locator('#explode-slider').fill('100');await page.waitForFunction(()=>window.__demo.controller.state.explode===1);check('continuous explode reaches 50% and 100%');await page.screenshot({path:out+'/exploded-full.png'});
 await page.locator('#auto').click();await page.waitForFunction(()=>window.__demo.controller.state.explode<.9);await page.locator('#auto').click();check('autoplay separates and reassembles');
 await page.locator('[data-mode=flight]').click();check('flight waits for assembly',await page.evaluate(()=>window.__demo.controller.state.explode>0&&window.__demo.runtime.nodes.flightRoot.position.length()===0));
 await page.waitForFunction(()=>window.__demo.controller.state.time>3);await page.locator('#play').click();let time=await page.evaluate(()=>window.__demo.controller.state.time);await page.waitForTimeout(350);check('pause freezes simulation clock',await page.evaluate(t=>window.__demo.controller.state.time===t,time));
 await page.locator('#slow').click();await page.locator('#play').click();await page.waitForTimeout(700);let slowElapsed=await page.evaluate(t=>window.__demo.controller.state.time-t,time);check('slow motion uses 0.25× clock',slowElapsed>0&&slowElapsed<.3);await page.locator('#slow').click();
 for(const scenario of ['takeoff','hover','forward','backward','left','right','yaw_left','yaw_right']){
  await page.locator(`[data-scenario=${scenario}]`).click();await page.waitForFunction(()=>window.__demo.controller.state.time>2.5);check('scenario '+scenario,await page.evaluate(id=>window.__demo.controller.state.scenario===id&&window.__demo.controller.state.speeds.every(Number.isFinite),scenario));
  if(['forward','left','yaw_right'].includes(scenario)){await page.locator('#play').click();await page.screenshot({path:`${out}/flight-${scenario}.png`});}
 }
 await page.locator('[data-flow=control]').click();check('control flow explanation visible',(await page.locator('#flow-copy').textContent()).includes('IMU'));await page.locator('[data-flow=both]').click();
 await page.locator('#flight-reset').click();await page.waitForFunction(()=>window.__demo.controller.state.time===0);check('reset restores ground pose and stops',await page.evaluate(()=>window.__demo.runtime.nodes.flightRoot.position.length()===0&&!window.__demo.controller.state.playing));
 const metrics=await page.evaluate(()=>{const d=window.__demo,ms=[...d.frameTimes].sort((a,b)=>a-b);return {model:d.runtime.stats,drawCalls:d.studio.renderer.info.render.calls,loadMs:d.loadMs,frameMedianMs:ms[Math.floor(ms.length/2)],frameP95Ms:ms[Math.floor(ms.length*.95)],viewport:[innerWidth,innerHeight],gpu:d.studio.renderer.getContext().getParameter(d.studio.renderer.getContext().RENDERER)}});report.viewports.push(metrics);
 for(const [width,height]of [[390,844],[320,740],[844,390]]){
  const mobile=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});mobile.on('pageerror',e=>report.errors.push(e.message));await mobile.goto(url);if(width===390)await mobile.screenshot({path:out+'/catalog-mobile.png',fullPage:true});await mobile.locator('[data-open-model=drone]').tap();await mobile.waitForFunction(()=>document.body.dataset.ready==='true');await mobile.waitForTimeout(250);
  check(`no horizontal overflow ${width}×${height}`,await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const framing=await mobile.evaluate(()=>{const d=window.__demo;let minX=1,maxX=-1,minY=1,maxY=-1;d.root.updateMatrixWorld(true);d.root.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){const v=d.studio.camera.position.clone().set(x,y,z).applyMatrix4(o.matrixWorld).project(d.studio.camera);minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}});return {minX,maxX,minY,maxY}});
  check(`model fits portrait/landscape ${width}`,framing.minX>=-1&&framing.maxX<=1&&framing.minY>=-1&&framing.maxY<=1);
  await mobile.locator('[data-mode=explode]').tap();await mobile.locator('#explode-slider').fill('100');await mobile.waitForFunction(()=>window.__demo.controller.state.explode===1);await mobile.screenshot({path:`${out}/mobile-${width}-exploded.png`,fullPage:true});
  await mobile.locator('[data-part=esc]').tap();check(`touch selects ESC ${width}`,await mobile.evaluate(()=>window.__demo.controller.state.selected==='esc'));
  report.viewports.push({viewport:[width,height],framing,emulated:true});await mobile.close();
 }
 const direct=await browser.newPage();await direct.goto(new URL('/models/drone',url).href);await direct.waitForFunction(()=>document.body.dataset.ready==='true');check('direct clean drone route loads production assets');await direct.close();
 const hydro=await browser.newPage();await hydro.goto(new URL('/models/hydroelectric',url).href);await hydro.waitForFunction(()=>!!window.__hydro);check('hydro deep link loads model');await hydro.close();
 const broken=await browser.newPage();await broken.route('**/models/drone.glb',route=>route.fulfill({status:404,body:'Missing model'}));await broken.goto(url);await broken.locator('[data-open-model=drone]').click();await broken.getByText('Chưa mở được mô hình').waitFor();check('missing GLB produces retry UI');await broken.close();
 check('no page exceptions',report.errors.length===0);check('runtime uses local resources only',report.requests.every(u=>u.startsWith(url)||u.startsWith('data:')));
 await page.locator('[data-exit-model]').click();await page.getByRole('heading',{name:'Chọn một hệ thống để khám phá.'}).waitFor();check('return control restores catalog and disposes canvas',await page.locator('canvas').count()===0&&new URL(page.url()).pathname==='/');
 report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;throw e;}finally{writeFileSync(out+'/browser-report.json',JSON.stringify(report,null,2));await browser.close();}
