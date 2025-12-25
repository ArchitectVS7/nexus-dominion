"use client";

import { useState } from "react";
import type { Difficulty } from "@/lib/bots/types";

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
  color: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: "easy",
    label: "Easy",
    description: "Bots make suboptimal choices (50% chance)",
    color: "text-green-400",
  },
  {
    value: "normal",
    label: "Normal",
    description: "Balanced bot intelligence",
    color: "text-lcars-amber",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Bots target weakest enemies",
    color: "text-orange-400",
  },
  {
    value: "nightmare",
    label: "Nightmare",
    description: "Bots get +25% resources and target weakest",
    color: "text-red-400",
  },
];

interface DifficultySelectorProps {
  defaultValue?: Difficulty;
  name?: string;
}

export function DifficultySelector({
  defaultValue = "normal",
  name = "difficulty",
}: DifficultySelectorProps) {
  const [selected, setSelected] = useState<Difficulty>(defaultValue);

  return (
    <div className="space-y-3" data-testid="difficulty-selector">
      <label className="block text-sm font-medium text-gray-400">
        Difficulty
      </label>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-2 gap-2">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            className={`p-3 rounded border transition-all text-left ${
              selected === option.value
                ? "border-lcars-amber bg-lcars-amber/10"
                : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
            }`}
            data-testid={`difficulty-${option.value}`}
          >
            <div className={`font-semibold ${option.color}`}>{option.label}</div>
            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DifficultySelector;
