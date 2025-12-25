/**
 * Bot Empire Names
 *
 * Placeholder names for the 25 bot empires.
 * Uses Greek letters for consistent, memorable naming.
 */

export const BOT_EMPIRE_NAMES = [
  "Empire Alpha",
  "Empire Beta",
  "Empire Gamma",
  "Empire Delta",
  "Empire Epsilon",
  "Empire Zeta",
  "Empire Eta",
  "Empire Theta",
  "Empire Iota",
  "Empire Kappa",
  "Empire Lambda",
  "Empire Mu",
  "Empire Nu",
  "Empire Xi",
  "Empire Omicron",
  "Empire Pi",
  "Empire Rho",
  "Empire Sigma",
  "Empire Tau",
  "Empire Upsilon",
  "Empire Phi",
  "Empire Chi",
  "Empire Psi",
  "Empire Omega",
  "Empire Nexus",
] as const;

export const BOT_EMPEROR_NAMES = [
  "Commander Alpha",
  "Admiral Beta",
  "Warlord Gamma",
  "Lord Delta",
  "General Epsilon",
  "Captain Zeta",
  "Baron Eta",
  "Duke Theta",
  "Count Iota",
  "Overlord Kappa",
  "Marshal Lambda",
  "Regent Mu",
  "Viceroy Nu",
  "Chancellor Xi",
  "Prefect Omicron",
  "Tribune Pi",
  "Consul Rho",
  "Senator Sigma",
  "Emperor Tau",
  "Sovereign Upsilon",
  "Archon Phi",
  "Magistrate Chi",
  "Praetor Psi",
  "Imperator Omega",
  "Director Nexus",
] as const;

export type BotEmpireName = (typeof BOT_EMPIRE_NAMES)[number];
export type BotEmperorName = (typeof BOT_EMPEROR_NAMES)[number];

/**
 * Get a bot empire name by index.
 * Returns a unique name for each of the 25 bots.
 */
export function getBotEmpireName(index: number): string {
  if (index < 0 || index >= BOT_EMPIRE_NAMES.length) {
    // Fallback for additional bots beyond 25
    return `Empire ${index + 1}`;
  }
  return BOT_EMPIRE_NAMES[index] ?? `Empire ${index + 1}`;
}

/**
 * Get a bot emperor name by index.
 * Returns a unique name for each of the 25 bots.
 */
export function getBotEmperorName(index: number): string {
  if (index < 0 || index >= BOT_EMPEROR_NAMES.length) {
    // Fallback for additional bots beyond 25
    return `Commander ${index + 1}`;
  }
  return BOT_EMPEROR_NAMES[index] ?? `Commander ${index + 1}`;
}
