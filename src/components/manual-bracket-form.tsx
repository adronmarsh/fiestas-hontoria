"use client";

import { useEffect, useState, useTransition } from "react";
import { generateBracket, regenerateBracket } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { entryLabel } from "@/lib/bracket";

type EntryRow = {
  id: string;
  player1: string;
  player2: string | null;
  player3: string | null;
};

export function ManualBracketForm({
  championshipId,
  entries,
  hasMatches,
  hasResults,
}: {
  championshipId: string;
  entries: EntryRow[];
  hasMatches: boolean;
  hasResults: boolean;
}) {
  const [order, setOrder] = useState(entries.map((e) => e.id));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOrder(entries.map((e) => e.id));
  }, [entries]);

  const byId = new Map(entries.map((e) => [e.id, e]));

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= order.length) return;
    setOrder((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  function submit() {
    start(async () => {
      if (hasMatches) {
        if (
          !confirm(
            hasResults
              ? "Se borrarán resultados y se creará el cuadro con este orden. ¿Continuar?"
              : "Se regenerará el cuadro con este orden. ¿Continuar?"
          )
        ) {
          return;
        }
      }
      const action = hasMatches ? regenerateBracket : generateBracket;
      const r = await action(championshipId, {
        mode: "manual",
        entryOrder: order,
      });
      setMsg(r.ok ? (r.message ?? "OK") : r.error);
      if (r.ok) setOpen(false);
    });
  }

  if (entries.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Haz falta al menos 2 inscritos para el cuadro manual.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-2 border-dashed border-fiesta-ink/40 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg tracking-wide">Cuadro manual</p>
          <p className="text-sm text-muted-foreground">
            Ordena los inscritos: 1º vs 2º, 3º vs 4º… (impar = bye)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Abrir editor"}
        </Button>
      </div>

      {open && (
        <>
          <ol className="flex flex-col gap-2">
            {order.map((id, index) => {
              const entry = byId.get(id);
              if (!entry) return null;
              const pairSlot = Math.floor(index / 2) + 1;
              const side = index % 2 === 0 ? "A" : "B";
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-2 border px-3 py-2"
                >
                  <span className="text-sm">
                    <span className="font-bold text-fiesta-magenta">
                      P{pairSlot}
                      {side}.
                    </span>{" "}
                    {entryLabel(entry)}
                  </span>
                  <span className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === 0 || pending}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === order.length - 1 || pending}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </Button>
                  </span>
                </li>
              );
            })}
          </ol>
          <Button
            type="button"
            className="font-display tracking-wide"
            disabled={pending}
            onClick={submit}
          >
            {pending
              ? "Generando…"
              : hasMatches
                ? "Regenerar con este orden"
                : "Generar cuadro con este orden"}
          </Button>
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        </>
      )}
    </div>
  );
}
