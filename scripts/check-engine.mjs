import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='output/inline-four-engine/browser';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],checks=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:4173/models/inline-four-engine');await page.waitForFunction(()=>!!window.__engine);await page.waitForTimeout(800);
 await page.screenshot({path:out+'/exterior.png'});checks.push('clean route loads exterior');
 await page.locator('[data-emode=principle]').click();await page.waitForFunction(()=>!window.__engine.controller.state.transition);await page.locator('#engine-play').click();
 for(const angle of [90,270,360,450,630,720]){await page.locator('#engine-angle').fill(String(angle));await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__engine.controller.state.angle),angle);await page.screenshot({path:`${out}/cycle-${angle}.png`});}
 checks.push('720 degree scrub and four strokes');
 const angle=await page.evaluate(()=>window.__engine.controller.state.angle);await page.locator('[data-ecylinder="2"]').first().click();await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>window.__engine.controller.state.angle),angle);
 assert.equal(await page.evaluate(()=>window.__engine.runtime.meshes.piston_1.every(m=>!m.visible)),true);await page.screenshot({path:out+'/single-cylinder.png'});checks.push('single cylinder hides peers without phase reset');
 await page.locator('[data-ecylinder="0"]').click();await page.locator('[data-eview=timing]').click();await page.waitForTimeout(1200);await page.screenshot({path:out+'/timing.png'});
 await page.locator('[data-emode=explode]').click();await page.locator('#engine-explode').fill('100');await page.waitForFunction(()=>window.__engine.controller.state.explode===1);await page.screenshot({path:out+'/exploded.png'});
 assert.equal(await page.evaluate(()=>window.__engine.effects.group.visible),false);checks.push('exploded view hides operational overlays');
 await page.locator('[data-emode=principle]').click();await page.waitForFunction(()=>!window.__engine.controller.state.transition);assert.equal(await page.evaluate(()=>window.__engine.controller.state.explode),0);checks.push('operation reassembles first');
 await page.locator('#engine-play').click();await page.waitForTimeout(300);assert.notEqual(await page.evaluate(()=>window.__engine.controller.state.angle),angle);await page.locator('#engine-play').click();const paused=await page.evaluate(()=>window.__engine.controller.state.angle);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.__engine.controller.state.angle),paused);checks.push('play and pause');
 await page.locator('#engine-slow').click();assert.equal(await page.evaluate(()=>window.__engine.controller.state.slow),true);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1000);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/mobile.png',fullPage:true});checks.push('mobile layout');
 await page.locator('#engine-reset').click();assert.equal(await page.evaluate(()=>window.__engine.controller.state.mode),'explore');
 const stats=await page.evaluate(()=>window.__engine.runtime.stats);await page.locator('#engine-back').click();assert.equal(await page.locator('[data-open-model]').count(),6);assert.equal(await page.evaluate(()=>!!window.__engine),false);checks.push('reset disposal and six model catalog');assert.deepEqual(errors,[]);
 writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,stats,errors},null,2));console.log({checks,stats});
}finally{await browser.close();}
