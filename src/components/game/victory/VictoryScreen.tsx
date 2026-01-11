"use client";

/**
 * Victory Screen
 *
 * Displayed when the player wins the game.
 */

export interface VictoryStats {
  // Primary format
  finalTurn?: number;
  sectorsControlled?: number;
  totalCredits?: number;
  population?: number;
  empiresDefeated?: number;
  // Alternative format (from result page)
  totalTurns?: number;
  totalSectors?: number;
  winnerSectors?: number;
  winnerNetworth?: number;
  empiresRemaining?: number;
}

interface VictoryScreenProps {
  victoryType: string;
  winnerName?: string;
  message?: string;
  stats: VictoryStats;
  onPlayAgain?: () => void;
  onReturnHome?: () => void;
}

export function VictoryScreen({
  victoryType,
  winnerName,
  message,
  stats,
  onPlayAgain,
  onReturnHome,
}: VictoryScreenProps) {
  const victoryTitle = {
    conquest: "Galactic Domination",
    economic: "Economic Victory",
    survival: "Survival Victory",
  }[victoryType] ?? "Victory";

  const defaultDescription = {
    conquest: "You have conquered the galaxy through military might!",
    economic: "Your economic empire dominates all competition!",
    survival: "You have outlasted all challengers and survived to the end!",
  }[victoryType] ?? "You have achieved victory!";

  // Normalize stats from either format
  const finalTurn = stats.finalTurn ?? stats.totalTurns ?? 0;
  const sectors = stats.sectorsControlled ?? stats.winnerSectors ?? 0;
  const credits = stats.totalCredits ?? stats.winnerNetworth ?? 0;
  const empDefeated = stats.empiresDefeated ?? 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-2xl w-full mx-auto p-8">
        {/* Victory Banner */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-display text-lcars-gold mb-4">
            {victoryTitle}
          </h1>
          {winnerName && (
            <p className="text-2xl text-lcars-amber mb-2">{winnerName}</p>
          )}
          <p className="text-xl text-gray-300">{message ?? defaultDescription}</p>
        </div>

        {/* Stats */}
        <div className="lcars-panel mb-8">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Final Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatItem label="Final Turn" value={finalTurn} />
            <StatItem label="Sectors" value={sectors} />
            <StatItem label="Credits" value={credits.toLocaleString()} />
            {stats.population !== undefined && (
              <StatItem label="Population" value={stats.population.toLocaleString()} />
            )}
            {empDefeated > 0 && (
              <StatItem label="Empires Defeated" value={empDefeated} />
            )}
            {stats.empiresRemaining !== undefined && (
              <StatItem label="Empires Remaining" value={stats.empiresRemaining} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="px-6 py-3 bg-lcars-amber text-black font-semibold rounded hover:bg-lcars-gold transition-colors"
            >
              Play Again
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
      <div className="font-mono text-lcars-amber text-xl">{value}</div>
    </div>
  );
}

export default VictoryScreen;
