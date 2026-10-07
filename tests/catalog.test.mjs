import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('catalog exposes six ready models', async () => {
  const { MODEL_CATALOG, getModelById } = await import('../src/catalog/models.js');
  assert.deepEqual(MODEL_CATALOG.map((model) => model.id), ['drone', 'hydroelectric', 'wind-turbine', 'thermal-power', 'wireless-charging', 'inline-four-engine']);
  assert.equal(getModelById('inline-four-engine').available, true);
  assert.equal(getModelById('wireless-charging').available, true);
  assert.equal(getModelById('thermal-power').available, true);
  assert.equal(getModelById('wind-turbine').available, true);
  assert.equal(getModelById('drone').available, true);
  assert.equal(getModelById('hydroelectric').available, true);
  assert.equal(getModelById('missing'), undefined);
});

test('router uses clean paths and falls back from unknown model routes', async () => {
  const { resolveRoute, pathForModel } = await import('../src/app/router.js');
  assert.deepEqual(resolveRoute('/'), { name: 'catalog' });
  assert.deepEqual(resolveRoute('/models/drone'), { name: 'model', modelId: 'drone' });
  assert.deepEqual(resolveRoute('/models/hydroelectric'), { name: 'model', modelId: 'hydroelectric' });
  assert.deepEqual(resolveRoute('/models/wind-turbine'), { name: 'model', modelId: 'wind-turbine' });
  assert.deepEqual(resolveRoute('/unknown/path'), { name: 'catalog' });
  assert.equal(pathForModel('drone'), '/models/drone');
  assert.equal(pathForModel('drone').includes('#'), false);
});

test('router accepts a deployment base path without leaking it into model ids', async () => {
  const { resolveRoute, pathForModel } = await import('../src/app/router.js');
  assert.deepEqual(resolveRoute('/collection/models/drone', '/collection/'), { name: 'model', modelId: 'drone' });
  assert.deepEqual(resolveRoute('/collection/', '/collection/'), { name: 'catalog' });
  assert.equal(pathForModel('drone', '/collection/'), '/collection/models/drone');
});

test('catalog markup exposes both working model entries', async () => {
  const { renderCatalogMarkup } = await import('../src/catalog/catalogView.js');
  const markup = renderCatalogMarkup();
  assert.match(markup, /data-open-model="drone"/);
  assert.match(markup, /Mở mô hình/);
  assert.match(markup, /Nhà máy thủy điện/);
  assert.match(markup, /data-open-model="hydroelectric"/);
  assert.doesNotMatch(markup, /Đang chuẩn bị/);
});

test('catalog asset URLs support both hosted paths and embedded offline data', async () => {
  const { resolveCatalogAsset } = await import('../src/catalog/catalogView.js');
  assert.equal(resolveCatalogAsset('images/catalog/drone.png', '/demo/'), '/demo/images/catalog/drone.png');
  assert.equal(resolveCatalogAsset('data:image/png;base64,abc', './'), 'data:image/png;base64,abc');
});

test('application keeps routing outside the drone experience and exposes collection return', async () => {
  const [main, viewerUi] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/viewer/ui.js', import.meta.url), 'utf8'),
  ]);
  assert.match(main, /mountDroneExperience/);
  assert.match(main, /popstate/);
  assert.match(viewerUi, /data-exit-model/);
});
