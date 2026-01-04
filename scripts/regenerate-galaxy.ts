/**
 * Script to regenerate galaxy data for existing games
 *
 * Usage: npx tsx scripts/regenerate-galaxy.ts [gameId]
 *
 * If no gameId is provided, regenerates galaxy data for all games missing it.
 */

import * as dotenv from "dotenv";
import path from "path";

// Load from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { db } from "../src/lib/db";
import { games, galaxyRegions } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { regenerateGalaxyData } from "../src/lib/game/repositories/game-repository";

async function main() {
  const specificGameId = process.argv[2];

  if (specificGameId) {
    // Regenerate for specific game
    console.log(`Regenerating galaxy data for game: ${specificGameId}`);
    const result = await regenerateGalaxyData(specificGameId);
    console.log(result.success ? "SUCCESS" : "FAILED", "-", result.message);
  } else {
    // Find all games missing galaxy data
    console.log("Finding games without galaxy data...\n");

    const allGames = await db.query.games.findMany();
    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const game of allGames) {
      // Check if galaxy data exists
      const regions = await db.query.galaxyRegions.findMany({
        where: eq(galaxyRegions.gameId, game.id),
        limit: 1,
      });

      if (regions.length > 0) {
        console.log(`[SKIP] Game "${game.name}" (${game.id}) - already has galaxy data`);
        skipped++;
        continue;
      }

      console.log(`[FIXING] Game "${game.name}" (${game.id})...`);
      const result = await regenerateGalaxyData(game.id);

      if (result.success) {
        console.log(`  SUCCESS: ${result.message}`);
        fixed++;
      } else {
        console.log(`  FAILED: ${result.message}`);
        failed++;
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Total games: ${allGames.length}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Skipped (already had data): ${skipped}`);
    console.log(`Failed: ${failed}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
