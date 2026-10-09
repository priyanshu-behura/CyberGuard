"use client";

import React, { useState } from "react";
import {
  Palette,
  Eye,
  Sliders,
  Sparkles,
  Save,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  AppearanceSettings,
  PlatformTheme,
  InterfaceDensity,
} from "@/lib/settings/types";

interface AppearanceSettingsTabProps {
  appearance: AppearanceSettings;
  onSave: (data: Partial<AppearanceSettings>) => void;
  onResetAll: () => void;
}

export function AppearanceSettingsTab({
  appearance,
  onSave,
  onResetAll,
}: AppearanceSettingsTabProps) {
  const [theme, setTheme] = useState<PlatformTheme>(appearance.theme);
  const [density, setDensity] = useState<InterfaceDensity>(appearance.density);
  const [reducedMotion, setReducedMotion] = useState(appearance.reducedMotion);
  const [soundEffects, setSoundEffects] = useState(appearance.soundEffects);
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      theme,
      density,
      reducedMotion,
      soundEffects,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Theme Selection */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Color Palette & Cyber Aesthetic
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cyber Dark */}
          <div
            onClick={() => setTheme("cyber-dark")}
            className={`p-4 rounded-xl cursor-pointer border transition-all text-xs space-y-2 ${
              theme === "cyber-dark"
                ? "bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/40 text-white"
                : "bg-black/40 border-white/[0.08] text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold">CYBER DARK</span>
              {theme === "cyber-dark" && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="flex gap-1.5 pt-1">
              <span className="w-4 h-4 rounded-full bg-[#07090e] border border-white/20" />
              <span className="w-4 h-4 rounded-full bg-cyan-500" />
              <span className="w-4 h-4 rounded-full bg-blue-600" />
            </div>
            <p className="text-[11px] text-slate-400">
              Deep space navy with glowing cyan & blue telemetry accents. (Default)
            </p>
          </div>

          {/* High Contrast */}
          <div
            onClick={() => setTheme("high-contrast")}
            className={`p-4 rounded-xl cursor-pointer border transition-all text-xs space-y-2 ${
              theme === "high-contrast"
                ? "bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/40 text-white"
                : "bg-black/40 border-white/[0.08] text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold">HIGH CONTRAST</span>
              {theme === "high-contrast" && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="flex gap-1.5 pt-1">
              <span className="w-4 h-4 rounded-full bg-black border border-white" />
              <span className="w-4 h-4 rounded-full bg-white" />
              <span className="w-4 h-4 rounded-full bg-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              Maximum readability with bright borders and sharp indicator separation.
            </p>
          </div>

          {/* OLED Black */}
          <div
            onClick={() => setTheme("oled-black")}
            className={`p-4 rounded-xl cursor-pointer border transition-all text-xs space-y-2 ${
              theme === "oled-black"
                ? "bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/40 text-white"
                : "bg-black/40 border-white/[0.08] text-slate-400 hover:text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold">OLED PURE BLACK</span>
              {theme === "oled-black" && <Check className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="flex gap-1.5 pt-1">
              <span className="w-4 h-4 rounded-full bg-black border border-white/20" />
              <span className="w-4 h-4 rounded-full bg-slate-900" />
              <span className="w-4 h-4 rounded-full bg-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400">
              True pure pitch black for low-power OLED screens and night operations.
            </p>
          </div>
        </div>
      </div>

      {/* Interface Density & Accessibility */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Accessibility & Layout Density
        </h3>

        <div className="space-y-4">
          {/* Density Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Information Density
              </span>
              <span className="text-[11px] text-slate-400">
                Compact mode optimizes table spacing for small displays and NOC multi-monitors.
              </span>
            </div>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as InterfaceDensity)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="comfortable">Comfortable (Standard)</option>
              <option value="compact">Compact (High-Density SOC)</option>
            </select>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Reduced Motion & Ambient Pulses
              </span>
              <span className="text-[11px] text-slate-400">
                Disable pulsing glows, smooth transitions, and radar sweep micro-animations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-slate-500">
            Display tokens applied immediately to client document
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Display Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Appearance Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Reset */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/[0.06] flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">
            Factory Reset Platform Preferences
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Restore all detection thresholds, theme styles, and notification rules to factory defaults.
          </p>
        </div>

        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetAll();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              Confirm Factory Reset
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.1] text-slate-300 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
        )}
      </div>
    </form>
  );
}
