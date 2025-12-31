"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWormholeConstructionDataAction,
  startWormholeConstructionAction,
  type WormholeConstructionData,
} from "@/app/actions/wormhole-construction-actions";

// =============================================================================
// TYPES
// =============================================================================

interface WormholeConstructionPanelProps {
  refreshTrigger?: number;
  onConstructionStarted?: () => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SlotStatus({
  usedSlots,
  maxSlots,
  researchLevel,
  nextSlotResearch,
}: {
  usedSlots: number;
  maxSlots: number;
  researchLevel: number;
  nextSlotResearch: number | null;
}) {
  const availableSlots = maxSlots - usedSlots;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div>
        <span className="text-sm text-gray-400">Wormhole Slots</span>
        <div className="text-lg font-mono">
          <span className={availableSlots > 0 ? "text-lcars-green" : "text-lcars-orange"}>
            {availableSlots}
          </span>
          <span className="text-gray-500">/{maxSlots}</span>
        </div>
      </div>
      {nextSlotResearch && researchLevel < nextSlotResearch && (
        <div className="text-xs text-gray-500 text-right">
          +1 slot at
          <br />
          Research Level {nextSlotResearch}
        </div>
      )}
    </div>
  );
}

function ConstructionProgress({
  project,
  currentTurn,
}: {
  project: WormholeConstructionData["projects"][0];
  currentTurn: number;
}) {
  const turnsRemaining = project.completionTurn - currentTurn;
  const totalTurns = project.completionTurn - project.startTurn;
  const progress = Math.max(0, Math.min(100, ((totalTurns - turnsRemaining) / totalTurns) * 100));

  return (
    <div className="p-3 bg-gray-800/30 rounded-lg border border-lcars-purple/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-lcars-lavender">
          {project.fromRegionName} → {project.toRegionName}
        </span>
        <span className="text-xs text-gray-400">
          {turnsRemaining > 0 ? `${turnsRemaining} turns left` : "Completing..."}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-lcars-purple transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function DestinationCard({
  destination,
  onConstruct,
  isConstructing,
}: {
  destination: WormholeConstructionData["destinations"][0];
  onConstruct: (regionId: string) => void;
  isConstructing: boolean;
}) {
  const regionTypeColors: Record<string, string> = {
    core: "text-yellow-400",
    inner: "text-orange-400",
    outer: "text-blue-400",
    rim: "text-purple-400",
    void: "text-gray-400",
  };

  return (
    <div className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium text-gray-200">{destination.regionName}</div>
          <div
            className={`text-xs ${regionTypeColors[destination.regionType] ?? "text-gray-400"}`}
          >
            {destination.regionType.charAt(0).toUpperCase() + destination.regionType.slice(1)} Region
          </div>
        </div>
        <button
          onClick={() => onConstruct(destination.regionId)}
          disabled={!destination.canAfford || isConstructing}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            destination.canAfford && !isConstructing
              ? "bg-lcars-purple hover:bg-lcars-purple/80 text-white"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isConstructing ? "..." : "BUILD"}
        </button>
      </div>
      <div className="flex gap-4 text-xs text-gray-400">
        <span>
          <span className="text-lcars-gold">{destination.cost.credits.toLocaleString()}</span> cr
        </span>
        <span>
          <span className="text-lcars-orange">{destination.cost.petroleum}</span> petro
        </span>
        <span>
          <span className="text-lcars-lavender">{destination.buildTime}</span> turns
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WormholeConstructionPanel({
  refreshTrigger,
  onConstructionStarted,
}: WormholeConstructionPanelProps) {
  const [data, setData] = useState<WormholeConstructionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [constructing, setConstructing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await getWormholeConstructionDataAction();
      if (result) {
        setData(result);
        setError(null);
      } else {
        setError("Failed to load wormhole data");
      }
    } catch (err) {
      setError("Failed to load wormhole data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleConstruct = async (destinationRegionId: string) => {
    setConstructing(true);
    try {
      const result = await startWormholeConstructionAction(destinationRegionId);
      if (result.success) {
        await loadData();
        onConstructionStarted?.();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Construction failed");
      console.error(err);
    } finally {
      setConstructing(false);
    }
  };

  if (loading) {
    return (
      <div className="lcars-panel" data-testid="wormhole-construction-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Wormhole Construction
        </h2>
        <div className="text-gray-400 text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="lcars-panel" data-testid="wormhole-construction-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Wormhole Construction
        </h2>
        <div className="text-red-400 text-center py-8">
          {error ?? "Failed to load data"}
        </div>
      </div>
    );
  }

  const availableSlots = data.slotInfo.availableSlots;

  return (
    <div className="lcars-panel" data-testid="wormhole-construction-panel">
      <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
        Wormhole Construction
      </h2>

      {error && (
        <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Slot Status */}
      <SlotStatus
        usedSlots={data.slotInfo.usedSlots}
        maxSlots={data.slotInfo.maxSlots}
        researchLevel={data.researchLevel}
        nextSlotResearch={data.slotInfo.maxSlots < 3 ? 6 : null}
      />

      {/* Current Construction Projects */}
      {data.projects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">In Progress</h3>
          <div className="space-y-2">
            {data.projects.map((project) => (
              <ConstructionProgress
                key={project.id}
                project={project}
                currentTurn={data.currentTurn}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Destinations */}
      {availableSlots > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Build New Wormhole
          </h3>
          <div className="text-xs text-gray-500 mb-2">
            Credits: {data.playerCredits.toLocaleString()} | Petroleum:{" "}
            {data.playerPetroleum}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.destinations.length > 0 ? (
              data.destinations.map((dest) => (
                <DestinationCard
                  key={dest.regionId}
                  destination={dest}
                  onConstruct={handleConstruct}
                  isConstructing={constructing}
                />
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No destinations available
              </div>
            )}
          </div>
        </div>
      )}

      {availableSlots === 0 && data.projects.length === 0 && (
        <div className="mt-4 text-gray-500 text-center py-4">
          No wormhole slots available.
          {data.researchLevel < 6 && (
            <div className="text-xs mt-1">
              Reach Research Level 6 for an additional slot.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WormholeConstructionPanel;
