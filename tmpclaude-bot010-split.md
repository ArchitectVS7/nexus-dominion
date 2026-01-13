### REQ-BOT-010: Endgame Behavior (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-BOT-010-A through REQ-BOT-010-D for individual turn threshold behaviors.

**Overview:** Bot behavior escalates as the game approaches victory conditions through 4 distinct thresholds. Creates narrative climax where endgame feels different from mid-game.

---

### REQ-BOT-010-A: Late Campaign Threshold (Turn 150+)

**Description:** At Turn 150+, all archetypes increase aggression +10%, alliance formation increases (defensive coalitions), and Tier 1 LLM bots generate more dramatic messages. Signals transition to late-game intensity.

**Rationale:** Creates sense of urgency as game progresses. Increased aggression and coalition formation drive action toward conclusion.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | Turn 150+ |
| Aggression Modifier | +10% for all archetypes |
| Alliance Formation | Increased rate |
| Messaging Style | More dramatic (Tier 1 bots) |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkLateCompaignThreshold()`, `applyLateCampaignModifiers()`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-010-B: Dominant Leader Threshold (50% Dominance)

**Description:** When any empire reaches 50% dominance (territory, VP, or other metric), automatic defensive coalition forms against leader. Coalition coordination increases and "Stop the leader" messaging sent to all empires.

**Rationale:** Creates dynamic balancing mechanic. Leading player faces organized opposition that feels narratively justified.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | Leader at 50% dominance |
| Mechanic | Auto defensive coalition formation |
| Coordination | Increased for coalition members |
| Messaging | "Stop the leader" broadcasts |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkDominantLeaderThreshold()`, `formAntiLeaderCoalition()`

**Tests:** TBD

**Status:** Draft

**Cross-Reference:** REQ-VIC-008 (Anti-Snowball Mechanics), REQ-DIP-005 (Automatic Coalition Formation)

---

### REQ-BOT-010-C: Final Three Threshold (3 Empires Remaining)

**Description:** When only 3 empires remain, maximum communication drama activates. Tier 1 bots generate epic monologues and final showdown messaging. Creates climactic narrative tension for final confrontation.

**Rationale:** Endgame deserves epic storytelling. Final three scenario feels like climactic finale with dramatic bot roleplay.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | Last 3 empires standing |
| Communication Level | Maximum drama |
| Messaging | Epic monologues, showdown declarations |
| Tier 1 Behavior | Generate climactic narratives |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkFinalThreeThreshold()`, `generateEpicMonologue()`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-010-D: Victory Imminent Threshold (55%+ Territory)

**Description:** When one empire controls 55%+ territory (approaching 70% victory threshold), global announcements from LLM bots, last alliance proposals, and dramatic "it's over" or "last stand" messages. Signals inevitable victory or desperate final resistance.

**Rationale:** Victory should feel earned and dramatic. Final moments before victory trigger memorable narrative climax.

**Key Values:**
| Parameter | Value |
|-----------|-------|
| Trigger | One empire at 55%+ territory |
| Announcements | Global broadcasts from LLM bots |
| Last Alliances | Final coalition attempts |
| Messaging | "It's over" or "Last stand" declarations |

**Example Messages:**
- "Attention all commanders. {leader} threatens galactic domination. Temporary ceasefire proposed." (Warlord)
- "To my allies: It has been an honor. For the coalition!" (Diplomat)
- "You all trusted me. Now the galaxy is mine." (Schemer victory)

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** docs/design/BOT-SYSTEM.md

**Code:**
- `src/lib/bots/endgame.ts` - `checkVictoryImminentThreshold()`, `broadcastGlobalAnnouncement()`

**Tests:** TBD

**Status:** Draft

**Cross-Reference:** REQ-TURN-019-01 (Military Victory Check - 70% threshold)
