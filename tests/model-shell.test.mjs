import test from 'node:test';
import assert from 'node:assert/strict';

import {
  flowDiagram,
  flowLegend,
  modelHeader,
} from '../src/ui/model-shell/markup.js';

test('modelHeader renders the shared navigation and mode controls', () => {
  const markup = modelHeader({
    modeAttribute: 'hmode',
    brand: 'HYDRO',
    code: '01',
    principleLabel: 'Nguyên lý',
  });

  assert.match(markup, /class="model-header/);
  assert.match(markup, /data-hmode="explore"/);
  assert.equal(markup.match(/aria-pressed=/g)?.length, 3);
  assert.match(markup, /data-exit-model/);
});

test('flowDiagram renders each stage in order', () => {
  const markup = flowDiagram(['Pin', 'ESC', 'Motor']);

  assert.ok(markup.indexOf('Pin') < markup.indexOf('ESC'));
  assert.ok(markup.indexOf('ESC') < markup.indexOf('Motor'));
});

test('flowLegend renders a semantic kind class', () => {
  const markup = flowLegend([{ label: 'Năng lượng', kind: 'energy' }]);

  assert.match(markup, /model-flow-dot--energy/);
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
