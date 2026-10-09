import { NextRequest, NextResponse } from "next/server";
import { responseStore } from "@/lib/security/response/response-store";
import { ResponseScenarioId } from "@/lib/security/response/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, scenarioId } = body;

    if (action === "RESET") {
      responseStore.resetStore();
      return NextResponse.json({
        success: true,
        message: "Response store telemetry reset successfully",
      });
    }

    if (!scenarioId) {
      return NextResponse.json(
        { success: false, error: "scenarioId is required" },
        { status: 400 }
      );
    }

    const result = await responseStore.injectScenario(scenarioId as ResponseScenarioId);

    return NextResponse.json({
      success: true,
      scenarioId,
      incident: result.incident,
      actionsCount: result.actions.length,
      actions: result.actions,
      message: `Scenario ${scenarioId} injected and processed through response pipeline`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to inject response scenario",
      },
      { status: 500 }
    );
  }
}
