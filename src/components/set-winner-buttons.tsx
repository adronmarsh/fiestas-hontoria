"use client";

import { useTransition } from "react";
import { setMatchWinner } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function SetWinnerButtons({
  matchId,
  entryAId,
  entryBId,
  labelA,
  labelB,
}: {
  matchId: string;
  entryAId: string;
  entryBId: string;
  labelA: string;
  labelB: string;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => start(async () => { await setMatchWinner(matchId, entryAId); })}
      >
        Gana {labelA}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => start(async () => { await setMatchWinner(matchId, entryBId); })}
      >
        Gana {labelB}
      </Button>
    </div>
  );
}
