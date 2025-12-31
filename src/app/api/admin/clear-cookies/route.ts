import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Admin endpoint to clear game cookies
 * Use when stuck with corrupted game data
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear game cookies
    cookieStore.delete("gameId");
    cookieStore.delete("empireId");

    return NextResponse.json({
      success: true,
      message: "Cookies cleared successfully"
    });
  } catch (error) {
    console.error("Failed to clear cookies:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
