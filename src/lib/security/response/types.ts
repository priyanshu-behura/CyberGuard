/**
 * CYBERGUARD Intelligent Response Center - Data Contracts & Types
 * Reusable structures for response actions, human approvals, simulation executions,
 * and audit logs.
 */

export type ResponseCategory =
  | "BLOCK_URL"
  | "QUARANTINE_EMAIL"
  | "WARN_USER"
  | "REQUIRE_MFA"
  | "REVOKE_SESSION"
  | "RESET_CREDENTIAL"
  | "BLOCK_IP"
  | "BLOCK_DEVICE"
  | "FLAG_MEDIA"
  | "REPORT_IMPERSONATION"
  | "NOTIFY_ADMIN"
  | "NOTIFY_SOC"
  | "ESCALATE_INCIDENT"
  | "MONITOR";

export type ResponseStatus =
  | "RECOMMENDED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "SIMULATED";

export type ExecutionMode = "REAL" | "SIMULATED" | "MANUAL";

export type ResponseSource =
  | "RULE_ENGINE"
  | "HEURISTIC"
  | "AI_ANALYSIS"
  | "EXTERNAL_INTELLIGENCE"
  | "DEMO";

export type ResponsePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ResponseSeverity = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ResponseAction {
  id: string; // e.g. act-2026-001
  incidentId: string; // e.g. INC-001
  title: string;
  description: string;
  category: ResponseCategory;
  severity: ResponseSeverity;
  priority: ResponsePriority;
  target: {
    type: "ACCOUNT" | "URL" | "IP" | "DEVICE" | "MESSAGE" | "MEDIA" | "SERVICE";
    value: string;
    label?: string;
  };
  reason: string;
  evidence: string[];
  requiresApproval: boolean;
  status: ResponseStatus;
  createdAt: string;
  approvedAt?: string;
  executedAt?: string;
  completedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  result?: string;
  executionMode: ExecutionMode;
  source: ResponseSource;
  potentialImpact: string;
  whyExplanation: {
    whatHappened: string;
    whyRisky: string;
    whatShouldBeDone: string;
    whyThisAction: string;
    whatHappensIfApproved: string;
    isApprovalRequired: boolean;
  };
}

export interface ApprovalRequest {
  id: string; // e.g. app-001
  responseActionId: string;
  incidentId: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  requestedFor: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  reason?: string;
  decisionNote?: string;
}

export interface ResponseExecution {
  id: string;
  responseActionId: string;
  incidentId: string;
  startedAt: string;
  completedAt: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SIMULATED";
  executionMode: ExecutionMode;
  message: string;
  result: string;
  performedBy: string;
  simulationDetails: {
    mockEndpoint?: string;
    simulatedParameters?: Record<string, any>;
    disclaimer: string;
  };
}

export interface ResponseAuditLog {
  id: string;
  actionId: string;
  incidentId: string;
  actionTitle: string;
  category: ResponseCategory;
  actor: string;
  decision: "APPROVED" | "REJECTED" | "EXECUTED_SIMULATION" | "EXECUTED_REAL" | "FAILED";
  timestamp: string;
  executionMode: ExecutionMode;
  result: string;
  reason?: string;
}

export interface ResponseMetrics {
  totalActions: number;
  pendingApproval: number;
  approvalRequired: number;
  inProgress: number;
  completed: number;
  simulated: number;
  failed: number;
  rejected: number;
  highRiskAwaitingAction: number;
}

export type ResponseScenarioId =
  | "phishing"
  | "account-takeover"
  | "password-spraying"
  | "deepfake-media"
  | "safe-event";
