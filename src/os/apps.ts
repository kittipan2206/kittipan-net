import {
  Contact,
  Folder,
  LayoutGrid,
  Settings,
  SquareTerminal,
  User,
  type LucideIcon,
} from "lucide-react";

export type AppId =
  "about" | "projects" | "terminal" | "contact" | "settings" | "launchpad";

export interface AppMeta {
  id: AppId;
  title: string;
  file: string;
  icon: LucideIcon;
  /** preferred window frame on desktop */
  frame: { x: number; y: number; w: number; h: number };
  ownerOnly?: boolean;
}

export const APPS: AppMeta[] = [
  {
    id: "about",
    title: "About",
    file: "about.app",
    icon: User,
    frame: { x: 128, y: 60, w: 830, h: 660 },
  },
  {
    id: "projects",
    title: "Projects",
    file: "projects.app",
    icon: Folder,
    frame: { x: 190, y: 70, w: 780, h: 640 },
  },
  {
    id: "terminal",
    title: "Terminal",
    file: "terminal",
    icon: SquareTerminal,
    frame: { x: 170, y: 96, w: 760, h: 480 },
  },
  {
    id: "contact",
    title: "Contact",
    file: "contact.app",
    icon: Contact,
    frame: { x: 240, y: 80, w: 500, h: 640 },
  },
  {
    id: "settings",
    title: "Settings",
    file: "settings.app",
    icon: Settings,
    frame: { x: 260, y: 70, w: 640, h: 660 },
  },
  {
    id: "launchpad",
    title: "Launchpad",
    file: "launchpad.app",
    icon: LayoutGrid,
    frame: { x: 230, y: 90, w: 900, h: 520 },
    ownerOnly: true,
  },
];

export const appById = (id: AppId) => APPS.find((a) => a.id === id)!;
export const isAppId = (value: string): value is AppId =>
  APPS.some((a) => a.id === value);
