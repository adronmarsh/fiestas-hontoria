import type { Metadata } from "next";
import { Anton, Bangers, Amatic_SC, Barlow_Condensed } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brush",
});

const amatic = Amatic_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-accent",
});

const barlow = Barlow_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Fiestas Hontoria de la Cantera 2026",
    template: "%s · Fiestas Hontoria 2026",
  },
  description:
    "Programa de la Semana Cultural 2026 y campeonatos populares en Hontoria de la Cantera (Burgos).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${bangers.variable} ${amatic.variable} ${barlow.variable} h-full antialiased`}
    >
      <body className="splatter-bg flex min-h-full flex-col font-sans text-base md:text-lg">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
