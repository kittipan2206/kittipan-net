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
import { phaseAt, type Phase } from "./sun";

export interface Win {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface LaunchLink {
  code: string;
  name: string;
  sub?: string;
  url: string;
}

export type OwnerStatus =
  "unknown" | "checking" | "guest" | "owner" | "unconfigured";
export type ThemePref = Phase | "auto";
export type MotionPref = "system" | "reduced";

export interface OSState {
  windows: Win[];
  zTop: number;
  mobileApp: AppId | null;
  lang: Lang;
  sound: boolean;
  themePref: ThemePref;
  motion: MotionPref;
  phase: Phase;
  owner: { status: OwnerStatus; email?: string | null; links?: LaunchLink[] };
  spotlight: boolean;
  rebooting: boolean;
  toast: { id: number; text: string } | null;
}

type Action =
  | { type: "open"; id: AppId; viewport?: { w: number; h: number } }
  | { type: "close"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMax"; id: AppId }
  | { type: "move"; id: AppId; x: number; y: number }
  | { type: "closeMobile" }
  | { type: "fitAll"; viewport: { w: number; h: number } }
  | { type: "frame"; id: AppId; x: number; y: number; w: number; h: number }
  | {
      type: "prefs";
      patch: Partial<Pick<OSState, "lang" | "sound" | "themePref" | "motion">>;
    }
  | { type: "phase"; phase: Phase }
  | { type: "owner"; owner: OSState["owner"] }
  | { type: "spotlight"; open: boolean }
  | { type: "reboot"; on: boolean }
  | { type: "toast"; text: string | null };

const initialState: OSState = {
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
  lang: "en",
  sound: false,
  themePref: "auto",
  motion: "system",
  phase: "night",
  owner: { status: "unknown" },
  spotlight: false,
  rebooting: false,
  toast: null,
};

// Keep windows inside the area between the icon column, widget column, menu bar and dock.
function fitFrame(
  frame: Win | (typeof APPS)[number]["frame"],
  viewport?: { w: number; h: number },
) {
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
    x: Math.min(frame.x, viewport.w - right - w),
    y: Math.min(frame.y, 36 + maxH - h + 12),
  };
}

function reducer(state: OSState, action: Action): OSState {
  switch (action.type) {
    case "open": {
      const z = state.zTop + 1;
      const existing = state.windows.find((w) => w.id === action.id);
      const windows = existing
        ? state.windows.map((w) =>
            w.id === action.id ? { ...w, minimized: false, z } : w,
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
      const top = state.windows.find((w) => w.id === action.id);
      if (!top || top.z === state.zTop) return state;
      const z = state.zTop + 1;
      return {
        ...state,
        zTop: z,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, z } : w,
        ),
      };
    }
    case "minimize":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w,
        ),
      };
    case "toggleMax":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, maximized: !w.maximized } : w,
        ),
      };
    case "move":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    case "frame": {
      const { id, x, y, w, h } = action;
      return { ...state, windows: state.windows.map((win) => (win.id === id ? { ...win, x, y, w, h } : win)) };
    }
    case "fitAll":
      return { ...state, windows: state.windows.map((w) => ({ ...w, ...fitFrame(w, action.viewport) })) };
    case "closeMobile":
      return { ...state, mobileApp: null };
    case "prefs":
      return { ...state, ...action.patch };
    case "phase":
      return state.phase === action.phase
        ? state
        : { ...state, phase: action.phase };
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
  lang: "kos_lang",
  theme: "kos_theme",
  motion: "kos_motion",
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

export function useOSStore() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((text: string) => {
    dispatch({ type: "toast", text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => dispatch({ type: "toast", text: null }),
      2600,
    );
  }, []);

  const open = useCallback((id: AppId) => {
    dispatch({
      type: "open",
      id,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    });
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

  const setLang = useCallback((lang: Lang) => {
    dispatch({ type: "prefs", patch: { lang } });
    write(STORE.lang, lang);
  }, []);

  const setTheme = useCallback((themePref: ThemePref) => {
    dispatch({ type: "prefs", patch: { themePref } });
    write(STORE.theme, themePref);
  }, []);

  const setMotion = useCallback((motion: MotionPref) => {
    dispatch({ type: "prefs", patch: { motion } });
    write(STORE.motion, motion);
  }, []);

  const setSound = useCallback((on: boolean) => {
    sound.set(on);
    dispatch({ type: "prefs", patch: { sound: on } });
  }, []);

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
      write(STORE.ownerHint, null);
      dispatch({
        type: "owner",
        owner: { status: res.status === 503 ? "unconfigured" : "guest" },
      });
    } catch {
      dispatch({ type: "owner", owner: { status: "guest" } });
    }
  }, []);

  const lock = useCallback(() => {
    write(STORE.ownerHint, null);
    location.href = "/cdn-cgi/access/logout";
  }, []);

  // Restore preferences, deep link and owner session once on mount.
  useEffect(() => {
    const lang =
      read(STORE.lang) ??
      (navigator.language.toLowerCase().startsWith("th") ? "th" : "en");
    const theme = read(STORE.theme) as ThemePref | null;
    const motion = read(STORE.motion) as MotionPref | null;
    dispatch({
      type: "prefs",
      patch: {
        lang: lang === "th" ? "th" : "en",
        sound: sound.isEnabled(),
        themePref: theme ?? "auto",
        motion: motion ?? "system",
      },
    });
    const hash = location.hash.slice(1);
    if (isAppId(hash))
      dispatch({
        type: "open",
        id: hash,
        viewport: { w: window.innerWidth, h: window.innerHeight },
      });
    if (read(STORE.ownerHint)) probeOwner();
  }, [probeOwner]);

  useEffect(() => {
    const fit = () => dispatch({ type: "fitAll", viewport: { w: window.innerWidth, h: window.innerHeight } });
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Lighting follows the real sun unless overridden.
  useEffect(() => {
    const update = () =>
      dispatch({
        type: "phase",
        phase:
          state.themePref === "auto" ? phaseAt(new Date()) : state.themePref,
      });
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [state.themePref]);

  useEffect(() => {
    document.documentElement.dataset.phase = state.phase;
  }, [state.phase]);

  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  useEffect(() => {
    if (state.motion === "reduced")
      document.documentElement.dataset.motion = "reduced";
    else delete document.documentElement.dataset.motion;
  }, [state.motion]);

  return useMemo(
    () => ({
      state,
      dispatch,
      notify,
      open,
      close,
      closeTop,
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
