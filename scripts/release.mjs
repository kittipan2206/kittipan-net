// Usage: npm run release -- <patch|minor|major>
// Bumps package.json, turns "## [Unreleased]" in CHANGELOG.md into the new version, commits and tags vX.Y.Z.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump)) {
  console.error("usage: npm run release -- <patch|minor|major>");
  process.exit(1);
}
const sh = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
if (sh("git status --porcelain")) {
  console.error("working tree is not clean — commit first");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);
const next = bump === "major" ? `${major + 1}.0.0` : bump === "minor" ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;

const changelog = readFileSync("CHANGELOG.md", "utf8");
if (!/## \[Unreleased\]\n+-/.test(changelog)) {
  console.error("CHANGELOG.md has no entries under ## [Unreleased]");
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync("CHANGELOG.md", changelog.replace("## [Unreleased]", `## [Unreleased]\n\n## [${next}] - ${today}`));
pkg.version = next;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

sh(`git add package.json CHANGELOG.md && git commit -m "chore(release): v${next}" && git tag v${next}`);
console.log(`released v${next} — push with: git push --follow-tags`);
