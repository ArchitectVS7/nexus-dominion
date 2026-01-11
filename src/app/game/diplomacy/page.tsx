"use client";

/**
 * Diplomacy Page
 *
 * Displays diplomatic relations, treaties, and reputation.
 * Uses React Query for data fetching and Zustand for panel state.
 */

import { useStarmapData, useTurnStatus } from "@/lib/api";
import { usePanelStore } from "@/stores";
import { isFeatureUnlocked, getUnlockDefinition } from "@/lib/constants/unlocks";

export default function DiplomacyPage() {
  const { panelContext } = usePanelStore();
  const { data: turnStatus } = useTurnStatus();
  const { data, isLoading, error } = useStarmapData();
  const targetEmpireId = panelContext?.targetEmpireId;

  const currentTurn = turnStatus?.currentTurn ?? 1;
  const isDiplomacyUnlocked = isFeatureUnlocked("diplomacy_basics", currentTurn);
  const unlockDef = getUnlockDefinition("diplomacy_basics");

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="diplomacy-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Diplomacy</h1>
        <div className="lcars-panel animate-pulse">
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  // Show locked state if diplomacy isn't unlocked yet
  if (!isDiplomacyUnlocked) {
    const turnsRemaining = unlockDef.unlockTurn - currentTurn;
    return (
      <div className="max-w-6xl mx-auto" data-testid="diplomacy-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Diplomacy</h1>
        <div className="lcars-panel text-center py-12" data-testid="diplomacy-locked">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4 opacity-60">🔒</div>
            <h2 className="text-xl font-display text-lcars-amber mb-3">
              Diplomatic Channels Closed
            </h2>
            <p className="text-gray-400 mb-4">
              The Galactic Council has not yet established diplomatic protocols for
              your empire. Focus on building your power base.
            </p>
            <div className="text-sm text-gray-500 mb-2">
              Diplomacy opens at{" "}
              <span className="text-lcars-lavender font-mono">
                Turn {unlockDef.unlockTurn}
              </span>
            </div>
            <div className="text-lcars-blue">
              {turnsRemaining} turn{turnsRemaining !== 1 ? "s" : ""} remaining
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="diplomacy-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Diplomacy</h1>
        <div className="lcars-panel">
          <p className="text-red-400">Failed to load diplomacy data</p>
        </div>
      </div>
    );
  }

  const otherEmpires = data.empires.filter(
    (e) => e.id !== data.playerEmpireId && !e.isEliminated
  );
  const selectedEmpire = otherEmpires.find((e) => e.id === targetEmpireId);

  // Group empires by treaty status
  const allies = otherEmpires.filter((e) =>
    data.treaties.some(
      (t) =>
        t.type === "alliance" &&
        ((t.empire1Id === data.playerEmpireId && t.empire2Id === e.id) ||
          (t.empire2Id === data.playerEmpireId && t.empire1Id === e.id))
    )
  );
  const napPartners = otherEmpires.filter((e) =>
    data.treaties.some(
      (t) =>
        t.type === "nap" &&
        ((t.empire1Id === data.playerEmpireId && t.empire2Id === e.id) ||
          (t.empire2Id === data.playerEmpireId && t.empire1Id === e.id))
    )
  );

  return (
    <div className="max-w-6xl mx-auto" data-testid="diplomacy-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Diplomacy</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Treaties */}
        <div className="space-y-6">
          {/* Alliances */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Alliances ({allies.length})
            </h2>
            {allies.length > 0 ? (
              <div className="space-y-2">
                {allies.map((empire) => (
                  <EmpireCard key={empire.id} empire={empire} type="alliance" />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No active alliances</p>
            )}
          </div>

          {/* NAPs */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Non-Aggression Pacts ({napPartners.length})
            </h2>
            {napPartners.length > 0 ? (
              <div className="space-y-2">
                {napPartners.map((empire) => (
                  <EmpireCard key={empire.id} empire={empire} type="nap" />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No active NAPs</p>
            )}
          </div>
        </div>

        {/* Diplomatic Actions */}
        <div className="space-y-6">
          {/* Selected Empire */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Diplomatic Actions
            </h2>
            {selectedEmpire ? (
              <div>
                <div className="p-4 bg-gray-800/50 rounded mb-4">
                  <div className="text-lcars-amber font-semibold">
                    {selectedEmpire.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    NW: {selectedEmpire.networth.toLocaleString()} | Sectors:{" "}
                    {selectedEmpire.sectorCount}
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="w-full p-3 bg-green-900/30 hover:bg-green-800/50 border border-green-700 rounded text-green-400">
                    Propose Alliance
                  </button>
                  <button className="w-full p-3 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-700 rounded text-blue-400">
                    Propose NAP
                  </button>
                  <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
                    Send Message
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  Diplomatic actions will be implemented in Phase 3
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                Select an empire from the starmap for diplomatic actions
              </p>
            )}
          </div>

          {/* Reputation */}
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Your Reputation
            </h2>
            <div className="p-4 bg-gray-800/50 rounded">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Galactic Standing</span>
                <span className="text-lcars-amber font-semibold">Neutral</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Reputation affects AI behavior and treaty success rates
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diplomacy Info */}
      <div className="mt-6 lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Diplomacy System
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <span className="text-green-400">Alliances</span> provide shared intel
            and mutual defense agreements.
          </p>
          <p>
            <span className="text-blue-400">NAPs</span> (Non-Aggression Pacts)
            prevent attacks between signatories.
          </p>
          <p>Breaking treaties damages your reputation and may trigger retaliation.</p>
        </div>
      </div>
    </div>
  );
}

function EmpireCard({
  empire,
  type,
}: {
  empire: { id: string; name: string; networth: number; sectorCount: number };
  type: "alliance" | "nap";
}) {
  return (
    <div
      className={`p-3 rounded border ${
        type === "alliance"
          ? "bg-green-900/20 border-green-700/50"
          : "bg-blue-900/20 border-blue-700/50"
      }`}
    >
      <div className="font-medium">{empire.name}</div>
      <div className="text-xs text-gray-400">
        NW: {empire.networth.toLocaleString()} | Sectors: {empire.sectorCount}
      </div>
    </div>
  );
}
