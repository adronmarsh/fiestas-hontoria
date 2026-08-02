"use client";

import { useMemo, useState, useTransition } from "react";
import { updateMatchSchedule } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatMatchSchedule,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";

const FIESTA_DAYS = [
  { date: "2026-08-01", weekday: "Sáb", day: "1" },
  { date: "2026-08-02", weekday: "Dom", day: "2" },
  { date: "2026-08-03", weekday: "Lun", day: "3" },
  { date: "2026-08-04", weekday: "Mar", day: "4" },
  { date: "2026-08-05", weekday: "Mié", day: "5" },
  { date: "2026-08-06", weekday: "Jue", day: "6" },
  { date: "2026-08-07", weekday: "Vie", day: "7" },
  { date: "2026-08-08", weekday: "Sáb", day: "8" },
  { date: "2026-08-09", weekday: "Dom", day: "9" },
] as const;

/** Horas típicas de fiestas (tarde/noche + madrugada). */
const HOURS = [
  ...Array.from({ length: 14 }, (_, i) => String(i + 10).padStart(2, "0")),
  "00",
  "01",
  "02",
];

const MINUTES = ["00", "15", "30", "45"] as const;

function splitValue(value: string): { date: string; hour: string; minute: string } {
  if (!value.includes("T")) {
    return { date: "2026-08-08", hour: "18", minute: "00" };
  }
  const [date, time] = value.split("T");
  const [hour = "18", minute = "00"] = (time ?? "").split(":");
  const snapped =
    MINUTES.find((m) => m === minute) ??
    MINUTES.reduce((best, m) =>
      Math.abs(Number(m) - Number(minute)) < Math.abs(Number(best) - Number(minute))
        ? m
        : best
    );
  return {
    date: date || "2026-08-08",
    hour: hour.padStart(2, "0"),
    minute: snapped,
  };
}

export function MatchScheduleEditor({
  matchId,
  scheduledAt,
}: {
  matchId: string;
  scheduledAt: Date | string | null;
}) {
  const initial = toDatetimeLocalValue(scheduledAt);
  const [savedValue, setSavedValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => splitValue(initial));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const hours = useMemo(() => {
    const list = [...HOURS];
    if (!list.includes(draft.hour)) list.unshift(draft.hour);
    return list;
  }, [draft.hour]);

  const previewLabel = formatMatchSchedule(
    fromDatetimeLocalValue(`${draft.date}T${draft.hour}:${draft.minute}`)
  );
  const savedLabel = formatMatchSchedule(
    savedValue ? fromDatetimeLocalValue(savedValue) : null
  );

  function openPicker() {
    setDraft(splitValue(savedValue || "2026-08-08T18:00"));
    setMsg(null);
    setOpen(true);
  }

  function save() {
    const value = `${draft.date}T${draft.hour}:${draft.minute}`;
    start(async () => {
      const parsed = fromDatetimeLocalValue(value);
      const r = await updateMatchSchedule(
        matchId,
        parsed ? parsed.toISOString() : null
      );
      if (r.ok) {
        setSavedValue(value);
        setMsg(r.message ?? "Horario guardado");
        setOpen(false);
      } else {
        setMsg(r.error);
      }
    });
  }

  function clearSchedule() {
    start(async () => {
      const r = await updateMatchSchedule(matchId, null);
      if (r.ok) {
        setSavedValue("");
        setMsg("Hora quitada");
        setOpen(false);
      } else {
        setMsg(r.error);
      }
    });
  }

  return (
    <div className="mt-3 border-t border-black/10 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-fiesta-ink font-semibold"
          onClick={openPicker}
        >
          {savedLabel ? "Cambiar hora" : "Elegir hora"}
        </Button>
        {savedValue && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={clearSchedule}
          >
            Quitar
          </Button>
        )}
      </div>
      {msg && !open && (
        <p className="mt-2 text-xs text-muted-foreground">{msg}</p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "max-h-[min(92dvh,640px)] w-[calc(100%-1rem)] gap-0 overflow-hidden border-2 border-fiesta-ink bg-[#fffdf8] p-0 sm:max-w-md",
            "rounded-none sm:rounded-xl"
          )}
        >
          <DialogHeader className="border-b-2 border-fiesta-ink bg-fiesta-magenta px-4 py-3 text-white">
            <DialogTitle className="font-display text-lg tracking-wide text-fiesta-yellow">
              Horario del partido
            </DialogTitle>
            <DialogDescription className="text-white/85">
              Elige día y hora de las fiestas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[min(70dvh,480px)] flex-col gap-4 overflow-y-auto p-4">
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Día · Agosto 2026
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {FIESTA_DAYS.map((d) => {
                  const selected = draft.date === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, date: d.date }))}
                      className={cn(
                        "flex flex-col items-center border-2 px-1 py-2 transition-colors",
                        selected
                          ? "border-fiesta-ink bg-fiesta-yellow text-fiesta-ink"
                          : "border-black/15 bg-white hover:border-fiesta-cyan"
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide">
                        {d.weekday}
                      </span>
                      <span className="font-display text-xl leading-none">{d.day}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Hora
                </p>
                <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto rounded-none border-2 border-black/10 bg-white p-2 sm:max-h-48">
                  {hours.map((h) => {
                    const selected = draft.hour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, hour: h }))}
                        className={cn(
                          "py-2 font-display text-base tracking-wide transition-colors",
                          selected
                            ? "bg-fiesta-magenta text-white"
                            : "bg-muted/40 hover:bg-fiesta-cyan/20"
                        )}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Minutos
                </p>
                <div className="grid grid-cols-4 gap-1.5 border-2 border-black/10 bg-white p-2 sm:grid-cols-2 sm:max-h-48">
                  {MINUTES.map((m) => {
                    const selected = draft.minute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, minute: m }))}
                        className={cn(
                          "py-3 font-display text-lg tracking-wide transition-colors sm:py-4",
                          selected
                            ? "bg-fiesta-cyan text-fiesta-ink"
                            : "bg-muted/40 hover:bg-fiesta-yellow/40"
                        )}
                      >
                        :{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <p className="border-2 border-dashed border-fiesta-magenta/40 bg-fiesta-magenta/5 px-3 py-2 text-center font-semibold text-fiesta-magenta">
              {previewLabel ?? "Elige día y hora"}
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 border-t-2 border-fiesta-ink bg-white sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              className="w-full text-destructive sm:w-auto"
              onClick={clearSchedule}
            >
              Quitar hora
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                className="w-full sm:w-auto"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={pending}
                className="w-full bg-fiesta-magenta font-display tracking-wide text-white hover:bg-fiesta-magenta/90 sm:w-auto"
                onClick={save}
              >
                {pending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
          {msg && open && (
            <p className="px-4 pb-3 text-xs text-destructive">{msg}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
