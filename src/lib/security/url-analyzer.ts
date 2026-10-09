/**
 * CYBERGUARD Reusable URL Threat Analysis Engine
 *
 * Implements normalized parsing, multi-vector heuristic checks,
 * look-alike/brand impersonation detection, and transparent scoring.
 *
 * Safe URL Handling: Strictly operates on local string representations.
 * Never performs outbound network queries or executes remote code.
 */

import {
  UrlAnalysisResult,
  ThreatIndicator,
  UrlEvidence,
  UrlTechnicalDetails,
} from "./types";
import {
  knownBrands,
  BRAND_CATALOG,
  isLegitimateDomainForBrand,
  detectBrandImpersonation,
} from "./brands";
import {
  INDICATOR_TYPES,
  createThreatIndicator,
  generateRecommendedActions,
} from "./indicators";
import {
  accumulateRiskScore,
  classifyUrlThreat,
  calculateConfidence,
} from "./risk-scorer";

const CREDENTIAL_PATH_TERMS = [
  "login",
  "signin",
  "sign-in",
  "verify",
  "verification",
  "account",
  "password",
  "reset",
  "secure",
  "auth",
  "credential",
  "confirm",
  "identity",
  "secure-login",
  "review",
  "checkpoint",
  "validate",
  "security-check",
  "activity",
  "device",
  "session",
];

const SUSPICIOUS_SUBDOMAIN_PATTERNS = [
  "secure-instagram",
  "instagram-login",
  "paypal-security",
  "verify-account",
  "account-confirmation",
  "login-security",
  "support-verification",
  "account-update",
  "security-check",
  "billing-verify",
  "auth-portal",
  "id-verification",
  "account-security-check",
  "security-review",
  "account-review",
  "security-notice",
  "login-check",
  "verify-activity",
];

const KNOWN_SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "bit.do",
  "cutt.ly",
];

const MULTI_PART_TLDS = [
  "co.uk",
  "com.au",
  "co.jp",
  "org.uk",
  "gov.uk",
  "ac.uk",
  "com.br",
  "co.in",
  "net.au",
  "co.nz",
];

export function extractDomainDetails(hostname: string): {
  rootDomain: string;
  subdomain: string;
  tld: string;
} {
  const cleanHost = hostname.toLowerCase().trim();
  const parts = cleanHost.split(".");

  if (parts.length <= 1) {
    return { rootDomain: cleanHost, subdomain: "", tld: "" };
  }

  const lastTwo = parts.slice(-2).join(".");
  let rootDomain = "";
  let subdomain = "";
  let tld = "";

  if (parts.length >= 3 && MULTI_PART_TLDS.includes(lastTwo)) {
    rootDomain = parts.slice(-3).join(".");
    subdomain = parts.slice(0, -3).join(".");
    tld = lastTwo;
  } else {
    rootDomain = parts.length >= 2 ? parts.slice(-2).join(".") : cleanHost;
    subdomain = parts.length > 2 ? parts.slice(0, -2).join(".") : "";
    tld = parts[parts.length - 1];
  }

  return { rootDomain, subdomain, tld };
}

export function isIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    const octets = hostname.split(".").map(Number);
    return octets.every((o) => o >= 0 && o <= 255);
  }
  // IPv6 check
  return hostname.includes(":") && !hostname.includes(".");
}

export class UrlAnalyzer {
  /**
   * Analyzes ANY user-provided URL using independent heuristic security checks.
   */
  public analyze(inputUrl: string): UrlAnalysisResult {
    const startTime = performance.now();
    const trimmedUrl = (inputUrl || "").trim();

    if (!trimmedUrl) {
      throw new Error("Please enter a URL to inspect.");
    }

    // 1. Normalization & Safe Local Parsing
    let normalized = trimmedUrl;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }

    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      throw new Error("Invalid URL format. Please provide a well-formed web address.");
    }

    const protocol = parsed.protocol.toLowerCase();
    const isHttps = protocol === "https:";
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port || null;
    const pathname = parsed.pathname || "/";
    const search = parsed.search || "";
    const hash = parsed.hash || "";
    const searchParams: Record<string, string> = {};
    parsed.searchParams.forEach((val, key) => {
      searchParams[key] = val;
    });

    const isIpHost = isIpAddress(hostname);
    const { rootDomain, subdomain, tld } = extractDomainDetails(hostname);

    const indicators: ThreatIndicator[] = [];
    const contributions: { reason: string; points: number }[] = [];
    const detectedSignals: string[] = [];

    // -------------------------------------------------------------------------
    // Check A: HTTPS Check
    // HTTP increases risk (score 20 = Low) but NOT automatically phishing.
    // HTTPS alone NEVER treated as safe.
    // -------------------------------------------------------------------------
    if (!isHttps) {
      contributions.push({ reason: "Unencrypted Connection (Insecure HTTP)", points: 20 });
      detectedSignals.push("Insecure HTTP protocol");
      indicators.push(
        createThreatIndicator({
          id: "url_ind_http",
          type: INDICATOR_TYPES.INSECURE_HTTP,
          title: "Unencrypted Connection",
          description:
            "The URL uses unencrypted HTTP instead of secure HTTPS, exposing transmitted data to potential interception.",
          severity: "low",
          category: "protocol",
          evidenceSnippet: "http://",
          scoreContribution: 20,
        })
      );
    }

    // -------------------------------------------------------------------------
    // Check B & C: Known Brand & Look-Alike / Typo Detection
    // Compares hostname against centralized brand database.
    // Evaluates root domain vs subdomains vs homoglyphs.
    // -------------------------------------------------------------------------
    const brandMatch = detectBrandImpersonation(hostname, rootDomain);
    if (brandMatch) {
      if (
        brandMatch.matchType === "exact_subdomain_impersonation" ||
        brandMatch.matchType === "hyphenated_brand_lure" ||
        (subdomain && brandMatch.matchedString === subdomain)
      ) {
        contributions.push({
          reason: `Brand Impersonation (${brandMatch.brandName})`,
          points: 35,
        });
        detectedSignals.push(`Brand Impersonation: ${brandMatch.brandName}`);
        indicators.push(
          createThreatIndicator({
            id: "url_ind_brand_impersonation",
            type: INDICATOR_TYPES.BRAND_IMPERSONATION,
            title: "Brand Impersonation / Look-Alike Domain",
            description: brandMatch.explanation,
            severity: "high",
            category: "domain",
            evidenceSnippet: brandMatch.matchedString,
            scoreContribution: 35,
            explanation: `The hostname contains '${brandMatch.brandName.toLowerCase()}', but the root domain belongs to another organization (${rootDomain}).`,
          })
        );
      } else {
        // Typosquatting / character substitution / edit distance on root domain
        contributions.push({
          reason: `Look-Alike / TypoSquatting (${brandMatch.brandName})`,
          points: 35,
        });
        detectedSignals.push(`Look-Alike Typo: ${brandMatch.brandName}`);
        indicators.push(
          createThreatIndicator({
            id: "url_ind_lookalike_domain",
            type: INDICATOR_TYPES.LOOKALIKE_DOMAIN,
            title: "Look-Alike / TypoSquatting Domain",
            description: brandMatch.explanation,
            severity: "high",
            category: "domain",
            evidenceSnippet: brandMatch.matchedString,
            scoreContribution: 35,
            explanation: brandMatch.explanation,
          })
        );
      }
    }

    // -------------------------------------------------------------------------
    // Check D: Suspicious Subdomain Detection
    // Patterns like: secure-instagram, instagram-login, paypal-security, etc.
    // -------------------------------------------------------------------------
    let hasSuspiciousSubdomain = false;
    let matchingSubPattern = "";
    if (subdomain) {
      // If brand impersonation or look-alike was detected in subdomain, that is a suspicious subdomain
      if (brandMatch && (subdomain.includes(brandMatch.matchedString) || brandMatch.matchedString.includes(subdomain))) {
        hasSuspiciousSubdomain = true;
        matchingSubPattern = subdomain;
      }

      if (!hasSuspiciousSubdomain) {
        for (const pattern of SUSPICIOUS_SUBDOMAIN_PATTERNS) {
          if (subdomain.includes(pattern)) {
            hasSuspiciousSubdomain = true;
            matchingSubPattern = pattern;
            break;
          }
        }
      }

      // Check generic security tokens in subdomain when root domain is generic
      if (!hasSuspiciousSubdomain) {
        const subTokens = subdomain.split(/[\.-]/);
        const securityTokens = [
          "login",
          "verify",
          "secure",
          "auth",
          "signin",
          "account",
          "support",
          "review",
          "checkpoint",
          "check",
        ];
        const found = subTokens.find((t) => securityTokens.includes(t));
        if (found && !isLegitimateDomainForBrand(found, rootDomain)) {
          hasSuspiciousSubdomain = true;
          matchingSubPattern = found;
        }

        // Check for multiple hyphens combined with security terminology
        if (!hasSuspiciousSubdomain && (subdomain.match(/-/g) || []).length >= 2) {
          const hasSecTerm = /account|security|login|verify|auth|support|review|check/i.test(subdomain);
          if (hasSecTerm) {
            hasSuspiciousSubdomain = true;
            matchingSubPattern = "hyphenated-security-subdomain";
          }
        }
      }
    }

    if (hasSuspiciousSubdomain) {
      contributions.push({ reason: "Suspicious Subdomain Structure", points: 20 });
      detectedSignals.push(`Suspicious Subdomain: ${matchingSubPattern}`);
      indicators.push(
        createThreatIndicator({
          id: "url_ind_suspicious_subdomain",
          type: INDICATOR_TYPES.SUSPICIOUS_SUBDOMAIN,
          title: "Suspicious Subdomain Structure",
          description:
            "The subdomain contains security, verification, or brand keywords designed to appear authentic while pointing to unrelated infrastructure.",
          severity: "medium",
          category: "structure",
          evidenceSnippet: subdomain,
          scoreContribution: 20,
        })
      );
    }

    // -------------------------------------------------------------------------
    // Check E: Credential Path Detection
    // /login, /signin, /verify, /password, /account, /auth, etc.
    // -------------------------------------------------------------------------
    const normalizedPath = pathname.toLowerCase();
    const foundPathTerm = CREDENTIAL_PATH_TERMS.find((term) =>
      normalizedPath.includes(term)
    );

    if (foundPathTerm) {
      contributions.push({ reason: "Credential-Related Path", points: 20 });
      detectedSignals.push(`Credential path term: /${foundPathTerm}`);
      indicators.push(
        createThreatIndicator({
          id: "url_ind_credential_path",
          type: INDICATOR_TYPES.CREDENTIAL_PATH,
          title: "Credential-Related Path",
          description:
            "The URL path contains authentication or verification terms commonly targeted by credential harvesting kits.",
          severity: "medium",
          category: "path",
          evidenceSnippet: pathname,
          scoreContribution: 20,
          explanation: "The URL contains a path associated with account login or verification.",
        })
      );
    }

    // -------------------------------------------------------------------------
    // Check F: Suspicious URL Structure
    // IP address, excessive subdomains, shorteners, unusual ports, obfuscation
    // -------------------------------------------------------------------------

    // 1. IP Host
    if (isIpHost) {
      contributions.push({ reason: "IP Address Used as Hostname", points: 25 });
      detectedSignals.push("Raw IP address host");
      indicators.push(
        createThreatIndicator({
          id: "url_ind_ip_host",
          type: INDICATOR_TYPES.IP_HOST,
          title: "IP Address Used as Hostname",
          description:
            "The URL targets a raw IP address instead of a registered domain name, commonly seen in transient phishing hosts.",
          severity: "high",
          category: "domain",
          evidenceSnippet: hostname,
          scoreContribution: 25,
        })
      );
    }

    // 2. Excessive Subdomains (3+ subdomain labels)
    const subLabelCount = subdomain ? subdomain.split(".").length : 0;
    if (subLabelCount >= 3) {
      contributions.push({ reason: "Excessive Subdomain Nesting", points: 10 });
      detectedSignals.push(`Excessive subdomains (${subLabelCount} levels)`);
      indicators.push(
        createThreatIndicator({
          id: "url_ind_excessive_subdomains",
          type: INDICATOR_TYPES.EXCESSIVE_SUBDOMAINS,
          title: "Excessive Subdomain Nesting",
          description: `The URL has ${subLabelCount} subdomain levels, an obfuscation technique used to conceal the actual destination domain.`,
          severity: "low",
          category: "structure",
          evidenceSnippet: subdomain,
          scoreContribution: 10,
        })
      );
    }

    // 3. Known URL Shortener
    if (KNOWN_SHORTENERS.includes(rootDomain.toLowerCase())) {
      contributions.push({ reason: "Known URL Shortener Service", points: 15 });
      detectedSignals.push("URL shortener service");
      indicators.push(
        createThreatIndicator({
          id: "url_ind_shortener",
          type: INDICATOR_TYPES.URL_SHORTENER,
          title: "URL Shortener Service",
          description:
            "This link uses a URL redirection service which obscures the final destination until resolved.",
          severity: "medium",
          category: "structure",
          evidenceSnippet: rootDomain,
          scoreContribution: 15,
        })
      );
    }

    // 4. Unusual Port
    if (port && port !== "80" && port !== "443") {
      contributions.push({ reason: `Non-Standard Port (:${port})`, points: 15 });
      detectedSignals.push(`Unusual port: ${port}`);
      indicators.push(
        createThreatIndicator({
          id: "url_ind_unusual_port",
          type: INDICATOR_TYPES.UNUSUAL_PORT,
          title: "Non-Standard Port",
          description: `The URL specifies port ${port} instead of standard web ports (80/443), frequently used by unauthorized hosting.`,
          severity: "medium",
          category: "protocol",
          evidenceSnippet: `:${port}`,
          scoreContribution: 15,
        })
      );
    }

    // 5. Encoded / Obfuscated Sections (@ or excessive encoded chars)
    const rawHasAt = trimmedUrl.includes("@") && !trimmedUrl.startsWith("mailto:");
    const hasHexObfuscation = /%25|%2f|%3a|%40/i.test(trimmedUrl);
    if (rawHasAt || hasHexObfuscation) {
      contributions.push({ reason: "Obfuscated / Encoded URL Components", points: 20 });
      detectedSignals.push("Obfuscated URL structure");
      indicators.push(
        createThreatIndicator({
          id: "url_ind_obfuscation",
          type: INDICATOR_TYPES.OBFUSCATED_URL,
          title: "Obfuscated / Encoded URL Components",
          description:
            "The URL contains encoded characters or '@' delimiters commonly used to deceive users regarding the true destination host.",
          severity: "high",
          category: "obfuscation",
          evidenceSnippet: rawHasAt ? "@ in URL" : "Encoded characters",
          scoreContribution: 20,
        })
      );
    }

    // 6. Suspicious Query Parameters (redirect_to, return_url, auth, etc.)
    const suspiciousParams = ["redirect", "redirect_to", "return_url", "url", "target", "goto", "auth_token"];
    const foundSuspiciousParam = Object.keys(searchParams).find((k) =>
      suspiciousParams.includes(k.toLowerCase())
    );
    if (foundSuspiciousParam && searchParams[foundSuspiciousParam]?.startsWith("http")) {
      contributions.push({ reason: `Suspicious Redirect Parameter (${foundSuspiciousParam})`, points: 15 });
      detectedSignals.push(`Open redirect param: ${foundSuspiciousParam}`);
      indicators.push(
        createThreatIndicator({
          id: "url_ind_open_redirect",
          type: INDICATOR_TYPES.SUSPICIOUS_STRUCTURE,
          title: "Potential Open Redirect Parameter",
          description: `The query parameter '${foundSuspiciousParam}' specifies an external URL, creating potential for open redirection abuse.`,
          severity: "medium",
          category: "query",
          evidenceSnippet: `${foundSuspiciousParam}=${searchParams[foundSuspiciousParam]}`,
          scoreContribution: 15,
        })
      );
    }

    // -------------------------------------------------------------------------
    // Risk Score Accumulation & Clamping (0 - 100)
    // -------------------------------------------------------------------------
    const { clampedScore, riskLevel, calculationFactors } = accumulateRiskScore(0, contributions);
    const classification = classifyUrlThreat(clampedScore, indicators);
    const confidence = calculateConfidence(indicators, clampedScore);
    const recommendedActions = generateRecommendedActions(clampedScore, indicators);

    // -------------------------------------------------------------------------
    // Summary & Explanation Synthesis
    // -------------------------------------------------------------------------
    let summary = "";
    let explanation = "";

    if (riskLevel === "Safe") {
      summary = "No malicious characteristics, spoofing tactics, or structural anomalies were detected.";
      explanation =
        "This URL corresponds to standard web destination patterns without deceptive brand subdomains, unencrypted plaintext transport, or known typosquatting markers.";
    } else if (riskLevel === "Low") {
      summary = "Minor security observations noted (such as unencrypted HTTP transport).";
      explanation =
        "The URL displays non-critical warning characteristics such as unencrypted HTTP communication. While not automatically malicious, caution is advised.";
    } else if (riskLevel === "Medium") {
      summary = "Suspicious structural patterns or credential paths detected.";
      explanation =
        indicators.map((i) => i.description).join(" ") ||
        "The URL exhibits characteristics frequently correlated with phishing or unauthorized proxy infrastructure.";
    } else if (riskLevel === "High") {
      summary = "High-risk indicators identified, including brand impersonation or credential collection infrastructure.";
      explanation =
        indicators.map((i) => i.description).join(" ") ||
        "This URL exhibits strong indicators of brand impersonation or credential harvesting infrastructure.";
    } else {
      summary = "Critical threat: Highly deceptive look-alike domain or multi-vector phishing infrastructure.";
      explanation =
        indicators.map((i) => i.description).join(" ") ||
        "Multiple critical security indicators confirm deceptive infrastructure targeting user credentials.";
    }

    const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    const evidence: UrlEvidence = {
      rawUrl: trimmedUrl,
      protocol: protocol.replace(":", ""),
      hostname,
      domain: rootDomain,
      tld,
      port,
      pathname,
      searchParams,
      isIpHost,
      isHttps,
      subdomain,
      fragment: hash,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    };

    const technicalDetails: UrlTechnicalDetails = {
      normalizedUrl: normalized,
      evaluationsCount: 14,
      analysisMethod: "Deterministic Rule-Based Heuristic Inspection (Local)",
      riskCalculationFactors: calculationFactors.length > 0 ? calculationFactors : ["Zero anomaly baseline (0)"],
      executionTimeMs,
      protocol: protocol.replace(":", ""),
      hostname,
      rootDomain,
      subdomain,
      port,
      queryParamCount: Object.keys(searchParams).length,
      isIpAddress: isIpHost,
      detectedSignals,
    };

    return {
      url: trimmedUrl,
      riskScore: clampedScore,
      riskLevel,
      severity: riskLevel,
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

export const urlAnalyzer = new UrlAnalyzer();
export const analyzeUrl = (url: string) => urlAnalyzer.analyze(url);
