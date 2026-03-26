import type { EmpireId, SystemId, UnitId } from "../types/ids";
import type { UnitType, CombatResult, CombatPhase } from "../types/military";
import { SeededRNG } from "../utils/rng";

export interface CombatForce {
  empireId: EmpireId;
  units: { id: UnitId; typeId: string; currentHp: number }[];
  isDefender: boolean;
}

const DEFENDER_BONUS = 1.25; // 25% bonus for defenders

/**
 * Calculate the total combat strength of a force.
 */
export function calculateForceStrength(
  force: CombatForce,
  unitTypes: Map<string, UnitType>,
  phase: CombatPhase,
): number {
  let strength = 0;
  for (const unit of force.units) {
    const utype = unitTypes.get(unit.typeId);
    if (!utype) continue;
    // Filter by phase
    if (phase === "fleet-engagement" && utype.category !== "fleet") continue;
    if (phase === "ground-assault" && utype.category !== "ground") continue;
    const hpRatio = unit.currentHp / utype.hp;
    const raw = (utype.attack + utype.defence) * hpRatio;
    strength += raw;
  }
  if (force.isDefender) {
    strength *= DEFENDER_BONUS;
  }
  return strength;
}

/**
 * Resolve a combat engagement between attacker and defender forces.
 * Uses strength comparison + d20-style randomness.
 */
export function resolveCombat(
  attacker: CombatForce,
  defender: CombatForce,
  systemId: SystemId,
  phase: CombatPhase,
  unitTypes: Map<string, UnitType>,
  rng: SeededRNG,
): CombatResult {
  const attackStrength = calculateForceStrength(attacker, unitTypes, phase);
  const defendStrength = calculateForceStrength(defender, unitTypes, phase);

  // d20-style roll with modifiers
  const attackRoll = rng.int(1, 20) + attackStrength;
  const defendRoll = rng.int(1, 20) + defendStrength;

  const attackerWins = attackRoll > defendRoll;

  // Calculate casualties (loser takes more)
  const loser = attackerWins ? defender : attacker;
  const winner = attackerWins ? attacker : defender;
  const loserCasualties = selectCasualties(loser.units, unitTypes, phase, 0.4 + rng.next() * 0.3, rng);
  const winnerCasualties = selectCasualties(winner.units, unitTypes, phase, 0.1 + rng.next() * 0.2, rng);

  const attackerLosses = attackerWins ? winnerCasualties : loserCasualties;
  const defenderLosses = attackerWins ? loserCasualties : winnerCasualties;

  // System capture only happens on ground assault victory by attacker
  const systemCaptured = phase === "ground-assault" && attackerWins;

  return {
    phase,
    attackerId: attacker.empireId,
    defenderId: defender.empireId,
    systemId,
    attackerLosses: attackerLosses.map((u) => u.id),
    defenderLosses: defenderLosses.map((u) => u.id),
    victor: attackerWins ? attacker.empireId : defender.empireId,
    systemCaptured,
  };
}

function selectCasualties(
  units: { id: UnitId; typeId: string; currentHp: number }[],
  unitTypes: Map<string, UnitType>,
  phase: CombatPhase,
  ratio: number,
  rng: SeededRNG,
): { id: UnitId; typeId: string; currentHp: number }[] {
  const eligible = units.filter((u) => {
    const utype = unitTypes.get(u.typeId);
    if (!utype) return false;
    if (phase === "fleet-engagement") return utype.category === "fleet";
    if (phase === "ground-assault") return utype.category === "ground";
    return true;
  });

  const count = Math.max(1, Math.floor(eligible.length * ratio));
  const shuffled = rng.shuffle([...eligible]);
  return shuffled.slice(0, count);
}

/**
 * Apply blockade effects to a star system's empire: resource shortfall per turn.
 */
export interface BlockadeEffect {
  creditReduction: number;
  foodReduction: number;
  oreReduction: number;
  turnsActive: number;
}

export function calculateBlockadeEffect(
  blockadingStrength: number,
  defenderStrength: number,
  turnsActive: number,
): BlockadeEffect {
  const ratio = blockadingStrength / Math.max(1, blockadingStrength + defenderStrength);
  const severity = Math.min(1.0, ratio * (1 + turnsActive * 0.1));
  return {
    creditReduction: Math.floor(severity * 50),
    foodReduction: Math.floor(severity * 30),
    oreReduction: Math.floor(severity * 20),
    turnsActive,
  };
}
