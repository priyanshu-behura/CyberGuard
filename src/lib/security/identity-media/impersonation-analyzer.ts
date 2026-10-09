/**
 * CYBERGUARD Digital Impersonation & Identity Context Intelligence Engine
 * Comprehensive multi-stage pipeline:
 * Input Normalization -> Identity Extraction -> Social Engineering Analysis
 * -> Intent Analysis -> URL Correlation -> Identity Consistency -> Risk & Evidence
 */

import {
  IdentityAssessmentResult,
  ManipulationIndicator,
  MediaEvidenceItem,
  RiskLevel,
  AuthenticityClassification,
} from "./types";
import { urlAnalyzer } from "../url-analyzer";

export interface ImpersonationInput {
  claimedIdentity?: string;
  claimedOrganization?: string;
  claimCategory?: string;
  communicationText: string;
  destinationUrl?: string;
  embeddedUrl?: string; // backwards compatibility
  attachedMediaRiskScore?: number;
  attachedMediaClassification?: string;
}

export interface ImpersonationAnalysisOutput {
  assessment: IdentityAssessmentResult;
  riskScore: number;
  riskLevel: RiskLevel;
  classification: AuthenticityClassification;
  confidence: number;
  summary: string;
  indicators: ManipulationIndicator[];
  evidence: MediaEvidenceItem[];
  recommendedActions: string[];
}

export function analyzeDigitalImpersonation(input: ImpersonationInput): ImpersonationAnalysisOutput {
  const comms = (input.communicationText || "").trim();
  const lowerComms = comms.toLowerCase();

  // 1. NORMALIZATION & URL EXTRACTION
  let destinationUrl = (input.destinationUrl || input.embeddedUrl || "").trim();
  if (!destinationUrl) {
    // Extract first URL from communication text if user didn't enter one explicitly
    const urlMatch = comms.match(/https?:\/\/[^\s<>"]+/i);
    if (urlMatch) {
      destinationUrl = urlMatch[0];
    }
  }

  // 2. CLAIMED IDENTITY & ORGANIZATION EXTRACTION
  let claimedId = (input.claimedIdentity || "").trim();
  let claimedOrg = (input.claimedOrganization || "").trim();

  // If claimedIdentity was not supplied, attempt contextual extraction from greetings/signatures/intro
  if (!claimedId) {
    const introMatch = comms.match(
      /(?:this is|i am|we are|speaking on behalf of|from the)\s+([a-zA-Z\s]{3,40}?)(?:\.|,|\n|at|from|with)/i
    );
    if (introMatch && introMatch[1]) {
      const candidate = introMatch[1].trim();
      if (!candidate.match(/^(the|a|an|writing|reaching|noticing|checking)$/i)) {
        claimedId = candidate;
      }
    } else {
      const sigMatch = comms.match(/(?:regards|sincerely|thanks|from|—|-)\s*[\n\r]+\s*([a-zA-Z\s]{3,35})/i);
      if (sigMatch && sigMatch[1]) {
        claimedId = sigMatch[1].trim();
      }
    }
  }

  // If claimedOrganization was not supplied, attempt extraction
  if (!claimedOrg) {
    const orgMatch = comms.match(
      /(?:at|of|with|from)\s+([a-zA-Z\s]{3,40}?(?:college|university|institute|academy|bank|corporation|technologies|solutions|department))/i
    );
    if (orgMatch && orgMatch[1]) {
      claimedOrg = orgMatch[1].trim();
    }
  }

  // 3. PERSONA CATEGORY DEDUCTION
  const combinedPersonaContext = `${claimedId} ${claimedOrg} ${comms.slice(0, 300)}`.toLowerCase();
  let category: IdentityAssessmentResult["claimCategory"] = "general_unknown";

  if (
    input.claimCategory &&
    input.claimCategory !== "auto" &&
    input.claimCategory !== "general_unknown"
  ) {
    category = input.claimCategory as IdentityAssessmentResult["claimCategory"];
  } else {
    if (
      combinedPersonaContext.match(
        /(university|college|scholarship|accounts department|registrar|chancellor|dean|professor|faculty|academic|bput|gift autonomous|student portal|admissions|semester|exam controller)/i
      )
    ) {
      category = "university_teacher";
    } else if (
      combinedPersonaContext.match(
        /(ceo|chief executive|cfo|cto|director|executive|vp|vice president|founder|chairman|managing director|board of directors)/i
      )
    ) {
      category = "executive";
    } else if (
      combinedPersonaContext.match(
        /(bank|hdfc|sbi|icici|chase|wells fargo|barclays|paypal|stripe|treasury|financial services|credit card|wire desk)/i
      )
    ) {
      category = "financial_institution";
    } else if (
      combinedPersonaContext.match(
        /(police|fbi|court|interpol|cbi|income tax|irs|customs|enforcement|inspector|law enforcement|ministry|marshal)/i
      )
    ) {
      category = "authority";
    } else if (
      combinedPersonaContext.match(
        /(support|helpdesk|customer service|it desk|security operations|admin|system administrator)/i
      )
    ) {
      category = "support_agent";
    } else if (
      combinedPersonaContext.match(/(mom|dad|mother|father|brother|sister|son|daughter|friend|buddy|cousin)/i)
    ) {
      category = "friend_family";
    }
  }

  const indicators: ManipulationIndicator[] = [];
  const evidence: MediaEvidenceItem[] = [];

  // Register Claimed Persona Evidence
  evidence.push({
    id: "ev-claimed-identity",
    label: "Claimed Persona / Role",
    value: claimedId || "Unspecified / Open Claim",
    category: "identity",
    isSuspicious: Boolean(claimedId && category !== "general_unknown"),
    explanation: claimedId
      ? `Sender explicitly identifies as "${claimedId}".`
      : "No explicit persona role supplied.",
  });

  if (claimedOrg) {
    evidence.push({
      id: "ev-claimed-org",
      label: "Claimed Organization",
      value: claimedOrg,
      category: "identity",
      isSuspicious: false,
      explanation: `Sender claims affiliation with "${claimedOrg}".`,
    });
  }

  evidence.push({
    id: "ev-claim-cat",
    label: "Targeted Persona Profile",
    value: category.toUpperCase().replace("_", " "),
    category: "identity",
    isSuspicious: category !== "general_unknown",
    explanation: `Communication claims authority within ${category.replace("_", " ")} context.`,
  });

  // 4. SOCIAL ENGINEERING & INTENT ANALYSIS
  // A. Urgency & Time Pressure
  const deadlineMatch = lowerComms.match(/within\s+(\d+\s*(?:minutes?|hours?|days?|mins?))/i);
  const generalUrgency = lowerComms.match(
    /(immediately|immediate|urgent|urgently|without delay|promptly|asap|today|deadline|expires soon|emergency|critical)/i
  );
  const isUrgent = Boolean(deadlineMatch || generalUrgency);
  const deadlineText = deadlineMatch ? deadlineMatch[1] : generalUrgency ? generalUrgency[1] : null;

  // B. Coercive Threat / Consequences
  const threatConsequence = lowerComms.match(
    /(will result in cancellation|will be cancelled|suspended|on hold|loss of access|penalty|debarred|terminated|frozen|blocked|action will be taken|cancellation)/i
  );
  const hasThreat = Boolean(threatConsequence);

  // C. Financial Pretext / Request
  const financialSolicit = lowerComms.match(
    /(scholarship payment|payment is (?:currently )?on hold|bank account|wire transfer|send money|transfer funds|pay now|fee clearance|deposit|invoice|gift card|crypto|refund|billing statement|balance due)/i
  );
  const isFinancial = Boolean(financialSolicit);

  // D. Credential & Verification Request
  const credentialSolicit = lowerComms.match(
    /(verify your bank account|verify your account|confirm your identity|verification link|verify your credentials|password|otp|pin|login credentials|sign-in|verification code|validate your)/i
  );
  const isCredential = Boolean(credentialSolicit);

  // E. Secrecy / Channel Diversion
  const secrecySolicit = lowerComms.match(
    /(do not tell|keep this (?:secret|confidential|between us)|don't inform|cannot take calls|confidential deal)/i
  );
  const isSecretive = Boolean(secrecySolicit);

  // 5. INTENT CLASSIFICATION
  const intents: string[] = [];
  if (isCredential) intents.push("Account Verification / Credential Solicitation");
  if (isFinancial) intents.push("Financial Asset / Payment Withholding Pretext");
  if (isUrgent) intents.push("Temporal Pressure / Artificial Deadline");
  if (hasThreat) intents.push("Coercive Cancellation / Penalty Threat");
  if (isSecretive) intents.push("Channel Diversion / Confidentiality Demand");

  if (intents.length > 0) {
    evidence.push({
      id: "ev-intents",
      label: "Detected Communication Intents",
      value: intents.join("; "),
      category: "intent",
      isSuspicious: true,
      severity: isCredential || isFinancial ? "high" : "medium",
    });
  }

  // 6. URL & DOMAIN CORRELATION
  let isDomainMismatch = false;
  let parsedDomain = "";
  let urlRiskScore = 0;

  if (destinationUrl) {
    try {
      const urlAnalysis = urlAnalyzer.analyze(destinationUrl);
      urlRiskScore = urlAnalysis.riskScore;
      parsedDomain = urlAnalysis.url;

      try {
        const urlObj = new URL(destinationUrl.startsWith("http") ? destinationUrl : `https://${destinationUrl}`);
        parsedDomain = urlObj.hostname;
      } catch {
        // fallback to analyzed url
      }

      evidence.push({
        id: "ev-dest-url",
        label: "Destination URL",
        value: destinationUrl,
        category: "url",
        isSuspicious: urlAnalysis.riskScore >= 30,
        severity: urlAnalysis.riskScore >= 70 ? "high" : urlAnalysis.riskScore >= 30 ? "medium" : "low",
        explanation: `Evaluated as ${urlAnalysis.riskLevel} (${urlAnalysis.riskScore}/100) by URL intelligence engine.`,
      });

      // Domain Affiliation Cross-Check
      if (claimedOrg || claimedId) {
        const lowerDomain = parsedDomain.toLowerCase();
        const lowerEntity = `${claimedOrg} ${claimedId}`.toLowerCase();

        // Check if destination is a generic / public / unrelated domain
        const isGenericDomain = Boolean(
          lowerDomain.match(
            /(example\.com|bit\.ly|tinyurl|ngrok|web\.app|firebaseapp|vercel\.app|pages\.dev|google\.com|forms\.gle)/i
          )
        );

        // Check if domain matches any recognizable token in the claimed org
        const orgTokens = lowerEntity
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((t) => t.length > 3 && !["department", "college", "university", "accounts", "chief", "executive"].includes(t));

        const matchesOrg = orgTokens.some((token) => lowerDomain.includes(token));

        if (!matchesOrg || isGenericDomain) {
          isDomainMismatch = true;
          evidence.push({
            id: "ev-domain-mismatch",
            label: "Identity-Domain Affiliation",
            value: `MISMATCH: ${parsedDomain} ≠ ${claimedOrg || claimedId}`,
            category: "url",
            isSuspicious: true,
            severity: "high",
            explanation: `Destination domain "${parsedDomain}" does not match the official namespace of claimed entity "${claimedOrg || claimedId}".`,
          });
        } else {
          evidence.push({
            id: "ev-domain-match",
            label: "Identity-Domain Affiliation",
            value: `Consistent with ${claimedOrg || claimedId}`,
            category: "url",
            isSuspicious: false,
          });
        }
      }
    } catch {
      // Ignored if URL parse fails
    }
  }

  // 7. DETERMINISTIC MULTI-VECTOR RISK SCORING (Evidence-Driven)
  let riskScore = 10; // Baseline floor for neutral inquiry

  // A. Evaluate Benign Routine Communications First
  const isBenignRoutine =
    !hasThreat &&
    !isCredential &&
    !isDomainMismatch &&
    (!isUrgent || !isFinancial) &&
    lowerComms.match(/(whenever convenient|when convenient|at your convenience|receipt is ready|review when|routine notice|scheduled for tomorrow)/i);

  if (isBenignRoutine) {
    riskScore = 15;
  } else {
    // Accumulate risk based on correlated vectors
    if (claimedId || claimedOrg) {
      if (category === "university_teacher" || category === "financial_institution" || category === "authority") {
        riskScore += 15; // Authority persona leverage
      } else if (category === "executive") {
        riskScore += 20;
      }
    }

    if (isUrgent) {
      riskScore += deadlineMatch ? 20 : 12;
      indicators.push({
        id: "ind-urgency",
        name: "Artificial Urgency & Time Pressure",
        category: "identity",
        severity: deadlineMatch ? "high" : "medium",
        scoreImpact: deadlineMatch ? 20 : 12,
        confidence: 85,
        description: deadlineText
          ? `Imposes a strict temporal deadline (${deadlineText}) designed to induce rushed compliance.`
          : "Applies immediate urgency to bypass standard out-of-band verification.",
        technicalDetails: `Matched temporal constraint: "${deadlineText || "immediate"}"`,
      });
      evidence.push({
        id: "ev-urgency",
        label: "Temporal Constraint",
        value: deadlineText ? `Deadline: ${deadlineText}` : "Immediate Action Pressure",
        category: "intent",
        isSuspicious: true,
        severity: deadlineMatch ? "high" : "medium",
      });
    }

    if (hasThreat) {
      riskScore += 20;
      indicators.push({
        id: "ind-threat-coercion",
        name: "Coercive Consequence & Penalty Threat",
        category: "identity",
        severity: "high",
        scoreImpact: 20,
        confidence: 88,
        description: `Communication threatens negative consequences ("${threatConsequence?.[0] || "cancellation"}") if instructions are not carried out promptly.`,
        technicalDetails: `Coercive phrase: "${threatConsequence?.[0]}"`,
      });
      evidence.push({
        id: "ev-threat",
        label: "Threatened Consequence",
        value: threatConsequence?.[0] || "Cancellation/Suspension",
        category: "intent",
        isSuspicious: true,
        severity: "high",
      });
    }

    if (isFinancial) {
      riskScore += 20;
      indicators.push({
        id: "ind-financial-pretext",
        name: "Financial Withholding / Payment Pretext",
        category: "identity",
        severity: "high",
        scoreImpact: 20,
        confidence: 85,
        description: "Uses financial aid, scholarship, or payment status as psychological leverage to compel cooperation.",
        technicalDetails: `Financial trigger: "${financialSolicit?.[0]}"`,
      });
      evidence.push({
        id: "ev-financial",
        label: "Financial Leverage",
        value: financialSolicit?.[0] || "Financial Transaction Pretext",
        category: "intent",
        isSuspicious: true,
        severity: "high",
      });
    }

    if (isCredential) {
      riskScore += 25;
      indicators.push({
        id: "ind-credential-solicit",
        name: "Account / Banking Verification Solicitation",
        category: "identity",
        severity: "critical",
        scoreImpact: 25,
        confidence: 90,
        description: "Directly solicits bank account verification, credential confirmation, or authentication details.",
        technicalDetails: `Verification prompt: "${credentialSolicit?.[0]}"`,
      });
      evidence.push({
        id: "ev-cred-solicit",
        label: "Credential / Account Solicitation",
        value: credentialSolicit?.[0] || "Bank Account Verification",
        category: "intent",
        isSuspicious: true,
        severity: "high",
      });
    }

    if (destinationUrl) {
      if (isDomainMismatch) {
        riskScore += 25;
        indicators.push({
          id: "ind-domain-mismatch",
          name: "Unrelated Destination Domain Mismatch",
          category: "identity",
          severity: "critical",
          scoreImpact: 25,
          confidence: 92,
          description: `The communication claims to represent "${claimedOrg || claimedId}", but directs recipient to external destination "${parsedDomain}".`,
          technicalDetails: `Domain mismatch between claimed entity and destination host "${parsedDomain}".`,
        });
      } else if (urlRiskScore >= 40) {
        riskScore += 20;
        indicators.push({
          id: "ind-suspicious-url",
          name: "Correlated High-Risk Destination Link",
          category: "identity",
          severity: "high",
          scoreImpact: 20,
          confidence: 85,
          description: `Embedded URL evaluated as elevated risk (${urlRiskScore}/100) by URL intelligence engine.`,
        });
      }
    }

    if (isSecretive) {
      riskScore += 15;
      indicators.push({
        id: "ind-secrecy",
        name: "Secrecy / Out-of-Band Diversion",
        category: "identity",
        severity: "medium",
        scoreImpact: 15,
        confidence: 80,
        description: "Demands strict confidentiality or discourages routine phone/office confirmation.",
      });
    }

    // Media attachment correlation
    if (input.attachedMediaRiskScore !== undefined && input.attachedMediaRiskScore > 40) {
      const mediaBump = Math.round(input.attachedMediaRiskScore * 0.3);
      riskScore += mediaBump;
      indicators.push({
        id: "ind-synthetic-media-link",
        name: "Correlated Synthetic Media Anomaly",
        category: "identity",
        severity: input.attachedMediaRiskScore >= 70 ? "critical" : "high",
        scoreImpact: mediaBump,
        confidence: 80,
        description: `Attached media asset flagged with elevated risk (${input.attachedMediaRiskScore}/100).`,
      });
    }
  }

  // 8. FINAL SCORE & VERDICT RESOLUTION
  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel: RiskLevel = "SAFE";
  let classification: AuthenticityClassification = "AUTHENTIC / NO STRONG MANIPULATION SIGNALS";
  let consistencyVerdict: IdentityAssessmentResult["consistencyVerdict"] = "CONSISTENT";

  if (riskScore >= 90) {
    riskLevel = "CRITICAL";
    classification = "LIKELY MANIPULATED";
    consistencyVerdict = "LIKELY IMPERSONATION";
  } else if (riskScore >= 70) {
    riskLevel = "HIGH";
    classification = "POTENTIALLY MANIPULATED";
    consistencyVerdict = "POTENTIAL_IMPERSONATION";
  } else if (riskScore >= 40) {
    riskLevel = "MEDIUM";
    classification = "POTENTIALLY MANIPULATED";
    consistencyVerdict = "POTENTIALLY INCONSISTENT";
  } else if (riskScore >= 20) {
    riskLevel = "LOW";
    classification = "AUTHENTIC / NO STRONG MANIPULATION SIGNALS";
    consistencyVerdict = "CONSISTENT";
  } else {
    riskLevel = "SAFE";
    classification = "AUTHENTIC / NO STRONG MANIPULATION SIGNALS";
    consistencyVerdict = "CONSISTENT";
  }

  // Heuristic confidence calculation based on volume and depth of correlated evidence
  const confidence = Math.min(95, Math.max(65, 55 + indicators.length * 9));

  // 9. IDENTITY ASSESSMENT OBJECT
  const assessment: IdentityAssessmentResult = {
    claimedIdentity: claimedId || (category !== "general_unknown" ? category.replace("_", " ") : "Unspecified Entity"),
    claimedOrganization: claimedOrg || undefined,
    claimCategory: category,
    communicationStyleRisk: isUrgent || hasThreat || isFinancial ? "high" : "low",
    urgencyDetected: isUrgent,
    financialRequestDetected: isFinancial,
    credentialRequestDetected: isCredential,
    channelDiscrepancy: isDomainMismatch,
    destinationUrl: destinationUrl || undefined,
    domainDiscrepancyDetected: isDomainMismatch,
    threatIntentsDetected: intents,
    assessmentSummary:
      consistencyVerdict === "LIKELY IMPERSONATION" || consistencyVerdict === "POTENTIAL_IMPERSONATION"
        ? `Communication exhibits strong characteristics of ${category.replace("_", " ")} impersonation accompanied by anomalous pressure.`
        : consistencyVerdict === "POTENTIALLY INCONSISTENT"
        ? `Communication exhibits potential inconsistencies between claimed identity and requested actions.`
        : `Identity consistency assessment indicates low to moderate threat signals. No coercive impersonation confirmed.`,
    consistencyVerdict,
  };

  // 10. REAL EXPLAINABLE SUMMARY (Tracing actual input details)
  let summary = "";
  if (consistencyVerdict === "LIKELY IMPERSONATION" || consistencyVerdict === "POTENTIAL_IMPERSONATION") {
    const parts: string[] = [];
    if (claimedId || claimedOrg) {
      parts.push(`claims to represent "${[claimedId, claimedOrg].filter(Boolean).join(" at ")}"`);
    }
    if (isFinancial) {
      parts.push("asserts that scholarship or payments are on hold");
    }
    if (isCredential) {
      parts.push("demands bank account or credential verification");
    }
    if (deadlineText) {
      parts.push(`imposes an artificial ${deadlineText} deadline`);
    } else if (isUrgent) {
      parts.push("imposes urgent time pressure");
    }
    if (hasThreat) {
      parts.push("threatens cancellation of services");
    }
    if (isDomainMismatch) {
      parts.push(`directs the recipient to an external, unrelated destination ("${parsedDomain}")`);
    }

    summary = `CYBERGUARD identified multiple correlated impersonation indicators. The message ${parts.join(
      ", "
    )}. These combined signals are consistent with a targeted digital impersonation and credential harvesting attempt.`;
  } else if (consistencyVerdict === "POTENTIALLY INCONSISTENT") {
    summary = `CYBERGUARD identified moderate risk signals. Inconsistencies detected in requested verification actions or temporal constraints. Verification advised before complying.`;
  } else {
    summary = `AUTHENTIC PROFILE: Routine communication style with no high-pressure coercive demands, payment solicitations, or destination domain anomalies flagged.`;
  }

  // 11. RECOMMENDED ACTIONS
  const recommendedActions: string[] = [];
  if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
    recommendedActions.push("Do NOT click the link, transfer funds, or provide banking/login credentials.");
    if (claimedOrg || claimedId) {
      recommendedActions.push(
        `Independently verify with ${claimedOrg || claimedId} using a known, trusted phone number or directory — do not reply to this message.`
      );
    } else {
      recommendedActions.push("Contact the alleged sender through an established out-of-band channel.");
    }
    recommendedActions.push("Report this communication to your institution's security or IT desk.");
  } else if (riskLevel === "MEDIUM") {
    recommendedActions.push("Exercise elevated caution before opening attachments or following links.");
    recommendedActions.push("Confirm authorization with the relevant administrative office.");
  } else {
    recommendedActions.push("Standard routine communication. Observe regular security hygiene.");
  }

  return {
    assessment,
    riskScore,
    riskLevel,
    classification,
    confidence,
    summary,
    indicators,
    evidence,
    recommendedActions,
  };
}
