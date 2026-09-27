# kittipan OS

kittipan.net — a personal operating system in the browser. Guests explore About, Contact, Terminal and Settings; the owner unlocks private apps through Cloudflare Access.

- Lighting follows the real sun over Bangkok (dawn / day / dusk / night).
- Desktop: draggable windows + dock. Mobile: home screen + full-screen apps.
- `⌘K` Spotlight, a real Terminal (`help`), TH/EN content, sound off by default.
- Static export on Cloudflare Pages + one Pages Function. Runs at 0 THB/month.

Spec and design decisions: [`PROMPT.md`](PROMPT.md). Owner-mode setup: [`docs/cloudflare-access.md`](docs/cloudflare-access.md).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # solar math, terminal parser, JWT claim checks
npm run build    # static export → out/
npm run release -- minor   # bump version, date CHANGELOG, tag
```

Content lives in `src/config/profile.ts` (public only — this repo is public).

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `out`
- Functions: picked up automatically from `functions/`
