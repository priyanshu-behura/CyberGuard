/**
 * CYBERGUARD Standard Indicators & Defensive Recommendations
 */

import { ThreatIndicator, IndicatorSeverity, IndicatorCategory, RecommendedAction } from "./types";

export const INDICATOR_TYPES = {
  BRAND_IMPERSONATION: "BRAND_IMPERSONATION",
  LOOKALIKE_DOMAIN: "LOOKALIKE_DOMAIN",
  SUSPICIOUS_SUBDOMAIN: "SUSPICIOUS_SUBDOMAIN",
  CREDENTIAL_PATH: "CREDENTIAL_PATH",
  INSECURE_HTTP: "INSECURE_HTTP",
  IP_HOST: "IP_HOST",
  SUSPICIOUS_STRUCTURE: "SUSPICIOUS_STRUCTURE",
  URL_SHORTENER: "URL_SHORTENER",
  OBFUSCATED_URL: "OBFUSCATED_URL",
  UNUSUAL_PORT: "UNUSUAL_PORT",
  EXCESSIVE_SUBDOMAINS: "EXCESSIVE_SUBDOMAINS",
  // Message indicators
  MESSAGE_URGENCY: "MESSAGE_URGENCY",
  MESSAGE_CREDENTIAL_REQUEST: "MESSAGE_CREDENTIAL_REQUEST",
  MESSAGE_ACCOUNT_THREAT: "MESSAGE_ACCOUNT_THREAT",
  MESSAGE_REWARD_LURE: "MESSAGE_REWARD_LURE",
  MESSAGE_SUSPICIOUS_LINK: "MESSAGE_SUSPICIOUS_LINK",
  MESSAGE_SENDER_ANOMALY: "MESSAGE_SENDER_ANOMALY",
  MESSAGE_SECURITY_CONTEXT: "MESSAGE_SECURITY_CONTEXT",
  MESSAGE_AUTHORITY_IMPERSONATION: "MESSAGE_AUTHORITY_IMPERSONATION",
  MESSAGE_SOCIAL_ENGINEERING: "MESSAGE_SOCIAL_ENGINEERING",
  // Correlated indicators
  CORRELATED_PHISHING_VECTOR: "CORRELATED_PHISHING_VECTOR",
} as const;

export function createThreatIndicator(options: {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: IndicatorSeverity;
  category: IndicatorCategory;
  evidenceSnippet?: string;
  scoreContribution?: number;
  explanation?: string;
}): ThreatIndicator {
  return {
    id: options.id,
    type: options.type,
    title: options.title,
    description: options.description,
    severity: options.severity,
    category: options.category,
    evidenceSnippet: options.evidenceSnippet,
    scoreContribution: options.scoreContribution,
    explanation: options.explanation || options.description,
  };
}

/**
 * Standard recommended actions based on risk level and detected indicator types.
 */
export function generateRecommendedActions(
  riskScore: number,
  indicators: ThreatIndicator[]
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const indicatorTypes = new Set(indicators.map((i) => i.type || i.id));

  if (riskScore >= 70) {
    actions.push({
      id: "rec_do_not_interact",
      title: "Do Not Click or Interact",
      description: "Do not visit the destination link, submit credentials, or open attached communications.",
      priority: "urgent",
    });

    if (
      indicatorTypes.has(INDICATOR_TYPES.CREDENTIAL_PATH) ||
      indicatorTypes.has(INDICATOR_TYPES.MESSAGE_CREDENTIAL_REQUEST) ||
      indicatorTypes.has(INDICATOR_TYPES.BRAND_IMPERSONATION)
    ) {
      actions.push({
        id: "rec_protect_credentials",
        title: "Do Not Enter Passwords or Authentication Codes",
        description:
          "Never supply passwords, PINs, or one-time passcodes (OTPs) through unverified or third-party links.",
        priority: "urgent",
      });
    }

    actions.push({
      id: "rec_verify_official_channel",
      title: "Verify Through Official Channels",
      description:
        "Open a new browser tab and navigate directly to the verified service website or official mobile application.",
      priority: "recommended",
    });

    actions.push({
      id: "rec_report_incident",
      title: "Report Deceptive Communication",
      description:
        "Forward this communication to your organization's security team or report the phishing URL to provider abuse desks.",
      priority: "standard",
    });
  } else if (riskScore >= 40) {
    actions.push({
      id: "rec_verify_official_channel",
      title: "Verify Through Official Channels",
      description:
        "Verify the account through the organization's official website or application directly.",
      priority: "recommended",
    });

    actions.push({
      id: "rec_protect_credentials",
      title: "Do Not Enter Sensitive Information",
      description:
        "Do not enter passwords, OTPs, or sensitive information through an unverified link.",
      priority: "recommended",
    });

    actions.push({
      id: "rec_inspect_destination",
      title: "Inspect Destination Domain",
      description:
        "Inspect the destination domain before continuing and ensure it matches verified official infrastructure.",
      priority: "standard",
    });
  } else if (riskScore >= 20) {
    if (indicatorTypes.has(INDICATOR_TYPES.INSECURE_HTTP)) {
      actions.push({
        id: "rec_avoid_plaintext_http",
        title: "Avoid Transmitting Sensitive Data Over Plaintext HTTP",
        description:
          "The connection is unencrypted. Do not enter credentials, financial information, or personal identifiers.",
        priority: "recommended",
      });
    }

    actions.push({
      id: "rec_general_vigilance",
      title: "Verify Context",
      description: "Ensure this communication aligns with expected interactions before taking action.",
      priority: "standard",
    });
  } else {
    actions.push({
      id: "rec_safe_verified",
      title: "Standard Security Hygiene",
      description:
        "No malicious markers were observed. Maintain standard security awareness when interacting with digital communications.",
      priority: "standard",
    });
  }

  return actions;
}
