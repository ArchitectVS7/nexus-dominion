/**
 * Tutorial Store
 *
 * Zustand store for managing tutorial and onboarding state.
 * Persists to localStorage to remember user progress across sessions.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tutorial steps that guide new players.
 */
export type TutorialStep =
  | "welcome"
  | "resources"
  | "sectors"
  | "military"
  | "end_turn"
  | "complete";

/**
 * Onboarding hints that appear contextually.
 */
export type OnboardingHint =
  | "first_build"
  | "first_research"
  | "first_combat"
  | "first_trade"
  | "first_diplomacy"
  | "low_food"
  | "low_credits"
  | "protection_ending";

/**
 * Tutorial store state interface.
 */
interface TutorialState {
  /** Whether the main tutorial has been completed */
  tutorialComplete: boolean;
  /** Current tutorial step (if tutorial in progress) */
  currentStep: TutorialStep;
  /** Whether the welcome modal has been shown */
  welcomeModalShown: boolean;
  /** Set of hints that have been dismissed */
  dismissedHints: Set<OnboardingHint>;
  /** Whether onboarding hints are enabled */
  hintsEnabled: boolean;
}

/**
 * Tutorial store actions interface.
 */
interface TutorialActions {
  /** Mark tutorial as complete */
  completeTutorial: () => void;
  /** Advance to the next tutorial step */
  nextStep: () => void;
  /** Go to a specific tutorial step */
  goToStep: (step: TutorialStep) => void;
  /** Reset tutorial to beginning */
  resetTutorial: () => void;
  /** Mark welcome modal as shown */
  setWelcomeModalShown: (shown: boolean) => void;
  /** Dismiss an onboarding hint */
  dismissHint: (hint: OnboardingHint) => void;
  /** Check if a hint has been dismissed */
  isHintDismissed: (hint: OnboardingHint) => boolean;
  /** Enable/disable hints */
  setHintsEnabled: (enabled: boolean) => void;
  /** Reset all onboarding state */
  reset: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TUTORIAL_STEPS: TutorialStep[] = [
  "welcome",
  "resources",
  "sectors",
  "military",
  "end_turn",
  "complete",
];

// =============================================================================
// STORE
// =============================================================================

const initialState: TutorialState = {
  tutorialComplete: false,
  currentStep: "welcome",
  welcomeModalShown: false,
  dismissedHints: new Set(),
  hintsEnabled: true,
};

/**
 * Tutorial store for managing tutorial and onboarding state.
 *
 * @example
 * import { useTutorialStore } from "@/stores";
 *
 * function TutorialOverlay() {
 *   const { tutorialComplete, currentStep, nextStep } = useTutorialStore();
 *
 *   if (tutorialComplete) return null;
 *
 *   return (
 *     <div className="tutorial-overlay">
 *       <TutorialContent step={currentStep} />
 *       <button onClick={nextStep}>Next</button>
 *     </div>
 *   );
 * }
 */
export const useTutorialStore = create<TutorialState & TutorialActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        completeTutorial: () => {
          set({
            tutorialComplete: true,
            currentStep: "complete",
          });
        },

        nextStep: () => {
          const { currentStep } = get();
          const currentIndex = TUTORIAL_STEPS.indexOf(currentStep);
          const nextIndex = currentIndex + 1;

          if (nextIndex >= TUTORIAL_STEPS.length - 1) {
            // Last step - complete tutorial
            set({
              tutorialComplete: true,
              currentStep: "complete",
            });
          } else {
            set({
              currentStep: TUTORIAL_STEPS[nextIndex],
            });
          }
        },

        goToStep: (step) => {
          set({ currentStep: step });
        },

        resetTutorial: () => {
          set({
            tutorialComplete: false,
            currentStep: "welcome",
          });
        },

        setWelcomeModalShown: (shown) => {
          set({ welcomeModalShown: shown });
        },

        dismissHint: (hint) => {
          const { dismissedHints } = get();
          const newDismissed = new Set(dismissedHints);
          newDismissed.add(hint);
          set({ dismissedHints: newDismissed });
        },

        isHintDismissed: (hint) => {
          const { dismissedHints } = get();
          return dismissedHints.has(hint);
        },

        setHintsEnabled: (enabled) => {
          set({ hintsEnabled: enabled });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: "nexus-dominion-tutorial",
        // Custom serialization for Set
        partialize: (state) => ({
          tutorialComplete: state.tutorialComplete,
          currentStep: state.currentStep,
          welcomeModalShown: state.welcomeModalShown,
          dismissedHints: Array.from(state.dismissedHints),
          hintsEnabled: state.hintsEnabled,
        }),
        // Custom deserialization for Set
        merge: (persisted, current) => {
          const persistedState = persisted as Partial<TutorialState> & {
            dismissedHints?: OnboardingHint[];
          };
          return {
            ...current,
            ...persistedState,
            dismissedHints: new Set(persistedState.dismissedHints ?? []),
          };
        },
      }
    ),
    { name: "tutorial-store" }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Selector to check if tutorial is in progress.
 */
export const selectIsTutorialActive = (
  state: TutorialState & TutorialActions
): boolean => !state.tutorialComplete && state.currentStep !== "complete";

/**
 * Selector to check if should show onboarding hints.
 */
export const selectShouldShowHints = (
  state: TutorialState & TutorialActions
): boolean => state.tutorialComplete && state.hintsEnabled;

/**
 * Selector to get current tutorial progress (0-100).
 */
export const selectTutorialProgress = (
  state: TutorialState & TutorialActions
): number => {
  if (state.tutorialComplete) return 100;
  const currentIndex = TUTORIAL_STEPS.indexOf(state.currentStep);
  return Math.round((currentIndex / (TUTORIAL_STEPS.length - 1)) * 100);
};
