"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Copy, Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { pick, profile } from "@/config/profile";
import { sound } from "@/lib/sound";
import { useOS } from "../state";
import { copyText, downloadVCard } from "../actions";
import { Caps, Key } from "../ui";

const QR_VALUE = `${profile.websiteUrl}/#contact`;

export function Contact() {
  const { state, notify } = useOS();
  const [showQR, setShowQR] = useState(false);
  const qrWrap = useRef<HTMLDivElement>(null);

  const saveQR = () => {
    const canvas = qrWrap.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "kittipan-net-qr.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="flex min-h-full flex-col gap-3.5 p-4 sm:p-5">
      <section className="panel flex flex-col gap-4 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="lcd flex size-[76px] shrink-0 items-center justify-center rounded-md">
            <span className="lcd-digits text-[36px]">{profile.monogram}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-sans text-2xl font-bold leading-tight text-ink">
              {profile.name}
            </span>
            <span className="font-sans text-[13px] text-sub">
              {pick(profile.role, state.lang)} ·{" "}
              {pick(profile.location, state.lang)}
            </span>
          </div>
        </div>

        <Key
          accent
          className="flex h-[52px] items-center justify-center gap-2.5 rounded-[10px] font-mono text-sm font-semibold"
          onClick={() => {
            downloadVCard();
            sound.playSuccessChime();
            notify("Contact saved · kittipan-sankoh.vcf");
          }}
        >
          <Download size={17} strokeWidth={2} aria-hidden />
          Save contact
        </Key>
        <div className="grid grid-cols-2 gap-2.5">
          <Key
            className="flex h-12 items-center justify-center gap-2 rounded-[10px] font-mono text-[13px]"
            onClick={async () =>
              notify(
                (await copyText(profile.email))
                  ? `Copied ${profile.email}`
                  : "Clipboard unavailable",
              )
            }
          >
            <Copy size={16} strokeWidth={1.8} aria-hidden />
            Copy email
          </Key>
          <Key
            className="flex h-12 items-center justify-center gap-2 rounded-[10px] font-mono text-[13px]"
            aria-pressed={showQR}
            aria-controls="contact-qr"
            onClick={() => setShowQR((v) => !v)}
          >
            <QrCode size={16} strokeWidth={1.8} aria-hidden />
            {showQR ? "Hide QR" : "Show QR"}
          </Key>
        </div>

        {showQR && (
          <div
            id="contact-qr"
            className="flex flex-col items-center gap-3 rounded-md border border-line bg-card p-4"
          >
            <div ref={qrWrap} className="rounded-md bg-[#f4f3ef] p-3">
              <QRCodeCanvas
                value={QR_VALUE}
                size={184}
                fgColor="#161616"
                bgColor="#f4f3ef"
                level="M"
                marginSize={0}
              />
            </div>
            <Caps>kittipan.net/#contact</Caps>
            <Key
              className="flex h-10 items-center gap-2 px-3.5 font-mono text-xs"
              onClick={saveQR}
            >
              <Download size={14} aria-hidden />
              Save PNG
            </Key>
          </div>
        )}
      </section>

      <ul className="panel m-0 flex list-none flex-col overflow-hidden rounded-xl p-0">
        {profile.links.map((l, i) => (
          <li key={l.id} className={i > 0 ? "border-t border-line" : ""}>
            <a
              href={l.url}
              target={l.url.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={() => sound.playMechanicalClick()}
              className="flex min-h-[60px] items-center gap-3.5 px-4 text-ink no-underline hover:bg-card"
            >
              <span className="flex size-[34px] items-center justify-center rounded-md bg-lcd font-dot text-[15px] font-extrabold text-lcd-ink">
                {l.code}
              </span>
              <span className="flex grow flex-col">
                <span className="font-mono text-sm font-semibold">
                  {l.label}
                </span>
                <span className="font-mono text-[11px] text-sub">
                  {l.handle}
                </span>
              </span>
              <ArrowUpRight size={16} className="text-sub" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
