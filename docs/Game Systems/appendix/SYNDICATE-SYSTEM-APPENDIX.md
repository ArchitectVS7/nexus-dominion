# Galactic Syndicate System - Appendix

**Parent Document:** [SYNDICATE-SYSTEM.md](../SYNDICATE-SYSTEM.md)
**Purpose:** Code examples, detailed formulas, database schemas, and extensive implementation details

---

## Table of Contents

1. [Database Schemas](#database-schemas)
2. [Service Architecture](#service-architecture)
3. [Server Actions](#server-actions)
4. [UI Components](#ui-components)
5. [Bot AI](#bot-ai)
6. [Trust & Suspicion Systems](#trust-and-suspicion)
7. [Contract Catalog](#contract-catalog)
8. [Black Market](#black-market)
9. [Bot Messages](#bot-messages)

---

## Database Schemas

### Empires Table Extensions

```sql
-- Add Syndicate-related columns to existing empires table
-- Safe to run: YES - adds new columns with defaults

ALTER TABLE empires ADD COLUMN IF NOT EXISTS loyalty_role VARCHAR(20) DEFAULT 'loyalist';
-- Values: 'loyalist', 'syndicate', 'defector'

ALTER TABLE empires ADD COLUMN IF NOT EXISTS syndicate_vp INTEGER DEFAULT 0;
-- Syndicate Victory Points (0-3, 3 = victory)

ALTER TABLE empires ADD COLUMN IF NOT EXISTS syndicate_trust_level INTEGER DEFAULT 0;
-- Trust level (0-8), gates Black Market access

ALTER TABLE empires ADD COLUMN IF NOT EXISTS syndicate_trust_points INTEGER DEFAULT 0;
-- Cumulative trust points for level progression

ALTER TABLE empires ADD COLUMN IF NOT EXISTS suspicion_score INTEGER DEFAULT 0;
-- Suspicion rating (0-100), affects accusation likelihood

ALTER TABLE empires ADD COLUMN IF NOT EXISTS is_outed BOOLEAN DEFAULT false;
-- Whether Syndicate identity has been revealed

ALTER TABLE empires ADD COLUMN IF NOT EXISTS intel_points INTEGER DEFAULT 0;
-- Intel points for investigations/accusations (max 50)

ALTER TABLE empires ADD COLUMN IF NOT EXISTS coordinator_standing INTEGER DEFAULT 0;
-- Relationship with Coordinator NPC faction

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_empires_loyalty_role ON empires(loyalty_role);
CREATE INDEX IF NOT EXISTS idx_empires_suspicion_score ON empires(suspicion_score);
CREATE INDEX IF NOT EXISTS idx_empires_is_outed ON empires(is_outed);
```

### Syndicate Contracts Table

```sql
-- Track Syndicate contract assignments and completions
CREATE TABLE IF NOT EXISTS syndicate_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  contract_type VARCHAR(50) NOT NULL,
  -- Values: 'sabotage_production', 'insurgent_aid', 'market_manipulation', etc.

  contract_tier INTEGER NOT NULL CHECK (contract_tier BETWEEN 1 AND 4),
  -- Tier determines difficulty and rewards (1=Covert, 2=Strategic, 3=High-Risk, 4=Endgame)

  target_empire_id UUID REFERENCES empires(id) ON DELETE SET NULL,
  -- NULL if contract doesn't have specific target (e.g., market manipulation)

  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- Values: 'active', 'completed', 'failed', 'expired'

  syndicate_vp_reward INTEGER NOT NULL,
  -- Syndicate VP earned on completion (1-5)

  credit_reward INTEGER NOT NULL,
  -- Credits earned on completion

  trust_reward INTEGER NOT NULL,
  -- Trust points earned on completion

  suspicion_generated INTEGER NOT NULL,
  -- Suspicion points generated on completion (0-100)

  assigned_turn INTEGER NOT NULL,
  -- Turn when contract was assigned

  deadline_turn INTEGER,
  -- NULL if no deadline, otherwise turn when contract expires

  completed_turn INTEGER,
  -- Turn when contract was completed (NULL if not completed)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_syndicate_contracts_empire ON syndicate_contracts(empire_id);
CREATE INDEX idx_syndicate_contracts_status ON syndicate_contracts(status);
CREATE INDEX idx_syndicate_contracts_tier ON syndicate_contracts(contract_tier);
CREATE INDEX idx_syndicate_contracts_target ON syndicate_contracts(target_empire_id);
```

### Accusations Table

```sql
-- Track accusation trials and outcomes
CREATE TABLE IF NOT EXISTS accusations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  accuser_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  accusation_turn INTEGER NOT NULL,
  -- Turn when accusation was made

  voting_end_turn INTEGER NOT NULL,
  -- Turn when voting period ends (accusation_turn + 3)

  votes_guilty INTEGER DEFAULT 0,
  votes_innocent INTEGER DEFAULT 0,
  abstentions INTEGER DEFAULT 0,

  result VARCHAR(20),
  -- Values: 'correct' (Guilty + was Syndicate), 'incorrect' (Guilty + was Loyalist), 'dismissed' (Innocent)

  was_syndicate BOOLEAN,
  -- True if accused was actually Syndicate (for result calculation)

  accuser_statement TEXT,
  -- Accusation statement from accuser

  defense_statement TEXT,
  -- Defense statement from accused (NULL if didn't defend)

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_empires CHECK (accuser_id != accused_id)
);

-- Indexes
CREATE INDEX idx_accusations_game ON accusations(game_id);
CREATE INDEX idx_accusations_accuser ON accusations(accuser_id);
CREATE INDEX idx_accusations_accused ON accusations(accused_id);
CREATE INDEX idx_accusations_voting_end ON accusations(voting_end_turn);
```

### Accusation Votes Table

```sql
-- Track individual votes in accusation trials
CREATE TABLE IF NOT EXISTS accusation_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accusation_id UUID NOT NULL REFERENCES accusations(id) ON DELETE CASCADE,
  voter_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  vote VARCHAR(20) NOT NULL,
  -- Values: 'guilty', 'innocent', 'abstain'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(accusation_id, voter_empire_id)
  -- Each empire can only vote once per accusation
);

-- Indexes
CREATE INDEX idx_accusation_votes_accusation ON accusation_votes(accusation_id);
CREATE INDEX idx_accusation_votes_voter ON accusation_votes(voter_empire_id);
```

### Suspicious Events Table

```sql
-- Track observable suspicious events (intel feed for Loyalists)
CREATE TABLE IF NOT EXISTS suspicious_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,

  event_type VARCHAR(50) NOT NULL,
  -- Values: 'production_drop', 'market_crash', 'unexplained_attack', 'wmd_use',
  --         'intel_leak', 'civil_unrest', 'arms_embargo', 'economic_warfare'

  affected_empire_id UUID REFERENCES empires(id) ON DELETE SET NULL,
  -- Empire that was affected by the event

  suspected_empire_id UUID REFERENCES empires(id) ON DELETE SET NULL,
  -- Empire suspected of causing event (NULL until investigated)

  description TEXT NOT NULL,
  -- Human-readable description shown in Suspicious Activity Feed

  suspicion_increase INTEGER DEFAULT 0,
  -- Suspicion points added to suspect if investigated

  is_syndicate_action BOOLEAN NOT NULL DEFAULT false,
  -- True if event was caused by Syndicate contract (for validation, not shown to players)

  related_contract_id UUID REFERENCES syndicate_contracts(id) ON DELETE SET NULL,
  -- Link to contract if event was contract-related

  investigated_by UUID[],
  -- Array of empire IDs that have investigated this event

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suspicious_events_game ON suspicious_events(game_id);
CREATE INDEX idx_suspicious_events_turn ON suspicious_events(turn_number);
CREATE INDEX idx_suspicious_events_affected ON suspicious_events(affected_empire_id);
CREATE INDEX idx_suspicious_events_suspected ON suspicious_events(suspected_empire_id);
CREATE INDEX idx_suspicious_events_type ON suspicious_events(event_type);
```

### Coordinator Reports Table

```sql
-- Track Coordinator intel validation requests
CREATE TABLE IF NOT EXISTS coordinator_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,

  report_turn INTEGER NOT NULL,
  -- Turn when report was filed

  intel_cost INTEGER NOT NULL,
  -- Intel points spent (typically 15)

  credit_cost INTEGER NOT NULL,
  -- Credits spent (typically 5,000)

  was_correct BOOLEAN NOT NULL,
  -- True if target was actually Syndicate

  intel_revealed TEXT,
  -- What Coordinator told the reporter (contract preview if correct, denial if incorrect)

  funding_bonus_applied BOOLEAN DEFAULT false,
  -- True if permanent +10% funding bonus was applied

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_empires CHECK (reporter_id != target_id)
);

-- Indexes
CREATE INDEX idx_coordinator_reports_reporter ON coordinator_reports(reporter_id);
CREATE INDEX idx_coordinator_reports_target ON coordinator_reports(target_id);
CREATE INDEX idx_coordinator_reports_turn ON coordinator_reports(report_turn);
```

### Black Market Purchases Table

```sql
-- Track Black Market transactions for trust calculation
CREATE TABLE IF NOT EXISTS black_market_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  -- Values: 'component', 'advanced_system', 'wmd', 'intelligence_service'

  item_name VARCHAR(100) NOT NULL,
  -- Specific item purchased (e.g., 'emp_device', 'nuclear_warhead', 'spy_report')

  price_paid INTEGER NOT NULL,
  -- Credits spent

  trust_earned INTEGER NOT NULL,
  -- Trust points earned from purchase (+5 per 10,000 cr)

  suspicion_generated INTEGER DEFAULT 0,
  -- Suspicion generated if WMD

  turn_purchased INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_black_market_purchases_empire ON black_market_purchases(empire_id);
CREATE INDEX idx_black_market_purchases_turn ON black_market_purchases(turn_purchased);
CREATE INDEX idx_black_market_purchases_item_type ON black_market_purchases(item_type);
```

---

## Service Architecture

### SyndicateService (Complete Implementation)

```typescript
// src/lib/game/services/syndicate-service.ts

import { db } from "@/lib/db";
import { Empire, Game, SyndicateContract, Accusation, SuspiciousEvent } from "@/lib/types";

export interface ContractDefinition {
  type: string;
  name: string;
  tier: number;
  trustRequired: number;
  vpReward: number;
  creditReward: number;
  trustReward: number;
  suspicionGenerated: number;
  requiresTarget: boolean;
  description: string;
}

export interface TrustLevel {
  level: number;
  pointsRequired: number;
  title: string;
  blackMarketMultiplier: number;
  unlockedContracts: string[];
}

export class SyndicateService {
  /**
   * Assign loyalty roles to all empires at game creation
   * @spec REQ-SYND-001
   */
  async assignLoyaltyRoles(gameId: string): Promise<void> {
    const empires = await db.empire.findMany({
      where: { gameId },
      include: { bot: true }
    });

    const totalEmpires = empires.length;
    const syndicateCount = Math.max(1, Math.floor(totalEmpires * 0.10)); // 10% minimum 1

    // Calculate archetype weights
    const weighted: { empire: Empire; weight: number }[] = empires.map(empire => {
      const archetype = empire.bot?.archetype || 'balanced';
      let weight = 0.10; // baseline 10%

      switch (archetype) {
        case 'schemer': weight = 0.50; break;
        case 'opportunist': weight = 0.20; break;
        case 'diplomat': weight = 0.05; break;
        case 'turtle': weight = 0.05; break;
        default: weight = 0.10; break;
      }

      // Player first playthrough: always Loyalist
      if (!empire.isBot && !empire.hasPlayedBefore) {
        weight = 0;
      }

      return { empire, weight };
    });

    // Weighted random selection
    const syndicateEmpires: string[] = [];
    const pool = [...weighted];

    for (let i = 0; i < syndicateCount; i++) {
      const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < pool.length; j++) {
        random -= pool[j].weight;
        if (random <= 0) {
          syndicateEmpires.push(pool[j].empire.id);
          pool.splice(j, 1); // Remove from pool
          break;
        }
      }
    }

    // Assign roles
    await db.empire.updateMany({
      where: { gameId },
      data: { loyaltyRole: 'loyalist' }
    });

    await db.empire.updateMany({
      where: { id: { in: syndicateEmpires } },
      data: { loyaltyRole: 'syndicate' }
    });
  }

  /**
   * Generate 3 active contracts for Syndicate empire
   * @spec REQ-SYND-003
   */
  async generateContracts(empireId: string): Promise<SyndicateContract[]> {
    const empire = await db.empire.findUnique({
      where: { id: empireId },
      include: { game: true }
    });

    if (!empire || empire.loyaltyRole !== 'syndicate') {
      throw new Error('Empire is not Syndicate');
    }

    // Get existing active contracts
    const activeContracts = await db.syndicateContract.findMany({
      where: {
        empireId,
        status: 'active'
      }
    });

    const needed = 3 - activeContracts.length;
    if (needed <= 0) return activeContracts;

    // Get available contract types based on trust level
    const availableContracts = this.getAvailableContractTypes(empire.syndicateTrustLevel);

    // Get potential targets (exclude self)
    const potentialTargets = await db.empire.findMany({
      where: {
        gameId: empire.gameId,
        id: { not: empireId },
        eliminated: false
      }
    });

    // Generate new contracts
    const newContracts: SyndicateContract[] = [];
    for (let i = 0; i < needed; i++) {
      const contractDef = availableContracts[Math.floor(Math.random() * availableContracts.length)];
      const target = contractDef.requiresTarget
        ? potentialTargets[Math.floor(Math.random() * potentialTargets.length)]
        : null;

      const contract = await db.syndicateContract.create({
        data: {
          empireId,
          contractType: contractDef.type,
          contractTier: contractDef.tier,
          targetEmpireId: target?.id,
          syndicateVpReward: contractDef.vpReward,
          creditReward: contractDef.creditReward,
          trustReward: contractDef.trustReward,
          suspicionGenerated: contractDef.suspicionGenerated,
          assignedTurn: empire.game.currentTurn,
          status: 'active'
        }
      });

      newContracts.push(contract);
    }

    return [...activeContracts, ...newContracts];
  }

  /**
   * Complete a Syndicate contract
   * @spec REQ-SYND-003
   */
  async completeContract(contractId: string): Promise<{
    syndicateVp: number;
    credits: number;
    trust: number;
    suspicion: number;
  }> {
    const contract = await db.syndicateContract.findUnique({
      where: { id: contractId },
      include: {
        empire: { include: { game: true } },
        targetEmpire: true
      }
    });

    if (!contract || contract.status !== 'active') {
      throw new Error('Contract not found or not active');
    }

    // Execute contract effects (sabotage, manipulation, etc.)
    await this.executeContractEffects(contract);

    // Generate suspicious event
    await this.generateSuspiciousEvent(
      contract.empire.gameId,
      contract.contractType,
      contract.targetEmpireId || '',
      contract.empireId
    );

    // Update empire
    await db.empire.update({
      where: { id: contract.empireId },
      data: {
        syndicateVp: { increment: contract.syndicateVpReward },
        credits: { increment: contract.creditReward },
        syndicateTrustPoints: { increment: contract.trustReward },
        suspicionScore: { increment: contract.suspicionGenerated }
      }
    });

    // Recalculate trust level
    await this.updateTrustLevel(contract.empireId);

    // Mark contract completed
    await db.syndicateContract.update({
      where: { id: contractId },
      data: {
        status: 'completed',
        completedTurn: contract.empire.game.currentTurn
      }
    });

    // Check for revelation event
    await this.checkRevelationEvent(contract.empire.gameId);

    return {
      syndicateVp: contract.syndicateVpReward,
      credits: contract.creditReward,
      trust: contract.trustReward,
      suspicion: contract.suspicionGenerated
    };
  }

  /**
   * Increase trust and update level
   * @spec REQ-SYND-004
   */
  async increaseTrust(empireId: string, amount: number): Promise<number> {
    const empire = await db.empire.update({
      where: { id: empireId },
      data: {
        syndicateTrustPoints: { increment: amount }
      }
    });

    return this.updateTrustLevel(empireId);
  }

  /**
   * Update trust level based on points
   * @spec REQ-SYND-004
   */
  private async updateTrustLevel(empireId: string): Promise<number> {
    const empire = await db.empire.findUnique({ where: { id: empireId } });
    if (!empire) throw new Error('Empire not found');

    const trustLevels: TrustLevel[] = [
      { level: 0, pointsRequired: 0, title: 'Unknown', blackMarketMultiplier: 2.0, unlockedContracts: [] },
      { level: 1, pointsRequired: 100, title: 'Associate', blackMarketMultiplier: 2.0, unlockedContracts: ['tier1'] },
      { level: 2, pointsRequired: 500, title: 'Runner', blackMarketMultiplier: 1.75, unlockedContracts: ['tier1'] },
      { level: 3, pointsRequired: 1500, title: 'Soldier', blackMarketMultiplier: 1.5, unlockedContracts: ['tier1', 'tier2'] },
      { level: 4, pointsRequired: 3500, title: 'Captain', blackMarketMultiplier: 1.5, unlockedContracts: ['tier1', 'tier2'] },
      { level: 5, pointsRequired: 7000, title: 'Lieutenant', blackMarketMultiplier: 1.5, unlockedContracts: ['tier1', 'tier2'] },
      { level: 6, pointsRequired: 12000, title: 'Underboss', blackMarketMultiplier: 1.25, unlockedContracts: ['tier1', 'tier2', 'tier3'] },
      { level: 7, pointsRequired: 20000, title: 'Consigliere', blackMarketMultiplier: 1.25, unlockedContracts: ['tier1', 'tier2', 'tier3'] },
      { level: 8, pointsRequired: 35000, title: 'Syndicate Lord', blackMarketMultiplier: 1.25, unlockedContracts: ['tier1', 'tier2', 'tier3', 'tier4'] }
    ];

    let newLevel = 0;
    for (const level of trustLevels) {
      if (empire.syndicateTrustPoints >= level.pointsRequired) {
        newLevel = level.level;
      }
    }

    if (newLevel !== empire.syndicateTrustLevel) {
      await db.empire.update({
        where: { id: empireId },
        data: { syndicateTrustLevel: newLevel }
      });
    }

    return newLevel;
  }

  /**
   * Generate suspicious event for intel feed
   * @spec REQ-SYND-012
   */
  async generateSuspiciousEvent(
    gameId: string,
    eventType: string,
    affectedEmpireId: string,
    sourceEmpireId?: string
  ): Promise<SuspiciousEvent> {
    const game = await db.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error('Game not found');

    const description = this.getEventDescription(eventType, affectedEmpireId);

    return db.suspiciousEvent.create({
      data: {
        gameId,
        turnNumber: game.currentTurn,
        eventType,
        affectedEmpireId,
        suspectedEmpireId: sourceEmpireId || null,
        description,
        isSyndicateAction: !!sourceEmpireId,
        suspicionIncrease: this.getEventSuspicionValue(eventType)
      }
    });
  }

  /**
   * Create accusation trial
   * @spec REQ-SYND-007
   */
  async createAccusation(
    accuserId: string,
    accusedId: string,
    statement: string
  ): Promise<Accusation> {
    // Deduct Intel Points
    const accuser = await db.empire.update({
      where: { id: accuserId },
      data: { intelPoints: { decrement: 25 } }
    });

    if (accuser.intelPoints < 0) {
      throw new Error('Insufficient Intel Points');
    }

    const game = await db.game.findUnique({
      where: { id: accuser.gameId }
    });

    const accused = await db.empire.findUnique({
      where: { id: accusedId }
    });

    if (!accused) throw new Error('Accused empire not found');

    // Create accusation
    const accusation = await db.accusation.create({
      data: {
        gameId: accuser.gameId,
        accuserId,
        accusedId,
        accusationTurn: game!.currentTurn,
        votingEndTurn: game!.currentTurn + 3,
        accuserStatement: statement,
        wasSyndicate: accused.loyaltyRole === 'syndicate'
      }
    });

    // Galaxy-wide notification
    await this.broadcastAccusation(accusation);

    return accusation;
  }

  /**
   * Vote on accusation
   * @spec REQ-SYND-007
   */
  async voteOnAccusation(
    accusationId: string,
    voterId: string,
    vote: 'guilty' | 'innocent' | 'abstain'
  ): Promise<void> {
    await db.accusationVote.create({
      data: {
        accusationId,
        voterEmpireId: voterId,
        vote
      }
    });

    // Update vote counts
    await this.updateAccusationCounts(accusationId);
  }

  /**
   * Resolve accusation trial
   * @spec REQ-SYND-007
   */
  async resolveAccusation(accusationId: string): Promise<{
    result: 'correct' | 'incorrect' | 'dismissed';
    accuser: any;
    accused: any;
  }> {
    const accusation = await db.accusation.findUnique({
      where: { id: accusationId },
      include: {
        accuser: true,
        accused: true
      }
    });

    if (!accusation) throw new Error('Accusation not found');

    const totalVotes = accusation.votesGuilty + accusation.votesInnocent;
    const majority = totalVotes / 2;

    let result: 'correct' | 'incorrect' | 'dismissed';

    if (accusation.votesGuilty > majority) {
      // Majority voted guilty
      if (accusation.wasSyndicate) {
        result = 'correct';
        await this.applyCorrectAccusationEffects(accusation);
      } else {
        result = 'incorrect';
        await this.applyIncorrectAccusationEffects(accusation);
      }
    } else {
      result = 'dismissed';
      // No penalties
    }

    await db.accusation.update({
      where: { id: accusationId },
      data: { result }
    });

    return { result, accuser: accusation.accuser, accused: accusation.accused };
  }

  /**
   * Report to Coordinator
   * @spec REQ-SYND-008
   */
  async reportToCoordinator(
    reporterId: string,
    targetId: string
  ): Promise<{ wasCorrect: boolean; intelRevealed: string }> {
    // Deduct costs
    const reporter = await db.empire.update({
      where: { id: reporterId },
      data: {
        intelPoints: { decrement: 15 },
        credits: { decrement: 5000 }
      }
    });

    if (reporter.intelPoints < 0 || reporter.credits < 0) {
      throw new Error('Insufficient Intel Points or Credits');
    }

    const target = await db.empire.findUnique({
      where: { id: targetId }
    });

    if (!target) throw new Error('Target empire not found');

    const wasCorrect = target.loyaltyRole === 'syndicate';
    let intelRevealed: string;

    if (wasCorrect) {
      // Reveal next contract
      const nextContract = await db.syndicateContract.findFirst({
        where: {
          empireId: targetId,
          status: 'active'
        },
        orderBy: { assignedTurn: 'asc' }
      });

      intelRevealed = nextContract
        ? `Next contract: ${nextContract.contractType} targeting ${nextContract.targetEmpireId || 'unknown'}`
        : 'Target is Syndicate but has no active contracts';

      // Apply benefits
      await db.empire.update({
        where: { id: reporterId },
        data: {
          fundingBonusPercent: { increment: 10 },
          coordinatorStanding: { increment: 50 }
        }
      });
    } else {
      // Target is Loyalist - leak report
      intelRevealed = 'We found no evidence. Perhaps reconsider your sources.';

      await db.empire.update({
        where: { id: reporterId },
        data: {
          credits: { decrement: 10000 },
          coordinatorStanding: { decrement: 25 }
        }
      });

      // Notify target
      await this.notifyTargetOfFalseReport(targetId, reporterId);
    }

    await db.coordinatorReport.create({
      data: {
        reporterId,
        targetId,
        reportTurn: reporter.game.currentTurn,
        intelCost: 15,
        creditCost: 5000,
        wasCorrect,
        intelRevealed
      }
    });

    return { wasCorrect, intelRevealed };
  }

  /**
   * Betray Syndicate to Coordinator
   * @spec REQ-SYND-008
   */
  async betraySyndicate(empireId: string): Promise<void> {
    const empire = await db.empire.findUnique({
      where: { id: empireId }
    });

    if (!empire || empire.loyaltyRole !== 'syndicate') {
      throw new Error('Empire is not Syndicate');
    }

    // Apply benefits
    await db.empire.update({
      where: { id: empireId },
      data: {
        credits: { increment: 25000 },
        fundingBonusPercent: { increment: 25 },
        syndicateTrustLevel: 0,
        syndicateTrustPoints: 0,
        loyaltyRole: 'defector',
        coordinatorStanding: 100
      }
    });

    // Cancel all active contracts
    await db.syndicateContract.updateMany({
      where: {
        empireId,
        status: 'active'
      },
      data: { status: 'failed' }
    });

    // Mark for assassination attempts (handled in turn processor)
  }

  /**
   * Check Syndicate victory
   * @spec REQ-SYND-009
   */
  async checkSyndicateVictory(gameId: string): Promise<{
    winner: Empire | null;
    victoryType: 'shadow' | 'defiant' | 'chaos' | null;
  }> {
    const syndicateEmpires = await db.empire.findMany({
      where: {
        gameId,
        loyaltyRole: 'syndicate',
        eliminated: false
      }
    });

    for (const empire of syndicateEmpires) {
      // Contract Mastery: 3 VP
      if (empire.syndicateVp >= 3) {
        const victoryType = empire.isOuted ? 'defiant' : 'shadow';
        return { winner: empire, victoryType };
      }
    }

    // Chaos Victory: Turn 200 + 2 VP
    const game = await db.game.findUnique({ where: { id: gameId } });
    if (game && game.currentTurn >= 200) {
      for (const empire of syndicateEmpires) {
        if (empire.syndicateVp >= 2) {
          return { winner: empire, victoryType: 'chaos' };
        }
      }
    }

    return { winner: null, victoryType: null };
  }

  // Helper methods
  private getAvailableContractTypes(trustLevel: number): ContractDefinition[] {
    // Return contract definitions based on trust level
    // Implementation omitted for brevity
    return [];
  }

  private async executeContractEffects(contract: SyndicateContract): Promise<void> {
    // Execute contract-specific effects (sabotage, manipulation, etc.)
    // Implementation omitted for brevity
  }

  private async checkRevelationEvent(gameId: string): Promise<void> {
    // Check if "Shadow Emerges" event should trigger
    // Implementation omitted for brevity
  }

  private getEventDescription(eventType: string, affectedEmpireId: string): string {
    // Generate description for suspicious event
    // Implementation omitted for brevity
    return '';
  }

  private getEventSuspicionValue(eventType: string): number {
    // Return suspicion value for event type
    // Implementation omitted for brevity
    return 0;
  }

  private async broadcastAccusation(accusation: Accusation): Promise<void> {
    // Send galaxy-wide notification
    // Implementation omitted for brevity
  }

  private async updateAccusationCounts(accusationId: string): Promise<void> {
    // Recalculate vote counts
    // Implementation omitted for brevity
  }

  private async applyCorrectAccusationEffects(accusation: Accusation): Promise<void> {
    // Apply effects for correct accusation (Guilty + was Syndicate)
    // Implementation omitted for brevity
  }

  private async applyIncorrectAccusationEffects(accusation: Accusation): Promise<void> {
    // Apply effects for incorrect accusation (Guilty + was Loyalist)
    // Implementation omitted for brevity
  }

  private async notifyTargetOfFalseReport(targetId: string, reporterId: string): Promise<void> {
    // Notify target of false Coordinator report
    // Implementation omitted for brevity
  }
}
```

---

## Server Actions

### Syndicate Server Actions

```typescript
// src/app/actions/syndicate-actions.ts

"use server";

import { auth } from "@/lib/auth";
import { SyndicateService } from "@/lib/game/services/syndicate-service";
import { revalidatePath } from "next/cache";

/**
 * Accept a Syndicate contract
 * @spec REQ-SYND-003
 */
export async function acceptContractAction(contractId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const syndicateService = new SyndicateService();
    const result = await syndicateService.completeContract(contractId);

    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      data: result,
      message: `Contract completed! +${result.syndicateVp} VP, +${result.credits} credits, +${result.trust} trust`
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Create accusation trial
 * @spec REQ-SYND-007
 */
export async function accuseEmpireAction(
  accuserId: string,
  accusedId: string,
  statement: string
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const syndicateService = new SyndicateService();
    const accusation = await syndicateService.createAccusation(
      accuserId,
      accusedId,
      statement
    );

    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      data: accusation,
      message: `Accusation filed. Voting ends in 3 turns.`
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Vote on accusation trial
 * @spec REQ-SYND-007
 */
export async function voteOnAccusationAction(
  accusationId: string,
  voterId: string,
  vote: 'guilty' | 'innocent' | 'abstain'
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const syndicateService = new SyndicateService();
    await syndicateService.voteOnAccusation(accusationId, voterId, vote);

    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      message: `Vote submitted: ${vote}`
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Report to Coordinator for intel validation
 * @spec REQ-SYND-008
 */
export async function reportToCoordinatorAction(
  reporterId: string,
  targetId: string
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const syndicateService = new SyndicateService();
    const result = await syndicateService.reportToCoordinator(reporterId, targetId);

    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      data: result,
      message: result.intelRevealed
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Betray Syndicate to Coordinator
 * @spec REQ-SYND-008
 */
export async function betraySyndicateAction(empireId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const syndicateService = new SyndicateService();
    await syndicateService.betraySyndicate(empireId);

    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      message: "You have betrayed the Syndicate. The Coordinator welcomes you... but the Syndicate will not forget."
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Investigate suspicious event
 * @spec REQ-SYND-012
 */
export async function investigateEventAction(
  eventId: string,
  investigatorId: string
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Implementation
    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      message: "Investigation complete. Suspect identified."
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Purchase from Black Market
 * @spec REQ-SYND-005
 */
export async function purchaseBlackMarketItemAction(
  empireId: string,
  itemName: string,
  price: number
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Implementation
    revalidatePath("/game/[id]", "page");

    return {
      success: true,
      message: `Purchased ${itemName} from Black Market`
    };
  } catch (error) {
    return { error: error.message };
  }
}
```

---

## UI Components

### LoyaltyCardReveal Component

```typescript
// src/components/game/syndicate/LoyaltyCardReveal.tsx

"use client";

import { useState } from "react";
import { Empire } from "@/lib/types";

interface LoyaltyCardRevealProps {
  empire: Empire;
  onAcknowledge: () => void;
}

export function LoyaltyCardReveal({ empire, onAcknowledge }: LoyaltyCardRevealProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  if (!revealed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="max-w-md rounded-lg border-2 border-blue-500 bg-gray-900 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-blue-400">
            YOUR LOYALTY HAS BEEN ASSIGNED
          </h2>
          <p className="mb-6 text-gray-300">
            Click to reveal your role in this galaxy
          </p>
          <button
            onClick={handleReveal}
            className="rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Reveal Card
          </button>
        </div>
      </div>
    );
  }

  if (empire.loyaltyRole === 'syndicate') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="max-w-md rounded-lg border-2 border-red-500 bg-gray-900 p-8 text-center">
          <div className="mb-4 text-6xl">🔺</div>
          <h2 className="mb-4 text-2xl font-bold text-red-400">
            SYNDICATE
          </h2>
          <p className="mb-4 text-gray-300">
            You serve the Galactic Syndicate.
          </p>
          <div className="mb-6 text-left text-sm text-gray-400">
            <p className="mb-2"><strong>Your objective:</strong></p>
            <ul className="ml-4 list-disc">
              <li>Complete 3 contracts before Turn 200</li>
              <li>Access the Syndicate panel via the hidden menu</li>
              <li>Stay hidden. Trust no one.</li>
            </ul>
          </div>
          <button
            onClick={onAcknowledge}
            className="rounded bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
          >
            Acknowledge
          </button>
        </div>
      </div>
    );
  }

  // Loyalist
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="max-w-md rounded-lg border-2 border-blue-500 bg-gray-900 p-8 text-center">
        <div className="mb-4 text-6xl">🛡️</div>
        <h2 className="mb-4 text-2xl font-bold text-blue-400">
          LOYALIST
        </h2>
        <p className="mb-4 text-gray-300">
          You serve the Coordinator and the galactic peace.
        </p>
        <div className="mb-6 text-left text-sm text-gray-400">
          <p className="mb-2"><strong>Your objective:</strong></p>
          <ul className="ml-4 list-disc">
            <li>Win through standard victory conditions</li>
            <li>Watch for suspicious activity</li>
            <li>Expose Syndicate operatives</li>
            <li>Protect the galaxy.</li>
          </ul>
        </div>
        <button
          onClick={onAcknowledge}
          className="rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
```

### SyndicatePanel Component

```typescript
// src/components/game/syndicate/SyndicatePanel.tsx

"use client";

import { Empire, SyndicateContract } from "@/lib/types";
import { acceptContractAction } from "@/app/actions/syndicate-actions";

interface SyndicatePanelProps {
  empire: Empire;
  contracts: SyndicateContract[];
}

export function SyndicatePanel({ empire, contracts }: SyndicatePanelProps) {
  if (empire.loyaltyRole !== 'syndicate') {
    return null; // Hidden from Loyalists
  }

  const handleAcceptContract = async (contractId: string) => {
    const result = await acceptContractAction(contractId);
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="rounded-lg border-2 border-red-500 bg-gray-900 p-6">
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-bold text-red-400">SYNDICATE CONTRACTS</h2>
        <div className="text-sm text-gray-400">
          <span className="mr-4">Trust Level: {empire.syndicateTrustLevel}/8</span>
          <span>Suspicion: {empire.suspicionScore}/100</span>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-300">
        Progress: {empire.syndicateVp}/3 VP
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="rounded border border-red-700 bg-gray-800 p-4"
          >
            <h3 className="mb-2 font-bold text-red-300">
              {contract.contractType.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <div className="mb-2 text-sm text-gray-400">
              <p>Reward: {contract.syndicateVpReward} VP, {contract.creditReward} cr, +{contract.trustReward} trust</p>
              <p>Suspicion: {contract.suspicionGenerated}</p>
            </div>
            <button
              onClick={() => handleAcceptContract(contract.id)}
              className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Accept Contract
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button className="rounded bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">
          Black Market
        </button>
        <button className="rounded bg-gray-600 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700">
          Trust Progress
        </button>
      </div>
    </div>
  );
}
```

For complete UI component implementations, see individual component files in `src/components/game/syndicate/`.

---

## Bot AI

### SyndicateBotAI Class

```typescript
// src/lib/bots/syndicate-ai.ts

import { Empire, SyndicateContract, Accusation, GameState } from "@/lib/types";

export class SyndicateBotAI {
  /**
   * Select which contract to complete
   * @spec REQ-SYND-010
   */
  async selectContract(
    bot: Empire,
    availableContracts: SyndicateContract[],
    gameState: GameState
  ): Promise<SyndicateContract> {
    // Priority 1: Stay hidden if < 2 contracts complete
    if (bot.syndicateVp < 2) {
      const lowSuspicionContracts = availableContracts.filter(
        c => c.suspicionGenerated < 50
      );
      if (lowSuspicionContracts.length > 0) {
        return lowSuspicionContracts.sort(
          (a, b) => b.syndicateVpReward - a.syndicateVpReward
        )[0];
      }
    }

    // Priority 2: Go for victory if close
    if (bot.syndicateVp === 2) {
      return availableContracts.sort(
        (a, b) => b.syndicateVpReward - a.syndicateVpReward
      )[0];
    }

    // Priority 3: Target rivals
    const rivals = gameState.empires.filter(e => e.networth > bot.networth);
    const rivalContracts = availableContracts.filter(c =>
      rivals.some(r => r.id === c.targetEmpireId)
    );

    if (rivalContracts.length > 0) {
      return rivalContracts[0];
    }

    // Fallback: random contract
    return availableContracts[Math.floor(Math.random() * availableContracts.length)];
  }

  /**
   * Should bot reveal identity voluntarily?
   * @spec REQ-SYND-010
   */
  async shouldRevealIdentity(bot: Empire, gameState: GameState): Promise<boolean> {
    // Blitzkrieg archetype: "Go loud" early
    if (bot.archetype === 'blitzkrieg' && bot.syndicateVp >= 2) {
      return true;
    }

    // If suspicion is extreme (>90), might as well reveal
    if (bot.suspicionScore > 90 && bot.syndicateVp >= 2) {
      return true;
    }

    // Otherwise stay hidden
    return false;
  }

  /**
   * Should bot use WMD?
   * @spec REQ-SYND-010
   */
  async shouldUseWMD(
    bot: Empire,
    target: Empire,
    contract: SyndicateContract
  ): Promise<boolean> {
    // Only for Kingslayer or Scorched Earth contracts
    if (!['kingslayer', 'scorched_earth'].includes(contract.contractType)) {
      return false;
    }

    // Only if target is #1 ranked
    if (target.rank !== 1) {
      return false;
    }

    // Only if bot has 2 VP (going for win)
    if (bot.syndicateVp < 2) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate suspicion of target
   * @spec REQ-SYND-010
   */
  async evaluateSuspicion(
    bot: Empire,
    target: Empire,
    events: SuspiciousEvent[]
  ): Promise<number> {
    let suspicion = 0;

    // Count events affecting target or caused by target
    const relevantEvents = events.filter(
      e => e.affectedEmpireId === target.id || e.suspectedEmpireId === target.id
    );

    suspicion += relevantEvents.length * 10;

    // Known suspicion score (if investigated)
    suspicion += target.suspicionScore * 0.5;

    // Archetype bias
    if (target.archetype === 'schemer') {
      suspicion += 20; // Schemers always suspect
    }

    return Math.min(suspicion, 100);
  }

  /**
   * Should bot accuse target?
   * @spec REQ-SYND-010
   */
  async shouldAccuse(
    bot: Empire,
    target: Empire,
    suspicionScore: number
  ): Promise<boolean> {
    // Turtle never accuses
    if (bot.archetype === 'turtle') {
      return false;
    }

    // Diplomat accuses aggressively
    if (bot.archetype === 'diplomat') {
      return suspicionScore > 40 && bot.intelPoints >= 25;
    }

    // Warlord only accuses if very confident
    if (bot.archetype === 'warlord') {
      return suspicionScore > 70 && bot.intelPoints >= 25;
    }

    // Schemer (Loyalist) rarely accuses despite being suspicious
    if (bot.archetype === 'schemer' && bot.loyaltyRole === 'loyalist') {
      return suspicionScore > 80 && bot.intelPoints >= 25;
    }

    // Default threshold
    return suspicionScore > 60 && bot.intelPoints >= 25;
  }

  /**
   * Vote on accusation trial
   * @spec REQ-SYND-010
   */
  async voteOnAccusation(
    bot: Empire,
    accusation: Accusation,
    accused: Empire
  ): Promise<'guilty' | 'innocent' | 'abstain'> {
    const suspicion = await this.evaluateSuspicion(bot, accused, []);

    // High suspicion: vote guilty
    if (suspicion > 70) {
      return 'guilty';
    }

    // Low suspicion: vote innocent
    if (suspicion < 30) {
      return 'innocent';
    }

    // Medium suspicion: abstain
    return 'abstain';
  }
}
```

---

## Trust and Suspicion

### Trust Level Definitions

```typescript
// src/lib/game/constants/syndicate-trust.ts

export interface TrustLevel {
  level: number;
  pointsRequired: number;
  title: string;
  blackMarketMultiplier: number;
  unlockedTiers: number[];
}

export const TRUST_LEVELS: TrustLevel[] = [
  {
    level: 0,
    pointsRequired: 0,
    title: "Unknown",
    blackMarketMultiplier: 2.0,
    unlockedTiers: []
  },
  {
    level: 1,
    pointsRequired: 100,
    title: "Associate",
    blackMarketMultiplier: 2.0,
    unlockedTiers: [1]
  },
  {
    level: 2,
    pointsRequired: 500,
    title: "Runner",
    blackMarketMultiplier: 1.75,
    unlockedTiers: [1]
  },
  {
    level: 3,
    pointsRequired: 1500,
    title: "Soldier",
    blackMarketMultiplier: 1.5,
    unlockedTiers: [1, 2]
  },
  {
    level: 4,
    pointsRequired: 3500,
    title: "Captain",
    blackMarketMultiplier: 1.5,
    unlockedTiers: [1, 2]
  },
  {
    level: 5,
    pointsRequired: 7000,
    title: "Lieutenant",
    blackMarketMultiplier: 1.5,
    unlockedTiers: [1, 2]
  },
  {
    level: 6,
    pointsRequired: 12000,
    title: "Underboss",
    blackMarketMultiplier: 1.25,
    unlockedTiers: [1, 2, 3]
  },
  {
    level: 7,
    pointsRequired: 20000,
    title: "Consigliere",
    blackMarketMultiplier: 1.25,
    unlockedTiers: [1, 2, 3]
  },
  {
    level: 8,
    pointsRequired: 35000,
    title: "Syndicate Lord",
    blackMarketMultiplier: 1.25,
    unlockedTiers: [1, 2, 3, 4]
  }
];

export function getTrustLevel(points: number): TrustLevel {
  for (let i = TRUST_LEVELS.length - 1; i >= 0; i--) {
    if (points >= TRUST_LEVELS[i].pointsRequired) {
      return TRUST_LEVELS[i];
    }
  }
  return TRUST_LEVELS[0];
}
```

### Suspicion Calculation Formula

```typescript
// src/lib/game/services/suspicion-calculator.ts

export class SuspicionCalculator {
  /**
   * Calculate total suspicion score
   * @spec REQ-SYND-006
   */
  static calculateSuspicion(
    contractSuspicion: number[],
    investigationModifier: number = 1.0
  ): number {
    const baseSuspicion = contractSuspicion.reduce((sum, val) => sum + val, 0);
    const total = baseSuspicion * investigationModifier;
    return Math.min(Math.max(total, 0), 100); // Clamp 0-100
  }

  /**
   * Get suspicion reduction for action
   * @spec REQ-SYND-006
   */
  static getReductionAmount(action: string): number {
    switch (action) {
      case 'clean_turns': return -10; // 5 turns without contracts
      case 'alliance': return -5; // Per active treaty
      case 'legitimate_battle': return -15; // Win battle without Syndicate help
      case 'public_charity': return -20; // Donate resources
      default: return 0;
    }
  }

  /**
   * Get trigger effects at suspicion threshold
   * @spec REQ-SYND-006
   */
  static getTriggerEffects(suspicionScore: number): {
    botAccusationChance: number;
    coalitionFormation: boolean;
    coordinatorMonitoring: boolean;
    accusationSuccessBonus: number;
  } {
    if (suspicionScore >= 76) {
      return {
        botAccusationChance: 0.40, // 40% chance per turn
        coalitionFormation: true,
        coordinatorMonitoring: true,
        accusationSuccessBonus: 0.20 // +20% to guilty votes
      };
    } else if (suspicionScore >= 51) {
      return {
        botAccusationChance: 0.20, // 20% chance per turn
        coalitionFormation: true,
        coordinatorMonitoring: false,
        accusationSuccessBonus: 0.10 // +10% to guilty votes
      };
    } else if (suspicionScore >= 26) {
      return {
        botAccusationChance: 0.05, // 5% chance per turn
        coalitionFormation: false,
        coordinatorMonitoring: false,
        accusationSuccessBonus: 0
      };
    }

    return {
      botAccusationChance: 0,
      coalitionFormation: false,
      coordinatorMonitoring: false,
      accusationSuccessBonus: 0
    };
  }
}
```

---

## Contract Catalog

Complete contract definitions with all tiers.

```typescript
// src/lib/game/constants/syndicate-contracts.ts

export interface ContractDefinition {
  type: string;
  name: string;
  tier: number;
  trustRequired: number;
  vpReward: number;
  creditReward: number;
  trustReward: number;
  suspicionGenerated: number;
  requiresTarget: boolean;
  description: string;
}

export const SYNDICATE_CONTRACTS: ContractDefinition[] = [
  // TIER 1: Covert Operations (Trust 0-2)
  {
    type: 'sabotage_production',
    name: 'Sabotage Production',
    tier: 1,
    trustRequired: 0,
    vpReward: 1,
    creditReward: 15000,
    trustReward: 15,
    suspicionGenerated: 15,
    requiresTarget: true,
    description: 'Reduce target empire\'s resource output by 20% for 3 turns'
  },
  {
    type: 'insurgent_aid',
    name: 'Insurgent Aid',
    tier: 1,
    trustRequired: 0,
    vpReward: 1,
    creditReward: 10000,
    trustReward: 10,
    suspicionGenerated: 10,
    requiresTarget: true,
    description: 'Support rebels in target empire (civil status -1)'
  },
  {
    type: 'market_manipulation',
    name: 'Market Manipulation',
    tier: 1,
    trustRequired: 0,
    vpReward: 1,
    creditReward: 20000,
    trustReward: 20,
    suspicionGenerated: 35,
    requiresTarget: false,
    description: 'Crash specific resource price by 30%'
  },
  {
    type: 'pirate_raid',
    name: 'Pirate Raid',
    tier: 1,
    trustRequired: 0,
    vpReward: 1,
    creditReward: 8000,
    trustReward: 10,
    suspicionGenerated: 5,
    requiresTarget: true,
    description: 'Use NPC pirates as cover for guerrilla attack'
  },

  // TIER 2: Strategic Disruption (Trust 3-5)
  {
    type: 'intelligence_leak',
    name: 'Intelligence Leak',
    tier: 2,
    trustRequired: 3,
    vpReward: 1,
    creditReward: 25000,
    trustReward: 30,
    suspicionGenerated: 40,
    requiresTarget: true,
    description: 'Reveal target\'s research/tech to all empires'
  },
  {
    type: 'arms_embargo',
    name: 'Arms Embargo',
    tier: 2,
    trustRequired: 3,
    vpReward: 2,
    creditReward: 35000,
    trustReward: 40,
    suspicionGenerated: 65,
    requiresTarget: true,
    description: 'Prevent target from building units for 2 turns'
  },
  {
    type: 'false_flag_operation',
    name: 'False Flag Operation',
    tier: 2,
    trustRequired: 3,
    vpReward: 2,
    creditReward: 50000,
    trustReward: 45,
    suspicionGenerated: 20,
    requiresTarget: true,
    description: 'Make Empire A attack Empire B'
  },
  {
    type: 'economic_warfare',
    name: 'Economic Warfare',
    tier: 2,
    trustRequired: 3,
    vpReward: 1,
    creditReward: 30000,
    trustReward: 35,
    suspicionGenerated: 70,
    requiresTarget: true,
    description: 'Destroy 25% of target\'s resource stockpiles'
  },

  // TIER 3: High-Risk Operations (Trust 6-7)
  {
    type: 'coup_detat',
    name: 'Coup d\'État',
    tier: 3,
    trustRequired: 6,
    vpReward: 2,
    creditReward: 75000,
    trustReward: 60,
    suspicionGenerated: 80,
    requiresTarget: true,
    description: 'Cause civil revolt (civil status = Rioting)'
  },
  {
    type: 'assassination',
    name: 'Assassination',
    tier: 3,
    trustRequired: 6,
    vpReward: 2,
    creditReward: 60000,
    trustReward: 55,
    suspicionGenerated: 85,
    requiresTarget: true,
    description: 'Kill target\'s general (if generals exist)'
  },
  {
    type: 'kingslayer',
    name: 'Kingslayer',
    tier: 3,
    trustRequired: 6,
    vpReward: 3,
    creditReward: 150000,
    trustReward: 100,
    suspicionGenerated: 95,
    requiresTarget: true,
    description: 'Eliminate the #1 ranked empire'
  },
  {
    type: 'scorched_earth',
    name: 'Scorched Earth',
    tier: 3,
    trustRequired: 6,
    vpReward: 3,
    creditReward: 100000,
    trustReward: 80,
    suspicionGenerated: 100,
    requiresTarget: true,
    description: 'Deploy WMD against target (50% population loss)'
  },

  // TIER 4: Endgame Contracts (Trust 8)
  {
    type: 'proxy_war',
    name: 'Proxy War',
    tier: 4,
    trustRequired: 8,
    vpReward: 2,
    creditReward: 100000,
    trustReward: 70,
    suspicionGenerated: 45,
    requiresTarget: false,
    description: 'Force two top empires into war'
  },
  {
    type: 'the_equalizer',
    name: 'The Equalizer',
    tier: 4,
    trustRequired: 8,
    vpReward: 3,
    creditReward: 125000,
    trustReward: 100,
    suspicionGenerated: 90,
    requiresTarget: false,
    description: 'Sabotage all Top 10% empires simultaneously'
  },
  {
    type: 'shadow_victory',
    name: 'Shadow Victory',
    tier: 4,
    trustRequired: 8,
    vpReward: 5,
    creditReward: 0,
    trustReward: 0,
    suspicionGenerated: 0,
    requiresTarget: false,
    description: 'Complete 3 contracts while remaining undetected (instant win)'
  }
];
```

---

## Black Market

Complete Black Market catalog.

```typescript
// src/lib/game/constants/black-market.ts

export interface BlackMarketItem {
  id: string;
  category: 'component' | 'advanced_system' | 'wmd' | 'intelligence';
  name: string;
  basePrice: number;
  trustRequired: number;
  suspicionGenerated: number;
  effect: string;
}

export const BLACK_MARKET_CATALOG: BlackMarketItem[] = [
  // Components (Trust 1+)
  {
    id: 'electronics',
    category: 'component',
    name: 'Electronics',
    basePrice: 1000,
    trustRequired: 1,
    suspicionGenerated: 0,
    effect: 'Skip crafting queue'
  },
  {
    id: 'armor_plating',
    category: 'component',
    name: 'Armor Plating',
    basePrice: 1250,
    trustRequired: 1,
    suspicionGenerated: 0,
    effect: 'Skip crafting queue'
  },
  {
    id: 'propulsion_units',
    category: 'component',
    name: 'Propulsion Units',
    basePrice: 1100,
    trustRequired: 1,
    suspicionGenerated: 0,
    effect: 'Skip crafting queue'
  },
  {
    id: 'targeting_arrays',
    category: 'component',
    name: 'Targeting Arrays',
    basePrice: 2000,
    trustRequired: 3,
    suspicionGenerated: 0,
    effect: 'Skip crafting queue'
  },
  {
    id: 'stealth_composites',
    category: 'component',
    name: 'Stealth Composites',
    basePrice: 2500,
    trustRequired: 3,
    suspicionGenerated: 0,
    effect: 'Skip crafting queue'
  },
  {
    id: 'quantum_processors',
    category: 'component',
    name: 'Quantum Processors',
    basePrice: 4000,
    trustRequired: 4,
    suspicionGenerated: 0,
    effect: 'Skip crafting queue'
  },

  // Advanced Systems (Trust 5+)
  {
    id: 'reactor_cores',
    category: 'advanced_system',
    name: 'Reactor Cores',
    basePrice: 10000,
    trustRequired: 5,
    suspicionGenerated: 0,
    effect: 'Advanced ship system'
  },
  {
    id: 'shield_generators',
    category: 'advanced_system',
    name: 'Shield Generators',
    basePrice: 12000,
    trustRequired: 5,
    suspicionGenerated: 0,
    effect: 'Advanced ship system'
  },
  {
    id: 'cloaking_device',
    category: 'advanced_system',
    name: 'Cloaking Device',
    basePrice: 20000,
    trustRequired: 5,
    suspicionGenerated: 10,
    effect: 'Hide ship from detection'
  },
  {
    id: 'warp_drives',
    category: 'advanced_system',
    name: 'Warp Drives',
    basePrice: 25000,
    trustRequired: 6,
    suspicionGenerated: 0,
    effect: 'Faster travel'
  },

  // Restricted Weapons (Trust 6+)
  {
    id: 'emp_device',
    category: 'wmd',
    name: 'EMP Device',
    basePrice: 50000,
    trustRequired: 6,
    suspicionGenerated: 60,
    effect: 'Disable enemy defenses for 3 turns'
  },
  {
    id: 'chemical_weapon',
    category: 'wmd',
    name: 'Chemical Weapon',
    basePrice: 75000,
    trustRequired: 6,
    suspicionGenerated: 80,
    effect: 'Kill 25% of target population'
  },
  {
    id: 'nuclear_warhead',
    category: 'wmd',
    name: 'Nuclear Warhead',
    basePrice: 100000,
    trustRequired: 7,
    suspicionGenerated: 95,
    effect: 'Destroy 50% of sector production'
  },
  {
    id: 'bioweapon_canister',
    category: 'wmd',
    name: 'Bioweapon Canister',
    basePrice: 150000,
    trustRequired: 8,
    suspicionGenerated: 100,
    effect: 'Kill 75% of target population'
  },

  // Intelligence Services (Trust 2+)
  {
    id: 'spy_report',
    category: 'intelligence',
    name: 'Spy Report',
    basePrice: 5000,
    trustRequired: 2,
    suspicionGenerated: 0,
    effect: 'Reveal target resources/military'
  },
  {
    id: 'research_espionage',
    category: 'intelligence',
    name: 'Research Espionage',
    basePrice: 5000,
    trustRequired: 2,
    suspicionGenerated: 0,
    effect: 'Reveal specialization (85% success)'
  },
  {
    id: 'tech_espionage',
    category: 'intelligence',
    name: 'Tech Espionage',
    basePrice: 15000,
    trustRequired: 3,
    suspicionGenerated: 0,
    effect: 'Reveal research progress %'
  },
  {
    id: 'diplomatic_intel',
    category: 'intelligence',
    name: 'Diplomatic Intel',
    basePrice: 10000,
    trustRequired: 3,
    suspicionGenerated: 0,
    effect: 'Reveal treaties/alliances'
  },
  {
    id: 'future_intel',
    category: 'intelligence',
    name: 'Future Intel',
    basePrice: 25000,
    trustRequired: 5,
    suspicionGenerated: 0,
    effect: 'See planned actions next turn'
  }
];
```

---

## Bot Messages

### Syndicate Bot Message Templates

```typescript
// src/lib/bots/messaging/syndicate-messages.ts

export const SYNDICATE_BOT_MESSAGES = {
  // Syndicate bot hints (when Syndicate)
  syndicate_early: [
    "I've found... alternative revenue streams.",
    "There's more than one way to build an empire.",
    "The shadows hold opportunities the light cannot offer."
  ],

  syndicate_mid: [
    "The market crash? Unfortunate. For some.",
    "Power doesn't come from territories alone.",
    "I serve interests beyond your comprehension."
  ],

  syndicate_late: [
    "You focus on the map. I focus on the game.",
    "While you fought over sectors, I moved unseen.",
    "The Syndicate rewards those who think differently."
  ],

  syndicate_outed: [
    "Yes, I serve the Syndicate. What of it?",
    "You've exposed me. But can you stop me?",
    "Being outed just makes this more interesting."
  ],

  // Loyalist suspicions
  loyalist_diplomat_suspicious: [
    "Your production dropped without explanation. Should I be concerned about your... loyalties?",
    "I've been monitoring the intel feed. Your name appears frequently.",
    "Let's discuss this recent market anomaly. You were involved, weren't you?"
  ],

  loyalist_warlord_suspicious: [
    "If you're Syndicate, there won't be a trial. Just fire.",
    "I don't trust anyone. But you especially.",
    "Explain the production drop. Now."
  ],

  loyalist_turtle_suspicious: [
    "I defend against external threats. But internal threats are harder to see.",
    "Your actions concern me, but I won't accuse without proof.",
    "Something's not right. But I'll keep watching."
  ],

  // Schemer Paradox
  schemer_loyalist: [
    "Everyone suspects me. I'm used to it. But I assure you, I'm on the right side. This time.",
    "You think I'm Syndicate? You're not the first to think that.",
    "Let them suspect. I know my loyalty, even if they don't."
  ],

  schemer_syndicate: [
    "Let them suspect. Suspicion is cheap. Proof is expensive.",
    "You're all so predictable. Keep guessing.",
    "The more you suspect me, the less you see."
  ],

  // Coalition coordination
  coalition_stop_syndicate: [
    "We need to coordinate. The Syndicate is among us.",
    "I propose a 'Stop the Syndicate' coalition. Who's with me?",
    "Together we can root out the traitors."
  ],

  // Accusation defenses
  defense_innocent: [
    "This is baseless paranoia. I've done nothing wrong.",
    "You accuse me without evidence. This is slander.",
    "I serve the Coordinator. Always have, always will."
  ],

  defense_guilty: [
    "Prove it. You can't.",
    "This accusation is a distraction from the real threats.",
    "You're grasping at straws."
  ],

  // Victory/defeat acknowledgment
  syndicate_victory: [
    "The shadows have won. You never saw me coming.",
    "While you fought over territory, I achieved true power.",
    "The Syndicate's victory was inevitable."
  ],

  loyalist_victory: [
    "The Syndicate has been defeated. The galaxy is safe.",
    "We've rooted out the corruption. Victory is ours.",
    "Justice prevails."
  ]
};
```

---

**END APPENDIX**
