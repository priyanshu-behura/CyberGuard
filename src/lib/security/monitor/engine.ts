/**
 * CYBERGUARD Authentication & Abnormal Behaviour Detection Engine
 * Multi-vector detection:
 * 1. Failed Login & Brute Force Analysis
 * 2. Password Spraying Detection (Same IP across multiple accounts)
 * 3. Unknown Device & Fingerprint Drift
 * 4. Geovelocity & Timeline Inconsistency (Impossible Travel)
 * 5. Behavioral Deviation from Baseline
 * 6. Account Takeover (ATO) Multi-Signal Correlation Engine
 */

import {
  AuthenticationEvent,
  BehaviorBaseline,
  MonitorAlert,
  AccountSecurityPosture,
  AccountSecurityStatus,
  MonitorRiskLevel,
} from "./types";

export interface DetectionResult {
  alerts: MonitorAlert[];
  overallRiskScore: number;
  overallRiskLevel: MonitorRiskLevel;
  postureStatus: AccountSecurityStatus;
  takeoverSuspected: boolean;
  explanation: string;
  recommendedResponse: string[];
}

export class MonitorDetectionEngine {
  /**
   * Evaluates an incoming event in context with historical events and the user baseline.
   */
  public evaluate(
    currentEvent: AuthenticationEvent,
    recentEvents: AuthenticationEvent[],
    baseline: BehaviorBaseline
  ): DetectionResult {
    const alerts: MonitorAlert[] = [];
    let cumulativeRisk = 10; // baseline safe floor
    let takeoverSuspected = false;

    // Filter events for this user within the last 2 hours (or last 20 events)
    const userEvents = recentEvents
      .filter((e) => e.userId === currentEvent.userId)
      .slice(0, 20);

    // Filter events from the same IP across ALL users (to detect password spraying)
    const sameIpEvents = recentEvents
      .filter((e) => e.ipAddress === currentEvent.ipAddress)
      .slice(0, 30);

    // -------------------------------------------------------------------------
    // 1. PASSWORD SPRAYING DETECTION (Same Source IP -> Multiple Accounts)
    // -------------------------------------------------------------------------
    const distinctUsersFromIp = new Set(sameIpEvents.map((e) => e.userEmail || e.userId));
    const failedLoginsFromIp = sameIpEvents.filter((e) => !e.success);

    if (distinctUsersFromIp.size >= 3 && failedLoginsFromIp.length >= 3) {
      cumulativeRisk += 45;
      const targetList = Array.from(distinctUsersFromIp).slice(0, 4).join(", ");
      alerts.push({
        id: `alt-spray-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        title: "Possible Password Spraying Campaign Detected",
        category: "PASSWORD_SPRAYING",
        severity: distinctUsersFromIp.size >= 5 ? "CRITICAL" : "HIGH",
        riskScore: distinctUsersFromIp.size >= 5 ? 90 : 75,
        status: "ACTIVE",
        explanation: `Source IP (${currentEvent.ipAddress}) attempted authentication against ${distinctUsersFromIp.size} distinct user accounts within a narrow window. This pattern indicates distributed credential spraying rather than single-target brute force.`,
        evidence: [
          `Source IP: ${currentEvent.ipAddress}`,
          `Targeted accounts count: ${distinctUsersFromIp.size} (${targetList})`,
          `Failed attempts recorded from source: ${failedLoginsFromIp.length}`,
        ],
        relatedEventIds: sameIpEvents.slice(0, 6).map((e) => e.id),
        targetUserId: currentEvent.userId,
        targetUserEmail: currentEvent.userEmail,
        recommendedActions: [
          "Temporarily throttle or challenge requests originating from source IP.",
          "Notify SOC to review enterprise firewall logs for IP subnet activity.",
          "Check targeted accounts for potential weak password exposure.",
        ],
        timestamp: currentEvent.timestamp,
        isDemo: currentEvent.isDemo,
      });
    }

    // -------------------------------------------------------------------------
    // 2. FAILED LOGIN & BRUTE FORCE DETECTION (Single Account)
    // -------------------------------------------------------------------------
    const consecutiveFailures = this.countTrailingFailures(userEvents);
    const hasRecentSuccessAfterFailures =
      currentEvent.success && consecutiveFailures >= 2;

    if (!currentEvent.success) {
      if (consecutiveFailures >= 5) {
        cumulativeRisk += 40;
        alerts.push({
          id: `alt-bf-high-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          title: "Repeated Authentication Failures / Targeted Brute Force",
          category: "FAILED_LOGIN",
          severity: "HIGH",
          riskScore: 78,
          status: "ACTIVE",
          explanation: `${consecutiveFailures} consecutive authentication failures recorded for account "${currentEvent.userEmail}". This exceeds normal typo tolerance and indicates sustained password guessing.`,
          evidence: [
            `Consecutive failure count: ${consecutiveFailures}`,
            `Source IP: ${currentEvent.ipAddress}`,
            `Device: ${currentEvent.deviceName} (${currentEvent.browser})`,
          ],
          relatedEventIds: userEvents.slice(0, consecutiveFailures).map((e) => e.id),
          targetUserId: currentEvent.userId,
          targetUserEmail: currentEvent.userEmail,
          recommendedActions: [
            "Trigger step-up MFA challenge for next login attempt.",
            "Alert account owner regarding suspicious authentication attempts.",
            "Enforce exponential backoff delay on authentication endpoint.",
          ],
          timestamp: currentEvent.timestamp,
          isDemo: currentEvent.isDemo,
        });
      } else if (consecutiveFailures >= 2) {
        cumulativeRisk += 20;
        alerts.push({
          id: `alt-bf-med-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          title: "Multiple Authentication Failures Observed",
          category: "FAILED_LOGIN",
          severity: "MEDIUM",
          riskScore: 45,
          status: "ACTIVE",
          explanation: `${consecutiveFailures} authentication failures observed in close succession. Could indicate incorrect credentials or initial probing.`,
          evidence: [
            `Failure count: ${consecutiveFailures}`,
            `Source location: ${currentEvent.location.city}, ${currentEvent.location.country}`,
          ],
          relatedEventIds: userEvents.slice(0, consecutiveFailures).map((e) => e.id),
          targetUserId: currentEvent.userId,
          targetUserEmail: currentEvent.userEmail,
          recommendedActions: [
            "Monitor subsequent attempts for account lockout threshold.",
            "Verify whether user recently changed credentials.",
          ],
          timestamp: currentEvent.timestamp,
          isDemo: currentEvent.isDemo,
        });
      }
    }

    // -------------------------------------------------------------------------
    // 3. UNKNOWN / UNRECOGNIZED DEVICE DETECTION
    // -------------------------------------------------------------------------
    const isKnownDevice = baseline.knownDevices.some(
      (d) => d.deviceId === currentEvent.deviceId
    );

    let isNewDevice = false;
    if (!isKnownDevice && baseline.hasSufficientHistory) {
      isNewDevice = true;
      cumulativeRisk += 18;
      alerts.push({
        id: `alt-device-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        title: "Login From Unrecognized Device",
        category: "UNKNOWN_DEVICE",
        severity: "LOW",
        riskScore: 28,
        status: "ACTIVE",
        explanation: `Authentication event observed from a previously unseen device (${currentEvent.deviceName}, ${currentEvent.os}, ${currentEvent.browser}).`,
        evidence: [
          `Device Identifier: ${currentEvent.deviceId}`,
          `Platform: ${currentEvent.deviceName} (${currentEvent.os})`,
          `Browser: ${currentEvent.browser}`,
        ],
        relatedEventIds: [currentEvent.id],
        targetUserId: currentEvent.userId,
        targetUserEmail: currentEvent.userEmail,
        recommendedActions: [
          "Confirm with account owner if they signed in from a new machine.",
          "Add device to trusted device register upon successful out-of-band verification.",
        ],
        timestamp: currentEvent.timestamp,
        isDemo: currentEvent.isDemo,
      });
    }

    // -------------------------------------------------------------------------
    // 4. LOCATION ANOMALY & IMPOSSIBLE TRAVEL TRANSITION
    // -------------------------------------------------------------------------
    let isLocationAnomaly = false;
    let isTimelineInconsistent = false;

    if (baseline.hasSufficientHistory) {
      const isKnownLocation = baseline.knownLocations.some(
        (l) =>
          l.city.toLowerCase() === currentEvent.location.city.toLowerCase() &&
          l.country.toLowerCase() === currentEvent.location.country.toLowerCase()
      );

      if (!isKnownLocation) {
        isLocationAnomaly = true;
        cumulativeRisk += 20;

        // Check timeline velocity against previous successful login
        const prevSuccess = userEvents.find(
          (e) => e.success && e.id !== currentEvent.id
        );

        if (prevSuccess && prevSuccess.location) {
          const timeDiffMinutes =
            (new Date(currentEvent.timestamp).getTime() -
              new Date(prevSuccess.timestamp).getTime()) /
            (1000 * 60);

          const isDifferentCity =
            prevSuccess.location.city.toLowerCase() !==
            currentEvent.location.city.toLowerCase();

          // Approximate distance (e.g. Bhubaneswar to London ~7800 km)
          const distanceKm = this.calculateEstimatedDistance(
            prevSuccess.location,
            currentEvent.location
          );

          if (isDifferentCity && timeDiffMinutes > 0 && timeDiffMinutes < 120 && distanceKm > 1000) {
            isTimelineInconsistent = true;
            cumulativeRisk += 40;
            const impliedVelocityKmh = Math.round((distanceKm / (timeDiffMinutes / 60)));

            alerts.push({
              id: `alt-travel-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
              title: "Impossible-Travel-Like Location Anomaly",
              category: "LOCATION_ANOMALY",
              severity: "CRITICAL",
              riskScore: 88,
              status: "ACTIVE",
              explanation: `Location transition is inconsistent with the observed timeline. Sign-in observed from ${currentEvent.location.city}, ${currentEvent.location.country} only ${Math.round(timeDiffMinutes)} minutes after an event in ${prevSuccess.location.city}, ${prevSuccess.location.country} (implied speed ~${impliedVelocityKmh} km/h).`,
              evidence: [
                `Current: ${currentEvent.location.city}, ${currentEvent.location.country} (${currentEvent.timestamp})`,
                `Preceding: ${prevSuccess.location.city}, ${prevSuccess.location.country} (${prevSuccess.timestamp})`,
                `Calculated transit distance: ~${distanceKm} km in ${Math.round(timeDiffMinutes)} mins`,
                `Implied velocity: ~${impliedVelocityKmh} km/h`,
              ],
              relatedEventIds: [currentEvent.id, prevSuccess.id],
              targetUserId: currentEvent.userId,
              targetUserEmail: currentEvent.userEmail,
              recommendedActions: [
                "Immediately revoke active sessions for this account.",
                "Force credential reset and re-authentication with hardware MFA.",
                "Verify whether legitimate user connected through a corporate VPN or proxy.",
              ],
              timestamp: currentEvent.timestamp,
              isDemo: currentEvent.isDemo,
            });
          } else {
            alerts.push({
              id: `alt-loc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
              title: "Login From New Geographic Location",
              category: "LOCATION_ANOMALY",
              severity: "MEDIUM",
              riskScore: 40,
              status: "ACTIVE",
              explanation: `Access originated from ${currentEvent.location.city}, ${currentEvent.location.country}, a location previously unrecorded in user baseline profile.`,
              evidence: [
                `Observed Location: ${currentEvent.location.city}, ${currentEvent.location.country}`,
                `Baseline Locations: ${baseline.knownLocations.map((l) => l.city).join(", ")}`,
              ],
              relatedEventIds: [currentEvent.id],
              targetUserId: currentEvent.userId,
              targetUserEmail: currentEvent.userEmail,
              recommendedActions: [
                "Verify if user is currently traveling or using a secure VPN endpoint.",
              ],
              timestamp: currentEvent.timestamp,
              isDemo: currentEvent.isDemo,
            });
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5. BEHAVIORAL ANOMALY (Time of day & access pattern)
    // -------------------------------------------------------------------------
    if (baseline.hasSufficientHistory) {
      const eventHour = new Date(currentEvent.timestamp).getHours();
      const isUnusualHour =
        baseline.typicalHours.length > 0 &&
        !baseline.typicalHours.includes(eventHour);

      if (isUnusualHour && (isNewDevice || isLocationAnomaly)) {
        cumulativeRisk += 15;
        alerts.push({
          id: `alt-hour-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
          title: "Atypical Access Time Outside Normal Profile",
          category: "BEHAVIOR_ANOMALY",
          severity: "MEDIUM",
          riskScore: 38,
          status: "ACTIVE",
          explanation: `Authentication occurred at ${eventHour}:00, outside user's standard activity window (${baseline.typicalHours[0]}:00 - ${baseline.typicalHours[baseline.typicalHours.length - 1]}:00).`,
          evidence: [
            `Event Time: ${eventHour}:00 local time`,
            `Typical Operating Window: ${baseline.typicalHours.join(", ")} hours`,
          ],
          relatedEventIds: [currentEvent.id],
          targetUserId: currentEvent.userId,
          targetUserEmail: currentEvent.userEmail,
          recommendedActions: [
            "Log event in behavioral audit log and monitor session traversal.",
          ],
          timestamp: currentEvent.timestamp,
          isDemo: currentEvent.isDemo,
        });
      }
    }

    // -------------------------------------------------------------------------
    // 6. ACCOUNT TAKEOVER (ATO) MULTI-SIGNAL CORRELATION ENGINE
    // -------------------------------------------------------------------------
    // Strong correlation rule:
    // (New Device OR New Location) + (Multiple Failures followed by Success) OR (Timeline Inconsistent)
    const isAtoComposite =
      (hasRecentSuccessAfterFailures && (isNewDevice || isLocationAnomaly)) ||
      (currentEvent.success && isTimelineInconsistent) ||
      (currentEvent.eventType === "SUSPICIOUS_SESSION" && (isNewDevice || isLocationAnomaly));

    if (isAtoComposite) {
      takeoverSuspected = true;
      cumulativeRisk = Math.max(88, cumulativeRisk + 30);

      const compositeSignals: string[] = [];
      if (consecutiveFailures > 0)
        compositeSignals.push(`${consecutiveFailures} authentication failures immediately prior to success`);
      if (isNewDevice) compositeSignals.push("Login executed from an unrecognized hardware device");
      if (isLocationAnomaly) compositeSignals.push(`Unusual geographic access (${currentEvent.location.city}, ${currentEvent.location.country})`);
      if (isTimelineInconsistent) compositeSignals.push("Impossible travel velocity anomaly between successive logins");
      if (currentEvent.eventType === "SUSPICIOUS_SESSION") compositeSignals.push("Suspicious session creation or token anomaly flagged");

      alerts.unshift({
        id: `alt-ato-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        title: "POSSIBLE ACCOUNT TAKEOVER IN PROGRESS",
        category: "ACCOUNT_TAKEOVER",
        severity: "CRITICAL",
        riskScore: 94,
        status: "ACTIVE",
        explanation: `Multiple correlated anomalies indicate a potential unauthorized account compromise. A successful session was established under abnormal conditions following failed attempts or geographic inconsistencies.`,
        evidence: compositeSignals,
        relatedEventIds: userEvents.slice(0, 5).map((e) => e.id),
        targetUserId: currentEvent.userId,
        targetUserEmail: currentEvent.userEmail,
        recommendedActions: [
          "IMMEDIATE ACTION: Revoke all active sessions for this account.",
          "Force mandatory password reset across all linked enterprise services.",
          "Enforce hardware/app-based MFA verification for subsequent access.",
          "Review recent administrative transactions and data export logs.",
        ],
        timestamp: currentEvent.timestamp,
        isDemo: currentEvent.isDemo,
      });
    }

    // -------------------------------------------------------------------------
    // RESOLVE OVERALL RISK & POSTURE STATUS
    // -------------------------------------------------------------------------
    const overallRiskScore = Math.min(100, Math.max(5, cumulativeRisk));

    let overallRiskLevel: MonitorRiskLevel = "SAFE";
    let postureStatus: AccountSecurityStatus = "SECURE";

    if (takeoverSuspected || overallRiskScore >= 85) {
      overallRiskLevel = "CRITICAL";
      postureStatus = "COMPROMISED / POSSIBLE TAKEOVER";
    } else if (overallRiskScore >= 70) {
      overallRiskLevel = "HIGH";
      postureStatus = "HIGH RISK";
    } else if (overallRiskScore >= 40) {
      overallRiskLevel = "MEDIUM";
      postureStatus = "AT RISK";
    } else if (overallRiskScore >= 20) {
      overallRiskLevel = "LOW";
      postureStatus = "MONITORED";
    } else {
      overallRiskLevel = "SAFE";
      postureStatus = "SECURE";
    }

    const { explanation, recommendedResponse } = this.generateSummaryAndActions(
      postureStatus,
      alerts,
      currentEvent
    );

    return {
      alerts,
      overallRiskScore,
      overallRiskLevel,
      postureStatus,
      takeoverSuspected,
      explanation,
      recommendedResponse,
    };
  }

  private countTrailingFailures(events: AuthenticationEvent[]): number {
    let count = 0;
    // Iterate from newest to oldest
    for (const ev of events) {
      if (!ev.success) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private calculateEstimatedDistance(loc1: any, loc2: any): number {
    // If coordinates exist, use Haversine; otherwise estimate by city/country
    if (loc1.latitude && loc1.longitude && loc2.latitude && loc2.longitude) {
      const R = 6371; // Earth radius km
      const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
      const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc1.latitude * Math.PI) / 180) *
          Math.cos((loc2.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    }

    // Default heuristic distances for demo cities
    const pair = `${loc1.city}-${loc2.city}`.toLowerCase();
    if (pair.includes("bhubaneswar") && pair.includes("london")) return 7800;
    if (pair.includes("delhi") && pair.includes("new york")) return 11700;
    if (pair.includes("bhubaneswar") && pair.includes("delhi")) return 1280;
    if (pair.includes("mumbai") && pair.includes("moscow")) return 5000;
    return loc1.country !== loc2.country ? 4500 : 800;
  }

  private generateSummaryAndActions(
    status: AccountSecurityStatus,
    alerts: MonitorAlert[],
    event: AuthenticationEvent
  ): { explanation: string; recommendedResponse: string[] } {
    if (status === "COMPROMISED / POSSIBLE TAKEOVER") {
      return {
        explanation: `CRITICAL ALERT: Correlated multi-vector anomaly signals indicate a probable account takeover in progress. Rapid geographic dislocation, multiple pre-login failures, or session hijacking patterns observed for "${event.userEmail}".`,
        recommendedResponse: [
          "Revoke all active sessions immediately.",
          "Force password reset and invalidate current session tokens.",
          "Require step-up hardware or authenticator app MFA.",
          "Escalate to Security Operations Center (SOC) for forensic review.",
        ],
      };
    }

    if (status === "HIGH RISK") {
      return {
        explanation: `ELEVATED RISK: Multiple anomalous security signals flagged. High authentication failure volume or suspicious source detected.`,
        recommendedResponse: [
          "Require MFA verification for subsequent access.",
          "Review active sessions on unrecognized devices.",
          "Notify account owner of suspicious login attempts.",
        ],
      };
    }

    if (status === "AT RISK") {
      return {
        explanation: `MODERATE ANOMALIES: Unrecognized device or initial geographic drift observed. Monitoring elevated.`,
        recommendedResponse: [
          "Verify recent login activity with account owner.",
          "Confirm trusted status for new hardware.",
        ],
      };
    }

    return {
      explanation: `NORMAL SECURITY POSTURE: Access patterns align with established behavioral baseline. No high-risk anomalies detected.`,
      recommendedResponse: [
        "Continue routine security surveillance.",
        "Maintain current authentication hygiene and MFA protections.",
      ],
    };
  }
}

export const monitorDetectionEngine = new MonitorDetectionEngine();
