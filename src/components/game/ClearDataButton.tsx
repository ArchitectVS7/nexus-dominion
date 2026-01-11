"use client";

/**
 * Clear Data Button
 *
 * Button to clear all game data and start fresh.
 * Currently uses endGameAction to end the current game.
 */

import { useState } from "react";
import { endGameAction } from "@/app/actions/game-actions";

interface ClearDataButtonProps {
  className?: string;
}

export function ClearDataButton({ className }: ClearDataButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsClearing(true);
    try {
      await endGameAction();
      // Reload page to show fresh state
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear data:", error);
      setIsClearing(false);
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  return (
    <div className={className}>
      {isConfirming ? (
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-sm">Delete all data?</span>
          <button
            onClick={handleClear}
            disabled={isClearing}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Confirm"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isClearing}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleClear}
          className="text-gray-500 hover:text-red-400 text-sm transition-colors"
        >
          Clear All Data
        </button>
      )}
    </div>
  );
}

export default ClearDataButton;
