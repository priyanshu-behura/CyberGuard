import React from "react";
import {
  MailWarning,
  Globe2,
  Link2,
  Video,
  UserCheck,
  KeyRound,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const modernThreats = [
  {
    icon: MailWarning,
    title: "Phishing Messages",
    description:
      "Deceptive social engineering crafted across emails, direct messages, and chat apps.",
    tag: "Social Vector",
  },
  {
    icon: Globe2,
    title: "Fake Websites",
    description:
      "Lookalike typo-squatted portals mimicking trusted banking and cloud services.",
    tag: "Domain Spoofing",
  },
  {
    icon: Link2,
    title: "Suspicious Links",
    description:
      "Obfuscated redirect chains designed to bypass conventional domain blocklists.",
    tag: "Payload Vectors",
  },
  {
    icon: Video,
    title: "Deepfakes & Synthetic Media",
    description:
      "AI-generated synthetic voice and video clones used in social engineering.",
    tag: "Generative AI",
  },
  {
    icon: UserCheck,
    title: "Digital Impersonation",
    description:
      "Synthetic executive, colleague, or authority personas requesting urgent actions.",
    tag: "Identity Theft",
  },
  {
    icon: KeyRound,
    title: "Account Takeover",
    description:
      "Session hijacking, credential stuffing, and unauthorized multi-factor bypasses.",
    tag: "Access Threat",
  },
  {
    icon: Zap,
    title: "Abnormal Activity",
    description:
      "Anomalous geographic logins, atypical API request volumes, and token misuse.",
    tag: "Behavioral Drift",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-28 relative border-t border-white/[0.06] bg-[#070b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cyan">MODERN ATTACK VECTORS</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security That Understands More Than Just Alerts.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Legacy tools bombard users with isolated warnings without context.
            CYBERGUARD connects disparate signals across modern vectors to make
            threats obvious and response straightforward.
          </p>
        </div>

        {/* Modern Threat Vector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modernThreats.map((threat, index) => {
            const Icon = threat.icon;
            return (
              <div
                key={threat.title}
                className="glass-panel-interactive rounded-xl p-5 border border-white/[0.07] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800">
                      {threat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {threat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {threat.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Unified Correlation Highlight Card */}
          <div className="rounded-xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-900/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 px-2 py-0.5 rounded bg-cyan-900/40 border border-cyan-500/30">
                  UNIFIED
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Cross-Vector Correlation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                CYBERGUARD correlates all indicators simultaneously so you see the
                complete attack story instead of fragmented alarms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
