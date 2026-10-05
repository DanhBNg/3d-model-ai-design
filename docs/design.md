# AERO Q4 / Interactive drone lab

Date: 2026-10-04. Original educational Quad-X, render-only. Manufacture: NOT_REQUESTED.

## Visual contract
Ivory aerodynamic split shell, exposed graphite arms, brushed aluminum motor bells, copper windings, orange identification bands, dark optics. Approximate motor spacing 290 × 260 mm; prop diameter 190 mm. No manufacturer likeness, certified dimensions, flight performance or assembly instructions claimed.

Desktop: editorial light studio, large model at left, compact inspector at right, mode switch above, controls below. Mobile: model above compact scrolling controls. Vietnamese interface, keyboard-accessible controls, direct mesh picking. No external runtime fonts/textures/CDN.

## Scene and source
Blender data-API geometry/material modules → blockout then detail → editable .blend + GLB. JS loadModel returns Group with sculptRuntime v1. Registry maps explicit assembly IDs; viewer never indexes arbitrary children. Controller owns transforms under flightRoot; app owns modelRoot placement. Independent instances/resources.

Assemblies: shell_upper, shell_lower, frame, battery, flight_controller, esc, gimbal, motor_fl/fr/rl/rr, prop_fl/fr/rl/rr. Motor rotor child pivots distinct from fixed stators. Props spin at spindle origins. Gimbal yaw → roll → pitch → optics. +Y up, -Z forward, metres, origin at ground center.

## Motion and interaction
Explore: orbit, zoom, pick/highlight, metadata, hide covers, isolate part.
Explode: continuous reversible staged slider, autoplay ping-pong, reset. Covers clear first; electronics separate vertically; motor/prop towers separate radially and vertically; gimbal moves forward/down. Descendant details stay with parent. Rest transforms immutable.
Flight: assemble smoothly before movement; preserve explode slider and visibility settings for return. Educational takeoff/hover/pitch/roll/yaw, per-motor normalized speed + illustrative RPM, local thrust arrows, energy and control flow. Pause freezes instructional clock; 0.25× slow; reset deterministic. Motion ends in hold; no teleporting loops. Prop visual rotation scaled down, not actual RPM.

## Evidence
Before detail: view blockout in Three.js and render multi-angle sheet. After detail: reopen exported GLB, finite transforms/bounds/pivots/materials; sampled explode review, controller tests, multiple instances/disposal, failed load, desktop/mobile browser interactions and screenshots. Report mesh triangles, asset bytes, draw calls and tested viewport; no claims of real phone FPS.

Target budget: GLB < 5 MB, < 120k triangles, < 140 model draw calls. Measured results take priority over these targets. Physically simplified: no fluid solver, motor electrical transient, prop aerodynamics, battery discharge, real PID calibration or structural simulation.
