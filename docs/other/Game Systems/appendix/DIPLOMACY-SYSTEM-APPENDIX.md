# Diplomacy System - Appendix

**Parent Document:** [DIPLOMACY-SYSTEM.md](../DIPLOMACY-SYSTEM.md)
**Purpose:** Implementation code examples, database schemas, and service architecture for the diplomacy system.

---

## Table of Contents

- [A. Database Schema](#a-database-schema)
- [B. Service Architecture](#b-service-architecture)
- [C. Server Actions](#c-server-actions)
- [D. UI Components](#d-ui-components)
- [E. Bot Decision Engine](#e-bot-decision-engine)
- [F. Message Templates](#f-message-templates)

---

## A. Database Schema

### A.1 Treaties Table

```sql
-- Treaties between empires
CREATE TABLE treaties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_a_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  empire_b_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  treaty_type TEXT NOT NULL CHECK (treaty_type IN ('NAP', 'ALLIANCE')),
  created_turn INTEGER NOT NULL,
  expires_turn INTEGER NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'broken', 'expired', 'cancelled')),
  broken_by_empire_id UUID REFERENCES empires(id),
  broken_turn INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure empire_a_id < empire_b_id for consistent ordering
  CONSTRAINT empire_ordering CHECK (empire_a_id < empire_b_id),
  -- Prevent duplicate treaties
  CONSTRAINT unique_treaty UNIQUE (empire_a_id, empire_b_id, treaty_type, status)
);

-- Indexes for performance
CREATE INDEX idx_treaties_empire_a ON treaties(empire_a_id) WHERE status = 'active';
CREATE INDEX idx_treaties_empire_b ON treaties(empire_b_id) WHERE status = 'active';
CREATE INDEX idx_treaties_status ON treaties(status);
CREATE INDEX idx_treaties_expiration ON treaties(expires_turn) WHERE status = 'active';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_treaties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER treaties_updated_at
  BEFORE UPDATE ON treaties
  FOR EACH ROW
  EXECUTE FUNCTION update_treaties_updated_at();
```

### A.2 Coalitions Table

```sql
-- Coalitions of multiple empires
CREATE TABLE coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal TEXT NOT NULL, -- "Defeat The Warlord Empire", "Defensive Pact", etc.
  created_turn INTEGER NOT NULL,
  dissolved_turn INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dissolved', 'victory', 'defeated')),
  is_anti_snowball BOOLEAN DEFAULT false, -- true if auto-formed at 7 VP
  target_empire_id UUID REFERENCES empires(id), -- target of anti-snowball coalition
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coalition membership
CREATE TABLE coalition_members (
  coalition_id UUID REFERENCES coalitions(id) ON DELETE CASCADE,
  empire_id UUID REFERENCES empires(id) ON DELETE CASCADE,
  joined_turn INTEGER NOT NULL,
  left_turn INTEGER,
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'betrayed')),
  betrayed_turn INTEGER, -- if status = 'betrayed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (coalition_id, empire_id)
);

-- Coalition chat messages
CREATE TABLE coalition_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coalition_id UUID NOT NULL REFERENCES coalitions(id) ON DELETE CASCADE,
  sender_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'vote', 'coordination')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coalition_members_empire ON coalition_members(empire_id) WHERE status = 'active';
CREATE INDEX idx_coalition_members_coalition ON coalition_members(coalition_id) WHERE status = 'active';
CREATE INDEX idx_coalition_messages_coalition ON coalition_messages(coalition_id);
CREATE INDEX idx_coalition_messages_turn ON coalition_messages(turn_number);
```

### A.3 Reputation Scores Table

```sql
-- Empire-to-empire reputation tracking
CREATE TABLE reputation_scores (
  empire_id UUID REFERENCES empires(id) ON DELETE CASCADE,
  target_empire_id UUID REFERENCES empires(id) ON DELETE CASCADE,
  reputation INTEGER DEFAULT 0 CHECK (reputation >= -100 AND reputation <= 100),
  permanent_scar INTEGER DEFAULT 0 CHECK (permanent_scar <= 0), -- Always negative or 0
  last_updated_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (empire_id, target_empire_id),

  -- Cannot have reputation with self
  CONSTRAINT no_self_reputation CHECK (empire_id != target_empire_id)
);

-- Indexes
CREATE INDEX idx_reputation_empire ON reputation_scores(empire_id);
CREATE INDEX idx_reputation_target ON reputation_scores(target_empire_id);
CREATE INDEX idx_reputation_score ON reputation_scores(reputation) WHERE reputation < 0; -- Find hostile empires

-- Trigger for updated_at
CREATE TRIGGER reputation_updated_at
  BEFORE UPDATE ON reputation_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_treaties_updated_at();
```

### A.4 Trust Scores Table

```sql
-- Calculated trust scores with decay
CREATE TABLE trust_scores (
  empire_id UUID REFERENCES empires(id) ON DELETE CASCADE,
  target_empire_id UUID REFERENCES empires(id) ON DELETE CASCADE,
  base_trust INTEGER DEFAULT 0, -- From reputation
  recent_interactions INTEGER DEFAULT 0, -- Weighted recent events
  archetype_modifier INTEGER DEFAULT 0, -- Bot personality adjustment
  calculated_trust INTEGER GENERATED ALWAYS AS (base_trust + (recent_interactions * 2) + archetype_modifier) STORED,
  last_interaction_turn INTEGER,
  last_decay_turn INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (empire_id, target_empire_id),

  CONSTRAINT no_self_trust CHECK (empire_id != target_empire_id)
);

-- Indexes
CREATE INDEX idx_trust_empire ON trust_scores(empire_id);
CREATE INDEX idx_trust_calculated ON trust_scores(calculated_trust);
```

### A.5 Diplomatic Events Log

```sql
-- Historical log of all diplomatic actions
CREATE TABLE diplomatic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_number INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'treaty_proposed', 'treaty_accepted', 'treaty_rejected', 'treaty_broken',
    'treaty_expired', 'coalition_formed', 'coalition_joined', 'coalition_left',
    'coalition_betrayed', 'coalition_dissolved', 'reputation_gained', 'reputation_lost',
    'trust_increased', 'trust_decreased'
  )),
  actor_empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  target_empire_id UUID REFERENCES empires(id) ON DELETE CASCADE,
  coalition_id UUID REFERENCES coalitions(id) ON DELETE SET NULL,
  treaty_id UUID REFERENCES treaties(id) ON DELETE SET NULL,
  details JSONB, -- Additional context
  reputation_change INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX idx_diplomatic_events_turn ON diplomatic_events(turn_number);
CREATE INDEX idx_diplomatic_events_actor ON diplomatic_events(actor_empire_id);
CREATE INDEX idx_diplomatic_events_target ON diplomatic_events(target_empire_id);
CREATE INDEX idx_diplomatic_events_type ON diplomatic_events(event_type);
CREATE INDEX idx_diplomatic_events_created ON diplomatic_events(created_at);
```

### A.6 Empire Extensions

```sql
-- Add diplomacy-related columns to empires table
ALTER TABLE empires ADD COLUMN IF NOT EXISTS pariah_until_turn INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS betrayal_count INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS alliance_count INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS coalition_count INTEGER DEFAULT 0;

-- Track when empire became leader (7+ VP)
ALTER TABLE empires ADD COLUMN IF NOT EXISTS became_leader_turn INTEGER;
ALTER TABLE empires ADD COLUMN IF NOT EXISTS is_coalition_target BOOLEAN DEFAULT false;
```

---

## B. Service Architecture

### B.1 Treaty Service

```typescript
// src/lib/diplomacy/treaties.ts

import { db } from '@/lib/db';
import { treaties, empires, reputationScores } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

export type TreatyType = 'NAP' | 'ALLIANCE';
export type TreatyStatus = 'active' | 'broken' | 'expired' | 'cancelled';

export interface TreatyConfig {
  minDuration: {
    NAP: number;
    ALLIANCE: number;
  };
  reputationRequirement: {
    NAP: number;
    ALLIANCE: number;
  };
  breakPenalty: {
    NAP: number;
    ALLIANCE: number;
  };
}

export const TREATY_CONFIG: TreatyConfig = {
  minDuration: {
    NAP: 20,
    ALLIANCE: 30,
  },
  reputationRequirement: {
    NAP: 0,
    ALLIANCE: 20,
  },
  breakPenalty: {
    NAP: -15,
    ALLIANCE: -25,
  },
};

/**
 * Treaty management service
 * @spec REQ-DIP-001, REQ-DIP-007
 */
export class TreatyService {
  /**
   * Propose a treaty between two empires
   * @spec REQ-DIP-001
   */
  async proposeTreaty(
    proposerEmpireId: string,
    targetEmpireId: string,
    treatyType: TreatyType,
    currentTurn: number
  ): Promise<{ success: boolean; error?: string }> {
    // Validate reputation requirement
    const reputation = await this.getReputation(proposerEmpireId, targetEmpireId);
    const required = TREATY_CONFIG.reputationRequirement[treatyType];

    if (reputation < required) {
      return {
        success: false,
        error: `Insufficient reputation. Required: ${required}, Current: ${reputation}`,
      };
    }

    // Check if proposer is in pariah status
    const proposer = await db.query.empires.findFirst({
      where: eq(empires.id, proposerEmpireId),
    });

    if (proposer && proposer.pariahUntilTurn && proposer.pariahUntilTurn > currentTurn) {
      return {
        success: false,
        error: `Pariah status active until turn ${proposer.pariahUntilTurn}`,
      };
    }

    // Check for existing active treaty
    const existingTreaty = await this.getActiveTreaty(proposerEmpireId, targetEmpireId, treatyType);
    if (existingTreaty) {
      return { success: false, error: 'Treaty already exists' };
    }

    // For ALLIANCE, check if NAP exists or reputation high enough
    if (treatyType === 'ALLIANCE') {
      const hasNAP = await this.getActiveTreaty(proposerEmpireId, targetEmpireId, 'NAP');
      if (!hasNAP && reputation < 20) {
        return { success: false, error: 'NAP required first or reputation >= 20' };
      }
    }

    // Create treaty proposal (stored in diplomatic_events as 'treaty_proposed')
    await this.logDiplomaticEvent({
      turnNumber: currentTurn,
      eventType: 'treaty_proposed',
      actorEmpireId: proposerEmpireId,
      targetEmpireId,
      details: { treatyType },
    });

    return { success: true };
  }

  /**
   * Accept a treaty proposal
   * @spec REQ-DIP-001
   */
  async acceptTreaty(
    acceptorEmpireId: string,
    proposerEmpireId: string,
    treatyType: TreatyType,
    currentTurn: number
  ): Promise<{ success: boolean; treatyId?: string }> {
    // Order empire IDs consistently
    const [empireA, empireB] = this.orderEmpireIds(proposerEmpireId, acceptorEmpireId);

    const duration = TREATY_CONFIG.minDuration[treatyType];
    const expiresTurn = currentTurn + duration;

    const [treaty] = await db
      .insert(treaties)
      .values({
        empireAId: empireA,
        empireBId: empireB,
        treatyType,
        createdTurn: currentTurn,
        expiresTurn,
        status: 'active',
        autoRenew: true,
      })
      .returning();

    // Log acceptance event
    await this.logDiplomaticEvent({
      turnNumber: currentTurn,
      eventType: 'treaty_accepted',
      actorEmpireId: acceptorEmpireId,
      targetEmpireId: proposerEmpireId,
      treatyId: treaty.id,
      details: { treatyType },
    });

    // Small reputation bonus for forming treaty
    await this.changeReputation(acceptorEmpireId, proposerEmpireId, 1, currentTurn);
    await this.changeReputation(proposerEmpireId, acceptorEmpireId, 1, currentTurn);

    return { success: true, treatyId: treaty.id };
  }

  /**
   * Break a treaty
   * @spec REQ-DIP-006, REQ-DIP-007
   */
  async breakTreaty(
    breakerEmpireId: string,
    treatyId: string,
    currentTurn: number
  ): Promise<{ success: boolean }> {
    const treaty = await db.query.treaties.findFirst({
      where: eq(treaties.id, treatyId),
    });

    if (!treaty || treaty.status !== 'active') {
      return { success: false };
    }

    // Check minimum duration
    const turnsSinceTreaty = currentTurn - treaty.createdTurn;
    const minDuration = TREATY_CONFIG.minDuration[treaty.treatyType as TreatyType];

    if (turnsSinceTreaty < minDuration) {
      return { success: false }; // Cannot break before min duration
    }

    // Update treaty status
    await db
      .update(treaties)
      .set({
        status: 'broken',
        brokenByEmpireId: breakerEmpireId,
        brokenTurn: currentTurn,
      })
      .where(eq(treaties.id, treatyId));

    // Apply reputation penalty to ALL empires
    const penalty = TREATY_CONFIG.breakPenalty[treaty.treatyType as TreatyType];
    const otherEmpireId = treaty.empireAId === breakerEmpireId ? treaty.empireBId : treaty.empireAId;

    await this.applyGlobalReputationPenalty(breakerEmpireId, penalty, currentTurn);

    // Apply "Betrayed" status to target (-20 trust for 50 turns)
    await this.applyBetrayedStatus(otherEmpireId, breakerEmpireId, currentTurn);

    // Log event
    await this.logDiplomaticEvent({
      turnNumber: currentTurn,
      eventType: 'treaty_broken',
      actorEmpireId: breakerEmpireId,
      targetEmpireId: otherEmpireId,
      treatyId,
      reputationChange: penalty,
      details: { treatyType: treaty.treatyType },
    });

    return { success: true };
  }

  /**
   * Get active treaty between two empires
   */
  async getActiveTreaty(
    empireAId: string,
    empireBId: string,
    treatyType?: TreatyType
  ) {
    const [empireA, empireB] = this.orderEmpireIds(empireAId, empireBId);

    const conditions = [
      eq(treaties.empireAId, empireA),
      eq(treaties.empireBId, empireB),
      eq(treaties.status, 'active'),
    ];

    if (treatyType) {
      conditions.push(eq(treaties.treatyType, treatyType));
    }

    return db.query.treaties.findFirst({
      where: and(...conditions),
    });
  }

  /**
   * Get all active treaties for an empire
   */
  async getEmpireTreaties(empireId: string) {
    return db.query.treaties.findMany({
      where: and(
        or(eq(treaties.empireAId, empireId), eq(treaties.empireBId, empireId)),
        eq(treaties.status, 'active')
      ),
    });
  }

  /**
   * Process treaty renewals (called during turn processing)
   * @spec REQ-DIP-007
   */
  async processTreatyRenewals(currentTurn: number) {
    const expiringTreaties = await db.query.treaties.findMany({
      where: and(
        eq(treaties.status, 'active'),
        eq(treaties.expiresTurn, currentTurn)
      ),
    });

    for (const treaty of expiringTreaties) {
      if (treaty.autoRenew) {
        // Check trust scores
        const trustAB = await this.getTrustScore(treaty.empireAId, treaty.empireBId);
        const trustBA = await this.getTrustScore(treaty.empireBId, treaty.empireAId);

        if (trustAB >= 0 && trustBA >= 0) {
          // Renew treaty
          const duration = TREATY_CONFIG.minDuration[treaty.treatyType as TreatyType];
          await db
            .update(treaties)
            .set({ expiresTurn: currentTurn + duration })
            .where(eq(treaties.id, treaty.id));
        } else {
          // Expire treaty (no penalty)
          await db
            .update(treaties)
            .set({ status: 'expired' })
            .where(eq(treaties.id, treaty.id));

          await this.logDiplomaticEvent({
            turnNumber: currentTurn,
            eventType: 'treaty_expired',
            actorEmpireId: treaty.empireAId,
            targetEmpireId: treaty.empireBId,
            treatyId: treaty.id,
          });
        }
      } else {
        // Expire without renewal
        await db
          .update(treaties)
          .set({ status: 'expired' })
          .where(eq(treaties.id, treaty.id));
      }
    }
  }

  // Helper methods
  private orderEmpireIds(idA: string, idB: string): [string, string] {
    return idA < idB ? [idA, idB] : [idB, idA];
  }

  private async getReputation(empireId: string, targetId: string): Promise<number> {
    const score = await db.query.reputationScores.findFirst({
      where: and(
        eq(reputationScores.empireId, empireId),
        eq(reputationScores.targetEmpireId, targetId)
      ),
    });
    return score?.reputation ?? 0;
  }

  private async getTrustScore(empireId: string, targetId: string): Promise<number> {
    // Implementation in trust.ts
    return 0; // Placeholder
  }

  private async changeReputation(
    empireId: string,
    targetId: string,
    change: number,
    turn: number
  ) {
    // Implementation in reputation.ts
  }

  private async applyGlobalReputationPenalty(
    empireId: string,
    penalty: number,
    turn: number
  ) {
    // Apply penalty to all empires
    const allEmpires = await db.query.empires.findMany();
    for (const empire of allEmpires) {
      if (empire.id !== empireId) {
        await this.changeReputation(empireId, empire.id, penalty, turn);
      }
    }
  }

  private async applyBetrayedStatus(
    victimId: string,
    betrayerId: string,
    turn: number
  ) {
    // Reduce trust score by -20 for 50 turns
    // Implementation in trust.ts
  }

  private async logDiplomaticEvent(event: any) {
    // Log to diplomatic_events table
  }
}
```

### B.2 Coalition Service

```typescript
// src/lib/diplomacy/coalitions.ts

import { db } from '@/lib/db';
import { coalitions, coalitionMembers, coalitionMessages, empires } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Coalition management service
 * @spec REQ-DIP-002, REQ-DIP-005
 */
export class CoalitionService {
  /**
   * Form a new coalition
   * @spec REQ-DIP-002
   */
  async formCoalition(
    founderEmpireId: string,
    name: string,
    goal: string,
    currentTurn: number,
    isAntiSnowball: boolean = false,
    targetEmpireId?: string
  ): Promise<{ success: boolean; coalitionId?: string }> {
    // Create coalition
    const [coalition] = await db
      .insert(coalitions)
      .values({
        name,
        goal,
        createdTurn: currentTurn,
        status: 'active',
        isAntiSnowball,
        targetEmpireId,
      })
      .returning();

    // Add founder as member
    await db.insert(coalitionMembers).values({
      coalitionId: coalition.id,
      empireId: founderEmpireId,
      joinedTurn: currentTurn,
      role: 'founder',
      status: 'active',
    });

    // Post system message
    await this.postCoalitionMessage(
      coalition.id,
      founderEmpireId,
      currentTurn,
      `Coalition "${name}" formed with goal: ${goal}`,
      'system'
    );

    return { success: true, coalitionId: coalition.id };
  }

  /**
   * Invite empire to coalition
   */
  async inviteToCoalition(
    coalitionId: string,
    inviterId: string,
    inviteeId: string,
    currentTurn: number
  ): Promise<{ success: boolean }> {
    // Check if inviter is a member
    const inviter = await this.getCoalitionMember(coalitionId, inviterId);
    if (!inviter || inviter.status !== 'active') {
      return { success: false };
    }

    // Check if invitee already in coalition
    const existing = await this.getCoalitionMember(coalitionId, inviteeId);
    if (existing) {
      return { success: false };
    }

    // Store invitation (could be separate table, for now just log event)
    await this.postCoalitionMessage(
      coalitionId,
      inviterId,
      currentTurn,
      `Invited empire ${inviteeId} to join the coalition`,
      'system'
    );

    return { success: true };
  }

  /**
   * Join a coalition
   * @spec REQ-DIP-002
   */
  async joinCoalition(
    coalitionId: string,
    empireId: string,
    currentTurn: number
  ): Promise<{ success: boolean }> {
    // Check coalition is active
    const coalition = await db.query.coalitions.findFirst({
      where: eq(coalitions.id, coalitionId),
    });

    if (!coalition || coalition.status !== 'active') {
      return { success: false };
    }

    // Add member
    await db.insert(coalitionMembers).values({
      coalitionId,
      empireId,
      joinedTurn: currentTurn,
      role: 'member',
      status: 'active',
    });

    // Update empire coalition count
    await db
      .update(empires)
      .set({
        coalitionCount: db.raw('coalition_count + 1'),
      })
      .where(eq(empires.id, empireId));

    // Post message
    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, empireId),
    });

    await this.postCoalitionMessage(
      coalitionId,
      empireId,
      currentTurn,
      `${empire?.name} has joined the coalition!`,
      'system'
    );

    return { success: true };
  }

  /**
   * Leave a coalition
   * @spec REQ-DIP-006
   */
  async leaveCoalition(
    coalitionId: string,
    empireId: string,
    currentTurn: number,
    isBetray: boolean = false
  ): Promise<{ success: boolean }> {
    const member = await this.getCoalitionMember(coalitionId, empireId);
    if (!member || member.status !== 'active') {
      return { success: false };
    }

    // Update member status
    await db
      .update(coalitionMembers)
      .set({
        status: isBetray ? 'betrayed' : 'left',
        leftTurn: currentTurn,
        betrayedTurn: isBetray ? currentTurn : undefined,
      })
      .where(
        and(
          eq(coalitionMembers.coalitionId, coalitionId),
          eq(coalitionMembers.empireId, empireId)
        )
      );

    // If betrayal, apply penalties
    if (isBetray) {
      await this.handleCoalitionBetrayal(coalitionId, empireId, currentTurn);
    }

    // Post message
    const empire = await db.query.empires.findFirst({
      where: eq(empires.id, empireId),
    });

    const messageType = isBetray ? '⚠️ BETRAYED' : 'left';
    await this.postCoalitionMessage(
      coalitionId,
      empireId,
      currentTurn,
      `${empire?.name} has ${messageType} the coalition!`,
      'system'
    );

    return { success: true };
  }

  /**
   * Handle coalition betrayal penalties
   * @spec REQ-DIP-006
   */
  private async handleCoalitionBetrayal(
    coalitionId: string,
    betrayerId: string,
    currentTurn: number
  ) {
    // Apply -40 reputation to ALL empires
    const allEmpires = await db.query.empires.findMany();
    for (const empire of allEmpires) {
      if (empire.id !== betrayerId) {
        await this.changeReputation(betrayerId, empire.id, -40, currentTurn);
      }
    }

    // Apply pariah status (30 turns)
    await db
      .update(empires)
      .set({
        pariahUntilTurn: currentTurn + 30,
        betrayalCount: db.raw('betrayal_count + 1'),
      })
      .where(eq(empires.id, betrayerId));

    // Add permanent reputation scar (-20)
    await this.addPermanentScar(betrayerId, -20);
  }

  /**
   * Post message to coalition chat
   * @spec REQ-DIP-009
   */
  async postCoalitionMessage(
    coalitionId: string,
    senderEmpireId: string,
    turnNumber: number,
    message: string,
    messageType: 'chat' | 'system' | 'vote' | 'coordination' = 'chat'
  ) {
    await db.insert(coalitionMessages).values({
      coalitionId,
      senderEmpireId,
      turnNumber,
      message,
      messageType,
    });
  }

  /**
   * Get coalition messages (last N turns)
   */
  async getCoalitionMessages(coalitionId: string, lastNTurns: number = 10) {
    return db.query.coalitionMessages.findMany({
      where: eq(coalitionMessages.coalitionId, coalitionId),
      orderBy: (messages, { desc }) => [desc(messages.turnNumber)],
      limit: lastNTurns * 5, // ~5 messages per turn average
    });
  }

  /**
   * Get active coalition members
   */
  async getCoalitionMembers(coalitionId: string) {
    return db.query.coalitionMembers.findMany({
      where: and(
        eq(coalitionMembers.coalitionId, coalitionId),
        eq(coalitionMembers.status, 'active')
      ),
      with: {
        empire: true,
      },
    });
  }

  /**
   * Calculate coalition territory control
   * @spec REQ-DIP-008
   */
  async calculateCoalitionTerritory(coalitionId: string): Promise<number> {
    const members = await this.getCoalitionMembers(coalitionId);
    let totalSectors = 0;

    for (const member of members) {
      const empire = await db.query.empires.findFirst({
        where: eq(empires.id, member.empireId),
      });
      totalSectors += empire?.sectorCount ?? 0;
    }

    return totalSectors;
  }

  /**
   * Check for diplomatic victory
   * @spec REQ-DIP-008
   */
  async checkDiplomaticVictory(coalitionId: string, totalSectors: number): Promise<boolean> {
    const coalitionSectors = await this.calculateCoalitionTerritory(coalitionId);
    const controlPercentage = coalitionSectors / totalSectors;
    return controlPercentage >= 0.5; // 50% control
  }

  // Helper methods
  private async getCoalitionMember(coalitionId: string, empireId: string) {
    return db.query.coalitionMembers.findFirst({
      where: and(
        eq(coalitionMembers.coalitionId, coalitionId),
        eq(coalitionMembers.empireId, empireId)
      ),
    });
  }

  private async changeReputation(empireId: string, targetId: string, change: number, turn: number) {
    // Implementation in reputation.ts
  }

  private async addPermanentScar(empireId: string, scar: number) {
    // Implementation in reputation.ts
  }
}
```

### B.3 Reputation Service

```typescript
// src/lib/diplomacy/reputation.ts

import { db } from '@/lib/db';
import { reputationScores, diplomaticEvents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Reputation tracking service
 * @spec REQ-DIP-003, REQ-DIP-010
 */
export class ReputationService {
  /**
   * Change reputation between two empires
   * @spec REQ-DIP-003
   */
  async changeReputation(
    empireId: string,
    targetEmpireId: string,
    change: number,
    currentTurn: number,
    visibility: 'bilateral' | 'global' = 'bilateral'
  ): Promise<number> {
    // Get or create reputation score
    let score = await db.query.reputationScores.findFirst({
      where: and(
        eq(reputationScores.empireId, empireId),
        eq(reputationScores.targetEmpireId, targetEmpireId)
      ),
    });

    if (!score) {
      [score] = await db
        .insert(reputationScores)
        .values({
          empireId,
          targetEmpireId,
          reputation: 0,
          permanentScar: 0,
          lastUpdatedTurn: currentTurn,
        })
        .returning();
    }

    // Calculate new reputation
    const newReputation = Math.max(-100, Math.min(100, score.reputation + change));

    // Update score
    await db
      .update(reputationScores)
      .set({
        reputation: newReputation,
        lastUpdatedTurn: currentTurn,
      })
      .where(
        and(
          eq(reputationScores.empireId, empireId),
          eq(reputationScores.targetEmpireId, targetEmpireId)
        )
      );

    // Log event
    await db.insert(diplomaticEvents).values({
      turnNumber: currentTurn,
      eventType: change > 0 ? 'reputation_gained' : 'reputation_lost',
      actorEmpireId: empireId,
      targetEmpireId,
      reputationChange: change,
      details: { visibility },
    });

    return newReputation;
  }

  /**
   * Add permanent reputation scar
   * @spec REQ-DIP-010
   */
  async addPermanentScar(
    empireId: string,
    targetEmpireId: string,
    scar: number
  ): Promise<void> {
    // Scar is always negative
    if (scar > 0) scar = -scar;

    await db
      .update(reputationScores)
      .set({
        permanentScar: db.raw(`permanent_scar + ${scar}`),
      })
      .where(
        and(
          eq(reputationScores.empireId, empireId),
          eq(reputationScores.targetEmpireId, targetEmpireId)
        )
      );
  }

  /**
   * Get effective reputation (includes permanent scar)
   * @spec REQ-DIP-003
   */
  async getEffectiveReputation(
    empireId: string,
    targetEmpireId: string
  ): Promise<number> {
    const score = await db.query.reputationScores.findFirst({
      where: and(
        eq(reputationScores.empireId, empireId),
        eq(reputationScores.targetEmpireId, targetEmpireId)
      ),
    });

    if (!score) return 0;

    return Math.max(-100, score.reputation + score.permanentScar);
  }

  /**
   * Process reputation recovery (called per turn)
   * @spec REQ-DIP-010
   */
  async processReputationRecovery(empireId: string, currentTurn: number) {
    // Recovery logic based on actions
    // For example: honor all treaties = +15 reputation over 30 turns
    // Implementation depends on action tracking
  }
}
```

---

## C. Server Actions

### C.1 Diplomacy Actions

```typescript
// src/app/actions/diplomacy-actions.ts

"use server";

import { TreatyService } from '@/lib/diplomacy/treaties';
import { CoalitionService } from '@/lib/diplomacy/coalitions';
import { getCurrentTurn, getCurrentEmpireId } from '@/lib/game/session';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Propose a treaty
 * @spec REQ-DIP-001
 */
export async function proposeTreatyAction(
  targetEmpireId: string,
  treatyType: 'NAP' | 'ALLIANCE'
): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const treatyService = new TreatyService();
  const result = await treatyService.proposeTreaty(
    empireId,
    targetEmpireId,
    treatyType,
    currentTurn
  );

  return result;
}

/**
 * Accept a treaty proposal
 * @spec REQ-DIP-001
 */
export async function acceptTreatyAction(
  proposerEmpireId: string,
  treatyType: 'NAP' | 'ALLIANCE'
): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const treatyService = new TreatyService();
  const result = await treatyService.acceptTreaty(
    empireId,
    proposerEmpireId,
    treatyType,
    currentTurn
  );

  return { success: result.success, data: { treatyId: result.treatyId } };
}

/**
 * Break a treaty
 * @spec REQ-DIP-006
 */
export async function breakTreatyAction(treatyId: string): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const treatyService = new TreatyService();
  const result = await treatyService.breakTreaty(empireId, treatyId, currentTurn);

  return result;
}

/**
 * Form a new coalition
 * @spec REQ-DIP-002
 */
export async function formCoalitionAction(
  name: string,
  goal: string
): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const coalitionService = new CoalitionService();
  const result = await coalitionService.formCoalition(
    empireId,
    name,
    goal,
    currentTurn
  );

  return { success: result.success, data: { coalitionId: result.coalitionId } };
}

/**
 * Join a coalition
 * @spec REQ-DIP-002
 */
export async function joinCoalitionAction(coalitionId: string): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const coalitionService = new CoalitionService();
  const result = await coalitionService.joinCoalition(
    coalitionId,
    empireId,
    currentTurn
  );

  return result;
}

/**
 * Leave or betray a coalition
 * @spec REQ-DIP-006
 */
export async function leaveCoalitionAction(
  coalitionId: string,
  betray: boolean = false
): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const coalitionService = new CoalitionService();
  const result = await coalitionService.leaveCoalition(
    coalitionId,
    empireId,
    currentTurn,
    betray
  );

  return result;
}

/**
 * Send message to coalition chat
 * @spec REQ-DIP-009
 */
export async function sendCoalitionMessageAction(
  coalitionId: string,
  message: string
): Promise<ActionResult> {
  const empireId = await getCurrentEmpireId();
  const currentTurn = await getCurrentTurn();

  const coalitionService = new CoalitionService();
  await coalitionService.postCoalitionMessage(
    coalitionId,
    empireId,
    currentTurn,
    message,
    'chat'
  );

  return { success: true };
}
```

---

## D. UI Components

### D.1 Diplomacy Screen Component

```typescript
// src/components/game/diplomacy/DiplomacyScreen.tsx

"use client";

import { useState } from 'react';
import { Empire, Treaty, Coalition } from '@/lib/db/schema';
import { TreatyPanel } from './TreatyPanel';
import { CoalitionPanel } from './CoalitionPanel';
import { EmpireList } from './EmpireList';

interface DiplomacyScreenProps {
  empires: Empire[];
  treaties: Treaty[];
  coalitions: Coalition[];
  playerEmpireId: string;
}

export function DiplomacyScreen({
  empires,
  treaties,
  coalitions,
  playerEmpireId,
}: DiplomacyScreenProps) {
  const [selectedEmpire, setSelectedEmpire] = useState<Empire | null>(null);
  const [selectedCoalition, setSelectedCoalition] = useState<Coalition | null>(null);

  return (
    <div className="diplomacy-screen flex h-full">
      {/* Left Panel: Empire List */}
      <div className="w-1/3 border-r border-orange-400/30 p-4">
        <h2 className="text-xl font-bold text-orange-300 mb-4">
          DIPLOMATIC RELATIONS
        </h2>
        <EmpireList
          empires={empires}
          treaties={treaties}
          playerEmpireId={playerEmpireId}
          onSelectEmpire={setSelectedEmpire}
        />
      </div>

      {/* Right Panel: Selected Empire Details */}
      <div className="w-2/3 p-4">
        {selectedEmpire && (
          <TreatyPanel
            empire={selectedEmpire}
            treaties={treaties}
            playerEmpireId={playerEmpireId}
          />
        )}

        {selectedCoalition && (
          <CoalitionPanel
            coalition={selectedCoalition}
            playerEmpireId={playerEmpireId}
          />
        )}

        {/* Active Coalitions Section */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-violet-300 mb-2">
            ACTIVE COALITIONS ({coalitions.length})
          </h3>
          {coalitions.map((coalition) => (
            <div
              key={coalition.id}
              className="bg-violet-500/10 border border-violet-400/30 p-3 mb-2 rounded cursor-pointer hover:bg-violet-500/20"
              onClick={() => setSelectedCoalition(coalition)}
            >
              <div className="font-bold">{coalition.name}</div>
              <div className="text-sm text-gray-400">Goal: {coalition.goal}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### D.2 Treaty Panel Component

```typescript
// src/components/game/diplomacy/TreatyPanel.tsx

"use client";

import { Empire, Treaty } from '@/lib/db/schema';
import { proposeTreatyAction, breakTreatyAction } from '@/app/actions/diplomacy-actions';
import { useState } from 'react';

interface TreatyPanelProps {
  empire: Empire;
  treaties: Treaty[];
  playerEmpireId: string;
}

export function TreatyPanel({ empire, treaties, playerEmpireId }: TreatyPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const activeTreaty = treaties.find(
    (t) =>
      (t.empireAId === playerEmpireId && t.empireBId === empire.id) ||
      (t.empireBId === playerEmpireId && t.empireAId === empire.id)
  );

  const handleProposeTreaty = async (treatyType: 'NAP' | 'ALLIANCE') => {
    setIsLoading(true);
    const result = await proposeTreatyAction(empire.id, treatyType);
    setIsLoading(false);

    if (!result.success) {
      alert(result.error);
    }
  };

  const handleBreakTreaty = async () => {
    if (!activeTreaty) return;

    const confirm = window.confirm(
      `Breaking this ${activeTreaty.treatyType} will result in severe reputation penalties. Continue?`
    );

    if (!confirm) return;

    setIsLoading(true);
    await breakTreatyAction(activeTreaty.id);
    setIsLoading(false);
  };

  return (
    <div className="treaty-panel">
      <h2 className="text-2xl font-bold text-orange-300 mb-4">
        {empire.name}
      </h2>

      <div className="status-section mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Status:</span>
          <span className={getStatusColor(activeTreaty)}>
            {getStatusText(activeTreaty)}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Reputation:</span>
          <span className={getReputationColor(empire.reputation)}>
            {empire.reputation >= 0 ? '+' : ''}{empire.reputation} ({getReputationLabel(empire.reputation)})
          </span>
        </div>
      </div>

      <div className="treaty-actions mt-6">
        {!activeTreaty && (
          <>
            <button
              onClick={() => handleProposeTreaty('NAP')}
              disabled={isLoading || empire.reputation < 0}
              className="btn btn-primary mb-2"
            >
              Propose Non-Aggression Pact
            </button>
            <button
              onClick={() => handleProposeTreaty('ALLIANCE')}
              disabled={isLoading || empire.reputation < 20}
              className="btn btn-primary"
            >
              Propose Alliance
            </button>
          </>
        )}

        {activeTreaty && (
          <button
            onClick={handleBreakTreaty}
            disabled={isLoading}
            className="btn btn-danger"
          >
            Break {activeTreaty.treatyType}
          </button>
        )}
      </div>

      <div className="recent-actions mt-6">
        <h4 className="text-sm font-bold text-gray-400 mb-2">RECENT ACTIONS:</h4>
        {/* Display recent diplomatic events */}
      </div>
    </div>
  );
}

function getStatusText(treaty?: Treaty): string {
  if (!treaty) return 'Neutral';
  return treaty.treatyType === 'NAP' ? 'Non-Aggression Pact' : 'Alliance';
}

function getStatusColor(treaty?: Treaty): string {
  if (!treaty) return 'text-gray-400';
  return treaty.treatyType === 'NAP' ? 'text-blue-400' : 'text-green-400';
}

function getReputationLabel(rep: number): string {
  if (rep >= 50) return 'Trusted';
  if (rep >= 20) return 'Friendly';
  if (rep >= 0) return 'Neutral';
  if (rep >= -20) return 'Untrusted';
  if (rep >= -40) return 'Hostile';
  return 'Pariah';
}

function getReputationColor(rep: number): string {
  if (rep >= 50) return 'text-green-400';
  if (rep >= 20) return 'text-blue-400';
  if (rep >= 0) return 'text-gray-400';
  if (rep >= -20) return 'text-yellow-400';
  return 'text-red-400';
}
```

### D.3 Coalition Chat Component

```typescript
// src/components/game/diplomacy/CoalitionChat.tsx

"use client";

import { useState, useEffect } from 'react';
import { Coalition, CoalitionMessage } from '@/lib/db/schema';
import { sendCoalitionMessageAction } from '@/app/actions/diplomacy-actions';

interface CoalitionChatProps {
  coalition: Coalition;
  messages: CoalitionMessage[];
  playerEmpireId: string;
}

export function CoalitionChat({
  coalition,
  messages,
  playerEmpireId,
}: CoalitionChatProps) {
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    await sendCoalitionMessageAction(coalition.id, messageText);
    setMessageText('');
    setIsSubmitting(false);
  };

  return (
    <div className="coalition-chat border border-violet-400/30 rounded p-4">
      <div className="header mb-4">
        <h3 className="text-lg font-bold text-violet-300">
          COALITION: {coalition.name}
        </h3>
        <div className="text-sm text-gray-400">Goal: {coalition.goal}</div>
      </div>

      <div className="messages-container h-96 overflow-y-auto mb-4 border-t border-b border-violet-400/20 py-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message mb-3 ${msg.messageType === 'system' ? 'text-yellow-400' : ''}`}
          >
            <div className="text-xs text-gray-500">Turn {msg.turnNumber}</div>
            <div className="flex">
              <span className="font-bold mr-2">
                {msg.senderEmpireId === playerEmpireId ? '[You]' : `[${msg.senderEmpireName}]`}:
              </span>
              <span>{msg.message}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-input flex">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type message..."
          disabled={isSubmitting}
          className="flex-1 bg-black/30 border border-violet-400/30 rounded px-3 py-2 text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting || !messageText.trim()}
          className="ml-2 btn btn-primary"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## E. Bot Decision Engine

### E.1 Bot Diplomacy Decision Logic

```typescript
// src/lib/bot/diplomacy-decisions.ts

import { Empire, Treaty, Coalition } from '@/lib/db/schema';
import { TreatyService } from '@/lib/diplomacy/treaties';
import { CoalitionService } from '@/lib/diplomacy/coalitions';
import { ReputationService } from '@/lib/diplomacy/reputation';

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
 * Bot diplomacy decision engine
 * @spec REQ-DIP-006 (Betrayal), REQ-BOT-008 (Coalition behavior)
 */
export class BotDiplomacyEngine {
  private treatyService: TreatyService;
  private coalitionService: CoalitionService;
  private reputationService: ReputationService;

  constructor() {
    this.treatyService = new TreatyService();
    this.coalitionService = new CoalitionService();
    this.reputationService = new ReputationService();
  }

  /**
   * Decide whether to accept a treaty proposal
   */
  async decideTreatyAcceptance(
    botEmpire: Empire,
    proposerEmpire: Empire,
    treatyType: 'NAP' | 'ALLIANCE',
    currentTurn: number
  ): Promise<boolean> {
    const archetype = botEmpire.archetype as BotArchetype;
    const reputation = await this.reputationService.getEffectiveReputation(
      botEmpire.id,
      proposerEmpire.id
    );
    const trustScore = await this.getTrustScore(botEmpire.id, proposerEmpire.id);

    switch (archetype) {
      case 'Diplomat':
        return trustScore > 25 && reputation >= 0;

      case 'Warlord':
        // Only ally with strong empires
        if (treatyType === 'ALLIANCE') {
          const isProposerStrong = proposerEmpire.networth > botEmpire.networth * 0.7;
          return isProposerStrong && trustScore > 40;
        }
        return false; // Warlords don't sign NAPs

      case 'Merchant':
        // Ally with trade partners
        const tradeValue = await this.getTradeValue(botEmpire.id, proposerEmpire.id);
        return tradeValue > 1000 || trustScore > 30;

      case 'Schemer':
        // Always accept (planning betrayal)
        return trustScore > 20;

      case 'Turtle':
        // Accept NAPs from adjacent empires, alliances rarely
        const isAdjacent = await this.areAdjacent(botEmpire.id, proposerEmpire.id);
        if (treatyType === 'NAP') return isAdjacent;
        return trustScore > 35 && isAdjacent;

      case 'TechRush':
        // Isolationist, rarely accepts
        return trustScore > 50;

      case 'Blitzkrieg':
        // Never accepts (early aggression focus)
        return false;

      case 'Opportunist':
        // Accepts if currently weak
        const isWeak = botEmpire.networth < this.getAverageNetworth(currentTurn) * 0.8;
        return isWeak && trustScore > 30;

      default:
        return Math.random() < 0.3; // 30% chance
    }
  }

  /**
   * Decide whether to join a coalition
   * @spec REQ-BOT-008
   */
  async decideCoalitionJoin(
    botEmpire: Empire,
    coalition: Coalition,
    currentTurn: number
  ): Promise<boolean> {
    const archetype = botEmpire.archetype as BotArchetype;

    // If anti-snowball coalition
    if (coalition.isAntiSnowball && coalition.targetEmpireId) {
      const leader = await this.getEmpire(coalition.targetEmpireId);
      if (!leader) return false;

      const threatLevel = this.calculateThreatLevel(leader, botEmpire);

      switch (archetype) {
        case 'Diplomat':
          return threatLevel > 0.5 || Math.random() < 0.95; // Almost always joins

        case 'Warlord':
          // Only if bot is in top 30% (doesn't want to look weak)
          const isStrong = await this.isInTopPercentile(botEmpire.id, 0.3);
          return isStrong && (threatLevel > 0.7 || Math.random() < 0.7);

        case 'Schemer':
          return Math.random() < 0.9; // Joins to plan betrayal

        case 'Turtle':
          return threatLevel > 0.6 || Math.random() < 0.8;

        case 'Merchant':
          // Joins if leader threatens trade
          const threatensTrade = leader.militaryPower > botEmpire.militaryPower * 2;
          return threatensTrade || (threatLevel > 0.5 && Math.random() < 0.75);

        case 'Opportunist':
          return Math.random() < 0.6;

        default:
          return Math.random() < 0.3;
      }
    }

    // Voluntary coalition
    return Math.random() < 0.2; // Low acceptance for non-crisis coalitions
  }

  /**
   * Decide whether to betray a coalition
   * @spec REQ-DIP-006
   */
  async decideCoalitionBetrayal(
    botEmpire: Empire,
    coalition: Coalition,
    currentTurn: number
  ): Promise<boolean> {
    const archetype = botEmpire.archetype as BotArchetype;

    // Get bot's membership info
    const member = await this.coalitionService.getCoalitionMember(coalition.id, botEmpire.id);
    if (!member) return false;

    const turnsInCoalition = currentTurn - member.joinedTurn;

    switch (archetype) {
      case 'Schemer':
        // Always betrays after 20 turns
        return turnsInCoalition >= 20;

      case 'Opportunist':
        // Betrays if coalition weakened by 50%+
        const coalitionWeakened = await this.isCoalitionWeakened(coalition.id, 0.5);
        const hasOpportunity = botEmpire.militaryPower > this.getCoalitionAveragePower(coalition.id) * 1.5;
        return coalitionWeakened && hasOpportunity && Math.random() < 0.2;

      case 'Warlord':
        // Never betrays (honor code)
        return false;

      case 'Merchant':
        // Betrays if better economic opportunity exists
        const betterOpportunity = await this.hasBetterEconomicOpportunity(botEmpire.id, coalition.id);
        return betterOpportunity && Math.random() < 0.05;

      default:
        // Others only if trust < -50 with multiple members
        const averageTrust = await this.getAverageCoalitionTrust(botEmpire.id, coalition.id);
        return averageTrust < -50 && Math.random() < 0.03;
    }
  }

  /**
   * Generate diplomatic message
   */
  generateMessage(
    archetype: BotArchetype,
    messageType: 'nap_proposal' | 'alliance_proposal' | 'coalition_invite' | 'betrayal',
    context: { targetName?: string; coalitionName?: string }
  ): string {
    const templates = MESSAGE_TEMPLATES[archetype][messageType];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template
      .replace('{player_name}', context.targetName || 'Commander')
      .replace('{coalition}', context.coalitionName || '');
  }

  // Helper methods
  private async getTrustScore(empireId: string, targetId: string): Promise<number> {
    // Implementation
    return 0;
  }

  private async getTradeValue(empireId: string, targetId: string): Promise<number> {
    // Implementation
    return 0;
  }

  private async areAdjacent(empireIdA: string, empireIdB: string): Promise<boolean> {
    // Implementation
    return false;
  }

  private getAverageNetworth(turn: number): number {
    // Implementation
    return 100000;
  }

  private async getEmpire(empireId: string): Promise<Empire | null> {
    // Implementation
    return null;
  }

  private calculateThreatLevel(leader: Empire, bot: Empire): number {
    // Threat = (leader VP / 10) + (leader military / bot military)
    return (leader.victoryPoints / 10) + (leader.militaryPower / Math.max(bot.militaryPower, 1));
  }

  private async isInTopPercentile(empireId: string, percentile: number): Promise<boolean> {
    // Implementation
    return false;
  }

  private async isCoalitionWeakened(coalitionId: string, threshold: number): Promise<boolean> {
    // Check if coalition lost 50%+ of its military power
    return false;
  }

  private getCoalitionAveragePower(coalitionId: string): number {
    // Implementation
    return 0;
  }

  private async hasBetterEconomicOpportunity(empireId: string, currentCoalitionId: string): Promise<boolean> {
    // Implementation
    return false;
  }

  private async getAverageCoalitionTrust(empireId: string, coalitionId: string): Promise<number> {
    // Average trust score toward all coalition members
    return 0;
  }
}
```

---

## F. Message Templates

### F.1 Bot Diplomatic Messages by Archetype

```typescript
// src/lib/bot/diplomatic-messages.ts

/**
 * Message templates for bot diplomatic communications
 * @spec REQ-DIP-006 (Betrayal messages), Section 4.3
 */
export const MESSAGE_TEMPLATES = {
  Warlord: {
    nap_proposal: [
      "You're not worth fighting. NAP for 20 turns. Stay out of my way.",
      "{player_name}, you're beneath my notice. Let's avoid wasting time on each other.",
      "A temporary peace serves us both. Don't test me.",
    ],
    alliance_proposal: [
      "You fight well. Join me. We'll crush the weak together.",
      "Strength respects strength. Form an alliance with my empire.",
      "Together we are unstoppable. Separately we waste resources. Your choice.",
    ],
    coalition_invite: [
      "Nobody dominates this galaxy but me. Join my coalition. We take {target} down.",
      "{target} threatens us all. Join me or be swept aside with them.",
      "Rally to my banner. We destroy {target} together.",
    ],
    treaty_broken_by: [
      "You broke faith with me. You will regret this.",
      "Honor means nothing to you. Very well. War it is.",
    ],
  },

  Diplomat: {
    nap_proposal: [
      "Let us put aside our differences, {player_name}. I propose a Non-Aggression Pact.",
      "Peace benefits us both. Will you honor a NAP?",
      "There's no need for conflict between us. Let's formalize peace.",
    ],
    alliance_proposal: [
      "Together we are stronger, {player_name}. Form an alliance with me.",
      "I seek a lasting partnership. Will you join me in alliance?",
      "Our empires share common interests. An alliance would serve us both.",
    ],
    coalition_invite: [
      "Attention all commanders. {target} threatens galactic domination. We must unite!",
      "I'm forming a coalition against {target}. Join us. Unity is our only hope.",
      "History shows that tyrants fall when free empires stand together. Join our coalition.",
    ],
    betrayal: [
      "I never wanted this. You left me no choice.",
      "Circumstances have changed. I must act in my empire's interest.",
    ],
  },

  Merchant: {
    nap_proposal: [
      "War is bad for business. Let's keep the trade lanes open. NAP?",
      "Credits flow better in peacetime. Non-Aggression Pact?",
      "I prefer profitable partnerships to costly wars. NAP, {player_name}?",
    ],
    alliance_proposal: [
      "An alliance benefits us both. +10% trade income. What do you say?",
      "Business partners make the best allies. Join me?",
      "Our economies complement each other. Alliance makes financial sense.",
    ],
    coalition_invite: [
      "If {target} wins, we all lose. Temporary coalition? Back to business after.",
      "Bad for business if {target} dominates. Join my coalition. Protect trade.",
      "Economic stability requires balance of power. Coalition against {target}?",
    ],
    betrayal: [
      "Economics change. Our alliance no longer profitable. Apologies.",
      "A better opportunity arose. Nothing personal, {player_name}. Just business.",
    ],
  },

  Schemer: {
    nap_proposal: [
      "I have no quarrel with you... for now. How about we don't attack each other?",
      "Let's not waste resources on each other. NAP, {player_name}?",
      "Peace serves my purposes at the moment. NAP?",
    ],
    alliance_proposal: [
      "I trust you, {player_name}. Let's form an alliance.",
      "We could accomplish so much together. Alliance?",
      "I value loyalty above all. Join me in alliance.",
    ],
    coalition_invite: [
      "You don't trust me. Fine. But you can trust that I want {target} dead as much as you do.",
      "Enemy of my enemy, {player_name}. Join the coalition.",
      "{target} is a threat to us all. Coalition now, grudges later.",
    ],
    betrayal: [
      "Did you really think I meant any of it?",
      "You all trusted me. Every single one of you. And now, with your fleets depleted... the galaxy is mine.",
      "Trust is such a fragile thing. Thanks for yours.",
    ],
  },

  Turtle: {
    nap_proposal: [
      "I seek only peace. Will you honor a Non-Aggression Pact?",
      "Let's agree not to attack each other. NAP, {player_name}?",
      "Defensive empires like ours should not fight. NAP?",
    ],
    alliance_proposal: [
      "A defensive alliance would benefit us both. Join me?",
      "Mutual protection pact? Our borders would be secure.",
      "United we defend. Divided we fall. Alliance?",
    ],
    coalition_invite: [
      "{target} threatens peaceful empires. Join our defensive coalition.",
      "We cannot defend alone. Coalition for mutual protection?",
      "Together we can hold. Join the coalition against {target}.",
    ],
    treaty_broken_by: [
      "You broke our peace. My defenses will hold.",
      "I offered peace. You chose war. So be it.",
    ],
  },

  TechRush: {
    nap_proposal: [
      "My focus is research, not war. NAP allows us both to focus.",
      "I prefer laboratory to battlefield. NAP, {player_name}?",
    ],
    alliance_proposal: [
      "Rare for me to seek allies. Your empire has value. Alliance?",
      "Research benefits from security. Alliance provides that.",
    ],
    coalition_invite: [
      "{target} threatens the balance. Even I must act. Join coalition.",
      "Science cannot flourish under tyranny. Coalition against {target}?",
    ],
  },

  Blitzkrieg: {
    nap_proposal: [], // Never proposes NAPs
    alliance_proposal: [], // Never proposes alliances
    coalition_invite: [
      "Strike {target} fast and hard. Coalition attacks now!",
      "Speed is key. Join coalition. We blitz {target}.",
    ],
  },

  Opportunist: {
    nap_proposal: [
      "Right now, NAP makes sense. Things change, but... for now?",
      "Temporary peace? NAP for 20 turns?",
    ],
    alliance_proposal: [
      "Right now, I need allies. You interested?",
      "Current situation favors alliance. Join me?",
    ],
    coalition_invite: [
      "{target} is the threat today. Coalition?",
      "Circumstances require cooperation. Coalition against {target}.",
    ],
    betrayal: [
      "Sorry, {player_name}. Better opportunity came up. Nothing personal.",
      "Situation changed. I had to adapt.",
    ],
  },
};
```

---

## G. Turn Processing Integration

### G.1 Diplomacy Phase Processor

```typescript
// src/lib/game/turn-processing/diplomacy-phase.ts

import { TreatyService } from '@/lib/diplomacy/treaties';
import { CoalitionService } from '@/lib/diplomacy/coalitions';
import { BotDiplomacyEngine } from '@/lib/bot/diplomacy-decisions';

/**
 * Process diplomacy phase during turn processing
 * Phase 4: Diplomacy Resolution (SEQUENTIAL, order-dependent)
 */
export class DiplomacyPhaseProcessor {
  private treatyService: TreatyService;
  private coalitionService: CoalitionService;
  private botEngine: BotDiplomacyEngine;

  constructor() {
    this.treatyService = new TreatyService();
    this.coalitionService = new CoalitionService();
    this.botEngine = new BotDiplomacyEngine();
  }

  /**
   * Process all diplomacy actions for current turn
   */
  async processDiplomacyPhase(currentTurn: number) {
    // 1. Process treaty renewals
    await this.treatyService.processTreatyRenewals(currentTurn);

    // 2. Check for anti-snowball coalition triggers (7+ VP)
    await this.checkAntiSnowballTriggers(currentTurn);

    // 3. Process bot betrayals (Schemer after 20 turns)
    await this.processBotBetrayals(currentTurn);

    // 4. Process bot diplomatic decisions (proposals, responses)
    await this.processBotDiplomaticActions(currentTurn);

    // 5. Check for diplomatic victory
    await this.checkDiplomaticVictory(currentTurn);
  }

  /**
   * Check for anti-snowball coalition triggers
   * @spec REQ-DIP-005
   */
  private async checkAntiSnowballTriggers(currentTurn: number) {
    // Find empires with 7+ VP
    const leaders = await this.getLeaderEmpires(7);

    for (const leader of leaders) {
      // Check if anti-snowball coalition already exists
      const existingCoalition = await this.getAntiSnowballCoalition(leader.id);
      if (existingCoalition) continue;

      // Form coalition
      const result = await this.coalitionService.formCoalition(
        'SYSTEM',
        `Coalition Against ${leader.name}`,
        `Defeat ${leader.name}`,
        currentTurn,
        true, // isAntiSnowball
        leader.id
      );

      if (result.success && result.coalitionId) {
        // Invite eligible empires
        await this.inviteEmpiresTo AntiSnowballCoalition(
          result.coalitionId,
          leader.id,
          currentTurn
        );
      }
    }
  }

  /**
   * Process bot betrayals
   * @spec REQ-DIP-006
   */
  private async processBotBetrayals(currentTurn: number) {
    const bots = await this.getAllBotEmpires();

    for (const bot of bots) {
      const coalitions = await this.getBotCoalitions(bot.id);

      for (const coalition of coalitions) {
        const shouldBetray = await this.botEngine.decideCoalitionBetrayal(
          bot,
          coalition,
          currentTurn
        );

        if (shouldBetray) {
          await this.coalitionService.leaveCoalition(
            coalition.id,
            bot.id,
            currentTurn,
            true // betray = true
          );

          // Bot posts betrayal message
          const message = this.botEngine.generateMessage(
            bot.archetype as BotArchetype,
            'betrayal',
            { coalitionName: coalition.name }
          );

          await this.coalitionService.postCoalitionMessage(
            coalition.id,
            bot.id,
            currentTurn,
            message,
            'system'
          );
        }
      }
    }
  }

  // Helper methods
  private async getLeaderEmpires(vpThreshold: number) {
    // Implementation
    return [];
  }

  private async getAntiSnowballCoalition(targetEmpireId: string) {
    // Implementation
    return null;
  }

  private async inviteEmpiresToAntiSnowballCoalition(
    coalitionId: string,
    targetEmpireId: string,
    currentTurn: number
  ) {
    // Implementation
  }

  private async getAllBotEmpires() {
    // Implementation
    return [];
  }

  private async getBotCoalitions(botEmpireId: string) {
    // Implementation
    return [];
  }

  private async checkDiplomaticVictory(currentTurn: number) {
    // Check all coalitions for 50% territory control
    // Implementation
  }
}
```

---

**END APPENDIX**
