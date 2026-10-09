"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-28 lg:py-36 relative border-t border-slate-200/80 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        {/* Shield Icon Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200/90 text-[#4F46E5] shadow-sm">
          <ShieldCheck className="w-7 h-7 text-[#4F46E5]" />
        </div>

        {/* Closing Headline */}
        <div className="space-y-4">
          <h2 className="font-editorial-serif text-4xl sm:text-6xl font-medium text-[#0B132B] tracking-tight leading-[1.05]">
            Make every signal count.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Understand complex attack chains before they manifest. Connect isolated threats,
            review explainable evidence, and respond with calibrated confidence.
          </p>
        </div>

        {/* CTA Buttons matching Image 1 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#1E293B] text-white text-sm font-semibold tracking-wide shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch CYBERGUARD</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-[#0B132B] text-sm font-semibold transition-all"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Sign In to Console</span>
          </Link>
        </div>

        {/* Platform Footnote */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span>• Zero Hallucination SOC Engine</span>
          <span>• Explainable Multi-Source Telemetry</span>
          <span>• Governed Human-in-the-Loop Safeguards</span>
        </div>

      </div>
    </section>
  );
}
