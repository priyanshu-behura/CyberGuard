/**
 * CYBERGUARD IDENTITY & MEDIA INTELLIGENCE SCHEMA
 * Standardized data models for media forensics, synthetic media assessment,
 * digital impersonation verification, and incident correlation.
 */

export type MediaType = "image" | "video" | "audio" | "identity";

export type AuthenticityClassification =
  | "AUTHENTIC / NO STRONG MANIPULATION SIGNALS"
  | "POTENTIALLY MANIPULATED"
  | "LIKELY MANIPULATED"
  | "SYNTHETIC MEDIA SUSPECTED"
  | "INSUFFICIENT EVIDENCE"
  | "MODEL UNAVAILABLE";

export type RiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AnalysisSourceStatus {
  name: string;
  type: "local" | "metadata" | "ai_model" | "external";
  status: "available" | "unavailable" | "completed" | "skipped";
  note: string;
}

export interface ManipulationIndicator {
  id: string;
  name: string;
  category: "metadata" | "visual" | "temporal" | "audio" | "identity" | "model";
  severity: "info" | "low" | "medium" | "high" | "critical";
  scoreImpact: number;
  confidence: number;
  description: string;
  technicalDetails?: string;
  locationOrFrame?: string;
}

export interface MediaEvidenceItem {
  id: string;
  label: string;
  value: string | number | boolean;
  category:
    | "metadata"
    | "dimension"
    | "spectral"
    | "temporal"
    | "face"
    | "software"
    | "identity"
    | "url"
    | "intent";
  isSuspicious: boolean;
  severity?: "low" | "medium" | "high";
  explanation?: string;
}

export interface ModelProviderResult {
  providerName: string;
  configured: boolean;
  modelIdentifier?: string;
  status: "completed" | "not_configured" | "failed" | "unsupported";
  syntheticScore?: number; // 0 to 1
  manipulationTypeDetected?: string;
  explanation?: string;
  rawResponse?: Record<string, unknown>;
}

export interface IdentityAssessmentResult {
  claimedIdentity: string;
  claimedOrganization?: string;
  claimCategory:
    | "authority"
    | "executive"
    | "financial_institution"
    | "university_teacher"
    | "support_agent"
    | "friend_family"
    | "general_unknown";
  communicationStyleRisk: "low" | "medium" | "high";
  urgencyDetected: boolean;
  financialRequestDetected: boolean;
  credentialRequestDetected: boolean;
  channelDiscrepancy: boolean;
  destinationUrl?: string;
  domainDiscrepancyDetected?: boolean;
  threatIntentsDetected?: string[];
  assessmentSummary: string;
  consistencyVerdict:
    | "CONSISTENT"
    | "POTENTIALLY INCONSISTENT"
    | "LIKELY IMPERSONATION"
    | "INSUFFICIENT EVIDENCE"
    | "SUSPICIOUS_ANOMALIES"
    | "POTENTIAL_IMPERSONATION"
    | "HIGH_CONFIDENCE_IMPERSONATION";
}

export interface UnifiedMediaAnalysisResult {
  id: string;
  type: MediaType;
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  timestamp: string;
  status: "completed" | "failed" | "partial";
  classification: AuthenticityClassification;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0 - 100
  confidenceType: "Heuristic confidence" | "AI Model confidence" | "Hybrid confidence";
  summary: string;
  indicators: ManipulationIndicator[];
  evidence: MediaEvidenceItem[];
  metadata: {
    dimensions?: { width: number; height: number };
    durationSeconds?: number;
    sampleRateHz?: number;
    channels?: number;
    cameraMake?: string;
    cameraModel?: string;
    software?: string;
    createdDate?: string;
    modifiedDate?: string;
    hasGps?: boolean;
    formatSpecific?: Record<string, unknown>;
  };
  modelResults: ModelProviderResult;
  identityAssessment?: IdentityAssessmentResult;
  recommendedActions: string[];
  analysisSources: AnalysisSourceStatus[];
  associatedIncidentId?: string;
}
