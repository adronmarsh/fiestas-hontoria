import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Colaboradores",
  description:
    "Organización y colaboradores de las Fiestas de Hontoria de la Cantera 2026.",
};

export default function ColaboradoresPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="font-brush text-5xl text-fiesta-magenta sm:text-6xl">
        Gracias a todos nuestros colaboradores
      </h1>
      <p className="mt-4 text-muted-foreground">
        Las fiestas son posibles gracias al Ayuntamiento, la Asociación Cultural y
        los colaboradores locales.
      </p>

      <div className="mt-10 border-4 border-fiesta-ink bg-white p-8">
        <Image
          src="/escudo.svg"
          alt="Escudo de Hontoria de la Cantera"
          width={120}
          height={160}
          className="mx-auto h-36 w-auto animate-glow"
        />
        <h2 className="mt-4 font-display text-2xl tracking-wide">
          Ayuntamiento de Hontoria de la Cantera
        </h2>
      </div>

      <div className="mt-8 bg-fiesta-ink px-6 py-5 text-white">
        <p className="font-accent text-2xl font-bold text-fiesta-yellow">Organiza</p>
        <p className="mt-1 font-display text-xl tracking-wide">
          Asociación Cultural «Hontoria de la Cantera»
        </p>
      </div>
    </div>
  );
}
