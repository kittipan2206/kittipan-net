// Injected at build time by next.config.mjs — package.json "version" is the single source of truth.
export const VERSION = process.env.NEXT_PUBLIC_VERSION ?? "0.0.0";
export const COMMIT = process.env.NEXT_PUBLIC_COMMIT ?? "dev";
export const BUILT_AT = process.env.NEXT_PUBLIC_BUILT_AT ?? "";
export const VERSION_LABEL = `${VERSION} (${COMMIT})`;
