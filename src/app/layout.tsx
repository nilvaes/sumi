import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Newsreader, IBM_Plex_Sans, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ScrollToTopOnNav } from "@/components/scroll-to-top-on-nav";
import { Providers } from "./providers";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jp = Noto_Sans_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Sumi — Track & Explore New Anime",
    template: "%s · Sumi",
  },
  description:
    "Browse airing and trending anime, search the full catalog, filter by genre and season, and see what's on this week — a calm, dark editorial discovery app.",
  openGraph: {
    title: "Sumi — Track & Explore New Anime",
    description:
      "Browse airing and trending anime, search the catalog, and check the weekly schedule.",
    siteName: "Sumi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${jp.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Providers>
          <ScrollToTopOnNav />
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
