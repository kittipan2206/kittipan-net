# Owner mode — Cloudflare setup

Owner mode needs three things in the Cloudflare dashboard. Everything is on the free plan.

## 1. Access application

Zero Trust → Access → Applications → **Add an application → Self-hosted**.

- **Name:** kittipan OS owner
- **Domain / paths** (add both):
  - `kittipan.net` path `unlock/`
  - `kittipan.net` path `api/private/`
- **Session duration:** 24 hours (or what you like)
- **Policy:** Allow → Include → Emails → your email (same policy as `home3d.kittipan.net`)
- **Login method:** One-time PIN (email OTP)

After saving, open the application → **Overview** and copy the **Application Audience (AUD) tag**.

Your team domain is shown under Zero Trust → Settings → Custom Pages, e.g. `https://<team>.cloudflareaccess.com`.

## 2. Pages environment variables

Workers & Pages → `kittipan-net` → Settings → **Variables and Secrets** (Production):

| Name                 | Type       | Value                                                     |
| -------------------- | ---------- | --------------------------------------------------------- |
| `ACCESS_TEAM_DOMAIN` | Plaintext  | `https://<team>.cloudflareaccess.com` (no trailing slash) |
| `ACCESS_AUD`         | Plaintext  | the AUD tag from step 1                                   |
| `LAUNCHPAD_LINKS`    | **Secret** | JSON array, see below                                     |

```json
[
  {
    "code": "HA",
    "name": "Home Assistant",
    "sub": "home.kittipan.net",
    "url": "https://home.kittipan.net"
  },
  {
    "code": "3D",
    "name": "Home3D",
    "sub": "home3d.kittipan.net",
    "url": "https://home3d.kittipan.net"
  },
  {
    "code": "CF",
    "name": "Cloudflare",
    "sub": "DNS · Pages · Access",
    "url": "https://dash.cloudflare.com"
  },
  {
    "code": "GH",
    "name": "GitHub",
    "sub": "repos · actions",
    "url": "https://github.com/kittipan2206"
  }
]
```

Redeploy after changing variables.

## 3. Verify

1. Private window → `https://kittipan.net/api/private/launchpad` → should redirect to the Access login (not JSON).
2. `https://kittipan.net/unlock/` → email code → lands on `/#launchpad` with your links and the green **OWNER** badge.
3. Menu bar **OWNER** → logs out via `/cdn-cgi/access/logout`.

The function also verifies the Access JWT itself (signature, `aud`, `iss`, `exp`), so a misconfigured Access path still cannot leak the links.
