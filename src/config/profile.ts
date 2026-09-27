// Public content only — this repo is public. Private data comes from /api/private/* at runtime.
export type Lang = "th" | "en";
export type Localized = Record<Lang, string>;

export interface SocialLink {
  id: string;
  label: string;
  code: string;
  handle: string;
  url: string;
}

export const profile = {
  name: "Kittipan Sankoh",
  monogram: "KS",
  role: {
    en: "Software & Mobile Engineer",
    th: "วิศวกรซอฟต์แวร์และแอปมือถือ",
  } as Localized,
  location: { en: "Bangkok, TH", th: "กรุงเทพฯ" } as Localized,
  timezone: "UTC+7",
  websiteUrl: "https://kittipan.net",
  email: "me@kittipan.net",
  github: "https://github.com/kittipan2206",
  statement: {
    en: "I build cross-platform mobile apps (Flutter / iOS / Android) and modern web systems — and wire up everything else around me, from my smart home to the AI agents that help me work.",
    th: "ผมสร้างแอปมือถือข้ามแพลตฟอร์ม (Flutter / iOS / Android) และระบบเว็บสมัยใหม่ แล้วก็ชอบต่อทุกอย่างรอบตัวให้เป็นระบบ ตั้งแต่บ้านอัจฉริยะไปจนถึง AI agent ที่ช่วยผมทำงาน",
  } as Localized,
  domains: [
    {
      badge: "Flutter · iOS · Android",
      title: {
        en: "Mobile Application Engineering",
        th: "พัฒนาแอปพลิเคชันมือถือ",
      } as Localized,
      description: {
        en: "Cross-platform apps with native integrations, reactive state and fluid motion.",
        th: "แอปข้ามแพลตฟอร์มที่เชื่อมฟีเจอร์ของเครื่องจริง จัดการ state แบบ reactive และเคลื่อนไหวลื่นไหล",
      } as Localized,
      highlights: "Clean Architecture · Offline-first · Store delivery",
    },
    {
      badge: "React · Next.js · TypeScript",
      title: {
        en: "Web & System Architecture",
        th: "สถาปัตยกรรมเว็บและระบบ",
      } as Localized,
      description: {
        en: "Modern web apps, public portals and secure APIs with edge-first delivery.",
        th: "เว็บแอปสมัยใหม่ พอร์ทัลสาธารณะ และ API ที่ปลอดภัย ส่งผ่าน edge ให้เร็วที่สุด",
      } as Localized,
      highlights: "Static edge · Type-safe APIs · Responsive UX",
    },
  ],
  stack: [
    "Flutter & Dart",
    "React & Next.js",
    "TypeScript",
    "Node.js",
    "Supabase",
    "Cloudflare",
    "Home Assistant",
  ],
  now: {
    text: {
      en: "Building kittipan OS — a personal operating system for the web.",
      th: "กำลังสร้าง kittipan OS ระบบปฏิบัติการส่วนตัวบนเว็บ",
    } as Localized,
    updated: "2026-09-27",
  },
  links: [
    {
      id: "linkedin",
      label: "LinkedIn",
      code: "in",
      handle: "in/kittipan-sankoh",
      url: "https://www.linkedin.com/in/kittipan-sankoh/",
    },
    {
      id: "github",
      label: "GitHub",
      code: "GH",
      handle: "kittipan2206",
      url: "https://github.com/kittipan2206",
    },
    {
      id: "facebook",
      label: "Facebook",
      code: "FB",
      handle: "yourkittipan",
      url: "https://facebook.com/yourkittipan",
    },
    {
      id: "email",
      label: "Email",
      code: "@",
      handle: "me@kittipan.net",
      url: "mailto:me@kittipan.net",
    },
  ] as SocialLink[],
};

export const pick = (value: Localized, lang: Lang) => value[lang];
