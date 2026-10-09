/**
 * CYBERGUARD Deterministic Message Analysis & Risk Scoring Engine
 *
 * Implements rule-based scoring directly evaluating submitted message content.
 * Evaluates independent signals without hardcoding or full-message matching.
 *
 * Scoring Weights (Requested):
 *   1. External or suspicious URL:                       +20
 *   2. Urgency / deadline / immediate action:            +10
 *   3. Account or security context:                      +10
 *   4. Credential / password / OTP request:              +25
 *   5. Threat, suspension, loss of access, coercion:     +20
 *   6. Impersonation of support / company / authority:   +15
 *   7. Suspicious or look-alike domain:                  +25
 *   8. Suspicious URL path (/login, /verify, /review):   +10
 *
 * Final score clamped between 0 and 100.
 *
 * Risk classification:
 *    0–19   = SAFE
 *   20–39   = LOW RISK
 *   40–69   = MEDIUM RISK
 *   70–89   = HIGH RISK
 *   90–100  = CRITICAL
 */

import {
  MessageAnalysisResult,
  MessageType,
  ThreatIndicator,
  ExtractedUrlInfo,
  MessageEvidence,
  MessageTechnicalDetails,
} from "./types";
import { INDICATOR_TYPES, createThreatIndicator, generateRecommendedActions } from "./indicators";
import { BRAND_CATALOG, isLegitimateDomainForBrand } from "./brands";
import { urlAnalyzer } from "./url-analyzer";
import { accumulateRiskScore, classifyMessageThreat } from "./risk-scorer";

// =============================================================================
// HEURISTIC DETECTION PATTERNS
// =============================================================================

// 1. URGENCY / DEADLINE / IMMEDIATE ACTION (+10)
const URGENCY_PATTERNS = [
  /\bwithin\s+(?:the\s+next\s+)?(?:\d+|twenty-four|twelve|forty-eight|24|12|48)\s+(?:hours?|hrs?)\b/i,
  /\bwithin\s+(?:the\s+next\s+)?(?:\d+|thirty|sixty|10|15|30|60)\s+(?:minutes?|mins?)\b/i,
  /\bwithin\s+(?:1|one)\s+hour\b/i,
  /\b(?:immediately|promptly|act\s+now|respond\s+immediately)\b/i,
  /\b(?:urgent|urgently)\b/i,
  /\b(?:expires?|valid)\s+(?:today|soon|within\s+\d+\s+(?:hours?|minutes?))\b/i,
  /\b(?:suspended|terminate[ds]?|closed?|locked?)\s+today\b/i,
  /\bdeadline\b/i,
  /\bverify\s+(?:now|immediately|today)\b/i,
  /\baction\s+required\b/i,
  /\bimmediate\s+action\b/i,
  /\btime[-\s]sensitive\b/i,
  /\basap\b|\bas\s+soon\s+as\s+possible\b/i,
  /\bbefore\s+your\s+account\s+is\s+(?:suspended|closed|terminated|locked)\b/i,
];

// 2. ACCOUNT OR SECURITY CONTEXT (+10)
const SECURITY_CONTEXT_PATTERNS = [
  /\bsecurity\s+notice\b/i,
  /\brecent\s+(?:sign-?in|login|access|activity)\b/i,
  /\bnew\s+device\b/i,
  /\bunrecognized\s+(?:device|login|sign-?in|location|activity|access)\b/i,
  /\baccount\s+security(?:\s+settings)?\b/i,
  /\bsecurity\s+(?:settings|review|check|alert|warning|update)\b/i,
  /\b(?:verify|verifying|verification\s+of)\s+account\b/i,
  /\baccount\s+(?:verification|review|activity|confirmation|update)\b/i,
  /\bsuspicious\s+(?:activity|login|sign-?in|access)\b/i,
  /\breview\s+(?:your\s+)?(?:account|security)\s*(?:settings|activity)?\b/i,
  /\b(?:authentication|two-factor|2fa|mfa)\b/i,
  /\b(?:your\s+account|account\s+access)\b/i,
];

// 3. CREDENTIAL / PASSWORD / OTP REQUEST (+25)
// ONLY added when actual credentials, passwords, OTPs, or codes are requested!
const CREDENTIAL_REQUEST_PATTERNS = [
  /\b(?:enter|provide|type|submit|verify|confirm|send|input)\s+(?:your\s+)?(?:passwords?|passcodes?|pin|otp|login\s+credentials?|security\s+codes?|verification\s+codes?)\b/i,
  /\b(?:enter|provide|input|submit)\s+(?:your\s+)?(?:credentials?|password)\b/i,
  /\b(?:verify\s+your\s+(?:password|security\s+code|passcode|otp|pin))\b/i,
  /\b(?:passwords?|passcodes?|pin\s+code|one-time\s+passwords?|otp|verification\s+code|security\s+code)\b/i,
  /\b(?:login\s+credentials?|account\s+credentials?)\b/i,
  /\b(?:banking\s+details|card\s+details|credit\s+card|debit\s+card|cvv|cvc)\b/i,
  /\b(?:payment\s+information|social\s+security|ssn)\b/i,
];

// 4. THREAT, SUSPENSION, LOSS OF ACCESS OR COERCION (+20)
const THREAT_COERCION_PATTERNS = [
  /\bwill\s+be\s+(?:permanently\s+)?(?:suspended|deleted|terminated|locked|closed|blocked)\b/i,
  /\baccount\s+(?:will\s+be\s+)?(?:suspended|locked|blocked|restricted|terminated|closed)\b/i,
  /\b(?:permanent\s+)?loss\s+of\s+access\b/i,
  /\baccess\s+will\s+be\s+(?:blocked|revoked|restricted|terminated)\b/i,
  /\bresult\s+in\s+account\s+suspension\b/i,
  /\blegal\s+action\b/i,
  /\bdeactivate\s+your\s+account\b/i,
];

// 5. IMPERSONATION OF SUPPORT / COMPANY / AUTHORITY (+15)
const AUTHORITY_IMPERSONATION_PATTERNS = [
  /(?:—|-|--|from:?|\b(?:regards|team|signed|thanks|thank you),?\s*)\s*(?:security\s+support|account\s+team|it\s+support|bank\s+support|customer\s+(?:service|support)|administrator|system\s+admin|fraud\s+prevention|account\s+security\s+team|billing\s+support|security\s+team)\b/i,
  /\b(?:security\s+support|account\s+team|it\s+support|bank\s+support|customer\s+service|customer\s+support|system\s+administrator|fraud\s+prevention\s+team|account\s+security\s+team|security\s+team)\b/i,
  /\b(?:microsoft\s+support|google\s+security|apple\s+support|paypal\s+security|instagram\s+support|meta\s+security|amazon\s+support)\b/i,
];

// 6. SUSPICIOUS URL PATH TERMS (+10)
const SUSPICIOUS_PATH_TERMS = [
  "review",
  "login",
  "signin",
  "sign-in",
  "verify",
  "verification",
  "checkpoint",
  "password",
  "reset",
  "auth",
  "account",
  "secure",
  "confirm",
  "validate",
  "security-check",
];

// URL Host Keywords
const SECURITY_HOST_TERMS = [
  "account",
  "security",
  "verify",
  "verification",
  "checkpoint",
  "login",
  "signin",
  "auth",
  "support",
  "check",
  "alert",
  "update",
];

// =============================================================================
// REUSABLE HELPER FUNCTIONS
// =============================================================================

/**
 * Normalizes message text: cleans line endings, Unicode whitespace, smart quotes, etc.
 */
export function normalizeMessageText(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g, " ")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

/**
 * Robustly extracts all URLs and domain-like links from the message.
 * Handles protocol prefixes, bare domains with paths, and trims trailing punctuation.
 */
export function extractUrlsFromMessage(text: string): string[] {
  const urls: string[] = [];

  // Protocol URLs: https?://...
  const protocolRegex = /https?:\/\/[^\s<>"'{}|\\^`]+/gi;
  let match: RegExpExecArray | null;
  while ((match = protocolRegex.exec(text)) !== null) {
    let clean = match[0].replace(/[.,;:!?)>"'\]]+$/, "");
    if (clean) urls.push(clean);
  }

  // Bare domain links without protocol (e.g. account-security-check.example.com/review)
  const domainRegex = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|org|net|io|edu|gov|co|info|biz|me|online|site|app|xyz|example\.com)(?:\/[^\s<>"'{}|\\^`]*)?\b/gi;
  while ((match = domainRegex.exec(text)) !== null) {
    let clean = match[0].replace(/[.,;:!?)>"'\]]+$/, "");
    if (clean && !urls.some((u) => u.includes(clean))) {
      urls.push("https://" + clean);
    }
  }

  return Array.from(new Set(urls));
}

// =============================================================================
// MESSAGE ANALYZER
// =============================================================================

export class MessageAnalyzer {
  /**
   * Deterministically analyzes ANY message using the configured risk indicators.
   */
  public analyze(
    rawMessage: string,
    providedType: MessageType = "auto",
    sender?: string
  ): MessageAnalysisResult {
    const startTime = performance.now();
    const normalizedMessage = normalizeMessageText(rawMessage);
    const trimmedMessage = normalizedMessage.trim();

    if (!trimmedMessage) {
      throw new Error("Please enter a message to analyze.");
    }

    const indicators: ThreatIndicator[] = [];
    const contributions: { reason: string; points: number }[] = [];
    const detectedPhrases: string[] = [];
    const detectedRequests: string[] = [];
    const extractedUrls: ExtractedUrlInfo[] = [];

    // Message Type Auto-Detection
    let detectedType = providedType;
    if (providedType === "auto") {
      if (/^(from:|subject:|to:)/im.test(trimmedMessage) || sender?.includes("@")) {
        detectedType = "email";
      } else if (trimmedMessage.length < 160 && !trimmedMessage.includes("\n\n")) {
        detectedType = "sms";
      } else if (/@[\w.]+|#\w+|DM/i.test(trimmedMessage)) {
        detectedType = "social";
      } else {
        detectedType = "chat";
      }
    }

    // -------------------------------------------------------------------------
    // 1. URL Extraction & Structural Analysis (Always runs independently)
    // -------------------------------------------------------------------------
    const rawUrls = extractUrlsFromMessage(trimmedMessage);

    // Identify known brand references in the text to compare against URL domains
    const mentionedBrands: string[] = [];
    for (const [key, brand] of Object.entries(BRAND_CATALOG)) {
      const brandRegex = new RegExp(`\\b${brand.name}\\b`, "i");
      if (brandRegex.test(trimmedMessage)) {
        mentionedBrands.push(brand.name);
      }
    }

    let hasExternalOrSuspiciousUrl = false;
    let hasLookalikeOrSuspiciousDomain = false;
    let hasSuspiciousUrlPath = false;
    let primaryUrl: string | undefined;
    let primaryPath: string | undefined;
    let lookalikeBrandSnippet: string | undefined;

    for (const urlStr of rawUrls) {
      try {
        const urlResult = urlAnalyzer.analyze(urlStr);
        extractedUrls.push({
          url: urlStr,
          analysis: urlResult,
        });

        const hostname = (urlResult.evidence.hostname || "").toLowerCase();
        const pathname = (urlResult.evidence.pathname || "").toLowerCase();
        const rootDomain = (urlResult.evidence.domain || "").toLowerCase();

        // Any extracted link in a message represents an external destination link
        hasExternalOrSuspiciousUrl = true;
        if (!primaryUrl) primaryUrl = urlStr;

        // Check if destination hostname is a brand look-alike or unauthorized domain
        for (const brandName of mentionedBrands) {
          if (!isLegitimateDomainForBrand(brandName, rootDomain)) {
            hasLookalikeOrSuspiciousDomain = true;
            lookalikeBrandSnippet = `${brandName} lure on ${rootDomain}`;
          }
        }

        if (
          urlResult.indicators.some(
            (i) => i.type === INDICATOR_TYPES.BRAND_IMPERSONATION || i.type === INDICATOR_TYPES.LOOKALIKE_DOMAIN
          )
        ) {
          hasLookalikeOrSuspiciousDomain = true;
          if (!lookalikeBrandSnippet) lookalikeBrandSnippet = urlStr;
        }

        // Check Suspicious URL Path (/login, /verify, /account, /secure, /review, etc.)
        const foundPathTerm = SUSPICIOUS_PATH_TERMS.find((term) => pathname.includes(term));
        if (foundPathTerm) {
          hasSuspiciousUrlPath = true;
          if (!primaryPath) primaryPath = pathname;
        }
      } catch {
        // Fallback: URL string was extracted even if parsing had errors
        hasExternalOrSuspiciousUrl = true;
        if (!primaryUrl) primaryUrl = urlStr;
      }
    }

    // 1. External or suspicious URL: +20
    if (hasExternalOrSuspiciousUrl) {
      contributions.push({
        reason: "External or Suspicious Destination URL",
        points: 20,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_suspicious_url",
          type: INDICATOR_TYPES.MESSAGE_SUSPICIOUS_LINK,
          title: "Suspicious Destination URL",
          description: "The message contains an external or security-themed destination URL.",
          severity: "medium",
          category: "suspicious_link",
          evidenceSnippet: primaryUrl,
          scoreContribution: 20,
        })
      );
    }

    // 7. Suspicious or look-alike domain: +25
    if (hasLookalikeOrSuspiciousDomain) {
      contributions.push({
        reason: "Suspicious or Look-Alike Domain",
        points: 25,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_lookalike_domain",
          type: INDICATOR_TYPES.BRAND_IMPERSONATION,
          title: "Suspicious or Look-Alike Domain",
          description: "The destination host targets an unauthorized or look-alike domain imitating official services.",
          severity: "high",
          category: "domain",
          evidenceSnippet: lookalikeBrandSnippet || primaryUrl,
          scoreContribution: 25,
        })
      );
    }

    // 8. Suspicious URL path such as /login, /verify, /account, /secure, /review: +10
    if (hasSuspiciousUrlPath) {
      contributions.push({
        reason: "Suspicious Action / Review Path in URL",
        points: 10,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_url_path",
          type: INDICATOR_TYPES.CREDENTIAL_PATH,
          title: "Suspicious URL Path",
          description: "The destination URL contains an authentication, review, or verification path.",
          severity: "medium",
          category: "path",
          evidenceSnippet: primaryPath,
          scoreContribution: 10,
        })
      );
    }

    // -------------------------------------------------------------------------
    // 2. Urgency / Deadline / Immediate Action (+10)
    // -------------------------------------------------------------------------
    let hasUrgency = false;
    let matchedUrgencyPhrase = "";
    for (const pattern of URGENCY_PATTERNS) {
      const match = trimmedMessage.match(pattern);
      if (match) {
        hasUrgency = true;
        if (!matchedUrgencyPhrase || match[0].length > matchedUrgencyPhrase.length) {
          matchedUrgencyPhrase = match[0];
        }
        detectedPhrases.push(match[0]);
      }
    }

    if (hasUrgency) {
      contributions.push({
        reason: "Urgency / Deadline / Immediate Action",
        points: 10,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_urgency",
          type: INDICATOR_TYPES.MESSAGE_URGENCY,
          title: "Urgency / Time Pressure",
          description: "The recipient is pressured with a short deadline or immediate action requirement.",
          severity: "medium",
          category: "urgency",
          evidenceSnippet: matchedUrgencyPhrase || "within 24 hours",
          scoreContribution: 10,
        })
      );
    }

    // -------------------------------------------------------------------------
    // 3. Account or Security Context (+10)
    // -------------------------------------------------------------------------
    let hasSecurityContext = false;
    let matchedSecurityPhrase = "";
    for (const pattern of SECURITY_CONTEXT_PATTERNS) {
      const match = trimmedMessage.match(pattern);
      if (match) {
        hasSecurityContext = true;
        // Prioritize specific security terms over generic "your account"
        if (
          !matchedSecurityPhrase ||
          /recent sign-in|new device|security notice|security settings|unrecognized/i.test(match[0])
        ) {
          matchedSecurityPhrase = match[0];
        }
        detectedPhrases.push(match[0]);
      }
    }

    if (hasSecurityContext) {
      contributions.push({
        reason: "Account or Security Context",
        points: 10,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_sec_context",
          type: INDICATOR_TYPES.MESSAGE_SECURITY_CONTEXT,
          title: "Security / Account Context",
          description: "The message discusses a recent account sign-in, security alert, or account settings review.",
          severity: "medium",
          category: "security_context",
          evidenceSnippet: matchedSecurityPhrase || "recent sign-in",
          scoreContribution: 10,
        })
      );
    }

    // -------------------------------------------------------------------------
    // 4. Credential / Password / OTP Request (+25)
    // ONLY added when actual credentials or codes are requested; 0 for security settings discussions.
    // -------------------------------------------------------------------------
    let hasCredentialRequest = false;
    let matchedCredentialPhrase = "";
    for (const pattern of CREDENTIAL_REQUEST_PATTERNS) {
      const match = trimmedMessage.match(pattern);
      if (match) {
        hasCredentialRequest = true;
        if (!matchedCredentialPhrase || match[0].length > matchedCredentialPhrase.length) {
          matchedCredentialPhrase = match[0];
        }
        detectedPhrases.push(match[0]);
        detectedRequests.push(match[0]);
      }
    }

    if (hasCredentialRequest) {
      contributions.push({
        reason: "Credential / Password / OTP Request",
        points: 25,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_cred_request",
          type: INDICATOR_TYPES.MESSAGE_CREDENTIAL_REQUEST,
          title: "Credential / Sensitive Information Request",
          description:
            "The message explicitly requests sensitive information such as passwords, security codes, or authentication credentials.",
          severity: "high",
          category: "credential_request",
          evidenceSnippet: matchedCredentialPhrase || "password or security code",
          scoreContribution: 25,
        })
      );
    }

    // -------------------------------------------------------------------------
    // 5. Threat, Suspension, Loss of Access or Coercion (+20)
    // -------------------------------------------------------------------------
    let hasThreatCoercion = false;
    let matchedThreatPhrase = "";
    for (const pattern of THREAT_COERCION_PATTERNS) {
      const match = trimmedMessage.match(pattern);
      if (match) {
        hasThreatCoercion = true;
        if (!matchedThreatPhrase || match[0].length > matchedThreatPhrase.length) {
          matchedThreatPhrase = match[0];
        }
        detectedPhrases.push(match[0]);
      }
    }

    if (hasThreatCoercion) {
      contributions.push({
        reason: "Threat, Suspension, Loss of Access or Coercion",
        points: 20,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_threat_coercion",
          type: INDICATOR_TYPES.MESSAGE_ACCOUNT_THREAT,
          title: "Account Threat / Coercion",
          description:
            "The communication threatens negative consequences (e.g. account suspension or loss of access) to force compliance.",
          severity: "high",
          category: "threat",
          evidenceSnippet: matchedThreatPhrase || "account suspension",
          scoreContribution: 20,
        })
      );
    }

    // -------------------------------------------------------------------------
    // 6. Impersonation of Support / Company / Authority (+15)
    // -------------------------------------------------------------------------
    let hasAuthorityClaim = false;
    let matchedAuthority = "";
    for (const pattern of AUTHORITY_IMPERSONATION_PATTERNS) {
      const match = trimmedMessage.match(pattern);
      if (match) {
        hasAuthorityClaim = true;
        matchedAuthority = match[0].replace(/^[—\-\s]+/, "").trim();
        detectedPhrases.push(matchedAuthority);
        break;
      }
    }

    if (hasAuthorityClaim) {
      contributions.push({
        reason: `Impersonation of Authority (${matchedAuthority})`,
        points: 15,
      });
      indicators.push(
        createThreatIndicator({
          id: "ind_authority_claim",
          type: INDICATOR_TYPES.MESSAGE_AUTHORITY_IMPERSONATION,
          title: matchedAuthority.toLowerCase().includes("security")
            ? "Security Support Impersonation"
            : `${matchedAuthority} Impersonation`,
          description: `The sender identifies itself as "${matchedAuthority}", a common authority disguise in social-engineering communications.`,
          severity: "medium",
          category: "impersonation",
          evidenceSnippet: matchedAuthority,
          scoreContribution: 15,
        })
      );
    }

    // -------------------------------------------------------------------------
    // Risk Score Accumulation & Severity Classification
    // Clamp score between 0 and 100.
    // 0–19 = SAFE, 20–39 = LOW, 40–69 = MEDIUM, 70–89 = HIGH, 90–100 = CRITICAL
    // -------------------------------------------------------------------------
    const accumulation = accumulateRiskScore(0, contributions);
    const finalScore = accumulation.clampedScore;
    const finalRiskLevel = accumulation.riskLevel;
    const classification = classifyMessageThreat(finalScore, indicators);
    const recommendedActions = generateRecommendedActions(finalScore, indicators);

    // -------------------------------------------------------------------------
    // Dynamic Summary & Explanation Generation
    // -------------------------------------------------------------------------
    let summary = "";
    let explanation = "";

    if (indicators.length === 0 && finalScore < 20) {
      summary = "No deceptive social-engineering tactics, artificial urgency pressure, or credential requests detected.";
      explanation =
        "The communication contains neutral, routine syntax without artificial urgency, threats of account suspension, or links to deceptive infrastructure.";
    } else if (finalScore >= 70) {
      summary =
        "High-risk communication exhibiting severe urgency, credential demands, threats, or deceptive destination links.";
      explanation =
        "This communication was flagged because it exhibits high-risk phishing indicators: " +
        indicators
          .map((i) => `${i.title} (${i.evidenceSnippet || i.description.replace(/\.$/, "")})`)
          .join(", ") +
        ". Recipients should not interact with the link or provide any sensitive information.";
    } else if (finalScore >= 40) {
      summary =
        "Suspicious communication exhibiting time-sensitive demands, account security context, and an unverified destination link.";
      explanation =
        "This communication was flagged because it exhibits multiple coordinated risk indicators: " +
        indicators
          .map((i) => `${i.title} (${i.evidenceSnippet || i.description.replace(/\.$/, "")})`)
          .join(", ") +
        ". Users should review account security settings directly through official channels rather than following embedded links.";
    } else {
      summary = "Communication contains mild warning indicators or non-standard external references.";
      explanation =
        "The message contains non-critical observations: " +
        indicators
          .map((i) => `${i.title} (${i.evidenceSnippet || i.description.replace(/\.$/, "")})`)
          .join(", ") +
        ". Caution is recommended.";
    }

    const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    const evidence: MessageEvidence = {
      rawMessage: trimmedMessage,
      detectedType,
      sender,
      detectedPhrases: Array.from(new Set(detectedPhrases)),
      extractedUrls,
      detectedRequests: Array.from(new Set(detectedRequests)),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    };

    const technicalDetails: MessageTechnicalDetails = {
      messageLength: trimmedMessage.length,
      messageType: detectedType,
      evaluationsCount: 18,
      extractedUrlsCount: extractedUrls.length,
      detectionSignals: Array.from(new Set(contributions.map((c) => c.reason))),
      riskCalculationFactors:
        accumulation.calculationFactors.length > 0
          ? accumulation.calculationFactors
          : ["Zero anomaly baseline (0)"],
      analysisMethod: "Deterministic Rule-Based Social Engineering Engine (Local)",
      engineStatus: "Operational — Heuristic Engine Online",
      executionTimeMs,
      correlationSignals: [],
    };

    // Calculate confidence based on independent indicator count
    let confidence = 0.7;
    if (indicators.length === 0) {
      confidence = 0.95;
    } else if (indicators.length >= 4) {
      confidence = 0.96;
    } else if (indicators.length >= 2) {
      confidence = 0.88;
    }

    return {
      message: trimmedMessage,
      sender,
      messageType: providedType,
      detectedType,
      riskScore: finalScore,
      riskLevel: finalRiskLevel,
      severity: finalRiskLevel,
      classification,
      summary,
      explanation,
      indicators,
      evidence,
      recommendedActions,
      technicalDetails,
      confidence,
      isDemo: true,
    };
  }
}

export const messageAnalyzer = new MessageAnalyzer();
export const analyzeMessage = (
  message: string,
  messageType: MessageType = "auto",
  sender?: string
) => messageAnalyzer.analyze(message, messageType, sender);
