import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { CTASection } from "@/components/landing/CTASection";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, ArrowRight, Eye, Radar, Cpu } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="cyan">ARCHITECTURAL WORKFLOW</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              How CYBERGUARD Identifies & Neutralizes Threats
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              A comprehensive walkthrough of our 5-phase detection lifecycle.
              Understand how data streams are captured, analyzed, and mapped to
              actionable security decisions.
            </p>
          </div>
        </div>

        {/* Workflow Section Component */}
        <WorkflowSection />

        {/* Deep Dive Architecture Details */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Radar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Multi-Vector Telemetry
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aggregates signals from raw emails, web requests, audio files, and
                auth traces without relying on any single failure-prone heuristic.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-blue-950/40 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Explainable Context Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Produces human-auditable reasoning for every risk level, ensuring
                administrators and everyday users understand why action is
                needed.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Prescriptive Remediation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates step-by-step guidance, API revocation hooks, and
                containment steps tailored to the specific nature of the attack.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
