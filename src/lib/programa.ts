export type ProgramaEvento = {
  time?: string;
  title: string;
  note?: string;
};

export type ProgramaDia = {
  id: string;
  label: string;
  dayNumber: string;
  events: ProgramaEvento[];
};

export const PROGRAMA: ProgramaDia[] = [
  {
    id: "1-agosto",
    label: "Sábado 1 agosto",
    dayNumber: "1",
    events: [{ title: "Comienzo campeonato de bolos" }],
  },
  {
    id: "3-agosto",
    label: "Lunes 3 agosto",
    dayNumber: "3",
    events: [
      { time: "18:30", title: "Campeonato de parchís por parejas" },
      { time: "23:00", title: "Cine de verano" },
    ],
  },
  {
    id: "4-agosto",
    label: "Martes 4 agosto",
    dayNumber: "4",
    events: [
      { time: "19:30", title: "Exhibición trial bike Raúl Gutiérrez" },
      { time: "23:00", title: "Cine de verano" },
    ],
  },
  {
    id: "5-agosto",
    label: "Miércoles 5 agosto",
    dayNumber: "5",
    events: [
      { time: "19:30", title: "Espectáculo infantil «Sopa Risa»" },
      { time: "21:30", title: "Pincho pote" },
      { time: "23:00", title: "Cine de verano" },
    ],
  },
  {
    id: "6-agosto",
    label: "Jueves 6 agosto",
    dayNumber: "6",
    events: [
      {
        title: "Parque infantil acuático",
        note: "13:00–15:00 y 17:00–19:00",
      },
      {
        time: "19:00",
        title: "Partido fútbol sala «Solteros contra casados»",
        note: "Aperitivo para participantes",
      },
      { time: "23:00", title: "Cine de verano" },
    ],
  },
  {
    id: "7-agosto",
    label: "Viernes 7 agosto",
    dayNumber: "7",
    events: [
      { time: "18:30", title: "Quedada para preparar mesas y sillas" },
      {
        time: "21:30",
        title: "Cena popular",
        note: "Entradas en el bar hasta el 31 de julio",
      },
      {
        time: "00:00–04:30",
        title: "Disco móvil «ADRENALINA SHOW»",
      },
    ],
  },
  {
    id: "8-agosto",
    label: "Sábado 8 agosto",
    dayNumber: "8",
    events: [
      { time: "17:00", title: "Encuentro escuela de bolos", note: "Aperitivo" },
      {
        time: "18:30",
        title: "Concurso de pincho de tortilla de patata",
        note: "Degustación",
      },
      { time: "20:00", title: "Electrocharanga" },
      {
        time: "00:30",
        title: "Grupo musical «ELECTROMOTORES RALEA»",
        note: "Seguido de disco móvil",
      },
    ],
  },
  {
    id: "9-agosto",
    label: "Domingo 9 agosto",
    dayNumber: "9",
    events: [
      { time: "19:00", title: "Dúo musical" },
      { time: "23:00", title: "Cine de verano" },
    ],
  },
];

export const NOTAS_INTERES = [
  "Durante el mes de agosto se celebrarán diversos campeonatos.",
  "Se ruega puntualidad en todos los actos.",
  "Los horarios pueden variar por motivos de organización.",
  "Entradas cena popular: comprar en el bar antes del 31 de julio; sin devoluciones ni venta posterior.",
  "Gracias por la colaboración y participación. ¡Feliz verano a todos!",
];
