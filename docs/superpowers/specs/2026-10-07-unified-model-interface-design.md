# Unified Model Interface Design

Date: 2026-10-07

## Goal

Standardize the collection page and all six model-detail experiences around the established AERO Q4 interface. Preserve each model's geometry, simulation, controller, and subject-specific teaching controls while giving every experience the same navigation, layout, visual tokens, interaction states, and principle-flow language.

## Scope

This delivery covers two surfaces:

1. The model collection at `/`.
2. The shared presentation shell used by drone, hydroelectric, wind turbine, thermal power, wireless charging, and inline-four engine detail routes.

Thumbnail artwork and 3D asset redesign are outside this delivery. Existing images remain in place. The scroll-film idea in `3d scroll.txt` is retained only as future reference and is not added to either surface.

## Collection page

Every available model card is one semantic link to its clean model route. The image, title, description, and visible action label all activate the same destination. The card supports pointer, keyboard, modifier-click, and browser link semantics. Offline-file navigation remains intercepted by the application router so the standalone HTML continues to work.

The collection adopts the drone's charcoal palette and restrained technical-lab tone. The header, introduction, grid rhythm, card borders, typography, focus treatment, and motion use shared tokens. Existing thumbnails are not retouched or replaced. The responsive grid uses three columns when space permits, two at laptop widths, and one on compact screens. Hover motion is subtle and disabled under reduced-motion preferences.

## Shared model shell

The drone is the reference for the detail-page shell:

- charcoal studio background;
- compact header with model identity, three centered modes, and lab edition;
- large 3D stage with title, view tools, labels, and status;
- right inspector on desktop and stacked inspector below the stage on mobile;
- consistent buttons, sliders, lists, focus states, borders, typography, spacing, loading state, transitions, and bottom status bar.

The shell owns presentation and common interaction markup. Each experience supplies an adapter containing model identity, mode labels, title copy, view commands, part metadata, stats, and subject-specific panels. The existing model factory, runtime, controller, simulation, studio camera logic, and 3D effects remain separate by model.

The shell does not force subject-specific controls into one universal controller. It gives them common slots and components, allowing thermal lessons, engine cycle controls, wireless alignment, wind controls, hydro controls, and drone flight scenarios to keep their own behavior.

## Standard modes

### Explore

The stage exposes the same title hierarchy and view-tool placement. The inspector exposes part name, concise Vietnamese description, optional material, cover/cutaway toggle, isolate action, and part list. Selection and highlight behavior continue to use each existing controller/runtime.

### Explode

All models use the drone-style floating card containing percentage, continuous range input, assemble/reset, and autoplay. The card stays compact and on the left at desktop sizes. Models retain their existing explosion vectors and sequencing. Entering an operational principle mode first restores the assembled state.

### Principle

Principle panels may differ structurally when the subject requires it, but they share:

- an energy-conversion heading;
- optional flow filters;
- a short text diagram using labeled nodes and arrows;
- one concise explanatory paragraph;
- an on-stage legend using semantic flow colors;
- play/pause, 0.25x, and reset controls in a consistent area;
- an expandable educational-limits note at the end.

## Flow visualization

All principle experiences use `src/viewer/flowLines.js`, the same wide-line/open-arrow treatment used by the drone. Existing particle-dot representations are removed where they represent directed flow. Track width increases from 2.0 px to approximately 2.2 px, the moving arrow stroke from 2.8 px to approximately 3.1 px, and arrowhead geometry by roughly 8–10 percent. The dark backing stroke remains so arrows retain contrast over both pale and dark geometry.

Semantic colors are consistent:

- amber/orange: electrical or thermal energy;
- cyan: water, air, steam, or another working fluid;
- green: control signals;
- pale violet: exhaust or return flow when a separate channel is needed.

Each model provides paths, visibility rules, speed, and teaching copy. The shared module owns rendering, sizing, outline, animation timing, and disposal.

## Architecture

New shared presentation modules live under `src/ui/model-shell/`:

- design tokens and shared CSS;
- shell markup and lifecycle helpers;
- header/mode navigation;
- stage chrome and view tools;
- inspector primitives;
- explode controls;
- principle flow diagram and legend;
- common icons and accessibility helpers.

Experience-specific `ui.js`, `style.css`, `studio.js`, and `effects.js` files are migrated incrementally. They import the shared shell and retain only model-specific markup, state synchronization, camera commands, and effects. Prefixes and controller APIs can remain during migration, but the visible DOM follows the shared shell contract.

The first implementation establishes the shared tokens and shell, migrates the drone as the reference fixture, then migrates the other five experiences one at a time. This prevents a single large rewrite from obscuring regressions.

## DESIGN:OS use

The project adopts DESIGN:OS practices rather than adding its complete CLI to the application runtime:

- learn the brownfield design system from the drone;
- compile repeated values into tokens;
- preserve live HTML for labels, controls, and state;
- verify desktop and mobile render evidence;
- audit overflow, contrast, focus visibility, touch targets, and reduced motion;
- make qualification claims only from current test and image evidence.

Installing the CLI is optional and is not a production dependency for this delivery.

## Accessibility and routing

Cards and navigation use semantic links where navigation is the action. Buttons remain buttons for in-viewer state changes. All interactive elements expose keyboard focus. Active modes use `aria-pressed` or the correct navigation state. Icons have accessible labels where visible text is absent. Touch targets remain at least 40 px in compact layouts where practical.

History API routes remain free of `#`. Hosted routes support a deployment base path. The standalone HTML retains internal file navigation without remote requests.

## Failure handling

The existing per-model loading and model-load failure messages remain available through a common visual treatment. A failed model load must leave the collection-return action usable. Missing optional metadata hides its row rather than producing empty UI. Shared components do not assume every model supports every secondary control.

## Verification

The delivery is complete only after:

- catalog tests prove the entire available card is the navigation target;
- all existing unit tests pass;
- each model opens, changes all three modes, returns to the catalog, and disposes cleanly;
- principle flow filters and play/pause behavior still work;
- desktop and mobile screenshots are inspected for all six models;
- no horizontal overflow occurs at 390 px;
- focus and reduced-motion behavior are checked;
- production build succeeds;
- the six-model standalone HTML opens through `file://`, visits each model, returns to the catalog, and makes zero remote requests;
- README and `PROJECT_HANDOFF.md` describe the shared shell, verification evidence, and known limits.

## Explicit non-goals

- Redesigning thumbnail renders or 3D assets.
- Changing simulation equations or Blender source.
- Adding scroll-scrub video or generated film.
- Replacing clean routes with hash routes.
- Adding DESIGN:OS as a browser/runtime dependency.
