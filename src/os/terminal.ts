// Pure command interpreter — no React, no imports, so scripts/selfcheck.ts can run it under plain Node.
import type { Phase } from "./sun";

export type Tone = "out" | "muted" | "accent" | "error";
export interface Line {
  text: string;
  tone?: Tone;
}

export type Effect =
  | { type: "open"; app: string }
  | { type: "close" }
  | { type: "lang"; lang: "th" | "en" }
  | { type: "theme"; value: Phase | "auto" }
  | { type: "sound"; on: boolean }
  | { type: "clear" }
  | { type: "reboot" }
  | { type: "unlock" }
  | { type: "screensaver" }
  | { type: "rm"; name: string }
  | { type: "touch"; name: string }
  | { type: "festival"; value: "songkran" | "loykrathong" | "newyear" | "off" | "auto" };

export interface TerminalContext {
  name: string;
  role: string;
  location: string;
  email: string;
  apps: { id: string; locked: boolean }[];
  owner: boolean;
  phase: Phase;
  time: string;
  weather: string | null;
  uptimeSeconds: number;
  version: string;
  /** files on the desktop */
  files?: { name: string; kind: "note" | "folder" | "image"; content?: string }[];
}

export interface Result {
  lines: Line[];
  effects: Effect[];
}

const PHASES = ["auto", "dawn", "day", "dusk", "night"];

const HELP: Line[] = [
  { text: "commands", tone: "muted" },
  { text: "  whoami            who runs this machine" },
  { text: "  ls [apps]         list apps" },
  { text: "  open <app>        open an app (about, contact, …)" },
  { text: "  lang <th|en>      switch content language" },
  { text: "  theme <phase>     auto | dawn | day | dusk | night" },
  { text: "  sound <on|off>    keyboard clicks" },
  { text: "  date · weather    Bangkok, right now" },
  { text: "  neofetch          system info" },
  { text: "  ls files · cat · rm · touch   your desktop files" },
  { text: "  play snake        a game on the LCD" },
  { text: "  unlock            owner sign-in" },
  { text: "  version           build info · `changelog` for what's new" },
  { text: "  clear · reboot · screensaver · exit" },
  { text: "  tip: press Tab to complete", tone: "muted" },
  { text: "there are a few more. poke around.", tone: "muted" },
];

const ok = (...lines: Line[]): Result => ({ lines, effects: [] });
const fx = (effects: Effect[], ...lines: Line[]): Result => ({
  lines,
  effects,
});
const err = (text: string): Result => ok({ text, tone: "error" });

export function runCommand(input: string, ctx: TerminalContext): Result {
  const raw = input.trim();
  if (!raw) return ok();
  const [cmdRaw, ...args] = raw.split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const arg = (args[0] ?? "").toLowerCase();

  switch (cmd) {
    case "help":
    case "?":
      return ok(...HELP);

    case "whoami":
      return ok({ text: `${ctx.name} · ${ctx.role} · ${ctx.location}` });

    case "ls": {
      if (arg === "files" || arg === "desktop" || arg === "~") {
        const list = (ctx.files ?? []).map((f) => (f.kind === "folder" ? `${f.name}/` : f.name));
        return ok({ text: list.length ? list.join("   ") : "(desktop is empty)", tone: list.length ? "out" : "muted" });
      }
      if (arg && arg !== "apps")
        return ok({
          text: `${arg}: coming soon. for now: github.com/kittipan2206`,
          tone: "muted",
        });
      const list = ctx.apps
        .map((a) => (a.locked ? `${a.id}/ [locked]` : `${a.id}/`))
        .join("   ");
      return ok({ text: list });
    }

    case "open": {
      if (!arg) return err("usage: open <app>");
      const app = ctx.apps.find((a) => a.id === arg);
      if (!app) return err(`open: no such app: ${arg}`);
      if (app.locked) {
        return ok(
          { text: `permission denied: ${arg} is owner-only.`, tone: "error" },
          { text: "run `unlock` to sign in.", tone: "muted" },
        );
      }
      return fx([{ type: "open", app: arg }], {
        text: `opening ${arg}…`,
        tone: "muted",
      });
    }

    case "cd":
      return ok({
        text: "no directories here — everything is an app. try `open <app>`.",
        tone: "muted",
      });

    case "lang":
      if (arg !== "th" && arg !== "en") return err("usage: lang <th|en>");
      return fx([{ type: "lang", lang: arg }], {
        text:
          arg === "th"
            ? "เปลี่ยนภาษาเนื้อหาเป็นไทยแล้ว (system text stays English)"
            : "content language set to English",
      });

    case "theme":
      if (!PHASES.includes(arg))
        return err("usage: theme <auto|dawn|day|dusk|night>");
      return fx([{ type: "theme", value: arg as Phase | "auto" }], {
        text:
          arg === "auto"
            ? "lighting follows the sun over Bangkok again"
            : `lighting locked to ${arg}`,
      });

    case "sound":
      if (arg !== "on" && arg !== "off") return err("usage: sound <on|off>");
      return fx([{ type: "sound", on: arg === "on" }], {
        text: `sound ${arg}`,
      });

    case "date":
    case "time":
      return ok({ text: `${ctx.time} · Bangkok (UTC+7) · ${ctx.phase}` });

    case "weather":
      return ok({
        text: ctx.weather ?? "weather: still fetching, try again in a moment",
        tone: ctx.weather ? "out" : "muted",
      });

    case "neofetch":
      return ok(
        { text: "guest@kittipan-os", tone: "accent" },
        { text: "-----------------" },
        { text: `OS       kittipan OS ${ctx.version}` },
        { text: "Host     Cloudflare Pages (edge)" },
        { text: "Kernel   Next.js 15 · React 19" },
        { text: `Uptime   ${formatUptime(ctx.uptimeSeconds)}` },
        { text: `Theme    industrial · ${ctx.phase}` },
        { text: "Font     IBM Plex Mono · Doto" },
        { text: "Cost     0 THB / month" },
      );

    case "unlock":
      if (ctx.owner)
        return ok({ text: "already unlocked. welcome back.", tone: "accent" });
      return fx([{ type: "unlock" }], {
        text: "redirecting to Cloudflare Access…",
        tone: "muted",
      });

    case "clear":
    case "cls":
      return fx([{ type: "clear" }]);

    case "version":
    case "ver":
      return ok({ text: `kittipan OS ${ctx.version}` });

    case "changelog":
      return ok(
        { text: "what's new → github.com/kittipan2206/kittipan-net/blob/main/CHANGELOG.md" },
        { text: "or see Settings → System", tone: "muted" },
      );

    case "play":
    case "snake":
      if (cmd === "play" && arg !== "snake") return err("usage: play snake");
      return fx([{ type: "open", app: "snake" }], { text: "loading snake.app…", tone: "muted" });

    case "festival": {
      const options = ["songkran", "loykrathong", "newyear", "off", "auto"] as const;
      const value = options.find((o) => o === arg);
      if (!value) return err("usage: festival <songkran|loykrathong|newyear|off|auto>");
      return fx([{ type: "festival", value }], {
        text: value === "auto" ? "festivals follow the Thai calendar again" : value === "off" ? "festivals off for this session" : `preview: ${value}`,
      });
    }

    case "cat": {
      const name = raw.slice(cmdRaw.length).trim();
      if (!name) return err("usage: cat <file>");
      const file = (ctx.files ?? []).find((f) => f.name.toLowerCase() === name.toLowerCase());
      if (!file) return err(`cat: ${name}: no such file`);
      if (file.kind === "folder") return err(`cat: ${name}: is a folder`);
      if (file.kind === "image") return ok({ text: `cat: ${name}: binary image — open it from the desktop`, tone: "muted" });
      return ok(...(file.content ?? "").split("\n").map((text) => ({ text })));
    }

    case "rm": {
      const name = raw.slice(cmdRaw.length).trim().replace(/^-\w+\s+/, "");
      if (!name || name === "/" || name === "*") return ok({ text: "rm: kittipan OS is read-only for guests.", tone: "error" });
      const file = (ctx.files ?? []).find((f) => f.name.toLowerCase() === name.toLowerCase());
      if (!file) return err(`rm: ${name}: no such file`);
      return fx([{ type: "rm", name: file.name }], { text: `moved ${file.name} to Trash`, tone: "muted" });
    }

    case "touch": {
      const name = raw.slice(cmdRaw.length).trim();
      if (!name) return err("usage: touch <name>");
      return fx([{ type: "touch", name }], { text: `created ${name.includes(".") ? name : `${name}.txt`} on the desktop`, tone: "muted" });
    }

    case "screensaver":
      return fx([{ type: "screensaver" }]);

    case "reboot":
      return fx([{ type: "reboot" }], { text: "rebooting…", tone: "muted" });

    case "exit":
    case "logout":
      return fx([{ type: "close" }]);

    case "echo":
      return ok({ text: raw.slice(cmdRaw.length).trim() });

    case "sudo":
      return ok({
        text: "nice try. this incident will be reported to /dev/null.",
        tone: "error",
      });


    case "hello":
    case "hi":
    case "สวัสดี":
      return ok({
        text: "สวัสดีครับ — type `help` to look around.",
        tone: "accent",
      });

    case "coffee":
      return ok({ text: "error 418: I'm a teapot.", tone: "error" });

    case "contact":
    case "email":
      return fx([{ type: "open", app: "contact" }], { text: ctx.email });

    default:
      return err(`command not found: ${cmd}. type \`help\`.`);
  }
}

// Tab completion: first word completes commands, the second completes that command's arguments.
export const COMMANDS = [
  "help", "whoami", "ls", "open", "lang", "theme", "sound", "date", "weather", "neofetch",
  "unlock", "version", "changelog", "clear", "reboot", "screensaver", "exit", "echo", "play", "festival", "cat", "rm", "touch",
];

export function complete(input: string, apps: string[]): { value: string; options: string[] } {
  const parts = input.replace(/^\s+/, "").split(/\s+/);
  const args: Record<string, string[]> = {
    open: apps,
    ls: ["apps", "projects"],
    lang: ["th", "en"],
    theme: ["auto", "dawn", "day", "dusk", "night"],
    sound: ["on", "off"],
    play: ["snake"],
    festival: ["songkran", "loykrathong", "newyear", "off", "auto"],
  };
  const [pool, prefix, head] =
    parts.length <= 1
      ? [COMMANDS, parts[0] ?? "", ""]
      : parts.length === 2
        ? [args[parts[0].toLowerCase()] ?? [], parts[1], `${parts[0]} `]
        : [[], "", ""];
  const options = pool.filter((c) => c.startsWith(prefix.toLowerCase()));
  if (options.length === 0) return { value: input, options: [] };
  if (options.length === 1) return { value: `${head}${options[0]} `, options };
  let common = options[0];
  for (const o of options) while (!o.startsWith(common)) common = common.slice(0, -1);
  return { value: `${head}${common.length > prefix.length ? common : prefix}`, options };
}

function formatUptime(s: number) {
  const m = Math.floor(s / 60);
  return m < 1 ? `${s}s` : `${m}m ${s % 60}s`;
}
