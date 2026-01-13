# Military System - Appendix

**Parent Document:** [MILITARY-SYSTEM.md](../MILITARY-SYSTEM.md)
**Purpose:** Implementation code examples, database schemas, unit configurations, and service architecture for the military system.

---

## Table of Contents

- [A. Database Schema](#a-database-schema)
- [B. Unit Configuration](#b-unit-configuration)
- [C. Service Architecture](#c-service-architecture)
- [D. Server Actions](#d-server-actions)
- [E. UI Components](#e-ui-components)
- [F. Bot Build Logic](#f-bot-build-logic)

---

## A. Database Schema

### A.1 Unit Templates Table

```sql
-- Unit template definitions (Tier I standard units)
CREATE TABLE unit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  unit_type TEXT NOT NULL CHECK (unit_type IN (
    'SOLDIER', 'FIGHTER', 'BOMBER', 'STATION',
    'LIGHT_CRUISER', 'HEAVY_CRUISER', 'CARRIER'
  )),
  tier INTEGER DEFAULT 1 CHECK (tier IN (1, 2, 3)),

  -- Power and domain
  power_multiplier DECIMAL NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('GROUND', 'SPACE', 'ORBITAL')),
  can_assign_space BOOLEAN DEFAULT false,
  can_assign_orbital BOOLEAN DEFAULT false,
  can_assign_ground BOOLEAN DEFAULT false,

  -- Production
  production_time INTEGER NOT NULL CHECK (production_time BETWEEN 1 AND 10),
  cost_credits INTEGER NOT NULL CHECK (cost_credits >= 0),
  cost_ore INTEGER DEFAULT 0 CHECK (cost_ore >= 0),
  cost_petroleum INTEGER DEFAULT 0 CHECK (cost_petroleum >= 0),
  cost_food INTEGER DEFAULT 0 CHECK (cost_food >= 0),

  -- Maintenance
  maint_credits INTEGER NOT NULL CHECK (maint_credits >= 0),
  maint_ore INTEGER DEFAULT 0 CHECK (maint_ore >= 0),
  maint_petroleum INTEGER DEFAULT 0 CHECK (maint_petroleum >= 0),

  -- D20 Stats (for combat integration)
  strength INTEGER CHECK (strength BETWEEN 8 AND 20),
  dexterity INTEGER CHECK (dexterity BETWEEN 8 AND 20),
  constitution INTEGER CHECK (constitution BETWEEN 8 AND 20),
  base_hp INTEGER,
  armor_bonus INTEGER,
  base_attack_bonus INTEGER,
  weapon_name TEXT,
  weapon_damage_dice TEXT,
  special_ability TEXT,

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_unit_templates_type ON unit_templates(unit_type);
CREATE INDEX idx_unit_templates_tier ON unit_templates(tier);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_unit_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unit_templates_updated_at
  BEFORE UPDATE ON unit_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_unit_templates_updated_at();
```

### A.2 Empire Units Table

```sql
-- Units owned by empires
CREATE TABLE empire_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  unit_template_id UUID NOT NULL REFERENCES unit_templates(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  current_hp INTEGER, -- NULL = full HP, otherwise damaged
  assigned_domain TEXT CHECK (assigned_domain IN ('GROUND', 'SPACE', 'ORBITAL', NULL)),
  created_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_empire_units_empire ON empire_units(empire_id);
CREATE INDEX idx_empire_units_template ON empire_units(unit_template_id);
CREATE INDEX idx_empire_units_domain ON empire_units(assigned_domain) WHERE assigned_domain IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER empire_units_updated_at
  BEFORE UPDATE ON empire_units
  FOR EACH ROW
  EXECUTE FUNCTION update_unit_templates_updated_at();
```

### A.3 Build Queue Table

```sql
-- Active production queue
CREATE TABLE build_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  unit_template_id UUID NOT NULL REFERENCES unit_templates(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  start_turn INTEGER NOT NULL,
  completion_turn INTEGER NOT NULL,

  -- Resources paid upfront
  resources_paid JSONB NOT NULL,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  cancelled_turn INTEGER,
  refund_issued BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Completion turn must be after start turn
  CONSTRAINT valid_completion CHECK (completion_turn > start_turn)
);

-- Indexes
CREATE INDEX idx_build_queue_empire ON build_queue(empire_id);
CREATE INDEX idx_build_queue_completion ON build_queue(completion_turn) WHERE status = 'active';
CREATE INDEX idx_build_queue_status ON build_queue(status);

-- Trigger for updated_at
CREATE TRIGGER build_queue_updated_at
  BEFORE UPDATE ON build_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_unit_templates_updated_at();
```

### A.4 Maintenance Log Table

```sql
-- Historical maintenance costs per turn
CREATE TABLE maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,

  total_units INTEGER NOT NULL,
  total_credits INTEGER NOT NULL,
  total_ore INTEGER NOT NULL,
  total_petroleum INTEGER NOT NULL,

  paid_successfully BOOLEAN NOT NULL,
  units_lost INTEGER DEFAULT 0, -- If bankrupt

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(empire_id, turn_number)
);

-- Indexes
CREATE INDEX idx_maintenance_log_empire_turn ON maintenance_log(empire_id, turn_number);
CREATE INDEX idx_maintenance_log_failed ON maintenance_log(empire_id) WHERE paid_successfully = false;
```

### A.5 Seed Data: Tier I Units

```sql
-- Insert Tier I standard units
INSERT INTO unit_templates (
  name, unit_type, tier, power_multiplier, domain,
  can_assign_ground, can_assign_space, can_assign_orbital,
  production_time,
  cost_credits, cost_ore, cost_petroleum, cost_food,
  maint_credits, maint_ore, maint_petroleum,
  strength, dexterity, constitution, base_hp, armor_bonus, base_attack_bonus,
  weapon_name, weapon_damage_dice, special_ability, description
) VALUES
  -- Soldiers
  ('Soldiers', 'SOLDIER', 1, 0.1, 'GROUND', true, false, false,
   1, 100, 0, 0, 50, 2, 0, 0,
   10, 12, 10, 10, 0, 2,
   'Assault Rifle', '1d6', 'Rapid Deployment: Can be built in 1 turn',
   'Basic ground infantry. Essential for sector occupation.'),

  -- Fighters
  ('Fighters', 'FIGHTER', 1, 1.0, 'SPACE', false, true, true,
   2, 500, 100, 0, 0, 5, 2, 0,
   12, 14, 10, 15, 2, 2,
   'Laser Cannons', '1d8', 'Intercept: +2 attack vs Bombers',
   'Agile space fighters. Flexible domain assignment.'),

  -- Bombers
  ('Bombers', 'BOMBER', 1, 2.0, 'ORBITAL', false, false, true,
   2, 800, 150, 0, 0, 8, 3, 0,
   14, 10, 12, 20, 1, 2,
   'Heavy Missiles', '2d6', 'Armor Piercing: Ignore 25% of target AC',
   'Strike craft targeting capital ships and installations.'),

  -- Stations
  ('Stations', 'STATION', 1, 3.0, 'ORBITAL', false, false, true,
   3, 3000, 500, 200, 0, 15, 10, 0,
   14, 8, 16, 50, 5, 2,
   'Point Defense Grid', '2d8', 'Defender Bonus: 2× power when defending',
   'Defensive orbital platforms. Doubled effectiveness on defense.'),

  -- Light Cruisers
  ('Light Cruisers', 'LIGHT_CRUISER', 1, 4.0, 'SPACE', false, true, false,
   4, 5000, 800, 300, 0, 25, 15, 5,
   14, 12, 14, 35, 3, 4,
   'Medium Cannons', '1d10+2', 'Versatile: No combat weaknesses',
   'Balanced warships. Fleet backbone.'),

  -- Heavy Cruisers
  ('Heavy Cruisers', 'HEAVY_CRUISER', 1, 8.0, 'SPACE', false, true, false,
   5, 15000, 2000, 800, 0, 50, 30, 15,
   16, 12, 14, 40, 4, 4,
   'Heavy Cannons', '2d8+3', 'Broadside: Attack 2 targets per round',
   'Capital ships with devastating firepower.'),

  -- Carriers
  ('Carriers', 'CARRIER', 1, 12.0, 'SPACE', false, true, false,
   5, 30000, 4000, 1500, 0, 100, 50, 30,
   14, 10, 16, 60, 5, 4,
   'Point Defense', '1d10', 'Fleet Support: +10% power to all allied units within same domain',
   'Massive logistics hubs. Provide fleet-wide bonuses.');
```

---

## B. Unit Configuration

### B.1 Unit Config TypeScript

```typescript
// src/lib/units/unit-config.ts

export enum UnitType {
  SOLDIER = 'SOLDIER',
  FIGHTER = 'FIGHTER',
  BOMBER = 'BOMBER',
  STATION = 'STATION',
  LIGHT_CRUISER = 'LIGHT_CRUISER',
  HEAVY_CRUISER = 'HEAVY_CRUISER',
  CARRIER = 'CARRIER',
}

export enum Domain {
  GROUND = 'GROUND',
  SPACE = 'SPACE',
  ORBITAL = 'ORBITAL',
}

export interface UnitCost {
  credits: number;
  ore?: number;
  petroleum?: number;
  food?: number;
}

export interface UnitMainten ance {
  credits: number;
  ore?: number;
  petroleum?: number;
}

export interface UnitTemplate {
  id: string;
  name: string;
  unitType: UnitType;
  tier: 1 | 2 | 3;
  powerMultiplier: number;
  domain: Domain;
  canAssignSpace: boolean;
  canAssignOrbital: boolean;
  canAssignGround: boolean;
  productionTime: number;
  cost: UnitCost;
  maintenance: UnitMaintenance;
  // D20 Stats
  strength: number;
  dexterity: number;
  constitution: number;
  baseHp: number;
  armorBonus: number;
  baseAttackBonus: number;
  weaponName: string;
  weaponDamageDice: string;
  specialAbility?: string;
  description: string;
}

/**
 * Unit configuration constants
 * @spec REQ-MIL-001, REQ-MIL-003, REQ-MIL-005, REQ-MIL-006
 */
export const UNIT_CONFIG: Record<UnitType, Omit<UnitTemplate, 'id'>> = {
  [UnitType.SOLDIER]: {
    name: 'Soldiers',
    unitType: UnitType.SOLDIER,
    tier: 1,
    powerMultiplier: 0.1,
    domain: Domain.GROUND,
    canAssignGround: true,
    canAssignSpace: false,
    canAssignOrbital: false,
    productionTime: 1,
    cost: { credits: 100, food: 50 },
    maintenance: { credits: 2 },
    strength: 10,
    dexterity: 12,
    constitution: 10,
    baseHp: 10,
    armorBonus: 0,
    baseAttackBonus: 2,
    weaponName: 'Assault Rifle',
    weaponDamageDice: '1d6',
    specialAbility: 'Rapid Deployment: Can be built in 1 turn',
    description: 'Basic ground infantry. Essential for sector occupation.',
  },

  [UnitType.FIGHTER]: {
    name: 'Fighters',
    unitType: UnitType.FIGHTER,
    tier: 1,
    powerMultiplier: 1.0,
    domain: Domain.SPACE,
    canAssignGround: false,
    canAssignSpace: true,
    canAssignOrbital: true,
    productionTime: 2,
    cost: { credits: 500, ore: 100 },
    maintenance: { credits: 5, ore: 2 },
    strength: 12,
    dexterity: 14,
    constitution: 10,
    baseHp: 15,
    armorBonus: 2,
    baseAttackBonus: 2,
    weaponName: 'Laser Cannons',
    weaponDamageDice: '1d8',
    specialAbility: 'Intercept: +2 attack vs Bombers',
    description: 'Agile space fighters. Flexible domain assignment.',
  },

  [UnitType.BOMBER]: {
    name: 'Bombers',
    unitType: UnitType.BOMBER,
    tier: 1,
    powerMultiplier: 2.0,
    domain: Domain.ORBITAL,
    canAssignGround: false,
    canAssignSpace: false,
    canAssignOrbital: true,
    productionTime: 2,
    cost: { credits: 800, ore: 150 },
    maintenance: { credits: 8, ore: 3 },
    strength: 14,
    dexterity: 10,
    constitution: 12,
    baseHp: 20,
    armorBonus: 1,
    baseAttackBonus: 2,
    weaponName: 'Heavy Missiles',
    weaponDamageDice: '2d6',
    specialAbility: 'Armor Piercing: Ignore 25% of target AC',
    description: 'Strike craft targeting capital ships and installations.',
  },

  [UnitType.STATION]: {
    name: 'Stations',
    unitType: UnitType.STATION,
    tier: 1,
    powerMultiplier: 3.0, // 6.0 when defending
    domain: Domain.ORBITAL,
    canAssignGround: false,
    canAssignSpace: false,
    canAssignOrbital: true,
    productionTime: 3,
    cost: { credits: 3000, ore: 500, petroleum: 200 },
    maintenance: { credits: 15, ore: 10 },
    strength: 14,
    dexterity: 8,
    constitution: 16,
    baseHp: 50,
    armorBonus: 5,
    baseAttackBonus: 2,
    weaponName: 'Point Defense Grid',
    weaponDamageDice: '2d8',
    specialAbility: 'Defender Bonus: 2× power when defending',
    description: 'Defensive orbital platforms. Doubled effectiveness on defense.',
  },

  [UnitType.LIGHT_CRUISER]: {
    name: 'Light Cruisers',
    unitType: UnitType.LIGHT_CRUISER,
    tier: 1,
    powerMultiplier: 4.0,
    domain: Domain.SPACE,
    canAssignGround: false,
    canAssignSpace: true,
    canAssignOrbital: false,
    productionTime: 4,
    cost: { credits: 5000, ore: 800, petroleum: 300 },
    maintenance: { credits: 25, ore: 15, petroleum: 5 },
    strength: 14,
    dexterity: 12,
    constitution: 14,
    baseHp: 35,
    armorBonus: 3,
    baseAttackBonus: 4,
    weaponName: 'Medium Cannons',
    weaponDamageDice: '1d10+2',
    specialAbility: 'Versatile: No combat weaknesses',
    description: 'Balanced warships. Fleet backbone.',
  },

  [UnitType.HEAVY_CRUISER]: {
    name: 'Heavy Cruisers',
    unitType: UnitType.HEAVY_CRUISER,
    tier: 1,
    powerMultiplier: 8.0,
    domain: Domain.SPACE,
    canAssignGround: false,
    canAssignSpace: true,
    canAssignOrbital: false,
    productionTime: 5,
    cost: { credits: 15000, ore: 2000, petroleum: 800 },
    maintenance: { credits: 50, ore: 30, petroleum: 15 },
    strength: 16,
    dexterity: 12,
    constitution: 14,
    baseHp: 40,
    armorBonus: 4,
    baseAttackBonus: 4,
    weaponName: 'Heavy Cannons',
    weaponDamageDice: '2d8+3',
    specialAbility: 'Broadside: Attack 2 targets per round',
    description: 'Capital ships with devastating firepower.',
  },

  [UnitType.CARRIER]: {
    name: 'Carriers',
    unitType: UnitType.CARRIER,
    tier: 1,
    powerMultiplier: 12.0,
    domain: Domain.SPACE,
    canAssignGround: false,
    canAssignSpace: true,
    canAssignOrbital: false,
    productionTime: 5,
    cost: { credits: 30000, ore: 4000, petroleum: 1500 },
    maintenance: { credits: 100, ore: 50, petroleum: 30 },
    strength: 14,
    dexterity: 10,
    constitution: 16,
    baseHp: 60,
    armorBonus: 5,
    baseAttackBonus: 4,
    weaponName: 'Point Defense',
    weaponDamageDice: '1d10',
    specialAbility: 'Fleet Support: +10% power to all allied units within same domain',
    description: 'Massive logistics hubs. Provide fleet-wide bonuses.',
  },
};

/**
 * Get unit configuration by type
 */
export function getUnitConfig(unitType: UnitType): Omit<UnitTemplate, 'id'> {
  return UNIT_CONFIG[unitType];
}

/**
 * Calculate total cost of unit
 */
export function calculateTotalCost(unitType: UnitType, quantity: number = 1): UnitCost {
  const config = getUnitConfig(unitType);
  return {
    credits: config.cost.credits * quantity,
    ore: (config.cost.ore ?? 0) * quantity,
    petroleum: (config.cost.petroleum ?? 0) * quantity,
    food: (config.cost.food ?? 0) * quantity,
  };
}

/**
 * Calculate maintenance cost per turn
 */
export function calculateMaintenanceCost(
  unitType: UnitType,
  quantity: number = 1
): UnitMaintenance {
  const config = getUnitConfig(unitType);
  return {
    credits: config.maintenance.credits * quantity,
    ore: (config.maintenance.ore ?? 0) * quantity,
    petroleum: (config.maintenance.petroleum ?? 0) * quantity,
  };
}
```

---

## C. Service Architecture

### C.1 Build Queue Service

```typescript
// src/lib/game/services/build-queue-service.ts

import { db } from '@/lib/db';
import { buildQueue, empireUnits, empires } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUnitConfig, calculateTotalCost, UnitType } from '@/lib/units/unit-config';

/**
 * Build queue management service
 * @spec REQ-MIL-002
 */
export class BuildQueueService {
  /**
   * Queue a unit for production
   * @spec REQ-MIL-002, REQ-MIL-003
   */
  async queueUnit(
    empireId: string,
    unitType: UnitType,
    quantity: number,
    currentTurn: number
  ): Promise<{ success: boolean; error?: string; queueId?: string }> {
    const config = getUnitConfig(unitType);
    const totalCost = calculateTotalCost(unitType, quantity);

    // Get empire resources
    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, empireId),
    });

    if (!empire) {
      return { success: false, error: 'Empire not found' };
    }

    // Validate sufficient resources
    if (empire.credits < totalCost.credits) {
      return { success: false, error: 'Insufficient credits' };
    }
    if ((totalCost.ore ?? 0) > 0 && empire.ore < (totalCost.ore ?? 0)) {
      return { success: false, error: 'Insufficient ore' };
    }
    if ((totalCost.petroleum ?? 0) > 0 && empire.petroleum < (totalCost.petroleum ?? 0)) {
      return { success: false, error: 'Insufficient petroleum' };
    }
    if ((totalCost.food ?? 0) > 0 && empire.food < (totalCost.food ?? 0)) {
      return { success: false, error: 'Insufficient food' };
    }

    // Deduct resources immediately
    await db
      .update(empires)
      .set({
        credits: empire.credits - totalCost.credits,
        ore: empire.ore - (totalCost.ore ?? 0),
        petroleum: empire.petroleum - (totalCost.petroleum ?? 0),
        food: empire.food - (totalCost.food ?? 0),
      })
      .where(eq(empires.id, empireId));

    // Calculate completion turn
    const completionTurn = currentTurn + config.productionTime;

    // Create build queue entry
    const [queueEntry] = await db
      .insert(buildQueue)
      .values({
        empireId,
        unitTemplateId: config.unitType, // Would be actual UUID in practice
        quantity,
        startTurn: currentTurn,
        completionTurn,
        resourcesPaid: totalCost,
        status: 'active',
      })
      .returning();

    return { success: true, queueId: queueEntry.id };
  }

  /**
   * Cancel queued unit (before completion)
   * @spec REQ-MIL-002 (50% refund)
   */
  async cancelQueuedUnit(
    queueId: string,
    empireId: string,
    currentTurn: number
  ): Promise<{ success: boolean; error?: string }> {
    const entry = await db.query.buildQueue.findFirst({
      where: and(eq(buildQueue.id, queueId), eq(buildQueue.empireId, empireId)),
    });

    if (!entry || entry.status !== 'active') {
      return { success: false, error: 'Queue entry not found or already processed' };
    }

    // Check if < 1 turn remaining (no refund)
    if (entry.completionTurn - currentTurn < 1) {
      return { success: false, error: 'Cannot cancel: less than 1 turn remaining' };
    }

    // Calculate 50% refund
    const resourcesPaid = entry.resourcesPaid as any;
    const refund = {
      credits: Math.floor(resourcesPaid.credits * 0.5),
      ore: Math.floor((resourcesPaid.ore ?? 0) * 0.5),
      petroleum: Math.floor((resourcesPaid.petroleum ?? 0) * 0.5),
      food: Math.floor((resourcesPaid.food ?? 0) * 0.5),
    };

    // Update empire resources
    await db
      .update(empires)
      .set({
        credits: db.raw(`credits + ${refund.credits}`),
        ore: db.raw(`ore + ${refund.ore}`),
        petroleum: db.raw(`petroleum + ${refund.petroleum}`),
        food: db.raw(`food + ${refund.food}`),
      })
      .where(eq(empires.id, empireId));

    // Mark queue entry as cancelled
    await db
      .update(buildQueue)
      .set({
        status: 'cancelled',
        cancelledTurn: currentTurn,
        refundIssued: true,
      })
      .where(eq(buildQueue.id, queueId));

    return { success: true };
  }

  /**
   * Process build completions for current turn
   * @spec REQ-MIL-002, REQ-MIL-005
   */
  async processBuildCompletions(currentTurn: number) {
    // Get all entries completing this turn
    const completingEntries = await db.query.buildQueue.findMany({
      where: and(
        eq(buildQueue.status, 'active'),
        eq(buildQueue.completionTurn, currentTurn)
      ),
    });

    for (const entry of completingEntries) {
      // Add units to empire
      await db.insert(empireUnits).values({
        empireId: entry.empireId,
        unitTemplateId: entry.unitTemplateId,
        quantity: entry.quantity,
        createdTurn: currentTurn,
      });

      // Mark queue entry as completed
      await db
        .update(buildQueue)
        .set({ status: 'completed' })
        .where(eq(buildQueue.id, entry.id));
    }

    return completingEntries.length;
  }

  /**
   * Get active builds for an empire
   */
  async getActiveBuilds(empireId: string) {
    return db.query.buildQueue.findMany({
      where: and(eq(buildQueue.empireId, empireId), eq(buildQueue.status, 'active')),
      with: {
        unitTemplate: true,
      },
      orderBy: (queue, { asc }) => [asc(queue.completionTurn)],
    });
  }
}
```

### C.2 Maintenance Service

```typescript
// src/lib/game/services/maintenance-service.ts

import { db } from '@/lib/db';
import { empireUnits, empires, maintenanceLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateMaintenanceCost, UnitType } from '@/lib/units/unit-config';

/**
 * Maintenance processing service
 * @spec REQ-MIL-004
 */
export class MaintenanceService {
  /**
   * Calculate total maintenance for an empire
   * @spec REQ-MIL-004
   */
  async calculateEmpireMaintenance(empireId: string): Promise<{
    credits: number;
    ore: number;
    petroleum: number;
    unitCount: number;
  }> {
    const units = await db.query.empireUnits.findMany({
      where: eq(empireUnits.empireId, empireId),
      with: { unitTemplate: true },
    });

    let totalCredits = 0;
    let totalOre = 0;
    let totalPetroleum = 0;
    let unitCount = 0;

    for (const unit of units) {
      const maintenance = calculateMaintenanceCost(
        unit.unitTemplate.unitType as UnitType,
        unit.quantity
      );
      totalCredits += maintenance.credits;
      totalOre += maintenance.ore ?? 0;
      totalPetroleum += maintenance.petroleum ?? 0;
      unitCount += unit.quantity;
    }

    return {
      credits: totalCredits,
      ore: totalOre,
      petroleum: totalPetroleum,
      unitCount,
    };
  }

  /**
   * Process maintenance for all empires
   * @spec REQ-MIL-004
   */
  async processMaintenancePhase(currentTurn: number) {
    const allEmpires = await db.query.empires.findMany();

    for (const empire of allEmpires) {
      const maintenance = await this.calculateEmpireMaintenance(empire.id);

      // Check if empire can afford
      const canAfford =
        empire.credits >= maintenance.credits &&
        empire.ore >= maintenance.ore &&
        empire.petroleum >= maintenance.petroleum;

      if (canAfford) {
        // Deduct resources
        await db
          .update(empires)
          .set({
            credits: empire.credits - maintenance.credits,
            ore: empire.ore - maintenance.ore,
            petroleum: empire.petroleum - maintenance.petroleum,
          })
          .where(eq(empires.id, empire.id));

        // Log successful payment
        await db.insert(maintenanceLog).values({
          empireId: empire.id,
          turnNumber: currentTurn,
          totalUnits: maintenance.unitCount,
          totalCredits: maintenance.credits,
          totalOre: maintenance.ore,
          totalPetroleum: maintenance.petroleum,
          paidSuccessfully: true,
          unitsLost: 0,
        });
      } else {
        // Cannot afford - check bankruptcy
        await this.handleMaintenanceBankruptcy(empire.id, currentTurn, maintenance.unitCount);
      }
    }
  }

  /**
   * Handle maintenance bankruptcy (unit attrition)
   * @spec REQ-MIL-004
   */
  private async handleMaintenanceBankruptcy(
    empireId: string,
    currentTurn: number,
    totalUnits: number
  ) {
    // Check consecutive bankruptcy turns
    const recentLog = await db.query.maintenanceLog.findFirst({
      where: and(
        eq(maintenanceLog.empireId, empireId),
        eq(maintenanceLog.turnNumber, currentTurn - 1)
      ),
    });

    if (recentLog && !recentLog.paidSuccessfully) {
      // 2nd consecutive turn - apply 10% attrition
      const unitsToLose = Math.ceil(totalUnits * 0.1);
      await this.destroyUnits(empireId, unitsToLose);

      await db.insert(maintenanceLog).values({
        empireId,
        turnNumber: currentTurn,
        totalUnits,
        totalCredits: 0,
        totalOre: 0,
        totalPetroleum: 0,
        paidSuccessfully: false,
        unitsLost: unitsToLose,
      });
    } else {
      // 1st turn - grace period
      await db.insert(maintenanceLog).values({
        empireId,
        turnNumber: currentTurn,
        totalUnits,
        totalCredits: 0,
        totalOre: 0,
        totalPetroleum: 0,
        paidSuccessfully: false,
        unitsLost: 0,
      });
    }
  }

  /**
   * Destroy units in reverse power order
   */
  private async destroyUnits(empireId: string, count: number) {
    // Get all units ordered by power (highest first)
    const units = await db.query.empireUnits.findMany({
      where: eq(empireUnits.empireId, empireId),
      with: { unitTemplate: true },
      orderBy: (units, { desc }) => [desc(units.unitTemplate.powerMultiplier)],
    });

    let remainingToDestroy = count;

    for (const unit of units) {
      if (remainingToDestroy <= 0) break;

      if (unit.quantity <= remainingToDestroy) {
        // Destroy all of this unit type
        await db.delete(empireUnits).where(eq(empireUnits.id, unit.id));
        remainingToDestroy -= unit.quantity;
      } else {
        // Destroy partial
        await db
          .update(empireUnits)
          .set({ quantity: unit.quantity - remainingToDestroy })
          .where(eq(empireUnits.id, unit.id));
        remainingToDestroy = 0;
      }
    }
  }
}
```

---

## D. Server Actions

### D.1 Build Actions

```typescript
// src/app/actions/build-actions.ts

"use server";

import { BuildQueueService } from '@/lib/game/services/build-queue-service';
import { UnitType } from '@/lib/units/unit-config';
import { getCurrentTurn, getCurrentEmpireId } from '@/lib/game/session';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Queue a unit for production
 * @spec REQ-MIL-002
 */
export async function queueUnitAction(
  unitType: UnitType,
  quantity: number = 1
): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const buildQueueService = new BuildQueueService();
  const result = await buildQueueService.queueUnit(
    empireId,
    unitType,
    quantity,
    currentTurn
  );

  return result;
}

/**
 * Cancel queued unit
 * @spec REQ-MIL-002
 */
export async function cancelQueuedUnitAction(queueId: string): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const buildQueueService = new BuildQueueService();
  const result = await buildQueueService.cancelQueuedUnit(queueId, empireId, currentTurn);

  return result;
}

/**
 * Get active builds for current empire
 */
export async function getActiveBuildsAction(): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();

  const buildQueueService = new BuildQueueService();
  const builds = await buildQueueService.getActiveBuilds(empireId);

  return { success: true, data: { builds } };
}
```

---

## E. UI Components

### E.1 Build Queue Panel Component

```typescript
// src/components/game/build/BuildQueuePanel.tsx

"use client";

import { useState } from 'react';
import { UnitType, getUnitConfig, calculateTotalCost } from '@/lib/units/unit-config';
import { queueUnitAction, cancelQueuedUnitAction } from '@/app/actions/build-actions';

interface BuildQueuePanelProps {
  empireResources: {
    credits: number;
    ore: number;
    petroleum: number;
    food: number;
  };
  activeBuilds: any[];
  currentTurn: number;
}

export function BuildQueuePanel({
  empireResources,
  activeBuilds,
  currentTurn,
}: BuildQueuePanelProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuildUnit = async (unitType: UnitType) => {
    setIsBuilding(true);
    const result = await queueUnitAction(unitType, quantity);
    setIsBuilding(false);

    if (!result.success) {
      alert(result.error);
    }
  };

  const handleCancelBuild = async (queueId: string) => {
    await cancelQueuedUnitAction(queueId);
  };

  const canAfford = (unitType: UnitType) => {
    const cost = calculateTotalCost(unitType, quantity);
    return (
      empireResources.credits >= cost.credits &&
      empireResources.ore >= (cost.ore ?? 0) &&
      empireResources.petroleum >= (cost.petroleum ?? 0) &&
      empireResources.food >= (cost.food ?? 0)
    );
  };

  return (
    <div className="build-queue-panel p-6 bg-black/30 border border-orange-400/30 rounded">
      <h2 className="text-2xl font-bold text-orange-300 mb-4">BUILD QUEUE</h2>

      {/* Resources Display */}
      <div className="resources mb-6">
        <div className="flex justify-between text-sm">
          <span>Credits: {empireResources.credits.toLocaleString()}</span>
          <span>Ore: {empireResources.ore.toLocaleString()}</span>
          <span>Petroleum: {empireResources.petroleum.toLocaleString()}</span>
          <span>Food: {empireResources.food.toLocaleString()}</span>
        </div>
      </div>

      {/* Unit Selection Grid */}
      <div className="unit-selection grid grid-cols-3 gap-4 mb-6">
        {Object.values(UnitType).map((unitType) => {
          const config = getUnitConfig(unitType);
          const cost = calculateTotalCost(unitType, 1);
          const affordable = canAfford(unitType);

          return (
            <div
              key={unitType}
              className={`unit-card p-4 border rounded ${
                affordable ? 'border-green-400/50' : 'border-red-400/50'
              }`}
            >
              <h3 className="font-bold mb-2">{config.name}</h3>
              <div className="text-xs mb-2">
                <div>Cost: {cost.credits}cr</div>
                {cost.ore && <div>+ {cost.ore} ore</div>}
                {cost.petroleum && <div>+ {cost.petroleum} petro</div>}
                {cost.food && <div>+ {cost.food} food</div>}
              </div>
              <div className="text-xs mb-2">
                Production: {config.productionTime} turns
              </div>
              <button
                onClick={() => handleBuildUnit(unitType)}
                disabled={!affordable || isBuilding}
                className={`btn btn-sm w-full ${
                  affordable ? 'btn-primary' : 'btn-disabled'
                }`}
              >
                Build
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Builds */}
      <div className="active-builds">
        <h3 className="text-lg font-bold text-violet-300 mb-2">
          ACTIVE BUILDS ({activeBuilds.length})
        </h3>
        {activeBuilds.map((build) => {
          const progress = currentTurn - build.startTurn;
          const total = build.completionTurn - build.startTurn;
          const percent = (progress / total) * 100;

          return (
            <div
              key={build.id}
              className="build-entry flex justify-between items-center p-2 mb-2 bg-violet-500/10 border border-violet-400/30 rounded"
            >
              <div className="flex-1">
                <div className="font-bold">
                  {build.quantity}× {build.unitTemplate.name}
                </div>
                <div className="progress-bar w-full bg-gray-700 rounded h-4 mt-1">
                  <div
                    className="bg-violet-500 h-full rounded"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">
                  {progress}/{total} turns
                </div>
              </div>
              <button
                onClick={() => handleCancelBuild(build.id)}
                className="btn btn-sm btn-danger ml-4"
              >
                Cancel
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## F. Bot Build Logic

### F.1 Bot Production Engine

```typescript
// src/lib/bot/production-engine.ts

import { Empire } from '@/lib/db/schema';
import { BuildQueueService } from '@/lib/game/services/build-queue-service';
import { UnitType, calculateTotalCost } from '@/lib/units/unit-config';

export type BotArchetype =
  | 'Warlord'
  | 'Diplomat'
  | 'Merchant'
  | 'Schemer'
  | 'Turtle'
  | 'Blitzkrieg'
  | 'TechRush'
  | 'Opportunist';

/**
 * Bot production decision engine
 * @spec REQ-MIL-001 (Bot Integration Section 4.2)
 */
export class BotProductionEngine {
  private buildQueueService: BuildQueueService;

  constructor() {
    this.buildQueueService = new BuildQueueService();
  }

  /**
   * Decide which units to build this turn
   */
  async decideBuildActions(
    bot: Empire,
    currentTurn: number,
    neighborThreatLevel: number
  ): Promise<Array<{ unitType: UnitType; quantity: number }>> {
    const archetype = bot.archetype as BotArchetype;
    const resourceSurplus = this.calculateResourceSurplus(bot);

    // Calculate target military power
    const targetPower = this.calculateTargetMilitaryPower(bot, neighborThreatLevel, archetype);
    const currentPower = bot.militaryPower ?? 0;

    if (currentPower >= targetPower) {
      return []; // No builds needed
    }

    // Get build priorities for archetype
    const priorities = this.getArchetypePriorities(archetype);

    // Select units to build based on priorities and resources
    const builds: Array<{ unitType: UnitType; quantity: number }> = [];

    for (const unitType of priorities) {
      const cost = calculateTotalCost(unitType, 1);

      // Check if can afford
      if (
        bot.credits >= cost.credits &&
        bot.ore >= (cost.ore ?? 0) &&
        bot.petroleum >= (cost.petroleum ?? 0) &&
        bot.food >= (cost.food ?? 0)
      ) {
        // Calculate quantity based on resource surplus
        const quantity = this.calculateBuildQuantity(bot, unitType, resourceSurplus);

        if (quantity > 0) {
          builds.push({ unitType, quantity });

          // Deduct virtual resources (for multi-build planning)
          bot.credits -= cost.credits * quantity;
          bot.ore -= (cost.ore ?? 0) * quantity;
          bot.petroleum -= (cost.petroleum ?? 0) * quantity;
          bot.food -= (cost.food ?? 0) * quantity;
        }
      }
    }

    return builds;
  }

  /**
   * Get unit build priorities by archetype
   */
  private getArchetypePriorities(archetype: BotArchetype): UnitType[] {
    const priorities: Record<BotArchetype, UnitType[]> = {
      Warlord: [UnitType.HEAVY_CRUISER, UnitType.BOMBER, UnitType.FIGHTER, UnitType.SOLDIER],
      Turtle: [UnitType.STATION, UnitType.LIGHT_CRUISER, UnitType.FIGHTER, UnitType.SOLDIER],
      Blitzkrieg: [UnitType.FIGHTER, UnitType.BOMBER, UnitType.SOLDIER],
      TechRush: [UnitType.LIGHT_CRUISER, UnitType.STATION, UnitType.FIGHTER],
      Opportunist: [UnitType.FIGHTER, UnitType.LIGHT_CRUISER, UnitType.BOMBER],
      Diplomat: [UnitType.FIGHTER, UnitType.STATION, UnitType.LIGHT_CRUISER],
      Merchant: [UnitType.FIGHTER, UnitType.LIGHT_CRUISER, UnitType.STATION],
      Schemer: [UnitType.BOMBER, UnitType.FIGHTER, UnitType.LIGHT_CRUISER],
    };

    return priorities[archetype];
  }

  /**
   * Calculate target military power based on threat level
   */
  private calculateTargetMilitaryPower(
    bot: Empire,
    threatLevel: number,
    archetype: BotArchetype
  ): number {
    const baseTarget = bot.networth * 0.25; // 25% of networth

    const archetypeMultipliers: Record<BotArchetype, number> = {
      Warlord: 1.5, // 37.5% of networth
      Blitzkrieg: 1.3,
      TechRush: 0.8,
      Turtle: 1.2,
      Opportunist: 1.0,
      Diplomat: 0.9,
      Merchant: 0.7,
      Schemer: 0.9,
    };

    const threatMultiplier = Math.max(1.0, threatLevel);

    return baseTarget * archetypeMultipliers[archetype] * threatMultiplier;
  }

  /**
   * Calculate resource surplus
   */
  private calculateResourceSurplus(bot: Empire): number {
    const income = bot.incomePerTurn ?? 0;
    const expenses = bot.expensesPerTurn ?? 0;
    return income - expenses;
  }

  /**
   * Calculate quantity to build based on resources
   */
  private calculateBuildQuantity(
    bot: Empire,
    unitType: UnitType,
    resourceSurplus: number
  ): number {
    const cost = calculateTotalCost(unitType, 1);

    // Limit to what bot can afford
    const maxAffordable = Math.floor(bot.credits / cost.credits);

    // Limit based on resource surplus (don't overspend)
    const maxSafe = Math.floor(resourceSurplus / cost.credits);

    // Return minimum of affordable and safe quantities
    return Math.max(0, Math.min(maxAffordable, maxSafe, 10)); // Cap at 10 per type per turn
  }
}
```

---

**END APPENDIX**
