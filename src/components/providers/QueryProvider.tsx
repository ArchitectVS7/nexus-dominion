"use client";

/**
 * React Query Provider
 *
 * Configures TanStack Query for the application with:
 * - Optimized stale times for game data
 * - Smart retry logic
 * - Error handling integration
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

/**
 * Create a QueryClient with game-optimized settings.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Game state should refresh frequently during active play
        staleTime: 30 * 1000, // 30 seconds
        // Cache data for 5 minutes (useful when switching between panels)
        gcTime: 5 * 60 * 1000,
        // Retry failed requests with exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && error.message.includes("4")) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Refetch when window regains focus (player returns to game)
        refetchOnWindowFocus: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
        // Keep previous data while fetching new data
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Client-side singleton
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return makeQueryClient();
  }

  // Browser: reuse client across renders
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Use useState to ensure stable client reference
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Export for testing and manual cache invalidation
 */
export function getGlobalQueryClient(): QueryClient | undefined {
  return browserQueryClient;
}
