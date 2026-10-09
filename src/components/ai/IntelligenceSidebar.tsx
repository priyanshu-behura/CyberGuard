"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { SecurityIncident } from "@/lib/security/incident-store";
import { AccountSecurityPosture } from "@/lib/security/monitor/types";
import { ResponseMetrics } from "@/lib/security/response/types";

interface IntelligenceSidebarProps {
  incidents: SecurityIncident[];
  posture: AccountSecurityPosture | null;
  responseMetrics: ResponseMetrics | null;
  onSelectIncident: (incidentId: string) => void;
}

export function IntelligenceSidebar({
  incidents,
  posture,
  responseMetrics,
  onSelectIncident,
}: IntelligenceSidebarProps) {
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL").length;
  const highCount = incidents.filter((i) => i.severity === "HIGH").length;

  return (
    <div className="w-full xl:w-80 flex flex-col bg-[#0a0e17] border-l border-white/[0.08] p-4 space-y-5 overflow-y-auto shrink-0 select-none">
      {/* Module Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold font-mono tracking-wider uppercase text-white">
            SOC Live Telemetry
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Real Data
        </span>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Posture Risk
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-cyan-300">
              {posture?.riskScore ?? 10}
            </span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-emerald-400 block">
            {posture?.status ?? "SECURE"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Active Alerts
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white">
              {posture?.activeAlertsCount ?? 0}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Auth Monitor
          </span>
        </div>
      </div>

      {/* Pending Response Approvals Callout */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Response Center</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 font-bold">
            {responseMetrics?.pendingApproval ?? 0} Pending
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Containment actions require human approval before execution.
        </p>

        <Link
          href="/response"
          className="flex items-center justify-between text-xs text-amber-300 hover:text-amber-200 font-semibold pt-1 border-t border-amber-500/20 transition-colors"
        >
          <span>Open Response Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Active Incidents List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Correlated Incidents ({incidents.length})
          </span>
          <Link
            href="/incidents"
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
          >
            <span>All Incidents</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-center text-xs text-slate-500">
            No active incidents in store.
          </div>
        ) : (
          <div className="space-y-1.5">
            {incidents.slice(0, 5).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="p-2.5 rounded-xl bg-black/40 hover:bg-white/[0.04] border border-white/[0.06] hover:border-cyan-500/40 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                    {inc.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold font-mono ${
                      inc.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-medium line-clamp-1 group-hover:text-white">
                  {inc.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Score: {inc.riskScore}/100</span>
                  <span className="text-cyan-400 group-hover:underline">
                    Investigate →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="mt-auto pt-4 border-t border-white/[0.06] text-[10px] text-slate-500 leading-relaxed font-mono">
        <p>
          🔒 Read-only tool access verified. High-impact mitigations strictly
          require human sign-off via Response Center.
        </p>
      </div>
    </div>
  );
}
