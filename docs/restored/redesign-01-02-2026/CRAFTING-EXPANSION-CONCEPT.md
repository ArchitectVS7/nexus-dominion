# Crafting System: Expansion Concept

**Status**: QUARANTINED — Future Expansion Content
**Date**: 2026-01-02
**Requires**: Base game release + player demand

---

## Why This Was Cut

The original crafting system (22 resources across 4 tiers) was **logistics management bolted onto empire strategy**. It created a parallel economy that didn't integrate with the core loop of combat, bots, and territorial control.

This document reimagines crafting as **expansion content** with proper design intent.

---

## Design Principles for Expansion

1. **Draft, Don't Manage** — Pick from options, don't run a supply chain
2. **Visible Effects** — Enemy sees your tech, reacts to it
3. **Combat Integration** — Every crafted item changes how battles play
4. **Bot Drama** — Bots announce tech milestones, fear/desire your items
5. **Asymmetric Advantage** — Tech creates playstyle, not just stat bonuses
6. **Hidden Objectives** — Lord of Waterdeep-style end-game reveals

---

## Core Concept: Tech Cards

Replace the 4-tier supply chain with a **Tech Card draft system**.

### How It Works

1. **Tech Deck** — 30-40 unique tech cards in the game
2. **Turn 1** — Each player draws 3, keeps 1 (hidden)
3. **Every 10 turns** — Draft event: Draw 2, keep 1 (public)
4. **End of game** — Hidden card revealed, bonus scored

### Tech Card Anatomy

```
┌─────────────────────────────────┐
│ PLASMA TORPEDOES         [T2]  │
├─────────────────────────────────┤
│                                 │
│  "The first volley decides      │
│   most battles."                │
│                                 │
│  ───────────────────────────    │
│                                 │
│  COMBAT: +20% damage in         │
│  first round of combat          │
│                                 │
│  VISIBLE: Enemies see a         │
│  "torpedo" icon on your fleet   │
│                                 │
│  COUNTER: Shield Arrays         │
│  reduce effect to +10%          │
│                                 │
├─────────────────────────────────┤
│  Cost: 2,000 credits + 50 ore   │
│  Activation: Turn 20+           │
└─────────────────────────────────┘
```

### Card Tiers

| Tier | Draw Timing | Power Level | Visibility |
|------|-------------|-------------|------------|
| **T1** | Turn 1 (hidden) | Moderate | Revealed at game end |
| **T2** | Turn 10, 20, 30 | Strong | Public when drafted |
| **T3** | Turn 50+ | Game-changing | Announced to all players |

---

## Sample Tech Cards

### Tier 1 Cards (Hidden Objectives)

These are drawn Turn 1 and kept secret until game end. They reward specific playstyles.

| Card | Hidden Bonus | Reveal Text |
|------|--------------|-------------|
| **Warmonger's Arsenal** | +2 VP per empire eliminated | "My weapons were always destined for conquest." |
| **Merchant's Ledger** | +1 VP per 10,000 credits earned | "Every transaction brought me closer to victory." |
| **Diplomat's Archive** | +2 VP per active treaty at game end | "My alliances were my true strength." |
| **Survivor's Grit** | +3 VP if never lost a planet | "They never touched my homeworld." |
| **Opportunist's Eye** | +1 VP per planet captured from top 3 players | "I only struck the mighty." |

**Lord of Waterdeep Inspiration**: Players don't know each other's hidden objectives. A "peaceful" player might secretly be scoring Warmonger points. A "warlike" player might be protecting treaties for Diplomat points.

### Tier 2 Cards (Public Draft)

These are drafted publicly every 10 turns. Everyone sees what you pick.

| Card | Combat Effect | Counter |
|------|---------------|---------|
| **Plasma Torpedoes** | +20% first-round damage | Shield Arrays |
| **Cloaking Field** | 30% chance to avoid first attack | Scanner Arrays |
| **Regenerative Hull** | Recover 10% losses after battle | Plasma Torpedoes (overkill) |
| **Ion Cannons** | Disable enemy stations for 1 turn | Hardened Circuits |
| **Boarding Parties** | Capture 5% enemy units instead of destroying | Point Defense |
| **EMP Burst** | Cancel enemy tech card effects for this battle | Shielded Core |

**Draft Drama**: "The Warlord just drafted Plasma Torpedoes. Everyone with Shield Arrays breathes easier. Everyone without is suddenly worried."

### Tier 3 Cards (Announced)

These are rare, powerful, and create game-changing moments.

| Card | Effect | Announcement |
|------|--------|--------------|
| **Planet Cracker** | Destroy 1 planet permanently (remove from game) | "THE WEAPON IS ARMED. A world will die." |
| **Dyson Swarm** | Double income from all planets | "Infinite energy flows to my empire." |
| **Mind Control Array** | Force one bot to attack another | "Their admiral now serves me." |
| **Temporal Stasis** | Skip one player's turn (including yourself) | "Time itself bends to my will." |
| **Genesis Device** | Create a new planet in your sector | "Where there was void, now there is life." |

**Capstone Drama**: Tier 3 cards should feel like "boss abilities." When someone drafts one, the galaxy reacts.

---

## Bot Integration

### Archetype Preferences

| Archetype | Preferred Cards | Avoids |
|-----------|-----------------|--------|
| Warlord | Plasma Torpedoes, Planet Cracker | Diplomat's Archive |
| Turtle | Shield Arrays, Regenerative Hull | Boarding Parties |
| Merchant | Dyson Swarm, Merchant's Ledger | Warmonger's Arsenal |
| Schemer | Mind Control, Cloaking Field | Direct combat cards |
| Diplomat | Diplomat's Archive, Genesis Device | Planet Cracker |

### Bot Announcement Messages

On draft:
```
[Warlord] "Plasma Torpedoes. Your shields mean nothing now."
[Turtle] "Shield Arrays installed. Come test them."
[Schemer] "I've acquired... something useful. You'll see."
```

On Tier 3:
```
[Warlord + Planet Cracker] "Choose which of your worlds dies, or I choose for you."
[Merchant + Dyson Swarm] "My wealth now eclipses your entire empire."
[Schemer + Mind Control] "Your 'ally' has new orders."
```

---

## Hidden Objective Reveal (End Game)

At game end (Turn 200 or victory achieved), all hidden T1 cards reveal:

```
┌─────────────────────────────────────────────────────────┐
│              HIDDEN OBJECTIVES REVEALED                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PLAYER: Merchant's Ledger                              │
│  "Every transaction brought me closer to victory."      │
│  Bonus: +4 VP (40,000 credits earned)                   │
│                                                         │
│  EMPEROR VARKUS: Warmonger's Arsenal                    │
│  "My weapons were always destined for conquest."        │
│  Bonus: +6 VP (3 empires eliminated)                    │
│                                                         │
│  LADY CHEN: Survivor's Grit                             │
│  "They never touched my homeworld."                     │
│  Bonus: +3 VP (never lost a planet)                     │
│                                                         │
│  THE COLLECTIVE: Diplomat's Archive                     │
│  "My alliances were my true strength."                  │
│  Bonus: +4 VP (2 treaties active)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

This creates post-game discussion: "I thought Varkus was playing aggressively because he's a Warlord, but he was also scoring his hidden objective!"

---

## Catch-Up Mechanic Integration

**Lord of Waterdeep Bonus**: At end of game, all players receive a small bonus based on their rank:

| Final Rank | Catch-Up Bonus |
|------------|----------------|
| 1st | +0 VP |
| 2nd | +1 VP |
| 3rd-5th | +2 VP |
| 6th-10th | +3 VP |
| 11th+ | +4 VP |

This compresses final scores and makes hidden objectives more impactful. A player in 5th place with a well-played hidden objective might jump to 2nd.

---

## Why This Works (Where Original Failed)

| Original Crafting | Expansion Crafting |
|-------------------|-------------------|
| 22 resources to manage | 30-40 cards to draft |
| Supply chain logistics | Single choice per event |
| Invisible progress | Public drafts + hidden objectives |
| No combat integration | Every card affects combat |
| No bot reaction | Bots announce, prefer, counter |
| No end-game payoff | Hidden objective reveal |

---

## Implementation Notes (For Future)

### Database Schema

```sql
CREATE TABLE tech_cards (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  tier INTEGER, -- 1, 2, 3
  effect_type VARCHAR(30), -- 'combat', 'economic', 'special'
  effect_json JSONB,
  counter_card_id UUID REFERENCES tech_cards(id),
  flavor_text TEXT
);

CREATE TABLE empire_tech_cards (
  empire_id UUID REFERENCES empires(id),
  card_id UUID REFERENCES tech_cards(id),
  is_hidden BOOLEAN DEFAULT false,
  acquired_turn INTEGER,
  PRIMARY KEY (empire_id, card_id)
);

CREATE TABLE tech_draft_events (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  turn_number INTEGER,
  available_cards UUID[], -- 2-3 cards offered
  drafting_order UUID[] -- empire IDs in draft order
);
```

### Service Architecture

```typescript
// tech-draft-service.ts
export async function generateDraftEvent(gameId: string, turn: number): Promise<DraftEvent>;
export async function executeDraft(empireId: string, cardId: string): Promise<void>;
export async function getEmpireTechCards(empireId: string): Promise<TechCard[]>;
export async function applyTechCardToCombat(empireId: string, combat: Combat): Promise<Combat>;
export async function revealHiddenObjectives(gameId: string): Promise<RevealResult[]>;
```

### UI Components

- **DraftPanel** — Shows available cards, pick timer, other players' picks
- **TechDisplay** — Shows your cards + known enemy cards
- **CombatPreview** — Shows which tech cards will activate
- **EndGameReveal** — Dramatic hidden objective animation

---

## Expansion Packaging

If released as expansion content:

**"Nexus Dominion: Tech Wars"**
- 40 Tech Cards (12 T1 hidden, 20 T2 public, 8 T3 legendary)
- Draft event system
- Hidden objective mechanics
- 8 new bot announcement message sets
- Counter-play combat system

Pricing: $4.99 DLC or included in "Complete Edition"

---

## Open Design Questions

1. **Should T1 hidden cards be draftable or randomly assigned?**
   - Draft = more agency, but reveals information through pick order
   - Random = pure hidden information, but less player control

2. **How many tech cards can a player hold?**
   - Unlimited = power creep over time
   - Limited (5?) = forces choices about which to keep

3. **Should tech cards be tradeable between players?**
   - Yes = diplomacy depth, "I'll give you Shield Arrays for NAP"
   - No = simpler, prevents kingmaking

4. **Should Tier 3 cards be single-use or permanent?**
   - Single-use = dramatic moments, but feels bad to "waste"
   - Permanent = reliable power, but less dramatic

---

*This expansion concept transforms crafting from supply chain management into strategic card drafting with hidden objectives and dramatic reveals.*
