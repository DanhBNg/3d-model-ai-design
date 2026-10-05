# Reference-based hydro refinement

User reference: `C:/Users/AMLT/Downloads/thuỷ điện.jfif`, a labeled generating station side-section. Not a dimensioned construction drawing. The requested target is a web model with a closed exterior and an educational cutaway.

Critical features: submerged intake with fixed trash rack and lifting gate; short converging intake passage; vertical Francis runner/shaft/generator; crane in the hall; expanding draft elbow below the runner returning to tailrace; transformer and outgoing conductors. Preserve 22 assembly IDs, independent rotary pivots and reversible extraction. Infer unseen exterior and depth. Keep the side spillway as an existing secondary feature, closed and visually quiet.

Shared hydraulic sections in `src/models/hydroelectric/hydraulics.json` define the Blender cutaway shell and web water volume, preventing separate routes from diverging. Water is an animated mesh with directional ribbons/foam. Flow animation follows simulation flow, pause and slow clock. Hide internal water while exploded, isolated or assembling. Reservoir ripples remain within their surface bounds. This is a visualization, not CFD, pressure, free-surface or hydraulic transient simulation.

Implementation: rebuild civil section and reference features; export/open blockout; add procedural Three.js water module separate from electrical effects; verify flow stop/pause and shared envelope; inspect reference side, exterior, cutaway, detail and mobile images; rebuild artifacts and documentation. Keep Python, .blend, GLB and source. No push/deploy.
