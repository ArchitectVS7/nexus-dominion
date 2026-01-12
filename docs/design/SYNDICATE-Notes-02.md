# The Galactic Syndicate: Complete System Specification

**Version:** 1.0
**Status:** Core Game Feature
**Created:** 2026-01-11
**Replaces:** SYNDICATE.md, SYNDICATE-EXPANSION-CONCEPT.md

---

## Document Purpose

This document defines the **Galactic Syndicate system** for Nexus Dominion. The Syndicate is a hidden criminal organization that operates outside Coordinator jurisdiction, creating asymmetric gameplay through hidden roles, secret contracts, and forbidden technologies.

**Design Philosophy:**
- **Hidden allegiance** - Some empires secretly serve the Syndicate
- **Asymmetric victory** - Syndicate can win without territory control
- **Betrayal mechanics** - Inspired by Betrayal at House on the Hill
- **Comeback potential** - Struggling players gain alternative paths to power
- **Bot integration** - Schemer archetype naturally suspicious
- **Dramatic tension** - "Who among us is the traitor?"

---

## Table of Contents

1. [Core Concept](#1-core-concept)
2. [Loyalty System](#2-loyalty-system)
3. [Syndicate Contracts](#3-syndicate-contracts)
4. [Trust Progression](#4-trust-progression)
5. [Black Market](#5-black-market)
6. [The Accusation System](#6-the-accusation-system)
7. [The Coordinator Response](#7-the-coordinator-response)
8. [Bot Integration](#8-bot-integration)
9. [Victory Conditions](#9-victory-conditions)
10. [Implementation Requirements](#10-implementation-requirements)

---

## 1. Core Concept

### 1.1 The Shadow War

The Syndicate isn't a faction you openly join — it's a **hidden role** that fundamentally changes your win conditions.

**At game start:**
- Each empire (player + bots) receives a secret Loyalty Card
- **90% are Loyalist** - Win through standard victory conditions
- **10% are Syndicate** - Hidden objective: Complete 3 contracts before Turn 200
- **No one knows** who serves the Syndicate (including you, about others)

### 1.2 Dual Experience

**If you draw Syndicate:**
- Play normally (build, attack, expand) to avoid suspicion
- Access **hidden Syndicate Contract panel** in UI
- Complete contracts to earn Syndicate Victory Points
- Use **Black Market** for WMDs and restricted tech
- Can reveal yourself voluntarily for bonuses (risky)

**If you draw Loyalist:**
- Play normally, pursue standard victory
- See **Suspicious Activity Feed** (intel on strange events)
- Can **accuse** other empires of being Syndicate
- Report suspicious behavior to **The Coordinator** (NPC)
- Form coalitions against suspected traitors

### 1.3 The Revelation Moment

**Turn 50 or when first contract completed:**

All players see this message:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│             ⚠️ THE SHADOW EMERGES ⚠️                     │
│                                                         │
│  A Syndicate operative has completed their first        │
│  contract. The criminal underworld stirs.               │
│                                                         │
│  Someone in this galaxy serves the Syndicate.           │
│  Perhaps multiple someones.                             │
│                                                         │
│  Watch for:                                             │
│  • Unexplained production drops                         │
│  • Market price anomalies                               │
│  • Convenient "accidents"                               │
│  • Black Market purchases                               │
│                                                         │
│  Trust no one.                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**This changes everything:**
- Accusations become possible
- Diplomacy becomes suspicious ("Is this alliance a trap?")
- Coalition formation becomes paranoid
- Bot messages shift to include suspicion

---

## 2. Loyalty System

### 2.1 Loyalty Assignment

**Distribution (100-empire game):**
- 90 empires: Loyalist
- 10 empires: Syndicate

**Archetype Weighting:**
- Schemer: 50% chance Syndicate (vs 10% baseline)
- Opportunist: 20% chance Syndicate
- All others: 10% chance Syndicate

**Player Assignment:**
- First playthrough: Always Loyalist (learn base game)
- Subsequent games: Subject to random assignment
- Can opt-in to "Syndicate Mode" for guaranteed assignment

### 2.2 Syndicate Player Mechanics

**Starting State:**
- Hidden panel appears in UI: "Syndicate Contracts"
- Access to Black Market (unlocks at Trust Level 1)
- Secret objective: "Complete 3 contracts before Turn 200"
- Syndicate VP tracker (visible only to you)

**Gameplay Balance:**
- Must balance appearing "normal" with completing contracts
- Suspicious activities generate **Suspicion Score**
- High suspicion increases accusation likelihood
- Can voluntarily reveal for immediate bonuses

### 2.3 Loyalist Player Mechanics

**Detection Tools:**
- **Suspicious Activity Feed** - Shows unexplained events
- **Intel Points** - Spend to investigate or accuse
- **Coordinator Reports** - Pay for intel validation
- **Coalition Coordination** - Share suspicions with allies

**Intel Point Economy:**
- Earn 5 points per turn (max 50 stored)
- Investigation costs 10 points
- Accusation costs 25 points
- Coordinator report costs 15 points

---

## 3. Syndicate Contracts

### 3.1 Contract Structure

Syndicate players see **3 active contracts** at any time. Completing one reveals a new option.

**Contract Visibility:**
- Contracts are **hidden** from other players
- Contract **effects are visible** (but cause is ambiguous)
- Suspicious Activity Feed shows results without attribution

### 3.2 Contract Tiers

#### Tier 1: Covert Operations (Trust 0-2)

| Contract | Objective | Syndicate VP | Suspicion | Reward |
|----------|-----------|--------------|-----------|--------|
| **Sabotage Production** | Reduce target's resource output by 20% for 3 turns | 1 | Low | 15,000 cr |
| **Insurgent Aid** | Support rebels in target empire (civil status -1) | 1 | Low | 10,000 cr |
| **Market Manipulation** | Crash specific resource price by 30% | 1 | Medium | 20,000 cr |
| **Pirate Raid** | Guerrilla attack on target (use NPC pirates as cover) | 1 | Very Low | 8,000 cr |

#### Tier 2: Strategic Disruption (Trust 3-5)

| Contract | Objective | Syndicate VP | Suspicion | Reward |
|----------|-----------|--------------|-----------|--------|
| **Intelligence Leak** | Reveal target's research/tech to all empires | 1 | Medium | 25,000 cr |
| **Arms Embargo** | Prevent target from building units for 2 turns | 2 | High | 35,000 cr |
| **False Flag Operation** | Make Empire A attack Empire B | 2 | Low (hard to trace) | 50,000 cr |
| **Economic Warfare** | Destroy 25% of target's resource stockpiles | 1 | High | 30,000 cr |

#### Tier 3: High-Risk Operations (Trust 6-7)

| Contract | Objective | Syndicate VP | Suspicion | Reward |
|----------|-----------|--------------|-----------|--------|
| **Coup d'État** | Cause civil revolt (civil status = Rioting) | 2 | Very High | 75,000 cr |
| **Assassination** | Kill target's general (if generals exist) | 2 | Very High | 60,000 cr |
| **Kingslayer** | Eliminate the #1 ranked empire | 3 | Extreme (instant reveal) | 150,000 cr |
| **Scorched Earth** | Deploy WMD against target (50% population) | 3 | Extreme | WMD unlock |

#### Tier 4: Endgame Contracts (Trust 8)

| Contract | Objective | Syndicate VP | Suspicion | Reward |
|----------|-----------|--------------|-----------|--------|
| **Proxy War** | Force two top empires into war | 2 | Medium | 100,000 cr |
| **The Equalizer** | Sabotage all Top 10% empires simultaneously | 3 | Very High | Special tech |
| **Shadow Victory** | Complete 3 contracts while remaining undetected | 5 | None (if successful) | Instant win |

### 3.3 Suspicion Generation

**How Suspicion Works:**
```
Each contract generates suspicion based on:
- Base suspicion value (Low/Medium/High/Extreme)
- Victim's investigation level
- Number of contracts completed
- Recent accusations

Suspicion Score = Σ(Contract Suspicion) × Investigation Modifier

High Suspicion (>75) triggers:
- More bot accusations
- Coalition formation against you
- Coordinator automatic monitoring
- Higher accusation trial success rate
```

**Reducing Suspicion:**
- Complete "clean" turns (no contracts for 5 turns): -10 suspicion
- Form alliances: -5 suspicion per active treaty
- Win battles legitimately: -15 suspicion
- Public charity (donate resources): -20 suspicion

---

## 4. Trust Progression

### 4.1 Trust Levels (0-8)

Syndicate players build trust through contracts and purchases to unlock better goods.

| Level | Points Required | Title | Black Market Access |
|-------|-----------------|-------|---------------------|
| **0** | 0 | Unknown | Must complete intro contract |
| **1** | 100 | Associate | Basic intel, components at 2× price |
| **2** | 500 | Runner | Tier 1 contracts, 1.75× prices |
| **3** | 1,500 | Soldier | Tier 2 contracts, 1.5× prices |
| **4** | 3,500 | Captain | Targeted contracts |
| **5** | 7,000 | Lieutenant | Advanced systems at 1.5× |
| **6** | 12,000 | Underboss | Chemical weapons, EMP devices |
| **7** | 20,000 | Consigliere | Nuclear warheads |
| **8** | 35,000 | Syndicate Lord | Bioweapons, exclusive contracts |

### 4.2 Earning Trust

**Contract Completion:**
- Tier 1 contracts: +10-20 trust
- Tier 2 contracts: +30-50 trust
- Tier 3 contracts: +60-100 trust
- Tier 4 contracts: +100-200 trust

**Black Market Purchases:**
- Each purchase: +5 trust per 10,000 credits spent
- WMD purchases: +50 trust (one-time)

**Recruitment Bonus (Comeback Mechanic):**
- If empire falls into bottom 50% of rankings:
- First contract offers **double trust rewards**
- One-time 10,000 credit "startup funds"
- Access to "Equalizer" contracts targeting top players

### 4.3 Trust Decay

| Condition | Effect |
|-----------|--------|
| No interaction for 10 turns | -5% trust decay per turn |
| Failed contract | -50% of reward trust, drop 1 level |
| Betrayal to Coordinator | **Reset to 0, permanent ban** |
| Being "outed" via accusation | -25% trust (Syndicate disappointed) |

---

## 5. Black Market

### 5.1 Access Requirements

**Only Syndicate players can access Black Market.**

Loyalists who attempt to access see:
```
[ENCRYPTED CHANNEL]
Access denied. The Syndicate does not know you.

Perhaps you're not who we thought you were.
Or perhaps you're not ready to walk this path.
```

### 5.2 Black Market Catalog

#### Components (Trust 1+)

Skip crafting queues (if crafting system active):

| Item | Base Price | Trust Multiplier | Trust Required |
|------|------------|------------------|----------------|
| Electronics | 1,000 cr | 2.0× | 1 |
| Armor Plating | 1,250 cr | 2.0× | 1 |
| Propulsion Units | 1,100 cr | 2.0× | 1 |
| Targeting Arrays | 2,000 cr | 1.75× | 3 |
| Stealth Composites | 2,500 cr | 1.75× | 3 |
| Quantum Processors | 4,000 cr | 1.5× | 4 |

#### Advanced Systems (Trust 5+)

| Item | Base Price | Trust Multiplier | Trust Required |
|------|------------|------------------|----------------|
| Reactor Cores | 10,000 cr | 1.5× | 5 |
| Shield Generators | 12,000 cr | 1.5× | 5 |
| Cloaking Device | 20,000 cr | 1.25× | 5 |
| Warp Drives | 25,000 cr | 1.25× | 6 |

#### Restricted Weapons (Trust 6+)

**Weapons of Mass Destruction (single-use):**

| Item | Price | Trust Req | Effect | Suspicion |
|------|-------|-----------|--------|-----------|
| **EMP Device** | 50,000 cr | 6 | Disable enemy defenses for 3 turns | High |
| **Chemical Weapon** | 75,000 cr | 6 | Kill 25% of target population | Very High |
| **Nuclear Warhead** | 100,000 cr | 7 | Destroy 50% of sector production | Extreme |
| **Bioweapon Canister** | 150,000 cr | 8 | Kill 75% of target population | Extreme |

#### Intelligence Services (Trust 2+)

| Service | Price | Trust Req | Effect |
|---------|-------|-----------|--------|
| **Spy Report** | 5,000 cr | 2 | Reveal target's resources/military |
| **Tech Espionage** | 15,000 cr | 3 | Reveal target's research progress |
| **Diplomatic Intel** | 10,000 cr | 3 | Reveal target's treaties/alliances |
| **Future Intel** | 25,000 cr | 5 | See target's planned actions next turn |

---

## 6. The Accusation System

### 6.1 How Accusations Work

**Available after Turn 50 (or first "Shadow Emerges" event).**

**Process:**
1. **Accuser spends 25 Intel Points** to accuse specific empire
2. **Public announcement** to all empires: "X accuses Y of Syndicate allegiance"
3. **Accused can defend** (spend 10,000 credits for defense statement)
4. **Voting period** - All other empires vote Guilty/Innocent (3 turns)
5. **Resolution** - Majority vote determines outcome

### 6.2 Resolution Outcomes

**If majority votes GUILTY + Target is SYNDICATE:**
- ✅ Accuser gains +5,000 credits, +10 Coordinator standing
- ❌ Target is "outed" (loses hidden status)
- 🔺 Target loses 25% trust with Syndicate
- 📢 Galaxy-wide announcement: "X was indeed Syndicate!"

**If majority votes GUILTY + Target is LOYALIST:**
- ❌ Accuser loses -10,000 credits, -20 Coordinator standing
- ✅ Target gains +15,000 credits (sympathy bonus)
- 🤝 Target gains +2 to all diplomatic relations
- 📢 Galaxy-wide announcement: "False accusation damages X's credibility"

**If majority votes INNOCENT:**
- ➡️ No penalties
- 📊 Suspicion score remains
- 💭 Lingering doubt ("Was the vote wrong?")

### 6.3 Being "Outed"

An outed Syndicate player:
- ✅ Can still complete contracts
- ✅ Can still win via Syndicate victory
- ❌ Loses stealth bonus
- ❌ All actions heavily scrutinized
- ⚡ Gains "Desperate" status:
  - +20% combat power (cornered animal)
  - -20% income (economic sanctions)
  - Cannot form new alliances
  - Existing alliances auto-dissolved

**Strategic Choice:**
- Some players voluntarily reveal after completing 2/3 contracts
- Gains immediate combat bonus
- "Going loud" can be a valid endgame strategy

---

## 7. The Coordinator Response

### 7.1 The Coordinator (NPC Faction)

The Coordinator is the galactic authority that opposes the Syndicate.

**Services:**
- **Intel Validation** - Confirm or deny suspicions (15 Intel Points)
- **Protection** - +10% funding bonus if you report Syndicate player
- **Whistleblower Rewards** - Betraying Syndicate pays well

### 7.2 Reporting to the Coordinator

**Loyalist players can betray suspected Syndicate operatives:**

**Cost:** 15 Intel Points + 5,000 credits

**If target is SYNDICATE:**
- ✅ Receive target's next contract (preview)
- ✅ Gain +10% permanent funding bonus
- ✅ Coordinator standing +50
- 📊 Intel shown: "Your report on X was... illuminating."

**If target is LOYALIST:**
- ❌ Report leaked to target (diplomatic damage)
- ❌ Lose 10,000 credits
- ❌ Coordinator standing -25
- 📊 Intel shown: "We found no evidence. Perhaps reconsider your sources."

### 7.3 Syndicate Betrayal (Permanent)

**A Syndicate player can betray the Syndicate to the Coordinator:**

**Benefits:**
- +25,000 credits immediate payout
- +25% permanent funding bonus from Coordinator
- Trust permanently reset to 0 (burn the bridge)
- Black Market access revoked permanently
- All active contracts cancelled

**Consequences:**
- **Syndicate becomes hostile**
- Random assassination attempts each turn (5% chance)
- Cannot re-engage with Syndicate (ever)
- Loyalty card changes to "Defector" (no longer Syndicate or Loyalist)
- New victory condition: "Survive until Turn 200 with Coordinator support"

---

## 8. Bot Integration

### 8.1 Archetype Assignment

**Schemer Archetype:**
- 50% chance to be Syndicate (vs 10% baseline)
- Naturally suspicious even when Loyalist
- Creates dramatic irony (suspected regardless of role)

**Other Archetypes:**
- Opportunist: 20% Syndicate chance
- Warlord: 10% Syndicate chance
- Diplomat: 5% Syndicate chance (rarely)
- Turtle: 5% Syndicate chance
- Others: 10% baseline

### 8.2 Syndicate Bot Behavior

**When bot is Syndicate:**
```
TURN 20: "I've found... alternative revenue streams."
TURN 40: "The market crash? Unfortunate. For some."
TURN 60: "Power doesn't come from territories alone."
TURN 80 (if outed): "Yes, I serve the Syndicate. What of it?"
```

**Contract Prioritization:**
- Complete low-suspicion contracts first
- Target rivals (highest networth enemies)
- Use WMDs only when desperate or for Kingslayer contract
- Attempt to stay hidden until 2/3 contracts complete

**Combat Behavior:**
- Fight normally to avoid suspicion
- Use Black Market units sparingly
- May sacrifice territory to complete contracts

### 8.3 Loyalist Bot Behavior

**Suspicion Triggers:**
```
[Diplomat] "Your production dropped without explanation.
            Should I be concerned about your... loyalties?"

[Warlord] "If you're Syndicate, there won't be a trial.
           Just fire."

[Turtle]  "I defend against external threats.
           But internal threats are harder to see."
```

**Accusation Patterns:**
- Diplomat bots: High accusation rate (paranoid)
- Warlord bots: Only accuse if high suspicion
- Turtle bots: Never accuse (too defensive)
- Schemer bots (Loyalist): Frequently accused but rarely accuse

**Coalition Formation:**
- "Stop the Syndicate" coalitions form after Turn 75
- Bots share suspicions in coalition chat
- Coordinate accusations via voting

### 8.4 The Schemer Paradox

**Schemer bots create tension:**
- 50% are Syndicate (high risk)
- 50% are Loyalist (false positives)
- **You never know which**

**Loyalist Schemer Bot:**
```
"Everyone suspects me. I'm used to it.
 But I assure you, I'm on the right side.
 This time."
```

**Syndicate Schemer Bot:**
```
"Let them suspect. Suspicion is cheap.
 Proof is expensive."
```

---

## 9. Victory Conditions

### 9.1 Syndicate Victory

**Condition 1: Contract Mastery**
- Complete 3 Syndicate contracts before Turn 200
- Any combination of tiers allowed
- Hidden or outed status doesn't matter
- **Victory Type:** "Shadow Victory" if hidden, "Defiant Victory" if outed

**Condition 2: Chaos Victory**
- If no standard victory achieved by Turn 200
- AND Syndicate player has 2+ contracts completed
- "The galaxy descends into chaos. The Syndicate wins."

**Condition 3: The Perfect Game**
- Complete 3 contracts while remaining undetected
- Never accused, never outed
- Bonus: "Shadow Master" achievement
- Highest Syndicate victory score

### 9.2 Victory Screen (Syndicate)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🔺 SYNDICATE VICTORY 🔺                     │
│                                                         │
│  The shadows have won.                                  │
│                                                         │
│  While empires fought over sectors and resources,       │
│  the Syndicate pulled strings from the darkness.        │
│                                                         │
│  SYNDICATE OPERATIVE: EMPEROR VARKUS                    │
│  Archetype: Schemer                                     │
│  Status: Shadow Master (undetected)                     │
│                                                         │
│  Contracts Completed:                                   │
│  • Sabotaged ore production - Turn 34                   │
│  • Manipulated petroleum markets - Turn 52              │
│  • Orchestrated coup d'état - Turn 71                   │
│                                                         │
│  "You never suspected. That was your mistake."          │
│                                                         │
│  Final Stats:                                           │
│  • Suspicion Score: 42/100 (remained hidden)            │
│  • False Accusations Survived: 2                        │
│  • Syndicate Trust: Level 6 (Underboss)                 │
│  • Credits Earned: 185,000                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.3 Loyalist Victory

**Loyalists win through standard victory conditions:**
- Conquest (60% territory)
- Economic (1.5× networth of #2)
- Research (complete Tier 3 tech tree)
- Military (2× power of all others combined)
- Coalition (coalition controls 50% territory)

**Bonus:** If Syndicate players are all eliminated or outed before victory:
- +10,000 credit bonus
- "Guardian of the Galaxy" achievement
- Coordinator commendation message

---

## 10. Implementation Requirements

### 10.1 Database Schema

```sql
-- Loyalty assignment
ALTER TABLE empires ADD COLUMN loyalty_role VARCHAR(20) DEFAULT 'loyalist';
-- Values: 'loyalist', 'syndicate', 'defector'

ALTER TABLE empires ADD COLUMN syndicate_vp INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN syndicate_trust_level INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN syndicate_trust_points INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN suspicion_score INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN is_outed BOOLEAN DEFAULT false;
ALTER TABLE empires ADD COLUMN intel_points INTEGER DEFAULT 0;

-- Syndicate contracts
CREATE TABLE syndicate_contracts (
  id UUID PRIMARY KEY,
  empire_id UUID REFERENCES empires(id),
  contract_type VARCHAR(50) NOT NULL,
  contract_tier INTEGER NOT NULL, -- 1-4
  target_empire_id UUID REFERENCES empires(id),

  status VARCHAR(20) NOT NULL, -- 'active', 'completed', 'failed', 'expired'
  syndicate_vp_reward INTEGER NOT NULL,
  credit_reward INTEGER NOT NULL,
  trust_reward INTEGER NOT NULL,
  suspicion_generated INTEGER NOT NULL,

  assigned_turn INTEGER NOT NULL,
  deadline_turn INTEGER, -- NULL if no deadline
  completed_turn INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accusations
CREATE TABLE accusations (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  accuser_id UUID REFERENCES empires(id),
  accused_id UUID REFERENCES empires(id),

  accusation_turn INTEGER NOT NULL,
  voting_end_turn INTEGER NOT NULL,

  votes_guilty INTEGER DEFAULT 0,
  votes_innocent INTEGER DEFAULT 0,
  abstentions INTEGER DEFAULT 0,

  result VARCHAR(20), -- 'correct', 'incorrect', 'dismissed'
  was_syndicate BOOLEAN, -- True if accused was actually Syndicate

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE accusation_votes (
  id UUID PRIMARY KEY,
  accusation_id UUID REFERENCES accusations(id),
  voter_empire_id UUID REFERENCES empires(id),
  vote VARCHAR(20) NOT NULL, -- 'guilty', 'innocent', 'abstain'

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(accusation_id, voter_empire_id)
);

-- Suspicious events (intel feed)
CREATE TABLE suspicious_events (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  turn_number INTEGER NOT NULL,

  event_type VARCHAR(50) NOT NULL,
  -- 'production_drop', 'market_crash', 'unexplained_attack', 'wmd_use'

  affected_empire_id UUID REFERENCES empires(id),
  suspected_empire_id UUID REFERENCES empires(id), -- NULL if unknown

  description TEXT NOT NULL,
  suspicion_increase INTEGER DEFAULT 0,

  is_syndicate_action BOOLEAN NOT NULL, -- For validation, not shown
  related_contract_id UUID REFERENCES syndicate_contracts(id),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Coordinator reports
CREATE TABLE coordinator_reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES empires(id),
  target_id UUID REFERENCES empires(id),

  report_turn INTEGER NOT NULL,
  intel_cost INTEGER NOT NULL,
  credit_cost INTEGER NOT NULL,

  was_correct BOOLEAN NOT NULL,
  intel_revealed TEXT, -- What Coordinator told the reporter

  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10.2 Service Architecture

```typescript
// src/lib/game/services/syndicate-service.ts

export class SyndicateService {
  // Loyalty assignment (game creation)
  async assignLoyaltyRoles(gameId: string): Promise<void>;

  // Contract system
  async generateContracts(empireId: string): Promise<Contract[]>;
  async completeContract(contractId: string): Promise<ContractResult>;
  async failContract(contractId: string): Promise<void>;

  // Trust progression
  async increaseTrust(empireId: string, amount: number): Promise<TrustLevel>;
  async applyTrustDecay(empireId: string): Promise<void>;

  // Suspicion system
  async generateSuspiciousEvent(
    gameId: string,
    eventType: string,
    affectedEmpireId: string,
    sourceEmpireId?: string
  ): Promise<SuspiciousEvent>;

  async increaseSuspicion(empireId: string, amount: number): Promise<number>;

  // Accusation system
  async createAccusation(
    accuserId: string,
    accusedId: string
  ): Promise<Accusation>;

  async voteOnAccusation(
    accusationId: string,
    voterId: string,
    vote: 'guilty' | 'innocent' | 'abstain'
  ): Promise<void>;

  async resolveAccusation(accusationId: string): Promise<AccusationResult>;

  // Coordinator interaction
  async reportToCoordinator(
    reporterId: string,
    targetId: string
  ): Promise<CoordinatorReport>;

  async betraySyndicate(empireId: string): Promise<BetrayalResult>;

  // Victory conditions
  async checkSyndicateVictory(gameId: string): Promise<VictoryResult | null>;
}
```

### 10.3 UI Components

```typescript
// src/components/game/syndicate/LoyaltyCardReveal.tsx
// Dramatic reveal at game start (shows your role)

// src/components/game/syndicate/SyndicatePanel.tsx
// Hidden panel for Syndicate players (contracts, trust, Black Market)

// src/components/game/syndicate/SuspiciousActivityFeed.tsx
// Intel feed showing unexplained events

// src/components/game/syndicate/AccusationTrial.tsx
// Voting interface for accusations

// src/components/game/syndicate/BlackMarketPanel.tsx
// Shopping interface for restricted goods

// src/components/game/syndicate/CoordinatorInterface.tsx
// Report suspicious activity to NPC faction
```

### 10.4 Bot AI Integration

```typescript
// src/lib/bots/syndicate-ai.ts

export class SyndicateBotAI {
  // Syndicate bot decision-making
  async selectContract(
    bot: Empire,
    availableContracts: Contract[]
  ): Promise<Contract>;

  async shouldRevealIdentity(bot: Empire, gameState: GameState): Promise<boolean>;

  async shouldUseWMD(
    bot: Empire,
    target: Empire,
    contract: Contract
  ): Promise<boolean>;

  // Loyalist bot suspicion
  async evaluateSuspicion(
    bot: Empire,
    target: Empire,
    events: SuspiciousEvent[]
  ): Promise<number>;

  async shouldAccuse(
    bot: Empire,
    target: Empire,
    suspicionScore: number
  ): Promise<boolean>;

  async voteOnAccusation(
    bot: Empire,
    accusation: Accusation
  ): Promise<'guilty' | 'innocent' | 'abstain'>;
}
```

### 10.5 Turn Processing Integration

```typescript
// Added to src/lib/game/services/turn-processor.ts

async function processTurn(gameId: string) {
  // ... existing phases ...

  // Phase 14: Syndicate Contract Processing
  await processSyndicateContracts(gameId);

  // Phase 15: Trust Decay (every 10 turns)
  if (turn % 10 === 0) {
    await applySyndicateTrustDecay(gameId);
  }

  // Phase 16: Suspicion Events
  await generateSuspiciousEvents(gameId);

  // Phase 17: Accusation Voting Resolution
  await resolveActiveAccusations(gameId);

  // Phase 18: Syndicate Victory Check
  const syndicateVictory = await checkSyndicateVictory(gameId);
  if (syndicateVictory) {
    return syndicateVictory;
  }

  // ... continue with standard victory checks ...
}
```

---

## 11. Balance Targets

### 11.1 Win Rate Targets

**Syndicate Victory Rate:** 15-20% of games
- High skill ceiling (requires stealth + strategy)
- Dramatic when it happens (not too common)

**Loyalist Detection Rate:** 60-70% of Syndicate players outed
- Accusation system should work most of the time
- But some Syndicate players should succeed

**False Accusation Rate:** 20-30% of accusations
- Paranoia is part of the game
- Penalty prevents spam

### 11.2 Progression Pacing

**First Contract:** Turn 20-40 (establish role)
**Second Contract:** Turn 60-100 (mid-game pressure)
**Third Contract:** Turn 120-180 (endgame rush)

**Trust Progression:**
- Level 3 by Turn 50 (basic functionality)
- Level 6 by Turn 100 (WMD access)
- Level 8 by Turn 150 (if dedicated)

### 11.3 Economic Balance

**Syndicate Credits Earned:** 150,000-300,000 over full game
**Black Market Price Multiplier:** 1.25×-2.0× normal prices
**Net Disadvantage:** Syndicate players trade efficiency for power

---

## 12. Narrative Integration

### 12.1 The Shadow Emerges Event

**Triggers:**
- Turn 50 (minimum)
- OR first contract completed
- OR first WMD purchased from Black Market

**Effects:**
- Galaxy-wide announcement (see Section 1.3)
- Accusation system unlocks
- Bot messages shift tone (suspicious)
- Coalition "Stop the Syndicate" formation increases

### 12.2 Bot Message Templates

**70 new message templates added:**
- Syndicate hints (subtle and overt)
- Loyalist suspicions
- Accusation defenses
- Coalition coordination
- Post-outing reactions
- Victory/defeat acknowledgment

---

## Conclusion

The Syndicate system transforms Nexus Dominion from a pure 4X strategy game into a **hidden role game with 4X elements**. The tension between building your empire and completing secret contracts creates a unique experience where every action is scrutinized, alliances are suspect, and victory can come from the shadows.

**Key Features:**
✅ Hidden role assignment (Loyalist vs Syndicate)
✅ Secret contract system with 14 contract types
✅ Trust progression (0-8 levels)
✅ Black Market with WMDs and restricted tech
✅ Accusation trials with voting
✅ Coordinator NPC faction
✅ Bot integration with archetype weighting
✅ Asymmetric victory conditions
✅ Dramatic revelation moments

**Implementation Priority:** Core game feature, implement in Milestone 11.

---

**END SPECIFICATION**
