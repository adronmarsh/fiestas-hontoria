"use client";

import { useEffect, useState, useTransition } from "react";
import {
  clearBracket,
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
}: {
  championshipId: string;
  hasMatches: boolean;
  hasResults?: boolean;
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

export function ClearBracketButton({
  championshipId,
  hasMatches,
}: {
  championshipId: string;
  hasMatches: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (!hasMatches) return null;

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        className="border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={() =>
          start(async () => {
            const r = await clearBracket(championshipId);
            setMsg(r.ok ? (r.message ?? "OK") : r.error);
          })
        }
      >
        {pending ? "Borrando…" : "Borrar cuadro"}
      </Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}

export function AdminEntryRow({
  entryId,
  label,
}: {
  entryId: string;
  label: string;
  hasBracket?: boolean;
}) {
  const [pending, start] = useTransition();
  const [removing, setRemoving] = useState(false);
  const [gone, setGone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (gone) return null;

  return (
    <li
      className={`flex items-center justify-between gap-2 border bg-white px-3 py-2 transition-colors ${
        removing ? "animate-entry-delete" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <span className={removing ? "italic" : undefined}>{label}</span>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending || removing}
        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          setError(null);
          setRemoving(true);
          window.setTimeout(() => {
            start(async () => {
              const r = await deleteEntry(entryId);
              if (!r.ok) {
                setRemoving(false);
                setError(r.error);
                return;
              }
              setGone(true);
            });
          }, 420);
        }}
      >
        {pending || removing ? "…" : "Borrar"}
      </Button>
    </li>
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

  useEffect(() => {
    setValue(organizer ?? "");
  }, [organizer]);

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
      {value && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() =>
            start(async () => {
              setValue("");
              const r = await updateChampionshipOrganizer(championshipId, "");
              setMsg(r.ok ? (r.message ?? "OK") : r.error);
            })
          }
        >
          Borrar
        </Button>
      )}
      {msg && <p className="basis-full text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
