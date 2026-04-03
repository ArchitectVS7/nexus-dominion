import type { BotAgent, Archetype, BotAction, BotActionType, Emotion, EmotionalState } from "../types/bot";
import type { DiplomacyState } from "../types/diplomacy";
import type { EmpireId, PactId } from "../types/ids";
import type { GameState } from "../types/game-state";
import type { UnitType } from "../types/military";
import type { GameEvent } from "../types/events";
import { SeededRNG } from "../utils/rng";
import { relationshipKey } from "../types/diplomacy";
import { checkMutualDefense, getTradeDiscount, getCoalitionCombatBonus, declareWar } from "../diplomacy/diplomacy-engine";
import { sellResource } from "../market/market-engine";
import { resolveFullCombat, applyInfrastructureDamage } from "../combat/combat-resolver";
import { addToInstallationQueue, INSTALLATION_COSTS } from "../installation/installation-registry";
import type { InstallationType } from "../types/galaxy";
import { advanceResearch, checkResearchDraftTrigger, autoselectDoctrine, autoselectSpecialization, selectDoctrine, selectSpecialization } from "../research/research-engine";
import { fetchApexBotActionsSync } from "./llm-connector";

/** Turn ratio tiers as defined in PRD §6 */
export const MOMENTUM_TIERS = {
  fodder: { min: 0.5, max: 0.75 },
  standard: { min: 1.0, max: 1.0 },
  elite: { min: 1.25, max: 1.5 },
  nemesis: { min: 2.0, max: 2.0 },
} as const;

export type MomentumTier = keyof typeof MOMENTUM_TIERS;

export const ALL_ARCHETYPES: Archetype[] = [
  "warlord", "diplomat", "merchant", "schemer",
  "turtle", "blitzkrieg", "tech-rush", "opportunist",
];

/** Priority weights for each archetype's action preferences */
const ARCHETYPE_PRIORITIES: Record<Archetype, Partial<Record<BotActionType, number>>> = {
  warlord: { attack: 5, "build-unit": 4, "claim-system": 2 },
  diplomat: { "propose-pact": 5, trade: 3, "claim-system": 2 },
  merchant: { trade: 5, "claim-system": 3, "build-installation": 3 },
  schemer: { "propose-pact": 4, "break-pact": 3, attack: 2 },
  turtle: { "build-installation": 5, "build-unit": 4, "claim-system": 2 },
  blitzkrieg: { attack: 5, "claim-system": 4, "build-unit": 3 },
  "tech-rush": { "build-installation": 4, trade: 3, "claim-system": 2 },
  opportunist: { "claim-system": 4, trade: 3, attack: 3, "propose-pact": 2 },
};

/**
 * Determine how many actions a bot gets this cycle, based on momentum rating.
 * Uses accumulation: fractional actions carry over.
 */
export function botActionsThisCycle(
  momentumRating: number,
  accumulatedActions: number,
): { actions: number; newAccumulated: number } {
  const total = accumulatedActions + momentumRating;
  const actions = Math.floor(total);
  return { actions, newAccumulated: total - actions };
}

/**
 * Select a bot action type based on archetype priorities + emotional modifiers.
 * Modifiers scale with resonance: at resonance 1.0 full effect, at 0.5 half effect.
 */
export function selectActionType(
  bot: BotAgent,
  rng: SeededRNG,
): BotActionType {
  const priorities = { ...ARCHETYPE_PRIORITIES[bot.archetype] };

  // Emotional modifiers scaled by resonance intensity
  const resonance = bot.emotionalState.resonance ?? 1.0;
  const scale = (base: number) => Math.round(base * resonance);

  if (bot.emotionalState.current === "aggressive") {
    priorities.attack = (priorities.attack ?? 0) + scale(3);
  } else if (bot.emotionalState.current === "fearful") {
    priorities["build-unit"] = (priorities["build-unit"] ?? 0) + scale(3);
    priorities["propose-pact"] = (priorities["propose-pact"] ?? 0) + scale(2);
  } else if (bot.emotionalState.current === "ambitious") {
    priorities["claim-system"] = (priorities["claim-system"] ?? 0) + scale(3);
  } else if (bot.emotionalState.current === "vengeful") {
    priorities.attack = (priorities.attack ?? 0) + scale(4);
    priorities["break-pact"] = (priorities["break-pact"] ?? 0) + scale(2);
  }

  const types = Object.keys(priorities) as BotActionType[];
  const weights = types.map((t) => priorities[t] ?? 0);
  return rng.weighted(types, weights);
}

/**
 * Generate bot actions for one cycle. Deterministic given the same RNG state.
 */
export function generateBotActions(
  bot: BotAgent,
  actionCount: number,
  rng: SeededRNG,
  gameState?: GameState, // Optional: needed for Apex bots to consider world state
): BotAction[] {
  // If Apex tier, attempt high-intelligence selection (synchronous simulated API)
  if (bot.intelligenceTier === 1 && gameState) {
      try {
          return fetchApexBotActionsSync(bot, gameState, actionCount, rng);
      } catch (e) {
          console.error(`Apex Bot API failed for ${bot.empireId}:`, e);
      }
  }

  // Classic fallback: weighted random by archetype
  const actions: BotAction[] = [];
  for (let i = 0; i < actionCount; i++) {
    const type = selectActionType(bot, rng);
    actions.push({
      type,
      empireId: bot.empireId,
    });
  }
  return actions;
}

/**
 * Update bot emotional state based on events.
 * Returns updated EmotionalState with resonance set to 1.0 when a new emotion triggers.
 */
export function updateEmotion(
  state: EmotionalState,
  wasAttacked: boolean,
  lostSystem: boolean,
  gainedSystem: boolean,
  highPower: boolean,
  currentCycle: number,
): EmotionalState {
  let next: Emotion;
  if (wasAttacked && lostSystem) next = "desperate";
  else if (wasAttacked) next = "fearful";
  else if (lostSystem) next = "vengeful";
  else if (gainedSystem && highPower) next = "ambitious";
  else if (gainedSystem) next = "calm";
  else return state; // no change

  const trigger = wasAttacked ? "attacked" : lostSystem ? "lost-system" : "gained-system";
  return {
    current: next,
    trigger,
    lastUpdatedCycle: currentCycle,
    resonance: next === "calm" ? 0.0 : 1.0,
  };
}

/**
 * Check if a bot has relationship memory with another empire.
 */
export function hasRelationshipMemory(
  diplomacy: DiplomacyState,
  empireA: EmpireId,
  empireB: EmpireId,
): boolean {
  const key = relationshipKey(empireA, empireB);
  return diplomacy.relationships.has(key);
}

/* ── Bot Action Resolution ── */

const COLONISATION_COST = 50;
const BETRAYAL_THRESHOLD = 15;

/**
 * Execute a single bot action against game state. Returns generated events.
 * Mutates state directly (caller is expected to work on a clone).
 */
export function executeBotAction(
  action: BotAction,
  state: GameState,
  unitTypes: Map<string, UnitType>,
  rng: SeededRNG,
): GameEvent[] {
  const empire = state.empires.get(action.empireId);
  if (!empire) return [];

  switch (action.type) {
    case "claim-system":
      return executeClaimSystem(action, state, empire);
    case "build-unit":
      return executeBuildUnit(action, state, empire, unitTypes);
    case "trade":
      return executeTrade(action, state, empire);
    case "build-installation":
      return executeBuildInstallation(action, state, empire);
    case "attack":
      return executeAttack(action, state, empire, unitTypes, rng);
    case "research":
      return executeBotResearch(action, state, empire, rng);
    default:
      return [];
  }
}

function executeClaimSystem(
  action: BotAction,
  state: GameState,
  empire: typeof state.empires extends Map<any, infer V> ? V : never,
): GameEvent[] {
  const targetId = action.targetSystemId;
  if (!targetId) return [];

  const system = state.galaxy.systems.get(targetId);
  if (!system || system.owner) return [];

  if (empire.resources.credits < COLONISATION_COST) return [];

  system.owner = action.empireId;
  system.claimedCycle = state.time.currentCycle;
  empire.systemIds.push(targetId);
  empire.resources.credits -= COLONISATION_COST;

  return [{
    type: "colonisation",
    empireId: action.empireId,
    systemId: targetId,
    cycle: state.time.currentCycle,
    cost: COLONISATION_COST,
  }];
}

function executeBuildUnit(
  action: BotAction,
  state: GameState,
  empire: typeof state.empires extends Map<any, infer V> ? V : never,
  unitTypes: Map<string, UnitType>,
): GameEvent[] {
  const unitTypeId = (action.details?.unitTypeId as string) ?? "fighter";
  const utype = unitTypes.get(unitTypeId);
  if (!utype) return [];
  if (empire.resources.credits < utype.buildCost) return [];

  empire.resources.credits -= utype.buildCost;
  if (!empire.buildQueue) empire.buildQueue = [];
  empire.buildQueue.push({
    unitTypeId,
    systemId: empire.homeSystemId,
    startCycle: state.time.currentCycle,
    completionCycle: state.time.currentCycle + utype.buildTime,
  });

  return [];
}

function executeBotResearch(
  _action: BotAction,
  state: GameState,
  empire: typeof state.empires extends Map<any, infer V> ? V : never,
  rng: SeededRNG,
): GameEvent[] {
  const bot = state.bots.get(empire.id);
  const result = advanceResearch(empire.researchTier, empire.resources.researchPoints);
  if (!result) return [];

  const previousTier = empire.researchTier;
  empire.researchTier = result.newTier;
  empire.resources.researchPoints -= result.pointsConsumed;

  const draftKind = checkResearchDraftTrigger(empire, previousTier, result.newTier);
  const events: GameEvent[] = [{
    type: "research",
    empireId: empire.id,
    cycle: state.time.currentCycle,
    newTier: result.newTier,
  }];

  if (bot && draftKind === "doctrine") {
    const pathId = autoselectDoctrine(bot.archetype, rng);
    selectDoctrine(empire, pathId);
    events[0] = { ...events[0], pathId } as typeof events[0];
  } else if (bot && draftKind === "specialization" && empire.researchPath) {
    const specId = autoselectSpecialization(bot.archetype, empire.researchPath, rng);
    if (specId) selectSpecialization(empire, specId);
    if (specId) events[0] = { ...events[0], specializationId: specId } as typeof events[0];
  }

  return events;
}

function executeBuildInstallation(
  _action: BotAction,
  state: GameState,
  empire: typeof state.empires extends Map<any, infer V> ? V : never,
): GameEvent[] {
  // Pick a type bot can afford
  const affordableTypes = (Object.keys(INSTALLATION_COSTS) as InstallationType[])
    .filter(t => empire.resources.credits >= INSTALLATION_COSTS[t].credits);
  if (affordableTypes.length === 0) return [];

  // Find an owned system with an empty slot for this type
  for (const installationType of affordableTypes) {
    for (const systemId of empire.systemIds) {
      const system = state.galaxy.systems.get(systemId);
      if (!system) continue;
      const success = addToInstallationQueue(empire, installationType, system, systemId, state.time.currentCycle);
      if (success) return [];
    }
  }
  return [];
}

function executeTrade(
  action: BotAction,
  state: GameState,
  empire: typeof state.empires extends Map<any, infer V> ? V : never,
): GameEvent[] {
  if (!state.market || !state.market.prices) return [];
  const resource = (action.details?.resource as string) ?? "ore";
  const quantity = (action.details?.quantity as number) ?? 10;
  const direction = (action.details?.direction as string) ?? "sell";

  // Ensure cycleVolume is present
  if (!state.market.cycleVolume) {
    state.market.cycleVolume = { food: 0, ore: 0, fuelCells: 0 };
  }

  const tradeDiscount = getTradeDiscount(empire.id, state.diplomacy);

  if (direction === "sell") {
    const available = (empire.resources as unknown as Record<string, number>)[resource] ?? 0;
    const result = sellResource(
      resource as any,
      quantity,
      state.market.prices as any,
      available,
      { sellBonus: tradeDiscount },
    );
    if (result) {
      (empire.resources as unknown as Record<string, number>)[resource] -= result.quantitySold;
      empire.resources.credits += result.creditsEarned;
      if (resource in state.market.cycleVolume) {
        (state.market.cycleVolume as Record<string, number>)[resource] -= result.quantitySold;
      }
    }
  }

  return [];
}

function executeAttack(
  action: BotAction,
  state: GameState,
  empire: typeof state.empires extends Map<any, infer V> ? V : never,
  unitTypes: Map<string, UnitType>,
  rng: SeededRNG,
): GameEvent[] {
  const targetSystemId = action.targetSystemId;
  if (!targetSystemId) return [];

  const targetSystem = state.galaxy.systems.get(targetSystemId);
  if (!targetSystem || !targetSystem.owner || targetSystem.owner === action.empireId) return [];

  const defenderId = targetSystem.owner;

  // Build attacker force ONLY from fleets currently at the target system
  const attackerFleetsAtSystem = [...state.fleets.values()]
    .filter(f => f.ownerId === action.empireId && f.locationSystemId === targetSystemId && !f.targetSystemId);
  
  const attackerUnitIds = attackerFleetsAtSystem.flatMap(f => f.unitIds);
  const attackerUnits = attackerUnitIds
    .map(id => state.units.get(id))
    .filter((u): u is typeof state.units extends Map<any, infer V> ? V : never => u !== undefined)
    .map(u => ({ id: u.id, typeId: u.typeId, currentHp: u.currentHp }));

  if (attackerUnits.length === 0) return [];

  // Build defender force from fleets currently at the target system
  const defenderFleetsAtSystem = [...state.fleets.values()]
    .filter(f => f.ownerId === defenderId && f.locationSystemId === targetSystemId);

  const defenderUnitIds = defenderFleetsAtSystem.flatMap(f => f.unitIds);
  const defenderUnits = defenderUnitIds
    .map(id => state.units.get(id))
    .filter((u): u is typeof state.units extends Map<any, infer V> ? V : never => u !== undefined)
    .map(u => ({ id: u.id, typeId: u.typeId, currentHp: u.currentHp }));

  // Add obligated ally units (coalition defence)
  const alliedDefenderIds = checkMutualDefense(action.empireId, defenderId, state.diplomacy);
  for (const allyId of alliedDefenderIds) {
    const allyUnits = [...state.units.values()]
      .filter(u => {
        const fleet = [...state.fleets.values()].find(f => f.unitIds.includes(u.id));
        return fleet?.ownerId === allyId;
      })
      .map(u => ({ id: u.id, typeId: u.typeId, currentHp: u.currentHp }));
    defenderUnits.push(...allyUnits);
  }

  // Compute coalition combat bonus for attacker
  const coalitionBonus = getCoalitionCombatBonus(action.empireId, defenderId, state.diplomacy);
  const combatOptions = coalitionBonus > 0 ? { coalitionBonus } : undefined;

  const attackerForce = { empireId: action.empireId, units: attackerUnits, isDefender: false };
  const defenderForce = { empireId: defenderId, units: defenderUnits, isDefender: true };

  const results = resolveFullCombat(attackerForce, defenderForce, targetSystemId, unitTypes, rng, combatOptions);

  // Apply infrastructure damage from orbital bombardment phase
  for (const result of results) {
    if ((result.infrastructureDamage ?? 0) > 0) {
      applyInfrastructureDamage(targetSystem, result.infrastructureDamage!, rng);
    }
  }

  // Transfer system ownership if attacker won ground phase
  const groundResult = results.find(r => r.phase === "ground-assault");
  if (groundResult?.victor === action.empireId && groundResult.systemCaptured) {
    const defenderEmpire = state.empires.get(defenderId);
    if (defenderEmpire) {
      defenderEmpire.systemIds = defenderEmpire.systemIds.filter(id => id !== targetSystemId);
    }
    empire.systemIds.push(targetSystemId);
    targetSystem.owner = action.empireId;
    targetSystem.claimedCycle = state.time.currentCycle;
  }

  const combatEvents: GameEvent[] = results.map(r => ({
    type: "combat" as const,
    cycle: state.time.currentCycle,
    result: r,
  }));

  // Auto-declare war between attacker and each allied defender
  for (const allyId of alliedDefenderIds) {
    const warResult = declareWar(action.empireId, allyId, state.time.currentCycle, state.diplomacy);
    state.diplomacy = warResult.diplomacy;
  }

  // Emit coalition-formed event for each ally that joined the defence
  const coalitionEvents: GameEvent[] = alliedDefenderIds.map(allyId => ({
    type: "diplomacy" as const,
    cycle: state.time.currentCycle,
    action: "coalition-formed" as const,
    involvedEmpires: [allyId, defenderId],
  }));

  return [...combatEvents, ...coalitionEvents];
}

/* ── Emotional Decay ── */

export const RESONANCE_DECAY_RATE = 0.1; // decays from 1.0 to 0.0 in 10 cycles

/**
 * Decay bot emotional resonance toward 0.0 each cycle.
 * When resonance reaches 0, emotion returns to calm.
 * Continuous decay replaces the prior binary threshold.
 */
export function decayEmotion(
  emotionalState: EmotionalState,
  currentCycle: number,
): EmotionalState {
  if (emotionalState.current === "calm") return emotionalState;
  const elapsed = currentCycle - emotionalState.lastUpdatedCycle;
  const newResonance = Math.max(0, 1.0 - elapsed * RESONANCE_DECAY_RATE);
  if (newResonance === 0) {
    return { current: "calm", trigger: "decay", lastUpdatedCycle: currentCycle, resonance: 0.0 };
  }
  return { ...emotionalState, resonance: newResonance };
}

/* ── Schemer Betrayal Clock ── */

/**
 * Advance the Schemer's betrayal clock. Non-schemers always return false.
 * Clock increments each cycle; when it reaches threshold, betrayal triggers.
 */
export function advanceBetrayalClock(
  bot: BotAgent,
  diplomacy: DiplomacyState,
  _currentCycle: number,
): { shouldBetray: boolean; targetPactId: PactId | null } {
  if (bot.archetype !== "schemer") {
    return { shouldBetray: false, targetPactId: null };
  }

  bot.betrayalClock = (bot.betrayalClock ?? 0) + 1;

  if (bot.betrayalClock >= BETRAYAL_THRESHOLD) {
    // Find an active pact to betray
    for (const [, pact] of diplomacy.pacts) {
      if (pact.active && pact.memberIds.includes(bot.empireId)) {
        bot.betrayalClock = 0;
        return { shouldBetray: true, targetPactId: pact.id };
      }
    }
  }

  return { shouldBetray: false, targetPactId: null };
}
