# Campeonatos

## Modalidades iniciales

| Slug | Nombre | Tipo entrada | Notas |
|------|--------|--------------|-------|
| ping-pong | Ping pong | individual (1 nombre) | |
| ajedrez | Ajedrez | individual (1 nombre) | |
| fronton | Frontón | pareja (2 nombres) | |
| padel | Pádel | individual → parejas aleatorias | 10–13 agosto |
| parchis | Parchís | pareja (2 nombres) | |
| mus | Mus | pareja (2 nombres) | |
| brisca | Brisca | trío (3 nombres) | |

## Reglas

1. Cualquiera puede apuntarse escribiendo el nombre o los de la pareja/trío (sin login).
2. Solo el admin genera el cuadro eliminatorio aleatorio.
3. Solo el admin marca el ganador de cada partido y avanza rondas.
4. El público ve la lista de inscritos y el cuadro en solo lectura (vista gráfica en árbol).
5. El admin puede crear campeonatos adicionales y cerrar inscripciones.
6. Cada campeonato tiene un organizador (nombre visible en la ficha).
7. El cuadro se puede generar aleatorio o manual (orden de emparejamientos).
8. El admin asigna fecha y hora a cada enfrentamiento; el horario vive en `/campeonatos` junto con los actos del programa, con filtro por jugador.
9. Modalidad reutilizable **parejas aleatorias** (`pairingMode: random_pairs`): inscripción individual; al generar el cuadro se forman parejas al azar; si el número es impar, uno se queda sin pareja.
10. Los campeonatos pueden tener rango de días en agosto (`startDay` / `endDay`).
