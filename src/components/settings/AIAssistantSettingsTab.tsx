"use client";

import React, { useEffect, useState } from "react";
import {
  Bot,
  Cpu,
  ShieldCheck,
  Activity,
  Save,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { AIAssistantSettings, AIVerbosity } from "@/lib/settings/types";
import { AIProviderStatus } from "@/lib/ai/ai-provider";

interface AIAssistantSettingsTabProps {
  ai: AIAssistantSettings;
  onSave: (data: Partial<AIAssistantSettings>) => void;
}

export function AIAssistantSettingsTab({ ai, onSave }: AIAssistantSettingsTabProps) {
  const [enabled, setEnabled] = useState(ai.enabled);
  const [preferredModel, setPreferredModel] = useState(ai.preferredModel);
  const [verbosity, setVerbosity] = useState<AIVerbosity>(ai.responseVerbosity);
  const [autoTelemetry, setAutoTelemetry] = useState(ai.autoRetrieveTelemetry);
  const [maskData, setMaskData] = useState(ai.privacyMaskSensitiveData);

  const [providerStatus, setProviderStatus] = useState<AIProviderStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchStatus = async () => {
    setIsTesting(true);
    try {
      const res = await fetch("/api/ai/status");
      const json = await res.json();
      if (json.success && json.status) {
        setProviderStatus(json.status);
        setTestResult(
          json.status.isConfigured
            ? `Connection Verified: Active cloud model ${json.status.modelName}`
            : `Verified: Operating in Deterministic Heuristic Copilot mode`
        );
      }
    } catch {
      setTestResult("Healthcheck failed: Server endpoint unreachable.");
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      enabled,
      preferredModel,
      responseVerbosity: verbosity,
      autoRetrieveTelemetry: autoTelemetry,
      privacyMaskSensitiveData: maskData,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Live AI Engine Status & Connection Diagnostic */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
              AI Provider Connection & Engine Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current server-side AI execution mode and key diagnostic.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.06] text-xs font-mono text-cyan-300">
            {testResult}
          </div>
        )}

        <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Active Mode:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                providerStatus?.isConfigured
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              }`}
            >
              {providerStatus?.isConfigured ? "CLOUD GENERATIVE AI" : "LOCAL DETERMINISTIC COPILOT"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Engine / Identifier:</span>
            <span className="font-mono text-white font-bold">
              {providerStatus?.modelName || "cyberguard-heuristic-copilot-v1"}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono leading-relaxed pt-1 border-t border-white/[0.04]">
            {providerStatus?.notice}
          </div>
        </div>
      </div>

      {/* Copilot Behavior & Preferences */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Copilot Response Preferences
        </h3>

        <div className="space-y-4">
          {/* Master Enable */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Enable CYBERGUARD AI Copilot
              </span>
              <span className="text-[11px] text-slate-400">
                Provides active conversational threat investigation and report generation.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>

          {/* Verbosity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Response Verbosity & Formatting Style
              </span>
              <span className="text-[11px] text-slate-400">
                Tailor analysis reports for SOC operators or CISO executive briefs.
              </span>
            </div>
            <select
              value={verbosity}
              onChange={(e) => setVerbosity(e.target.value as AIVerbosity)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="technical">Technical (Detailed Forensics & Indicators)</option>
              <option value="concise">Concise (Fast Summary & Immediate Actions)</option>
              <option value="executive">Executive Brief (High-Level Business Impact)</option>
            </select>
          </div>

          {/* Auto Telemetry Retrieval */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Automated Security Tool Invocations
              </span>
              <span className="text-[11px] text-slate-400">
                Permit the Copilot to query local incident records, posture status, and queue telemetry on-demand.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoTelemetry}
              onChange={(e) => setAutoTelemetry(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Privacy Notice Card */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>AI Privacy & Data Grounding Policy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            CYBERGUARD AI operates on controlled read-only tools. Under no circumstances are internal credentials, authorization tokens, or raw passwords transmitted to external AI providers.
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-slate-500">
            AI preferences persist to local platform configuration
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>AI Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save AI Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
