/**
 * Fix missing database tables
 * Creates bot_tells table and tell_type enum if they don't exist
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Fixing missing database tables...\n");

  // Check if tell_type enum exists
  const enumCheck = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'tell_type'
    ) as exists
  `);

  const enumExists = enumCheck[0]?.exists;

  if (!enumExists) {
    console.log("Creating tell_type enum...");
    await db.execute(sql`
      CREATE TYPE tell_type AS ENUM (
        'military_buildup',
        'fleet_movement',
        'target_fixation',
        'diplomatic_overture',
        'economic_preparation',
        'treaty_interest',
        'aggression_spike',
        'silence'
      )
    `);
    console.log("  ✓ tell_type enum created");
  } else {
    console.log("  ✓ tell_type enum already exists");
  }

  // Check if bot_tells table exists
  const tableCheck = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'bot_tells'
    ) as exists
  `);

  const tableExists = tableCheck[0]?.exists;

  if (!tableExists) {
    console.log("Creating bot_tells table...");
    await db.execute(sql`
      CREATE TABLE bot_tells (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
        target_empire_id UUID REFERENCES empires(id) ON DELETE SET NULL,
        tell_type tell_type NOT NULL,
        is_bluff BOOLEAN NOT NULL DEFAULT false,
        true_intention tell_type,
        confidence DECIMAL(3, 2) NOT NULL DEFAULT 0.60,
        created_at_turn INTEGER NOT NULL,
        expires_at_turn INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("  ✓ bot_tells table created");

    // Create indexes
    console.log("Creating indexes...");
    await db.execute(sql`CREATE INDEX bot_tells_game_idx ON bot_tells(game_id)`);
    await db.execute(sql`CREATE INDEX bot_tells_empire_idx ON bot_tells(empire_id)`);
    await db.execute(sql`CREATE INDEX bot_tells_target_idx ON bot_tells(target_empire_id)`);
    await db.execute(sql`CREATE INDEX bot_tells_type_idx ON bot_tells(tell_type)`);
    await db.execute(sql`CREATE INDEX bot_tells_turn_idx ON bot_tells(created_at_turn)`);
    await db.execute(sql`CREATE INDEX bot_tells_expires_idx ON bot_tells(expires_at_turn)`);
    console.log("  ✓ indexes created");
  } else {
    console.log("  ✓ bot_tells table already exists");
  }

  // Check if region_connections table exists
  const regionConnectionsCheck = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'region_connections'
    ) as exists
  `);

  const regionConnectionsExists = regionConnectionsCheck[0]?.exists;

  if (!regionConnectionsExists) {
    console.log("Creating region_connections table...");
    await db.execute(sql`
      CREATE TABLE region_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        from_region_id UUID NOT NULL,
        to_region_id UUID NOT NULL,
        connection_type VARCHAR(50) NOT NULL DEFAULT 'standard',
        discovered_by_empire_id UUID REFERENCES empires(id) ON DELETE SET NULL,
        discovered_at_turn INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("  ✓ region_connections table created");

    // Create indexes
    await db.execute(sql`CREATE INDEX region_connections_game_idx ON region_connections(game_id)`);
    await db.execute(sql`CREATE INDEX region_connections_from_idx ON region_connections(from_region_id)`);
    await db.execute(sql`CREATE INDEX region_connections_to_idx ON region_connections(to_region_id)`);
    console.log("  ✓ indexes created");
  } else {
    console.log("  ✓ region_connections table already exists");
  }

  console.log("\n✓ Database schema fixed successfully!");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
