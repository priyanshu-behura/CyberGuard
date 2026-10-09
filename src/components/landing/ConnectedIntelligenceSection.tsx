"use client";

import React, { useState } from "react";
import { Cpu, GitMerge, Sparkles } from "lucide-react";

const correlationModes = [
  {
    id: "correlation",
    title: "1. Cross-Vector Signal Fusion",
    summary: "Ingests raw telemetry across URLs, media binaries, and auth sessions simultaneously.",
    details: "Instead of treating a spoofed email and a failed login as separate incidents, CYBERGUARD maps them to the same campaign identifier within milliseconds.",
    metrics: "4 Vector Sources Active",
  },
  {
    id: "risk",
    title: "2. Calibrated Multi-Factor Scoring",
    summary: "Generates a 0-100 risk score factoring blast radius, exploit likelihood, and credential privileges.",
    details: "Scores are mathematically normalized and categorized into SAFE, LOW, MEDIUM, HIGH, or CRITICAL thresholds.",
    metrics: "Calibrated 0-100 Scale",
  },
  {
    id: "explanation",
    title: "3. Evidence-Backed Explanations",
    summary: "Translates technical indicators into human-readable forensic proof.",
    details: "Every assessment exposes the concrete trigger strings, mismatched DNS records, or synthetic voice spectral artifacts behind the decision.",
    metrics: "Auditable Explanations",
  },
];

export function ConnectedIntelligenceSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 lg:py-32 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header matching Image 1 editorial style */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-[#4F46E5]">
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>CONNECTED INTELLIGENCE</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.08]">
            We don’t just flag anomalies.<br />
            <span className="text-[#4F46E5] italic">We explain the complete threat story.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            CYBERGUARD transforms raw multi-source streams into verified security conclusions,
            providing human operators with instant context and confidence.
          </p>
        </div>

        {/* Interactive Storytelling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Step Selection Cards */}
          <div className="lg:col-span-6 space-y-4">
            {correlationModes.map((item, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveStep(index)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-white border-[#4F46E5] shadow-lg shadow-indigo-500/10"
                      : "bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-base font-semibold ${isActive ? "text-[#0B132B]" : "text-slate-700"}`}>
                      {item.title}
                    </h3>
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                      isActive ? "bg-indigo-50 text-[#4F46E5] font-semibold border border-indigo-200" : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.metrics}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.summary}
                  </p>
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-[#4F46E5] font-medium leading-relaxed animate-in fade-in duration-200">
                      → {item.details}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Composed Correlation Synthesis Visual */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl p-7 sm:p-8 bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
              
              {/* Visual Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-[#4F46E5]" />
                  <span className="text-xs font-bold tracking-wider text-[#0B132B] uppercase">
                    Correlation Pipeline
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#4F46E5] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 font-semibold">
                  REAL-TIME SYNTHESIS
                </span>
              </div>

              {/* Synthesis Nodes */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F8F9FC] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Input Vector 1</span>
                    <span className="text-xs font-mono font-bold text-[#0B132B]">Spoofed URL: auth-login-update.cc</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 font-semibold">
                    Phishing Trigger
                  </span>
                </div>

                <div className="flex justify-center text-[#4F46E5]">
                  <GitMerge className="w-5 h-5 rotate-90" />
                </div>

                <div className="p-4 rounded-xl bg-[#F8F9FC] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Input Vector 2</span>
                    <span className="text-xs font-mono font-bold text-[#0B132B]">Voice Note: 22.05kHz Pitch Shift Artifact</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 font-semibold">
                    Deepfake Verified
                  </span>
                </div>

                <div className="flex justify-center text-[#4F46E5]">
                  <GitMerge className="w-5 h-5 rotate-90" />
                </div>

                {/* Final Correlated Synthesis Dossier */}
                <div className="p-5 rounded-2xl bg-[#0B0E17] text-white border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#39DCE5]">CORRELATED THREAT ASSESSMENT:</span>
                    <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/30">
                      CRITICAL RISK (92/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    Adversary campaign identified: Lookalike portal and cloned voice memo share timestamp correlation and common target executive persona.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Containment Playbook:</span>
                    <span className="text-[#39DCE5] font-semibold">Isolate Session & Block ASN</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
