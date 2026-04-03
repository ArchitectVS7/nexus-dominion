/* ── Nexus Dominion — Market Panel ── */

import { useState } from "react";
import { Panel, Button } from "../components/lcars";
import type { GameState, MarketEvent } from "../engine/types";
import { getTradeDiscount } from "../engine/diplomacy/diplomacy-engine";
import { buyResource, sellResource } from "../engine/market/market-engine";
import "./MarketPanel.css";

interface MarketPanelProps {
  state: GameState;
  onClose: () => void;
  onTrade: (resource: "food" | "ore" | "fuelCells", quantity: number, direction: "buy" | "sell") => void;
}

export function MarketPanel({ state, onClose, onTrade }: MarketPanelProps) {
  const [selectedResource, setSelectedResource] = useState<"food" | "ore" | "fuelCells">("ore");
  const [tradeAmount, setTradeAmount] = useState<number>(100);

  const market = state.market;
  const empire = state.empires.get(state.playerEmpireId);

  if (!market || !empire) return null;

  const resKeys: ("food" | "ore" | "fuelCells")[] = ["food", "ore", "fuelCells"];
  const tradeDiscount = getTradeDiscount(state.playerEmpireId, state.diplomacy);
  const currentCredits = empire.resources.credits;

  // Extract market events from the state (last 50 events)
  const recentMarketEvents = Array.from(state.currentCycleEvents)
    .filter((e): e is MarketEvent => e.type === "market")
    .reverse();

  return (
    <div className="market-panel-overlay" onClick={onClose}>
      <div className="market-panel-slide" onClick={(e) => e.stopPropagation()}>
        <Panel title="Galactic Market" onClose={onClose}>
          <div className="market-panel__content">
            {/* Discount info */}
            {tradeDiscount > 0 && (
              <div className="market-panel__discount">
                Galactic Trade Discount Active: +{Math.round(tradeDiscount * 100)}% margins
              </div>
            )}
            
            {tradeDiscount < 0 && (
              <div className="market-panel__discount negative">
                Leader Penalty Applied: {Math.round(tradeDiscount * -100)}% worse margins
              </div>
            )}

            {/* Price Cards */}
            <div className="market-panel__prices">
              {resKeys.map((res) => {
                const price = market.prices[res];
                const base = market.basePrices[res];
                const trend = price > base ? "high" : price < base ? "low" : "stable";
                const isSelected = selectedResource === res;

                return (
                  <button
                    key={res}
                    className={`market-panel__price-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedResource(res)}
                  >
                    <span className="market-panel__card-lbl">{res}</span>
                    <span className={`market-panel__card-val ${trend}`}>
                      {price.toFixed(1)} CT
                    </span>
                    <span className="market-panel__card-trend">
                      {trend === "high" ? "▲" : trend === "low" ? "▼" : "—"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Trade Interface */}
            <div className="market-panel__trade-interface">
              <h4 className="market-panel__section-title">Trade {selectedResource}</h4>
              
              <div className="market-panel__amount-selector">
                <button onClick={() => setTradeAmount(10)}>10</button>
                <button onClick={() => setTradeAmount(100)}>100</button>
                <button onClick={() => setTradeAmount(500)}>500</button>
                <button onClick={() => setTradeAmount(1000)}>1000</button>
              </div>

              <div className="market-panel__amount-input">
                <span>Quantity:</span>
                <span className="market-panel__qty">{tradeAmount}</span>
              </div>

              {/* Dynamic Quote */}
              <TradeQuotes
                resource={selectedResource}
                quantity={tradeAmount}
                prices={market.prices}
                discount={tradeDiscount}
                availableCredits={currentCredits}
                availableResource={empire.resources[selectedResource]}
                onExecute={(dir) => onTrade(selectedResource, tradeAmount, dir)}
              />
            </div>

            {/* Event Log */}
            <div className="market-panel__events">
              <h4 className="market-panel__section-title">Market Analysts</h4>
              <div className="market-panel__feed">
                {recentMarketEvents.length > 0 ? (
                  recentMarketEvents.map((evt, i) => (
                    <div key={i} className="market-panel__feed-item">
                      <span className="market-panel__feed-cycle">C{evt.cycle}</span>
                      <span className="market-panel__feed-kind">{evt.eventKind.replace(/-/g, " ")}</span>
                      <span className="market-panel__feed-val">
                        {evt.priceChange > 0 ? "+" : ""}
                        {evt.priceChange.toFixed(1)} CT {evt.affectedResource ? `(${evt.affectedResource})` : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="market-panel__feed-empty">Market is stable.</div>
                )}
              </div>
            </div>
            
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TradeQuotes({
  resource,
  quantity,
  prices,
  discount,
  availableCredits,
  availableResource,
  onExecute,
}: {
  resource: "food" | "ore" | "fuelCells";
  quantity: number;
  prices: any; // Using any to avoid TS errors across different files
  discount: number;
  availableCredits: number;
  availableResource: number;
  onExecute: (dir: "buy" | "sell") => void;
}) {
  // Simulate buy cost
  const buyQuote = buyResource(resource, quantity, prices, 999999, { feePercent: -discount });
  const sellQuote = sellResource(resource, quantity, prices, 999999, { sellBonus: discount });

  const canBuy = buyQuote && availableCredits >= buyQuote.creditCost;
  const canSell = sellQuote && availableResource >= sellQuote.quantitySold;

  return (
    <div className="market-panel__actions">
      <div className="market-panel__action-col">
        <span className="market-panel__quote">
          Cost: {buyQuote ? Math.floor(buyQuote.creditCost) : "—"} CT
        </span>
        <Button
          label="⟫ BUY"
          variant="primary"
          disabled={!canBuy}
          onClick={() => onExecute("buy")}
        />
      </div>

      <div className="market-panel__action-col">
        <span className="market-panel__quote">
          Earn: {sellQuote ? Math.floor(sellQuote.creditsEarned) : "—"} CT
        </span>
        <Button
          label="⟫ SELL"
          variant="secondary"
          disabled={!canSell}
          onClick={() => onExecute("sell")}
        />
      </div>
    </div>
  );
}
