/**
 * CYBERGUARD Controlled Security Tool Registry
 * Exposes explicit read-only tools and safe action generators
 * connected directly to existing application engines.
 * 
 * Safety invariants:
 * - Read-only execution against local stores.
 * - Input validation and parameter sanitization to resist prompt injection.
 * - Never claims external actions occurred without authorization.
 */

import { incidentStore } from "../security/incident-store";
import { monitorStore } from "../security/monitor/monitor-store";
import { responseStore } from "../security/response/response-store";
import { urlAnalyzer } from "../security/url-analyzer";
import { messageAnalyzer } from "../security/message-analyzer";
import { SecurityToolDefinition, IncidentReportData } from "./types";

export const CYBERGUARD_TOOLS: SecurityToolDefinition[] = [
  {
    name: "get_dashboard_summary",
    description: "Retrieves aggregate security metrics including active incidents, authentication posture, and pending response actions.",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "search_incidents",
    description: "Searches the incident management store for existing security incidents matching a query string or severity level.",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword to search across incident title, summary, or attacker domain.",
        },
        severity: {
          type: "string",
          description: "Filter by severity level: SAFE, LOW, MEDIUM, HIGH, or CRITICAL.",
          enum: ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
        },
      },
    },
  },
  {
    name: "get_incident_details",
    description: "Fetches full forensic dossier and evidence snippets for a specific incident ID (e.g. INC-001).",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {
        incidentId: {
          type: "string",
          description: "The unique incident identifier, e.g. INC-001 or INC-002.",
        },
      },
      required: ["incidentId"],
    },
  },
  {
    name: "get_monitor_alerts",
    description: "Retrieves real-time authentication surveillance alerts, impossible travel flags, and account security posture.",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {
        statusFilter: {
          type: "string",
          description: "Filter alerts by status: ACTIVE or ACKNOWLEDGED.",
          enum: ["ACTIVE", "ACKNOWLEDGED"],
        },
      },
    },
  },
  {
    name: "get_response_queue",
    description: "Fetches the current mitigation queue including pending approvals, recommended actions, and executed mitigations.",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Filter by status: PENDING_APPROVAL, RECOMMENDED, or SIMULATED.",
        },
      },
    },
  },
  {
    name: "analyze_url_or_message",
    description: "Executes local deterministic phishing and threat analysis on a user-submitted message body or URL string.",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Target type: 'url' or 'message'.",
          enum: ["url", "message"],
        },
        content: {
          type: "string",
          description: "The raw URL string or message text to inspect.",
        },
      },
      required: ["type", "content"],
    },
  },
  {
    name: "generate_incident_report",
    description: "Compiles an official, evidence-grounded security incident report from verified incident records.",
    readOnly: true,
    parameters: {
      type: "object",
      properties: {
        incidentId: {
          type: "string",
          description: "The incident ID to compile a report for.",
        },
      },
      required: ["incidentId"],
    },
  },
];

/**
 * Validates and executes a tool safely against the application's actual data services.
 */
export async function executeSecurityTool(
  toolName: string,
  params: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    switch (toolName) {
      case "get_dashboard_summary": {
        const incidents = incidentStore.getIncidents();
        const incidentMetrics = incidentStore.getMetrics();
        const posture = monitorStore.getPosture();
        const responseMetrics = responseStore.getMetrics();

        return {
          success: true,
          data: {
            totalIncidents: incidents.length,
            activeIncidents: incidentMetrics.activeIncidentsCount,
            criticalIncidents: incidents.filter((i) => i.severity === "CRITICAL").length,
            highRiskIncidents: incidents.filter((i) => i.severity === "HIGH").length,
            accountSecurityStatus: posture.status,
            accountRiskScore: posture.riskScore,
            activeAlertsCount: posture.activeAlertsCount,
            takeoverSuspected: posture.takeoverSuspected,
            pendingResponseApprovals: responseMetrics.pendingApproval,
            completedResponseActions: responseMetrics.completed + responseMetrics.simulated,
          },
        };
      }

      case "search_incidents": {
        const query = typeof params.query === "string" ? params.query.trim().toLowerCase() : "";
        const severity = typeof params.severity === "string" ? params.severity.toUpperCase() : undefined;

        let incidents = incidentStore.getIncidents();

        if (severity) {
          incidents = incidents.filter((i) => i.severity === severity);
        }

        if (query) {
          incidents = incidents.filter(
            (i) =>
              i.title.toLowerCase().includes(query) ||
              i.summary.toLowerCase().includes(query) ||
              i.id.toLowerCase().includes(query) ||
              (i.associatedUrl && i.associatedUrl.toLowerCase().includes(query)) ||
              (i.associatedSender && i.associatedSender.toLowerCase().includes(query))
          );
        }

        return {
          success: true,
          data: {
            count: incidents.length,
            incidents: incidents.slice(0, 10).map((i) => ({
              id: i.id,
              title: i.title,
              severity: i.severity,
              riskScore: i.riskScore,
              status: i.status,
              attackChainStage: i.attackChainStage,
              timestamp: i.timestamp,
              summary: i.summary,
            })),
          },
        };
      }

      case "get_incident_details": {
        const id = String(params.incidentId || "").trim();
        if (!id) {
          return { success: false, error: "incidentId parameter is required" };
        }

        const incident = incidentStore.getIncidentById(id);
        if (!incident) {
          return {
            success: false,
            error: `Incident with ID "${id}" was not found in the incident store.`,
          };
        }

        // Cross-reference with responseStore for any correlated response actions
        const actions = responseStore
          .getActions()
          .filter((a) => a.incidentId === incident.id);

        return {
          success: true,
          data: {
            incident,
            correlatedResponseActions: actions.map((a) => ({
              id: a.id,
              category: a.category,
              title: a.title,
              status: a.status,
              priority: a.priority,
              requiresApproval: a.requiresApproval,
            })),
          },
        };
      }

      case "get_monitor_alerts": {
        const posture = monitorStore.getPosture();
        let alerts = monitorStore.getAlerts();

        if (params.statusFilter) {
          alerts = alerts.filter((a) => a.status === params.statusFilter);
        }

        const recentEvents = monitorStore.getEvents().slice(0, 10);

        return {
          success: true,
          data: {
            posture: {
              status: posture.status,
              riskScore: posture.riskScore,
              riskLevel: posture.riskLevel,
              takeoverSuspected: posture.takeoverSuspected,
              activeAlertsCount: posture.activeAlertsCount,
              summary: posture.summary,
              recommendedResponse: posture.recommendedResponse,
            },
            alerts: alerts.slice(0, 8).map((a) => ({
              id: a.id,
              title: a.title,
              category: a.category,
              severity: a.severity,
              riskScore: a.riskScore,
              status: a.status,
              explanation: a.explanation,
              evidence: a.evidence,
              targetUser: a.targetUserEmail,
              timestamp: a.timestamp,
            })),
            recentEventsCount: recentEvents.length,
          },
        };
      }

      case "get_response_queue": {
        const filter = typeof params.status === "string" ? params.status : undefined;
        const actions = responseStore.getActions({ status: filter });
        const metrics = responseStore.getMetrics();

        return {
          success: true,
          data: {
            metrics,
            totalFilteredActions: actions.length,
            actions: actions.slice(0, 10).map((a) => ({
              id: a.id,
              incidentId: a.incidentId,
              title: a.title,
              category: a.category,
              priority: a.priority,
              severity: a.severity,
              status: a.status,
              requiresApproval: a.requiresApproval,
              target: a.target,
              reason: a.reason,
              potentialImpact: a.potentialImpact,
            })),
          },
        };
      }

      case "analyze_url_or_message": {
        const type = String(params.type || "").toLowerCase();
        const content = String(params.content || "").trim();

        if (!content) {
          return { success: false, error: "Content parameter is required for analysis." };
        }

        if (type === "url") {
          const analysis = urlAnalyzer.analyze(content);
          return {
            success: true,
            data: {
              type: "url",
              url: content,
              riskScore: analysis.riskScore,
              riskLevel: (analysis.riskLevel.toUpperCase() as any),
              indicators: analysis.indicators.map((i) => ({
                name: i.title,
                severity: i.severity,
                scoreImpact: i.scoreContribution || 20,
              })),
              heuristicsSummary: analysis.summary,
            },
          };
        } else if (type === "message") {
          const analysis = messageAnalyzer.analyze(content);
          return {
            success: true,
            data: {
              type: "message",
              riskScore: analysis.riskScore,
              riskLevel: (analysis.riskLevel.toUpperCase() as any),
              suspiciousKeywordsFound: analysis.evidence.detectedPhrases,
              indicators: analysis.indicators.map((i) => ({
                name: i.title,
                severity: i.severity,
                scoreImpact: i.scoreContribution || 20,
              })),
              summary: analysis.summary,
            },
          };
        } else {
          return {
            success: false,
            error: "Invalid analysis type. Must be 'url' or 'message'.",
          };
        }
      }

      case "generate_incident_report": {
        const id = String(params.incidentId || "").trim();
        const incident = incidentStore.getIncidentById(id);

        if (!incident) {
          return {
            success: false,
            error: `Cannot generate report: Incident "${id}" does not exist in store.`,
          };
        }

        const actions = responseStore
          .getActions()
          .filter((a) => a.incidentId === incident.id);

        const report: IncidentReportData = {
          incidentId: incident.id,
          title: incident.title,
          generatedAt: new Date().toISOString(),
          classification:
            incident.riskScore >= 85
              ? "CRITICAL COMPROMISE / ACTIVE THREAT"
              : incident.riskScore >= 70
              ? "HIGH-SEVERITY SECURITY INCIDENT"
              : "MONITORED ANOMALY",
          severity: incident.severity,
          riskScore: incident.riskScore,
          confidence: incident.confidence,
          executiveSummary: incident.summary,
          technicalFindings: incident.evidenceSnippets,
          timeline: [
            {
              timestamp: incident.timestamp,
              event: `Detection generated via ${incident.source}: ${incident.title}`,
            },
          ],
          impactAssessment: `Threat evaluated at stage '${incident.attackChainStage}'. Potential unauthorized credential harvest or account compromise.`,
          recommendedPlaybooks: [incident.recommendedPlaybook],
          activeResponseActions: actions.map((a) => ({
            category: a.category,
            status: a.status,
            requiresApproval: a.requiresApproval,
          })),
          limitationsAndGaps: [
            "Forensics established from local host telemetry and deterministic heuristic detection.",
            "External threat intel feeds operating in baseline mode.",
          ],
        };

        return {
          success: true,
          data: report,
        };
      }

      default:
        return {
          success: false,
          error: `Unknown security tool: "${toolName}". Supported tools: ${CYBERGUARD_TOOLS.map((t) => t.name).join(", ")}`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Execution error in tool ${toolName}: ${err?.message || "Internal failure"}`,
    };
  }
}
