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

test('catalog markup makes every available model card a clean-route link', async () => {
  const { renderCatalogMarkup } = await import('../src/catalog/catalogView.js');
  const markup = renderCatalogMarkup();
  const cards = [...markup.matchAll(/<a class="catalog-card" href="([^"]+)" data-open-model="([^"]+)">/g)];
  assert.deepEqual(cards.map((match) => match[2]), [
    'drone',
    'hydroelectric',
    'wind-turbine',
    'thermal-power',
    'wireless-charging',
    'inline-four-engine',
  ]);
  assert.deepEqual(cards.map((match) => match[1]), [
    '/models/drone',
    '/models/hydroelectric',
    '/models/wind-turbine',
    '/models/thermal-power',
    '/models/wireless-charging',
    '/models/inline-four-engine',
  ]);
  assert.equal((markup.match(/<span class="catalog-card__action">/g) ?? []).length, 6);
  assert.doesNotMatch(markup, /<button/);
});

test('catalog model links preserve a deployment base path', async () => {
  const { renderCatalogMarkup } = await import('../src/catalog/catalogView.js');
  const markup = renderCatalogMarkup('/collection/');
  assert.match(markup, /href="\/collection\/models\/drone" data-open-model="drone"/);
});

test('catalog interception preserves native hosted link gestures and supports file exports', async () => {
  const { shouldInterceptCatalogNavigation } = await import('../src/catalog/catalogView.js');
  const link = { target: '' };
  const event = (overrides = {}) => ({
    button: 0,
    defaultPrevented: false,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  });

  assert.equal(shouldInterceptCatalogNavigation(event(), link, 'https:'), true);
  assert.equal(shouldInterceptCatalogNavigation(event({ ctrlKey: true }), link, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event({ metaKey: true }), link, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event({ shiftKey: true }), link, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event({ altKey: true }), link, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event({ button: 1 }), link, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event({ defaultPrevented: true }), link, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event(), { target: '_blank' }, 'https:'), false);
  assert.equal(shouldInterceptCatalogNavigation(event({ ctrlKey: true }), link, 'file:'), true);
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

test('catalog styles apply responsive card-link interactions without nested-button selectors', async () => {
  const css = await readFile(new URL('../src/catalog/catalog.css', import.meta.url), 'utf8');
  assert.match(css, /\.catalog-card\{[^}]*color:inherit[^}]*text-decoration:none/);
  assert.match(css, /a\.catalog-card:hover,a\.catalog-card:focus-visible/);
  assert.doesNotMatch(css, /\.catalog-card--pending:hover/);
  assert.match(css, /@media\(min-width:1280px\)\{\.catalog-grid\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(css, /:has\(/);
  assert.match(css, /\.catalog-card__action\{[^}]*min-height:40px/);
});
