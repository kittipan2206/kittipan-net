# Changelog

Versions follow [SemVer](https://semver.org). `package.json` is the source of truth; the version shows in Settings, `version` and `neofetch`.
Add entries under **Unreleased** as you work, then run `npm run release -- <patch|minor|major>`.

## [Unreleased]

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
