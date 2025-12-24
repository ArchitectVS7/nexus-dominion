import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-display text-lcars-amber mb-4 tracking-wider">
          X-IMPERIUM
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 font-body">
          Build your galactic empire
        </p>

        <Link
          href="/game"
          className="inline-block px-8 py-4 bg-lcars-amber text-gray-950 font-semibold text-lg rounded-lcars-pill hover:brightness-110 transition-all duration-200 hover:scale-105"
        >
          START GAME
        </Link>

        <div className="mt-16 flex gap-8 justify-center text-sm text-gray-500">
          <span>v0.1.0</span>
          <span>Milestone 0: Foundation</span>
        </div>
      </div>
    </main>
  );
}
