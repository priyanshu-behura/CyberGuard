/**
 * CYBERGUARD Intelligent Response Store
 * Manages reactive state for response actions, approvals, simulated executions,
 * audit trails, and scenario simulation injection.
 */

import {
  ResponseAction,
  ApprovalRequest,
  ResponseExecution,
  ResponseAuditLog,
  ResponseMetrics,
  ResponseScenarioId,
} from "./types";
import { responseEngine } from "./response-engine";
import { responseExecutor } from "./response-executor";
import { incidentStore, SecurityIncident } from "../incident-store";
import { monitorStore } from "../monitor/monitor-store";

const STORAGE_KEY_ACTIONS = "cyberguard_response_actions";
const STORAGE_KEY_APPROVALS = "cyberguard_response_approvals";
const STORAGE_KEY_EXECUTIONS = "cyberguard_response_executions";
const STORAGE_KEY_AUDIT = "cyberguard_response_audit_logs";

class ResponseStore {
  private actions: ResponseAction[] = [];
  private approvals: ApprovalRequest[] = [];
  private executions: ResponseExecution[] = [];
  private auditLogs: ResponseAuditLog[] = [];

  constructor() {
    this.hydrateFromStorage();
    this.syncWithIncidents();
  }

  private hydrateFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const storedActions = localStorage.getItem(STORAGE_KEY_ACTIONS);
      if (storedActions) this.actions = JSON.parse(storedActions);

      const storedApprovals = localStorage.getItem(STORAGE_KEY_APPROVALS);
      if (storedApprovals) this.approvals = JSON.parse(storedApprovals);

      const storedExecutions = localStorage.getItem(STORAGE_KEY_EXECUTIONS);
      if (storedExecutions) this.executions = JSON.parse(storedExecutions);

      const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (storedAudit) this.auditLogs = JSON.parse(storedAudit);
    } catch {
      // Storage fallback
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(this.actions));
      localStorage.setItem(STORAGE_KEY_APPROVALS, JSON.stringify(this.approvals));
      localStorage.setItem(STORAGE_KEY_EXECUTIONS, JSON.stringify(this.executions));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs));
    } catch {
      // Storage fallback
    }
  }

  /**
   * Synchronizes with incidentStore:
   * Generates response recommendations for any incident that lacks them.
   * Enforces duplicate prevention: never creates identical actions for an incident.
   */
  public syncWithIncidents() {
    this.hydrateFromStorage();
    const incidents = incidentStore.getIncidents();

    let hasNewActions = false;

    for (const incident of incidents) {
      // Check existing actions for this incident
      const existingCategoriesForIncident = new Set(
        this.actions.filter((a) => a.incidentId === incident.id).map((a) => a.category)
      );

      const recommended = responseEngine.generateResponseActions(incident);

      for (const action of recommended) {
        if (!existingCategoriesForIncident.has(action.category)) {
          this.actions.unshift(action);
          existingCategoriesForIncident.add(action.category);
          hasNewActions = true;

          // If action requires approval, generate pending approval record
          if (action.requiresApproval) {
            this.approvals.unshift({
              id: `app-${action.id}`,
              responseActionId: action.id,
              incidentId: incident.id,
              requestedAt: action.createdAt,
              status: "PENDING",
              requestedFor: action.title,
            });
          }
        }
      }
    }

    if (hasNewActions) {
      this.saveToStorage();
    }
  }

  public getActions(filter?: {
    status?: string;
    category?: string;
    priority?: string;
    incidentId?: string;
    search?: string;
  }): ResponseAction[] {
    this.syncWithIncidents();

    return this.actions.filter((action) => {
      if (filter?.status && filter.status !== "ALL" && action.status !== filter.status) {
        return false;
      }
      if (filter?.category && filter.category !== "ALL" && action.category !== filter.category) {
        return false;
      }
      if (filter?.priority && filter.priority !== "ALL" && action.priority !== filter.priority) {
        return false;
      }
      if (filter?.incidentId && action.incidentId !== filter.incidentId) {
        return false;
      }
      if (filter?.search) {
        const query = filter.search.toLowerCase().trim();
        const matches =
          action.title.toLowerCase().includes(query) ||
          action.incidentId.toLowerCase().includes(query) ||
          action.target.value.toLowerCase().includes(query) ||
          action.category.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }

  public getActionById(id: string): ResponseAction | undefined {
    this.hydrateFromStorage();
    return this.actions.find((a) => a.id === id);
  }

  /**
   * Approves and executes a response action in simulated mode.
   */
  public async approveAction(
    actionId: string,
    actor: string = "Security Analyst (Active Console)",
    decisionNote?: string
  ): Promise<{ action: ResponseAction; execution: ResponseExecution }> {
    this.hydrateFromStorage();

    const action = this.actions.find((a) => a.id === actionId);
    if (!action) {
      throw new Error(`Response action with ID "${actionId}" not found.`);
    }

    if (action.status === "COMPLETED" || action.status === "SIMULATED") {
      throw new Error(`Response action has already been completed.`);
    }

    // Update approval record if exists
    const approval = this.approvals.find((app) => app.responseActionId === actionId);
    if (approval) {
      approval.status = "APPROVED";
      approval.approvedBy = actor;
      approval.approvedAt = new Date().toISOString();
      approval.decisionNote = decisionNote;
    }

    action.status = "EXECUTING";
    action.approvedBy = actor;
    action.approvedAt = new Date().toISOString();
    this.saveToStorage();

    // Execute via ResponseExecutor
    const { execution, auditLog } = await responseExecutor.executeAction(
      action,
      actor,
      decisionNote
    );

    action.status = "SIMULATED";
    action.executedAt = execution.startedAt;
    action.completedAt = execution.completedAt;
    action.result = execution.result;

    this.executions.unshift(execution);
    this.auditLogs.unshift(auditLog);

    this.saveToStorage();
    return { action, execution };
  }

  /**
   * Rejects a response action with an analyst reason note.
   */
  public rejectAction(
    actionId: string,
    actor: string = "Security Analyst (Active Console)",
    reason: string = "Rejected by analyst during triage review."
  ): ResponseAction {
    this.hydrateFromStorage();

    const action = this.actions.find((a) => a.id === actionId);
    if (!action) {
      throw new Error(`Response action with ID "${actionId}" not found.`);
    }

    const rejectionTimestamp = new Date().toISOString();

    const approval = this.approvals.find((app) => app.responseActionId === actionId);
    if (approval) {
      approval.status = "REJECTED";
      approval.rejectedBy = actor;
      approval.rejectedAt = rejectionTimestamp;
      approval.reason = reason;
    }

    action.status = "REJECTED";
    action.rejectedBy = actor;
    action.rejectionReason = reason;

    const auditLog: ResponseAuditLog = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      actionId: action.id,
      incidentId: action.incidentId,
      actionTitle: action.title,
      category: action.category,
      actor,
      decision: "REJECTED",
      timestamp: rejectionTimestamp,
      executionMode: "MANUAL",
      result: `Action rejected. Reason: ${reason}`,
      reason,
    };

    this.auditLogs.unshift(auditLog);
    this.saveToStorage();
    return action;
  }

  public getMetrics(): ResponseMetrics {
    this.syncWithIncidents();

    const totalActions = this.actions.length;
    const pendingApproval = this.actions.filter((a) => a.status === "PENDING_APPROVAL").length;
    const approvalRequired = this.actions.filter((a) => a.requiresApproval && a.status === "PENDING_APPROVAL").length;
    const inProgress = this.actions.filter((a) => a.status === "EXECUTING").length;
    const completed = this.actions.filter((a) => a.status === "COMPLETED").length;
    const simulated = this.actions.filter((a) => a.status === "SIMULATED").length;
    const failed = this.actions.filter((a) => a.status === "FAILED").length;
    const rejected = this.actions.filter((a) => a.status === "REJECTED").length;
    const highRiskAwaitingAction = this.actions.filter(
      (a) => (a.priority === "HIGH" || a.priority === "CRITICAL") && a.status === "PENDING_APPROVAL"
    ).length;

    return {
      totalActions,
      pendingApproval,
      approvalRequired,
      inProgress,
      completed,
      simulated,
      failed,
      rejected,
      highRiskAwaitingAction,
    };
  }

  public getAuditLogs(): ResponseAuditLog[] {
    this.hydrateFromStorage();
    return [...this.auditLogs];
  }

  public getExecutions(): ResponseExecution[] {
    this.hydrateFromStorage();
    return [...this.executions];
  }

  /**
   * Injects a scenario into the CYBERGUARD pipeline and returns generated response actions.
   */
  public async injectScenario(
    scenarioId: ResponseScenarioId
  ): Promise<{ incident?: SecurityIncident; actions: ResponseAction[] }> {
    this.hydrateFromStorage();

    switch (scenarioId) {
      case "phishing": {
        const incident = incidentStore.createIncident({
          title: "High-Confidence Credential Phishing Lure",
          source: "Message & URL Forensics",
          severity: "HIGH",
          riskScore: 84,
          confidence: 91,
          summary:
            "Deceptive communication impersonating corporate IT security requiring urgent credential verification on an unauthorized look-alike domain.",
          evidenceSnippets: [
            "Coercive urgency phrase: 'within 2 hours or access will be suspended'",
            "Look-alike hostname: 'verify-corporate-sso-gateway.xyz'",
            "Credential submission path '/login/verify' detected",
            "Mismatched DKIM/SPF origin header",
          ],
          recommendedPlaybook: "Quarantine message, sinkhole destination domain, and alert target audience.",
          attackChainStage: "Initial Contact",
          associatedUrl: "https://verify-corporate-sso-gateway.xyz/login/verify",
          associatedSender: "security-compliance@notifications-corp-portal.com",
          targetUrl: "https://verify-corporate-sso-gateway.xyz/login/verify",
        });

        this.syncWithIncidents();
        const actions = this.actions.filter((a) => a.incidentId === incident.id);
        return { incident, actions };
      }

      case "account-takeover": {
        // Trigger simulation in monitorStore, which creates an ATO alert and registers an incident
        await monitorStore.injectScenario("account-takeover");
        this.syncWithIncidents();
        const incidents = incidentStore.getIncidents();
        const latestInc = incidents[0];
        const actions = latestInc ? this.actions.filter((a) => a.incidentId === latestInc.id) : [];
        return { incident: latestInc, actions };
      }

      case "password-spraying": {
        await monitorStore.injectScenario("password-spraying");
        this.syncWithIncidents();
        const incidents = incidentStore.getIncidents();
        const latestInc = incidents[0];
        const actions = latestInc ? this.actions.filter((a) => a.incidentId === latestInc.id) : [];
        return { incident: latestInc, actions };
      }

      case "deepfake-media": {
        const incident = incidentStore.createIncident({
          title: "Synthetic Audio / Executive Voice Clone Alert",
          source: "Audio Forensics",
          severity: "CRITICAL",
          riskScore: 92,
          confidence: 89,
          summary:
            "Urgent voicemail purporting to be Chief Executive Officer directing an emergency out-of-band wire transfer. Neural acoustic artifacts indicate synthetic speech synthesis.",
          evidenceSnippets: [
            "Spectral continuity anomaly in vocal formant transitions (Confidence: 94%)",
            "Pitch contour variance aligns with generative diffusion model patterns",
            "High coercive urgency demanding bypassing standard compliance protocol",
          ],
          recommendedPlaybook: "Flag media asset, notify executive protection, and mandate out-of-band verification.",
          attackChainStage: "Impersonation / Coercion",
          targetAccount: "Finance & Accounts Payable",
        });

        this.syncWithIncidents();
        const actions = this.actions.filter((a) => a.incidentId === incident.id);
        return { incident, actions };
      }

      case "safe-event": {
        // Normal safe login event - should produce NO response actions
        await monitorStore.injectScenario("normal-login");
        this.syncWithIncidents();
        return { actions: [] };
      }

      default:
        return { actions: [] };
    }
  }

  public resetStore(): void {
    this.actions = [];
    this.approvals = [];
    this.executions = [];
    this.auditLogs = [];
    this.saveToStorage();
  }
}

export const responseStore = new ResponseStore();
