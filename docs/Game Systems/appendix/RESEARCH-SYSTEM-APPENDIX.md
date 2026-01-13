# Research System - Appendix

**Parent Document:** [RESEARCH-SYSTEM.md](../RESEARCH-SYSTEM.md)
**Purpose:** Code examples, detailed implementations, and extensive data tables

---

## Table of Contents

1. [Database Schema](#database-schema)
2. [Service Architecture](#service-architecture)
3. [Combat Integration](#combat-integration)
4. [UI Components](#ui-components)

---

## Database Schema

**Complete SQL schema for research system tables:**

```sql
-- ============================================================================
-- RESEARCH SYSTEM DATABASE SCHEMA
-- ============================================================================

-- Add columns to existing empires table
ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_doctrine VARCHAR(20);
-- Values: 'war_machine', 'fortress', 'commerce', NULL

ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_specialization VARCHAR(30);
-- Values: 'shock_troops', 'siege_engines', 'shield_arrays',
--         'minefield_networks', 'trade_monopoly', 'mercenary_contracts', NULL

ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_tier INTEGER DEFAULT 0;
-- Values: 0 (no research), 1 (doctrine), 2 (specialization), 3 (capstone)

ALTER TABLE empires ADD COLUMN IF NOT EXISTS research_points INTEGER DEFAULT 0;
-- Accumulated RP toward next tier

ALTER TABLE empires ADD COLUMN IF NOT EXISTS tier3_unlocked_turn INTEGER;
-- Turn when capstone was unlocked (for announcements)

-- ============================================================================
-- Intel operations tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_intel_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  investigator_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  operation_type VARCHAR(30) NOT NULL, -- 'discover_specialization'
  cost_credits INTEGER NOT NULL, -- 5000 typically

  success BOOLEAN NOT NULL,
  result_data JSONB, -- { "specialization": "shock_troops", "counter": "shield_arrays" }

  created_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_operation_type CHECK (operation_type IN ('discover_specialization'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_intel_investigator
  ON research_intel_operations(investigator_id);

CREATE INDEX IF NOT EXISTS idx_research_intel_target
  ON research_intel_operations(target_id);

CREATE INDEX IF NOT EXISTS idx_research_intel_game_turn
  ON research_intel_operations(game_id, created_turn);

-- ============================================================================
-- Galactic News rumor system
-- ============================================================================
CREATE TABLE IF NOT EXISTS galactic_news_rumors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  turn_number INTEGER NOT NULL, -- Turn when rumor was generated

  rumor_text TEXT NOT NULL, -- Display text (e.g., "Emperor Varkus has Shock Troops")
  is_true BOOLEAN NOT NULL, -- For validation, not shown to players

  subject_empire_id UUID REFERENCES empires(id) ON DELETE CASCADE, -- Who rumor is about
  rumor_type VARCHAR(30), -- 'doctrine', 'specialization', 'capstone_progress'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_galactic_news_game_turn
  ON galactic_news_rumors(game_id, turn_number);

CREATE INDEX IF NOT EXISTS idx_galactic_news_subject
  ON galactic_news_rumors(subject_empire_id);

-- ============================================================================
-- Public announcements log
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  announcement_type VARCHAR(30) NOT NULL, -- 'doctrine', 'capstone'
  announcement_text TEXT NOT NULL, -- Full announcement message

  turn_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_announcement_type CHECK (announcement_type IN ('doctrine', 'capstone'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_announcements_game_turn
  ON research_announcements(game_id, turn_number);

CREATE INDEX IF NOT EXISTS idx_research_announcements_empire
  ON research_announcements(empire_id);
```

---

## Service Architecture

**Complete TypeScript service implementation:**

```typescript
// ============================================================================
// src/lib/game/services/research-service.ts
// ============================================================================

import { db } from '@/lib/db';
import {
  Empire,
  ResearchDoctrine,
  ResearchSpecialization,
  ResearchTier,
  ResearchStatus,
  IntelResult,
  Rumor,
  VisibleResearchInfo
} from '@/types/research';

export type Doctrine = 'war_machine' | 'fortress' | 'commerce';
export type Specialization =
  | 'shock_troops'
  | 'siege_engines'
  | 'shield_arrays'
  | 'minefield_networks'
  | 'trade_monopoly'
  | 'mercenary_contracts';

export interface ResearchStatus {
  tier: number; // 0-3
  researchPoints: number;
  doctrine: Doctrine | null;
  specialization: Specialization | null;
  tier3UnlockedTurn: number | null;
  progressPercentage: number; // 0-100
  nextThreshold: number; // 1000, 5000, or 15000
}

export class ResearchService {
  // ============================================================================
  // Research Progression
  // ============================================================================

  /**
   * Process research production each turn
   * @spec REQ-RSCH-005
   */
  async processResearchProduction(
    empireId: string,
    researchSectorCount: number
  ): Promise<ResearchStatus> {
    const rpGenerated = researchSectorCount * 100;

    // Add RP to empire
    const empire = await db.empire.update({
      where: { id: empireId },
      data: {
        researchPoints: {
          increment: rpGenerated
        }
      }
    });

    // Check threshold unlocks
    const status = await this.getResearchStatus(empireId);

    // Tier 1 unlock at 1,000 RP
    if (status.researchPoints >= 1000 && status.tier === 0) {
      await this.triggerDoctrineSelectionEvent(empireId);
    }

    // Tier 2 unlock at 5,000 RP
    if (status.researchPoints >= 5000 && status.tier === 1) {
      await this.triggerSpecializationSelectionEvent(empireId);
    }

    // Tier 3 unlock at 15,000 RP
    if (status.researchPoints >= 15000 && status.tier === 2) {
      await this.unlockCapstone(empireId);
    }

    return status;
  }

  /**
   * Get current research status for empire
   */
  async getResearchStatus(empireId: string): Promise<ResearchStatus> {
    const empire = await db.empire.findUnique({
      where: { id: empireId },
      select: {
        researchTier: true,
        researchPoints: true,
        researchDoctrine: true,
        researchSpecialization: true,
        tier3UnlockedTurn: true
      }
    });

    if (!empire) {
      throw new Error(`Empire ${empireId} not found`);
    }

    // Calculate progress percentage
    const thresholds = [0, 1000, 5000, 15000];
    const currentThreshold = thresholds[empire.researchTier];
    const nextThreshold = thresholds[empire.researchTier + 1] || 15000;

    const progressPercentage =
      ((empire.researchPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return {
      tier: empire.researchTier,
      researchPoints: empire.researchPoints,
      doctrine: empire.researchDoctrine as Doctrine | null,
      specialization: empire.researchSpecialization as Specialization | null,
      tier3UnlockedTurn: empire.tier3UnlockedTurn,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      nextThreshold
    };
  }

  // ============================================================================
  // Tier 1: Doctrine Selection
  // ============================================================================

  /**
   * Select doctrine (Tier 1)
   * @spec REQ-RSCH-002
   */
  async selectDoctrine(
    empireId: string,
    doctrine: Doctrine
  ): Promise<void> {
    // Validate RP threshold reached
    const status = await this.getResearchStatus(empireId);
    if (status.researchPoints < 1000) {
      throw new Error('Insufficient research points for doctrine selection');
    }

    // Update empire
    await db.empire.update({
      where: { id: empireId },
      data: {
        researchDoctrine: doctrine,
        researchTier: 1
      }
    });

    // Create public announcement
    await this.createPublicAnnouncement(empireId, 'doctrine', { doctrine });
  }

  // ============================================================================
  // Tier 2: Specialization Selection (Hidden)
  // ============================================================================

  /**
   * Select specialization (Tier 2) - Hidden from enemies
   * @spec REQ-RSCH-003
   */
  async selectSpecialization(
    empireId: string,
    specialization: Specialization
  ): Promise<void> {
    // Validate RP threshold reached
    const status = await this.getResearchStatus(empireId);
    if (status.researchPoints < 5000) {
      throw new Error('Insufficient research points for specialization selection');
    }

    // Validate specialization matches doctrine
    const validSpecializations = this.getSpecializationOptions(status.doctrine!);
    if (!validSpecializations.includes(specialization)) {
      throw new Error(`Invalid specialization ${specialization} for doctrine ${status.doctrine}`);
    }

    // Update empire (no public announcement)
    await db.empire.update({
      where: { id: empireId },
      data: {
        researchSpecialization: specialization,
        researchTier: 2
      }
    });
  }

  /**
   * Get available specialization options based on doctrine
   */
  getSpecializationOptions(doctrine: Doctrine): Specialization[] {
    const options: Record<Doctrine, Specialization[]> = {
      war_machine: ['shock_troops', 'siege_engines'],
      fortress: ['shield_arrays', 'minefield_networks'],
      commerce: ['trade_monopoly', 'mercenary_contracts']
    };
    return options[doctrine] || [];
  }

  // ============================================================================
  // Tier 3: Capstone Unlock
  // ============================================================================

  /**
   * Unlock capstone (Tier 3) - Automatic based on doctrine
   * @spec REQ-RSCH-004
   */
  async unlockCapstone(empireId: string): Promise<void> {
    const status = await this.getResearchStatus(empireId);
    const game = await db.empire.findUnique({
      where: { id: empireId },
      include: { game: true }
    });

    if (!game) throw new Error('Empire or game not found');

    // Update empire
    await db.empire.update({
      where: { id: empireId },
      data: {
        researchTier: 3,
        tier3UnlockedTurn: game.game.currentTurn
      }
    });

    // Create dramatic public announcement
    await this.createPublicAnnouncement(empireId, 'capstone', {
      doctrine: status.doctrine,
      turn: game.game.currentTurn
    });

    // Trigger bot reactions (coalitions, preemptive strikes)
    await this.triggerCapstoneReactions(empireId, status.doctrine!);
  }

  // ============================================================================
  // Combat Integration
  // ============================================================================

  /**
   * Apply research bonuses to unit stats
   * @spec REQ-RSCH-007
   */
  async applyResearchBonuses(
    empireId: string,
    baseStats: UnitStats,
    isDefending: boolean = false
  ): Promise<UnitStats> {
    const research = await this.getResearchStatus(empireId);
    const modifiedStats = { ...baseStats };

    // Doctrine bonuses
    if (research.doctrine === 'war_machine') {
      modifiedStats.strength += 2;
      modifiedStats.strModifier = Math.floor((modifiedStats.strength - 10) / 2);
    } else if (research.doctrine === 'fortress' && isDefending) {
      modifiedStats.armorClass += 4;
    } else if (research.doctrine === 'commerce') {
      // Commander CHA bonus handled separately (not unit stats)
    }

    return modifiedStats;
  }

  // ============================================================================
  // Intel Operations
  // ============================================================================

  /**
   * Investigate enemy specialization (Covert Operation)
   * @spec REQ-RSCH-009
   */
  async investigateSpecialization(
    investigatorId: string,
    targetId: string
  ): Promise<IntelResult> {
    const COST = 5000;
    const SUCCESS_RATE = 0.85;

    // Deduct credits
    const investigator = await db.empire.findUnique({
      where: { id: investigatorId }
    });

    if (!investigator || investigator.credits < COST) {
      throw new Error('Insufficient credits for investigation');
    }

    await db.empire.update({
      where: { id: investigatorId },
      data: { credits: investigator.credits - COST }
    });

    // Roll for success
    const success = Math.random() < SUCCESS_RATE;

    if (success) {
      const target = await this.getResearchStatus(targetId);

      // Log operation
      await db.researchIntelOperation.create({
        data: {
          gameId: investigator.gameId,
          investigatorId,
          targetId,
          operationType: 'discover_specialization',
          costCredits: COST,
          success: true,
          resultData: {
            specialization: target.specialization,
            counter: this.getCounterSpecialization(target.specialization!)
          },
          createdTurn: investigator.game.currentTurn
        }
      });

      return {
        success: true,
        specialization: target.specialization!,
        counter: this.getCounterSpecialization(target.specialization!),
        doctrine: target.doctrine!
      };
    } else {
      // Failed - log and apply reputation penalty
      await db.researchIntelOperation.create({
        data: {
          gameId: investigator.gameId,
          investigatorId,
          targetId,
          operationType: 'discover_specialization',
          costCredits: COST,
          success: false,
          createdTurn: investigator.game.currentTurn
        }
      });

      // Reputation penalty (detected)
      await this.applyReputationPenalty(investigatorId, targetId, -10);

      return {
        success: false,
        reason: 'Operation failed. Target detected the investigation.'
      };
    }
  }

  /**
   * Get counter specialization for rock-paper-scissors
   */
  getCounterSpecialization(spec: Specialization): Specialization | null {
    const counters: Record<Specialization, Specialization | null> = {
      shock_troops: 'shield_arrays',
      siege_engines: 'minefield_networks',
      shield_arrays: 'siege_engines',
      minefield_networks: 'shock_troops',
      trade_monopoly: null, // Economic only, no combat counter
      mercenary_contracts: null // Flexible, pay-per-use
    };
    return counters[spec];
  }

  // ============================================================================
  // Galactic News Rumors
  // ============================================================================

  /**
   * Generate Galactic News rumors (3 true + 2 false)
   * @spec REQ-RSCH-010
   */
  async generateRumors(gameId: string, turn: number): Promise<Rumor[]> {
    // Get all empires in game
    const empires = await db.empire.findMany({
      where: { gameId },
      include: { researchStatus: true }
    });

    const rumors: Rumor[] = [];

    // Generate 3 TRUE rumors
    const trueSubjects = this.selectRandom(empires, 3);
    for (const empire of trueSubjects) {
      const rumor = await this.generateTrueRumor(empire);
      rumors.push(rumor);
    }

    // Generate 2 FALSE rumors
    const falseSubjects = this.selectRandom(
      empires.filter(e => !trueSubjects.includes(e)),
      2
    );
    for (const empire of falseSubjects) {
      const rumor = await this.generateFalseRumor(empire);
      rumors.push(rumor);
    }

    // Shuffle rumors (players can't tell true from false)
    const shuffled = this.shuffle(rumors);

    // Store in database
    for (const rumor of shuffled) {
      await db.galacticNewsRumor.create({
        data: {
          gameId,
          turnNumber: turn,
          rumorText: rumor.text,
          isTrue: rumor.isTrue,
          subjectEmpireId: rumor.subjectId,
          rumorType: rumor.type
        }
      });
    }

    return shuffled;
  }

  // ============================================================================
  // Public Announcements
  // ============================================================================

  /**
   * Create galaxy-wide public announcement
   */
  async createPublicAnnouncement(
    empireId: string,
    type: 'doctrine' | 'capstone',
    data: any
  ): Promise<void> {
    const empire = await db.empire.findUnique({
      where: { id: empireId }
    });

    if (!empire) throw new Error('Empire not found');

    let announcementText: string;

    if (type === 'doctrine') {
      announcementText = this.generateDoctrineAnnouncement(empire.name, data.doctrine);
    } else if (type === 'capstone') {
      announcementText = this.generateCapstoneAnnouncement(empire.name, data.doctrine);
    } else {
      throw new Error(`Unknown announcement type: ${type}`);
    }

    // Store announcement
    await db.researchAnnouncement.create({
      data: {
        gameId: empire.gameId,
        empireId,
        announcementType: type,
        announcementText,
        turnNumber: empire.game.currentTurn
      }
    });

    // Notify all players (implementation depends on notification system)
    await this.notifyAllPlayers(empire.gameId, announcementText);
  }

  // ============================================================================
  // Visibility & Intel
  // ============================================================================

  /**
   * Get visible research info for viewer about target
   * @spec REQ-RSCH-006
   */
  async getVisibleResearchInfo(
    viewerEmpireId: string,
    targetEmpireId: string
  ): Promise<VisibleResearchInfo> {
    const target = await this.getResearchStatus(targetEmpireId);
    const viewer = await db.empire.findUnique({ where: { id: viewerEmpireId } });

    if (!viewer) throw new Error('Viewer empire not found');

    // Always visible (public)
    const visible: VisibleResearchInfo = {
      doctrine: target.doctrine, // PUBLIC
      tier: target.tier, // Can be estimated from sector count
      tier3UnlockedTurn: target.tier3UnlockedTurn, // PUBLIC when announced
      researchSectorCount: await this.countResearchSectors(targetEmpireId)
    };

    // Hidden by default
    visible.specialization = null;
    visible.researchPoints = null; // NEVER visible
    visible.progressPercentage = null; // NEVER visible

    // Revealed through specific conditions
    const revealed = await this.checkSpecializationRevealed(
      viewerEmpireId,
      targetEmpireId
    );

    if (revealed.revealed) {
      visible.specialization = target.specialization;
      visible.revealMethod = revealed.method;
    }

    return visible;
  }

  /**
   * Check if specialization has been revealed to viewer
   */
  async checkSpecializationRevealed(
    viewerEmpireId: string,
    targetEmpireId: string
  ): Promise<{ revealed: boolean; method?: string }> {
    // Check intel operations
    const intelOp = await db.researchIntelOperation.findFirst({
      where: {
        investigatorId: viewerEmpireId,
        targetId: targetEmpireId,
        success: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (intelOp) {
      return { revealed: true, method: 'espionage' };
    }

    // Check combat reveals (implementation depends on combat system)
    const combatReveal = await this.checkCombatReveal(viewerEmpireId, targetEmpireId);
    if (combatReveal) {
      return { revealed: true, method: 'combat' };
    }

    // Check alliance membership
    const inAlliance = await this.checkCoalitionMembership(viewerEmpireId, targetEmpireId);
    if (inAlliance) {
      return { revealed: true, method: 'alliance' };
    }

    return { revealed: false };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async triggerDoctrineSelectionEvent(empireId: string): Promise<void> {
    // Trigger UI event for player or bot decision logic
    // Implementation depends on event system
  }

  private async triggerSpecializationSelectionEvent(empireId: string): Promise<void> {
    // Trigger UI event (hidden from other players)
  }

  private async triggerCapstoneReactions(empireId: string, doctrine: Doctrine): Promise<void> {
    // Trigger bot reactions (coalitions form, preemptive strikes, messages)
    // Implementation depends on bot AI system
  }

  private async countResearchSectors(empireId: string): Promise<number> {
    const count = await db.sector.count({
      where: {
        empireId,
        sectorType: 'research'
      }
    });
    return count;
  }

  private async applyReputationPenalty(
    fromEmpireId: string,
    toEmpireId: string,
    penalty: number
  ): Promise<void> {
    // Apply reputation penalty (depends on diplomacy system)
  }

  private selectRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  private async generateTrueRumor(empire: Empire): Promise<Rumor> {
    // Generate accurate rumor about empire's research
    return {
      text: `Sources say ${empire.name} has ${empire.researchSpecialization}`,
      isTrue: true,
      subjectId: empire.id,
      type: 'specialization'
    };
  }

  private async generateFalseRumor(empire: Empire): Promise<Rumor> {
    // Generate false rumor (wrong specialization, outdated info, etc.)
    const fakeSpecs: Specialization[] = ['shock_troops', 'siege_engines', 'shield_arrays'];
    const fakeSpec = fakeSpecs[Math.floor(Math.random() * fakeSpecs.length)];

    return {
      text: `Rumors suggest ${empire.name} has ${fakeSpec}`,
      isTrue: false,
      subjectId: empire.id,
      type: 'specialization'
    };
  }

  private generateDoctrineAnnouncement(empireName: string, doctrine: Doctrine): string {
    const messages: Record<Doctrine, string> = {
      war_machine: `${empireName} has adopted the WAR MACHINE doctrine. Their military grows more dangerous. (+2 STR to all units)`,
      fortress: `${empireName} has fortified with the FORTRESS doctrine. Their defenses are now formidable. (+4 AC when defending)`,
      commerce: `${empireName} has embraced the COMMERCE doctrine. Their economic influence expands. (+2 CHA, +20% trade prices)`
    };
    return messages[doctrine];
  }

  private generateCapstoneAnnouncement(empireName: string, doctrine: Doctrine): string {
    const messages: Record<Doctrine, string> = {
      war_machine: `⚠️ GALACTIC ALERT ⚠️\n\n${empireName} has achieved DREADNOUGHT TECHNOLOGY!\n\nA devastating warship patrols their borders.\nSTR 20 (+5), HP 200, Damage: 4d12+5\n\nAll empires must decide: Attack now or never.`,
      fortress: `⚠️ GALACTIC ALERT ⚠️\n\n${empireName} has fortified CITADEL WORLD!\n\nTheir homeworld is now impregnable.\nAC 25 - Nearly invulnerable to attack\n\nThey cannot be conquered by force alone.`,
      commerce: `⚠️ GALACTIC ALERT ⚠️\n\n${empireName} has achieved ECONOMIC HEGEMONY!\n\nTheir economy siphons wealth from the galaxy.\n+50% of 2nd place income (passive)\n\nEconomic victory is imminent unless stopped.`
    };
    return messages[doctrine];
  }

  private async notifyAllPlayers(gameId: string, message: string): Promise<void> {
    // Send notification to all players in game
    // Implementation depends on notification system
  }

  private async checkCombatReveal(
    viewerEmpireId: string,
    targetEmpireId: string
  ): Promise<boolean> {
    // Check if specialization was revealed in combat
    // Implementation depends on combat system
    return false;
  }

  private async checkCoalitionMembership(
    empire1Id: string,
    empire2Id: string
  ): Promise<boolean> {
    // Check if both empires are in same coalition
    // Implementation depends on diplomacy system
    return false;
  }
}
```

---

## Combat Integration

**Complete combat integration implementation:**

```typescript
// ============================================================================
// src/lib/combat/research-integration.ts
// ============================================================================

import { ResearchService } from '@/lib/game/services/research-service';
import { Fleet, UnitStats, CombatModifiers } from '@/types/combat';

/**
 * Apply research modifiers to combat
 * @spec REQ-RSCH-007
 */
export async function applyResearchModifiers(
  attacker: Fleet,
  defender: Fleet
): Promise<CombatModifiers> {
  const researchService = new ResearchService();

  const attackerResearch = await researchService.getResearchStatus(attacker.empireId);
  const defenderResearch = await researchService.getResearchStatus(defender.empireId);

  const modifiers: CombatModifiers = {
    attackerSTRBonus: 0,
    defenderSTRBonus: 0,
    attackerACBonus: 0,
    defenderACBonus: 0,
    surpriseRound: false,
    minefieldSave: false,
    ignoreStationArmor: false
  };

  // ============================================================================
  // Doctrine Bonuses
  // ============================================================================

  // War Machine: +2 STR to all units
  if (attackerResearch.doctrine === 'war_machine') {
    modifiers.attackerSTRBonus = 2;
  }
  if (defenderResearch.doctrine === 'war_machine') {
    modifiers.defenderSTRBonus = 2;
  }

  // Fortress: +4 AC when defending (defender only)
  if (defenderResearch.doctrine === 'fortress') {
    modifiers.defenderACBonus = 4;
  }

  // Commerce: +2 CHA (commander only, not unit stats)
  // Handled separately in diplomacy checks

  // ============================================================================
  // Specialization Effects
  // ============================================================================

  // Shock Troops: Surprise round (unless Shield Arrays)
  if (attackerResearch.specialization === 'shock_troops') {
    if (defenderResearch.specialization !== 'shield_arrays') {
      modifiers.surpriseRound = true;

      // Reveal specialization to defender (first combat use)
      await researchService.revealSpecialization(
        attacker.empireId,
        defender.empireId,
        'shock_troops',
        'combat'
      );
    }
  }

  // Shield Arrays: Negate surprise rounds
  if (defenderResearch.specialization === 'shield_arrays') {
    modifiers.surpriseRound = false; // Override Shock Troops

    // Reveal specialization to attacker (negated surprise)
    if (attackerResearch.specialization === 'shock_troops') {
      await researchService.revealSpecialization(
        defender.empireId,
        attacker.empireId,
        'shield_arrays',
        'combat'
      );
    }
  }

  // Minefield Networks: CON saves for attackers
  if (defenderResearch.specialization === 'minefield_networks') {
    modifiers.minefieldSave = true; // Attacker units roll CON save DC 15

    // Reveal specialization to attacker (triggered mines)
    await researchService.revealSpecialization(
      defender.empireId,
      attacker.empireId,
      'minefield_networks',
      'combat'
    );
  }

  // Siege Engines: Treat station AC as 10 (ignore armor)
  if (attackerResearch.specialization === 'siege_engines') {
    if (defender.hasStations) {
      modifiers.ignoreStationArmor = true;
      modifiers.attackerSTRBonus += 2; // Additional +2 STR vs stations

      // Reveal specialization to defender (siege in action)
      await researchService.revealSpecialization(
        attacker.empireId,
        defender.empireId,
        'siege_engines',
        'combat'
      );
    }
  }

  // Trade Monopoly: No combat effect (economic only)
  // Mercenary Contracts: Handled separately (pre-battle hire decision)

  return modifiers;
}

/**
 * Execute surprise round (Shock Troops)
 */
export async function executeSurpriseRound(
  attacker: Fleet,
  defender: Fleet
): Promise<SurpriseRoundResult> {
  // Attacker units attack before initiative
  const damage = await calculateSurpriseDamage(attacker, defender);

  // Apply damage to defender
  defender.units.forEach(unit => {
    unit.currentHP -= damage.get(unit.id) || 0;
  });

  return {
    damage,
    message: `${attacker.empireName}'s Shock Troops attack before you can respond!`
  };
}

/**
 * Execute minefield CON saves
 */
export async function executeMinefieldSaves(
  attacker: Fleet
): Promise<MinefieldResult> {
  const DC = 15;
  const results: Map<string, boolean> = new Map();

  for (const unit of attacker.units) {
    // Roll d20 + CON modifier vs DC 15
    const roll = Math.floor(Math.random() * 20) + 1;
    const save = roll + unit.conModifier;

    if (save >= DC) {
      // Success: No damage
      results.set(unit.id, true);
    } else {
      // Failure: Lose 10% HP
      const damage = Math.floor(unit.currentHP * 0.1);
      unit.currentHP -= damage;
      results.set(unit.id, false);
    }
  }

  return {
    saves: results,
    message: 'Your fleet triggers enemy minefields!'
  };
}
```

---

## UI Components

**UI component interfaces and key components:**

```typescript
// ============================================================================
// src/components/game/research/ResearchPanel.tsx
// ============================================================================

import React from 'react';
import { Empire, ResearchStatus } from '@/types/research';

interface ResearchPanelProps {
  empire: Empire;
  researchStatus: ResearchStatus;
  onSelectDoctrine?: (doctrine: Doctrine) => void;
  onSelectSpecialization?: (spec: Specialization) => void;
  onInvestigateSpecialization?: (targetId: string) => void;
}

export function ResearchPanel({
  empire,
  researchStatus,
  onSelectDoctrine,
  onSelectSpecialization,
  onInvestigateSpecialization
}: ResearchPanelProps) {
  // Main research panel implementation
  return (
    <div className="research-panel">
      <ResearchProgress status={researchStatus} />
      {researchStatus.tier === 0 && <DoctrineSelectionPrompt />}
      {researchStatus.tier === 1 && <SpecializationSelectionPrompt />}
      {researchStatus.tier >= 1 && <CurrentDoctrine doctrine={researchStatus.doctrine} />}
      {researchStatus.tier >= 2 && <CurrentSpecialization spec={researchStatus.specialization} />}
      <IntelOperationsPanel onInvestigate={onInvestigateSpecialization} />
    </div>
  );
}

// ============================================================================
// src/components/game/research/DoctrineSelectionScreen.tsx
// ============================================================================

interface DoctrineSelectionScreenProps {
  empireId: string;
  researchPoints: number;
  onSelect: (doctrine: Doctrine) => void;
}

export function DoctrineSelectionScreen({
  empireId,
  researchPoints,
  onSelect
}: DoctrineSelectionScreenProps) {
  const doctrines: Doctrine[] = ['war_machine', 'fortress', 'commerce'];

  return (
    <div className="doctrine-selection-screen">
      <h2>Doctrine Selection Available</h2>
      <p>Choose your strategic path. This choice is permanent and public.</p>

      <div className="doctrine-grid">
        {doctrines.map(doctrine => (
          <DoctrineCard
            key={doctrine}
            doctrine={doctrine}
            onSelect={() => onSelect(doctrine)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// src/components/game/research/IntelPanel.tsx
// ============================================================================

interface IntelPanelProps {
  targetEmpire: Empire;
  visibleInfo: VisibleResearchInfo;
  onInvestigate: (targetId: string) => void;
}

export function IntelPanel({
  targetEmpire,
  visibleInfo,
  onInvestigate
}: IntelPanelProps) {
  return (
    <div className="intel-panel">
      <h3>{targetEmpire.name}</h3>

      {/* Public info (always visible) */}
      <div className="public-info">
        <div>Doctrine: {visibleInfo.doctrine || 'Unknown'}</div>
        <div>Research Sectors: {visibleInfo.researchSectorCount}</div>
      </div>

      {/* Hidden info (requires investigation) */}
      <div className="hidden-info">
        {visibleInfo.specialization ? (
          <div>Specialization: {visibleInfo.specialization}</div>
        ) : (
          <button onClick={() => onInvestigate(targetEmpire.id)}>
            Investigate Specialization (5,000 cr)
          </button>
        )}
      </div>

      {/* Estimated info (deduction) */}
      <div className="estimated-info">
        <div>Est. RP/turn: ~{visibleInfo.researchSectorCount * 100}</div>
      </div>
    </div>
  );
}

// ============================================================================
// src/components/game/research/GalacticNewsPanel.tsx
// ============================================================================

interface GalacticNewsPanelProps {
  rumors: Rumor[];
  currentTurn: number;
  onInvestigate?: (rumorId: string, targetEmpireId: string) => void;
}

export function GalacticNewsPanel({
  rumors,
  currentTurn,
  onInvestigate
}: GalacticNewsPanelProps) {
  return (
    <div className="galactic-news-panel">
      <h2>Galactic News Network - Turn {currentTurn}</h2>
      <p className="warning">
        ⚠️ Galactic News has ~50% accuracy. Verify critical intelligence via espionage.
      </p>

      <div className="rumors-list">
        {rumors.map(rumor => (
          <div key={rumor.id} className="rumor-item">
            <div className="rumor-text">{rumor.text}</div>
            {onInvestigate && (
              <button onClick={() => onInvestigate(rumor.id, rumor.subjectId)}>
                Investigate (5,000 cr)
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="next-bulletin">
        Next Bulletin: Turn {currentTurn + 10}
      </div>
    </div>
  );
}

// ============================================================================
// src/components/game/research/ResearchAnnouncement.tsx
// ============================================================================

interface AnnouncementProps {
  empire: Empire;
  announcementType: 'doctrine' | 'capstone';
  data: {
    doctrine: Doctrine;
    specialization?: Specialization;
  };
  onAcknowledge: () => void;
}

export function ResearchAnnouncement({
  empire,
  announcementType,
  data,
  onAcknowledge
}: AnnouncementProps) {
  return (
    <div className="announcement-overlay">
      <div className="announcement-modal">
        <h1>
          {announcementType === 'capstone' ? '⚠️ GALACTIC ALERT ⚠️' : 'GALACTIC INTEL REPORT'}
        </h1>

        <div className="announcement-content">
          {announcementType === 'doctrine' ? (
            <DoctrinelAnnouncement empire={empire} doctrine={data.doctrine} />
          ) : (
            <CapstoneAnnouncement empire={empire} doctrine={data.doctrine} />
          )}
        </div>

        <button onClick={onAcknowledge}>
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
}
```

---

**Version:** 1.0
**Created:** 2026-01-12
**Parent Document:** [RESEARCH-SYSTEM.md](../RESEARCH-SYSTEM.md)
