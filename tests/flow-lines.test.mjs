import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { FLOW_STYLE, createFlowLines } from '../src/viewer/flowLines.js';

test('principle arrows use the unified slightly enlarged drone style', () => {
  assert.deepEqual(FLOW_STYLE, {
    trackWidth: 2.2,
    outlineExtra: 1,
    headLengthRatio: 0.32,
    headWidthRatio: 0.14,
    shaftLengthRatio: 1,
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


test('moving flow arrows use the same line-and-cone construction as drone ArrowHelper', () => {
  const curve = new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(1, 0, 0));
  const flow = createFlowLines(curve, { count: 2, size: 0.1 });
  const arrowHelpers = flow.group.children.filter(child => child.type === 'ArrowHelper');
  assert.equal(arrowHelpers.length, 2);
  for (const arrow of arrowHelpers) {
    assert.equal(arrow.line.isLine, true);
    assert.equal(arrow.cone.isMesh, true);
    assert.ok(arrow.cone.scale.x <= 0.015);
    assert.ok(arrow.cone.scale.y <= 0.032);
  }
  flow.dispose();
});
test('wind trails reuse the shared drone-style arrow helper instead of drawing oversized V heads', async () => {
  const source = await readFile('src/experiences/wind-turbine/effects.js', 'utf8');
  assert.match(source, /createFlowArrow/);
  assert.doesNotMatch(source, /x\s*-\s*\.45[\s\S]*z\s*[+-]\s*\.22/);
});