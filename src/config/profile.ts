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

export interface Project {
  id: string;
  code: string;
  name: string;
  year: string;
  kind: Localized;
  summary: Localized;
  points: Localized[];
  stack: string[];
  media?: { video: string; poster: string };
  links: { label: string; url: string }[];
}

// Public work only: private repos and client projects never go here (the repo is public).
export const projects: Project[] = [
  {
    id: "kittipan-os",
    code: "OS",
    name: "kittipan OS",
    year: "2026",
    kind: { en: "Personal site · browser OS", th: "เว็บส่วนตัว · OS บนเบราว์เซอร์" },
    summary: {
      en: "The site you're using: a personal operating system for the web. Guests explore; the owner unlocks a private hub behind Cloudflare Access.",
      th: "เว็บที่คุณกำลังใช้อยู่ ระบบปฏิบัติการส่วนตัวบนเว็บ คนทั่วไปเข้ามาเล่นได้ ส่วนเจ้าของปลดล็อกศูนย์กลางส่วนตัวผ่าน Cloudflare Access",
    },
    points: [
      { en: "Lighting follows the real sun over Bangkok, computed in the browser", th: "แสงของทั้ง OS เปลี่ยนตามดวงอาทิตย์จริงเหนือกรุงเทพ คำนวณในเบราว์เซอร์" },
      { en: "Owner mode verified twice: Cloudflare Access + JWT check in a Pages Function", th: "โหมดเจ้าของตรวจสองชั้น ทั้ง Cloudflare Access และตรวจ JWT ใน Pages Function" },
      { en: "Static export on the edge — runs at 0 THB a month", th: "Static export บน edge ค่าใช้จ่าย 0 บาทต่อเดือน" },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "Framer Motion", "Cloudflare Pages"],
    media: { video: "/projects/kittipan-os.mp4", poster: "/projects/kittipan-os.jpg" },
    links: [{ label: "Source", url: "https://github.com/kittipan2206/kittipan-net" }],
  },
  {
    id: "khuandon",
    code: "KD",
    name: "Khuan Don Agriculture Portal",
    year: "2026",
    kind: { en: "Public service portal · local government", th: "พอร์ทัลบริการประชาชน · อบต." },
    summary: {
      en: "Online agriculture services for Khuan Don SAO, Satun: villagers file requests from their phone, track them by code, and follow farming news — no trip to the office.",
      th: "บริการด้านการเกษตรออนไลน์ของ อบต.ควนโดน จ.สตูล ชาวบ้านแจ้งเรื่องผ่านมือถือ ติดตามสถานะด้วยรหัส และดูข่าวงานเกษตรได้ ไม่ต้องเดินทางไปสำนักงาน",
    },
    points: [
      { en: "Request tracking by code, with email updates", th: "ติดตามเรื่องร้องเรียนด้วยรหัส พร้อมแจ้งเตือนทางอีเมล" },
      { en: "Admin CMS: rich-text news and services, drag-to-sort, maps", th: "ระบบหลังบ้าน เขียนข่าวและบริการแบบ rich text ลากเรียงลำดับ และแผนที่" },
      { en: "Mobile-first Thai design, built for people who only have a phone", th: "ออกแบบภาษาไทยโดยคิดจากมือถือก่อน สำหรับคนที่มีแค่มือถือ" },
    ],
    stack: ["Next.js", "Supabase", "Tiptap", "Leaflet", "Resend"],
    media: { video: "/projects/khuandon.mp4", poster: "/projects/khuandon.jpg" },
    links: [{ label: "Live site", url: "https://khuandon-web.vercel.app" }],
  },
];

export const archive: { name: string; note: Localized; url: string; year: string }[] = [
  {
    name: "rpi-wifi-fix",
    year: "2023",
    note: { en: "Simultaneous AP + client Wi-Fi on a Raspberry Pi", th: "ให้ Raspberry Pi เป็นทั้ง access point และต่อ Wi-Fi พร้อมกัน" },
    url: "https://github.com/kittipan2206/rpi-wifi-fix",
  },
  {
    name: "smart-bus-app",
    year: "2023",
    note: { en: "Flutter app for a smart bus system", th: "แอป Flutter สำหรับระบบรถบัสอัจฉริยะ" },
    url: "https://github.com/kittipan2206/smart-bus-app",
  },
  {
    name: "music_playlist_app",
    year: "2025",
    note: { en: "Flutter music playlist app for Android and iOS", th: "แอปเพลย์ลิสต์เพลงด้วย Flutter ทั้ง Android และ iOS" },
    url: "https://github.com/kittipan2206/music_playlist_app",
  },
  {
    name: "Maker Tutor",
    year: "2017",
    note: { en: "Arduino tutorials on YouTube", th: "ช่อง YouTube สอน Arduino" },
    url: "https://www.youtube.com/channel/UCaDCwZpf36YyALB5D_LvWlA",
  },
];

export const pick = (value: Localized, lang: Lang) => value[lang];
