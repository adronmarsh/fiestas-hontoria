"use client";

import { useActionState, useState } from "react";
import { createChampionship, type ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateChampionshipForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createChampionship,
    null
  );
  const [pairingMode, setPairingMode] = useState("as_registered");

  return (
    <form action={action} className="flex flex-col gap-3 border-2 border-fiesta-ink bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <Label htmlFor="name">Nuevo campeonato</Label>
          <Input id="name" name="name" required placeholder="Ej. Bolos" />
        </div>
        <div className="flex min-w-[160px] flex-1 flex-col gap-2">
          <Label htmlFor="organizer">Organizador</Label>
          <Input
            id="organizer"
            name="organizer"
            placeholder="Ej. Pepe García (opcional)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="entryType">Modalidad</Label>
          <select
            id="entryType"
            name="entryType"
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-60"
            defaultValue="individual"
            disabled={pairingMode === "random_pairs"}
          >
            <option value="individual">Individual</option>
            <option value="pareja">Parejas</option>
            <option value="trio">Tríos</option>
          </select>
          {pairingMode === "random_pairs" && (
            <input type="hidden" name="entryType" value="individual" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pairingMode">Cuadro</Label>
          <select
            id="pairingMode"
            name="pairingMode"
            className="h-9 max-w-[220px] rounded-md border border-input bg-transparent px-3 text-sm"
            value={pairingMode}
            onChange={(e) => setPairingMode(e.target.value)}
          >
            <option value="as_registered">Según inscripción</option>
            <option value="random_pairs">Parejas aleatorias</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex w-20 flex-col gap-2">
            <Label htmlFor="startDay">Del</Label>
            <Input
              id="startDay"
              name="startDay"
              type="number"
              min={1}
              max={31}
              placeholder="10"
            />
          </div>
          <div className="flex w-20 flex-col gap-2">
            <Label htmlFor="endDay">Al</Label>
            <Input
              id="endDay"
              name="endDay"
              type="number"
              min={1}
              max={31}
              placeholder="13"
            />
          </div>
          <div className="flex w-24 flex-col gap-2">
            <Label htmlFor="startTime">Hora</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              placeholder="18:30"
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        «Parejas aleatorias»: se apuntan uno a uno; al generar el cuadro se forman parejas al azar
        (si hay impar, uno se queda sin pareja). Los días son de agosto (opcional).
      </p>
      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.ok === true && (
        <p className="text-sm text-fiesta-cyan">{state.message}</p>
      )}
    </form>
  );
}
