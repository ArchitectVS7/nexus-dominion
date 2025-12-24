/**
 * Combat System Module
 *
 * Exports all combat-related functionality including:
 * - Three-phase combat resolution (Space → Orbital → Ground)
 * - Unit effectiveness matrix
 * - Combat power calculations
 */

// Phase resolution
export {
  type Forces,
  type PhaseResult,
  type CombatResult,
  type AttackType,
  resolveSpaceCombat,
  resolveOrbitalCombat,
  resolveGroundCombat,
  resolveInvasion,
  resolveGuerillaAttack,
  resolveRetreat,
  calculateSpacePhasePower,
  calculateOrbitalPhasePower,
  calculateGroundPhasePower,
  PLANET_CAPTURE_MIN_PERCENT,
  PLANET_CAPTURE_MAX_PERCENT,
  SOLDIERS_PER_CARRIER,
} from "./phases";

// Unit effectiveness
export {
  type CombatPhase,
  type CombatUnitType,
  UNIT_EFFECTIVENESS,
  EFFECTIVENESS_LEVELS,
  PHASE_PRIMARY_UNITS,
  getUnitEffectiveness,
  canParticipate,
  getParticipatingUnits,
  getPrimaryPhase,
  calculatePhaseEffectivePower,
  getPhaseRoleDescription,
} from "./effectiveness";
