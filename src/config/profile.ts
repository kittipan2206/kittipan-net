export interface PortLink {
  id: string;
  label: string;
  url: string;
  handle: string;
  description: string;
  icon: 'github' | 'linkedin' | 'facebook' | 'mail';
  hotkey: string;
}

export interface TechItem {
  name: string;
  category: string;
  detail: string;
}

export interface EngineeringDomain {
  title: string;
  badge: string;
  description: string;
  highlights: string[];
}

export interface ProfileConfig {
  name: string;
  handle: string;
  role: string;
  statement: string;
  location: string;
  timezone: string;
  websiteUrl: string;
  email: string;
  domains: EngineeringDomain[];
  portLinks: PortLink[];
  techStack: TechItem[];
  interests: string[];
  vCard: {
    firstName: string;
    lastName: string;
    organization: string;
    title: string;
    email: string;
    url: string;
    note: string;
  };
}

export const profileConfig: ProfileConfig = {
  name: "Kittipan Sankoh",
  handle: "@kittipan",
  role: "Software & Mobile Engineer",
  statement: "Specializing in cross-platform mobile engineering (Flutter / iOS / Android) and scalable modern web architecture. Dedicated to building reliable, high-performance digital products.",
  location: "Bangkok, Thailand",
  timezone: "UTC+7",
  websiteUrl: "https://kittipan.net",
  email: "me@kittipan.net",
  domains: [
    {
      title: "Mobile Application Engineering",
      badge: "Flutter · iOS · Android",
      description: "Developing cross-platform mobile applications with native device integrations, reactive state management, and fluid motion design.",
      highlights: ["Clean Architecture", "Offline-First Sync", "App Store & Play Store Delivery"],
    },
    {
      title: "Scalable Web & System Architecture",
      badge: "React · Next.js · TypeScript",
      description: "Crafting modern web applications, high-concurrency public portals, and secure API integrations with edge-first deployment.",
      highlights: ["SSR / Static Edge Delivery", "Type-Safe APIs", "Responsive UX"],
    },
  ],
  portLinks: [
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/kittipan-sankoh/",
      handle: "in/kittipan-sankoh",
      description: "Professional profile, background & network",
      icon: "linkedin",
      hotkey: "L",
    },
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/kittipan2206",
      handle: "kittipan2206",
      description: "Open source contributions, tools & code repositories",
      icon: "github",
      hotkey: "G",
    },
    {
      id: "email",
      label: "Direct Email",
      url: "mailto:me@kittipan.net",
      handle: "me@kittipan.net",
      description: "Inquiries, collaboration & direct correspondence",
      icon: "mail",
      hotkey: "C",
    },
    {
      id: "facebook",
      label: "Facebook",
      url: "https://facebook.com",
      handle: "Kittipan Sankoh",
      description: "Personal social profile",
      icon: "facebook",
      hotkey: "F",
    },
  ],
  techStack: [
    { name: "Flutter & Dart", category: "Mobile", detail: "iOS & Android Apps" },
    { name: "React & Next.js", category: "Web", detail: "Edge Web Architecture" },
    { name: "TypeScript", category: "Language", detail: "Type-Safe Codebases" },
    { name: "Node.js", category: "Backend", detail: "REST APIs & Services" },
    { name: "Tailwind CSS", category: "UI/UX", detail: "Design Systems & Tokens" },
    { name: "Git & Cloudflare", category: "DevOps", detail: "CI/CD & Edge Delivery" },
  ],
  interests: [
    "IoT & Smart Home Tinkerer",
    "Hardware Automation",
    "AI-Assisted Workflow Tools",
  ],
  vCard: {
    firstName: "Kittipan",
    lastName: "Sankoh",
    organization: "Software Engineering",
    title: "Software & Mobile Engineer",
    email: "me@kittipan.net",
    url: "https://kittipan.net",
    note: "Kittipan Sankoh — Software & Mobile Engineer. Mobile (Flutter, iOS, Android) & Modern Web. Contact: me@kittipan.net",
  },
};
