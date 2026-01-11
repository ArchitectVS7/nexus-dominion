"use client";

/**
 * End Turn Button Component
 *
 * Primary button for advancing the game turn.
 * Shows loading state during turn processing.
 */

interface EndTurnButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  currentTurn?: number;
}

export function EndTurnButton({
  onClick,
  isProcessing,
  currentTurn,
}: EndTurnButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className={`
        px-6 py-2 rounded font-semibold transition-all
        ${
          isProcessing
            ? "bg-lcars-amber/30 text-lcars-amber/50 cursor-wait"
            : "bg-lcars-amber hover:bg-lcars-gold text-gray-900"
        }
      `}
      data-testid="end-turn-button"
    >
      {isProcessing ? (
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        <span>End Turn {currentTurn !== undefined && `(${currentTurn})`}</span>
      )}
    </button>
  );
}

export default EndTurnButton;
