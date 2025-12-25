"use client";

/**
 * Propose Treaty Panel Component (M7)
 *
 * Allows proposing treaties to other empires.
 */

import { useEffect, useState, useCallback } from "react";
import {
  getDiplomacyTargetsAction,
  proposeTreatyAction,
} from "@/app/actions/diplomacy-actions";

interface DiplomacyTarget {
  id: string;
  name: string;
  networth: number;
  reputation: number;
  reputationLevel: string;
  hasTreaty: boolean;
  treatyType?: "nap" | "alliance";
}

interface ProposeTreatyPanelProps {
  gameId: string;
  empireId: string;
  onProposalSent?: () => void;
}

export function ProposeTreatyPanel({
  gameId,
  empireId,
  onProposalSent,
}: ProposeTreatyPanelProps) {
  const [targets, setTargets] = useState<DiplomacyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [proposalType, setProposalType] = useState<"nap" | "alliance">("nap");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTargets = useCallback(async () => {
    const result = await getDiplomacyTargetsAction(gameId, empireId);
    if (result.success) {
      setTargets(result.data);
    } else {
      setError(result.error || "Failed to load targets");
    }
    setLoading(false);
  }, [gameId, empireId]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const handlePropose = async () => {
    if (!selectedTarget || sending) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    const result = await proposeTreatyAction(
      gameId,
      empireId,
      selectedTarget,
      proposalType
    );

    if (result.success) {
      setSuccess(`${proposalType === "nap" ? "NAP" : "Alliance"} proposal sent!`);
      setSelectedTarget(null);
      await fetchTargets();
      onProposalSent?.();
    } else {
      setError(result.error || "Failed to send proposal");
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="lcars-panel animate-pulse" data-testid="propose-treaty-loading">
        <div className="h-48 bg-gray-800 rounded"></div>
      </div>
    );
  }

  const getReputationColor = (level: string) => {
    switch (level) {
      case "Trustworthy":
        return "text-green-400";
      case "Neutral":
        return "text-gray-400";
      case "Suspicious":
        return "text-yellow-400";
      case "Treacherous":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const selectedEmpire = targets.find((t) => t.id === selectedTarget);
  const canUpgrade = selectedEmpire?.treatyType === "nap";

  return (
    <div className="lcars-panel" data-testid="propose-treaty-panel">
      <h2 className="text-xl font-display text-lcars-amber mb-4">Propose Treaty</h2>

      {/* Target Selection */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Select Empire</label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {targets.map((target) => (
            <div
              key={target.id}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedTarget === target.id
                  ? "bg-lcars-amber/20 border border-lcars-amber"
                  : "bg-gray-800/50 hover:bg-gray-800"
              }`}
              onClick={() => setSelectedTarget(target.id)}
              data-testid={`target-${target.id}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{target.name}</span>
                {target.hasTreaty && (
                  <span className="text-xs bg-lcars-blue/30 text-lcars-blue px-2 py-0.5 rounded">
                    {target.treatyType === "nap" ? "NAP" : "Allied"}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Networth: {target.networth.toLocaleString()}</span>
                <span className={getReputationColor(target.reputationLevel)}>
                  {target.reputationLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treaty Type Selection */}
      {selectedTarget && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Treaty Type</label>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 rounded transition-colors ${
                proposalType === "nap"
                  ? "bg-lcars-lavender text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } ${selectedEmpire?.treatyType === "nap" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setProposalType("nap")}
              disabled={selectedEmpire?.treatyType === "nap"}
              data-testid="select-nap"
            >
              Non-Aggression Pact
            </button>
            <button
              className={`flex-1 py-2 rounded transition-colors ${
                proposalType === "alliance"
                  ? "bg-lcars-blue text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } ${selectedEmpire?.treatyType === "alliance" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setProposalType("alliance")}
              disabled={selectedEmpire?.treatyType === "alliance"}
              data-testid="select-alliance"
            >
              Alliance {canUpgrade && "(Upgrade)"}
            </button>
          </div>
        </div>
      )}

      {/* Treaty Benefits */}
      {selectedTarget && (
        <div className="mb-4 p-3 bg-gray-800/30 rounded text-sm">
          <h4 className="text-gray-400 mb-2">Benefits</h4>
          {proposalType === "nap" ? (
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Cannot attack each other</li>
              <li>Peaceful relations</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Cannot attack each other</li>
              <li>Shared intelligence</li>
              <li>Can request military support</li>
              <li>+10% income bonus (Diplomat passive)</li>
            </ul>
          )}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <p className="mb-4 text-green-400 text-sm" data-testid="proposal-success">
          {success}
        </p>
      )}

      {/* Error Display */}
      {error && (
        <p className="mb-4 text-red-400 text-sm" data-testid="proposal-error">
          {error}
        </p>
      )}

      {/* Propose Button */}
      <button
        onClick={handlePropose}
        disabled={
          !selectedTarget ||
          sending ||
          (selectedEmpire?.treatyType === "alliance") ||
          (selectedEmpire?.treatyType === "nap" && proposalType === "nap")
        }
        className={`w-full py-3 rounded font-medium transition-colors ${
          selectedTarget && !sending
            ? "bg-lcars-amber text-black hover:bg-lcars-amber/80"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
        data-testid="send-proposal-button"
      >
        {sending
          ? "Sending..."
          : selectedTarget
          ? `Propose ${proposalType === "nap" ? "NAP" : "Alliance"} to ${selectedEmpire?.name}`
          : "Select an empire"}
      </button>
    </div>
  );
}
