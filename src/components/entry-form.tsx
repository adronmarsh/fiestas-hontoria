"use client";

import { useActionState } from "react";
import { registerEntry, type ActionResult } from "@/app/actions/entries";
import type { EntryType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requiredPlayers } from "@/lib/championships";

export function EntryForm({
  championshipId,
  entryType,
}: {
  championshipId: string;
  entryType: EntryType;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    registerEntry,
    null
  );
  const need = requiredPlayers(entryType);

  return (
    <form action={action} className="flex flex-col gap-4 border-4 border-fiesta-ink bg-white p-5">
      <input type="hidden" name="championshipId" value={championshipId} />
      <h3 className="font-display text-xl tracking-wide">Apuntarse</h3>
      <p className="text-sm text-muted-foreground">
        Escribe {need === 1 ? "tu nombre" : need === 2 ? "los nombres de la pareja" : "los tres nombres del trío"}.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="player1">{need === 1 ? "Nombre" : "Jugador 1"}</Label>
        <Input id="player1" name="player1" required maxLength={80} placeholder="Nombre" />
      </div>

      {need >= 2 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="player2">Jugador 2</Label>
          <Input id="player2" name="player2" required maxLength={80} placeholder="Nombre" />
        </div>
      )}

      {need >= 3 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="player3">Jugador 3</Label>
          <Input id="player3" name="player3" required maxLength={80} placeholder="Nombre" />
        </div>
      )}

      {state?.ok === false && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok === true && (
        <p className="text-sm font-semibold text-fiesta-cyan" role="status">
          ¡Apuntado! Ya estás en la lista.
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="font-display tracking-wide"
      >
        {pending ? "Enviando…" : "Apuntarme"}
      </Button>
    </form>
  );
}
