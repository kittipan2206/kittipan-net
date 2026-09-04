export interface PortLink {
  id: string;
  label: string;
  url: string;
  handle: string;
  description: string;
  icon: 'github' | 'facebook' | 'telegram' | 'mail';
  hotkey: string;
}

export interface TechItem {
  name: string;
  category: string;
  detail: string;
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
  smartHomeNode: {
    label: string;
    url: string;
    subtext: string;
    status: 'ONLINE' | 'STANDBY';
    description: string;
    specs: {
      virtualization: string;
      core: string;
      network: string;
    };
  };
  portLinks: PortLink[];
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
  role: "Systems & Automation Engineer",
  statement: "Designing resilient private cloud infrastructure, self-hosted automation pipelines, and isolated hardware networks.",
  location: "Bangkok, Thailand",
  timezone: "UTC+7",
  websiteUrl: "https://kittipan.net",
  email: "me@kittipan.net",
  smartHomeNode: {
    label: "Private Home Cloud & Automation",
    url: "https://home.kittipan.net",
    subtext: "home.kittipan.net",
    status: "ONLINE",
    description: "Self-hosted Home Assistant OS virtualized on dedicated Hyper-V hardware, protected by Cloudflare Zero Trust tunnel.",
    specs: {
      virtualization: "Microsoft Hyper-V",
      core: "Home Assistant OS 13.x",
      network: "Cloudflare Zero Trust Tunnel",
    },
  },
  portLinks: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/kittipan2206",
      handle: "kittipan2206",
      description: "Repositories, automation configs & tools",
      icon: "github",
      hotkey: "G",
    },
    {
      id: "telegram",
      label: "J.A.R.V.I.S. Bot",
      url: "https://t.me/kittipan_ha_bot",
      handle: "@kittipan_ha_bot",
      description: "Telegram smart home assistant & voice dispatch",
      icon: "telegram",
      hotkey: "T",
    },
    {
      id: "email",
      label: "Direct Email",
      url: "mailto:me@kittipan.net",
      handle: "me@kittipan.net",
      description: "Inbound correspondence & collaboration",
      icon: "mail",
      hotkey: "C",
    },
    {
      id: "facebook",
      label: "Facebook",
      url: "https://facebook.com",
      handle: "Kittipan Sankoh",
      description: "Personal social network & updates",
      icon: "facebook",
      hotkey: "F",
    },
  ],
  techStack: [
    { name: "Hyper-V", category: "Hardware", detail: "Dedicated Hypervisor" },
    { name: "Home Assistant", category: "Core", detail: "Private IoT Automation" },
    { name: "Cloudflare Zero Trust", category: "Network", detail: "Encrypted Edge Tunnel" },
    { name: "Zigbee 3.0 & Tuya LAN", category: "IoT", detail: "Local Mesh Protocols" },
    { name: "Next.js 15 & Tailwind", category: "Frontend", detail: "Edge Static Web" },
    { name: "Python & Gemini AI", category: "Intelligence", detail: "Automation Agents" },
  ],
  vCard: {
    firstName: "Kittipan",
    lastName: "Sankoh",
    organization: "Systems & Homelab Infrastructure",
    title: "Systems & Automation Engineer",
    email: "me@kittipan.net",
    url: "https://kittipan.net",
    note: "Kittipan Sankoh — Systems & Automation Engineer. Contact: me@kittipan.net",
  },
};
