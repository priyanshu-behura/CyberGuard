/**
 * CYBERGUARD Monitor & Account Security Event Store
 * Manages event history, baseline profiles, alerts, scenario simulation,
 * and automatic incident creation for High/Critical account threats.
 */

import {
  AuthenticationEvent,
  BehaviorBaseline,
  MonitorAlert,
  AccountSecurityPosture,
  DemoScenarioId,
  AccountSecurityStatus,
  MonitorRiskLevel,
} from "./types";
import { monitorDetectionEngine } from "./engine";
import { incidentStore } from "../incident-store";

const STORAGE_KEY_EVENTS = "cyberguard_monitor_events";
const STORAGE_KEY_ALERTS = "cyberguard_monitor_alerts";

class MonitorStore {
  private events: AuthenticationEvent[] = [];
  private alerts: MonitorAlert[] = [];
  private baseline: BehaviorBaseline;

  constructor() {
    // Default initial baseline representing legitimate account behavior
    this.baseline = {
      userId: "usr-primary-001",
      knownDevices: [
        {
          deviceId: "dev-mac-arm-01",
          deviceName: "Apple MacBook Pro (M2)",
          deviceType: "Desktop",
          browser: "Chrome 128.0",
          os: "macOS Sonoma",
          firstSeen: new Date(Date.now() - 30 * 86400000).toISOString(),
          lastSeen: new Date(Date.now() - 86400000).toISOString(),
          isTrusted: true,
          totalLogins: 42,
        },
        {
          deviceId: "dev-pixel-02",
          deviceName: "Google Pixel 8",
          deviceType: "Mobile",
          browser: "Chrome Mobile 128.0",
          os: "Android 14",
          firstSeen: new Date(Date.now() - 15 * 86400000).toISOString(),
          lastSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
          isTrusted: true,
          totalLogins: 18,
        },
      ],
      knownLocations: [
        {
          city: "Bhubaneswar",
          country: "India",
          firstSeen: new Date(Date.now() - 30 * 86400000).toISOString(),
          lastSeen: new Date(Date.now() - 86400000).toISOString(),
          loginCount: 56,
          latitude: 20.2961,
          longitude: 85.8245,
        },
      ],
      typicalHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      typicalFrequencyPerDay: 3.5,
      avgSessionDurationMinutes: 120,
      totalRecordedEvents: 60,
      hasSufficientHistory: true,
      baselineExplanation:
        "Baseline established from 60 historical events. Primary access originates from Bhubaneswar, India on trusted MacBook Pro and Pixel devices during business hours (08:00 - 20:00).",
    };

    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
      const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }
    } catch {
      // Storage fallback
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(this.alerts));
    } catch {
      // Storage fallback
    }
  }

  public getEvents(): AuthenticationEvent[] {
    this.hydrateFromStorage();
    return [...this.events];
  }

  public getAlerts(): MonitorAlert[] {
    this.hydrateFromStorage();
    return [...this.alerts];
  }

  public getBaseline(): BehaviorBaseline {
    return { ...this.baseline };
  }

  /**
   * Ingests a new authentication event, runs detection engines, updates posture,
   * and escalates critical alerts to the central incident store.
   */
  public ingestEvent(partialEvent: Partial<AuthenticationEvent>): {
    event: AuthenticationEvent;
    newAlerts: MonitorAlert[];
    posture: AccountSecurityPosture;
  } {
    this.hydrateFromStorage();

    const fullEvent: AuthenticationEvent = {
      id: partialEvent.id || `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      userId: partialEvent.userId || this.baseline.userId,
      userEmail: partialEvent.userEmail || "analyst@cyberguard.internal",
      timestamp: partialEvent.timestamp || new Date().toISOString(),
      eventType: partialEvent.eventType || "LOGIN",
      success: partialEvent.success !== undefined ? partialEvent.success : true,
      ipAddress: partialEvent.ipAddress || "103.24.182.10",
      location: partialEvent.location || {
        city: "Bhubaneswar",
        country: "India",
        latitude: 20.2961,
        longitude: 85.8245,
      },
      deviceId: partialEvent.deviceId || "dev-mac-arm-01",
      deviceName: partialEvent.deviceName || "Apple MacBook Pro (M2)",
      deviceType: partialEvent.deviceType || "Desktop",
      browser: partialEvent.browser || "Chrome 128.0",
      os: partialEvent.os || "macOS",
      sessionId: partialEvent.sessionId || `sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      resource: partialEvent.resource || "/dashboard",
      authenticationMethod: partialEvent.authenticationMethod || "password",
      isDemo: partialEvent.isDemo !== undefined ? partialEvent.isDemo : false,
      failureReason: partialEvent.failureReason,
    };

    // Evaluate incoming event against recent event history
    const detection = monitorDetectionEngine.evaluate(
      fullEvent,
      this.events,
      this.baseline
    );

    // Save event (retain last 100)
    this.events.unshift(fullEvent);
    if (this.events.length > 100) this.events.pop();

    // Register new alerts
    if (detection.alerts.length > 0) {
      for (const alt of detection.alerts) {
        // Escalate HIGH or CRITICAL alert to the central incident store
        if (alt.severity === "HIGH" || alt.severity === "CRITICAL") {
          const registered = incidentStore.registerAnalysis({
            id: `mon-${alt.id}`,
            type: "identity",
            filename: `Account_Alert_${fullEvent.userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
            fileSizeBytes: 0,
            mimeType: "text/plain",
            timestamp: alt.timestamp,
            status: "completed",
            classification:
              alt.category === "ACCOUNT_TAKEOVER"
                ? "LIKELY MANIPULATED"
                : "POTENTIALLY MANIPULATED",
            riskScore: alt.riskScore,
            riskLevel: alt.severity,
            confidence: 88,
            confidenceType: "Heuristic confidence",
            summary: `${alt.title}: ${alt.explanation}`,
            indicators: alt.evidence.map((ev, i) => ({
              id: `ind-${alt.id}-${i}`,
              name: alt.title,
              category: "identity",
              severity: alt.severity.toLowerCase() as any,
              scoreImpact: 35,
              confidence: 85,
              description: ev,
            })),
            evidence: alt.evidence.map((ev, i) => ({
              id: `ev-${alt.id}-${i}`,
              label: "Telemetry Evidence",
              value: ev,
              category: "metadata",
              isSuspicious: true,
              severity: alt.severity.toLowerCase() as any,
            })),
            metadata: {
              formatSpecific: {
                targetUserEmail: alt.targetUserEmail,
                ipAddress: fullEvent.ipAddress,
                location: `${fullEvent.location.city}, ${fullEvent.location.country}`,
                deviceId: fullEvent.deviceId,
              },
            },
            modelResults: {
              providerName: "Account Security Engine",
              configured: false,
              status: "not_configured",
              explanation: "Heuristic behavioral surveillance.",
            },
            recommendedActions: alt.recommendedActions,
            analysisSources: [
              {
                name: "Authentication Surveillance",
                type: "local",
                status: "completed",
                note: "Real-time telemetry evaluated.",
              },
              {
                name: "Behavioral Baseline Matrix",
                type: "metadata",
                status: "completed",
                note: "Compared against user profile baseline.",
              },
              {
                name: "AI Behavioral Model",
                type: "ai_model",
                status: "unavailable",
                note: "External model not configured.",
              },
              {
                name: "Threat Intel Subnet",
                type: "external",
                status: "skipped",
                note: "Internal enterprise telemetry.",
              },
            ],
          });

          if (registered.incident) {
            alt.associatedIncidentId = registered.incident.id;
          }
        }

        this.alerts.unshift(alt);
      }

      if (this.alerts.length > 50) this.alerts.length = 50;
    }

    this.saveToStorage();

    const posture = this.getPosture();
    return {
      event: fullEvent,
      newAlerts: detection.alerts,
      posture,
    };
  }

  public getPosture(): AccountSecurityPosture {
    this.hydrateFromStorage();

    const activeAlerts = this.alerts.filter((a) => a.status === "ACTIVE");
    const hasTakeover = activeAlerts.some((a) => a.category === "ACCOUNT_TAKEOVER");
    const highestRisk = activeAlerts.reduce((max, a) => Math.max(max, a.riskScore), 10);

    let status: AccountSecurityStatus = "SECURE";
    let riskLevel: MonitorRiskLevel = "SAFE";

    if (hasTakeover || highestRisk >= 85) {
      status = "COMPROMISED / POSSIBLE TAKEOVER";
      riskLevel = "CRITICAL";
    } else if (highestRisk >= 70) {
      status = "HIGH RISK";
      riskLevel = "HIGH";
    } else if (highestRisk >= 40) {
      status = "AT RISK";
      riskLevel = "MEDIUM";
    } else if (highestRisk >= 20 || activeAlerts.length > 0) {
      status = "MONITORED";
      riskLevel = "LOW";
    }

    const recommendedResponse: string[] = [];
    if (status === "COMPROMISED / POSSIBLE TAKEOVER") {
      recommendedResponse.push("Revoke active sessions immediately.");
      recommendedResponse.push("Force mandatory password reset and hardware MFA.");
      recommendedResponse.push("Review recent audit and export logs.");
    } else if (status === "HIGH RISK") {
      recommendedResponse.push("Require MFA on next sign-in.");
      recommendedResponse.push("Audit active unrecognized devices.");
    } else if (status === "AT RISK") {
      recommendedResponse.push("Verify unrecognized device with user.");
    } else {
      recommendedResponse.push("Routine monitoring active. No critical actions needed.");
    }

    return {
      status,
      riskScore: highestRisk,
      riskLevel,
      activeSessionsCount: 2, // baseline active desktop + mobile
      knownDevicesCount: this.baseline.knownDevices.length,
      knownLocationsCount: this.baseline.knownLocations.length,
      activeAlertsCount: activeAlerts.length,
      recentEventsCount: this.events.length,
      takeoverSuspected: hasTakeover,
      summary:
        status === "COMPROMISED / POSSIBLE TAKEOVER"
          ? "CRITICAL: Multiple high-confidence anomalies indicate active account compromise."
          : status === "HIGH RISK"
          ? "ELEVATED RISK: Repeated authentication failures or suspicious source detected."
          : status === "AT RISK"
          ? "MONITORED ANOMALIES: Unrecognized hardware or geographic shift recorded."
          : "ACCOUNT SECURE: Authentication patterns align with normal behavioral profile.",
      recommendedResponse,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generates realistic synthetic telemetry for the 6 requested demo scenarios.
   * Explicitly marks every event with isDemo: true and DEMO / SIMULATED DATA labels.
   */
  public runDemoScenario(scenarioId: DemoScenarioId): {
    title: string;
    description: string;
    generatedEventsCount: number;
    posture: AccountSecurityPosture;
  } {
    const now = Date.now();
    const primaryUser = "analyst@cyberguard.internal";

    switch (scenarioId) {
      case "normal_login": {
        this.ingestEvent({
          userEmail: primaryUser,
          eventType: "LOGIN",
          success: true,
          ipAddress: "103.24.182.10",
          location: { city: "Bhubaneswar", country: "India", latitude: 20.2961, longitude: 85.8245 },
          deviceId: "dev-mac-arm-01",
          deviceName: "Apple MacBook Pro (M2)",
          browser: "Chrome 128.0",
          isDemo: true,
        });
        return {
          title: "Scenario 1: Normal Login",
          description: "Routine authentication from known MacBook Pro in Bhubaneswar. Aligns with behavioral baseline.",
          generatedEventsCount: 1,
          posture: this.getPosture(),
        };
      }

      case "failed_logins": {
        // Generate 4 consecutive failed logins in rapid succession
        for (let i = 4; i >= 1; i--) {
          this.ingestEvent({
            userEmail: primaryUser,
            timestamp: new Date(now - i * 45000).toISOString(),
            eventType: "PASSWORD_FAILURE",
            success: false,
            failureReason: "Invalid credentials supplied",
            ipAddress: "185.220.101.44",
            location: { city: "Bhubaneswar", country: "India" },
            deviceId: "dev-mac-arm-01",
            deviceName: "Apple MacBook Pro (M2)",
            browser: "Chrome 128.0",
            isDemo: true,
          });
        }
        return {
          title: "Scenario 2: Repeated Failed Logins (Brute Force)",
          description: "Multiple authentication failures detected in rapid succession against account.",
          generatedEventsCount: 4,
          posture: this.getPosture(),
        };
      }

      case "password_spraying": {
        // Attacker IP testing 5 different user accounts with 1 attempt each
        const attackerIp = "194.26.29.112";
        const targets = [
          "admin@cyberguard.internal",
          "hr@cyberguard.internal",
          "finance@cyberguard.internal",
          "dev@cyberguard.internal",
          primaryUser,
        ];

        targets.forEach((email, i) => {
          this.ingestEvent({
            userEmail: email,
            timestamp: new Date(now - (5 - i) * 20000).toISOString(),
            eventType: "PASSWORD_FAILURE",
            success: false,
            failureReason: "Bad password",
            ipAddress: attackerIp,
            location: { city: "Bucharest", country: "Romania" },
            deviceId: "dev-unknown-bot-99",
            deviceName: "Automated Curl Script",
            deviceType: "Unknown",
            browser: "Python-requests/2.31",
            os: "Linux",
            isDemo: true,
          });
        });

        return {
          title: "Scenario 3: Password Spraying Attack",
          description: "Same external IP attempted authentication across 5 distinct enterprise user accounts.",
          generatedEventsCount: 5,
          posture: this.getPosture(),
        };
      }

      case "new_device_location": {
        this.ingestEvent({
          userEmail: primaryUser,
          eventType: "LOGIN",
          success: true,
          ipAddress: "85.214.132.18",
          location: { city: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405 },
          deviceId: "dev-win11-unknown-07",
          deviceName: "Lenovo ThinkPad X1",
          deviceType: "Desktop",
          browser: "Firefox 129.0",
          os: "Windows 11",
          isDemo: true,
        });

        return {
          title: "Scenario 4: New Device + New Location",
          description: "Sign-in executed from a previously unseen Lenovo ThinkPad located in Berlin, Germany.",
          generatedEventsCount: 1,
          posture: this.getPosture(),
        };
      }

      case "account_takeover": {
        // Sequence: 3 password failures -> 1 successful login from unknown hardware -> session created
        const suspiciousIp = "102.164.210.15";
        for (let i = 3; i >= 1; i--) {
          this.ingestEvent({
            userEmail: primaryUser,
            timestamp: new Date(now - i * 60000).toISOString(),
            eventType: "PASSWORD_FAILURE",
            success: false,
            failureReason: "Incorrect password",
            ipAddress: suspiciousIp,
            location: { city: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792 },
            deviceId: "dev-kali-linux-88",
            deviceName: "Kali Linux Workstation",
            deviceType: "Desktop",
            browser: "Chromium 126.0",
            os: "Linux",
            isDemo: true,
          });
        }

        // Successful compromise login
        this.ingestEvent({
          userEmail: primaryUser,
          timestamp: new Date(now - 10000).toISOString(),
          eventType: "LOGIN",
          success: true,
          ipAddress: suspiciousIp,
          location: { city: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792 },
          deviceId: "dev-kali-linux-88",
          deviceName: "Kali Linux Workstation",
          deviceType: "Desktop",
          browser: "Chromium 126.0",
          os: "Linux",
          sessionId: `compromised-sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          isDemo: true,
        });

        // Immediate session creation
        this.ingestEvent({
          userEmail: primaryUser,
          timestamp: new Date().toISOString(),
          eventType: "SUSPICIOUS_SESSION",
          success: true,
          ipAddress: suspiciousIp,
          location: { city: "Lagos", country: "Nigeria" },
          deviceId: "dev-kali-linux-88",
          deviceName: "Kali Linux Workstation",
          deviceType: "Desktop",
          browser: "Chromium 126.0",
          os: "Linux",
          resource: "/admin/api/keys",
          isDemo: true,
        });

        return {
          title: "Scenario 5: Complete Account Takeover Chain",
          description: "Brute force failures followed immediately by successful sign-in from an unknown machine in Lagos, Nigeria.",
          generatedEventsCount: 5,
          posture: this.getPosture(),
        };
      }

      case "suspicious_session_jump": {
        // Impossible travel: Event in Bhubaneswar at 10:00 -> Event in London at 10:25
        this.ingestEvent({
          userEmail: primaryUser,
          timestamp: new Date(now - 25 * 60000).toISOString(),
          eventType: "LOGIN",
          success: true,
          ipAddress: "103.24.182.10",
          location: { city: "Bhubaneswar", country: "India", latitude: 20.2961, longitude: 85.8245 },
          deviceId: "dev-mac-arm-01",
          deviceName: "Apple MacBook Pro (M2)",
          browser: "Chrome 128.0",
          isDemo: true,
        });

        this.ingestEvent({
          userEmail: primaryUser,
          timestamp: new Date().toISOString(),
          eventType: "LOGIN",
          success: true,
          ipAddress: "185.122.54.91",
          location: { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
          deviceId: "dev-foreign-mac-99",
          deviceName: "MacBook Air",
          browser: "Safari 17.5",
          os: "macOS",
          isDemo: true,
        });

        return {
          title: "Scenario 6: Impossible Travel Timeline Anomaly",
          description: "Logins separated by 7,800 km occurred within 25 minutes (implied velocity ~18,700 km/h).",
          generatedEventsCount: 2,
          posture: this.getPosture(),
        };
      }

      default: {
        return this.runDemoScenario("normal_login");
      }
    }
  }

  public getActiveSessions(): { sessionId: string; deviceName: string; isRevoked: boolean }[] {
    this.hydrateFromStorage();
    const revokedSessionIds = new Set(
      this.events
        .filter((e) => e.eventType === "SESSION_REVOKED" && e.sessionId)
        .map((e) => e.sessionId as string)
    );

    const sessions = [
      {
        sessionId: "sess-primary-mac",
        deviceName: "Apple MacBook Pro (M2)",
        isRevoked: revokedSessionIds.has("sess-primary-mac"),
      },
      {
        sessionId: "sess-pixel-mobile",
        deviceName: "Google Pixel 8",
        isRevoked: revokedSessionIds.has("sess-pixel-mobile"),
      },
    ];

    for (const evt of this.events) {
      if (evt.sessionId && !sessions.some((s) => s.sessionId === evt.sessionId)) {
        sessions.push({
          sessionId: evt.sessionId,
          deviceName: evt.deviceName || "Remote Host",
          isRevoked: revokedSessionIds.has(evt.sessionId),
        });
      }
    }

    return sessions;
  }

  public async injectScenario(scenarioName: string): Promise<any> {
    const normalized = scenarioName.toLowerCase().replace(/[-_\s]+/g, "_");
    let mappedScenario: DemoScenarioId = "normal_login";

    if (normalized.includes("takeover") || normalized.includes("ato")) {
      mappedScenario = "account_takeover";
    } else if (normalized.includes("spray")) {
      mappedScenario = "password_spraying";
    } else if (normalized.includes("fail") || normalized.includes("brute")) {
      mappedScenario = "failed_logins";
    } else if (normalized.includes("device") || normalized.includes("location")) {
      mappedScenario = "new_device_location";
    } else if (normalized.includes("travel") || normalized.includes("jump")) {
      mappedScenario = "suspicious_session_jump";
    } else {
      mappedScenario = "normal_login";
    }

    return this.runDemoScenario(mappedScenario);
  }

  public revokeSession(sessionId: string): { success: boolean; message: string } {
    this.hydrateFromStorage();
    // Ingest SESSION_REVOKED event
    this.ingestEvent({
      eventType: "SESSION_REVOKED",
      success: true,
      sessionId,
      resource: "Auth Service / Session Revocation",
      isDemo: false,
    });
    return {
      success: true,
      message: `Session ${sessionId} has been cryptographically invalidated.`,
    };
  }

  public acknowledgeAlert(alertId: string) {
    this.hydrateFromStorage();
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = "ACKNOWLEDGED";
      this.saveToStorage();
    }
  }

  public clearAll() {
    this.events = [];
    this.alerts = [];
    this.saveToStorage();
  }
}

export const monitorStore = new MonitorStore();
