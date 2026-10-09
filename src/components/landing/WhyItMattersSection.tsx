import React from "react";
import { AlertTriangle, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const blendedThreatItems = [
  "Social Engineering across collaborative tools",
  "Digital Impersonation using forged sender credentials",
  "Obfuscated Links routing through transient domains",
  "Synthetic Media & Voice Deepfakes in real-time calls",
  "Automated Credential Stuffing & Token Theft",
  "Abnormal Account Activity bypassing static MFA",
];

export function WhyItMattersSection() {
  return (
    <section className="py-20 lg:py-28 relative border-t border-white/[0.06] bg-[#07090e] cyber-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Core Message */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="rose">THE EVOLVING ATTACK REALITY</Badge>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Why Traditional Security Alone Is No Longer Enough
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Cyber threats are no longer limited to obvious malware or misspelled
              phishing emails. Modern threat actors orchestrate multi-vector,
              blended attacks that easily bypass isolated, legacy security tools.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              When an attack combines synthetic voice cloning with lookalike
              domains and hijacked sessions, inspecting any single vector in
              isolation leads to false confidence. CYBERGUARD brings these signals
              together into a single coherent threat story.
            </p>

            <div className="pt-2">
              <Link
                href="/security"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Read our comprehensive security framework</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Comparison Card (Fragmented Alerts vs Unified Intelligence) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Old Reality Card */}
            <div className="glass-panel rounded-2xl p-6 border border-rose-500/20 bg-rose-950/10">
              <div className="flex items-center gap-2.5 mb-3 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-semibold text-white text-base">
                  The Fragmented Reality: Disconnected Alarms
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Users receive dozens of disjointed alerts across email scanners,
                browser warnings, and authentication logs without understanding if
                they represent a coordinated attack.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                {blendedThreatItems.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CYBERGUARD Unified Intelligence Card */}
            <div className="rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-900/90 shadow-xl shadow-cyan-950/20">
              <div className="flex items-center gap-2.5 mb-3 text-cyan-400">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h3 className="font-semibold text-white text-base">
                  The CYBERGUARD Difference: Contextual Clarity
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                CYBERGUARD correlates signals across content, identity, behavior,
                and network telemetry. You get clear explanations and step-by-step
                guidance on what to do next.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-cyan-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Cross-Vector Synthesis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Plain-Language 'Why'</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Actionable Remediation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>No Alert Fatigue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
