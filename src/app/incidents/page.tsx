"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  Inbox,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { incidentStore, SecurityIncident } from "@/lib/security/incident-store";
import { Button } from "@/components/ui/Button";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  useEffect(() => {
    setIncidents(incidentStore.getIncidents());
  }, []);

  const filtered = incidents.filter((inc) => {
    if (filterSeverity === "ALL") return true;
    return inc.severity === filterSeverity;
  });

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-rose-500/10 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>INCIDENT TRIAGE QUEUE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Incident Management & Threat Containment
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Automated high-risk alert registry. Media forensics and digital impersonation
              analyses exceeding High (70+) risk thresholds are escalated here for security containment.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Filter:</span>
            </span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterSeverity(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  filterSeverity === lvl
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-900/60 text-slate-400 border border-white/[0.06] hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400">
            {filtered.length} Incident{filtered.length === 1 ? "" : "s"} Tracked
          </div>
        </div>

        {/* Incident List */}
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/[0.08] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/[0.08] text-slate-500 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-emerald-400/80" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No Active High-Risk Incidents</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When an image, video, audio, or digital impersonation analysis scores ≥ 70 Risk, CYBERGUARD automatically dispatches an incident record here.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/identity">
                <Button variant="outline" size="sm" className="text-xs font-mono">
                  Test Media Verification in Identity Module
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((inc) => (
              <div
                key={inc.id}
                className="glass-panel rounded-xl p-6 border border-white/[0.08] hover:border-cyan-500/40 bg-slate-900/80 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-rose-400 px-2.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40">
                      {inc.id}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {inc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                      }`}
                    >
                      {inc.severity} RISK ({inc.riskScore}/100)
                    </span>
                    <span className="text-xs font-mono text-slate-400">{inc.source}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {inc.summary}
                </p>

                {/* Evidence Snippets */}
                {inc.evidenceSnippets.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                      Correlated Forensic Indicators:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {inc.evidenceSnippets.slice(0, 4).map((snip, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs text-slate-300 font-mono truncate"
                        >
                          • {snip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playbook Recommendation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
                  <div className="text-slate-400">
                    <span className="text-cyan-400 font-semibold">Containment Action: </span>
                    <span>{inc.recommendedPlaybook}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Stage: {inc.attackChainStage}
                    </span>
                    <Link
                      href={`/response?incidentId=${encodeURIComponent(inc.id)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-semibold text-xs transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Execute Response</span>
                    </Link>
                    <Link
                      href="/attack-chains"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold ml-1 text-xs"
                    >
                      <span>Attack Chain</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
