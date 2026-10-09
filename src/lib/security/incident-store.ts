/**
 * CYBERGUARD Unified Security Event & Incident Store
 * Manages analysis history, automated incident creation for High/Critical threats,
 * and correlation for Dashboard and Attack Chains.
 */

import { UnifiedMediaAnalysisResult, MediaType, RiskLevel } from "./identity-media/types";

export interface SecurityIncident {
  id: string; // e.g. INC-001
  title: string;
  source: string; // e.g. "Image Forensics", "Video Analysis", "Digital Impersonation"
  mediaType?: MediaType;
  severity: RiskLevel;
  riskScore: number;
  confidence: number;
  status: "New" | "Investigating" | "Response Recommended" | "Response Approved" | "Contained" | "Closed";
  summary: string;
  evidenceSnippets: string[];
  recommendedPlaybook: string;
  timestamp: string;
  attackChainStage: "Reconnaissance" | "Initial Contact" | "Impersonation / Coercion" | "Action Execution";
  associatedUrl?: string;
  associatedSender?: string;
  targetAccount?: string;
  targetIp?: string;
  targetUrl?: string;
  threatCategory?: string;
  responseActionIds?: string[];
}

export interface SecurityMetrics {
  totalAnalyzed: number;
  mediaAnalyzed: number;
  potentialDeepfakes: number;
  impersonationAttempts: number;
  highRiskAlerts: number;
  activeIncidentsCount: number;
}

const STORAGE_KEY_ANALYSES = "cyberguard_media_analyses";
const STORAGE_KEY_INCIDENTS = "cyberguard_incidents";

export const DEFAULT_INCIDENTS: SecurityIncident[] = [
  {
    id: "INC-001",
    title: "Executive Video Deepfake & Voice Impersonation Attempt",
    source: "Video Analysis & Identity Engine",
    mediaType: "video",
    severity: "CRITICAL",
    riskScore: 94,
    confidence: 96,
    status: "Investigating",
    summary: "Synthetic facial reenactment and cloned voice biometric detected targeting corporate treasury finance approval.",
    evidenceSnippets: [
      "Facial boundary warping index exceeds 0.88 standard deviation across frames 120-480.",
      "Acoustic frequency spectrum shows lack of human micro-tremor and synthetic vocoder phase artifacts.",
      "Communication metadata originates from external unverified Telegram gateway impersonating CFO."
    ],
    recommendedPlaybook: "Isolate communication channel, notify SecOps lead, and revoke active authentication tokens.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    attackChainStage: "Impersonation / Coercion",
    targetAccount: "cfo.finance@cyberguard.internal",
    targetIp: "185.220.101.5",
    associatedSender: "telegram:cfo_internal_direct",
    threatCategory: "Deepfake Impersonation",
    responseActionIds: []
  },
  {
    id: "INC-002",
    title: "Credential Harvesting via Lookalike Domain",
    source: "Phishing Detection Engine",
    severity: "HIGH",
    riskScore: 82,
    confidence: 89,
    status: "Response Recommended",
    summary: "Suspicious outbound link detected in spear-phishing email masquerading as corporate single sign-on portal.",
    evidenceSnippets: [
      "Target URL: https://login.cybergu-ard.com/oauth/authorize uses homoglyph character spoofing.",
      "SSL certificate issued within the last 48 hours by Let's Encrypt with no organization validation.",
      "HTML form targets external exfiltration endpoint: 198.51.100.42:8443/collector."
    ],
    recommendedPlaybook: "Sinkhole lookalike domain at corporate DNS resolver, block URL on egress perimeter, warn recipients.",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    attackChainStage: "Initial Contact",
    targetAccount: "devops-team@cyberguard.internal",
    targetUrl: "https://login.cybergu-ard.com/oauth/authorize",
    targetIp: "198.51.100.42",
    associatedSender: "security-update@cybergu-ard.com",
    threatCategory: "Credential Phishing",
    responseActionIds: []
  },
  {
    id: "INC-003",
    title: "Account Takeover & MFA Push Fatigue Storm",
    source: "Monitor & Behavior Engine",
    severity: "HIGH",
    riskScore: 78,
    confidence: 91,
    status: "New",
    summary: "Multiple consecutive rapid push notification prompts followed by anomalous login session establishment from foreign ASN.",
    evidenceSnippets: [
      "14 repeated Duo MFA pushes triggered in 180 seconds across non-working hours.",
      "Anomalous session established from IP 45.154.255.89 (Tor Exit Relay / AS208312).",
      "User-Agent mismatch: macOS Safari session initiated immediately following Windows Chrome credential check."
    ],
    recommendedPlaybook: "Revoke active OAuth tokens, force password reset, enforce hardware FIDO2 key step-up.",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    attackChainStage: "Action Execution",
    targetAccount: "lead.engineer@cyberguard.internal",
    targetIp: "45.154.255.89",
    threatCategory: "Account Takeover",
    responseActionIds: []
  }
];

class IncidentStore {
  private analysesMemory: UnifiedMediaAnalysisResult[] = [];
  private incidentsMemory: SecurityIncident[] = [...DEFAULT_INCIDENTS];
  private incidentCounter = DEFAULT_INCIDENTS.length + 1;

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window === "undefined") {
      if (this.incidentsMemory.length === 0) {
        this.incidentsMemory = [...DEFAULT_INCIDENTS];
        this.incidentCounter = DEFAULT_INCIDENTS.length + 1;
      }
      return;
    }
    try {
      const storedAnalyses = localStorage.getItem(STORAGE_KEY_ANALYSES);
      if (storedAnalyses) {
        this.analysesMemory = JSON.parse(storedAnalyses);
      }
      const storedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (storedIncidents) {
        this.incidentsMemory = JSON.parse(storedIncidents);
        this.incidentCounter = this.incidentsMemory.length + 1;
      } else {
        this.incidentsMemory = [...DEFAULT_INCIDENTS];
        this.incidentCounter = DEFAULT_INCIDENTS.length + 1;
        this.saveToStorage();
      }
    } catch {
      if (this.incidentsMemory.length === 0) {
        this.incidentsMemory = [...DEFAULT_INCIDENTS];
        this.incidentCounter = DEFAULT_INCIDENTS.length + 1;
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(this.analysesMemory));
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(this.incidentsMemory));
    } catch {
      // Storage fallback
    }
  }

  /**
   * Registers a newly completed media or identity analysis.
   * If risk is HIGH or CRITICAL, automatically generates a verified incident.
   */
  public registerAnalysis(result: UnifiedMediaAnalysisResult): {
    analysis: UnifiedMediaAnalysisResult;
    incident?: SecurityIncident;
  } {
    this.hydrateFromStorage();

    let createdIncident: SecurityIncident | undefined;

    if (result.riskLevel === "HIGH" || result.riskLevel === "CRITICAL") {
      const incNum = String(this.incidentCounter++).padStart(3, "0");
      const incId = `INC-${incNum}`;

      let sourceTitle = "Media Authenticity Alert";
      let chainStage: SecurityIncident["attackChainStage"] = "Initial Contact";

      if (result.type === "identity") {
        sourceTitle = "Potential Digital Impersonation";
        chainStage = "Impersonation / Coercion";
      } else if (result.type === "video") {
        sourceTitle = "Synthetic Video / Deepfake Detected";
        chainStage = "Initial Contact";
      } else if (result.type === "audio") {
        sourceTitle = "Synthetic Audio / Voice Clone Alert";
        chainStage = "Impersonation / Coercion";
      } else if (result.type === "image") {
        sourceTitle = "Manipulated Image / Synthetic Persona";
        chainStage = "Reconnaissance";
      }

      createdIncident = {
        id: incId,
        title: sourceTitle,
        source: `${result.type.toUpperCase()} Analysis`,
        mediaType: result.type,
        severity: result.riskLevel,
        riskScore: result.riskScore,
        confidence: result.confidence,
        status: "New",
        summary: result.summary,
        evidenceSnippets: result.indicators.map((i) => `${i.name}: ${i.description}`),
        recommendedPlaybook: result.recommendedActions[0] || "Review asset verification guidelines.",
        timestamp: result.timestamp,
        attackChainStage: chainStage,
      };

      result.associatedIncidentId = incId;
      this.incidentsMemory.unshift(createdIncident);
    }

    // Keep up to 50 recent records
    this.analysesMemory.unshift(result);
    if (this.analysesMemory.length > 50) this.analysesMemory.pop();
    if (this.incidentsMemory.length > 50) this.incidentsMemory.pop();

    this.saveToStorage();
    return { analysis: result, incident: createdIncident };
  }

  public getAnalyses(): UnifiedMediaAnalysisResult[] {
    this.hydrateFromStorage();
    return [...this.analysesMemory];
  }

  public getIncidents(): SecurityIncident[] {
    this.hydrateFromStorage();
    return [...this.incidentsMemory];
  }

  public getMetrics(): SecurityMetrics {
    this.hydrateFromStorage();

    const mediaList = this.analysesMemory;
    const incList = this.incidentsMemory;

    const potentialDeepfakes = mediaList.filter(
      (m) =>
        m.classification === "SYNTHETIC MEDIA SUSPECTED" ||
        m.classification === "LIKELY MANIPULATED"
    ).length;

    const impersonationAttempts = mediaList.filter(
      (m) =>
        m.type === "identity" &&
        (m.riskLevel === "HIGH" || m.riskLevel === "CRITICAL")
    ).length;

    const highRiskAlerts = mediaList.filter(
      (m) => m.riskLevel === "HIGH" || m.riskLevel === "CRITICAL"
    ).length;

    const activeIncidentsCount = incList.filter((i) => i.status !== "Closed").length;

    return {
      totalAnalyzed: mediaList.length,
      mediaAnalyzed: mediaList.filter((m) => m.type !== "identity").length,
      potentialDeepfakes,
      impersonationAttempts,
      highRiskAlerts,
      activeIncidentsCount,
    };
  }

  public getIncidentById(id: string): SecurityIncident | undefined {
    this.hydrateFromStorage();
    return this.incidentsMemory.find((inc) => inc.id === id);
  }

  public updateIncidentStatus(
    id: string,
    status: SecurityIncident["status"],
    responseActionId?: string
  ): SecurityIncident | undefined {
    this.hydrateFromStorage();
    const inc = this.incidentsMemory.find((i) => i.id === id);
    if (inc) {
      inc.status = status;
      if (responseActionId) {
        inc.responseActionIds = inc.responseActionIds || [];
        if (!inc.responseActionIds.includes(responseActionId)) {
          inc.responseActionIds.push(responseActionId);
        }
      }
      this.saveToStorage();
    }
    return inc;
  }

  public createIncident(data: Partial<SecurityIncident> & { title: string; severity: RiskLevel; summary: string }): SecurityIncident {
    this.hydrateFromStorage();
    const incNum = String(this.incidentCounter++).padStart(3, "0");
    const incId = data.id || `INC-${incNum}`;

    const newInc: SecurityIncident = {
      id: incId,
      title: data.title,
      source: data.source || "Security Alert Engine",
      mediaType: data.mediaType,
      severity: data.severity,
      riskScore: data.riskScore ?? (data.severity === "CRITICAL" ? 92 : 78),
      confidence: data.confidence ?? 85,
      status: data.status || "New",
      summary: data.summary,
      evidenceSnippets: data.evidenceSnippets || [],
      recommendedPlaybook: data.recommendedPlaybook || "Initiate standard containment protocol.",
      timestamp: data.timestamp || new Date().toISOString(),
      attackChainStage: data.attackChainStage || "Initial Contact",
      associatedUrl: data.associatedUrl,
      associatedSender: data.associatedSender,
      targetAccount: data.targetAccount,
      targetIp: data.targetIp,
      targetUrl: data.targetUrl,
      threatCategory: data.threatCategory,
      responseActionIds: data.responseActionIds || [],
    };

    this.incidentsMemory.unshift(newInc);
    if (this.incidentsMemory.length > 50) this.incidentsMemory.pop();
    this.saveToStorage();
    return newInc;
  }

  public clearAll() {
    this.analysesMemory = [];
    this.incidentsMemory = [];
    this.incidentCounter = 1;
    this.saveToStorage();
  }
}

export const incidentStore = new IncidentStore();
