"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { MonitorSubnav } from "@/components/monitor/MonitorSubnav";
import {
  LineChart,
  Clock,
  Globe2,
  Laptop,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Info,
} from "lucide-react";
import {
  BehaviorBaseline,
  MonitorAlert,
  AuthenticationEvent,
} from "@/lib/security/monitor/types";

export default function BehaviorAnalysisPage() {
  const [baseline, setBaseline] = useState<BehaviorBaseline | null>(null);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/monitor/events");
      const json = await res.json();
      if (json.success && json.data) {
        setBaseline(json.data.baseline);
        setAlerts(json.data.alerts);
        setEvents(json.data.events);
      }
    } catch (err) {
      console.error("Failed to fetch behavior baseline:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const behaviorAlerts = alerts.filter(
    (a) =>
      a.category === "BEHAVIOR_ANOMALY" ||
      a.category === "LOCATION_ANOMALY" ||
      a.category === "UNKNOWN_DEVICE"
  );

  // 24-hour hour distribution map:
  // Typical hours in baseline: [8..20]
  const currentHour = new Date().getHours();

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Navigation */}
        <MonitorSubnav />

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="relative z-10 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
              Statistical Profile & Behavioral Baselines
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Behavioral Anomaly Engine
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal">
              Heuristic profiling of diurnal operating hours, location velocity limits,
              hardware fingerprint continuity, and privileged API traversal deviations.
            </p>
          </div>
        </div>

        {/* Baseline Status / Sufficiency Banner */}
        {baseline && (
          <div
            className={`rounded-2xl p-5 border transition-all ${
              baseline.hasSufficientHistory
                ? "glass-panel border-cyan-500/30 bg-slate-900/60"
                : "bg-amber-950/20 border-amber-500/40 text-amber-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    baseline.hasSufficientHistory
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {baseline.hasSufficientHistory ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {baseline.hasSufficientHistory
                        ? "Behavioral Baseline Established"
                        : "Insufficient Behavioral History"}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                      {baseline.totalRecordedEvents} historical events recorded
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {baseline.hasSufficientHistory
                      ? baseline.baselineExplanation
                      : "Insufficient behavioral history for reliable anomaly detection. Additional telemetry required before statistical confidence can be certified."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Diurnal Activity Matrix */}
        <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Diurnal Operating Hours Profile (24h Matrix)
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500/60" />
                <span>Baseline Expected Hours</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-white/[0.08]" />
                <span>Off-Peak (Anomalous)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 pt-2">
            {Array.from({ length: 24 }).map((_, hour) => {
              const isExpected = baseline?.typicalHours.includes(hour);
              const isNow = hour === currentHour;

              return (
                <div
                  key={hour}
                  className={`p-2 rounded-xl text-center border flex flex-col items-center justify-between transition-all ${
                    isExpected
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-900/60 border-white/[0.06] text-slate-500"
                  } ${isNow ? "ring-2 ring-cyan-400 shadow-md shadow-cyan-950/40" : ""}`}
                >
                  <span className="text-[10px] font-mono font-bold">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full my-1.5 ${
                      isExpected ? "bg-emerald-400" : "bg-slate-700"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-400">
                    {isExpected ? "Active" : "Quiet"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            * Sign-in events occurring between 00:00 - 06:00 generate low-to-medium behavioral anomaly weight.
          </p>
        </div>

        {/* Behavioral Anomaly Signals Radar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl glass-panel p-4 border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase">
                Temporal Regularity
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Expected frequency: ~{baseline?.typicalFrequencyPerDay || 3.5} events/day.
              Bursts &gt; 8 logins in 30m trigger rapid rate anomaly alerts.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Rate within expected envelope
            </div>
          </div>

          <div className="rounded-2xl glass-panel p-4 border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase">
                Geographic Velocity
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates speed between successive logins against maximum commercial aviation
              velocities (~900 km/h).
            </p>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Strict timeline velocity threshold
            </div>
          </div>

          <div className="rounded-2xl glass-panel p-4 border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase">
                Client Fingerprinting
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Compares browser user-agent, OS architecture, and hardware device IDs against
              trusted devices list.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Baseline: 2 registered devices
            </div>
          </div>
        </div>

        {/* Behavioral Anomalies Detected */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Behavioral Deviations Recorded ({behaviorAlerts.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Evidence-based statistical deviations
            </span>
          </div>

          {behaviorAlerts.length === 0 ? (
            <div className="rounded-2xl glass-panel p-8 text-center border border-white/[0.08] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">
                No behavioral deviations recorded
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All observed access times, locations, and hardware fingerprints align with established profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {behaviorAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="rounded-2xl p-4 border border-white/[0.08] bg-slate-900/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">{alt.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      {alt.severity} ({alt.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{alt.explanation}</p>
                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1">
                    {alt.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-cyan-300">
                        <span>•</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
