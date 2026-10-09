"use client";

import React, { useState } from "react";
import {
  Sliders,
  AlertTriangle,
  ShieldAlert,
  Search,
  ScanFace,
  Save,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  DetectionPreferencesSettings,
  PhishingSensitivity,
  ScannerDepth,
} from "@/lib/settings/types";

interface DetectionSettingsTabProps {
  detection: DetectionPreferencesSettings;
  onSave: (data: Partial<DetectionPreferencesSettings>) => void;
}

export function DetectionSettingsTab({ detection, onSave }: DetectionSettingsTabProps) {
  const [highThreshold, setHighThreshold] = useState(detection.highRiskThreshold);
  const [criticalThreshold, setCriticalThreshold] = useState(detection.criticalRiskThreshold);
  const [phishingSens, setPhishingSens] = useState<PhishingSensitivity>(detection.phishingSensitivity);
  const [depth, setDepth] = useState<ScannerDepth>(detection.scannerDepth);
  const [autoEscalate, setAutoEscalate] = useState(detection.autoEscalateCriticalAlerts);
  const [driftCheck, setDriftCheck] = useState(detection.enableBehavioralDriftCheck);
  const [deepfakeStrict, setDeepfakeStrict] = useState(detection.deepfakeStrictHeuristics);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      highRiskThreshold: highThreshold,
      criticalRiskThreshold: criticalThreshold,
      phishingSensitivity: phishingSens,
      scannerDepth: depth,
      autoEscalateCriticalAlerts: autoEscalate,
      enableBehavioralDriftCheck: driftCheck,
      deepfakeStrictHeuristics: deepfakeStrict,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Risk Threshold Sliders */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-5">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Risk Threshold Calibration
        </h3>
        <p className="text-xs text-slate-400">
          Define the numerical score cutoff where threats escalate to High and Critical classifications.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* High Risk Slider */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold">HIGH RISK THRESHOLD</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {highThreshold} / 100
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={80}
              step={5}
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Analyses with score ≥ {highThreshold} will trigger High-Severity alerts and incident queue escalation.
            </p>
          </div>

          {/* Critical Risk Slider */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-300 font-bold">CRITICAL RISK THRESHOLD</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {criticalThreshold} / 100
              </span>
            </div>
            <input
              type="range"
              min={80}
              max={95}
              step={5}
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Analyses with score ≥ {criticalThreshold} flag imminent account compromise or critical active attacks.
            </p>
          </div>
        </div>
      </div>

      {/* Heuristic & Analysis Engine Tuning */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Engine Sensitivity & Rule Behavior
        </h3>

        <div className="space-y-4">
          {/* Phishing Sensitivity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Phishing Keyword & Coercion Sensitivity
              </span>
              <span className="text-[11px] text-slate-400">
                Determines threshold for social engineering linguistic indicators.
              </span>
            </div>
            <select
              value={phishingSens}
              onChange={(e) => setPhishingSens(e.target.value as PhishingSensitivity)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="standard">Standard (Balanced Precision)</option>
              <option value="aggressive">Aggressive (High Recall)</option>
              <option value="strict">Strict (Zero-Tolerance)</option>
            </select>
          </div>

          {/* Scanner Depth */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                URL & DOM Inspection Depth
              </span>
              <span className="text-[11px] text-slate-400">
                Deep heuristic evaluation inspects multi-level redirects, punycode, and subdomain drift.
              </span>
            </div>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as ScannerDepth)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="standard">Fast Heuristic Scan</option>
              <option value="deep">Deep Structural & Brand Verification</option>
            </select>
          </div>

          {/* Auto Escalate */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Automatic Incident Queue Escalation
              </span>
              <span className="text-[11px] text-slate-400">
                Automatically generate Incident records in the SOC triage queue for threats scored ≥ {highThreshold}.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoEscalate}
              onChange={(e) => setAutoEscalate(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>

          {/* Deepfake Strict Heuristics */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Synthetic Media Strict EXIF & Container Checks
              </span>
              <span className="text-[11px] text-slate-400">
                Flag missing EXIF tags or generative metadata signatures as suspicious in image and audio forensics.
              </span>
            </div>
            <input
              type="checkbox"
              checked={deepfakeStrict}
              onChange={(e) => setDeepfakeStrict(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-slate-500">
            Tuning updates take effect on subsequent detections
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Detection Rules Updated</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Detection Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
