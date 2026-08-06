# Wiki — Fiestas Hontoria 2026

Índice vivo del proyecto. Fuente canónica de contenido: [docs/raw/brief.md](../raw/brief.md).

## Entidades

- [Fiestas](./fiestas.md) — Qué es el evento
- [Programa](./programa.md) — Calendario Semana Cultural
- [Campeonatos](./campeonatos.md) — Modalidades y reglas de inscripción/cuadro
- [Diseño](./diseno.md) — Paleta, tipografía, escudo

## Convenciones

- No inventar datos: solo brief + wiki.
- Responder y documentar en español.
- El cuadro aleatorio solo lo genera el admin.

## Despliegue

- Repo: https://github.com/adronmarsh/fiestas-hontoria
- Producción: https://fiestas-hontoria.vercel.app
- Base de datos: Neon (`fiestas-hontoria`)
- Admin: `/admin` con `ADMIN_PASSWORD` en variables de entorno

## Cartel

- Vista previa: `/cartel/` (HTML A4)
- PDF imprimible: `/cartel/cartel-fiestas-hontoria-2026.pdf`
- Regenerar: `npm run cartel:qr` y `npm run cartel:pdf`
