import test from 'node:test';
import assert from 'node:assert/strict';

import {
  flowDiagram,
  flowLegend,
  modelHeader,
} from '../src/ui/model-shell/markup.js';
import { expand, pause, play, reset } from '../src/ui/model-shell/icons.js';

test('modelHeader renders the shared navigation and mode controls', () => {
  const markup = modelHeader({
    modeAttribute: 'hmode',
    brand: 'HYDRO',
    code: '01',
    principleLabel: 'Nguyên lý',
  });

  assert.match(markup, /class="model-header/);
  assert.equal(markup.match(/<button\b/g)?.length, 3);
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

test('flowDiagram renders escaped stages in order with arrow separators', () => {
  const markup = flowDiagram(['Pin & cell', '<ESC>', 'Motor']);

  assert.match(markup, /class="model-flow-diagram"/);
  assert.equal(markup.match(/<i\b/g)?.length, 2);
  assert.match(markup, /Pin &amp; cell/);
  assert.match(markup, /&lt;ESC&gt;/);
  assert.ok(markup.indexOf('Pin &amp; cell') < markup.indexOf('&lt;ESC&gt;'));
  assert.ok(markup.indexOf('&lt;ESC&gt;') < markup.indexOf('Motor'));
});

test('flowLegend renders escaped labels and semantic kind classes', () => {
  const markup = flowLegend([{ label: 'Năng lượng & điện', kind: 'energy' }]);

  assert.match(markup, /class="model-flow-legend"/);
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
    assert.match(icon, /<\/svg>$/);
  }
});
