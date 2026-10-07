# Wireless display and matte finish

User requests a realistic phone screen, placement-triggered charge animation, reduced gloss similar to drone. Authorized inline implementation in existing wireless model.

- Native Blender material roughness increased, metallic reduced by material; retain all geometry/root/socket contracts. Rebuild blend/GLB, verify/re-render thumbnail.
- Viewer canvas texture on actual screen: lock screen, time/status, wallpaper, battery charging pulse. Generated locally with no external images/fonts. Screen follows assembly and visibility; dispose geometry/material/texture.
- Controller owns docked/dockProgress/screenTime. Lift stops charge immediately; lower interpolates all phone layers, charge resumes only after landing. Pause freezes placement/animation. No operational flow in exploded view; mode switching preserves placement continuity.
- Explore button raises/lowers phone; mobile same control. Keep educational power source/simulation limits.
- Validate runtime docking tests, browser screenshots of idle/lift/land, old modes/mobile/offline. Update handoff and editable source; no auto push/deploy.
