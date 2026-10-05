# Implementation plan

1. Write wind simulation behavior tests (cut-in, rated, cut-out, yaw misalignment and speed ratio), run failing tests; implement pure simulation module.
2. Build Blender silhouette with independent tower, yaw, rotor and pitch pivots. Render the native artifact to inspect framing and shape before detailing. Keep blockout asset as a checkpoint.
3. Build shaft/bearing, two-stage gearbox, brake, copper generator, sensors, controls and removable shell. Export and reimport; assert finite bounds, registry IDs, budgets and stable rebuild counts.
4. Implement factory and controller, saving local rest poses. Smooth assembly transitions, freeze operation during separation; test pause/reset and mode switching using actual imported hierarchy.
5. Add dark responsive viewer, overview/machine views, pick/highlight/isolate, exploded controls, guided energy lessons, wind trails and electrical traces. Register third model and embed offline assets.
6. Inspect multiple Blender images and actual browser screenshots. Run npm test/build, browser wind checks and offline smoke. Update README, docs/wind-turbine.md and PROJECT_HANDOFF.md with commands, measurements and untested limits.

Execute inline in the existing standalone workspace. No publish/deploy or edits to other projects. The user has approved the full scope; routine implementation choices do not need another approval.
