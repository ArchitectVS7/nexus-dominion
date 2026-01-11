/**
 * Query Keys Factory
 *
 * Centralized query key definitions for React Query.
 * Using a factory pattern ensures type safety and consistent key structures.
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

/**
 * Game-related query keys
 */
export const gameKeys = {
  /** Base key for all game queries */
  all: ["game"] as const,

  /** Layout data for the game shell/dashboard */
  layout: () => [...gameKeys.all, "layout"] as const,

  /** Dashboard data (detailed empire info) */
  dashboard: () => [...gameKeys.all, "dashboard"] as const,

  /** Turn status */
  turn: () => [...gameKeys.all, "turn"] as const,

  /** Game result (victory/defeat) */
  result: () => [...gameKeys.all, "result"] as const,

  /** Resumable campaigns list */
  resumable: () => [...gameKeys.all, "resumable"] as const,
};

/**
 * Empire-related query keys
 */
export const empireKeys = {
  /** Base key for all empire queries */
  all: ["empire"] as const,

  /** Specific empire by ID */
  detail: (empireId: string) => [...empireKeys.all, empireId] as const,

  /** Empire resources */
  resources: (empireId: string) => [...empireKeys.detail(empireId), "resources"] as const,

  /** Empire military */
  military: (empireId: string) => [...empireKeys.detail(empireId), "military"] as const,

  /** Empire sectors */
  sectors: (empireId: string) => [...empireKeys.detail(empireId), "sectors"] as const,
};

/**
 * Combat-related query keys
 */
export const combatKeys = {
  /** Base key for all combat queries */
  all: ["combat"] as const,

  /** Available targets for attack */
  targets: () => [...combatKeys.all, "targets"] as const,

  /** Combat preview (projected outcome) */
  preview: (targetId: string) => [...combatKeys.all, "preview", targetId] as const,

  /** Combat history */
  history: () => [...combatKeys.all, "history"] as const,

  /** Specific battle result */
  battle: (attackId: string) => [...combatKeys.all, "battle", attackId] as const,
};

/**
 * Market-related query keys
 */
export const marketKeys = {
  /** Base key for all market queries */
  all: ["market"] as const,

  /** Current market prices */
  prices: () => [...marketKeys.all, "prices"] as const,

  /** Market history */
  history: () => [...marketKeys.all, "history"] as const,
};

/**
 * Research-related query keys
 */
export const researchKeys = {
  /** Base key for all research queries */
  all: ["research"] as const,

  /** Research status and progress */
  status: () => [...researchKeys.all, "status"] as const,

  /** Research tree */
  tree: () => [...researchKeys.all, "tree"] as const,

  /** Available upgrades */
  upgrades: () => [...researchKeys.all, "upgrades"] as const,
};

/**
 * Diplomacy-related query keys
 */
export const diplomacyKeys = {
  /** Base key for all diplomacy queries */
  all: ["diplomacy"] as const,

  /** Active treaties */
  treaties: () => [...diplomacyKeys.all, "treaties"] as const,

  /** Pending proposals */
  proposals: () => [...diplomacyKeys.all, "proposals"] as const,

  /** Reputation with empires */
  reputation: () => [...diplomacyKeys.all, "reputation"] as const,
};

/**
 * Messages-related query keys
 */
export const messageKeys = {
  /** Base key for all message queries */
  all: ["messages"] as const,

  /** Inbox messages */
  inbox: () => [...messageKeys.all, "inbox"] as const,

  /** Unread count */
  unread: () => [...messageKeys.all, "unread"] as const,

  /** Galactic news */
  news: () => [...messageKeys.all, "news"] as const,
};

/**
 * Starmap-related query keys
 */
export const starmapKeys = {
  /** Base key for all starmap queries */
  all: ["starmap"] as const,

  /** Galaxy view data */
  galaxy: () => [...starmapKeys.all, "galaxy"] as const,

  /** Sector detail */
  sector: (sectorId: string) => [...starmapKeys.all, "sector", sectorId] as const,

  /** Empire positions */
  positions: () => [...starmapKeys.all, "positions"] as const,
};

/**
 * Build queue-related query keys
 */
export const buildKeys = {
  /** Base key for all build queries */
  all: ["build"] as const,

  /** Current build queue */
  queue: () => [...buildKeys.all, "queue"] as const,

  /** Available units to build */
  available: () => [...buildKeys.all, "available"] as const,
};
