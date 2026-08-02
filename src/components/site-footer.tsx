import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-4 border-fiesta-ink bg-fiesta-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:text-left">
        <Image
          src="/escudo.svg"
          alt="Escudo de Hontoria de la Cantera"
          width={56}
          height={74}
          className="h-16 w-auto"
        />
        <div className="flex-1">
          <p className="font-display text-xl tracking-wide text-fiesta-yellow">
            Hontoria de la Cantera
          </p>
          <p className="mt-1 text-sm text-white/80">
            Organiza: Asociación Cultural «Hontoria de la Cantera»
          </p>
          <p className="text-sm text-white/60">
            Fiestas de Verano · Semana Cultural 2026
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs uppercase tracking-widest text-white/40 transition hover:text-fiesta-cyan"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
