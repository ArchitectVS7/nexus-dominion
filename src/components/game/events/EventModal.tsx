"use client";

/**
 * Event Modal Component (Phase 2.2)
 *
 * Displays forced-choice events with dramatic presentation.
 * Events trigger every 10-15 turns and require player decisions.
 *
 * Based on: docs/redesign-01-02-2026/RESEARCH-REDESIGN.md Phase 2 (Dramatic Moments)
 */

import { useState } from "react";
import {
  type ForcedChoiceEvent,
  type EventChoice,
  FORCED_EVENT_TEMPLATES,
} from "@/lib/game/constants/forced-events";
import { AlertTriangle, Coins, Map, Users, X } from "lucide-react";

interface EventModalProps {
  event: ForcedChoiceEvent;
  playerCredits: number;
  playerSectors: number;
  onChoice: (choice: EventChoice) => Promise<void>;
  onDismiss?: () => void;
}

export function EventModal({
  event,
  playerCredits,
  playerSectors,
  onChoice,
  onDismiss,
}: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);

  const handleChoice = async (choice: EventChoice) => {
    setIsSubmitting(true);
    setSelectedChoice(choice);
    try {
      await onChoice(choice);
    } finally {
      setIsSubmitting(false);
      setSelectedChoice(null);
    }
  };

  const canAfford = (choice: EventChoice): boolean => {
    if (!choice.cost) return true;
    if (choice.cost.credits && playerCredits < choice.cost.credits) return false;
    if (choice.cost.sectors && playerSectors < choice.cost.sectors) return false;
    return true;
  };

  const getEventIcon = () => {
    switch (event.type) {
      case "pirate_armada":
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case "market_crash":
        return <Coins className="w-12 h-12 text-yellow-500" />;
      case "border_dispute":
        return <Map className="w-12 h-12 text-orange-500" />;
      case "coalition_forming":
        return <Users className="w-12 h-12 text-blue-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-lcars-amber" />;
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case "pirate_armada":
        return "border-red-500 bg-red-900/30";
      case "market_crash":
        return "border-yellow-500 bg-yellow-900/30";
      case "border_dispute":
        return "border-orange-500 bg-orange-900/30";
      case "coalition_forming":
        return "border-blue-500 bg-blue-900/30";
      default:
        return "border-lcars-amber bg-black/50";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`relative max-w-2xl w-full mx-4 rounded-lg border-2 ${getEventColor()} shadow-2xl`}
        data-testid="event-modal"
      >
        {/* Close button (only if dismissible) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss event"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="p-6 pb-4 flex items-center gap-4 border-b border-gray-700">
          {getEventIcon()}
          <div>
            <h2 className="text-2xl font-display text-white tracking-wide">
              {event.title}
            </h2>
            {event.turn && (
              <p className="text-sm text-gray-400">Cycle {event.turn}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-700">
          <p className="text-gray-200 leading-relaxed">{event.description}</p>
        </div>

        {/* Choices */}
        <div className="p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Choose Your Response
          </h3>
          {event.choices.map((choice, index) => {
            const affordable = canAfford(choice);
            const isSelected = selectedChoice === choice;

            return (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                disabled={isSubmitting || !affordable}
                className={`w-full text-left p-4 rounded border-2 transition-all ${
                  affordable
                    ? isSelected
                      ? "border-lcars-amber bg-lcars-amber/20"
                      : "border-gray-600 hover:border-lcars-amber hover:bg-black/40"
                    : "border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed"
                }`}
                data-testid={`event-choice-${index}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">
                      {choice.label}
                    </div>
                    <div className="text-sm text-gray-400">
                      {choice.description}
                    </div>
                  </div>

                  {/* Cost display */}
                  {choice.cost && (
                    <div className="ml-4 text-right">
                      {choice.cost.credits && (
                        <div
                          className={`text-sm ${
                            playerCredits >= choice.cost.credits
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          -{choice.cost.credits.toLocaleString()} MC
                        </div>
                      )}
                      {choice.cost.sectors && (
                        <div
                          className={`text-sm ${
                            playerSectors >= choice.cost.sectors
                              ? "text-blue-400"
                              : "text-red-400"
                          }`}
                        >
                          -{choice.cost.sectors} Sectors
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!affordable && (
                  <div className="mt-2 text-xs text-red-400">
                    Insufficient resources
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/30 rounded-b-lg border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            This event requires a decision. Choose wisely - your choice cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Demo/Preview component for testing event UI
 */
export function EventModalPreview() {
  const [showEvent, setShowEvent] = useState<ForcedChoiceEvent | null>(null);

  const previewEvent = (type: keyof typeof FORCED_EVENT_TEMPLATES) => {
    const template = FORCED_EVENT_TEMPLATES[type];
    setShowEvent({
      ...template,
      id: `preview_${type}_${Date.now()}`,
      turn: 42,
    });
  };

  const handleChoice = async (choice: EventChoice) => {
    console.log("Event choice selected:", choice);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowEvent(null);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-white">Event Modal Preview</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => previewEvent("pirate_armada")}
          className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800"
        >
          Pirate Armada
        </button>
        <button
          onClick={() => previewEvent("market_crash")}
          className="px-4 py-2 bg-yellow-900 text-white rounded hover:bg-yellow-800"
        >
          Market Crash
        </button>
        <button
          onClick={() => previewEvent("border_dispute")}
          className="px-4 py-2 bg-orange-900 text-white rounded hover:bg-orange-800"
        >
          Border Dispute
        </button>
        <button
          onClick={() => previewEvent("coalition_forming")}
          className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
        >
          Coalition Forming
        </button>
      </div>

      {showEvent && (
        <EventModal
          event={showEvent}
          playerCredits={100000}
          playerSectors={25}
          onChoice={handleChoice}
          onDismiss={() => setShowEvent(null)}
        />
      )}
    </div>
  );
}
