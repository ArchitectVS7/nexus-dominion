"use client";

import type { EmpireMapData } from "./types";

interface EmpireTooltipProps {
  empire: EmpireMapData;
  isProtected: boolean;
  x: number;
  y: number;
}

export function EmpireTooltip({ empire, isProtected, x, y }: EmpireTooltipProps) {
  return (
    <div
      className="absolute pointer-events-none z-50 bg-gray-900/95 border border-lcars-amber/30 rounded-lg p-3 shadow-lg min-w-[180px]"
      style={{
        left: x + 15,
        top: y - 10,
        transform: "translateY(-50%)",
      }}
    >
      <div className="space-y-2">
        <div className="font-semibold text-lcars-amber">{empire.name}</div>
        <div className="text-xs space-y-1 text-gray-300">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className={empire.type === "player" ? "text-blue-400" : "text-red-400"}>
              {empire.type === "player" ? "You" : "Bot"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Planets:</span>
            <span className="font-mono">{empire.planetCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Networth:</span>
            <span className="font-mono text-lcars-amber">
              {empire.networth.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={empire.isEliminated ? "text-gray-500" : "text-green-400"}>
              {empire.isEliminated ? "Eliminated" : "Active"}
            </span>
          </div>
          {isProtected && !empire.isEliminated && empire.type === "bot" && (
            <div className="text-yellow-400 text-center mt-2 border-t border-gray-700 pt-2">
              Protected (cannot attack)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
