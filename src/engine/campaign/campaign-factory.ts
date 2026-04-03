/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Campaign Factory

   Creates a fully initialized GameState from a GalaxyConfig.
   This is the single entry point for starting a new campaign.
   ══════════════════════════════════════════════════════════════ */

import type { GameState, CampaignMeta, MarketState } from "../types/game-state";
import type { Empire, Resources } from "../types/empire";
import type { BotAgent, Archetype, Emotion } from "../types/bot";
import { EmpireId, SystemId, FleetId } from "../types/ids";
import { GalaxyGenerator } from "../galaxy/galaxy-generator";
import { createUnitTypeRegistry } from "../military/unit-registry";
import { SeededRNG } from "../utils/rng";
import type { GalaxyConfig } from "../types/galaxy";
import type { Fleet } from "../types/military";
import type { DiplomacyState } from "../types/diplomacy";
import type { TimeState } from "../types/time";

/* ── Archetypes ── */

const ARCHETYPES: Archetype[] = [
  "warlord", "diplomat", "merchant", "schemer",
  "turtle", "blitzkrieg", "tech-rush", "opportunist",
];

const EMOTIONS: Emotion[] = [
  "calm", "aggressive", "fearful", "vengeful",
  "ambitious", "desperate",
];

/* ── Campaign Default Values ── */

const STARTING_RESOURCES: Resources = {
  credits: 500,
  food: 200,
  ore: 150,
  fuelCells: 100,
  researchPoints: 0,
  intelligencePoints: 0,
};

const BASE_MARKET_PRICES = { food: 10, ore: 15, fuelCells: 20 };

/* ── Factory ── */

export function createNewCampaign(
  config: GalaxyConfig,
  campaignName: string = "New Campaign",
): GameState {
  const rng = new SeededRNG(config.seed);

  // 1. Generate galaxy
  const gen = new GalaxyGenerator();
  const galaxy = gen.generate(config);

  // 2. Create empires
  const empires = new Map<EmpireId, Empire>();
  const bots = new Map<EmpireId, BotAgent>();
  const fleets = new Map<string, Fleet>();

  for (let i = 0; i < config.empireCount; i++) {
    const empireId = EmpireId(`empire-${i}`);
    const isPlayer = i === 0;

    // Find home system
    let homeSystemId: SystemId | null = null;
    for (const [sysId, sys] of galaxy.systems) {
      if (sys.owner === empireId && sys.isHomeSystem) {
        homeSystemId = sysId;
        break;
      }
    }
    if (!homeSystemId) continue;

    // Create a starting fleet for each empire
    const fleetId = `fleet-${i}` as any;
    const fleet: Fleet = {
      id: fleetId as FleetId,
      ownerId: empireId,
      name: isPlayer ? "Home Fleet" : `Fleet ${i}`,
      locationSystemId: homeSystemId,
      unitIds: [],
      targetSystemId: null,
      arrivalCycle: null,
    };
    fleets.set(fleetId, fleet);

    const empire: Empire = {
      id: empireId,
      name: isPlayer ? "Your Empire" : generateBotName(rng, i),
      colour: getEmpireColourFromIndex(i),
      isPlayer,
      systemIds: [homeSystemId],
      homeSystemId,
      resources: { ...STARTING_RESOURCES },
      stabilityScore: 60,
      stabilityLevel: "content",
      population: 1000,
      populationCapacity: 5000,
      fleetIds: [fleetId as FleetId],
      researchTier: 0,
      powerScore: 0,
      researchPath: null,
      specialization: null,
      buildQueue: [],
      installationQueue: [],
      globalReputation: 50,
    };

    empires.set(empireId, empire);

    // Create bot agent for non-player empires
    if (!isPlayer) {
      const archetype = ARCHETYPES[rng.int(0, ARCHETYPES.length - 1)];
      const emotion = EMOTIONS[rng.int(0, EMOTIONS.length - 1)];
      const momentumRating = 0.3 + rng.next() * 0.6; // 0.3 to 0.9

      const bot: BotAgent = {
        empireId,
        archetype,
        momentumRating,
        intelligenceTier: momentumRating > 0.8 ? 1 : momentumRating > 0.6 ? 2 : 3,
        emotionalState: {
          current: emotion,
          trigger: "campaign-start",
          lastUpdatedCycle: 0,
          resonance: 0,
        },
        persona: {
          name: generateBotName(rng, i),
          title: archetype,
          backstory: "",
          speechStyle: "formal",
        },
      };
      bots.set(empireId, bot);
    }
  }

  // 3. Create diplomacy state
  const diplomacy: DiplomacyState = {
    pacts: new Map(),
    coalitions: new Map(),
    relationships: new Map(),
  };

  // 4. Create time state
  const time: TimeState = {
    currentCycle: 0,
    currentConfluence: 0,
    cyclesUntilReckoning: 10,
    cosmicOrder: {
      tiers: new Map(),
      rankings: [],
    },
  };

  // 5. Create market state
  const market: MarketState = {
    prices: { ...BASE_MARKET_PRICES },
    basePrices: { ...BASE_MARKET_PRICES },
    priceHistory: [],
    cycleVolume: { food: 0, ore: 0, fuelCells: 0 },
  };

  // 6. Create campaign metadata
  const campaign: CampaignMeta = {
    id: `campaign-${Date.now()}-${rng.int(0, 9999)}`,
    name: campaignName,
    createdAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
    seed: config.seed,
  };

  // 7. Assemble game state
  const state: GameState = {
    galaxy,
    empires,
    playerEmpireId: EmpireId("empire-0"),
    unitTypes: createUnitTypeRegistry(),
    units: new Map(),
    fleets,
    bots,
    diplomacy,
    time,
    currentCycleEvents: [],
    campaign,
    market,
    powerHistory: new Map(),
    earnedAchievements: new Map(),
    botAccumulated: new Map(),
  };

  return state;
}

/* ── Helpers ── */

const BOT_PREFIXES = [
  "Ketharan", "Zaranox", "Nyxian", "Vornathi", "Rielgard",
  "Thalassian", "Mirathi", "Soranix", "Xenoquar", "Daelari",
  "Brisari", "Ornathi", "Faelion", "Jirath", "Kasperan",
  "Udoran", "Wrenix", "Elvanor", "Pyraxis", "Grimhold",
];

const BOT_SUFFIXES = [
  "Dominion", "Accord", "Hegemony", "Collective", "Empire",
  "Confederation", "Coalition", "Republic", "Assembly", "Nexus",
];

function generateBotName(rng: SeededRNG, index: number): string {
  const prefix = BOT_PREFIXES[index % BOT_PREFIXES.length];
  const suffix = rng.pick(BOT_SUFFIXES);
  return `${prefix} ${suffix}`;
}

function getEmpireColourFromIndex(index: number): string {
  const COLOURS = [
    "#3498DB", "#E74C3C", "#2ECC71", "#F39C12", "#9B59B6",
    "#1ABC9C", "#E67E22", "#FF6B81", "#A29BFE", "#00CEC9",
    "#FD79A8", "#6C5CE7", "#FDCB6E", "#00B894", "#D63031",
    "#74B9FF", "#55EFC4", "#81ECEC", "#FAB1A0", "#DFE6E9",
  ];
  return COLOURS[index % COLOURS.length];
}
