CREATE TYPE "public"."attack_type" AS ENUM('invasion', 'guerilla');--> statement-breakpoint
CREATE TYPE "public"."bot_archetype" AS ENUM('warlord', 'diplomat', 'merchant', 'schemer', 'turtle', 'blitzkrieg', 'tech_rush', 'opportunist');--> statement-breakpoint
CREATE TYPE "public"."bot_tier" AS ENUM('tier1_llm', 'tier1_elite_scripted', 'tier2_strategic', 'tier3_simple', 'tier4_random');--> statement-breakpoint
CREATE TYPE "public"."civil_status" AS ENUM('ecstatic', 'happy', 'content', 'neutral', 'unhappy', 'angry', 'rioting', 'revolting');--> statement-breakpoint
CREATE TYPE "public"."coalition_status" AS ENUM('forming', 'active', 'dissolved');--> statement-breakpoint
CREATE TYPE "public"."combat_outcome" AS ENUM('attacker_victory', 'defender_victory', 'retreat', 'stalemate');--> statement-breakpoint
CREATE TYPE "public"."combat_phase" AS ENUM('space', 'orbital', 'ground');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('available', 'accepted', 'in_progress', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('supply_run', 'disruption', 'salvage_op', 'intel_gathering', 'intimidation', 'economic_warfare', 'military_probe', 'hostile_takeover', 'kingslayer', 'market_manipulation', 'regime_change', 'decapitation_strike', 'proxy_war', 'scorched_earth', 'the_equalizer');--> statement-breakpoint
CREATE TYPE "public"."crafted_resource_type" AS ENUM('refined_metals', 'fuel_cells', 'polymers', 'processed_food', 'labor_units', 'electronics', 'armor_plating', 'propulsion_units', 'life_support', 'weapons_grade_alloy', 'targeting_arrays', 'stealth_composites', 'quantum_processors', 'reactor_cores', 'shield_generators', 'warp_drives', 'cloaking_devices', 'ion_cannon_cores', 'neural_interfaces', 'singularity_containment', 'bioweapon_synthesis', 'nuclear_warheads');--> statement-breakpoint
CREATE TYPE "public"."crafting_status" AS ENUM('queued', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'normal', 'hard', 'nightmare');--> statement-breakpoint
CREATE TYPE "public"."emotional_state" AS ENUM('confident', 'arrogant', 'desperate', 'vengeful', 'fearful', 'triumphant', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."empire_type" AS ENUM('player', 'bot');--> statement-breakpoint
CREATE TYPE "public"."galactic_event_subtype" AS ENUM('market_crash', 'resource_boom', 'trade_embargo', 'economic_miracle', 'coup_attempt', 'assassination', 'rebellion', 'political_scandal', 'pirate_armada', 'arms_race', 'mercenary_influx', 'military_parade', 'ancient_discovery', 'prophecy_revealed', 'mysterious_signal', 'cultural_renaissance');--> statement-breakpoint
CREATE TYPE "public"."galactic_event_type" AS ENUM('economic', 'political', 'military', 'narrative');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('setup', 'active', 'paused', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."llm_call_status" AS ENUM('pending', 'completed', 'failed', 'rate_limited');--> statement-breakpoint
CREATE TYPE "public"."llm_provider" AS ENUM('groq', 'together', 'openai', 'anthropic');--> statement-breakpoint
CREATE TYPE "public"."market_order_status" AS ENUM('pending', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."market_order_type" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('planet_captured', 'planet_lost', 'ally_saved', 'ally_betrayed', 'trade_completed', 'treaty_formed', 'treaty_broken', 'war_declared', 'war_ended', 'covert_detected', 'tribute_paid', 'tribute_received', 'battle_won', 'battle_lost', 'message_received');--> statement-breakpoint
CREATE TYPE "public"."message_channel" AS ENUM('direct', 'broadcast');--> statement-breakpoint
CREATE TYPE "public"."message_trigger" AS ENUM('greeting', 'battle_taunt', 'victory_gloat', 'defeat', 'trade_offer', 'alliance_proposal', 'betrayal', 'covert_detected', 'tribute_demand', 'threat_warning', 'retreat', 'eliminated', 'endgame', 'broadcast_shout', 'casual_message');--> statement-breakpoint
CREATE TYPE "public"."pirate_mission_status" AS ENUM('queued', 'executing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."planet_type" AS ENUM('food', 'ore', 'petroleum', 'tourism', 'urban', 'education', 'government', 'research', 'supply', 'anti_pollution', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."reputation_event_type" AS ENUM('treaty_broken', 'treaty_honored', 'alliance_formed', 'alliance_ended', 'nap_formed', 'nap_ended');--> statement-breakpoint
CREATE TYPE "public"."research_branch" AS ENUM('military', 'defense', 'propulsion', 'stealth', 'economy', 'biotech');--> statement-breakpoint
CREATE TYPE "public"."resource_tier" AS ENUM('tier0', 'tier1', 'tier2', 'tier3');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('food', 'ore', 'petroleum', 'credits');--> statement-breakpoint
CREATE TYPE "public"."syndicate_trust_level" AS ENUM('unknown', 'associate', 'runner', 'soldier', 'captain', 'lieutenant', 'underboss', 'consigliere', 'syndicate_lord');--> statement-breakpoint
CREATE TYPE "public"."treaty_status" AS ENUM('proposed', 'active', 'rejected', 'cancelled', 'broken');--> statement-breakpoint
CREATE TYPE "public"."treaty_type" AS ENUM('nap', 'alliance');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('soldiers', 'fighters', 'light_cruisers', 'heavy_cruisers', 'carriers', 'stations', 'covert_agents');--> statement-breakpoint
CREATE TYPE "public"."victory_type" AS ENUM('conquest', 'economic', 'diplomatic', 'research', 'military', 'survival');--> statement-breakpoint
CREATE TABLE "attacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"attacker_id" uuid NOT NULL,
	"defender_id" uuid NOT NULL,
	"target_planet_id" uuid,
	"turn" integer NOT NULL,
	"attack_type" "attack_type" DEFAULT 'invasion' NOT NULL,
	"attacker_soldiers" integer DEFAULT 0 NOT NULL,
	"attacker_fighters" integer DEFAULT 0 NOT NULL,
	"attacker_light_cruisers" integer DEFAULT 0 NOT NULL,
	"attacker_heavy_cruisers" integer DEFAULT 0 NOT NULL,
	"attacker_carriers" integer DEFAULT 0 NOT NULL,
	"attacker_stations" integer DEFAULT 0 NOT NULL,
	"defender_soldiers" integer DEFAULT 0 NOT NULL,
	"defender_fighters" integer DEFAULT 0 NOT NULL,
	"defender_light_cruisers" integer DEFAULT 0 NOT NULL,
	"defender_heavy_cruisers" integer DEFAULT 0 NOT NULL,
	"defender_carriers" integer DEFAULT 0 NOT NULL,
	"defender_stations" integer DEFAULT 0 NOT NULL,
	"attacker_power" numeric(12, 2) NOT NULL,
	"defender_power" numeric(12, 2) NOT NULL,
	"outcome" "combat_outcome" NOT NULL,
	"planet_captured" boolean DEFAULT false NOT NULL,
	"attacker_casualties" json NOT NULL,
	"defender_casualties" json NOT NULL,
	"attacker_effectiveness_change" numeric(5, 2),
	"defender_effectiveness_change" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_emotional_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid NOT NULL,
	"state" "emotional_state" DEFAULT 'neutral' NOT NULL,
	"intensity" numeric(3, 2) DEFAULT '0.50' NOT NULL,
	"previous_state" "emotional_state",
	"state_changed_at_turn" integer,
	"recent_victories" integer DEFAULT 0 NOT NULL,
	"recent_defeats" integer DEFAULT 0 NOT NULL,
	"recent_betrayals" integer DEFAULT 0 NOT NULL,
	"recent_alliances" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid NOT NULL,
	"target_empire_id" uuid NOT NULL,
	"memory_type" "memory_type" NOT NULL,
	"weight" integer DEFAULT 50 NOT NULL,
	"description" varchar(500),
	"turn" integer NOT NULL,
	"decay_resistance" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"is_permanent_scar" boolean DEFAULT false NOT NULL,
	"context" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "build_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"unit_type" "unit_type" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"turns_remaining" integer NOT NULL,
	"total_cost" integer NOT NULL,
	"queue_position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "civil_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"turn" integer NOT NULL,
	"old_status" "civil_status" NOT NULL,
	"new_status" "civil_status" NOT NULL,
	"reason" varchar(500),
	"income_multiplier" numeric(3, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coalition_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coalition_id" uuid NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"joined_at_turn" integer NOT NULL,
	"left_at_turn" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coalitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"leader_id" uuid NOT NULL,
	"status" "coalition_status" DEFAULT 'forming' NOT NULL,
	"formed_at_turn" integer NOT NULL,
	"dissolved_at_turn" integer,
	"member_count" integer DEFAULT 1 NOT NULL,
	"total_networth" bigint DEFAULT 0 NOT NULL,
	"territory_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combat_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attack_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"phase" "combat_phase" NOT NULL,
	"phase_number" integer NOT NULL,
	"attacker_units" json NOT NULL,
	"defender_units" json NOT NULL,
	"attacker_phase_power" numeric(12, 2),
	"defender_phase_power" numeric(12, 2),
	"phase_winner" varchar(20),
	"phase_casualties" json NOT NULL,
	"description" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crafting_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"resource_type" "crafted_resource_type" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" "crafting_status" DEFAULT 'queued' NOT NULL,
	"components_reserved" json NOT NULL,
	"start_turn" integer NOT NULL,
	"completion_turn" integer NOT NULL,
	"queue_position" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"emperor_name" varchar(255),
	"type" "empire_type" DEFAULT 'player' NOT NULL,
	"bot_tier" "bot_tier",
	"bot_archetype" "bot_archetype",
	"llm_enabled" boolean DEFAULT false NOT NULL,
	"credits" bigint DEFAULT 100000 NOT NULL,
	"food" bigint DEFAULT 1000 NOT NULL,
	"ore" bigint DEFAULT 500 NOT NULL,
	"petroleum" bigint DEFAULT 200 NOT NULL,
	"research_points" bigint DEFAULT 0 NOT NULL,
	"population" bigint DEFAULT 10000 NOT NULL,
	"population_cap" bigint DEFAULT 50000 NOT NULL,
	"civil_status" "civil_status" DEFAULT 'content' NOT NULL,
	"soldiers" integer DEFAULT 100 NOT NULL,
	"fighters" integer DEFAULT 0 NOT NULL,
	"stations" integer DEFAULT 0 NOT NULL,
	"light_cruisers" integer DEFAULT 0 NOT NULL,
	"heavy_cruisers" integer DEFAULT 0 NOT NULL,
	"carriers" integer DEFAULT 0 NOT NULL,
	"covert_agents" integer DEFAULT 0 NOT NULL,
	"army_effectiveness" numeric(5, 2) DEFAULT '85.00' NOT NULL,
	"covert_points" integer DEFAULT 0 NOT NULL,
	"fundamental_research_level" integer DEFAULT 0 NOT NULL,
	"networth" bigint DEFAULT 0 NOT NULL,
	"planet_count" integer DEFAULT 9 NOT NULL,
	"reputation" integer DEFAULT 50 NOT NULL,
	"is_eliminated" boolean DEFAULT false NOT NULL,
	"eliminated_at_turn" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galactic_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"event_type" "galactic_event_type" NOT NULL,
	"event_subtype" "galactic_event_subtype" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(1000) NOT NULL,
	"severity" integer DEFAULT 50 NOT NULL,
	"affected_empire_id" uuid,
	"effects" json NOT NULL,
	"turn" integer NOT NULL,
	"duration_turns" integer DEFAULT 1 NOT NULL,
	"expires_at_turn" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"turn" integer NOT NULL,
	"snapshot" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "game_status" DEFAULT 'setup' NOT NULL,
	"turn_limit" integer DEFAULT 200 NOT NULL,
	"current_turn" integer DEFAULT 1 NOT NULL,
	"difficulty" "difficulty" DEFAULT 'normal' NOT NULL,
	"bot_count" integer DEFAULT 25 NOT NULL,
	"protection_turns" integer DEFAULT 20 NOT NULL,
	"last_turn_processing_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "llm_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid,
	"provider" "llm_provider" NOT NULL,
	"model" varchar(100) NOT NULL,
	"status" "llm_call_status" DEFAULT 'pending' NOT NULL,
	"purpose" varchar(100) NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
	"latency_ms" integer,
	"turn" integer NOT NULL,
	"did_fallback" boolean DEFAULT false NOT NULL,
	"fallback_reason" varchar(200),
	"fallback_provider" "llm_provider",
	"error_message" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "market_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid NOT NULL,
	"order_type" "market_order_type" NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_unit" numeric(12, 2) NOT NULL,
	"total_cost" numeric(16, 2) NOT NULL,
	"status" "market_order_status" DEFAULT 'pending' NOT NULL,
	"turn" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "market_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"base_price" integer NOT NULL,
	"current_price" numeric(12, 2) NOT NULL,
	"price_multiplier" numeric(5, 2) DEFAULT '1.00' NOT NULL,
	"total_supply" bigint DEFAULT 0 NOT NULL,
	"total_demand" bigint DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"turn_updated" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"sender_id" uuid,
	"recipient_id" uuid,
	"channel" "message_channel" DEFAULT 'direct' NOT NULL,
	"trigger" "message_trigger" NOT NULL,
	"content" varchar(2000) NOT NULL,
	"template_id" varchar(100),
	"is_read" boolean DEFAULT false NOT NULL,
	"turn" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "performance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid,
	"operation" varchar(100) NOT NULL,
	"duration_ms" integer NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pirate_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"contract_id" uuid,
	"triggering_empire_id" uuid,
	"target_empire_id" uuid NOT NULL,
	"mission_type" "contract_type" NOT NULL,
	"status" "pirate_mission_status" DEFAULT 'queued' NOT NULL,
	"queued_at_turn" integer NOT NULL,
	"execution_turn" integer NOT NULL,
	"completed_at_turn" integer,
	"results" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"type" "planet_type" NOT NULL,
	"name" varchar(255),
	"production_rate" numeric(10, 2) NOT NULL,
	"purchase_price" integer NOT NULL,
	"acquired_at_turn" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid NOT NULL,
	"affected_empire_id" uuid,
	"treaty_id" uuid,
	"event_type" "reputation_event_type" NOT NULL,
	"reputation_change" integer NOT NULL,
	"description" varchar(500),
	"turn" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_branch_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"military_percent" integer DEFAULT 0 NOT NULL,
	"defense_percent" integer DEFAULT 0 NOT NULL,
	"propulsion_percent" integer DEFAULT 0 NOT NULL,
	"stealth_percent" integer DEFAULT 0 NOT NULL,
	"economy_percent" integer DEFAULT 0 NOT NULL,
	"biotech_percent" integer DEFAULT 0 NOT NULL,
	"military_investment" bigint DEFAULT 0 NOT NULL,
	"defense_investment" bigint DEFAULT 0 NOT NULL,
	"propulsion_investment" bigint DEFAULT 0 NOT NULL,
	"stealth_investment" bigint DEFAULT 0 NOT NULL,
	"economy_investment" bigint DEFAULT 0 NOT NULL,
	"biotech_investment" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"research_level" integer DEFAULT 0 NOT NULL,
	"current_investment" bigint DEFAULT 0 NOT NULL,
	"required_investment" bigint DEFAULT 1000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"resource_type" "crafted_resource_type" NOT NULL,
	"tier" "resource_tier" NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syndicate_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"empire_id" uuid,
	"target_empire_id" uuid,
	"contract_type" "contract_type" NOT NULL,
	"status" "contract_status" DEFAULT 'available' NOT NULL,
	"min_trust_level" "syndicate_trust_level" NOT NULL,
	"credit_reward" integer NOT NULL,
	"trust_reward" integer NOT NULL,
	"special_reward" varchar(255),
	"created_at_turn" integer NOT NULL,
	"accepted_at_turn" integer,
	"deadline_turn" integer,
	"completed_at_turn" integer,
	"completion_criteria" json,
	"completion_progress" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syndicate_trust" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"trust_points" integer DEFAULT 0 NOT NULL,
	"trust_level" "syndicate_trust_level" DEFAULT 'unknown' NOT NULL,
	"contracts_completed" integer DEFAULT 0 NOT NULL,
	"contracts_failed" integer DEFAULT 0 NOT NULL,
	"total_credits_earned" bigint DEFAULT 0 NOT NULL,
	"last_interaction_turn" integer,
	"is_hostile" boolean DEFAULT false NOT NULL,
	"has_received_invitation" boolean DEFAULT false NOT NULL,
	"invitation_turn" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treaties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"proposer_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"treaty_type" "treaty_type" NOT NULL,
	"status" "treaty_status" DEFAULT 'proposed' NOT NULL,
	"proposed_at_turn" integer NOT NULL,
	"activated_at_turn" integer,
	"ended_at_turn" integer,
	"broken_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_upgrades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empire_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"unit_type" "unit_type" NOT NULL,
	"upgrade_level" integer DEFAULT 0 NOT NULL,
	"total_investment" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attacks" ADD CONSTRAINT "attacks_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attacks" ADD CONSTRAINT "attacks_attacker_id_empires_id_fk" FOREIGN KEY ("attacker_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attacks" ADD CONSTRAINT "attacks_defender_id_empires_id_fk" FOREIGN KEY ("defender_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attacks" ADD CONSTRAINT "attacks_target_planet_id_planets_id_fk" FOREIGN KEY ("target_planet_id") REFERENCES "public"."planets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_emotional_states" ADD CONSTRAINT "bot_emotional_states_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_emotional_states" ADD CONSTRAINT "bot_emotional_states_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_memories" ADD CONSTRAINT "bot_memories_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_memories" ADD CONSTRAINT "bot_memories_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_memories" ADD CONSTRAINT "bot_memories_target_empire_id_empires_id_fk" FOREIGN KEY ("target_empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_queue" ADD CONSTRAINT "build_queue_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "build_queue" ADD CONSTRAINT "build_queue_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civil_status_history" ADD CONSTRAINT "civil_status_history_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civil_status_history" ADD CONSTRAINT "civil_status_history_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coalition_members" ADD CONSTRAINT "coalition_members_coalition_id_coalitions_id_fk" FOREIGN KEY ("coalition_id") REFERENCES "public"."coalitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coalition_members" ADD CONSTRAINT "coalition_members_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coalition_members" ADD CONSTRAINT "coalition_members_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coalitions" ADD CONSTRAINT "coalitions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coalitions" ADD CONSTRAINT "coalitions_leader_id_empires_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combat_logs" ADD CONSTRAINT "combat_logs_attack_id_attacks_id_fk" FOREIGN KEY ("attack_id") REFERENCES "public"."attacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combat_logs" ADD CONSTRAINT "combat_logs_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crafting_queue" ADD CONSTRAINT "crafting_queue_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crafting_queue" ADD CONSTRAINT "crafting_queue_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empires" ADD CONSTRAINT "empires_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galactic_events" ADD CONSTRAINT "galactic_events_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galactic_events" ADD CONSTRAINT "galactic_events_affected_empire_id_empires_id_fk" FOREIGN KEY ("affected_empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_saves" ADD CONSTRAINT "game_saves_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_orders" ADD CONSTRAINT "market_orders_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_orders" ADD CONSTRAINT "market_orders_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_prices" ADD CONSTRAINT "market_prices_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_empires_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_empires_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_logs" ADD CONSTRAINT "performance_logs_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pirate_missions" ADD CONSTRAINT "pirate_missions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pirate_missions" ADD CONSTRAINT "pirate_missions_contract_id_syndicate_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."syndicate_contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pirate_missions" ADD CONSTRAINT "pirate_missions_triggering_empire_id_empires_id_fk" FOREIGN KEY ("triggering_empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pirate_missions" ADD CONSTRAINT "pirate_missions_target_empire_id_empires_id_fk" FOREIGN KEY ("target_empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planets" ADD CONSTRAINT "planets_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planets" ADD CONSTRAINT "planets_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_log" ADD CONSTRAINT "reputation_log_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_log" ADD CONSTRAINT "reputation_log_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_log" ADD CONSTRAINT "reputation_log_affected_empire_id_empires_id_fk" FOREIGN KEY ("affected_empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_log" ADD CONSTRAINT "reputation_log_treaty_id_treaties_id_fk" FOREIGN KEY ("treaty_id") REFERENCES "public"."treaties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_branch_allocations" ADD CONSTRAINT "research_branch_allocations_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_branch_allocations" ADD CONSTRAINT "research_branch_allocations_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_progress" ADD CONSTRAINT "research_progress_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_progress" ADD CONSTRAINT "research_progress_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_inventory" ADD CONSTRAINT "resource_inventory_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_inventory" ADD CONSTRAINT "resource_inventory_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicate_contracts" ADD CONSTRAINT "syndicate_contracts_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicate_contracts" ADD CONSTRAINT "syndicate_contracts_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicate_contracts" ADD CONSTRAINT "syndicate_contracts_target_empire_id_empires_id_fk" FOREIGN KEY ("target_empire_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicate_trust" ADD CONSTRAINT "syndicate_trust_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syndicate_trust" ADD CONSTRAINT "syndicate_trust_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treaties" ADD CONSTRAINT "treaties_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treaties" ADD CONSTRAINT "treaties_proposer_id_empires_id_fk" FOREIGN KEY ("proposer_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treaties" ADD CONSTRAINT "treaties_recipient_id_empires_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treaties" ADD CONSTRAINT "treaties_broken_by_id_empires_id_fk" FOREIGN KEY ("broken_by_id") REFERENCES "public"."empires"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_upgrades" ADD CONSTRAINT "unit_upgrades_empire_id_empires_id_fk" FOREIGN KEY ("empire_id") REFERENCES "public"."empires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_upgrades" ADD CONSTRAINT "unit_upgrades_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attacks_game_idx" ON "attacks" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "attacks_attacker_idx" ON "attacks" USING btree ("attacker_id");--> statement-breakpoint
CREATE INDEX "attacks_defender_idx" ON "attacks" USING btree ("defender_id");--> statement-breakpoint
CREATE INDEX "attacks_turn_idx" ON "attacks" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "bot_emotional_game_idx" ON "bot_emotional_states" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "bot_emotional_empire_idx" ON "bot_emotional_states" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "bot_emotional_state_idx" ON "bot_emotional_states" USING btree ("state");--> statement-breakpoint
CREATE INDEX "bot_memories_game_idx" ON "bot_memories" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "bot_memories_empire_idx" ON "bot_memories" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "bot_memories_target_idx" ON "bot_memories" USING btree ("target_empire_id");--> statement-breakpoint
CREATE INDEX "bot_memories_type_idx" ON "bot_memories" USING btree ("memory_type");--> statement-breakpoint
CREATE INDEX "bot_memories_weight_idx" ON "bot_memories" USING btree ("weight");--> statement-breakpoint
CREATE INDEX "bot_memories_turn_idx" ON "bot_memories" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "build_queue_empire_idx" ON "build_queue" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "build_queue_game_idx" ON "build_queue" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "civil_status_empire_idx" ON "civil_status_history" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "civil_status_game_idx" ON "civil_status_history" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "civil_status_turn_idx" ON "civil_status_history" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "coalition_members_coalition_idx" ON "coalition_members" USING btree ("coalition_id");--> statement-breakpoint
CREATE INDEX "coalition_members_empire_idx" ON "coalition_members" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "coalition_members_game_idx" ON "coalition_members" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "coalition_members_active_idx" ON "coalition_members" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coalitions_game_idx" ON "coalitions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "coalitions_leader_idx" ON "coalitions" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "coalitions_status_idx" ON "coalitions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "combat_logs_attack_idx" ON "combat_logs" USING btree ("attack_id");--> statement-breakpoint
CREATE INDEX "combat_logs_game_idx" ON "combat_logs" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "combat_logs_phase_idx" ON "combat_logs" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "crafting_queue_empire_idx" ON "crafting_queue" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "crafting_queue_game_idx" ON "crafting_queue" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "crafting_queue_status_idx" ON "crafting_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "empires_game_idx" ON "empires" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "empires_type_idx" ON "empires" USING btree ("type");--> statement-breakpoint
CREATE INDEX "empires_networth_idx" ON "empires" USING btree ("networth");--> statement-breakpoint
CREATE INDEX "galactic_events_game_idx" ON "galactic_events" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "galactic_events_type_idx" ON "galactic_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "galactic_events_turn_idx" ON "galactic_events" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "galactic_events_active_idx" ON "galactic_events" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "game_saves_game_idx" ON "game_saves" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_saves_turn_idx" ON "game_saves" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "llm_usage_game_idx" ON "llm_usage_logs" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "llm_usage_empire_idx" ON "llm_usage_logs" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "llm_usage_provider_idx" ON "llm_usage_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "llm_usage_status_idx" ON "llm_usage_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "llm_usage_turn_idx" ON "llm_usage_logs" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "llm_usage_created_idx" ON "llm_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "market_orders_game_idx" ON "market_orders" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "market_orders_empire_idx" ON "market_orders" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "market_orders_status_idx" ON "market_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "market_orders_turn_idx" ON "market_orders" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "market_prices_game_idx" ON "market_prices" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "market_prices_resource_idx" ON "market_prices" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "messages_game_idx" ON "messages" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_recipient_idx" ON "messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "messages_channel_idx" ON "messages" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "messages_turn_idx" ON "messages" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "messages_is_read_idx" ON "messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "perf_logs_game_idx" ON "performance_logs" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "perf_logs_operation_idx" ON "performance_logs" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "perf_logs_created_idx" ON "performance_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pirate_missions_game_idx" ON "pirate_missions" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "pirate_missions_contract_idx" ON "pirate_missions" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "pirate_missions_target_idx" ON "pirate_missions" USING btree ("target_empire_id");--> statement-breakpoint
CREATE INDEX "pirate_missions_status_idx" ON "pirate_missions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pirate_missions_execution_idx" ON "pirate_missions" USING btree ("execution_turn");--> statement-breakpoint
CREATE INDEX "planets_empire_idx" ON "planets" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "planets_game_idx" ON "planets" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "planets_type_idx" ON "planets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "reputation_log_game_idx" ON "reputation_log" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "reputation_log_empire_idx" ON "reputation_log" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "reputation_log_turn_idx" ON "reputation_log" USING btree ("turn");--> statement-breakpoint
CREATE INDEX "research_branch_empire_idx" ON "research_branch_allocations" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "research_branch_game_idx" ON "research_branch_allocations" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "research_empire_idx" ON "research_progress" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "research_game_idx" ON "research_progress" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "resource_inv_empire_idx" ON "resource_inventory" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "resource_inv_game_idx" ON "resource_inventory" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "resource_inv_type_idx" ON "resource_inventory" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "contracts_game_idx" ON "syndicate_contracts" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "contracts_empire_idx" ON "syndicate_contracts" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "contracts_target_idx" ON "syndicate_contracts" USING btree ("target_empire_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "syndicate_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contracts_type_idx" ON "syndicate_contracts" USING btree ("contract_type");--> statement-breakpoint
CREATE INDEX "syndicate_trust_empire_idx" ON "syndicate_trust" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "syndicate_trust_game_idx" ON "syndicate_trust" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "syndicate_trust_level_idx" ON "syndicate_trust" USING btree ("trust_level");--> statement-breakpoint
CREATE INDEX "treaties_game_idx" ON "treaties" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "treaties_proposer_idx" ON "treaties" USING btree ("proposer_id");--> statement-breakpoint
CREATE INDEX "treaties_recipient_idx" ON "treaties" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "treaties_status_idx" ON "treaties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "unit_upgrades_empire_idx" ON "unit_upgrades" USING btree ("empire_id");--> statement-breakpoint
CREATE INDEX "unit_upgrades_game_idx" ON "unit_upgrades" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "unit_upgrades_unit_type_idx" ON "unit_upgrades" USING btree ("unit_type");