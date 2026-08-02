"use client";

import { useActionState } from "react";
import { createChampionship, type ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateChampionshipForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createChampionship,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-3 border-2 border-fiesta-ink bg-white p-4 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="name">Nuevo campeonato</Label>
        <Input id="name" name="name" required placeholder="Ej. Bolos" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="entryType">Modalidad</Label>
        <select
          id="entryType"
          name="entryType"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          defaultValue="individual"
        >
          <option value="individual">Individual</option>
          <option value="pareja">Parejas</option>
          <option value="trio">Tríos</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear"}
      </Button>
      {state?.ok === false && (
        <p className="basis-full text-sm text-destructive">{state.error}</p>
      )}
      {state?.ok === true && (
        <p className="basis-full text-sm text-fiesta-cyan">{state.message}</p>
      )}
    </form>
  );
}
