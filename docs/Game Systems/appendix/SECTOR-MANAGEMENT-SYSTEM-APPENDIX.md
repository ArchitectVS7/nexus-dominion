# Sector Management System - Appendix

**Parent Document:** [SECTOR-MANAGEMENT-SYSTEM.md](../SECTOR-MANAGEMENT-SYSTEM.md)
**Purpose:** Code examples, detailed implementation, and extensive data tables

---

## Table of Contents

1. [Code Examples](#code-examples)
   - [Database Schema](#database-schema)
   - [Service Architecture](#service-architecture)
   - [Server Actions](#server-actions)
   - [UI Components](#ui-components)
2. [Formula Derivations](#formula-derivations)
3. [Data Tables](#data-tables)

---

## Code Examples

### Database Schema

Complete database schema for sectors table and related views:

```sql
-- Table: sectors
-- Purpose: Stores all sectors owned by empires

CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  sector_type TEXT NOT NULL CHECK (sector_type IN (
    'commerce', 'food', 'ore', 'petroleum',
    'urban', 'education', 'government', 'research'
  )),
  acquired_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sectors_empire_id ON sectors(empire_id);
CREATE INDEX idx_sectors_type ON sectors(sector_type);
CREATE INDEX idx_sectors_empire_type ON sectors(empire_id, sector_type);

-- View: sector_production_summary
-- Purpose: Pre-calculate production per empire for performance
CREATE MATERIALIZED VIEW sector_production_summary AS
SELECT
  empire_id,
  sector_type,
  COUNT(*) as sector_count,
  CASE sector_type
    WHEN 'commerce' THEN COUNT(*) * 8000
    WHEN 'food' THEN COUNT(*) * 160
    WHEN 'ore' THEN COUNT(*) * 112
    WHEN 'petroleum' THEN COUNT(*) * 92
    WHEN 'urban' THEN COUNT(*) * 1000  -- Credits only, pop cap handled separately
    WHEN 'education' THEN COUNT(*) * 5
    WHEN 'government' THEN COUNT(*) * 300
    WHEN 'research' THEN COUNT(*) * 10
    ELSE 0
  END as total_production
FROM sectors
GROUP BY empire_id, sector_type;

CREATE UNIQUE INDEX idx_sector_prod_empire_type ON sector_production_summary(empire_id, sector_type);

-- Refresh materialized view on turn boundary
-- Call: REFRESH MATERIALIZED VIEW CONCURRENTLY sector_production_summary;
```

**Migration for starting sectors:**

```sql
-- Migration: Initialize starting sectors for all empires
-- Safe to run: Yes (idempotent with empire_id check)

INSERT INTO sectors (empire_id, sector_type, acquired_turn)
SELECT
  e.id as empire_id,
  sector_type,
  0 as acquired_turn
FROM empires e
CROSS JOIN (
  VALUES
    ('food'),
    ('ore'),
    ('petroleum'),
    ('commerce'),
    ('urban')
) AS starting_sectors(sector_type)
WHERE NOT EXISTS (
  SELECT 1 FROM sectors s WHERE s.empire_id = e.id
);

-- Verify: Each empire should have exactly 5 sectors
SELECT empire_id, COUNT(*) as sector_count
FROM sectors
GROUP BY empire_id
HAVING COUNT(*) != 5;
-- Should return 0 rows
```

### Service Architecture

Complete `SectorService` implementation:

```typescript
// src/lib/sectors/sector-service.ts

import { db } from "@/lib/db";
import { sectors, empires } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface SectorConfig {
  baseProductionRates: Record<SectorType, number>;
  baseCosts: Record<SectorType, number>;
  resourceCaps: {
    food: number;
    ore: number;
    petroleum: number;
  };
}

export type SectorType =
  | "commerce"
  | "food"
  | "ore"
  | "petroleum"
  | "urban"
  | "education"
  | "government"
  | "research";

export interface ResourceProduction {
  credits: number;
  food: number;
  ore: number;
  petroleum: number;
  civilStatus: number;
  agents: number;
  researchPoints: number;
  populationCapacity: number;
}

export interface Sector {
  id: string;
  empireId: string;
  sectorType: SectorType;
  acquiredTurn: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SectorService {
  constructor(private config: SectorConfig) {}

  /**
   * Calculate the cost to acquire a new sector based on current sector count
   * @spec REQ-SEC-002
   */
  calculateSectorCost(currentSectorCount: number): number {
    const baseCost = 8000;
    const scalingFactor = 1 + (currentSectorCount * 0.1);
    return Math.floor(baseCost * Math.pow(scalingFactor, 1.5));
  }

  /**
   * Calculate total production for an empire based on their sectors
   * @spec REQ-SEC-004, REQ-SEC-008
   */
  async calculateProduction(empireId: string): Promise<ResourceProduction> {
    const empireSectors = await db.query.sectors.findMany({
      where: eq(sectors.empireId, empireId)
    });

    const production: ResourceProduction = {
      credits: 0,
      food: 0,
      ore: 0,
      petroleum: 0,
      civilStatus: 0,
      agents: 0,
      researchPoints: 0,
      populationCapacity: 0
    };

    for (const sector of empireSectors) {
      switch (sector.sectorType) {
        case "commerce":
          production.credits += 8000;
          break;
        case "food":
          production.food += 160;
          break;
        case "ore":
          production.ore += 112;
          break;
        case "petroleum":
          production.petroleum += 92;
          break;
        case "urban":
          production.credits += 1000;
          production.populationCapacity += 1000;
          break;
        case "education":
          production.civilStatus += 5;
          break;
        case "government":
          production.agents += 300;
          break;
        case "research":
          production.researchPoints += 10;
          break;
      }
    }

    return production;
  }

  /**
   * Get all sectors for an empire
   */
  async getSectors(empireId: string): Promise<Sector[]> {
    return await db.query.sectors.findMany({
      where: eq(sectors.empireId, empireId)
    });
  }

  /**
   * Get sector count for an empire
   */
  async getSectorCount(empireId: string): Promise<number> {
    const empireSectors = await this.getSectors(empireId);
    return empireSectors.length;
  }

  /**
   * Create a new sector for an empire
   * @spec REQ-SEC-005
   */
  async acquireSector(
    empireId: string,
    sectorType: SectorType,
    currentTurn: number
  ): Promise<Sector> {
    const [sector] = await db.insert(sectors).values({
      empireId,
      sectorType,
      acquiredTurn: currentTurn
    }).returning();

    return sector;
  }

  /**
   * Destroy random sectors from an empire (combat loss)
   * @spec REQ-SEC-009
   */
  async destroySectors(
    empireId: string,
    count: number,
    overkillBonus: number = 0
  ): Promise<Sector[]> {
    const empireSectors = await this.getSectors(empireId);

    // Calculate total sectors to destroy
    const baseDestruction = 1;
    const randomDestruction = Math.floor(Math.random() * 3); // 0-2
    const totalDestruction = Math.min(
      baseDestruction + randomDestruction + overkillBonus,
      empireSectors.length - 1 // Always leave at least 1 sector
    );

    // Randomly select sectors to destroy
    const toDestroy = empireSectors
      .sort(() => Math.random() - 0.5)
      .slice(0, totalDestruction);

    if (toDestroy.length > 0) {
      await db.delete(sectors).where(
        inArray(sectors.id, toDestroy.map(s => s.id))
      );
    }

    return toDestroy;
  }

  /**
   * Transfer sectors from conquered empire to victor
   * @spec REQ-SEC-010
   */
  async transferSectors(
    victorId: string,
    conqueredId: string
  ): Promise<number> {
    const conqueredSectors = await this.getSectors(conqueredId);

    // Transfer 50% of conquered sectors (rounded down)
    const transferCount = Math.floor(conqueredSectors.length * 0.5);

    if (transferCount === 0) {
      return 0;
    }

    // Randomly select sectors to transfer
    const toTransfer = conqueredSectors
      .sort(() => Math.random() - 0.5)
      .slice(0, transferCount);

    await db.update(sectors)
      .set({ empireId: victorId })
      .where(inArray(sectors.id, toTransfer.map(s => s.id)));

    return transferCount;
  }

  /**
   * Apply resource caps after production
   * @spec REQ-SEC-006
   */
  applyResourceCaps(resources: ResourceProduction): ResourceProduction {
    return {
      ...resources,
      food: Math.min(resources.food, this.config.resourceCaps.food),
      ore: Math.min(resources.ore, this.config.resourceCaps.ore),
      petroleum: Math.min(resources.petroleum, this.config.resourceCaps.petroleum)
      // Credits, civilStatus, agents, researchPoints, populationCapacity have no caps
    };
  }
}

// Configuration instance
export const SECTOR_CONFIG: SectorConfig = {
  baseProductionRates: {
    commerce: 8000,
    food: 160,
    ore: 112,
    petroleum: 92,
    urban: 1000, // Credits component only
    education: 5,
    government: 300,
    research: 10
  },
  baseCosts: {
    commerce: 8000,
    food: 8000,
    ore: 6000,
    petroleum: 11500,
    urban: 8000,
    education: 8000,
    government: 7500,
    research: 23000
  },
  resourceCaps: {
    food: 10000,
    ore: 5000,
    petroleum: 3000
  }
};
```

### Server Actions

Complete server action implementation:

```typescript
// src/app/actions/sector-actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { empires, sectors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SectorService, SECTOR_CONFIG, SectorType } from "@/lib/sectors/sector-service";

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Acquire a new sector for the player's empire
 * @spec REQ-SEC-005
 */
export async function acquireSector(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const sectorType = formData.get("sectorType") as SectorType;
  if (!sectorType) {
    return { success: false, error: "Sector type required" };
  }

  // Validate sector type
  const validTypes: SectorType[] = [
    "commerce", "food", "ore", "petroleum",
    "urban", "education", "government", "research"
  ];
  if (!validTypes.includes(sectorType)) {
    return { success: false, error: "Invalid sector type" };
  }

  try {
    // Get player's empire
    const empire = await db.query.empires.findFirst({
      where: eq(empires.playerId, session.userId)
    });

    if (!empire) {
      return { success: false, error: "Empire not found" };
    }

    // Check research unlock for Research sectors
    // @spec REQ-SEC-011
    if (sectorType === "research" && (empire.researchTier ?? 0) < 2) {
      return {
        success: false,
        error: "Research sectors require Research Tier 2"
      };
    }

    // Calculate cost
    const sectorService = new SectorService(SECTOR_CONFIG);
    const currentSectorCount = await sectorService.getSectorCount(empire.id);
    const cost = sectorService.calculateSectorCost(currentSectorCount);

    // Validate funds
    if (empire.credits < cost) {
      const deficit = cost - empire.credits;
      return {
        success: false,
        error: `Insufficient credits. Need ${deficit.toLocaleString()} more.`
      };
    }

    // Atomic transaction: deduct credits + create sector
    await db.transaction(async (tx) => {
      // Deduct credits
      await tx.update(empires)
        .set({
          credits: empire.credits - cost,
          updatedAt: new Date()
        })
        .where(eq(empires.id, empire.id));

      // Create sector
      await sectorService.acquireSector(
        empire.id,
        sectorType,
        empire.currentTurn ?? 0
      );
    });

    revalidatePath("/command-center");
    revalidatePath("/sectors");

    return {
      success: true,
      message: `Acquired ${sectorType} sector for ${cost.toLocaleString()} credits`
    };
  } catch (error) {
    console.error("Failed to acquire sector:", error);
    return {
      success: false,
      error: "Failed to acquire sector. Please try again."
    };
  }
}

/**
 * Get sector information for an empire
 */
export async function getEmpireSectors(empireId: string): Promise<ActionResult> {
  try {
    const sectorService = new SectorService(SECTOR_CONFIG);
    const empireSectors = await sectorService.getSectors(empireId);
    const production = await sectorService.calculateProduction(empireId);

    return {
      success: true,
      data: {
        sectors: empireSectors,
        production,
        count: empireSectors.length
      }
    };
  } catch (error) {
    console.error("Failed to get empire sectors:", error);
    return {
      success: false,
      error: "Failed to load sector information"
    };
  }
}
```

### UI Components

Complete UI component implementations:

```typescript
// src/components/sectors/SectorManagementPanel.tsx

"use client";

import { useState, useMemo } from "react";
import { Empire, Sector } from "@/lib/types";
import { SectorService, SECTOR_CONFIG } from "@/lib/sectors/sector-service";
import { SectorAcquisitionModal } from "./SectorAcquisitionModal";
import { SectorList } from "./SectorList";
import { ProductionSummary } from "./ProductionSummary";

interface SectorManagementPanelProps {
  empire: Empire;
  sectors: Sector[];
}

export function SectorManagementPanel({
  empire,
  sectors
}: SectorManagementPanelProps) {
  const [showAcquisitionModal, setShowAcquisitionModal] = useState(false);
  const sectorService = new SectorService(SECTOR_CONFIG);
  const nextCost = sectorService.calculateSectorCost(sectors.length);

  // Calculate production summary
  const productionSummary = useMemo(() => {
    const summary = {
      credits: 0,
      food: 0,
      ore: 0,
      petroleum: 0,
      civilStatus: 0,
      agents: 0,
      researchPoints: 0
    };

    sectors.forEach(sector => {
      switch (sector.sectorType) {
        case "commerce":
          summary.credits += 8000;
          break;
        case "food":
          summary.food += 160;
          break;
        case "ore":
          summary.ore += 112;
          break;
        case "petroleum":
          summary.petroleum += 92;
          break;
        case "urban":
          summary.credits += 1000;
          break;
        case "education":
          summary.civilStatus += 5;
          break;
        case "government":
          summary.agents += 300;
          break;
        case "research":
          summary.researchPoints += 10;
          break;
      }
    });

    return summary;
  }, [sectors]);

  const canAfford = empire.credits >= nextCost;

  return (
    <div className="sector-management-panel bg-gray-900 rounded-lg p-6">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Sector Management</h2>
        <button
          onClick={() => setShowAcquisitionModal(true)}
          disabled={!canAfford}
          className={`px-4 py-2 rounded font-semibold ${
            canAfford
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          + ACQUIRE
        </button>
      </header>

      <div className="sector-summary mb-6 p-4 bg-gray-800 rounded">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Total Sectors</p>
            <p className="text-2xl font-bold text-white">{sectors.length}/∞</p>
          </div>
          <div>
            <p className="text-gray-400">Next Sector Cost</p>
            <p className="text-2xl font-bold text-white">
              {nextCost.toLocaleString()} cr
            </p>
          </div>
        </div>
      </div>

      <ProductionSummary summary={productionSummary} />

      <SectorList sectors={sectors} />

      {showAcquisitionModal && (
        <SectorAcquisitionModal
          empire={empire}
          cost={nextCost}
          onClose={() => setShowAcquisitionModal(false)}
        />
      )}
    </div>
  );
}
```

```typescript
// src/components/sectors/SectorAcquisitionModal.tsx

"use client";

import { useState, useTransition } from "react";
import { Empire } from "@/lib/types";
import { SectorType } from "@/lib/sectors/sector-service";
import { acquireSector } from "@/app/actions/sector-actions";
import { toast } from "sonner";

interface SectorAcquisitionModalProps {
  empire: Empire;
  cost: number;
  onClose: () => void;
}

const SECTOR_INFO = {
  commerce: {
    label: "Commerce",
    production: "8,000 cr/turn",
    cost: 8000,
    description: "Primary income source"
  },
  food: {
    label: "Food",
    production: "160 food/turn",
    cost: 8000,
    description: "Feed population"
  },
  ore: {
    label: "Ore",
    production: "112 ore/turn",
    cost: 6000,
    description: "Build military units"
  },
  petroleum: {
    label: "Petroleum",
    production: "92 petro/turn",
    cost: 11500,
    description: "Fuel operations"
  },
  urban: {
    label: "Urban",
    production: "+1k pop cap, +1k cr/turn",
    cost: 8000,
    description: "House citizens"
  },
  education: {
    label: "Education",
    production: "+5 civil status/turn",
    cost: 8000,
    description: "Increase happiness"
  },
  government: {
    label: "Government",
    production: "+300 agents/turn",
    cost: 7500,
    description: "Enable covert ops"
  },
  research: {
    label: "Research",
    production: "+10 research pts/turn",
    cost: 23000,
    description: "Accelerate tech tree"
  }
};

export function SectorAcquisitionModal({
  empire,
  cost,
  onClose
}: SectorAcquisitionModalProps) {
  const [selectedType, setSelectedType] = useState<SectorType | null>(null);
  const [isPending, startTransition] = useTransition();

  const canAffordSelected = selectedType
    ? empire.credits >= cost
    : false;

  const researchLocked = (empire.researchTier ?? 0) < 2;

  const handleAcquire = () => {
    if (!selectedType || !canAffordSelected) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("sectorType", selectedType);

      const result = await acquireSector(formData);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Acquire New Sector</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white">
            Cost: <span className="font-bold">{cost.toLocaleString()} credits</span>
          </p>
          <p className="text-gray-400">
            Your Treasury: {empire.credits.toLocaleString()} credits
            <span className={empire.credits >= cost ? "text-green-500" : "text-red-500"}>
              {" "}({(empire.credits - cost).toLocaleString()} remaining)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(SECTOR_INFO).map(([type, info]) => {
            const isLocked = type === "research" && researchLocked;
            const isSelected = selectedType === type;

            return (
              <button
                key={type}
                onClick={() => !isLocked && setSelectedType(type as SectorType)}
                disabled={isLocked}
                className={`p-4 rounded border-2 transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-900 bg-opacity-30"
                    : "border-gray-700 hover:border-gray-500"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <h3 className="text-white font-bold mb-2">{info.label}</h3>
                <p className="text-sm text-gray-300 mb-1">{info.production}</p>
                <p className="text-xs text-gray-400">{info.description}</p>
                {isLocked && (
                  <p className="text-xs text-red-400 mt-2">
                    LOCKED: Need Research Tier 2
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleAcquire}
            disabled={!selectedType || !canAffordSelected || isPending}
            className={`px-6 py-2 rounded font-semibold ${
              selectedType && canAffordSelected && !isPending
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPending ? "Acquiring..." : "Acquire Selected"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Formula Derivations

### Sector Cost Scaling Formula

**Goal:** Create exponential cost growth that:
1. Allows first expansion by turn 10-12 (starting income: 9,000 cr/turn)
2. Creates saturation point around 25-30 sectors
3. Doesn't completely prevent late-game expansion

**Formula Components:**

```
Base Cost (B) = 8,000 credits
Current Sector Count (N) = Total sectors owned
Scaling Factor (S) = 1 + (N × 0.1)
Exponent (E) = 1.5

Cost = B × S^E
Cost = 8,000 × (1 + N × 0.1)^1.5
```

**Why Exponent 1.5?**

Testing different exponents:

| Exponent | 5 Sectors | 15 Sectors | 25 Sectors | 35 Sectors |
|----------|-----------|------------|------------|------------|
| **1.0** (linear) | 12,000 | 20,000 | 28,000 | 36,000 |
| **1.3** | 13,416 | 25,065 | 38,155 | 52,409 |
| **1.5** (chosen) | 14,696 | 31,623 | 55,902 | 87,178 |
| **2.0** (quadratic) | 18,000 | 50,000 | 98,000 | 162,000 |

**Rationale:**
- Exponent 1.0: Too linear, no saturation point
- Exponent 1.3: Good early-game, but late-game still too affordable
- **Exponent 1.5:** Balanced - first expansion ~1.6 turns income, late-game meaningful but not prohibitive
- Exponent 2.0: Too aggressive, creates hard cap around 20 sectors

**Income vs Cost Analysis:**

| Turn | Avg Income | Sectors | Next Cost | Turns to Afford |
|------|------------|---------|-----------|-----------------|
| 10 | 9,000 | 5 | 14,696 | 1.6 |
| 30 | 24,000 | 10 | 22,627 | 0.9 |
| 50 | 40,000 | 15 | 31,623 | 0.8 |
| 70 | 80,000 | 20 | 41,569 | 0.5 |
| 90 | 120,000 | 25 | 55,902 | 0.5 |

Target achieved: Expansion always requires 0.5-2 turns of income.

---

## Data Tables

### Complete Sector Cost Table

| Current Sectors | Next Cost (cr) | Cumulative Cost (cr) |
|-----------------|----------------|----------------------|
| 5 (starting) | 14,696 | 0 |
| 6 | 16,396 | 14,696 |
| 7 | 18,186 | 31,092 |
| 8 | 20,063 | 49,278 |
| 9 | 22,023 | 69,341 |
| 10 | 24,061 | 91,364 |
| 11 | 26,173 | 115,425 |
| 12 | 28,357 | 141,598 |
| 13 | 30,609 | 169,955 |
| 14 | 32,926 | 200,564 |
| 15 | 35,305 | 233,490 |
| 16 | 37,744 | 268,795 |
| 17 | 40,241 | 306,539 |
| 18 | 42,794 | 346,780 |
| 19 | 45,400 | 389,574 |
| 20 | 48,059 | 434,974 |
| 21 | 50,768 | 483,033 |
| 22 | 53,526 | 533,801 |
| 23 | 56,331 | 587,327 |
| 24 | 59,182 | 643,658 |
| 25 | 62,078 | 702,840 |
| 26 | 65,017 | 764,918 |
| 27 | 67,999 | 829,935 |
| 28 | 71,023 | 897,934 |
| 29 | 74,087 | 968,957 |
| 30 | 77,190 | 1,043,044 |

**Note:** Cumulative cost assumes back-to-back acquisitions. Most players will space out acquisitions over many turns.

### Sector Production by Type

| Sector Type | Per-Turn Production | Annual Production (100 turns) | Value vs Cost Ratio |
|-------------|---------------------|-------------------------------|---------------------|
| Commerce | 8,000 cr | 800,000 cr | 100:1 |
| Food | 160 food | 16,000 food | ~80:1 (at 100 cr/food) |
| Ore | 112 ore | 11,200 ore | ~90:1 (at 50 cr/ore) |
| Petroleum | 92 petro | 9,200 petro | ~75:1 (at 125 cr/petro) |
| Urban | 1,000 cr + pop cap | 100,000 cr | 12.5:1 (credits only) |
| Education | +5 civil status | +500 civil status | Intangible |
| Government | 300 agents | 30,000 agents | Intangible (enables covert ops) |
| Research | 10 research pts | 1,000 research pts | Intangible (tech acceleration) |

**Value Calculation Notes:**
- Assumes market prices: Food 100 cr, Ore 50 cr, Petroleum 125 cr
- 100-turn game length (typical)
- Does not account for resource caps (Food/Ore/Petro capped)
- Intangible benefits (Education, Research, Government) have strategic value not captured in credits

---

**Appendix Version:** 1.0
**Last Updated:** 2026-01-12
