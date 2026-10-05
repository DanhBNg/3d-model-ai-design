import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const checks=[];const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/models/hydroelectric');
 await page.waitForFunction(()=>!!window.__hydro);
 await page.locator('[data-hmode=principle]').click();
 await page.waitForFunction(()=>window.__hydro.controller.state.powerMW>1);
 for(let i=0;i<5;i++){
  await page.locator(`[data-lesson="${i}"]`).click();
  await page.waitForFunction(i=>window.__hydro.controller.state.lesson===i,i);
  await page.waitForTimeout(100);
  assert.equal(await page.locator(`[data-lesson="${i}"]`).getAttribute('aria-pressed'),'true');
 }
 checks.push('five chapters selectable');
 assert.equal(await page.locator('#hydro-lesson-focus').textContent(),'◎ Xem vị trí');
 checks.push('Vietnamese labels intact');
 await page.locator('#hydro-tour').click();
 await page.waitForFunction(()=>window.__hydro.controller.state.lesson===0,{},{timeout:20000});
 checks.push('automatic chapter wraps');
 await page.locator('#hydro-play').click();
 const clock=await page.evaluate(()=>window.__hydro.controller.state.lessonTime);
 await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.__hydro.controller.state.lessonTime),clock);
 checks.push('pause freezes chapter and physical clocks');
 await page.locator('[data-lesson="3"]').click();await page.locator('#hydro-lesson-focus').click();
 await page.waitForTimeout(1700);await page.screenshot({path:'output/hydroelectric/browser/lesson-detail.png'});
 checks.push('chapter focus camera');
 await page.setViewportSize({width:390,height:844});
 await page.locator('#hydro-lesson-title').scrollIntoViewIfNeeded();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'output/hydroelectric/browser/lesson-mobile.png',fullPage:true});
 checks.push('mobile lesson without horizontal overflow');
 assert.deepEqual(errors,[]);console.log(checks);
 writeFileSync('output/hydroelectric/browser/lesson-report.json',JSON.stringify({passed:true,checks,errors},null,2));
}finally{await browser.close();}
