import type { Empire, Resources, ResourceLedger } from "../types/empire";
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
