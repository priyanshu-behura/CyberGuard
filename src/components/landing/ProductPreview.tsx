import React from "react";
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
  Layers,
  Activity,
  FileWarning,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ProductPreview() {
  return (
    <section className="py-20 lg:py-28 relative border-t border-white/[0.06] bg-[#070b12] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] ambient-glow-cyan blur-[120px] pointer-events-none opacity-25" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <Badge variant="cyan">INTERFACE EXPERIENCE PREVIEW</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security Intelligence with Unprecedented Clarity
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A sneak peek at the upcoming CYBERGUARD platform console. Designed to
            translate deep multi-vector signals into clear status assessments,
            evidentiary proof, and guided action.
          </p>
        </div>

        {/* Polished Mockup Frame */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/[0.12] bg-[#090d16] p-3 sm:p-5 shadow-2xl shadow-cyan-950/40">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-3 py-2.5 mb-4 border-b border-white/[0.08] text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="hidden sm:inline text-slate-500 ml-2">
                CYBERGUARD Security Console • v1.0 Preview
              </span>
            </div>

            {/* Platform Phase 2 Notice */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                <Lock className="w-2.5 h-2.5" />
                Protected Platform (Phase 2)
              </span>
            </div>
          </div>

          {/* Console Grid Mockup Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Realtime Threat Status & Severity Score */}
            <div className="lg:col-span-4 space-y-4">
              {/* Threat Severity Score Card */}
              <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Incident Risk Index
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    HIGH SEVERITY
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-white">88</span>
                  <span className="text-sm font-mono text-slate-400">/ 100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full w-[88%]" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Correlated signal: Lookalike domain redirect combined with
                  impersonated vendor payment request.
                </p>
              </div>

              {/* Status Checklist Card */}
              <div className="glass-panel rounded-xl p-5 border border-white/[0.08] space-y-2.5">
                <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
                  Subsystem Health
                </span>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Phishing Heuristics</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Deepfake Spectrogram</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Session Anomaly Guard</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Correlated Telemetry & Recommended Action */}
            <div className="lg:col-span-8 space-y-4">
              {/* Evidence & Explanation Mockup Card */}
              <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileWarning className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">
                      Detected Attack Vector: Typo-Squatted Impersonation
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID #CG-9842
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-lg p-3.5 border border-white/[0.06] mb-4 space-y-2 text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-300 pb-2 border-b border-white/[0.04]">
                    <span className="text-slate-400">Target Resource:</span>
                    <span className="text-cyan-300">
                      https://auth-mybank-verify.internal-gate.xyz
                    </span>
                  </div>
                  <div className="text-slate-300 space-y-1 pt-1">
                    <span className="text-slate-400 block">
                      Explainable Intelligence Flag:
                    </span>
                    <p className="text-slate-300 font-sans text-xs">
                      Domain registered 3 hours ago with mismatched SSL certificate
                      authority; synthetic corporate email signature detected
                      requesting immediate credential re-verification.
                    </p>
                  </div>
                </div>

                {/* Recommended Response Action Module */}
                <div className="rounded-lg p-3.5 bg-cyan-950/30 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Recommended Response Playbook:
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Action Required
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <p className="text-slate-300">
                      Block IP gateway route, revoke session tokens, and notify
                      credential administrator.
                    </p>
                    <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-medium whitespace-nowrap">
                      Execute Playbook (Console Ready)
                    </span>
                  </div>
                </div>
              </div>

              {/* Callout Notice to Authenticate */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] gap-3">
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">
                    Ready to explore the live security engine?
                  </div>
                  <div className="text-xs text-slate-400">
                    Authentication and full dashboard capabilities will be unlocked
                    in Phase 2.
                  </div>
                </div>
                <Button href="/signup" size="sm" variant="primary">
                  Register for Early Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
