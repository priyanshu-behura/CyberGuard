"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";

interface FutureModulePlaceholderProps {
  moduleName: string;
  moduleCategory: string;
  description: string;
  plannedFeatures: string[];
}

export function FutureModulePlaceholder({
  moduleName,
  moduleCategory,
  description,
  plannedFeatures,
}: FutureModulePlaceholderProps) {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Module Header Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/40">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {moduleCategory}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Phase 3 Engine Architecture
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {moduleName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Planned Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Planned Engine Capabilities
              </h3>
            </div>
            <ul className="space-y-3">
              {plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Phase Status
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authentication and application shell foundations are active. Machine learning models, heuristics, and telemetry integrations for this module will be connected in future development phases.
              </p>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-cyan-400">Security Rule:</div>
                <div className="text-slate-300">No mock security statistics are presented as live data.</div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                href="/dashboard"
                variant="secondary"
                size="sm"
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back to Command Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
