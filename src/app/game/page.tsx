export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">
        Empire Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resources Panel */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Resources
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>Credits: 100,000</p>
            <p>Food: 1,000</p>
            <p>Ore: 500</p>
            <p>Petroleum: 200</p>
            <p>Research Points: 0</p>
          </div>
        </div>

        {/* Population Panel */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Population
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>Citizens: 10,000</p>
            <p>Civil Status: Content</p>
            <p>Income Multiplier: 2x</p>
          </div>
        </div>

        {/* Military Panel */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Military
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>Soldiers: 100</p>
            <p>Fighters: 0</p>
            <p>Army Effectiveness: 85%</p>
          </div>
        </div>

        {/* Planets Panel */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Planets
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>Owned: 9</p>
            <p>Production: Active</p>
          </div>
        </div>

        {/* Research Panel */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Research
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>Fundamental Level: 0</p>
            <p>Points/Turn: 0</p>
          </div>
        </div>

        {/* Networth Panel */}
        <div className="lcars-panel">
          <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
            Networth
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>Total: 0</p>
            <p>Rank: --</p>
          </div>
        </div>
      </div>

      {/* End Turn Button */}
      <div className="mt-8 text-center">
        <button className="lcars-button text-lg px-12 py-3" disabled>
          END TURN (Coming in M2)
        </button>
      </div>
    </div>
  );
}
