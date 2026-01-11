"use client";

/**
 * Client-Side Providers Wrapper
 *
 * Wraps all client-side context providers for use in the root layout.
 * This allows server components to render while providing client contexts.
 *
 * Provider Order (outer to inner):
 * 1. QueryProvider - React Query for data fetching/caching
 * 2. AudioProvider - Audio context for game sounds
 */

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { AudioProvider } from "./AudioProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AudioProvider>{children}</AudioProvider>
    </QueryProvider>
  );
}
