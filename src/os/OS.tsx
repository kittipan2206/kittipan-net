"use client";

import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ChevronLeft,
  Lock,
  LockOpen,
  Search,
  Volume2,
  VolumeX,
} from "lucide-react";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { APPS, appById, type AppId, type AppMeta } from "./apps";
import { OSProvider, unlockUrl, useOS, useOSStore } from "./state";
import { useNow } from "./hooks";
import { bangkokDate, bangkokTime } from "./sun";
import { ClockWidget, NowWidget, WeatherWidget } from "./widgets";
import { Window } from "./Window";
import { Spotlight } from "./Spotlight";
import { Key, Logo } from "./ui";
import { About } from "./apps/About";
import { Contact } from "./apps/Contact";
import { Launchpad } from "./apps/Launchpad";
import { Projects } from "./apps/Projects";
import { Settings } from "./apps/Settings";
import { Terminal } from "./apps/Terminal";

const VIEWS: Record<AppId, ComponentType> = {
  about: About,
  projects: Projects,
  terminal: Terminal,
  contact: Contact,
  settings: Settings,
  launchpad: Launchpad,
};

function AppIcon({ app, size = 22 }: { app: AppMeta; size?: number }) {
  const { state } = useOS();
  if (app.id === "launchpad") {
    const Icon = state.owner.status === "owner" ? LockOpen : Lock;
    return <Icon size={size} strokeWidth={1.6} aria-hidden />;
  }
  const Icon = app.icon;
  return <Icon size={size} strokeWidth={1.6} aria-hidden />;
}

function MenuBar() {
  const os = useOS();
  const { state } = os;
  const now = useNow(1000);
  const top = [...state.windows]
    .filter((w) => !w.minimized)
    .sort((a, b) => b.z - a.z)[0];
  const owner = state.owner.status === "owner";

  return (
    <header className="absolute inset-x-0 top-0 z-[100] flex h-9 items-center justify-between border-b border-line bg-bar px-4 font-mono text-xs text-ink backdrop-blur-md">
      <div className="flex items-center gap-[18px]">
        <div className="flex items-center gap-2 font-semibold">
          <Logo size={16} />
          <span>kittipan OS</span>
        </div>
        {top && <span className="text-sub">{appById(top.id).title}</span>}
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => os.dispatch({ type: "spotlight", open: true })}
          className="key flex h-6 items-center gap-2 rounded-sm px-2.5 text-[11px] shadow-none active:translate-y-0"
        >
          <Search size={13} strokeWidth={2} aria-hidden />
          <span>Search</span>
          <kbd className="text-sub">⌘K</kbd>
        </button>
        <div role="group" aria-label="Content language" className="segmented">
          {(["th", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={state.lang === l}
              onClick={() => os.setLang(l)}
              className="!h-6 !px-2 uppercase"
            >
              {l}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={state.sound ? "Turn sound off" : "Turn sound on"}
          aria-pressed={state.sound}
          onClick={() => os.setSound(!state.sound)}
          className={clsx(
            "flex h-6 w-7 items-center justify-center",
            state.sound ? "text-accent" : "text-sub hover:text-ink",
          )}
        >
          {state.sound ? (
            <Volume2 size={16} strokeWidth={1.8} aria-hidden />
          ) : (
            <VolumeX size={16} strokeWidth={1.8} aria-hidden />
          )}
        </button>
        {owner ? (
          <button
            type="button"
            onClick={os.lock}
            title="Lock owner mode"
            className="flex h-6 items-center gap-1.5 rounded-sm border border-[#3f6b4e] px-2 text-[11px] text-[#9fd6af]"
          >
            <span className="size-1.5 rounded-full bg-led" aria-hidden />
            OWNER
          </button>
        ) : (
          <a
            href={unlockUrl}
            aria-label="Unlock owner mode"
            className="flex h-6 w-7 items-center justify-center text-ink"
          >
            <Lock size={15} strokeWidth={1.8} aria-hidden />
          </a>
        )}
        <time
          className="min-w-[128px] text-right font-medium tracking-[0.04em]"
          suppressHydrationWarning
        >
          {now ? `${bangkokDate(now)}  ${bangkokTime(now)}` : ""}
        </time>
      </div>
    </header>
  );
}

function Dock() {
  const { state, open, dispatch } = useOS();
  return (
    <nav
      aria-label="Dock"
      className="absolute bottom-[18px] left-1/2 z-[90] flex -translate-x-1/2 items-end gap-2.5 rounded-xl border border-frame bg-bar px-3.5 pb-2 pt-2.5 shadow-[0_3px_0_var(--frame)] backdrop-blur-md"
    >
      {APPS.map((app) => {
        const win = state.windows.find((w) => w.id === app.id);
        return (
          <div
            key={app.id}
            className="group relative flex flex-col items-center gap-[5px]"
          >
            <Key
              aria-label={app.title}
              onClick={() => {
                const top = [...state.windows]
                  .filter((w) => !w.minimized)
                  .sort((a, b) => b.z - a.z)[0];
                if (win && !win.minimized && top?.id === app.id)
                  dispatch({ type: "minimize", id: app.id });
                else open(app.id);
              }}
              className="flex size-12 items-center justify-center"
            >
              <AppIcon app={app} size={21} />
            </Key>
            <span
              className={clsx(
                "size-[5px] rounded-full",
                win
                  ? "bg-accent shadow-[0_0_6px_var(--accent)]"
                  : "bg-transparent",
              )}
              aria-hidden
            />
            <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-sm bg-[#161616] px-2 py-1 font-mono text-[11px] text-[#edebe5] opacity-0 transition-opacity group-hover:opacity-100">
              {app.title}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

function DesktopShell() {
  const { state, open } = useOS();
  const visible = state.windows.filter((w) => !w.minimized);
  const topZ = Math.max(0, ...visible.map((w) => w.z));

  return (
    <div className="wallpaper fixed inset-0 hidden overflow-hidden md:block">
      <div className="dots absolute inset-0" aria-hidden />
      <MenuBar />
      <nav
        aria-label="Desktop"
        className="absolute left-5 top-16 z-[5] flex w-[88px] flex-col gap-[18px]"
      >
        {APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => {
              sound.playMechanicalClick();
              open(app.id);
            }}
            className="group flex flex-col items-center gap-[7px] text-label"
          >
            <span className="key flex size-[52px] items-center justify-center group-active:translate-y-[2px] group-active:shadow-[0_1px_0_var(--frame)]">
              <AppIcon app={app} />
            </span>
            <span className="font-mono text-[11px] font-medium [text-shadow:0_1px_0_rgba(0,0,0,0.15)]">
              {app.title}
            </span>
          </button>
        ))}
      </nav>
      <main>
        <AnimatePresence>
          {visible.map((w) => {
            const View = VIEWS[w.id];
            return (
              <Window key={w.id} win={w} focused={w.z === topZ}>
                <View />
              </Window>
            );
          })}
        </AnimatePresence>
      </main>
      <aside
        aria-label="Widgets"
        className="absolute right-6 top-[60px] z-[5] hidden w-[300px] flex-col gap-4 xl:flex"
      >
        <ClockWidget />
        <WeatherWidget />
        <NowWidget />
      </aside>
      <Dock />
    </div>
  );
}

function MobileShell() {
  const { state, open, closeTop } = useOS();
  const app = state.mobileApp ? appById(state.mobileApp) : null;
  const View = app ? VIEWS[app.id] : null;
  const dockApps = APPS.filter((a) =>
    ["about", "terminal", "contact"].includes(a.id),
  );

  return (
    <div className="wallpaper fixed inset-0 overflow-hidden md:hidden">
      <div className="dots absolute inset-0" aria-hidden />
      <div className="scroll-quiet relative flex h-full flex-col gap-3.5 overflow-y-auto px-4 pb-[120px] pt-[max(env(safe-area-inset-top),0px)]">
        <header className="flex h-[52px] shrink-0 items-center justify-between font-mono text-xs text-label">
          <div className="flex items-center gap-2 font-semibold">
            <Logo size={18} />
            kittipan OS
          </div>
          <MobileTopControls />
        </header>
        <ClockWidget compact />
        <div className="grid grid-cols-2 gap-3">
          <WeatherWidget compact />
          <NowWidget compact />
        </div>
        <nav
          aria-label="Apps"
          className="mt-2 grid grid-cols-4 gap-x-2 gap-y-[18px]"
        >
          {APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                sound.playMechanicalClick();
                open(a.id);
              }}
              className="group flex flex-col items-center gap-[7px] text-label"
            >
              <span
                className={clsx(
                  "key flex size-[62px] items-center justify-center rounded-[14px] group-active:translate-y-[2px]",
                  a.id === "contact" && "key-accent",
                )}
              >
                <AppIcon app={a} size={26} />
              </span>
              <span className="font-mono text-[11px] [text-shadow:0_1px_0_rgba(0,0,0,0.15)]">
                {a.title}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <nav
        aria-label="Dock"
        className="absolute inset-x-4 bottom-[max(env(safe-area-inset-bottom),20px)] flex justify-around rounded-[22px] border border-frame bg-bar p-3 shadow-[0_3px_0_var(--frame)] backdrop-blur-md"
      >
        {dockApps.map((a) => (
          <Key
            key={a.id}
            aria-label={a.title}
            onClick={() => open(a.id)}
            className="flex size-14 items-center justify-center rounded-[14px]"
          >
            <AppIcon app={a} size={24} />
          </Key>
        ))}
        <SpotlightKey />
      </nav>

      <AnimatePresence>
        {app && View && (
          <motion.div
            key={app.id}
            role="dialog"
            aria-modal="true"
            aria-label={app.file}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute inset-0 z-[120] flex flex-col bg-panel"
          >
            <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-line px-3 pt-[env(safe-area-inset-top)] font-mono text-xs text-ink">
              <button
                type="button"
                onClick={closeTop}
                className="flex h-11 items-center gap-1 pr-3 text-[13px]"
              >
                <ChevronLeft size={18} strokeWidth={2} aria-hidden />
                Home
              </button>
              <span className="font-semibold">{app.file}</span>
              <span className="w-[64px]" />
            </header>
            <div
              className={clsx(
                "scroll-quiet min-h-0 grow",
                app.id === "terminal" ? "overflow-hidden" : "overflow-y-auto",
              )}
            >
              <View />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileTopControls() {
  const os = useOS();
  const owner = os.state.owner.status === "owner";
  return (
    <div className="flex items-center gap-1">
      <div
        role="group"
        aria-label="Content language"
        className="segmented border-[color:var(--label)]/30"
      >
        {(["th", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={os.state.lang === l}
            onClick={() => os.setLang(l)}
            className="uppercase"
          >
            {l}
          </button>
        ))}
      </div>
      {owner ? (
        <button
          type="button"
          onClick={os.lock}
          aria-label="Lock owner mode"
          className="flex size-11 items-center justify-center text-led"
        >
          <LockOpen size={17} strokeWidth={1.8} aria-hidden />
        </button>
      ) : (
        <a
          href={unlockUrl}
          aria-label="Unlock owner mode"
          className="flex size-11 items-center justify-center"
        >
          <Lock size={17} strokeWidth={1.8} aria-hidden />
        </a>
      )}
    </div>
  );
}

function SpotlightKey() {
  const { dispatch } = useOS();
  return (
    <Key
      aria-label="Search"
      onClick={() => dispatch({ type: "spotlight", open: true })}
      className="flex size-14 items-center justify-center rounded-[14px]"
    >
      <Search size={24} strokeWidth={1.6} aria-hidden />
    </Key>
  );
}

function Toast() {
  const { state } = useOS();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[108px] z-[160] flex justify-center px-4"
    >
      <AnimatePresence>
        {state.toast && (
          <motion.div
            key={state.toast.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="lcd flex items-center gap-2.5 rounded-md px-4 py-2.5 font-mono text-xs"
          >
            <span
              className="size-1.5 rounded-full bg-led shadow-[0_0_6px_var(--led)]"
              aria-hidden
            />
            {state.toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BootReveal() {
  return (
    <div className="boot-reveal" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} style={{ ["--i" as string]: i }} />
      ))}
    </div>
  );
}

const POST_LINES = [
  "KS-BIOS v2.0 · (c) kittipan.net",
  "CPU: human, 1 core, caffeinated",
  "Memory test ........................ OK",
  "Detecting location ........... Bangkok 13.75N 100.50E",
  "Mounting /apps ..................... 6 found",
  "Checking owner session ............. locked",
  "Syncing lighting with the sun ...... OK",
  "Starting kittipan OS",
];

function Reboot() {
  const { dispatch } = useOS();
  const [shown, setShown] = useState(0);
  const done = shown > POST_LINES.length + 6;

  useEffect(() => {
    const finish = () => dispatch({ type: "reboot", on: false });
    if (done) {
      finish();
      return;
    }
    const timer = setTimeout(
      () => setShown((n) => n + 1),
      shown < POST_LINES.length ? 260 : 180,
    );
    const skip = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
    };
  }, [shown, done, dispatch]);

  return (
    <button
      type="button"
      aria-label="Skip boot sequence"
      onClick={() => dispatch({ type: "reboot", on: false })}
      className="fixed inset-0 z-[300] flex cursor-default flex-col bg-[#0b0c0a] p-8 text-left font-mono text-[13px] leading-7 text-[#d9d5cb] sm:p-12 sm:text-sm"
    >
      {POST_LINES.slice(0, shown).map((line) => (
        <span key={line}>{line}</span>
      ))}
      {shown > POST_LINES.length && (
        <span className="mt-10 flex items-center gap-4 self-center">
          <Logo size={56} />
          <span className="lcd-digits text-[40px] sm:text-[56px]">
            kittipan OS
          </span>
        </span>
      )}
      <span className="mt-auto self-center text-[11px] text-[#6b6962]">
        press esc or tap to skip
      </span>
    </button>
  );
}

export function OS() {
  const os = useOSStore();
  const { state, dispatch, closeTop } = os;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch({ type: "spotlight", open: !state.spotlight });
        return;
      }
      if (e.key !== "Escape" || state.rebooting) return;
      if (state.spotlight) {
        dispatch({ type: "spotlight", open: false });
        return;
      }
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag !== "input" && tag !== "textarea") closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.spotlight, state.rebooting, dispatch, closeTop]);

  return (
    <OSProvider value={os}>
      <MotionConfig
        reducedMotion={state.motion === "reduced" ? "always" : "user"}
      >
        <DesktopShell />
        <MobileShell />
        <AnimatePresence>{state.spotlight && <Spotlight />}</AnimatePresence>
        <Toast />
        {state.rebooting && <Reboot />}
        <BootReveal />
      </MotionConfig>
    </OSProvider>
  );
}
