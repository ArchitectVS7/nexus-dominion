# Bot Intelligence System - Implementation Summary

## Core Concepts

### 1. Bot Identity
- Each of 99 bots has a distinct personality, emotional state, and relationship history
- No archetype labels visible to players - all inferred through behavior
- Bots are rivals, not obstacles or pawns

### 2. Intelligence Tiers (Independent of Momentum)
- **Tier I (Apex)**: LLM-powered with natural language responses
- **Tier II (Tactical)**: Decision trees with emotional state integration  
- **Tier III (Reactive)**: Simple rule-based behavior
- **Tier IV (Entropic)**: Weighted random decisions with archetype bias

### 3. Momentum Ratings (Action Frequency)
- Fodder (0.5-0.75): Slower than player
- Standard (1.0): Same as player
- Elite (1.25-1.5): Faster than player
- Nemesis (2.0): Twice as fast as player

## Key Systems

### Archetypes (8 Total)
1. **Warlord** - Military dominance, expansion
2. **Diplomat** - Alliance network, peacebuilding
3. **Merchant** - Economic control, trade focus
4. **Schemer** - Deception, hidden influence
5. **Turtle** - Defensive consolidation
6. **Blitzkrieg** - Early aggression
7. **Tech Rush** - Research advantage
8. **Opportunist** - Vulture strikes

### Emotional States (7 Total)
- Confident, Arrogant, Desperate, Vengeful, Fearful, Triumphant, Neutral
- Modifiers apply through multiplication with resonance (0.0-1.0)
- States decay each cycle

### Relationship Memory
- Significant events permanently stored
- History influences future decisions and communications
- Betrayal lingers, gratitude fades

### Tell System
- Players deduce archetypes through observables
- Different archetypes signal behavior at different rates:
  - Warlord: 70% telegraph rate (2-3 cycles lead)
  - Diplomat: 80% telegraph rate (3-5 cycles lead)
  - Turtle: 90% telegraph rate (5+ cycles lead)
  - Schemer: 30% telegraph rate (1 cycle or none)

## Integration Points

### Turn Management
- Bot decisions processed after Tier 1 (core state) commits
- Nexus Reckoning updates all bot behaviors at Confluence ends
- Cosmic Order affects action timing (Stricken act first, Sovereign act last)

### Tech Card System
- Archetype preferences guide card drafting choices
- Bots vocally react to Draft Events in communications
- Combat integration ensures cards are used strategically

### LLM Integration
- Apex bots use LLM for decision generation and messaging
- Context includes persona, game state, relationship history, recent events
- Graceful degradation to Tactical behavior if LLM unavailable