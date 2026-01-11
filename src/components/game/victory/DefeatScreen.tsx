"use client";

/**
 * Defeat Screen
 *
 * Displayed when the player loses the game.
 */

export interface DefeatStats {
  finalTurn: number;
  sectorsLost: number;
  peakSectors: number;
  peakPopulation: number;
}

interface DefeatScreenProps {
  defeatType: string;
  empireName?: string;
  message?: string;
  turn?: number;
  stats?: DefeatStats;
  onPlayAgain?: () => void;
  onTryAgain?: () => void;
  onReturnHome?: () => void;
}

export function DefeatScreen({
  defeatType,
  empireName,
  message,
  turn,
  stats,
  onPlayAgain,
  onTryAgain,
  onReturnHome,
}: DefeatScreenProps) {
  const defeatTitle = {
    military: "Military Defeat",
    starvation: "Population Collapse",
    bankruptcy: "Economic Collapse",
    revolt: "Civil Uprising",
    civil_collapse: "Civil Collapse",
    elimination: "Empire Eliminated",
  }[defeatType] ?? "Defeat";

  const defaultDescription = {
    military: "Your empire was conquered by enemy forces.",
    starvation: "Your population perished from famine.",
    bankruptcy: "Your economy collapsed under its own weight.",
    revolt: "Civil unrest toppled your government.",
    civil_collapse: "Civil unrest destroyed your empire.",
    elimination: "Your empire has been eliminated.",
  }[defeatType] ?? "Your empire has fallen.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-red-900/20 to-gray-900">
      <div className="max-w-2xl w-full mx-auto p-8">
        {/* Defeat Banner */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-4xl font-display text-red-500 mb-4">
            {defeatTitle}
          </h1>
          {empireName && (
            <p className="text-2xl text-red-400 mb-2">{empireName}</p>
          )}
          <p className="text-xl text-gray-300">{message ?? defaultDescription}</p>
        </div>

        {/* Stats */}
        <div className="lcars-panel mb-8">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Final Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {turn !== undefined && (
              <StatItem label="Survived Until" value={`Turn ${turn}`} />
            )}
            {stats && (
              <>
                <StatItem label="Sectors Lost" value={stats.sectorsLost} />
                <StatItem label="Peak Sectors" value={stats.peakSectors} />
                <StatItem
                  label="Peak Population"
                  value={stats.peakPopulation.toLocaleString()}
                />
              </>
            )}
          </div>
        </div>

        {/* Advice */}
        <div className="lcars-panel mb-8 border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 mb-4">
            What Went Wrong
          </h2>
          <p className="text-gray-400">
            {defeatType === "military" &&
              "Focus on building a stronger military before expanding too aggressively."}
            {defeatType === "starvation" &&
              "Balance sector acquisitions with food production from agriculture sectors."}
            {defeatType === "bankruptcy" &&
              "Reduce military upkeep costs and invest in urban sectors for income."}
            {(defeatType === "revolt" || defeatType === "civil_collapse") &&
              "Keep your civil status high by maintaining food supply and avoiding overextension."}
            {defeatType === "elimination" &&
              "Build a stronger military and form alliances to defend against attacks."}
            {!["military", "starvation", "bankruptcy", "revolt", "civil_collapse", "elimination"].includes(defeatType) &&
              "Analyze your gameplay and try a different strategy next time."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {(onPlayAgain || onTryAgain) && (
            <button
              onClick={onPlayAgain ?? onTryAgain}
              className="px-6 py-3 bg-lcars-amber text-black font-semibold rounded hover:bg-lcars-gold transition-colors"
            >
              Try Again
            </button>
          )}
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Return Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 bg-gray-800/50 rounded text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-mono text-red-400 text-xl">{value}</div>
    </div>
  );
}

export default DefeatScreen;
