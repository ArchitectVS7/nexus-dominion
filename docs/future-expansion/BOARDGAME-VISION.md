# Nexus Dominion: The Digital Boardgame Vision

**Version:** 1.0
**Created:** January 2026
**Purpose:** Executive summary focusing on boardgame design philosophy

---

## The Core Concept

**Nexus Dominion is a digital boardgame.** Not a boardgame adaptation, not a game that borrows boardgame mechanics—it's a digital experience that **thinks like a physical boardgame** from the ground up.

Just as Chess is defined by its board, Monopoly by its property spaces, and Risk by its world map, **Nexus Dominion is defined by its star map.** The galaxy isn't a menu option or a strategic view—it's the table, the playing surface, the constant reference point around which everything else orbits.

### What This Means in Practice

When you play a physical boardgame:
- **The board never leaves the table** - it's always visible, always your frame of reference
- **You pick up cards to examine them** - then return them to the board
- **Spatial relationships matter** - you see which players control which territories
- **Turns have rhythm** - discrete actions with clear consequences
- **Progress is tangible** - your empire's growth is visible at a glance

Nexus Dominion preserves these qualities in digital form. The star map is your tabletop. Empire details, military panels, and market screens are cards you examine and put back down. Territory ownership is immediately visible. Every turn matters. Your expanding empire feels real.

---

## The Experience: A Session of Play

### Opening: The Board State (Turns 1-20)

You start staring at a force-directed galaxy map—100 glowing nodes representing empires, connected by gravitational proximity. Your empire pulses with a subtle glow. Around you, 9-10 neighbors in your sector.

This is your **neighborhood in space.** These empires are your immediate concerns. The other 90 empires exist, but they're distant—other players at other tables in the game store, relevant only when they intersect your world.

**The boardgame parallel:** You don't start Settlers of Catan worrying about every resource tile on the board. You focus on your starting settlements and the hexes adjacent to you. Nexus Dominion mirrors this: your sector is your "starting position," and expansion beyond it requires intentional investment.

### Mid-Game: Expanding the Board (Turns 21-60)

You've consolidated your sector. Now you discover **borders**—connections to adjacent sectors that function like roads between regions. Building a border outpost costs resources but opens new territories.

Later, you construct **wormholes**—express highways to distant sectors. Each expansion decision mirrors a boardgame choice: "Do I fortify my position, or race to grab that valuable territory before my rival does?"

**The boardgame parallel:** In Twilight Imperium, you claim adjacent systems, then use technology to reach distant ones. In Nexus Dominion, sectors are systems, borders are adjacency, and wormholes are movement tech.

### Endgame: The Board Reacts (Turns 61+)

You approach victory. The galaxy **forms a coalition** against you. Not because of scripted AI—because the game models the natural response to a dominant power.

Every empire receives combat bonuses against you. Diplomacy becomes harder. The board itself fights back.

**The boardgame parallel:** In Cosmic Encounter, when one player nears victory, everyone else gangs up on them. In Risk, alliances form against whoever controls Australia. Nexus Dominion codifies this social dynamic into systematic mechanics—the board remembers who's winning and adjusts.

---

## The Interface: Digital Boardgame Design

### Principle 1: The Map is the Game

```
Traditional Digital 4X:              Nexus Dominion:
┌─────────────────────┐             ┌─────────────────────┐
│  Main Menu          │             │                     │
│  ├─ Dashboard       │             │                     │
│  ├─ Galaxy Map ◄────┤ buried      │    STAR MAP         │
│  ├─ Military        │  in menu    │  (always visible)   │
│  └─ Research        │             │                     │
└─────────────────────┘             └─────────────────────┘
```

You boot Nexus Dominion and see the galaxy. Not a loading screen, not a menu—**the board.**

All other screens are **overlay panels** that slide over a dimmed star map. Military builds? Panel slides in from the right. Market transactions? Bottom overlay. Empire diplomacy? Center modal.

Press ESC, click the backdrop, complete your action—**the map returns.** You never lose spatial context. The board never goes away.

### Principle 2: Panels Are Cards

In physical boardgames, you pick up a card, read it, make a decision, put it back. Information is examined temporarily, then returned to context.

Nexus Dominion mirrors this:
- Click an empire → slideout panel shows details
- Click a sector → build options appear
- Click military → unit roster slides in

These aren't separate screens requiring navigation. They're **information overlays** you examine and dismiss. The star map dims but remains visible behind them—you never forget where you are.

### Principle 3: Turn Order Matters

The **Turn Order Panel** (right sidebar) is your action checklist:

```
┌─────────────────┐
│  TURN 15        │
│  ═══════════    │
│  YOUR MOVES     │
│  ○ Forces       │ ← Clickable actions
│  ○ Sector Ops   │   with visual state
│  ○ Combat       │
│  ○ Diplomacy    │
│  ○ Covert Ops   │
│  ✓ Intelligence │ ← Completed actions
│  ─────────────  │
│  [CYCLE TURN]   │ ← The decisive action
└─────────────────┘
```

Like a player aid in a complex boardgame, it tells you:
1. What phase you're in
2. What actions you've taken
3. What's left to do
4. When you're ready to pass

After you cycle, a **Turn Summary Modal** shows what happened—like reading event cards at the end of a turn in Pandemic or Arkham Horror. Condensed, dramatic payoffs: "You earned 10,500 credits. The Merchant Coalition declared war. Research completed."

### Principle 4: Physical Affordances

Details that make it **feel** like a boardgame:

- **Empire nodes pulse and glow** - living game pieces, not static icons
- **Treaty lines shimmer between allies** - visible alliances like colored strings on a conspiracy board
- **Sector regions use subtle color tints** - territory ownership at a glance
- **Military strength shown as orbital rings** - bigger empire = bigger presence
- **Animated resource counters** - numbers that tick up/down when income arrives
- **LCARS aesthetic** - Star Trek bridge panels, like commanding from the Enterprise

The interface never lets you forget: **you're the admiral at the command table, looking down at a tactical display.**

---

## The Opponents: 100 Personalities, Not 100 Clones

Boardgames with AI bots often feel hollow because every opponent plays identically. Nexus Dominion solves this with **personality-driven archetypes and emotional states.**

### Eight Archetypes

Each bot belongs to one of eight strategic personalities:

| Archetype | Boardgame Parallel | Behavior |
|-----------|-------------------|----------|
| **Warlord** | Risk aggressor | Always expanding, high military |
| **Merchant** | Catan trader | Economic focus, trade manipulation |
| **Diplomat** | Cosmic Encounter negotiator | Forms alliances, avoids direct conflict |
| **Schemer** | Dune conspirator | Covert ops and betrayal |
| **Turtle** | Defensive player | Fortifies borders, researches defense |
| **Blitzkrieg** | Early game rusher | Fast expansion, risky moves |
| **Tech Rush** | Science victory builder | Research-focused, weak early game |
| **Opportunist** | Kingmaker | Attacks weakened targets |

### Emotional States & Memory

Bots remember your actions and react emotionally:
- Break a treaty → they become **Vengeful** and target you
- Help them survive → they become **Grateful** and offer favorable deals
- Ignore them → they become **Neutral** or **Ambitious** and expand freely

This creates **emergent narrative.** The Merchant Prince who helped you in Turn 30 becomes the economic powerhouse threatening victory by Turn 100. The Warlord you humiliated in Turn 50 forms a coalition to destroy you in Turn 120.

**The boardgame parallel:** In Diplomacy, players remember betrayals and form grudges. In Cosmic Encounter, past alliances affect future negotiations. Nexus Dominion codifies this into systematic relationship tracking.

---

## Victory: Six Paths, One Goal

Like Twilight Imperium's multiple victory point paths or Civilization's varied win conditions, Nexus Dominion offers **six distinct strategies:**

| Victory Path | The Question | Required |
|-------------|-------------|----------|
| **Conquest** | "Can you eliminate all rivals?" | Last empire standing |
| **Economic** | "Can you dominate the economy?" | 60% of galactic wealth |
| **Diplomatic** | "Can you unite the galaxy?" | Alliance with 75% of empires |
| **Research** | "Can you achieve technological supremacy?" | Complete all tech trees |
| **Military** | "Can you build the ultimate fleet?" | 40% of all military power |
| **Survival** | "Can you master everything?" | Lead in all categories |

Each path rewards a different playstyle. Bots pursue different paths based on personality, creating varied competition each game.

**Critical design:** When any player reaches 7 Victory Points (close to winning), the galaxy automatically forms a coalition. The endgame becomes **you vs. the world**—the climactic "everyone teams up to stop the leader" moment that makes physical boardgames dramatic.

---

## Why This Matters: Digital Boardgames Done Right

Most digital adaptations of boardgames fail because they:
1. **Hide the board** behind menus and navigation
2. **Automate the humanity** out of opponents
3. **Remove spatial awareness** by making everything clickable from everywhere
4. **Lose the rhythm** of discrete turns with meaningful decisions

Nexus Dominion succeeds by **preserving the mental model:**
- The star map is always visible (the board never leaves the table)
- Bots have personality and memory (opponents feel human)
- Geography creates strategy (you can't attack everywhere equally)
- Turns have weight (each cycle is a committed action)

This isn't a 4X game that borrowed some boardgame mechanics. It's a boardgame that happens to run on a computer.

---

## The Promise: Epic Scope, Manageable Time

Traditional epic boardgames face a cruel tradeoff:
- **Deep strategy** → 4-6 hour sessions (Twilight Imperium, Eclipse)
- **Quick play** → Shallow tactics (card games, skirmishes)

Nexus Dominion offers a third option:

**100-empire galaxy, emergent drama, multiple victory paths, persistent bot personalities—all in a 1-2 hour session.**

The computer handles the bookkeeping (resource math, combat resolution, turn order). You handle the strategy (expansion paths, diplomatic maneuvering, military positioning).

You get the **strategic depth** of a physical 4X boardgame without the **logistical overhead.**

### The Session Structure

| Phase | Turns | Focus | Boardgame Parallel |
|-------|-------|-------|-------------------|
| **Opening** | 1-20 | Learn your sector | "Understanding your starting position" |
| **Early Game** | 21-60 | Consolidate and expand | "Building your engine" |
| **Mid Game** | 61-100 | Compete for dominance | "Racing toward victory" |
| **Endgame** | 101-200 | Coalition vs. leader | "Final showdown" |

Each phase has clear goals. Complexity scales naturally. The game teaches you as it unfolds—just like learning a new boardgame by playing it.

---

## Conclusion: A New Genre

Nexus Dominion isn't trying to replace physical boardgames. It's exploring what **boardgame design principles** can become when freed from physical constraints.

No setup time. No rules lawyer. No scorekeeping. No player scheduling.

But also: **No loss of tactile engagement. No forgetting where you are. No menu-driven abstraction.**

The star map glows. Your empire pulses. Rivals threaten. Alliances form. The galaxy reacts.

**You're not navigating a UI. You're commanding an empire from the bridge of your flagship, staring at the tactical display.**

That's the promise. That's the vision. That's why this is a **digital boardgame.**

---

*For detailed mechanics and system specifications, see [PRD-EXECUTIVE.md](PRD-EXECUTIVE.md) and [VISION.md](VISION.md).*
