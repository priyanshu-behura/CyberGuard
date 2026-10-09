"use client";

import React from "react";
import { Radar, Tag, Gauge, HelpCircle, BellRing, ShieldAlert } from "lucide-react";

const workflowPhases = [
  {
    step: "01",
    phase: "DETECTION",
    title: "Continuous Ingestion",
    description: "Captures messages, URLs, audio notes, and auth events across digital touchpoints.",
    icon: Radar,
  },
  {
    step: "02",
    phase: "CLASSIFICATION",
    title: "Vector Identification",
    description: "Categorizes indicators into exact threat types—from spoofed domains to synthetic voices.",
    icon: Tag,
  },
  {
    step: "03",
    phase: "RISK ASSESSMENT",
    title: "Calibrated Scoring",
    description: "Computes a normalized 0-100 severity index factoring blast radius and attack probability.",
    icon: Gauge,
  },
  {
    step: "04",
    phase: "EXPLANATION",
    title: "Forensic Evidence",
    description: "Surfaces the exact rationale: highlighted language cues, acoustic spectrogram shifts, or DNS gaps.",
    icon: HelpCircle,
  },
  {
    step: "05",
    phase: "ALERT",
    title: "Actionable Notification",
    description: "Dispatches prioritized notifications to the operator console with zero notification noise.",
    icon: BellRing,
  },
  {
    step: "06",
    phase: "RECOMMENDED RESPONSE",
    title: "Governed Playbooks",
    description: "Provides pre-staged containment actions with mandatory human approval before execution.",
    icon: ShieldAlert,
  },
];

export function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-32 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-[#4F46E5]">
            <Radar className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.08]">
            From initial detection<br />
            <span className="text-[#4F46E5] italic">to governed containment.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            The complete 6-stage lifecycle engineered to deliver decisive threat mitigation with total human control.
          </p>
        </div>

        {/* 6-Phase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflowPhases.map((phase) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.step}
                className="rounded-3xl p-7 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-editorial-serif font-semibold text-slate-300 group-hover:text-[#4F46E5] transition-colors">
                      {phase.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                      {phase.phase}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-[#0B132B] mb-1.5">
                    {phase.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                  CYBERGUARD CORE ENGINE
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
