"use client";

import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  ShieldCheck,
  AlertOctagon,
  Globe2,
  Laptop,
  Users,
  ShieldAlert,
  Loader2,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";
import { DemoScenarioId } from "@/lib/security/monitor/types";

interface DemoScenarioRunnerProps {
  onScenarioExecuted: () => void;
  onCleared: () => void;
}

export function DemoScenarioRunner({
  onScenarioExecuted,
  onCleared,
}: DemoScenarioRunnerProps) {
  const [runningScenario, setRunningScenario] = useState<DemoScenarioId | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [lastExecuted, setLastExecuted] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const scenarios: {
    id: DemoScenarioId;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  }[] = [
    {
      id: "normal_login",
      title: "Normal Login",
      subtitle: "Trusted MacBook Pro in Bhubaneswar (routine hours)",
      icon: ShieldCheck,
      badge: "Baseline Test",
      color: "hover:border-emerald-500/40 hover:bg-emerald-950/20 text-emerald-400",
    },
    {
      id: "failed_logins",
      title: "Repeated Failures",
      subtitle: "5 rapid password failures on analyst account",
      icon: ShieldAlert,
      badge: "Brute Force",
      color: "hover:border-orange-500/40 hover:bg-orange-950/20 text-orange-400",
    },
    {
      id: "password_spraying",
      title: "Password Spraying",
      subtitle: "Single foreign IP cycling through 4 distinct corporate accounts",
      icon: Users,
      badge: "Multi-Account",
      color: "hover:border-purple-500/40 hover:bg-purple-950/20 text-purple-400",
    },
    {
      id: "new_device_location",
      title: "New Device + Geo",
      subtitle: "First-time Windows PC sign-in from Frankfurt, Germany",
      icon: Laptop,
      badge: "Hardware & Geo",
      color: "hover:border-amber-500/40 hover:bg-amber-950/20 text-amber-400",
    },
    {
      id: "account_takeover",
      title: "Account Takeover",
      subtitle: "Failures → Success → Foreign device (Lagos) → Sensitive token access",
      icon: AlertOctagon,
      badge: "Full Attack Chain",
      color: "hover:border-rose-500/40 hover:bg-rose-950/20 text-rose-400",
    },
    {
      id: "suspicious_session_jump",
      title: "Impossible Travel",
      subtitle: "Bhubaneswar (10:00) → London (10:25) timeline conflict",
      icon: Globe2,
      badge: "Velocity Anomaly",
      color: "hover:border-cyan-500/40 hover:bg-cyan-950/20 text-cyan-400",
    },
  ];

  const handleRunScenario = async (scenarioId: DemoScenarioId) => {
    try {
      setRunningScenario(scenarioId);
      const res = await fetch("/api/monitor/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (data.success && data.data?.scenario) {
        setLastExecuted({
          title: data.data.scenario.title,
          description: data.data.scenario.description,
        });
        onScenarioExecuted();
      }
    } catch (err) {
      console.error("Failed to run scenario:", err);
    } finally {
      setRunningScenario(null);
    }
  };

  const handleClear = async () => {
    try {
      setIsClearing(true);
      const res = await fetch("/api/monitor/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      const data = await res.json();
      if (data.success) {
        setLastExecuted(null);
        onCleared();
      }
    } catch (err) {
      console.error("Failed to clear telemetry:", err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-4">
      {/* Header with explicit Simulated Data tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Security Scenario Simulation Lab
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                DEMO / SIMULATED DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inject multi-vector synthetic telemetry into the live detection and correlation engine.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={isClearing || runningScenario !== null}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-white/[0.08] transition-all disabled:opacity-50"
          title="Reset telemetry store and active alerts"
        >
          {isClearing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          <span>Reset Telemetry</span>
        </button>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrent = runningScenario === sc.id;

          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleRunScenario(sc.id)}
              disabled={runningScenario !== null || isClearing}
              className={`text-left p-3.5 rounded-xl border border-white/[0.06] bg-slate-900/60 transition-all flex flex-col justify-between space-y-2 group disabled:opacity-50 ${sc.color}`}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    {isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sc.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {sc.subtitle}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors pt-1">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Inject Telemetry Event</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Last Executed Notification */}
      {lastExecuted && (
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{lastExecuted.title}:</span>{" "}
            <span className="text-slate-300">{lastExecuted.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
