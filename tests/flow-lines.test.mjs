import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FLOW_STYLE } from '../src/viewer/flowLines.js';

test('principle arrows use the unified slightly enlarged drone style', () => {
  assert.deepEqual(FLOW_STYLE, {
    trackWidth: 2.2,
    arrowWidth: 3.1,
    outlineExtra: 2.2,
    headScale: 2.7,
    headSpread: 0.48,
  });
});

test('directed-flow effects use the shared line renderer instead of point particles', async () => {
  const files = [
    'src/experiences/hydroelectric/effects.js',
    'src/experiences/hydroelectric/water.js',
    'src/experiences/wind-turbine/effects.js',
    'src/experiences/thermal-power/effects.js',
    'src/experiences/wireless-charging/effects.js',
    'src/experiences/inline-four-engine/effects.js',
  ];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /createFlowLines|createStroke/, `${file} must use shared line arrows`);
    assert.doesNotMatch(source, /PointsMaterial|SpriteMaterial|particle(?:Dot|Flow)/i, `${file} must not use directed-flow dots`);
  }
});

