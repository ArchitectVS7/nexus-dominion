/**
 * Game Components
 *
 * Main barrel export for all game-related components.
 */

// Core layout
export { GameShell } from "./GameShell";
export { GameHeader } from "./GameHeader";
export { ErrorBoundary } from "./ErrorBoundary";

// Common components
export {
  SlideOutPanel,
  TurnSummaryModal,
  QuickReferenceModal,
  EndTurnButton,
  ResourceBar,
} from "./common";

// Panel components
export {
  MilitaryPanel,
  CombatPanel,
  ResearchPanel,
  SectorsPanel,
  MarketPanel,
  DiplomacyPanel,
  CovertPanel,
  MessagesPanel,
} from "./panels";
