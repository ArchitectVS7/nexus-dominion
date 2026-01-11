"use client";

/**
 * Messages Panel
 *
 * Displays inbox messages and galactic news feed.
 * Uses React Query for data fetching.
 */

export function MessagesPanel() {
  return (
    <div className="space-y-6">
      {/* Inbox */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Inbox
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-gray-500 text-sm">No messages</p>
        </div>
      </section>

      {/* Galactic News */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Galactic News
        </h3>
        <div className="space-y-2">
          <NewsItem
            headline="Welcome to the Galaxy"
            content="Your empire has been established. Expand your territory and dominate the stars."
            turn={1}
          />
        </div>
      </section>

      {/* Combat Reports - Placeholder */}
      <section>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Combat Reports
        </h3>
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-gray-500 text-sm">No recent combat</p>
        </div>
      </section>
    </div>
  );
}

function NewsItem({
  headline,
  content,
  turn,
}: {
  headline: string;
  content: string;
  turn: number;
}) {
  return (
    <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
      <div className="flex justify-between items-start">
        <div className="text-lcars-amber font-medium">{headline}</div>
        <div className="text-xs text-gray-600">Turn {turn}</div>
      </div>
      <p className="text-gray-400 text-sm mt-1">{content}</p>
    </div>
  );
}

export default MessagesPanel;
