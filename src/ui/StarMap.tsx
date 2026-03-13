/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Star Map Canvas Renderer
   
   Renders the galaxy as an interactive canvas:
   - Star system nodes (coloured by ownership)
   - Adjacency edges (faint lines)
   - Sector region hulls (translucent fills)
   - Selected system highlight ring + glow
   ══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Galaxy, StarSystem, SystemId, SectorId } from "../engine/types";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import { getEmpireColour } from "../engine/galaxy/galaxy-generator";
import "./StarMap.css";

interface StarMapProps {
    galaxy: Galaxy;
    /** ID of the player empire (coloured distinctly) */
    playerEmpireId?: string;
    /** Callback when a system is selected */
    onSelectSystem?: (systemId: SystemId | null) => void;
}

/* ── Node sizing constants ── */
const NODE_RADIUS = 5;
const NODE_RADIUS_HOME = 7;
const HIT_RADIUS = 14;
const SELECTED_RING = 12;

/* ── Colours ── */
const COLOUR_UNCLAIMED = "#4A5568";
const COLOUR_PLAYER = "#3498DB";
const COLOUR_EDGE = "rgba(255, 255, 255, 0.06)";
const COLOUR_SELECTED_RING = "#F4A629";
const SECTOR_FILL_ALPHA = 0.04;
const SECTOR_STROKE_ALPHA = 0.08;

const SECTOR_HUES = [
    210, 280, 45, 160, 330, 120, 20, 190, 60, 300,
];

export function StarMap({ galaxy, playerEmpireId, onSelectSystem }: StarMapProps) {
    const [selectedId, setSelectedId] = useState<SystemId | null>(null);

    // Precompute arrays for rendering
    const systems = useMemo(() => Array.from(galaxy.systems.values()), [galaxy]);
    const sectors = useMemo(() => Array.from(galaxy.sectors.values()), [galaxy]);

    // Compute convex hulls for sectors
    const sectorHulls = useMemo(() => {
        const hulls = new Map<string, { x: number; y: number }[]>();
        for (const sector of sectors) {
            const points = sector.systemIds
                .map((id) => galaxy.systems.get(id))
                .filter(Boolean)
                .map((s) => s!.position);
            if (points.length >= 3) {
                hulls.set(sector.id, computeConvexHull(points));
            }
        }
        return hulls;
    }, [sectors, galaxy]);

    const handleClick = useCallback(
        (worldX: number, worldY: number) => {
            // Find nearest system within hit radius
            let nearest: StarSystem | null = null;
            let nearestDist = Infinity;
            for (const sys of systems) {
                const d = Math.hypot(sys.position.x - worldX, sys.position.y - worldY);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearest = sys;
                }
            }

            if (nearest && nearestDist < HIT_RADIUS) {
                const newId = nearest.id === selectedId ? null : nearest.id;
                setSelectedId(newId);
                onSelectSystem?.(newId);
            } else {
                setSelectedId(null);
                onSelectSystem?.(null);
            }
        },
        [systems, selectedId, onSelectSystem],
    );

    const { canvasRef, camera, worldToScreen } = useCanvasInteraction(handleClick);

    // Render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;

        const render = () => {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;

            // Size canvas for DPR
            if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
                canvas.width = w * dpr;
                canvas.height = h * dpr;
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            // ── Sector regions ──
            let sectorIdx = 0;
            for (const [sectorId, hull] of sectorHulls) {
                const hue = SECTOR_HUES[sectorIdx % SECTOR_HUES.length];
                const screenHull = hull.map((p) => worldToScreen(p.x, p.y));

                // Expand hull slightly for padding
                const centre = {
                    x: screenHull.reduce((s, p) => s + p.x, 0) / screenHull.length,
                    y: screenHull.reduce((s, p) => s + p.y, 0) / screenHull.length,
                };

                ctx.beginPath();
                for (let i = 0; i < screenHull.length; i++) {
                    const p = screenHull[i];
                    // Expand outward from centre
                    const dx = p.x - centre.x;
                    const dy = p.y - centre.y;
                    const ex = p.x + dx * 0.15;
                    const ey = p.y + dy * 0.15;
                    if (i === 0) ctx.moveTo(ex, ey);
                    else ctx.lineTo(ex, ey);
                }
                ctx.closePath();
                ctx.fillStyle = `hsla(${hue}, 60%, 40%, ${SECTOR_FILL_ALPHA})`;
                ctx.fill();
                ctx.strokeStyle = `hsla(${hue}, 50%, 50%, ${SECTOR_STROKE_ALPHA})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Sector label
                const labelScreen = worldToScreen(
                    galaxy.sectors.get(sectorId as SectorId)?.centre.x ?? centre.x,
                    galaxy.sectors.get(sectorId as SectorId)?.centre.y ?? centre.y,
                );
                if (camera.zoom > 0.3) {
                    ctx.font = `${Math.max(9, 11 * camera.zoom)}px 'Orbitron', sans-serif`;
                    ctx.fillStyle = `hsla(${hue}, 40%, 60%, ${Math.min(0.5, camera.zoom * 0.4)})`;
                    ctx.textAlign = "center";
                    const sectorObj = galaxy.sectors.get(sectorId as SectorId);
                    ctx.fillText(
                        sectorObj?.name.toUpperCase() ?? "",
                        labelScreen.x,
                        labelScreen.y - 50 * camera.zoom,
                    );
                }

                sectorIdx++;
            }

            // ── Adjacency edges ──
            const drawnEdges = new Set<string>();
            for (const sys of systems) {
                for (const adjId of sys.adjacentSystemIds) {
                    const edgeKey = [sys.id, adjId].sort().join("-");
                    if (drawnEdges.has(edgeKey)) continue;
                    drawnEdges.add(edgeKey);

                    const adj = galaxy.systems.get(adjId);
                    if (!adj) continue;

                    const a = worldToScreen(sys.position.x, sys.position.y);
                    const b = worldToScreen(adj.position.x, adj.position.y);

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = COLOUR_EDGE;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            // ── System nodes ──
            for (const sys of systems) {
                const screen = worldToScreen(sys.position.x, sys.position.y);
                const isSelected = sys.id === selectedId;
                const radius = sys.isHomeSystem ? NODE_RADIUS_HOME : NODE_RADIUS;
                const screenRadius = radius * Math.max(0.6, Math.min(1.5, camera.zoom));

                // Colour
                let colour: string;
                if (!sys.owner) {
                    colour = COLOUR_UNCLAIMED;
                } else if (sys.owner === playerEmpireId) {
                    colour = COLOUR_PLAYER;
                } else {
                    colour = getEmpireColour(sys.owner);
                }

                // Selected glow
                if (isSelected) {
                    ctx.beginPath();
                    ctx.arc(screen.x, screen.y, SELECTED_RING * camera.zoom, 0, Math.PI * 2);
                    ctx.strokeStyle = COLOUR_SELECTED_RING;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = COLOUR_SELECTED_RING;
                    ctx.shadowBlur = 12;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }

                // Node circle
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, screenRadius, 0, Math.PI * 2);
                ctx.fillStyle = colour;
                ctx.fill();

                // Subtle glow for owned systems
                if (sys.owner) {
                    ctx.shadowColor = colour;
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.arc(screen.x, screen.y, screenRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Home system diamond marker
                if (sys.isHomeSystem && camera.zoom > 0.4) {
                    ctx.beginPath();
                    const d = screenRadius + 4;
                    ctx.moveTo(screen.x, screen.y - d);
                    ctx.lineTo(screen.x + d, screen.y);
                    ctx.lineTo(screen.x, screen.y + d);
                    ctx.lineTo(screen.x - d, screen.y);
                    ctx.closePath();
                    ctx.strokeStyle = colour;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.4;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }

                // System name (only at high zoom)
                if (camera.zoom > 1.2) {
                    ctx.font = `${Math.max(8, 9 * camera.zoom)}px 'Exo 2', sans-serif`;
                    ctx.fillStyle = "rgba(208, 216, 232, 0.7)";
                    ctx.textAlign = "center";
                    ctx.fillText(sys.name, screen.x, screen.y + screenRadius + 12);
                }
            }

            // ── HUD overlay ──
            ctx.font = "10px 'Orbitron', sans-serif";
            ctx.fillStyle = "rgba(107, 122, 148, 0.5)";
            ctx.textAlign = "left";
            ctx.fillText(
                `SYSTEMS: ${systems.length}  SECTORS: ${sectors.length}  ZOOM: ${camera.zoom.toFixed(1)}x`,
                12,
                h - 12,
            );

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [canvasRef, camera, systems, sectors, sectorHulls, selectedId, playerEmpireId, galaxy, worldToScreen]);

    // Selected system info bar
    const selectedSystem = selectedId ? galaxy.systems.get(selectedId) : null;

    return (
        <div className="starmap-container">
            <canvas ref={canvasRef} className="starmap-canvas" />
            {selectedSystem && (
                <div className="starmap-info">
                    <span className="starmap-info__name">{selectedSystem.name}</span>
                    <span className="starmap-info__biome">{selectedSystem.biome.replace(/-/g, " ")}</span>
                    <span className="starmap-info__owner">
                        {selectedSystem.owner
                            ? selectedSystem.owner === playerEmpireId
                                ? "Your Empire"
                                : `Empire ${selectedSystem.owner}`
                            : "Unclaimed"}
                    </span>
                    <span className="starmap-info__slots">
                        {selectedSystem.slots.filter((s) => !s.locked).length} slots
                    </span>
                </div>
            )}
        </div>
    );
}

/* ── Convex Hull (Andrew's Monotone Chain) ── */

function computeConvexHull(points: { x: number; y: number }[]): { x: number; y: number }[] {
    const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    if (pts.length <= 2) return pts;

    const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower: { x: number; y: number }[] = [];
    for (const p of pts) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }

    const upper: { x: number; y: number }[] = [];
    for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
}
