CREATE TYPE "public"."connection_type" AS ENUM('adjacent', 'trade_route', 'wormhole', 'hazardous', 'contested');--> statement-breakpoint
CREATE TYPE "public"."game_mode" AS ENUM('oneshot', 'campaign');--> statement-breakpoint
CREATE TYPE "public"."region_type" AS ENUM('core', 'inner', 'outer', 'rim', 'void');--> statement-breakpoint
CREATE TYPE "public"."wormhole_status" AS ENUM('undiscovered', 'discovered', 'stabilized', 'collapsed', 'constructing');--> statement-breakpoint
CREATE TABLE "empire_influence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"home_region_id" uuid NOT NULL,
	"primary_region_id" uuid NOT NULL,
	"base_influence_radius" integer DEFAULT 3 NOT NULL,
	"bonus_influence_radius" integer DEFAULT 0 NOT NULL,
	"total_influence_radius" integer DEFAULT 3 NOT NULL,
	"direct_neighbor_ids" json DEFAULT '[]' NOT NULL,
	"extended_neighbor_ids" json DEFAULT '[]' NOT NULL,
	"known_wormhole_ids" json DEFAULT '[]' NOT NULL,
	"controlled_region_ids" json DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galaxy_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"region_type" "region_type" NOT NULL,
	"position_x" numeric(8, 2) NOT NULL,
	"position_y" numeric(8, 2) NOT NULL,
	"wealth_modifier" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"danger_level" integer DEFAULT 50 NOT NULL,
	"max_empires" integer DEFAULT 10 NOT NULL,
	"current_empire_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"session_number" integer NOT NULL,
	"start_turn" integer NOT NULL,
	"end_turn" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"empires_eliminated" integer DEFAULT 0 NOT NULL,
	"notable_events" json DEFAULT '[]'::json
);
--> statement-breakpoint
CREATE TABLE "llm_decision_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid NOT NULL,
	"for_turn" integer NOT NULL,
	"decision_json" json NOT NULL,
	"reasoning" varchar(1000),
	"message" varchar(500),
	"provider" "llm_provider" NOT NULL,
	"model" varchar(100) NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "region_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"from_region_id" uuid NOT NULL,
	"to_region_id" uuid NOT NULL,
	"connection_type" "connection_type" NOT NULL,
	"force_multiplier" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"travel_cost" integer DEFAULT 0 NOT NULL,
	"trade_bonus" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"wormhole_status" "wormhole_status",
	"discovered_by_empire_id" uuid,
	"discovered_at_turn" integer,
	"stabilized_at_turn" integer,
	"collapse_chance" numeric(4, 2) DEFAULT '0.00',
	"is_bidirectional" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "empires" ALTER COLUMN "planet_count" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "empires" ADD COLUMN "is_boss" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "empires" ADD COLUMN "boss_emergence_turn" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "game_mode" "game_mode" DEFAULT 'oneshot' NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "session_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "last_session_at" timestamp;--> statement-breakpoint
ALTER TABLE "empire_influence" ADD CONSTRAINT "empire_influence_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empire_influence" ADD CONSTRAINT "empire_influence_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empire_influence" ADD CONSTRAINT "empire_influence_home_region_id_galaxy_regions_id_fk" FOREIGN KEY ("home_region_id") REFERENCES "public"."galaxy_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empire_influence" ADD CONSTRAINT "empire_influence_primary_region_id_galaxy_regions_id_fk" FOREIGN KEY ("primary_region_id") REFERENCES "public"."galaxy_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galaxy_regions" ADD CONSTRAINT "galaxy_regions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_decision_cache" ADD CONSTRAINT "llm_decision_cache_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_decision_cache" ADD CONSTRAINT "llm_decision_cache_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_connections" ADD CONSTRAINT "region_connections_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_connections" ADD CONSTRAINT "region_connections_from_region_id_galaxy_regions_id_fk" FOREIGN KEY ("from_region_id") REFERENCES "public"."galaxy_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_connections" ADD CONSTRAINT "region_connections_to_region_id_galaxy_regions_id_fk" FOREIGN KEY ("to_region_id") REFERENCES "public"."galaxy_regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_connections" ADD CONSTRAINT "region_connections_discovered_by_empire_id_empires_id_fk" FOREIGN KEY ("discovered_by_empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "empire_influence_empire_idx" ON "empire_influence" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "empire_influence_game_idx" ON "empire_influence" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "empire_influence_home_idx" ON "empire_influence" USING btree ("home_region_id");--> statement-breakpoint
CREATE INDEX "empire_influence_primary_idx" ON "empire_influence" USING btree ("primary_region_id");--> statement-breakpoint
CREATE INDEX "galaxy_regions_game_idx" ON "galaxy_regions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "galaxy_regions_type_idx" ON "galaxy_regions" USING btree ("region_type");--> statement-breakpoint
CREATE INDEX "game_sessions_game_id_idx" ON "game_sessions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_sessions_session_number_idx" ON "game_sessions" USING btree ("game_id","session_number");--> statement-breakpoint
CREATE INDEX "llm_cache_unique_idx" ON "llm_decision_cache" USING btree ("game_id","empire_id","for_turn");--> statement-breakpoint
CREATE INDEX "llm_cache_game_idx" ON "llm_decision_cache" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "llm_cache_turn_idx" ON "llm_decision_cache" USING btree ("for_turn");--> statement-breakpoint
CREATE INDEX "region_connections_game_idx" ON "region_connections" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "region_connections_from_idx" ON "region_connections" USING btree ("from_region_id");--> statement-breakpoint
CREATE INDEX "region_connections_to_idx" ON "region_connections" USING btree ("to_region_id");--> statement-breakpoint
CREATE INDEX "region_connections_type_idx" ON "region_connections" USING btree ("connection_type");--> statement-breakpoint
CREATE INDEX "region_connections_wormhole_idx" ON "region_connections" USING btree ("wormhole_status");