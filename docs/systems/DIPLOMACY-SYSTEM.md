# Diplomacy System

> **Status:** Active — Design Reference
> **Version:** 1.0
> **Created:** 2026-03-08
> **Last Updated:** 2026-03-08
> **PRD Reference:** `docs/prd.md` § Requirements 7
> **Supersedes:** `docs/other/Game Systems/DIPLOMACY-SYSTEM.md`

---

## Document Purpose

This document defines the complete design of the Nexus Dominion diplomacy system: treaty types, reputation mechanics, coalition formation, bot diplomatic behaviour, and UI presentation. It is the authoritative reference for all diplomatic gameplay decisions.

**Intended readers:**
- Game designers making balance and mechanic decisions
- Developers implementing the diplomacy engine
- Anyone resolving a design question about how treaties, violations, or reputation work

**Design philosophy:**
- **Treaties are tools, not guarantees.** Every treaty has a cost and a benefit. Holding a treaty is a strategic choice; breaking one is also a strategic choice, with consequences.
- **Violations are witnessed.** The Galactic Commons sees everything. There are no private betrayals.
- **Reputation has memory.** The galaxy forgets slowly. A Covenant Breaker plays the rest of the campaign in a harder diplomatic environment.
- **Bot behaviour must be legible.** Players should be able to read a bot's diplomatic intentions from their archetype and past actions — not be surprised by random treaty violations.
- **Every instrument has an in-world name.** Players never see "NAP" or "Alliance" as UI labels. They see Stillness Accords, Star Covenants, and Nexus Compacts.

---

## Table of Contents

1. [In-World Framing](#1-in-world-framing)
2. [Core Concept](#2-core-concept)
3. [Treaty Types](#3-treaty-types)
4. [Reputation System](#4-reputation-system)
5. [Nexus Compact and Coalition Mechanics](#5-nexus-compact-and-coalition-mechanics)
6. [Bot Diplomatic Behaviour](#6-bot-diplomatic-behaviour)
7. [UI and UX](#7-ui-and-ux)
8. [Balance Targets](#8-balance-targets)
9. [Open Questions](#9-open-questions)
10. [Revision History](#10-revision-history)

---

## 1. In-World Framing

### 1.1 The Galactic Commons

The Galactic Commons is the ancient diplomatic institution that formed around the interpretation of Nexus behaviour. It is not a government — no empire has ever agreed to be governed — but it is the framework within which all empires conduct diplomacy, declare war, sign treaties, and acknowledge each other's standing.

The Commons has no military. Its power is entirely reputational. Violating Commons conventions is legal; it marks your empire as one the galaxy cannot trust.

All three treaty types are **registered instruments**: they exist as public Commons records, visible to every empire in the galaxy. This is why violations matter beyond the bilateral relationship — the galaxy witnesses them.

### 1.2 The Diplomacy Layer of the Cosmic Order

The Cosmic Order (see `docs/prd.md` — The Nexus and the Cosmic Order) governs empire standing. Diplomacy interacts with the Cosmic Order in two ways:

1. **Reputation affects tier transitions.** An empire with high reputation may hold Ascendant standing even with modest military power, because other empires are more willing to work with them. Low reputation can accelerate a fall to Stricken.

2. **Convergence Alerts invite Compact formation.** When any empire's power level triggers a Convergence Alert, the Galactic Commons formally notifies all empires and invites the formation of a Nexus Compact. This is the structural anti-snowball mechanism.

### 1.3 The Syndicate Intersection

The Syndicate operates beneath the Commons framework. Syndicate contracts can instruct an empire to break a treaty — this is one of the ways Syndicate affiliation creates moral and strategic risk for the player. A Syndicate-instructed Covenant betrayal carries the same full reputation consequences as any other. The Syndicate does not protect you from the Commons. This is part of what makes the Shadow Throne achievement genuinely difficult.

---

## 2. Core Concept

### 2.1 The Diplomatic Ladder

The three treaty types form a progression of commitment and mutual obligation:

```
Nexus Compact       — Highest commitment. Vow with a declared purpose and target.
     ↑
Star Covenant       — Deep commitment. Shared destiny, mutual defence, shared intelligence.
     ↑
Stillness Accord    — Minimum commitment. Mutual restraint. No warmth, no obligation beyond non-attack.
     ↑
(No treaty)         — Default state. No obligations, no protections.
```

Empires can hold multiple treaties simultaneously — a Stillness Accord with one empire while maintaining a Star Covenant with another. A Nexus Compact against a declared target supersedes any Stillness Accord with that target (you cannot hold a Compact against an empire you have a Stillness with — proposing a Compact requires first withdrawing the Accord).

### 2.2 The Core Loop

```
1. Observe bot behaviour → deduce archetype and intentions
2. Build initial reputation through trade and non-hostility
3. Propose or accept treaties aligned with strategic position
4. Leverage treaty benefits (trade, intel, military access)
5. Decide: honour, renegotiate, or betray — and accept consequences
6. Monitor galaxy for Convergence Alerts → respond to Compact invitations
7. Coalition dynamics reshape power balance → new diplomatic landscape
```

### 2.3 Player Experience

Diplomacy in Nexus Dominion should feel like **reading the room in a political thriller**. You observe who is allied with whom, you notice which bot's behaviour doesn't match their stated Covenant, you decide whether the Schemer's proposal is a genuine offer or a prelude to betrayal.

The star map is the primary diplomatic read: Covenant Lines connect allies, Compact markers indicate active coalitions, and the presence or absence of connections tells a story about every empire's position.

---

## 3. Treaty Types

### 3.1 Stillness Accord

**In-world name:** *Stillness Accord*
**Informal usage:** "a Stillness," "we have a Stillness with them"
**Commons registration:** Yes — visible to all empires

**Lore:** The Stillness Accord is the most ancient form of galactic diplomacy. It takes its name from the measurable quieting of the Nexus field between two empires that cease hostilities. Whether this is cause or effect remains debated. In practice, a Stillness is the minimum unit of trust: two empires agreeing to turn their attention elsewhere. It carries no warmth and no obligation beyond restraint.

#### What You Gain

| Benefit | Detail |
|---|---|
| Military protection | They will not initiate attacks against your star systems for the Accord's duration |
| Trade access | Basic trade at standard market rates (Stillness opens ports that would otherwise be closed to rivals) |
| Reputation signal | Minor positive signal to galaxy — you are an empire that makes agreements |

#### What You Offer

| Obligation | Detail |
|---|---|
| Non-aggression | You will not initiate attacks against their star systems |
| Trade access | Symmetric — they trade at standard rates with you |

#### Terms

- **Duration:** Indefinite. Either party may withdraw with **1 Cycle's notice** without reputation penalty.
- **Immediate withdrawal:** Legal, but treated as a minor bad-faith signal (−5 reputation, no formal violation).
- **Violation:** Attacking an Accord partner without notice.

#### Violation: *Breach of Accord*

| Consequence | Scope | Duration |
|---|---|---|
| Reputation: **−20 points** | All empires, galaxy-wide | Permanent (until rebuilt through gameplay) |
| Victim gains *Wronged* status | Victim only | 10 Cycles |
| *Wronged* combat bonus: **+25% effectiveness** vs you | Victim only | 10 Cycles |
| Current Accord partners reassess: bots evaluate whether to maintain or withdraw | Galaxy-wide | Immediate |
| New Accord acceptance rate: **−15%** | Galaxy-wide | 20 Cycles |
| Commons issues *Breach of Accord* notice | All event logs | Permanent record |

**In-game event text:** *"You have broken the Stillness. The Galactic Commons has recorded the Breach of Accord between your empire and [name]. The galaxy is watching."*

---

### 3.2 Star Covenant

**In-world name:** *Star Covenant*
**Informal usage:** "a Covenant," "we are Covenant-bound"
**Star map display:** Covenant Lines — visible connecting lines between allied home systems
**Commons registration:** Yes — visible to all empires

**Lore:** A Star Covenant is a declaration of shared destiny. Where a Stillness says "we will not fight," a Covenant says "we will rise together." It is a public assertion of bloc power. Covenant Lines appear on every empire's star map — a visible signal to rivals and potential partners alike. A Covenant is not entered lightly. Its obligations are real, its violations catastrophic, and its benefits substantial.

The Covenant is the primary instrument for meaningful alliance-building. Schemers enter Covenants specifically to betray them. Every Schemer-archetype bot carries a hidden "betrayal clock" — a strategic threshold at which betrayal becomes their optimal move. This is known behaviour; experienced players will recognise it and plan accordingly.

#### What You Gain

| Benefit | Detail |
|---|---|
| Military defence | They defend you if you are attacked — their forces join combat on your side as the defender |
| Joint operations | You can request coordinated military action against a shared target; they may accept or decline based on strategic situation and emotional state |
| Trade Covenant | **15% discount** on all resource trades between Covenant members (both directions) |
| Intelligence sharing | Their known intelligence about third parties is visible to you; yours to them |
| Bloc recognition | The Commons registers you as a power bloc; other empires negotiate knowing you have committed partners |
| Star map presence | Covenant Lines are visible — signals strength and commitment to the galaxy |

#### What You Offer

| Obligation | Detail |
|---|---|
| Military defence | You defend them if attacked — symmetric obligation |
| Joint operation availability | Must respond to joint operation requests (can decline, but repeated refusals damage relationship) |
| Trade discount | Costs you revenue on trades with the partner |
| Intelligence sharing | Your intel shared with them — including information you may not want shared |
| Constraint | You may not attack Covenant partners; conventional (not legal) restraint also applies to their Stillness Accord holders |

#### Terms

- **Duration:** Indefinite. Either party may formally dissolve with **3 Cycles' notice** without reputation penalty.
- **Immediate dissolution:** −20 reputation (considered a lesser violation — you left, you didn't attack).
- **Violation:** Attacking a Covenant partner; dissolving the Covenant while under attack.

#### Violation: *Covenant Breaker*

| Consequence | Scope | Duration |
|---|---|---|
| Reputation: **−50 points** | All empires, galaxy-wide | Permanent |
| *Covenant Breaker* designation | All event logs and star map tooltip | 30 Cycles |
| All Covenant members become **immediately hostile** | Covenant members | Permanent until reconciliation |
| Each former member: **+40% combat effectiveness** vs you | Each former Covenant member | 20 Cycles |
| All current Stillness Accords: auto-reassessment | Galaxy-wide | Immediate (most will withdraw) |
| New Accord acceptance rate: **−30%** | Galaxy-wide | 30 Cycles |
| New Covenant acceptance rate: **−60%** | Galaxy-wide | 30 Cycles |
| All empires with memory: *Distrust* emotional modifier | All bots with relationship memory of event | Persistent in relationship memory |
| Commons issues *Covenant Breaker* censure | All event logs; galaxy-wide announcement | Permanent record |

**In-game event text:** *"You have broken the Star Covenant. The Galactic Commons names you Covenant Breaker. Your Covenant Lines are struck from the star map. The galaxy will not forget what you have done."*

**Design note:** A Covenant Breaker can still win the campaign — but the diplomatic path is nearly closed for approximately five Confluences. They must pursue Conquest, Warlord, or economic achievements through military pressure rather than cooperation.

---

### 3.3 Nexus Compact

**In-world name:** *Nexus Compact*
**Informal usage:** "the Compact," "we hold a Compact against them"
**Leader title:** *Grand Architect of the [Compact name]*
**Commons registration:** Yes — publicly declared, target identified
**Star map display:** Compact membership marker on all member home systems; declared target flagged

**Lore:** A Nexus Compact is the galaxy's highest form of collective action — a vow with a purpose. It is not a friendship; it is organised will directed at a specific outcome. When a Convergence Alert fires, the Commons formally invites Compact formation. But Compacts can also be player-initiated for any strategic purpose the founding empires agree upon. The Compact is named at formation (by the Grand Architect candidate) and that name persists in the campaign record whether the Compact succeeds or fails.

The Nexus appears most active during Compact formations — measurable field stabilisation occurs around the declared target, as if the galaxy's energy responds to organised resistance. This is the in-world explanation for the combat bonus Compact members receive against the target.

#### What You Gain (as Member)

| Benefit | Detail |
|---|---|
| Coordinated military access | All member militaries may act in joint operations against the declared target |
| Combat bonus | **+20% effectiveness** against the declared target while the Compact holds |
| Full intelligence sharing | All members share known intel across the Compact |
| War Chest access | Shared resource pool for Compact military operations (draw rights based on contribution level) |
| Path to Grand Architect | If you are the founding leader and the Compact succeeds, you earn Grand Architect |

#### What You Gain (as Grand Architect — Compact Leader)

| Benefit | Detail |
|---|---|
| Command authority | You direct coordinated Compact military actions |
| War Chest control | You authorise resource draws from the War Chest |
| Grand Architect achievement | Earned on successful conclusion |
| Reputation: **+30 points** | Galaxy-wide, on successful conclusion |
| Title | *Grand Architect of [Compact name]* — permanent campaign record |

#### What You Offer

| Obligation | Detail |
|---|---|
| Military commitment | Forces must be available for Compact actions against the declared target |
| War Chest contribution | Negotiated at formation; can be zero, but low contribution weakens Grand Architect candidacy and Compact standing |
| Public declaration | The target empire and their Covenant partners become hostile for the Compact's duration |
| Strategic constraint | Cannot sign a Stillness Accord with the declared target during the Compact |
| Subordination | Your Compact-related strategy is partially subordinated to the Grand Architect's direction |

#### The War Chest

The War Chest is a shared resource pool created at Compact formation. Members contribute resources each Cycle; the Grand Architect authorises draws for Compact military operations.

- Contributions are negotiated at formation (minimum, recommended, and maximum per member)
- Draws require Grand Architect authorisation
- If the Compact dissolves by vote: War Chest is proportionally returned to contributors
- If the Compact is abandoned by the Grand Architect (violation): War Chest is forfeited — distributed to remaining members

#### Terms

- **Duration:** Until declared objective is achieved, member vote (majority) dissolves it, or a violation occurs.
- **Voluntary dissolution:** Members may call a dissolution vote. Simple majority carries. No reputation penalty for dissolutions by vote.
- **Withdrawal (leaving without dissolution vote):** Violation — see below.

#### Violation: *Compact Traitor*

| Consequence | Scope | Duration |
|---|---|---|
| Reputation: **−40 points** | All empires, galaxy-wide | Permanent |
| *Compact Traitor* designation | All event logs | 40 Cycles |
| All Compact members become hostile | Compact members | Permanent until reconciliation |
| Remaining members: **+15% combat effectiveness** vs you | Compact members | 15 Cycles |
| Declared target: learns the Compact is weakened (intelligence event) | Target empire | Immediate |
| Grand Architect progress: **forfeit** | Achiever record | Permanent |
| Compact leadership acceptance rate: **−50%** | Galaxy-wide | 50 Cycles |
| War Chest contribution: **forfeited** to remaining members | Compact treasury | Immediate |
| Commons issues *Compact Traitor* designation | All event logs; galaxy-wide announcement | Permanent record |

**In-game event text:** *"You have abandoned the Nexus Compact. The Grand Architect has recorded your treachery. The Compact continues without you — but it is weakened, and the galaxy knows why."*

---

### 3.4 Treaty Comparison at a Glance

| | Stillness Accord | Star Covenant | Nexus Compact |
|---|---|---|---|
| Military protection | ✓ Non-aggression only | ✓ Active defence | ✓ Joint offensive |
| Trade benefit | Standard access | 15% discount | War Chest pooling |
| Intelligence sharing | None | Full bilateral | Full multilateral |
| Star map visibility | No line | Covenant Lines | Compact marker |
| Withdrawal notice | 1 Cycle | 3 Cycles | Vote required |
| Violation rep hit | −20 | −50 | −40 |
| Recovery window | ~20 Cycles | ~30 Cycles | ~50 Cycles (leadership) |
| Violation designation | Breach of Accord | Covenant Breaker | Compact Traitor |

---

## 4. Reputation System

### 4.1 Reputation Score

Every empire has a **Reputation Standing** — a numerical score maintained by the Galactic Commons and visible to all empires.

| Range | Standing | Effect |
|---|---|---|
| 80–100 | *Honoured* | Maximum treaty acceptance rates; diplomatic bonus on all negotiations |
| 50–79 | *Respected* | Standard acceptance rates; no modifiers |
| 20–49 | *Doubted* | Reduced acceptance rates; bots demand better terms |
| 0–19 | *Distrusted* | Severely reduced acceptance; most bots will not negotiate |
| Below 0 | *Condemned* | Near-total diplomatic isolation; only transactional Stillness possible with desperate empires |

**Starting score:** 50 (Respected) for all empires at campaign start.

**Reputation caps:** Minimum is uncapped (can go deeply negative). Maximum is 100.

### 4.2 Reputation Gains

| Action | Gain |
|---|---|
| Honour a treaty for a full Confluence (10 Cycles) | +5 |
| Successfully lead a Nexus Compact to conclusion | +30 |
| Fulfil a requested joint operation | +10 |
| Complete a trade deal above market rate (generous terms) | +3 |
| Achieve Sovereign Tier standing without triggering Convergence Alert | +8 |
| Reconcile with a former Covenant partner (see §4.4) | +15 |

### 4.3 Reputation Losses

See treaty violation tables in §3. Other losses:

| Action | Loss |
|---|---|
| Declare war on an empire with no prior hostility (unprovoked) | −10 |
| Conduct covert operation that is detected | −5 to −15 (scaled by severity) |
| Withdraw from Covenant with immediate dissolution (no notice) | −20 |
| Allow War Chest to run dry through non-contribution | −8 |
| Refuse 3+ consecutive joint operation requests from a Covenant partner | −10 |

### 4.4 Reconciliation

Diplomatic bridges can be rebuilt, but slowly. Reconciliation requires:

1. **Minimum quiet period:** No hostile actions against the aggrieved empire for at least 2 Confluences (20 Cycles) after the violation.
2. **Reconciliation proposal:** Player initiates through the Diplomacy Panel. The aggrieved empire evaluates based on their archetype, emotional state, and the severity of the original violation.
3. **Reconciliation terms:** The aggrieved empire may demand resource payments, a period of advantageous trade terms, or other concessions before accepting.
4. **Outcome:** If accepted, the designation (Covenant Breaker, etc.) is removed from the relationship between these two empires only — not galaxy-wide. The event remains in the permanent Commons record. Reputation gain: +15 for the reconciling empire.

Reconciliation is not available against: empires currently in a Nexus Compact targeting you; empires with *Condemned*-level distrust of you.

---

## 5. Nexus Compact and Coalition Mechanics

### 5.1 Convergence-Triggered Compacts

When a Convergence Alert fires (any empire approaches a major achievement threshold), the Galactic Commons issues the alert and invites Compact formation. The invitation is received by all empires.

**Bot response to Convergence Alert:**

| Archetype | Response tendency |
|---|---|
| Diplomat | Actively organises or joins Compact |
| Warlord | Joins if the target is a military rival; ignores if not threatened |
| Merchant | Joins if the target is economically threatening |
| Schemer | May join, may feed information to the target — determined by current relationship |
| Turtle | Joins if directly threatened; otherwise stays neutral |
| Blitzkrieg | Joins for offensive opportunity |
| Tech Rush | Joins if target would achieve Singularity before them |
| Opportunist | Joins if the risk-reward is favourable; waits to see how others respond first |

### 5.2 Player-Initiated Compacts

Players can propose a Nexus Compact at any time, targeting any empire. The proposal is sent to all empires the player selects as potential members. Each empire evaluates independently based on their relationship with the player, their archetype, and their strategic situation.

A Compact requires a minimum of **3 member empires** (including the proposer/Grand Architect) to be ratified by the Commons.

### 5.3 Grand Architect Candidacy

The Grand Architect is the Compact's founding leader. If multiple empires propose a Compact targeting the same enemy within the same Cycle, the one with the highest reputation among potential members wins leadership. Players can contest bot leadership by counter-proposing with better terms.

When a bot earns Grand Architect (leads the Compact that topples a dominant empire including the player), this is treated as a **major galaxy event**:
- Full galaxy-wide announcement in event log
- Cycle Report headline for that Cycle
- The bot's star map node gains a visual distinction (Grand Architect crown marker)
- Their reputation gains the +30 bonus
- Their archetype behaviour shifts post-achievement (Grand Architects become targets of scrutiny themselves)

### 5.4 Compact Dissolution

**Successful conclusion:** The declared objective is met (target empire's dominant power is broken or they fall to Stricken tier). Grand Architect earns the achievement. War Chest is returned proportionally. All members gain +10 reputation.

**Dissolution by vote:** No reputation penalty. War Chest returned proportionally.

**Target empire destroyed:** Compact dissolves automatically as successful. Achievement awarded.

**Target escapes threat:** If the target empire drops out of the Convergence Alert zone without being toppled, the Compact may continue (if members vote to maintain) or dissolve. Dissolving in this case carries no penalty.

---

## 6. Bot Diplomatic Behaviour

### 6.1 Archetype Diplomatic Profiles

| Archetype | Treaty preference | Betrayal likelihood | Coalition behaviour |
|---|---|---|---|
| **Warlord** | Minimal treaties; prefers freedom to attack | Low — values strength signals | Joins Compacts against military rivals |
| **Diplomat** | Actively accumulates Covenants | Very low — reputation is their primary resource | Organises and leads Compacts |
| **Merchant** | Covenants with trade partners; Stillness with everyone else | Low — needs trade relationships | Joins Compacts threatening economic rivals |
| **Schemer** | Enters Covenants with a hidden betrayal threshold | **High** — betrayal is the archetype's defining behaviour | Joins Compacts; may feed intelligence to the target |
| **Turtle** | Stillness Accords widely; defensive Covenants only | Very low — stability is the goal | Joins Compacts only if directly threatened |
| **Blitzkrieg** | Minimal treaties; speed is their advantage | Medium — will break treaties if a fast win is available | Joins Compacts for offensive opportunity, leaves early |
| **Tech Rush** | Stillness widely; no military obligations that distract | Low | Joins Compacts threatening to win Singularity before them |
| **Opportunist** | Covenants with the currently strong; abandons the weakening | Medium — follows power | Joins Compacts late, after seeing who else has joined |

### 6.2 The Schemer's Betrayal Clock

Schemer-archetype bots enter Star Covenants with a hidden **betrayal threshold** — a power differential or strategic opportunity that, when reached, makes betrayal their optimal move. The threshold is set at Covenant formation and is not visible to other empires.

When the threshold is reached:
1. The Schemer begins gathering intelligence on their Covenant partner (visible as anomalous intel activity if the player is watching)
2. They position forces near the partner's borders (visible on star map)
3. On the Cycle of betrayal, they attack and simultaneously offer the partner's enemies a new Stillness Accord

Players who identify Schemer-archetype bots (through observation or intel) can prepare for this. The Schemer's betrayal is not random — it is legible if you are paying attention.

### 6.3 Emotional State Modifiers

Bot emotional states affect diplomatic decision-making:

| Emotional state | Effect on diplomacy |
|---|---|
| Anger (toward specific empire) | Refuses treaties with that empire; may break existing ones |
| Fear | More likely to accept any treaty for protection |
| Greed | Demands resource concessions in treaty terms |
| Ambition | Seeks leadership of Nexus Compacts; may reject subordinate roles |
| Gratitude (toward specific empire) | Accepts treaties more readily; more likely to fulfil joint operation requests |
| Distrust (toward specific empire) | Demands extended quiet period before any treaty; may reject outright |

### 6.4 Relationship Memory and Treaty History

Bots remember:
- Every treaty proposal you made to them (accepted or declined)
- Every treaty you held with them
- Every violation you committed against anyone (via the Commons record)
- Every violation they suffered from you
- Whether you honoured joint operation requests

This memory persists across the full campaign. A bot you betrayed in Cycle 20 still carries that memory at Cycle 200. Their emotional state toward you may shift over time (anger fades to distrust, distrust to wariness) but the memory itself does not disappear.

---

## 7. UI and UX

### 7.1 The Diplomacy Panel

Accessed via the slide-in panel system. Never replaces the star map.

**Contents:**
- **Active treaties list:** All current Stillness Accords, Star Covenants, Nexus Compact membership
- **Reputation Standing:** Current score, tier label, recent changes, and trajectory
- **Pending proposals:** Incoming treaty offers from bots, each with a timer
- **Galactic Commons record:** Permanent log of violations (yours and major violations by others)
- **Propose treaty:** Interface to initiate treaty offers to any empire

### 7.2 Star Map Diplomatic Indicators

| Element | Visual |
|---|---|
| Star Covenant (Covenant Line) | Animated line connecting home systems of Covenant partners |
| Nexus Compact membership | Crown or compact marker on member home system nodes |
| Declared Compact target | Visual marker (crosshair or similar) on target's home system node |
| Covenant Breaker designation | Subtle marker on that empire's home system node (visible to all) |
| *Wronged* status on bot | Warm colour tint on their node for the duration |

### 7.3 The Cycle Report — Diplomatic Events

Diplomatic events appear in the Cycle Report with full in-world language:

- Treaty proposals received or sent
- Treaties accepted or declined
- Violations committed (by anyone)
- Convergence Alerts and Compact formation invitations
- Compact conclusions (success or dissolution)
- Bot Grand Architect achievements
- Reputation tier changes

### 7.4 Incoming Treaty Proposals

Bot treaty proposals arrive as styled messages in the player's Diplomacy Panel. Messages use bot persona flavour text:

*Example (Diplomat archetype, high reputation):* "The Unified Star Republic of Veth extends a hand across the void. We have watched your empire grow with admiration. A Stillness between our peoples would serve us both. We await your reply."

*Example (Warlord archetype, low emotional warmth):* "Krath does not make alliances. Krath makes arrangements. We will not attack you. For now. Sign the Accord or don't."

Proposals expire after **3 Cycles** if not responded to. Declining costs nothing. Ignoring (expiry) costs −2 reputation with that empire only.

---

## 8. Balance Targets

These are design targets for simulation and playtesting. All values are subject to adjustment through simulation runs.

| Metric | Target | Rationale |
|---|---|---|
| Average active Stillness Accords per empire (mid-game) | 3–5 | Enough that non-aggression is meaningful; not so many it's paperwork |
| Average active Star Covenants per empire (mid-game) | 1–2 | Covenants should feel significant, not cheap |
| Nexus Compacts per campaign | 2–4 | Each should be a major event, not routine |
| Schemer betrayal rate (per game) | 1–3 | Enough to create distrust and drama; not so many it's expected |
| Reputation recovery time after Covenant Breaker | 3–4 Confluences | Long enough to matter; not so long the campaign is unrecoverable |
| Coalition (Compact) success rate vs dominant empire | 55–65% | Compacts should be genuinely threatening, not guaranteed to fail or succeed |
| Grand Architect earned by bot (per campaign) | 0–1 | A bot Grand Architect is a notable event, not routine |

---

## 9. Open Questions

| Question | Notes |
|---|---|
| Does reconciliation fully erase the *Covenant Breaker* galaxy-wide designation, or only the bilateral relationship? | Current design: bilateral only. Confirm with playtesting. |
| Can a player be in a Star Covenant AND a Nexus Compact simultaneously (against a third party)? | Yes — these are not mutually exclusive. Covenant partners may or may not join the same Compact. |
| What is the minimum reputation score at which any treaty is possible? | Suggest: Condemned (below 0) can only form Stillness with similarly desperate empires. Confirm threshold. |
| Should Compact War Chest contributions be mandatory or voluntary? | Currently: negotiated at formation, can be zero. Test whether zero-contribution free-riding becomes a dominant strategy. |
| Is there a maximum number of Stillness Accords or Star Covenants? | Currently: no cap. Monitor whether bot AI accumulates too many and becomes inert. |
| How does the Syndicate interact with treaty obligations — can a Syndicate contract force a treaty violation? | Yes, by design. Full mechanics in `docs/systems/SYNDICATE-SYSTEM.md` (pending). |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-08 | VS7 | Initial design — supersedes `docs/other/Game Systems/DIPLOMACY-SYSTEM.md`. Full redesign with in-world naming, Nexus lore integration, three treaty types fully specified, reputation system, coalition mechanics, bot profiles. |
