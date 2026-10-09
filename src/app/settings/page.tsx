"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import {
  CheckCircle2,
  Edit2,
  User,
  Shield,
  Bell,
  Sliders,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { settingsStore } from "@/lib/settings/settings-store";
import { PlatformSettings } from "@/lib/settings/types";
import { useAuth } from "@/lib/auth/auth-context";
import { SecuritySettingsTab } from "@/components/settings/SecuritySettingsTab";
import { NotificationSettingsTab } from "@/components/settings/NotificationSettingsTab";
import { DetectionSettingsTab } from "@/components/settings/DetectionSettingsTab";
import { AIAssistantSettingsTab } from "@/components/settings/AIAssistantSettingsTab";

type SettingsTab = "profile" | "security" | "notifications" | "integrations" | "detection" | "ai";

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const displayName = user?.name || settings?.profile?.displayName || "Priyanshu Behura";
  const displayEmail = user?.email || "priyanshu@example.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    const s = settingsStore.getSettings();
    setSettings(s);
    setNameInput(displayName);
    setEmailInput(displayEmail);
    const unsubscribe = settingsStore.subscribe((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = () => {
    if (settings) {
      settingsStore.updateSection("profile", {
        displayName: nameInput,
      });
      setIsEditingProfile(false);
      showToast("Profile details updated successfully.");
    }
  };

  const handleUpdateSection = (section: keyof Omit<PlatformSettings, "lastUpdated">, data: any) => {
    const updated = settingsStore.updateSection(section, data);
    setSettings(updated);
    showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved.`);
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
      <div className="space-y-6 pb-16 select-none max-w-5xl mx-auto">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-mono flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-[#0B132B] text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header matching Image 2 */}
        <div className="pb-2 border-b border-slate-200/80">
          <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your account, security and system preferences.
          </p>
        </div>

        {/* Horizontal Navigation Tabs matching Image 2 */}
        <div className="flex flex-wrap items-center gap-6 border-b border-slate-200/80 pb-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "profile"
                ? "border-[#6366F1] text-[#0B132B] font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "security"
                ? "border-[#6366F1] text-[#0B132B] font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Security
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "notifications"
                ? "border-[#6366F1] text-[#0B132B] font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Notifications
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("integrations")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "integrations"
                ? "border-[#6366F1] text-[#0B132B] font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Integrations
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("detection")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "detection"
                ? "border-[#6366F1] text-[#0B132B] font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Detection Logic
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === "ai"
                ? "border-[#6366F1] text-[#0B132B] font-bold"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            AI Assistant
          </button>
        </div>

        {/* Tab 1: Profile matching Image 2 */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            
            {/* Profile Information Card matching Image 2 */}
            <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-[#0B132B]">
                  Profile Information
                </h2>
                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B132B] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-3.5 py-1 rounded-xl bg-[#6366F1] text-white text-xs font-semibold shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="flex items-center gap-4 py-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
                    {initials || "P"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0B132B]">
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2 max-w-md">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B132B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B132B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Account Details Card matching Image 2 */}
            <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <h2 className="text-sm font-bold text-[#0B132B] pb-3 border-b border-slate-100">
                Account Details
              </h2>

              <div className="space-y-3 text-xs max-w-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-[#0B132B]">
                    {user?.role || "Administrator"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Login</span>
                  <span className="font-mono text-slate-700">
                    Oct 26, 2025 14:12
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Member Since</span>
                  <span className="font-mono text-slate-700">
                    Aug 12, 2025
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences Card matching Image 2 */}
            <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <h2 className="text-sm font-bold text-[#0B132B] pb-3 border-b border-slate-100">
                Preferences
              </h2>

              <div className="space-y-4 max-w-lg">
                {/* Theme Toggle matching Image 2 */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#0B132B] block">
                      Theme
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Bright workspace
                    </span>
                  </div>

                  <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme("light");
                        showToast("Light editorial theme active.");
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedTheme === "light"
                          ? "bg-white text-[#0B132B] shadow-sm font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme("dark");
                        showToast("Dark mode preference recorded.");
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedTheme === "dark"
                          ? "bg-white text-[#0B132B] shadow-sm font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Language Dropdown matching Image 2 */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-[#0B132B] block">
                      Language
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Glossary categories
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      defaultValue="en"
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0B132B] font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === "security" && (
          <SecuritySettingsTab
            security={settings.security}
            onSave={(data) => handleUpdateSection("security", data)}
          />
        )}

        {/* Tab 3: Notifications */}
        {activeTab === "notifications" && (
          <NotificationSettingsTab
            notifications={settings.notifications}
            onSave={(data) => handleUpdateSection("notifications", data)}
          />
        )}

        {/* Tab 4: Integrations */}
        {activeTab === "integrations" && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#0B132B]">
                Connected Security Integrations
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Active webhooks, Google Gemini AI endpoints, and corporate SIEM feeds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0B132B]">Google Gemini API</h3>
                  <p className="text-[11px] text-slate-500">Connected server-side</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  ACTIVE
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0B132B]">Local Security Ingestion</h3>
                  <p className="text-[11px] text-slate-500">Autonomous rule engine</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Detection Logic */}
        {activeTab === "detection" && (
          <DetectionSettingsTab
            detection={settings.detection}
            onSave={(data) => handleUpdateSection("detection", data)}
          />
        )}

        {/* Tab 6: AI Assistant */}
        {activeTab === "ai" && (
          <AIAssistantSettingsTab
            ai={settings.ai}
            onSave={(data) => handleUpdateSection("ai", data)}
          />
        )}

      </div>
    </AppShell>
  );
}
