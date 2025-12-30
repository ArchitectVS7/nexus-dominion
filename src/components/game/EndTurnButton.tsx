"use client";

/**
 * End Turn Button Component
 *
 * Client-side component that handles turn processing.
 * Shows loading state during processing and displays turn summary after.
 */

import { useState, useTransition, useRef } from "react";
import { endTurnAction } from "@/app/actions/turn-actions";
import { TurnSummary } from "./TurnSummary";
import type { TurnEvent } from "@/lib/game/types/turn-types";

interface EndTurnButtonProps {
  disabled?: boolean;
  onTurnComplete?: (turn: number, events: TurnEvent[]) => void;
}

export function EndTurnButton({ disabled, onTurnComplete }: EndTurnButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{
    turn: number;
    processingMs: number;
    events: TurnEvent[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  const handleEndTurn = () => {
    // Debounce: prevent double-clicks before isPending updates
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setError(null);
    startTransition(async () => {
      try {
        const result = await endTurnAction();

        if (result.success) {
          setLastResult(result.data);
          setError(null);
          onTurnComplete?.(result.data.turn, result.data.events);
        } else {
          setError(result.error);
          setLastResult(null);
        }
      } finally {
        isProcessingRef.current = false;
      }
    });
  };

  const handleDismissSummary = () => {
    setLastResult(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleEndTurn}
        disabled={disabled || isPending}
        className={`lcars-button text-lg px-12 py-3 transition-all ${
          isPending ? "opacity-50 cursor-wait animate-pulse" : ""
        }`}
        data-testid="end-turn-button"
        aria-label={isPending ? "Processing turn, please wait" : "End current turn"}
        aria-busy={isPending}
      >
        {isPending ? "PROCESSING..." : "END TURN"}
      </button>

      {/* Error display */}
      {error && (
        <div
          className="mt-2 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-400 text-sm"
          data-testid="end-turn-error"
        >
          {error}
        </div>
      )}

      {/* Turn Summary */}
      {lastResult && !error && (
        <TurnSummary
          turn={lastResult.turn}
          processingMs={lastResult.processingMs}
          events={lastResult.events}
          onDismiss={handleDismissSummary}
        />
      )}
    </div>
  );
}
