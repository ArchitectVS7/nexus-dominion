import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// Load environment variables
config({ path: ".env.local" });

async function applyResearchMigration() {
  console.log("Applying research migration...");

  try {
    // Migration 0002: Create research enums and columns
    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'research_doctrine') THEN
          CREATE TYPE "public"."research_doctrine" AS ENUM('war_machine', 'fortress', 'commerce');
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'research_specialization') THEN
          CREATE TYPE "public"."research_specialization" AS ENUM('shock_troops', 'siege_engines', 'shield_arrays', 'minefield_networks', 'trade_routes', 'economic_sanctions');
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empires' AND column_name = 'research_doctrine') THEN
          ALTER TABLE "empires" ADD COLUMN "research_doctrine" "research_doctrine";
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empires' AND column_name = 'research_specialization') THEN
          ALTER TABLE "empires" ADD COLUMN "research_specialization" "research_specialization";
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empires' AND column_name = 'research_tier') THEN
          ALTER TABLE "empires" ADD COLUMN "research_tier" integer DEFAULT 0 NOT NULL;
        END IF;
      END $$;
    `));

    // Migration 0003: Add message channel and trigger enum values
    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumtypid = 'message_channel'::regtype
          AND enumlabel = 'galactic'
        ) THEN
          ALTER TYPE "public"."message_channel" ADD VALUE 'galactic';
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumtypid = 'message_trigger'::regtype
          AND enumlabel = 'research_doctrine'
        ) THEN
          ALTER TYPE "public"."message_trigger" ADD VALUE 'research_doctrine';
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumtypid = 'message_trigger'::regtype
          AND enumlabel = 'research_specialization'
        ) THEN
          ALTER TYPE "public"."message_trigger" ADD VALUE 'research_specialization';
        END IF;
      END $$;
    `));

    await db.execute(sql.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumtypid = 'message_trigger'::regtype
          AND enumlabel = 'research_capstone'
        ) THEN
          ALTER TYPE "public"."message_trigger" ADD VALUE 'research_capstone';
        END IF;
      END $$;
    `));

    console.log("✓ Research migration applied successfully!");
  } catch (error) {
    console.error("Error applying migration:", error);
    throw error;
  }
}

applyResearchMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
