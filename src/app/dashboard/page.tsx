"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  TrendingUp,
  Mail,
  AlertTriangle,
  Globe,
  Radio,
  FileText,
  Activity,
  ArrowRight,
  Shield,
  ScanFace,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { incidentStore, SecurityIncident, SecurityMetrics } from "@/lib/security/incident-store";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { AccountSecurityPosture } from "@/lib/security/monitor/types";

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
  const [monitorPosture, setMonitorPosture] = useState<AccountSecurityPosture | null>(null);

  useEffect(() => {
    setMetrics(incidentStore.getMetrics());
    setIncidents(incidentStore.getIncidents());
    setMonitorPosture(monitorStore.getPosture());
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 pb-12 select-none">
        
        {/* Header matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor, analyze and respond to security events in real time.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
            <span>Oct 26, 2025 14:32</span>
          </div>
        </div>

        {/* 4 Metric Cards matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Events */}
          <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <span className="text-xs text-slate-500 font-medium block">
              Total Events
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#0B132B] tracking-tight font-sans">
                {247 + metrics.totalAnalyzed}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+ 12%</span>
              </span>
            </div>
          </div>

          {/* Card 2: High Risk */}
          <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium block">
                High Risk
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#0B132B] tracking-tight font-sans">
                {8 + metrics.highRiskAlerts}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-500">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+ 5%</span>
              </span>
            </div>
          </div>

          {/* Card 3: Medium Risk */}
          <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium block">
                Medium Risk
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#0B132B] tracking-tight font-sans">
                23
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                <span>+ 0%</span>
              </span>
            </div>
          </div>

          {/* Card 4: Low Risk */}
          <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium block">
                Low Risk
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[#0B132B] tracking-tight font-sans">
                42
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+ 12%</span>
              </span>
            </div>
          </div>

        </div>

        {/* Middle Section: Security Overview & Recent Events matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Middle Left: Security Overview with 3D Globe */}
          <div className="lg:col-span-7 rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <h2 className="text-sm font-bold text-[#0B132B] mb-4">
              Security Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Globe Visual matching Image 2 */}
              <div className="sm:col-span-6 flex justify-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                  <img
                    src="/dashboard-globe-clean.png"
                    alt="Security Overview Holographic Globe"
                    className="w-full h-full object-contain select-none drop-shadow-md"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Threat Breakdown List matching Image 2 */}
              <div className="sm:col-span-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <span className="text-slate-600 font-medium">Phishing & Email</span>
                  </div>
                  <span className="font-bold text-[#0B132B]">88</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
                    <span className="text-slate-600 font-medium">Malware</span>
                  </div>
                  <span className="font-bold text-[#0B132B]">42</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-slate-600 font-medium">Login Anomalies</span>
                  </div>
                  <span className="font-bold text-[#0B132B]">37</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-slate-600 font-medium">Data Exfiltration</span>
                  </div>
                  <span className="font-bold text-[#0B132B]">18</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-slate-600 font-medium">Other</span>
                  </div>
                  <span className="font-bold text-[#0B132B]">12</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Telemetry Feed: 4 Sources Active</span>
              <span className="text-[#6366F1] font-semibold">Continuous Multi-Vector Fusion</span>
            </div>
          </div>

          {/* Middle Right: Recent Events matching Image 2 */}
          <div className="lg:col-span-5 rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0B132B]">
                Recent Events
              </h2>
              <Link
                href="/incidents"
                className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3.5">
              
              {/* Event 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B132B]">
                      Suspicious email detected
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Phishing
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">2m ago</span>
              </div>

              {/* Event 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B132B]">
                      Unusual login activity
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Account Takeover
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">12m ago</span>
              </div>

              {/* Event 3 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B132B]">
                      Malicious URL detected
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Malware
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">46m ago</span>
              </div>

              {/* Event 4 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#6366F1]">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B132B]">
                      Deepfake content identified
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Deepfake
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">1h ago</span>
              </div>

              {/* Event 5 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B132B]">
                      Policy violation
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Other
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">2h ago</span>
              </div>

            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Automated ingestion active • 0 dropped packets
            </div>
          </div>

        </div>

        {/* Bottom Section: Attack Chain Progress & System Health matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Attack Chain Progress Stepper */}
          <div className="lg:col-span-7 rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            <h2 className="text-sm font-bold text-[#0B132B]">
              Attack Chain Progress
            </h2>

            {/* Stepper nodes matching Image 2 */}
            <div className="flex items-center justify-between max-w-xl mx-auto py-2">
              
              {/* Step 1: Initial Signal */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-[#6366F1] flex items-center justify-center shadow-sm">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#0B132B]">Initial Signal</span>
              </div>

              {/* Connecting Line */}
              <div className="flex-1 h-[2px] bg-indigo-100 mx-2 -translate-y-3" />

              {/* Step 2: Correlation */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-[#6366F1] flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#0B132B]">Correlation</span>
              </div>

              {/* Connecting Line */}
              <div className="flex-1 h-[2px] bg-indigo-100 mx-2 -translate-y-3" />

              {/* Step 3: Risk Assessment */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-[#6366F1] flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#0B132B]">Risk Assessment</span>
              </div>

              {/* Connecting Line */}
              <div className="flex-1 h-[2px] bg-indigo-100 mx-2 -translate-y-3" />

              {/* Step 4: Response */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-[#6366F1] flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#0B132B] block">Response</span>
                  <span className="text-[10px] text-slate-400 block">(Quick response)</span>
                </div>
              </div>

            </div>
          </div>

          {/* System Health with Circular Gauge */}
          <div className="lg:col-span-5 rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h2 className="text-sm font-bold text-[#0B132B]">
              System Health
            </h2>

            <div className="flex items-center gap-6 py-1">
              {/* Circular Gauge matching Image 2 */}
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#6366F1]"
                    strokeDasharray="98, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-[#0B132B]">98%</span>
                </div>
              </div>

              {/* Subsystems List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[#0B132B] font-semibold">All Systems Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">AI Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Data Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Response Center</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Existing Modules Quick Action Grid */}
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/analyze"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-[#6366F1]/50 shadow-sm flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#6366F1]" />
                <span className="text-xs font-semibold text-[#0B132B]">Threat Analysis</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/identity"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-[#6366F1]/50 shadow-sm flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ScanFace className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-semibold text-[#0B132B]">Identity & Media</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/monitor"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-[#6366F1]/50 shadow-sm flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-[#0B132B]">Threat Monitor</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/response"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-[#6366F1]/50 shadow-sm flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-[#0B132B]">Response Center</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
