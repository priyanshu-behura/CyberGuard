"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  Search,
  ScanFace,
  Activity,
  ShieldCheck,
  Inbox,
  Sparkles,
  ArrowRight,
  Shield,
  AlertTriangle,
  Radio,
  Cpu,
  UserCheck,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";
import { incidentStore, SecurityIncident, SecurityMetrics } from "@/lib/security/incident-store";
import { UnifiedMediaAnalysisResult } from "@/lib/security/identity-media/types";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { AccountSecurityPosture, MonitorAlert } from "@/lib/security/monitor/types";
import { AccountStatusBadge } from "@/components/monitor/AccountStatusBadge";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAnalyzed: 0,
    mediaAnalyzed: 0,
    potentialDeepfakes: 0,
    impersonationAttempts: 0,
    highRiskAlerts: 0,
    activeIncidentsCount: 0,
  });
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<UnifiedMediaAnalysisResult[]>([]);
  const [monitorPosture, setMonitorPosture] = useState<AccountSecurityPosture | null>(null);
  const [monitorAlerts, setMonitorAlerts] = useState<MonitorAlert[]>([]);

  useEffect(() => {
    setMetrics(incidentStore.getMetrics());
    setIncidents(incidentStore.getIncidents());
    setRecentAnalyses(incidentStore.getAnalyses());
    setMonitorPosture(monitorStore.getPosture());
    setMonitorAlerts(monitorStore.getAlerts());
  }, []);

  return (
    <AppShell>
      <div className="space-y-8 pb-10">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome to CYBERGUARD
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Your security command center for detecting, understanding and responding to cyber threats,
              synthetic deepfakes, and digital impersonation.
            </p>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon (if analyses exist) */}
        {metrics.totalAnalyzed > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 bg-slate-900/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Analyzed</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{metrics.totalAnalyzed}</div>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-rose-500/30 bg-slate-900/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Potential Deepfakes</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{metrics.potentialDeepfakes}</div>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-amber-500/30 bg-slate-900/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Impersonation Alerts</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{metrics.impersonationAttempts}</div>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-orange-500/30 bg-slate-900/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Active Incidents</span>
              <div className="text-2xl font-bold font-mono text-orange-400 mt-1">{metrics.activeIncidentsCount}</div>
            </div>
          </div>
        )}

        {/* Primary Defensive Actions */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Action 1: Analyze a Threat */}
            <Link
              href="/analyze"
              className="group glass-panel rounded-xl p-5 border border-white/[0.08] hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-cyan-950/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Analyze a Threat
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analyze suspicious messages, URLs, websites and files for phishing.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Threat Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Action 2: Verify Identity & Media */}
            <Link
              href="/identity"
              className="group glass-panel rounded-xl p-5 border border-white/[0.08] hover:border-blue-500/40 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-blue-950/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ScanFace className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Identity & Media
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspect images, videos, audio and impersonation claims for deepfakes.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Verify Media</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Action 3: Monitor & Account Security */}
            <Link
              href="/monitor"
              className="group glass-panel rounded-xl p-5 border border-white/[0.08] hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-emerald-950/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Account Security
                  </h2>
                  {monitorPosture && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      {monitorPosture.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Surveillance of login failures, password sprays, and account takeover.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Monitor Posture</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Action 4: Incident Triage */}
            <Link
              href="/incidents"
              className="group glass-panel rounded-xl p-5 border border-white/[0.08] hover:border-violet-500/40 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-violet-950/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-violet-950/70 border border-violet-500/30 text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                  Incident Triage
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review active security alerts, forensic dossiers and containment actions.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-violet-400 group-hover:translate-x-1 transition-transform">
                <span>View Incidents</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Action 5: Response Center */}
            <Link
              href="/response"
              className="group glass-panel rounded-xl p-5 border border-white/[0.08] hover:border-rose-500/40 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-rose-950/30 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-rose-950/70 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  Response Center
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated threat mitigation, containment approvals and simulated response execution.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 group-hover:translate-x-1 transition-transform">
                <span>Mitigate Threats</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Live Account Surveillance Alert Strip (if active monitor alerts exist) */}
        {monitorPosture && monitorAlerts.filter((a) => a.status === "ACTIVE").length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900/80 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">
                    ACCOUNT SURVEILLANCE ALERT:
                  </span>
                  <AccountStatusBadge status={monitorPosture.status} size="sm" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {monitorPosture.summary}
                </p>
              </div>
            </div>
            <Link
              href="/monitor"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <span>Investigate Alert</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Status & Overview Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Security Overview */}
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Security Overview
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  {recentAnalyses.length} events
                </span>
              </div>

              {recentAnalyses.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/[0.06] text-slate-500 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6 text-emerald-400/70" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-200">
                      No security events yet.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      Your analyzed threats and media forensic results will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {recentAnalyses.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white truncate max-w-[140px] font-semibold">
                          {item.filename}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                            item.riskLevel === "CRITICAL" || item.riskLevel === "HIGH"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Status</span>
              <span className="text-emerald-400">Ready</span>
            </div>
          </div>

          {/* Section 2: Recent Incidents */}
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Recent Incidents
                  </h3>
                </div>
                <Link href="/incidents" className="text-[10px] font-mono text-cyan-400 hover:underline">
                  View all
                </Link>
              </div>

              {incidents.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/[0.06] text-slate-500 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6 text-slate-400/70" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-200">
                      No incidents yet.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      High or critical threats identified during media or message analyses will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {incidents.slice(0, 3).map((inc) => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-rose-300 font-bold">{inc.id}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {inc.severity}
                        </span>
                      </div>
                      <div className="font-semibold text-white truncate">{inc.title}</div>
                      <p className="text-[11px] text-slate-400 truncate">{inc.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Incidents</span>
              <span className={incidents.length > 0 ? "text-rose-400 font-bold" : "text-slate-400"}>
                {incidents.length > 0 ? `${incidents.length} active` : "None detected"}
              </span>
            </div>
          </div>

          {/* Section 3: Recommended Actions */}
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Recommended Actions
                  </h3>
                </div>
              </div>

              {incidents.length === 0 && (!monitorPosture || monitorPosture.riskScore < 40) ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/[0.06] text-slate-500 flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-cyan-400/70" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-200">
                      No actions required.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      When CYBERGUARD identifies a threat, recommended security actions will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {monitorPosture && monitorPosture.riskScore >= 40 && (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs space-y-1">
                      <span className="font-semibold text-rose-300 block">Account Defense Protocol:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {monitorPosture.recommendedResponse[0] || "Revoke unrecognized active sessions and require MFA."}
                      </p>
                    </div>
                  )}
                  {incidents.length > 0 && (
                    <>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] text-xs space-y-1">
                        <span className="font-semibold text-cyan-300 block">Out-of-band Verification:</span>
                        <p className="text-slate-300 leading-relaxed">
                          Confirm identities of flagged entities through official pre-verified contact channels.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] text-xs space-y-1">
                        <span className="font-semibold text-amber-300 block">Zero-Trust Holding:</span>
                        <p className="text-slate-300 leading-relaxed">
                          Do not execute financial transfers or provide credentials requested via flagged media.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.06] text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>Status</span>
              <span className={incidents.length > 0 ? "text-amber-400" : "text-slate-400"}>
                {incidents.length > 0 ? "Action Required" : "Standby"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
