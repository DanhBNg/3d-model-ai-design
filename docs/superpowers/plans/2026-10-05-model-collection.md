# Model Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive two-model catalog with clean pathname routing while preserving the complete drone viewer and offline single-file export.

**Architecture:** A pure catalog registry and route parser feed a small app shell. The current viewer bootstrap moves into a mount/dispose experience module so route changes cleanly release WebGL and DOM resources. HTTP uses History API paths, while file URLs switch views without mutating the filesystem pathname.

**Tech Stack:** Vanilla JavaScript ES modules, Three.js, Vite, Node test runner, Playwright/Chrome browser checks.

---

### Task 1: Catalog registry and clean route parser

**Files:**
- Create: `src/catalog/models.js`
- Create: `src/app/router.js`
- Create: `tests/catalog.test.mjs`

- [x] Write tests for the two registry entries, clean `/models/drone` parsing, unavailable hydro fallback, base-path handling, and absence of hash routes.
- [x] Run `node --test tests/catalog.test.mjs` and confirm it fails because the modules do not exist.
- [x] Implement the immutable registry and dependency-light route helpers.
- [x] Run `node --test tests/catalog.test.mjs` and confirm all catalog tests pass.

### Task 2: Catalog screen

**Files:**
- Create: `src/catalog/catalogView.js`
- Create: `src/catalog/catalog.css`
- Create: `public/images/catalog/hydroelectric.svg`
- Create: `public/images/catalog/drone.png`

- [x] Add DOM behavior assertions for labels, availability state, and navigation intent.
- [x] Run the focused test and confirm it fails before implementation.
- [x] Build semantic cards, responsive layout, focus states, and status treatment.
- [x] Generate the drone thumbnail from the existing verified render and add the hydroelectric schematic.
- [x] Run the focused test and confirm it passes.

### Task 3: Reusable drone experience lifecycle

**Files:**
- Create: `src/experiences/drone/index.js`
- Modify: `src/viewer/ui.js`
- Modify: `src/main.js`
- Modify: `src/style.css`

- [x] Add source-level runtime assertions that the app bootstrap mounts through an experience boundary and exposes catalog return navigation.
- [x] Run the focused test and confirm it fails against the existing direct bootstrap.
- [x] Move the current asynchronous drone setup/render loop into `mountDroneExperience({ onExit })` returning an idempotent disposer.
- [x] Add a collection-return control to the drone header without coupling the drone controller to routing.
- [x] Replace `src/main.js` with route-driven app mounting and popstate handling.
- [x] Run all unit tests and confirm existing drone behavior remains green.

### Task 4: Build, offline export, and browser validation

**Files:**
- Modify: `index.html`
- Modify: `scripts/export-html.mjs`
- Modify: `scripts/check-offline-html.mjs`
- Modify: `scripts/browser-check.mjs`

- [x] Update the document identity and export naming for the collection.
- [x] Update the exporter so catalog images and drone GLB are embedded in the single HTML.
- [x] Update browser validation to verify catalog → drone → catalog, clean pathname routing, and the existing drone interactions.
- [x] Run `npm test`, `npm run build`, `npm run export:html`, and the offline checker.
- [x] Start the production preview and run `npm run test:browser` against it.

### Task 5: Documentation and handoff

**Files:**
- Modify: `README.md`
- Modify: `PROJECT_HANDOFF.md`

- [x] Document the catalog routes, current availability, offline behavior, and source boundaries.
- [x] Record the hydroelectric next phase without claiming its model exists.
- [x] Re-run the complete verification commands after documentation changes and inspect the final diff/file list.
