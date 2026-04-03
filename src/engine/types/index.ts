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
    Empire, EmpireConfig, BuildQueueEntry,
} from "./empire";
export { STABILITY_MULTIPLIERS } from "./empire";

// Military
export type {
    UnitCategory, UnitType, Unit, D20StatBlock,
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
    AchievementEvent, ResearchEvent, MarketEvent,
    BuildCompleteEvent, ConvergenceAlertEvent,
    NexusSignalEvent, CycleReport,
    SyndicateEvent, CovertEvent,
} from "./events";

// Syndicate
export type {
    SyndicateRank, SyndicateContractId, SyndicateContractDef,
    SyndicateMember, SyndicateState,
} from "./syndicate";
export { RANK_INFLUENCE_THRESHOLDS, CONTRACT_DEFINITIONS } from "./syndicate";

// Covert
export type {
    CovertOperationType, CovertOperationDef, QueuedCovertOp,
    CovertResult, EmpireCovertState, CovertState,
} from "./covert";
export { COVERT_OPERATION_DEFS } from "./covert";

// Game State
export type {
    GameState, CampaignMeta, SaveFile,
    MarketPrices, MarketState,
} from "./game-state";
