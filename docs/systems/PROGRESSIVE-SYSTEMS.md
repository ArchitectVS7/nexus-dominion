# Progressive Systems & Events

> **Status:** Active — Core System
> **Version:** 2.0
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` System Features

---

## 1. Lore Integration & In-World Framing

A Governor’s career in the Syndicate is rarely brief, provided they survive their first few Cycles. As an empire matures, new technologies, dark alliances, and terrible weapons become available. Furthermore, the galaxy is not a static playing field. Cosmic anomalies (Galactic Pulses), economic booms, and devastating plagues sweep across the stars, affecting all who dwell within them.

This system governs the flow of time: how new Governors learn the ropes, how veterans unlock the galaxy's darkest tools, and how the universe itself occasionally revolts against its conquerors.

---

## 2. The Onboarding Experience (Learn By Playing)

Nexus Dominion does not use a separate, disconnected tutorial sandbox. The first 10 Cycles of a new Governor’s career are highly directed but occur within a live, active galaxy.

### 2.1 The Directed Start (Cycles 1-10)

- **Cycle 1 (The Neighborhood):** Exploration of the starting 5 sectors (Food, Ore, Petroleum, Commerce, Urban).
- **Cycle 2 (Expansion):** Guided construction of a new Food Sector.
- **Cycle 3 (Militarization):** Guided construction of the first 10 Fighter units. *At this point, the "Skip Tutorial" option becomes available in the UI.*
- **Cycle 5 (The Market):** Guided first transaction on the Galactic Market.
- **Cycles 6-10 (Borders & Blood):** Introduction to neighboring space, the concept of Networth, and a guided first combat encounter (initiation and defense).

### 2.2 Bot Passivity

To ensure new Governors aren't immediately crushed:
- During Cycles 1-10, all AI damage is globally reduced by **50%**.
- Highly aggressive Bot Archetypes (Warlord, Blitzkrieg) have their attack priorities severely tuned down until Cycle 15.

*Veterans acting under the "Skip Tutorial" option instantly void these protections, unlocking all features and facing full-strength AI from Cycle 1.*

---

## 3. The Feature Unlock Schedule

True power is earned. To prevent cognitive overload, advanced geopolitical and strategic systems unlock globally as the game progresses into the mid and late stages, often tied to the end of a **Confluence** (every 10 Cycles).

1. **End of Confluence 2 (Cycle 20): Syndicate Diplomacy**
   - **Unlocks:** All treaty proposals (Stillness Accord, Star Covenant, Nexus Compact) and direct messaging.
   - **Lore:** "The Syndicate acknowledges your stability. You may now parley with your rivals."
2. **End of Confluence 3 (Cycle 30): Academic Specialization**
   - **Unlocks:** Tier 2 Research drafting becomes available to empires with sufficient Research Points.
3. **End of Confluence 5 (Cycle 50): The Shadow Brokerage**
   - **Unlocks:** The Black Market, Covert Operations, and Spy recruitment.
   - **Lore:** "The shadows lengthen. Saboteurs and smugglers are now at your disposal."
4. **End of Confluence 10 (Cycle 100): The Omega Protocol**
   - **Unlocks:** Nuclear Weapons research, production, and deployment.
   - **Lore:** "The ultimate deterrent. Use them, and the galaxy will burn."

---

## 4. Galactic Pulses (The Great Equalizers)

The galaxy is volatile. During any given Cycle after Cycle 20, there is a **3% chance** (avg. 1 per 30 Cycles) for a massive, galaxy-wide event (a Galactic Pulse) to trigger. Only one Pulse can be active at a time. Pulses are announced 1 Cycle in advance (except Supernovas).

### The Event Roster

- **Golden Age (25% freq.):** 10 Cycles. +20% Commerce (Credits) income for all empires.
- **Resource Boom (25% freq.):** 8 Cycles. 2x production of Food, Ore, and Petroleum.
- **Tech Breakthrough (20% freq.):** Instant. All empires are granted one free Tier 2 tech.
- **Plague (15% freq.):** 5 Cycles. A devastating illness sweeps the stars. All empires immediately lose 10% of their total Population.
- **Rebellion (15% freq.):** Instant. The empire with the lowest Military Power loses 2 to 5 random sectors as they declare independence (becoming neutral space).
- **Galactic War (10% freq.):** 15 Cycles. All existing treaties, pacts, and alliances are immediately voided. No new treaties can be formed for the duration. Total war.
- **Wormhole Collapse (5% freq.):** Instant. Sub-space anomalies completely destroy every Wormhole structure on the map.
- **Supernova (5% freq.):** Instant. No warning. A hyper-giant star explodes, permanently deleting one random sector (either unowned or belonging to the weakest empire) and instantly obliterating any fleets stationed there.

### AI Reactions to Pulses
Bots react dynamically to cosmic shifts. A *Merchant* will leverage a Golden Age to build its economy, while a *Warlord* will see a Plague as the perfect time to attack weakened borders, ignoring the suffering of their own people.

---

## 5. Continuity: The State Chronicle

Nexus Dominion campaign games can last hundreds of Cycles. The system ensures progress is not lost to the void.

1. **Auto-Saves (The Database State Chronicle):** The game silently records a complete state snapshot to the database automatically every 20 Cycles, immediately before a war declaration, and immediately before a nuclear launch. 
2. **Manual Checkpoints:** A player may explicitly choose to "Save & Exit" at any point outside of Cycle-resolution. 

---

## 6. UI/UX Targets

*Ref: `FRONTEND-DESIGN.md`*

- **Tutorial Overlays:** Blue-tinted, non-intrusive modal overlays providing objective checklists. Must never obscure the Star Map action.
- **Pulse Warnings:** Yellow/Orange banners slide down from the Top Bar announcing impending Galactic Pulses.
- **Active Pulse State:** If a Pulse is active (e.g., Plague), a persistent Red banner remains anchored beneath the Top Bar, tracking the remaining duration.
- **Unlock Celebrations:** Major features (Diplomacy, Covert Ops, Nukes) are introduced with a full-screen, thematic modal, announcing the shifting state of the galaxy.
