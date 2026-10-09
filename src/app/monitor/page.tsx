"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { MonitorSubnav } from "@/components/monitor/MonitorSubnav";
import { AccountStatusBadge } from "@/components/monitor/AccountStatusBadge";
import { DemoScenarioRunner } from "@/components/monitor/DemoScenarioRunner";
import { AlertCard } from "@/components/monitor/AlertCard";
import { EventTelemetryTable } from "@/components/monitor/EventTelemetryTable";
import {
  Shield,
  Activity,
  AlertTriangle,
  Users,
  Laptop,
  Globe2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Flame,
  CheckCircle2,
  AlertOctagon,
  KeyRound,
  LineChart,
} from "lucide-react";
import {
  AuthenticationEvent,
  MonitorAlert,
  AccountSecurityPosture,
} from "@/lib/security/monitor/types";

export default function MonitorOverviewPage() {
  const [posture, setPosture] = useState<AccountSecurityPosture | null>(null);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/monitor/events");
      const json = await res.json();
      if (json.success && json.data) {
        setPosture(json.data.posture);
        setAlerts(json.data.alerts);
        setEvents(json.data.events);
      }
    } catch (err) {
      console.error("Failed to fetch monitor telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const takeoverAlerts = activeAlerts.filter((a) => a.category === "ACCOUNT_TAKEOVER");
  const failedLogins = events.filter((e) => !e.success);
  const suspiciousSessions = activeAlerts.filter(
    (a) => a.category === "SUSPICIOUS_SESSION" || a.category === "LOCATION_ANOMALY"
  );

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Sub Navigation */}
        <MonitorSubnav />

        {/* Hero & Account Security Posture Overview */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div
            className={`absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all ${
              posture?.status === "COMPROMISED / POSSIBLE TAKEOVER"
                ? "bg-rose-500/15"
                : posture?.status === "HIGH RISK"
                ? "bg-orange-500/15"
                : posture?.status === "AT RISK"
                ? "bg-amber-500/15"
                : "bg-cyan-500/10"
            }`}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Continuous Account Surveillance
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Account Security & Abnormal Behavior
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Continuous telemetry correlation for failed logins, password spraying,
                unusual locations, unknown devices, and account takeover indicators.
              </p>
            </div>

            {/* Posture Status & Risk Badge */}
            {posture && (
              <div className="flex flex-col items-start lg:items-end gap-2.5">
                <AccountStatusBadge status={posture.status} size="lg" />
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Risk Score:</span>
                  <span
                    className={`font-bold ${
                      posture.riskScore >= 70
                        ? "text-rose-400"
                        : posture.riskScore >= 40
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {posture.riskScore} / 100 ({posture.riskLevel})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Core Human Explainability Cards: "What is happening?" & "Do I need to take action?" */}
        {posture && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: What is happening to my account? */}
            <div
              className={`rounded-2xl p-5 border transition-all ${
                posture.takeoverSuspected
                  ? "bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/30"
                  : posture.riskScore >= 40
                  ? "bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-900 border-amber-500/40"
                  : "glass-panel border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06] mb-3">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  What is happening to my account?
                </h2>
              </div>
              <p className="text-sm text-white font-medium leading-relaxed">
                {posture.summary}
              </p>
              <div className="mt-3 text-xs text-slate-400 font-mono">
                {activeAlerts.length > 0 ? (
                  <span>
                    Detected {activeAlerts.length} active security anomaly signal(s) in recent authentication traffic.
                  </span>
                ) : (
                  <span>
                    All recent access events match established behavioral profile and trusted hardware.
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Do I need to take action? */}
            <div
              className={`rounded-2xl p-5 border transition-all ${
                posture.takeoverSuspected
                  ? "bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/30"
                  : posture.riskScore >= 40
                  ? "bg-gradient-to-br from-cyan-950/20 via-slate-900/90 to-slate-900 border-cyan-500/40"
                  : "glass-panel border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06] mb-3">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Do I need to take action?
                </h2>
              </div>

              {posture.status === "SECURE" || posture.status === "MONITORED" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No immediate containment action required.</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    System continues ambient baseline tracking across your trusted devices.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-rose-300 font-semibold">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Defensive action recommended:</span>
                  </div>
                  <ul className="space-y-1.5">
                    {posture.recommendedResponse.map((rec, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-200 flex items-start gap-2 font-mono"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/monitor/account"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Review Active Sessions & Revoke Access</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operational Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Active Alerts
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {activeAlerts.length}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {takeoverAlerts.length > 0 ? `${takeoverAlerts.length} critical ATO` : "No critical ATO"}
            </span>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Failed Logins
            </span>
            <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
              {failedLogins.length}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              in trailing window
            </span>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Suspicious Sessions
            </span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {suspiciousSessions.length}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              unusual geo / devices
            </span>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Recorded Events
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {events.length}
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              live telemetry store
            </span>
          </div>
        </div>

        {/* Demo Simulation Runner Ribbon */}
        <DemoScenarioRunner
          onScenarioExecuted={fetchData}
          onCleared={fetchData}
        />

        {/* Active Security Alerts Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Active Security Alerts & Detections
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activeAlerts.length} active
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="rounded-2xl glass-panel p-8 text-center border border-white/[0.08] space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400/80 mx-auto" />
              <p className="text-sm font-semibold text-white">
                No active security alerts
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No suspicious authentication behavior, password spraying, or account takeover indicators detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alt) => (
                <AlertCard
                  key={alt.id}
                  alert={alt}
                  onAcknowledge={fetchData}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Authentication Events Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Recent Authentication Telemetry
              </h2>
            </div>
            <Link
              href="/monitor/login"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <EventTelemetryTable events={events} maxRows={8} />
        </div>
      </div>
    </AppShell>
  );
}
