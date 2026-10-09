"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
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
    <div className="w-full xl:w-80 flex flex-col bg-[#0a0e17] border-l border-white/[0.08] p-4 space-y-5 overflow-y-auto shrink-0">
      {/* Module Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold font-mono tracking-wider uppercase text-white">
            Live Threat Posture
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Telemetry Active
        </span>
      </div>

      {/* Account Security Posture Card */}
      {posture && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Account Posture</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                posture.takeoverSuspected || posture.riskLevel === "CRITICAL"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : posture.riskLevel === "HIGH"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {posture.status}
            </span>
          </div>

          <div className="text-xl font-bold font-mono text-white flex items-baseline gap-2">
            <span>{posture.riskScore}</span>
            <span className="text-xs text-slate-500 font-normal">/ 100 Risk</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            {posture.summary}
          </p>

          <Link
            href="/monitor"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <span>Open Monitor Telemetry</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Incident Queue Overview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Active Incidents</span>
          <span className="text-rose-400 font-bold">{criticalCount} Crit / {highCount} High</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.04] text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-400 opacity-60" />
            <span>No unresolved threats</span>
          </div>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900/90 border border-white/[0.06] hover:border-cyan-500/40 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                    {inc.id}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      inc.severity === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>
                <p className="text-xs text-white font-medium line-clamp-1">
                  {inc.title}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>Stage: {inc.attackChainStage}</span>
                  <span className="text-cyan-400 group-hover:underline">Analyze →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Center Link & Stats */}
      {responseMetrics && (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Response Queue</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
              {responseMetrics.pendingApproval} Pending
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            {responseMetrics.pendingApproval > 0
              ? `${responseMetrics.pendingApproval} high-impact containment action(s) require human authorization.`
              : "Mitigation queue is synchronized with current incident triage."}
          </p>

          <Link
            href="/response"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-300 hover:text-white font-bold"
          >
            <span>Go to Response Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
