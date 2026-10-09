import { NextRequest, NextResponse } from "next/server";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { DemoScenarioId } from "@/lib/security/monitor/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/monitor/simulate
 * Executes synthetic security scenarios, revokes sessions, or clears monitor telemetry.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioId, action, sessionId, alertId } = body;

    if (action === "clear") {
      monitorStore.clearAll();
      return NextResponse.json({
        success: true,
        message: "Telemetry and alerts cleared successfully.",
        data: {
          events: monitorStore.getEvents(),
          alerts: monitorStore.getAlerts(),
          posture: monitorStore.getPosture(),
        },
      });
    }

    if (action === "revoke" && sessionId) {
      const result = monitorStore.revokeSession(sessionId);
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          posture: monitorStore.getPosture(),
          events: monitorStore.getEvents(),
        },
      });
    }

    if (action === "acknowledge" && alertId) {
      monitorStore.acknowledgeAlert(alertId);
      return NextResponse.json({
        success: true,
        message: `Alert ${alertId} acknowledged.`,
        data: {
          alerts: monitorStore.getAlerts(),
          posture: monitorStore.getPosture(),
        },
      });
    }

    if (scenarioId) {
      const scenarioResult = await monitorStore.injectScenario(String(scenarioId));
      return NextResponse.json({
        success: true,
        message: `Executed scenario: ${scenarioResult.title}`,
        data: {
          scenario: scenarioResult,
          events: monitorStore.getEvents(),
          alerts: monitorStore.getAlerts(),
          posture: scenarioResult.posture,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or scenario requested" },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Simulation execution failed",
      },
      { status: 500 }
    );
  }
}
