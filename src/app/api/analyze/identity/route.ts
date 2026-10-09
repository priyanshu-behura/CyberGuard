import { NextRequest, NextResponse } from "next/server";
import { analyzeDigitalImpersonation } from "@/lib/security/identity-media/impersonation-analyzer";
import { UnifiedMediaAnalysisResult, AnalysisSourceStatus } from "@/lib/security/identity-media/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Flexible extraction to ensure no supplied values are lost
    const claimedIdentity = (
      body.claimedIdentity ??
      body.identity ??
      body.claimed_identity ??
      ""
    ).toString().trim();

    const claimedOrganization = (
      body.claimedOrganization ??
      body.organization ??
      body.claimed_organization ??
      ""
    ).toString().trim();

    const claimCategory = (
      body.claimCategory ??
      body.category ??
      body.claim_category ??
      "auto"
    ).toString().trim();

    const communicationText = (
      body.communicationText ??
      body.message ??
      body.text ??
      ""
    ).toString().trim();

    const destinationUrl = (
      body.destinationUrl ??
      body.embeddedUrl ??
      body.url ??
      ""
    ).toString().trim();

    const attachedMediaRiskScore = body.attachedMediaRiskScore;
    const attachedMediaClassification = body.attachedMediaClassification;

    if (!communicationText) {
      return NextResponse.json(
        { error: "Communication text is required for identity and impersonation verification." },
        { status: 400 }
      );
    }

    const output = analyzeDigitalImpersonation({
      claimedIdentity,
      claimedOrganization,
      claimCategory,
      communicationText,
      destinationUrl,
      attachedMediaRiskScore,
      attachedMediaClassification,
    });

    const analysisSources: AnalysisSourceStatus[] = [
      {
        name: "Local Identity Analysis",
        type: "local",
        status: "completed",
        note: `Profile evaluated against ${output.assessment.claimCategory.replace("_", " ")} context heuristics.`,
      },
      {
        name: "Social Engineering Analysis",
        type: "metadata",
        status: "completed",
        note: `Urgency: ${output.assessment.urgencyDetected}, Financial: ${output.assessment.financialRequestDetected}, Credentials: ${output.assessment.credentialRequestDetected}`,
      },
      {
        name: "URL Intelligence",
        type: "external",
        status: output.assessment.destinationUrl ? "completed" : "skipped",
        note: output.assessment.destinationUrl
          ? `Destination URL (${output.assessment.destinationUrl}) correlated with claimed entity.`
          : "No external link provided.",
      },
      {
        name: "External Identity LLM",
        type: "ai_model",
        status: "unavailable",
        note: "External identity LLM model not configured in environment.",
      },
    ];

    const entityLabel = output.assessment.claimedIdentity || output.assessment.claimedOrganization || "entity";

    const result: UnifiedMediaAnalysisResult = {
      id: `id-ver-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      type: "identity",
      filename: `claim_${entityLabel.replace(/[^a-zA-Z0-9]/g, "_")}.txt`,
      fileSizeBytes: communicationText.length,
      mimeType: "text/plain",
      timestamp: new Date().toISOString(),
      status: "completed",
      classification: output.classification,
      riskScore: output.riskScore,
      riskLevel: output.riskLevel,
      confidence: output.confidence,
      confidenceType: "Heuristic confidence",
      summary: output.summary,
      indicators: output.indicators,
      evidence: output.evidence,
      metadata: {
        formatSpecific: {
          claimedIdentity: output.assessment.claimedIdentity,
          claimedOrganization: output.assessment.claimedOrganization,
          claimCategory: output.assessment.claimCategory,
          destinationUrl: output.assessment.destinationUrl,
          consistencyVerdict: output.assessment.consistencyVerdict,
          threatIntentsDetected: output.assessment.threatIntentsDetected,
        },
      },
      modelResults: {
        providerName: "Identity Intelligence Engine",
        configured: false,
        status: "not_configured",
        explanation:
          "Deepfake / Identity LLM model not configured in environment. Analysis performed using deterministic authority and social-engineering heuristics.",
      },
      identityAssessment: output.assessment,
      recommendedActions: output.recommendedActions,
      analysisSources,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Identity analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform identity consistency assessment.",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
