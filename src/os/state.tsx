"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { Lang } from "@/config/profile";
import { sound } from "@/lib/sound";
import { APPS, appById, isAppId, type AppId } from "./apps";
import { isMobileViewport } from "./actions";
import { PHASE_PROGRESS, phaseAt, shadowOffset, sunProgress, type Phase } from "./sun";
import { festivalOn, type Festival } from "./festival";
import { registerPWA } from "./pwa";

export interface Win {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** set when restored from the dock, so the window can grow out of its dock key */
  fromDock?: boolean;
}

export interface LaunchLink {
  code: string;
  name: string;
  sub?: string;
  url: string;
}

export type OwnerStatus =
  "unknown" | "checking" | "guest" | "owner" | "unconfigured" | "error";
export type ThemePref = Phase | "auto";
export type MotionPref = "system" | "reduced";
export type Accent = "orange" | "green" | "blue";
export type Wallpaper = "sky" | "plain";
export type Screensaver = "off" | "1m" | "5m";
export type CursorPref = "custom" | "system";

export interface Prefs {
  lang: Lang;
  sound: boolean;
  themePref: ThemePref;
  motion: MotionPref;
  accent: Accent;
  wallpaper: Wallpaper;
  live: boolean;
  screensaver: Screensaver;
  cursor: CursorPref;
}

export interface OSState extends Prefs {
  windows: Win[];
  zTop: number;
  mobileApp: AppId | null;
  phase: Phase;
  festival: Festival | null;
  /** set from Terminal `festival <name|off>` for this session; null = follow the calendar */
  festivalOverride: Festival | "off" | null;
  /** apps visitors tried to throw away this session (they always come back) */
  trashLog: { id: AppId; at: number }[];
  owner: {
    status: OwnerStatus;
    email?: string | null;
    links?: LaunchLink[];
    message?: string;
  };
  spotlight: boolean;
  rebooting: boolean;
  toast: { id: number; text: string } | null;
}

type Viewport = { w: number; h: number };

type Action =
  | { type: "open"; id: AppId; viewport?: Viewport }
  | { type: "close"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMax"; id: AppId }
  | { type: "move"; id: AppId; x: number; y: number }
  | {
      type: "frame";
      id: AppId;
      x: number;
      y: number;
      w: number;
      h: number;
      maximized?: boolean;
    }
  | { type: "fitAll"; viewport: Viewport }
  | { type: "restoreWindows"; windows: Win[]; zTop: number }
  | { type: "closeMobile" }
  | { type: "prefs"; patch: Partial<Prefs> }
  | { type: "phase"; phase: Phase }
  | { type: "festival"; festival: Festival | null }
  | { type: "trashed"; ids: AppId[] }
  | { type: "festivalOverride"; value: Festival | "off" | null }
  | { type: "owner"; owner: OSState["owner"] }
  | { type: "spotlight"; open: boolean }
  | { type: "reboot"; on: boolean }
  | { type: "toast"; text: string | null };

export const DEFAULT_PREFS: Prefs = {
  lang: "en",
  sound: false,
  themePref: "auto",
  motion: "system",
  accent: "orange",
  wallpaper: "sky",
  live: true,
  screensaver: "1m",
  cursor: "custom",
};

const initialState: OSState = {
  ...DEFAULT_PREFS,
  windows: [
    {
      ...appById("about").frame,
      id: "about",
      z: 1,
      minimized: false,
      maximized: false,
    },
  ],
  zTop: 1,
  mobileApp: null,
  phase: "night",
  festival: null,
  festivalOverride: null,
  trashLog: [],
  owner: { status: "unknown" },
  spotlight: false,
  rebooting: false,
  toast: null,
};

// Keep windows inside the area between the icon column, widget column, menu bar and dock.
function fitFrame<T extends { x: number; y: number; w: number; h: number }>(
  frame: T,
  viewport?: Viewport,
): T {
  if (!viewport) return frame;
  const right = viewport.w >= 1280 ? 340 : 24;
  const maxW = Math.max(360, viewport.w - 128 - right);
  const maxH = Math.max(320, viewport.h - 36 - 110);
  const w = Math.min(frame.w, maxW);
  const h = Math.min(frame.h, maxH);
  return {
    ...frame,
    w,
    h,
    x: Math.max(8, Math.min(frame.x, viewport.w - right - w)),
    y: Math.max(44, Math.min(frame.y, 36 + maxH - h + 12)),
  };
}

const mapWin = (
  state: OSState,
  id: AppId,
  patch: (w: Win) => Partial<Win>,
) => ({
  ...state,
  windows: state.windows.map((w) => (w.id === id ? { ...w, ...patch(w) } : w)),
});

function reducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case "open": {
      const z = state.zTop + 1;
      const existing = state.windows.find((w) => w.id === action.id);
      const windows = existing
        ? state.windows.map((w) =>
            w.id === action.id
              ? { ...w, fromDock: w.minimized, minimized: false, z }
              : w,
          )
        : [
            ...state.windows,
            {
              ...fitFrame(appById(action.id).frame, action.viewport),
              id: action.id,
              z,
              minimized: false,
              maximized: false,
            },
          ];
      return { ...state, windows, zTop: z, mobileApp: action.id };
    }
    case "close":
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
        mobileApp: state.mobileApp === action.id ? null : state.mobileApp,
      };
    case "focus": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.z === state.zTop) return state;
      const z = state.zTop + 1;
      return { ...mapWin(state, action.id, () => ({ z })), zTop: z };
    }
    case "minimize":
      return mapWin(state, action.id, () => ({ minimized: true }));
    case "toggleMax":
      return mapWin(state, action.id, (w) => ({ maximized: !w.maximized }));
    case "move":
      return mapWin(state, action.id, () => ({ x: action.x, y: action.y }));
    case "frame": {
      const { id, x, y, w, h, maximized } = action;
      return mapWin(state, id, (win) => ({
        x,
        y,
        w,
        h,
        maximized: maximized ?? win.maximized,
      }));
    }
    case "fitAll":
      return {
        ...state,
        windows: state.windows.map((w) => fitFrame(w, action.viewport)),
      };
    case "restoreWindows":
      return { ...state, windows: action.windows, zTop: action.zTop };
    case "closeMobile":
      return { ...state, mobileApp: null };
    case "prefs":
      return { ...state, ...action.patch };
    case "phase":
      return state.phase === action.phase
        ? state
        : { ...state, phase: action.phase };
    case "festival":
      return state.festival === action.festival ? state : { ...state, festival: action.festival };
    case "trashed":
      return { ...state, trashLog: [...state.trashLog, ...action.ids.map((id) => ({ id, at: Date.now() }))] };
    case "festivalOverride":
      return { ...state, festivalOverride: action.value };
    case "owner":
      return { ...state, owner: action.owner };
    case "spotlight":
      return { ...state, spotlight: action.open };
    case "reboot":
      return { ...state, rebooting: action.on, spotlight: false };
    case "toast":
      return {
        ...state,
        toast: action.text ? { id: Date.now(), text: action.text } : null,
      };
  }
}

const STORE = {
  prefs: "kos_prefs",
  lang: "kos_lang",
  theme: "kos_theme",
  motion: "kos_motion",
  accent: "kos_accent",
  wallpaper: "kos_wallpaper",
  windows: "kos_windows",
  ownerHint: "kos_owner_hint",
};

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
};

function readSavedWindows(): { windows: Win[]; zTop: number } | null {
  try {
    const saved = JSON.parse(read(STORE.windows) ?? "null") as {
      windows: Win[];
      zTop: number;
    } | null;
    if (!saved || !Array.isArray(saved.windows)) return null;
    const windows = saved.windows
      .filter(
        (w) =>
          isAppId(w.id) && [w.x, w.y, w.w, w.h, w.z].every(Number.isFinite),
      )
      .map((w) => ({ ...w, fromDock: false }));
    return {
      windows,
      zTop: Math.max(saved.zTop || 1, ...windows.map((w) => w.z)),
    };
  } catch {
    return null;
  }
}

export function useOSStore() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const restored = useRef(false);

  const notify = useCallback((text: string) => {
    dispatch({ type: "toast", text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => dispatch({ type: "toast", text: null }),
      2600,
    );
  }, []);

  const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });

  const open = useCallback((id: AppId) => {
    dispatch({ type: "open", id, viewport: viewport() });
    history.replaceState(null, "", `#${id}`);
  }, []);

  const close = useCallback((id: AppId) => {
    dispatch({ type: "close", id });
    if (location.hash === `#${id}`)
      history.replaceState(null, "", location.pathname);
  }, []);

  const closeTop = useCallback(() => {
    if (isMobileViewport()) {
      dispatch({ type: "closeMobile" });
      history.replaceState(null, "", location.pathname);
      return;
    }
    const top = [...state.windows]
      .filter((w) => !w.minimized)
      .sort((a, b) => b.z - a.z)[0];
    if (top) close(top.id);
  }, [state.windows, close]);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    if (patch.sound !== undefined) sound.set(patch.sound);
    dispatch({ type: "prefs", patch });
    // Mirrors for the pre-paint script in layout.tsx (it runs before React and can't parse kos_prefs cheaply).
    if (patch.themePref) write(STORE.theme, patch.themePref);
    if (patch.motion) write(STORE.motion, patch.motion);
    if (patch.accent) write(STORE.accent, patch.accent);
    if (patch.wallpaper) write(STORE.wallpaper, patch.wallpaper);
    if (patch.lang) write(STORE.lang, patch.lang);
  }, []);

  const setLang = useCallback((lang: Lang) => setPrefs({ lang }), [setPrefs]);
  const setTheme = useCallback(
    (themePref: ThemePref) => setPrefs({ themePref }),
    [setPrefs],
  );
  const setMotion = useCallback(
    (motion: MotionPref) => setPrefs({ motion }),
    [setPrefs],
  );
  const setSound = useCallback(
    (on: boolean) => setPrefs({ sound: on }),
    [setPrefs],
  );

  const probeOwner = useCallback(async () => {
    dispatch({ type: "owner", owner: { status: "checking" } });
    try {
      const res = await fetch("/api/private/launchpad", {
        credentials: "same-origin",
        redirect: "manual",
        cache: "no-store",
      });
      if (res.status === 200) {
        const data = (await res.json()) as {
          email: string | null;
          links: LaunchLink[];
        };
        dispatch({
          type: "owner",
          owner: { status: "owner", email: data.email, links: data.links },
        });
        write(STORE.ownerHint, "1");
        return;
      }
      // Access redirects unauthenticated requests (opaque, status 0) and the function answers 401: both mean "not signed in".
      if (
        res.type === "opaqueredirect" ||
        res.status === 401 ||
        res.status === 404
      ) {
        write(STORE.ownerHint, null);
        dispatch({ type: "owner", owner: { status: "guest" } });
        return;
      }
      if (res.status === 503) {
        dispatch({ type: "owner", owner: { status: "unconfigured" } });
        return;
      }
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        detail?: string;
      } | null;
      const message = [body?.error ?? `HTTP ${res.status}`, body?.detail]
        .filter(Boolean)
        .join(" — ");
      dispatch({ type: "owner", owner: { status: "error", message } });
    } catch (err) {
      dispatch({
        type: "owner",
        owner: {
          status: "error",
          message: err instanceof Error ? err.message : "network error",
        },
      });
    }
  }, []);

  const lock = useCallback(() => {
    write(STORE.ownerHint, null);
    location.href = "/cdn-cgi/access/logout";
  }, []);

  // Restore preferences, windows, deep link and owner session once on mount.
  useEffect(() => {
    let saved: Partial<Prefs> = {};
    try {
      saved = JSON.parse(read(STORE.prefs) ?? "{}");
    } catch {}
    const lang =
      read(STORE.lang) ??
      (navigator.language.toLowerCase().startsWith("th") ? "th" : "en");
    dispatch({
      type: "prefs",
      patch: {
        ...DEFAULT_PREFS,
        ...saved,
        lang: lang === "th" ? "th" : "en",
        sound: sound.isEnabled(),
        themePref: (read(STORE.theme) as ThemePref | null) ?? "auto",
        motion: (read(STORE.motion) as MotionPref | null) ?? "system",
        accent: (read(STORE.accent) as Accent | null) ?? "orange",
        wallpaper: (read(STORE.wallpaper) as Wallpaper | null) ?? "sky",
      },
    });

    const windows = readSavedWindows();
    if (windows) dispatch({ type: "restoreWindows", ...windows });
    dispatch({ type: "fitAll", viewport: viewport() });
    restored.current = true;

    const hash = location.hash.slice(1);
    if (isAppId(hash))
      dispatch({ type: "open", id: hash, viewport: viewport() });
    if (read(STORE.ownerHint)) probeOwner();
    registerPWA();
  }, [probeOwner]);

  // Remember window layout (desktop) across visits.
  useEffect(() => {
    if (!restored.current) return;
    const timer = setTimeout(() => {
      const windows = state.windows.map(({ fromDock: _fromDock, ...w }) => w);
      write(STORE.windows, JSON.stringify({ windows, zTop: state.zTop }));
    }, 300);
    return () => clearTimeout(timer);
  }, [state.windows, state.zTop]);

  useEffect(() => {
    write(STORE.prefs, JSON.stringify({ live: state.live, screensaver: state.screensaver, cursor: state.cursor }));
  }, [state.live, state.screensaver, state.cursor]);

  useEffect(() => {
    const fit = () => dispatch({ type: "fitAll", viewport: viewport() });
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Lighting, shadow angle and festivals follow the real sun and calendar unless overridden.
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const phase = state.themePref === "auto" ? phaseAt(now) : state.themePref;
      dispatch({ type: "phase", phase });
      const { x, y } = shadowOffset(state.themePref === "auto" ? sunProgress(now) : PHASE_PROGRESS[phase]);
      document.documentElement.style.setProperty("--sx", `${x}px`);
      document.documentElement.style.setProperty("--sy", `${y}px`);
      const o = state.festivalOverride;
      dispatch({ type: "festival", festival: o === "off" ? null : (o ?? festivalOn(now)) });
    };
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [state.themePref, state.festivalOverride]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.phase = state.phase;
    root.dataset.accent = state.accent;
    root.dataset.wallpaper = state.wallpaper;
    root.lang = state.lang;
    if (state.motion === "reduced") root.dataset.motion = "reduced";
    else delete root.dataset.motion;
  }, [state.phase, state.accent, state.wallpaper, state.lang, state.motion]);

  return useMemo(
    () => ({
      state,
      dispatch,
      notify,
      open,
      close,
      closeTop,
      setPrefs,
      setLang,
      setTheme,
      setMotion,
      setSound,
      probeOwner,
      lock,
    }),
    [
      state,
      notify,
      open,
      close,
      closeTop,
      setPrefs,
      setLang,
      setTheme,
      setMotion,
      setSound,
      probeOwner,
      lock,
    ],
  );
}

export type OSApi = ReturnType<typeof useOSStore>;

const OSContext = createContext<OSApi | null>(null);

export function OSProvider({
  value,
  children,
}: {
  value: OSApi;
  children: ReactNode;
}) {
  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS outside OSProvider");
  return ctx;
}

export const unlockUrl = "/unlock/";

export const APP_IDS = APPS.map((a) => a.id);
