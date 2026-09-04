# kittipan.net ⚡

> Personal Digital Business Card & Link-in-Bio portal for **Kittipan Sankoh** ([kittipan.net](https://kittipan.net)).

Built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Framer Motion**, pre-rendered to pure static assets (`output: 'export'`) for lightning-fast delivery via **Cloudflare Pages**.

---

## ✨ Features

- 🌌 **Sleek Cyber-Glass Design:** High-contrast dark void aesthetic, ambient mesh gradient lighting, glassmorphism blur, and interactive spring physics.
- 🏠 **Smart Home Portal Highlight:** Dedicated live card routing to [`home.kittipan.net`](https://home.kittipan.net) (Home Assistant OS on Hyper-V via Cloudflare Tunnel).
- 📇 **Instant Contact Download (.vcf):** Generates and downloads a clean vCard directly to iOS / Android contact book with celebratory particle confetti.
- 📱 **Interactive QR Code Modal:** Instant QR generation using `qrcode.react`, supporting direct scanning, link copying, or high-res PNG download.
- ⚡ **Cloudflare Email Direct Copy:** Click-to-copy and `mailto:` action for `me@kittipan.net`.
- 🛠️ **Homelab & Tech Badges:** Showcase of current active stack (Hyper-V, Home Assistant, Cloudflare, Next.js, etc.).
- ⚙️ **Single Source of Truth (`src/config/profile.ts`):** Update bio, links, and tags in one place without touching JSX or CSS.

---

## 🛠️ Project Structure

```text
kittipan-net/
├── src/
│   ├── app/
│   │   ├── globals.css        # Cyber grid & glassmorphism styling
│   │   ├── layout.tsx         # OpenGraph meta & HTML root
│   │   └── page.tsx           # Main page layout & ambient effects
│   ├── components/
│   │   ├── ActionRow.tsx      # Save Contact, QR Modal, Copy Email
│   │   ├── ProfileHeader.tsx  # Avatar monogram & verified status
│   │   ├── QRCodeModal.tsx    # Responsive QR pop-up & PNG exporter
│   │   ├── SmartHomeCard.tsx  # Dedicated Home Assistant card
│   │   ├── SocialLinks.tsx    # GitHub, Telegram, Facebook, Mail links
│   │   ├── TechBadges.tsx     # Homelab stack tags
│   │   └── Toast.tsx          # Copy/download notifications
│   └── config/
│       └── profile.ts         # 🌟 All profile info & links configured here
├── next.config.mjs            # Static export configuration (output: 'export')
├── tailwind.config.ts         # Theme tokens & keyframe animations
└── package.json
```

---

## 🚀 How to Edit Your Profile

You don't need to touch React components. Simply open:
👉 **`src/config/profile.ts`**

You can customize:
- Name, handle, title, bio, and location.
- Smart Home title, status, and destination URL.
- Social channels (GitHub, Telegram bot, Facebook, custom URLs).
- Homelab / Tech stack tags.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build static production export (outputs to /out)
npm run build
```

---

## 🌐 Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select repository `kittipan2206/kittipan-net`.
3. Configure Build Settings:
   - **Framework preset:** `Next.js (Static HTML Export)` or `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
4. Click **Save and Deploy**.
5. In **Custom domains**, add `kittipan.net`. Cloudflare handles SSL and DNS routing automatically!
