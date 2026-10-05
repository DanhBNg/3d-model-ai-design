import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const droneAsset = readFileSync('public/models/drone.glb');
const droneImage = readFileSync('public/images/catalog/drone.png');
const hydroImage = readFileSync('public/images/catalog/hydroelectric.png');
const hydroAsset = readFileSync('public/models/hydroelectric.glb');
const windAsset = readFileSync('public/models/wind-turbine.glb');
const thermalAsset = readFileSync('public/models/thermal-power.glb');
const thermalImage = readFileSync('public/images/catalog/thermal-power.png');
const windImage = readFileSync('public/images/catalog/wind-turbine.png');
const dataUrl = (mime, data) => `data:${mime};base64,${data.toString('base64')}`;
const embedded = {
  model: dataUrl('model/gltf-binary', droneAsset),
  droneImage: dataUrl('image/png', droneImage),
  hydroImage: dataUrl('image/png', hydroImage),
  hydroModel: dataUrl('model/gltf-binary', hydroAsset),
  windModel: dataUrl('model/gltf-binary', windAsset),
  thermalModel: dataUrl('model/gltf-binary', thermalAsset),
  thermalImage: dataUrl('image/png', thermalImage),
  windImage: dataUrl('image/png', windImage),
};

const result = await build({
  configFile: false,
  publicDir: false,
  base: './',
  plugins: [{
    name: 'embed-collection-assets',
    enforce: 'pre',
    transform(code, id) {
      const path = id.replaceAll('\\', '/');
      if (path.endsWith('/src/main.js')) {
        const source = "modelUrl: `${import.meta.env.BASE_URL}models/drone.glb`";
        if (!code.includes(source)) throw new Error('Model URL changed; update offline exporter.');
        code = code.replace(source, `modelUrl: ${JSON.stringify(embedded.model)}`);
        const hydroSource = "modelUrl: `${import.meta.env.BASE_URL}models/hydroelectric.glb`";
        if (!code.includes(hydroSource)) throw new Error('Hydro model URL changed; update offline exporter.');
        code = code.replace(hydroSource, `modelUrl: ${JSON.stringify(embedded.hydroModel)}`);
        const windSource = "modelUrl: `${import.meta.env.BASE_URL}models/wind-turbine.glb`";
        if (!code.includes(windSource)) throw new Error('Wind URL changed; update offline exporter.');
        code = code.replace(windSource, `modelUrl: ${JSON.stringify(embedded.windModel)}`);
        const thermalSource = "modelUrl: `${import.meta.env.BASE_URL}models/thermal-power.glb`";
        if (!code.includes(thermalSource)) throw new Error('Thermal URL changed; update offline exporter.');
        return code.replace(thermalSource, `modelUrl: ${JSON.stringify(embedded.thermalModel)}`);
      }
      if (path.endsWith('/src/catalog/models.js')) {
        for (const [source, replacement] of [
          ["images/catalog/drone.png", embedded.droneImage],
          ["images/catalog/hydroelectric.png", embedded.hydroImage],
          ["images/catalog/wind-turbine.png", embedded.windImage],
          ["images/catalog/thermal-power.png", embedded.thermalImage],
        ]) {
          if (!code.includes(source)) throw new Error(`Catalog asset changed: ${source}`);
          code = code.replace(source, replacement);
        }
        return code;
      }
    },
  }],
  build: {
    write: false,
    minify: true,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
    chunkSizeWarningLimit: 8000,
  },
});

const output = result.output;
const scripts = output.filter((entry) => entry.type === 'chunk');
if (scripts.length !== 1 || scripts[0].imports.length || scripts[0].dynamicImports.length) {
  throw new Error('Offline HTML must have one self-contained script.');
}
const css = output.filter((entry) => entry.type === 'asset' && entry.fileName.endsWith('.css')).map((entry) => entry.source).join('\n');
const js = scripts[0].code.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171a1f"><title>Bộ sưu tập mô hình 3D</title><style>${css}</style></head><body><div id="app"></div><script type="module">${js}</script></body></html>`;
const file = 'Model-Collection.html';
mkdirSync('output/share', { recursive: true });
writeFileSync(`output/share/${file}`, html);
writeFileSync('output/share/export-report.json', JSON.stringify({
  file,
  bytes: Buffer.byteLength(html),
  sha256: createHash('sha256').update(html).digest('hex'),
  assetSha256: createHash('sha256').update(droneAsset).digest('hex'),
  hydroAssetSha256: createHash('sha256').update(hydroAsset).digest('hex'),
  windAssetSha256: createHash('sha256').update(windAsset).digest('hex'),
  thermalAssetSha256: createHash('sha256').update(thermalAsset).digest('hex'),
}, null, 2));
console.log(`Created output/share/${file} (${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB)`);
