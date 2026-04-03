import type { EmpireId, SystemId, UnitId } from "../types/ids";
import type { UnitType, CombatResult, CombatPhase } from "../types/military";
import type { StarSystem } from "../types/galaxy";
import { SeededRNG } from "../utils/rng";

export interface CombatForce {
  empireId: EmpireId;
  units: { id: UnitId; typeId: string; currentHp: number }[];
  isDefender: boolean;
}

export interface CombatOptions {
  /** Doctrine STR bonus added to each unit's attack (e.g. Iron +2) */
  attackerDoctrineStrBonus?: number;
  /** Defender doctrine AC bonus */
  defenderDoctrineAcBonus?: number;
  /** Coalition combat bonus as fraction (e.g. 0.15 for +15%) */
  coalitionBonus?: number;
  /** Fleet composition bonus as fraction (e.g. 0.15) */
  fleetCompositionBonus?: number;
}

const DEFENDER_BONUS = 1.25; // 25% bonus for defenders
const MORALE_FLEET_THRESHOLD = 0.50; // 50% casualties → morale break
const MORALE_GROUND_THRESHOLD = 0.75; // 75% casualties → morale break

/**
 * Calculate the total combat strength of a force.
 */
export function calculateForceStrength(
  force: CombatForce,
  unitTypes: Map<string, UnitType>,
  phase: CombatPhase,
  options?: CombatOptions,
): number {
  let strength = 0;
  const strBonus = options?.attackerDoctrineStrBonus ?? 0;

  for (const unit of force.units) {
    const utype = unitTypes.get(unit.typeId);
    if (!utype) continue;
    // Filter by phase
    if (phase === "fleet-engagement" && utype.category !== "fleet") continue;
    if (phase === "ground-assault" && utype.category !== "ground") continue;
    const hpRatio = unit.currentHp / utype.hp;
    const attack = utype.attack + (force.isDefender ? 0 : strBonus);
    const raw = (attack + utype.defence) * hpRatio;
    strength += raw;
  }

  if (force.isDefender) {
    strength *= DEFENDER_BONUS;
  }

  // Apply multiplicative bonuses
  if (options?.coalitionBonus) {
    strength *= (1 + options.coalitionBonus);
  }
  if (options?.fleetCompositionBonus) {
    strength *= (1 + options.fleetCompositionBonus);
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
  options?: CombatOptions,
): CombatResult {
  const attackStrength = calculateForceStrength(attacker, unitTypes, phase, options);
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

  // Check morale
  const attackerMorale = checkMorale(attacker, attackerLosses.map(u => u.id), phase);
  const defenderMorale = checkMorale(defender, defenderLosses.map(u => u.id), phase);

  // Infrastructure damage for orbital bombardment
  const infrastructureDamage = phase === "orbital-bombardment" && attackerWins
    ? calculateInfrastructureDamage(attackStrength, rng)
    : 0;

  return {
    phase,
    attackerId: attacker.empireId,
    defenderId: defender.empireId,
    systemId,
    attackerLosses: attackerLosses.map((u) => u.id),
    defenderLosses: defenderLosses.map((u) => u.id),
    victor: attackerWins ? attacker.empireId : defender.empireId,
    systemCaptured,
    retreated: attackerMorale.retreated || defenderMorale.retreated,
    moraleBreak: attackerMorale.moraleBreak || defenderMorale.moraleBreak,
    infrastructureDamage,
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

/* ── Multi-Phase Combat ── */

/**
 * Resolve a full combat sequence: fleet → orbital bombardment → ground assault.
 * Stops if attacker loses fleet phase.
 */
export function resolveFullCombat(
  attacker: CombatForce,
  defender: CombatForce,
  systemId: SystemId,
  unitTypes: Map<string, UnitType>,
  rng: SeededRNG,
  options?: CombatOptions,
): CombatResult[] {
  const results: CombatResult[] = [];

  // Phase 1: Fleet Engagement
  const hasAttackerFleet = attacker.units.some(u => {
    const ut = unitTypes.get(u.typeId);
    return ut?.category === "fleet";
  });
  const hasDefenderFleet = defender.units.some(u => {
    const ut = unitTypes.get(u.typeId);
    return ut?.category === "fleet";
  });

  if (hasAttackerFleet || hasDefenderFleet) {
    const fleetResult = resolveCombat(attacker, defender, systemId, "fleet-engagement", unitTypes, rng, options);
    results.push(fleetResult);

    // If attacker lost fleet, combat ends
    if (fleetResult.victor !== attacker.empireId) {
      return results;
    }

    // Remove fleet casualties from forces for subsequent phases
    removeCasualties(attacker, fleetResult.attackerLosses);
    removeCasualties(defender, fleetResult.defenderLosses);
  }

  // Phase 2: Orbital Bombardment (if attacker has bombardment ships)
  const hasBombardment = attacker.units.some(u => u.typeId === "bombardment-ship");
  if (hasBombardment) {
    const orbitalResult = resolveCombat(attacker, defender, systemId, "orbital-bombardment", unitTypes, rng, options);
    results.push(orbitalResult);

    removeCasualties(attacker, orbitalResult.attackerLosses);
    removeCasualties(defender, orbitalResult.defenderLosses);
  }

  // Phase 3: Ground Assault (if attacker has ground units)
  const hasAttackerGround = attacker.units.some(u => {
    const ut = unitTypes.get(u.typeId);
    return ut?.category === "ground";
  });

  if (hasAttackerGround) {
    const groundResult = resolveCombat(attacker, defender, systemId, "ground-assault", unitTypes, rng, options);
    results.push(groundResult);
  }

  return results;
}

function removeCasualties(force: CombatForce, casualtyIds: UnitId[]): void {
  const lostSet = new Set(casualtyIds);
  force.units = force.units.filter(u => !lostSet.has(u.id));
}

/* ── Morale ── */

/**
 * Check if a force suffers a morale break based on casualties.
 */
export function checkMorale(
  force: CombatForce,
  casualties: UnitId[],
  phase: CombatPhase,
): { retreated: boolean; moraleBreak: boolean } {
  const total = force.units.length;
  if (total === 0) return { retreated: false, moraleBreak: false };

  const ratio = casualties.length / total;
  const threshold = phase === "ground-assault" ? MORALE_GROUND_THRESHOLD : MORALE_FLEET_THRESHOLD;

  if (ratio >= threshold) {
    return { retreated: true, moraleBreak: true };
  }
  return { retreated: false, moraleBreak: false };
}

/* ── Infrastructure Damage ── */

/**
 * Calculate infrastructure damage from orbital bombardment.
 * Returns damage as percentage (0–100).
 */
export function calculateInfrastructureDamage(
  bombardmentStrength: number,
  rng: SeededRNG,
): number {
  // Base damage scales with strength, with randomness
  const base = Math.min(80, bombardmentStrength * 0.3);
  const variance = rng.next() * 20;
  return Math.max(1, Math.min(100, Math.floor(base + variance)));
}

/**
 * Apply orbital bombardment damage to a star system's installations.
 * Each installation has an independent hit chance equal to damagePercent/100.
 * A hit reduces installation.condition by 0.5 (per design: damaged = 50% output).
 */
export function applyInfrastructureDamage(
  system: StarSystem,
  damagePercent: number,
  rng: SeededRNG,
): void {
  if (damagePercent <= 0) return;
  const hitChance = damagePercent / 100;
  for (const slot of system.slots) {
    if (slot.installation && slot.installation.condition > 0) {
      if (rng.next() < hitChance) {
        slot.installation.condition = Math.max(0, slot.installation.condition - 0.5);
      }
    }
  }
}

/* ── Blockade ── */

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
