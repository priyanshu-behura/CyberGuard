"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { MonitorSubnav } from "@/components/monitor/MonitorSubnav";
import { DemoScenarioRunner } from "@/components/monitor/DemoScenarioRunner";
import { EventTelemetryTable } from "@/components/monitor/EventTelemetryTable";
import {
  Search,
  Filter,
  Shield,
  Clock,
  ArrowRight,
  GitFork,
  Radio,
  AlertTriangle,
  User,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  AuthenticationEvent,
  MonitorAlert,
  AccountSecurityPosture,
} from "@/lib/security/monitor/types";

interface TimelineEvent {
  id: string;
  title: string;
  timeAgo: string;
  timestamp: string;
  severity: "High" | "Medium" | "Low";
  source: string;
  type: string;
  status: string;
  description: string;
  chainNodes: string[];
}

const DEFAULT_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-01",
    title: "Phishing Email Detected",
    timeAgo: "2 minutes ago",
    timestamp: "Oct 26, 2025 14:30",
    severity: "High",
    source: "user@unknown.com",
    type: "Phishing",
    status: "Open",
    description: "Email contains a malicious link that attempts to steal credentials and bypass MFA.",
    chainNodes: ["Phishing Email", "Malicious URL", "Suspicious Login", "Potential Account Takeover"],
  },
  {
    id: "evt-02",
    title: "Suspicious login attempt",
    timeAgo: "12 minutes ago",
    timestamp: "Oct 26, 2025 14:18",
    severity: "Medium",
    source: "194.26.29.112 (VPN Gateway)",
    type: "Authentication",
    status: "Investigating",
    description: "Anomalous geographic distance: login from Eastern Europe 15m after local office session.",
    chainNodes: ["Suspicious Login", "Potential Account Takeover"],
  },
  {
    id: "evt-03",
    title: "Malicious URL Clicked",
    timeAgo: "48 minutes ago",
    timestamp: "Oct 26, 2025 13:42",
    severity: "Medium",
    source: "Workstation-SOC-04",
    type: "Web Threat",
    status: "Contained",
    description: "Endpoint navigated to typo-squatted SSO phishing landing page auth-login-update.cc.",
    chainNodes: ["Phishing Email", "Malicious URL"],
  },
  {
    id: "evt-04",
    title: "Deepfake Content Found",
    timeAgo: "1 hour ago",
    timestamp: "Oct 26, 2025 13:30",
    severity: "High",
    source: "Executive Voicemail Gateway",
    type: "Synthetic Media",
    status: "Open",
    description: "22.05kHz acoustic sample pitch shift artifact detected in urgent executive wire request.",
    chainNodes: ["Phishing Email", "Data Access", "Potential Account Takeover"],
  },
  {
    id: "evt-05",
    title: "Data Exfiltration Attempt",
    timeAgo: "2 hours ago",
    timestamp: "Oct 26, 2025 12:30",
    severity: "High",
    source: "Cloud Storage Bucket",
    type: "Data Security",
    status: "Blocked",
    description: "Unusual mass egress attempt flagged by behavioral threshold guard.",
    chainNodes: ["Suspicious Login", "Data Access", "Potential Account Takeover"],
  },
  {
    id: "evt-06",
    title: "Policy Violation",
    timeAgo: "5 hours ago",
    timestamp: "Oct 26, 2025 09:30",
    severity: "Low",
    source: "BYOD Device 89",
    type: "Compliance",
    status: "Resolved",
    description: "Outdated browser version connected to internal staging dashboard.",
    chainNodes: ["Suspicious Login"],
  },
];

export default function MonitorOverviewPage() {
  const [posture, setPosture] = useState<AccountSecurityPosture | null>(null);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent>(DEFAULT_TIMELINE_EVENTS[0]);
  const [activeTab, setActiveTab] = useState<"attackChain" | "eventDetails" | "relatedEvents">("attackChain");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/monitor/events");
      const json = await res.json();
      if (json.success && json.data) {
        setPosture(json.data.posture);
        setAlerts(json.data.alerts);
        setEvents(json.data.events);
      }
    } catch (err) {
      console.error("Failed to fetch monitor telemetry:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEvents = DEFAULT_TIMELINE_EVENTS.filter((evt) =>
    evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evt.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evt.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6 pb-12 select-none">
        
        {/* Subnavigation */}
        <MonitorSubnav />

        {/* Header with Search & Filters matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
              Threat Monitor
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track, analyze and investigate security threats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, IPs, domains..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-sm w-64 md:w-72"
              />
            </div>

            {/* Filters Button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0B132B] hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 3-Column Threat Investigation Workspace matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Column 1: Event Timeline matching Image 2 */}
          <div className="lg:col-span-3 rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-xs font-bold text-[#0B132B] uppercase tracking-wider">
                  Event Timeline
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredEvents.length} Events
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {filteredEvents.map((evt) => {
                  const isSelected = selectedEvent.id === evt.id;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-indigo-50/70 border-[#6366F1] shadow-sm"
                          : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              evt.severity === "High"
                                ? "bg-rose-500"
                                : evt.severity === "Medium"
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                            }`}
                          />
                          <h3 className="text-xs font-bold text-[#0B132B] leading-snug">
                            {evt.title}
                          </h3>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {evt.timeAgo} • <span className={`font-semibold ${
                            evt.severity === "High" ? "text-rose-600" : evt.severity === "Medium" ? "text-amber-600" : "text-emerald-600"
                          }`}>{evt.severity}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-1 transition-transform ${isSelected ? "text-[#6366F1] translate-x-0.5" : "text-slate-300"}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono text-center">
              ● Live Telemetry Ingestion Active
            </div>
          </div>

          {/* Column 2: Attack Chain Graph Canvas matching Image 2 */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between space-y-4">
            
            {/* Top Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("attackChain")}
                  className={`pb-1 border-b-2 transition-all ${
                    activeTab === "attackChain"
                      ? "border-[#6366F1] text-[#0B132B] font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Attack Chain
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("eventDetails")}
                  className={`pb-1 border-b-2 transition-all ${
                    activeTab === "eventDetails"
                      ? "border-[#6366F1] text-[#0B132B] font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Event Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("relatedEvents")}
                  className={`pb-1 border-b-2 transition-all ${
                    activeTab === "relatedEvents"
                      ? "border-[#6366F1] text-[#0B132B] font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Related Events
                </button>
              </div>

              <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold">
                CORRELATED GRAPH
              </span>
            </div>

            {/* Attack Chain Dark Node Canvas matching Image 2 */}
            <div className="rounded-xl bg-[#0B0E17] border border-slate-800 p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] text-white">
              {/* Subtle ambient lighting */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#6366F1]/10 blur-3xl pointer-events-none" />

              {/* Node Graph Layout matching Image 2 */}
              <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-6">
                
                {/* Node 1: Root */}
                <div className="p-3 px-5 rounded-full bg-rose-950/60 border border-rose-500/60 text-xs font-semibold text-rose-300 shadow-lg shadow-rose-950/40 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span>Phishing Email</span>
                </div>

                {/* Vertical Connector */}
                <div className="w-[2px] h-6 bg-gradient-to-b from-rose-500/60 to-indigo-500/60" />

                {/* Node 2 */}
                <div className="p-3 px-6 rounded-full bg-[#171B2A] border border-indigo-500/60 text-xs font-semibold text-indigo-300 shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Malicious URL</span>
                </div>

                {/* Branch Connectors */}
                <div className="w-full flex justify-around relative">
                  <div className="w-[2px] h-6 bg-indigo-500/40" />
                  <div className="w-[2px] h-6 bg-indigo-500/40" />
                </div>

                {/* Branch Nodes: Suspicious Login & Data Access */}
                <div className="w-full flex items-center justify-around gap-4">
                  <div className="p-2.5 px-4 rounded-xl bg-[#171B2A] border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Suspicious Login</span>
                  </div>

                  <div className="p-2.5 px-4 rounded-xl bg-[#171B2A] border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>Data Access</span>
                  </div>
                </div>

                {/* Converging Connector */}
                <div className="w-[2px] h-6 bg-rose-500/60" />

                {/* Final Target Node: Potential Account Takeover */}
                <div className="p-3 px-6 rounded-full bg-rose-950/80 border border-rose-500 text-xs font-bold text-rose-300 shadow-lg shadow-rose-950/50 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Potential Account Takeover</span>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
              <span>Selected Attack Vector: {selectedEvent.type}</span>
              <Link href="/attack-chains" className="text-[#6366F1] font-semibold hover:underline flex items-center gap-1">
                <span>Open Full Kill Chain</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Column 3: Event Details matching Image 2 */}
          <div className="lg:col-span-3 rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-xs font-bold text-[#0B132B] uppercase tracking-wider">
                  Event Details
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200">
                  {selectedEvent.severity}
                </span>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0B132B]">
                    {selectedEvent.title}
                  </h3>
                </div>

                {/* Metadata Fields matching Image 2 */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Time</span>
                    <span className="text-[#0B132B] font-mono font-medium">{selectedEvent.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Source</span>
                    <span className="text-[#0B132B] font-mono truncate max-w-[150px]">{selectedEvent.source}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="text-[#0B132B] font-semibold">{selectedEvent.type}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="text-amber-600 font-semibold">{selectedEvent.status}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-xs font-semibold text-slate-500 block">Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/incidents"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B132B] text-xs font-semibold transition-colors shadow-sm"
              >
                <span>View Full Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Decorative Violet Mountain / Horizon Wave matching Image 2 bottom */}
        <div className="relative rounded-2xl overflow-hidden h-28 bg-gradient-to-r from-[#1E1B4B] via-[#4338CA] to-[#6366F1] shadow-lg flex items-center justify-between px-8 text-white">
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-200">
              Correlated Defensive Posture
            </span>
            <h3 className="text-base sm:text-lg font-bold">
              Autonomous Attack Chain Intelligence
            </h3>
            <p className="text-xs text-indigo-100 max-w-xl">
              Signals from identity, endpoints, and communications are unified to block campaigns before impact.
            </p>
          </div>

          <Link
            href="/ai?session=threat"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#0B132B] text-xs font-semibold hover:bg-slate-100 transition-colors shadow-md shrink-0 relative z-10"
          >
            <span>Ask AI Copilot</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6366F1]" />
          </Link>
        </div>

        {/* Retain Demo Scenario Runner & Event Telemetry Table for Full Preservation */}
        <div className="space-y-6 pt-4">
          <DemoScenarioRunner onScenarioExecuted={fetchData} onCleared={fetchData} />
          <EventTelemetryTable events={events} />
        </div>

      </div>
    </AppShell>
  );
}
