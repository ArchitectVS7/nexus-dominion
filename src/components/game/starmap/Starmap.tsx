"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3-force";
import type { EmpireMapData, StarmapProps, TooltipData } from "./types";
import { EmpireTooltip } from "./EmpireTooltip";

// Calculate node size based on planet count
function getNodeSize(planetCount: number): number {
  return Math.max(20, Math.min(50, 15 + planetCount * 2));
}

// Get node color based on empire type and status
function getNodeColor(empire: EmpireMapData, isPlayer: boolean): string {
  if (empire.isEliminated) return "#6b7280"; // gray-500
  if (isPlayer) return "#3b82f6"; // blue-500
  return "#ef4444"; // red-500
}

export function Starmap({
  empires,
  playerEmpireId,
  currentTurn,
  protectionTurns,
  width = 800,
  height = 600,
}: StarmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [nodes, setNodes] = useState<EmpireMapData[]>([]);
  const simulationRef = useRef<d3.Simulation<EmpireMapData, undefined> | null>(null);

  const isProtected = currentTurn <= protectionTurns;

  // Initialize nodes with positions
  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;

    const initializedNodes = empires.map((empire, index) => {
      const isPlayer = empire.id === playerEmpireId;
      const angle = (index / empires.length) * 2 * Math.PI;
      const radius = isPlayer ? 0 : 150 + Math.random() * 100;

      return {
        ...empire,
        x: centerX + (isPlayer ? 0 : Math.cos(angle) * radius),
        y: centerY + (isPlayer ? 0 : Math.sin(angle) * radius),
        fx: isPlayer ? centerX : null,
        fy: isPlayer ? centerY : null,
      };
    });

    setNodes(initializedNodes);
  }, [empires, playerEmpireId, width, height]);

  // Setup force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;

    // Create simulation
    const simulation = d3
      .forceSimulation<EmpireMapData>(nodes)
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(centerX, centerY))
      .force(
        "collision",
        d3.forceCollide<EmpireMapData>().radius((d) => getNodeSize(d.planetCount) + 5)
      )
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .alphaDecay(0.02);

    simulation.on("tick", () => {
      setNodes([...simulation.nodes()]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, width, height]);

  // Handle node hover
  const handleMouseEnter = useCallback(
    (empire: EmpireMapData, event: React.MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          empire,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Handle drag
  const handleDragStart = useCallback(
    (empire: EmpireMapData) => {
      if (!simulationRef.current) return;
      simulationRef.current.alphaTarget(0.3).restart();
      const node = nodes.find((n) => n.id === empire.id);
      if (node) {
        node.fx = node.x;
        node.fy = node.y;
      }
    },
    [nodes]
  );

  const handleDrag = useCallback(
    (empire: EmpireMapData, event: React.MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const node = nodes.find((n) => n.id === empire.id);
      if (node) {
        node.fx = event.clientX - rect.left;
        node.fy = event.clientY - rect.top;
        setNodes([...nodes]);
      }
    },
    [nodes]
  );

  const handleDragEnd = useCallback(
    (empire: EmpireMapData) => {
      if (!simulationRef.current) return;
      simulationRef.current.alphaTarget(0);
      const node = nodes.find((n) => n.id === empire.id);
      if (node && node.id !== playerEmpireId) {
        node.fx = null;
        node.fy = null;
      }
    },
    [nodes, playerEmpireId]
  );

  return (
    <div className="relative" data-testid="starmap">
      {/* Legend */}
      <div className="absolute top-2 left-2 bg-gray-900/80 p-3 rounded-lg text-sm space-y-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span className="text-gray-300">Your Empire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-gray-300">Bot Empire</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500" />
          <span className="text-gray-300">Eliminated</span>
        </div>
        {isProtected && (
          <div className="text-yellow-400 text-xs pt-2 border-t border-gray-700">
            Protection Period: {protectionTurns - currentTurn + 1} turns left
          </div>
        )}
      </div>

      {/* Empire count */}
      <div className="absolute top-2 right-2 bg-gray-900/80 p-3 rounded-lg text-sm z-10">
        <div className="text-gray-400">Empires</div>
        <div className="text-2xl font-bold text-lcars-amber">
          {empires.filter((e) => !e.isEliminated).length}/{empires.length}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-900/50 rounded-lg border border-gray-800"
      >
        {/* Stars background */}
        <defs>
          <pattern id="stars" patternUnits="userSpaceOnUse" width="100" height="100">
            {[...Array(10)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 100}
                cy={Math.random() * 100}
                r={Math.random() * 1.5}
                fill="white"
                opacity={Math.random() * 0.5 + 0.2}
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)" opacity="0.3" />

        {/* Empire nodes */}
        {nodes.map((empire) => {
          const isPlayer = empire.id === playerEmpireId;
          const size = getNodeSize(empire.planetCount);
          const color = getNodeColor(empire, isPlayer);

          return (
            <g
              key={empire.id}
              transform={`translate(${empire.x ?? 0}, ${empire.y ?? 0})`}
              className="cursor-pointer transition-transform hover:scale-110"
              onMouseEnter={(e) => handleMouseEnter(empire, e)}
              onMouseLeave={handleMouseLeave}
              onMouseDown={() => handleDragStart(empire)}
              onMouseMove={(e) => e.buttons === 1 && handleDrag(empire, e)}
              onMouseUp={() => handleDragEnd(empire)}
            >
              {/* Glow effect for player */}
              {isPlayer && !empire.isEliminated && (
                <circle r={size + 10} fill={color} opacity={0.2} />
              )}

              {/* Main circle */}
              <circle
                r={size}
                fill={color}
                opacity={empire.isEliminated ? 0.4 : 0.8}
                stroke={isPlayer ? "#60a5fa" : empire.isEliminated ? "#374151" : "#dc2626"}
                strokeWidth={isPlayer ? 3 : 2}
              />

              {/* Empire label (short name) */}
              <text
                textAnchor="middle"
                dy="0.35em"
                fill="white"
                fontSize={Math.max(10, size / 3)}
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {empire.name.split(" ")[1]?.slice(0, 2) ?? empire.name.slice(0, 2)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <EmpireTooltip
          empire={tooltip.empire}
          isProtected={isProtected}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  );
}

export default Starmap;
