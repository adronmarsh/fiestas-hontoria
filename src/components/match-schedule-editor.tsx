"use client";

import { useState, useTransition } from "react";
import { updateMatchSchedule } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";

export function MatchScheduleEditor({
  matchId,
  scheduledAt,
}: {
  matchId: string;
  scheduledAt: Date | string | null;
}) {
  const [value, setValue] = useState(toDatetimeLocalValue(scheduledAt));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-black/10 pt-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Fecha y hora
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-[220px]"
        />
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const parsed = value ? fromDatetimeLocalValue(value) : null;
              const r = await updateMatchSchedule(
                matchId,
                parsed ? parsed.toISOString() : null
              );
              setMsg(r.ok ? (r.message ?? "OK") : r.error);
            })
          }
        >
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        {value && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setValue("");
                const r = await updateMatchSchedule(matchId, null);
                setMsg(r.ok ? "Hora quitada" : r.error);
              })
            }
          >
            Quitar
          </Button>
        )}
      </div>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
