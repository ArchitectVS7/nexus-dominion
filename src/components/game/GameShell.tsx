"use client";

/**
 * Game Shell Component
 *
 * Main game wrapper that provides:
 * - Layout structure (main content + sidebars)
 * - Panel management via Zustand
 * - Turn processing via React Query
 * - Modal orchestration (turn summary, quick reference, defeat/victory)
 * - Keyboard shortcuts
 *
 * This is a complete rewrite using SDD patterns:
 * - State from Zustand stores (not useState)
 * - Data from React Query hooks (not manual fetching)
 * - ~200 lines vs original ~500 lines
 */

import { useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useGameLayout,
  useEndTurnEnhanced,
  useInvalidateGame,
  type GameLayoutData,
} from "@/lib/api";
import {
  useGameStore,
  usePanelStore,
  useTutorialStore,
  type PanelType,
} from "@/stores";

// Sub-components
import { SlideOutPanel } from "./common/SlideOutPanel";
import { TurnSummaryModal } from "./common/TurnSummaryModal";
import { QuickReferenceModal } from "./common/QuickReferenceModal";
import { EndTurnButton } from "./common/EndTurnButton";
import { ResourceBar } from "./common/ResourceBar";

// Panel content components (lazy loaded)
import { MilitaryPanel } from "./panels/MilitaryPanel";
import { CombatPanel } from "./panels/CombatPanel";
import { ResearchPanel } from "./panels/ResearchPanel";
import { SectorsPanel } from "./panels/SectorsPanel";
import { MarketPanel } from "./panels/MarketPanel";
import { DiplomacyPanel } from "./panels/DiplomacyPanel";
import { CovertPanel } from "./panels/CovertPanel";
import { MessagesPanel } from "./panels/MessagesPanel";

interface GameShellProps {
  children: ReactNode;
  initialLayoutData?: GameLayoutData | null;
}

/**
 * Panel content renderer based on active panel type
 */
function PanelContent({ panel }: { panel: PanelType }) {
  switch (panel) {
    case "military":
      return <MilitaryPanel />;
    case "combat":
      return <CombatPanel />;
    case "research":
      return <ResearchPanel />;
    case "sectors":
      return <SectorsPanel />;
    case "market":
      return <MarketPanel />;
    case "diplomacy":
      return <DiplomacyPanel />;
    case "covert":
      return <CovertPanel />;
    case "messages":
      return <MessagesPanel />;
    default:
      return null;
  }
}

/**
 * Panel titles for the slide-out header
 */
const PANEL_TITLES: Record<PanelType, string> = {
  none: "",
  military: "Military Command",
  combat: "Combat Operations",
  research: "Research Lab",
  sectors: "Sector Management",
  market: "Galactic Market",
  diplomacy: "Diplomatic Relations",
  covert: "Covert Operations",
  messages: "Communications",
  syndicate: "Syndicate",
  starmap: "Galaxy Map",
  settings: "Settings",
};

export function GameShell({ children, initialLayoutData }: GameShellProps) {
  const router = useRouter();

  // React Query for data
  const { data: layout } = useGameLayout();
  const endTurnMutation = useEndTurnEnhanced();
  const invalidateGame = useInvalidateGame();

  // Zustand stores for state
  const {
    isProcessingTurn,
    setProcessingTurn,
    showTurnSummary,
    setShowTurnSummary,
    turnResult,
    setTurnResult,
    defeatAnalysis,
    setDefeatAnalysis,
    showQuickReference,
    toggleQuickReference,
  } = useGameStore();

  const { activePanel, closePanel } = usePanelStore();
  const { tutorialComplete } = useTutorialStore();

  // Use live data or fallback to initial
  const currentLayout = layout ?? initialLayoutData;

  /**
   * Handle end turn with mutation
   */
  const handleEndTurn = useCallback(async () => {
    if (isProcessingTurn) return;

    setProcessingTurn(true);

    try {
      const result = await endTurnMutation.mutateAsync();

      // Set turn result for summary modal
      setTurnResult(
        {
          turn: result.turn,
          processingMs: result.processingMs,
          events: result.events,
          resourceDeltas: result.resourceChanges,
        },
        true // Show summary modal
      );

      // Handle defeat
      if (result.defeatAnalysis) {
        setDefeatAnalysis(result.defeatAnalysis);
      }

      // Invalidate all game data to refetch
      await invalidateGame();
    } catch (error) {
      console.error("[GameShell] End turn failed:", error);
      // Could show a toast here
    } finally {
      setProcessingTurn(false);
    }
  }, [
    isProcessingTurn,
    setProcessingTurn,
    endTurnMutation,
    setTurnResult,
    setDefeatAnalysis,
    invalidateGame,
  ]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ": // Spacebar - End turn
          e.preventDefault();
          handleEndTurn();
          break;
        case "?": // Question mark - Quick reference
          e.preventDefault();
          toggleQuickReference();
          break;
        case "Escape": // Escape - Close panel/modal
          if (activePanel !== "none") {
            closePanel();
          } else if (showTurnSummary) {
            setShowTurnSummary(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleEndTurn,
    toggleQuickReference,
    activePanel,
    closePanel,
    showTurnSummary,
    setShowTurnSummary,
  ]);

  return (
    <div className="h-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Slide-out panel */}
        <SlideOutPanel
          isOpen={activePanel !== "none"}
          onClose={closePanel}
          title={PANEL_TITLES[activePanel]}
        >
          <PanelContent panel={activePanel} />
        </SlideOutPanel>
      </div>

      {/* Bottom bar with resources and end turn */}
      <div className="border-t border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <ResourceBar
            credits={currentLayout?.credits}
            food={currentLayout?.food}
            ore={currentLayout?.ore}
            petroleum={currentLayout?.petroleum}
          />
          <EndTurnButton
            onClick={handleEndTurn}
            isProcessing={isProcessingTurn}
            currentTurn={currentLayout?.currentTurn}
          />
        </div>
      </div>

      {/* Turn Summary Modal */}
      {showTurnSummary && turnResult && (
        <TurnSummaryModal
          result={turnResult}
          onClose={() => setShowTurnSummary(false)}
        />
      )}

      {/* Quick Reference Modal */}
      {showQuickReference && (
        <QuickReferenceModal onClose={() => toggleQuickReference()} />
      )}

      {/* Defeat Modal - would be added here */}
      {defeatAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 border border-red-500/50 rounded-lg p-8 max-w-lg">
            <h2 className="text-2xl text-red-400 font-display mb-4">
              Empire Defeated
            </h2>
            <p className="text-gray-300 mb-4">
              Your empire has fallen after {defeatAnalysis.turnsPlayed} turns.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Cause: {defeatAnalysis.cause}
            </p>
            <button
              onClick={() => router.push("/game/result")}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameShell;
