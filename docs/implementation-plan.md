# AERO Q4 implementation plan

Goal: standalone editable Blender + Three.js drone explorer, following docs/design.md and the supplied runtime standard.
Architecture: source model and materials in blender/drone; GLB runtime adapter and controller in src/models/drone; renderer/UI in src/viewer.
Tech: Blender 5.2.2, native Python/bmesh; Three.js 0.180; Vite; Node test runner; Playwright for browser evidence if in-app browser cannot connect.

- [x] 1. Scaffold, record sources and toolchain. Create scripts/build-model.mjs with strict last AGENT marker validation. Build geometry helpers and blockout, save .blend/GLB. Numeric postconditions before image review.
- [x] 2. Implement loadModel.js runtime and minimal studio viewer. Review assembled front, rear and top before detail. Keep early screenshot.
- [x] 3. Add real shell thickness, PCB packages/traces/connectors, battery cells/rails, motor winding/bell/stator separation, shaped opposite-handed blades, articulated camera. Export/reopen and bind report to SHA256.
- [x] 4. Write failing state/reset/physics-sign tests. Implement flight.js mixing and controller.js with staged assembly, transition interlock, reversible transforms, pause/slow/reset, and isolation.
- [x] 5. Implement viewer picking, Vietnamese inspector, educational overlay, touch layout and graceful load failure. Test in actual Three.js desktop and mobile viewport.
- [x] 6. Run npm test, npm run build, exported GLB verifier, visual screenshots, source audit and clean install/build. Record actual budgets/limitations, README, runtime docs and PROJECT_HANDOFF.md.

Commands: `npm install`, `npm run model:build`, `npm run dev -- --port 5173`, `npm test`, `npm run model:verify`, `npm run model:render`, `npm run build`, `npm run test:browser`.

Expected checks: finite actual exported positions; required assemblies present exactly once; opposite rotor pairs cancel yaw at hover; nose-down torque for forward, correct roll/yaw signs; no flight while exploded; pause and reset stable; own resources disposed once without affecting second instance; no missing local assets or page exceptions.

Remaining quality gap: local mating-interface intersections in early explode stages; see docs/verification.md.
