# Expansion Content: Post-Launch DLC

**Status:** Post-v1.0 Content
**Prerequisites:** Stable v1.0 release with positive player feedback
**Philosophy:** Add depth for players who master the base game

---

## Expansion Strategy

The base game provides a complete, polished experience. Expansions add optional depth for players who want more strategic complexity.

**Key Principle:** Expansions enhance, never invalidate, base game strategies.

---

## Expansion Pack 1: "Industrial Age"

**Theme:** Manufacturing & Resource Crafting
**Target Audience:** Players who want deeper economic strategy

### Core Feature: 4-Tier Crafting

Transform raw resources into advanced components:

```
Tier 0 (Base Game)        Tier 1 (Refined)         Tier 2 (Components)       Tier 3 (Advanced)
├── Ore ─────────────────→ Refined Metals ────────→ Electronics ─────────────→ Reactor Cores
├── Petroleum ───────────→ Fuel Cells ───────────→ Propulsion ──────────────→ Warp Drives
├── Food ────────────────→ Processed Food ───────→ Life Support ────────────→ Neural Interface
└── Population ──────────→ Labor Units
```

### New Sector Type: Industrial

- **Cost:** 15,000 credits (expensive late-game)
- **Function:** Processes Tier 0 into Tier 1, enables Tier 2+ crafting
- **Strategic Value:** Multiplier for advanced manufacturing

### New Units (Require Crafting)

| Unit | Credits | Crafting Requirement |
|------|---------|----------------------|
| **Advanced Fighter** | 500 | 1 Electronics, 1 Propulsion |
| **Enhanced Heavy Cruiser** | 2,000 | 1 Reactor Core, 1 Armor Plating |
| **Dreadnought** | 10,000 | 2 Reactor Cores, 2 Shield Generators, 1 Warp Drive |

**Backward Compatibility:** Base game units remain fully viable without crafting.

### Why This Adds Value

- **Depth for veterans:** Players who master base economy can optimize supply chains
- **New strategic decisions:** Build time vs buying power trade-offs
- **Late-game progression:** Something to work toward after economy stabilizes

---

## Expansion Pack 2: "Shadow War"

**Theme:** The Galactic Syndicate
**Target Audience:** Players who enjoy underdog stories and asymmetric gameplay

### Core Feature: Trust-Based Progression

Rise through Syndicate ranks to unlock forbidden goods:

| Level | Title | Unlocks |
|-------|-------|---------|
| 0 | Unknown | Entry contract required |
| 1-2 | Associate/Runner | Basic components, pirate contracts |
| 3-4 | Soldier/Captain | Player contracts, premium items |
| 5-6 | Lieutenant/Underboss | Advanced systems, Chemical weapons |
| 7-8 | Consigliere/Syndicate Lord | Nuclear weapons, Bioweapons |

### Contract System

Earn trust and credits by completing missions:

| Tier | Risk | Example | Reward |
|------|------|---------|--------|
| 1 | Low | Supply Run vs pirates | 5,000 cr + 10 trust |
| 2 | Medium | Economic warfare | 25,000 cr + 40 trust |
| 3 | High | Kingslayer (top 3) | 100,000 cr + 100 trust |
| 4 | Extreme | The Equalizer | Exclusive tech |

### Comeback Mechanics

When you fall into the **bottom 50%** of empires:
- Syndicate reaches out with invitation
- First contract offers 50% bonus trust
- One-time "startup funds" of 10,000 credits
- Access to Equalizer contracts targeting leaders

### Black Market

Purchase items instantly (if you have the trust):
- Skip crafting queues (with crafting expansion)
- WMDs for dramatic endgame plays
- Intelligence services on rivals

### The Choice

**Report to Coordinator:**
- +10% permanent funding bonus
- Syndicate becomes hostile forever
- Lose all trust

**Stay Loyal:**
- Access to forbidden technology
- Reputation risk if discovered
- Potential empire-shifting power

---

## Expansion Synergies

The two expansions work together but are independent:

| Scenario | Experience |
|----------|------------|
| **Neither** | Complete base game |
| **Industrial Age only** | Deeper economic strategy |
| **Shadow War only** | Alternative progression path |
| **Both** | Maximum strategic depth |

---

## Implementation Status

Both systems have backend groundwork:

| System | Backend | UI | Integration |
|--------|---------|-----|-------------|
| Crafting | Schema ready | Pending | Service exists |
| Syndicate | Schema ready | Pending | Actions exist |
| Contracts | Schema ready | Pending | - |
| Black Market | Schema ready | Pending | - |

See [FUTURE.md](FUTURE.md) for Wave 2-4 features that build on these expansions.

---

## Design Decisions

### Why DLC Instead of Base Game?

1. **Cognitive Load:** 20+ resources in crafting overwhelms new players
2. **Focus:** Base game teaches core 4X without distractions
3. **Value:** Expansions reward mastery, not punish beginners
4. **Testing:** Core loop validated before adding complexity

### Balance Philosophy

- Crafted units are *different*, not strictly *better*
- Syndicate path has real risks (reputation, hostility)
- Base game victory paths remain viable
- No "pay to win" in DLC design

---

## Related Documents

- [Crafting Details](../expansion/CRAFTING.md) - Full specification
- [Syndicate Details](../expansion/SYNDICATE.md) - Full specification
- [Design Alternatives](../decisions/) - Other approaches considered
- [Future Roadmap](FUTURE.md) - Long-term vision

---

*Expansions should make players think "I want to try that" not "I need to buy that."*
