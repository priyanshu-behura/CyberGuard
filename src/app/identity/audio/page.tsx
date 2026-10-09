"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { ArrowLeft, Music, Shield, RotateCcw } from "lucide-react";
import { MediaUpload } from "@/components/identity/MediaUpload";
import { RiskAssessment } from "@/components/identity/RiskAssessment";
import { ManipulationIndicators } from "@/components/identity/ManipulationIndicators";
import { EvidenceCard } from "@/components/identity/EvidenceCard";
import { RecommendationCard } from "@/components/identity/RecommendationCard";
import { AnalysisSourceBadge } from "@/components/identity/AnalysisSourceBadge";
import { AnalysisProgress } from "@/components/identity/AnalysisProgress";
import { PrivacyNotice } from "@/components/identity/PrivacyNotice";
import { UnifiedMediaAnalysisResult } from "@/lib/security/identity-media/types";
import { incidentStore } from "@/lib/security/incident-store";
import { Button } from "@/components/ui/Button";

export default function AudioAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<UnifiedMediaAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    setResult(null);

    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp3",
      "audio/x-m4a",
      "audio/mp4",
      "audio/ogg",
      "audio/webm",
    ];
    if (
      !allowedTypes.includes(file.type.toLowerCase()) &&
      !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)
    ) {
      setErrorMessage(`Unsupported audio format (${file.type}). Allowed: MP3, WAV, M4A, OGG.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage(`File exceeds 25MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    if (file.size === 0) {
      setErrorMessage("File payload is empty (0 bytes).");
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setResult(null);
    setErrorMessage(null);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "audio");

      const response = await fetch("/api/analyze/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || "Failed to analyze audio recording.");
      }

      const data: UnifiedMediaAnalysisResult = await response.json();
      incidentStore.registerAnalysis(data);
      setResult(data);
    } catch (err: unknown) {
      console.error("Audio analysis error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Audio analysis failed due to unexpected error.");
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/identity"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Identity & Media Hub</span>
          </Link>

          <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-violet-500/10 text-violet-300 border border-violet-500/30">
                <Music className="w-3.5 h-3.5 text-violet-400" />
                <span>AUDIO & SYNTHETIC VOICE FORENSICS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Audio Authenticity & Voice Clone Analysis
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Inspect acoustic envelopes, sampling frequencies (22.05kHz/24kHz vocoder matrices),
                ID3 encoder software tags, and synthetic vocal cadence anomalies.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Container */}
        <MediaUpload
          type="audio"
          onFileSelected={handleFileSelected}
          selectedFile={selectedFile}
          onRemoveFile={handleRemoveFile}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          error={errorMessage}
        />

        {/* Real-time Progress Animation */}
        {isAnalyzing && (
          <AnalysisProgress type="audio" currentStepIndex={currentStepIndex} />
        )}

        {/* Results Presentation */}
        {result && !isAnalyzing && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Shield className="w-4 h-4" />
                <span>AUDIO FORENSIC REPORT GENERATED</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze Another Recording</span>
              </Button>
            </div>

            <RiskAssessment result={result} />
            <ManipulationIndicators indicators={result.indicators} />
            <EvidenceCard evidence={result.evidence} metadata={result.metadata} type="audio" />
            <RecommendationCard
              recommendations={result.recommendedActions}
              riskLevel={result.riskLevel}
            />
            <AnalysisSourceBadge
              sources={result.analysisSources}
              modelResults={result.modelResults}
            />
          </div>
        )}

        <PrivacyNotice />
      </div>
    </AppShell>
  );
}
