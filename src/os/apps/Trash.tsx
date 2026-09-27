"use client";

import { sound } from "@/lib/sound";
import { appById } from "../apps";
import { useOS } from "../state";
import { bangkokTime } from "../sun";
import { Caps, Key } from "../ui";

export function Trash() {
  const { state, notify } = useOS();
  const log = [...state.trashLog].reverse();

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="lcd flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <span className="caps text-lcd-sub">Items in trash</span>
          <span className="lcd-digits text-[44px]">00</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="caps text-lcd-sub">Escape attempts</span>
          <span className="lcd-digits text-[44px]">{String(state.trashLog.length).padStart(2, "0")}</span>
        </div>
      </div>

      {log.length === 0 ? (
        <p className="m-0 font-sans text-sm leading-relaxed text-sub">
          Empty. Everything on this desktop is load-bearing — try dragging an app in here anyway.
        </p>
      ) : (
        <ul className="panel scroll-quiet m-0 flex max-h-[180px] list-none flex-col overflow-y-auto rounded-xl p-0">
          {log.map((entry, i) => (
            <li key={`${entry.at}-${i}`} className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-xs text-ink first:border-t-0">
              <span>{appById(entry.id).file}</span>
              <span className="text-sub">restored · {bangkokTime(new Date(entry.at), true)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3">
        <Caps>nothing ever stays deleted here</Caps>
        <Key
          className="flex h-10 items-center px-4 font-mono text-xs"
          onClick={() => {
            sound.playCrunch();
            notify("Trash emptied. It was already empty.");
          }}
        >
          Empty Trash
        </Key>
      </div>
    </div>
  );
}
