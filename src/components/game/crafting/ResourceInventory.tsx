"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock } from "lucide-react";
import {
  getResourceInventoryAction,
  type InventoryItem,
} from "@/app/actions/crafting-actions";

interface ResourceInventoryProps {
  refreshTrigger?: number;
  compact?: boolean;
}

const TIER_COLORS = {
  1: "text-green-400",
  2: "text-cyan-400",
  3: "text-purple-400",
} as const;

const TIER_LABELS = {
  1: "Tier 1: Refined",
  2: "Tier 2: Components",
  3: "Tier 3: Advanced",
} as const;

const TIER_BG_COLORS = {
  1: "bg-green-900/20 border-green-700/50",
  2: "bg-cyan-900/20 border-cyan-700/50",
  3: "bg-purple-900/20 border-purple-700/50",
} as const;

export function ResourceInventory({ refreshTrigger, compact = false }: ResourceInventoryProps) {
  const [inventory, setInventory] = useState<{
    items: InventoryItem[];
    byTier: Record<1 | 2 | 3, InventoryItem[]>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([1, 2]));

  useEffect(() => {
    let cancelled = false;
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        const data = await getResourceInventoryAction();
        if (!cancelled) {
          setInventory(data);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    loadInventory();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const toggleTier = useCallback((tier: number) => {
    setExpandedTiers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tier)) {
        newSet.delete(tier);
      } else {
        newSet.add(tier);
      }
      return newSet;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="text-gray-400 text-sm">Loading inventory...</div>
    );
  }

  if (!inventory) {
    return (
      <div className="text-gray-500 text-sm">No crafted resources yet</div>
    );
  }

  const totalItems = inventory.items.filter((i) => i.quantity > 0).length;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-gray-400 mb-2 font-semibold">
          📦 {totalItems} resource type{totalItems !== 1 ? "s" : ""} in inventory
        </div>
        {([1, 2, 3] as const).map((tier) => {
          const tierItems = inventory.byTier[tier].filter((i) => i.quantity > 0);
          if (tierItems.length === 0) return null;
          return (
            <div key={tier} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
              <span className={`${TIER_COLORS[tier]} font-mono font-semibold whitespace-nowrap`}>T{tier}:</span>
              <span className="text-gray-300 break-words">
                {tierItems.map((i) => `${i.label} (${i.quantity})`).join(", ")}
              </span>
            </div>
          );
        })}
        {totalItems === 0 && (
          <div className="text-xs text-gray-500 italic">
            No crafted components yet. Start crafting to build your inventory!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Help text */}
      <div className="bg-gray-800/50 border border-gray-700 rounded p-2 md:p-3 text-xs text-gray-400">
        <p>📦 Components stored here are used when building advanced units. Higher tiers are required for more powerful ships and weapons.</p>
      </div>

      {([1, 2, 3] as const).map((tier) => {
        const tierItems = inventory.byTier[tier];
        const nonZeroItems = tierItems.filter((i) => i.quantity > 0);
        const isExpanded = expandedTiers.has(tier);

        return (
          <div
            key={tier}
            className={`border rounded ${TIER_BG_COLORS[tier]}`}
          >
            <button
              onClick={() => toggleTier(tier)}
              className="w-full p-2 md:p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              title={`Click to ${isExpanded ? "collapse" : "expand"} ${TIER_LABELS[tier]}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className={`font-semibold text-sm md:text-base ${TIER_COLORS[tier]}`}>
                  {TIER_LABELS[tier]}
                </span>
                <span className="text-xs text-gray-500">
                  ({nonZeroItems.length} item{nonZeroItems.length !== 1 ? "s" : ""})
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-2 md:px-3 pb-2 space-y-1">
                {tierItems.length === 0 ? (
                  <div className="text-xs text-gray-500 py-1 italic flex items-center gap-1">
                    <Lock className="w-3 h-3" /> No recipes unlocked yet. Increase research level to unlock crafting.
                  </div>
                ) : nonZeroItems.length === 0 ? (
                  <div className="text-xs text-gray-500 py-1 italic">
                    Empty inventory. Visit the Craft tab to queue production.
                  </div>
                ) : (
                  nonZeroItems.map((item) => (
                    <div
                      key={item.resourceType}
                      className="flex justify-between items-center text-xs md:text-sm py-1 px-2 bg-black/30 rounded"
                      title={`${item.quantity.toLocaleString()} ${item.label} in stock`}
                    >
                      <span className="text-gray-300">{item.label}</span>
                      <span className={`font-mono ${TIER_COLORS[tier]}`}>
                        {item.quantity.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
