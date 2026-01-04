CREATE TYPE "public"."research_doctrine" AS ENUM('war_machine', 'fortress', 'commerce');--> statement-breakpoint
CREATE TYPE "public"."research_specialization" AS ENUM('shock_troops', 'siege_engines', 'shield_arrays', 'minefield_networks', 'trade_routes', 'economic_sanctions');--> statement-breakpoint
ALTER TABLE "empires" ADD COLUMN "research_doctrine" "research_doctrine";--> statement-breakpoint
ALTER TABLE "empires" ADD COLUMN "research_specialization" "research_specialization";--> statement-breakpoint
ALTER TABLE "empires" ADD COLUMN "research_tier" integer DEFAULT 0 NOT NULL;