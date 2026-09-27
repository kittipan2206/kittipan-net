import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Cloudflare Pages exposes the commit; fall back to local git for dev builds.
function commit() {
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_VERSION: version,
    NEXT_PUBLIC_COMMIT: commit(),
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString().slice(0, 10),
  },
};

export default nextConfig;
