"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import {
  archive,
  pick,
  profile,
  projects,
  type Project,
} from "@/config/profile";
import { sound } from "@/lib/sound";
import { useOS } from "../state";
import { Caps, Key } from "../ui";

function Demo({ project, autoPlay }: { project: Project; autoPlay: boolean }) {
  if (!project.media) {
    return (
      <div className="lcd flex aspect-video items-center justify-center rounded-md">
        <span className="lcd-digits text-5xl">{project.code}</span>
      </div>
    );
  }
  return (
    <video
      src={project.media.video}
      poster={project.media.poster}
      muted
      loop
      playsInline
      autoPlay={autoPlay}
      preload="metadata"
      aria-label={`${project.name} demo`}
      onPointerEnter={(e) => e.currentTarget.play().catch(() => {})}
      onPointerLeave={(e) => !autoPlay && e.currentTarget.pause()}
      className="aspect-video w-full rounded-md border border-frame bg-lcd object-cover object-top"
    />
  );
}

function Detail({ project, onBack }: { project: Project; onBack: () => void }) {
  const { state } = useOS();
  const lang = state.lang;
  return (
    <article className="flex flex-col gap-5 p-5 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 self-start font-mono text-xs text-sub hover:text-ink"
      >
        <ChevronLeft size={15} aria-hidden /> projects/
      </button>
      <Demo project={project} autoPlay />
      <header className="flex flex-col gap-1.5">
        <Caps>
          {pick(project.kind, lang)} · {project.year}
        </Caps>
        <h2 className="m-0 font-sans text-[26px] font-bold leading-tight text-ink">
          {project.name}
        </h2>
        <p className="m-0 max-w-[640px] font-sans text-[15px] leading-relaxed text-sub">
          {pick(project.summary, lang)}
        </p>
      </header>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {project.points.map((pt) => (
          <li
            key={pt.en}
            className="flex gap-2.5 font-sans text-sm leading-relaxed text-ink"
          >
            <span
              className="mt-[9px] size-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden
            />
            {pick(pt, lang)}
          </li>
        ))}
      </ul>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-xs text-ink">
        {project.stack.map((s) => (
          <li key={s} className="rounded-sm border border-line px-2.5 py-[5px]">
            {s}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2.5">
        {project.links.map((l, i) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playMechanicalClick()}
            className={`key flex h-11 items-center gap-2 px-4 font-mono text-[13px] no-underline ${i === 0 ? "key-accent font-semibold" : ""}`}
          >
            {l.label}
            <ArrowUpRight size={15} aria-hidden />
          </a>
        ))}
      </div>
    </article>
  );
}

export function Projects() {
  const { state } = useOS();
  const [openId, setOpenId] = useState<string | null>(null);
  const lang = state.lang;
  const current = projects.find((p) => p.id === openId);

  if (current)
    return <Detail project={current} onBack={() => setOpenId(null)} />;

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-6">
      <section aria-labelledby="featured" className="flex flex-col gap-3">
        <Caps>
          <span id="featured">Featured · {projects.length}</span>
        </Caps>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Key
              key={p.id}
              onClick={() => setOpenId(p.id)}
              aria-label={`Open case study: ${p.name}`}
              className="flex flex-col gap-3 p-3 text-left"
            >
              <Demo project={p} autoPlay={false} />
              <span className="flex flex-col gap-1 px-1 pb-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-sans text-base font-semibold text-ink">
                    {p.name}
                  </span>
                  <span className="font-mono text-[11px] text-sub">
                    {p.year}
                  </span>
                </span>
                <span className="font-sans text-[13px] leading-snug text-sub">
                  {pick(p.kind, lang)}
                </span>
              </span>
            </Key>
          ))}
        </div>
      </section>

      <section aria-labelledby="archive" className="flex flex-col gap-2">
        <Caps>
          <span id="archive">Archive</span>
        </Caps>
        <ul className="panel m-0 flex list-none flex-col overflow-hidden rounded-xl p-0">
          {archive.map((a, i) => (
            <li key={a.name} className={i > 0 ? "border-t border-line" : ""}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] items-center gap-3 px-4 py-2 text-ink no-underline hover:bg-card"
              >
                <span className="w-10 shrink-0 font-mono text-[11px] text-sub">
                  {a.year}
                </span>
                <span className="flex grow flex-col">
                  <span className="font-mono text-[13px] font-semibold">
                    {a.name}
                  </span>
                  <span className="font-sans text-xs text-sub">
                    {pick(a.note, lang)}
                  </span>
                </span>
                <ArrowUpRight
                  size={15}
                  className="shrink-0 text-sub"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="m-0 font-sans text-xs leading-relaxed text-sub">
        {lang === "th"
          ? "งานลูกค้าและโปรเจกต์ private ไม่ได้แสดงที่นี่ อยากคุยเรื่องไหนทักมาได้ที่ "
          : "Client work and private projects aren't listed here. Ask me about them: "}
        <a href={`mailto:${profile.email}`} className="text-ink underline">
          {profile.email}
        </a>
      </p>
    </div>
  );
}
