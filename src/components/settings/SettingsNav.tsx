"use client";

import React from "react";
import {
  User,
  Shield,
  Sliders,
  Bell,
  Bot,
  Database,
  Palette,
} from "lucide-react";

export type SettingsTabId =
  | "profile"
  | "security"
  | "detection"
  | "notifications"
  | "ai"
  | "data"
  | "appearance";

interface SettingsNavProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "security", label: "Security & Sessions", icon: Shield },
    { id: "detection", label: "Detection & Thresholds", icon: Sliders },
    { id: "notifications", label: "Notifications & SIEM", icon: Bell },
    { id: "ai", label: "AI Copilot Settings", icon: Bot },
    { id: "data", label: "Data & Privacy", icon: Database },
    { id: "appearance", label: "Appearance & Display", icon: Palette },
  ];

  return (
    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id as SettingsTabId)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium font-mono tracking-wide transition-all whitespace-nowrap text-left ${
              isActive
                ? "bg-[#171923] text-[#F5F5FA] border border-[#805BFF]/50 shadow-sm"
                : "text-[#9CA3B5] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? "text-[#39DCE5]" : "text-[#9CA3B5]/60"
              }`}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
