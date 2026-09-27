"use client";

import { useEffect } from "react";
import { ArrowUpRight, Lock, Mail } from "lucide-react";
import { useOS, unlockUrl } from "../state";
import { Caps } from "../ui";

export function Launchpad() {
  const { state, probeOwner } = useOS();
  const { status, links, email, message } = state.owner;

  useEffect(() => {
    if (status === "unknown") probeOwner();
  }, [status, probeOwner]);

  if (status === "owner") {
    return (
      <div className="flex min-h-full flex-col">
        <ul className="m-0 grid list-none grid-cols-2 gap-3.5 p-5 sm:p-6 md:grid-cols-4">
          {(links ?? []).map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="key flex h-[124px] flex-col justify-between p-4 text-ink no-underline"
              >
                <span className="flex items-start justify-between">
                  <span className="lcd-digits text-[26px]">{l.code}</span>
                  <ArrowUpRight size={16} className="text-sub" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold">
                    {l.name}
                  </span>
                  {l.sub && (
                    <span className="font-mono text-[11px] text-sub">
                      {l.sub}
                    </span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-line px-6 py-3 font-mono text-[11px] text-sub">
          <span>source /api/private/launchpad</span>
          <span>Access JWT verified{email ? ` · ${email}` : ""}</span>
          <span className="sm:ml-auto">0 bytes in the public bundle</span>
        </div>
      </div>
    );
  }

  const checking = status === "checking" || status === "unknown";
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 p-8 text-center">
      <span className="key flex size-14 items-center justify-center">
        <Lock size={22} strokeWidth={1.8} className="text-accent" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-base font-semibold text-ink">
          {checking ? "Checking session…" : status === "error" ? "Signed in, but verification failed" : "Owner-only app"}
        </span>
        <p className="m-0 max-w-[380px] font-sans text-sm leading-relaxed text-sub">
          {status === "unconfigured"
            ? "Owner mode isn't configured on this deployment yet."
            : "Private apps load only after Cloudflare Access verifies the owner. Nothing private ships inside this page."}
        </p>
      </div>
      {status === "error" && message && (
        <code className="max-w-[440px] break-words rounded-sm bg-lcd px-3 py-2 font-mono text-xs text-lcd-ink">{message}</code>
      )}
      {status === "error" && (
        <button type="button" onClick={probeOwner} className="key flex h-10 items-center px-4 font-mono text-xs">
          Try again
        </button>
      )}
      {!checking && status !== "unconfigured" && status !== "error" && (
        <a
          href={unlockUrl}
          className="key key-accent flex h-12 items-center gap-2.5 px-5 font-mono text-sm font-semibold no-underline"
        >
          <Mail size={16} strokeWidth={2} aria-hidden />
          Unlock with email code
        </a>
      )}
      <Caps>protected by Cloudflare Access</Caps>
    </div>
  );
}
