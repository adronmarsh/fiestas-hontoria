"use client";

import { useActionState } from "react";
import { loginAdmin, type ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    loginAdmin,
    null
  );

  return (
    <form action={action} className="mx-auto flex w-full max-w-sm flex-col gap-4 border-4 border-fiesta-ink bg-white p-6">
      <h1 className="font-display text-2xl tracking-wide">Admin</h1>
      <p className="text-sm text-muted-foreground">
        Acceso con contraseña para gestionar campeonatos.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {state?.ok === false && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="font-display tracking-wide">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
