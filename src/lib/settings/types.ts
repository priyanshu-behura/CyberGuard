/**
 * CYBERGUARD Settings Center - Data Types & Configuration Contracts
 */

export type PlatformTheme = "cyber-dark" | "high-contrast" | "oled-black";
export type InterfaceDensity = "comfortable" | "compact";
export type AIVerbosity = "concise" | "technical" | "executive";
export type PhishingSensitivity = "standard" | "aggressive" | "strict";
export type ScannerDepth = "standard" | "deep";
export type SessionTimeoutMinutes = 15 | 30 | 60 | 240;

export interface UserProfileSettings {
  displayName: string;
  department: string;
  jobTitle: string;
  securityClearance: "Level 1 (Analyst)" | "Level 2 (Lead SOC)" | "Level 3 (SecOps Admin)";
}

export interface SecurityAuthSettings {
  enforceMfaPrompt: boolean;
  sessionTimeoutMinutes: SessionTimeoutMinutes;
  requireHighImpactConfirmation: boolean;
  rememberDeviceTokens: boolean;
}

export interface DetectionPreferencesSettings {
  highRiskThreshold: number; // default 70
  criticalRiskThreshold: number; // default 85
  phishingSensitivity: PhishingSensitivity;
  scannerDepth: ScannerDepth;
  autoEscalateCriticalAlerts: boolean;
  enableBehavioralDriftCheck: boolean;
  deepfakeStrictHeuristics: boolean;
}

export interface NotificationSettings {
  inAppToasts: boolean;
  criticalIncidentBanners: boolean;
  responseApprovalAlerts: boolean;
  browserNotifications: boolean;
  externalEmailAlerts: boolean; // Not configured notice
  slackWebhookUrl: string;
}

export interface AIAssistantSettings {
  enabled: boolean;
  preferredModel: "auto" | "gemini" | "openai" | "heuristic";
  responseVerbosity: AIVerbosity;
  autoRetrieveTelemetry: boolean;
  privacyMaskSensitiveData: boolean;
}

export interface AppearanceSettings {
  theme: PlatformTheme;
  density: InterfaceDensity;
  reducedMotion: boolean;
  soundEffects: boolean;
}

export interface PlatformSettings {
  profile: UserProfileSettings;
  security: SecurityAuthSettings;
  detection: DetectionPreferencesSettings;
  notifications: NotificationSettings;
  ai: AIAssistantSettings;
  appearance: AppearanceSettings;
  lastUpdated: string;
}
