"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Laptop,
} from "lucide-react";
import { MonitorAlert } from "@/lib/security/monitor/types";

interface AlertCardProps {
  alert: MonitorAlert;
  onAcknowledge?: (alertId: string) => void;
}

export function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const [acknowledged, setAcknowledged] = useState(alert.status === "ACKNOWLEDGED");
  const [isPending, setIsPending] = useState(false);

  const getSeverityBadge = () => {
    switch (alert.severity) {
      case "CRITICAL":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-300",
          dot: "bg-rose-500",
        };
      case "HIGH":
        return {
          bg: "bg-orange-500/15 border-orange-500/40 text-orange-300",
          dot: "bg-orange-500",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
          dot: "bg-amber-500",
        };
      case "LOW":
        return {
          bg: "bg-blue-500/15 border-blue-500/40 text-blue-300",
          dot: "bg-blue-400",
        };
      case "SAFE":
      default:
        return {
          bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
          dot: "bg-emerald-400",
        };
    }
  };

  const badge = getSeverityBadge();

  const handleAck = async () => {
    setIsPending(true);
    try {
      await fetch("/api/monitor/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge", alertId: alert.id }),
      });
      setAcknowledged(true);
      if (onAcknowledge) onAcknowledge(alert.id);
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        alert.severity === "CRITICAL"
          ? "border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-900/90 to-slate-900 shadow-lg shadow-rose-950/20"
          : alert.severity === "HIGH"
          ? "border-orange-500/40 bg-gradient-to-br from-orange-950/20 via-slate-900/90 to-slate-900"
          : "border-white/[0.08] bg-slate-900/70"
      }`}
    >
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              alert.severity === "CRITICAL"
                ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                : alert.severity === "HIGH"
                ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                : "bg-amber-500/20 border-amber-500/30 text-amber-400"
            }`}
          >
            {alert.severity === "CRITICAL" ? (
              <AlertOctagon className="w-4 h-4" />
            ) : alert.severity === "HIGH" ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {alert.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${badge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                <span>{alert.severity} ({alert.riskScore}/100)</span>
              </span>

              {alert.isDemo && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  SIMULATED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
              <span>Target: {alert.targetUserEmail}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Escalation link */}
        <div className="flex items-center gap-2">
          {alert.associatedIncidentId && (
            <Link
              href="/incidents"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors"
            >
              <span>Incident {alert.associatedIncidentId}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          {!acknowledged ? (
            <button
              type="button"
              onClick={handleAck}
              disabled={isPending}
              className="px-3 py-1 rounded-lg text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Acknowledge
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acknowledged
            </span>
          )}
        </div>
      </div>

      {/* Explanation (What happened?) */}
      <div className="mt-3.5 space-y-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Analysis & Threat Classification
          </span>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            {alert.explanation}
          </p>
        </div>

        {/* Evidence (Why is it suspicious?) */}
        {alert.evidence.length > 0 && (
          <div className="space-y-1.5 rounded-xl bg-slate-950/60 border border-white/[0.06] p-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
              Forensic Evidence Collected ({alert.evidence.length})
            </span>
            <ul className="space-y-1 mt-1">
              {alert.evidence.map((ev, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-300 font-mono"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Response */}
        {alert.recommendedActions.length > 0 && (
          <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-3">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block tracking-wider font-semibold">
              Recommended Protective Actions
            </span>
            <ul className="space-y-1 mt-1">
              {alert.recommendedActions.map((act, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-cyan-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
