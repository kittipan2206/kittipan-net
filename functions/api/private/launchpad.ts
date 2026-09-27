// Cloudflare Pages Function: GET /api/private/launchpad
// Cloudflare Access guards this path; we still verify the Access JWT ourselves (defense in depth).
// Links live in the LAUNCHPAD_LINKS secret — never in this public repo.

interface Env {
  ACCESS_TEAM_DOMAIN?: string; // https://<team>.cloudflareaccess.com
  ACCESS_AUD?: string;
  LAUNCHPAD_LINKS?: string; // JSON: [{ "code": "HA", "name": "Home Assistant", "sub": "…", "url": "https://…" }]
}

interface Claims {
  aud?: string | string[];
  iss?: string;
  exp?: number;
  nbf?: number;
  email?: string;
}

interface Jwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
}

let jwksCache: { at: number; keys: Jwk[] } | null = null;
const JWKS_TTL_MS = 60 * 60_000;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store",
    },
  });

export function validateClaims(
  claims: Claims,
  expected: { aud: string; iss: string; now: number },
): boolean {
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.includes(expected.aud)) return false;
  if (claims.iss !== expected.iss) return false;
  if (typeof claims.exp !== "number" || claims.exp <= expected.now)
    return false;
  if (typeof claims.nbf === "number" && claims.nbf > expected.now + 60)
    return false;
  return true;
}

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const b64 = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const decodeJson = <T>(part: string): T =>
  JSON.parse(new TextDecoder().decode(base64UrlToBytes(part)));

async function getKeys(team: string): Promise<Jwk[]> {
  if (jwksCache && Date.now() - jwksCache.at < JWKS_TTL_MS)
    return jwksCache.keys;
  const res = await fetch(`${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`jwks ${res.status}`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  jwksCache = { at: Date.now(), keys };
  return keys;
}

async function verifyAccessJwt(
  token: string,
  env: Required<Pick<Env, "ACCESS_TEAM_DOMAIN" | "ACCESS_AUD">>,
): Promise<Claims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const header = decodeJson<{ alg: string; kid: string }>(h);
  if (header.alg !== "RS256") return null;

  const jwk = (await getKeys(env.ACCESS_TEAM_DOMAIN)).find(
    (k) => k.kid === header.kid,
  );
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(s),
    new TextEncoder().encode(`${h}.${p}`),
  );
  if (!valid) return null;

  const claims = decodeJson<Claims>(p);
  const ok = validateClaims(claims, {
    aud: env.ACCESS_AUD,
    iss: env.ACCESS_TEAM_DOMAIN,
    now: Math.floor(Date.now() / 1000),
  });
  return ok ? claims : null;
}

function readToken(request: Request): string | null {
  const header = request.headers.get("cf-access-jwt-assertion");
  if (header) return header;
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return match ? match[1] : null;
}

export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { ACCESS_TEAM_DOMAIN, ACCESS_AUD, LAUNCHPAD_LINKS } = env;
  if (!ACCESS_TEAM_DOMAIN || !ACCESS_AUD)
    return json(503, { error: "owner mode is not configured" });

  const token = readToken(request);
  if (!token) return json(401, { error: "unauthorized" });

  let claims: Claims | null = null;
  try {
    claims = await verifyAccessJwt(token, { ACCESS_TEAM_DOMAIN, ACCESS_AUD });
  } catch {
    return json(502, { error: "could not verify identity" });
  }
  if (!claims) return json(401, { error: "unauthorized" });

  let links: unknown = [];
  try {
    links = JSON.parse(LAUNCHPAD_LINKS ?? "[]");
  } catch {
    return json(500, { error: "LAUNCHPAD_LINKS is not valid JSON" });
  }
  return json(200, { email: claims.email ?? null, links });
}
