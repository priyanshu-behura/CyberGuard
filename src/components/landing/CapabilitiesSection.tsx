import React from "react";
import {
  FileSearch,
  ScanFace,
  Activity,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

const capabilities = [
  {
    icon: FileSearch,
    title: "AI Threat Analysis",
    subtitle: "Messages, URLs, Websites & Files",
    description:
      "Deeply inspects suspicious incoming communications, lookalike domain redirects, phishing heuristics, and attached payload structures in real time.",
    route: "/capabilities#threat-analysis",
    badge: "Core Engine",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
  },
  {
    icon: ScanFace,
    title: "Identity & Media Verification",
    subtitle: "Deepfakes, Audio & Synthetic Media",
    description:
      "Detects manipulation artifacts, voice cloning frequencies, and facial boundary incongruities to expose impersonation attacks before credentials or funds are sent.",
    route: "/capabilities#identity-verification",
    badge: "Media Guard",
    color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
  },
  {
    icon: Activity,
    title: "Account & Behaviour Monitoring",
    subtitle: "Login Anomalies & Deviations",
    description:
      "Tracks behavioral baselines across authentication events, IP geo-velocity shifts, device fingerprints, and unauthorized API authorization spikes.",
    route: "/capabilities#behavior-monitoring",
    badge: "Continuous Defense",
    color: "from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400",
  },
  {
    icon: Lightbulb,
    title: "Explainable Risk Assessment",
    subtitle: "Transparent Context & Severity Scoring",
    description:
      "De-mystifies security alarms by highlighting concrete evidence strings, domain discrepancy charts, and confidence metrics in plain, human language.",
    route: "/capabilities#explainable-risk",
    badge: "Explainable AI",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    icon: ShieldCheck,
    title: "Intelligent Response",
    subtitle: "Guided Remediation & Playbooks",
    description:
      "Translates detection into immediate, decisive action with prioritized defense checklists, credential revoking triggers, and automated incident reports.",
    route: "/capabilities#intelligent-response",
    badge: "Action Center",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
  },
];

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="py-20 lg:py-28 relative border-t border-white/[0.06] bg-[#070b12]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cyan">COMPREHENSIVE PROTECTION</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Core Capabilities Built for Modern Threats
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Five synchronized defensive pillars designed to identify, explain,
            and resolve complex threats without confusing technical jargon.
          </p>
        </div>

        {/* 5 Core Capability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, index) => {
            const Icon = cap.icon;
            const isFullSpanOnDesktop = index === 3 || index === 4;

            return (
              <div
                key={cap.title}
                className={`glass-panel-interactive rounded-2xl p-7 flex flex-col justify-between border border-white/[0.08] ${
                  index === 4 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} border flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {cap.title}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400/90 mb-3">
                    {cap.subtitle}
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-white/[0.06]">
                  <Link
                    href={cap.route}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group"
                  >
                    <span>Explore Capability</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
