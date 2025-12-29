"use client";

/**
 * LockedFeature Component
 *
 * A wrapper component that shows a locked state overlay when a feature
 * is not yet available based on the current game turn.
 *
 * Used for progressive unlocks (PRD 11.1).
 */

import { ReactNode } from "react";
import {
  isFeatureUnlocked,
  getUnlockDefinition,
  type UnlockFeature,
} from "@/lib/constants/unlocks";

interface LockedFeatureProps {
  /** The feature to check */
  feature: UnlockFeature;
  /** Current game turn */
  currentTurn: number;
  /** Content to render when unlocked */
  children: ReactNode;
  /** Optional: Render style when locked */
  variant?: "overlay" | "replace" | "disable";
  /** Optional: Custom message to show when locked */
  customMessage?: string;
  /** Optional: Show countdown to unlock */
  showCountdown?: boolean;
  /** Optional: Additional CSS classes */
  className?: string;
}

/**
 * LockedFeature wraps content that should only be accessible after a certain turn.
 *
 * Variants:
 * - "overlay" (default): Shows content dimmed with lock overlay
 * - "replace": Replaces content entirely with locked message
 * - "disable": Shows content but makes it non-interactive
 *
 * @example
 * ```tsx
 * <LockedFeature feature="diplomacy_basics" currentTurn={5}>
 *   <DiplomacyPanel />
 * </LockedFeature>
 * ```
 */
export function LockedFeature({
  feature,
  currentTurn,
  children,
  variant = "overlay",
  customMessage,
  showCountdown = true,
  className = "",
}: LockedFeatureProps) {
  const isUnlocked = isFeatureUnlocked(feature, currentTurn);

  // If unlocked, render children normally
  if (isUnlocked) {
    return <>{children}</>;
  }

  const definition = getUnlockDefinition(feature);
  const turnsRemaining = definition.unlockTurn - currentTurn;
  const message = customMessage || definition.description;

  // Replace variant: show locked panel instead of content
  if (variant === "replace") {
    return (
      <div
        className={`lcars-panel relative ${className}`}
        data-testid={`locked-feature-${feature}`}
      >
        <LockedOverlayContent
          name={definition.name}
          message={message}
          unlockTurn={definition.unlockTurn}
          turnsRemaining={turnsRemaining}
          showCountdown={showCountdown}
        />
      </div>
    );
  }

  // Disable variant: show content but make it non-interactive
  if (variant === "disable") {
    return (
      <div
        className={`relative ${className}`}
        data-testid={`locked-feature-${feature}`}
      >
        <div className="pointer-events-none opacity-40 select-none">
          {children}
        </div>
        <div className="absolute top-2 right-2">
          <LockedBadge unlockTurn={definition.unlockTurn} />
        </div>
      </div>
    );
  }

  // Overlay variant (default): dim content with overlay
  return (
    <div
      className={`relative ${className}`}
      data-testid={`locked-feature-${feature}`}
    >
      {/* Dimmed content */}
      <div className="pointer-events-none blur-sm opacity-30 select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded">
        <LockedOverlayContent
          name={definition.name}
          message={message}
          unlockTurn={definition.unlockTurn}
          turnsRemaining={turnsRemaining}
          showCountdown={showCountdown}
        />
      </div>
    </div>
  );
}

interface LockedOverlayContentProps {
  name: string;
  message: string;
  unlockTurn: number;
  turnsRemaining: number;
  showCountdown: boolean;
}

function LockedOverlayContent({
  name,
  message,
  unlockTurn,
  turnsRemaining,
  showCountdown,
}: LockedOverlayContentProps) {
  return (
    <div className="text-center p-6 max-w-sm">
      {/* Lock icon */}
      <div className="text-4xl mb-3 opacity-80">
        <svg
          className="w-12 h-12 mx-auto text-lcars-amber"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Feature name */}
      <h3 className="text-lg font-display text-lcars-amber mb-2">
        {name}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4">
        {message}
      </p>

      {/* Unlock info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lcars-lavender font-mono">
            Turn {unlockTurn}
          </span>
        </div>
        {showCountdown && turnsRemaining > 0 && (
          <div className="text-lcars-blue">
            {turnsRemaining} turn{turnsRemaining !== 1 ? "s" : ""} remaining
          </div>
        )}
      </div>
    </div>
  );
}

interface LockedBadgeProps {
  unlockTurn: number;
}

function LockedBadge({ unlockTurn }: LockedBadgeProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-black/80 border border-lcars-amber/50 rounded text-xs">
      <svg
        className="w-3 h-3 text-lcars-amber"
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
      <span className="text-lcars-amber font-mono">T{unlockTurn}</span>
    </div>
  );
}

/**
 * LockedSection - A simpler version for inline locked sections within a component.
 *
 * Use this for locking parts of an existing panel rather than the whole thing.
 */
interface LockedSectionProps {
  feature: UnlockFeature;
  currentTurn: number;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function LockedSection({
  feature,
  currentTurn,
  children,
  title,
  className = "",
}: LockedSectionProps) {
  const isUnlocked = isFeatureUnlocked(feature, currentTurn);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const definition = getUnlockDefinition(feature);
  const turnsRemaining = definition.unlockTurn - currentTurn;

  return (
    <div
      className={`border border-gray-700 rounded p-4 bg-black/30 ${className}`}
      data-testid={`locked-section-${feature}`}
    >
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <svg
          className="w-4 h-4"
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
        <span className="font-semibold">{title || definition.name}</span>
      </div>
      <p className="text-sm text-gray-500">
        Unlocks at Turn {definition.unlockTurn}{" "}
        <span className="text-lcars-blue">
          ({turnsRemaining} turn{turnsRemaining !== 1 ? "s" : ""})
        </span>
      </p>
    </div>
  );
}
