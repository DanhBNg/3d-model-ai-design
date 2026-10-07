# FLUX 05 — Wireless charging implementation plan

User approved design and implementation 2026-10-06. Execute inline with subagent-driven-development; no extra approval checkpoint. Full source retained, no deployment. Existing main worktree is user IDE workspace; additions are isolated by model directories, preserve existing model files.

**Goal:** Fifth model, phone and circular charging pad, realistic closed exterior, layered explosion, paired coils and educational inductive charging.

**Architecture:** Native Blender asset + editable Python and blend. Three.js independent factory/runtime, metadata/materials, pure simulation, controller, viewer/UI/effects. Shared contract below; no DOM/RAF in factory/controller. Existing shared wide-line helper reused.

**Tech:** pinned Blender5.2.2/Design OS revision, Three0.180, Vite, node:test, Chrome Playwright. Educational render-only, not engineering design.

## Contract

Route `/models/wireless-charging`, FLUX05. Model uses Y-up metre units: pad radius .055, bottomY0, topY.010; phone .076×.154 on XZ, screen up, bottomY.011, topY.020. Coils coaxial Y: transmitter center[0,.007,0], radius.021; receiver[0,.013,0], radius.021. Copper spiral traces, ferrite behind each coil, no ferrite between coils. Phone front/top is screen, back/bottom faces pad. Phone original generic product, no brand. Adapter atX-.115 with cable to pad, plug shown disconnected context; no mains interior exposed.

Identity assembly roots (geometry in world/model-local): adapter,cable,pad_base,pad_pcb,tx_ferrite,tx_coil,pad_cover,phone_back,rx_coil,rx_ferrite,battery,phone_board,phone_frame,screen.14 selectable parts. Coils on XZ plane. Empty sockets tx_center at[0,.007,0] child tx_coil, rx_center[0,.013,0] child rx_coil. Factory adds labels; no required rotating pivots.

Rest phone assembly layers: phone_backY.0115,rx_coilY.013,rx_ferriteY.0137,batteryY.0155,phone_board mainly nearZ-.055 atY.0155,phone_frameY.0155,screenY.0195. Phone body thickness .009. Pad baseY.001,PCB Y.0025,ferriteY.0055,coilY.007,coverY.009. Dimensional details may vary within layer envelopes; agent confirms actual bounds.

Controller API `createWirelessController(root)` with state {mode,selected,isolated,cutaway,explode,explodeTarget,auto,playing,slow,time,alignment,gap,receivedW,inputW,coupling,charging,soc,lesson,lessonAuto,flowFilter,transition,cover}; alignment in mm signed[-35,35], gap mm[6,18] physical teaching distance. Methods setMode/select/setIsolated/setCutaway/setExplode/toggleAuto/setAlignment/setGap/setPlaying/setSlow/setLesson/toggleLesson/setFlowFilter/reset/update/dispose. Modes explore/explode/principle. Filter lesson/all/power/field. Simulation `sampleWireless({alignment,gap,powered})` returns coupling,inputW,receivedW,charging; default alignment0 gap6. Battery percent educational clock, pause freezes. Root placement preserved. All phone parts translate together for alignment/gap. For principle only coil group separation is exaggerated by .014m for visibility and clearly labeled; numerical coupling uses physical gap, not displayed gap. Covers move outward, battery/screen upward and away, padPCB/base downward; preserve two facing coils. Explode mode operational effects hidden. On entering principle fully restore explosion then open teaching cutaway; no detached electronics shown as electrically connected.

Viewer export `mountWirelessExperience({modelUrl,onExit})`, globals window.__wireless={root,runtime,controller,studio,effects,dispose}. Prefix wireless-. Sidebar and modes like thermal, but product framing and field central. Phone/pad hero angled to show screen, focus coils in principle. Dark navy background, copper/teal, restrained gloss, screen charging icon rendered in viewer overlay or geometry. Field closed loops outside the coil axis; alternating direction/glow with slowed phase, not one-way flying particles. Paths adapter→driver→TX and RX→rectifier→charge controller→battery follow sockets/parts. Interactive alignment/gap, numeric power explicitly illustrative; no Qi certification.

## Work packages

- [x] Asset: `blender/wireless-charging/{geometry,materials,assemblies,build,verify,render}.py`, native blend, reports, runner `scripts/build-wireless.mjs`,GLB/thumbnail. Read Design OS core/image contract. Build blockout and inspect front before detailing; export final/reimport14roots+2sockets finite geometry, <100ktris/<5MB. Render closed/exploded/coils/rear, inspect actual images.
- [x] Model: `src/models/wireless-charging/{metadata,materials,loadModel,controller,simulation,lesson}.js`. Tests first for alignment/gap/coupling monotonicity, no output without input, finite/clamped bounds; actualGLB independent instances/dispose/rest poses/sockets/transition/pause/reset.
- [x] Viewer: `src/experiences/wireless-charging/{index,studio,ui,effects}.js`,style.css.14parts,3modes,4camera presets, control filters, five lessons, field phase/pause/slow, error/abort/disposal lifecycle, responsive mobile.
- [x] Integration: main/catalog/package scripts/offlineexport/testcatalog; no hash route. Tests of 5model offline navigation, no remote dependency.
- [x] Verification: npmtest/build, Blender verify/render, browser desktop/mobile select/isolate/explode/assemble/coupling/pause/slow/lesson/reset/disposal/errors; save screenshots and inspect. Independent source review and fixes.
- [x] Docs: README, docs/wireless-charging.md and PROJECT_HANDOFF with true stats, report paths and remaining limitations.

## Technical sources and limitations

TI transmitter https://www.ti.com/lit/ds/slusal8c/slusal8c.pdf and receiver/charger https://www.ti.com/product/BQ51052B . Chain AC mains→AC/DC adapter→high-frequency inverter→TX coil→alternating magnetic field→RX coil→rectifier→charge management→battery. Field carries energy; electrons do not cross gap. Ferrite guides flux; optional alignment magnets not required for this generic device. Coupling is pedagogical curve, not Maxwell/FEM/thermal model. Geometry from user exploded charger image is inferred; phone internals prioritize charging, not exact phone reconstruction. No claim of fixed charging efficiency, real charging time or actual measured watts. Mobile tested emulator, not physical phone/Safari.
