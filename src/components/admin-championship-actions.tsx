"use client";

import { useState, useTransition } from "react";
import {
  deleteEntry,
  generateBracket,
  regenerateBracket,
  toggleRegistration,
  updateChampionshipOrganizer,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
              const r = await generateBracket(championshipId, { mode: "random" });
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
                  ? "Se borrarán todos los resultados y se generará un cuadro aleatorio nuevo. ¿Continuar?"
                  : "Se regenerará el cuadro aleatorio con los inscritos actuales. ¿Continuar?"
              )
            ) {
              return;
            }
            const r = await regenerateBracket(championshipId, { mode: "random" });
            setMsg(r.ok ? (r.message ?? "OK") : r.error);
          })
        }
      >
        {pending ? "Regenerando…" : "Regenerar aleatorio"}
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

export function OrganizerEditor({
  championshipId,
  organizer,
}: {
  championshipId: string;
  organizer: string | null;
}) {
  const [value, setValue] = useState(organizer ?? "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex min-w-[200px] flex-1 flex-col gap-1">
        <Label htmlFor="organizer">Organizador</Label>
        <Input
          id="organizer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Nombre del organizador"
        />
      </div>
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await updateChampionshipOrganizer(championshipId, value);
            setMsg(r.ok ? (r.message ?? "OK") : r.error);
          })
        }
      >
        {pending ? "…" : "Guardar"}
      </Button>
      {msg && <p className="basis-full text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
