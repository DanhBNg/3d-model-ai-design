# Unified Model Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete catalog card open its model and give all six detail experiences one drone-derived shell, control language, and principle-flow treatment without changing model mechanics.

**Architecture:** Add a small framework-free presentation package under `src/ui/model-shell/` that exports shared markup helpers, icons, and CSS tokens. Each experience retains its controller, studio, effects, and model-specific state binding, while its UI adds the shared semantic classes and uses shared header, explode, flow-diagram, legend, and playback primitives. Migrate one model at a time and preserve current IDs/data attributes so behavior tests remain meaningful.

**Tech Stack:** Vanilla JavaScript ES modules, CSS, Three.js 0.180, Vite, Node test runner, Playwright/Chrome, standalone HTML exporter.

---

### Task 1: Lock the shared shell contract with tests

**Files:**
- Create: `tests/model-shell.test.mjs`
- Create: `src/ui/model-shell/markup.js`
- Create: `src/ui/model-shell/icons.js`

- [ ] **Step 1: Write failing tests for semantic shared markup**

Test exact exports and accessibility instead of snapshots:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { modelHeader, flowDiagram, flowLegend } from '../src/ui/model-shell/markup.js';

test('model header exposes identity and three pressed-state modes', () => {
  const html = modelHeader({ modeAttribute: 'hmode', brand: 'HYDRO', code: '01', principleLabel: 'Nguyên lý' });
  assert.match(html, /class="model-header/);
  assert.match(html, /data-hmode="explore"/);
  assert.equal((html.match(/aria-pressed=/g) || []).length, 3);
  assert.match(html, /data-exit-model/);
});

test('flow diagram and legend expose live text and semantic colors', () => {
  assert.match(flowDiagram(['Pin', 'ESC', 'Motor']), /Pin[\s\S]*ESC[\s\S]*Motor/);
  assert.match(flowLegend([{ label: 'Năng lượng', kind: 'energy' }]), /model-flow-dot--energy/);
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `node --test tests/model-shell.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/ui/model-shell/markup.js`.

- [ ] **Step 3: Implement focused markup helpers**

Create pure functions with escaped fixed configuration values and no DOM side effects:

```js
export function modelHeader({ modeAttribute, brand, code, principleLabel = 'Nguyên lý', version = 'V.02' }) {
  const modes = [['explore', 'Khám phá'], ['explode', 'Tách cấu tạo'], ['principle', principleLabel]];
  return `<header class="model-header">
    <a class="model-brand" href="/" data-exit-model><strong>${brand}<span> / ${code}</span></strong><small>← Bộ sưu tập</small></a>
    <nav class="model-mode-tabs" aria-label="Chế độ mô hình">${modes.map(([id, label], index) =>
      `<button data-${modeAttribute}="${id}" aria-pressed="${index === 0}"><span>0${index + 1}</span>${label}</button>`).join('')}</nav>
    <div class="model-edition"><i></i> INTERACTIVE LAB <b>${version}</b></div>
  </header>`;
}

export function flowDiagram(items) {
  return `<div class="model-flow-diagram">${items.map((item, index) =>
    `${index ? '<i aria-hidden="true">→</i>' : ''}<span>${item}</span>`).join('')}</div>`;
}

export function flowLegend(items) {
  return `<div class="model-flow-legend">${items.map(({ label, kind }) =>
    `<span><i class="model-flow-dot model-flow-dot--${kind}"></i>${label}</span>`).join('')}</div>`;
}
```

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/model-shell.test.mjs`

Expected: all tests in the file PASS.

- [ ] **Step 5: Commit the shared markup contract**

```powershell
git add tests/model-shell.test.mjs src/ui/model-shell/markup.js src/ui/model-shell/icons.js
git commit -m "feat: define shared model shell markup"
```

### Task 2: Add drone-derived design tokens and shared shell CSS

**Files:**
- Create: `src/ui/model-shell/tokens.css`
- Create: `src/ui/model-shell/shell.css`
- Modify: `src/style.css`
- Test: `tests/model-shell.test.mjs`

- [ ] **Step 1: Add a failing source-level token test**

```js
import { readFile } from 'node:fs/promises';

test('shared shell owns the drone-derived tokens and compact breakpoint', async () => {
  const tokens = await readFile('src/ui/model-shell/tokens.css', 'utf8');
  const shell = await readFile('src/ui/model-shell/shell.css', 'utf8');
  for (const token of ['--model-bg', '--model-panel', '--model-line', '--model-accent', '--model-muted']) {
    assert.match(tokens, new RegExp(token));
  }
  assert.match(shell, /@media\s*\(max-width:\s*720px\)/);
  assert.match(shell, /prefers-reduced-motion/);
}
```

- [ ] **Step 2: Run the test and confirm it fails because the CSS files do not exist**

Run: `node --test tests/model-shell.test.mjs`

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Implement the token layer**

Use the drone values as the only shared source:

```css
:root {
  --model-bg:#252930;
  --model-header:#1b1f25;
  --model-panel:#20252c;
  --model-surface:#292f37;
  --model-ink:#edf0f3;
  --model-muted:#aeb9c4;
  --model-line:#424b56;
  --model-accent:#f1a164;
  --model-active:#49624f;
  --model-control:#5ad1bd;
  --model-radius:10px;
  --model-header-height:72px;
  --model-panel-width:338px;
}
```

Implement `.model-shell`, `.model-header`, `.model-mode-tabs`, `.model-stage`, `.model-inspector`, `.model-view-tools`, `.model-explode-card`, `.model-flow-diagram`, `.model-flow-legend`, `.model-playback`, `.model-bottom-bar`, shared button/range/focus/loading styles, and the 720 px stacked layout. Add `@media (prefers-reduced-motion: reduce)` to remove decorative transitions.

- [ ] **Step 4: Import shared CSS once from `src/style.css`**

```css
@import './ui/model-shell/tokens.css';
@import './ui/model-shell/shell.css';
```

- [ ] **Step 5: Run unit tests and production build**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: Vite exits 0 with no missing CSS imports.

- [ ] **Step 6: Commit tokens and shell styles**

```powershell
git add src/ui/model-shell src/style.css tests/model-shell.test.mjs
git commit -m "feat: add shared model shell theme"
```

### Task 3: Make the entire catalog card a link and refine the grid

**Files:**
- Modify: `src/catalog/catalogView.js`
- Modify: `src/catalog/catalog.css`
- Modify: `tests/catalog.test.mjs`

- [ ] **Step 1: Replace button-only expectations with whole-card semantics**

Add assertions:

```js
assert.match(markup, /<a class="catalog-card[^>]*data-open-model="drone"[^>]*href="\/models\/drone"/);
assert.doesNotMatch(markup, /<button class="catalog-card__action"/);
assert.match(markup, /<span class="catalog-card__action"[^>]*>Mở mô hình/);
```

Also verify a supplied base path produces `/collection/models/drone`.

- [ ] **Step 2: Run the catalog test and confirm the old button markup fails**

Run: `node --test tests/catalog.test.mjs`

Expected: FAIL on missing linked-card markup.

- [ ] **Step 3: Implement semantic cards**

Change `cardMarkup(model, baseUrl)` so an available card is:

```js
const href = `${baseUrl.replace(/\/?$/, '/')}models/${model.id}`;
return `<a class="catalog-card" href="${href}" data-open-model="${model.id}">…<span class="catalog-card__action">Mở mô hình <span aria-hidden="true">↗</span></span>…</a>`;
```

Pending cards remain non-interactive `<article>` elements. Update delegated click handling to find `[data-open-model]`, prevent default only for an ordinary primary click, and preserve modifier-click browser behavior on hosted pages. Keep file-mode internal navigation supported by the existing main router.

- [ ] **Step 4: Refine the catalog without changing thumbnails**

Use `color:inherit;text-decoration:none` on cards, `:hover` and `:focus-visible` on the card itself, a three/two/one-column grid, clearer body hierarchy, 40 px minimum action height, and reduced-motion behavior. Remove `:has(button:hover)` selectors.

- [ ] **Step 5: Verify catalog behavior**

Run: `node --test tests/catalog.test.mjs`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit the catalog change**

```powershell
git add src/catalog/catalogView.js src/catalog/catalog.css tests/catalog.test.mjs
git commit -m "feat: make model cards fully navigable"
```

### Task 4: Migrate the drone reference to the shared shell contract

**Files:**
- Modify: `src/viewer/ui.js`
- Modify: `src/viewer/theme.css`
- Modify: `src/viewer/responsive.css`
- Modify: `src/experiences/drone/index.js`
- Modify: `tests/model-shell.test.mjs`

- [ ] **Step 1: Add a failing reference-fixture test**

Read `src/viewer/ui.js` and assert it contains `model-shell`, `model-header`, `model-stage`, `model-inspector`, `model-explode-card`, `model-flow-diagram`, and `model-playback` while preserving `data-mode`, `data-part`, and existing element IDs.

- [ ] **Step 2: Run the focused test and confirm missing shared classes**

Run: `node --test tests/model-shell.test.mjs`

Expected: FAIL on `model-shell`.

- [ ] **Step 3: Apply shared classes without changing event hooks**

Wrap the current header/workspace/bottom bar in `.model-shell`; add the shared classes alongside `.topbar`, `.stage`, `.inspector`, `.floating-controls`, `.flow-diagram`, `.flight-legend`, and `.flight-controls`. Keep all IDs and data attributes intact.

- [ ] **Step 4: Reduce drone theme CSS to model-specific overrides**

Delete duplicated token declarations and layout rules now owned by `shell.css`. Retain drone-only motor readouts, gimbal controls, flight scenarios, tags, and stage placement.

- [ ] **Step 5: Verify the reference experience**

Run: `npm test`

Expected: all unit tests PASS.

Run with preview active: `npm run test:browser`

Expected: drone explore/explode/flight/mobile checks PASS and no page errors.

- [ ] **Step 6: Commit the reference migration**

```powershell
git add src/viewer src/experiences/drone tests/model-shell.test.mjs
git commit -m "refactor: adopt shared shell in drone viewer"
```

### Task 5: Migrate hydroelectric and wind-turbine detail pages

**Files:**
- Modify: `src/experiences/hydroelectric/ui.js`
- Modify: `src/experiences/hydroelectric/style.css`
- Modify: `src/experiences/hydroelectric/index.js`
- Modify: `src/experiences/wind-turbine/ui.js`
- Modify: `src/experiences/wind-turbine/style.css`
- Modify: `src/experiences/wind-turbine/index.js`
- Modify: `scripts/check-hydro.mjs`
- Modify: `scripts/check-wind.mjs`
- Test: `tests/model-shell.test.mjs`

- [ ] **Step 1: Add failing source contract assertions for both experiences**

Assert each UI imports `modelHeader` or includes the shared header output path, and contains the shared stage, inspector, explode, legend, playback, and bottom-bar classes. Assert their original `data-hmode`/`data-wmode` hooks and part selectors remain.

- [ ] **Step 2: Run the test and confirm both experiences fail the shell contract**

Run: `node --test tests/model-shell.test.mjs`

Expected: FAIL naming hydro and wind.

- [ ] **Step 3: Migrate hydro markup and CSS**

Use `modelHeader({modeAttribute:'hmode',brand:'HYDRO',code:'01'})`. Add shared classes while preserving lesson controls, telemetry, cutaway, part list, and all controller calls. Keep only hydro lesson, telemetry, and water-specific CSS locally.

- [ ] **Step 4: Migrate wind markup and CSS**

Use the same shell with `VENTO / 03`; preserve wind/yaw/pitch controls, tower/nacelle views, component list, and state bindings. Keep only wind gauges and subject-specific panels locally.

- [ ] **Step 5: Update browser checks to assert shared structure and unchanged behavior**

For both scripts, assert `.model-header`, `.model-stage`, `.model-inspector`, all three modes, a complete explode/reset cycle, principle animation, catalog return, and `scrollWidth <= innerWidth` at 390 px.

- [ ] **Step 6: Verify and commit**

Run: `npm test`

Run with preview active: `npm run test:hydro`

Run with preview active: `npm run test:wind`

Expected: all commands PASS with no page or shader errors.

```powershell
git add src/experiences/hydroelectric src/experiences/wind-turbine scripts/check-hydro.mjs scripts/check-wind.mjs tests/model-shell.test.mjs
git commit -m "refactor: unify hydro and wind interfaces"
```

### Task 6: Migrate thermal-power, wireless-charging, and engine pages

**Files:**
- Modify: `src/experiences/thermal-power/ui.js`
- Modify: `src/experiences/thermal-power/style.css`
- Modify: `src/experiences/wireless-charging/ui.js`
- Modify: `src/experiences/wireless-charging/style.css`
- Modify: `src/experiences/inline-four-engine/ui.js`
- Modify: `src/experiences/inline-four-engine/style.css`
- Modify: `scripts/check-thermal.mjs`
- Modify: `scripts/check-wireless.mjs`
- Modify: `scripts/check-engine.mjs`
- Test: `tests/model-shell.test.mjs`

- [ ] **Step 1: Add failing shell assertions for all three pages**

For each source, require the shared root/header/stage/inspector/explode/playback classes and preserved model-specific mode and part selectors.

- [ ] **Step 2: Run the focused test and confirm all three fail before migration**

Run: `node --test tests/model-shell.test.mjs`

Expected: three explicit contract failures.

- [ ] **Step 3: Migrate thermal power**

Use `THERMO / 04`, retaining boiler/turbine lessons, flow filters, load/cooling controls, telemetry, operational sequencing, and educational limits. Local CSS keeps lesson cards and thermal readouts only.

- [ ] **Step 4: Migrate wireless charging**

Use `FLUX / 05`, retaining phone lift/place, charging screen, gap/alignment controls, lesson steps, coil views, and energy-state logic. Local CSS keeps display, field controls, and wireless telemetry only.

- [ ] **Step 5: Migrate inline-four engine**

Use `IGNIS / 06`, retaining the all/1/2/3/4 selector, 720-degree scrub, four-stroke buttons, timing view, RPM, and guide action. Local CSS keeps cylinder cards and cycle readouts only.

- [ ] **Step 6: Expand browser checks**

Each script asserts shared shell presence, three modes, explode-to-principle assembly, its defining subject-specific interaction, clean disposal, and 390 px mobile overflow.

- [ ] **Step 7: Verify and commit**

Run: `npm test`

Run with preview active: `npm run test:thermal`

Run with preview active: `npm run test:wireless`

Run with preview active: `npm run test:engine`

Expected: all PASS and no page/shader errors.

```powershell
git add src/experiences/thermal-power src/experiences/wireless-charging src/experiences/inline-four-engine scripts/check-thermal.mjs scripts/check-wireless.mjs scripts/check-engine.mjs tests/model-shell.test.mjs
git commit -m "refactor: unify thermal wireless and engine interfaces"
```

### Task 7: Standardize and slightly enlarge all principle arrows

**Files:**
- Modify: `src/viewer/flowLines.js`
- Modify: `src/experiences/hydroelectric/effects.js`
- Modify: `src/experiences/hydroelectric/water.js`
- Modify: `src/experiences/wind-turbine/effects.js`
- Modify: `src/experiences/thermal-power/effects.js`
- Modify: `src/experiences/wireless-charging/effects.js`
- Modify: `src/experiences/inline-four-engine/effects.js`
- Create: `tests/flow-lines.test.mjs`

- [ ] **Step 1: Write failing tests for shared line defaults**

Export a constant and test exact values:

```js
import { FLOW_STYLE } from '../src/viewer/flowLines.js';

test('principle arrows use the unified slightly enlarged drone style', () => {
  assert.deepEqual(FLOW_STYLE, {
    trackWidth: 2.2,
    trackWidth: 2.2,
    outlineExtra: 2.2,
    headLengthRatio: 0.32,
    headWidthRatio: 0.14
  });
});
```

Read each effects source and reject directed-flow implementations using `PointsMaterial`, `SpriteMaterial`, or particle-dot helper names.

- [ ] **Step 2: Run the test and verify missing `FLOW_STYLE` fails**

Run: `node --test tests/flow-lines.test.mjs`

Expected: FAIL because the export is missing.

- [ ] **Step 3: Implement the new shared defaults**

In `flowLines.js`:

```js
export const FLOW_STYLE = Object.freeze({
  trackWidth: 2.2,
  trackWidth: 2.2,
  outlineExtra: 2.2,
  headLengthRatio: 0.32,
  headSpread: .48
});
```

Use these values in `createStroke` and `createFlowLines`; retain the dark backing stroke and open arrowheads. Keep per-model `size`, count, speed, opacity, and depth-test inputs.

- [ ] **Step 4: Convert remaining directed-flow dots to line arrows**

Reuse `createFlowLines`/`createStroke` for water, electricity, heat/steam, magnetic transfer, intake/exhaust, and wind flow. Do not replace combustion glow, water surfaces, magnetic field loops, sparks, smoke, or other non-directional effects solely because they are animated.

- [ ] **Step 5: Verify effects and visual behavior**

Run: `node --test tests/flow-lines.test.mjs tests/*.test.mjs`

Expected: PASS.

Run every browser check and capture principle screenshots. Inspect that arrows remain readable over pale machinery without becoming heavy, and that zoomed views do not show oversized heads.

- [ ] **Step 6: Commit the unified flow renderer**

```powershell
git add src/viewer/flowLines.js src/experiences/*/effects.js src/experiences/hydroelectric/water.js tests/flow-lines.test.mjs
git commit -m "refactor: unify principle flow arrows"
```

### Task 8: Add a collection-wide browser qualification check

**Files:**
- Create: `scripts/check-unified-interface.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create a Playwright check that visits all six routes**

For each catalog ID, load `/models/<id>`, wait for its exposed `window.__*` runtime, assert `.model-header`, `.model-stage`, `.model-inspector`, and three mode buttons, take desktop screenshots, switch to 390×844, assert no horizontal overflow, take mobile screenshots, then return to six cards.

Use this fixed output structure:

```js
const output = 'output/unified-interface';
const models = ['drone','hydroelectric','wind-turbine','thermal-power','wireless-charging','inline-four-engine'];
```

Collect page errors and error-level console messages; fail if either list is non-empty. Also verify reduced-motion by creating a context with `reducedMotion:'reduce'` and checking catalog card transition duration is `0s`.

- [ ] **Step 2: Add the package script**

```json
"test:interface": "node scripts/check-unified-interface.mjs"
```

- [ ] **Step 3: Run the qualification check with preview active**

Run: `npm run test:interface`

Expected: report lists six desktop and six mobile routes, zero overflow, zero page errors, zero console errors, and reduced motion enabled.

- [ ] **Step 4: Inspect every generated screenshot**

Check header alignment, model framing, panel widths, control wrapping, card focus/hover state, arrow weight, text contrast, and mobile reading order. Fix issues in the responsible shared or local stylesheet and rerun the check after every fix.

- [ ] **Step 5: Commit qualification coverage**

```powershell
git add scripts/check-unified-interface.mjs package.json output/unified-interface
git commit -m "test: qualify unified model interfaces"
```

### Task 9: Rebuild standalone HTML and finish documentation

**Files:**
- Modify: `scripts/check-offline-html.mjs`
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`
- Regenerate: `output/share/Model-Collection.html`
- Regenerate: `output/share/export-report.json`
- Regenerate: `output/share/offline-check.json`

- [ ] **Step 1: Extend the offline check for linked cards and shared shells**

After loading the file URL, click the body of each card rather than its visible action label. For each embedded model, assert the shared header/stage/inspector contract, enter principle mode, confirm its controller clock advances, return to the catalog, and finish with zero remote requests/page exceptions.

- [ ] **Step 2: Run all unit and browser checks from a clean preview build**

Run: `npm test`

Run: `npm run build`

Run: `npm run test:browser`

Run: `npm run test:hydro`

Run: `npm run test:wind`

Run: `npm run test:thermal`

Run: `npm run test:wireless`

Run: `npm run test:engine`

Run: `npm run test:interface`

Expected: every command exits 0, with no JavaScript or shader errors.

- [ ] **Step 3: Regenerate and verify the offline bundle**

Run: `npm run export:html`

Run: `node scripts/check-offline-html.mjs`

Expected: six cards and six embedded GLBs work through `file://`; no remote requests or page exceptions.

- [ ] **Step 4: Update documentation with exact evidence**

Document the full-card behavior, shared shell files, semantic flow colors, arrow widths, responsive breakpoint, test counts, screenshot folder, bundle byte size, and remaining limitations. State that thumbnails and 3D assets were not redesigned and DESIGN:OS is a development method, not a runtime dependency.

- [ ] **Step 5: Run final hygiene checks**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; status contains only intended project changes and generated evidence.

- [ ] **Step 6: Commit the completed interface standardization**

```powershell
git add README.md PROJECT_HANDOFF.md scripts/check-offline-html.mjs output/share
git commit -m "docs: hand off unified model collection"
```

Do not push or deploy.

## Execution status — 2026-10-07

Tasks 1–8 are implemented and verified. Task 9 documentation and final web checks are complete except the standalone HTML export/offline verification, which the user explicitly deferred. Do not treat the current `output/share/Model-Collection.html` as containing this interface standardization; regenerate and recheck it in a later HTML-specific task.