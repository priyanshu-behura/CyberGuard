import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/landing/CTASection";
import { Shield, Target, Users2, Award, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="cyan">ABOUT THE PLATFORM</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Defending the Digital Frontier with Explainable AI
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              CYBERGUARD is an advanced cybersecurity threat detection and
              response architecture developed for the BPUT Hackathon.
            </p>
          </div>
        </div>

        {/* Mission & Problem Statement Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Mission Card */}
            <div className="glass-panel rounded-2xl p-8 border border-white/[0.08] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Cyber attacks have evolved from simple spam emails to sophisticated,
                  AI-accelerated multi-vector operations. Attackers use synthetic
                  voices, cloned portals, and stolen credentials in coordinated
                  campaigns.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  CYBERGUARD bridges the gap between raw threat indicators and
                  practical defense. We empower organizations and everyday users
                  with explainable intelligence: knowing not just that a threat
                  exists, but why it was flagged and what exact response is required.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-cyan-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Explainable AI • Multi-Source Fusion • Guided Defense</span>
              </div>
            </div>

            {/* BPUT Hackathon Context Card */}
            <div className="rounded-2xl p-8 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-900/90 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  BPUT Hackathon Initiative
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Developed specifically for the BPUT Hackathon challenge on
                  AI-Powered Cybersecurity Threat Identification, Verification, and
                  Response.
                </p>
                <div className="space-y-2 text-xs font-mono text-slate-300 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Focus: Phishing, Deepfakes, Impersonation & Account Takeover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Scope: Phase 1 Foundation & UX Architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Next: Phase 2 AI Models & Unified Incident Dashboard</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08] text-xs font-mono text-cyan-300">
                Built with precision, clarity, and enterprise cybersecurity principles.
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
