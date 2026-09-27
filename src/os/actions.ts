import { profile } from "@/config/profile";

export function downloadVCard() {
  const [firstName, lastName] = profile.name.split(" ");
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${lastName};${firstName};;;`,
    `FN:${profile.name}`,
    `TITLE:${profile.role.en}`,
    `EMAIL;type=INTERNET;type=pref:${profile.email}`,
    `URL:${profile.websiteUrl}`,
    ...profile.links
      .filter((l) => l.url.startsWith("http"))
      .map((l) => `X-SOCIALPROFILE;type=${l.id}:${l.url}`),
    `NOTE:${profile.role.en} · ${profile.location.en}`,
    "END:VCARD",
  ].join("\r\n");

  const url = URL.createObjectURL(
    new Blob([vcf], { type: "text/vcard;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "kittipan-sankoh.vcf";
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;
