import { PrismaClient, EntryType, PairingMode } from "@prisma/client";

const prisma = new PrismaClient();

const championships: {
  name: string;
  slug: string;
  entryType: EntryType;
  pairingMode?: PairingMode;
  organizer?: string;
  startDay?: number;
  endDay?: number;
  startTime?: string;
}[] = [
  { name: "Ping pong", slug: "ping-pong", entryType: "individual" },
  { name: "Ajedrez", slug: "ajedrez", entryType: "individual" },
  {
    name: "Frontón",
    slug: "fronton",
    entryType: "pareja",
    organizer: "Adrián",
    startDay: 10,
    startTime: "10:30",
  },
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
  {
    name: "Brisca",
    slug: "brisca",
    entryType: "trio",
    startDay: 10,
    startTime: "18:30",
  },
  {
    name: "Concurso de triples",
    slug: "triples",
    entryType: "individual",
    organizer: "Javi (Fonta)",
    startDay: 12,
    startTime: "18:00",
  },
];

async function main() {
  for (const c of championships) {
    await prisma.championship.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        entryType: c.entryType,
        pairingMode: c.pairingMode ?? "as_registered",
        ...(c.organizer !== undefined ? { organizer: c.organizer } : {}),
        ...(c.startDay !== undefined ? { startDay: c.startDay } : {}),
        ...(c.endDay !== undefined ? { endDay: c.endDay } : {}),
        ...(c.startTime !== undefined ? { startTime: c.startTime } : {}),
      },
      create: {
        name: c.name,
        slug: c.slug,
        entryType: c.entryType,
        pairingMode: c.pairingMode ?? "as_registered",
        organizer: c.organizer ?? null,
        startDay: c.startDay ?? null,
        endDay: c.endDay ?? null,
        startTime: c.startTime ?? null,
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
