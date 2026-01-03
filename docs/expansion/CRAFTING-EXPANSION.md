# Manufacturing & Crafting System

**Status**: EXPANSION CONTENT - Not in Core Game v1.0
**Date**: Extracted from PRD.md 2026-01-02
**Prerequisites**: Core game complete, player demand for deeper economy

---

## Overview

The crafting system introduces a 4-tier resource progression that gates advanced military units behind strategic resource management. This transforms the original SRE "credits buy everything" model into a more strategic progression path.

**Design Goal**: Add economic depth without overwhelming casual players.

**Expansion Scope**: This system is **not** in the base game. If released as DLC, it would be packaged as "Nexus Dominion: Industrial Age" or similar.

---

## Tier 0: Base Resources (Core Game)

These resources exist in the base game and are not affected by the expansion:

| Resource | Source | Description |
|----------|--------|-------------|
| **Credits** | Taxes, Trade, Tourism, Urban | Universal currency |
| **Food** | Food Planets, Market | Feeds population & military |
| **Ore** | Ore Planets | Raw minerals, stable income |
| **Petroleum** | Petroleum Planets | Fuel, causes pollution |
| **Population** | Urban, Education | Labor force, tax base |
| **Research Points** | Research Planets | Tech progression |

---

## Tier 1: Refined Resources

Basic processing of Tier 0 resources. Produced automatically by specialized planets or purchased at premium.

| Resource | Recipe | Auto-Production |
|----------|--------|-----------------|
| **Refined Metals** | 100 Ore | Ore Planets: 10% of output |
| **Fuel Cells** | 50 Petroleum + 20 Credits | Petroleum Planets: 10% |
| **Polymers** | 30 Petroleum + 20 Ore | Industrial Planets only |
| **Processed Food** | 200 Food | Food Planets: 5% |
| **Labor Units** | 1,000 Population + 50 Credits | Urban Planets: 5% |

**Automatic Production**: Tier 1 resources generate passively each turn. No micro-management.

---

## Tier 2: Manufactured Components (Research 2+)

Combining Tier 1 resources with Research requirements. These are building blocks for advanced military.

| Component | Recipe | Research Req |
|-----------|--------|--------------|
| **Electronics** | 2 Refined Metals + 1 Polymers | Level 2 |
| **Armor Plating** | 3 Refined Metals + 1 Polymers | Level 2 |
| **Propulsion Units** | 2 Fuel Cells + 1 Refined Metals | Level 2 |
| **Life Support** | 1 Processed Food + 1 Polymers + 1 Electronics | Level 3 |
| **Weapons Grade Alloy** | 4 Refined Metals + 2 Fuel Cells | Level 3 |
| **Targeting Arrays** | 2 Electronics + 1 Refined Metals | Level 3 |
| **Stealth Composites** | 3 Polymers + 1 Electronics | Level 4 |
| **Quantum Processors** | 3 Electronics + 1 Weapons Grade Alloy | Level 5 |

**Crafting Time**: 2-5 turns depending on research level and Industrial Planet count.

---

## Tier 3: Advanced Systems (Research 5+)

Strategic resources for capital ships and superweapons.

| System | Recipe | Research Req |
|--------|--------|--------------|
| **Reactor Cores** | 3 Propulsion Units + 2 Electronics + 1 Quantum Processor | Level 5 |
| **Shield Generators** | 2 Armor Plating + 2 Electronics + 1 Quantum Processor | Level 5 |
| **Warp Drives** | 2 Reactor Cores + 1 Stealth Composites + 1 Targeting Array | Level 6 |
| **Cloaking Devices** | 3 Stealth Composites + 2 Quantum Processors | Level 6 |
| **Ion Cannon Cores** | 2 Weapons Grade Alloy + 2 Reactor Cores + 1 Targeting Array | Level 6 |
| **Neural Interfaces** | 2 Quantum Processors + 1 Life Support | Level 7 |
| **Singularity Containment** | 3 Reactor Cores + 2 Shield Generators | Level 8 |

**Crafting Time**: 5-10 turns. Strategic planning required.

---

## Industrial Planets (New Planet Type)

**Cost**: 15,000 credits (expensive, late-game investment)

**Production**: Processes Tier 0 → Tier 1 (player configures which resource)

**Bonus**: Research level reduces crafting time by 5% per level

**Strategic Value**:
- Industrial Planets are multipliers, not producers
- Essential for Tier 2+ crafting at scale
- Target for enemy attacks (high-value infrastructure)

---

## Crafting Queue System

**How It Works:**
1. Players queue crafting orders at Industrial Planets
2. Each order reserves required components (prevents double-spending)
3. Completion time based on complexity and research level
4. Maximum 5 concurrent crafting orders per empire
5. Orders process during turn end phase

**UI Concept:**
```
┌─────────────────────────────────────────────────┐
│ CRAFTING QUEUE                  [3/5 slots used]│
├─────────────────────────────────────────────────┤
│ ⚙️ Quantum Processors (x2)      [Turn 47/50]    │
│ ⚙️ Reactor Cores (x1)           [Turn 49/52]    │
│ ⚙️ Shield Generators (x1)       [Turn 50/54]    │
│                                                 │
│ [+] ADD ORDER                                   │
└─────────────────────────────────────────────────┘
```

---

## Integration with Base Game

**Units Requiring Crafted Components:**

Base game units use credits only. Expansion adds:

| Unit | Base Cost | + Crafting Requirement |
|------|-----------|------------------------|
| **Advanced Fighter** | 500 cr | 1 Electronics, 1 Propulsion Unit |
| **Heavy Cruiser (Enhanced)** | 2,000 cr | 1 Reactor Core, 1 Armor Plating |
| **Dreadnought** | 10,000 cr | 2 Reactor Cores, 2 Shield Generators, 1 Warp Drive |

**Backward Compatibility**: Base game units remain available without crafting requirements.

---

## Balance Considerations

**Pros (Why This Expansion Works):**
- Adds economic depth for hardcore players
- Creates new strategic choices (rush Industrial Planets?)
- Makes late-game more interesting (tech progression matters)

**Cons (Why It's Not in Base Game):**
- Adds cognitive load (20+ new resources to track)
- Supply chain management competes with empire management
- New players would be overwhelmed

**Solution**: Make it optional DLC. Players who want "4X economy sim" can add it.

---

## Full Specification

For complete implementation details, see:
- `docs/expansion/crafting-system.md` - Full service specifications
- `src/lib/game/services/crafting-service.ts` - Reference implementation
- `src/lib/game/constants/crafting.ts` - Recipe definitions

---

*This system is preserved for potential future expansion. Not planned for v1.0 release.*
