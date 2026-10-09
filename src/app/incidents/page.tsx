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
      <div className="space-y-6 pb-16 select-none max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>INCIDENT TRIAGE QUEUE</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
              Incident Management & Threat Containment
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated high-risk alert registry and containment workflows.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-500 font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Filter:</span>
            </span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterSeverity(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterSeverity === lvl
                    ? "bg-[#6366F1] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500">
            {filtered.length} Incident{filtered.length === 1 ? "" : "s"} Tracked
          </div>
        </div>

        {/* Incident List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border border-slate-200/90 bg-white space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#0B132B]">No Active High-Risk Incidents</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When an image, video, audio, or digital impersonation analysis scores ≥ 70 Risk, CYBERGUARD automatically dispatches an incident record here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/identity"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B132B] text-xs font-semibold transition-colors"
              >
                Test Media Verification in Identity Module
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((inc) => (
              <div
                key={inc.id}
                className="rounded-2xl p-6 border border-slate-200/90 hover:border-[#6366F1]/40 bg-white transition-all space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-rose-600 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                      {inc.id}
                    </span>
                    <h3 className="text-base font-bold text-[#0B132B] tracking-tight">
                      {inc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                        inc.severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {inc.severity} RISK ({inc.riskScore}/100)
                    </span>
                    <span className="text-xs font-mono text-slate-400">{inc.source}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
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
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono truncate"
                        >
                          • {snip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playbook Recommendation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-600">
                    <span className="text-[#6366F1] font-semibold">Containment Action: </span>
                    <span>{inc.recommendedPlaybook}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      Stage: {inc.attackChainStage}
                    </span>
                    <Link
                      href={`/response?incidentId=${encodeURIComponent(inc.id)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Execute Response</span>
                    </Link>
                    <Link
                      href="/attack-chains"
                      className="inline-flex items-center gap-1 text-[#6366F1] hover:text-[#4F46E5] font-semibold ml-1 text-xs"
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
