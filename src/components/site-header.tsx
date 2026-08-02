"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/programa", label: "Calendario" },
  { href: "/campeonatos", label: "Campeonatos" },
  { href: "/colaboradores", label: "Colaboradores" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#faf7f2]/90 backdrop-blur-md">
      <div className="bunting w-full opacity-90" aria-hidden />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/escudo.svg"
            alt="Escudo de Hontoria de la Cantera"
            width={44}
            height={58}
            className="h-12 w-auto"
            priority
          />
          <span className="font-display text-lg leading-none tracking-wide text-fiesta-ink sm:text-xl">
            HONTORIA
            <span className="block font-accent text-base font-bold text-fiesta-magenta sm:text-lg">
              Fiestas 2026
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:text-fiesta-magenta",
                pathname === link.href
                  ? "text-fiesta-magenta"
                  : "text-fiesta-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-8 items-center justify-center rounded-lg border border-fiesta-ink bg-background px-3 text-sm font-medium md:hidden">
            Menú
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#faf7f2]">
            <SheetHeader>
              <SheetTitle className="font-display text-left">Menú</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-3 text-lg font-semibold uppercase",
                    pathname === link.href
                      ? "bg-fiesta-magenta text-white"
                      : "hover:bg-black/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
