/* ── Nexus Dominion — Save Slot Manager ──
   Presentational save-slot list rendered on the title screen when the
   player chooses CONTINUE. Purely props-driven: it imports nothing from
   src/engine, so it stays testable and honours engine purity. The parent
   (App.tsx) supplies save metadata and the load/delete callbacks. */

import { useState } from "react";
import { Panel, Button } from "../components/lcars";
import "./SaveSlotManager.css";

export interface SaveSlotSummary {
  id: string;
  name: string;
  savedAt: string;
  cycle: number;
}

interface SaveSlotManagerProps {
  saves: SaveSlotSummary[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function formatTimestamp(savedAt: string): string {
  const parsed = new Date(savedAt);
  if (Number.isNaN(parsed.getTime())) return savedAt;
  return parsed.toLocaleString();
}

export function SaveSlotManager({ saves, onLoad, onDelete, onClose }: SaveSlotManagerProps) {
  // Two-step delete confirmation: first click arms the row, second confirms.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Newest-first for display.
  const ordered = [...saves].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return (
    <div className="save-slot-overlay">
      <div className="save-slot-slide">
        <Panel title="CONTINUE CAMPAIGN" onClose={onClose}>
          <div className="save-slot__content">
            {ordered.length === 0 ? (
              <p className="save-slot__empty">NO SAVED CAMPAIGNS</p>
            ) : (
              <ul className="save-slot__list">
                {ordered.map((save) => {
                  const isConfirming = confirmingId === save.id;
                  return (
                    <li key={save.id} className="save-slot__row">
                      <div className="save-slot__meta">
                        <span className="save-slot__name">{save.name}</span>
                        <span className="save-slot__detail">Cycle {save.cycle}</span>
                        <span className="save-slot__detail save-slot__timestamp">
                          {formatTimestamp(save.savedAt)}
                        </span>
                      </div>
                      <div className="save-slot__actions">
                        {isConfirming ? (
                          <>
                            <Button
                              label="CONFIRM DELETE"
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                onDelete(save.id);
                                setConfirmingId(null);
                              }}
                            />
                            <Button
                              label="CANCEL"
                              variant="secondary"
                              size="sm"
                              onClick={() => setConfirmingId(null)}
                            />
                          </>
                        ) : (
                          <>
                            <Button
                              label="LOAD"
                              variant="primary"
                              size="sm"
                              onClick={() => onLoad(save.id)}
                            />
                            <Button
                              label="DELETE"
                              variant="danger"
                              size="sm"
                              onClick={() => setConfirmingId(save.id)}
                            />
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
