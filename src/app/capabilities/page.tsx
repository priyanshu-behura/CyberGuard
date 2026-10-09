import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Badge } from "@/components/ui/Badge";
import {
  FileSearch,
  ScanFace,
  Activity,
  Lightbulb,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function CapabilitiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="cyan">PLATFORM CAPABILITIES</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Modular Threat Intelligence Built for Accuracy
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Explore the five integrated capability modules powering CYBERGUARD.
              Engineered to detect advanced deception techniques and explain threat
              anatomy clearly.
            </p>
          </div>
        </div>

        {/* Capabilities Section */}
        <CapabilitiesSection />

        {/* Detailed Breakdown Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-2xl p-8 border border-white/[0.08] space-y-8">
            <div className="border-b border-white/[0.08] pb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Capabilities Architecture Matrix
              </h2>
              <p className="text-sm text-slate-300">
                How each CYBERGUARD capability addresses distinct layers of the
                modern cyber threat spectrum:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <FileSearch className="w-4 h-4" />
                  <span>1. Content & Domain Defense</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Focuses on URL obfuscation, homograph attacks, brand spoofing,
                  urgent language triggers, and weaponized payload delivery.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                  <ScanFace className="w-4 h-4" />
                  <span>2. Synthetic Media & Biometrics</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identifies voice cloning artifacts, video manipulation seams,
                  and fake authority avatars during sensitive interactions.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <Activity className="w-4 h-4" />
                  <span>3. Identity & Session Continuity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monitors session integrity, simultaneous geographic logins, and
                  sudden privileged API activity deviations.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Lightbulb className="w-4 h-4" />
                  <span>4. Transparent Risk Scoring & Action</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transforms black-box threat scores into actionable explanations
                  paired with guided remediation playbooks.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
