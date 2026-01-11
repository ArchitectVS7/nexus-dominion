"use client";

/**
 * Research Panel
 *
 * Displays research tree and progress.
 */

export function ResearchPanel() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Research Progress
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-gray-500">Research interface coming in Phase 3</p>
        </div>
      </section>

      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Available Technologies
        </h3>
        <div className="space-y-2">
          {["Weapons", "Defense", "Economy", "Espionage"].map((branch) => (
            <div
              key={branch}
              className="p-3 bg-gray-800/50 rounded border border-gray-700"
            >
              <div className="text-lcars-amber">{branch}</div>
              <div className="text-xs text-gray-500">Level 0</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ResearchPanel;
