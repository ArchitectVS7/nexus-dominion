"use client";

/**
 * UnlockNotification Component
 *
 * Toast/modal notification that appears when features unlock.
 * Triggered when the turn advances past an unlock threshold.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getNewUnlocks,
  getUnlockDefinition,
  type UnlockFeature,
  type UnlockDefinition,
} from "@/lib/constants/unlocks";

interface UnlockNotificationProps {
  /** Current game turn */
  currentTurn: number;
  /** Optional: Callback when notification is dismissed */
  onDismiss?: (feature: UnlockFeature) => void;
}

/**
 * UnlockNotification shows a notification when new features unlock.
 *
 * @example
 * ```tsx
 * // In a layout or dashboard component:
 * <UnlockNotification currentTurn={currentTurn} />
 * ```
 */
export function UnlockNotification({
  currentTurn,
  onDismiss,
}: UnlockNotificationProps) {
  const [notifications, setNotifications] = useState<UnlockDefinition[]>([]);
  const [dismissedFeatures, setDismissedFeatures] = useState<Set<string>>(
    () => {
      // Load dismissed features from localStorage
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("dismissedUnlocks");
          if (stored) {
            return new Set(JSON.parse(stored));
          }
        } catch {
          // Ignore localStorage errors
        }
      }
      return new Set();
    }
  );

  // Check for new unlocks when turn changes
  useEffect(() => {
    const newUnlocks = getNewUnlocks(currentTurn);
    const newNotifications = newUnlocks
      .filter((feature) => !dismissedFeatures.has(`${feature}-${currentTurn}`))
      .map((feature) => getUnlockDefinition(feature));

    if (newNotifications.length > 0) {
      setNotifications(newNotifications);
    }
  }, [currentTurn, dismissedFeatures]);

  const handleDismiss = useCallback(
    (feature: UnlockFeature) => {
      const key = `${feature}-${currentTurn}`;
      setDismissedFeatures((prev) => {
        const next = new Set(prev);
        next.add(key);
        // Persist to localStorage
        try {
          localStorage.setItem("dismissedUnlocks", JSON.stringify(Array.from(next)));
        } catch {
          // Ignore localStorage errors
        }
        return next;
      });
      setNotifications((prev) => prev.filter((n) => n.id !== feature));
      onDismiss?.(feature);
    },
    [currentTurn, onDismiss]
  );

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((unlock) => (
        <UnlockToast
          key={unlock.id}
          unlock={unlock}
          onDismiss={() => handleDismiss(unlock.id)}
        />
      ))}
    </div>
  );
}

interface UnlockToastProps {
  unlock: UnlockDefinition;
  onDismiss: () => void;
}

function UnlockToast({ unlock, onDismiss }: UnlockToastProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
                  border border-lcars-amber/50 rounded-lg shadow-xl shadow-lcars-amber/20
                  transform transition-all duration-300 ease-out
                  ${isAnimating ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}
      role="alert"
      aria-live="polite"
      data-testid={`unlock-notification-${unlock.id}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-lcars-amber/5 to-transparent rounded-lg" />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-lcars-amber/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-lcars-amber"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs text-lcars-amber uppercase tracking-wider mb-1">
              New Feature Unlocked
            </div>
            <h3 className="text-white font-display text-lg leading-tight">
              {unlock.name}
            </h3>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
            aria-label="Dismiss notification"
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

        {/* Message */}
        <p className="mt-2 text-sm text-gray-400 pl-13">
          {unlock.unlockMessage}
        </p>

        {/* Dismiss button */}
        <div className="mt-3 pl-13">
          <button
            onClick={onDismiss}
            className="px-4 py-1.5 text-sm font-medium text-lcars-amber border border-lcars-amber/30
                       rounded hover:bg-lcars-amber/10 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * UpcomingUnlocks - Shows the next few features that will unlock.
 *
 * Use this on the dashboard to show players what's coming next.
 */
interface UpcomingUnlocksProps {
  currentTurn: number;
  limit?: number;
  className?: string;
}

export function UpcomingUnlocks({
  currentTurn,
  limit = 3,
  className = "",
}: UpcomingUnlocksProps) {
  const [upcomingUnlocks, setUpcomingUnlocks] = useState<UnlockDefinition[]>([]);

  useEffect(() => {
    // Import dynamically to avoid SSR issues
    import("@/lib/constants/unlocks").then(({ getUpcomingUnlocks }) => {
      const upcoming = getUpcomingUnlocks(currentTurn).slice(0, limit);
      setUpcomingUnlocks(upcoming);
    });
  }, [currentTurn, limit]);

  if (upcomingUnlocks.length === 0) {
    return null;
  }

  return (
    <div className={`lcars-panel ${className}`} data-testid="upcoming-unlocks">
      <h3 className="text-lg font-semibold text-lcars-lavender mb-4">
        Upcoming Features
      </h3>
      <div className="space-y-3">
        {upcomingUnlocks.map((unlock) => {
          const turnsRemaining = unlock.unlockTurn - currentTurn;
          return (
            <div
              key={unlock.id}
              className="flex items-center gap-3 p-3 bg-black/30 rounded border border-gray-800"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-300">
                  {unlock.name}
                </div>
                <div className="text-xs text-gray-500">{unlock.description}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-gray-500">Turn</div>
                <div className="font-mono text-lcars-lavender">
                  {unlock.unlockTurn}
                </div>
                <div className="text-xs text-lcars-blue">
                  {turnsRemaining} turn{turnsRemaining !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
