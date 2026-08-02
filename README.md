# Fiestas Hontoria de la Cantera 2026

Web del programa de la Semana Cultural y gestión de campeonatos populares.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Neon Postgres + Prisma
- Deploy en Vercel

## Desarrollo

```bash
npm install
cp .env.example .env.local   # rellenar DATABASE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
npx prisma db push
npm run db:seed
npm run dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3000/admin

## Contenido

Fuente de datos del programa: `docs/raw/brief.md` y `docs/wiki/`.
Escudo: `public/escudo.svg`.
