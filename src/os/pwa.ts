// Install prompt plumbing. Chrome/Edge/Android fire beforeinstallprompt; iOS needs Share → Add to Home Screen.
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallEvent | null = null;

export function registerPWA() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
  });
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  if ("serviceWorker" in navigator && !local) navigator.serviceWorker.register("/sw.js").catch(() => {});
}

export const isInstalled = () => typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

/** Returns what happened so the caller can explain it. */
export async function installApp(): Promise<"installed" | "dismissed" | "ios" | "unavailable" | "already"> {
  if (isInstalled()) return "already";
  if (deferred) {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    return outcome === "accepted" ? "installed" : "dismissed";
  }
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "unavailable";
}

export const INSTALL_MESSAGE: Record<Awaited<ReturnType<typeof installApp>>, string> = {
  installed: "Installed — find kittipan OS on your home screen",
  dismissed: "Maybe later",
  ios: "On iPhone: Share → Add to Home Screen",
  unavailable: "Use your browser menu → Install app / Add to Home Screen",
  already: "Already running as an app",
};
