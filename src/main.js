import { mountCatalog } from './catalog/catalogView.js';
import { catalogPath, pathForModel, resolveRoute } from './app/router.js';
import { mountDroneExperience } from './experiences/drone/index.js';
import { mountHydroExperience } from './experiences/hydroelectric/index.js';
import { mountWindExperience } from './experiences/wind-turbine/index.js';
import { mountThermalExperience } from './experiences/thermal-power/index.js';
import { mountWirelessExperience } from './experiences/wireless-charging/index.js';
import { mountEngineExperience } from './experiences/inline-four-engine/index.js';
import './style.css';
import './catalog/catalog.css';
import './viewer/theme.css';

const app = document.querySelector('#app');
const base = import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL : '/';
const isFile = location.protocol === 'file:';
let disposeScreen = () => {};

function showRoute(route) {
  disposeScreen();
  app.replaceChildren();
  delete document.body.dataset.ready;
  if (route.name === 'model' && route.modelId === 'inline-four-engine') {
    document.title = 'IGNIS 06 — Động cơ bốn xi-lanh';
    disposeScreen = mountEngineExperience({
      modelUrl: `${import.meta.env.BASE_URL}models/inline-four-engine.glb`,
      onExit: () => navigate({ name: 'catalog' }),
    });
    return;
  }
  if (route.name === 'model' && route.modelId === 'wireless-charging') {
    document.title = 'FLUX 05 — Sạc không dây';
    disposeScreen = mountWirelessExperience({
      modelUrl: `${import.meta.env.BASE_URL}models/wireless-charging.glb`,
      onExit: () => navigate({ name: 'catalog' }),
    });
    return;
  }
  if (route.name === 'model' && route.modelId === 'thermal-power') {
    document.title = 'THERMO 04 — Nhà máy nhiệt điện';
    disposeScreen = mountThermalExperience({
      modelUrl: `${import.meta.env.BASE_URL}models/thermal-power.glb`,
      onExit: () => navigate({ name: 'catalog' }),
    });
    return;
  }
  if (route.name === 'model' && route.modelId === 'wind-turbine') {
    document.title = 'VENTO 03 — Tua-bin gió';
    disposeScreen = mountWindExperience({
      modelUrl: `${import.meta.env.BASE_URL}models/wind-turbine.glb`,
      onExit: () => navigate({ name: 'catalog' }),
    });
    return;
  }
  if (route.name === 'model' && route.modelId === 'hydroelectric') {
    document.title = 'HYDRO 01 — Nhà máy thủy điện';
    disposeScreen = mountHydroExperience({
      modelUrl: `${import.meta.env.BASE_URL}models/hydroelectric.glb`,
      onExit: () => navigate({ name: 'catalog' }),
    });
    return;
  }
  if (route.name === 'model' && route.modelId === 'drone') {
    document.title = 'AERO Q4 — Khám phá cấu tạo drone';
    disposeScreen = mountDroneExperience({
      modelUrl: `${import.meta.env.BASE_URL}models/drone.glb`,
      onExit: () => navigate({ name: 'catalog' }),
    });
    return;
  }
  document.title = 'Bộ sưu tập mô hình 3D';
  disposeScreen = mountCatalog({
    root: app,
    baseUrl: import.meta.env.BASE_URL,
    onOpen: (modelId) => navigate({ name: 'model', modelId }),
  });
}

function navigate(route, { replace = false } = {}) {
  if (!isFile) {
    const path = route.name === 'model' ? pathForModel(route.modelId, base) : catalogPath(base);
    history[replace ? 'replaceState' : 'pushState']({}, '', path);
  }
  showRoute(route);
}

function routeFromLocation() {
  return isFile ? { name: 'catalog' } : resolveRoute(location.pathname, base);
}

window.addEventListener('popstate', () => showRoute(routeFromLocation()));
window.addEventListener('pagehide', () => disposeScreen(), { once: true });
if (import.meta.hot) import.meta.hot.dispose(() => disposeScreen());
showRoute(routeFromLocation());
