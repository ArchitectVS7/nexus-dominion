import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    database: "not_configured" as string,
    version: "0.1.0",
    milestone: "M0: Foundation",
  };

  // Only test database if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      // Dynamic import to avoid errors when DATABASE_URL is not set
      const { db } = await import("@/lib/db");
      const { sql } = await import("drizzle-orm");

      // Test database connection
      await db.execute(sql`SELECT 1`);
      checks.database = "connected";
    } catch (error) {
      checks.database = "error";
      console.error("Database health check failed:", error);
    }
  }

  const httpStatus = checks.database === "error" ? 503 : 200;

  return NextResponse.json(checks, { status: httpStatus });
}
