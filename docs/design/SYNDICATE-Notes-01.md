# Syndicate System: Concept


## Design Principles

1. **Hidden Allegiance** — One (or more) empires secretly serve the Syndicate
2. **Public Missions** — Contracts are visible, multiple empires can compete
3. **Revelation Drama** — "The Traitor Revealed" moment mid-game
4. **Bot Integration** — Schemer archetype becomes Syndicate-aligned
5. **Asymmetric Victory** — Syndicate can "win" separately from empire victory
6. **Tension, Not Progression** — Suspicion and betrayal, not trust bars

---

## Core Concept: The Shadow War

The Syndicate isn't a faction you join — it's a **hidden role** that changes how you play.

### Game Setup

1. **At game start**, each player (including bots) draws a Loyalty Card
2. **90% are Loyalist** — Play normally, win through standard victory conditions
3. **10% are Syndicate** — Hidden objective: Complete 3 Syndicate Contracts
4. **No one knows** who the Syndicate players are (including you, about bots)

### The Syndicate Player Experience

If you draw Syndicate:
- You still play normally (build, attack, defend)
- You have access to **Syndicate Contracts** (hidden in your UI)
- Completing contracts earns Syndicate VP (separate from regular VP)
- If you reach 3 Syndicate VP before anyone achieves victory, **Syndicate wins**
- You can reveal yourself at any time for dramatic effect (and bonuses)

### The Loyalist Player Experience

If you draw Loyalist:
- You play normally
- You see **suspicious activities** in the intel feed
- You can **accuse** other empires of being Syndicate
- Correct accusation = bonus + target is "outed"
- Wrong accusation = penalty + accuser looks paranoid

---

## Syndicate Contracts (Hidden Missions)

Syndicate players see 3 contracts at a time. Completing one reveals a new one.

### Contract Types

| Contract | Objective | Syndicate VP | Suspicion Generated |
|----------|-----------|--------------|---------------------|
| **Sabotage** | Reduce target's production by 20% for 3 turns | 1 | Low |
| **Assassination** | Kill target's "general" (if generals exist) | 1 | Medium |
| **Market Manipulation** | Crash resource prices by 30% | 1 | High |
| **False Flag** | Make Empire A attack Empire B | 2 | Low (hard to trace) |
| **Intelligence Leak** | Reveal target's hidden research to all | 1 | Medium |
| **Arms Deal** | Sell weapons to lowest-ranked empire | 1 | Low |
| **Coup d'État** | Cause civil unrest in target empire | 2 | High |
| **Kingslayer** | Eliminate the #1 ranked empire | 3 | Very High (instant reveal) |

### Contract Visibility

Contracts are hidden, but **effects are visible**:

```
[GALACTIC INTEL] SUSPICIOUS ACTIVITY

Emperor Varkus's ore production dropped 20% last turn.
No attacks reported. No market explanation.

Could be: Covert sabotage, internal problems, or... Syndicate?

[ACCUSE] [INVESTIGATE] [IGNORE]
```

---

## The Accusation System

Loyalists can accuse empires of being Syndicate.

### How Accusations Work

1. **Spend Intel Points** — Accusation costs resources (prevents spam)
2. **Target Responds** — Accused can defend (spend resources) or stay silent
3. **Vote** — Other empires vote: Guilty or Innocent
4. **Resolution**:
   - If **Guilty + Actually Syndicate**: Accuser gains VP, Syndicate player is "outed"
   - If **Guilty + Actually Loyalist**: Accuser loses VP, accused gains sympathy bonus
   - If **Innocent**: Nothing happens, but suspicion lingers

### Being "Outed"

An outed Syndicate player:
- Loses hidden status (everyone knows)
- Can still complete contracts (but under surveillance)
- Gains "Desperate" bonuses (+20% combat, -20% income)
- Becomes a target for coalition action

But an outed Syndicate can still win — just harder.

---

## The Revelation Moment

Mid-game, a dramatic event triggers:

### "The Shadow Emerges" (Turn 50 or when contract completed)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│             ⚠️ THE SHADOW EMERGES ⚠️                     │
│                                                         │
│  A Syndicate operative has completed their first        │
│  contract. The criminal underworld stirs.               │
│                                                         │
│  Someone in this galaxy serves the Syndicate.           │
│  Perhaps multiple someones.                             │
│                                                         │
│  Watch for:                                             │
│  • Unexplained production drops                         │
│  • Market price anomalies                               │
│  • Convenient "accidents"                               │
│                                                         │
│  The shadows are watching.                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

This announcement changes the game:
- Loyalists become paranoid
- Diplomacy becomes suspicious ("Is this treaty a Syndicate trap?")
- Accusation mechanic becomes relevant
- Bots start commenting on suspicions

---

## Bot Integration

### Schemer Archetype = Syndicate Candidate

When generating the game:
- 10% of all empires are Syndicate
- Schemer archetypes have 50% chance to be Syndicate (vs 10% for others)
- This means "Schemer" is naturally suspicious, but not guaranteed Syndicate

### Bot Behavior When Syndicate

Syndicate bots:
- Prioritize contracts over expansion
- Make suspicious moves (market manipulation, unexplained attacks)
- Send cryptic messages hinting at hidden knowledge
- May "accidentally" reveal themselves through poor play

### Bot Behavior When Loyalist

Loyalist bots:
- React to suspicious events ("Your production dropped. Concerning.")
- Make accusations (especially Diplomat and Turtle archetypes)
- Form coalitions against suspected Syndicate players
- Schemer Loyalists get falsely accused often (dramatic irony)

### Bot Messages

Syndicate hints:
```
[Schemer, Syndicate] "Interesting market fluctuation yesterday.
                      Almost as if someone... planned it."

[Schemer, Syndicate] "I hear the #1 player sleeps uneasily.
                      Perhaps they should."

[Schemer, Syndicate] "My resources come from... alternative sources.
                      You wouldn't understand."
```

Loyalist suspicion:
```
[Diplomat] "Your production dropped 20% without explanation.
            Should I be concerned about your... associations?"

[Warlord] "If I find out you're Syndicate,
           there won't be a trial. Just fire."

[Turtle] "I've fortified against external threats.
          But internal threats... harder to defend."
```

---

## Syndicate Victory Condition

The Syndicate can win in two ways:

### 1. Contract Victory
- Complete 3 contracts before anyone achieves standard victory
- Syndicate player(s) win, all Loyalists lose

### 2. Chaos Victory
- If no victory is achieved by Turn 200 AND Syndicate has 2+ contracts
- "The galaxy descends into chaos. The Syndicate wins."

### Victory Screen (Syndicate)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🔺 SYNDICATE VICTORY 🔺                     │
│                                                         │
│  The shadows have won.                                  │
│                                                         │
│  While empires fought over planets and resources,       │
│  the Syndicate pulled strings from the darkness.        │
│                                                         │
│  SYNDICATE OPERATIVE: EMPEROR VARKUS (Schemer)          │
│                                                         │
│  Contracts Completed:                                   │
│  • Sabotaged The Collective's ore production (Turn 34)  │
│  • Manipulated petroleum markets (Turn 52)              │
│  • Orchestrated coup in Lady Chen's empire (Turn 71)    │
│                                                         │
│  "You never suspected. That was your mistake."          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Counter-Play: The Coordinator

Loyalists have a counter-option: **Report to the Coordinator**

### How It Works

1. **Any player can report** their suspicions to "The Coordinator" (NPC faction)
2. **Reports cost resources** — Can't spam
3. **If target is Syndicate** — Target's next contract is revealed to reporter
4. **If target is Loyalist** — Reporter's report is leaked, causing diplomatic damage

### The Coordinator's Role

The Coordinator is an NPC that:
- Accepts reports
- Provides intel (but only if correct)
- Never reveals Syndicate players directly (just hints)
- Creates a "whistle-blower" mechanic

```
[THE COORDINATOR] "Your report on Emperor Varkus has been... illuminating.
                   Watch their market activity closely next turn.
                   That is all I can say."
```

---

## Black Market Integration

The Black Market becomes Syndicate-exclusive content:

### Syndicate Players Only

- Access to WMDs (nuclear warheads, bioweapons)
- Access to "Syndicate Tech" (unique abilities)
- Prices are high, but effects are powerful

### Black Market Items

| Item | Effect | Cost | Suspicion |
|------|--------|------|-----------|
| **Nuclear Warhead** | Destroy 50% of target planet's production | 50,000 cr | Very High |
| **Bioweapon** | Reduce target population by 25% | 30,000 cr | High |
| **Cloaking Device** | Hide fleet movements for 5 turns | 20,000 cr | Low |
| **Bribe Package** | Force bot to break treaty | 15,000 cr | Medium |
| **Information Broker** | See target's hidden research/cards | 10,000 cr | Low |

Using Black Market items generates suspicion — other players see effects and can trace back.

---

## Vision

| Expansion Syndicate |
|--------------------|---------------------|
| Hidden role (Loyalist vs Syndicate) |
| Affects entire galaxy dynamics |
| Suspicious activities visible |
| Asymmetric victory condition |
| Accusation trials, revelation moments |
| Bots are paranoid, accusatory, cryptic |

---

## Implementation Notes

### Database Schema

```sql
-- Loyalty assignment
ALTER TABLE empires ADD COLUMN loyalty_role VARCHAR(20); -- 'loyalist', 'syndicate'
ALTER TABLE empires ADD COLUMN syndicate_vp INTEGER DEFAULT 0;
ALTER TABLE empires ADD COLUMN is_outed BOOLEAN DEFAULT false;

-- Contracts
CREATE TABLE syndicate_contracts (
  id UUID PRIMARY KEY,
  empire_id UUID REFERENCES empires(id),
  contract_type VARCHAR(30),
  target_empire_id UUID REFERENCES empires(id),
  status VARCHAR(20), -- 'active', 'completed', 'failed'
  suspicion_generated INTEGER,
  completed_turn INTEGER
);

-- Accusations
CREATE TABLE accusations (
  id UUID PRIMARY KEY,
  accuser_id UUID REFERENCES empires(id),
  accused_id UUID REFERENCES empires(id),
  turn_number INTEGER,
  votes_guilty INTEGER,
  votes_innocent INTEGER,
  result VARCHAR(20) -- 'correct', 'incorrect', 'dismissed'
);

-- Suspicious events (for intel feed)
CREATE TABLE suspicious_events (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  turn_number INTEGER,
  event_type VARCHAR(30),
  affected_empire_id UUID REFERENCES empires(id),
  suspected_cause VARCHAR(50),
  is_syndicate_action BOOLEAN -- for validation, not shown to players
);
```

### Service Architecture

```typescript
// syndicate-service.ts (rewritten)
export async function assignLoyaltyRoles(gameId: string): Promise<void>;
export async function getSyndicateContracts(empireId: string): Promise<Contract[]>;
export async function completeContract(contractId: string): Promise<ContractResult>;
export async function generateSuspiciousEvent(action: GameAction): Promise<SuspiciousEvent>;
export async function processAccusation(accuserId: string, accusedId: string): Promise<AccusationResult>;
export async function checkSyndicateVictory(gameId: string): Promise<boolean>;
```

### UI Components

- **LoyaltyCard** — Shown at game start (dramatic reveal)
- **SyndicatePanel** — Hidden contracts (Syndicate players only)
- **IntelFeed** — Suspicious events stream
- **AccusationTrial** — Voting interface
- **RevelationMoment** — "The Shadow Emerges" cutscene

---

## Expansion Packaging

If released as expansion content:

**"Nexus Dominion: Shadow War"**
- Hidden role system (Loyalist/Syndicate)
- 8 Syndicate Contract types
- Accusation and trial mechanics
- Black Market integration
- "The Coordinator" NPC faction
- Schemer archetype enhancement
- 40+ new bot message templates

Pricing: $6.99 DLC or included in "Complete Edition"

Can bundle with Tech Wars expansion for "Nexus Dominion: Complete Edition" ($14.99)

---

## Open Design Questions

1. **How many Syndicate players in a 100-empire game?**
   - 10% = 10 Syndicate empires (too many? Creates Syndicate coalition)
   - 5% = 5 Syndicate empires (feels rarer, more special)
   - 1-3 fixed = Predictable, but balanced

2. **Can Syndicate players identify each other?**
   - Yes = Syndicate coalition possible, but feels less "hidden"
   - No = Each Syndicate player is alone, more tense

3. **Should the player always be Loyalist in their first game?**
   - Yes = Learn base game first, Syndicate is "advanced mode"
   - No = Surprise factor, but might confuse new players

4. **What happens if all Syndicate players are eliminated?**
   - Game continues normally (Syndicate threat removed)
   - Or: "The Syndicate never dies" — new operative activated

5. **Should accusation be anonymous?**
   - Yes = More accusations, less social cost
   - No = Accusers take public stand, more meaningful

---

## House on Haunted Hill Inspiration

The "one player is secretly evil" mechanic from Betrayal at House on the Hill:

- **The Haunt** — Mid-game revelation that changes everything
- **Asymmetric Information** — Traitor knows things others don't
- **Team vs Individual** — Most players team up against the traitor
- **Dramatic Tension** — "Is it you? Is it ME?"

Applied to Nexus Dominion:
- **The Shadow Emerges** — Mid-game revelation (Turn 50)
- **Syndicate Contracts** — Hidden objectives for Syndicate players
- **Coalition vs Syndicate** — Loyalists must cooperate
- **Accusation Drama** — "I think Varkus is Syndicate!"

---

## Narrative Integration

### Bot Personality Expression

Syndicate bots should feel *different* in subtle ways:

```
[Schemer, Syndicate, Turn 20]
"I've been watching you. You're... ambitious.
 That could be useful to certain parties."

[Schemer, Syndicate, Turn 40]
"The market crash wasn't random.
 Some of us profit from chaos."

[Schemer, Syndicate, Turn 60, OUTED]
"Yes, I serve the Syndicate. And now you know.
 But knowing doesn't save you."
```

### Player Messages to Bots

When suspecting a bot:
```
[PLAYER → VARKUS] "Your production dropped last turn. Explain."

[VARKUS → PLAYER] "Equipment malfunction. It happens.
                   Unless you're accusing me of something?"

[OPTIONS]
[1] "No, just curious." (End conversation)
[2] "I think you're Syndicate." (Initiate accusation)
[3] "I know what you are." (Bluff - might get reaction)
```

---

*This expansion concept transforms the Syndicate from a parallel progression track into a hidden role game-within-a-game that creates paranoia, drama, and asymmetric victory conditions.*
