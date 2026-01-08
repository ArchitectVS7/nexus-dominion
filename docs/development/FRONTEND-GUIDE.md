# Frontend Guide

> This document covers React and Next.js patterns used in Nexus Dominion.

---

## Framework

- **Next.js 14** with App Router
- **React 18** with Server Components
- **Tailwind CSS** for styling
- **TypeScript** (strict mode)

---

## App Router Structure

```
src/app/
├── page.tsx              # Home page
├── layout.tsx            # Root layout
├── game/
│   ├── page.tsx          # Game dashboard
│   ├── combat/
│   │   └── page.tsx      # Combat interface
│   ├── research/
│   │   └── page.tsx      # Research tree
│   └── diplomacy/
│       └── page.tsx      # Diplomacy screen
├── actions/              # Server Actions
│   ├── turn-actions.ts
│   ├── combat-actions.ts
│   └── sector-actions.ts
└── api/                  # API routes (minimal use)
```

---

## Server Actions

All mutations go through Server Actions in `src/app/actions/`:

```typescript
// src/app/actions/sector-actions.ts
"use server";

import { z } from "zod";
import { acquireSector } from "@/lib/game/services/sector-service";

const BuySectorSchema = z.object({
  empireId: z.string().uuid(),
  sectorType: z.enum(["food", "energy", "technology", "military"]),
});

export async function buySectorAction(formData: FormData) {
  const parsed = BuySectorSchema.safeParse({
    empireId: formData.get("empireId"),
    sectorType: formData.get("sectorType"),
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  return await acquireSector(parsed.data.empireId, parsed.data.sectorType);
}
```

---

## Component Organization

```
src/components/
└── game/
    ├── combat/           # Combat-related components
    │   ├── AttackInterface.tsx
    │   ├── BattleReport.tsx
    │   └── CombatPreview.tsx
    ├── military/         # Military/unit components
    │   ├── BuildQueuePanel.tsx
    │   └── UnitCard.tsx
    ├── sectors/          # Sector management
    │   ├── SectorsList.tsx
    │   └── BuySectorPanel.tsx
    ├── research/         # Research tree
    │   └── FundamentalResearchProgress.tsx
    ├── messages/         # Communication
    │   ├── MessageInbox.tsx
    │   └── GalacticNewsFeed.tsx
    └── starmap/          # Visualization
        └── StarmapCanvas.tsx
```

---

## Styling with Tailwind

Use Tailwind utility classes. Avoid custom CSS unless necessary:

```tsx
// Good - Tailwind utilities
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
  Buy Sector
</button>

// Avoid - Custom CSS for simple styles
<button className={styles.buyButton}>Buy Sector</button>
```

---

## Data-TestId Convention

Add `data-testid` to all interactive elements for E2E testing:

```tsx
<button
  data-testid="buy-sector-button"
  onClick={handleBuySector}
>
  Buy Sector
</button>

<span data-testid="empire-credits">{credits.toLocaleString()}</span>
```

---

## Path Alias

Always use `@/` for imports:

```typescript
// Good
import { Empire } from "@/lib/db/schema";
import { SectorCard } from "@/components/game/sectors/SectorCard";

// Avoid
import { Empire } from "../../../lib/db/schema";
```

---

## Related Documents

- [UI Design Guide](UI-DESIGN.md) - Visual design system
- [Architecture Guide](ARCHITECTURE.md) - Overall structure
- [Testing Guide](TESTING-GUIDE.md) - Testing patterns
