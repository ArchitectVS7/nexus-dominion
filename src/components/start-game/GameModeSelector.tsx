"use client";

import { useState } from "react";
import { GAME_MODE_PRESETS, type GameMode } from "@/lib/game/constants";

interface GameModeSelectorProps {
  defaultValue?: GameMode;
  name?: string;
  onChange?: (mode: GameMode) => void;
}

export function GameModeSelector({
  defaultValue = "oneshot",
  name = "gameMode",
  onChange,
}: GameModeSelectorProps) {
  const [selected, setSelected] = useState<GameMode>(defaultValue);

  const handleSelect = (mode: GameMode) => {
    setSelected(mode);
    onChange?.(mode);
  };

  return (
    <div className="space-y-3" data-testid="game-mode-selector">
      <label className="block text-sm font-medium text-gray-400">
        Game Mode
      </label>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(GAME_MODE_PRESETS) as [GameMode, typeof GAME_MODE_PRESETS.oneshot][]).map(
          ([mode, preset]) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleSelect(mode)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selected === mode
                  ? "border-lcars-amber bg-lcars-amber/10 ring-1 ring-lcars-amber/30"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
              data-testid={`game-mode-${mode}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-lg text-lcars-blue uppercase tracking-wider">
                  {preset.label}
                </span>
                {selected === mode && (
                  <span className="text-lcars-amber text-sm">Selected</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <span className="text-gray-500">Empires:</span>{" "}
                  <span className="text-gray-300">
                    {preset.minBots}-{preset.maxBots}
                  </span>
                </div>
                <div className="bg-gray-900/50 rounded px-2 py-1">
                  <span className="text-gray-500">Turns:</span>{" "}
                  <span className="text-gray-300">
                    {preset.minTurns}-{preset.maxTurns}
                  </span>
                </div>
              </div>
            </button>
          )
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {selected === "oneshot"
          ? "Oneshots are single-session games. Perfect for a quick game."
          : "Campaigns span multiple sessions. Your progress is saved automatically."}
      </p>
    </div>
  );
}

export default GameModeSelector;
