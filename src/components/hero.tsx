import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden border-b-4 border-fiesta-ink">
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#1a1a2e_0%,#0a0a0a_45%,#2a0a20_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #e91e8c55, transparent 40%), radial-gradient(circle at 80% 20%, #00b4c855, transparent 35%), radial-gradient(circle at 50% 80%, #f5d00044, transparent 45%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
        <Image
          src="/escudo.svg"
          alt=""
          width={72}
          height={96}
          className="mb-4 h-16 w-auto animate-rock-in opacity-95 sm:h-20"
          aria-hidden
        />
        <p className="animate-rock-in font-accent text-2xl font-bold tracking-wide text-white sm:text-3xl">
          Fiestas de Verano · Agosto 2026
        </p>
        <h1 className="hero-title animate-rock-in-delay mt-3 max-w-4xl text-5xl text-fiesta-yellow sm:text-7xl md:text-8xl">
          Hontoria de la Cantera
        </h1>
        <p className="mt-5 max-w-xl animate-rock-in-delay font-brush text-3xl text-fiesta-magenta sm:text-4xl">
          Semana Cultural 2026
        </p>
        <p className="mt-4 max-w-lg animate-rock-in-delay text-lg text-white/85">
          Programa, cine, conciertos y campeonatos del pueblo. Apúntate y sigue los cuadros.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-rock-in-delay">
          <Link
            href="/programa"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-fiesta-magenta font-display text-lg tracking-wide text-white hover:bg-fiesta-magenta/90"
            )}
          >
            Ver programa
          </Link>
          <Link
            href="/campeonatos"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "border-2 border-fiesta-yellow bg-transparent font-display text-lg tracking-wide text-fiesta-yellow hover:bg-fiesta-yellow hover:text-fiesta-ink"
            )}
          >
            Campeonatos
          </Link>
        </div>
      </div>
    </section>
  );
}
