import type { StarSystem } from "../types/galaxy";
import type { EmpireId } from "../types/ids";
import type { GameEvent } from "../types/events";
import type { GameState } from "../types/game-state";

/**
 * Logic for unlocking additional development slots on specific biomes.
 * Frontier worlds start with 3 locked slots that can be unlocked via
 * empire-level progression (Research Tiers).
 */
export function processSlotUnlocks(
  state: GameState,
  currentCycle: number,
): GameEvent[] {
  const events: GameEvent[] = [];

  for (const [id, empire] of state.empires) {
    const tier = empire.researchTier;
    
    // Determine how many extra slots should be unlocked based on tier
    // Tier 4: +1, Tier 6: +2, Tier 8: +3
    let extraSlotsPossible = 0;
    if (tier >= 8) extraSlotsPossible = 3;
    else if (tier >= 6) extraSlotsPossible = 2;
    else if (tier >= 4) extraSlotsPossible = 1;

    if (extraSlotsPossible === 0) continue;

    // Check all systems owned by this empire
    for (const systemId of empire.systemIds) {
      const system = state.galaxy.systems.get(systemId);
      if (!system || system.biome !== "frontier-world") continue;

      // Frontier worlds have slots 0,1 open, 2,3,4 locked by default.
      // Index 2 is 1st extra, 3 is 2nd, 4 is 3rd.
      for (let i = 0; i < extraSlotsPossible; i++) {
        const slotIndex = 2 + i;
        if (system.slots[slotIndex] && system.slots[slotIndex].locked) {
          system.slots[slotIndex].locked = false;
          events.push({
            type: "system-event",
            kind: "slot-unlocked",
            empireId: id,
            systemId: system.id,
            cycle: currentCycle,
          } as any);
        }
      }
    }
  }

  return events;
}

/**
 * Logic for one-time bonuses when "Resource-Rich Anomalies" or 
 * "Contested Ruins" are first claimed by an empire.
 */
export function processAnomalyDiscovery(
  system: StarSystem,
  empireId: EmpireId,
  state: GameState,
  currentCycle: number,
): GameEvent[] {
  const empire = state.empires.get(empireId);
  if (!empire) return [];

  // Only trigger on first claim
  if (system.claimedCycle !== currentCycle) return [];

  const events: GameEvent[] = [];

  if (system.biome === "resource-rich-anomaly") {
    // Large one-time resource cache
    empire.resources.credits += 150;
    empire.resources.ore += 100;
    empire.resources.fuelCells += 100;
    
    events.push({
      type: "system-event",
      kind: "anomaly-harvested",
      empireId,
      systemId: system.id,
      cycle: currentCycle,
      bonus: { credits: 150, ore: 100, fuelCells: 100 },
    } as any);
  } else if (system.biome === "contested-ruin") {
    // Scientific data cache
    empire.resources.researchPoints += 75;
    
    events.push({
      type: "system-event",
      kind: "ruins-surveyed",
      empireId,
      systemId: system.id,
      cycle: currentCycle,
      bonus: { researchPoints: 75 },
    } as any);
  }

  return events;
}
