/**
 * Starmap Type Definitions
 */

export interface EmpireMapData {
  id: string;
  name: string;
  type: "player" | "bot";
  planetCount: number;
  networth: number;
  isEliminated: boolean;
  // Computed for visualization
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface StarmapProps {
  empires: EmpireMapData[];
  playerEmpireId: string;
  currentTurn: number;
  protectionTurns: number;
  width?: number;
  height?: number;
}

export interface EmpireNodeProps {
  empire: EmpireMapData;
  isPlayer: boolean;
  isProtected: boolean;
  x: number;
  y: number;
  size: number;
  onHover: (empire: EmpireMapData | null) => void;
}

export interface TooltipData {
  empire: EmpireMapData;
  x: number;
  y: number;
}
