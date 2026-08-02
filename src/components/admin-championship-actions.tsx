"use client";

import { useState, useTransition } from "react";
import {
  deleteEntry,
  generateBracket,
  regenerateBracket,
  toggleRegistration,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function ToggleRegistrationButton({
  championshipId,
  open,
}: {
  championshipId: string;
  open: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => { await toggleRegistration(championshipId); })}
    >
      {open ? "Cerrar inscripciones" : "Abrir inscripciones"}
    </Button>
  );
}

export function GenerateBracketButton({
  championshipId,
  hasMatches,
  hasResults,
}: {
  championshipId: string;
  hasMatches: boolean;
  hasResults: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (!hasMatches) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          className="font-display tracking-wide"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await generateBracket(championshipId);
              setMsg(r.ok ? (r.message ?? "OK") : r.error);
            })
          }
        >
          {pending ? "Generando…" : "Generar cuadro aleatorio"}
        </Button>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() =>
          start(async () => {
            if (
              !confirm(
                hasResults
                  ? "Se borrarán todos los resultados y se generará un cuadro nuevo. ¿Continuar?"
                  : "Se regenerará el cuadro con los inscritos actuales. ¿Continuar?"
              )
            ) {
              return;
            }
            const r = await regenerateBracket(championshipId);
            setMsg(r.ok ? (r.message ?? "OK") : r.error);
          })
        }
      >
        {pending ? "Regenerando…" : "Regenerar cuadro"}
      </Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm("¿Eliminar este inscrito?")) return;
          await deleteEntry(entryId);
        })
      }
    >
      Borrar
    </Button>
  );
}
