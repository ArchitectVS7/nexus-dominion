/**
 * Game Services Index
 *
 * Barrel export for all game services organized by domain.
 * This file provides backward-compatible imports while enabling
 * domain-based organization.
 *
 * Domain Structure:
 * - combat/: Combat resolution, attack validation, boss detection
 * - covert/: Covert operations and espionage
 * - crafting/: Crafting queue and resource crafting
 * - core/: Turn processing, victory, saves, sessions
 * - population/: Population growth, civil status
 * - research/: Research progression, sector traits
 *
 * Remaining flat services will be organized into domains incrementally.
 */

// Domain re-exports
export * from "./combat";
export * from "./covert";
export * from "./crafting";
export * from "./core";
export * from "./population";
export * from "./research";

// Flat services (to be organized)
// Note: Some exports have naming collisions and must be imported directly
// from their source modules (e.g., influence-sphere-service.validateAttack)
export * from "./resource-engine";
export * from "./resource-tier-service";
export * from "./sector-service";
export * from "./sector-balancing-service";
export * from "./unit-service";
export * from "./build-queue-service";
export * from "./upgrade-service";
export * from "./coalition-service";
export * from "./checkpoint-service";
export * from "./wormhole-service";
// wormhole-construction-service has naming collision with influence-sphere
export {
  processWormholeConstruction,
  startWormholeConstruction,
  getConstructionProjects,
  getPotentialDestinations,
  type WormholeConstructionProject,
  type WormholeConstructionCost,
  type WormholeConstructionInfo,
} from "./wormhole-construction-service";
export * from "./border-discovery-service";
export * from "./expansion-service";
export * from "./galaxy-generation-service";
export * from "./event-service";
// influence-sphere-service.validateAttack and calculateRegionDistance conflict
export {
  calculateInfluenceSphere,
  getValidAttackTargets,
  validateAttack as validateInfluenceAttack,
  recalculateInfluenceOnTerritoryChange,
  inheritNeighborsFromEliminated,
  type InfluenceSphereResult,
  type AttackValidationResult as InfluenceAttackValidation,
} from "./influence-sphere-service";
// threat-service exports
export {
  assessThreats,
  calculateThreatLevel,
  calculateMilitaryPower,
  getDiplomaticStatus,
  getRecentAction,
  type ThreatAssessmentResult,
  type ThreatLevel,
  type ThreatInfo,
} from "./threat-service";
export * from "./victory-points-service";
export * from "./syndicate-service";
export * from "./pirate-service";
export * from "./shared-victory-service";
