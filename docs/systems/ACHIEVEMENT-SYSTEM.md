# Achievement System

> **Status:** Active — Core System
> **Version:** 2.0
> **Created:** 2026-03-09
> **Last Updated:** 2026-03-09
> **PRD Reference:** `docs/prd.md` § 12

---

## 1. Core Concept

In Nexus Dominion, there is no generic "Game Over" screen and no hard turn limits (unlike legacy versions of the game). The universe does not end simply because an empire achieved supremacy. 

Instead, the game utilizes a persistent **Achievement System**. Achievements mark profound milestones within an ongoing campaign. When a player or bot reaches an achievement threshold, it triggers a galaxy-wide **Nexus Signal**, granting them a title, logging the event in the campaign history, and provoking a specific emergent response from the rest of the galaxy.

The campaign continues after an achievement is earned. The goal is to build a lasting legacy, potentially earning multiple achievements across different strategic domains over hundreds of Cycles.

---

## 2. The Nine Achievements

All achievement paths are tracked simultaneously. There is no need to "declare" a victory condition at the start of a campaign.

### 2.1 Conquest
- **The Concept:** Unquestioned military dominance and territorial control.
- **Trigger Condition:** The empire holds a dominant share of star systems, and a sufficient number of rival empires have been eliminated from the galaxy.
- **Estimated State at Trigger:** ~45 empires eliminated, achiever holds ~80 star systems.
- **Galactic Response:** Remaining independent empires form an immediate, desperate **Nexus Compact** aimed purely at survival and containment.

### 2.2 Trade Prince
- **The Concept:** Unfathomable economic supremacy.
- **Trigger Condition:** The empire's Networth exceeds the nearest rival by a sustained, overwhelming margin.
- **Estimated State at Trigger:** Achiever holds ~10 highly developed, high-value star systems and vast credit reserves.
- **Galactic Response:** Rival empires drastically increase tariffs, embargo the Trade Prince, and prioritize covert ops (Steal Credits/Sabotage) against them.

### 2.3 Market Overlord
- **The Concept:** Control over the flow of galactic commerce.
- **Trigger Condition:** Controls the majority of high-volume galactic trade hub systems (Commerce Sectors) for a sustained period.
- **Estimated State at Trigger:** Achiever holds ~12 hub systems.
- **Galactic Response:** The Syndicate intervenes, either offering an incredibly lucrative (and dangerous) partnership or funding pirate fleets to break the monopoly.

### 2.4 Cartel Boss
- **The Concept:** Monopolization of a vital galactic resource.
- **Trigger Condition:** Corners a critical resource (e.g., holds 90%+ of all Petroleum-producing systems) and sustains the monopoly for a defined period of Cycles.
- **Estimated State at Trigger:** Achiever holds ~8 critical, highly fortified systems.
- **Galactic Response:** The Galactic Commons issues targeted sanctions; affected empires gain a *Casus Belli* to violently seize the monopolized resource without standard reputation penalties.

### 2.5 Grand Architect
- **The Concept:** The ultimate diplomat and coalition builder.
- **Trigger Condition:** Leads the specific **Nexus Compact** (coalition) that successfully topples the current dominant power (the empire closest to winning another achievement).
- **Estimated State at Trigger:** ~50 empires eliminated (by the dominant power); a massive multi-empire war concludes.
- **Galactic Response:** The architect is hailed as a savior. They receive a massive temporary reputation boost globally, but former coalition members immediately begin plotting against them out of fear of their newfound influence.

### 2.6 Singularity
- **The Concept:** Technological ascension beyond mortal limits.
- **Trigger Condition:** Completes a full overarching research path through all eight levels to the final Capstone.
- **Estimated State at Trigger:** Achiever holds a small but highly developed core (e.g., ~6 systems) churning out massive Research Points.
- **Galactic Response:** A **Convergence Alert** triggers. Militaristic empires view the ascension as an existential threat and prioritize immediate preemptive strikes.

### 2.7 Warlord
- **The Concept:** The terror of the stars. Defeating enemies in detail.
- **Trigger Condition:** Directly defeats-in-detail a defined number of rival empires, holding every single star system taken from them.
- **Estimated State at Trigger:** ~40 empires eliminated *directly by the achiever*. Achiever holds ~40 densely packed systems.
- **Galactic Response:** The galaxy treats the Warlord as a plague. All standard diplomacy with the Warlord is disabled. Weaker empires willingly subjugate themselves to other strong empires just for protection.

### 2.8 Endurance
- **The Concept:** The unyielding fortress.
- **Trigger Condition:** Survives a defined number of massive coalition attempts (Nexus Compacts) explicitly directed at eliminating them.
- **Estimated State at Trigger:** Achiever holds ~15 highly defensible systems and has fought off multiple existential threats over dozens of Confluences.
- **Galactic Response:** A period of enforced peace. Enemy empires suffer severe exhaustion modifiers and civil unrest if they attempt to declare war on the Endurance achiever for a set duration.

### 2.9 Shadow Throne (Prestige)
- **The Concept:** The hidden puppet master.
- **Trigger Condition:** Holds control of the Syndicate (via the covert contract system) *while* earning any other major achievement, **and** has never been exposed to the galaxy as the Syndicate leader.
- **Estimated State at Trigger:** Co-occurs with another achievement's galaxy state.
- **Galactic Response:** None. The galaxy remains ignorant of who truly pulls the strings. This is the rarest and most difficult achievement in Nexus Dominion.

---

## 3. Bot Achievement Pursuit

The AI actively pursues achievements based on their underlying Archetypes:

- **Warlords / Blitzkriegs:** Pursue *Conquest* and *Warlord*.
- **Merchants / Opportunists:** Pursue *Trade Prince*, *Market Overlord*, and *Cartel Boss*.
- **Diplomats:** Pursue *Grand Architect* and *Endurance*.
- **Turtles / Tech Rush:** Pursue *Singularity* and *Endurance*.
- **Schemers:** Pursue *Grand Architect* and *Shadow Throne*.

When a bot earns an achievement, it is announced to the player via the Cycle Report as a major narrative event, complete with the appropriate Galactic Response.

---

## 4. The Anti-Snowball Mechanism (Nexus Signals)

To keep the game engaging across hundreds of Cycles, the galaxy reacts before an achievement is reached. 

As any empire approaches ~80% completion of an achievement threshold, the Nexus emits a **Nexus Signal**—an observable distortion in the galactic energy field. The Galactic Commons translates this signal into a **Convergence Alert**.

This alert warns the rest of the galaxy (and the player) that an empire is nearing supremacy. It acts as the mechanical trigger for other empires to set aside their differences and form a defensive **Nexus Compact** to stop the leader. The intensity of the coalition scales with the specific achievement being pursued (e.g., economic achievements trigger trade embargoes; military achievements trigger unified armadas).
