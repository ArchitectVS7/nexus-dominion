/* ── Nexus Dominion — HUD (Heads-Up Display) ── */

import { Button } from "../components/lcars";
import type { GameState } from "../engine/types";
import "./HUD.css";

interface HUDProps {
  state: GameState;
  onCommitCycle: () => void;
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

  const cycle = state.time.currentCycle;
  const confluenceCycle = cycle % 10;
  const tier = state.time.cosmicOrder?.tiers?.get?.(state.playerEmpireId) ?? "—";

  return (
    <div className="hud">
      {/* Top bar — cycle info + commit */}
      <div className="hud__top-bar">
        <div className="hud__cycle-info">
          <div className="hud__cycle-badge">
            <span className="hud__cycle-label">CYCLE</span>
            <span className="hud__cycle-number">{cycle}</span>
          </div>
          <div className="hud__confluence">
            <span className="hud__conf-label">CONFLUENCE</span>
            <div className="hud__conf-bar">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`hud__conf-pip ${i < confluenceCycle ? "hud__conf-pip--filled" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="hud__tier-badge">
            <span className="hud__tier-label">TIER</span>
            <span className="hud__tier-value">{typeof tier === "string" ? tier : tier}</span>
          </div>
        </div>

        <Button
          label="⟫ COMMIT CYCLE"
          variant="primary"
          size="lg"
          onClick={onCommitCycle}
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
