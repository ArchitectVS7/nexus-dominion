/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Type Barrel Export
   ══════════════════════════════════════════════════════════════ */

// IDs
export type {
    EmpireId, SystemId, SectorId, FleetId,
    UnitId, PactId, CoalitionId, InstallationId,
} from "./ids";
export {
    EmpireId as createEmpireId,
    SystemId as createSystemId,
    SectorId as createSectorId,
    FleetId as createFleetId,
} from "./ids";

// Galaxy
export type {
    Position, BiomeType, InstallationType,
    Installation, DevelopmentSlot, StarSystem,
    Sector, SectorDominance, Galaxy, GalaxyConfig,
} from "./galaxy";

// Empire
export type {
    Resources, ResourceLedger, StabilityLevel,
    Empire, EmpireConfig,
} from "./empire";
export { STABILITY_MULTIPLIERS } from "./empire";

// Military
export type {
    UnitCategory, UnitType, Unit,
    Fleet, CombatPhase, CombatResult,
} from "./military";

// Diplomacy
export type {
    RelationshipStatus, RelationshipState,
    PactType, Pact, Coalition,
    DiplomacyState,
} from "./diplomacy";
export { relationshipKey } from "./diplomacy";

// Bot
export type {
    Archetype, BotAgent, PersonaProfile,
    Emotion, EmotionalState,
    BotActionType, BotAction,
} from "./bot";

// Time
export type {
    CosmicTier, CosmicOrder, TimeState,
} from "./time";
export { CYCLES_PER_CONFLUENCE } from "./time";

// Events
export type {
    GameEvent, ResourceEvent, ColonisationEvent,
    CombatEvent, DiplomacyEvent, ReckoningEvent,
    AchievementEvent, CycleReport,
} from "./events";

// Game State
export type {
    GameState, CampaignMeta, SaveFile,
} from "./game-state";
