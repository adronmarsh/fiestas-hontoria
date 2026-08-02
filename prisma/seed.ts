import { PrismaClient, EntryType } from "@prisma/client";

const prisma = new PrismaClient();

const championships: {
  name: string;
  slug: string;
  entryType: EntryType;
}[] = [
  { name: "Ping pong", slug: "ping-pong", entryType: "individual" },
  { name: "Ajedrez", slug: "ajedrez", entryType: "individual" },
  { name: "Frontón", slug: "fronton", entryType: "pareja" },
  { name: "Pádel", slug: "padel", entryType: "pareja" },
  { name: "Parchís", slug: "parchis", entryType: "pareja" },
  { name: "Mus", slug: "mus", entryType: "pareja" },
  { name: "Brisca", slug: "brisca", entryType: "trio" },
];

async function main() {
  for (const c of championships) {
    await prisma.championship.upsert({
      where: { slug: c.slug },
      update: { name: c.name, entryType: c.entryType },
      create: c,
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
