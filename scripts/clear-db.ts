import { config } from "dotenv";
import { deleteAllGamesAction } from "../src/app/actions/admin-actions";

// Load .env.local
config({ path: ".env.local" });

async function main() {
  console.log("Clearing database...");
  const result = await deleteAllGamesAction();

  if (result.success) {
    console.log(`✅ Successfully deleted ${result.deletedCount} games and all related data`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
    process.exit(1);
  }
}

main();
