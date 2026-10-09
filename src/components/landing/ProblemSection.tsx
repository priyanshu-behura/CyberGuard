"use client";

import React from "react";
import { Globe, Video, KeyRound, AlertTriangle } from "lucide-react";

const fragmentedSignals = [
  {
    code: "SIG-01",
    vector: "Domain Spoofing",
    title: "Isolated Lookalike Link",
    description: "An email contains a destination link registered 3 hours ago with a slight typo.",
    icon: Globe,
    status: "Flagged as Low Risk Spam",
    blindspot: "Treated as benign junk mail by standard email filters.",
    accent: "bg-indigo-50 border-indigo-200 text-[#4F46E5]",
  },
  {
    code: "SIG-02",
    vector: "Synthetic Media",
    title: "10-Second Cloned Voicemail",
    description: "A messaging app receives an executive audio memo requesting immediate fund clearance.",
    icon: Video,
    status: "Passes Antivirus Scan",
    blindspot: "Traditional endpoint security cannot inspect voice biometrics.",
    accent: "bg-purple-50 border-purple-200 text-[#7C3AED]",
  },
  {
    code: "SIG-03",
    vector: "Authentication Drift",
    title: "Concurrent Geographic Login",
    description: "Session token authenticated from an unrecognized VPN gateway 3,000 miles away.",
    icon: KeyRound,
    status: "Logged in Raw SIEM",
    blindspot: "Buried beneath 40,000 daily access log records without context.",
    accent: "bg-amber-50 border-amber-200 text-amber-700",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Header matching Image 1 Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-[#4F46E5]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>THE FRAGMENTATION PROBLEM</span>
            </div>
            <h2 className="font-editorial-serif text-3xl sm:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.08]">
              Modern attacks don’t arrive as one alarm.<br />
              <span className="text-slate-500 italic">They arrive as ten innocent signals.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              When threats blend deepfake voices, typo-squatted URLs, and hijacked sessions,
              inspecting each signal in isolation leads to false comfort and catastrophic blind spots.
            </p>
          </div>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Editorial Feature Card */}
          <div className="lg:col-span-7 rounded-3xl p-8 sm:p-10 bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-semibold tracking-wider text-[#4F46E5] uppercase">
                  The Conventional Blind Spot
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ISOLATION RATE: 94%
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-editorial-serif text-2xl sm:text-3xl font-medium text-[#0B132B] tracking-tight">
                  Disjointed Tools Create Alert Fatigue Without Context
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Security operations centers are inundated with thousands of raw alerts every day.
                  Without an intelligence engine that correlates disparate indicators across identity,
                  media, and infrastructure, the actual attack chain remains invisible until funds or credentials are lost.
                </p>
              </div>

              {/* Callout Strip */}
              <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-slate-200/80 space-y-2">
                <div className="text-xs uppercase tracking-wider text-[#4F46E5] font-bold">
                  REAL-WORLD ADVERSARY PATTERN:
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Phishing Email (Vector A) + Deepfake Voicemail (Vector B) + Session Hijack (Vector C) = Unchecked Executive Wire Fraud.
                </p>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>CYBERGUARD THREAT RESEARCH</span>
              <span className="text-[#4F46E5] font-semibold">CORRELATION REQUIRED</span>
            </div>
          </div>

          {/* Right Column: Stacked Fragmented Signals */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {fragmentedSignals.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.code}
                  className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${item.accent}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#0B132B]">
                        {item.vector}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60">
                      {item.code}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#0B132B]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-amber-600 font-medium">{item.status}</span>
                    <span className="text-slate-400 truncate max-w-[170px] text-right font-normal">
                      {item.blindspot}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
