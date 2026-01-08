/**
 * Quick script to check database column state
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Checking empires table columns...\n");

  // Check all columns in empires table
  const columns = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'empires'
    ORDER BY ordinal_position
  `);

  console.log("Empires table columns:");
  for (const col of columns) {
    console.log(`  - ${col.column_name} (${col.data_type})`);
  }

  // Check for migrations table
  const migrations = await db.execute(sql`
    SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5
  `);

  console.log("\nRecent migrations applied:");
  for (const m of migrations) {
    console.log(`  - ${m.hash}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
