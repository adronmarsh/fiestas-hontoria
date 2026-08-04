import { PrismaClient, EntryType, PairingMode } from "@prisma/client";

const prisma = new PrismaClient();

const championships: {
  name: string;
  slug: string;
  entryType: EntryType;
  pairingMode?: PairingMode;
  startDay?: number;
  endDay?: number;
}[] = [
  { name: "Ping pong", slug: "ping-pong", entryType: "individual" },
  { name: "Ajedrez", slug: "ajedrez", entryType: "individual" },
  { name: "Frontón", slug: "fronton", entryType: "pareja" },
  {
    name: "Pádel",
    slug: "padel",
    entryType: "individual",
    pairingMode: "random_pairs",
    startDay: 10,
    endDay: 13,
  },
  { name: "Parchís", slug: "parchis", entryType: "pareja" },
  { name: "Mus", slug: "mus", entryType: "pareja" },
  { name: "Brisca", slug: "brisca", entryType: "trio" },
];

async function main() {
  for (const c of championships) {
    await prisma.championship.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        entryType: c.entryType,
        pairingMode: c.pairingMode ?? "as_registered",
        startDay: c.startDay ?? null,
        endDay: c.endDay ?? null,
      },
      create: {
        name: c.name,
        slug: c.slug,
        entryType: c.entryType,
        pairingMode: c.pairingMode ?? "as_registered",
        startDay: c.startDay ?? null,
        endDay: c.endDay ?? null,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
