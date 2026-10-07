import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  flowDiagram,
  flowLegend,
  modelHeader,
} from '../src/ui/model-shell/markup.js';
import { expand, pause, play, reset } from '../src/ui/model-shell/icons.js';
import { mountUI } from '../src/viewer/ui.js';
import { mountHydroUI } from '../src/experiences/hydroelectric/ui.js';
import { mountWindUI } from '../src/experiences/wind-turbine/ui.js';

function captureDroneMarkup() {
  const host = { innerHTML: '' };
  const originalDocument = globalThis.document;
  globalThis.document = {
    querySelector(selector) {
      assert.equal(selector, '#app');
      return host;
    },
  };
  try {
    mountUI();
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
  return host.innerHTML;
}

test('model shell styles define the shared theme and responsive behavior', async () => {
  const [tokens, shell, style] = await Promise.all([
    readFile(new URL('../src/ui/model-shell/tokens.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/model-shell/shell.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/style.css', import.meta.url), 'utf8'),
  ]);

  const expectedTokens = {
    '--model-bg': '#252930',
    '--model-header': '#1b1f25',
    '--model-panel': '#20252c',
    '--model-surface': '#292f37',
    '--model-ink': '#edf0f3',
    '--model-muted': '#aeb9c4',
    '--model-line': '#424b56',
    '--model-accent': '#f1a164',
    '--model-active': '#49624f',
    '--model-control': '#5ad1bd',
    '--model-radius': '10px',
    '--model-header-height': '72px',
    '--model-panel-width': '338px',
  };

  for (const [name, value] of Object.entries(expectedTokens)) {
    assert.match(tokens, new RegExp(`${name}\\s*:\\s*${value.replace('#', '\\#')}\\s*;`));
  }

  assert.match(shell, /@media\s*\(max-width:\s*720px\)/);
  assert.match(shell, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  for (const path of ['./ui/model-shell/tokens.css', './ui/model-shell/shell.css']) {
    const imports = style.match(new RegExp(`@import\\s+url\\(['"]${path.replaceAll('/', '\\/')}['"]\\);`, 'g'));
    assert.equal(imports?.length, 1, `${path} should be imported exactly once`);
  }

  const compactStart = shell.indexOf('@media (max-width: 720px)');
  const reducedMotionStart = shell.indexOf('@media (prefers-reduced-motion: reduce)');
  const desktop = shell.slice(0, compactStart);
  const compact = shell.slice(compactStart, reducedMotionStart);

  assert.match(desktop, /\.model-shell\s*\{[^}]*\bheight:\s*100dvh;[^}]*\bmin-height:\s*0;/s);
  assert.match(compact, /\.model-shell\s*\{[^}]*\bheight:\s*auto;[^}]*\bmin-height:\s*100dvh;/s);
  assert.match(shell, /\.model-shell\s+\.model-workspace\s*\{[^}]*display:\s*contents;/s);
  assert.match(desktop, /\.model-shell button\s*\{[^}]*min-height:\s*4\dpx;/s);
  assert.match(
    desktop,
    /\.model-shell \.model-brand,\s*\.model-shell \.model-header__home\s*\{[^}]*min-height:\s*4\dpx;[^}]*display:\s*inline-flex;/s,
  );
  assert.match(shell, /\.model-shell \.model-flow-diagram li:not\(:first-child\) i\s*\{/);

  const headerMarkup = modelHeader({ modeAttribute: 'mode', brand: 'MODEL', code: '01' });
  const headerClasses = [...headerMarkup.matchAll(/class="([^"]+)"/g)]
    .flatMap(([, names]) => names.split(/\s+/));
  for (const className of headerClasses) {
    assert.match(shell, new RegExp(`\\.model-shell \\.${className}(?:[\\s,{.:]|$)`));
  }
});

test('modelHeader renders the shared navigation and mode controls', () => {
  const markup = modelHeader({
    modeAttribute: 'hmode',
    brand: 'HYDRO',
    code: '01',
    principleLabel: 'Nguyên lý',
  });

  assert.match(markup, /class="model-header/);
  assert.equal(markup.match(/<button\b/g)?.length, 3);
  assert.equal(markup.match(/<button type="button"/g)?.length, 3);
  assert.match(markup, /data-hmode="explore"/);
  assert.match(markup, /data-hmode="explode"/);
  assert.match(markup, /data-hmode="principle"/);
  assert.equal(markup.match(/aria-pressed=/g)?.length, 3);
  assert.equal(markup.match(/aria-pressed="true"/g)?.length, 1);
  assert.match(markup, /data-hmode="explore" aria-pressed="true"/);
  assert.match(markup, /data-hmode="explode" aria-pressed="false"/);
  assert.match(markup, /data-hmode="principle" aria-pressed="false"/);
  assert.match(markup, /<small>01<\/small>/);
  assert.match(markup, /<small>02<\/small>/);
  assert.match(markup, /<small>03<\/small>/);
  assert.match(markup, /data-exit-model/);
  assert.match(markup, /href="\/"/);
  assert.match(markup, /HYDRO/);
  assert.match(markup, /\/ 01/);
  assert.match(markup, /INTERACTIVE LAB/);
});

test('modelHeader supplies the default principle label and edition version', () => {
  const markup = modelHeader({ modeAttribute: 'mode', brand: 'MODEL', code: '02' });

  assert.match(markup, /Nguyên lý/);
  assert.match(markup, /V\.02/);
});

test('modelHeader supports an explicit third mode value', () => {
  const markup = modelHeader({
    modeAttribute: 'mode',
    brand: 'AERO',
    code: 'Q4',
    principleLabel: 'Flight principle',
    thirdModeValue: 'flight',
  });

  assert.match(markup, /data-mode="flight" aria-pressed="false"/);
  assert.doesNotMatch(markup, /data-mode="principle"/);
});


test('flowDiagram renders escaped stages in order with arrow separators', () => {
  const markup = flowDiagram(['Pin & cell', '<ESC>', 'Motor']);

  assert.match(markup, /^<ol class="model-flow-diagram" aria-label="Chuỗi chuyển đổi năng lượng">/);
  assert.match(markup, /<\/ol>$/);
  assert.equal(markup.match(/<li\b/g)?.length, 3);
  assert.equal(markup.match(/<i\b/g)?.length, 2);
  assert.equal(markup.match(/<i aria-hidden="true">/g)?.length, 2);
  assert.match(markup, /Pin &amp; cell/);
  assert.match(markup, /&lt;ESC&gt;/);
  assert.ok(markup.indexOf('Pin &amp; cell') < markup.indexOf('&lt;ESC&gt;'));
  assert.ok(markup.indexOf('&lt;ESC&gt;') < markup.indexOf('Motor'));
});


test('flowDiagram renders an escaped accessible label override', () => {
  const markup = flowDiagram(['Controller', 'ESC'], 'Control & <command> chain');

  assert.match(markup, /aria-label="Control &amp; &lt;command&gt; chain"/);
});

test('flowLegend renders escaped labels and semantic kind classes', () => {
  const markup = flowLegend([{ label: 'Năng lượng & điện', kind: 'energy' }]);

  assert.match(markup, /^<ul class="model-flow-legend" aria-label="Chú giải luồng">/);
  assert.match(markup, /<\/ul>$/);
  assert.equal(markup.match(/<li\b/g)?.length, 1);
  assert.match(markup, /model-flow-dot--energy/);
  assert.match(markup, /Năng lượng &amp; điện/);
  assert.throws(
    () => flowLegend([{ label: 'Unsafe', kind: 'energy"><script' }]),
    /kind/,
  );
});

test('model shell markup escapes text and rejects unsafe attribute names', () => {
  const markup = modelHeader({
    modeAttribute: 'safe-mode',
    brand: '&<>"',
    code: '01',
  });

  assert.match(markup, /&amp;&lt;&gt;&quot;/);
  assert.throws(
    () => modelHeader({ modeAttribute: 'mode&<>"', brand: 'X', code: '01' }),
    /modeAttribute/,
  );
});

test('icons exports all shared SVG controls', () => {
  for (const icon of [play, pause, reset, expand]) {
    assert.match(icon, /^<svg\b/);
    assert.match(icon, /viewBox="0 0 24 24"/);
    assert.match(icon, /aria-hidden="true"/);
    assert.match(icon, /focusable="false"/);
    assert.match(icon, /<path\b[^>]*\bd="[^"]+"\/>/);
    assert.match(icon, /<\/svg>$/);
  }
  assert.equal(new Set([play, pause, reset, expand]).size, 4);
});

test('drone viewer adopts the shared model shell markup contract', async () => {
  const markup = captureDroneMarkup();
  const source = await readFile(new URL('../src/viewer/ui.js', import.meta.url), 'utf8');
  const requiredClasses = [
    'model-shell',
    'model-header',
    'model-workspace',
    'model-stage',
    'model-inspector',
    'model-explode-card',
    'model-flow-diagram',
    'model-flow-legend',
    'model-playback',
    'model-bottom-bar',
  ];

  for (const className of requiredClasses) {
    assert.match(markup, new RegExp(`class="[^"]*\\b${className}\\b`), `${className} should be present`);
  }
  assert.equal(markup.match(/class="[^"]*\bmodel-shell\b/g)?.length, 1);
  assert.match(source, /import\s*\{[^}]*\bmodelHeader\b[^}]*\}\s*from\s*['"]\.\.\/ui\/model-shell\/markup\.js['"]/s);
  assert.match(markup, /AERO/);
  assert.match(markup, /\/ Q4/);
  assert.match(markup, /V\.02/);
  assert.ok(markup.includes('Nguy\u00ean l\u00fd bay'));
  assert.match(markup, /<ol class="model-flow-diagram"/);
  assert.match(markup, /<ul class="model-flow-legend"/);
  assert.match(markup, /data-flow="energy" class="active" aria-pressed="true"/);
  assert.match(markup, /data-flow="control" aria-pressed="false"/);
  assert.match(markup, /data-flow="both" aria-pressed="false"/);
  assert.ok(markup.includes('aria-label="Chu\u1ed7i chuy\u1ec3n \u0111\u1ed5i n\u0103ng l\u01b0\u1ee3ng"'));
  assert.match(source, /thirdModeValue\s*:\s*['"]flight['"]/);
  assert.doesNotMatch(source, /\.replace\(['"]data-mode=/);
  assert.match(source, /import\s*\{[^}]*\bicons\b[^}]*\}\s*from\s*['"]\.\.\/ui\/model-shell\/icons\.js['"]/s);
  assert.doesNotMatch(source, /const\s+icons\s*=/);
  assert.match(source, /\$\('flow-diagram'\)\.innerHTML\s*=\s*flowDiagram\(/);
  assert.match(source, /btn\.setAttribute\(['"]aria-pressed['"],\s*active\)/);
});

test('drone shared shell preserves controller and navigation hooks', () => {
  const markup = captureDroneMarkup();
  const ids = [
    'viewport', 'intro-copy', 'stage-status', 'fit', 'part-tag', 'motor-labels',
    'loading', 'transition', 'explode-controls', 'explode-value', 'explode-slider',
    'auto', 'explode-reset', 'flight-legend', 'explore-panel', 'part-name',
    'part-index', 'part-description', 'material-row', 'part-material', 'covers',
    'isolate', 'gimbal-control', 'gimbal-tilt', 'gimbal-value', 'flight-panel',
    'flow-diagram', 'flow-copy', 'flight-phase', 'scenario-subtitle',
    'scenario-description', 'play', 'slow', 'flight-reset', 'flight-clock',
    'asset-stat', 'render-stat',
  ];

  for (const id of ids) assert.match(markup, new RegExp(`id="${id}"`), `${id} should be preserved`);
  for (const mode of ['explore', 'explode', 'flight']) {
    assert.match(markup, new RegExp(`data-mode="${mode}"`), `data-mode=${mode} should be preserved`);
  }
  assert.ok((markup.match(/data-part="/g)?.length ?? 0) > 0);
  assert.match(markup, /data-exit-model/);
});


function captureExperienceMarkup(mount) {
  const host = { innerHTML: '' };
  mount(host);
  return host.innerHTML;
}

for (const experience of [
  { name:'hydroelectric', mount:mountHydroUI, file:'hydroelectric', mode:'hmode', part:'hpart', brand:'HYDRO', code:'01', ids:['hydro-viewport','hydro-fit','hydro-loading','hydro-explode-panel','hydro-assemble','hydro-principle-panel','hydro-play','hydro-reset'] },
  { name:'wind turbine', mount:mountWindUI, file:'wind-turbine', mode:'wmode', part:'wpart', brand:'VENTO', code:'03', ids:['wind-viewport','wind-loading','wind-explode-panel','wind-principle-panel','wind-play','wind-reset'] },
]) {
  test(`${experience.name} adopts the shared shell and preserves hooks`, async () => {
    const markup=captureExperienceMarkup(experience.mount);
    const source=await readFile(new URL(`../src/experiences/${experience.file}/ui.js`,import.meta.url),'utf8');
    for(const name of ['model-shell','model-header','model-workspace','model-stage','model-inspector','model-view-tools','model-explode-card','model-flow-diagram','model-flow-legend','model-playback','model-loading','model-bottom-bar']) assert.match(markup,new RegExp(`class="[^"]*\\b${name}\\b`));
    assert.match(source,/import\s*\{[^}]*flowDiagram[^}]*flowLegend[^}]*modelHeader[^}]*\}\s*from\s*['"]\.\.\/\.\.\/ui\/model-shell\/markup\.js['"]/s);
    assert.match(source,new RegExp(`modelHeader\\(\\{modeAttribute:['"]${experience.mode}['"],brand:['"]${experience.brand}['"],code:['"]${experience.code}['"],principleLabel:['"]Nguy\\u00ean l\\u00fd['"],version:['"]V\\.02['"]\\}\\)`));
    for(const label of ['Khám phá','Tách cấu tạo','Nguyên lý']) assert.ok(markup.includes(label));
    for(const id of experience.ids) assert.match(markup,new RegExp(`id="${id}"`));
    for(const mode of ['explore','explode','principle']) assert.match(markup,new RegExp(`data-${experience.mode}="${mode}"`));
    assert.ok(markup.includes(`data-${experience.part}="`));
  });
}
