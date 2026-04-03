/**
 * Standard unit type definitions for Nexus Dominion.
 * Six unit types across three domains: Space (fleet), Orbital, Ground.
 */

import type { UnitType, Unit, Fleet } from "../types/military";
import type { BuildQueueEntry, Resources } from "../types/empire";
import type { SystemId, UnitId } from "../types/ids";

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
    statBlock: { str: 14, dex: 16, con: 10, ac: 14, bab: 4, initiative: 3 },
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
    statBlock: { str: 16, dex: 12, con: 16, ac: 16, bab: 6, initiative: 1 },
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
    statBlock: { str: 12, dex: 8, con: 18, ac: 20, bab: 3, initiative: -1 },
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
    statBlock: { str: 18, dex: 10, con: 14, ac: 12, bab: 7, initiative: 0 },
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
    statBlock: { str: 12, dex: 14, con: 12, ac: 14, bab: 3, initiative: 2 },
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
    statBlock: { str: 16, dex: 8, con: 16, ac: 18, bab: 5, initiative: -1 },
  },
  // Capstone unit — unlocked by War Machine tier 8 (Total Mobilisation)
  {
    id: "dreadnought",
    name: "Dreadnought",
    category: "fleet",
    buildCost: 800,
    buildTime: 6,
    oreMaintenance: 40,
    fuelMaintenance: 30,
    attack: 25,
    defence: 15,
    hp: 50,
    statBlock: { str: 20, dex: 10, con: 20, ac: 18, bab: 10, initiative: 0 },
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
    systemId: "" as any, // caller should set systemId
    startCycle: currentCycle,
    completionCycle: currentCycle + utype.buildTime,
  };
}

/* ── Build Queue Execution ── */

/**
 * Advance the build queue: separate completed entries from still-building ones.
 */
export function advanceBuildQueue(
  queue: BuildQueueEntry[],
  currentCycle: number,
  _unitTypes: Map<string, UnitType>,
): { completed: BuildQueueEntry[]; remaining: BuildQueueEntry[] } {
  const completed: BuildQueueEntry[] = [];
  const remaining: BuildQueueEntry[] = [];
  for (const entry of queue) {
    if (currentCycle >= entry.completionCycle) {
      completed.push(entry);
    } else {
      remaining.push(entry);
    }
  }
  return { completed, remaining };
}

/**
 * Create a Unit instance from a completed build queue entry.
 */
export function createUnitFromCompleted(
  entry: BuildQueueEntry,
  unitTypes: Map<string, UnitType>,
  unitId: string,
): Unit {
  const utype = unitTypes.get(entry.unitTypeId)!;
  return {
    id: unitId as any,
    typeId: entry.unitTypeId,
    currentHp: utype.hp,
    completionCycle: null,
  };
}

/* ── Fleet Composition ── */

/**
 * Calculate fleet composition bonus.
 * +15% if 4+ unique unit types are fielded.
 */
export function calculateFleetCompositionBonus(unitTypeIds: string[]): number {
  const unique = new Set(unitTypeIds);
  return unique.size >= 4 ? 0.15 : 0;
}

/**
 * Calculate fleet movement efficiency based on composition.
 * Returns a movement multiplier (1.0 = normal, 0.8 = slow, 1.2 = fast).
 */
export function calculateFleetMovementEfficiency(unitTypeIds: string[], unitTypes: Map<string, UnitType>): number {
  if (unitTypeIds.length === 0) return 1.0;
  
  // Base movement based on unit types present
  let totalSpeed = 0;
  let unitCount = 0;
  
  for (const unitTypeId of unitTypeIds) {
    const unitType = unitTypes.get(unitTypeId);
    if (unitType && unitType.category === "fleet") {
      // Give more weight to faster units
      if (unitTypeId === "fighter") totalSpeed += 2.0;
      else if (unitTypeId === "cruiser") totalSpeed += 1.5;
      else if (unitTypeId === "dreadnought") totalSpeed += 1.0;
      else totalSpeed += 1.2; // Default for other fleet units
      unitCount++;
    }
  }
  
  if (unitCount === 0) return 1.0;
  
  // Average speed multiplier (normalized)
  const avgSpeed = totalSpeed / unitCount;
  
  // Convert to movement efficiency: 1.0 = normal, with 0.5-2.0 range
  if (avgSpeed < 1.0) return 0.8; // Slower fleet
  if (avgSpeed > 2.0) return 1.5; // Fast fleet
  return avgSpeed * 0.5 + 0.75; // Normalize to 0.75-1.25 range
}

/**
 * Calculate fleet combat bonuses based on composition
 * This provides bonuses to attack, defense, and movement based on unit mix
 */
export function calculateFleetCombatBonus(unitTypeIds: string[], unitTypes: Map<string, UnitType>): {
  attackBonus: number;
  defenceBonus: number;
  movementSpeedBonus: number;
} {
  let attackBonus = 0;
  let defenceBonus = 0;
  let movementBonus = 0;
  
  // Count different types of units
  const unitCounts: Record<string, number> = {};
  for (const unitTypeId of unitTypeIds) {
    unitCounts[unitTypeId] = (unitCounts[unitTypeId] || 0) + 1;
  }
  
  // Apply bonuses based on unit type combinations
  if (unitCounts["fighter"] && unitCounts["cruiser"]) {
    // Fighter-Cruiser combo: better fleet balance
    attackBonus += 3;
    defenceBonus += 1;
    movementBonus += 2;
  }
  
  if (unitCounts["dreadnought"]) {
    // Dreadnought provides strong attack bonus and movement penalty (heavier ships)
    attackBonus += 8;
    defenceBonus += 5;
    movementBonus -= 2; // Heavy units slow the fleet
  }
  
  if (unitCounts["orbital-platform"] && unitCounts["bombardment-ship"]) {
    // Orbitals and bombardment ships = better system support
    attackBonus += 5;
    defenceBonus += 7;
    movementBonus += 1;
  }
  
  // Bonus for having multiple unique unit types (composition)
  const uniqueTypes = Object.keys(unitCounts).length;
  if (uniqueTypes >= 4) {
    attackBonus += 5;
    defenceBonus += 5;
    movementBonus += 2;
  }
  
  return {
    attackBonus,
    defenceBonus,
    movementSpeedBonus: movementBonus
  };
}

/* ── Affordability ── */

/**
 * Check if an empire can afford to build a given unit type.
 */
export function canAffordUnit(
  unitTypeId: string,
  reserves: Resources,
  unitTypes: Map<string, UnitType>,
): boolean {
  const utype = unitTypes.get(unitTypeId);
  if (!utype) return false;
  return reserves.credits >= utype.buildCost;
}

/* ── Fleet Movement ── */

/**
 * Calculate transit time for a fleet between two systems.
 */
export function calculateTransitTime(
  fleet: Fleet,
  targetSystemId: SystemId,
  currentCycle: number,
  unitTypes: Map<string, UnitType>,
): number {
  // Base transit time in cycles
  let baseTime = 10;

  // Get fleet composition
  const composition = calculateFleetMovementEfficiency(fleet.unitIds, unitTypes);

  // Calculate time based on fleet strength and composition
  const fleetPower = calculateMilitaryPower(fleet.unitIds, new Map(), unitTypes);
  const fleetSpeed = baseTime * (1 / composition); // Adjust for composition efficiency

  // Add 10% for each 1000 power units
  const powerPenalty = Math.floor(fleetPower / 1000) * 0.1 * baseTime;

  // Combine to get final transit time
  const transitTime = Math.ceil(fleetSpeed + powerPenalty);

  return Math.max(1, transitTime);
}

/**
 * Issue a move order for a fleet. Returns a new Fleet with target/arrival set.
 * Rejects if fleet is already in transit or target is current location.
 * Pure function — does not mutate input.
 * Enhanced: Now includes convoy mechanics and combat restrictions.
 */
export function moveFleet(
  fleet: Fleet,
  targetSystemId: SystemId,
  currentCycle: number,
  unitTypes: Map<string, UnitType>,
  inCombat: boolean = false,
): Fleet {
  // Reject if already in transit
  if (fleet.targetSystemId !== null) return { ...fleet };
  // Reject if target is current location
  if (fleet.locationSystemId === targetSystemId) return { ...fleet };
  // Reject if in combat (no movement during battles)
  if (inCombat) return { ...fleet };

  const transitTime = calculateTransitTime(fleet, targetSystemId, currentCycle, unitTypes);

  return {
    ...fleet,
    unitIds: [...fleet.unitIds],
    targetSystemId,
    arrivalCycle: currentCycle + transitTime,
  };
}

/**
 * Resolve all fleet arrivals for the current cycle.
 * Fleets whose arrivalCycle <= currentCycle arrive at their target system.
 * Returns a new Map with updated fleets. Pure function.
 */
export function resolveFleetArrivals(
  fleets: Map<string, Fleet>,
  currentCycle: number,
): Map<string, Fleet> {
  const result = new Map<string, Fleet>();
  for (const [id, fleet] of fleets) {
    if (fleet.targetSystemId !== null && fleet.arrivalCycle !== null && currentCycle >= fleet.arrivalCycle) {
      result.set(id, {
        ...fleet,
        unitIds: [...fleet.unitIds],
        locationSystemId: fleet.targetSystemId,
        targetSystemId: null,
        arrivalCycle: null,
      });
    } else {
      result.set(id, { ...fleet, unitIds: [...fleet.unitIds] });
    }
  }
  return result;
}

/* ── Unit-Fleet Assignment ── */

/**
 * Add a unit to a fleet. Returns a new Fleet. No-op if unit already present.
 */
export function assignUnitToFleet(fleet: Fleet, unitId: UnitId): Fleet {
  if (fleet.unitIds.includes(unitId)) return { ...fleet, unitIds: [...fleet.unitIds] };
  return { ...fleet, unitIds: [...fleet.unitIds, unitId] };
}

/**
 * Remove a unit from a fleet. Returns a new Fleet. No-op if unit not present.
 */
export function removeUnitFromFleet(fleet: Fleet, unitId: UnitId): Fleet {
  return { ...fleet, unitIds: fleet.unitIds.filter(id => id !== unitId) };
}

/* ── Maintenance Cost ── */

/**
 * Calculate total maintenance cost for a set of units.
 * Only completed (non-building) units incur maintenance.
 */
export function calculateMaintenanceCost(
  unitIds: string[],
  units: Map<string, { typeId: string; currentHp: number; completionCycle: number | null }>,
  unitTypes: Map<string, UnitType>,
): { ore: number; fuel: number } {
  let ore = 0;
  let fuel = 0;
  for (const uid of unitIds) {
    const unit = units.get(uid);
    if (!unit || unit.completionCycle !== null) continue;
    const utype = unitTypes.get(unit.typeId);
    if (!utype) continue;
    ore += utype.oreMaintenance;
    fuel += utype.fuelMaintenance;
  }
  return { ore, fuel };
}

/**
 * Check if fleet is in combat (used for movement restrictions)
 */
export function isFleetInCombat(
  fleet: Fleet,
  fleets: Map<string, Fleet>,
  systems: Map<string, any>,
): boolean {
  // Check if this fleet is currently engaged in combat at its location
  const system = systems.get(fleet.locationSystemId);
  if (!system || !system.combat) return false;
  
  // Simple combat check - in reality, this would be more complex
  const combat = system.combat;
  return combat.fleets.some(fleetId => fleetId === fleet.id);
}