"use client";

import { Copy, Download, QrCode } from "lucide-react";
import { pick, profile } from "@/config/profile";
import { sound } from "@/lib/sound";
import { useOS } from "../state";
import { copyText, downloadVCard } from "../actions";
import { Caps, Key } from "../ui";

export function About() {
  const { state, notify, open } = useOS();
  const { lang } = state;

  return (
    <div className="flex min-h-full flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7">
      <header className="flex items-center gap-5 sm:gap-6">
        <div className="lcd flex size-[88px] shrink-0 items-center justify-center rounded-md sm:size-[112px]">
          <span className="lcd-digits text-[42px] sm:text-[54px]">
            {profile.monogram}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Caps>{profile.role.en}</Caps>
          <h1 className="m-0 font-sans text-[30px] font-bold leading-[1.1] tracking-[-0.01em] text-ink sm:text-[42px]">
            {profile.name}
          </h1>
          <div className="flex items-center gap-2 font-mono text-xs text-sub">
            <span
              className="size-[7px] rounded-full bg-accent shadow-[0_0_6px_var(--accent)]"
              aria-hidden
            />
            <span>
              {pick(profile.location, lang)} · {profile.timezone}
            </span>
          </div>
        </div>
      </header>

      <p className="m-0 max-w-[680px] font-sans text-base leading-relaxed text-sub">
        {pick(profile.statement, lang)}
      </p>

      <section
        className="flex flex-col gap-2.5"
        aria-labelledby="domains-label"
      >
        <Caps>
          <span id="domains-label">Core domains</span>
        </Caps>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {profile.domains.map((d) => (
            <article
              key={d.badge}
              className="flex flex-col gap-2 rounded-md border border-line bg-card p-4"
            >
              <span className="self-start rounded-sm bg-chip px-2 py-[3px] font-mono text-[11px] text-ink">
                {d.badge}
              </span>
              <h2 className="m-0 font-sans text-base font-semibold text-ink">
                {pick(d.title, lang)}
              </h2>
              <p className="m-0 font-sans text-[13px] leading-normal text-sub">
                {pick(d.description, lang)}
              </p>
              <span className="font-mono text-[11px] text-sub">
                {d.highlights}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5" aria-labelledby="stack-label">
        <Caps>
          <span id="stack-label">Stack</span>
        </Caps>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-xs text-ink">
          {profile.stack.map((s) => (
            <li
              key={s}
              className="rounded-sm border border-line px-2.5 py-[5px]"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
        <Key
          accent
          className="flex h-11 items-center gap-2.5 px-[18px] font-mono text-[13px] font-semibold"
          onClick={() => {
            downloadVCard();
            sound.playSuccessChime();
            notify("Contact saved · kittipan-sankoh.vcf");
          }}
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          Save contact
        </Key>
        <Key
          className="flex h-11 items-center gap-2.5 px-4 font-mono text-[13px]"
          onClick={async () =>
            notify(
              (await copyText(profile.email))
                ? `Copied ${profile.email}`
                : "Clipboard unavailable",
            )
          }
        >
          <Copy size={16} strokeWidth={1.8} aria-hidden />
          {profile.email}
        </Key>
        <Key
          className="flex h-11 items-center gap-2.5 px-4 font-mono text-[13px]"
          onClick={() => open("contact")}
        >
          <QrCode size={16} strokeWidth={1.8} aria-hidden />
          QR
        </Key>
        <span className="ml-auto hidden font-mono text-[11px] text-sub lg:inline">
          tip: type <kbd className="text-ink">help</kbd> in Terminal
        </span>
      </div>
    </div>
  );
}
