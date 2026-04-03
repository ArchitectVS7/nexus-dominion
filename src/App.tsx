/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Main Application Shell

   Manages game lifecycle: new campaign → game loop → save/load.
   Coordinates all UI panels and the cycle commit flow.
   ══════════════════════════════════════════════════════════════ */

import { useCallback, useRef, useState } from "react";
import { useGameState } from "./hooks/useGameState";
import { createNewCampaign } from "./engine/campaign/campaign-factory";
import { processCycle } from "./engine/cycle/cycle-processor";
import { LocalStoragePersistence } from "./engine/persistence/local-storage-persistence";
import { StarMap } from "./ui/StarMap";
import { HUD } from "./ui/HUD";
import { EmpirePanel } from "./ui/EmpirePanel";
import { MilitaryPanel } from "./ui/MilitaryPanel";
import { DiplomacyPanel } from "./ui/DiplomacyPanel";
import { SyndicatePanel } from "./ui/SyndicatePanel";
import { CovertOpsPanel } from "./ui/CovertOpsPanel";
import { MarketPanel } from "./ui/MarketPanel";
import { ResearchPanel } from "./ui/ResearchPanel";
import { CycleReportModal } from "./ui/CycleReport";
import { SystemPanel } from "./ui/SystemPanel";
import { AchievementPanel } from "./ui/AchievementPanel";
import type { CycleReport, SystemId, Resources, InstallationType } from "./engine/types";
import "./App.css";

const SEED = 42;
const persistence = new LocalStoragePersistence();

type ActivePanel = null | "empire" | "military" | "market" | "diplomacy" | "research" | "syndicate" | "covert" | "achievements";

function App() {
  const { state, dispatch, isLoaded } = useGameState();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [cycleReport, setCycleReport] = useState<CycleReport | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<SystemId | null>(null);
  const [prevResources, setPrevResources] = useState<Resources | null>(null);

  // Persistent history refs (not part of React renders)
  const powerHistoryRef = useRef(new Map<string, number[]>());
  const botAccumRef = useRef(new Map<string, number>());

  /* ── Life Cycle ── */

  const handleNewCampaign = useCallback(() => {
    const newState = createNewCampaign({
      totalSystems: 250,
      sectorCount: 10,
      systemsPerSector: 25,
      empireCount: 100,
      seed: SEED,
    }, "Campaign Alpha");

    powerHistoryRef.current = new Map();
    botAccumRef.current = new Map();
    dispatch({ type: "SET_STATE", state: newState });
  }, [dispatch]);

  const handleLoadGame = useCallback(async () => {
    const saves = await persistence.listSaves();
    if (saves.length > 0) {
      // Load the most recent save
      const latest = saves.sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
      const loaded = await persistence.load(latest.id);
      if (loaded) {
        powerHistoryRef.current = loaded.powerHistory ?? new Map();
        botAccumRef.current = loaded.botAccumulated ?? new Map();
        dispatch({ type: "SET_STATE", state: loaded });
      }
    }
  }, [dispatch]);

  const handleSaveGame = useCallback(async () => {
    if (!state) return;
    await persistence.save(state);
  }, [state]);

  /* ── Cycle Commit ── */

  const handleCommitCycle = useCallback(() => {
    if (!state) return;

    // Snapshot previous resources for delta display
    const playerEmpire = state.empires.get(state.playerEmpireId);
    if (playerEmpire) {
      setPrevResources({ ...playerEmpire.resources });
    }

    const result = processCycle(
      state,
      { actions: [] }, // Player actions will be collected from UI in future
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );

    if (result.committed) {
      // Update persistent refs
      if (result.state.powerHistory) {
        powerHistoryRef.current = result.state.powerHistory as any;
      }
      if (result.state.botAccumulated) {
        botAccumRef.current = result.state.botAccumulated as any;
      }

      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  /* ── Colonise Action ── */

  const handleColonise = useCallback((systemId: SystemId) => {
    if (!state) return;

    // Commit a cycle with a colonise action
    const playerEmpire = state.empires.get(state.playerEmpireId);
    if (playerEmpire) {
      setPrevResources({ ...playerEmpire.resources });
    }

    const result = processCycle(
      state,
      { actions: [{ type: "claim-system", details: { systemId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );

    if (result.committed) {
      if (result.state.powerHistory) {
        powerHistoryRef.current = result.state.powerHistory as any;
      }
      if (result.state.botAccumulated) {
        botAccumRef.current = result.state.botAccumulated as any;
      }

      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
      setSelectedSystemId(null);
    }
  }, [state, dispatch]);

  /* ── Build Installation Action ── */

  const handleBuildInstallation = useCallback((systemId: SystemId, installationType: InstallationType) => {
    if (!state) return;

    const playerEmpire = state.empires.get(state.playerEmpireId);
    if (playerEmpire) {
      setPrevResources({ ...playerEmpire.resources });
    }

    const result = processCycle(
      state,
      { actions: [{ type: "build-installation", details: { systemId, installationType } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );

    if (result.committed) {
      if (result.state.powerHistory) {
        powerHistoryRef.current = result.state.powerHistory as any;
      }
      if (result.state.botAccumulated) {
        botAccumRef.current = result.state.botAccumulated as any;
      }

      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
      // Keep system panel open so player sees new condition
    }
  }, [state, dispatch]);

  /* ── Trade Action ── */

  const handleTrade = useCallback((resource: "food" | "ore" | "fuelCells", quantity: number, direction: "buy" | "sell") => {
    if (!state) return;

    const playerEmpire = state.empires.get(state.playerEmpireId);
    if (playerEmpire) {
      setPrevResources({ ...playerEmpire.resources });
    }

    const result = processCycle(
      state,
      { actions: [{ type: "trade", details: { resource, quantity, direction } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );

    if (result.committed) {
      if (result.state.powerHistory) {
        powerHistoryRef.current = result.state.powerHistory as any;
      }
      if (result.state.botAccumulated) {
        botAccumRef.current = result.state.botAccumulated as any;
      }

      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  const handleBuildWormhole = useCallback((targetSystemId: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "build-wormhole", details: { targetSystemId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
      setSelectedSystemId(null); // close panel
    }
  }, [state, dispatch]);

  /* ── Research Actions ── */

  const handleResearch = useCallback(() => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "research", details: {} }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  const handleSelectDoctrine = useCallback((pathId: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "select-doctrine", details: { pathId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  const handleSelectSpecialization = useCallback((specId: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "select-specialization", details: { specId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  /* ── Diplomacy Actions ── */

  const handleProposePact = useCallback((targetId: string, type: "stillness-accord" | "star-covenant") => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "propose-pact", details: { targetId, type } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  const handleBreakPact = useCallback((pactId: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "break-pact", details: { pactId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  /* ── Military Actions ── */

  const handleBuildUnit = useCallback((unitTypeId: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "build-unit", details: { unitTypeId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  /* ── Syndicate Actions ── */

  const handleFundSyndicate = useCallback((amount: number) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "fund-syndicate", details: { amount } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  const handlePurchaseBlackRegister = useCallback((itemId: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "purchase-black-register", details: { itemId } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  /* ── Covert Actions ── */

  const handleLaunchOperation = useCallback((targetId: string, opType: string) => {
    if (!state) return;
    const result = processCycle(
      state,
      { actions: [{ type: "launch-covert-op", details: { targetId, opType } }] },
      powerHistoryRef.current as any,
      botAccumRef.current as any,
    );
    if (result.committed) {
      if (result.state.powerHistory) powerHistoryRef.current = result.state.powerHistory as any;
      if (result.state.botAccumulated) botAccumRef.current = result.state.botAccumulated as any;
      dispatch({ type: "ADVANCE_CYCLE", nextState: result.state });
      setCycleReport(result.report);
    }
  }, [state, dispatch]);

  /* ── Panel Navigation ── */


  /* ── Render: Title Screen ── */

  if (!isLoaded) {
    return (
      <div className="shell">
        <div className="lcars-bar top" />
        <div className="lcars-bar bottom" />
        <div className="lcars-bar side" />
        <div className="title-screen">
          <div className="title-screen__logo">
            <h1 className="title-screen__title">NEXUS DOMINION</h1>
            <p className="title-screen__subtitle">A GALACTIC STRATEGY SIMULATION</p>
          </div>
          <div className="title-screen__actions">
            <button className="title-btn title-btn--primary" onClick={handleNewCampaign}>
              NEW CAMPAIGN
            </button>
            <button className="title-btn title-btn--secondary" onClick={handleLoadGame}>
              CONTINUE
            </button>
          </div>
          <p className="title-screen__ver">Engine v0.9 — 934 Tests Passing</p>
        </div>
      </div>
    );
  }

  /* ── Render: Game ── */

  return (
    <div className="shell">
      <div className="lcars-bar top" />
      <div className="lcars-bar bottom" />
      <div className="lcars-bar side" />

      <StarMap
        galaxy={state!.galaxy}
        playerEmpireId={state!.playerEmpireId}
        onSelectSystem={(id) => setSelectedSystemId(id)}
      />

      <HUD
        state={state!}
        onCommitCycle={handleCommitCycle}
        onOpenEmpire={() => setActivePanel("empire")}
        onOpenMilitary={() => setActivePanel("military")}
        onOpenMarket={() => setActivePanel("market")}
        onOpenDiplomacy={() => setActivePanel("diplomacy")}
        onOpenResearch={() => setActivePanel("research")}
        onOpenSyndicate={() => setActivePanel("syndicate")}
        onOpenCovert={() => setActivePanel("covert")}
        onSaveGame={handleSaveGame}
      />

      {/* Slide-in panels */}
      {activePanel === "empire" && (
        <EmpirePanel
          state={state!}
          previousResources={prevResources}
          onClose={() => setActivePanel(null)}
          onOpenAchievements={() => setActivePanel("achievements")}
        />
      )}

      {activePanel === "market" && (
        <MarketPanel
          state={state!}
          onClose={() => setActivePanel(null)}
          onTrade={handleTrade}
        />
      )}

      {activePanel === "military" && (
        <MilitaryPanel
          state={state!}
          onClose={() => setActivePanel(null)}
          onBuildUnit={handleBuildUnit}
        />
      )}

      {activePanel === "diplomacy" && (
        <DiplomacyPanel
          state={state!}
          onClose={() => setActivePanel(null)}
          onProposePact={handleProposePact as any}
          onBreakPact={handleBreakPact}
        />
      )}

      {activePanel === "research" && (
        <ResearchPanel
          state={state!}
          onClose={() => setActivePanel(null)}
          onResearch={handleResearch}
          onSelectDoctrine={handleSelectDoctrine}
          onSelectSpecialization={handleSelectSpecialization}
        />
      )}

      {activePanel === "syndicate" && (
        <SyndicatePanel
          state={state!}
          onClose={() => setActivePanel(null)}
          onFundSyndicate={handleFundSyndicate}
          onPurchaseBlackRegister={handlePurchaseBlackRegister}
        />
      )}

      {activePanel === "covert" && (
        <CovertOpsPanel
          state={state!}
          onClose={() => setActivePanel(null)}
          onLaunchOperation={handleLaunchOperation}
        />
      )}

      {activePanel === "achievements" && (
        <AchievementPanel
          state={state!}
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* System panel on star click */}
      {selectedSystemId && (
        <SystemPanel
          systemId={selectedSystemId}
          state={state!}
          onClose={() => setSelectedSystemId(null)}
          onColonise={handleColonise}
          onBuild={handleBuildInstallation}
          onBuildWormhole={handleBuildWormhole as any}
        />
      )}

      {/* Cycle report modal */}
      {cycleReport && (
        <CycleReportModal
          report={cycleReport}
          onClose={() => setCycleReport(null)}
        />
      )}
    </div>
  );
}

export default App;
