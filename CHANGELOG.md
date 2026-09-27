# Changelog

Versions follow [SemVer](https://semver.org). `package.json` is the source of truth; the version shows in Settings, `version` and `neofetch`.
Add entries under **Unreleased** as you work, then run `npm run release -- <patch|minor|major>`.

## [Unreleased]

## [3.0.1] - 2026-09-27

### Fixed
- Cursor was invisible on light themes: the white blend-mode dot sat inside an isolated layer, so it never inverted.
  The pointer is now a real OS cursor image (dark square, white outline): drawn by the system with zero lag and readable on any background.
- Clickable elements get their own cursor (framed square); text fields and resize edges keep the system cursor.
- Focus brackets only appear when locked onto something clickable, with a contrast halo per theme; disabled under forced colors.


## [3.0.0] - 2026-09-27 — "Tactile"

### Added
- Hard shadows follow the real sun: they fall one way at dawn, straight down at noon, the other way at dusk.
- LCD realism: unlit "8" segments behind digits, pixel-row texture, backlight glow that changes with the time of day.
- Windows power on and off like a CRT (bright line → full frame, and back).
- Thai calendar: Songkran water drops on the glass, Loy Krathong lanterns, New Year dot-matrix fireworks, plus a greeting in the menu bar. Preview with `festival <name>` in Terminal.
- Snake on the LCD dot grid (`play snake`, Spotlight, right-click menu, mobile grid). Keyboard, swipe or on-screen keys; high score saved.
- Installable app (PWA): manifest, icons, offline after first visit, app shortcuts; "Install" in Settings and Spotlight.
- Industrial cursor: exact square dot + focus-bracket reticle on a spring that wraps buttons; click bursts. Mouse only; setting to use the system cursor.
- Springy hover on keys (lift + settle, icon nudge) and smooth scrolling.


## [2.1.0] - 2026-09-27

### Added
- Resize windows from any edge or corner; drag a maximized window to restore it.
- Snap windows: drag to the left/right edge for half screen, to the top for full screen.
- Minimize and restore animate into and out of the dock.
- Window layout is remembered between visits.
- Desktop right-click menu (apps, lighting, live wallpaper, screensaver, reboot).
- Projects app with case studies and demo videos for public work.
- Screensaver: floating dot-matrix clock after idle time.
- Live wallpaper: stars at night, drifting clouds by day, real rain when it rains in Bangkok.
- Terminal: Tab completion, `version`, `changelog`, `screensaver`.
- Mobile: pull down on the home screen to open Spotlight.
- Settings: accent color, wallpaper style, live wallpaper, screensaver timer, version info.
- Version system: build-time version, commit and date; `npm run release`.

### Fixed
- Owner mode accepts `ACCESS_TEAM_DOMAIN` with or without `https://` / trailing slash.
- Launchpad shows the actual error instead of silently returning to the lock screen.

## [2.0.0] - 2026-09-27

### Added
- kittipan OS: adaptive browser OS with windows, dock, widgets and a mobile home screen.
- Industrial keycap design system and dot-matrix mark.
- Lighting that follows the real sun over Bangkok.
- About, Contact, Terminal, Settings, Launchpad apps; `⌘K` Spotlight; TH/EN content.
- Owner mode behind Cloudflare Access with a JWT-verified Pages Function.
