# Bot Intelligence System

## Overview
This document defines the complete design of the Nexus Dominion bot intelligence system. The system governs how 99 AI-controlled empires think, behave, communicate, remember, form relationships, and pursue their own ambitions across the persistent campaign.

## Key Design Principles

### Character Over Numbers
- Each of the 99 opponents has a name, personality, emotional state, and relationship history
- Bots are rivals the player comes to know, not obstacles or pawns
- Observable but not transparent - players deduce personality through behavior and interactions
- Mechanically meaningful emotions that change decision probabilities

### Organic Rivalries
- Bots remember significant events and carry that history into future decisions
- Betrayal lingers, gratitude fades more quickly
- The galaxy feels like a multiplayer game because it is simulated as one

## Intelligence Tiers

### Tier I - Apex (LLM-Powered)
- Uses large language model to generate decisions and communications
- Receives structured context including persona, game state, relationship history, and recent events
- Produces contextually appropriate, non-repetitive natural language messages
- Adaptive strategy that responds to unexpected game states
- Graceful degradation: Falls back to Tactical behavior if LLM unavailable

### Tier II - Tactical (Strategic Decision Trees)
- Archetype-driven decision trees with full emotional state integration
- Workhorse tier - sophisticated enough to feel like real opponents
- Deterministic enough to be predictable at scale
- Template-based messaging with 30-45 templates per persona

### Tier III - Reactive (Simple Behaviour)
- Follows basic if/then rules
- Responds to immediate threats and obvious opportunities
- Communicates minimally - short, flavourless messages
- The galactic background - present, occasionally disruptive, rarely decisive

### Tier IV - Entropic (Weighted Random)
- Makes genuinely random decisions, weighted loosely toward nominal archetype
- Makes suboptimal choices
- Rarely communicates - when they do, message is brief and often non-sequitur
- Introduces genuine uncertainty to prevent exploitable patterns

## Momentum Ratings

### Classification
- **Fodder (0.5–0.75)**: Acts every other Cycle (or 3 of 4)
- **Standard (1.0)**: Acts every Cycle
- **Elite (1.25–1.5)**: Acts every Cycle + probabilistic bonus action
- **Nemesis (2.0)**: Acts every Cycle with guaranteed double action

### Interaction with Intelligence
- Momentum Rating determines frequency; Intelligence Tier determines quality
- Independent axes - can be combined in various configurations
- Allows for deliberate outlier bots (e.g., Fodder-Momentum / Apex-Intelligence)

## Archetypes

### The Eight Archetypes
1. **Warlord**: Military dominance, territorial expansion and tribute
2. **Diplomat**: Alliance network, peace, stability, mutual benefit
3. **Merchant**: Economic control, wealth accumulation and trade leverage
4. **Schemer**: Deception and manipulation, hidden influence
5. **Turtle**: Defensive consolidation, survival and resource security
6. **Blitzkrieg**: Early aggression, cripple neighbours before they can build
7. **Tech Rush**: Research advantage, technological capstone
8. **Opportunist**: Vulture strikes, exploit weakness wherever it appears

### Decision Priority Matrix
Each archetype has specific weights for action types:
- Military Attack
- Military Defense  
- Diplomacy/Alliance
- Economic Development
- Research
- Covert Operations

### Passive Abilities
Each archetype has a passive ability reinforcing their strategic approach:
- Warlord: War Economy (reduced military unit cost when at war)
- Diplomat: Trade Network (income bonus per active treaty)
- Merchant: Market Insight (sees next Cycle's Galactic Exchange prices)
- Schemer: Shadow Network (reduced covert operation cost)
- Turtle: Fortification (defensive structures have doubled effectiveness)
- Blitzkrieg: First Strike (combat bonus when attacking an empire that has not yet attacked)
- Tech Rush: Research Surplus (surplus research points carry over)
- Opportunist: Scavenger (bonus when attacking an empire that has lost >30% military)

## Emotional State System

### Overview
Bots have emotional states that mechanically modify their decision probability weights. Emotional states are not cosmetic - they change what bots actually do.

### Emotional States
- **Confident**
- **Arrogant** 
- **Desperate**
- **Vengeful**
- **Fearful**
- **Triumphant**
- **Neutral**

### Modifiers
Each emotional state has a base modifier and resonance value (0.0-1.0) that determines mechanical effect:
```
Effective modifier = base modifier × resonance
```

### Decay
Emotional state resonance decays each Cycle - handled in the Turn Management System's Emotional Decay phase.

## Relationship Memory

### Memory System
- Bot remembers significant events and carries that history into future decisions
- Betrayal lingers, gratitude fades more quickly
- History influences future decisions and communication style

### Chronicle
- A bot's full relationship and event history
- Used to inform decision-making and communication

## Communication and Persona

### Tell System
- Archetype deduction is a player skill
- Players cannot see bot archetype labels
- Players infer personality from observables (behavioral signals, messages, alliance choices)

### Telegraph Rates
Different archetypes vary in how often they send signals:
- Warlord: 70% telegraph rate, 2-3 cycles lead time
- Diplomat: 80% telegraph rate, 3-5 cycles lead time
- Turtle: 90% telegraph rate, 5+ cycles lead time
- Merchant: 60% telegraph rate, 2 cycles lead time
- Tech Rush: 50% telegraph rate, 2 cycles lead time
- Opportunist: 45% telegraph rate, 1 cycle lead time
- Blitzkrieg: 40% telegraph rate, 1 cycle lead time
- Schemer: 30% telegraph rate, 1 cycle or none

### Schemer Special Handling
- Designed to be difficult to identify
- Copies linguistic style of impersonated archetype
- Includes infrequent cryptic signals
- Never produces obvious villain behavior

## Integration with Turn Management

### Cycle Participation
- Bots participate in cycles with frequency based on momentum rating
- Decision-making occurs after Tier 1 phases to ensure they respond to committed state
- Bot decisions are processed in Tier 2 pipeline

### Nexus Reckoning
- All bot behavior is updated at Nexus Reckoning (end of Confluence)
- Cosmic Order classification determines action timing within cycles
- Bots react to changes in power dynamics through relationship memory and emotional states

## UI/Player Experience

### Information Hiding
- Players cannot see bot archetype labels
- Players infer personality from behavior and interactions
- No transparency into bot internal decision logic

### Observable Signals
- Messages in diplomatic inbox (distint voices shaped by persona)
- Bot actions visible on star map (fleet movements, border changes)
- Reputation shifts in Galactic Commons record
- Cosmic Order HUD showing ascending/collapsing empires

## Bot Decision Framework

### Decision Process
1. Evaluate current game state
2. Apply archetype-driven priority weights
3. Integrate emotional state modifiers
4. Consider relationship memory
5. Generate action plan
6. Translate to communication (if applicable)

### LLM Integration Design
- Context includes persona, current game state, relationship history, recent events
- LLM calls made once per bot per cycle for decisions that warrant natural language expression
- Natural language messaging is contextual to persona and current situation
- Fallback to Tactical behavior for cycle if LLM unavailable