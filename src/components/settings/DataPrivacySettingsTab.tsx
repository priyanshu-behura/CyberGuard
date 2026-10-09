"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import { settingsStore } from "@/lib/settings/settings-store";
import { AIChatStorage } from "@/lib/ai/chat-storage";
import { incidentStore } from "@/lib/security/incident-store";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { responseStore } from "@/lib/security/response/response-store";

export function DataPrivacySettingsTab() {
  const [storageMetrics, setStorageMetrics] = useState<{
    bytesUsed: number;
    keysCount: number;
    breakdown: { key: string; sizeBytes: number }[];
  }>({ bytesUsed: 0, keysCount: 0, breakdown: [] });

  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
  const [showResetDemoConfirm, setShowResetDemoConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const refreshMetrics = () => {
    setStorageMetrics(settingsStore.getStorageMetrics());
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const handleClearChatHistory = () => {
    AIChatStorage.clearAll();
    setShowClearChatConfirm(false);
    refreshMetrics();
    setFeedbackMessage("All conversation history purged from local browser cache.");
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleResetDemoData = () => {
    incidentStore.clearAll();
    monitorStore.clearAll();
    responseStore.resetStore();
    setShowResetDemoConfirm(false);
    refreshMetrics();
    setFeedbackMessage("Simulated telemetry, incident queues, and response actions reset to baseline.");
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Classification Overview Card */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Data Architecture & Classification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <span className="font-mono font-bold text-emerald-400 block uppercase text-[11px]">
              1. Real Local Forensics
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Message text heuristics, URL DOM parsing, and image EXIF metadata analyzed deterministically on-device without cloud leakage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <span className="font-mono font-bold text-amber-400 block uppercase text-[11px]">
              2. Simulated Mitigations
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Containment actions (e.g. Session Revocation, IP Block) execute against local state models to demonstrate security workflows safely.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <span className="font-mono font-bold text-cyan-400 block uppercase text-[11px]">
              3. Synthetic Scenarios
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Hackathon demonstration scenarios are explicitly marked with simulated metadata flags (<code className="text-cyan-300">isDemo: true</code>).
            </p>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Local Storage Metrics & Breakdown */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Local Storage Footprint</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Browser cache utilization for sessions, telemetry, and investigations.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/[0.1] text-xs font-mono text-cyan-300">
            {(storageMetrics.bytesUsed / 1024).toFixed(2)} KB in use
          </span>
        </div>

        {storageMetrics.breakdown.length > 0 && (
          <div className="space-y-1.5 font-mono text-[11px]">
            {storageMetrics.breakdown.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04]"
              >
                <span className="text-slate-300">{item.key}</span>
                <span className="text-slate-500">{(item.sizeBytes / 1024).toFixed(2)} KB</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destructive Actions Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-rose-300">
          Data Management & State Purge Controls
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/50 border border-rose-500/20">
          <div>
            <span className="text-xs font-bold text-white font-mono block">
              Purge AI Copilot Chat History
            </span>
            <span className="text-[11px] text-slate-400">
              Permanently remove all multi-turn threat investigation sessions from local storage.
            </span>
          </div>

          {showClearChatConfirm ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearChatHistory}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Confirm Purge
              </button>
              <button
                type="button"
                onClick={() => setShowClearChatConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearChatConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Chat History</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/50 border border-rose-500/20">
          <div>
            <span className="text-xs font-bold text-white font-mono block">
              Reset Simulated Events & Demo Incidents
            </span>
            <span className="text-[11px] text-slate-400">
              Clear all simulated authentication failures, injected scenarios, and pending mitigation actions.
            </span>
          </div>

          {showResetDemoConfirm ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetDemoConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetDemoConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulated Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
