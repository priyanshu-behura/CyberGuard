/**
 * CYBERGUARD AI Assistant & Tool Calling Architecture
 * Type contracts for multi-turn conversations, dual assistant modes,
 * tool definitions, execution contexts, and report generation.
 */

import { RiskLevel } from "../security/identity-media/types";
import { SecurityIncident } from "../security/incident-store";
import { ResponseAction } from "../security/response/types";

export type AIAssistantMode = "general" | "cybersecurity";

export type AIMessageRole = "system" | "user" | "assistant" | "tool";

export type AIExecutionMode =
  | "REAL_AI_GEMINI"
  | "REAL_AI_OPENAI"
  | "HEURISTIC_RULE_BASED"
  | "DEMO_FALLBACK";

export interface ToolInvocation {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  status: "pending" | "success" | "error";
  executionTimeMs?: number;
  errorMessage?: string;
}

export interface IncidentReportData {
  incidentId: string;
  title: string;
  generatedAt: string;
  classification: string;
  severity: RiskLevel;
  riskScore: number;
  confidence: number;
  executiveSummary: string;
  technicalFindings: string[];
  timeline: { timestamp: string; event: string }[];
  impactAssessment: string;
  recommendedPlaybooks: string[];
  activeResponseActions: {
    category: string;
    status: string;
    requiresApproval: boolean;
  }[];
  limitationsAndGaps: string[];
}

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  mode?: AIAssistantMode;
  executionMode?: AIExecutionMode;
  modelIdentifier?: string;
  toolInvocations?: ToolInvocation[];
  suggestedFollowUps?: string[];
  evidenceSnippets?: string[];
  associatedIncidentId?: string;
  report?: IncidentReportData;
  riskAssessment?: {
    severity: RiskLevel;
    score: number;
    summary: string;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  mode: AIAssistantMode;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

export interface SecurityToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: string[];
      }
    >;
    required?: string[];
  };
  readOnly: boolean;
}

export interface AIProviderStatus {
  isConfigured: boolean;
  providerType: "gemini" | "heuristic";
  modelName: string;
  hasGeminiKey: boolean;
  activeModeLabel: string;
  notice?: string;
}
