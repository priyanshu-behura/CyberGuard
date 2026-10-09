/**
 * CYBERGUARD Monitor & Account Security Intelligence Types
 * Data models for authentication event telemetry, behavioral baselines,
 * anomaly detection, and account takeover (ATO) correlation.
 */

export type AuthenticationEventType =
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_FAILURE"
  | "PASSWORD_RESET"
  | "MFA_CHALLENGE"
  | "MFA_FAILURE"
  | "SESSION_CREATED"
  | "SESSION_REVOKED"
  | "SUSPICIOUS_SESSION"
  | "PRIVILEGED_ACTION";

export type DeviceType = "Desktop" | "Mobile" | "Tablet" | "Unknown";

export type AuthMethod = "password" | "oauth" | "mfa" | "session_token" | "sso";

export type AccountSecurityStatus =
  | "SECURE"
  | "MONITORED"
  | "AT RISK"
  | "HIGH RISK"
  | "COMPROMISED / POSSIBLE TAKEOVER";

export type MonitorRiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface GeoLocation {
  city: string;
  country: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthenticationEvent {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  eventType: AuthenticationEventType;
  success: boolean;
  ipAddress: string;
  location: GeoLocation;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  sessionId?: string;
  resource?: string;
  authenticationMethod: AuthMethod;
  failureReason?: string;
  isDemo?: boolean;
}

export interface DeviceProfile {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  firstSeen: string;
  lastSeen: string;
  isTrusted: boolean;
  totalLogins: number;
}

export interface LocationProfile {
  city: string;
  country: string;
  firstSeen: string;
  lastSeen: string;
  loginCount: number;
  latitude?: number;
  longitude?: number;
}

export interface BehaviorBaseline {
  userId: string;
  knownDevices: DeviceProfile[];
  knownLocations: LocationProfile[];
  typicalHours: number[]; // 0-23
  typicalFrequencyPerDay: number;
  avgSessionDurationMinutes: number;
  totalRecordedEvents: number;
  hasSufficientHistory: boolean;
  baselineExplanation: string;
}

export interface MonitorAlert {
  id: string;
  title: string;
  category:
    | "FAILED_LOGIN"
    | "PASSWORD_SPRAYING"
    | "UNKNOWN_DEVICE"
    | "LOCATION_ANOMALY"
    | "BEHAVIOR_ANOMALY"
    | "ACCOUNT_TAKEOVER"
    | "SUSPICIOUS_SESSION";
  severity: MonitorRiskLevel;
  riskScore: number;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  explanation: string;
  evidence: string[];
  relatedEventIds: string[];
  targetUserId: string;
  targetUserEmail: string;
  recommendedActions: string[];
  timestamp: string;
  isDemo?: boolean;
  associatedIncidentId?: string;
}

export interface AccountSecurityPosture {
  status: AccountSecurityStatus;
  riskScore: number;
  riskLevel: MonitorRiskLevel;
  activeSessionsCount: number;
  knownDevicesCount: number;
  knownLocationsCount: number;
  activeAlertsCount: number;
  recentEventsCount: number;
  takeoverSuspected: boolean;
  summary: string;
  recommendedResponse: string[];
  lastUpdated: string;
}

export type DemoScenarioId =
  | "normal_login"
  | "failed_logins"
  | "password_spraying"
  | "new_device_location"
  | "account_takeover"
  | "suspicious_session_jump";
