import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/landing/CTASection";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  KeyRound,
  FileCheck2,
  CheckCircle,
} from "lucide-react";

const securityPrinciples = [
  {
    icon: EyeOff,
    title: "Privacy by Design",
    description:
      "Telemetry inputs and analyzed media are processed in memory and never used to train generalized models without explicit customer isolation.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Architecture",
    description:
      "Sensitive tokens, session credentials, and cryptographic secrets are sanitized on the client edge before evaluation.",
  },
  {
    icon: Server,
    title: "Isolated Execution Sandboxes",
    description:
      "Payload and URL inspections take place inside ephemeral micro-virtualized containers to prevent hostile code escape.",
  },
  {
    icon: KeyRound,
    title: "Granular Role-Based Access",
    description:
      "Multi-tenant data boundaries ensure security analysts, auditors, and administrators only access permissible incident scopes.",
  },
  {
    icon: FileCheck2,
    title: "Verifiable Threat Attribution",
    description:
      "Every threat classification is backed by cryptographic evidence logs for forensic audits and legal compliance.",
  },
  {
    icon: ShieldCheck,
    title: "Explainable Defense Guarantees",
    description:
      "No automated decision is applied without human-auditable reasons, ensuring zero opaque disruptions to legitimate business.",
  },
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="cyan">SECURITY & TRUST FRAMEWORK</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Security Built on Privacy, Transparency & Control
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              A security platform must uphold the highest standards of data
              protection. Discover our architectural guardrails, encryption
              standards, and defense principles.
            </p>
          </div>
        </div>

        {/* Security Principles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityPrinciples.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="glass-panel-interactive rounded-2xl p-7 border border-white/[0.08] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Compliance & Engineering Standards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="glass-panel rounded-2xl p-8 border border-white/[0.08]">
            <div className="max-w-3xl mb-8 space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Engineering Integrity & Hackathon Standards
              </h2>
              <p className="text-sm text-slate-300">
                CYBERGUARD was conceived under the BPUT Hackathon guidelines to
                provide reliable, explainable AI cybersecurity that adheres to
                strict responsible AI safety guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-slate-300 space-y-1">
                <span className="text-cyan-400 block font-semibold">
                  ENCRYPTION
                </span>
                <span>TLS 1.3 in Transit • AES-256 at Rest</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-slate-300 space-y-1">
                <span className="text-cyan-400 block font-semibold">
                  PRIVACY
                </span>
                <span>Zero Storage of Raw User Passwords</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-slate-300 space-y-1">
                <span className="text-cyan-400 block font-semibold">
                  AI AUDITABILITY
                </span>
                <span>Full Traceability of Risk Heuristics</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-slate-300 space-y-1">
                <span className="text-cyan-400 block font-semibold">
                  RESILIENCE
                </span>
                <span>Containerized Ephemeral Sandboxes</span>
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
