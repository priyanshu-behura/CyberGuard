/**
 * CYBERGUARD Intelligent Response Recommendation Engine
 *
 * Deterministic rule-based engine converting security detections and incidents into
 * structured, evidence-backed ResponseActions with human-in-the-loop approval gates.
 *
 * Principles:
 * - Deterministic baseline always functions without external AI.
 * - High-impact containment actions (Revoke Session, Block IP, Block URL, Reset Credential) ALWAYS require human approval.
 * - Low-impact actions (Warn User, Monitor, Notify Admin) can be executed without high barriers.
 * - Never claims real external firewall/IdP actions occurred; all actions clearly designate SIMULATED vs REAL execution modes.
 */

import { SecurityIncident } from "../incident-store";
import { ResponseAction, ResponseCategory, ResponsePriority, ResponseSeverity } from "./types";

export class ResponseEngine {
  /**
   * Generates prioritized response actions for a security incident.
   */
  public generateResponseActions(incident: SecurityIncident): ResponseAction[] {
    const actions: ResponseAction[] = [];

    // Safe incidents or scores below 20 produce NO unnecessary response actions
    if (incident.riskScore < 20 && (incident.severity === "SAFE" || incident.severity === ("Safe" as any))) {
      return [];
    }

    const titleLower = incident.title.toLowerCase();
    const sourceLower = incident.source.toLowerCase();
    const summaryLower = incident.summary.toLowerCase();

    // -------------------------------------------------------------------------
    // 1. ACCOUNT TAKEOVER (ATO)
    // -------------------------------------------------------------------------
    if (
      titleLower.includes("account takeover") ||
      titleLower.includes("takeover") ||
      summaryLower.includes("account takeover") ||
      summaryLower.includes("compromised account")
    ) {
      const targetUser = incident.targetAccount || incident.associatedSender || "analyst@cyberguard.internal";

      // Action A: Revoke Session (High Impact - Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "REVOKE_SESSION",
          title: "Revoke Active Authenticated Sessions",
          description: `Immediately terminate all concurrent OAuth tokens and authenticated sessions for account "${targetUser}".`,
          severity: incident.severity,
          priority: "CRITICAL",
          target: { type: "ACCOUNT", value: targetUser, label: "Compromised Account" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `High-confidence account takeover indicators detected. Multiple failed attempts followed by session establishment from an unauthorized host require instant session invalidation.`,
          potentialImpact: `The user will be immediately logged out across all active browser sessions and API tokens. Any unauthorized sessions held by the threat actor will be severed.`,
          whatHappened: `An adversary successfully authenticated to account "${targetUser}" following brute-force failures or location anomaly.`,
          whyRisky: `Adversary currently holds an active authenticated session with potential access to internal communications, credentials, or corporate assets.`,
          whatShouldBeDone: `Invalidate all active sessions across identity providers to sever hostile access.`,
          whyThisAction: `Session termination is the primary containment step to deny adversary ongoing persistence.`,
          whatHappensIfApproved: `Internal session record is invalidated. In a production environment, IdP session revoke API would be dispatched.`,
        })
      );

      // Action B: Require Step-up MFA (Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "REQUIRE_MFA",
          title: "Enforce Step-Up Hardware MFA on Re-Authentication",
          description: `Force hardware key (FIDO2) or authenticator app verification for the next sign-in attempt on "${targetUser}".`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "ACCOUNT", value: targetUser, label: "Target Account" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `Prevent adversary from re-authenticating with compromised static password.`,
          potentialImpact: `User must complete a secondary out-of-band verification challenge before gaining entry.`,
          whatHappened: `Credentials for "${targetUser}" appear compromised across anomalous login parameters.`,
          whyRisky: `Static password alone is no longer trustworthy.`,
          whatShouldBeDone: `Mandate cryptographic second-factor verification on subsequent login attempts.`,
          whyThisAction: `Prevents automated credential re-use even if the password remains compromised.`,
          whatHappensIfApproved: `IdP authentication policy rule is updated to require mandatory step-up verification.`,
        })
      );

      // Action C: Force Credential Reset (Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "RESET_CREDENTIAL",
          title: "Mandate Emergency Password Reset",
          description: `Flag account credentials as expired and dispatch a secure out-of-band password reset link.`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "ACCOUNT", value: targetUser, label: "Account Directory" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `Static credentials must be rotated to permanently remediate the compromise vector.`,
          potentialImpact: `Current password is permanently invalidated. Legitimate user must reset password via recovery channel.`,
          whatHappened: `Hostile actor established session under suspicious indicators.`,
          whyRisky: `The existing password hash is presumed known to the threat actor.`,
          whatShouldBeDone: `Rotate credentials immediately.`,
          whyThisAction: `Permanent remediation of the compromised authentication factor.`,
          whatHappensIfApproved: `A credential expiration flag is set on the user directory.`,
        })
      );

      // Action D: Warn Account Owner (Low Impact - Auto-Approvable)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "WARN_USER",
          title: "Dispatch Security Advisory to Account Owner",
          description: `Send an urgent security notification via verified mobile/SMS informing user of anomalous access.`,
          severity: incident.severity,
          priority: "MEDIUM",
          target: { type: "ACCOUNT", value: targetUser, label: "User Notification" },
          requiresApproval: false,
          evidence: incident.evidenceSnippets,
          reason: `Ensure legitimate account owner is aware of unauthorized access attempt.`,
          potentialImpact: `User receives an informative security alert with verification instructions. No disruption to system state.`,
          whatHappened: `Suspicious access event logged for user.`,
          whyRisky: `Account owner may be unaware of active unauthorized usage.`,
          whatShouldBeDone: `Notify owner via trusted secondary communication channel.`,
          whyThisAction: `Allows legitimate user to confirm whether they initiated the login or are under attack.`,
          whatHappensIfApproved: `Notification message queued for dispatch.`,
        })
      );

      return actions;
    }

    // -------------------------------------------------------------------------
    // 2. PASSWORD SPRAYING / BRUTE FORCE CAMPAIGN
    // -------------------------------------------------------------------------
    if (
      titleLower.includes("password spraying") ||
      titleLower.includes("spraying") ||
      titleLower.includes("brute force") ||
      summaryLower.includes("password spraying")
    ) {
      const targetIp = incident.targetIp || "194.26.29.11";

      // Action A: Block Hostile Source IP (High Impact - Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "BLOCK_IP",
          title: "Temporary Gateway Ban on Hostile IP",
          description: `Apply a 24-hour network firewall rate-limit and gateway ingress block on source IP "${targetIp}".`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "IP", value: targetIp, label: "Attacker Ingress IP" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `Hostile IP address observed cycling through multiple corporate usernames in rapid succession.`,
          potentialImpact: `Traffic from "${targetIp}" will be dropped at the gateway edge. (Verify IP is not an enterprise NAT/VPN proxy).`,
          whatHappened: `Single IP address attempted authentication against multiple distinct enterprise accounts.`,
          whyRisky: `Coordinated credential-stuffing or spraying campaign attempting horizontal privilege discovery.`,
          whatShouldBeDone: `Block ingress traffic from the offending IP address at the edge gateway.`,
          whyThisAction: `Throttles the attack campaign and prevents further credential guessing.`,
          whatHappensIfApproved: `Edge firewall ACL rule is simulated to block incoming packets from target IP.`,
        })
      );

      // Action B: Step-up MFA across targeted accounts (Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "REQUIRE_MFA",
          title: "Enforce Adaptive MFA for Targeted Accounts",
          description: `Trigger mandatory MFA challenges for any accounts targeted by the spraying campaign.`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "SERVICE", value: "Enterprise Auth Realm", label: "Authentication Subsystem" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `Hardens targeted accounts against credential guessing.`,
          potentialImpact: `Targeted users must complete multi-factor verification on subsequent logins.`,
          whatHappened: `Multiple corporate accounts probed by foreign IP.`,
          whyRisky: `Weak or leaked passwords could be successfully guessed without MFA.`,
          whatShouldBeDone: `Mandate MFA for all affected usernames.`,
          whyThisAction: `Neutralizes password guessing attempts.`,
          whatHappensIfApproved: `Adaptive risk policy applied to targeted user group.`,
        })
      );

      // Action C: Notify SOC (Auto-Approvable)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "NOTIFY_SOC",
          title: "Escalate Credential Spraying Dossier to SOC",
          description: `Dispatch telemetry audit trail and IP reputation report to internal Security Operations Center.`,
          severity: incident.severity,
          priority: "MEDIUM",
          target: { type: "SERVICE", value: "SOC Incident Queue", label: "Security Operations" },
          requiresApproval: false,
          evidence: incident.evidenceSnippets,
          reason: `Enables SOC analysts to correlate external threat feeds and inspect linked network boundaries.`,
          potentialImpact: `SOC ticket opened. No operational downtime.`,
          whatHappened: `Automated password spraying campaign detected.`,
          whyRisky: `Could be part of a broader reconnaissance campaign by an APT or cybercriminal syndicate.`,
          whatShouldBeDone: `Alert internal defense analysts for cross-telemetry correlation.`,
          whyThisAction: `Ensures human security team has visibility over distributed attacks.`,
          whatHappensIfApproved: `SIEM alert generated with structured incident metadata.`,
        })
      );

      return actions;
    }

    // -------------------------------------------------------------------------
    // 3. PHISHING / SUSPICIOUS URL / DECEPTIVE MESSAGE
    // -------------------------------------------------------------------------
    if (
      titleLower.includes("phishing") ||
      titleLower.includes("url") ||
      titleLower.includes("message") ||
      summaryLower.includes("phishing") ||
      summaryLower.includes("credential harvesting") ||
      incident.associatedUrl
    ) {
      const targetUrl = incident.targetUrl || incident.associatedUrl || "https://secure-login-account-update.xyz/auth";
      const targetSender = incident.associatedSender || "service-alerts@notifications-update.com";
      const isHighRisk = incident.riskScore >= 70;

      if (isHighRisk) {
        // Action A: Block Malicious URL (High Impact - Approval Required)
        actions.push(
          this.createAction({
            incidentId: incident.id,
            category: "BLOCK_URL",
            title: "Sinkhole & Block Deceptive Domain at Gateway",
            description: `Add "${targetUrl}" to corporate DNS blocklist and gateway web proxy filters.`,
            severity: incident.severity,
            priority: "HIGH",
            target: { type: "URL", value: targetUrl, label: "Malicious Destination URL" },
            requiresApproval: true,
            evidence: incident.evidenceSnippets,
            reason: `Destination URL mimics official brand login portal and exhibits credential harvesting heuristics.`,
            potentialImpact: `Users attempting to browse "${targetUrl}" will receive a warning interception splash screen.`,
            whatHappened: `Phishing lure containing deceptive destination link detected.`,
            whyRisky: `Employees visiting this link may enter enterprise passwords or session tokens into hostile infrastructure.`,
            whatShouldBeDone: `Block outbound traffic to the URL at DNS and proxy levels.`,
            whyThisAction: `Neutralizes the destination harvest point.`,
            whatHappensIfApproved: `DNS sinkhole entry simulated across enterprise resolvers.`,
          })
        );

        // Action B: Quarantine Malicious Message (Approval Required)
        actions.push(
          this.createAction({
            incidentId: incident.id,
            category: "QUARANTINE_EMAIL",
            title: "Purge & Quarantine Phishing Message from Inboxes",
            description: `Search email gateways for messages originating from "${targetSender}" and move to administrative quarantine.`,
            severity: incident.severity,
            priority: "HIGH",
            target: { type: "MESSAGE", value: targetSender, label: "Hostile Sender Address" },
            requiresApproval: true,
            evidence: incident.evidenceSnippets,
            reason: `Urgency-laced message impersonates administrative authority to solicit credential submission.`,
            potentialImpact: `Removes malicious email from employee mailboxes to prevent accidental clicks.`,
            whatHappened: `Deceptive message delivered to user inbox.`,
            whyRisky: `Recipients may be deceived by psychological urgency and corporate spoofing.`,
            whatShouldBeDone: `Remove the message from all recipient mailboxes immediately.`,
            whyThisAction: `Prevents secondary exposure across other employees who received the same campaign.`,
            whatHappensIfApproved: `Mail server quarantine API executed to isolate matching message IDs.`,
          })
        );

        // Action C: Warn Affected Users (Auto-Approvable)
        actions.push(
          this.createAction({
            incidentId: incident.id,
            category: "WARN_USER",
            title: "Broadcast Phishing Warning to Recipients",
            description: `Dispatch a targeted banner warning informing recipients that a message from "${targetSender}" was flagged as fraudulent.`,
            severity: incident.severity,
            priority: "MEDIUM",
            target: { type: "ACCOUNT", value: "Affected Recipients", label: "Target Audience" },
            requiresApproval: false,
            evidence: incident.evidenceSnippets,
            reason: `Educates users who may have already opened the message prior to quarantine.`,
            potentialImpact: `Displays informative security prompt warning users not to provide credentials.`,
            whatHappened: `Users received high-risk phishing communication.`,
            whyRisky: `Users who clicked may already be considering credential entry.`,
            whatShouldBeDone: `Deliver prompt warning urging users not to interact.`,
            whyThisAction: `Empowers human defense layer immediately.`,
            whatHappensIfApproved: `Security warning dispatched to user client interface.`,
          })
        );
      } else {
        // Medium / Low Risk Phishing
        actions.push(
          this.createAction({
            incidentId: incident.id,
            category: "WARN_USER",
            title: "Flag Message with Cautionary Security Tag",
            description: `Attach a visual warning banner indicating moderate risk to the message.`,
            severity: incident.severity,
            priority: "LOW",
            target: { type: "MESSAGE", value: targetSender, label: "Suspicious Message" },
            requiresApproval: false,
            evidence: incident.evidenceSnippets,
            reason: `Message contains promotional or urgency indicators that warrant cautious handling.`,
            potentialImpact: `Advisory warning banner displayed atop email client.`,
            whatHappened: `Message evaluated with moderate risk signals.`,
            whyRisky: `Unverified sender or mildly coercive syntax observed.`,
            whatShouldBeDone: `Advise user to independently verify sender authenticity.`,
            whyThisAction: `Balances security posture without blocking potentially benign business communication.`,
            whatHappensIfApproved: `Security advisory label attached.`,
          })
        );

        actions.push(
          this.createAction({
            incidentId: incident.id,
            category: "MONITOR",
            title: "Add Destination URL to Reputation Watchlist",
            description: `Track external domain for reputation shifts or subsequent malware redirection.`,
            severity: incident.severity,
            priority: "LOW",
            target: { type: "URL", value: targetUrl, label: "Monitored Domain" },
            requiresApproval: false,
            evidence: incident.evidenceSnippets,
            reason: `Allows passive intelligence gathering without imposing user friction.`,
            potentialImpact: `Passive telemetry monitoring enabled.`,
            whatHappened: `Unrecognized external URL linked in message.`,
            whyRisky: `Domain lacks established corporate reputation.`,
            whatShouldBeDone: `Monitor domain behavior over 7-day observation window.`,
            whyThisAction: `Ensures future escalations trigger immediate alerts.`,
            whatHappensIfApproved: `Domain added to automated scraping & intelligence monitor.`,
          })
        );
      }

      return actions;
    }

    // -------------------------------------------------------------------------
    // 4. DEEPFAKE / SYNTHETIC MEDIA / IDENTITY IMPERSONATION
    // -------------------------------------------------------------------------
    if (
      titleLower.includes("deepfake") ||
      titleLower.includes("synthetic") ||
      titleLower.includes("impersonation") ||
      titleLower.includes("voice clone") ||
      sourceLower.includes("image") ||
      sourceLower.includes("video") ||
      sourceLower.includes("audio") ||
      sourceLower.includes("identity")
    ) {
      const mediaTarget = incident.title.includes("Audio")
        ? "Synthetic Voicemail Asset"
        : incident.title.includes("Video")
        ? "Synthetic Video Asset"
        : "Manipulated Identity Media";

      // Action A: Flag Media in Content Registry (Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "FLAG_MEDIA",
          title: "Tag Asset as Synthetic / Manipulated in Registry",
          description: `Add cryptographic perceptual hash of the media to the enterprise forensic registry marked "HIGH_MANIPULATION_CONFIDENCE".`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "MEDIA", value: mediaTarget, label: "Forensic Media Asset" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `Audio/visual forensics detected artifacts consistent with generative AI manipulation and spectral discontinuity.`,
          potentialImpact: `Asset will be flagged with a non-repudiation warning across all internal corporate communication channels.`,
          whatHappened: `Synthetic media detected mimicking a high-authority individual.`,
          whyRisky: `Adversary may leverage synthetic voice or video to coerce executive transfers, password disclosures, or fraudulent approvals.`,
          whatShouldBeDone: `Flag the asset in enterprise systems to prevent dissemination and belief.`,
          whyThisAction: `Provides undeniable visual and cryptographic verification of manipulation.`,
          whatHappensIfApproved: `Forensic perceptual hash stored in enterprise threat registry.`,
        })
      );

      // Action B: Report Impersonation & Escalation (Approval Required)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "REPORT_IMPERSONATION",
          title: "File Impersonation Incident with Fraud & Legal Teams",
          description: `Compile a tamper-evident PDF dossier of forensic indicators and submit to executive protection personnel.`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "SERVICE", value: "Executive Protection Unit", label: "Fraud & Compliance" },
          requiresApproval: true,
          evidence: incident.evidenceSnippets,
          reason: `Coercive persona spoofing represents potential criminal fraud under executive impersonation statutes.`,
          potentialImpact: `Legal and compliance teams are mobilized to issue formal platform takedown notices.`,
          whatHappened: `Persona of an authorized official cloned using synthetic tools.`,
          whyRisky: `Legal and corporate financial exposure if unauthorized commitments are honored.`,
          whatShouldBeDone: `Escalate incident to corporate legal and fraud units.`,
          whyThisAction: `Ensures compliance with regulatory disclosure protocols.`,
          whatHappensIfApproved: `Incident dossier dispatched to compliance webhook.`,
        })
      );

      // Action C: Warn Targeted Employees (Auto-Approvable)
      actions.push(
        this.createAction({
          incidentId: incident.id,
          category: "WARN_USER",
          title: "Issue Out-of-Band Verification Requirement",
          description: `Notify targeted recipients to require verbal in-person or out-of-band verification before executing any requested actions.`,
          severity: incident.severity,
          priority: "HIGH",
          target: { type: "ACCOUNT", value: "Finance & Accounting Staff", label: "Target Department" },
          requiresApproval: false,
          evidence: incident.evidenceSnippets,
          reason: `Zero-trust principle: all verbal or video instructions requesting wire transfers or password changes must be verified out-of-band.`,
          potentialImpact: `Recipients receive an imperative security policy reminder. No external impact.`,
          whatHappened: `Social engineering attempt leveraging synthetic media identified.`,
          whyRisky: `Employees might trust realistic-sounding synthetic voice messages.`,
          whatShouldBeDone: `Reinforce zero-trust out-of-band verification protocols.`,
          whyThisAction: `Immediately prevents financial loss by stopping unauthorized disbursements.`,
          whatHappensIfApproved: `Urgent advisory notice sent to finance group channels.`,
        })
      );

      return actions;
    }

    // -------------------------------------------------------------------------
    // 5. GENERAL THREAT / DEFAULT FALLBACK
    // -------------------------------------------------------------------------
    actions.push(
      this.createAction({
        incidentId: incident.id,
        category: "ESCALATE_INCIDENT",
        title: "Escalate Incident for SOC Analyst Review",
        description: `Assign incident "${incident.id}" to senior security analyst for triage and evidence validation.`,
        severity: incident.severity,
        priority: incident.severity === "CRITICAL" ? "CRITICAL" : "MEDIUM",
        target: { type: "SERVICE", value: "SOC Triage Queue", label: "Incident Queue" },
        requiresApproval: incident.severity === "CRITICAL",
        evidence: incident.evidenceSnippets,
        reason: `Correlated anomalous behavior requires manual analyst confirmation.`,
        potentialImpact: `Incident status transitioned to Investigating; assigned to on-duty analyst.`,
        whatHappened: `Security alert triggered above standard threat tolerance.`,
        whyRisky: `Unresolved anomalies may develop into full security breaches.`,
        whatShouldBeDone: `Conduct deeper forensic telemetry inspection.`,
        whyThisAction: `Ensures human expertise verifies algorithmic signals.`,
        whatHappensIfApproved: `Case escalated in incident management workflow.`,
      })
    );

    actions.push(
      this.createAction({
        incidentId: incident.id,
        category: "MONITOR",
        title: "Increase Surveillance Frequency",
        description: `Lower alert thresholds and increase logging granularity for affected entities.`,
        severity: incident.severity,
        priority: "LOW",
        target: { type: "SERVICE", value: "Telemetry Logger", label: "Surveillance Subsystem" },
        requiresApproval: false,
        evidence: incident.evidenceSnippets,
        reason: `Maintains heightened alertness following initial anomaly.`,
        potentialImpact: `High-frequency logging activated for 24 hours.`,
        whatHappened: `Anomalous pattern recorded.`,
        whyRisky: `Secondary attack phases may follow initial reconnaissance.`,
        whatShouldBeDone: `Capture high-resolution audit logs.`,
        whyThisAction: `Preserves forensic evidence for retroactive investigation.`,
        whatHappensIfApproved: `Sampling rate set to maximum for target context.`,
      })
    );

    return actions;
  }

  private createAction(params: {
    incidentId: string;
    category: ResponseCategory;
    title: string;
    description: string;
    severity: ResponseSeverity;
    priority: ResponsePriority;
    target: ResponseAction["target"];
    requiresApproval: boolean;
    evidence: string[];
    reason: string;
    potentialImpact: string;
    whatHappened: string;
    whyRisky: string;
    whatShouldBeDone: string;
    whyThisAction: string;
    whatHappensIfApproved: string;
  }): ResponseAction {
    const id = `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    return {
      id,
      incidentId: params.incidentId,
      title: params.title,
      description: params.description,
      category: params.category,
      severity: params.severity,
      priority: params.priority,
      target: params.target,
      reason: params.reason,
      evidence: params.evidence && params.evidence.length > 0 ? params.evidence : ["Automated security correlation signal"],
      requiresApproval: params.requiresApproval,
      status: params.requiresApproval ? "PENDING_APPROVAL" : "RECOMMENDED",
      createdAt: new Date().toISOString(),
      executionMode: "SIMULATED",
      source: "RULE_ENGINE",
      potentialImpact: params.potentialImpact,
      whyExplanation: {
        whatHappened: params.whatHappened,
        whyRisky: params.whyRisky,
        whatShouldBeDone: params.whatShouldBeDone,
        whyThisAction: params.whyThisAction,
        whatHappensIfApproved: params.whatHappensIfApproved,
        isApprovalRequired: params.requiresApproval,
      },
    };
  }
}

export const responseEngine = new ResponseEngine();
