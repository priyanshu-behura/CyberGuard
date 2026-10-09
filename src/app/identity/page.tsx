"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  Image as ImageIcon,
  Video,
  Music,
  UserCheck,
  ArrowRight,
  Shield,
  ShieldAlert,
  Sparkles,
  Activity,
  Layers,
  History,
} from "lucide-react";
import { IdentityForm, IdentityFormData } from "@/components/identity/IdentityForm";
import { RiskAssessment } from "@/components/identity/RiskAssessment";
import { ManipulationIndicators } from "@/components/identity/ManipulationIndicators";
import { EvidenceCard } from "@/components/identity/EvidenceCard";
import { RecommendationCard } from "@/components/identity/RecommendationCard";
import { AnalysisSourceBadge } from "@/components/identity/AnalysisSourceBadge";
import { AnalysisProgress } from "@/components/identity/AnalysisProgress";
import { PrivacyNotice } from "@/components/identity/PrivacyNotice";
import { UnifiedMediaAnalysisResult } from "@/lib/security/identity-media/types";
import { incidentStore } from "@/lib/security/incident-store";

export default function IdentityHubPage() {
  const [activeTab, setActiveTab] = useState<"hub" | "impersonation">("hub");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [impersonationResult, setImpersonationResult] = useState<UnifiedMediaAnalysisResult | null>(null);

  const hubOptions = [
    {
      id: "image",
      title: "IMAGE",
      subtitle: "Analyze image authenticity",
      description: "Inspect JPEG, PNG & WebP files for EXIF provenance, editing software signatures, and AI generation parameters.",
      icon: ImageIcon,
      href: "/identity/image",
      badge: "EXIF & Artifact Forensics",
      color: "from-cyan-950/40 via-slate-900/90 to-slate-900",
      accent: "text-cyan-400",
      border: "border-cyan-500/30 hover:border-cyan-400",
    },
    {
      id: "video",
      title: "VIDEO",
      subtitle: "Analyze video authenticity",
      description: "Detect synthetic face swaps, temporal frame flickering, boundary blending anomalies, and audio/video desync.",
      icon: Video,
      href: "/identity/video",
      badge: "Temporal Keyframe Inspection",
      color: "from-blue-950/40 via-slate-900/90 to-slate-900",
      accent: "text-blue-400",
      border: "border-blue-500/30 hover:border-blue-400",
    },
    {
      id: "audio",
      title: "AUDIO",
      subtitle: "Analyze audio authenticity",
      description: "Evaluate acoustic envelopes, sampling frequencies (22.05kHz vocoders), and synthetic voice clone signatures.",
      icon: Music,
      href: "/identity/audio",
      badge: "Spectral & Voice Clone Check",
      color: "from-violet-950/40 via-slate-900/90 to-slate-900",
      accent: "text-violet-400",
      border: "border-violet-500/30 hover:border-violet-400",
    },
    {
      id: "identity",
      title: "IDENTITY",
      subtitle: "Verify identity / impersonation",
      description: "Correlate claimed persona, communication urgency, financial solicitations, and linked destination domains.",
      icon: UserCheck,
      href: "#impersonation-section",
      badge: "Multi-Vector Social Correlation",
      color: "from-emerald-950/40 via-slate-900/90 to-slate-900",
      accent: "text-emerald-400",
      border: "border-emerald-500/30 hover:border-emerald-400",
      onClick: () => {
        setActiveTab("impersonation");
        const el = document.getElementById("impersonation-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
  ];

  const handleRunImpersonation = async (data: IdentityFormData) => {
    setIsAnalyzing(true);
    setImpersonationResult(null);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      const res = await fetch("/api/analyze/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Server analysis failed");
      }

      const result: UnifiedMediaAnalysisResult = await res.json();
      incidentStore.registerAnalysis(result);
      setImpersonationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-10 pb-16">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>IDENTITY & MEDIA INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Authenticity, Synthetic Media & Impersonation Defense
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Verify whether an image, video, audio recording, or identity claim shows signs of manipulation,
              impersonation, or synthetic generation using deterministic binary forensics and contextual correlation.
            </p>
          </div>
        </div>

        {/* 4 Choices Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
              SELECT ANALYSIS VECTOR
            </h2>
            <span className="text-xs font-mono text-cyan-400">4 Active Inspection Engines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {hubOptions.map((opt) => {
              const Icon = opt.icon;
              const isAnchor = opt.href.startsWith("#");

              const CardContent = (
                <div
                  className={`group h-full glass-panel rounded-2xl p-6 border ${opt.border} bg-gradient-to-br ${opt.color} hover:shadow-xl hover:shadow-cyan-950/40 transition-all flex flex-col justify-between space-y-6 cursor-pointer`}
                  onClick={opt.onClick}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-slate-900/80 border border-white/[0.08] ${opt.accent} flex items-center justify-center group-hover:scale-105 transition-transform shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {opt.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs font-mono font-bold tracking-wider text-slate-400">
                        {opt.title}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {opt.subtitle}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform pt-3 border-t border-white/[0.06]">
                    <span>Begin Inspection</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );

              return isAnchor ? (
                <div key={opt.id}>{CardContent}</div>
              ) : (
                <Link key={opt.id} href={opt.href}>
                  {CardContent}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Impersonation Workflow Section */}
        <div id="impersonation-section" className="space-y-6 pt-6 border-t border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Digital Impersonation & Social Context Verification
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Correlate claimed persona (University, Executive, Regulatory, Bank) with communication pressure,
                financial requests, and credentials.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30">
              Interactive Workflow
            </span>
          </div>

          <IdentityForm onSubmit={handleRunImpersonation} isAnalyzing={isAnalyzing} />

          {/* Stepped Progress */}
          {isAnalyzing && (
            <AnalysisProgress type="identity" currentStepIndex={currentStepIndex} />
          )}

          {/* Results Display */}
          {impersonationResult && !isAnalyzing && (
            <div className="space-y-8 animate-fadeIn pt-4">
              <RiskAssessment result={impersonationResult} />
              <ManipulationIndicators indicators={impersonationResult.indicators} />
              <EvidenceCard
                evidence={impersonationResult.evidence}
                metadata={impersonationResult.metadata}
                type="identity"
              />
              <RecommendationCard
                recommendations={impersonationResult.recommendedActions}
                riskLevel={impersonationResult.riskLevel}
              />
              <AnalysisSourceBadge
                sources={impersonationResult.analysisSources}
                modelResults={impersonationResult.modelResults}
              />
            </div>
          )}
        </div>

        {/* Global Privacy Notice */}
        <PrivacyNotice />
      </div>
    </AppShell>
  );
}
