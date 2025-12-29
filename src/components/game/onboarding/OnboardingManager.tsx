"use client";

/**
 * Onboarding Manager
 *
 * Orchestrates the onboarding experience for new players.
 * Shows contextual hints during the first 5 turns.
 *
 * Philosophy: Non-intrusive, helpful, skippable.
 * - Hints appear once per trigger (turn or action)
 * - Players can dismiss individually or disable all
 * - Hints are saved in localStorage so they don't repeat
 */

import { useState, useEffect } from "react";
import { OnboardingHint } from "./OnboardingHint";

interface OnboardingManagerProps {
  currentTurn: number;
}

// Define all onboarding hints
const ONBOARDING_HINTS = [
  // Turn 1: Welcome and orientation
  {
    id: "welcome",
    turnToShow: 1,
    title: "Welcome to X-Imperium!",
    message:
      "You command a fledgling space empire. Your goal: survive, expand, and dominate. Start by exploring the menu to see your resources and military.",
    icon: "🚀",
    position: "top" as const,
    action: { label: "Show me around", href: "/game" },
  },
  {
    id: "turn-panel",
    turnToShow: 1,
    title: "Your Turn Order",
    message:
      "The panel on the right tracks your turn. Visit different sections to take actions, then click END TURN when ready. You're protected from attacks for the first 20 turns.",
    icon: "📋",
    position: "bottom" as const,
  },

  // Turn 2: Resources and growth
  {
    id: "resources",
    turnToShow: 2,
    title: "Understanding Resources",
    message:
      "Credits fund everything. Food feeds your population. Ore and Petroleum are for advanced units. Watch your food - starving citizens rebel!",
    icon: "💰",
    position: "top" as const,
    action: { label: "View Resources", href: "/game" },
  },

  // Turn 3: Military and defense
  {
    id: "military",
    turnToShow: 3,
    title: "Build Your Defenses",
    message:
      "Protection ends at Turn 20. Start building soldiers and fighters now. Visit Military to queue construction. Units cost credits but provide security.",
    icon: "⚔️",
    position: "top" as const,
    action: { label: "Go to Military", href: "/game/military" },
  },

  // Turn 4: Expansion
  {
    id: "expansion",
    turnToShow: 4,
    title: "Grow Your Empire",
    message:
      "More planets = more resources. Visit Planets to buy new territories. Different planet types produce different resources. Balance is key!",
    icon: "🌍",
    position: "top" as const,
    action: { label: "Buy Planets", href: "/game/planets" },
  },

  // Turn 5: Rivals and strategy
  {
    id: "rivals",
    turnToShow: 5,
    title: "Know Your Rivals",
    message:
      "25 AI empires compete with you. Check Messages for communications. Watch the Galaxy map for threats. Some empires are friendly, others... not so much.",
    icon: "👁️",
    position: "top" as const,
    action: { label: "View Galaxy", href: "/game/starmap" },
  },
];

const STORAGE_KEY_DISABLED = "x-imperium-onboarding-disabled";

export function OnboardingManager({ currentTurn }: OnboardingManagerProps) {
  const [isOnboardingDisabled, setIsOnboardingDisabled] = useState(false);

  useEffect(() => {
    // Check if onboarding is disabled
    const disabled = localStorage.getItem(STORAGE_KEY_DISABLED) === "true";
    setIsOnboardingDisabled(disabled);
  }, []);

  const handleDisableAll = () => {
    localStorage.setItem(STORAGE_KEY_DISABLED, "true");
    setIsOnboardingDisabled(true);
  };

  if (isOnboardingDisabled) return null;

  // Only show hints for turns 1-5
  if (currentTurn > 5) return null;

  // Get hints for current turn
  const currentHints = ONBOARDING_HINTS.filter((h) => h.turnToShow === currentTurn);

  if (currentHints.length === 0) return null;

  return (
    <>
      {/* Render hints */}
      {currentHints.map((hint) => (
        <OnboardingHint
          key={hint.id}
          hintId={hint.id}
          title={hint.title}
          message={hint.message}
          turnToShow={hint.turnToShow}
          currentTurn={currentTurn}
          position={hint.position}
          icon={hint.icon}
          action={hint.action}
        />
      ))}

      {/* Disable all option (shown on turn 1 only) */}
      {currentTurn === 1 && (
        <div className="fixed bottom-4 right-80 z-40">
          <button
            onClick={handleDisableAll}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors bg-gray-900/50 px-2 py-1 rounded"
          >
            Skip all tutorials
          </button>
        </div>
      )}
    </>
  );
}

export default OnboardingManager;
