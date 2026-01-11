"use client";

/**
 * Quick Reference Modal
 *
 * Displays keyboard shortcuts and quick help.
 * Opened with '?' key.
 */

interface QuickReferenceModalProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "Space", description: "End Turn" },
  { key: "?", description: "Toggle Quick Reference" },
  { key: "Esc", description: "Close Panel/Modal" },
  { key: "1-9", description: "Open Panel (by number)" },
];

const TIPS = [
  "Build soldiers early for defense",
  "Keep food production above population needs",
  "Research unlocks powerful upgrades",
  "Trade surplus resources for credits",
  "Form alliances to avoid multi-front wars",
];

export function QuickReferenceModal({ onClose }: QuickReferenceModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-display text-lcars-amber">
            Quick Reference
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Keyboard Shortcuts */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="grid gap-2">
              {SHORTCUTS.map(({ key, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-lcars-amber font-mono">
                    {key}
                  </kbd>
                  <span className="text-gray-300">{description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
              Tips
            </h3>
            <ul className="space-y-2">
              {TIPS.map((tip, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-lcars-amber">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickReferenceModal;
