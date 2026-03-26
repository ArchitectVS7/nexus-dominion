import type { EmpireId } from "../types/ids";
import type { Empire } from "../types/empire";
import type { CosmicOrder, CosmicTier, TimeState } from "../types/time";
import type { ReckoningEvent } from "../types/events";
import { CYCLES_PER_CONFLUENCE } from "../types/time";

/**
 * Computes the Cosmic Order tier for each empire based on power scores.
 * Top 20% → Sovereign, middle 60% → Ascendant, bottom 20% → Stricken.
 */
export function computeCosmicOrder(empires: Map<EmpireId, Empire>): CosmicOrder {
  const ranked = [...empires.entries()]
    .sort((a, b) => b[1].powerScore - a[1].powerScore)
    .map(([id]) => id);

  const total = ranked.length;
  const sovereignCut = Math.max(1, Math.floor(total * 0.2));
  const strickenStart = total - Math.max(1, Math.floor(total * 0.2));

  const tiers = new Map<EmpireId, CosmicTier>();
  for (let i = 0; i < ranked.length; i++) {
    if (i < sovereignCut) {
      tiers.set(ranked[i], "sovereign");
    } else if (i >= strickenStart) {
      tiers.set(ranked[i], "stricken");
    } else {
      tiers.set(ranked[i], "ascendant");
    }
  }

  return { tiers, rankings: ranked };
}

/**
 * Returns the resolution order for a cycle: Stricken first, then Ascendant, then Sovereign.
 * Within each tier, order is shuffled using the provided shuffle function.
 */
export function getResolutionOrder(
  cosmicOrder: CosmicOrder,
  shuffleFn: <T>(arr: T[]) => T[],
): EmpireId[] {
  const byTier: Record<CosmicTier, EmpireId[]> = {
    stricken: [],
    ascendant: [],
    sovereign: [],
  };

  for (const [empireId, tier] of cosmicOrder.tiers) {
    byTier[tier].push(empireId);
  }

  return [
    ...shuffleFn(byTier.stricken),
    ...shuffleFn(byTier.ascendant),
    ...shuffleFn(byTier.sovereign),
  ];
}

/**
 * Computes a rolling 5-cycle average power score for each empire.
 * powerHistory is a map of empireId → array of power scores (most recent last).
 */
export function rollingAveragePowerScores(
  powerHistory: Map<EmpireId, number[]>,
  windowSize: number = 5,
): Map<EmpireId, number> {
  const result = new Map<EmpireId, number>();
  for (const [id, history] of powerHistory) {
    const window = history.slice(-windowSize);
    const avg = window.reduce((s, v) => s + v, 0) / window.length;
    result.set(id, avg);
  }
  return result;
}

/**
 * Checks if a Nexus Reckoning should fire this cycle and advances time state.
 * Returns the updated time state and optional reckoning event.
 */
export function advanceCycle(
  time: TimeState,
  empires: Map<EmpireId, Empire>,
  powerHistory: Map<EmpireId, number[]>,
): { time: TimeState; reckoningEvent: ReckoningEvent | null } {
  const newCycle = time.currentCycle + 1;
  const isReckoning = newCycle % CYCLES_PER_CONFLUENCE === 0;

  let cosmicOrder = time.cosmicOrder;
  let reckoningEvent: ReckoningEvent | null = null;

  if (isReckoning) {
    // Use rolling 5-cycle averages for tier assignment
    const avgScores = rollingAveragePowerScores(powerHistory);
    const tempEmpires = new Map<EmpireId, Empire>();
    for (const [id, empire] of empires) {
      tempEmpires.set(id, { ...empire, powerScore: avgScores.get(id) ?? empire.powerScore });
    }
    cosmicOrder = computeCosmicOrder(tempEmpires);

    reckoningEvent = {
      type: "reckoning",
      cycle: newCycle,
      confluence: Math.floor(newCycle / CYCLES_PER_CONFLUENCE),
      cosmicOrder,
    };
  }

  const newTime: TimeState = {
    currentCycle: newCycle,
    currentConfluence: Math.floor((newCycle - 1) / CYCLES_PER_CONFLUENCE) + 1,
    cyclesUntilReckoning: isReckoning
      ? CYCLES_PER_CONFLUENCE
      : CYCLES_PER_CONFLUENCE - (newCycle % CYCLES_PER_CONFLUENCE),
    cosmicOrder,
  };

  return { time: newTime, reckoningEvent };
}
