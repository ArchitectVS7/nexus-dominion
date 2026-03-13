/* ══════════════════════════════════════════════════════════════
   Nexus Dominion — Canvas Interaction Hook
   
   Provides pan, zoom, and click-to-select for the star map.
   All coordinates are tracked in world space with a camera
   transform applied for rendering.
   ══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";

export interface Camera {
    x: number;       // World-space centre X
    y: number;       // World-space centre Y
    zoom: number;    // Scale factor (1.0 = default)
}

interface CanvasInteraction {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    camera: Camera;
    /** Convert screen coords to world coords */
    screenToWorld: (sx: number, sy: number) => { x: number; y: number };
    /** Convert world coords to screen coords */
    worldToScreen: (wx: number, wy: number) => { x: number; y: number };
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 4.0;
const ZOOM_SPEED = 0.001;

export function useCanvasInteraction(
    onClickWorld?: (worldX: number, worldY: number) => void,
): CanvasInteraction {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 0.8 });

    // Refs for drag state (no re-renders during drag)
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const cameraAtDragStart = useRef({ x: 0, y: 0 });
    const dragMoved = useRef(false);

    const screenToWorld = useCallback(
        (sx: number, sy: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            return {
                x: (sx - rect.left - cx) / camera.zoom + camera.x,
                y: (sy - rect.top - cy) / camera.zoom + camera.y,
            };
        },
        [camera],
    );

    const worldToScreen = useCallback(
        (wx: number, wy: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            return {
                x: (wx - camera.x) * camera.zoom + cx,
                y: (wy - camera.y) * camera.zoom + cy,
            };
        },
        [camera],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onMouseDown = (e: MouseEvent) => {
            isDragging.current = true;
            dragMoved.current = false;
            dragStart.current = { x: e.clientX, y: e.clientY };
            cameraAtDragStart.current = { x: camera.x, y: camera.y };
            canvas.style.cursor = "grabbing";
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                dragMoved.current = true;
            }
            setCamera((prev) => ({
                ...prev,
                x: cameraAtDragStart.current.x - dx / prev.zoom,
                y: cameraAtDragStart.current.y - dy / prev.zoom,
            }));
        };

        const onMouseUp = (e: MouseEvent) => {
            isDragging.current = false;
            canvas.style.cursor = "grab";
            if (!dragMoved.current && onClickWorld) {
                const world = screenToWorld(e.clientX, e.clientY);
                onClickWorld(world.x, world.y);
            }
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setCamera((prev) => {
                const factor = 1 - e.deltaY * ZOOM_SPEED;
                const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom * factor));
                return { ...prev, zoom: newZoom };
            });
        };

        canvas.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });

        canvas.style.cursor = "grab";

        return () => {
            canvas.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            canvas.removeEventListener("wheel", onWheel);
        };
    }, [camera, screenToWorld, onClickWorld]);

    return { canvasRef, camera, screenToWorld, worldToScreen };
}
