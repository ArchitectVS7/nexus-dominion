import React from "react";
import ReactDOM from "react-dom/client";
import { GameStateProvider } from "./hooks/useGameState";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GameStateProvider>
      <App />
    </GameStateProvider>
  </React.StrictMode>,
);
