import { NextResponse } from "next/server";
import { cyberGuardAI } from "@/lib/ai/ai-provider";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/status
 * Returns current AI provider configuration without exposing API keys.
 */
export async function GET() {
  try {
    const status = cyberGuardAI.getStatus();
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to check AI provider status",
      },
      { status: 500 }
    );
  }
}
