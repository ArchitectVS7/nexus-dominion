/* ── Nexus Dominion — Syndicate Panel ── */

import { Panel, Button, DataReadout } from "../components/lcars";
import type { GameState } from "../engine/types";
import { getBlackRegisterItemCost } from "../engine/syndicate/syndicate-engine";
import { BLACK_REGISTER_ITEMS, type BlackRegisterItemDef } from "../engine/types/syndicate";
import "./SyndicatePanel.css";

interface SyndicatePanelProps {
  state: GameState;
  onClose: () => void;
  onFundSyndicate: (amount: number) => void;
  onPurchaseBlackRegister: (itemId: string) => void;
}

export function SyndicatePanel({ state, onClose, onFundSyndicate, onPurchaseBlackRegister }: SyndicatePanelProps) {
  const empire = state.empires.get(state.playerEmpireId);
  if (!empire) return null;

  const syndicate = state.syndicate;
  const memberObj = syndicate?.members.get(empire.id);
  
  const isController = syndicate?.controllerId === empire.id;
  const rank = memberObj?.rank || 0;
  const influence = memberObj?.influence || 0;
  const signature = memberObj?.shadowSignature || 0;
  const isExposed = memberObj?.exposed || false;

  const items = Object.values(BLACK_REGISTER_ITEMS) as BlackRegisterItemDef[];

  return (
    <div className="syndicate-panel-overlay" onClick={onClose}>
      <div className="syndicate-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="The Syndicate" onClose={onClose} variant="alert">
          <div className="syndicate-panel__content">
            
            {isExposed && (
               <div className="syndicate-panel__alert">
                 <span className="syndicate-panel__alert-icon">⚠</span>
                 <span>EXPOSED — You are known to the broader galaxy. Syndicate actions restricted!</span>
               </div>
            )}

            {/* Status Header */}
            <div className="syndicate-panel__header">
              <div className="syndicate-panel__tier-badge">
                <span className="syndicate-panel__tier-lbl">RANK</span>
                <span className="syndicate-panel__tier-val">{isController ? "CONTROLLER" : rank}</span>
              </div>
              
              <div className="syndicate-panel__points">
                <DataReadout label="Influence" value={influence} />
                <DataReadout label="Shadow Sign" value={`${Math.round(signature)}%`} />
              </div>
            </div>

            {/* Fund Syndicate Action */}
            <div className="syndicate-panel__section">
              <h4 className="syndicate-panel__section-title">Syndicate Operations</h4>
              <p className="syndicate-panel__desc">Convert Credits (CT) into Syndicate Influence. Increases Shadow Signature.</p>
              <div className="syndicate-panel__fund-actions">
                <Button label="INJECT 100 CT" variant="secondary" onClick={() => onFundSyndicate(100)} disabled={empire.resources.credits < 100 || isExposed} />
                <Button label="INJECT 500 CT" variant="secondary" onClick={() => onFundSyndicate(500)} disabled={empire.resources.credits < 500 || isExposed} />
              </div>
            </div>

            {/* Black Register */}
            <div className="syndicate-panel__section">
              <h4 className="syndicate-panel__section-title">The Black Register</h4>
              <div className="syndicate-panel__items">
                {items.map((item) => {
                   const canAffordObj = memberObj ? getBlackRegisterItemCost(memberObj, item.id as any, syndicate?.controllerId || null) : 0;
                   const cost = canAffordObj;
                   const locked = !memberObj || memberObj.rank < item.minRank || isExposed;
                   const owned = state.ownedBlackRegisterItems && state.ownedBlackRegisterItems.get(empire.id)?.has(item.id);

                   return (
                     <div key={item.id} className={`syndicate-panel__item ${locked ? "locked" : ""} ${owned ? "owned" : ""}`}>
                        <div className="syndicate-panel__item-info">
                          <span className="syndicate-panel__item-name">{item.id.replace(/-/g, " ")}</span>
                          <span className="syndicate-panel__item-cost">
                             {owned ? "OWNED" : locked ? `REQ RANK ${item.minRank}` : `Cost: ${cost} CT`}
                          </span>
                        </div>
                        <Button 
                          label={owned ? "PURCHASED" : "BUY"} 
                          variant="primary" 
                          size="sm" 
                          disabled={locked || owned || empire.resources.credits < cost}
                          onClick={() => onPurchaseBlackRegister(item.id)} 
                        />
                     </div>
                   );
                })}
              </div>
            </div>

          </div>
        </Panel>
      </div>
    </div>
  );
}
