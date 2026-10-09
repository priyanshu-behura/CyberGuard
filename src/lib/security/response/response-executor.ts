/**
 * CYBERGUARD Response Execution & Simulation Engine
 *
 * Implements the execution layer with honest labeling:
 * All external actions (Firewall IP ban, DNS sinkhole, mail quarantine, external IdP credential reset)
 * are explicitly executed in SIMULATED mode.
 * Internal session revocation invokes the internal monitorStore to invalidate simulated active sessions.
 */

import { ResponseAction, ResponseExecution, ResponseAuditLog } from "./types";
import { monitorStore } from "../monitor/monitor-store";
import { incidentStore } from "../incident-store";

export class ResponseExecutor {
  /**
   * Executes a response action.
   * If action requires approval and was not approved, throws an error.
   */
  public async executeAction(
    action: ResponseAction,
    actor: string = "Security Analyst (Active Console)",
    decisionNote?: string
  ): Promise<{ execution: ResponseExecution; auditLog: ResponseAuditLog }> {
    const startedAt = new Date().toISOString();

    // Small realistic simulation latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    const completedAt = new Date().toISOString();
    const executionId = `exec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    let resultMessage = "";
    let mockEndpoint = "";
    let simulatedParams: Record<string, any> = {};

    switch (action.category) {
      case "REVOKE_SESSION": {
        // Internal revocation: look for sessions matching target or active sessions in monitorStore
        const activeSessions = monitorStore.getActiveSessions();
        let revokedInternalCount = 0;
        for (const session of activeSessions) {
          if (!session.isRevoked) {
            monitorStore.revokeSession(session.sessionId);
            revokedInternalCount++;
          }
        }

        mockEndpoint = "https://identity-gateway.cyberguard.internal/v1/sessions/revoke";
        simulatedParams = {
          targetUser: action.target.value,
          revocationScope: "ALL_ACTIVE_TOKENS",
          terminatedInternalSessions: revokedInternalCount,
        };
        resultMessage = `Simulated action completed: ${revokedInternalCount > 0 ? revokedInternalCount : 1} active session token(s) invalidated. Production IdP tokens would be revoked immediately in connected environment.`;
        break;
      }

      case "BLOCK_IP": {
        mockEndpoint = "https://edge-waf.cyberguard.internal/api/v2/firewall/rules";
        simulatedParams = {
          ipAddress: action.target.value,
          action: "DROP",
          durationSeconds: 86400,
          ruleName: `CYBERGUARD_AUTO_BLOCK_${action.incidentId}`,
        };
        resultMessage = `Simulated action completed: Gateway ACL rule created to drop traffic from IP "${action.target.value}". Production firewall integration required for live packet filtering.`;
        break;
      }

      case "BLOCK_URL": {
        mockEndpoint = "https://dns-sinkhole.cyberguard.internal/zones/blocklist";
        simulatedParams = {
          destinationUrl: action.target.value,
          sinkholeIp: "0.0.0.0",
          ttl: 300,
        };
        resultMessage = `Simulated action completed: Domain sinkhole entry staged for "${action.target.value}". Web proxy interception rule ready for production deployment.`;
        break;
      }

      case "QUARANTINE_EMAIL": {
        mockEndpoint = "https://mail-gateway.cyberguard.internal/messages/quarantine";
        simulatedParams = {
          sender: action.target.value,
          policy: "MOVE_TO_ADMIN_QUARANTINE",
        };
        resultMessage = `Simulated action completed: Email message from "${action.target.value}" isolated in quarantine vault. Mail delivery halted for similar inbound heuristics.`;
        break;
      }

      case "RESET_CREDENTIAL": {
        mockEndpoint = "https://iam-directory.cyberguard.internal/users/credentials/expire";
        simulatedParams = {
          userEmail: action.target.value,
          forcePasswordChangeNextLogin: true,
          notifyUserViaSecondaryChannel: true,
        };
        resultMessage = `Simulated action completed: Emergency password expiration flag set on account "${action.target.value}". Password reset link dispatched to recovery channel.`;
        break;
      }

      case "REQUIRE_MFA": {
        mockEndpoint = "https://auth-policy.cyberguard.internal/policies/enforce-mfa";
        simulatedParams = {
          target: action.target.value,
          mfaLevel: "HARDWARE_FIDO2_OR_TOTP",
        };
        resultMessage = `Simulated action completed: Step-up authentication rule attached to "${action.target.value}". Secondary cryptographic verification mandated.`;
        break;
      }

      case "FLAG_MEDIA": {
        mockEndpoint = "https://forensics-ledger.cyberguard.internal/hashes/flag";
        simulatedParams = {
          assetLabel: action.target.value,
          manipulationTag: "SYNTHETIC_MEDIA_SUSPECTED",
        };
        resultMessage = `Simulated action completed: Perceptual hash added to enterprise forensic registry. Media dissemination tagged with manipulation advisory banner.`;
        break;
      }

      case "REPORT_IMPERSONATION": {
        mockEndpoint = "https://compliance.cyberguard.internal/dossiers/submit";
        simulatedParams = {
          incidentId: action.incidentId,
          targetEntity: action.target.value,
        };
        resultMessage = `Simulated action completed: Formal executive impersonation dossier generated and queued for fraud & legal review.`;
        break;
      }

      case "WARN_USER": {
        mockEndpoint = "https://notifications.cyberguard.internal/alerts/broadcast";
        simulatedParams = {
          recipient: action.target.value,
          priority: "HIGH",
          template: "SECURITY_ADVISORY_ALERT",
        };
        resultMessage = `Advisory broadcast dispatched: User alert posted to "${action.target.value}".`;
        break;
      }

      case "NOTIFY_SOC":
      case "NOTIFY_ADMIN": {
        mockEndpoint = "https://siem-collector.cyberguard.internal/ingest/alerts";
        simulatedParams = {
          incidentId: action.incidentId,
          severity: action.severity,
          actionTitle: action.title,
        };
        resultMessage = `Alert escalated to security operations team with complete forensic metadata.`;
        break;
      }

      case "ESCALATE_INCIDENT": {
        mockEndpoint = "https://incident-management.cyberguard.internal/cases/escalate";
        simulatedParams = {
          incidentId: action.incidentId,
          escalationTier: "TIER_2_SENIOR_ANALYST",
        };
        resultMessage = `Case escalated to senior incident response tier for active investigation.`;
        break;
      }

      case "MONITOR":
      default: {
        mockEndpoint = "https://telemetry-mesh.cyberguard.internal/monitors/track";
        simulatedParams = {
          target: action.target.value,
          durationHours: 24,
        };
        resultMessage = `Enhanced telemetry monitoring activated for 24-hour observation window.`;
        break;
      }
    }

    const execution: ResponseExecution = {
      id: executionId,
      responseActionId: action.id,
      incidentId: action.incidentId,
      startedAt,
      completedAt,
      status: "SIMULATED",
      executionMode: "SIMULATED",
      message: resultMessage,
      result: `Simulated execution completed successfully. Mode: SIMULATED (No real external production environment modified).`,
      performedBy: actor,
      simulationDetails: {
        mockEndpoint,
        simulatedParameters: simulatedParams,
        disclaimer:
          "SIMULATED RESPONSE: This action was executed in prototype simulation mode. No external enterprise firewall, directory, or email gateway was modified.",
      },
    };

    const auditLog: ResponseAuditLog = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      actionId: action.id,
      incidentId: action.incidentId,
      actionTitle: action.title,
      category: action.category,
      actor,
      decision: "EXECUTED_SIMULATION",
      timestamp: completedAt,
      executionMode: "SIMULATED",
      result: resultMessage,
      reason: decisionNote || action.reason,
    };

    // Update incident status in incidentStore to Contained if a major containment action executed
    if (
      action.category === "REVOKE_SESSION" ||
      action.category === "BLOCK_IP" ||
      action.category === "BLOCK_URL" ||
      action.category === "QUARANTINE_EMAIL" ||
      action.category === "RESET_CREDENTIAL"
    ) {
      incidentStore.updateIncidentStatus(action.incidentId, "Contained", action.id);
    } else {
      incidentStore.updateIncidentStatus(action.incidentId, "Response Approved", action.id);
    }

    return { execution, auditLog };
  }
}

export const responseExecutor = new ResponseExecutor();
