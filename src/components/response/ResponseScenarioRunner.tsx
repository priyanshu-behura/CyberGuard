"use client";

import React, { useState } from "react";
import { ResponseScenarioId } from "@/lib/security/response/types";
import {
  FlaskConical,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Users,
  ScanFace,
  CheckCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResponseScenarioRunnerProps {
  onInjectScenario: (scenarioId: ResponseScenarioId) => Promise<void>;
  onReset: () => Promise<void>;
  isLoading?: boolean;
}

export function ResponseScenarioRunner({
  onInjectScenario,
  onReset,
  isLoading = false,
}: ResponseScenarioRunnerProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scenarios: {
    id: ResponseScenarioId;
    title: string;
    label: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    borderAccent: string;
  }[] = [
    {
      id: "phishing",
      title: "Credential Phishing Lure",
      label: "Phishing Attack",
      description: "Deceptive domain hosting login path with urgent coercive threat.",
      icon: ShieldAlert,
      badge: "URL & Email",
      borderAccent: "hover:border-orange-500/50",
    },
    {
      id: "account-takeover",
      title: "Account Takeover Chain",
      label: "Full ATO",
      description: "Password failures followed by successful sign-in on foreign host.",
      icon: ShieldAlert,
      badge: "Critical ATO",
      borderAccent: "hover:border-rose-500/50",
    },
    {
      id: "password-spraying",
      title: "Password Spraying Campaign",
      label: "Spraying",
      description: "Hostile IP probing multiple corporate accounts in close succession.",
      icon: Users,
      badge: "Network Vector",
      borderAccent: "hover:border-amber-500/50",
    },
    {
      id: "deepfake-media",
      title: "Synthetic Voice Impersonation",
      label: "Deepfake",
      description: "Executive voice clone voicemail directing emergency funds transfer.",
      icon: ScanFace,
      badge: "Synthetic Media",
      borderAccent: "hover:border-purple-500/50",
    },
    {
      id: "safe-event",
      title: "Normal Legitimate Sign-in",
      label: "Safe Baseline",
      description: "Trusted MacBook Pro in routine hours. Verifies 0 false actions.",
      icon: ShieldCheck,
      badge: "Safe Event",
      borderAccent: "hover:border-emerald-500/50",
    },
  ];

  const handleRun = async (id: ResponseScenarioId) => {
    setActiveScenario(id);
    try {
      await onInjectScenario(id);
    } finally {
      setActiveScenario(null);
    }
  };

  return (
    <div className="rounded-2xl p-5 border border-white/[0.08] bg-[#11131B] space-y-4 shadow-xl">
      {/* Title & Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#171923] border border-[#39DCE5]/30 text-[#39DCE5] flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F5F5FA] tracking-tight">
                Response Playbook Simulation Lab
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3B5]">
              Inject multi-vector synthetic threat telemetry to verify real-time response recommendation and human approval workflows.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isLoading}
          className="text-xs font-mono text-[#9CA3B5] hover:text-white shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset Response Telemetry
        </Button>
      </div>

      {/* Scenario Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrentRunning = activeScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleRun(sc.id)}
              disabled={isLoading}
              className={`p-3 rounded-xl border border-white/[0.06] bg-[#171923]/60 text-left transition-all group flex flex-col justify-between space-y-2 ${sc.borderAccent} hover:bg-[#171923]`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#9CA3B5] px-1.5 py-0.5 rounded bg-white/[0.04]">
                    {sc.badge}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-[#9CA3B5] group-hover:text-[#39DCE5] transition-colors" />
                </div>
                <div className="text-xs font-bold text-[#F5F5FA] group-hover:text-[#39DCE5] transition-colors">
                  {sc.title}
                </div>
                <div className="text-[10px] text-[#9CA3B5] mt-1 line-clamp-2 leading-relaxed">
                  {sc.description}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#39DCE5] pt-1 border-t border-white/[0.04]">
                <Play className="w-3 h-3" />
                <span>{isCurrentRunning ? "Injecting..." : "Simulate"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
