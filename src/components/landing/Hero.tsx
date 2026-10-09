import React from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  Eye,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden cyber-grid-lines">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] ambient-glow-cyan blur-3xl pointer-events-none opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] ambient-glow-blue blur-3xl pointer-events-none opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] ambient-glow-violet blur-3xl pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Message & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Context Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Next-Generation Threat Intelligence • BPUT 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Detect Threats Before{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                They Become Incidents.
              </span>
            </h1>

            {/* Simple Supporting Explanatory Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              CYBERGUARD protects people, accounts, and digital interactions by
              detecting suspicious activity, analyzing multi-source threats, and
              guiding users with clear, explainable response actions.
            </p>

            {/* Key Value Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-300 font-mono pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Multi-Source Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Explainable Risk Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Guided Remediation</span>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
              <Button
                href="/signup"
                size="lg"
                variant="primary"
                className="w-full sm:w-auto"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
              <Button
                href="/#how-it-works"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                icon={<Activity className="w-4 h-4 text-cyan-400" />}
              >
                See How It Works
              </Button>
            </div>

            {/* Subtle Trust Note */}
            <p className="text-xs text-slate-400 font-mono">
              Designed for first-time visitors, security analysts, and enterprise
              teams.
            </p>
          </div>

          {/* Right Column: Protected Security Network Concept Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[460px] lg:max-w-none">
              {/* Decorative Glass Security Console Card */}
              <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-[#0b101c]/90 to-[#070a12]/95 p-6 backdrop-blur-xl shadow-2xl shadow-cyan-950/30">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
                      CYBERGUARD PERIMETER MESH
                    </span>
                  </div>
                  <Badge variant="cyan" className="text-[10px] py-0.5">
                    SHIELD ACTIVE
                  </Badge>
                </div>

                {/* Central Multi-Layer Shield Network Graphic */}
                <div className="relative aspect-square max-w-[340px] mx-auto flex items-center justify-center">
                  {/* Concentric subtle radar rings */}
                  <div className="absolute inset-4 rounded-full border border-cyan-500/15 animate-pulse" />
                  <div className="absolute inset-12 rounded-full border border-blue-500/15" />
                  <div className="absolute inset-20 rounded-full border border-violet-500/15" />

                  {/* Core Shield Node */}
                  <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-900/80 via-blue-950/80 to-slate-950 border border-cyan-400/40 flex flex-col items-center justify-center text-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
                    <Shield className="w-10 h-10" />
                    <span className="text-[9px] font-mono tracking-widest text-cyan-300 mt-1 uppercase">
                      GUARDIAN
                    </span>
                  </div>

                  {/* Orbiting Satellite Security Nodes */}
                  {/* Node 1: Identity & Media */}
                  <div className="absolute top-2 left-6 z-20 flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg text-xs backdrop-blur-md">
                    <div className="w-6 h-6 rounded-lg bg-violet-950/70 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <div className="text-white font-medium">Deepfake Check</div>
                      <div className="text-emerald-400 font-mono text-[10px]">
                        99.2% Authentic
                      </div>
                    </div>
                  </div>

                  {/* Node 2: Suspicious URL / Phishing */}
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg text-xs backdrop-blur-md">
                    <div className="w-6 h-6 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <div className="text-white font-medium">URL Threat Scan</div>
                      <div className="text-cyan-400 font-mono text-[10px]">
                        Zero Heuristic Flags
                      </div>
                    </div>
                  </div>

                  {/* Node 3: Account Monitoring */}
                  <div className="absolute bottom-6 left-4 z-20 flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/10 shadow-lg text-xs backdrop-blur-md">
                    <div className="w-6 h-6 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <div className="text-white font-medium">Session Guard</div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        Anomaly Score: 0.02
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Footer inside Visual Card */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Realtime Telemetry Ready</span>
                  </div>
                  <span className="text-cyan-400">v1.0 Architecture</span>
                </div>
              </div>

              {/* Backing ambient drop shadow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 blur-xl -z-10 opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
