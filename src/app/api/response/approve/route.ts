import { NextRequest, NextResponse } from "next/server";
import { responseStore } from "@/lib/security/response/response-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId, decision, actor, note, reason } = body;

    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "actionId is required" },
        { status: 400 }
      );
    }

    if (decision === "APPROVE") {
      const result = await responseStore.approveAction(
        actionId,
        actor || "Security Analyst (Active Console)",
        note
      );
      return NextResponse.json({
        success: true,
        action: result.action,
        execution: result.execution,
        message: "Response action approved and simulated successfully",
      });
    } else if (decision === "REJECT") {
      const rejectedAction = responseStore.rejectAction(
        actionId,
        actor || "Security Analyst (Active Console)",
        reason || note || "Action rejected during security review."
      );
      return NextResponse.json({
        success: true,
        action: rejectedAction,
        message: "Response action rejected",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid decision. Must be APPROVE or REJECT" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process approval decision",
      },
      { status: 500 }
    );
  }
}
