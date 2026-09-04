import type { Metadata, Viewport } from "next";
import "./globals.css";
import { profileConfig } from "@/config/profile";

export const metadata: Metadata = {
  title: `${profileConfig.name} | ${profileConfig.role}`,
  description: profileConfig.statement,
  keywords: ["Kittipan", "Sankoh", "Smart Home", "Home Assistant", "Hyper-V", "Cloudflare", "Systems Engineer", "Homelab"],
  authors: [{ name: profileConfig.name, url: profileConfig.websiteUrl }],
  creator: profileConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: profileConfig.websiteUrl,
    title: `${profileConfig.name} // ${profileConfig.role}`,
    description: profileConfig.statement,
    siteName: profileConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profileConfig.name} // ${profileConfig.role}`,
    description: profileConfig.statement,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23121418'/><text y='.75em' x='.2em' font-size='65' fill='%23FF4F00' font-family='monospace' font-weight='bold'>KS</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0d10",
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
      <body className="bg-chassis-void text-industrial-paper antialiased selection:bg-industrial-orange/30 selection:text-industrial-orange">
        {children}
      </body>
    </html>
  );
}
