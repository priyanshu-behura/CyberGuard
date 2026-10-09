"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Radio,
} from "lucide-react";

export function ProductPreview() {
  return (
    <section id="product-preview" className="py-24 lg:py-32 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-[#4F46E5]">
            <Lock className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>INTERFACE PREVIEW</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.08]">
            An AI-first workspace<br />
            <span className="text-[#4F46E5] italic">for decisive operators.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            A preview of the internal CYBERGUARD console interface. Designed for clear telemetry
            interpretation, continuous account posture, and governed response execution.
          </p>
        </div>

        {/* Polished Console Mockup Frame */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-3 py-2 mb-5 border-b border-slate-100 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="hidden sm:inline text-slate-500 ml-2 font-medium">
                CYBERGUARD Security Console • /dashboard
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 border border-indigo-200 text-[#4F46E5] font-semibold">
                <Lock className="w-2.5 h-2.5" />
                Live Architecture
              </span>
            </div>
          </div>

          {/* Console Grid Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Posture & Risk Index */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl p-5 bg-[#F8F9FC] border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Account Surveillance
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    MONITORED
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-extrabold text-[#0B132B] font-mono">18</span>
                    <span className="text-sm font-mono text-slate-400">/ 100</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">Baseline Normal Posture</span>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">URL Inspection</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Synthetic Voice Check</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Session Anomaly Guard</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-5 bg-[#F8F9FC] border border-slate-200/80 space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500 block">
                  AI SOC Assistant
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dual-mode intelligence supporting General reasoning and specialist SOC investigations.
                </p>
                <Link
                  href="/ai"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#3730A3] pt-1"
                >
                  <span>Open AI Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Correlated Telemetry & Incident Containment */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl p-6 bg-[#F8F9FC] border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-sm font-bold text-[#0B132B]">
                      Sample Forensic Incident Dossier
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    INC-DEMO-01
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/90 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500 font-mono">
                    <span>Vector: Typo-Squatted Impersonation</span>
                    <span className="text-rose-600 font-bold">Severity: HIGH</span>
                  </div>
                  <p className="text-xs text-slate-700 font-sans pt-1 leading-relaxed">
                    Lookalike domain with newly registered DNS records detected. Voice memo synthesis flagged
                    with 94% confidence. AI recommends immediate session revocation.
                  </p>
                </div>

                {/* Response Action Preview */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[#4F46E5] font-semibold block">
                      Recommended Remediation:
                    </span>
                    <span className="text-slate-600">
                      Revoke active user sessions and require hardware key MFA.
                    </span>
                  </div>
                  <Link
                    href="/response"
                    className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] transition-all text-center shrink-0"
                  >
                    View in Response Center
                  </Link>
                </div>
              </div>

              {/* Console Gateway Callout */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-[#0B132B] text-white gap-4 shadow-md">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Ready to explore the active console?
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Inspect live telemetry, verify media, or run attack simulations.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#0B132B] text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0"
                >
                  <span>Enter Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
