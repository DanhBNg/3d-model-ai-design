import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:4173/models/hydroelectric');await page.waitForFunction(()=>!!window.__hydro);
 await page.waitForTimeout(900);await page.screenshot({path:'output/hydroelectric/browser/water-exterior.png'});
 assert.equal(await page.evaluate(()=>window.__hydro.effects.water.internal.visible),false);checks.push('water contained by closed exterior');
 await page.locator('[data-hmode=principle]').click();await page.waitForFunction(()=>window.__hydro.controller.state.powerMW>1);
 await page.screenshot({path:'output/hydroelectric/browser/water-principle.png'});
 assert.ok(await page.evaluate(()=>window.__hydro.effects.water.internal.visible&&window.__hydro.effects.water.foam.visible));checks.push('3D water and discharge foam active');
 await page.locator('[data-hview=section]').click();
 await page.waitForTimeout(1500);await page.screenshot({path:'output/hydroelectric/browser/water-side.png'});
 await page.locator('#hydro-play').click();const clocks=await page.evaluate(()=>{const s=window.__hydro.controller.state;return [s.waterTime,s.flowTime];});
 await page.waitForTimeout(500);assert.deepEqual(await page.evaluate(()=>{const s=window.__hydro.controller.state;return [s.waterTime,s.flowTime];}),clocks);checks.push('pause freezes water and flow phase');
 await page.locator('#hydro-play').click();await page.locator('#hydro-opening').fill('0');await page.waitForFunction(()=>window.__hydro.controller.state.flow<.005);
 assert.equal(await page.evaluate(()=>window.__hydro.effects.water.foam.visible),false);checks.push('zero flow stops foam');
 await page.locator('[data-hmode=explode]').click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__hydro.effects.water.internal.visible),false);checks.push('exploded mode hides internal water');
 await page.locator('[data-hmode=principle]').click();await page.locator('#hydro-opening').fill('65');await page.waitForFunction(()=>window.__hydro.controller.state.powerMW>1);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1500);await page.screenshot({path:'output/hydroelectric/browser/water-mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks.push('mobile water view fits');
 const stats=await page.evaluate(()=>{const r=window.__hydro.studio.renderer;return {triangles:r.info.render.triangles,drawCalls:r.info.render.calls,geometries:r.info.memory.geometries};});
 assert.deepEqual(errors,[]);checks.push('no shader or JavaScript errors');
 writeFileSync('output/hydroelectric/browser/water-report.json',JSON.stringify({passed:true,checks,errors,stats},null,2));console.log({checks,stats});
}finally{await browser.close();}
