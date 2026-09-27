import type { Metadata, Viewport } from "next";
import { Doto, IBM_Plex_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
const sans = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const dot = Doto({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-dot",
  display: "swap",
});

const description =
  "Kittipan Sankoh — Software & Mobile Engineer in Bangkok. A personal operating system for the web: Flutter, Next.js, smart home and AI tinkering.";

export const metadata: Metadata = {
  metadataBase: new URL("https://kittipan.net"),
  title: "Kittipan Sankoh — kittipan OS",
  description,
  authors: [{ name: "Kittipan Sankoh", url: "https://kittipan.net" }],
  openGraph: {
    type: "website",
    url: "https://kittipan.net",
    siteName: "kittipan OS",
    title: "Kittipan Sankoh — kittipan OS",
    description,
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "kittipan OS desktop" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kittipan Sankoh — kittipan OS",
    description,
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#111210",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint: picks the lighting phase so the first frame is already day or night.
// Approximates Bangkok sunrise/sunset (≈06:10/18:10); OS.tsx refines it with real solar math.
const prePaint = `(function(){var d=document.documentElement;try{var p=localStorage.getItem('kos_theme');if(!p||p==='auto'){var f=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':');var t=+f[0]*60+ +f[1];p=t<325||t>1135?'night':t<415?'dawn':t<1045?'day':'dusk';}d.dataset.phase=p;var a=localStorage.getItem('kos_accent');if(a)d.dataset.accent=a;var w=localStorage.getItem('kos_wallpaper');if(w)d.dataset.wallpaper=w;if(localStorage.getItem('kos_motion')==='reduced')d.dataset.motion='reduced';}catch(e){d.dataset.phase='night';}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${mono.variable} ${sans.variable} ${dot.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaint }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
