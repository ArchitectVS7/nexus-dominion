"use client";

/**
 * Turn Phase Indicator
 *
 * Crystal-clear visual guide showing:
 * - What turn you're on
 * - What phase of your turn you're in
 * - What actions are available
 * - How to advance to the next turn
 *
 * Solves the "what do I do now?" problem with bold, obvious visual hierarchy.
 */

import { PlayCircle, CheckCircle2, Circle, Shield } from "lucide-react";
import { ActionIcons } from "@/lib/theme/icons";

interface TurnPhaseIndicatorProps {
  currentTurn: number;
  turnLimit: number;
  protectionTurnsLeft?: number;
  onEndTurn?: () => void;
  isProcessing?: boolean;
}

// Define the phases of a player's turn
const TURN_PHASES = [
  {
    id: "review",
    label: "Review Status",
    description: "Check resources, messages, threats",
    icon: ActionIcons.dashboard,
    optional: true,
  },
  {
    id: "plan",
    label: "Plan Actions",
    description: "Build units, buy sectors, research",
    icon: ActionIcons.military,
    optional: false,
  },
  {
    id: "execute",
    label: "Execute",
    description: "Attack, trade, spy, diplomacy",
    icon: ActionIcons.combat,
    optional: true,
  },
  {
    id: "endTurn",
    label: "End Turn",
    description: "Process turn and see results",
    icon: ActionIcons.endTurn,
    optional: false,
  },
] as const;

export function TurnPhaseIndicator({
  currentTurn,
  turnLimit,
  protectionTurnsLeft,
  onEndTurn,
  isProcessing = false,
}: TurnPhaseIndicatorProps) {
  // Calculate turn progress
  const turnProgress = Math.min(100, (currentTurn / turnLimit) * 100);
  const isEndgame = currentTurn >= 180;
  const isFinalStretch = currentTurn >= turnLimit - 20;
  const isProtected = protectionTurnsLeft && protectionTurnsLeft > 0;

  // Determine turn color
  const getTurnColor = () => {
    if (isFinalStretch) return "text-red-400";
    if (isEndgame) return "text-lcars-salmon";
    return "text-lcars-amber";
  };

  return (
    <div className="bg-gray-900 border border-lcars-amber/30 rounded-lg overflow-hidden">
      {/* Turn Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Current Turn
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-display font-bold ${getTurnColor()}`}>
                {currentTurn}
              </span>
              <span className="text-gray-500 text-sm">of {turnLimit}</span>
            </div>
          </div>

          {/* Protection Badge */}
          {isProtected && (
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs flex items-center gap-1">
              <Shield className="w-3 h-3" /> Protected ({protectionTurnsLeft} turns left)
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isFinalStretch
                ? "bg-red-400"
                : isEndgame
                ? "bg-lcars-salmon"
                : "bg-lcars-amber"
            }`}
            style={{ width: `${turnProgress}%` }}
          />
        </div>
      </div>

      {/* Phase Checklist */}
      <div className="p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Your Turn Phases
        </div>
        <div className="space-y-2">
          {TURN_PHASES.map((phase, index) => {
            const IconComponent = phase.icon;
            const isLastPhase = index === TURN_PHASES.length - 1;

            return (
              <div
                key={phase.id}
                className={`flex items-start gap-3 p-2 rounded transition-colors ${
                  isLastPhase
                    ? "bg-lcars-amber/10 border border-lcars-amber/30"
                    : "hover:bg-gray-800/50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 ${
                    isLastPhase ? "text-lcars-amber" : "text-gray-400"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isLastPhase ? "text-lcars-amber" : "text-gray-300"
                      }`}
                    >
                      {phase.label}
                    </span>
                    {phase.optional && (
                      <span className="text-xs text-gray-500">(optional)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
                </div>

                {/* Status Indicator */}
                <div className="mt-0.5">
                  {isLastPhase ? (
                    <Circle className="w-4 h-4 text-lcars-amber" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-400/50" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* End Turn Button */}
        <button
          onClick={onEndTurn}
          disabled={isProcessing}
          className={`w-full mt-4 py-3 rounded-lg font-display text-base flex items-center justify-center gap-2 transition-all ${
            isProcessing
              ? "bg-gray-700 text-gray-400 cursor-wait animate-pulse"
              : "bg-lcars-amber text-gray-900 hover:bg-lcars-amber/90 hover:scale-[1.01] shadow-lg hover:shadow-lcars-amber/20"
          }`}
        >
          <PlayCircle className="w-5 h-5" />
          <span>{isProcessing ? "PROCESSING TURN..." : "END TURN & CONTINUE"}</span>
        </button>

        {/* Helper Text */}
        <p className="text-xs text-center text-gray-500 mt-2">
          Click to process all empire actions and advance to Turn {currentTurn + 1}
        </p>
      </div>
    </div>
  );
}
