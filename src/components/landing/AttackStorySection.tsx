"use client";

import React from "react";
import { Radio, GitFork, Gauge, FileText, ShieldAlert } from "lucide-react";

const attackStorySteps = [
  {
    step: "01",
    phase: "SIGNAL",
    title: "Isolated Ingestion",
    description: "An unusual incoming SMS contains a shortened URL claiming urgent banking verification.",
    telemetry: "Event ID: SIG-2049 • Channel: SMS Gateway",
    color: "bg-indigo-50 border-indigo-200 text-[#4F46E5]",
    icon: Radio,
  },
  {
    step: "02",
    phase: "CORRELATION",
    title: "Cross-Vector Linkage",
    description: "Within 4 minutes, the destination server IP matches an active brute-force spray on the corporate portal.",
    telemetry: "Temporal Proximity: 240s • Common Target Entity",
    color: "bg-purple-50 border-purple-200 text-[#7C3AED]",
    icon: GitFork,
  },
  {
    step: "03",
    phase: "RISK ASSESSMENT",
    title: "Calibrated Severity",
    description: "The attack risk index spikes to 86/100 (HIGH). Multiple MITRE ATT&CK techniques verified simultaneously.",
    telemetry: "Mitre: T1566.002 (Phishing) + T1110 (Brute Force)",
    color: "bg-rose-50 border-rose-200 text-rose-700",
    icon: Gauge,
  },
  {
    step: "04",
    phase: "EXPLANATION",
    title: "Actionable Dossier",
    description: "Operator receives a plain-language briefing with evidence breakdown, confidence calibration, and mitigation steps.",
    telemetry: "Confidence: 96% • Action: Pending Human Approval",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon: FileText,
  },
];

export function AttackStorySection() {
  return (
    <section className="py-24 lg:py-32 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-[#4F46E5]">
            <GitFork className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>THE ATTACK STORY</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.08]">
            How separate events become<br />
            <span className="text-[#4F46E5] italic">an understandable sequence.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            CYBERGUARD connects the dots from raw signal ingestion to definitive operator action.
            (Illustrated using a simulated demonstration scenario).
          </p>
        </div>

        {/* Stepped Attack Story Visual Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {attackStorySteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-3xl p-7 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-editorial-serif font-semibold text-slate-300 group-hover:text-[#4F46E5] transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      {item.phase}
                    </span>
                  </div>

                  <div className={`w-11 h-11 rounded-xl border ${item.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-[#0B132B] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                  {item.telemetry}
                </div>
              </div>
            );
          })}
        </div>

        {/* Human Oversight Note */}
        <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#4F46E5] shrink-0" />
            <span>
              Mandatory Human-in-the-Loop Safeguard: Consequential containment actions require analyst verification.
            </span>
          </div>
          <span className="text-[#4F46E5] uppercase tracking-wider font-semibold">
            GOVERNED EXECUTION ONLY
          </span>
        </div>

      </div>
    </section>
  );
}
