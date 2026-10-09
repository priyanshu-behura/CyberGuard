import { NextRequest, NextResponse } from "next/server";
import { responseStore } from "@/lib/security/response/response-store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const incidentId = searchParams.get("incidentId") || undefined;
    const search = searchParams.get("search") || undefined;

    const actions = responseStore.getActions({
      status,
      category,
      priority,
      incidentId,
      search,
    });

    const metrics = responseStore.getMetrics();
    const auditLogs = responseStore.getAuditLogs();

    return NextResponse.json({
      success: true,
      actions,
      metrics,
      auditLogs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to retrieve response actions",
      },
      { status: 500 }
    );
  }
}
