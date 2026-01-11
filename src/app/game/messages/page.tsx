"use client";

/**
 * Messages Page
 *
 * Displays inbox messages and galactic news feed.
 * Uses React Query for data fetching.
 */

import { useTurnStatus } from "@/lib/api";
import { useState } from "react";

type TabType = "inbox" | "news";

export default function MessagesPage() {
  const { data: turnStatus, isLoading } = useTurnStatus();
  const [activeTab, setActiveTab] = useState<TabType>("inbox");

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto" data-testid="messages-page">
        <h1 className="text-3xl font-display text-lcars-amber mb-8">Messages</h1>
        <div className="lcars-panel animate-pulse">
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  const currentTurn = turnStatus?.currentTurn ?? 1;

  // Mock news items - would come from actual data in Phase 3
  const newsItems = [
    {
      id: "1",
      headline: "Welcome to the Galaxy",
      content:
        "Your empire has been established. Expand your territory and dominate the stars.",
      turn: 1,
      type: "system" as const,
    },
    {
      id: "2",
      headline: "Galactic Council Formed",
      content:
        "The major empires have established diplomatic channels for trade and treaties.",
      turn: 1,
      type: "news" as const,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto" data-testid="messages-page">
      <h1 className="text-3xl font-display text-lcars-amber mb-8">Messages</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("inbox")}
          data-testid="messages-tab-inbox"
          className={`px-6 py-3 rounded-t font-medium transition-colors ${
            activeTab === "inbox"
              ? "bg-lcars-amber text-black"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setActiveTab("news")}
          data-testid="messages-tab-news"
          className={`px-6 py-3 rounded-t font-medium transition-colors ${
            activeTab === "news"
              ? "bg-lcars-amber text-black"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Galactic News
        </button>
      </div>

      {/* Tab Content */}
      <div className="border-t-4 border-lcars-amber pt-6">
        {activeTab === "inbox" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inbox */}
            <div className="lcars-panel">
              <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
                Inbox
              </h2>
              <div className="space-y-2">
                <p className="text-gray-500 text-sm">No new messages</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
                  Compose New Message
                </button>
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Messaging will be implemented in Phase 3
                </p>
              </div>
            </div>

            {/* Combat Reports */}
            <div className="lcars-panel">
              <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
                Combat Reports
              </h2>
              <p className="text-gray-500 text-sm">No recent combat</p>
            </div>

            {/* Diplomatic Notifications */}
            <div className="lcars-panel lg:col-span-2">
              <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
                Diplomatic Activity
              </h2>
              <p className="text-gray-500 text-sm">No pending treaty proposals</p>
            </div>
          </div>
        ) : (
          <div className="lcars-panel">
            <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
              Galactic News
            </h2>
            <div className="space-y-3">
              {newsItems.map((item) => (
                <NewsCard key={item.id} item={item} currentTurn={currentTurn} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Info */}
      <div className="mt-6 lcars-panel">
        <h2 className="text-lg font-semibold text-lcars-lavender mb-4">
          Communication System
        </h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            Stay informed about galactic events and communicate with other
            empires.
          </p>
          <p>
            <span className="text-blue-400">Messages</span> can be used for
            diplomacy or threats.
          </p>
          <p>
            <span className="text-red-400">Combat reports</span> detail the
            results of recent battles.
          </p>
        </div>
      </div>
    </div>
  );
}

function NewsCard({
  item,
  currentTurn,
}: {
  item: {
    id: string;
    headline: string;
    content: string;
    turn: number;
    type: "system" | "news" | "combat";
  };
  currentTurn: number;
}) {
  const turnsAgo = currentTurn - item.turn;
  const timeLabel = turnsAgo === 0 ? "This turn" : `${turnsAgo} turns ago`;

  return (
    <div
      className={`p-3 rounded border ${
        item.type === "system"
          ? "bg-blue-900/20 border-blue-700/50"
          : item.type === "combat"
          ? "bg-red-900/20 border-red-700/50"
          : "bg-gray-800/50 border-gray-700"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-lcars-amber font-medium">{item.headline}</span>
        <span className="text-xs text-gray-500">{timeLabel}</span>
      </div>
      <p className="text-sm text-gray-400">{item.content}</p>
    </div>
  );
}
