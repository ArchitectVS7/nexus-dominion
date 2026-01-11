"use client";

/**
 * Turn Summary Modal
 *
 * Displays results after a turn is processed.
 * Shows resource changes, events, and key metrics.
 */

import type { TurnResult } from "@/stores";
import type { TurnEvent } from "@/lib/game/types/turn-types";

interface TurnSummaryModalProps {
  result: TurnResult;
  onClose: () => void;
}

/**
 * Format resource delta with +/- sign
 */
function formatDelta(value: number | undefined): string {
  if (value === undefined) return "0";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString()}`;
}

/**
 * Get event severity color
 */
function getEventColor(severity: TurnEvent["severity"]): string {
  switch (severity) {
    case "error":
      return "text-red-400";
    case "warning":
      return "text-yellow-400";
    default:
      return "text-gray-300";
  }
}

export function TurnSummaryModal({ result, onClose }: TurnSummaryModalProps) {
  const { turn, processingMs, events, resourceDeltas } = result;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-lcars-amber/30 rounded-lg w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-lcars-amber/10 px-6 py-4 border-b border-lcars-amber/30">
          <h2 className="text-xl font-display text-lcars-amber">
            Turn {turn} Complete
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Processed in {processingMs}ms
          </p>
        </div>

        {/* Resource Changes */}
        {resourceDeltas && (
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
              Resource Changes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Credits</span>
                <span
                  className={
                    resourceDeltas.credits >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {formatDelta(resourceDeltas.credits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Food</span>
                <span
                  className={
                    resourceDeltas.food >= 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  {formatDelta(resourceDeltas.food)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ore</span>
                <span
                  className={
                    resourceDeltas.ore >= 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  {formatDelta(resourceDeltas.ore)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Petroleum</span>
                <span
                  className={
                    resourceDeltas.petroleum >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {formatDelta(resourceDeltas.petroleum)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {events.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-800 max-h-48 overflow-y-auto">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
              Events ({events.length})
            </h3>
            <ul className="space-y-2">
              {events.slice(0, 5).map((event, i) => (
                <li key={i} className={`text-sm ${getEventColor(event.severity)}`}>
                  {event.message}
                </li>
              ))}
              {events.length > 5 && (
                <li className="text-sm text-gray-500">
                  +{events.length - 5} more events...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-lcars-amber/20 hover:bg-lcars-amber/30 border border-lcars-amber/50 rounded text-lcars-amber transition-colors"
            data-testid="turn-summary-close"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default TurnSummaryModal;
