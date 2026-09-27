# kittipan OS — Master Build Prompt

> Decisions locked in a grill-me session on 2026-09-27. Mockup: https://claude.ai/artifact/W6hXFB6Gb4gq8bgoYJWvqS
> Work on `develop` (feature branches off it). Never push to `main`.

---

You are building **kittipan OS**: kittipan.net rebuilt as a personal operating system in the browser. It is the owner's public identity page _and_ his private hub. Guests can explore everything public; private apps unlock only after Cloudflare Access verifies the owner. The goal is **memorable identity**, not a recruiter funnel — but the content must still be real, fast and accessible.

## Hard constraints

- **Free forever.** Cloudflare Pages (static) + Pages Functions (Workers free plan, 100k req/day) + Cloudflare Access (Zero Trust free). No paid services, no API keys in the client.
- **No new runtime dependencies** unless a few lines of code cannot do the job. Already installed: `next` 15, `react` 19, `framer-motion`, `qrcode.react`, `canvas-confetti`, `clsx`, `tailwind-merge`, `lucide-react`.
- **The repo is public.** Nothing private goes in source: not in `src/`, not in `functions/`. Private data comes from Cloudflare env vars/secrets at request time.
- **Private data never ships in the static bundle.** Hiding UI with `if (isOwner)` is not security. Even the _names_ of private projects must come from the protected API.
- **Never publish the real house model** (`projects/home3d/public/models/house.glb`) or live presence/door/camera/light-state data.

## Stack

- Next.js 15 App Router, `output: 'export'`, `trailingSlash: true` → deploys `out/` to Cloudflare Pages.
- Tailwind CSS 3 for layout utilities; theme colors are CSS variables driven by the current phase.
- Fonts via `next/font/google`: **IBM Plex Sans Thai** (content, TH + EN), **IBM Plex Mono** (system UI), **Doto** (dot-matrix numerals on LCD widgets only).
- State: React context + `useReducer`. No state library.
- Pages Functions in `/functions` (TypeScript) for `/api/private/*`.

## Concept & art direction

**Industrial hardware OS** — Teenage Engineering / lab-equipment feel, not a macOS clone.

- Keycap buttons: 1px near-black border, hard offset shadow (`0 3px 0 <frame>`), press = translateY(2px) + shadow shrink.
- Window controls are **three small squares** (close = orange), never round traffic lights.
- LCD panels: near-black inset panel, orange dot-matrix digits (Doto), small uppercase mono labels with wide tracking.
- Accent: safety orange `#FF5500` (one accent only). LED green `#5FD384` only for the OWNER badge.
- Dot-grid texture over a sky gradient wallpaper.
- **Live Bangkok lighting:** the wallpaper and the whole palette follow the real sun over Bangkok (13.7563 N, 100.5018 E). Phases: `dawn` (sunrise ±45 min), `day`, `dusk` (sunset ±45 min), `night`. Dawn/day use light panels; dusk/night use dark panels. Recomputed every minute. The user can override in Settings (auto/dawn/day/dusk/night).
- Motion: short and mechanical (120–220 ms, ease-out), no floaty springs on chrome. Everything honors `prefers-reduced-motion`.
- Sound: procedural clicks from `src/lib/sound.ts`, **off by default**, toggle in menu bar + Settings.
- Avoid AI tropes: no purple gradients, no glass-everything, no emoji icons, no left-border cards, no fake metrics.

## Design system (CI)

Tokens live in `src/app/globals.css` (CSS variables) and are mapped into Tailwind in `tailwind.config.ts`.

- **Mark:** 5×7 dot-matrix "k" on a safety-orange plate (`Logo` in `src/os/ui.tsx`, `public/favicon.svg`). Wordmark: `kittipan OS`, IBM Plex Mono 600, lowercase "kittipan".
- **Color:** one accent `--accent #FF5500` (ink on it: `#161616`). LCD: `--lcd #1B1C18`, digits `--lcd-ink #FF6A1F`. LED green `#5FD384` only for OWNER. Surfaces (`--panel --card --key --line --ink --sub`) flip light/dark per phase; wallpaper `--sky` per phase.
- **Type:** IBM Plex Mono = system UI (11–13 px), IBM Plex Sans Thai = content (13–16 px body, 24–42 px names), Doto 800 = LCD numerals only. Caps labels: 10 px, tracking 0.14em.
- **Scale:** radius 4 / 8 / 12 / 16 (`sm md lg xl`); spacing on a 4 px grid; touch targets ≥ 44 px.
- **Depth:** no blur shadows on controls — hard offset `0 3px 0 var(--frame)`; pressed = `translateY(2px)` + `0 1px 0`. Windows add one soft ambient shadow.
- **Primitives:** `.key` / `.key-accent` (keycap), `.panel`, `.lcd` + `.lcd-digits`, `.caps`, `.segmented`, `.wallpaper` + `.dots`.
- **Motion:** 80 ms presses, 140 ms windows, 220 ms mobile sheets, `cubic-bezier(.2,.7,.2,1)`.

## Layout (adaptive)

- **Desktop (≥768 px):** menu bar (36 px) → desktop icons (left column) → windows → widget column (right, 300 px) → dock (bottom center). Windows are draggable by the title bar, focus-to-front, minimize/maximize/close. Default open window: About.
- **Mobile (<768 px):** home screen — top bar, LCD clock widget, weather + Now widgets, 4-column app grid, dock. Apps open as full-screen sheets with a "‹ Home" back button. No windows, no dragging.
- Both use the same app components.

## First 5 seconds

- No blocking boot. Desktop appears with a ~0.8 s LCD "power-on" reveal (rows lighting up), content readable immediately.
- Full boot sequence (POST lines, logo) is an easter egg: `reboot` in Terminal.

## Language

- TH/EN toggle in menu bar. Default from `navigator.language` (th* → TH), persisted in `localStorage`.
- **System text is always English** (app names, menus, terminal commands). **Content** (bio, domains, Now, weather text) switches language.
- Content lives in `src/config/profile.ts` as `{ th, en }` pairs.

## Apps (v1)

| App       | Guest                                                                                                                             | Notes                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| About     | identity, bio, domains, stack, actions                                                                                            | SSR'd for SEO                                  |
| Contact   | Save vCard, copy email, QR, links                                                                                                 | deep link `#contact` (QR on business card)     |
| Terminal  | `help whoami ls open <app> lang <th\|en> theme <phase\|auto> sound <on\|off> date weather clear reboot unlock sudo` + easter eggs | pure command parser in `src/os/terminal.ts`    |
| Settings  | sound, language, lighting override, reduced motion                                                                                | `localStorage`                                 |
| Projects  | placeholder shell ("coming soon" + GitHub link)                                                                                   | content decided later                          |
| Launchpad | **locked** for guests                                                                                                             | owner-only, data from `/api/private/launchpad` |

Widgets: Clock + sun arc (LCD), Weather (Open-Meteo, no key, cached 15 min in `sessionStorage`), Now (from `profile.ts`).

Spotlight: `⌘K` / `Ctrl+K`, fuzzy search over apps + actions, arrow keys + Enter + Esc.

Deep links: `#about`, `#contact`, `#terminal`, `#settings`, `#projects`, `#launchpad` open that app.

## Owner mode (auth)

```
kittipan.net (static, public)
 ├─ /unlock/            ← Cloudflare Access app (email OTP). Static page that redirects to /#launchpad after login.
 └─ /api/private/*      ← Same Access app. Pages Function re-verifies the Cf-Access-Jwt-Assertion (RS256 via team JWKS, aud + iss check).
```

- The client never decides it is "owner" on its own. It probes `/api/private/launchpad` only when a `kos_owner_hint` flag exists (set after visiting `/unlock/`) or when the user opens Launchpad. 200 → owner mode; anything else → guest, flag cleared.
- Launchpad links come from the `LAUNCHPAD_LINKS` env var (JSON) set in the Cloudflare dashboard as an encrypted secret.
- Required env: `ACCESS_TEAM_DOMAIN` (e.g. `https://<team>.cloudflareaccess.com`), `ACCESS_AUD` (application audience tag), `LAUNCHPAD_LINKS`.
- "Lock" in the menu bar → `/cdn-cgi/access/logout` then back to guest.
- Manual setup (owner does this in the dashboard): see `docs/cloudflare-access.md`.

## Accessibility & SEO

- Real `<button>` / `<a>` everywhere, visible focus rings, `aria-label` on icon buttons, Esc closes the top window/sheet.
- No `maximumScale` on the viewport. Text contrast ≥ 4.5:1 in every phase.
- About + Contact content present in the static HTML. OG image at `public/og.png` (1200×630).

## File map

```
src/app/            layout.tsx (fonts, metadata), page.tsx (<OS/>), unlock/page.tsx, globals.css
src/config/         profile.ts (public content only)
src/os/             OS.tsx (shell), state.tsx (context/reducer), apps.ts (registry),
                    sun.ts (solar math + phase), terminal.ts (parser), weather.ts, i18n.ts
src/os/chrome/      MenuBar, Desktop icons, Window, Dock, Spotlight, MobileHome, Sheet, BootReveal, Reboot
src/os/apps/        About, Contact, Terminal, Settings, Projects, Launchpad
src/os/widgets/     ClockWidget, WeatherWidget, NowWidget
src/lib/sound.ts    procedural sounds (existing)
functions/api/private/launchpad.ts   Access-verified endpoint
scripts/selfcheck.mts                  node assert checks for sun.ts + terminal.ts
```

## Versioning

- `package.json` `version` is the single source of truth (SemVer). `next.config.mjs` injects it plus the commit (`CF_PAGES_COMMIT_SHA` or local git) and build date as `NEXT_PUBLIC_*`; read them via `src/os/version.ts`.
- Shown in Settings → System, Terminal `version` / `neofetch`, and the `reboot` POST screen.
- Log changes under `## [Unreleased]` in `CHANGELOG.md`; `npm run release -- <patch|minor|major>` bumps, dates the section, commits and tags `vX.Y.Z`.

## Done when

- `npm run build` passes and `out/` contains no private strings.
- `npm run check` passes.
- Desktop + mobile verified in a browser at all four phases, TH and EN.
- Lighthouse a11y ≥ 95 on the home page.
