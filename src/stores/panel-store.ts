/**
 * Panel Store
 *
 * Zustand store for managing slide-out panel state.
 * Replaces the PanelContext with a simpler, more direct API.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Available panel types that can be opened in the game UI.
 */
export type PanelType =
  | "none"
  | "military"
  | "combat"
  | "research"
  | "sectors"
  | "market"
  | "diplomacy"
  | "covert"
  | "messages"
  | "syndicate"
  | "starmap"
  | "settings";

/**
 * Context data that can be passed when opening a panel.
 */
export interface PanelContextData {
  /** Target empire ID for context-aware panels (combat, covert, messages) */
  targetEmpireId?: string;
  /** Target sector ID for sector-specific actions */
  targetSectorId?: string;
  /** Any additional data needed by the panel */
  [key: string]: unknown;
}

/**
 * Panel store state interface.
 */
interface PanelState {
  /** Currently active panel */
  activePanel: PanelType;
  /** Context data for the active panel */
  panelContext: PanelContextData | null;
  /** History of previously opened panels (for back navigation) */
  panelHistory: PanelType[];
}

/**
 * Panel store actions interface.
 */
interface PanelActions {
  /** Open a panel with optional context */
  openPanel: (panel: PanelType, context?: PanelContextData) => void;
  /** Close the current panel */
  closePanel: () => void;
  /** Toggle a panel (close if open, open if closed) */
  togglePanel: (panel: PanelType, context?: PanelContextData) => void;
  /** Go back to previous panel */
  goBack: () => void;
  /** Reset panel state */
  reset: () => void;
}

// =============================================================================
// STORE
// =============================================================================

const initialState: PanelState = {
  activePanel: "none",
  panelContext: null,
  panelHistory: [],
};

/**
 * Panel store for managing slide-out panel state.
 *
 * @example
 * import { usePanelStore } from "@/stores";
 *
 * function CombatButton({ targetId }: { targetId: string }) {
 *   const openPanel = usePanelStore(state => state.openPanel);
 *
 *   return (
 *     <button onClick={() => openPanel("combat", { targetEmpireId: targetId })}>
 *       Attack
 *     </button>
 *   );
 * }
 *
 * @example
 * // Check if a specific panel is open
 * const isOpen = usePanelStore(state => state.activePanel === "military");
 */
export const usePanelStore = create<PanelState & PanelActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      openPanel: (panel, context) => {
        const { activePanel, panelHistory } = get();

        // Don't add to history if same panel
        if (panel === activePanel) {
          // Just update context if provided
          if (context) {
            set({ panelContext: context });
          }
          return;
        }

        // Add current panel to history (for back navigation)
        const newHistory =
          activePanel !== "none"
            ? [...panelHistory, activePanel].slice(-5) // Keep last 5
            : panelHistory;

        set({
          activePanel: panel,
          panelContext: context,
          panelHistory: newHistory,
        });
      },

      closePanel: () => {
        set({
          activePanel: "none",
          panelContext: null,
        });
      },

      togglePanel: (panel, context) => {
        const { activePanel, openPanel, closePanel } = get();

        if (activePanel === panel) {
          closePanel();
        } else {
          openPanel(panel, context);
        }
      },

      goBack: () => {
        const { panelHistory } = get();

        if (panelHistory.length === 0) {
          set({ activePanel: "none", panelContext: null });
          return;
        }

        const previousPanel = panelHistory[panelHistory.length - 1];
        set({
          activePanel: previousPanel ?? "none",
          panelContext: null,
          panelHistory: panelHistory.slice(0, -1),
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "panel-store" }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Selector to check if a panel is currently open.
 */
export const selectIsPanelOpen = (state: PanelState & PanelActions): boolean =>
  state.activePanel !== "none";

/**
 * Selector to check if a specific panel is active.
 */
export const selectIsPanel =
  (panel: PanelType) =>
  (state: PanelState & PanelActions): boolean =>
    state.activePanel === panel;

/**
 * Selector to get the target empire ID from context.
 */
export const selectTargetEmpireId = (
  state: PanelState & PanelActions
): string | undefined => state.panelContext?.targetEmpireId;
