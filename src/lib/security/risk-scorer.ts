/**
 * CYBERGUARD Risk Scoring & Severity Calculation Engine
 *
 * Implements a transparent, accumulated scoring model clamped between 0 and 100.
 *
 * Thresholds:
 *   0–19:   SAFE
 *  20–39:   LOW
 *  40–69:   MEDIUM
 *  70–89:   HIGH
 *  90–100:  CRITICAL
 */

import { RiskLevel, UrlThreatClassification, MessageThreatClassification, ThreatIndicator } from "./types";

export function calculateRiskLevel(score: number): RiskLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped < 20) return "Safe";
  if (clamped < 40) return "Low";
  if (clamped < 70) return "Medium";
  if (clamped < 90) return "High";
  return "Critical";
}

export function classifyUrlThreat(
  score: number,
  indicators: ThreatIndicator[]
): UrlThreatClassification {
  const level = calculateRiskLevel(score);
  const indicatorTypes = new Set(indicators.map((i) => i.type || i.id));

  const hasImpersonation =
    indicatorTypes.has("BRAND_IMPERSONATION") ||
    indicatorTypes.has("LOOKALIKE_DOMAIN") ||
    indicatorTypes.has("TYPOSQUAT_LOOKALIKE");

  const hasCredentials = indicatorTypes.has("CREDENTIAL_PATH");

  if (level === "Critical") {
    return hasImpersonation ? "Potential Phishing URL" : "Malicious URL";
  }
  if (level === "High") {
    return hasImpersonation || hasCredentials ? "Potential Phishing URL" : "Suspicious URL";
  }
  if (level === "Medium") {
    return hasImpersonation ? "Potential Phishing URL" : "Suspicious URL";
  }
  if (level === "Low") {
    return "Suspicious URL";
  }
  return "Safe URL";
}

export function classifyMessageThreat(
  score: number,
  indicators: ThreatIndicator[]
): MessageThreatClassification {
  const level = calculateRiskLevel(score);
  const indicatorTypes = new Set(indicators.map((i) => i.type || i.id));

  const hasPhishingSignals =
    indicatorTypes.has("MESSAGE_CREDENTIAL_REQUEST") ||
    indicatorTypes.has("MESSAGE_URGENCY") ||
    indicatorTypes.has("MESSAGE_ACCOUNT_THREAT") ||
    indicatorTypes.has("CORRELATED_PHISHING_VECTOR") ||
    indicatorTypes.has("BRAND_IMPERSONATION") ||
    indicatorTypes.has("MESSAGE_SUSPICIOUS_LINK");

  if (level === "Critical" || level === "High") {
    return hasPhishingSignals ? "Phishing / Social Engineering" : "Malicious Communication";
  }
  if (level === "Medium") {
    return hasPhishingSignals ? "Phishing / Social Engineering" : "Suspicious Communication";
  }
  if (level === "Low") {
    return "Suspicious Communication";
  }
  return "Safe Communication";
}

export function calculateConfidence(indicators: ThreatIndicator[], riskScore: number): number {
  if (indicators.length === 0) {
    return 0.95; // High confidence in safe status when no heuristics trigger
  }

  // Count unique categories confirming threat
  const uniqueCategories = new Set(indicators.map((i) => i.category)).size;
  let baseConfidence = 0.65;

  baseConfidence += Math.min(0.25, uniqueCategories * 0.08);

  if (riskScore >= 80) {
    baseConfidence += 0.08;
  }

  return Math.min(0.99, Math.round(baseConfidence * 100) / 100);
}

export interface ScoreAccumulation {
  finalScore: number;
  clampedScore: number;
  riskLevel: RiskLevel;
  calculationFactors: string[];
}

export function accumulateRiskScore(
  baseScore: number,
  contributions: { reason: string; points: number }[]
): ScoreAccumulation {
  let score = baseScore;
  const calculationFactors: string[] = [];

  for (const item of contributions) {
    score += item.points;
    calculationFactors.push(`${item.reason} (+${item.points})`);
  }

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel = calculateRiskLevel(clampedScore);

  return {
    finalScore: score,
    clampedScore,
    riskLevel,
    calculationFactors,
  };
}
