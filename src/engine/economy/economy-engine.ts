import type { Empire, Resources, ResourceLedger, StabilityLevel } from "../types/empire";
import type { StarSystem } from "../types/galaxy";
import type { Unit, UnitType } from "../types/military";

/** Base production per system biome type */
const BIOME_PRODUCTION: Record<string, Partial<Resources>> = {
  "core-world": { credits: 10, food: 5, ore: 3, fuelCells: 2, researchPoints: 3 },
  "mineral-world": { credits: 3, food: 1, ore: 10, fuelCells: 3, researchPoints: 1 },
  "verdant-world": { credits: 5, food: 10, ore: 2, fuelCells: 1, researchPoints: 2 },
  "barren-world": { credits: 2, food: 0, ore: 5, fuelCells: 5, researchPoints: 1 },
  "void-station": { credits: 8, food: 0, ore: 2, fuelCells: 4, researchPoints: 5 },
  "contested-ruin": { credits: 4, food: 1, ore: 6, fuelCells: 2, researchPoints: 4 },
  "frontier-world": { credits: 3, food: 3, ore: 3, fuelCells: 3, researchPoints: 2 },
  "nexus-adjacent": { credits: 5, food: 2, ore: 2, fuelCells: 2, researchPoints: 8 },
  "resource-rich-anomaly": { credits: 6, food: 3, ore: 8, fuelCells: 6, researchPoints: 2 },
};

const EMPTY_RESOURCES: Resources = {
  credits: 0, food: 0, ore: 0, fuelCells: 0, researchPoints: 0, intelligencePoints: 0,
};

/**
 * Calculate resource production from owned star systems.
 */
export function calculateProduction(
  systems: StarSystem[],
  stabilityMultiplier: number,
): Resources {
  const prod = { ...EMPTY_RESOURCES };
  for (const sys of systems) {
    const biomeProd = BIOME_PRODUCTION[sys.biome] ?? {};
    for (const [key, val] of Object.entries(biomeProd)) {
      (prod as Record<string, number>)[key] += (val as number) * stabilityMultiplier;
    }
  }
  return prod;
}

/**
 * Calculate military maintenance consumption.
 */
export function calculateMilitaryMaintenance(
  units: Unit[],
  unitTypes: Map<string, UnitType>,
): Resources {
  const consumption = { ...EMPTY_RESOURCES };
  for (const unit of units) {
    if (unit.completionCycle !== null) continue; // still building
    const utype = unitTypes.get(unit.typeId);
    if (!utype) continue;
    consumption.ore += utype.oreMaintenance;
    consumption.fuelCells += utype.fuelMaintenance;
  }
  return consumption;
}

/**
 * Compute the full resource ledger for an empire.
 */
export function computeResourceLedger(
  empire: Empire,
  ownedSystems: StarSystem[],
  empireUnits: Unit[],
  unitTypes: Map<string, UnitType>,
  stabilityMultiplier: number,
): ResourceLedger {
  const production = calculateProduction(ownedSystems, stabilityMultiplier);
  const maintenance = calculateMilitaryMaintenance(empireUnits, unitTypes);

  // Food consumption: 1 per 100 population
  const foodConsumption = Math.ceil(empire.population / 100);

  const consumption: Resources = {
    ...maintenance,
    food: maintenance.food + foodConsumption,
  };

  const net: Resources = {
    credits: production.credits - consumption.credits,
    food: production.food - consumption.food,
    ore: production.ore - consumption.ore,
    fuelCells: production.fuelCells - consumption.fuelCells,
    researchPoints: production.researchPoints - consumption.researchPoints,
    intelligencePoints: production.intelligencePoints - consumption.intelligencePoints,
  };

  return {
    production,
    consumption,
    net,
    reserves: empire.resources,
  };
}

/**
 * Apply resource changes for one cycle. Returns updated resources and deficit warnings.
 */
export function applyResourceCycle(
  reserves: Resources,
  net: Resources,
): { newReserves: Resources; deficits: string[] } {
  const deficits: string[] = [];
  const newReserves = { ...reserves };

  for (const key of Object.keys(net) as (keyof Resources)[]) {
    newReserves[key] = reserves[key] + net[key];
    if (newReserves[key] < 0) {
      deficits.push(key);
      newReserves[key] = 0;
    }
  }

  return { newReserves, deficits };
}

/* ── Population Growth ── */

/**
 * Calculate population change for one cycle.
 * +2% if food surplus, -5% if food deficit, 0 if balanced.
 * Capped at population capacity.
 */
export function calculatePopulationGrowth(
  population: number,
  capacity: number,
  foodSurplus: number,
): number {
  if (foodSurplus > 0) {
    const growth = Math.floor(population * 0.02);
    return Math.min(growth, capacity - population);
  }
  if (foodSurplus < 0) {
    return -Math.floor(population * 0.05);
  }
  return 0;
}

/* ── Overcrowding ── */

/**
 * Calculate stability penalty from overcrowding.
 * Penalty applies when population exceeds 90% of capacity.
 */
export function calculateOvercrowdingPenalty(
  population: number,
  capacity: number,
): number {
  const ratio = population / capacity;
  if (ratio <= 0.9) return 0;
  // Linear penalty scaling from 0 at 90% to 20 at 100%+
  return Math.min(20, Math.floor((ratio - 0.9) * 200));
}

/* ── Stability ── */

/**
 * Map a stability score (0–100) to a StabilityLevel.
 */
export function recalculateStability(score: number): StabilityLevel {
  if (score >= 90) return "ecstatic";
  if (score >= 65) return "happy";
  if (score >= 40) return "content";
  if (score >= 25) return "unhappy";
  if (score >= 10) return "angry";
  return "rioting";
}

export interface StabilityFactors {
  foodDeficit?: boolean;
  foodSurplus?: boolean;
  overcrowded?: boolean;
  atWar?: boolean;
}

/**
 * Adjust stability score based on current factors.
 * Returns new score clamped to 0–100.
 */
export function updateStabilityScore(
  current: number,
  factors: StabilityFactors,
): number {
  let delta = 0;
  if (factors.foodDeficit) delta -= 10;
  if (factors.foodSurplus) delta += 3;
  if (factors.overcrowded) delta -= 5;
  if (factors.atWar) delta -= 5;
  return Math.max(0, Math.min(100, current + delta));
}

/* ── Installation Production ── */

const INSTALLATION_PRODUCTION: Record<string, Partial<Resources>> = {
  "trade-hub":            { credits: 20 },
  "agricultural-station": { food: 15 },
  "mining-complex":       { ore: 15 },
  "fuel-extraction":      { fuelCells: 10 },
  "research-station":     { researchPoints: 12 },
  "intelligence-nexus":   { intelligencePoints: 10 },
  "population-centre":    { credits: 8 },
  "cultural-institute":   {}, // stability bonus only; not resource-based
};

/**
 * Biome affinity bonuses for installation types.
 * Installations built on a matching biome get a production multiplier.
 * Absent entries default to 1.0x (no bonus).
 */
export const BIOME_INSTALLATION_BONUS: Record<string, Record<string, number>> = {
  "core-world":            { "trade-hub": 1.5, "population-centre": 1.5 },
  "mineral-world":         { "mining-complex": 1.5, "fuel-extraction": 1.5 },
  "verdant-world":         { "agricultural-station": 1.5, "population-centre": 1.5 },
  "barren-world":          { "mining-complex": 1.25, "fuel-extraction": 1.25 },
  "void-station":          { "research-station": 1.5, "intelligence-nexus": 1.5 },
  "contested-ruin":        { "intelligence-nexus": 1.25, "cultural-institute": 1.25 },
  "frontier-world":        {}, // generalist — no bonuses
  "nexus-adjacent":        { "research-station": 1.5 },
  "resource-rich-anomaly": { "mining-complex": 1.5, "fuel-extraction": 1.5 },
};

/**
 * Calculate bonus production from installations on a star system.
 * Applies biome affinity bonuses and installation condition scaling.
 */
export function calculateInstallationProduction(
  system: StarSystem,
): Partial<Resources> {
  const bonus: Partial<Resources> = {};
  const biomeBonuses = BIOME_INSTALLATION_BONUS[system.biome] ?? {};

  for (const slot of system.slots) {
    const installation = slot.installation;
    if (!installation || installation.completionCycle !== null) continue;
    const prod = INSTALLATION_PRODUCTION[installation.type];
    if (!prod) continue;
    const conditionMultiplier = installation.condition;
    const biomeMultiplier = biomeBonuses[installation.type] ?? 1.0;
    for (const [key, val] of Object.entries(prod)) {
      const scaled = Math.floor((val as number) * conditionMultiplier * biomeMultiplier);
      (bonus as Record<string, number>)[key] = ((bonus as Record<string, number>)[key] ?? 0) + scaled;
    }
  }
  return bonus;
}

/* ── Unit Degradation ���─ */

/**
 * Degrade units when maintenance cannot be paid (ore or fuelCells deficit).
 * Returns IDs of units that were degraded (lost HP).
 */
export function degradeUnmaintainedUnits(
  units: Unit[],
  unitTypes: Map<string, UnitType>,
  degradeAmount: number = 1,
): Unit[] {
  const degraded: Unit[] = [];
  for (const unit of units) {
    if (unit.completionCycle !== null) continue;
    const utype = unitTypes.get(unit.typeId);
    if (!utype) continue;
    unit.currentHp = Math.max(0, unit.currentHp - degradeAmount);
    degraded.push(unit);
  }
  return degraded;
}
