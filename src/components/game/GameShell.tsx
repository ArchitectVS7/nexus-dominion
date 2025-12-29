"use client";

/**
 * GameShell - The main game interface wrapper
 *
 * Provides the galaxy-centric layout with:
 * - Main content area (left/center)
 * - Turn Order Panel sidebar (right)
 * - Turn Summary Modal (after END TURN)
 *
 * This component handles the turn processing flow and provides
 * context to child components.
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TurnOrderPanel } from "./TurnOrderPanel";
import { TurnSummaryModal } from "./TurnSummaryModal";
import { OnboardingManager } from "./onboarding";
import {
  getTurnOrderPanelDataAction,
  endTurnEnhancedAction,
  type TurnOrderPanelData,
  type EnhancedTurnResult,
} from "@/app/actions/turn-actions";
import type { TurnEvent, ResourceDelta } from "@/lib/game/types/turn-types";

interface GameShellProps {
  children: React.ReactNode;
  initialPanelData?: TurnOrderPanelData | null;
}

export function GameShell({ children, initialPanelData }: GameShellProps) {
  const router = useRouter();

  // Panel data state
  const [panelData, setPanelData] = useState<TurnOrderPanelData | null>(
    initialPanelData ?? null
  );

  // Turn processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [turnResult, setTurnResult] = useState<{
    turn: number;
    processingMs: number;
    resourceChanges: ResourceDelta;
    populationBefore: number;
    populationAfter: number;
    events: TurnEvent[];
    messagesReceived: number;
    botBattles: number;
    empiresEliminated: string[];
    victoryResult?: { type: string; message: string };
  } | null>(null);

  // Refresh panel data
  const refreshPanelData = useCallback(async () => {
    const data = await getTurnOrderPanelDataAction();
    if (data) {
      setPanelData(data);
    }
  }, []);

  // Refresh on mount and periodically
  useEffect(() => {
    if (!initialPanelData) {
      refreshPanelData();
    }

    // Refresh every 30 seconds to catch external changes
    const interval = setInterval(refreshPanelData, 30000);
    return () => clearInterval(interval);
  }, [initialPanelData, refreshPanelData]);

  // Handle end turn
  const handleEndTurn = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const result = await endTurnEnhancedAction();

      if (result.success) {
        setTurnResult({
          turn: result.turn,
          processingMs: result.processingMs,
          resourceChanges: result.resourceChanges,
          populationBefore: result.populationBefore,
          populationAfter: result.populationAfter,
          events: result.events,
          messagesReceived: result.messagesReceived,
          botBattles: result.botBattles,
          empiresEliminated: result.empiresEliminated,
          victoryResult: result.victoryResult,
        });
        setShowModal(true);

        // Refresh panel data after turn
        await refreshPanelData();
      } else {
        // TODO: Show error toast
        console.error("Turn failed:", result.error);
      }
    } catch (error) {
      console.error("End turn error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, refreshPanelData]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setTurnResult(null);
    // Refresh the page to show updated data
    router.refresh();
  }, [router]);

  // Default panel data if not loaded
  const displayPanelData = panelData ?? {
    currentTurn: 1,
    turnLimit: 200,
    foodStatus: "stable" as const,
    armyStrength: "moderate" as const,
    threatCount: 0,
    unreadMessages: 0,
    protectionTurnsLeft: 20,
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Onboarding Hints (first 5 turns) */}
      <OnboardingManager currentTurn={displayPanelData.currentTurn} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Turn Order Panel Sidebar */}
      <TurnOrderPanel
        currentTurn={displayPanelData.currentTurn}
        turnLimit={displayPanelData.turnLimit}
        foodStatus={displayPanelData.foodStatus}
        armyStrength={displayPanelData.armyStrength}
        threatCount={displayPanelData.threatCount}
        unreadMessages={displayPanelData.unreadMessages}
        protectionTurnsLeft={displayPanelData.protectionTurnsLeft}
        onEndTurn={handleEndTurn}
        isProcessing={isProcessing}
      />

      {/* Turn Summary Modal */}
      <TurnSummaryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        turn={turnResult?.turn ?? 0}
        processingMs={turnResult?.processingMs ?? 0}
        resourceChanges={turnResult?.resourceChanges}
        populationBefore={turnResult?.populationBefore}
        populationAfter={turnResult?.populationAfter}
        events={turnResult?.events ?? []}
        messagesReceived={turnResult?.messagesReceived ?? 0}
        botBattles={turnResult?.botBattles ?? 0}
        empiresEliminated={turnResult?.empiresEliminated ?? []}
        victoryResult={turnResult?.victoryResult}
      />
    </div>
  );
}

export default GameShell;
