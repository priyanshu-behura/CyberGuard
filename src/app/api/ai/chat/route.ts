import { NextRequest, NextResponse } from "next/server";
import { cyberGuardAI } from "@/lib/ai/ai-provider";
import { AIAssistantMode } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/chat
 * Multi-turn chat completion with Dual Mode routing (General AI vs Cybersecurity AI),
 * tool execution, input sanitization, and error handling.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, incidentContextId, mode, verbosity } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "A non-empty 'messages' array is required." },
        { status: 400 }
      );
    }

    const assistantMode: AIAssistantMode =
      mode === "general" ? "general" : "cybersecurity";

    // Sanitize input messages (limit length and ensure valid roles)
    const sanitizedMessages = messages.slice(-15).map((m: any) => {
      const content = String(m.content || "").slice(0, 4000);
      const role = ["user", "assistant", "system", "tool"].includes(m.role)
        ? m.role
        : "user";
      return { role, content };
    });

    // Check if the latest message is valid
    const lastUserMessage = sanitizedMessages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage || !lastUserMessage.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be blank." },
        { status: 400 }
      );
    }

    const result = await cyberGuardAI.generateResponse(sanitizedMessages, {
      mode: assistantMode,
      incidentContextId: incidentContextId ? String(incidentContextId) : undefined,
      verbosity: ["concise", "technical", "executive"].includes(verbosity)
        ? verbosity
        : undefined,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        role: "assistant",
        mode: assistantMode,
        content: result.content,
        timestamp: new Date().toISOString(),
        executionMode: result.executionMode,
        modelIdentifier: result.modelIdentifier,
        toolInvocations: result.toolInvocations,
        suggestedFollowUps: result.suggestedFollowUps,
        evidenceSnippets: result.evidenceSnippets,
        associatedIncidentId: result.associatedIncidentId,
        report: result.report,
        riskAssessment: result.riskAssessment,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal error occurred while processing AI completion.",
      },
      { status: 500 }
    );
  }
}
