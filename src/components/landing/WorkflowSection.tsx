import React from "react";
import {
  Radar,
  Tag,
  Gauge,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const workflowSteps = [
  {
    step: "01",
    label: "DETECT",
    icon: Radar,
    title: "Continuous Ingestion",
    description:
      "Captures suspicious messages, links, media, account logins, and API triggers across communication and auth channels.",
    accent: "border-cyan-500/40 text-cyan-400 bg-cyan-950/40",
  },
  {
    step: "02",
    label: "CLASSIFY",
    icon: Tag,
    title: "Vector Identification",
    description:
      "Categorizes threats into exact taxonomy—from synthetic voice cloning to brand impersonation and token exfiltration.",
    accent: "border-sky-500/40 text-sky-400 bg-sky-950/40",
  },
  {
    step: "03",
    label: "ASSESS RISK",
    icon: Gauge,
    title: "Calibrated Risk Scoring",
    description:
      "Computes a transparent 0-100 severity index factoring exploit likelihood, attacker profile, and blast radius.",
    accent: "border-blue-500/40 text-blue-400 bg-blue-950/40",
  },
  {
    step: "04",
    label: "EXPLAIN",
    icon: HelpCircle,
    title: "Explainable Evidence",
    description:
      "Reveals the exact 'why' behind the score: highlighted language cues, synthetic artifacts, or mismatched DNS records.",
    accent: "border-indigo-500/40 text-indigo-400 bg-indigo-950/40",
  },
  {
    step: "05",
    label: "RESPOND",
    icon: ShieldAlert,
    title: "Guided Remediation",
    description:
      "Delivers tailored, prioritized next steps—from isolating a session to taking down a clone domain with one click.",
    accent: "border-cyan-400 text-cyan-300 bg-cyan-900/40",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 relative border-t border-white/[0.06] bg-[#07090e] cyber-grid-lines"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="blue">SYSTEM ARCHITECTURE WORKFLOW</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How CYBERGUARD Works
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            From raw indicator detection to transparent explanations and guided
            remediation: a 5-stage defensive loop built for clarity.
          </p>
        </div>

        {/* 5-Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative glass-panel rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between group hover:border-cyan-500/30 transition-colors"
              >
                {/* Step Index & Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-mono font-bold text-slate-600 group-hover:text-cyan-400/80 transition-colors">
                      {step.step}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold border uppercase bg-slate-900/80 border-slate-700 text-slate-300">
                      {step.label}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${step.accent}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Subtle connection marker on desktop */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ArrowRight className="w-5 h-5 text-cyan-500/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
