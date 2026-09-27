// Run: node scripts/selfcheck.mts
import assert from "node:assert/strict";
import { phaseAt, sunTimes, sunProgress, bangkokTime } from "../src/os/sun.ts";
import { runCommand, type TerminalContext } from "../src/os/terminal.ts";
import { validateClaims } from "../functions/api/private/launchpad.ts";

// Sun over Bangkok, 27 Sep 2026: sunrise ≈ 06:08, sunset ≈ 18:10 local.
const day = new Date("2026-09-27T07:30:00Z"); // 14:30 BKK
const { sunrise, sunset } = sunTimes(day);
const rise = bangkokTime(sunrise);
const set = bangkokTime(sunset);
assert.ok(rise >= "05:55" && rise <= "06:20", `sunrise ${rise}`);
assert.ok(set >= "18:00" && set <= "18:25", `sunset ${set}`);

assert.equal(phaseAt(day), "day");
assert.equal(phaseAt(new Date("2026-09-27T16:47:00Z")), "night"); // 23:47 BKK
assert.equal(phaseAt(new Date("2026-09-27T23:10:00Z")), "dawn"); // 06:10 BKK next day
assert.equal(phaseAt(new Date("2026-09-27T11:05:00Z")), "dusk"); // 18:05 BKK
assert.equal(phaseAt(new Date("2026-09-27T17:30:00Z")), "night"); // 00:30 BKK
assert.equal(sunProgress(new Date("2026-09-27T16:47:00Z")), null);
const noonish = sunProgress(new Date("2026-09-27T05:10:00Z"))!;
assert.ok(noonish > 0.4 && noonish < 0.6, `noon progress ${noonish}`);

// Terminal
const ctx: TerminalContext = {
  name: "Kittipan Sankoh",
  role: "Software & Mobile Engineer",
  location: "Bangkok, TH",
  email: "me@kittipan.net",
  apps: [
    { id: "about", locked: false },
    { id: "launchpad", locked: true },
  ],
  owner: false,
  phase: "day",
  time: "14:30",
  weather: null,
  uptimeSeconds: 75,
};
assert.match(runCommand("whoami", ctx).lines[0].text, /Kittipan Sankoh/);
assert.deepEqual(runCommand("open about", ctx).effects, [
  { type: "open", app: "about" },
]);
assert.deepEqual(runCommand("open launchpad", ctx).effects, []);
assert.equal(runCommand("open launchpad", ctx).lines[0].tone, "error");
assert.deepEqual(
  runCommand("open launchpad", {
    ...ctx,
    owner: true,
    apps: [{ id: "launchpad", locked: false }],
  }).effects,
  [{ type: "open", app: "launchpad" }],
);
assert.deepEqual(runCommand("LANG th", ctx).effects, [
  { type: "lang", lang: "th" },
]);
assert.deepEqual(runCommand("theme dusk", ctx).effects, [
  { type: "theme", value: "dusk" },
]);
assert.equal(runCommand("theme purple", ctx).effects.length, 0);
assert.match(runCommand("ls", ctx).lines[0].text, /launchpad\/ \[locked\]/);
assert.match(runCommand("nope", ctx).lines[0].text, /command not found/);
assert.equal(runCommand("   ", ctx).lines.length, 0);
assert.match(runCommand("neofetch", ctx).lines[5].text, /1m 15s/);

// Access JWT claims
const now = 1_800_000_000;
const good = {
  aud: ["aud123"],
  iss: "https://team.cloudflareaccess.com",
  exp: now + 60,
  email: "me@kittipan.net",
};
assert.equal(
  validateClaims(good, {
    aud: "aud123",
    iss: "https://team.cloudflareaccess.com",
    now,
  }),
  true,
);
assert.equal(
  validateClaims(
    { ...good, aud: ["other"] },
    { aud: "aud123", iss: good.iss, now },
  ),
  false,
);
assert.equal(
  validateClaims(
    { ...good, iss: "https://evil.example" },
    { aud: "aud123", iss: good.iss, now },
  ),
  false,
);
assert.equal(
  validateClaims(
    { ...good, exp: now - 1 },
    { aud: "aud123", iss: good.iss, now },
  ),
  false,
);
assert.equal(
  validateClaims(
    { ...good, aud: "aud123" },
    { aud: "aud123", iss: good.iss, now },
  ),
  true,
);

console.log(`selfcheck ok · sunrise ${rise} · sunset ${set}`);
