import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.DEMO_URL || 'http://127.0.0.1:4173';
const output = 'output/unified-interface';
mkdirSync(output, { recursive: true });

const models = [
  { id: 'drone', global: '__demo', principle: '[data-mode="flight"]' },
  { id: 'hydroelectric', global: '__hydro', principle: '[data-hmode="principle"]' },
  { id: 'wind-turbine', global: '__wind', principle: '[data-wmode="principle"]' },
  { id: 'thermal-power', global: '__thermal', principle: '[data-tmode="principle"]' },
  { id: 'wireless-charging', global: '__wireless', principle: '[data-wmode="principle"]' },
  { id: 'inline-four-engine', global: '__engine', principle: '[data-emode="principle"]' },
];

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const report = { base, browser: browser.version(), generatedAt: new Date().toISOString(), models: [], reducedMotion: false, errors: [] };

function attachErrorCollection(page, label) {
  page.on('pageerror', error => report.errors.push(`${label}: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') report.errors.push(`${label}: console: ${message.text()}`);
  });
}

async function assertShell(page, model, viewport) {
  await page.goto(new URL(`/models/${model.id}`, base).href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(name => Boolean(window[name]), model.global, { timeout: 20_000 });
  await page.locator('.model-header').waitFor();
  assert.equal(await page.locator('.model-header__modes button').count(), 3, `${model.id}: exactly three modes`);
  for (const selector of ['.model-stage', '.model-inspector', '.model-view-tools', '.model-bottom-bar']) {
    assert.ok(await page.locator(selector).count(), `${model.id}: missing ${selector}`);
  }
  const layout = await page.evaluate(() => {
    const header = document.querySelector('.model-header').getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      header: { left: header.left, right: header.right, top: header.top, width: header.width },
      viewport: [innerWidth, innerHeight],
    };
  });
  assert.equal(layout.overflow, false, `${model.id}: horizontal overflow at ${viewport}`);
  assert.ok(layout.header.left >= -1 && layout.header.right <= layout.viewport[0] + 1, `${model.id}: header outside viewport at ${viewport}`);

  await page.locator(model.principle).click();
  await page.waitForFunction(selector => document.querySelector(selector)?.getAttribute('aria-pressed') === 'true', model.principle);
  await page.waitForFunction(({ globalName, id }) => {
    const demo = window[globalName];
    const state = demo?.controller?.state;
    if (!state) return false;
    if (id === 'drone') return state.time > 1;
    if (id === 'hydroelectric') return state.powerMW > 1;
    if (id === 'wind-turbine') return state.rpm > 5;
    if (id === 'thermal-power') return state.powerMW > 20;
    if (id === 'wireless-charging') return state.receivedW > 1;
    return !state.transition && state.angle > 0;
  }, { globalName: model.global, id: model.id }, { timeout: 20_000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${output}/${model.id}-${viewport}-principle.png`, fullPage: viewport === 'mobile' });
  return layout;
}

try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const model of models) {
    const page = await desktopContext.newPage();
    attachErrorCollection(page, `${model.id}/desktop`);
    const desktop = await assertShell(page, model, 'desktop');
    await page.locator('[data-exit-model]').click();
    await page.locator('[data-open-model]').first().waitFor();
    assert.equal(await page.locator('[data-open-model]').count(), 6, `${model.id}: catalog return has six cards`);
    await page.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const mobilePage = await mobileContext.newPage();
    attachErrorCollection(mobilePage, `${model.id}/mobile`);
    const mobile = await assertShell(mobilePage, model, 'mobile');
    await mobilePage.close();
    await mobileContext.close();

    report.models.push({ id: model.id, desktop, mobile });
    console.log(`PASS ${model.id}: desktop + mobile shell and principle view`);
  }
  await desktopContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  attachErrorCollection(reducedPage, 'catalog/reduced-motion');
  await reducedPage.goto(base, { waitUntil: 'domcontentloaded' });
  await reducedPage.locator('.catalog-card').first().waitFor();
  report.reducedMotion = await reducedPage.locator('.catalog-card').first().evaluate(element =>
    getComputedStyle(element).transitionDuration.split(',').every(duration => Number.parseFloat(duration) === 0)
  );
  assert.equal(report.reducedMotion, true, 'catalog card transitions must be disabled for reduced motion');
  await reducedPage.screenshot({ path: `${output}/catalog-reduced-motion.png`, fullPage: true });
  await reducedContext.close();

  assert.deepEqual(report.errors, [], 'browser console/page errors');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  throw error;
} finally {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}