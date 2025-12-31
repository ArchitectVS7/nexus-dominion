/**
 * Type declarations for personas.json
 */

export interface BotPersona {
  id: string;
  name: string;
  emperorName: string;
  archetype: string;
  tier: number;
  voice: {
    tone: string;
    quirks: string[];
    vocabulary: string[];
    catchphrase: string;
  };
  tellRate: number;
  llmEnabled?: boolean;
}

declare const personas: BotPersona[];
export default personas;
