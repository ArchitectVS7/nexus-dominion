/**
 * Fix planet → sector terminology in database columns
 * Handles all remaining column renames that migrations missed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

interface ColumnRename {
  table: string;
  oldName: string;
  newName: string;
}

const COLUMN_RENAMES: ColumnRename[] = [
  { table: "empires", oldName: "planet_count", newName: "sector_count" },
  { table: "attacks", oldName: "target_planet_id", newName: "target_sector_id" },
  { table: "attacks", oldName: "planet_captured", newName: "sector_captured" },
];

async function renameColumnIfNeeded(rename: ColumnRename): Promise<boolean> {
  const columns = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = ${rename.table}
    AND column_name IN (${rename.oldName}, ${rename.newName})
  `);

  const columnNames = columns.map((c) => c.column_name as string);

  if (columnNames.includes(rename.oldName) && !columnNames.includes(rename.newName)) {
    console.log(`  Renaming ${rename.table}.${rename.oldName} → ${rename.newName}...`);
    await db.execute(
      sql.raw(`ALTER TABLE "${rename.table}" RENAME COLUMN "${rename.oldName}" TO "${rename.newName}"`)
    );
    console.log(`  ✓ Renamed successfully`);
    return true;
  } else if (columnNames.includes(rename.newName)) {
    console.log(`  ✓ ${rename.table}.${rename.newName} already exists`);
    return false;
  } else {
    console.log(`  ⚠ Neither column exists in ${rename.table}`);
    return false;
  }
}

async function main() {
  console.log("Fixing planet → sector terminology in database...\n");

  let changesCount = 0;

  for (const rename of COLUMN_RENAMES) {
    try {
      const changed = await renameColumnIfNeeded(rename);
      if (changed) changesCount++;
    } catch (error) {
      console.error(`  ✗ Error renaming ${rename.table}.${rename.oldName}:`, error);
    }
  }

  console.log(`\n✓ Done. ${changesCount} columns renamed.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
