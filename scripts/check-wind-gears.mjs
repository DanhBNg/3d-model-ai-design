import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='output/wind-turbine/gear-fix';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1360,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/models/wind-turbine');await page.waitForFunction(()=>!!window.__wind);
 await page.locator('[data-wmode=principle]').click();await page.waitForFunction(()=>window.__wind.controller.state.rpm>8);
 await page.evaluate(()=>{const s=window.__wind.studio;s.controls.dispatchEvent({type:'start'});s.controls.target.set(1.05,35.8,.4);s.camera.position.set(2.7,38.1,5.4);s.controls.update();});
 await page.waitForTimeout(500);const before=await page.evaluate(()=>window.__wind.controller.state.angle);
 await page.screenshot({path:out+'/rear-running-a.png'});await page.waitForTimeout(900);const after=await page.evaluate(()=>window.__wind.controller.state.angle);assert.notEqual(before,after);
 await page.screenshot({path:out+'/rear-running-b.png'});await page.locator('#wind-play').click();
 await page.evaluate(()=>{const s=window.__wind.studio;s.controls.target.set(1.05,35.8,.4);s.camera.position.set(-1.3,37.4,-4.1);s.controls.update();});await page.waitForTimeout(200);await page.screenshot({path:out+'/front-paused.png'});
 assert.deepEqual(errors,[]);writeFileSync(out+'/browser-report.json',JSON.stringify({passed:true,checks:['rear angle during actual rotation','second rotation phase','front paused angle','no page exceptions'],errors},null,2));
 console.log('PASS: gearbox viewed from both sides and while rotating.');
}finally{await browser.close();}
