/**
 * CYBERGUARD Common Threat Detection Engine - Data Contracts & Types
 */

export type RiskLevel = "Safe" | "Low" | "Medium" | "High" | "Critical";
export type ThreatSeverity = RiskLevel;

export type UrlThreatClassification =
  | "Safe URL"
  | "Suspicious URL"
  | "Potential Phishing URL"
  | "Malicious URL";

export type MessageThreatClassification =
  | "Safe Communication"
  | "Suspicious Communication"
  | "Phishing / Social Engineering"
  | "Malicious Communication";

export type ThreatClassification = UrlThreatClassification | MessageThreatClassification;

export type IndicatorSeverity = "low" | "medium" | "high" | "critical";

export type MessageRiskLevel = RiskLevel;
export type MessageIndicatorSeverity = IndicatorSeverity;
export type TechnicalDetails = UrlTechnicalDetails;
export type MessageThreatIndicator = ThreatIndicator;
export type MessageRecommendedAction = RecommendedAction;

export type IndicatorCategory =
  | "domain"
  | "protocol"
  | "path"
  | "query"
  | "structure"
  | "obfuscation"
  | "reputation"
  | "urgency"
  | "credential_request"
  | "suspicious_link"
  | "impersonation"
  | "threat"
  | "reward"
  | "sender"
  | "anomaly"
  | "security_context"
  | "social_engineering"
  | "correlation";

export interface ThreatIndicator {
  id: string;
  type?: string;
  title: string;
  description: string;
  severity: IndicatorSeverity;
  category: IndicatorCategory;
  evidenceSnippet?: string;
  scoreContribution?: number;
  explanation?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: "urgent" | "recommended" | "standard";
}

export interface UrlEvidence {
  rawUrl: string;
  protocol: string;
  hostname: string;
  domain: string;
  tld: string;
  port: string | null;
  pathname: string;
  searchParams: Record<string, string>;
  isIpHost: boolean;
  isHttps: boolean;
  subdomain?: string;
  fragment?: string;
  timestamp: string;
}

export interface UrlTechnicalDetails {
  normalizedUrl: string;
  evaluationsCount: number;
  analysisMethod: string;
  riskCalculationFactors: string[];
  executionTimeMs: number;
  protocol: string;
  hostname: string;
  rootDomain: string;
  subdomain: string;
  port: string | null;
  queryParamCount: number;
  isIpAddress: boolean;
  detectedSignals: string[];
}

export interface UrlAnalysisResult {
  url: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  severity?: RiskLevel;
  classification: UrlThreatClassification;
  summary: string;
  explanation: string;
  indicators: ThreatIndicator[];
  evidence: UrlEvidence;
  recommendedActions: RecommendedAction[];
  technicalDetails: UrlTechnicalDetails;
  confidence?: number;
  isDemo: boolean;
}

export type MessageType = "auto" | "email" | "sms" | "social" | "chat" | "other";

export interface ExtractedUrlInfo {
  url: string;
  analysis: UrlAnalysisResult;
}

export interface MessageEvidence {
  rawMessage: string;
  detectedType: string;
  sender?: string;
  detectedPhrases: string[];
  extractedUrls: ExtractedUrlInfo[];
  detectedRequests: string[];
  timestamp: string;
}

export interface MessageTechnicalDetails {
  messageLength: number;
  messageType: string;
  evaluationsCount: number;
  extractedUrlsCount: number;
  detectionSignals: string[];
  riskCalculationFactors: string[];
  analysisMethod: string;
  engineStatus: string;
  executionTimeMs: number;
  correlationSignals?: string[];
}

export interface MessageAnalysisResult {
  message: string;
  sender?: string;
  messageType: MessageType;
  detectedType: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  severity?: RiskLevel;
  classification: MessageThreatClassification;
  summary: string;
  explanation: string;
  indicators: ThreatIndicator[];
  evidence: MessageEvidence;
  recommendedActions: RecommendedAction[];
  technicalDetails: MessageTechnicalDetails;
  confidence?: number;
  isDemo: boolean;
}

/**
 * Unified common analysis result as requested by Requirement 8
 */
export interface CommonThreatResult {
  input: string;
  analysisType: "url" | "message";
  classification: ThreatClassification;
  score: number; // 0 to 100
  severity: RiskLevel;
  confidence: number; // 0.0 to 1.0
  summary: string;
  explanation: string;
  indicators: ThreatIndicator[];
  evidence: UrlEvidence | MessageEvidence;
  extractedUrls?: ExtractedUrlInfo[];
  recommendedActions: RecommendedAction[];
  technicalDetails: UrlTechnicalDetails | MessageTechnicalDetails;
  isDemo: boolean;
}

export interface DemoMessageCase {
  id: string;
  label: string;
  category: "safe" | "suspicious" | "phishing";
  messageType: MessageType;
  sender?: string;
  content: string;
  expectedOutcome: string;
}

