// Run: node scripts/selfcheck.mts
import assert from "node:assert/strict";
import { phaseAt, sunTimes, sunProgress, bangkokTime, shadowOffset } from "../src/os/sun.ts";
import { festivalOn } from "../src/os/festival.ts";
import { newGame, step, turn } from "../src/os/snake.ts";
import { defaultLayout, gridFor, moveIcons, resolveLayout, sortLayout } from "../src/os/desktop.ts";
import { TRASH, childrenOf, create, emptyTrash, moveInto, putBack, rename, seedFs, toTrash } from "../src/os/files.ts";
import { complete, runCommand, type TerminalContext } from "../src/os/terminal.ts";
import { normalizeTeamDomain, validateClaims } from "../functions/api/private/launchpad.ts";

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

assert.deepEqual(shadowOffset(0), { x: 5, y: 4 });
assert.deepEqual(shadowOffset(0.5), { x: 0, y: 3 });
assert.deepEqual(shadowOffset(1), { x: -5, y: 4 });
assert.deepEqual(shadowOffset(null), { x: 0, y: 3 });

// Festivals (Bangkok dates)
assert.equal(festivalOn(new Date("2027-04-13T02:00:00Z")), "songkran");
assert.equal(festivalOn(new Date("2027-04-16T02:00:00Z")), null);
assert.equal(festivalOn(new Date("2026-12-31T20:00:00Z")), "newyear"); // Jan 1 03:00 BKK
assert.equal(festivalOn(new Date("2026-11-25T12:00:00Z")), "loykrathong");
assert.equal(festivalOn(new Date("2026-11-24T12:00:00Z")), "loykrathong"); // eve
assert.equal(festivalOn(new Date("2026-11-26T12:00:00Z")), null);
assert.equal(festivalOn(new Date("2026-09-27T05:00:00Z")), null);

// Snake
const fixed = () => 0;
let g = newGame(10, 8, fixed);
assert.deepEqual(g.snake[0], [4, 4]);
g = step(g, fixed);
assert.deepEqual(g.snake[0], [5, 4]);
assert.equal(turn(g, "left").queued, "right"); // no reversing
g = { ...g, food: [6, 4] };
g = step(g, fixed);
assert.equal(g.score, 1);
assert.equal(g.snake.length, 4);
let wall = newGame(10, 8, fixed);
for (let i = 0; i < 10; i++) wall = step(wall, fixed);
assert.equal(wall.alive, false);

// Desktop icons
const grid = gridFor(1440, 900); // 11 cols × 7 rows with the widget column reserved
assert.deepEqual(grid, { cols: 11, rows: 7 });
const ids = ["about", "projects", "terminal", "contact", "settings", "launchpad", "trash"];
const lay = defaultLayout(ids, grid);
assert.deepEqual(lay.about, { c: 0, r: 0 });
assert.deepEqual(lay.launchpad, { c: 0, r: 5 });
assert.deepEqual(lay.trash, { c: 10, r: 6 });
const moved = moveIcons(lay, ["about", "projects"], { c: 3, r: 0 }, grid);
assert.deepEqual([moved.about, moved.projects], [{ c: 3, r: 0 }, { c: 3, r: 1 }]);
const blocked = moveIcons(lay, ["about"], { c: 0, r: 1 }, grid); // projects sits there
assert.notDeepEqual(blocked.about, lay.projects);
assert.equal(new Set(Object.values(blocked).map((x) => `${x.c},${x.r}`)).size, ids.length);
const small = resolveLayout({ ...lay, trash: { c: 10, r: 6 } }, ids, gridFor(900, 600));
assert.ok(Object.values(small).every((x) => x.c < gridFor(900, 600).cols && x.r < gridFor(900, 600).rows));
assert.equal(new Set(Object.values(small).map((x) => `${x.c},${x.r}`)).size, ids.length);
const sorted = sortLayout(moved, { about: "About", projects: "Projects", terminal: "Terminal", contact: "Contact", settings: "Settings", launchpad: "Launchpad", trash: "Trash" }, grid);
assert.deepEqual(sorted.contact, { c: 0, r: 1 });
assert.deepEqual(sorted.trash, lay.trash);

const withFiles = defaultLayout([...ids, "f1", "f2"], grid, "trash", (id) => id.startsWith("f"));
assert.deepEqual(withFiles.f1, { c: 10, r: 0 });
assert.deepEqual(withFiles.f2, { c: 10, r: 1 });

// File system
let fs = seedFs(1);
assert.equal(childrenOf(fs, null).length, 4);
assert.equal(childrenOf(fs, null)[0].name, "Old site"); // folders first
let note;
[fs, note] = create(fs, "note", null);
assert.equal(note.name, "untitled.txt");
let note2;
[fs, note2] = create(fs, "note", null);
assert.equal(note2.name, "untitled 2.txt");
fs = rename(fs, note2.id, "ideas");
assert.equal(fs[note2.id].name, "ideas.txt");
fs = rename(fs, note2.id, "readme.txt"); // taken → suffixed
assert.equal(fs[note2.id].name, "readme 2.txt");
fs = moveInto(fs, [note.id, "seed-old"], "seed-old"); // folder can't enter itself
assert.equal(fs[note.id].parent, "seed-old");
assert.equal(fs["seed-old"].parent, null);
fs = toTrash(fs, ["seed-old", "seed-todo"]);
assert.equal(childrenOf(fs, TRASH).length, 2);
fs = putBack(fs, ["seed-todo"]);
assert.equal(fs["seed-todo"].parent, null);
fs = emptyTrash(fs);
assert.equal(fs["seed-old"], undefined);
assert.equal(fs["seed-v1"], undefined); // contents go with the folder
assert.equal(fs[note.id], undefined);
assert.ok(fs["seed-readme"]);

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
  version: "2.1.0 (abc1234)",
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

assert.match(runCommand("version", ctx).lines[0].text, /2\.1\.0/);
assert.deepEqual(complete("who", ["about"]), { value: "whoami ", options: ["whoami"] });
assert.deepEqual(complete("open co", ["about", "contact"]).value, "open contact ");
assert.deepEqual(complete("s", ["about"]).options, ["sound", "screensaver"]);
assert.equal(complete("s", ["about"]).value, "s");
assert.equal(complete("th", ["about"]).value, "theme ");
assert.equal(complete("theme d", []).value, "theme d");
assert.deepEqual(complete("theme d", []).options, ["dawn", "day", "dusk"]);
assert.equal(complete("zzz", []).options.length, 0);

const fctx = { ...ctx, files: [{ name: "readme.txt", kind: "note" as const, content: "hi\nthere" }, { name: "Old site", kind: "folder" as const }] };
assert.deepEqual(runCommand("cat readme.txt", fctx).lines.map((l) => l.text), ["hi", "there"]);
assert.deepEqual(runCommand("rm README.TXT", fctx).effects, [{ type: "rm", name: "readme.txt" }]);
assert.equal(runCommand("rm -rf /", fctx).effects.length, 0);
assert.match(runCommand("ls files", fctx).lines[0].text, /Old site\//);
assert.deepEqual(runCommand("touch ideas", fctx).effects, [{ type: "touch", name: "ideas" }]);

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

for (const v of ["royal-violet-9bc8.cloudflareaccess.com", "https://royal-violet-9bc8.cloudflareaccess.com/", " https://royal-violet-9bc8.cloudflareaccess.com/cdn-cgi "])
  assert.equal(normalizeTeamDomain(v), "https://royal-violet-9bc8.cloudflareaccess.com");

console.log(`selfcheck ok · sunrise ${rise} · sunset ${set}`);
