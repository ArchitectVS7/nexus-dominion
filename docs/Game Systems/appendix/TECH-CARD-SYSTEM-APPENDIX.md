# Tech Card System - Appendix

**Parent Document:** [TECH-CARD-SYSTEM.md](../TECH-CARD-SYSTEM.md)
**Purpose:** Code examples, detailed formulas, and extensive data tables

---

## Table of Contents

1. [Bot Decision Logic](#1-bot-decision-logic)
2. [Database Schema](#2-database-schema)
3. [Service Architecture](#3-service-architecture)
4. [UI Components](#4-ui-components)

---

## 1. Bot Decision Logic

Complete pseudocode for bot draft decision-making across all three tiers.

### 1.1 Tier 1 (Hidden Objective)

```typescript
function selectHiddenObjective(bot: Empire, options: Card[]): Card {
  // 90% follow archetype preference
  if (Math.random() < 0.9) {
    const preferred = options.find(c => c.name === bot.archetype.preferredT1);
    if (preferred) return preferred;
  }

  // 10% random (unpredictability)
  return options[Math.floor(Math.random() * options.length)];
}
```

### 1.2 Tier 2 (Tactical Cards)

```typescript
function selectTacticalCard(bot: Empire, options: Card[]): Card {
  // Strategic bots analyze synergies
  if (bot.tier === 'strategic') {
    // If has War Machine doctrine, prefer offensive cards
    if (bot.researchDoctrine === 'war_machine') {
      const offensive = options.find(c =>
        c.name === 'Plasma Torpedoes' || c.name === 'Ion Cannons'
      );
      if (offensive) return offensive;
    }

    // If has Fortress doctrine, prefer defensive cards
    if (bot.researchDoctrine === 'fortress') {
      const defensive = options.find(c =>
        c.name === 'Shield Arrays' || c.name === 'Point Defense'
      );
      if (defensive) return defensive;
    }

    // Counter-pick: If enemy has Shock Troops, draft Shield Arrays
    const threats = analyzeThreats(bot);
    if (threats.hasShockTroops) {
      const counter = options.find(c => c.name === 'Shield Arrays');
      if (counter) return counter;
    }
  }

  // Reactive bots pick based on current game state
  if (bot.tier === 'reactive') {
    // If losing, prefer economic cards for recovery
    if (bot.ranking > 50) {
      const economic = options.find(c =>
        c.tags?.includes('economic')
      );
      if (economic) return economic;
    }

    // If winning, prefer offensive cards to press advantage
    if (bot.ranking <= 10) {
      const offensive = options.find(c =>
        c.tags?.includes('offensive')
      );
      if (offensive) return offensive;
    }
  }

  // Chaotic bots pick randomly
  return options[Math.floor(Math.random() * options.length)];
}
```

### 1.3 Tier 3 (Legendary Cards)

```typescript
function selectLegendaryCard(bot: Empire, options: Card[]): Card {
  // Desperate bots (bottom 25%) prioritize comeback cards
  if (bot.ranking > 75) {
    const comeback = options.find(c =>
      c.name === 'Planet Cracker' || c.name === 'Economic Collapse'
    );
    if (comeback) return comeback;
  }

  // Dominant bots (top 10%) prioritize finishing cards
  if (bot.ranking <= 10) {
    const finisher = options.find(c =>
      c.name === 'Dyson Swarm' || c.name === 'Quantum Superweapon'
    );
    if (finisher) return finisher;
  }

  // Default: Follow archetype preference
  const preferred = options.find(c => c.name === bot.archetype.preferredT3);
  return preferred || options[0];
}
```

---

## 2. Database Schema

Complete SQL schema definitions for all tech card tables.

### 2.1 Card Templates (Static Data)

```sql
-- Card templates (static data)
CREATE TABLE tech_card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  tier INTEGER NOT NULL, -- 1, 2, 3
  card_type VARCHAR(30) NOT NULL, -- 'hidden_objective', 'tactical', 'legendary'

  -- Card content
  flavor_text TEXT,
  effect_description TEXT NOT NULL,
  effect_mechanics JSONB NOT NULL, -- Structured effect data

  -- Combat integration
  combat_phase VARCHAR(30), -- 'first_round', 'all_rounds', 'post_combat'
  modifier_type VARCHAR(30), -- 'damage_bonus', 'ac_bonus', 'special'
  modifier_value JSONB, -- {amount: 2, condition: 'first_round'}

  -- Counter-play
  countered_by VARCHAR(100), -- Card name or strategy
  counters VARCHAR(100), -- What this card counters

  -- Costs
  activation_cost_credits INTEGER DEFAULT 0,
  activation_cost_ore INTEGER DEFAULT 0,
  activation_cost_petroleum INTEGER DEFAULT 0,
  min_turn INTEGER DEFAULT 1,

  -- Scoring (T1 only)
  scoring_condition VARCHAR(100), -- 'credits_earned', 'empires_eliminated', etc.
  vp_per_unit INTEGER, -- VP per scoring unit
  vp_max INTEGER, -- Maximum VP from this card

  -- Metadata
  rarity VARCHAR(20), -- 'common', 'uncommon', 'rare', 'legendary'
  tags TEXT[], -- ['offensive', 'economic', 'defensive']
  icon VARCHAR(10), -- Emoji or icon identifier

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tech_card_templates_tier ON tech_card_templates(tier);
CREATE INDEX idx_tech_card_templates_type ON tech_card_templates(card_type);
CREATE INDEX idx_tech_card_templates_tags ON tech_card_templates USING GIN(tags);
```

### 2.2 Empire Card Hands

```sql
-- Player/bot card hands
CREATE TABLE empire_tech_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  card_template_id UUID NOT NULL REFERENCES tech_card_templates(id),

  -- Acquisition
  acquired_turn INTEGER NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE, -- T1 hidden objectives
  draft_position INTEGER, -- 1st, 2nd, 3rd pick in draft

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_turn INTEGER,
  is_expended BOOLEAN DEFAULT FALSE, -- One-use cards

  -- Scoring (T1 only)
  current_progress INTEGER DEFAULT 0, -- e.g., credits earned toward objective
  vp_earned INTEGER DEFAULT 0, -- Calculated at game end

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(empire_id, card_template_id) -- Can't have duplicate cards
);

-- Indexes
CREATE INDEX idx_empire_tech_cards_empire ON empire_tech_cards(empire_id);
CREATE INDEX idx_empire_tech_cards_template ON empire_tech_cards(card_template_id);
CREATE INDEX idx_empire_tech_cards_hidden ON empire_tech_cards(is_hidden) WHERE is_hidden = true;
```

### 2.3 Draft Events Log

```sql
-- Draft events log
CREATE TABLE tech_card_draft_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  draft_order UUID[], -- Empire IDs in draft order

  -- Offered cards (for reconstruction/debugging)
  cards_offered JSONB, -- [{empire_id, cards: [id1, id2, id3]}]
  cards_selected JSONB, -- [{empire_id, selected_card_id}]

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tech_card_draft_events_game ON tech_card_draft_events(game_id);
CREATE INDEX idx_tech_card_draft_events_turn ON tech_card_draft_events(turn_number);
```

### 2.4 Card Usage in Combat

```sql
-- Card usage in combat (for combat log)
CREATE TABLE tech_card_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combat_id UUID NOT NULL REFERENCES combats(id) ON DELETE CASCADE,
  empire_id UUID NOT NULL REFERENCES empires(id) ON DELETE CASCADE,
  card_template_id UUID NOT NULL REFERENCES tech_card_templates(id),

  -- Effect details
  effect_applied JSONB, -- What actually happened
  was_countered BOOLEAN DEFAULT FALSE,
  countered_by_card_id UUID REFERENCES tech_card_templates(id),

  turn_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tech_card_usage_log_combat ON tech_card_usage_log(combat_id);
CREATE INDEX idx_tech_card_usage_log_empire ON tech_card_usage_log(empire_id);
CREATE INDEX idx_tech_card_usage_log_card ON tech_card_usage_log(card_template_id);
```

---

## 3. Service Architecture

Complete service implementation with all methods.

### 3.1 TechCardService

```typescript
// src/lib/game/services/tech-card-service.ts

export interface DraftEvent {
  turn: number;
  order: Empire[];
  offers: Array<{
    empireId: string;
    cards: Card[];
  }>;
}

export interface CombatModifiers {
  attackerDamageBonus: number;
  attackerACBonus: number;
  defenderDamageBonus: number;
  defenderACBonus: number;
  specialEffects: string[];
  counters?: CounterResult[];
}

export interface CounterResult {
  counteredCard: string;
  counterCard: string;
  effect: string;
}

export class TechCardService {
  /**
   * Generate a draft event for a specific turn
   * @spec REQ-TECH-001, REQ-TECH-009
   */
  async generateDraftEvent(
    gameId: string,
    turn: number
  ): Promise<DraftEvent> {
    const tier = this.determineDraftTier(turn);
    const empires = await this.getEmpiresInGame(gameId);
    const draftOrder = this.rollDraftOrder(empires); // d20 + CHA

    const event: DraftEvent = {
      turn,
      order: draftOrder,
      offers: []
    };

    for (const empire of draftOrder) {
      const availableCards = await this.getAvailableCards(tier, gameId);
      const offered = this.selectRandomCards(availableCards, 3);
      event.offers.push({ empireId: empire.id, cards: offered });
    }

    return event;
  }

  /**
   * Execute a draft selection
   * @spec REQ-TECH-001, REQ-TECH-003
   */
  async executeDraft(
    empireId: string,
    cardId: string,
    draftEventId: string
  ): Promise<void> {
    // Add card to empire's hand
    await this.addCardToHand(empireId, cardId);

    // Remove card from available pool for this draft
    await this.removeCardFromDraftPool(draftEventId, cardId);

    // Create public announcement (unless T1 hidden objective)
    const card = await this.getCard(cardId);
    if (card.tier !== 1) {
      await this.announceCardDraft(empireId, cardId);
    }

    // Trigger bot reactions
    await botService.reactToDraft(empireId, cardId);
  }

  /**
   * Apply tech cards to combat resolution
   * @spec REQ-TECH-009
   */
  async applyTechCardsToCombat(
    combat: Combat
  ): Promise<CombatModifiers> {
    const attackerCards = await this.getActiveCards(combat.attackerId);
    const defenderCards = await this.getActiveCards(combat.defenderId);

    const modifiers: CombatModifiers = {
      attackerDamageBonus: 0,
      attackerACBonus: 0,
      defenderDamageBonus: 0,
      defenderACBonus: 0,
      specialEffects: []
    };

    // Apply attacker cards
    for (const card of attackerCards) {
      if (card.combatPhase === 'first_round' && combat.round === 1) {
        modifiers.attackerDamageBonus += card.modifierValue.amount;
        await this.logCardUsage(combat.id, combat.attackerId, card.id);
      }
    }

    // Apply defender cards
    for (const card of defenderCards) {
      if (card.modifierType === 'negate_surprise') {
        modifiers.specialEffects.push('surprise_negated');
      }
    }

    // Check for counter-play
    const counters = this.resolveCounters(attackerCards, defenderCards);
    modifiers.counters = counters;

    return modifiers;
  }

  /**
   * Score hidden objectives at game end
   * @spec REQ-TECH-002, REQ-TECH-006
   */
  async scoreHiddenObjectives(gameId: string): Promise<Map<string, number>> {
    const empires = await this.getEmpiresInGame(gameId);
    const scores = new Map<string, number>();

    for (const empire of empires) {
      const objective = await this.getHiddenObjective(empire.id);
      if (!objective) continue;

      const progress = await this.calculateObjectiveProgress(
        empire,
        objective
      );

      const vp = this.calculateVP(objective, progress);
      scores.set(empire.id, vp);

      // Store in database for reveal screen
      await this.updateObjectiveScore(empire.id, objective.id, vp);
    }

    return scores;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Determine which tier to draft based on turn number
   * @spec REQ-TECH-009
   */
  private determineDraftTier(turn: number): number {
    if (turn === 1) return 1; // Hidden objective
    if (turn < 50) return 2; // Tactical cards
    return 3; // Legendary cards (mixed with T2)
  }

  /**
   * Roll draft order using d20 + CHA
   * @spec REQ-TECH-009
   */
  private rollDraftOrder(empires: Empire[]): Empire[] {
    return empires
      .map(e => ({
        empire: e,
        roll: this.rollD20() + this.getCHAModifier(e)
      }))
      .sort((a, b) => b.roll - a.roll)
      .map(r => r.empire);
  }

  /**
   * Resolve counter-play between attacker and defender cards
   * @spec REQ-TECH-008
   */
  private resolveCounters(
    attackerCards: Card[],
    defenderCards: Card[]
  ): CounterResult[] {
    const counters: CounterResult[] = [];

    for (const aCard of attackerCards) {
      for (const dCard of defenderCards) {
        if (dCard.counters === aCard.name) {
          counters.push({
            counteredCard: aCard.name,
            counterCard: dCard.name,
            effect: `${dCard.name} negates ${aCard.name}`
          });
        }
      }
    }

    return counters;
  }

  /**
   * Calculate VP for a hidden objective
   * @spec REQ-TECH-002
   */
  private calculateVP(objective: Card, progress: number): number {
    const vpPerUnit = objective.vp_per_unit || 0;
    const vpMax = objective.vp_max || 0;
    const calculated = vpPerUnit * progress;
    return Math.min(calculated, vpMax);
  }

  /**
   * Roll a d20 die
   */
  private rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

  /**
   * Get CHA modifier for an empire
   */
  private getCHAModifier(empire: Empire): number {
    // Convert CHA stat (0-30) to D20 modifier (-5 to +10)
    return Math.floor((empire.charisma - 10) / 2);
  }
}
```

---

## 4. UI Components

Complete UI component interfaces and props definitions.

### 4.1 TechCardHand

```typescript
// src/components/game/techcards/TechCardHand.tsx

interface TechCardHandProps {
  empireId: string;
  cards: TechCard[];
  hiddenObjective?: TechCard;
  objectiveProgress?: number;
  onCardDetails: (cardId: string) => void;
}

/**
 * Displays player's current tech cards
 * Shows 4-5 tactical/legendary cards + hidden objective progress
 */
export function TechCardHand({
  empireId,
  cards,
  hiddenObjective,
  objectiveProgress,
  onCardDetails
}: TechCardHandProps) {
  // Implementation
}
```

### 4.2 DraftModal

```typescript
// src/components/game/techcards/DraftModal.tsx

interface DraftModalProps {
  offeredCards: TechCard[];
  draftPosition: number;
  totalEmpires: number;
  alreadyTaken: string[]; // Card names already drafted
  onSelect: (cardId: string) => void;
  onCancel?: () => void;
}

/**
 * Modal for card selection during drafts
 * Shows 3 cards, player picks 1
 * Displays draft order and already-taken cards
 */
export function DraftModal({
  offeredCards,
  draftPosition,
  totalEmpires,
  alreadyTaken,
  onSelect,
  onCancel
}: DraftModalProps) {
  // Implementation
}
```

### 4.3 CardDetailPanel

```typescript
// src/components/game/techcards/CardDetailPanel.tsx

interface CardDetailPanelProps {
  card: TechCard;
  showUsageHistory?: boolean;
  usageCount?: number;
  lastUsedTurn?: number;
}

/**
 * Detailed card view with full mechanics, counters, and flavor
 * Optionally shows usage history
 */
export function CardDetailPanel({
  card,
  showUsageHistory,
  usageCount,
  lastUsedTurn
}: CardDetailPanelProps) {
  // Implementation
}
```

### 4.4 EnemyCardDisplay

```typescript
// src/components/game/techcards/EnemyCardDisplay.tsx

interface EnemyCardDisplayProps {
  empireId: string;
  empireName: string;
  knownCards: TechCard[];
  researchDoctrine?: string;
  researchSpecialization?: string;
}

/**
 * Shows known enemy cards (public drafts)
 * Hidden objective remains secret until game end
 * Shows research doctrine for context
 */
export function EnemyCardDisplay({
  empireId,
  empireName,
  knownCards,
  researchDoctrine,
  researchSpecialization
}: EnemyCardDisplayProps) {
  // Implementation
}
```

### 4.5 HiddenObjectiveReveal

```typescript
// src/components/game/techcards/HiddenObjectiveReveal.tsx

interface HiddenObjectiveRevealProps {
  objectives: Array<{
    empire: Empire;
    objective: TechCard;
    progress: number;
    vpEarned: number;
    oldScore: number;
    newScore: number;
  }>;
}

/**
 * End-game reveal screen showing all hidden objectives
 * Displays progress, VP earned, and final scores
 * Creates "aha!" moments
 */
export function HiddenObjectiveReveal({
  objectives
}: HiddenObjectiveRevealProps) {
  // Implementation
}
```

### 4.6 CombatCardEffects

```typescript
// src/components/game/combat/CombatCardEffects.tsx

interface CombatCardEffectsProps {
  combat: Combat;
  attackerCards: TechCard[];
  defenderCards: TechCard[];
  modifiers: CombatModifiers;
}

/**
 * Shows active card effects during combat
 * Displays modifiers, counters, and net effect
 * Real-time combat UI integration
 */
export function CombatCardEffects({
  combat,
  attackerCards,
  defenderCards,
  modifiers
}: CombatCardEffectsProps) {
  // Implementation
}
```

---

**END APPENDIX**
