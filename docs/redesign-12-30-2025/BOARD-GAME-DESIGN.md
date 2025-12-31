# NEXUS DOMINION: THE BOARD GAME
## A Deck-Driven Space Empire Game for 2-4 Players

---

## DESIGN PHILOSOPHY

This document explores Nexus Dominion as a **physical board game** - a streamlined, tactile experience inspired by the GAME-MANUAL-REDESIGN.md vision and deck-driven AI systems like D&D Adventure System games.

**Key Principle**: The digital version can embrace complexity because computers handle it. The board game must strip to essentials while maintaining strategic depth and the core space empire fantasy.

---

## PART 1: CORE DESIGN DECISIONS

### Player Count & Structure
**2-4 Players + The Pirate Threat (AI)**

- **Competitive Mode** (default): Race to 10 Victory Points while managing the escalating pirate threat
- **Cooperative Mode** (variant): All players vs the Pirate Armada - survive 15 turns and achieve collective 25 VP
- **Semi-Cooperative Mode** (advanced): Highest VP when pirates are defeated wins, but if pirates win, everyone loses

### The Pirate Threat Design
Instead of 100 bots, ONE persistent threat: **The Pirate Armada**

- Controlled by a **Behavior Deck** (30 cards)
- Escalates from raids to full invasions
- Occupies neutral planets, blocks expansion
- Creates pressure to cooperate OR race ahead
- Inspired by D&D Adventure System games (Ravenloft, Wrath of Ashardalon)

### Victory Conditions
**First to 10 Victory Points OR last empire standing**

VP Sources (from redesign):
- Territory: 1 VP per 5 planets
- Dominance: 2 VP if most planets this turn
- Wealth: 1 VP per 50 credits banked
- Research: 2 VP per completed tech
- Conquest: 3 VP per empire eliminated (by you)
- Pirate Bounty: 1 VP per 3 pirate ships destroyed

---

## PART 2: PHYSICAL COMPONENTS

### What's in the Box

**Game Board**
- Modular hex map (7-12 hex tiles depending on player count)
- Each hex represents a SECTOR with 3-5 planet spaces
- Wormhole connectors between distant sectors (creates shortcuts)

**Player Components (4 sets in different colors)**
- 1 Empire Board (tracks resources, military power, research)
- 5 Starting Planet Tokens (colored discs with icons)
- 40 Military Power Cubes (abstract units)
- 10 Defense Station Markers (cylinder tokens)
- 1 Capital Planet Marker (large star token)
- 20 Credit Tokens (value 1/5/10)
- Reference Card (turn order, combat table)

**Shared Components**
- 60 Neutral Planet Tokens (white discs, various types)
- 40 Pirate Ship Markers (black skulls, 3 sizes)
- 1 Pirate Strength Tracker (dial or slider)
- 6 Custom Dice (2d6 with special symbols)
- 1 First Player Token (orbital station)

**Card Decks**

1. **Pirate Behavior Deck (30 cards)**
   - 10 Early Game cards (raids, scouting)
   - 12 Mid Game cards (invasions, blockades)
   - 8 Late Game cards (armada attacks, final assault)

2. **Technology Cards (16 cards, 4 types × 4 levels)**
   - Weapons (attack bonuses)
   - Shields (defense bonuses)
   - Economy (resource production)
   - Mobility (movement/attack range)

3. **Event Deck (20 cards)**
   - Galactic Events (affect all players)
   - Special Opportunities (one-time actions)
   - Coalition Triggers (gang-up mechanics)

4. **Archetype Cards (4 cards)**
   - Warlord, Economist, Diplomat, Researcher
   - Gives each player unique power and starting bonus

**Tokens & Markers**
- 60 Resource Tokens (food/ore combined)
- 30 Victory Point Tokens (track above 10 VP)
- 4 Civil Status Markers (Happy/Normal/Revolt)
- 20 Treaty Markers (alliances between players)
- 1 Round Tracker (dial 1-15)

**Box Size**: Standard large box (like Twilight Imperium, Terraforming Mars)
**Total Weight**: ~4 lbs
**MSRP**: $60-80

---

## PART 3: TURN STRUCTURE

### Setup (5 minutes)
1. Assemble hex map (size based on player count)
2. Each player drafts 1 Archetype card (or random)
3. Place 5 starting planets in your home sector
4. Take starting resources: 10 credits, 5 military power, 2 resources
5. Place pirate base on opposite side of map from weakest player
6. Shuffle Pirate Behavior deck, draw 3 cards face-down (threat track)

### Round Structure (4 Phases)

---

### PHASE 1: INCOME (Simultaneous, 2 minutes)

**All players collect simultaneously:**

1. **Planet Production** - Each planet generates:
   - Resource Planets: 2 resources
   - Military Planets: 1 military power cube
   - Economic Planets: 3 credits
   - Capital: 2 credits + 1 VP (temporary, lost if capital taken)

2. **Civil Status Modifier**:
   - Check your Civil Status marker
   - **Happy** (no attacks against you last round): +50% income
   - **Normal**: No modifier
   - **Revolting** (lost 2+ battles last round): -50% income

3. **Resource Upkeep**:
   - Each military power cube requires 1 resource
   - Shortage? Disband cubes immediately (your choice which)

**Example**:
- I have 3 resource planets, 1 military planet, 2 economic planets
- I'm at Normal status
- I collect: 6 resources, 1 military power, 6 credits
- I have 8 military power cubes, so I pay 8 resources
- Short 2 resources! I must disband 2 military power cubes

---

### PHASE 2: BUILD (Simultaneous, 3 minutes)

**All players spend credits simultaneously:**

**Purchase Options**:
- **Military Power**: 5 credits = 1 cube
- **Defense Station**: 10 credits = 1 station (place on any planet you control)
- **Claim Planet**: 15 credits = take neutral planet in your sector OR adjacent sector
- **Research**: 10 credits = advance 1 step on tech track
- **Treaty**: 5 credits = propose alliance/trade pact (other player must accept)

**Declare Builds**:
- Place cubes on empire board "build zone"
- Place markers on map
- Mark tech progress

**Example**:
- I have 12 credits
- I buy 1 defense station (10 credits) for my capital
- I have 2 credits left (save for later)

---

### PHASE 3: ACTION (Turn Order: Reverse VP, 15-20 minutes)

**Turn Order**: Player with FEWEST VP goes first (catchup mechanic)

**Each player takes ONE action:**

#### **A. ATTACK PLANET**

1. **Declare**: "I attack [player/pirates] at [sector]"
2. **Commit Forces**: Move military power cubes from your empire board to attack zone
3. **Roll Combat**:
   - Roll 2d6
   - Add: Your military power committed
   - Subtract: Enemy military power in sector
   - Add modifiers: Defender gets +2, defense stations +1 each

**Combat Outcomes Table**:
```
12+  Total Victory    → Capture 40% planets, destroy 2 enemy power
10-11 Victory         → Capture 25% planets, destroy 1 enemy power
7-9  Costly Victory   → Capture 15% planets, both lose 1 power
4-6  Stalemate        → No capture, both lose 1 power
2-3  Defeat           → No capture, you lose 2 power
0-1  Total Defeat     → No capture, you lose 3, enemy gains 1 VP
```

4. **Resolve**:
   - Take captured planet tokens (place in your color)
   - Remove destroyed power cubes to supply
   - If player loses last planet: ELIMINATED (attacker gains 3 VP)

**Example**:
- I attack Red player in Sector 3
- Red has 4 planets there with 6 military power + 1 defense station
- I commit 10 military power
- Roll 2d6: **8**
- Calculation: 8 + 10 (me) - 6 (red) - 2 (defender) - 1 (station) = **9**
- Result: Costly Victory (7-9)
- I capture 1 planet (15% of 4 = 0.6, round up)
- We both lose 1 military power cube

#### **B. EXPAND ECONOMY**
- Take 2 neutral planets in your sector (if available)
- OR build 3 defense stations
- OR gain 5 credits immediately

#### **C. DIPLOMATIC MANEUVER**
- Propose Alliance (both get +1 defense when attacked by 3rd party)
- Propose Trade Pact (exchange resources efficiently)
- Declare Vendetta (+2 attack vs target, -2 defense vs everyone else)

#### **D. RESEARCH BREAKTHROUGH**
- If you have 4 progress on a tech track, unlock the Technology Card
- Gain permanent bonus (shown on card)
- Gain 2 VP

---

### PHASE 4: PIRATE ACTIVATION (Controlled, 5-10 minutes)

**Player in last place activates the pirates:**

1. **Draw 1 Pirate Behavior Card** from top of deck
2. **Read Card Aloud** (has theme/flavor text)
3. **Execute Card Instructions** (movement, attacks, spawning)
4. **Advance Threat Track** (flip next card face-up if triggered)

**Example Card - "Raiding Party"** (Early Game):
```
┌─────────────────────────────────────┐
│ RAIDING PARTY                       │
│                                     │
│ "Sensors detect a pirate squadron  │
│  approaching the outer colonies..."│
│                                     │
│ 1. Spawn 2 pirate ships in the     │
│    sector with most neutral planets │
│ 2. Pirates attack weakest player    │
│    in that sector (roll 2d6 + 3)   │
│ 3. If no player, pirates claim      │
│    1 neutral planet                 │
│                                     │
│ Threat: If 5+ pirate ships on map, │
│ flip next Behavior card face-up    │
└─────────────────────────────────────┘
```

**Pirate Combat**:
- Use same combat table
- Pirates roll 2d6 + (number of pirate ships × 1)
- Players defend normally
- Destroyed pirates return to supply (no VP awarded unless killed on YOUR turn)

**Escalation**:
- Early Game: 1-2 ships spawn, small raids
- Mid Game: 3-5 ships, target specific players, blockades
- Late Game: 6-10 ships, coordinated assaults, claim planets

**Pirate Victory Condition** (Cooperative/Semi-Coop modes):
- If pirates control 15+ planets OR eliminate any player: **Pirates Win, All Lose**

---

### END OF ROUND
1. Check Victory Condition: Anyone at 10 VP?
2. Coalition Check: If anyone at 7+ VP, all others get +1 attack vs leader (automatic)
3. Advance Round Tracker
4. Pass First Player token clockwise

**Round Duration**: ~25-35 minutes with 4 players

**Game Length**: 8-12 rounds = 60-90 minutes

---

## PART 4: THE AI ALGORITHM DECK SYSTEM

### Pirate Behavior Deck Philosophy

**Inspired by D&D Adventure System:**
- No complex AI decision trees
- Card-driven behavior (draw, read, execute)
- Escalating threat (early → mid → late game cards)
- Thematic flavor text creates narrative

### Card Structure

**Front Side** (all cards):
```
┌─────────────────────────────────────┐
│ [CARD NAME]                [ICON]  │
│                                     │
│ "[Flavor text quote]"               │
│                                     │
│ ACTIONS:                            │
│ 1. [Movement/Spawning]              │
│ 2. [Attack/Special Action]          │
│ 3. [Secondary Effect]               │
│                                     │
│ THREAT: [Escalation condition]      │
│                                     │
│ [Phase indicator: Early/Mid/Late]   │
└─────────────────────────────────────┘
```

**Back Side**:
- Pirate Armada logo (when face-down on threat track)

### Example Cards by Phase

**Early Game (Turns 1-5) - "Probing Attacks"**

**CARD: "Scouting Run"**
```
┌─────────────────────────────────────┐
│ SCOUTING RUN               [SHIP]  │
│                                     │
│ "Unidentified vessels detected on  │
│  long-range scanners..."            │
│                                     │
│ 1. Spawn 1 pirate ship in sector   │
│    farthest from all players        │
│ 2. No attack this turn              │
│ 3. Claim 1 neutral planet if        │
│    available in that sector         │
│                                     │
│ THREAT: If 3+ ships on map,         │
│ reveal next Behavior card           │
│                                     │
│ [EARLY GAME]                        │
└─────────────────────────────────────┘
```

**CARD: "Smuggler's Haven"**
```
┌─────────────────────────────────────┐
│ SMUGGLER'S HAVEN           [BASE]  │
│                                     │
│ "A pirate outpost appears in the   │
│  neutral territories..."            │
│                                     │
│ 1. Spawn 2 pirate ships in sector  │
│    with most neutral planets        │
│ 2. Place Defense Station token on  │
│    pirate-controlled planet         │
│ 3. Pirates get +1 defense there     │
│                                     │
│ THREAT: None                        │
│                                     │
│ [EARLY GAME]                        │
└─────────────────────────────────────┘
```

**Mid Game (Turns 6-10) - "Coordinated Strikes"**

**CARD: "Blockade Run"**
```
┌─────────────────────────────────────┐
│ BLOCKADE RUN               [FLEET] │
│                                     │
│ "Pirate cruisers cut supply lines  │
│  to the frontier colonies!"         │
│                                     │
│ 1. Spawn 3 pirate ships in sector  │
│    with most player planets         │
│ 2. All players in that sector lose │
│    half their income next round     │
│ 3. Pirates attack weakest player   │
│    (2d6 + 5)                        │
│                                     │
│ THREAT: If pirates win battle,      │
│ reveal next Behavior card           │
│                                     │
│ [MID GAME]                          │
└─────────────────────────────────────┘
```

**CARD: "Divide and Conquer"**
```
┌─────────────────────────────────────┐
│ DIVIDE AND CONQUER         [SKULL] │
│                                     │
│ "The pirate fleet splits to attack │
│  multiple targets simultaneously!"  │
│                                     │
│ 1. Spawn 2 ships in sector of 1st  │
│    place player                     │
│ 2. Spawn 2 ships in sector of 2nd  │
│    place player                     │
│ 3. Pirates attack both (2d6 + 4)   │
│                                     │
│ THREAT: If either player loses,     │
│ reveal 2 Behavior cards             │
│                                     │
│ [MID GAME]                          │
└─────────────────────────────────────┘
```

**Late Game (Turns 11+) - "Final Assault"**

**CARD: "Armada Mobilizes"**
```
┌─────────────────────────────────────┐
│ ARMADA MOBILIZES        [FLAGSHIP] │
│                                     │
│ "The full pirate armada emerges    │
│  from the void..."                  │
│                                     │
│ 1. Spawn 5 pirate ships in largest │
│    pirate-controlled sector         │
│ 2. Move ALL pirate ships toward    │
│    player with most VP              │
│ 3. Pirates attack with full force  │
│    (2d6 + total ships)              │
│                                     │
│ THREAT: If leader loses 3+ planets, │
│ PIRATES WIN                         │
│                                     │
│ [LATE GAME]                         │
└─────────────────────────────────────┘
```

**CARD: "Desperate Stand"**
```
┌─────────────────────────────────────┐
│ DESPERATE STAND            [LAST]  │
│                                     │
│ "This is it. The final battle for  │
│  control of the galaxy..."          │
│                                     │
│ 1. ALL pirate ships move to sector │
│    with most total planets (any)    │
│ 2. Pirates attack ALL players in   │
│    that sector simultaneously       │
│ 3. Roll 2d6 + (ships × 2)           │
│                                     │
│ THREAT: Victory or death.           │
│                                     │
│ [LATE GAME - FINAL CARD]            │
└─────────────────────────────────────┘
```

### Deck Composition (30 cards)
- 10 Early Game (shuffled, forms top of deck)
- 12 Mid Game (shuffled, placed under Early)
- 8 Late Game (shuffled, placed at bottom)

**Progressive Difficulty**:
- Game naturally escalates as you draw through deck
- Late game cards are devastating, forcing cooperation
- Threat track preview shows what's coming (face-up cards)

### Pirate Targeting AI (Simple Rules)

**When card says "attack weakest player"**:
- Compare VP totals in that sector only
- Lowest VP = target
- Ties: Most planets breaks tie
- Still tied: Closest to pirate ships

**When card says "move toward X"**:
- Move up to 2 pirate ships per sector toward target
- Follow shortest path of sectors
- Stop if blocked by defense stations

**When pirates claim planets**:
- Always take Resource planets first (denial strategy)
- Then Military planets
- Last: Economic planets

---

## PART 5: STREAMLINED COMBAT (30 Seconds)

### The Roll

**When You Declare Attack**:

1. **Commit Forces** (10 seconds)
   - Slide military power cubes from your empire board to attack zone
   - Announce: "I'm sending 8 power to attack Sector 5"

2. **Defender Responds** (5 seconds)
   - Defender counts their power in target sector
   - Announces: "I have 6 power + 1 defense station"

3. **Roll & Resolve** (10 seconds)
   - Attacker rolls 2d6
   - Quick math: Roll + Your Power - Enemy Power - Defender Bonus (-2) - Stations
   - Check Combat Table (printed on reference card)

4. **Apply Results** (5 seconds)
   - Move captured planet tokens
   - Remove destroyed power cubes
   - Move civil status marker if needed

**Total Time**: 30 seconds per combat

### Combat Reference Card (Every Player Has This)

```
┌─────────────────────────────────────────────────────────────┐
│                   COMBAT OUTCOMES                           │
├──────┬──────────────────┬───────────────────────────────────┤
│ ROLL │  RESULT          │  EFFECT                           │
├──────┼──────────────────┼───────────────────────────────────┤
│ 12+  │ Total Victory    │ Capture 40% planets, kill 2 power │
│ 10-11│ Victory          │ Capture 25% planets, kill 1 power │
│  7-9 │ Costly Victory   │ Capture 15% planets, both lose 1  │
│  4-6 │ Stalemate        │ No capture, both lose 1 power     │
│  2-3 │ Defeat           │ No capture, you lose 2 power      │
│  0-1 │ Total Defeat     │ No capture, you lose 3, foe +1 VP │
└──────┴──────────────────┴───────────────────────────────────┘

MODIFIERS:
Defender: -2 to your roll
Defense Stations: -1 each
Tech (Weapons): +1 to attack
Tech (Shields): +1 to defense
Coalition vs Leader (7+ VP): +1 to your roll
Vendetta Declaration: +2 vs target
```

### Dice Alternative (Custom Dice)

**6-sided custom dice with symbols** (instead of numbers):

- ⚔️ ⚔️ (Critical Hit - counts as 6)
- ⚔️ (Hit - counts as 4-5)
- ○ ○ (Normal - counts as 2-3)
- ○ (Miss - counts as 1)

**Why Custom Dice**:
- Easier to read at a glance
- Creates dramatic moments (double crits!)
- Visually appealing
- Still uses 2d6 probability curve

**Outcome Examples**:

**Scenario 1**: Equal forces
- Attacker: 10 power vs Defender: 10 power + 2 bonus
- Attacker rolls: ⚔️ + ○ = 5 + 2 = 7
- Calculation: 7 + 10 - 10 - 2 = **5**
- Result: **Stalemate** (both lose 1 power, no capture)

**Scenario 2**: Overwhelming force
- Attacker: 15 power vs Defender: 5 power + 2 bonus
- Attacker rolls: ⚔️⚔️ + ⚔️ = 6 + 4 = 10
- Calculation: 10 + 15 - 5 - 2 = **18**
- Result: **Total Victory** (capture 2 planets, kill 2 power)

**Scenario 3**: Underdog victory
- Attacker: 6 power vs Defender: 8 power + 2 bonus + 1 station
- Attacker rolls: ⚔️⚔️ + ⚔️⚔️ = 6 + 6 = 12 (lucky!)
- Calculation: 12 + 6 - 8 - 2 - 1 = **7**
- Result: **Costly Victory** (capture 1 planet, both lose 1)

---

## PART 6: PLAYTEST WALKTHROUGH

### Setup: 3 Players - Alex (Blue), Beth (Red), Chris (Green)

**Archetypes Drafted**:
- Alex: **Warlord** (starting bonus: +2 military power, unique power: +1 to attack rolls)
- Beth: **Economist** (starting bonus: +5 credits, unique power: planets produce +1 resource)
- Chris: **Researcher** (starting bonus: 2 research progress, unique power: tech costs -2 credits)

**Map**: 7 hex tiles, 35 neutral planets scattered
**Pirate Base**: Placed far from Chris (weakest starting power)

---

### TURN 1 - "The Opening Moves"

**PHASE 1: Income**
- All players collect from 5 starting planets
- Alex: 2 resources, 1 military power, 6 credits
- Beth: 4 resources (bonus!), 6 credits
- Chris: 2 resources, 6 credits
- All at Normal civil status

**Dialogue**:
- Beth: "Nice, 4 resources. I can support more military than usual."
- Alex: "I'm going aggressive early. Need to grab territory."

**PHASE 2: Build**
- Alex: Buys 2 military power (10 credits) - now has 9 total
- Beth: Claims 1 neutral planet (15 credits) - expands economic base
- Chris: Researches (10 credits with -2 discount = 8) - 3/4 toward Shields tech

**Dialogue**:
- Chris: "I'm turtling. One more turn and I get Shields."
- Alex: "Bold. I'm coming for you Turn 3 if you don't watch out."
- Chris: "Bring it. I'll have +1 defense by then."

**PHASE 3: Action (VP order: all tied at 0, use draft order)**

**Alex's Turn** (goes first):
- Action: **Expand Economy** (takes 2 neutral resource planets)
- "I need production to fuel my war machine."

**Beth's Turn**:
- Action: **Expand Economy** (takes 2 neutral economic planets)
- "Credits now, domination later."

**Chris's Turn**:
- Action: **Diplomatic Maneuver** → Proposes Alliance with Beth
- "Beth, let's team up. Alex is clearly going aggressive."
- Beth: "Sure, but if you get to 7 VP first, all bets are off."
- **Alliance formed** (both get +1 defense when attacked by Alex)

**Dialogue**:
- Alex: "Cool, cool. I see how it is. You'll regret that."
- Chris: "We'll see!"

**PHASE 4: Pirate Activation** (Chris activates, being last in turn order)

**Card Drawn**: "Scouting Run"
- Spawn 1 pirate ship in Sector 7 (far from players)
- Pirates claim 1 neutral resource planet
- Threat check: Only 1 ship total, no reveal

**Dialogue**:
- Beth: "Pirates are way over there. Not our problem yet."
- Alex: "Yet."

**End of Turn 1**:
- Alex: 0 VP, 7 planets, 9 military
- Beth: 0 VP, 8 planets, 5 military, allied with Chris
- Chris: 0 VP, 5 planets, 5 military, allied with Beth, 3/4 Shields
- Pirates: 1 ship, 1 planet

---

### TURN 5 - "The Powder Keg"

**Situation**:
- Alex: 2 VP (10 planets), 12 military, aggressive expansion
- Beth: 3 VP (11 planets, most VP bonus), 8 military, economic engine humming
- Chris: 1 VP (7 planets, Shields + Weapons techs completed), 10 military
- Pirates: 6 ships spread across 2 sectors, 4 planets

**PHASE 1: Income**
- Beth has most planets → gains 2 VP for Dominance (now 5 VP)
- Alex: Normal income
- Chris: Happy status (no attacks last turn) → +50% income!

**Dialogue**:
- Alex: "Beth, you're at 5 VP. Two more turns and you trigger the coalition."
- Beth: "Come at me. I've got defenses."
- Chris: "I'm just vibing, teching up."

**PHASE 2: Build**
- Alex: Buys 3 defense stations (30 credits), places on border planets facing Beth
- Beth: Buys 2 military power + 1 defense station
- Chris: Completes Economy tech (10 credits -2 discount) → Gains 2 VP! (now 3 VP total)

**PHASE 3: Action (VP order: Chris 3 VP, Alex 2 VP, Beth 5 VP)**

**Chris's Turn** (goes first):
- Action: **Diplomatic Maneuver** → **Breaks alliance with Beth**, Declares Vendetta vs Beth!
- "Sorry Beth. You're too far ahead. I'm getting +2 attack against you now."
- Beth: "WHAT?! I trusted you!"
- Chris: "Business, not personal."

**Alex's Turn**:
- Action: **Attack Beth** in Sector 3!
- Commits 10 military power
- Beth defends with 7 power + 2 defender bonus + 1 station = effectively -10
- Alex rolls: ⚔️⚔️ + ⚔️ = **10**
- Calculation: 10 + 10 - 7 - 2 - 1 = **10**
- Result: **VICTORY!**
- Beth loses 3 planets (25% of 11 = 2.75, round up)
- Beth loses 1 military power

**Dialogue**:
- Alex: "BOOM! Three planets. You're bleeding now."
- Beth: "This is fine. I'm fine. Everything is fine."
- Chris: *munching popcorn* "Fascinating."

**Beth's Turn** (goes last, due to highest VP):
- Action: **Expand Economy** (takes 2 neutral planets to recover)
- "I need to rebuild. But I'm at 5 VP... coalition is coming."

**PHASE 4: Pirate Activation**

**Card Drawn**: "Divide and Conquer" (Mid Game escalation!)
- Spawn 2 ships in Beth's sector (1st place)
- Spawn 2 ships in Chris's sector (2nd place)
- Pirates attack both!

**Pirate Attack on Beth**:
- Pirates: 4 ships = 2d6 + 4
- Beth: 6 military power + 2 defender
- Pirates roll: ○ + ⚔️ = 3 + 4 = 7
- Beth's defense: 6 + 2 = 8
- Calculation: 7 + 4 - 8 = **3**
- Result: **Defeat** (pirates lose 2 ships, no capture)

**Pirate Attack on Chris**:
- Pirates: 4 ships = 2d6 + 4
- Chris: 10 military + 2 defender + 1 (Shields tech)
- Pirates roll: ⚔️ + ⚔️ = 8 + 4 = 12
- Chris's defense: 10 + 3 = 13
- Calculation: 12 + 4 - 13 = **3**
- Result: **Defeat** (pirates lose 2 ships)

**Threat Check**: Beth won, so NO additional cards revealed

**Dialogue**:
- Beth: "At least the pirates are helping me out."
- Alex: "Don't get cocky. 8 pirates on the map now."
- Chris: "Next card could be Armada Mobilizes..."

**End of Turn 5**:
- Alex: 2 VP, 10 planets, 10 military
- Beth: 3 VP (lost Dominance bonus), 10 planets, 6 military, Civil Status → Revolting (lost 2 battles)
- Chris: 3 VP, 7 planets, 10 military, Happy status (no attacks)
- Pirates: 6 ships remaining, 4 planets

---

### TURN 15 - "Endgame Crisis"

**Situation**:
- Alex: 8 VP (nearly winning!), 15 planets, 14 military
- Beth: 6 VP, 12 planets, 8 military
- Chris: 7 VP (all 4 techs completed), 10 planets, 12 military + tech bonuses
- Pirates: 12 ships!, 8 planets, Threat Deck shows "Armada Mobilizes" face-up next

**Coalition Active**: Alex has 8 VP → Beth and Chris get +1 attack vs Alex automatically

**PHASE 1: Income**
- Beth: Revolting status (lost battles to pirates) → Half income
- Crisis atmosphere: Pirates everywhere, Alex 2 VP from victory

**Dialogue**:
- Beth: "We HAVE to stop Alex. He's at 8."
- Chris: "I'm at 7 too. Coalition is against both of us technically."
- Beth: "Yes, but YOU aren't 1 territory VP away from winning."
- Alex: *sweating* "I've got defenses. You can't break through."

**PHASE 2: Build**
- Alex: ALL IN on defense (builds 4 defense stations on capital)
- Beth: Buys 4 military power (needs to attack)
- Chris: Buys 2 military power

**PHASE 3: Action**

**Beth's Turn** (lowest VP: 6):
- Action: **ATTACK ALEX** in Sector 2 (his capital sector!)
- Commits ALL 12 military power
- Alex defends with 10 power + 2 defender + 4 stations + tech bonuses = -18 effective
- Beth has Coalition bonus (+1) + Vendetta from earlier (+2)
- Beth rolls: ⚔️⚔️ + ⚔️⚔️ = **12** (DOUBLE CRITS!)
- Calculation: 12 + 12 - 10 - 2 - 4 + 3 = **11**
- Result: **VICTORY!** (10-11 range)
- Alex loses 4 planets (25% of 15 = 3.75, round up)
- Alex loses 1 military power
- **ALEX'S CAPITAL FALLS!** (was one of the 4 captured)

**Dialogue**:
- Table: *ERUPTS*
- Beth: "YES! I GOT THE CAPITAL!"
- Alex: "NOOOOO! My capital!"
- Chris: "This changes everything!"

**Alex's Turn**:
- Now at 6 VP (lost Capital bonus, lost Territory VP)
- Action: **Desperate counterattack on Chris**
- Commits 8 military
- Chris defends with 12 + 2 + Shields + Weapons = -16
- Alex rolls: ○ + ○ = **3**
- Calculation: 3 + 8 - 16 = **-5**
- Result: **Total Defeat!**
- Alex loses 3 military power, Chris gains 1 VP

**Chris now at 8 VP!**

**Chris's Turn** (now tied for lead at 8 VP):
- Action: **EXPAND ECONOMY**
- Takes 2 neutral planets → Now has 12 planets
- 12 planets / 5 = 2.4 → **Gains 2 Territory VP!**
- **CHRIS REACHES 10 VP AND WINS!**

**Dialogue**:
- Chris: "WAIT. I have 12 planets now. That's... 10 VP TOTAL!"
- Beth: "WHAT."
- Alex: "You snake! You were playing the long game!"
- Chris: "I learned from the best." *winks at Beth*

**Game Ends - Chris Wins!**

**But wait...**

**PHASE 4: Pirate Activation** (must still resolve!)

**Card Drawn**: "Armada Mobilizes"
- Spawn 5 pirate ships in largest pirate sector
- ALL pirates (17 ships!) move toward Chris (most VP)
- Pirates attack with 2d6 + 17 = **at least 19 power**
- Chris has 12 military + modifiers = at most 16 defense

**IF playing Cooperative/Semi-Coop**:
- Chris must survive the pirate attack to claim victory
- Pirates roll: ⚔️ + ⚔️ = 8 + 17 = **25**
- Chris: 12 + 2 + 1 + 1 = 16
- Calculation: 25 + 17 - 16 = **26**
- Result: **Pirates destroy Chris's entire sector!**
- Chris loses 6 planets → Down to 6 planets → **Below 10 VP!**
- **PIRATES WIN! ALL PLAYERS LOSE!**

**Dialogue**:
- Chris: "NO! I was so close!"
- Beth: "We forgot about the pirates!"
- Alex: "That's what happens when you betray your allies!"
- Table: *laughter, groans, immediate rematch demanded*

**Competitive Mode**: Chris wins before pirate activation (Phase 3 victory)
**Cooperative Mode**: Everyone loses (cautionary tale about ignoring the threat)

---

## DESIGN COMMENTARY

### Why This Works

**1. Simple to Learn, Deep to Master**
- Core rules fit on 2 pages
- Combat is one roll with clear table
- But: Diplomacy, timing, tech paths create strategic depth

**2. Session Length Perfect**
- 15 turns × 30 min/round = 60-90 minutes
- Faster with experienced players (45 min possible)
- Scalable with player count (2p = 45 min, 4p = 90 min)

**3. Pirate Deck Creates Narrative**
- Every game different (deck reshuffles differently)
- Escalation feels natural (early → mid → late game cards)
- Creates pressure to cooperate OR race ahead
- Solves "100 bots" problem with one elegant threat

**4. Player Interaction High**
- Alliances form and break
- Coalition mechanics force cooperation
- Attacks have consequences (civil status)
- Diplomacy is actions, not just flavor

**5. Catchup Mechanics Built-In**
- Reverse turn order (weakest goes first)
- Coalition bonuses vs leader
- Pirates target leader in late game
- No runaway victories

**6. Replayability**
- 4 archetypes create different strategies
- Modular map different each game
- Event deck adds variance
- Pirate deck reshuffles

### What Makes It Fun

**Turn 1-5**: Expansion race, land grab, alliances form
**Turn 6-10**: First conflicts, betrayals, pirates become noticeable
**Turn 11-15**: Crisis mode, kingmaking, dramatic finishes

**Emotional Arc**:
- Excitement (setup and land grab)
- Tension (first attacks)
- Drama (alliances break)
- Climax (race to 10 VP vs escalating pirates)
- Resolution (victory or defeat)

### Components Design Notes

**Why No Miniatures?**
- Keeps cost down ($60-80 vs $120+ for minis)
- Abstract cubes work perfectly for power tracking
- Planet tokens easier to handle than mini fleets

**Why Custom Dice?**
- Thematic (space symbols)
- Easier to read quickly
- Creates excitement (crit symbols)
- Optional (can use standard d6)

**Why Modular Board?**
- Replayability (different maps)
- Scalable (2p uses 5 hexes, 4p uses 9)
- Storage (flat pack)

---

## VARIANTS & EXPANSIONS

### Variant Rules

**2-Player Duel**:
- Use 5 hex tiles only
- Pirates activate EVERY turn (not just Phase 4)
- First to 8 VP wins

**Solo Mode**:
- Play as one empire vs pirate deck
- Goal: Reach 10 VP before turn 20
- Pirates activate twice per round
- Hard mode: Survive turn 25

**Team Mode (4 players)**:
- 2v2 teams
- First team to combined 15 VP wins
- Can transfer resources to teammate

### Expansion Ideas

**Expansion 1: "Factions"**
- 4 new archetypes (Zealot, Industrialist, Hivemind, Nomad)
- Unique ability cards for each
- Asymmetric starting setups

**Expansion 2: "Ancient Artifacts"**
- 12 Artifact cards (hidden objectives)
- Special planet types (ruins, derelicts)
- Exploration mini-game

**Expansion 3: "Galactic Senate"**
- Voting phase each round
- Laws affect all players
- Political path to victory (influence VP)

---

## FINAL THOUGHTS

This board game captures the **essence** of Nexus Dominion:
- Space empire fantasy
- Strategic depth without overwhelming complexity
- Emergent narratives from player interaction
- Satisfying in 60-90 minutes

It **improves** on the digital version by:
- Removing 100-bot cognitive overload (one pirate threat)
- Making combat instant (30 seconds vs complex calculations)
- Creating face-to-face drama (alliances, betrayals)
- Fitting in a game night slot

It **maintains** the core appeal:
- Multiple victory paths
- Archetypes create different strategies
- Combat has range of outcomes (not binary)
- Coalitions prevent runaway leaders

**Would I play this?** Absolutely. It scratches the 4X itch without the 4-hour commitment.

**Would I Kickstart this?** In a heartbeat. The pirate deck system alone is novel enough to stand out in the board game market.

**Comparable to**: Twilight Imperium meets D&D Adventure System meets Risk 2210. Streamlined space empire with cooperative threat element and deck-driven AI.

---

## COMPARISON: DIGITAL VS BOARD GAME

| Aspect | Digital Version | Board Game Version | Winner |
|--------|----------------|-------------------|--------|
| **Complexity** | 6 unit types, 4-tier crafting, 100 bots | Abstract power, 1 pirate threat | Digital (depth), Board (clarity) |
| **Session Length** | 1-2 hours | 60-90 minutes | Tie |
| **Social Interaction** | None (solo) | High (alliances, betrayals) | Board Game |
| **Replayability** | 100 personas, scenarios | Pirate deck, archetypes, map | Tie |
| **Learning Curve** | Moderate (hidden by UI) | Easy (15 min to teach) | Board Game |
| **Combat** | Automated calculations | 30-second roll | Board Game |
| **Bot Personalities** | Rich (LLM-powered T1 bots) | Abstract (deck-driven) | Digital |
| **Price** | Free (web-based) | $60-80 | Digital |
| **Setup Time** | Instant | 5 minutes | Digital |
| **Player Interaction** | vs AI | vs Humans | Board Game |

**Conclusion**: These are complementary products, not competitors. The digital version serves solo/async players who want depth and automation. The board game serves social groups who want face-to-face drama in a shorter session.

---

**Box Quote**:
*"Build your empire. Forge alliances. Survive the pirates. First to 10 Victory Points rules the galaxy... if you can hold it."*

**Tagline**:
*"The space empire game that doesn't need a PhD to play."*

---

*Document Created: December 30, 2025*
*Design Philosophy: Streamlined complexity, maximum interaction*
*Target Audience: Board game enthusiasts seeking 4X experience in 90 minutes*
