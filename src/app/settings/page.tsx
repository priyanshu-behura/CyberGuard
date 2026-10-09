"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { settingsStore } from "@/lib/settings/settings-store";
import { PlatformSettings } from "@/lib/settings/types";
import { SettingsNav, SettingsTabId } from "@/components/settings/SettingsNav";
import { ProfileSettingsTab } from "@/components/settings/ProfileSettingsTab";
import { SecuritySettingsTab } from "@/components/settings/SecuritySettingsTab";
import { DetectionSettingsTab } from "@/components/settings/DetectionSettingsTab";
import { NotificationSettingsTab } from "@/components/settings/NotificationSettingsTab";
import { AIAssistantSettingsTab } from "@/components/settings/AIAssistantSettingsTab";
import { DataPrivacySettingsTab } from "@/components/settings/DataPrivacySettingsTab";
import { AppearanceSettingsTab } from "@/components/settings/AppearanceSettingsTab";

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings(settingsStore.getSettings());
    const unsubscribe = settingsStore.subscribe((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateSection = (section: keyof Omit<PlatformSettings, "lastUpdated">, data: any) => {
    const updated = settingsStore.updateSection(section, data);
    setSettings(updated);
    showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved.`);
  };

  const handleResetAll = () => {
    const defaults = settingsStore.resetToDefaults();
    setSettings(defaults);
    showToast("Platform settings restored to factory defaults.");
  };

  if (!settings) {
    return (
      <AppShell>
        <div className="py-24 text-center font-mono text-xs text-slate-500">
          Loading platform configuration...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-cyan-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Ribbon */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONFIGURATION CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform & Security Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Manage operator identity, session lifetimes, detection thresholds, external SIEM
              webhooks, and AI Copilot engine integration.
            </p>
          </div>
        </div>

        {/* Main Settings 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Navigation Column */}
          <div className="md:col-span-1">
            <div className="sticky top-20 rounded-2xl glass-panel p-2 border border-white/[0.08]">
              <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          {/* Right Content Tab Column */}
          <div className="md:col-span-3 min-w-0">
            {activeTab === "profile" && (
              <ProfileSettingsTab
                profile={settings.profile}
                onSave={(data) => handleUpdateSection("profile", data)}
              />
            )}

            {activeTab === "security" && (
              <SecuritySettingsTab
                security={settings.security}
                onSave={(data) => handleUpdateSection("security", data)}
              />
            )}

            {activeTab === "detection" && (
              <DetectionSettingsTab
                detection={settings.detection}
                onSave={(data) => handleUpdateSection("detection", data)}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationSettingsTab
                notifications={settings.notifications}
                onSave={(data) => handleUpdateSection("notifications", data)}
              />
            )}

            {activeTab === "ai" && (
              <AIAssistantSettingsTab
                ai={settings.ai}
                onSave={(data) => handleUpdateSection("ai", data)}
              />
            )}

            {activeTab === "data" && <DataPrivacySettingsTab />}

            {activeTab === "appearance" && (
              <AppearanceSettingsTab
                appearance={settings.appearance}
                onSave={(data) => handleUpdateSection("appearance", data)}
                onResetAll={handleResetAll}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
