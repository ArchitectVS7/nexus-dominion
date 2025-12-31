"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getCraftingQueueAction,
  cancelCraftingOrderAction,
  type QueueItemDisplay,
} from "@/app/actions/crafting-actions";

interface CraftingQueueProps {
  refreshTrigger?: number;
  onQueueUpdated?: () => void;
}

const TIER_COLORS = {
  1: "text-green-400",
  2: "text-cyan-400",
  3: "text-purple-400",
} as const;

export function CraftingQueue({ refreshTrigger, onQueueUpdated }: CraftingQueueProps) {
  const [queue, setQueue] = useState<{
    items: QueueItemDisplay[];
    currentlyBuilding: QueueItemDisplay | null;
    totalTurnsRemaining: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadQueue = async () => {
      setIsLoading(true);
      try {
        const data = await getCraftingQueueAction();
        if (!cancelled) {
          setQueue(data);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    loadQueue();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const handleCancel = (itemId: string) => {
    setError(null);

    // Handle async separately from startTransition
    const doCancel = async () => {
      const result = await cancelCraftingOrderAction(itemId);
      if (result.success) {
        // Refresh queue
        const data = await getCraftingQueueAction();
        startTransition(() => {
          setQueue(data);
          onQueueUpdated?.();
        });
      } else {
        startTransition(() => {
          setError(result.error || "Failed to cancel order");
        });
      }
    };

    doCancel();
  };

  if (isLoading) {
    return <div className="text-gray-400 text-sm">Loading queue...</div>;
  }

  if (!queue || queue.items.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-gray-800/50 border border-gray-700 rounded p-3 text-xs text-gray-400">
          <p className="mb-2">🏭 Your crafting queue is empty.</p>
          <p>Visit the <span className="text-lcars-purple font-semibold">Craft</span> tab to select recipes and queue production. Items will complete over multiple turns.</p>
        </div>
        <div className="text-gray-500 text-sm p-3 bg-black/30 rounded border border-gray-700/50 text-center italic">
          No items in crafting queue
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Help text */}
      <div className="bg-gray-800/50 border border-gray-700 rounded p-2 md:p-3 text-xs text-gray-400">
        <p>🏭 Items build sequentially. The first item shows a progress bar. Cancel queued items anytime to refund resources.</p>
      </div>

      {error && (
        <div className="p-2 bg-red-900/50 border border-red-500 text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs md:text-sm p-2 md:p-3 bg-black/30 rounded">
        <span className="text-gray-400 font-semibold">
          📋 {queue.items.length} item{queue.items.length !== 1 ? "s" : ""} in queue
        </span>
        <span className="text-lcars-amber font-mono">
          ⏱ {queue.totalTurnsRemaining} turn{queue.totalTurnsRemaining !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Currently building */}
      {queue.currentlyBuilding && (
        <div className="p-3 md:p-4 bg-lcars-amber/10 border border-lcars-amber/30 rounded">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
            <span className="text-lcars-amber font-semibold text-sm md:text-base">🔧 Currently Building</span>
            <span className="text-xs px-2 py-0.5 rounded bg-lcars-amber text-black font-mono self-start sm:self-auto">
              {queue.currentlyBuilding.turnsRemaining} turn{queue.currentlyBuilding.turnsRemaining !== 1 ? "s" : ""} left
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <span className={`${TIER_COLORS[queue.currentlyBuilding.tier]} font-semibold text-sm md:text-base`}>
              {queue.currentlyBuilding.quantity}x {queue.currentlyBuilding.label}
            </span>
            <span className="text-xs text-gray-400">
              Tier {queue.currentlyBuilding.tier}
            </span>
          </div>
          {/* Progress indicator */}
          <div className="mt-3">
            <div className="h-2 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-lcars-amber transition-all duration-300"
                style={{
                  width: `${Math.max(0, 100 - (queue.currentlyBuilding.turnsRemaining / (queue.currentlyBuilding.completionTurn - queue.currentlyBuilding.startTurn)) * 100)}%`,
                }}
                title={`${Math.round(Math.max(0, 100 - (queue.currentlyBuilding.turnsRemaining / (queue.currentlyBuilding.completionTurn - queue.currentlyBuilding.startTurn)) * 100))}% complete`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Queued items */}
      <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
        {queue.items
          .filter((item) => item.status === "queued")
          .map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 md:p-3 bg-black/30 rounded border border-gray-700/50"
            >
              <div className="flex items-start sm:items-center gap-2 flex-1">
                <span className="text-xs text-gray-500 font-mono w-6 flex-shrink-0">#{index + 2}</span>
                <div className="flex-1">
                  <div className={`${TIER_COLORS[item.tier]} text-sm md:text-base font-medium`}>
                    {item.quantity}x {item.label}
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                    <span>⏱ {item.turnsRemaining} turn{item.turnsRemaining !== 1 ? "s" : ""}</span>
                    <span>•</span>
                    <span>Complete turn {item.completionTurn}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCancel(item.id)}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-300 hover:underline disabled:opacity-50 self-start sm:self-auto"
                title="Cancel this item and refund resources"
              >
                Cancel
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
