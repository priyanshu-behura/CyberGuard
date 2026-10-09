"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  ScanFace,
  Activity,
  GitFork,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Shield,
} from "lucide-react";

const verifiedCapabilities = [
  {
    icon: Search,
    title: "Phishing & URL Analysis",
    subtitle: "Messages, URLs & Domain Spoofing",
    description:
      "Deeply inspects text payloads, homograph characters, typo-squatted domains, and redirect cascades using heuristic and domain intelligence.",
    route: "/analyze",
    badge: "Active Module",
    accent: "bg-indigo-50 border-indigo-200 text-[#4F46E5]",
  },
  {
    icon: ScanFace,
    title: "Impersonation & Deepfake Assessment",
    subtitle: "Audio, Video & Synthetic Media",
    description:
      "Detects manipulation artifacts, acoustic sampling frequencies (voice clones), and facial boundary seams to prevent executive coercion.",
    route: "/identity",
    badge: "Active Module",
    accent: "bg-purple-50 border-purple-200 text-[#7C3AED]",
  },
  {
    icon: Activity,
    title: "Suspicious Login & ATO Monitoring",
    subtitle: "Account Takeover Surveillance",
    description:
      "Monitors login velocity, geographic travel anomalies, unrecognized device fingerprints, and authentication failures in continuous surveillance.",
    route: "/monitor",
    badge: "Active Module",
    accent: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    icon: GitFork,
    title: "Attack-Chain Correlation",
    subtitle: "MITRE ATT&CK Aligned Kill Chains",
    description:
      "Correlates multiple separate events across time, targets, and attacker techniques into clear, multi-stage adversary campaign graphs.",
    route: "/attack-chains",
    badge: "Correlation Engine",
    accent: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    icon: Lightbulb,
    title: "Evidence-Based Explanations",
    subtitle: "Transparent Reasoning & Scoring",
    description:
      "De-mystifies security alarms by exposing concrete indicator strings, confidence intervals, and plain-language summaries without black-box opacity.",
    route: "/ai",
    badge: "AI-Powered",
    accent: "bg-sky-50 border-sky-200 text-sky-700",
  },
  {
    icon: ShieldAlert,
    title: "Response & Approval Workflows",
    subtitle: "Human-in-the-Loop Mitigation",
    description:
      "Provides playbooks to revoke active sessions, block IP endpoints, and quarantine credentials with mandatory operator sign-off before execution.",
    route: "/response",
    badge: "Governed Action",
    accent: "bg-rose-50 border-rose-200 text-rose-700",
  },
];

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="py-24 lg:py-32 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-[#4F46E5]">
            <Shield className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.08]">
            Verified capabilities<br />
            <span className="text-[#4F46E5] italic">built for modern defense.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Six interconnected defensive pillars implemented directly within CYBERGUARD to identify, explain, and contain threats.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-3xl p-8 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl border ${cap.accent} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0B132B] mb-1">
                    {cap.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-400 mb-3">
                    {cap.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={cap.route}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#3730A3] transition-colors group"
                  >
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
