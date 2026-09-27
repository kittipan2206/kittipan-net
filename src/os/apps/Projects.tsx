"use client";

import { ArrowUpRight } from "lucide-react";
import { profile } from "@/config/profile";
import { useOS } from "../state";
import { Caps } from "../ui";

export function Projects() {
  const { state } = useOS();
  const th = state.lang === "th";
  return (
    <div className="flex min-h-full flex-col items-start gap-5 p-6">
      <div className="lcd w-full p-5">
        <div className="caps flex justify-between text-lcd-sub">
          <span>projects/</span>
          <span>status</span>
        </div>
        <div className="lcd-digits mt-3 text-[40px] sm:text-[52px]">
          CURATING
        </div>
      </div>
      <p className="m-0 max-w-[480px] font-sans text-[15px] leading-relaxed text-sub">
        {th
          ? "กำลังคัดโปรเจกต์มาเล่าเป็น case study อยู่ ระหว่างนี้ดูโค้ดที่เปิดสาธารณะได้บน GitHub"
          : "Case studies are being written up. Meanwhile, the public code lives on GitHub."}
      </p>
      <a
        href={profile.github}
        target="_blank"
        rel="noopener noreferrer"
        className="key flex h-11 items-center gap-2 px-4 font-mono text-[13px] no-underline"
      >
        github.com/kittipan2206
        <ArrowUpRight size={15} aria-hidden />
      </a>
      <Caps className="mt-auto">try `ls projects` in Terminal</Caps>
    </div>
  );
}
