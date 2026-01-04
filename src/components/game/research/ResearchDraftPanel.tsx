"use client";

import { useState, useEffect } from "react";
import {
  getResearchDraftStatusAction,
  draftDoctrineAction,
  draftSpecializationAction,
} from "@/app/actions/research-actions";
import {
  DOCTRINES,
  SPECIALIZATIONS,
  RESEARCH_TIER_THRESHOLDS,
  type ResearchProgress,
  type ResearchDoctrine,
  type ResearchSpecialization,
} from "@/lib/game/services/research-draft-service";
import { Target, Shield, TrendingUp, Zap, Layers, DollarSign } from "lucide-react";

export function ResearchDraftPanel() {
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getResearchDraftStatusAction();
      setProgress(status);
    } catch {
      setError("Failed to load research status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProgress();
  }, []);

  const handleDraftDoctrine = async (doctrine: ResearchDoctrine) => {
    setIsDrafting(true);
    setError(null);
    try {
      const result = await draftDoctrineAction(doctrine);
      if (result.success) {
        await loadProgress(); // Refresh status
      } else {
        setError(result.error || "Failed to draft doctrine");
      }
    } catch {
      setError("Failed to draft doctrine");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleDraftSpecialization = async (specialization: ResearchSpecialization) => {
    setIsDrafting(true);
    setError(null);
    try {
      const result = await draftSpecializationAction(specialization);
      if (result.success) {
        await loadProgress(); // Refresh status
      } else {
        setError(result.error || "Failed to draft specialization");
      }
    } catch {
      setError("Failed to draft specialization");
    } finally {
      setIsDrafting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="lcars-panel" data-testid="research-draft-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Research Advancement
        </h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="lcars-panel" data-testid="research-draft-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Research Advancement
        </h2>
        <p className="text-red-400">Failed to load research status</p>
      </div>
    );
  }

  const getDoctrineIcon = (doctrine: ResearchDoctrine) => {
    switch (doctrine) {
      case "war_machine":
        return <Target className="w-6 h-6" />;
      case "fortress":
        return <Shield className="w-6 h-6" />;
      case "commerce":
        return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getSpecializationIcon = (spec: ResearchSpecialization) => {
    const specData = SPECIALIZATIONS[spec];
    switch (specData.doctrine) {
      case "war_machine":
        return <Zap className="w-5 h-5" />;
      case "fortress":
        return <Layers className="w-5 h-5" />;
      case "commerce":
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const renderProgressBar = () => {
    if (!progress) return null;

    const thresholds = [
      RESEARCH_TIER_THRESHOLDS.TIER_1,
      RESEARCH_TIER_THRESHOLDS.TIER_2,
      RESEARCH_TIER_THRESHOLDS.TIER_3,
    ];

    const currentThreshold = progress.nextThreshold ?? thresholds[progress.currentTier] ?? 0;
    const previousThreshold = progress.currentTier > 0 ? (thresholds[progress.currentTier - 1] ?? 0) : 0;

    const progressInTier = progress.researchPoints - previousThreshold;
    const tierRange = currentThreshold - previousThreshold;
    const percentInTier = tierRange > 0 ? Math.min(100, (progressInTier / tierRange) * 100) : 0;

    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">
            Tier {progress.currentTier} {progress.currentTier < 3 && `→ Tier ${progress.currentTier + 1}`}
          </span>
          <span className="font-mono text-lcars-amber">
            {progress.researchPoints.toLocaleString()} / {currentThreshold.toLocaleString()} RP
          </span>
        </div>
        <div className="w-full bg-black/40 rounded-full h-3 border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-lcars-blue to-lcars-lavender rounded-full transition-all duration-500"
            style={{ width: `${percentInTier}%` }}
          />
        </div>
      </div>
    );
  };

  const renderCurrentResearch = () => {
    if (progress.currentTier === 0) {
      return (
        <div className="bg-black/30 p-4 rounded border border-gray-700 mb-4">
          <p className="text-gray-400 text-center">
            No doctrine selected. Accumulate {RESEARCH_TIER_THRESHOLDS.TIER_1.toLocaleString()} RP to unlock Tier 1 draft.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-black/30 p-4 rounded border border-gray-700 mb-4">
        <h3 className="text-sm font-semibold text-lcars-lavender mb-3">Current Research</h3>
        <div className="space-y-2">
          {progress.doctrine && (
            <div className="flex items-center gap-3">
              <div className="text-lcars-amber">{getDoctrineIcon(progress.doctrine)}</div>
              <div>
                <div className="font-semibold text-white">{DOCTRINES[progress.doctrine].name}</div>
                <div className="text-xs text-gray-400">{DOCTRINES[progress.doctrine].description}</div>
              </div>
            </div>
          )}
          {progress.specialization && (
            <div className="flex items-center gap-3 mt-2">
              <div className="text-lcars-blue">{getSpecializationIcon(progress.specialization)}</div>
              <div>
                <div className="font-semibold text-white">{SPECIALIZATIONS[progress.specialization].name}</div>
                <div className="text-xs text-gray-400">{SPECIALIZATIONS[progress.specialization].description}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDoctrineDraft = () => {
    if (progress.currentTier !== 0 || !progress.canDraft) {
      return null;
    }

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-lcars-amber">
          Tier 1: Draft Doctrine
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Choose your strategic identity. This defines your empire&apos;s approach for the entire game.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {(["war_machine", "fortress", "commerce"] as ResearchDoctrine[]).map((doctrine) => {
            const data = DOCTRINES[doctrine];
            return (
              <button
                key={doctrine}
                onClick={() => handleDraftDoctrine(doctrine)}
                disabled={isDrafting}
                className="bg-black/50 p-4 rounded border-2 border-gray-700 hover:border-lcars-amber transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid={`draft-doctrine-${doctrine}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lcars-amber mt-1">{getDoctrineIcon(doctrine)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{data.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">{data.description}</p>
                    <div className="text-xs space-y-1">
                      {data.bonuses.attackMultiplier && (
                        <div className="text-green-400">
                          +{((data.bonuses.attackMultiplier - 1) * 100).toFixed(0)}% Attack Power
                        </div>
                      )}
                      {data.bonuses.defenseMultiplier && (
                        <div className="text-blue-400">
                          +{((data.bonuses.defenseMultiplier - 1) * 100).toFixed(0)}% Defense Power
                        </div>
                      )}
                      {data.bonuses.marketSellBonus && (
                        <div className="text-yellow-400">
                          +{((data.bonuses.marketSellBonus - 1) * 100).toFixed(0)}% Market Sell Prices
                        </div>
                      )}
                      {data.bonuses.incomeMultiplier && data.bonuses.incomeMultiplier < 1 && (
                        <div className="text-red-400">
                          {((data.bonuses.incomeMultiplier - 1) * 100).toFixed(0)}% Sector Income
                        </div>
                      )}
                      {data.bonuses.planetCostMultiplier && data.bonuses.planetCostMultiplier > 1 && (
                        <div className="text-red-400">
                          +{((data.bonuses.planetCostMultiplier - 1) * 100).toFixed(0)}% Sector Costs
                        </div>
                      )}
                      <div className="text-lcars-lavender mt-2">
                        Unlocks: {data.unlocks.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSpecializationDraft = () => {
    if (progress.currentTier !== 1 || !progress.canDraft || !progress.doctrine) {
      return null;
    }

    const availableSpecs = Object.entries(SPECIALIZATIONS)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, spec]) => spec.doctrine === progress.doctrine)
      .map(([key]) => key as ResearchSpecialization);

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-lcars-blue">
          Tier 2: Draft Specialization
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Refine your {DOCTRINES[progress.doctrine].name} strategy with a specialization.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {availableSpecs.map((spec) => {
            const data = SPECIALIZATIONS[spec];
            return (
              <button
                key={spec}
                onClick={() => handleDraftSpecialization(spec)}
                disabled={isDrafting}
                className="bg-black/50 p-4 rounded border-2 border-gray-700 hover:border-lcars-blue transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid={`draft-specialization-${spec}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-lcars-blue mt-1">{getSpecializationIcon(spec)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{data.name}</h4>
                    <p className="text-sm text-gray-400">{data.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="lcars-panel" data-testid="research-draft-panel">
      <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
        Research Advancement
      </h2>

      {renderProgressBar()}
      {renderCurrentResearch()}

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      {renderDoctrineDraft()}
      {renderSpecializationDraft()}

      {progress.currentTier === 3 && (
        <div className="bg-gradient-to-r from-lcars-amber/20 to-lcars-lavender/20 p-4 rounded border-2 border-lcars-amber">
          <h3 className="text-lg font-semibold text-lcars-amber mb-2">
            Maximum Research Achieved
          </h3>
          <p className="text-sm text-gray-300">
            You have reached Tier 3 and unlocked your capstone ability.
          </p>
        </div>
      )}
    </div>
  );
}
