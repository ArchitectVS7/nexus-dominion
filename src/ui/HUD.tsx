/* ── Nexus Dominion — HUD (Heads-Up Display) ── */

import { Button } from "../components/lcars";
import type { GameState } from "../engine/types";
import { TurnStatus } from "./TurnStatus";
import "./HUD.css";

interface HUDProps {
  state: GameState;
  onCommitCycle: () => void;
  /** Number of orders queued this cycle — drives the commit button label. */
  orderCount?: number;
  /** When true, an empty-queue commit is awaiting a confirming second click. */
  pendingPass?: boolean;
  /** When true the CycleReport modal is open — highlights the REPORT beat. */
  reportOpen?: boolean;
  onOpenEmpire: () => void;
  onOpenMilitary: () => void;
  onOpenDiplomacy: () => void;
  onOpenMarket: () => void;
  onOpenResearch: () => void;
  onOpenSyndicate: () => void;
  onOpenCovert: () => void;
  onSaveGame: () => void;
}

export function HUD({
  state,
  onCommitCycle,
  orderCount = 0,
  pendingPass = false,
  reportOpen = false,
  onOpenEmpire,
  onOpenMilitary,
  onOpenDiplomacy,
  onOpenMarket,
  onOpenResearch,
  onOpenSyndicate,
  onOpenCovert,
  onSaveGame,
}: HUDProps) {
  const empire = state.empires.get(state.playerEmpireId);
  if (!empire) return null;

  return (
    <div className="hud">
      {/* Top bar — cycle/Reckoning readout, phase beats, and commit */}
      <div className="hud__top-bar">
        <TurnStatus
          state={state}
          orderCount={orderCount}
          pendingPass={pendingPass}
          reportOpen={reportOpen}
          onCommitCycle={onCommitCycle}
        />
      </div>

      {/* Bottom bar — quick resources */}
      <div className="hud__bottom-bar">
        <div className="hud__resources">
          <div className="hud__res-item">
            <span className="hud__res-icon">◈</span>
            <span className="hud__res-val">{empire.resources.credits.toLocaleString()}</span>
            <span className="hud__res-name">Credits</span>
          </div>
          <div className="hud__res-item">
            <span className="hud__res-icon hud__res-icon--food">◉</span>
            <span className="hud__res-val">{empire.resources.food.toLocaleString()}</span>
            <span className="hud__res-name">Food</span>
          </div>
          <div className="hud__res-item">
            <span className="hud__res-icon hud__res-icon--ore">⬡</span>
            <span className="hud__res-val">{empire.resources.ore.toLocaleString()}</span>
            <span className="hud__res-name">Ore</span>
          </div>
          <div className="hud__res-item">
            <span className="hud__res-icon hud__res-icon--fuel">⏣</span>
            <span className="hud__res-val">{empire.resources.fuelCells.toLocaleString()}</span>
            <span className="hud__res-name">Fuel</span>
          </div>
          <div className="hud__res-item">
            <span className="hud__res-icon hud__res-icon--rp">◎</span>
            <span className="hud__res-val">{empire.resources.researchPoints.toLocaleString()}</span>
            <span className="hud__res-name">RP</span>
          </div>
        </div>

        <div className="hud__nav-buttons">
          <Button label="EMPIRE" variant="secondary" size="sm" onClick={onOpenEmpire} />
          <Button label="MILITARY" variant="secondary" size="sm" onClick={onOpenMilitary} />
          <Button label="MARKET" variant="secondary" size="sm" onClick={onOpenMarket} />
          <Button label="DIPLOMACY" variant="secondary" size="sm" onClick={onOpenDiplomacy} />
          <Button label="RESEARCH" variant="secondary" size="sm" onClick={onOpenResearch} />
          <Button label="SYNDICATE" variant="danger" size="sm" onClick={onOpenSyndicate} />
          <Button label="COVERT" variant="primary" size="sm" onClick={onOpenCovert} />
          <Button label="SAVE" variant="secondary" size="sm" onClick={onSaveGame} />
        </div>
      </div>
    </div>
  );
}
