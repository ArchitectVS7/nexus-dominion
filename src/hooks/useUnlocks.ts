/**
 * useUnlocks Hook
 *
 * Provides unlock state to components based on the current game turn.
 * Used for progressive feature unlocking (PRD 11.1).
 */

import { useMemo } from "react";
import {
  getUnlockedFeatures,
  isFeatureUnlocked,
  getNextUnlock,
  getUpcomingUnlocks,
  getNewUnlocks,
  getUnlockProgress,
  getCurrentPhase,
  getUnlockTurn,
  getUnlockDefinition,
  type UnlockFeature,
  type UnlockDefinition,
  type GamePhase,
} from "@/lib/constants/unlocks";

export interface UseUnlocksResult {
  /** All features currently unlocked */
  unlockedFeatures: UnlockFeature[];
  /** Check if a specific feature is unlocked */
  isUnlocked: (feature: UnlockFeature) => boolean;
  /** Get the next feature to unlock */
  nextUnlock: UnlockDefinition | undefined;
  /** Get upcoming unlocks (next N features) */
  upcomingUnlocks: UnlockDefinition[];
  /** Get features that just unlocked this turn */
  newUnlocks: UnlockFeature[];
  /** Progress percentage through unlock schedule (0-100) */
  unlockProgress: number;
  /** Current game phase based on turn */
  currentPhase: GamePhase;
  /** Get the turn when a feature unlocks */
  getUnlockTurnFor: (feature: UnlockFeature) => number;
  /** Get full unlock definition for a feature */
  getDefinition: (feature: UnlockFeature) => UnlockDefinition;
  /** Turns until a feature unlocks (0 if already unlocked) */
  turnsUntil: (feature: UnlockFeature) => number;
}

/**
 * Hook to provide unlock state based on current game turn.
 *
 * @param currentTurn - The current game turn
 * @returns Object with unlock utilities and state
 *
 * @example
 * ```tsx
 * function DiplomacyPanel({ currentTurn }: { currentTurn: number }) {
 *   const { isUnlocked, turnsUntil } = useUnlocks(currentTurn);
 *
 *   if (!isUnlocked("diplomacy_basics")) {
 *     return <div>Diplomacy unlocks in {turnsUntil("diplomacy_basics")} turns</div>;
 *   }
 *
 *   return <div>Diplomacy is available!</div>;
 * }
 * ```
 */
export function useUnlocks(currentTurn: number): UseUnlocksResult {
  return useMemo(() => {
    const unlockedFeatures = getUnlockedFeatures(currentTurn);
    const nextUnlock = getNextUnlock(currentTurn);
    const upcomingUnlocks = getUpcomingUnlocks(currentTurn);
    const newUnlocks = getNewUnlocks(currentTurn);
    const unlockProgress = getUnlockProgress(currentTurn);
    const currentPhase = getCurrentPhase(currentTurn);

    return {
      unlockedFeatures,
      isUnlocked: (feature: UnlockFeature) => isFeatureUnlocked(feature, currentTurn),
      nextUnlock,
      upcomingUnlocks,
      newUnlocks,
      unlockProgress,
      currentPhase,
      getUnlockTurnFor: getUnlockTurn,
      getDefinition: getUnlockDefinition,
      turnsUntil: (feature: UnlockFeature) => {
        const unlockTurn = getUnlockTurn(feature);
        return Math.max(0, unlockTurn - currentTurn);
      },
    };
  }, [currentTurn]);
}

export type { UnlockFeature, UnlockDefinition, GamePhase };
