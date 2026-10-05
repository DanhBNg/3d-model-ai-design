import { loadDroneModel } from '../../models/drone/loadModel.js';
import { createDroneController } from '../../models/drone/controller.js';
import { PART_BY_ID, MOTOR_LAYOUT } from '../../models/drone/metadata.js';
import { createStudio } from '../../viewer/studio.js';
import { createEffects } from '../../viewer/effects.js';
import { createPicking, projectSocket } from '../../viewer/picking.js';
import { mountUI, connectUI } from '../../viewer/ui.js';

export function mountDroneExperience({ onExit, modelUrl }) {
  mountUI();
  document.body.dataset.screen = 'model';
  const host = document.querySelector('#viewport');
  let studio, root, controller, effects, ui, unpick, raf = 0;
  let dead = false;
  const abort = new AbortController();

  document.querySelector('[data-exit-model]')?.addEventListener('click', (event) => {
    event.preventDefault();
    onExit?.();
  }, { signal: abort.signal });

  function dispose() {
    if (dead) return;
    dead = true;
    abort.abort();
    cancelAnimationFrame(raf);
    unpick?.();
    ui?.dispose();
    effects?.dispose();
    controller?.dispose();
    if (root && studio) {
      studio.scene.remove(root);
      root.userData.sculptRuntime.dispose();
    }
    studio?.dispose();
    if (window.__demo?.dispose === dispose) delete window.__demo;
  }

  async function start() {
    try {
      studio = createStudio(host);
      const startedAt = performance.now();
      root = await loadDroneModel({ url: modelUrl, signal: abort.signal });
      if (dead) {
        root.userData.sculptRuntime.dispose();
        return;
      }
      const runtime = root.userData.sculptRuntime;
      studio.scene.add(root);
      controller = createDroneController(root);
      effects = createEffects(runtime, studio.scene);
      ui = connectUI(controller, studio, effects);
      unpick = createPicking(studio, root, ui.selected);
      document.querySelector('#asset-stat').textContent = `${(runtime.stats.assetBytes / 1e6).toFixed(2)} MB · ${runtime.stats.drawCalls} mesh`;
      document.querySelector('#loading')?.remove();
      document.body.dataset.ready = 'true';
      const tag = document.querySelector('#part-tag');
      let last = performance.now();
      const frameTimes = [];

      function frame(now) {
        if (dead) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        frameTimes.push(now - last);
        if (frameTimes.length > 180) frameTimes.shift();
        last = now;
        controller.update(dt);
        effects.update(controller.state);
        studio.ground.visible = controller.state.explode < 0.03;
        studio.grid.visible = controller.state.explode < 0.03;
        studio.update(dt);
        ui.update(now, runtime.stats);
        const selected = controller.state.selected;
        if (selected && controller.state.mode !== 'flight' && runtime.nodes[selected].visible) {
          const point = projectSocket(runtime.sockets[selected], studio.camera, host);
          tag.hidden = !point.visible;
          tag.style.left = `${point.x + host.offsetLeft}px`;
          tag.style.top = `${point.y + host.offsetTop}px`;
          tag.querySelector('b').textContent = PART_BY_ID[selected].name;
        } else {
          tag.hidden = true;
        }
        for (const motor of MOTOR_LAYOUT) {
          const label = document.getElementById(`tag-${motor.id}`);
          const point = projectSocket(runtime.sockets[`prop_${motor.id}`], studio.camera, host);
          label.hidden = controller.state.mode !== 'flight' || controller.state.transition || !point.visible;
          label.style.left = `${point.x}px`;
          label.style.top = `${point.y + 12}px`;
        }
        raf = requestAnimationFrame(frame);
      }

      raf = requestAnimationFrame(frame);
      window.__demo = { root, runtime, controller, studio, ui, dispose, loadMs: performance.now() - startedAt, frameTimes };
    } catch (error) {
      if (error.name === 'AbortError' || dead) return;
      const loading = document.querySelector('#loading');
      if (loading) {
        loading.innerHTML = '<b>Chưa mở được mô hình</b><span></span><button type="button">Thử lại</button>';
        loading.querySelector('span').textContent = error.message;
        loading.querySelector('button').addEventListener('click', () => location.reload());
      }
      console.error(error);
    }
  }

  start();
  return dispose;
}
