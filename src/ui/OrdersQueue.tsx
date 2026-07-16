/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Orders Queue Tray

   A collapsible LCARS tray docked directly below the HUD top bar that
   shows the orders queued for this cycle. Orders are flushed to the
   engine on COMMIT CYCLE (see App.tsx). Purely presentational — all
   queue mutation happens in App via the pure `orders` module.
   ══════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { Button } from "../components/lcars";
import type { QueuedOrder } from "./orders";
import "./OrdersQueue.css";

interface OrdersQueueProps {
  orders: QueuedOrder[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

/** A display row: either a single order or a grouped stack of build-units. */
interface DisplayRow {
  /** Ids backing this row (>1 only for grouped stackable orders). */
  ids: string[];
  label: string;
  count: number;
}

/**
 * Build display rows. Stackable build-units with an identical label are
 * grouped into a single `×N` row (display only — state keeps them separate).
 * Removing a grouped row removes one order id from that group.
 */
function toDisplayRows(orders: QueuedOrder[]): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const groupIndex = new Map<string, number>();

  for (const order of orders) {
    if (order.type === "build-unit") {
      const key = order.label;
      const existing = groupIndex.get(key);
      if (existing !== undefined) {
        rows[existing].ids.push(order.id);
        rows[existing].count += 1;
        continue;
      }
      groupIndex.set(key, rows.length);
      rows.push({ ids: [order.id], label: order.label, count: 1 });
      continue;
    }
    rows.push({ ids: [order.id], label: order.label, count: 1 });
  }

  return rows;
}

export function OrdersQueue({ orders, onRemove, onClearAll }: OrdersQueueProps) {
  const [expanded, setExpanded] = useState(true);
  const rows = toDisplayRows(orders);

  return (
    <div className="orders-tray" data-testid="orders-tray">
      <div className="orders-tray__bar">
        <button
          type="button"
          className="orders-tray__toggle"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? "collapse orders queue" : "expand orders queue"}
        >
          <span className="orders-tray__caret">{expanded ? "▾" : "▸"}</span>
          <span className="orders-tray__title">ORDERS QUEUE</span>
          <span className="orders-tray__count">{orders.length}</span>
        </button>

        {orders.length > 0 && (
          <Button
            label="CLEAR ALL"
            variant="danger"
            size="sm"
            onClick={onClearAll}
          />
        )}
      </div>

      {expanded && (
        <div className="orders-tray__list">
          {orders.length === 0 ? (
            <div className="orders-tray__empty">NO ORDERS QUEUED</div>
          ) : (
            rows.map((row) => (
              <div key={row.ids[0]} className="orders-tray__item">
                <span className="orders-tray__label">
                  {row.label}
                  {row.count > 1 && (
                    <span className="orders-tray__multiplier">×{row.count}</span>
                  )}
                </span>
                <button
                  type="button"
                  className="orders-tray__remove"
                  aria-label={`remove ${row.label}`}
                  onClick={() => onRemove(row.ids[row.ids.length - 1])}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
