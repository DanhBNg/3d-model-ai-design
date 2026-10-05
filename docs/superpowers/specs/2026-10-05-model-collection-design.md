# Model Collection Design

## Goal

Turn the existing AERO Q4 demo into the first interactive entry in a small model collection. The opening screen lists Drone and Hydroelectric Power Plant before the user enters a viewer.

## Approved scope

- Keep the work in the current standalone project.
- Show a responsive catalog before any model viewer.
- List exactly two entries: AERO Q4 Drone and Hydroelectric Power Plant.
- The drone entry opens the existing complete viewer.
- The hydroelectric entry is visibly marked as being prepared and cannot open an unfinished viewer.
- Do not add themes, categories, search, or filtering yet.
- Add a clear way to return from the drone viewer to the catalog.
- Preserve the existing editable source structure, production build, and single-file offline export.

## Navigation

HTTP builds use clean History API paths:

- `/` — catalog
- `/models/drone` — drone viewer
- `/models/hydroelectric` — reserved for the future model; direct visits return to the catalog because the entry is unavailable

No hash fragment is used. On `file://`, the single-file export keeps navigation internal because changing pathname would navigate away from the HTML file. Browser Back/Forward must work on HTTP.

## Catalog experience

The catalog uses the existing dark visual language and prioritizes model imagery. Desktop shows two wide cards side by side; mobile stacks them. Each card includes an index, title, short Vietnamese description, status, and action. The drone card uses a real render from the existing model. The hydroelectric card uses a restrained schematic placeholder so it does not imply that a 3D asset already exists.

The unavailable hydroelectric card remains keyboard readable and explains that the model will cover the dam, intake, penstock, turbine, generator, transformer, and grid connection in a later phase.

## Architecture

- `src/catalog/models.js` is the collection registry and owns route/status/display metadata.
- `src/catalog/catalogView.js` renders the catalog and emits only navigation intent.
- `src/app/router.js` parses clean paths and owns History API behavior.
- `src/experiences/drone/index.js` owns the existing drone viewer lifecycle and fully disposes it on exit.
- `src/main.js` is a small application bootstrap that switches between the catalog and model experiences.

The drone factory, controller, metadata, Blender source, and GLB remain independent of routing and catalog UI.

## Validation

- Unit tests cover registry entries, path parsing, unavailable-route fallback, and URL generation.
- Existing drone runtime/controller tests remain green.
- Browser checks start at the catalog, enter the drone, return to the catalog, and verify a clean pathname without `#`.
- Production build and offline single-file export are rebuilt and checked.

## Future hydroelectric phase

The future model will receive its own Blender source, GLB, model loader/factory, materials, metadata, controller, viewer integration, tests, and documentation. Its first functional chain is reservoir → intake gate → penstock → turbine → generator → transformer → grid. That model work is outside this catalog phase.
