"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  GitFork,
  ShieldAlert,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { incidentStore, SecurityIncident } from "@/lib/security/incident-store";
import { Button } from "@/components/ui/Button";

interface AttackChainStage {
  stageNumber: number;
  stageName: string;
  technique: string;
  mitreId: string;
  description: string;
  sourceType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const DEMO_CHAINS = [
  {
    id: "chain-bec-deepfake",
    title: "Executive Impersonation & Synthetic Voice Coercion",
    threatActor: "Advanced BEC Syndicate",
    target: "Corporate Finance / Executive Assistant",
    stages: [
      {
        stageNumber: 1,
        stageName: "Reconnaissance & Spoofed Email",
        technique: "Spearphishing Link & Domain Spoofing",
        mitreId: "T1566.002",
        description: "Adversary sends urgent notification claiming to be Chief Executive Officer.",
        sourceType: "Message Analysis",
        severity: "HIGH" as const,
      },
      {
        stageNumber: 2,
        stageName: "Synthetic Audio Voicemail",
        technique: "Voice Cloning / Synthetic Media",
        mitreId: "T1585.002",
        description: "Accompanied by an AI voice clone recording instructing confidential compliance.",
        sourceType: "Audio Forensics",
        severity: "CRITICAL" as const,
      },
      {
        stageNumber: 3,
        stageName: "Urgent Wire Transfer Demand",
        technique: "Business Email Compromise (BEC)",
        mitreId: "T1534",
        description: "Demands immediate $45,000 disbursement to offshore vendor before close of business.",
        sourceType: "Identity Assessment",
        severity: "CRITICAL" as const,
      },
      {
        stageNumber: 4,
        stageName: "Action Execution / Exfiltration",
        technique: "Financial Loss / Credential Compromise",
        mitreId: "T1048",
        description: "Irrevocable fund transfer or access token theft if not contained.",
        sourceType: "Containment Playbook",
        severity: "HIGH" as const,
      },
    ],
  },
  {
    id: "chain-bput-fee-fraud",
    title: "University Fee Clearance & Credential Harvesting",
    threatActor: "Academic Phishing Campaign",
    target: "Enrolled Students / Faculty",
    stages: [
      {
        stageNumber: 1,
        stageName: "Dean / Controller Impersonation",
        technique: "Academic Authority Pretexting",
        mitreId: "T1566.001",
        description: "Claimed university examination controller imposing a 2-hour debarment deadline.",
        sourceType: "Identity Assessment",
        severity: "HIGH" as const,
      },
      {
        stageNumber: 2,
        stageName: "Malicious Look-alike Domain",
        technique: "Typosquatting & Phishing Gateway",
        mitreId: "T1583.001",
        description: "Destination URL mimics institutional portal with lookalike subdomain.",
        sourceType: "URL Analysis",
        severity: "CRITICAL" as const,
      },
      {
        stageNumber: 3,
        stageName: "Credential & Payment Solicitations",
        technique: "Input Capture / Financial Fraud",
        mitreId: "T1056",
        description: "Victims prompted to input student passwords and net banking details.",
        sourceType: "Response SOC",
        severity: "HIGH" as const,
      },
    ],
  },
];

export default function AttackChainsPage() {
  const [activeChainId, setActiveChainId] = useState(DEMO_CHAINS[0].id);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);

  useEffect(() => {
    setIncidents(incidentStore.getIncidents());
  }, []);

  const selectedChain = DEMO_CHAINS.find((c) => c.id === activeChainId) || DEMO_CHAINS[0];

  return (
    <AppShell>
      <div className="space-y-6 pb-16 select-none max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#6366F1] border border-indigo-200 mb-2">
            <GitFork className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>KILL-CHAIN CORRELATION GRAPH</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
            Multi-Stage Attack Chain Correlation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Correlate isolated security signals across phishing messages, synthetic deepfakes,
            malicious URLs, and digital impersonation into unified adversary kill chains.
          </p>
        </div>

        {/* Live Incident Correlated Nodes (if real incidents exist) */}
        {incidents.length > 0 && (
          <div className="rounded-2xl p-6 border border-rose-200 bg-rose-50/50 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Live Correlated Incident Pipeline ({incidents.length} Events)</span>
              </div>
              <Link href="/incidents" className="text-xs font-semibold text-[#6366F1] hover:underline">
                View incident triage
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-white border border-rose-200/80 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-600">{inc.id}</span>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      Stage: {inc.attackChainStage}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#0B132B] truncate">{inc.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{inc.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Topologies Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
              CORRELATED ATTACK CHAIN SCENARIOS
            </h2>
            <span className="text-xs font-semibold text-[#6366F1]">MITRE ATT&CK Aligned</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setActiveChainId(chain.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  activeChainId === chain.id
                    ? "border-[#6366F1] bg-white shadow-md ring-1 ring-[#6366F1]/30"
                    : "border-slate-200/90 hover:border-slate-300 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#6366F1] font-semibold">
                    Target: {chain.target}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {chain.stages.length} Stages
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0B132B] mt-1">{chain.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Threat Actor: {chain.threatActor}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Chain Stage Progression */}
        <div className="rounded-2xl p-6 sm:p-8 border border-slate-200/90 bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6366F1] font-semibold">
                ACTIVE GRAPH TOPOLOGY
              </span>
              <h3 className="text-lg font-bold text-[#0B132B] tracking-tight mt-0.5">
                {selectedChain.title}
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Adversary Progression Flow (Left → Right)
            </div>
          </div>

          {/* Stepped Kill Chain Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedChain.stages.map((stage, idx) => (
              <div
                key={idx}
                className="relative rounded-xl p-5 border border-slate-200 bg-[#F8F9FC] hover:border-[#6366F1]/50 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-[#6366F1] font-mono text-xs font-bold flex items-center justify-center">
                      {stage.stageNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      {stage.severity}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#0B132B]">{stage.stageName}</h4>
                    <span className="text-[11px] font-mono text-[#6366F1] block mt-0.5 font-semibold">
                      {stage.mitreId} • {stage.technique}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {stage.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Source:</span>
                  <span className="text-[#0B132B] font-semibold">{stage.sourceType}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-700">
            <span>
              CYBERGUARD Automated Correlation: Single-point mitigation breaks attacker chain before fund exfiltration.
            </span>
            <Link
              href="/identity"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm shrink-0 transition-colors"
            >
              Launch Identity Verification
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
