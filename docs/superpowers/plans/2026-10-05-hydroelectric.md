# Hydroelectric implementation plan

**Goal:** Ship an editable Blender + GLB + Three.js educational hydroelectric experience in the existing collection.
**Architecture:** Isolated hydro model factory/runtime/controller and experience; reuse only established asset conventions. App owns routing and lifecycle.

- [x] Build geometry/material primitives and civil/machinery blockout; save .blend/GLB and inspect rendered silhouette.
- [x] Add runner curved blades, scroll case cutaway, guide vane pivots, generator copper coils/rotor poles, bearings, penstock flanges, transformer bushings and transmission lattice.
- [x] Export and independently import/verify GLB; record budget and artifact hash.
- [x] Test and implement hydraulic educational simulation and controller; verify rest/explode/generation/reset/dispose.
- [x] Implement responsive hydro viewer, selection, cutaway/isolation, flow particles, telemetry and pause/slow controls.
- [x] Integrate clean route, catalog thumbnail and both-model offline export.
- [x] Run unit/build/browser/offline checks; inspect multi-angle Blender and Three.js images.
- [x] Update README and PROJECT_HANDOFF with sources, commands and explicit limitations.
