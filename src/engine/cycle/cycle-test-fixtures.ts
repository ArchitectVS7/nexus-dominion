import type { GameState } from "../types/game-state";
import type { Empire } from "../types/empire";
import type { StarSystem, Sector } from "../types/galaxy";
import type { TimeState } from "../types/time";
import type { BotAgent } from "../types/bot";
import { EmpireId, SystemId, SectorId } from "../types/ids";
import { computeCosmicOrder } from "../nexus/nexus-engine";

/**
 * Build a minimal, fully-formed GameState for engine tests. Shared across the
 * cycle-processor test suites (main behavioral suite + atomic-failure suite) so
 * the ~80-line fixture is defined once.
 */
export function makeMinimalGameState(empireCount: number = 5): GameState {
  // Build galaxy
  const systems = new Map<any, StarSystem>();
  const sectors = new Map<any, Sector>();

  for (let s = 0; s < 2; s++) {
    const sectorId = SectorId(`sector-${s}`);
    const sysIds: any[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = s * 5 + i;
      const sysId = SystemId(`sys-${idx}`);
      sysIds.push(sysId);
      systems.set(sysId, {
        id: sysId,
        name: `System ${idx}`,
        sectorId,
        position: { x: s * 100, y: i * 20 },
        biome: "core-world" as const,
        owner: idx < empireCount ? EmpireId(`empire-${idx}`) : null,
        slots: [],
        baseProduction: {},
        adjacentSystemIds: [],
        claimedCycle: idx < empireCount ? 0 : null,
        isHomeSystem: idx < empireCount,
      });
    }
    sectors.set(sectorId, { id: sectorId, name: `Sector ${s}`, systemIds: sysIds, centre: { x: s * 100, y: 50 } });
  }

  // Build empires
  const empires = new Map<any, Empire>();
  for (let i = 0; i < empireCount; i++) {
    const id = EmpireId(`empire-${i}`);
    empires.set(id, {
      id,
      name: `Empire ${i}`,
      colour: "#000",
      isPlayer: i === 0,
      systemIds: [SystemId(`sys-${i}`)],
      homeSystemId: SystemId(`sys-${i}`),
      resources: { credits: 500, food: 200, ore: 100, fuelCells: 50, researchPoints: 20, intelligencePoints: 10 },
      stabilityScore: 50,
      stabilityLevel: "content" as const,
      population: 1000,
      populationCapacity: 2000,
      fleetIds: [],
      researchTier: 0,
      powerScore: (empireCount - i) * 10,
    });
  }

  // Build bots (all non-player)
  const bots = new Map<any, BotAgent>();
  for (let i = 1; i < empireCount; i++) {
    const id = EmpireId(`empire-${i}`);
    bots.set(id, {
      empireId: id,
      archetype: "warlord" as const,
      momentumRating: 1.0,
      persona: { name: `Bot ${i}`, title: "Commander", backstory: "", speechStyle: "default" },
      emotionalState: { current: "calm" as const, trigger: "none", lastUpdatedCycle: 0, resonance: 0.0 },
    });
  }

  const cosmicOrder = computeCosmicOrder(empires as any);

  const time: TimeState = {
    currentCycle: 0,
    currentConfluence: 1,
    cyclesUntilReckoning: 10,
    cosmicOrder,
  };

  return {
    galaxy: { systems, sectors },
    empires,
    playerEmpireId: EmpireId("empire-0"),
    unitTypes: new Map(),
    units: new Map(),
    fleets: new Map(),
    bots,
    diplomacy: { pacts: new Map(), coalitions: new Map(), relationships: new Map() },
    time,
    currentCycleEvents: [],
    campaign: { id: "test", name: "Test", createdAt: "2026-01-01", lastSavedAt: "2026-01-01", seed: 42 },
  };
}
