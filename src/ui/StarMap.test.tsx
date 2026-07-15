// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { StarMap } from "./StarMap";
import type { Galaxy, StarSystem, Sector, SystemId, SectorId } from "../engine/types";

/**
 * Component-level coverage for the sector-select affordance (T-201).
 *
 * The pure geometry (`pointInPolygon`) is exercised in starmap-hit.test.ts.
 * This suite drives the real wiring end-to-end: it renders <StarMap/>, fakes
 * the canvas bounding rect so screen→world resolution is deterministic, then
 * simulates a click (mousedown → mouseup with no drag) and asserts that the
 * onSelectSector callback fires with the right SectorId for a click inside a
 * sector hull and with null for a click outside every hull.
 */

const SECTOR_ID = "sector-0" as SectorId;

/** Build a minimal StarSystem with just the fields StarMap reads. */
function makeSystem(id: string, x: number, y: number): StarSystem {
  return {
    id: id as SystemId,
    name: id,
    sectorId: SECTOR_ID,
    position: { x, y },
    biome: "temperate-world",
    owner: null,
    isHomeSystem: false,
    adjacentSystemIds: [],
    slots: [],
  } as unknown as StarSystem;
}

/**
 * One sector whose four systems form a 200×200 square hull centred on the
 * world origin: corners at (±100, ±100). The interior (e.g. the origin) is
 * inside the hull but far (>HIT_RADIUS) from any system node.
 */
function makeGalaxy(): Galaxy {
  const systems = new Map<SystemId, StarSystem>();
  for (const [id, x, y] of [
    ["sys-nw", -100, -100],
    ["sys-ne", 100, -100],
    ["sys-se", 100, 100],
    ["sys-sw", -100, 100],
  ] as const) {
    const s = makeSystem(id, x, y);
    systems.set(s.id, s);
  }

  const sector: Sector = {
    id: SECTOR_ID,
    name: "Sector Zero",
    systemIds: Array.from(systems.keys()),
    centre: { x: 0, y: 0 },
  };

  return {
    systems,
    sectors: new Map<SectorId, Sector>([[SECTOR_ID, sector]]),
  };
}

/**
 * Camera defaults to { x: 0, y: 0, zoom: 0.8 } and screenToWorld uses the
 * canvas bounding rect, so with a 800×600 rect anchored at (0,0):
 *   worldX = (screenX - width/2) / zoom
 *   worldY = (screenY - height/2) / zoom
 * Invert it to place a click at a chosen world coordinate.
 */
const RECT = { left: 0, top: 0, width: 800, height: 600 };
const ZOOM = 0.8;
function worldToClient(wx: number, wy: number): { clientX: number; clientY: number } {
  return {
    clientX: wx * ZOOM + RECT.width / 2 + RECT.left,
    clientY: wy * ZOOM + RECT.height / 2 + RECT.top,
  };
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    ...RECT,
    right: RECT.left + RECT.width,
    bottom: RECT.top + RECT.height,
    x: RECT.left,
    y: RECT.top,
    toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Simulate a full click (down then up, no drag) at a world coordinate. */
function clickWorld(canvas: HTMLCanvasElement, wx: number, wy: number) {
  const { clientX, clientY } = worldToClient(wx, wy);
  fireEvent.mouseDown(canvas, { clientX, clientY });
  // mouseup is bound to window in useCanvasInteraction.
  fireEvent.mouseUp(window, { clientX, clientY });
}

describe("StarMap sector-select affordance", () => {
  it("fires onSelectSector with the sector id when empty space inside a sector hull is clicked", () => {
    const onSelectSector = vi.fn();
    const onSelectSystem = vi.fn();
    const { container } = render(
      <StarMap
        galaxy={makeGalaxy()}
        onSelectSector={onSelectSector}
        onSelectSystem={onSelectSystem}
      />,
    );
    const canvas = container.querySelector("canvas")!;
    expect(canvas).toBeTruthy();

    // World origin: inside the ±100 square hull, ~141 units from any node
    // (well outside HIT_RADIUS), so it is a sector hit, not a system hit.
    clickWorld(canvas, 0, 0);

    expect(onSelectSector).toHaveBeenCalledTimes(1);
    expect(onSelectSector).toHaveBeenCalledWith(SECTOR_ID);
    // A hull hit is a system miss, so the selected system is cleared.
    expect(onSelectSystem).toHaveBeenLastCalledWith(null);
  });

  it("fires onSelectSector with null when the click lands outside every sector hull", () => {
    const onSelectSector = vi.fn();
    const { container } = render(
      <StarMap galaxy={makeGalaxy()} onSelectSector={onSelectSector} />,
    );
    const canvas = container.querySelector("canvas")!;

    // Well outside the ±100 hull.
    clickWorld(canvas, 500, 500);

    expect(onSelectSector).toHaveBeenCalledTimes(1);
    expect(onSelectSector).toHaveBeenCalledWith(null);
  });

  it("selects the system (not a sector) when a system node is clicked", () => {
    const onSelectSector = vi.fn();
    const onSelectSystem = vi.fn();
    const { container } = render(
      <StarMap
        galaxy={makeGalaxy()}
        onSelectSector={onSelectSector}
        onSelectSystem={onSelectSystem}
      />,
    );
    const canvas = container.querySelector("canvas")!;

    // Click directly on the NW node's world position (within HIT_RADIUS).
    clickWorld(canvas, -100, -100);

    expect(onSelectSystem).toHaveBeenCalledTimes(1);
    expect(onSelectSystem).toHaveBeenCalledWith("sys-nw" as SystemId);
    // A system hit returns early — the sector callback must not fire.
    expect(onSelectSector).not.toHaveBeenCalled();
  });
});
