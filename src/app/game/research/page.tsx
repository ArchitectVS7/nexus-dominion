"use client";

/**
 * Research Page
 *
 * Displays research tree and progress.
 * Uses React Query for data fetching.
 */

import { useDashboard } from "@/lib/api";

export default function ResearchPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="research-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Research</h1>
        <div className="lcars-panel animate-pulse">
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="research-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Research</h1>
        <div className="lcars-panel">
          <p className="text-red-400">Failed to load research data</p>
        </div>
      </div>
    );
  }

  const { empire, resources } = data;
  const researchLevel = empire.fundamentalResearchLevel;
  const researchPoints = resources.researchPoints;

  // Calculate next level cost
  const nextLevelCost = 1000 * Math.pow(2, researchLevel);
  const progressPercent = Math.min(100, (researchPoints / nextLevelCost) * 100);

  return (
    <div className="max-w-6xl mx-auto" data-testid="research-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Research</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Progress */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Fundamental Research
          </h2>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Current Level</span>
              <span className="text-lcars-amber font-mono text-xl">
                Level {researchLevel}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Research Points</span>
              <span className="font-mono">
                {researchPoints.toLocaleString()} / {nextLevelCost.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className="bg-cyan-500 h-4 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>Research sectors generate 100 RP per turn.</p>
            <p className="mt-2">
              You have{" "}
              <span className="text-white font-mono">
                {data.sectors.filter((s) => s.type === "research").length}
              </span>{" "}
              research sectors.
            </p>
          </div>
        </div>

        {/* Research Tree */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Technology Unlocks
          </h2>

          <div className="space-y-3">
            <TechUnlock
              level={0}
              currentLevel={researchLevel}
              label="Soldiers, Fighters, Stations"
              description="Basic military units"
            />
            <TechUnlock
              level={2}
              currentLevel={researchLevel}
              label="Light Cruisers"
              description="Fast attack ships"
            />
            <TechUnlock
              level={4}
              currentLevel={researchLevel}
              label="Heavy Cruisers"
              description="Powerful warships"
            />
            <TechUnlock
              level={6}
              currentLevel={researchLevel}
              label="Carriers"
              description="Troop transports"
            />
            <TechUnlock
              level={8}
              currentLevel={researchLevel}
              label="Advanced Weapons"
              description="10% damage bonus"
            />
            <TechUnlock
              level={10}
              currentLevel={researchLevel}
              label="Elite Forces"
              description="20% effectiveness bonus"
            />
          </div>
        </div>
      </div>

      {/* Research Info */}
      <div className="mt-6 lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Research System
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <span className="text-cyan-400">Research Sectors</span> generate{" "}
            <span className="text-white font-mono">100 RP</span> per turn.
          </p>
          <p>
            Research costs increase exponentially:{" "}
            <span className="text-white font-mono">1,000 × 2^level</span>
          </p>
          <p>
            Higher research levels unlock more powerful military units.
          </p>
        </div>
      </div>
    </div>
  );
}

function TechUnlock({
  level,
  currentLevel,
  label,
  description,
}: {
  level: number;
  currentLevel: number;
  label: string;
  description: string;
}) {
  const isUnlocked = currentLevel >= level;

  return (
    <div
      className={`p-3 rounded border ${
        isUnlocked
          ? "bg-cyan-900/30 border-cyan-500/50 text-cyan-400"
          : "bg-gray-800/50 border-gray-700 text-gray-500"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs opacity-75">{description}</div>
        </div>
        <div className="text-right">
          <div className="text-xs">Level {level}</div>
          <div className="text-lg">{isUnlocked ? "✓" : "🔒"}</div>
        </div>
      </div>
    </div>
  );
}
