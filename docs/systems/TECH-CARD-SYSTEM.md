# Tech Card System

> **Status:** Active — Core System
> **Version:** 2.0
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` § Phase 9

---

## 1. Lore Integration & In-World Framing

The Nexus Dominion wasn't built on standard issue equipment alone. While Research dictates the foundational doctrines of an empire, true supremacy often hinges on acquiring experimental technology, rare precursor artifacts, and forbidden tactical protocols.

The Tech Card System represents these volatile, highly contested assets. The Syndicate tightly controls the dissemination of these "cards," auctioning them off or awarding them in heavily publicized Draft Events. These are not permanent infrastructure upgrades; they are tactical wildcards—a hidden agenda, a devastating first-strike capability, or a galaxy-altering superweapon.

---

## 2. The Three Tiers of Tech

The system operates via a streamlined card draft mechanic, divided into three distinct tiers. This replaces traditional, micromanaged crafting supply chains with high-impact strategic choices.

### 2.1 Tier 1: Hidden Objectives (The Agenda)
- **Draft Timing:** Cycle 1 (Once per game).
- **Mechanic:** Draw 3, Pick 1. Keep it secret. Return the others.
- **Lore Context:** Your empire's true, overarching ambition, hidden from rivals until the very end.
- **Impact:** Grants condition-based milestone progress towards accomplishments when the campaign's ultimate fate is decided.
- **Examples:**
  - *Warmonger's Arsenal:* +Bonus per empire eliminated. ("My weapons were always destined for conquest.")
  - *Merchant's Ledger:* +Bonus per 25,000 credits earned. ("Every transaction brought me closer to dominance.")
  - *Diplomat's Archive:* +Bonus per active treaty. ("My alliances were my true strength.")

### 2.2 Tier 2: Tactical Cards (The Arsenal)
- **Draft Timing:** During the **Nexus Reckoning** (End of every Confluence - Cycles 10, 20, 30...).
- **Mechanic:** Draw 3, Pick 1. **Public Announcement.** The card is permanently added to your active hand.
- **Lore Context:** Rapidly deployed tactical upgrades acquired from Syndicate auctions. Because the auctions are public, the entire galaxy knows what you bought.
- **Impact:** Immediate, automatic combat modifiers.
- **Examples:**
  - *Plasma Torpedoes (Offensive):* +2 damage in the first round of combat.
  - *Shield Arrays (Defensive):* Negates surprise round / first-strike advantages.
  - *Boarding Parties (Offensive):* Capture a percentage of defeated units instead of destroying them.
  - *Cloaking Field (Utility):* Enemies suffer -4 to hit during the first round.

### 2.3 Tier 3: Legendary Cards (The Escalation)
- **Draft Timing:** Confluence 5+ (Cycle 50+). Added to the T2 pool with a ~30% appearance rate during a Nexus Reckoning.
- **Mechanic:** Public Announcement. Massive, galaxy-wide alert.
- **Lore Context:** Apex precursor technology. Acquisition of these cards signals a shift in the balance of power.
- **Impact:** Manual activation for game-breaking effects. Can be single-use, limited-use, or permanent based on power level.
- **Examples:**
  - *Planet Cracker (Single-Use):* Permanently destroy 1 planet. ("THE WEAPON IS ARMED. A world will die.")
  - *Dyson Swarm (Permanent):* Double all credit income from planets.
  - *Mind Control Array (3 Uses):* Force an AI empire to attack a target of your choice.
  - *Temporal Stasis (Single-Use):* Force a target player (or yourself) to skip their entire next Cycle.

---

## 3. The Draft and Counter-Play

Tech Cards are designed to be visible and reactive, creating direct counter-play.

### 3.1 The Public Draft
During every **Nexus Reckoning** (the end of a 10-Cycle Confluence), the game resolves a Draft Event before proceeding to the next Confluence.
1. **Initiative Order:** Draft order is determined by a `1d20 + Charisma` roll for each empire.
2. **Selection:** Empires draft one card. Once drafted, that specific card is removed from the pool for that event.
3. **Visibility:** As soon as an empire drafts a Tier 2 or Tier 3 card, all players are notified alongside the new Cosmic Order standings.

### 3.2 Symbiosis with Research
Research provides **Foundational Stats**; Tech Cards provide **Tactical Modifiers**. They stack multiplicatively.
- *Example Setup:* An empire has the "War Machine" Research Doctrine (+2 STR) and drafts the "Plasma Torpedoes" Tech Card (+2 first-round damage).
- *Result:* In the opening salvo of combat, that empire will hit with a massive +4 effective combat advantage.

### 3.3 The Rock-Paper-Scissors Layer
Because drafts and hands are public (visible via diplomacy/intel screens), players must counter-pick:
- If a rival drafts *Plasma Torpedoes*, draft *Point Defense* (reduces incoming first-round damage).
- If an enemy focuses on the *Shock Troops* Research (surprise attacks), draft *Shield Arrays* (negates surprise rounds).
- If an enemy relies on *Cloaking Fields* (Tech) to survive, prioritize *Scanner Arrays* (Tech) to negate it.

---

## 4. Bot Behaviors & Reactions

The AI extensively utilizes the Tech Card system, providing both mechanical challenge and narrative flavor.

### 4.1 Archetype Preferences
Bots prioritize cards based on their core personality:
- **Warlords** seek *Warmonger's Arsenal* (T1), *Plasma Torpedoes* (T2), and the *Planet Cracker* (T3).
- **Turtles** rely on *Survivor's Grit* (T1), *Shield Arrays* (T2), and the *Genesis Device* (T3) to build tall.
- **Merchants** hoard *Salvage Operations* (T2) and aim for the *Dyson Swarm* (T3).

### 4.2 Bot Drama
Bots will vocally react to Draft Events in the communications feed:
- *When a Warlord drafts Torpedoes:* "Your shields mean nothing now."
- *When a Turtle drafts Shield Arrays:* "Come test my walls, if you dare."
- *Strategic Observation:* "Warning: Lady Chen has acquired EMP capabilities. Recommending Hardened Circuits for our next draft."

### 4.3 Combat Integration
Bots do not act randomly; an aggressive AI that drafts *Cloaking Fields* will actively seek out early-game skirmishes to leverage its decisive first-round advantage before opponents can draft counters.

---

## 5. UI/UX Targets

*Ref: `FRONTEND-DESIGN.md`*

- **The Player Hand:** A persistent lower-screen HUD showing currently active Tier 2/Tier 3 cards. Includes a locked/obscured slot noting the progress of the Tier 1 Hidden Objective.
- **The Draft Modal:** A clean, boardgame-style interface appearing alongside the Nexus Reckoning updates. Presents 3 cards with clear iconography (Explosion for Offensive, Shield for Defensive, etc.), explicitly listing what the card explicitly counters.
- **Combat Overlay:** During the combat resolution phase, active cards visually slide into the UI to demonstrate *why* modifiers are being applied (e.g., A Torpedo icon flashing to justify a massive first-hit).
- **The Grand Reveal:** When major campaign achievement triggers occur, the dramatic reveal of an empire's Tier 1 Secret Objective can serve as a massive narrative culmination point.
