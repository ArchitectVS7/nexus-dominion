import type { GameState } from "../types/game-state";
import type { Empire, Resources } from "../types/empire";
import type { GameEvent, CycleReport } from "../types/events";
import type { EmpireId } from "../types/ids";
import type { BotAction } from "../types/bot";
import { STABILITY_MULTIPLIERS } from "../types/empire";
import { SeededRNG } from "../utils/rng";
import { advanceCycle, getResolutionOrder } from "../nexus/nexus-engine";
import { calculateProduction, calculateMilitaryMaintenance, applyResourceCycle } from "../economy/economy-engine";
import { botActionsThisCycle, generateBotActions } from "../bot/bot-engine";
import { checkAchievements, type AchievementContext } from "../achievement/achievement-checker";

export interface PlayerActions {
  /** Actions queued by the player for this cycle */
  actions: { type: string; details?: Record<string, unknown> }[];
}

export interface CycleResult {
  /** The updated game state after the cycle */
  state: GameState;
  /** The cycle report for the UI */
  report: CycleReport;
  /** Whether the cycle was successfully committed (atomicity) */
  committed: boolean;
}

/**
 * Process one complete game cycle. This is the main game loop entry point.
 *
 * REQ-001: Player submits a Cycle, engine resolves all actions and returns updated state.
 * REQ-002: Bot actions resolved per Momentum Rating.
 * REQ-003: Cycle processing is atomic — state is fully resolved or not committed.
 */
export function processCycle(
  currentState: GameState,
  playerActions: PlayerActions,
  powerHistory: Map<EmpireId, number[]>,
  botAccumulated: Map<EmpireId, number>,
): CycleResult {
  // Clone state for atomicity — if anything fails, original is untouched
  const state = deepCloneState(currentState);
  const events: GameEvent[] = [];

  try {
    // 1. Advance time + check for Nexus Reckoning
    const timeResult = advanceCycle(state.time, state.empires, powerHistory);
    state.time = timeResult.time;
    if (timeResult.reckoningEvent) {
      events.push(timeResult.reckoningEvent);
    }

    // 2. Get resolution order from Cosmic Order
    const rng = new SeededRNG(state.campaign.seed + state.time.currentCycle);
    const resolutionOrder = getResolutionOrder(
      state.time.cosmicOrder,
      (arr) => rng.shuffle([...arr]),
    );

    // 3. Resolve actions in Cosmic Order (Stricken → Ascendant → Sovereign)
    for (const empireId of resolutionOrder) {
      const empire = state.empires.get(empireId);
      if (!empire) continue;

      if (empire.isPlayer) {
        // Process player actions
        resolvePlayerActions(state, empire, playerActions);
      } else {
        // Process bot actions per momentum rating
        const bot = state.bots.get(empireId);
        if (bot) {
          const acc = botAccumulated.get(empireId) ?? 0;
          const { actions, newAccumulated } = botActionsThisCycle(bot.momentumRating, acc);
          botAccumulated.set(empireId, newAccumulated);

          if (actions > 0) {
            const botRng = new SeededRNG(state.campaign.seed + state.time.currentCycle * 1000 + simpleHash(empireId));
            const botActions = generateBotActions(bot, actions, botRng);
            resolveBotActions(state, empire, botActions);
          }
        }
      }

      // 4. Process economy for each empire
      const ownedSystems = [...state.galaxy.systems.values()].filter(
        (s) => s.owner === empireId,
      );
      const empireUnits = [...state.units.values()].filter((u) => {
        const fleet = [...state.fleets.values()].find((f) => f.unitIds.includes(u.id));
        return fleet?.ownerId === empireId;
      });

      const multiplier = STABILITY_MULTIPLIERS[empire.stabilityLevel];
      const production = calculateProduction(ownedSystems, multiplier);
      const maintenance = calculateMilitaryMaintenance(empireUnits, state.unitTypes);

      const net: Resources = {
        credits: production.credits - maintenance.credits,
        food: production.food - maintenance.food - Math.ceil(empire.population / 100),
        ore: production.ore - maintenance.ore,
        fuelCells: production.fuelCells - maintenance.fuelCells,
        researchPoints: production.researchPoints - maintenance.researchPoints,
        intelligencePoints: production.intelligencePoints - maintenance.intelligencePoints,
      };

      const { newReserves, deficits } = applyResourceCycle(empire.resources, net);
      empire.resources = newReserves;

      if (deficits.length > 0) {
        events.push({
          type: "resource",
          empireId,
          cycle: state.time.currentCycle,
          deltas: net,
          deficits,
        });
      }

      // Update power score
      empire.powerScore =
        empire.systemIds.length * 10 +
        empire.resources.credits * 0.1 +
        empire.researchTier * 20;
    }

    // 5. Check achievements
    const achievementCtx: AchievementContext = {
      totalEmpires: state.empires.size,
      eliminatedCount: 0,
      maxResearchTier: 8,
      empireNetWorth: new Map(
        [...state.empires.entries()].map(([id, e]) => [id, e.powerScore]),
      ),
      coalitionsSurvived: new Map(),
      syndicateController: null,
      syndicateExposed: new Set(),
      earnedAchievements: new Map(),
    };

    const achievementEvents = checkAchievements(
      state.empires,
      state.galaxy,
      achievementCtx,
      new Map(), // TODO: track earned achievements in state
    );
    for (const ae of achievementEvents) {
      ae.cycle = state.time.currentCycle;
      events.push(ae);
    }

    // 6. Build cycle report
    const playerEmpire = state.empires.get(state.playerEmpireId);
    const report: CycleReport = {
      cycle: state.time.currentCycle,
      events,
      playerResourceDeltas: playerEmpire
        ? {
            credits: playerEmpire.resources.credits - (currentState.empires.get(state.playerEmpireId)?.resources.credits ?? 0),
            food: playerEmpire.resources.food - (currentState.empires.get(state.playerEmpireId)?.resources.food ?? 0),
          }
        : {},
      reckoningOccurred: timeResult.reckoningEvent !== null,
    };

    state.currentCycleEvents = events;

    return { state, report, committed: true };
  } catch {
    // Atomic: return original state unchanged
    return {
      state: currentState,
      report: {
        cycle: currentState.time.currentCycle,
        events: [],
        playerResourceDeltas: {},
        reckoningOccurred: false,
      },
      committed: false,
    };
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function resolvePlayerActions(
  _state: GameState,
  _empire: Empire,
  _actions: PlayerActions,
): void {
  // Individual action resolution will be implemented per action type
  // For now, the structure supports queuing and committing
}

function resolveBotActions(
  _state: GameState,
  _empire: Empire,
  _actions: BotAction[],
): void {
  // Individual bot action resolution will be implemented per action type
}

/**
 * Deep clone game state for atomic processing.
 */
function deepCloneState(state: GameState): GameState {
  return {
    galaxy: {
      systems: new Map(
        [...state.galaxy.systems.entries()].map(([k, v]) => [k, { ...v, adjacentSystemIds: [...v.adjacentSystemIds], slots: [...v.slots] }]),
      ),
      sectors: new Map(
        [...state.galaxy.sectors.entries()].map(([k, v]) => [k, { ...v, systemIds: [...v.systemIds] }]),
      ),
    },
    empires: new Map(
      [...state.empires.entries()].map(([k, v]) => [k, { ...v, resources: { ...v.resources }, systemIds: [...v.systemIds], fleetIds: [...v.fleetIds] }]),
    ),
    playerEmpireId: state.playerEmpireId,
    unitTypes: new Map(state.unitTypes),
    units: new Map([...state.units.entries()].map(([k, v]) => [k, { ...v }])),
    fleets: new Map([...state.fleets.entries()].map(([k, v]) => [k, { ...v, unitIds: [...v.unitIds] }])),
    bots: new Map([...state.bots.entries()].map(([k, v]) => [k, { ...v, emotionalState: { ...v.emotionalState }, persona: { ...v.persona } }])),
    diplomacy: {
      pacts: new Map(state.diplomacy.pacts),
      coalitions: new Map(state.diplomacy.coalitions),
      relationships: new Map(state.diplomacy.relationships),
    },
    time: { ...state.time, cosmicOrder: { tiers: new Map(state.time.cosmicOrder.tiers), rankings: [...state.time.cosmicOrder.rankings] } },
    currentCycleEvents: [],
    campaign: { ...state.campaign },
  };
}
