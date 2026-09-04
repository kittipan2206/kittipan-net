import type { Metadata, Viewport } from "next";
import "./globals.css";
import { profileConfig } from "@/config/profile";

export const metadata: Metadata = {
  title: `${profileConfig.name} | ${profileConfig.title}`,
  description: profileConfig.tagline,
  keywords: ["Kittipan", "Sankoh", "Smart Home", "Home Assistant", "Hyper-V", "Cloudflare", "Developer"],
  authors: [{ name: profileConfig.name, url: profileConfig.websiteUrl }],
  creator: profileConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: profileConfig.websiteUrl,
    title: `${profileConfig.name} - Digital Business Card`,
    description: profileConfig.tagline,
    siteName: profileConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: profileConfig.name,
    description: profileConfig.tagline,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#080a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080a0f] text-gray-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
