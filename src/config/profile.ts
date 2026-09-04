export interface SocialLink {
  id: string;
  label: string;
  url: string;
  username?: string;
  icon: 'github' | 'facebook' | 'telegram' | 'mail' | 'globe' | 'home';
  featured?: boolean;
  color?: string;
  badge?: string;
}

export interface TechItem {
  name: string;
  category: 'Homelab' | 'Cloud & Net' | 'Frontend' | 'IoT & Automation';
  icon?: string;
}

export interface ProfileConfig {
  name: string;
  handle: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  avatarUrl: string;
  websiteUrl: string;
  email: string;
  smartHome: {
    title: string;
    description: string;
    url: string;
    statusText: string;
    subtext: string;
  };
  socialLinks: SocialLink[];
  techStack: TechItem[];
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
  title: "Tech Enthusiast & Automation Builder",
  tagline: "Automating home, streamlining workflows & tinkering with homelabs.",
  bio: "Passionate about Home Automation, self-hosting on Hyper-V, and modern cloud architecture. Always exploring new tech frontiers.",
  location: "Bangkok, Thailand",
  avatarUrl: "", // When empty, renders a high-tech animated gradient monogram
  websiteUrl: "https://kittipan.net",
  email: "me@kittipan.net",
  smartHome: {
    title: "Smart Home Portal",
    description: "Home Assistant OS running on dedicated Hyper-V with Cloudflare Zero Trust tunnels.",
    url: "https://home.kittipan.net",
    statusText: "Operational",
    subtext: "home.kittipan.net",
  },
  socialLinks: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/kittipan2206",
      username: "kittipan2206",
      icon: "github",
      featured: true,
      color: "#f0f6fc",
      badge: "Open Source",
    },
    {
      id: "telegram",
      label: "Telegram Bot",
      url: "https://t.me/kittipan_ha_bot",
      username: "@kittipan_ha_bot",
      icon: "telegram",
      featured: true,
      color: "#229ED9",
      badge: "HA Bot",
    },
    {
      id: "facebook",
      label: "Facebook",
      url: "https://facebook.com",
      username: "Kittipan Sankoh",
      icon: "facebook",
      color: "#1877F2",
    },
    {
      id: "email",
      label: "Direct Email",
      url: "mailto:me@kittipan.net",
      username: "me@kittipan.net",
      icon: "mail",
      color: "#00F0FF",
      badge: "Cloudflare Routing",
    },
  ],
  techStack: [
    { name: "Home Assistant", category: "IoT & Automation" },
    { name: "Hyper-V", category: "Homelab" },
    { name: "Cloudflare Tunnels", category: "Cloud & Net" },
    { name: "Cloudflare Pages", category: "Cloud & Net" },
    { name: "Next.js 15", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "Zigbee & Tuya", category: "IoT & Automation" },
  ],
  vCard: {
    firstName: "Kittipan",
    lastName: "Sankoh",
    organization: "Personal Homelab & Tech",
    title: "Tech Enthusiast & Automation Builder",
    email: "me@kittipan.net",
    url: "https://kittipan.net",
    note: "Connect via kittipan.net or email me@kittipan.net",
  },
};
