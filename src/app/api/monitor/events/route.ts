import { NextRequest, NextResponse } from "next/server";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { AuthenticationEvent } from "@/lib/security/monitor/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/monitor/events
 * Returns current event history, active alerts, account security posture, and behavioral baseline.
 */
export async function GET() {
  try {
    const events = monitorStore.getEvents();
    const alerts = monitorStore.getAlerts();
    const posture = monitorStore.getPosture();
    const baseline = monitorStore.getBaseline();

    return NextResponse.json({
      success: true,
      data: {
        events,
        alerts,
        posture,
        baseline,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve monitoring telemetry",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitor/events
 * Ingests a new authentication event into the detection engine.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AuthenticationEvent>;

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Missing event payload" },
        { status: 400 }
      );
    }

    const result = monitorStore.ingestEvent(body);

    return NextResponse.json({
      success: true,
      data: {
        event: result.event,
        newAlerts: result.newAlerts,
        posture: result.posture,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to ingest authentication event",
      },
      { status: 500 }
    );
  }
}
