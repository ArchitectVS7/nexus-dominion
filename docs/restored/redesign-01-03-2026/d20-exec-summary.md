```markdown
# Executive Summary — **Tri-Layer d20 Combat System for a Space 4X Game**

**Purpose:**  
This document defines a **d20-based combat resolution system** adapted for a **space 4X strategy game** featuring **simultaneous multi-domain conflict**:  
**Space Battle · Orbital Control · Planetary Invasion**.

The system emphasizes:
- Fast learnability (single die, consistent resolution)
- High strategic depth (positioning, escalation, attrition)
- Visual clarity (cards, tracks, tokens)
- Meaningful risk/reward (momentum, overextension, retreat decisions)

---

## 1. Core Design Pillars

### Why d20?
- Familiar probability curve (5% granularity)
- Easy threshold logic: *roll + modifiers ≥ defense*
- Scales cleanly from single units to fleets
- Supports **critical events**, **morale breaks**, and **technology edges**

### Multi-Layer Conflict
Every contested sector resolves **three battles in parallel**:

| Layer | Represents | Strategic Role |
|-----|-----------|----------------|
| **Space** | Fleet combat & maneuver | Determines initiative & retreat safety |
| **Orbital** | Bombardment, blockade, logistics | Modifies planetary outcomes |
| **Planetary** | Ground invasion & morale | Determines conquest or surrender |

Victory can occur by:
- Total domination (win 2+ layers decisively)
- Defender surrender (morale collapse)
- Attacker retreat (with risk)

---

## 2. Rebranded d20 Statistics (Sci-Fi Themed)

Classic RPG attributes are replaced with **domain-appropriate system stats**:

| Sci-Fi Stat | Abbrev | Replaces | Description |
|------------|--------|----------|-------------|
| **Hull Integrity** | HUL | STR | Structural durability & mass |
| **Targeting Systems** | TAR | DEX | Accuracy, tracking, evasion |
| **Computational Core** | CPU | INT | Tactical AI, coordination |
| **Reactor Output** | REA | CON | Power generation & endurance |
| **Command Control** | CMD | WIS | Morale, discipline, cohesion |
| **Doctrine Protocols** | DOC | CHA | Psychological pressure & surrender influence |

**Universal Resolution Formula:**
```

d20 + (Relevant Stat) + Tech/Formation Modifiers ≥ Defense Threshold

```

---

## 3. Combat Round Flow (Executive View)

1. **Initiative Phase**
   - Each side rolls d20 + CMD (best surviving unit)
   - Winner gains **Tactical Advantage Token**

2. **Assignment Phase**
   - Units assigned to Space / Orbital / Planetary layers
   - Some units may support multiple layers at penalties

3. **Engagement Phase**
   - Each unit rolls attacks simultaneously
   - Hits reduce Hull / Strength tokens

4. **Momentum Phase**
   - Success grants **Momentum**
   - Overcommitment generates **Overextension**

5. **Resolution Phase**
   - Check surrender, collapse, or retreat
   - Retreat triggers **Attack of Opportunity**

---

## 4. Rarity Framework (Non-MTG, Sci-Fi Themed)

| Rarity Tier | Name | Design Intent |
|------------|------|---------------|
| Tier I | **Standard-Issue** | Reliable baseline |
| Tier II | **Prototype** | Specialized edge |
| Tier III | **Singularity-Class** | Game-shaping assets |
| Tier IV | **Anomalous Relic** | Narrative / endgame (optional) |

This document demonstrates **Tier I–III**.

---

# 5. Asset Prototypes

Each asset type includes **three base designs**, each shown across **three rarities** to illustrate scaling depth.

---

## A. SPACE SHIPS

### 1) LINE CRUISER (Frontline Combatant)

#### Standard-Issue Line Cruiser
```

HUL 5 | TAR 4 | CPU 3 | REA 4 | CMD 3 | DOC 2
Defense: 15 | Hull: 20
Ability: Steady Barrage (+1 damage on hit)

```

#### Prototype Line Cruiser
```

HUL 6 | TAR 5 | CPU 4 | REA 5 | CMD 4 | DOC 3
Defense: 16 | Hull: 24
Ability: Linked Targeting (reroll 1 miss per round)

```

#### Singularity-Class Line Cruiser
```

HUL 7 | TAR 6 | CPU 5 | REA 6 | CMD 5 | DOC 4
Defense: 18 | Hull: 30
Ability: Overload Salvo (spend Momentum → extra attack)

```

---

### 2) INTERCEPTOR WING (Fast Attack)

#### Standard-Issue Interceptors
```

HUL 2 | TAR 5 | CPU 3 | REA 3 | CMD 2 | DOC 1
Defense: 14 | Hull: 8
Ability: Evasion (+2 Defense if not damaged this round)

```

#### Prototype Interceptors
```

HUL 3 | TAR 6 | CPU 4 | REA 4 | CMD 3 | DOC 2
Defense: 15 | Hull: 10
Ability: Afterburner Strike (+1 attack when winning initiative)

```

#### Singularity-Class Interceptors
```

HUL 3 | TAR 7 | CPU 5 | REA 5 | CMD 4 | DOC 3
Defense: 17 | Hull: 12
Ability: Quantum Feint (force enemy reroll once/round)

```

---

### 3) DREAD PLATFORM (Capital Unit)

#### Standard-Issue Dread Platform
```

HUL 7 | TAR 3 | CPU 4 | REA 6 | CMD 4 | DOC 3
Defense: 17 | Hull: 35
Ability: Area Suppression (hits affect adjacent units)

```

#### Prototype Dread Platform
```

HUL 8 | TAR 4 | CPU 5 | REA 7 | CMD 5 | DOC 4
Defense: 18 | Hull: 40
Ability: Siege Targeting (+2 vs Orbital targets)

```

#### Singularity-Class Dread Platform
```

HUL 9 | TAR 5 | CPU 6 | REA 8 | CMD 6 | DOC 5
Defense: 20 | Hull: 50
Ability: Command Breaker (enemy CMD −2 while active)

```

---

## B. ORBITAL FORCES

### 1) ORBITAL GUN ARRAY

#### Standard-Issue
```

HUL 4 | TAR 4 | CPU 3 | REA 4 | CMD 2 | DOC 2
Defense: 14 | Integrity: 15
Ability: Planetary Bombardment (+1 Planetary roll)

```

#### Prototype
```

HUL 5 | TAR 5 | CPU 4 | REA 5 | CMD 3 | DOC 3
Defense: 15 | Integrity: 18
Ability: Precision Strike (ignores 1 defense bonus)

```

#### Singularity-Class
```

HUL 6 | TAR 6 | CPU 5 | REA 6 | CMD 4 | DOC 4
Defense: 17 | Integrity: 22
Ability: Orbital Denial (enemy Orbital −2)

```

---

### 2) BLOCKADE FLEET
*(similar formatting omitted for brevity — can be expanded on request)*

---

## C. PLANETARY UNITS

### 1) MECHANIZED LEGION

#### Standard-Issue
```

HUL 4 | TAR 3 | CPU 3 | REA 4 | CMD 4 | DOC 3
Defense: 13 | Strength: 12
Ability: Entrenched (+1 Defense on defense)

```

#### Prototype
```

HUL 5 | TAR 4 | CPU 4 | REA 5 | CMD 5 | DOC 4
Defense: 14 | Strength: 15
Ability: Combined Arms (+1 if Orbital controlled)

```

#### Singularity-Class
```

HUL 6 | TAR 5 | CPU 5 | REA 6 | CMD 6 | DOC 5
Defense: 16 | Strength: 20
Ability: Shock Doctrine (force morale check on hit)

```

---

## 6. Strategic Depth Summary

| Mechanic | Player Impact |
|--------|---------------|
| Multi-Layer Combat | Forces allocation decisions |
| Momentum / Overextension | Push-your-luck tension |
| CMD & DOC Stats | Enable surrender & psychological warfare |
| Rarity Scaling | Tech progression without power creep |

---

## 7. Why This Works for a 4X Game

- **Strategic clarity** at empire scale
- **Tactical drama** at battle scale
- **Narrative outcomes** (retreats, surrenders, collapses)
- Easily extensible for:
  - Heroes / Admirals
  - Terrain modifiers
  - Alien doctrines
  - Asymmetric factions

---
