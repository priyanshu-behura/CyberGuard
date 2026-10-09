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
  Sparkles,
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
      accent: "text-[#6366F1]",
    },
    {
      id: "video",
      title: "VIDEO",
      subtitle: "Analyze video authenticity",
      description: "Detect synthetic face swaps, temporal frame flickering, boundary blending anomalies, and audio/video desync.",
      icon: Video,
      href: "/identity/video",
      badge: "Keyframe Inspection",
      accent: "text-[#8B5CF6]",
    },
    {
      id: "audio",
      title: "AUDIO",
      subtitle: "Analyze audio authenticity",
      description: "Evaluate acoustic envelopes, sampling frequencies (22.05kHz vocoders), and synthetic voice clone signatures.",
      icon: Music,
      href: "/identity/audio",
      badge: "Voice Clone Check",
      accent: "text-purple-600",
    },
    {
      id: "identity",
      title: "IDENTITY",
      subtitle: "Verify identity / impersonation",
      description: "Correlate claimed persona, communication urgency, financial solicitations, and linked destination domains.",
      icon: UserCheck,
      href: "#impersonation-section",
      badge: "Social Correlation",
      accent: "text-emerald-600",
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
      <div className="space-y-8 pb-16 select-none max-w-6xl mx-auto">
        
        {/* Hero Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#6366F1] border border-indigo-200 mb-2">
            <Shield className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>IDENTITY & MEDIA INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
            Authenticity, Synthetic Media & Impersonation Defense
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify whether an image, video, audio recording, or identity claim shows signs of manipulation or synthetic generation.
          </p>
        </div>

        {/* 4 Choices Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
              SELECT ANALYSIS VECTOR
            </h2>
            <span className="text-xs font-semibold text-[#6366F1]">4 Active Inspection Engines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {hubOptions.map((opt) => {
              const Icon = opt.icon;
              const isAnchor = opt.href.startsWith("#");

              const CardContent = (
                <div
                  className="group h-full rounded-2xl p-6 border border-slate-200/90 bg-white hover:border-[#6366F1]/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 cursor-pointer shadow-sm"
                  onClick={opt.onClick}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-[#6366F1] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {opt.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs font-mono font-bold tracking-wider text-slate-400">
                        {opt.title}
                      </div>
                      <h3 className="text-base font-bold text-[#0B132B] group-hover:text-[#6366F1] transition-colors">
                        {opt.subtitle}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] group-hover:translate-x-1 transition-transform pt-3 border-t border-slate-100">
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
        <div id="impersonation-section" className="space-y-6 pt-6 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-bold text-[#0B132B]">
                  Digital Impersonation & Social Context Verification
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Correlate claimed persona (University, Executive, Regulatory, Bank) with communication pressure,
                financial requests, and credentials.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 font-semibold">
              Interactive Workflow
            </span>
          </div>

          <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-sm">
            <IdentityForm onSubmit={handleRunImpersonation} isAnalyzing={isAnalyzing} />
          </div>

          {/* Stepped Progress */}
          {isAnalyzing && (
            <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-sm">
              <AnalysisProgress type="identity" currentStepIndex={currentStepIndex} />
            </div>
          )}

          {/* Results Display */}
          {impersonationResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-300 pt-2">
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
