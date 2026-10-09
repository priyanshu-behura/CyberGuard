"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { MonitorSubnav } from "@/components/monitor/MonitorSubnav";
import { EventTelemetryTable } from "@/components/monitor/EventTelemetryTable";
import { CustomEventInjector } from "@/components/monitor/CustomEventInjector";
import {
  KeyRound,
  ShieldAlert,
  Users,
  AlertTriangle,
  RotateCcw,
  Layers,
  Filter,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import {
  AuthenticationEvent,
  MonitorAlert,
} from "@/lib/security/monitor/types";

export default function LoginEventAnalysisPage() {
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/monitor/events");
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data.events);
        setAlerts(json.data.alerts);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const failedEvents = events.filter((e) => !e.success);
  const sprayingAlerts = alerts.filter((a) => a.category === "PASSWORD_SPRAYING");
  const bruteForceAlerts = alerts.filter((a) => a.category === "FAILED_LOGIN");

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Navigation */}
        <MonitorSubnav />

        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-cyan-400">
              <span>Authentication Telemetry Ingestion</span>
              <span>•</span>
              <span>RFC-8414 & W3C WebAuthn Compatible</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Authentication Event Surveillance
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-normal">
              Structured inspection of sign-in sequences, credential failure frequencies,
              password spraying signatures, and MFA challenge results.
            </p>
          </div>
        </div>

        {/* Pattern Detection Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl glass-panel p-4 border border-white/[0.08] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Failed Attempts
            </span>
            <div className="text-2xl font-bold font-mono text-orange-400">
              {failedEvents.length}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {failedEvents.length === 0
                ? "Clean credential velocity"
                : `${failedEvents.length} authentication failure(s) recorded`}
            </span>
          </div>

          <div
            className={`rounded-2xl p-4 border transition-all ${
              bruteForceAlerts.length > 0
                ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
                : "glass-panel border-white/[0.08]"
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Brute Force Detections
            </span>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {bruteForceAlerts.length}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Repeated failures on single target
            </span>
          </div>

          <div
            className={`rounded-2xl p-4 border transition-all ${
              sprayingAlerts.length > 0
                ? "bg-purple-950/20 border-purple-500/40 text-purple-300"
                : "glass-panel border-white/[0.08]"
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Password Spraying Alerts
            </span>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {sprayingAlerts.length}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Same source hitting multiple accounts
            </span>
          </div>
        </div>

        {/* Custom Event Crafter / Ingestion Form */}
        <CustomEventInjector onEventIngested={fetchData} />

        {/* Events Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Raw Authentication Event Log ({events.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Click any row to open forensic payload inspector
            </span>
          </div>

          <EventTelemetryTable events={events} />
        </div>
      </div>
    </AppShell>
  );
}
