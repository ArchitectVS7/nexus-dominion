/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Main Application Shell

   Manages game lifecycle: new campaign → game loop → save/load.
   Coordinates all UI panels and the cycle commit flow.
   ══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo, useRef, useState } from "react";
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
import { CombatReportModal } from "./ui/CombatReport";
import { ConvergenceAlert } from "./ui/ConvergenceAlert";
import { CommitErrorBanner } from "./ui/CommitErrorBanner";
import { OrdersQueue } from "./ui/OrdersQueue";
import { enqueueOrder, removeOrder, toEngineActions, summarizeOrders, type QueuedOrder } from "./ui/orders";
import { SystemPanel } from "./ui/SystemPanel";
import { SectorPanel } from "./ui/SectorPanel";
import { AchievementPanel } from "./ui/AchievementPanel";
import { SaveSlotManager } from "./ui/SaveSlotManager";
import type { SaveSlotSummary } from "./ui/SaveSlotManager";
import { ACHIEVEMENT_DEFINITIONS } from "./engine/achievement/achievement-checker";
import type { CycleReport, CombatEvent, ConvergenceAlertEvent, SystemId, SectorId, Resources, InstallationType, EmpireId } from "./engine/types";
import "./App.css";

const SEED = 42;
const persistence = new LocalStoragePersistence();

type ActivePanel = null | "empire" | "military" | "market" | "diplomacy" | "research" | "syndicate" | "covert" | "achievements";

function App() {
  const { state, dispatch, isLoaded } = useGameState();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [cycleReport, setCycleReport] = useState<CycleReport | null>(null);
  const [dismissedCombatReport, setDismissedCombatReport] = useState<CycleReport | null>(null);
  const [dismissedConvergence, setDismissedConvergence] = useState<CycleReport | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<SystemId | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<SectorId | null>(null);
  const [prevResources, setPrevResources] = useState<Resources | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [showSaveList, setShowSaveList] = useState(false);
  const [saveList, setSaveList] = useState<SaveSlotSummary[]>([]);

  /* ── Orders Queue (the turn-model refactor, PRD:158) ──
     Player actions are queued locally and flushed to the engine once on
     COMMIT CYCLE. Orders live in React state ONLY — never in GameState,
     never persisted/saved (see src/ui/orders.ts). */
  const [orders, setOrders] = useState<QueuedOrder[]>([]);
  const orderSeqRef = useRef(0);

  /* Queued-state summary (T-114) — computed once per orders change and passed
     to panels so they can render pending badges/banners/chips. Shows only WHAT
     is queued; displayed resources stay real reserves (engine validates
     affordability at commit — see summarizeOrders). */
  const ordersSummary = useMemo(() => summarizeOrders(orders), [orders]);
  const [pendingPass, setPendingPass] = useState(false);
  const passTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setOrders([]);
    setPendingPass(false);
    dispatch({ type: "SET_STATE", state: newState });
  }, [dispatch]);

  const handleOpenSaveList = useCallback(async () => {
    const saves = await persistence.listSaves();
    setSaveList(saves);
    setShowSaveList(true);
  }, []);

  const handleLoadSave = useCallback(
    async (id: string) => {
      const loaded = await persistence.load(id);
      if (loaded) {
        powerHistoryRef.current = loaded.powerHistory ?? new Map();
        botAccumRef.current = loaded.botAccumulated ?? new Map();
        setOrders([]);
        setPendingPass(false);
        dispatch({ type: "SET_STATE", state: loaded });
        setShowSaveList(false);
      }
    },
    [dispatch],
  );

  const handleDeleteSave = useCallback(async (id: string) => {
    await persistence.deleteSave(id);
    // Refresh from the persisted index so the manager reflects reality.
    setSaveList(await persistence.listSaves());
  }, []);

  const handleSaveGame = useCallback(async () => {
    if (!state) return;
    await persistence.save(state);
  }, [state]);

  /* ── Cycle Commit ──
     Single shared commit path for every player action. Snapshots resources for
     delta display, runs the atomic cycle, and on success advances state + shows
     the report; on failure surfaces the engine's error message to the player
     (replacing the previous silent-failure behaviour). onCommit carries any
     per-handler success side-effect (e.g. closing a panel). */

  const commitActions = useCallback(
    (
      actions: { type: string; details?: Record<string, unknown> }[],
      onCommit?: () => void,
    ) => {
      if (!state) return;

      // Snapshot previous resources for delta display
      const playerEmpire = state.empires.get(state.playerEmpireId);
      if (playerEmpire) {
        setPrevResources({ ...playerEmpire.resources });
      }

      const result = processCycle(
        state,
        { actions },
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
        setCommitError(null);
        onCommit?.();
      } else {
        setCommitError(result.error ?? "Cycle failed to commit.");
      }
    },
    [state, dispatch],
  );

  /* ── Enqueue helper ──
     Every player action now queues instead of committing. Labels are built
     from `state` at enqueue time; per-handler side-effects (e.g. closing a
     panel) run via the `after` callback. Ids come from a ref counter so the
     pure orders module stays deterministic. */
  const enqueue = useCallback(
    (
      type: string,
      details: Record<string, unknown>,
      label: string,
      after?: () => void,
    ) => {
      const id = `ord-${orderSeqRef.current++}`;
      setOrders((prev) => enqueueOrder(prev, { id, type, details, label }));
      after?.();
    },
    [],
  );

  const handleRemoveOrder = useCallback((id: string) => {
    setOrders((prev) => removeOrder(prev, id));
  }, []);

  const handleClearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  /* ── Commit Cycle ──
     Flushes the queued orders through the shared commit path. On success
     `commitActions` advances the cycle once, shows one report, and the
     onCommit callback clears the queue; on failure the banner shows and the
     queue is preserved. Committing an empty queue is a legal "pass" but
     requires a confirming second click (auto-reverting after 3s). */
  const handleCommitCycle = useCallback(() => {
    if (orders.length > 0) {
      if (passTimerRef.current) clearTimeout(passTimerRef.current);
      setPendingPass(false);
      commitActions(toEngineActions(orders), () => setOrders([]));
      return;
    }

    // Empty queue → two-click confirm for a bare pass.
    if (!pendingPass) {
      setPendingPass(true);
      passTimerRef.current = setTimeout(() => setPendingPass(false), 3000);
      return;
    }
    if (passTimerRef.current) clearTimeout(passTimerRef.current);
    setPendingPass(false);
    commitActions([], () => setOrders([]));
  }, [orders, pendingPass, commitActions]);

  const systemName = useCallback(
    (systemId: string) => state?.galaxy.systems.get(systemId as SystemId)?.name ?? systemId,
    [state],
  );
  const empireName = useCallback(
    (empireId: string) => state?.empires.get(empireId as EmpireId)?.name ?? empireId,
    [state],
  );

  /* ── Colonise Action ── */

  const handleColonise = useCallback((systemId: SystemId) => {
    enqueue("claim-system", { systemId }, `COLONISE ${systemName(systemId)}`, () => setSelectedSystemId(null));
  }, [enqueue, systemName]);

  /* ── Attack Action ── */

  const handleAttack = useCallback((systemId: SystemId, unitIds: string[]) => {
    enqueue(
      "attack",
      { targetSystemId: systemId, unitIds },
      `ATTACK ${systemName(systemId)} ×${unitIds.length}`,
      () => setSelectedSystemId(null),
    );
  }, [enqueue, systemName]);

  /* ── Build Installation Action ── */

  const handleBuildInstallation = useCallback((systemId: SystemId, installationType: InstallationType) => {
    // Keep system panel open so player sees new condition (no side-effect).
    enqueue(
      "build-installation",
      { systemId, installationType },
      `BUILD ${installationType} @ ${systemName(systemId)}`,
    );
  }, [enqueue, systemName]);

  /* ── Trade Action ── */

  const handleTrade = useCallback((resource: "food" | "ore" | "fuelCells", quantity: number, direction: "buy" | "sell") => {
    // Label MUST match orders.ts mergeLabel so merges stay consistent.
    enqueue(
      "trade",
      { resource, quantity, direction },
      `${direction === "buy" ? "BUY" : "SELL"} ${quantity} ${resource.toUpperCase()}`,
    );
  }, [enqueue]);

  const handleBuildWormhole = useCallback((targetSystemId: string) => {
    enqueue(
      "build-wormhole",
      { targetSystemId },
      `WORMHOLE → ${systemName(targetSystemId)}`,
      () => setSelectedSystemId(null),
    );
  }, [enqueue, systemName]);

  /* ── Research Actions ── */

  const handleResearch = useCallback(() => {
    enqueue("research", {}, "RESEARCH");
  }, [enqueue]);

  const handleSelectDoctrine = useCallback((pathId: string) => {
    enqueue("select-doctrine", { pathId }, `DOCTRINE: ${pathId}`);
  }, [enqueue]);

  const handleSelectSpecialization = useCallback((specId: string) => {
    enqueue("select-specialization", { specId }, `SPECIALIZATION: ${specId}`);
  }, [enqueue]);

  /* ── Diplomacy Actions ── */

  const handleProposePact = useCallback((targetId: string, type: "stillness-accord" | "star-covenant") => {
    enqueue("propose-pact", { targetId, type }, `PACT (${type}) → ${empireName(targetId)}`);
  }, [enqueue, empireName]);

  const handleBreakPact = useCallback((pactId: string) => {
    enqueue("break-pact", { pactId }, `BREAK PACT ${pactId}`);
  }, [enqueue]);

  /* ── Military Actions ── */

  const handleBuildUnit = useCallback((unitTypeId: string) => {
    const unitTypeName = state?.unitTypes.get(unitTypeId)?.name ?? unitTypeId;
    enqueue("build-unit", { unitTypeId }, `BUILD ${unitTypeName}`);
  }, [enqueue, state]);

  const handleMoveFleet = useCallback((fleetId: string, targetSystemId: string) => {
    const fleetName = state?.fleets.get(fleetId)?.name ?? fleetId;
    enqueue(
      "move-fleet",
      { fleetId, targetSystemId },
      `MOVE ${fleetName} → ${systemName(targetSystemId)}`,
    );
  }, [enqueue, state, systemName]);

  /* ── Syndicate Actions ── */

  const handleFundSyndicate = useCallback((amount: number) => {
    // Label MUST match orders.ts mergeLabel so merges stay consistent.
    enqueue("fund-syndicate", { amount }, `FUND SYNDICATE — ${amount} CT`);
  }, [enqueue]);

  const handlePurchaseBlackRegister = useCallback((itemId: string) => {
    enqueue("purchase-black-register", { itemId }, `BLACK REGISTER: ${itemId}`);
  }, [enqueue]);

  /* ── Covert Actions ── */

  const handleLaunchOperation = useCallback((targetId: string, opType: string) => {
    enqueue("launch-covert-op", { targetId, opType }, `COVERT ${opType} → ${empireName(targetId)}`);
  }, [enqueue, empireName]);

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
            <button className="title-btn title-btn--secondary" onClick={handleOpenSaveList}>
              CONTINUE
            </button>
          </div>
          <p className="title-screen__ver">Engine v0.9 — 934 Tests Passing</p>
        </div>
        {showSaveList && (
          <SaveSlotManager
            saves={saveList}
            onLoad={handleLoadSave}
            onDelete={handleDeleteSave}
            onClose={() => setShowSaveList(false)}
          />
        )}
      </div>
    );
  }

  /* ── Render: Game ── */

  // Surface a combat event involving the player from the committed report.
  const playerCombatEvent = cycleReport?.events.find(
    (e): e is CombatEvent =>
      e.type === "combat" &&
      (e.attackerId === state?.playerEmpireId || e.defenderId === state?.playerEmpireId),
  );

  // Surface a convergence alert (a rival nearing victory) as a HUD banner.
  const convergenceEvent = cycleReport?.events.find(
    (e): e is ConvergenceAlertEvent => e.type === "convergence-alert",
  );
  const convergenceEmpireName = convergenceEvent
    ? state?.empires.get(convergenceEvent.empireId)?.name ?? convergenceEvent.empireId
    : "";
  const convergenceAchievementName = convergenceEvent
    ? ACHIEVEMENT_DEFINITIONS.find((d) => d.id === convergenceEvent.achievementId)?.name ??
      convergenceEvent.achievementId
    : "";

  return (
    <div className="shell">
      <div className="lcars-bar top" />
      <div className="lcars-bar bottom" />
      <div className="lcars-bar side" />

      <StarMap
        galaxy={state!.galaxy}
        playerEmpireId={state!.playerEmpireId}
        empires={state!.empires}
        diplomacy={state!.diplomacy}
        onSelectSystem={(id) => {
          setSelectedSystemId(id);
          if (id) setSelectedSectorId(null);
        }}
        onSelectSector={(id) => {
          setSelectedSectorId(id);
          if (id) setSelectedSystemId(null);
        }}
      />

      <HUD
        state={state!}
        onCommitCycle={handleCommitCycle}
        orderCount={orders.length}
        pendingPass={pendingPass}
        onOpenEmpire={() => setActivePanel("empire")}
        onOpenMilitary={() => setActivePanel("military")}
        onOpenMarket={() => setActivePanel("market")}
        onOpenDiplomacy={() => setActivePanel("diplomacy")}
        onOpenResearch={() => setActivePanel("research")}
        onOpenSyndicate={() => setActivePanel("syndicate")}
        onOpenCovert={() => setActivePanel("covert")}
        onSaveGame={handleSaveGame}
      />

      {/* Orders queue tray — docked below the HUD top bar. Shows the actions
          queued this cycle; flushed to the engine on COMMIT CYCLE. */}
      <OrdersQueue
        orders={orders}
        onRemove={handleRemoveOrder}
        onClearAll={handleClearOrders}
      />

      {/* Convergence alert HUD banner — a rival nearing a victory achievement.
          Dismissal is keyed off the report identity so a new report re-shows it. */}
      {convergenceEvent && dismissedConvergence !== cycleReport && (
        <ConvergenceAlert
          event={convergenceEvent}
          empireName={convergenceEmpireName}
          achievementName={convergenceAchievementName}
          onDismiss={() => setDismissedConvergence(cycleReport)}
        />
      )}

      {/* Commit error HUD banner — surfaces a failed (Tier-1 atomic) cycle
          commit so the failure is no longer silent. */}
      {commitError && (
        <CommitErrorBanner message={commitError} onDismiss={() => setCommitError(null)} />
      )}

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
          summary={ordersSummary}
          onClose={() => setActivePanel(null)}
          onTrade={handleTrade}
        />
      )}

      {activePanel === "military" && (
        <MilitaryPanel
          state={state!}
          summary={ordersSummary}
          onClose={() => setActivePanel(null)}
          onBuildUnit={handleBuildUnit}
          onMoveFleet={handleMoveFleet}
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
          summary={ordersSummary}
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
          summary={ordersSummary}
          onClose={() => setSelectedSystemId(null)}
          onColonise={handleColonise}
          onBuild={handleBuildInstallation}
          onBuildWormhole={handleBuildWormhole as any}
          onAttack={handleAttack as any}
        />
      )}

      {/* Sector panel on sector-region click */}
      {selectedSectorId && (
        <SectorPanel
          sectorId={selectedSectorId}
          state={state!}
          onClose={() => setSelectedSectorId(null)}
        />
      )}

      {/* Cycle report modal */}
      {cycleReport && (
        <CycleReportModal
          report={cycleReport}
          onClose={() => setCycleReport(null)}
        />
      )}

      {/* Combat report modal — stacked above the cycle report when the
          committed report contains a combat event involving the player.
          Dismissal is keyed off the report identity so a new report
          (a new object reference) re-shows the modal automatically. */}
      {playerCombatEvent && dismissedCombatReport !== cycleReport && (
        <CombatReportModal
          event={playerCombatEvent}
          playerEmpireId={state!.playerEmpireId}
          onClose={() => setDismissedCombatReport(cycleReport)}
        />
      )}
    </div>
  );
}

export default App;
