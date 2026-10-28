/**
 * CYBERGUARD Server-Side AI Intelligence Provider
 *
 * Implements Dual AI Assistant Modes:
 * 1. General AI Assistant: General-purpose conversational intelligence powered by Google Gemini.
 * 2. Cybersecurity Intelligence Assistant: SOC specialist grounded in live CYBERGUARD
 *    telemetry, incident stores, monitor logs, and response queues with safe tool execution.
 *
 * Invariants:
 * - Powered exclusively by server-side Google Gemini (@google/genai) using GEMINI_API_KEY.
 * - Centralized model identifier (gemini-3.8-flash).
 * - "No Fake AI" policy: Never claims simulated data is live cloud AI when running in heuristic fallback.
 * - Containment actions strictly delegate to human-in-the-loop approval via /response.
 */

import {
  AIAssistantMode,
  AIMessage,
  AIExecutionMode,
  ToolInvocation,
  IncidentReportData,
  AIProviderStatus,
} from "./types";
import { CYBERGUARD_TOOLS, executeSecurityTool } from "./tools";
import {
  executeGeminiCompletion,
  getGeminiProviderStatus,
  GEMINI_PRIMARY_MODEL,
} from "./gemini-client";
import { incidentStore } from "../security/incident-store";
import { monitorStore } from "../security/monitor/monitor-store";
import { responseStore } from "../security/response/response-store";
import { RiskLevel } from "../security/identity-media/types";
export type { AIProviderStatus };

export class CyberGuardAIProvider {
  /**
   * Evaluates server environment to determine active AI engine.
   * Never exposes raw API keys to clients.
   */
  public getStatus(): AIProviderStatus {
    return getGeminiProviderStatus();
  }

  /**
   * Main completion pipeline supporting both General AI and Cybersecurity modes.
   */
  public async generateResponse(
    messages: { role: string; content: string }[],
    options: {
      mode?: AIAssistantMode;
      incidentContextId?: string;
      verbosity?: "concise" | "technical" | "executive";
    } = {}
  ): Promise<{
    content: string;
    executionMode: AIExecutionMode;
    modelIdentifier: string;
    toolInvocations: ToolInvocation[];
    suggestedFollowUps: string[];
    evidenceSnippets: string[];
    associatedIncidentId?: string;
    report?: IncidentReportData;
    riskAssessment?: {
      severity: RiskLevel;
      score: number;
      summary: string;
    };
  }> {
    const mode = options.mode || "cybersecurity";
    const status = this.getStatus();
    const lastUserMessage =
      messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";

    // =========================================================================
    // MODE 1: GENERAL AI ASSISTANT
    // =========================================================================
    if (mode === "general") {
      if (status.isConfigured) {
        try {
          const geminiResult = await executeGeminiCompletion({
            mode: "general",
            messages,
          });

          return {
            content: geminiResult.content,
            executionMode: "REAL_AI_GEMINI",
            modelIdentifier: geminiResult.modelIdentifier,
            toolInvocations: [],
            suggestedFollowUps: [
              "Can you explain this step by step?",
              "Can you provide a practical example or code snippet?",
              "What are common pitfalls or best practices here?",
            ],
            evidenceSnippets: [],
          };
        } catch (err: any) {
          console.warn("Gemini General AI execution error:", err?.message || err);
          return {
            content: `> [!WARNING]\n> **AI Service Notice**: ${err?.message || "AI request failed."}\n\nPlease check your network connection or verify that \`GEMINI_API_KEY\` in \`.env.local\` is valid.`,
            executionMode: "DEMO_FALLBACK",
            modelIdentifier: GEMINI_PRIMARY_MODEL,
            toolInvocations: [],
            suggestedFollowUps: ["Try sending your question again."],
            evidenceSnippets: [],
          };
        }
      }

      // If Gemini is not configured, give clear guidance for General AI mode
      return {
        content: `### 🌐 CYBERGUARD General AI (Configuration Required)

The **General AI Assistant** provides open-ended conversational intelligence, programming assistance, writing, reasoning, and problem-solving.

To activate cloud generative capabilities:
1. Ensure your server environment API key is configured.
2. Add your key to \`.env.local\` in the project root:
\`\`\`env
GEMINI_API_KEY=your_actual_api_key
\`\`\`
3. Restart the CYBERGUARD dev server.

> [!TIP]
> You can switch to **Cybersecurity Intelligence Mode** at any time. Cybersecurity mode functions even without an API key using our deterministic local forensics engine!`,
        executionMode: "HEURISTIC_RULE_BASED",
        modelIdentifier: "config-pending",
        toolInvocations: [],
        suggestedFollowUps: [
          "Switch to Cybersecurity Intelligence mode",
          "Summarize current security posture",
        ],
        evidenceSnippets: [],
      };
    }

    // =========================================================================
    // MODE 2: CYBERSECURITY INTELLIGENCE ASSISTANT
    // =========================================================================

    // Execute read-only tools and assemble live telemetry
    const toolInvocations: ToolInvocation[] = [];
    const evidenceSnippets: string[] = [];
    let associatedIncidentId = options.incidentContextId;
    let generatedReport: IncidentReportData | undefined;

    const q = lastUserMessage.toLowerCase();

    // 1. URL Analysis intent
    const urlMatch = lastUserMessage.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      const url = urlMatch[0];
      const toolRes = await executeSecurityTool("analyze_url_or_message", {
        type: "url",
        content: url,
      });
      toolInvocations.push({
        id: `tool-${Date.now()}-url`,
        toolName: "analyze_url_or_message",
        parameters: { type: "url", content: url },
        result: toolRes.data,
        status: toolRes.success ? "success" : "error",
      });
    }

    // 2. Incident specific intent
    const incMatch = lastUserMessage.match(/inc-\d+/i);
    const targetIncId = incMatch
      ? incMatch[0].toUpperCase()
      : options.incidentContextId;
    if (targetIncId) {
      associatedIncidentId = targetIncId;
      const toolRes = await executeSecurityTool("get_incident_details", {
        incidentId: targetIncId,
      });
      toolInvocations.push({
        id: `tool-${Date.now()}-inc`,
        toolName: "get_incident_details",
        parameters: { incidentId: targetIncId },
        result: toolRes.data,
        status: toolRes.success ? "success" : "error",
      });
    }

    // 3. Report generation intent
    if (
      q.includes("report") ||
      q.includes("dossier") ||
      q.includes("compile report") ||
      q.includes("executive summary")
    ) {
      const repIncId =
        associatedIncidentId ||
        incidentStore.getIncidents()[0]?.id ||
        "INC-001";
      const repRes = await executeSecurityTool("generate_incident_report", {
        incidentId: repIncId,
      });
      toolInvocations.push({
        id: `tool-${Date.now()}-rep`,
        toolName: "generate_incident_report",
        parameters: { incidentId: repIncId },
        result: repRes.data,
        status: repRes.success ? "success" : "error",
      });
      if (repRes.success && repRes.data?.report) {
        generatedReport = repRes.data.report;
        associatedIncidentId = repIncId;
      }
    }

    // 4. Monitor / Alerts intent
    if (
      q.includes("monitor") ||
      q.includes("alert") ||
      q.includes("session") ||
      q.includes("login") ||
      q.includes("travel")
    ) {
      const toolRes = await executeSecurityTool("get_monitor_alerts", {});
      toolInvocations.push({
        id: `tool-${Date.now()}-mon`,
        toolName: "get_monitor_alerts",
        parameters: {},
        result: toolRes.data,
        status: toolRes.success ? "success" : "error",
      });
    }

    // 5. Response Center Queue intent
    if (
      q.includes("response") ||
      q.includes("mitigat") ||
      q.includes("contain") ||
      q.includes("approval") ||
      q.includes("queue")
    ) {
      const toolRes = await executeSecurityTool("get_response_queue", {});
      toolInvocations.push({
        id: `tool-${Date.now()}-resp`,
        toolName: "get_response_queue",
        parameters: {},
        result: toolRes.data,
        status: toolRes.success ? "success" : "error",
      });
    }

    // Always fetch baseline dashboard metrics if no tools ran
    if (toolInvocations.length === 0) {
      const summaryRes = await executeSecurityTool("get_dashboard_summary", {});
      toolInvocations.push({
        id: `tool-${Date.now()}-dash`,
        toolName: "get_dashboard_summary",
        parameters: {},
        result: summaryRes.data,
        status: summaryRes.success ? "success" : "error",
      });
    }

    // Build grounding telemetry context string
    const telemetryContext = toolInvocations
      .map((t) => `Tool [${t.toolName}]: ${JSON.stringify(t.result)}`)
      .join("\n\n");

    // If Gemini is active, let Gemini synthesize real telemetry with intelligence
    if (status.isConfigured) {
      try {
        const geminiResult = await executeGeminiCompletion({
          mode: "cybersecurity",
          messages,
          telemetryContext,
        });

        return {
          content: geminiResult.content,
          executionMode: "REAL_AI_GEMINI",
          modelIdentifier: geminiResult.modelIdentifier,
          toolInvocations,
          suggestedFollowUps: [
            "What immediate containment actions should we approve?",
            "Explain the technical indicators behind this risk score.",
            "Generate an incident report for the security team.",
          ],
          evidenceSnippets,
          associatedIncidentId,
          report: generatedReport,
        };
      } catch (err: any) {
        console.warn(
          "Gemini Cybersecurity call failed, falling back to local deterministic copilot:",
          err?.message || err
        );
        // Seamless fallback to deterministic copilot
        const fallback = await this.executeDeterministicCopilot(
          lastUserMessage,
          { incidentContextId: associatedIncidentId }
        );
        fallback.content = `> [!WARNING]\n> **Real AI Provider Error**: ${err?.message || "Model timeout"}. Operating in deterministic offline mode.\n\n${fallback.content}`;
        return fallback;
      }
    }

    // Default offline fallback: deterministic security copilot
    return await this.executeDeterministicCopilot(lastUserMessage, {
      incidentContextId: associatedIncidentId,
    });
  }

  /**
   * Deterministic SOC Rule-Based Copilot:
   * Inspects local stores, calculates risk metrics, and provides accurate answers
   * even when no external AI API key is configured.
   */
  private async executeDeterministicCopilot(
    userQuery: string,
    options: { incidentContextId?: string } = {}
  ): Promise<{
    content: string;
    executionMode: AIExecutionMode;
    modelIdentifier: string;
    toolInvocations: ToolInvocation[];
    suggestedFollowUps: string[];
    evidenceSnippets: string[];
    associatedIncidentId?: string;
    report?: IncidentReportData;
    riskAssessment?: {
      severity: RiskLevel;
      score: number;
      summary: string;
    };
  }> {
    const q = userQuery.toLowerCase();
    const toolInvocations: ToolInvocation[] = [];

    // 1. URL Analysis Intent
    const urlMatch = userQuery.match(/https?:\/\/[^\s]+/i);
    if (
      urlMatch &&
      (q.includes("url") ||
        q.includes("link") ||
        q.includes("phish") ||
        q.includes("check"))
    ) {
      const url = urlMatch[0];
      const toolRes = await executeSecurityTool("analyze_url_or_message", {
        type: "url",
        content: url,
      });
      toolInvocations.push({
        id: `tool-${Date.now()}-1`,
        toolName: "analyze_url_or_message",
        parameters: { type: "url", content: url },
        result: toolRes.data,
        status: toolRes.success ? "success" : "error",
      });

      const d = toolRes.data;
      const response = `### 🔍 Deterministic URL Threat Analysis

**Target URL:** \`${d.url}\`  
**Assessed Risk Level:** \`${d.riskLevel}\` (Score: **${d.riskScore}/100**)

#### Key Heuristic Indicators
${
  d.indicators.length > 0
    ? d.indicators
        .map(
          (ind: any) =>
            `- **${ind.name}** (${ind.severity.toUpperCase()} impact: +${ind.scoreImpact} pts)`
        )
        .join("\n")
    : "- No critical phishing indicators detected in hostname structure."
}

#### Summary & Recommended Action
${d.heuristicsSummary}

> [!TIP]
> To enforce gateway-level domain sinkholing or block actions for this target, navigate to the **[Response Center](/response)**.`;

      return {
        content: response,
        executionMode: "HEURISTIC_RULE_BASED",
        modelIdentifier: "cyberguard-deterministic-v1",
        toolInvocations,
        suggestedFollowUps: [
          "What should we prioritize right now?",
          "Prepare a report for the security team.",
          "Check account security posture.",
        ],
        evidenceSnippets: d.indicators.map((i: any) => i.name),
        riskAssessment: {
          severity: d.riskLevel,
          score: d.riskScore,
          summary: d.heuristicsSummary,
        },
      };
    }

    // 2. Incident Report Generation Intent
    if (
      q.includes("report") ||
      q.includes("executive summary") ||
      q.includes("draft report") ||
      q.includes("compile report")
    ) {
      const incMatch = userQuery.match(/inc-\d+/i);
      const incidents = incidentStore.getIncidents();
      const targetId = incMatch
        ? incMatch[0].toUpperCase()
        : options.incidentContextId || incidents[0]?.id || "INC-001";

      const reportRes = await executeSecurityTool("generate_incident_report", {
        incidentId: targetId,
      });
      toolInvocations.push({
        id: `tool-${Date.now()}-rep`,
        toolName: "generate_incident_report",
        parameters: { incidentId: targetId },
        result: reportRes.data,
        status: reportRes.success ? "success" : "error",
      });

      if (!reportRes.success || !reportRes.data?.report) {
        return {
          content: `### 📄 Incident Report Compiler\n\nNo incidents currently exist in the store to report on.\n\nTo populate realistic threat scenarios, run a simulation in the **[Response Center](/response)** or test a login anomaly in **[Monitor](/monitor)**.`,
          executionMode: "HEURISTIC_RULE_BASED",
          modelIdentifier: "cyberguard-deterministic-v1",
          toolInvocations,
          suggestedFollowUps: ["Check dashboard summary", "Audit active monitor alerts"],
          evidenceSnippets: [],
        };
      }

      const rep: IncidentReportData = reportRes.data.report;
      const reportContent = `### 📄 Incident Dossier: ${rep.incidentId} — ${rep.title}

**Classification:** \`${rep.classification}\`  
**Assessed Severity:** \`${rep.severity}\` (Risk Score: **${rep.riskScore}/100**, Confidence: **${rep.confidence}%**)  
**Generated:** \`${new Date(rep.generatedAt).toUTCString()}\`

#### 1. Executive Summary
${rep.executiveSummary}

#### 2. Technical Findings & Forensic Evidence
${rep.technicalFindings.map((f) => `- ${f}`).join("\n")}

#### 3. Impact Assessment
${rep.impactAssessment}

#### 4. Containment Actions & Playbooks
${rep.recommendedPlaybooks.map((p) => `- **Recommended:** ${p}`).join("\n")}
${
  rep.activeResponseActions.length > 0
    ? rep.activeResponseActions
        .map(
          (a) =>
            `- **Action [${a.category}]:** Status: \`${a.status}\` (Approval Required: ${a.requiresApproval ? "Yes" : "No"})`
        )
        .join("\n")
    : "- No automated response actions queued yet."
}

#### 5. Investigation Limitations
${rep.limitationsAndGaps.map((l) => `- ${l}`).join("\n")}

> [!NOTE]
> This report is assembled from verified local telemetry. You can view or download the full markdown dossier using the **Incident Report** button.`;

      return {
        content: reportContent,
        executionMode: "HEURISTIC_RULE_BASED",
        modelIdentifier: "cyberguard-deterministic-v1",
        toolInvocations,
        suggestedFollowUps: [
          `Review response actions for ${rep.incidentId}`,
          "Summarize our current security posture.",
          "What should we prioritize right now?",
        ],
        evidenceSnippets: rep.technicalFindings,
        associatedIncidentId: rep.incidentId,
        report: rep,
        riskAssessment: {
          severity: rep.severity,
          score: rep.riskScore,
          summary: rep.executiveSummary,
        },
      };
    }

    // 3. Specific Incident Investigation Intent
    const specificIncMatch = userQuery.match(/inc-\d+/i);
    if (
      specificIncMatch ||
      q.includes("highest-risk") ||
      q.includes("investigate")
    ) {
      const incidents = incidentStore.getIncidents();
      const targetId = specificIncMatch
        ? specificIncMatch[0].toUpperCase()
        : incidents[0]?.id;

      if (targetId) {
        const detailsRes = await executeSecurityTool("get_incident_details", {
          incidentId: targetId,
        });
        toolInvocations.push({
          id: `tool-${Date.now()}-inc`,
          toolName: "get_incident_details",
          parameters: { incidentId: targetId },
          result: detailsRes.data,
          status: detailsRes.success ? "success" : "error",
        });

        if (detailsRes.success && detailsRes.data?.incident) {
          const inc = detailsRes.data.incident;
          const correlatedActions =
            detailsRes.data.correlatedResponseActions || [];

          const content = `### 🛡️ Incident Investigation: ${inc.id} — ${inc.title}

**Threat Category:** \`${inc.source}\`  
**Current Status:** \`${inc.status}\`  
**Severity:** \`${inc.severity}\` (Risk Score: **${inc.riskScore}/100**)  
**Attack Chain Stage:** \`${inc.attackChainStage}\`  

#### What Happened
${inc.summary}

#### Evidence & Forensic Indicators
${
  inc.evidenceSnippets.length > 0
    ? inc.evidenceSnippets.map((snip: string) => `- 🔬 ${snip}`).join("\n")
    : "- Local telemetry observation."
}

#### Recommended Response & Containment
- **Containment Action:** ${inc.recommendedPlaybook}
${
  correlatedActions.length > 0
    ? `\n**Correlated Response Queue Actions:**\n` +
      correlatedActions
        .map(
          (a: any) =>
            `- \`[${a.category}]\` ${a.title} (Status: **${a.status}**${a.requiresApproval ? ", Approval Required" : ""})`
        )
        .join("\n")
    : "\n*No pending containment actions in queue for this incident.*"
}

#### Security Analyst Next Steps:
1. Verify if the target user (\`${inc.targetAccount || inc.associatedSender || "analyst@cyberguard.internal"}\`) recognizes the activity.
2. Review pending actions in the **[Response Center](/response)** to approve containment.
3. Check **[Attack Chains](/attack-chains)** to correlate with preceding reconnaissance or initial contact signals.`;

          return {
            content,
            executionMode: "HEURISTIC_RULE_BASED",
            modelIdentifier: "cyberguard-deterministic-v1",
            toolInvocations,
            suggestedFollowUps: [
              `Draft an incident report for ${inc.id}`,
              "What other incidents are currently open?",
              "Check authentication alerts in Monitor.",
            ],
            evidenceSnippets: inc.evidenceSnippets,
            associatedIncidentId: inc.id,
            riskAssessment: {
              severity: inc.severity,
              score: inc.riskScore,
              summary: inc.summary,
            },
          };
        }
      }
    }

    // 4. Default: Platform Posture & Live Telemetry Summary
    const summaryRes = await executeSecurityTool("get_dashboard_summary", {});
    toolInvocations.push({
      id: `tool-${Date.now()}-dash`,
      toolName: "get_dashboard_summary",
      parameters: {},
      result: summaryRes.data,
      status: summaryRes.success ? "success" : "error",
    });

    const metrics = summaryRes.data?.metrics;
    const posture = summaryRes.data?.posture;
    const respMetrics = summaryRes.data?.responseMetrics;

    const content = `### 🛡️ CYBERGUARD Security Operations Status

**System Status:** **Operational**  
**Active Security Incidents:** **${metrics?.activeIncidentsCount ?? 0}** (${metrics?.highRiskAlerts ?? 0} High/Critical)  
**Account Security Posture:** \`${posture?.status ?? "SECURE"}\` (Risk Score: **${posture?.riskScore ?? 0}/100**)  
**Active Authentication Alerts:** **${posture?.activeAlertsCount ?? 0}**  
**Response Actions Pending Approval:** **${respMetrics?.pendingApproval ?? 0}**  

#### Recommended Priority Actions:
${
  (respMetrics?.pendingApproval ?? 0) > 0
    ? `1. ⚠️ **Immediate Review**: There are **${respMetrics.pendingApproval}** response containment action(s) awaiting analyst authorization in the **[Response Center](/response)**.`
    : `1. ✅ **Containment Queue Clear**: No emergency mitigations currently require sign-off.`
}
2. 🔬 **Deepfake / Impersonation**: Total media evaluated: **${metrics?.totalAnalyzed ?? 0}** (Detected anomalies: **${metrics?.potentialDeepfakes ?? 0}**).
3. 🌐 **Authentication Telemetry**: Baseline normal across active monitored sessions.

How can I assist your investigation further? You can ask me to analyze a specific incident, investigate a suspicious link, or compile an incident report dossier.`;

    return {
      content,
      executionMode: "HEURISTIC_RULE_BASED",
      modelIdentifier: "cyberguard-deterministic-v1",
      toolInvocations,
      suggestedFollowUps: [
        "Investigate highest-risk open incident",
        "Audit active authentication alerts",
        "Generate a structured incident report",
      ],
      evidenceSnippets: [],
    };
  }
}

export const cyberGuardAI = new CyberGuardAIProvider();
