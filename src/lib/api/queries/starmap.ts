"use client";

/**
 * Starmap Queries
 *
 * React Query hooks for starmap and galaxy data.
 */

import { useQuery } from "@tanstack/react-query";
import { starmapKeys } from "../query-keys";
import {
  getGalaxyViewDataAction,
  getStarmapDataAction,
  getTellsForPlayerAction,
  type GalaxyViewData,
  type StarmapData,
  type PlayerTellData,
} from "@/app/actions/starmap-actions";

// Re-export types
export type { GalaxyViewData, StarmapData, PlayerTellData };

/**
 * Hook to fetch galaxy view data with regions and empires.
 *
 * @example
 * const { data: galaxy, isLoading } = useGalaxyView();
 * galaxy?.regions.forEach(r => console.log(r.name));
 */
export function useGalaxyView() {
  return useQuery({
    queryKey: starmapKeys.galaxy(),
    queryFn: async (): Promise<GalaxyViewData | null> => {
      return getGalaxyViewDataAction();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch starmap data with empire positions.
 *
 * @example
 * const { data: starmap } = useStarmapData();
 * starmap?.empires.forEach(e => console.log(e.name));
 */
export function useStarmapData() {
  return useQuery({
    queryKey: starmapKeys.positions(),
    queryFn: async (): Promise<StarmapData | null> => {
      return getStarmapDataAction();
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch bot tells for the player.
 *
 * @example
 * const { data: tells } = useTellsForPlayer();
 * Object.entries(tells?.tellsByEmpire ?? {}).forEach(([id, tell]) => {
 *   console.log(id, tell.displayType);
 * });
 */
export function useTellsForPlayer() {
  return useQuery({
    queryKey: [...starmapKeys.all, "tells"],
    queryFn: async (): Promise<PlayerTellData | null> => {
      return getTellsForPlayerAction();
    },
    staleTime: 60 * 1000, // 1 minute - tells don't change frequently
  });
}
