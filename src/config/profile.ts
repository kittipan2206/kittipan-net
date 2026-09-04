export interface PortLink {
  id: string;
  portNumber: string;
  label: string;
  url: string;
  targetHandle: string;
  icon: 'github' | 'facebook' | 'telegram' | 'mail' | 'terminal';
  protocol: string;
  highlight?: boolean;
}

export interface SystemSpec {
  key: string;
  value: string;
  type: 'hardware' | 'network' | 'software';
}

export interface ProfileConfig {
  serialNumber: string;
  name: string;
  handle: string;
  role: string;
  statement: string;
  location: string;
  timezone: string;
  websiteUrl: string;
  email: string;
  smartHomeNode: {
    nodeId: string;
    label: string;
    url: string;
    status: 'ONLINE' | 'STANDBY';
    subtext: string;
    host: string;
    routing: string;
    core: string;
  };
  portLinks: PortLink[];
  systemSpecs: SystemSpec[];
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
  serialNumber: "SPECIMEN // KS-NET-01",
  name: "Kittipan Sankoh",
  handle: "@kittipan",
  role: "Systems & Homelab Builder",
  statement: "Building dedicated hardware environments, private IoT networks, and resilient automation pipelines.",
  location: "Bangkok, Thailand",
  timezone: "UTC+7",
  websiteUrl: "https://kittipan.net",
  email: "me@kittipan.net",
  smartHomeNode: {
    nodeId: "NODE // HA-HYPERV",
    label: "Smart Home Portal",
    url: "https://home.kittipan.net",
    status: "ONLINE",
    subtext: "home.kittipan.net",
    host: "Hyper-V Virtualization",
    routing: "Cloudflare Zero Trust Tunnel",
    core: "Home Assistant OS 13.x",
  },
  portLinks: [
    {
      id: "github",
      portNumber: "01",
      label: "GitHub Repositories",
      url: "https://github.com/kittipan2206",
      targetHandle: "kittipan2206",
      icon: "github",
      protocol: "HTTPS // GIT",
      highlight: true,
    },
    {
      id: "telegram",
      portNumber: "02",
      label: "Home Automation Bot",
      url: "https://t.me/kittipan_ha_bot",
      targetHandle: "@kittipan_ha_bot",
      icon: "telegram",
      protocol: "BOT-API // TELEGRAM",
      highlight: true,
    },
    {
      id: "facebook",
      portNumber: "03",
      label: "Personal Profile",
      url: "https://facebook.com",
      targetHandle: "Kittipan Sankoh",
      icon: "facebook",
      protocol: "HTTPS // SOCIAL",
    },
    {
      id: "email",
      portNumber: "04",
      label: "Direct Inbound Mail",
      url: "mailto:me@kittipan.net",
      targetHandle: "me@kittipan.net",
      icon: "mail",
      protocol: "SMTP // CLOUDFLARE ROUTING",
    },
  ],
  systemSpecs: [
    { key: "VIRTUALIZATION", value: "Microsoft Hyper-V", type: "hardware" },
    { key: "AUTOMATION CORE", value: "Home Assistant OS", type: "software" },
    { key: "PERIMETER", value: "Cloudflare Zero Trust", type: "network" },
    { key: "EDGE HOSTING", value: "Cloudflare Pages (Static)", type: "network" },
    { key: "IOT PROTOCOLS", value: "Zigbee 3.0 / Tuya LAN", type: "hardware" },
    { key: "STACK", value: "Next.js 15 / Tailwind / TS", type: "software" },
  ],
  vCard: {
    firstName: "Kittipan",
    lastName: "Sankoh",
    organization: "Systems & Homelab Infrastructure",
    title: "Systems & Homelab Builder",
    email: "me@kittipan.net",
    url: "https://kittipan.net",
    note: "Kittipan Sankoh // Systems, Home Assistant & Homelab Infrastructure. Contact: me@kittipan.net",
  },
};
