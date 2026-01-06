"use client";

/**
 * ARIA Live Region Announcer
 *
 * Provides a global way to announce messages to screen readers
 * without disrupting the visual UI. Useful for dynamic content
 * updates, status messages, and user feedback.
 *
 * Usage:
 * ```tsx
 * import { useAriaAnnouncer } from '@/components/game/AriaAnnouncer';
 *
 * function MyComponent() {
 *   const { announce } = useAriaAnnouncer();
 *
 *   const handleAction = () => {
 *     // ... do something
 *     announce('Action completed successfully', 'polite');
 *   };
 * }
 * ```
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AnnouncerContextValue {
  /** Announce a message to screen readers */
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

/**
 * Hook to access the announcer from any component
 */
export function useAriaAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error("useAriaAnnouncer must be used within AriaAnnouncerProvider");
  }
  return context;
}

interface Message {
  id: string;
  text: string;
  priority: "polite" | "assertive";
  timestamp: number;
}

/**
 * Provider component that manages ARIA live region announcements
 * Mount this once at the root of your application.
 */
export function AriaAnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessages, setPoliteMessages] = useState<Message[]>([]);
  const [assertiveMessages, setAssertiveMessages] = useState<Message[]>([]);

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const id = `${Date.now()}-${Math.random()}`;
    const newMessage: Message = {
      id,
      text: message,
      priority,
      timestamp: Date.now(),
    };

    if (priority === "assertive") {
      setAssertiveMessages((prev) => [...prev, newMessage]);
    } else {
      setPoliteMessages((prev) => [...prev, newMessage]);
    }

    // Clear message after 5 seconds to prevent accumulation
    setTimeout(() => {
      if (priority === "assertive") {
        setAssertiveMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        setPoliteMessages((prev) => prev.filter((m) => m.id !== id));
      }
    }, 5000);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Polite announcements - screen reader will announce when convenient */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessages.map((msg) => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>

      {/* Assertive announcements - screen reader interrupts to announce immediately */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessages.map((msg) => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>
    </AnnouncerContext.Provider>
  );
}

export default AriaAnnouncerProvider;
