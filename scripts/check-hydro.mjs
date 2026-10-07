import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=process.env.DEMO_URL||'http://127.0.0.1:4173',out='output/hydroelectric/browser';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const report={date:new Date().toISOString(),assetSha256:createHash('sha256').update(readFileSync('public/models/hydroelectric.glb')).digest('hex'),checks:[],errors:[]};
const check=(name,value=true)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
 await page.goto(base);await page.locator('[data-open-model=hydroelectric]').click();await page.waitForFunction(()=>!!window.__hydro);await page.waitForTimeout(500);
 check('clean hydro route',new URL(page.url()).pathname==='/models/hydroelectric');
 check('shared hydro shell structure',await page.locator('.model-shell .model-header, .model-shell .model-stage, .model-shell .model-inspector, .model-shell .model-bottom-bar').count()===4);
 check('three exact hydro modes',JSON.stringify(await page.locator('[data-hmode] span').allTextContents())===JSON.stringify(['Khám phá','Tách cấu tạo','Nguyên lý']));
 check('exterior closed by default',await page.evaluate(()=>['roof','facade','conduit_cover'].every(k=>window.__hydro.runtime.nodes[k].visible)&&window.__hydro.controller.state.coverOpen===0));
 await page.screenshot({path:out+'/exterior-desktop.png'});
 const pick=await page.evaluate(()=>{const d=window.__hydro,p=d.runtime.sockets.roof.getWorldPosition(d.studio.camera.position.clone()).project(d.studio.camera),b=d.studio.renderer.domElement.getBoundingClientRect();return{x:b.left+(p.x+1)*b.width/2,y:b.top+(1-p.y)*b.height/2};});
 await page.mouse.click(pick.x,pick.y);await page.waitForFunction(()=>window.__hydro.controller.state.selected==='roof');check('direct mesh picking selects roof');await page.locator('#hydro-clear').click();
 await page.locator('#hydro-cutaway').click();await page.waitForFunction(()=>window.__hydro.controller.state.coverOpen===1);await page.screenshot({path:out+'/cutaway-desktop.png'});
 check('cutaway removes facade and conduit envelope',await page.evaluate(()=>!window.__hydro.runtime.nodes.facade.visible&&!window.__hydro.runtime.nodes.conduit_cover.visible));
 await page.locator('[data-hpart=runner]').click();check('part label and Vietnamese description',await page.locator('#hydro-title').textContent()==='Bánh công tác Francis');
 await page.locator('#hydro-isolate').click();check('isolation leaves only selected assembly',await page.evaluate(()=>window.__hydro.runtime.nodes.runner.visible&&!window.__hydro.runtime.nodes.dam.visible));await page.locator('#hydro-isolate').click();
 await page.locator('[data-hmode=explode]').click();await page.locator('#hydro-explode').fill('100');await page.waitForFunction(()=>window.__hydro.controller.state.explode===1);await page.waitForTimeout(500);await page.screenshot({path:out+'/exploded-desktop.png'});
 check('full exploded pose');await page.locator('#hydro-assemble').click();await page.waitForFunction(()=>window.__hydro.controller.state.explode===0&&window.__hydro.controller.state.explodeTarget===0);check('assemble action returns explode range to zero',await page.locator('#hydro-explode').inputValue()==='0');await page.locator('#hydro-explode').fill('100');await page.waitForFunction(()=>window.__hydro.controller.state.explode===1);await page.locator('#hydro-auto').click();await page.waitForFunction(()=>window.__hydro.controller.state.explode<.9);await page.locator('#hydro-auto').click();check('exploded autoplay moves');
 await page.locator('[data-hmode=principle]').click();await page.waitForFunction(()=>window.__hydro.controller.state.powerMW>1);check('assembled before generation',await page.evaluate(()=>window.__hydro.controller.state.explode===0));
 await page.locator('#hydro-opening').fill('90');await page.locator('#hydro-head').fill('70');await page.waitForFunction(()=>window.__hydro.controller.state.powerMW>6);await page.screenshot({path:out+'/principle-desktop.png'});check('flow and head controls change power');
 await page.locator('#hydro-play').click();const t=await page.evaluate(()=>window.__hydro.controller.state.time);await page.waitForTimeout(350);check('pause freezes instructional time',await page.evaluate(t=>window.__hydro.controller.state.time===t,t));
 await page.locator('#hydro-play').click();await page.locator('#hydro-slow').click();const before=await page.evaluate(()=>window.__hydro.controller.state.time);await page.waitForTimeout(600);check('slow clock',await page.evaluate(t=>window.__hydro.controller.state.time-t<.22,before));await page.locator('#hydro-slow').click();
 await page.locator('#hydro-load').click();await page.waitForFunction(()=>window.__hydro.controller.state.opening<.03);check('load rejection removes electrical power',await page.evaluate(()=>window.__hydro.controller.state.powerMW===0));
 await page.locator('#hydro-reset').click();check('reset returns to closed exterior',await page.evaluate(()=>window.__hydro.controller.state.mode==='explore'&&window.__hydro.runtime.nodes.facade.visible));
 await page.locator('#hydro-back').click();check('unmount disposes canvas and debug handle',await page.locator('canvas').count()===0&&await page.evaluate(()=>!window.__hydro));check('return shows six catalog models',await page.locator('[data-open-model]').count()===6);
 await page.goBack();await page.waitForFunction(()=>!!window.__hydro);check('browser back remounts hydro');await page.reload();await page.waitForFunction(()=>!!window.__hydro);check('reload on clean deep link');
 for(const [width,height]of [[390,844],[320,740],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(1300);check(`no overflow ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${out}/exterior-${width}.png`,fullPage:true});
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await mobile.goto(base+'/models/hydroelectric');await mobile.waitForFunction(()=>!!window.__hydro);await mobile.locator('#hydro-cutaway').tap();await mobile.waitForFunction(()=>window.__hydro.controller.state.coverOpen===1);await mobile.locator('[data-hpart=generator_rotor]').tap();check('touch selects rotor',await mobile.locator('#hydro-title').textContent()==='Rotor máy phát');await mobile.close();
 const broken=await browser.newPage();await broken.route('**/models/hydroelectric.glb',route=>route.fulfill({status:404,body:'Missing'}));await broken.goto(base+'/models/hydroelectric');await broken.getByText('Chưa mở được nhà máy').waitFor();await broken.locator('#hydro-back').click();await broken.waitForFunction(()=>document.querySelectorAll('[data-open-model]').length===6);check('load failure offers return to catalog',await broken.locator('[data-open-model]').count()===6);await broken.close();
 check('no page exceptions',report.errors.length===0);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;throw e;}finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
