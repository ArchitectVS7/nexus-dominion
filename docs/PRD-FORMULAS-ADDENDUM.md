# PRD Formulas & Baseline Values Addendum

**Version:** 1.0
**Created:** 2026-01-12
**Purpose:** Critical formulas and baseline values referenced in PRD but not explicitly defined

---

## Overview

This document provides the explicit mathematical formulas and baseline values needed to implement requirements defined in `docs/PRD.md`. These formulas were extracted from design documents but not included in the PRD requirements themselves.

**Why This Exists:**
- PRD defines "what" systems must do
- This document defines "how" with exact formulas
- Enables implementation without ambiguity

---

## 1. Combat Formulas (REQ-COMBAT-*)

### 1.1 Universal D20 Resolution Formula

```
Attack Success = d20 + Attack Bonus ≥ Target Defense

Where:
- d20 = Random roll (1-20)
- Attack Bonus = BAB + Stat Modifier + Situational Bonuses
- Target Defense = Enemy AC
```

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 1.1

**Example:**
```
Light Cruiser attacks Heavy Cruiser
Roll: 14
Attacker ATK bonus: +5 (BAB +4, DEX +1)
Fleet coordination: +2
Total: 14 + 5 + 2 = 21

Defender AC: 18
Result: 21 ≥ 18 → HIT
```

### 1.2 Stat Modifier Calculation (Standard D&D)

```
Modifier = floor((Stat - 10) / 2)

Examples:
STR  8 → -1 modifier
STR 10 → +0 modifier
STR 12 → +1 modifier
STR 14 → +2 modifier
STR 16 → +3 modifier
STR 18 → +4 modifier
STR 20 → +5 modifier
```

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 2.2

### 1.3 Derived Stat Formulas

| Stat | Formula | Purpose |
|------|---------|---------|
| **HP (Hit Points)** | Base HP + (CON mod × unit level) | Damage absorption |
| **AC (Armor Class)** | 10 + DEX mod + armor bonus | Defense threshold |
| **Initiative** | DEX modifier | Turn order in combat |
| **Attack Bonus** | BAB + STR/DEX mod | Added to d20 roll |
| **Damage** | Weapon dice + STR mod | HP dealt on hit |

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 2.3

### 1.4 Base Attack Bonus (BAB) by Tier

```
Tier I units:   BAB +2
Tier II units:  BAB +4
Tier III units: BAB +6
```

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 2.3

### 1.5 Critical Event Effects

| Roll | Event | Mechanical Effect |
|------|-------|-------------------|
| **Natural 20** | Critical Success | 2× damage, bypass 50% DEF |
| **Natural 1** | Critical Failure | Miss, lose 1 SPEED (initiative penalty next round) |
| **18-19** | Excellent Hit | +50% damage |
| **2-3** | Glancing Blow | -50% damage (if hit) |

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 1.3

### 1.6 Morale Check Formula (REQ-COMBAT-012)

```
Triggered when: Side loses 50%+ units

Roll: d20 + Commander WIS modifier

DC 15+:    Pass → Fight to the end
DC 10-14:  Shaken → -2 to all rolls next round
DC <10:    Routed → Immediate retreat with 25% additional losses
```

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 4.4

### 1.7 Surrender Offer Formula (REQ-COMBAT-012)

```
Triggered when: Defender has 75%+ HULL losses

Roll: d20 + Attacker CHA modifier vs Defender WIS modifier

Success: Defender surrenders sector without further combat
Failure: Combat continues
```

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 4.5

### 1.8 Baseline Unit Stats (Standard Tier I)

**Fighters (Baseline):**
```
STR: 10 (+0)  DEX: 14 (+2)  CON: 10 (+0)
HP: 20 (base 20 + CON 0)
AC: 12 (10 + DEX +2)
Init: +2 (DEX)
Attack: +4 to hit (BAB +2, DEX +2)
Damage: 1d8+0 (laser cannons + STR)
```

**Heavy Cruiser (Advanced):**
```
STR: 16 (+3)  DEX: 12 (+1)  CON: 14 (+2)
HP: 40 (base 20 + CON +2 × 10)
AC: 15 (10 + DEX +1 + armor +4)
Init: +1 (DEX)
Attack: +5 to hit (BAB +4, DEX +1)
Damage: 2d8+3 (heavy cannons + STR)
```

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 3.1 (card examples)

---

## 2. Resource Production Formulas (REQ-RES-*)

### 2.1 Base Production Per Sector Type

```
Food sector:       160 food/turn
Ore sector:        112 ore/turn
Petroleum sector:  92 petroleum/turn
Commerce sector:   8,000 credits/turn
Urban sector:      1,000 credits/turn + population capacity bonus
Education sector:  +1 civil status level/turn (caps at Ecstatic)
Government sector: 300 spy points/turn
Research sector:   100 research points/turn
```

**Source:** `docs/design/GAME-DESIGN.md` Section "Sector System"

**Referenced in:** REQ-RES-002 (Sector Production)

### 2.2 Civil Status Income Multiplier (REQ-RES-003)

```
Final Income = Base Production × Civil Status Multiplier

Civil Status Multipliers:
- Ecstatic:  2.5× (or 4.0× if original values used)
- Happy:     1.5× (or 2.0× if original values used)
- Content:   1.0×
- Unhappy:   0.75×
- Angry:     0.5×
- Rioting:   0.25×
```

**Note:** PRD line 478 indicates values "need verification against code"

**Source:** `docs/PRD.md` REQ-RES-003

### 2.3 Civil Status Calculation Formula

**⚠️ DRAFT - NEEDS VALIDATION**

The PRD references civil status but does not provide the complete calculation formula for *how* civil status is determined. Proposed implementation:

**Formula:**
```
Civil Status Level = f(population_happiness, food_ratio, battle_trauma, education_bonus)

Where:
- population_happiness = base happiness from growth
- food_ratio = (Food Available / Food Required)
- battle_trauma = negative modifier from recent combat losses
- education_bonus = +1 level per Education sector (caps at Ecstatic)
```

**Proposed State Transitions (Thresholds):**
```
Ecstatic:  Happiness Score ≥ 90  (Education sectors provide direct path)
Happy:     Happiness Score 70-89
Content:   Happiness Score 40-69  (baseline)
Unhappy:   Happiness Score 20-39
Angry:     Happiness Score 5-19
Rioting:   Happiness Score < 5
```

**Education Sector Boost Mechanics:**
```
Education sectors provide: +1 civil status level per turn (non-stacking)
Max Effect: Caps at Ecstatic (cannot go higher)
Decay: Without Education sector, level decays to Content over 5 turns
```

**Recommendation:** Define explicit happiness score calculation in future PRD update. Factors to consider:
- Food surplus/deficit per capita (+/- 20 points)
- Recent battle outcomes: -10 per lost battle, +5 per victory
- Sector growth rate: +2 per sector gained
- Population growth: +1 per 1% growth rate
- Recent events (disasters: -15, victories: +10)

---

## 3. Resource Consumption Formulas

### 3.1 Population Mechanics

**⚠️ DRAFT - PROPOSED BASELINE VALUES**

**Population Growth Rate:**
```
Population Growth = Current Population × Growth Rate × Food Multiplier

Where:
- Base Growth Rate: 2% per turn (0.02)
- Food Multiplier: 1.0 if food surplus, 0.0 if deficit
```

**Food Consumption Per Capita:**
```
Food Required per Turn = Total Population × 0.5 food/capita

Example:
Population: 10,000
Food Required: 10,000 × 0.5 = 5,000 food/turn
```

**Starvation Decline Rate:**
```
Population Decline = Current Population × -10% per turn (if food deficit)

Example:
Population: 10,000
Food Available: 2,000 (deficit of 3,000)
Population Loss: 10,000 × 0.10 = -1,000 people/turn
New Population: 9,000
```

**Status:** Proposed baseline values from PRD-LEGACY. Requires balancing against sector food production (160 food/sector).

### 3.2 Military Economics

**⚠️ DRAFT - PROPOSED BASELINE VALUES**

**Maintenance Costs (Per Unit Per Turn):**
```
Unit Maintenance = (Ore Cost + Petroleum Cost) per military unit per turn

Proposed values (requires balancing):
- Fighters:      2 ore/turn, 1 petroleum/turn
- Cruisers:      5 ore/turn, 3 petroleum/turn
- Dreadnoughts: 10 ore/turn, 6 petroleum/turn
```

**Construction Costs:**
```
Unit Construction Cost = Resource Cost + Credit Cost

Proposed values (requires balancing):
- Fighters:      100 ore, 50 petroleum, 5,000 credits
- Cruisers:      250 ore, 120 petroleum, 15,000 credits
- Dreadnoughts:  500 ore, 250 petroleum, 40,000 credits
```

**Upkeep Penalties for Oversized Armies:**
```
If Total Military Power > (Owned Sectors × 100):
    Maintenance Multiplier = 1.5× (50% penalty)
    Morale Penalty = -2 to all combat rolls

Rationale: Discourages military spam, encourages territorial expansion
```

**Status:** Proposed baseline values from PRD-LEGACY. Requires balancing against sector resource production rates.

**Recommendation:** Define explicit maintenance and construction costs in future PRD update. Validate against economy to ensure military is sustainable but not trivial to maintain.

---

## 4. Bot Decision Algorithm (REQ-BOT-*)

### 4.1 Core Decision Loop

```
EACH TURN, FOR EACH BOT:

1. GATHER STATE
   ├── Own empire status (resources, military, sectors)
   ├── Relationship data (allies, enemies, neutrals)
   ├── Global game state (rankings, market prices)
   └── Recent events (attacks, messages, treaties)

2. ASSESS SITUATION
   ├── Threat analysis (who can attack us?)
   ├── Opportunity analysis (who is weak?)
   ├── Economic position (are we growing?)
   └── Alliance health (are allies reliable?)

3. STRATEGIC DECISION (varies by tier)
   ├── Tier 1: LLM analysis with personality prompt
   ├── Tier 2: Decision tree with weighted priorities
   ├── Tier 3: Simple if/then rules
   └── Tier 4: Random with constraints

4. EXECUTE ACTIONS
   ├── Military: Attack, defend, produce units
   ├── Economic: Buy/sell, adjust production
   ├── Diplomatic: Propose/accept/break treaties
   ├── Research: Choose tech path
   └── Communication: Send messages

5. LOG & LEARN
   ├── Record decision reasoning
   ├── Update relationship scores
   └── Adjust strategy if needed
```

**Source:** `docs/design/BOT-SYSTEM.md` Section "Bot Decision Engine"

**Referenced in:** REQ-BOT-001 through REQ-BOT-010

### 4.2 Decision Priority Matrix (Tier 2 Bots)

```
Action Weight = Base Priority × Emotional Modifier × Situational Adjustment

Base Priorities by Archetype:
                Attack  Defense  Alliance  Economy  Covert
Warlord:        0.90    0.50     0.30      0.40     0.50
Diplomat:       0.20    0.60     0.95      0.50     0.20
Merchant:       0.30    0.40     0.70      0.95     0.40
Turtle:         0.10    0.95     0.50      0.70     0.30
Schemer:        0.60    0.30     0.80*     0.50     0.90
Blitzkrieg:     0.95    0.20     0.20      0.50     0.40
Tech Rush:      0.30    0.50     0.40      0.60     0.30
Opportunist:    0.70    0.40     0.40      0.60     0.50

*Schemer uses alliances for deception
```

**Source:** `docs/design/BOT-SYSTEM.md` Section 8 (Decision Priority Matrix)

**Referenced in:** REQ-BOT-002 (Eight Archetypes)

### 4.3 Emotional State Modifiers (REQ-BOT-003)

```
Final Decision Accuracy = Base Accuracy × (1 + Emotional Modifier)

Emotional Modifiers:
                Decision  Alliance  Aggression  Negotiation
Confident:      +0.05     -0.20     +0.10       +0.10
Arrogant:       -0.15     -0.40     +0.30       -0.30
Desperate:      -0.10     +0.40     -0.20       -0.20
Vengeful:       -0.05     -0.30     +0.40       -0.40
Fearful:        -0.10     +0.50     -0.30       +0.10
Triumphant:     +0.10     -0.10     +0.20       -0.20
```

**Source:** `docs/design/BOT-SYSTEM.md` Section "Emotional State System"

**Referenced in:** REQ-BOT-003

### 4.4 Commander Stats by Archetype (REQ-BOT-002)

```
Commander Mental Stats (affect AI decisions, not combat):

Archetype      INT      WIS      CHA      Effects
─────────────────────────────────────────────────────────────
Warlord        12 (+1)  14 (+2)  8  (-1)  Good tactics, poor diplomacy
Diplomat       13 (+1)  14 (+2)  18 (+4)  Excellent negotiations
Tech Rush      17 (+3)  12 (+1)  10 (+0)  Fast research, logical
Turtle         14 (+2)  16 (+3)  10 (+0)  Patient, excellent defense
Schemer        13 (+1)  15 (+2)  16 (+3)  Manipulative, cunning
Merchant       14 (+2)  13 (+1)  15 (+2)  Business-savvy
Blitzkrieg     12 (+1)  10 (+0)  12 (+1)  Aggressive, impulsive
Opportunist    13 (+1)  14 (+2)  11 (+0)  Calculative vulture
```

**Effects:**
- **INT modifier:** Added to research points per turn
- **WIS modifier:** Added to retreat/morale decisions (d20 + WIS vs DC 15)
- **CHA modifier:** Added to alliance proposals and surrender negotiations

**Source:** `docs/design/COMBAT-SYSTEM.md` Section 2.4

**Referenced in:** REQ-BOT-002

### 4.5 Base Decision Accuracy (Tier-Dependent)

**⚠️ DRAFT - PROPOSED BASELINE VALUES**

The docs don't specify explicit "base decision accuracy" values per tier, only behavioral descriptions. Proposed implementation from PRD-LEGACY:

**Decision Accuracy by Tier:**

```
Tier 1 (LLM-Powered Elite):     85% optimal decisions
Tier 2 (Strategic Archetype):   70% optimal decisions
Tier 3 (Simple Rule-Based):     50% optimal decisions
Tier 4 (Random/Chaotic):        30% optimal decisions

Modified by emotional state and situational factors (see Section 4.3)
```

**LLM Prompt Templates (Tier 1 Bots):**

```
⚠️ NEEDS DEFINITION

Proposed template structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM PROMPT:
You are {bot_name}, a {archetype} commander in Nexus Dominion.
Personality: {personality_description}
Current Emotional State: {emotional_state}

CURRENT SITUATION:
- Your Empire: {empire_stats}
- Resources: {resource_summary}
- Military: {military_summary}
- Relationships: {relationship_summary}
- Game Context: Turn {turn_number}, Rank {current_rank}

RECENT EVENTS:
{last_5_events}

AVAILABLE ACTIONS:
{action_list_with_costs}

DECISION REQUIRED:
Choose your top 3 actions for this turn. Explain your strategic reasoning.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Memory Decay Curves:**

```
⚠️ NEEDS DEFINITION

Proposed decay formula:
Memory Strength = Initial Importance × e^(-decay_rate × turns_elapsed)

Where:
- decay_rate = 0.05 (5% decay per turn)
- Initial Importance: 1.0 (major events), 0.5 (minor events), 0.1 (trivial)

Examples:
Major Event (treaty broken):
  Turn 0:  100% memory strength
  Turn 10:  60% memory strength (e^(-0.05 × 10) = 0.606)
  Turn 30:  22% memory strength (e^(-0.05 × 30) = 0.223)
  Turn 50:   8% memory strength (nearly forgotten)

Retention Thresholds:
- > 50%: Recent event (actively influences decisions)
- 20-50%: Fading memory (minor influence)
- < 20%: Ancient history (ignored)
```

**Status:** Proposed baseline values from PRD-LEGACY. Requires validation through playtesting.

**Recommendation:** Define explicit accuracy targets and LLM prompt templates in future PRD update. Memory decay needs tuning to ensure bots remember important events (wars, betrayals) but don't hold grudges forever.

---

## 5. Research System Formulas (REQ-RSCH-*)

### 5.1 Research Point Accumulation (REQ-RSCH-005)

```
Research Points per Turn = (Research Sectors × 100 RP) × Civil Status Multiplier

Tier Unlock Thresholds:
- Tier 1 (Doctrine):        1,000 RP (~Turn 10 with 1 research sector)
- Tier 2 (Specialization):  5,000 RP (~Turn 30)
- Tier 3 (Capstone):        15,000 RP (~Turn 60)
```

**Source:** `docs/PRD.md` REQ-RSCH-005

### 5.2 Doctrine Bonuses (REQ-RSCH-002)

```
War Machine Doctrine:
- Combat: +2 STR to all units (permanent stat increase)
- Economic: -10% planet income (penalty)
- Unlocks: Military specializations

Fortress Doctrine:
- Combat: +4 AC when defending (bonus to armor class)
- Combat: -5% attack power (penalty when attacking)
- Unlocks: Defensive specializations

Commerce Doctrine:
- Diplomatic: +2 CHA to commander (better negotiations)
- Economic: +20% market sell prices
- Unlocks: Economic specializations
```

**Source:** `docs/PRD.md` REQ-RSCH-002

---

## 6. Sector Cost Scaling Formula (REQ-SEC-002)

**⚠️ DRAFT - PROPOSED FORMULA**

The PRD references sector cost scaling but doesn't provide the actual formula. Proposed implementation from PRD-LEGACY:

**Sector Acquisition Cost Formula:**

```
Sector Cost = Base Cost × (1 + Sector Count × 0.1)^1.5

Where:
- Base Cost: 8,000 credits
- Scaling Factor: 0.1 (10% per sector owned)
- Exponent: 1.5 (exponential growth curve)
```

**Example Calculations:**

```
Starting (5 sectors):  8,000 × (1 + 5 × 0.1)^1.5 = 8,000 × 1.837 = 14,696 cr
Early Game (10):       8,000 × (1 + 10 × 0.1)^1.5 = 8,000 × 2.828 = 22,624 cr
Mid Game (20):         8,000 × (1 + 20 × 0.1)^1.5 = 8,000 × 5.196 = 41,568 cr
Late Game (40):        8,000 × (1 + 40 × 0.1)^1.5 = 8,000 × 11.180 = 89,440 cr
Domination (60):       8,000 × (1 + 60 × 0.1)^1.5 = 8,000 × 18.520 = 148,160 cr
```

**Purchase Limits:**

```
⚠️ NEEDS DEFINITION

Proposed: No hard limit, but soft limits via:
1. Cost scaling makes expansion expensive
2. Border/Wormhole discovery requirements (only adjacent sectors available)
3. Civil status penalties if expanding too fast
```

**Destruction/Loss Mechanics:**

```
⚠️ NEEDS DEFINITION

Proposed scenarios for sector loss:
1. Military Conquest: Attacker captures defender's sector in invasion
2. Natural Disasters: (Future feature) Random event destroys sector
3. Economic Collapse: If negative credits persist for 10+ turns, lose 1 sector/turn
4. Rebellion: If civil status = Rioting for 5+ turns, lose 1 sector
```

**Referenced in:** REQ-SEC-002

**Test file:** `src/lib/formulas/sector-costs.test.ts` (needs creation)

**Status:** Proposed formula from PRD-LEGACY. Requires balancing against income rates (Commerce sector: 8,000 cr/turn means 1 sector = 1 turn income at baseline).

**Recommendation:** Validate formula ensures territorial expansion is neither too easy nor too punishing. Consider adjusting exponent (1.5) or scaling factor (0.1) based on playtesting.

---

## 7. Market System Formulas (REQ-MKT-*)

### 7.1 Market Price Calculation

**⚠️ DRAFT - NEEDS DEFINITION**

The PRD references a market system but does not provide price calculation formulas. Proposed implementation from PRD-LEGACY:

**Supply/Demand Price Formula:**

```
Market Price = Base Price × (Demand / Supply) × Volatility Factor

Where:
- Base Price: Fixed baseline per resource type
- Demand: Total buy orders across all empires
- Supply: Total sell orders across all empires
- Volatility Factor: Random fluctuation (0.9 to 1.1)
```

**Base Prices (Proposed):**

```
Resource         Base Price (per unit)
─────────────────────────────────────
Credits          1.00 (baseline currency)
Food             2.00 cr/unit
Ore              3.50 cr/unit
Petroleum        4.00 cr/unit
Research Points  10.00 cr/RP (non-tradeable?)
Spy Points       15.00 cr/SP (non-tradeable?)
```

### 7.2 Price Volatility Mechanics

**⚠️ DRAFT - NEEDS DEFINITION**

Proposed volatility system:

**Volatility Calculation:**

```
Volatility Factor = 1.0 + (Random(-0.1, +0.1) × Market Activity)

Where:
- Random(-0.1, +0.1): Random number between -10% and +10%
- Market Activity: (Total Trades This Turn / Average Trades)
  - High activity (2×): Volatility ±20%
  - Normal activity (1×): Volatility ±10%
  - Low activity (0.5×): Volatility ±5%
```

**Price Change Limits:**

```
Max Price Change per Turn: ±25%
Price Floor: 0.5× Base Price (can't go below 50%)
Price Ceiling: 3.0× Base Price (can't exceed 300%)
```

### 7.3 Trade Volume Limits

**⚠️ DRAFT - NEEDS DEFINITION**

Proposed trade limits to prevent market manipulation:

**Per-Empire Trade Limits:**

```
Max Sell Volume per Turn = Total Resource Production × 0.5 (can't sell more than 50% of production)
Max Buy Volume per Turn = Total Credits × 0.3 (can't spend more than 30% of treasury)
```

**Market Liquidity:**

```
If Supply < Demand × 0.1:
    Price increases by +15% (scarcity penalty)

If Supply > Demand × 10:
    Price decreases by -15% (oversupply penalty)
```

**Status:** Proposed formulas from PRD-LEGACY. Requires extensive balancing to prevent economic exploits.

**Recommendation:** Market system is complex and needs careful design to avoid:
1. Price manipulation by large empires
2. Economic runaway (infinite money loops)
3. Market crashes that punish all players
4. Bot AI exploiting market inefficiencies

Consider simpler "fixed NPC market" initially, then add player-to-player trading in expansion.

---

## 8. Victory Condition Thresholds (REQ-VIC-*)

These are well-defined in the PRD but repeated here for completeness:

```
Conquest Victory:    Own sectors / Total sectors ≥ 0.60  (60%)
Economic Victory:    Own networth / 2nd place networth ≥ 1.5  (150%)
Diplomatic Victory:  Coalition sectors / Total sectors ≥ 0.50  (50%)
Research Victory:    Tier 3 capstone unlocked = TRUE
Military Victory:    Own military power / (Σ All other military) ≥ 2.0  (200%)
Survival Victory:    Own score = MAX(all scores) at turn limit
```

**Source:** `docs/PRD.md` REQ-VIC-001 through REQ-VIC-006

**Status:** ✅ Fully specified

---

## 9. Formula Status Summary

The following shows the current status of formulas migrated from PRD-LEGACY:

### 9.1 Population & Civil Status
- ⚠️ **DRAFT** Civil status calculation formula (Section 2.3)
- ⚠️ **DRAFT** Population growth rate: 2%/turn (Section 3.1)
- ⚠️ **DRAFT** Population consumption of food per capita: 0.5 food/capita (Section 3.1)
- ⚠️ **DRAFT** Starvation decline rate: -10%/turn (Section 3.1)
- ⚠️ **DRAFT** Civil status change triggers and thresholds (Section 2.3)

### 9.2 Resource Consumption
- ⚠️ **DRAFT** Military unit maintenance costs (Section 3.2)
- ⚠️ **DRAFT** Unit construction costs (Section 3.2)
- ⚠️ **DRAFT** Upkeep penalties for oversized armies (Section 3.2)

### 9.3 Sector Economics
- ⚠️ **DRAFT** Sector cost scaling formula: Base × (1 + Count × 0.1)^1.5 (Section 6)
- ⚠️ **NEEDS DEFINITION** Sector purchase limits (Section 6)
- ⚠️ **NEEDS DEFINITION** Sector destruction mechanics (Section 6)

### 9.4 Bot Intelligence
- ⚠️ **DRAFT** Base decision accuracy by tier (Section 4.5)
  - Tier 1: 85%, Tier 2: 70%, Tier 3: 50%, Tier 4: 30%
- ⚠️ **NEEDS DEFINITION** LLM prompt templates for Tier 1 bots (Section 4.5)
- ⚠️ **DRAFT** Memory decay formulas: e^(-0.05 × turns) (Section 4.5)

### 9.5 Market System
- ⚠️ **DRAFT** Market price calculation (Section 7.1)
- ⚠️ **DRAFT** Price volatility mechanics (Section 7.2)
- ⚠️ **DRAFT** Trade volume limits (Section 7.3)

**Legend:**
- ✅ **COMPLETE**: Formula fully defined and validated
- ⚠️ **DRAFT**: Proposed baseline values from PRD-LEGACY, requires validation
- ❌ **NEEDS DEFINITION**: Still requires design work

---

## 10. Recommendations

### 10.1 Immediate Actions

1. **Add explicit formulas to PRD v1.6:**
   - Insert combat formulas into REQ-COMBAT-* requirements
   - Insert resource production into REQ-RES-* requirements
   - Insert bot decision weights into REQ-BOT-* requirements

2. **Create new requirements for missing formulas:**
   - REQ-RES-004: Population Growth & Food Consumption
   - REQ-RES-005: Military Maintenance Costs
   - REQ-RES-006: Civil Status Calculation Formula
   - REQ-SEC-004: Sector Cost Scaling Formula
   - REQ-MKT-002: Market Price Calculation

3. **Validate all numeric values:**
   - Playtest to ensure 60% conquest victory is achievable in 100 turns
   - Balance sector costs against income rates
   - Verify bot decision weights create interesting gameplay

### 10.2 Long-Term Process

**Establish "Formula Review" as part of PRD workflow:**

```
When adding a requirement to the PRD:
1. Define WHAT the system must do (requirement description)
2. Define HOW with explicit formula (this document)
3. Define baseline values (min/max/default)
4. Create test that validates formula produces expected outcomes
5. Mark requirement as "Draft" until all 4 steps complete
```

### 10.3 Implementation Priority

**Critical (cannot implement without):**
- Combat formulas (D20, HP, AC, damage) - ✅ COMPLETE
- Resource production rates - ✅ COMPLETE
- Victory condition thresholds - ✅ COMPLETE

**High Priority (blocks major features):**
- Population & food consumption formulas - ❌ MISSING
- Sector cost scaling - ❌ MISSING
- Bot decision accuracy values - ⚠️ PARTIAL

**Medium Priority (needed for balance):**
- Civil status calculation - ❌ MISSING
- Market price formulas - ❌ MISSING
- Military maintenance costs - ❌ MISSING

---

## 11. Validation Checklist

For each formula added to PRD:

- [ ] Formula expressed in unambiguous mathematical notation
- [ ] All variables defined with units (e.g., "food/turn", "credits", "percentage")
- [ ] Baseline values provided (min, max, default)
- [ ] Example calculation shown with realistic inputs
- [ ] Edge cases documented (e.g., "What if denominator is 0?")
- [ ] Test requirement created with expected outputs
- [ ] Implementation note added (e.g., "Use floor() not round()")

**Example of complete formula requirement:**

```markdown
### REQ-RES-007: Population Growth Formula

**Description:** Population grows each turn based on food surplus.

**Formula:**
Population Growth = Current Population × Growth Rate × Food Surplus Multiplier

Where:
- Growth Rate = 0.02 (2% base growth)
- Food Surplus Multiplier = min(1.0, Food Available / Food Required)
- Food Required = Current Population × 0.5 food/capita/turn

**Baseline Values:**
- Min Growth Rate: 0.00 (starvation, no growth)
- Max Growth Rate: 0.02 (abundant food)
- Food per Capita: 0.5 food/person/turn

**Example:**
Current Population: 10,000
Food Available: 6,000 food/turn
Food Required: 10,000 × 0.5 = 5,000 food/turn
Food Surplus Multiplier: 5,000 / 5,000 = 1.0
Population Growth: 10,000 × 0.02 × 1.0 = 200 people/turn

**Edge Cases:**
- Food Available < Food Required: Population declines at -10%/turn
- Population = 0: Cannot grow (game over condition)

**Implementation:** Use floor() for whole numbers (can't have 0.3 people)

**Tests:** `src/lib/game/services/__tests__/population-service.test.ts`

**Status:** Draft
```

---

## Appendix: Formula Sources

| Formula | Source Document | Section |
|---------|----------------|---------|
| D20 Resolution | COMBAT-SYSTEM.md | 1.1 |
| Stat Modifiers | COMBAT-SYSTEM.md | 2.2 |
| Derived Stats | COMBAT-SYSTEM.md | 2.3 |
| BAB by Tier | COMBAT-SYSTEM.md | 2.3 |
| Critical Events | COMBAT-SYSTEM.md | 1.3 |
| Morale Check | COMBAT-SYSTEM.md | 4.4 |
| Resource Production | GAME-DESIGN.md | Sector System |
| Research Points | PRD.md | REQ-RSCH-005 |
| Bot Decision Loop | BOT-SYSTEM.md | Bot Decision Engine |
| Decision Priorities | BOT-SYSTEM.md | Decision Priority Matrix |
| Emotional Modifiers | BOT-SYSTEM.md | Emotional State System |
| Commander Stats | COMBAT-SYSTEM.md | 2.4 |
| Victory Thresholds | PRD.md | REQ-VIC-001 to 006 |

---

**End of Formulas Addendum**
