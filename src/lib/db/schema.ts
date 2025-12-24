import {
  pgTable,
  uuid,
  varchar,
  integer,
  bigint,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  json,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const gameStatusEnum = pgEnum("game_status", [
  "setup",
  "active",
  "paused",
  "completed",
  "abandoned",
]);

export const empireTypeEnum = pgEnum("empire_type", ["player", "bot"]);

export const botTierEnum = pgEnum("bot_tier", [
  "tier1_llm",
  "tier2_strategic",
  "tier3_simple",
  "tier4_random",
]);

export const botArchetypeEnum = pgEnum("bot_archetype", [
  "warlord",
  "diplomat",
  "merchant",
  "schemer",
  "turtle",
  "blitzkrieg",
  "tech_rush",
  "opportunist",
]);

export const planetTypeEnum = pgEnum("planet_type", [
  "food",
  "ore",
  "petroleum",
  "tourism",
  "urban",
  "education",
  "government",
  "research",
  "supply",
  "anti_pollution",
]);

export const civilStatusEnum = pgEnum("civil_status", [
  "ecstatic",
  "happy",
  "content",
  "neutral",
  "unhappy",
  "angry",
  "rioting",
  "revolting",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "normal",
  "hard",
  "nightmare",
]);

export const victoryTypeEnum = pgEnum("victory_type", [
  "conquest",
  "economic",
  "diplomatic",
  "research",
  "military",
  "survival",
]);

// ============================================
// GAMES TABLE
// ============================================

export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    status: gameStatusEnum("status").notNull().default("setup"),

    // Game settings
    turnLimit: integer("turn_limit").notNull().default(200),
    currentTurn: integer("current_turn").notNull().default(1),
    difficulty: difficultyEnum("difficulty").notNull().default("normal"),

    // Bot configuration
    botCount: integer("bot_count").notNull().default(25),
    protectionTurns: integer("protection_turns").notNull().default(20),

    // Performance tracking
    lastTurnProcessingMs: integer("last_turn_processing_ms"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("games_status_idx").on(table.status)]
);

// ============================================
// EMPIRES TABLE
// ============================================

export const empires = pgTable(
  "empires",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    // Identity
    name: varchar("name", { length: 255 }).notNull(),
    emperorName: varchar("emperor_name", { length: 255 }),
    type: empireTypeEnum("type").notNull().default("player"),

    // Bot-specific fields (null for player)
    botTier: botTierEnum("bot_tier"),
    botArchetype: botArchetypeEnum("bot_archetype"),

    // Resources (stored as bigint for large numbers)
    credits: bigint("credits", { mode: "number" }).notNull().default(100000),
    food: bigint("food", { mode: "number" }).notNull().default(1000),
    ore: bigint("ore", { mode: "number" }).notNull().default(500),
    petroleum: bigint("petroleum", { mode: "number" }).notNull().default(200),
    researchPoints: bigint("research_points", { mode: "number" })
      .notNull()
      .default(0),

    // Population
    population: bigint("population", { mode: "number" }).notNull().default(10000),
    populationCap: bigint("population_cap", { mode: "number" })
      .notNull()
      .default(50000),
    civilStatus: civilStatusEnum("civil_status").notNull().default("content"),

    // Military totals (denormalized for performance)
    soldiers: integer("soldiers").notNull().default(100),
    fighters: integer("fighters").notNull().default(0),
    stations: integer("stations").notNull().default(0),
    lightCruisers: integer("light_cruisers").notNull().default(0),
    heavyCruisers: integer("heavy_cruisers").notNull().default(0),
    carriers: integer("carriers").notNull().default(0),
    covertAgents: integer("covert_agents").notNull().default(0),

    // Combat stats
    armyEffectiveness: decimal("army_effectiveness", { precision: 5, scale: 2 })
      .notNull()
      .default("85.00"),
    covertPoints: integer("covert_points").notNull().default(0),

    // Research progress
    fundamentalResearchLevel: integer("fundamental_research_level")
      .notNull()
      .default(0),

    // Computed stats (updated each turn)
    networth: bigint("networth", { mode: "number" }).notNull().default(0),
    planetCount: integer("planet_count").notNull().default(9),

    // Game state
    isEliminated: boolean("is_eliminated").notNull().default(false),
    eliminatedAtTurn: integer("eliminated_at_turn"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("empires_game_idx").on(table.gameId),
    index("empires_type_idx").on(table.type),
    index("empires_networth_idx").on(table.networth),
  ]
);

// ============================================
// PLANETS TABLE
// ============================================

export const planets = pgTable(
  "planets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empireId: uuid("empire_id")
      .notNull()
      .references(() => empires.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    // Planet info
    type: planetTypeEnum("type").notNull(),
    name: varchar("name", { length: 255 }),

    // Production rates (base values from PRD)
    productionRate: decimal("production_rate", { precision: 10, scale: 2 }).notNull(),

    // Acquisition info
    purchasePrice: integer("purchase_price").notNull(),
    acquiredAtTurn: integer("acquired_at_turn").notNull().default(1),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("planets_empire_idx").on(table.empireId),
    index("planets_game_idx").on(table.gameId),
    index("planets_type_idx").on(table.type),
  ]
);

// ============================================
// GAME SAVES TABLE (Auto-save / Ironman)
// ============================================

export const gameSaves = pgTable(
  "game_saves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    turn: integer("turn").notNull(),

    // Snapshot data (full game state serialized)
    snapshot: json("snapshot").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("game_saves_game_idx").on(table.gameId),
    index("game_saves_turn_idx").on(table.turn),
  ]
);

// ============================================
// PERFORMANCE LOGS TABLE
// ============================================

export const performanceLogs = pgTable(
  "performance_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id").references(() => games.id, { onDelete: "set null" }),

    // Log entry
    operation: varchar("operation", { length: 100 }).notNull(),
    durationMs: integer("duration_ms").notNull(),
    metadata: json("metadata"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("perf_logs_game_idx").on(table.gameId),
    index("perf_logs_operation_idx").on(table.operation),
    index("perf_logs_created_idx").on(table.createdAt),
  ]
);

// ============================================
// RELATIONS
// ============================================

export const gamesRelations = relations(games, ({ many }) => ({
  empires: many(empires),
  planets: many(planets),
  saves: many(gameSaves),
  performanceLogs: many(performanceLogs),
}));

export const empiresRelations = relations(empires, ({ one, many }) => ({
  game: one(games, {
    fields: [empires.gameId],
    references: [games.id],
  }),
  planets: many(planets),
}));

export const planetsRelations = relations(planets, ({ one }) => ({
  empire: one(empires, {
    fields: [planets.empireId],
    references: [empires.id],
  }),
  game: one(games, {
    fields: [planets.gameId],
    references: [games.id],
  }),
}));

export const gameSavesRelations = relations(gameSaves, ({ one }) => ({
  game: one(games, {
    fields: [gameSaves.gameId],
    references: [games.id],
  }),
}));

export const performanceLogsRelations = relations(performanceLogs, ({ one }) => ({
  game: one(games, {
    fields: [performanceLogs.gameId],
    references: [games.id],
  }),
}));

// ============================================
// TYPE EXPORTS
// ============================================

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type Empire = typeof empires.$inferSelect;
export type NewEmpire = typeof empires.$inferInsert;

export type Planet = typeof planets.$inferSelect;
export type NewPlanet = typeof planets.$inferInsert;

export type GameSave = typeof gameSaves.$inferSelect;
export type NewGameSave = typeof gameSaves.$inferInsert;

export type PerformanceLog = typeof performanceLogs.$inferSelect;
export type NewPerformanceLog = typeof performanceLogs.$inferInsert;
