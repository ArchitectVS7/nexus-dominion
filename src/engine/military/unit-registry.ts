import type { UnitType } from "../types/military";

/**
 * Standard unit type definitions for Nexus Dominion.
 * Six unit types across three domains: Space (fleet), Orbital, Ground.
 * Domain is encoded via naming convention since UnitCategory only has fleet/ground.
 */

export const UNIT_TYPES: UnitType[] = [
  // Space domain (fleet)
  {
    id: "fighter",
    name: "Fighter Squadron",
    category: "fleet",
    buildCost: 100,
    buildTime: 1,
    oreMaintenance: 5,
    fuelMaintenance: 3,
    attack: 6,
    defence: 3,
    hp: 8,
  },
  {
    id: "cruiser",
    name: "Cruiser",
    category: "fleet",
    buildCost: 300,
    buildTime: 3,
    oreMaintenance: 15,
    fuelMaintenance: 10,
    attack: 10,
    defence: 8,
    hp: 25,
  },
  // Orbital domain (fleet category — stationed at systems)
  {
    id: "orbital-platform",
    name: "Orbital Defence Platform",
    category: "fleet",
    buildCost: 200,
    buildTime: 2,
    oreMaintenance: 10,
    fuelMaintenance: 2,
    attack: 5,
    defence: 12,
    hp: 30,
  },
  {
    id: "bombardment-ship",
    name: "Orbital Bombardment Ship",
    category: "fleet",
    buildCost: 400,
    buildTime: 4,
    oreMaintenance: 20,
    fuelMaintenance: 15,
    attack: 15,
    defence: 5,
    hp: 20,
  },
  // Ground domain
  {
    id: "infantry",
    name: "Infantry Division",
    category: "ground",
    buildCost: 50,
    buildTime: 1,
    oreMaintenance: 2,
    fuelMaintenance: 1,
    attack: 4,
    defence: 5,
    hp: 12,
  },
  {
    id: "heavy-armor",
    name: "Heavy Armour Brigade",
    category: "ground",
    buildCost: 150,
    buildTime: 2,
    oreMaintenance: 8,
    fuelMaintenance: 5,
    attack: 8,
    defence: 8,
    hp: 20,
  },
];

export function createUnitTypeRegistry(): Map<string, UnitType> {
  const registry = new Map<string, UnitType>();
  for (const ut of UNIT_TYPES) {
    registry.set(ut.id, ut);
  }
  return registry;
}

/**
 * Calculate total military power from a set of units.
 */
export function calculateMilitaryPower(
  unitIds: string[],
  units: Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>,
  unitTypes: Map<string, UnitType>,
): number {
  let power = 0;
  for (const uid of unitIds) {
    const unit = units.get(uid);
    if (!unit || unit.completionCycle !== null) continue;
    const utype = unitTypes.get(unit.typeId);
    if (!utype) continue;
    const hpRatio = unit.currentHp / utype.hp;
    power += (utype.attack + utype.defence) * hpRatio;
  }
  return power;
}

/**
 * Build queue entry.
 */
export interface BuildQueueEntry {
  unitTypeId: string;
  startCycle: number;
  completionCycle: number;
}

/**
 * Add a unit to the build queue. Returns cost and completion cycle.
 */
export function enqueueUnit(
  unitTypeId: string,
  currentCycle: number,
  unitTypes: Map<string, UnitType>,
): BuildQueueEntry | null {
  const utype = unitTypes.get(unitTypeId);
  if (!utype) return null;
  return {
    unitTypeId,
    startCycle: currentCycle,
    completionCycle: currentCycle + utype.buildTime,
  };
}
