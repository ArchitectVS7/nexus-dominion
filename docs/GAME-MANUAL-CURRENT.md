# NEXUS DOMINION - Current Game Manual
## (As Currently Implemented)

---

## OBJECT OF THE GAME

Become the dominant galactic empire by conquering territory, building economic power, or surviving until the final turn.

**Victory Conditions:**
- **Conquest**: Control 60% of all planets in the galaxy
- **Economic**: Achieve 150% of the average empire networth
- **Survival**: Have the highest networth when turn limit is reached (turn 200)

**Elimination**: An empire is eliminated when:
- They control 0 planets, OR
- Their population reaches 0

---

## SETUP

### Starting Resources (Per Empire)
- **9 Planets**: 2 Food, 2 Ore, 1 Petroleum, 1 Tourism, 1 Urban, 1 Government, 1 Research
- **2 Defense Stations**: Protecting home territory
- **Credits**: Starting cash for building military and expanding
- **Population**: Citizens living on your planets
- **20-Turn Protection**: New empires cannot attack or be attacked

### Planet Types and Production
- **Food**: Produces food (1 MT per 33 soldiers, 1 per 10M population needed)
- **Ore**: Produces ore for construction
- **Petroleum**: Produces petroleum (volatile pricing)
- **Tourism**: Generates income from visitors
- **Urban**: High population growth (exponential)
- **Government**: Administrative income
- **Research**: Produces research points for technology advancement

---

## TURN SEQUENCE

Each turn processes in the following phases:

### PHASE 1: Income Collection
- Each planet produces resources based on its type
- **Civil Status Multiplier** applied (0.25× to 4× based on empire health)
- Credits, food, ore, petroleum generated
- Food consumed by soldiers (1 MT per 33) and population (1 MT per 10M)

### PHASE 1.5: Tier 1 Auto-Production
- Basic resources automatically convert to crafted components
- Passive crafting system activation

### PHASE 2: Population Update
- **Growth**: Population increases based on planet types
  - Urban planets: Exponential growth
  - Other planets: Linear growth
- **Starvation**: If food shortage, population decreases
  - Deaths proportional to shortage severity
  - Can trigger elimination if population reaches 0

### PHASE 3: Civil Status Evaluation
8 levels of civil unrest based on multiple factors:
1. **Ecstatic** (4× income): Everything perfect
2. **Happy** (2× income): Prospering empire
3. **Content** (1.5× income): Stable, growing
4. **Calm** (1× income): Baseline
5. **Unrest** (0.75× income): Minor problems
6. **Chaotic** (0.5× income): Serious issues
7. **Revolting** (0.25× income): Near collapse
8. **Exploding** (0.25× income): Complete breakdown

**Factors**:
- Food shortage: Major penalty
- Population starvation: Severe penalty
- Lost battles: Morale hit
- Weak military: Vulnerability penalty
- Economic strength: Positive boost

**Revolt Consequences** (consecutive turns):
- 3 turns: Lose 10% of random military units
- 5 turns: Lose 20% of random military units
- 7 turns: Lose 30% of random military units + 1 random planet
- 10 turns: **ELIMINATION** - Empire collapses

### PHASE 3.5: Research Production
- Research planets generate research points
- Points allocated to tech branches (3 branches available)
- Research unlocks unit upgrades and bonuses

### PHASE 4: Build Queue Processing
- Units under construction complete (1 turn build time each)
- New units added to empire's military forces
- Build queue continues to next item automatically

### PHASE 4.5: Covert Point Generation
- Covert agents generate espionage points
- Used for spy operations (10 types available)

### PHASE 4.6: Crafting Queue Processing
- Crafting projects complete after N turns
- Components assembled into higher-tier resources
- 4 tiers: Basic → Components → Advanced → Ultimate

### PHASE 5: Bot Decisions
- AI empires make strategic choices
  - Build units (25% weight)
  - Buy planets (12% weight)
  - Attack (10% weight, 0% during protection)
  - Diplomacy (8% weight)
  - Trade (8% weight)
  - Craft components (8% weight)
  - Covert operations (6% weight)
  - Fund research (5% weight)
  - Do nothing (5% weight)

**8 Bot Archetypes**:
- **Warlord**: High aggression (28% attack weight)
- **Diplomat**: Peace-focused (18% diplomacy, 3% attack)
- **Merchant**: Trade and expansion (22% planet buying)
- **Schemer**: Covert ops specialist (12% covert ops)
- **Turtle**: Defensive builder (28% unit building, 0% attack)
- **Blitzkrieg**: Rush attacker (32% attack weight)
- **Tech Rush**: Research focus (12% research funding)
- **Opportunist**: Targets weakened enemies (22% attack)

### PHASE 5.5: Bot Emotional Decay
- Emotional states gradually return to neutral over time
- 6 emotional states affect decision-making:
  - Confident, Arrogant, Desperate, Vengeful, Fearful, Triumphant

### PHASE 6: Market Price Update
- Resource prices fluctuate based on supply/demand
- Food, ore, petroleum prices adjust

### PHASE 7: Bot Messages
- AI empires send diplomatic messages
- Taunts, battle reports, alliance offers, betrayals

### PHASE 7.5: Galactic Events (M11)
- Random events every 10-20 turns (after turn 15)
- Effects: economic booms, disasters, tech breakthroughs

### PHASE 7.6: Alliance Checkpoints (M11)
- Checkpoints at turns 30, 60, 90, 120, 150, 180
- Coalition formation against leaders
- Diplomatic shifts

### PHASE 8: Victory/Defeat Check
- Check if any empire achieved victory condition
- Check for eliminations
- Check for stalemate warnings
- End game if winner declared

### PHASE 9: Auto-Save
- Game state saved to database
- Allows recovery from crashes

---

## COMBAT SYSTEM

### Attack Requirements
- Must be outside 20-turn protection period
- Must have military forces to commit
- Attacker chooses percentage of forces to send (30-80%)

### Three-Phase Combat
Combat resolves in **3 sequential phases**. Attacker must win **ALL 3 phases** to capture planets.

**If attacker loses ANY phase, defender wins the entire battle.**

#### PHASE 1: Space Combat
- **Cruisers vs Cruisers** determine space superiority
- Light cruisers (5× power) vs Heavy cruisers (8× power)
- **If defender wins**: Battle ends, attacker repelled
- **If attacker wins**: Proceed to Phase 2

#### PHASE 2: Orbital Combat
- **Fighters vs Defense Stations** for orbital control
- Fighters (3× power) attack, Stations (30× power, reduced from 50×) defend
- **Defender advantage**: 1.1× multiplier (reduced from 1.2×)
- **If defender wins**: Battle ends, attacker repelled
- **If attacker wins**: Proceed to Phase 3

#### PHASE 3: Ground Combat
- **Soldiers vs Soldiers** capture territory
- Soldiers (1× power base)
- **Carrier requirement**: Carriers transport soldiers (ratio enforced)
- **If defender wins**: Attacker defeated, no territory changes
- **If attacker wins**: Planets captured

### Planet Capture
- **Capture rate**: 5-15% of defender's planets per victory
- **Minimum**: Always 1 planet captured (even if 5% < 1)
- **Example**: Defender has 9 planets, attacker wins
  - Roll 10% capture rate
  - 9 × 0.10 = 0.9 → rounds to **1 planet** (minimum)
  - Defender now has 8 planets
  - **Attacker needs 9 successful battles to eliminate defender**

### Combat Power Calculation
Each unit type has effectiveness in each phase:

| Unit | Space | Orbital | Ground |
|------|-------|---------|--------|
| Soldiers | Low | None | High |
| Fighters | Low | High | None |
| Light Cruisers | High | Low | None |
| Heavy Cruisers | High | Medium | None |
| Carriers | Low | Low | None |
| Stations | Low | High | None |

**Defender Bonuses**:
- 1.1× power multiplier
- Stations 30× effectiveness (vs fighters)
- All home forces committed

**Attacker Limitations**:
- Only sends partial forces (30-80%)
- Must win all 3 phases sequentially
- Casualties across all phases

### Combat Variance
- **D20-style randomness**: Even weak forces have 5% chance
- **Favorites capped**: Strong forces have 95% max win chance
- Prevents deterministic outcomes

---

## ECONOMY

### Income Sources
- **Planet production**: Each planet type generates resources/credits
- **Civil status multiplier**: 0.25× (revolting) to 4× (ecstatic)
- **Trade**: Buy/sell resources on market

### Expenses
- **Food consumption**: 1 MT per 33 soldiers, 1 MT per 10M population
- **Unit maintenance**: Soldiers, fighters, cruisers cost credits/turn
- **Starvation penalty**: Population dies if food shortage

### Unit Costs (Build)
- Soldiers: 50 credits
- Fighters: 100 credits
- Light Cruisers: 500 credits
- Heavy Cruisers: 800 credits
- Carriers: 1,200 credits
- Defense Stations: 150 credits

### Planet Costs (Buy)
- Base costs: 5,000 - 15,000 credits
- Scaling: Cost increases with planet count

---

## DIPLOMACY

### Treaty Types
1. **Non-Aggression Pact (NAP)**: No attacks between empires
2. **Alliance**: Mutual defense + trade benefits

### Treaty Duration
- Proposed for specific number of turns
- Must be accepted by target empire
- Can be broken (reputation penalty)

### Reputation System
- Actions affect how other empires view you
- Treaty breaking: Severe penalty
- Successful attacks: Minor respect gain
- Defeats: Reputation loss

---

## SPECIAL SYSTEMS

### Crafting System (4 Tiers)
1. **Tier 1**: Basic resources (auto-produced)
2. **Tier 2**: Components (requires crafting queue)
3. **Tier 3**: Advanced resources
4. **Tier 4**: Ultimate resources

### Syndicate Contracts
- Black market missions
- Risk vs reward trades
- Contract types: smuggling, sabotage, etc.

### Research System
- 3 tech branches
- Unlocks unit upgrades
- Improves combat effectiveness

### Covert Operations (10 types)
1. Spy: Gather intelligence
2. Sabotage Production
3. Incite Rebellion
4. Steal Technology
5. Assassinate Leaders
6. Frame Enemy
7. Smuggle Resources
8. Hack Communications
9. Deploy Propaganda
10. Create False Flag

---

## KEY DESIGN QUESTIONS

### ❓ Combat Balance Issues
**Current Problem**: Attackers win only 1.2% of battles
- Sequential phase requirement too harsh?
- Defender advantage too strong?
- Planet capture rate too low?

**Current Math**:
```
9 starting planets ÷ 1 planet per win ÷ 0.012 win rate = 900 turns
Game limit: 50-200 turns
Result: 0 eliminations observed
```

### ❓ Missing Features
- **Coalition mechanics**: No gang-up on runaway leaders
- **Attack restraint**: Leaders can attack freely
- **Fog of war**: Bots may know perfect enemy information
- **Strategic depth**: Limited reason to choose different unit types

### ❓ Design Philosophy Conflicts
- **SRE lineage**: Started as clone, now diverging
- **Board game feel**: Should it be simpler, more elegant?
- **Complexity**: How much is too much?
  - 8 archetypes
  - 10 covert ops
  - 4-tier crafting
  - 3 research branches
  - 7 planet types
  - 6 unit types
  - 8 civil status levels

**Is this elegant or overwhelming?**

---

## CURRENT IMPLEMENTATION STATUS

✅ **Fully Implemented**:
- Turn processing pipeline
- Combat system (3 phases)
- Civil status
- Population growth/starvation
- Bot archetypes
- Emotional states
- Build queue
- Crafting system
- Covert operations
- Research system
- Diplomacy
- Victory conditions

⚠️ **Partially Working**:
- Combat balance (0 eliminations)
- Bot variety (needs testing)
- Fog of war (not clear if implemented)

❌ **Missing Critical Features**:
- Coalition formation against leaders
- Attack restraint for dominant empires
- Multi-run balance testing
- Elimination tracking (who killed whom)

---

## END OF CURRENT MANUAL

This represents the game **as currently implemented**.

Next: Fresh redesign from first principles.
