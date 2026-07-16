# Nexus Dominion

A single-player space empire strategy game that delivers the emergent drama of a living multiplayer world — without requiring other players. You are one of 100 empires in a persistent galaxy of 250 star systems; the other 99 are bots with archetypes, emotions, and long memories. Expand, trade, negotiate, spy, and conquer through a turn-based cycle loop, chasing 9 achievement paths while the galaxy reacts to your rise.

Built as a **Tauri + React/TypeScript desktop app** with an LCARS-inspired interface. The game engine is pure, deterministic TypeScript (seeded RNG — identical campaigns replay identically), fully separated from the UI.

## Quick start

```bash
npm install
npm run dev          # browser dev shell (Vite)
npm run tauri dev    # native desktop window
```

```bash
npm test             # vitest — full engine + UI component suite
npx tsc --noEmit     # typecheck
npm run build        # production build
```

## Project status (2026-07-16)

Phase 1 (playable internal alpha) is functionally complete and **awaiting human playtest sign-off**:

- **Engine:** all core systems implemented and tested — cycle pipeline, economy, colonisation, 3-phase combat (fleet → orbital bombardment → ground assault), bots (8 archetypes, momentum, emotions), diplomacy (pacts, coalitions, war chest), market (supply/demand, events), research (doctrines + specialisations), installations, syndicate, covert ops, achievements, save/load.
- **UI:** star map (pan/zoom/select, wormholes, covenant lines), 12+ LCARS panels, combat modal, cycle reports, save-slot manager.
- **Tests:** ~1,000 vitest tests, green. The gate for every commit: `vitest` + `tsc` + `build` all pass.

Current status, milestone by milestone, lives in [`docs/CODING-PLAN.md`](docs/CODING-PLAN.md); the executable work queue is [`TASKS.md`](TASKS.md).

## Project structure

```
src/
├── engine/          # Pure TS game engine (no DOM, no UI imports, seeded RNG)
│   ├── cycle/       #   the 17-phase cycle processor — the game's heartbeat
│   ├── combat/ bot/ diplomacy/ market/ research/ military/
│   ├── syndicate/ covert/ installation/ achievement/ nexus/
│   ├── galaxy/ campaign/ economy/ persistence/ types/
│   └── integration/ #   multi-cycle simulation tests
├── ui/              # React panels (each with jsdom component tests)
├── components/lcars # Design system: Panel, Button, DataReadout, PhaseIndicator
└── App.tsx          # Shell: title screen, panel routing, cycle commit flow
src-tauri/           # Tauri desktop wrapper
docs/                # Design & status documents (see map below)
TASKS.md             # Master task list — executed by the /orchestrate runner
```

## Documentation map

| Document | Role |
|----------|------|
| [`docs/prd.md`](docs/prd.md) | Product requirements (v3.0) — the source of truth |
| [`docs/VISION.md`](docs/VISION.md) | Design philosophy and player experience goals |
| [`docs/architecture.md`](docs/architecture.md) | Technical architecture |
| [`docs/CODING-PLAN.md`](docs/CODING-PLAN.md) | Phased milestone plan with verified statuses + UAT scripts |
| [`docs/AUDIT.md`](docs/AUDIT.md) | Code-vs-spec deviation assessments |
| [`docs/systems/`](docs/systems/) | Per-system design documents (15 active) |
| [`TASKS.md`](TASKS.md) | Executable task DAG with human UAT gates |
| [`docs/superseded/`](docs/superseded/) | Historical docs replaced by the above — reference only |
| [`docs/future-expansion/`](docs/future-expansion/) | Design directions not in current scope |

## Development workflow

Work is defined in `TASKS.md` (task DAG with acceptance criteria) and executed by the `/orchestrate` runner: plan → code → review → gate → commit, one commit per task. **Human UAT tasks act as blockers** — automated work cannot proceed past a playtest checkpoint until a human plays the build and signs off.

House rules (enforced on every change):

- Engine purity: `src/engine/**` never imports UI, touches the DOM, or uses `Math.random()` — randomness is seeded from game state.
- Every engine change ships with vitest coverage; every UI behavior ships with a jsdom component test.
- The gate is sacred: zero failing tests, clean typecheck, and a passing build before any commit.
