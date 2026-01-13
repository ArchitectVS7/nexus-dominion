### REQ-BOT-003: Emotional States (Split)

> **Note:** This spec has been split into atomic sub-specs. See REQ-BOT-003-A through REQ-BOT-003-F for individual emotional state definitions.

**Overview:** Bots have 6 emotional states that mechanically affect decisions through percentage modifiers to decision quality, alliance willingness, aggression, and negotiation.

---

### REQ-BOT-003-A: Confident Emotional State

**Description:** Confident state is the baseline positive state when bot is doing well and balanced. Provides +5% decision, -20% alliance, +10% aggression, +10% negotiation.

**Rationale:** Baseline state for successful bots. Slight bonuses without extreme behavior changes.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | +5% |
| Alliance Willingness | -20% |
| Aggression | +10% |
| Negotiation | +10% |
| Trigger | Steady progress, winning battles |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/confident-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-B: Arrogant Emotional State

**Description:** Arrogant state from excessive success creates vulnerability through hubris. Provides -15% decision, -40% alliance, +30% aggression, -30% negotiation.

**Rationale:** Punishes excessive success with poor decision-making and diplomatic isolation. Creates comeback opportunities for trailing players.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -15% |
| Alliance Willingness | -40% |
| Aggression | +30% |
| Negotiation | -30% |
| Trigger | Multiple victories, high networth lead, dominant position |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/arrogant-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-C: Desperate Emotional State

**Description:** Desperate crisis mode when losing badly. Bot makes wild moves. Provides -10% decision, +40% alliance, -20% aggression, -20% negotiation.

**Rationale:** Losing bots become alliance-seeking and unpredictable. Creates dramatic comeback attempts.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -10% |
| Alliance Willingness | +40% |
| Aggression | -20% |
| Negotiation | -20% |
| Trigger | Low networth, losing sectors, under sustained attack |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/desperate-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-D: Vengeful Emotional State

**Description:** Vengeful state driven by revenge focus. Personal grudges override strategy. Provides -5% decision, -30% alliance, +40% aggression (toward target), -40% negotiation.

**Rationale:** Emotional override creates irrational but narratively compelling behavior. Target-specific aggression adds drama.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -5% |
| Alliance Willingness | -30% |
| Aggression | +40% (toward revenge target) |
| Negotiation | -40% |
| Trigger | Sector capture, treaty betrayal, major attack |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/vengeful-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-E: Fearful Emotional State

**Description:** Fearful defensive state worried about survival. Seeks protection. Provides -10% decision, +50% alliance, -30% aggression, +10% negotiation.

**Rationale:** Survival instinct creates defensive coalitions. Highest alliance willingness encourages diplomatic gameplay.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | -10% |
| Alliance Willingness | +50% |
| Aggression | -30% |
| Negotiation | +10% |
| Trigger | Enemy buildup on borders, recent defeat, networth dropping |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/fearful-state.ts`

**Tests:** TBD

**Status:** Draft

---

### REQ-BOT-003-F: Triumphant Emotional State

**Description:** Triumphant victory high state with post-win momentum and boldness. Provides +10% decision, -10% alliance, +20% aggression, -20% negotiation.

**Rationale:** Victory momentum creates aggressive expansion phase. Temporary power spike after major wins.

**Key Values:**
| Modifier | Value |
|----------|-------|
| Decision Quality | +10% |
| Alliance Willingness | -10% |
| Aggression | +20% |
| Negotiation | -20% |
| Trigger | Won major battle, captured valuable sector, eliminated enemy |

**Dependencies:** (to be filled by /spec-analyze)

**Blockers:** (to be filled by /spec-analyze)

**Source:** Section 7.8

**Code:**
- `src/lib/bots/emotions/triumphant-state.ts`

**Tests:** TBD

**Status:** Draft
