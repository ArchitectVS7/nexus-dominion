#!/bin/bash

# Cleanup script for removing old 4-tier crafting system

echo "Removing old crafting system files..."

# Files already deleted:
# - src/lib/game/services/crafting/crafting-service.ts
# - src/app/actions/crafting-actions.ts
# - src/lib/bots/archetypes/crafting-profiles.ts
# - src/lib/bots/__tests__/crafting-profiles.test.ts
# - src/lib/game/services/__tests__/crafting-service.test.ts
# - src/lib/game/constants/crafting.ts
# - src/lib/db/schema/crafting.ts
# - src/lib/game/services/crafting/ (directory)

# Files that need imports/code removed:
# - src/lib/bots/types.ts (DONE - removed CraftedResource import and decision types)
# - src/lib/bots/bot-actions.ts (DONE - removed crafting executors)
# - src/lib/bots/decision-engine.ts
# - src/lib/bots/archetypes/index.ts
# - src/lib/game/services/core/turn-processor.ts
# - src/lib/game/services/economy/resource-tier-service.ts
# - src/app/actions/syndicate-actions.ts
# - src/lib/security/validation.ts

echo "Remaining files to clean up:"
grep -l "constants/crafting\|schema/crafting\|crafting-service\|CraftedResource\|craftingQueue\|resourceInventory" src/**/*.ts src/**/*.tsx 2>/dev/null | sort -u

echo ""
echo "NOTE: Some files may reference syndicate contracts which are separate from crafting."
echo "Those should be preserved for future expansion."
