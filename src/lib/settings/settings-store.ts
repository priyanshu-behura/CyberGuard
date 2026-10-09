/**
 * CYBERGUARD Settings Persistence Service
 * Manages reactive configuration state, validation, default fallbacks,
 * and storage synchronization.
 */

import { PlatformSettings } from "./types";

const SETTINGS_STORAGE_KEY = "cyberguard_platform_settings";

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  profile: {
    displayName: "Security Analyst",
    department: "SOC Operations & Threat Intel",
    jobTitle: "Tier 2 Cyber Defense Analyst",
    securityClearance: "Level 2 (Lead SOC)",
  },
  security: {
    enforceMfaPrompt: true,
    sessionTimeoutMinutes: 60,
    requireHighImpactConfirmation: true,
    rememberDeviceTokens: true,
  },
  detection: {
    highRiskThreshold: 70,
    criticalRiskThreshold: 85,
    phishingSensitivity: "standard",
    scannerDepth: "deep",
    autoEscalateCriticalAlerts: true,
    enableBehavioralDriftCheck: true,
    deepfakeStrictHeuristics: true,
  },
  notifications: {
    inAppToasts: true,
    criticalIncidentBanners: true,
    responseApprovalAlerts: true,
    browserNotifications: false,
    externalEmailAlerts: false,
    slackWebhookUrl: "",
  },
  ai: {
    enabled: true,
    preferredModel: "auto",
    responseVerbosity: "technical",
    autoRetrieveTelemetry: true,
    privacyMaskSensitiveData: true,
  },
  appearance: {
    theme: "cyber-dark",
    density: "comfortable",
    reducedMotion: false,
    soundEffects: false,
  },
  lastUpdated: new Date().toISOString(),
};

class SettingsStore {
  private settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;
  private listeners: Set<(settings: PlatformSettings) => void> = new Set();

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = {
          ...DEFAULT_PLATFORM_SETTINGS,
          ...parsed,
          profile: { ...DEFAULT_PLATFORM_SETTINGS.profile, ...(parsed.profile || {}) },
          security: { ...DEFAULT_PLATFORM_SETTINGS.security, ...(parsed.security || {}) },
          detection: { ...DEFAULT_PLATFORM_SETTINGS.detection, ...(parsed.detection || {}) },
          notifications: { ...DEFAULT_PLATFORM_SETTINGS.notifications, ...(parsed.notifications || {}) },
          ai: { ...DEFAULT_PLATFORM_SETTINGS.ai, ...(parsed.ai || {}) },
          appearance: { ...DEFAULT_PLATFORM_SETTINGS.appearance, ...(parsed.appearance || {}) },
        };
      }
    } catch {
      this.settings = { ...DEFAULT_PLATFORM_SETTINGS };
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      this.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (e) {
      console.error("Failed to persist settings:", e);
    }
  }

  public getSettings(): PlatformSettings {
    this.hydrateFromStorage();
    return JSON.parse(JSON.stringify(this.settings));
  }

  public updateSection<K extends keyof Omit<PlatformSettings, "lastUpdated">>(
    section: K,
    data: Partial<PlatformSettings[K]>
  ): PlatformSettings {
    this.hydrateFromStorage();
    this.settings[section] = {
      ...this.settings[section],
      ...data,
    } as any;
    this.saveToStorage();
    return this.getSettings();
  }

  public updateAll(newSettings: Partial<PlatformSettings>): PlatformSettings {
    this.hydrateFromStorage();
    this.settings = {
      ...this.settings,
      ...newSettings,
      lastUpdated: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.getSettings();
  }

  public resetToDefaults(): PlatformSettings {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
    this.settings.lastUpdated = new Date().toISOString();
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    }
    this.notifyListeners();
    return this.getSettings();
  }

  public subscribe(listener: (settings: PlatformSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.getSettings());
    }
  }

  public getStorageMetrics(): {
    bytesUsed: number;
    keysCount: number;
    breakdown: { key: string; sizeBytes: number }[];
  } {
    if (typeof window === "undefined") {
      return { bytesUsed: 0, keysCount: 0, breakdown: [] };
    }

    let bytesUsed = 0;
    const breakdown: { key: string; sizeBytes: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("cyberguard_")) {
        const val = localStorage.getItem(key) || "";
        const sizeBytes = key.length + val.length;
        bytesUsed += sizeBytes;
        breakdown.push({ key, sizeBytes });
      }
    }

    return {
      bytesUsed,
      keysCount: breakdown.length,
      breakdown,
    };
  }
}

export const settingsStore = new SettingsStore();
