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
  smartHomeNode?: {
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
  role: "Software & Mobile Engineer",
  statement: "Crafting digital experiences across web, mobile applications, and resilient software systems.",
  location: "Bangkok, Thailand",
  timezone: "UTC+7",
  websiteUrl: "https://kittipan.net",
  email: "me@kittipan.net",
  portLinks: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/kittipan2206",
      handle: "kittipan2206",
      description: "Open source projects & repositories",
      icon: "github",
      hotkey: "G",
    },
    {
      id: "email",
      label: "Email",
      url: "mailto:me@kittipan.net",
      handle: "me@kittipan.net",
      description: "Direct contact & business inquiries",
      icon: "mail",
      hotkey: "C",
    },
    {
      id: "facebook",
      label: "Facebook",
      url: "https://facebook.com",
      handle: "Kittipan Sankoh",
      description: "Personal social network",
      icon: "facebook",
      hotkey: "F",
    },
  ],
  techStack: [
    { name: "Flutter & Dart", category: "Mobile", detail: "Cross-platform iOS & Android" },
    { name: "React & Next.js", category: "Web", detail: "Modern Frontend Architecture" },
    { name: "TypeScript", category: "Language", detail: "Type-safe Engineering" },
    { name: "Node.js", category: "Backend", detail: "APIs & Web Services" },
    { name: "Tailwind CSS", category: "Styling", detail: "Responsive Interface Design" },
    { name: "Git & Cloudflare", category: "DevOps", detail: "CI/CD & Edge Deployment" },
  ],
  vCard: {
    firstName: "Kittipan",
    lastName: "Sankoh",
    organization: "Software Engineering",
    title: "Software & Mobile Engineer",
    email: "me@kittipan.net",
    url: "https://kittipan.net",
    note: "Kittipan Sankoh — Software & Mobile Engineer. Contact: me@kittipan.net",
  },
};
