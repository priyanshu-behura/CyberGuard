/**
 * CYBERGUARD Multi-Vector Threat Correlation Engine
 *
 * Implements the cross-signal correlation layer:
 * Evaluates the interaction between communication lures (urgency, account threats,
 * security alerts, credential demands, authority claims) and technical infrastructure
 * signals (look-alike domains, credential paths, unencrypted transport).
 */

import { ThreatIndicator, ExtractedUrlInfo, RiskLevel } from "./types";
import { INDICATOR_TYPES, createThreatIndicator } from "./indicators";

export interface MessageSignals {
  hasStrongUrgency: boolean;
  hasMildUrgency: boolean;
  hasSecurityContext: boolean;
  hasAccountThreat: boolean;
  hasCredentialRequest: boolean;
  hasVerificationNotice: boolean;
  hasRewardLure: boolean;
  hasAuthorityClaim: boolean;
  hasSenderAnomaly: boolean;
  hasSocialEngineering: boolean;
  authorityName?: string;
  mentionedBrands: string[];
  detectedPhrases: string[];
  sender?: string;
}

export interface CorrelationResult {
  scoreBoost: number;
  correlatedIndicators: ThreatIndicator[];
  correlationSignals: string[];
  confidence: number;
  syntheticExplanation: string;
  syntheticSummary: string;
}

export function correlateThreatSignals(
  messageSignals: MessageSignals,
  extractedUrls: ExtractedUrlInfo[],
  baseMessageScore: number
): CorrelationResult {
  let scoreBoost = 0;
  const correlatedIndicators: ThreatIndicator[] = [];
  const correlationSignals: string[] = [];

  const highestUrlRisk = extractedUrls.reduce<RiskLevel>((acc, item) => {
    const risk = item.analysis.riskLevel;
    if (risk === "Critical") return "Critical";
    if (risk === "High" && acc !== "Critical") return "High";
    if (risk === "Medium" && acc !== "Critical" && acc !== "High") return "Medium";
    if (risk === "Low" && acc === "Safe") return "Low";
    return acc;
  }, "Safe");

  const hasHighOrCriticalUrl = highestUrlRisk === "Critical" || highestUrlRisk === "High";
  const hasMediumUrl = highestUrlRisk === "Medium";
  const hasAnySuspiciousUrl = hasHighOrCriticalUrl || hasMediumUrl;

  // Collect all URL indicators across extracted links
  const allUrlIndicators = extractedUrls.flatMap((u) => u.analysis.indicators);
  const hasBrandImpersonationUrl = allUrlIndicators.some(
    (i) => i.type === INDICATOR_TYPES.BRAND_IMPERSONATION || i.type === INDICATOR_TYPES.LOOKALIKE_DOMAIN
  );
  const hasCredentialPathUrl = allUrlIndicators.some(
    (i) => i.type === INDICATOR_TYPES.CREDENTIAL_PATH
  );
  const hasSuspiciousSubdomainUrl = allUrlIndicators.some(
    (i) => i.type === INDICATOR_TYPES.SUSPICIOUS_SUBDOMAIN
  );

  // ---------------------------------------------------------------------------
  // Correlation Pattern 1: Coordinated Phishing Attack Chain
  // [Urgency / Threat] + [Credential Request] + [Look-Alike URL] + [Login Path]
  // ---------------------------------------------------------------------------
  if (
    (messageSignals.hasAccountThreat || messageSignals.hasStrongUrgency) &&
    messageSignals.hasCredentialRequest &&
    hasBrandImpersonationUrl &&
    hasCredentialPathUrl
  ) {
    scoreBoost += 20;
    correlationSignals.push("Full-vector credential phishing attack chain verified");
    correlatedIndicators.push(
      createThreatIndicator({
        id: "corr_full_phishing_chain",
        type: INDICATOR_TYPES.CORRELATED_PHISHING_VECTOR,
        title: "High-Confidence Phishing Attack Chain",
        description:
          "High correlation across independent threat vectors: psychological coercion (urgency/threat), explicit credential demand, and a brand-impersonating destination URL hosting a credential login path.",
        severity: "critical",
        category: "correlation",
        scoreContribution: 20,
        explanation:
          "Multiple independent signals (social-engineering coercion + deceptive brand infrastructure + credential harvesting path) corroborate high-confidence targeted phishing.",
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Correlation Pattern 2: Brand Impersonation Synergy
  // Message references brand X AND extracted URL is an impersonation/look-alike
  // ---------------------------------------------------------------------------
  else if (hasBrandImpersonationUrl && (messageSignals.mentionedBrands.length > 0 || messageSignals.hasAccountThreat)) {
    scoreBoost += 15;
    correlationSignals.push("Brand lure matches deceptive look-alike URL");
    correlatedIndicators.push(
      createThreatIndicator({
        id: "corr_brand_lure_synergy",
        type: INDICATOR_TYPES.CORRELATED_PHISHING_VECTOR,
        title: "Correlated Brand Impersonation Lure",
        description:
          "The communication uses brand authority claims or account alerts designed to drive recipients to an unauthorized look-alike domain.",
        severity: "high",
        category: "correlation",
        scoreContribution: 15,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Correlation Pattern 3: Credential Harvesting Vector
  // Message requests password/OTP/verification AND URL leads to credential path
  // ---------------------------------------------------------------------------
  else if (messageSignals.hasCredentialRequest && (hasCredentialPathUrl || hasHighOrCriticalUrl)) {
    scoreBoost += 15;
    correlationSignals.push("Credential demand correlated with login destination link");
    correlatedIndicators.push(
      createThreatIndicator({
        id: "corr_cred_harvest_vector",
        type: INDICATOR_TYPES.CORRELATED_PHISHING_VECTOR,
        title: "Credential Harvesting Lure",
        description:
          "The communication prompts for credentials or authentication codes while directing to a third-party login or verification endpoint.",
        severity: "high",
        category: "correlation",
        scoreContribution: 15,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Correlation Pattern 4: Security Context + Urgency + Suspicious Destination Link
  // (e.g. "recent sign-in" + "within 24 hours" + security-themed external URL)
  // ---------------------------------------------------------------------------
  else if (
    messageSignals.hasSecurityContext &&
    (messageSignals.hasStrongUrgency || messageSignals.hasMildUrgency) &&
    (hasAnySuspiciousUrl || hasSuspiciousSubdomainUrl || hasCredentialPathUrl)
  ) {
    scoreBoost += 0;
    correlationSignals.push("Account security alert paired with urgency and unverified destination link");
    correlatedIndicators.push(
      createThreatIndicator({
        id: "corr_security_urgency_lure",
        type: INDICATOR_TYPES.CORRELATED_PHISHING_VECTOR,
        title: "Correlated Account Security Lure",
        description:
          "The message pairs an account security notice ('recent sign-in / activity') with artificial time pressure and an unverified external destination URL.",
        severity: "medium",
        category: "correlation",
        scoreContribution: 0,
        explanation:
          "Multiple signals corroborate a security-themed social-engineering lure: security notice context, a 24-hour deadline, and an external destination link.",
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Correlation Pattern 5: Coercive Redirection
  // Artificial urgency/threat paired with suspicious or unverified link
  // ---------------------------------------------------------------------------
  else if ((messageSignals.hasStrongUrgency || messageSignals.hasAccountThreat) && hasHighOrCriticalUrl) {
    scoreBoost += 10;
    correlationSignals.push("Artificial urgency paired with suspicious destination URL");
    correlatedIndicators.push(
      createThreatIndicator({
        id: "corr_coercive_redirection",
        type: INDICATOR_TYPES.CORRELATED_PHISHING_VECTOR,
        title: "Coercive Pressure with Suspicious Link",
        description:
          "The message employs artificial urgency or suspension threats to bypass user scrutiny before clicking a suspicious link.",
        severity: "medium",
        category: "correlation",
        scoreContribution: 10,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Confidence Calculation
  // ---------------------------------------------------------------------------
  let confidence = 0.7;
  const activeVectors = [
    messageSignals.hasStrongUrgency || messageSignals.hasMildUrgency,
    messageSignals.hasSecurityContext,
    messageSignals.hasAccountThreat,
    messageSignals.hasCredentialRequest || messageSignals.hasVerificationNotice,
    messageSignals.hasAuthorityClaim,
    messageSignals.hasRewardLure,
    hasHighOrCriticalUrl,
    hasMediumUrl,
    hasBrandImpersonationUrl,
    hasCredentialPathUrl,
    messageSignals.hasSenderAnomaly,
  ].filter(Boolean).length;

  if (activeVectors >= 4) {
    confidence = 0.96;
  } else if (activeVectors >= 3) {
    confidence = 0.91;
  } else if (activeVectors >= 2) {
    confidence = 0.85;
  } else if (activeVectors === 0 && extractedUrls.length <= 1) {
    confidence = 0.95; // Confident in benign classification
  }

  // ---------------------------------------------------------------------------
  // Dynamic Summary & Explanation Generation
  // ---------------------------------------------------------------------------
  let syntheticSummary = "";
  let syntheticExplanation = "";

  const effectiveTotal = baseMessageScore + scoreBoost;

  if (effectiveTotal >= 85 || (hasBrandImpersonationUrl && messageSignals.hasCredentialRequest)) {
    syntheticSummary =
      "This communication combines urgency, account-related threats, credential requests and a suspicious destination.";
    syntheticExplanation =
      "Multi-vector analysis confirms an active social-engineering campaign. The message employs psychological coercion (such as threats of immediate account termination) alongside direct credential demands, directing recipients to deceptive infrastructure designed to harvest user credentials.";
  } else if (effectiveTotal >= 70 || hasBrandImpersonationUrl) {
    syntheticSummary =
      "High-risk communication with deceptive brand impersonation or coercive authentication requests.";
    syntheticExplanation =
      "This communication exhibits high-risk indicators such as brand impersonation lures, credential demands, or deceptive subdomains designed to capture account access.";
  } else if (effectiveTotal >= 40 || hasAnySuspiciousUrl || messageSignals.hasSecurityContext) {
    syntheticSummary =
      "Suspicious communication exhibiting time-sensitive demands or unverified security review links.";
    syntheticExplanation =
      "The message exhibits social-engineering characteristics including security alert priming, time pressure, and links to unverified external infrastructure. Users should review account security through official applications rather than following embedded links.";
  } else if (effectiveTotal > 0 || correlatedIndicators.length > 0) {
    syntheticSummary =
      "Communication contains mild warning indicators or non-standard external references.";
    syntheticExplanation =
      "Non-critical signals were identified. While not definitively malicious, caution is advised when interacting with external references.";
  } else {
    syntheticSummary =
      "No deceptive social-engineering tactics, artificial urgency pressure, or credential requests detected.";
    syntheticExplanation =
      "The communication contains neutral, routine syntax without artificial urgency, threats of account suspension, or links to deceptive infrastructure.";
  }

  return {
    scoreBoost,
    correlatedIndicators,
    correlationSignals,
    confidence,
    syntheticExplanation,
    syntheticSummary,
  };
}
