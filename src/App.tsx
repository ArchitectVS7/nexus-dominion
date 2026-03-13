import { useMemo } from "react";
import { GalaxyGenerator } from "./engine/galaxy/galaxy-generator";
import { StarMap } from "./ui/StarMap";
import "./App.css";

const SEED = 42;
const PLAYER_EMPIRE_ID = "empire-0";

function App() {
  const galaxy = useMemo(() => {
    const gen = new GalaxyGenerator();
    return gen.generate({
      totalSystems: 250,
      sectorCount: 10,
      systemsPerSector: 25,
      empireCount: 100,
      seed: SEED,
    });
  }, []);



  return (
    <div className="shell">
      {/* LCARS accent bars */}
      <div className="lcars-bar top" />
      <div className="lcars-bar bottom" />
      <div className="lcars-bar side" />

      <StarMap
        galaxy={galaxy}
        playerEmpireId={PLAYER_EMPIRE_ID}
      />
    </div>
  );
}

export default App;
