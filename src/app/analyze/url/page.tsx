"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  urlAnalysisService,
  UrlAnalysisResult,
  SAMPLE_URLS,
} from "@/services/url-analysis";
import {
  Link as LinkIcon,
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const ANALYSIS_STEPS = [
  "Parsing URL structure & protocol",
  "Inspecting domain & look-alike spoofing indicators",
  "Checking credential paths & redirection parameters",
  "Assessing risk score and threat classification",
  "Preparing security assessment",
];

export default function UrlAnalysisPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Collapsible sections
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUrlValidation = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) {
      return "Please enter a URL.";
    }
    if (trimmed.length > 2048) {
      return "That URL is too long. Please enter a valid URL under 2048 characters.";
    }

    const testTarget =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    try {
      const parsed = new URL(testTarget);
      if (!parsed.hostname || !parsed.hostname.includes(".")) {
        // Allow localhost for local testing
        if (parsed.hostname !== "localhost") {
          return "That doesn't appear to be a valid URL.";
        }
      }
      return null;
    } catch {
      return "That doesn't appear to be a valid URL.";
    }
  };

  const handleStartAnalysis = async (targetUrl?: string) => {
    const urlToTest = targetUrl || inputUrl;
    setValidationError(null);
    setAnalysisError(null);

    const errorMsg = handleUrlValidation(urlToTest);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setCurrentStepIndex(0);

    // Stepped animation progression
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    try {
      const analysisResult = await urlAnalysisService.analyzeUrl(urlToTest, 1400);
      clearInterval(stepInterval);
      setResult(analysisResult);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setAnalysisError("Unable to complete the analysis. Please check the URL and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInputUrl("");
    setResult(null);
    setValidationError(null);
    setAnalysisError(null);
    setShowTechnicalDetails(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSampleClick = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
    setValidationError(null);
    handleStartAnalysis(sampleUrl);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link
            href="/analyze"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analyze</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-semibold">URL Analysis</span>
        </div>

        {/* Page Title & Intro */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analyze a URL
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Enter a suspicious URL and CYBERGUARD will assess it for potential security risks.
            </p>
          </div>
        </div>

        {/* Input Card (Always visible or in compact mode after result) */}
        {!result && !isAnalyzing && (
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] shadow-lg space-y-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartAnalysis();
              }}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="url-input"
                  className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2"
                >
                  Target URL for Inspection
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="url-input"
                    type="text"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="https://example.com/login"
                    autoComplete="off"
                    autoFocus
                    className="w-full pl-4 pr-11 py-3 rounded-lg bg-slate-900/90 border border-white/[0.12] text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-slate-500 font-mono"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>

                {validationError && (
                  <div
                    role="alert"
                    className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-400">
                  Only analyze URLs you are authorized to inspect.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto justify-center cursor-pointer font-semibold shadow-md shadow-cyan-500/20"
                  icon={<Search className="w-4 h-4" />}
                >
                  Analyze URL
                </Button>
              </div>
            </form>

            {/* Initial State Explanatory Helper (Part 16) */}
            <div className="pt-4 border-t border-white/[0.06] text-xs text-slate-400 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Paste a URL you are unsure about. CYBERGUARD will assess visible URL characteristics and explain the indicators behind its risk assessment.
              </span>
            </div>

            {/* Quick Sample URLs */}
            <div className="pt-3 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Or test with sample cases:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_URLS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handleSampleClick(sample.url)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all text-left cursor-pointer flex items-center gap-1.5 font-mono"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        sample.category === "phishing"
                          ? "bg-rose-400"
                          : sample.category === "suspicious"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading / Analysis Progress State (Part 4) */}
        {isAnalyzing && (
          <div className="glass-panel rounded-2xl p-8 border border-cyan-500/30 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              <Search className="w-7 h-7 text-cyan-400" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Analyzing URL
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-mono truncate px-4">
                {inputUrl}
              </p>
              <p className="text-xs text-slate-300 pt-1">
                CYBERGUARD is checking the URL for suspicious indicators.
              </p>
            </div>

            {/* Stepped Checklist Progress */}
            <div className="max-w-md mx-auto bg-slate-950/70 rounded-xl p-4 border border-white/[0.06] text-left space-y-2 text-xs font-mono">
              {ANALYSIS_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-2.5 transition-colors ${
                      isCompleted
                        ? "text-emerald-400"
                        : isCurrent
                        ? "text-cyan-300 font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-1 shrink-0" />
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error State (Part 15) */}
        {analysisError && !isAnalyzing && (
          <div className="glass-panel rounded-2xl p-8 border border-rose-500/30 shadow-2xl text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Unable to complete the analysis.
              </h2>
              <p className="text-xs text-slate-400">
                Please check the URL and try again.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleStartAnalysis()}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Result Presentation (Part 7, 8, 9, 10, 11, 12, 13, 14) */}
        {result && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Primary Security Assessment Banner */}
            <div
              className={`rounded-2xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${
                result.riskLevel === "Critical" || result.riskLevel === "High"
                  ? "bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 border-rose-500/40 shadow-rose-950/30"
                  : result.riskLevel === "Medium"
                  ? "bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border-amber-500/40 shadow-amber-950/30"
                  : "bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border-emerald-500/40 shadow-emerald-950/30"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      SECURITY ASSESSMENT
                    </span>

                    {/* Prominent Risk Level Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border ${
                        result.riskLevel === "Critical" || result.riskLevel === "High"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : result.riskLevel === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {result.riskLevel === "Safe"
                        ? "SAFE"
                        : result.riskLevel === "Critical"
                        ? "CRITICAL"
                        : `${result.riskLevel.toUpperCase()} RISK`}
                    </span>
                  </div>

                  {/* Threat Classification Title */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {result.classification}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                    {result.summary}
                  </p>
                </div>

                {/* Risk Score Circle / Meter */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-white/[0.08] flex flex-col items-center justify-center shrink-0 w-full sm:w-auto min-w-[150px]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Risk Score
                  </span>
                  <div
                    className={`text-3xl font-extrabold font-mono ${
                      result.riskLevel === "Critical" || result.riskLevel === "High"
                        ? "text-rose-400"
                        : result.riskLevel === "Medium"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {result.riskScore}{" "}
                    <span className="text-sm font-normal text-slate-500">/ 100</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.riskLevel === "Critical" || result.riskLevel === "High"
                          ? "bg-rose-500"
                          : result.riskLevel === "Medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.max(result.riskScore, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Threat Explanation */}
            <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {result.riskLevel === "Safe" ? "Security Assessment Summary" : "Why This URL Is Suspicious"}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* 3. Why CYBERGUARD flagged this URL (Part 9) */}
            <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {result.indicators.length > 0
                    ? "Why CYBERGUARD flagged this URL"
                    : "Security Evaluation Findings"}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {result.indicators.length} {result.indicators.length === 1 ? "Indicator" : "Indicators"}
                </span>
              </div>

              {result.indicators.length > 0 ? (
                <div className="space-y-3">
                  {result.indicators.map((ind) => (
                    <div
                      key={ind.id}
                      className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              ind.severity === "critical" || ind.severity === "high"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : ind.severity === "medium"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {ind.severity}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {ind.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ind.description}
                        </p>
                      </div>

                      {ind.evidenceSnippet && (
                        <code className="text-[11px] font-mono px-2 py-1 rounded bg-slate-950 text-cyan-300 border border-white/[0.06] shrink-0 max-w-full truncate">
                          {ind.evidenceSnippet}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    No deceptive domain spoofing, character substitutions, or anomalous structural patterns were identified in this URL.
                  </span>
                </div>
              )}
            </div>

            {/* 4. Recommended Action (Part 11) */}
            <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Recommended Action
                </h3>
              </div>

              <div className="space-y-2.5">
                {result.recommendedActions.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-lg bg-slate-900/60 border border-white/[0.06] flex items-start gap-3"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        act.priority === "urgent"
                          ? "bg-rose-400"
                          : act.priority === "recommended"
                          ? "bg-amber-400"
                          : "bg-cyan-400"
                      }`}
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">
                        {act.title}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {act.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-mono text-slate-500 pt-1">
                Advisory notice: Recommendations represent defensive guidance. Real-world network blocking is not automatically executed.
              </p>
            </div>

            {/* 5. Expandable Evidence Section (Part 10) */}
            <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Evidence & Inspected Attributes
                  </span>
                </div>
                {showEvidence ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showEvidence && (
                <div className="p-6 pt-0 border-t border-white/[0.06] text-xs font-mono space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-500">Evaluated URL:</span>
                      <span className="text-cyan-300 break-all select-all font-sans">
                        {result.evidence.rawUrl}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Host Domain:</span>
                      <span className="text-slate-200">{result.evidence.hostname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Protocol:</span>
                      <span className={result.evidence.isHttps ? "text-emerald-400" : "text-amber-400"}>
                        {result.evidence.protocol} {result.evidence.isHttps ? "(TLS Encrypted)" : "(Insecure Plaintext)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Path:</span>
                      <span className="text-slate-300">{result.evidence.pathname || "/"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-slate-400">{result.evidence.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Collapsible Technical Details (Part 12) */}
            <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  View Technical Details
                </span>
                {showTechnicalDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showTechnicalDetails && (
                <div className="p-6 pt-0 border-t border-white/[0.06] text-xs font-mono space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-white/[0.06]">
                    <div>
                      <span className="text-slate-500 block">URL:</span>
                      <span className="text-cyan-300 break-all">{result.evidence.rawUrl}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hostname:</span>
                      <span className="text-slate-200">{result.evidence.hostname}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Root Domain:</span>
                      <span className="text-slate-200">{result.evidence.domain}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Protocol:</span>
                      <span className={result.evidence.isHttps ? "text-emerald-400" : "text-amber-400"}>
                        {result.evidence.protocol} {result.evidence.isHttps ? "(TLS Encrypted)" : "(Insecure Plaintext)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Detected Indicators:</span>
                    {result.indicators.length > 0 ? (
                      <ul className="space-y-1 text-slate-300">
                        {result.indicators.map((ind) => (
                          <li key={ind.id} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span className="text-cyan-300 font-semibold uppercase">[{ind.severity}]</span>
                            <span className="text-white">{ind.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400">None detected</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Analysis Method:</span>
                    <span className="text-slate-300">{result.technicalDetails.analysisMethod}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Risk Calculation:</span>
                    <ul className="space-y-1 text-slate-300">
                      {result.technicalDetails.riskCalculationFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-1.5 text-slate-400 border-t border-white/[0.04]">
                      Derived Score: <span className="text-white font-bold">{result.riskScore}</span> / 100 ({result.riskLevel === "Safe" ? "SAFE" : result.riskLevel === "Critical" ? "CRITICAL" : `${result.riskLevel.toUpperCase()} RISK`})
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-white/[0.06] text-[11px] text-slate-500">
                    <span>Analysis Latency:</span>
                    <span>{result.technicalDetails.executionTimeMs} ms</span>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Result Actions (Part 13) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              <Link
                href="/analyze"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Analyze</span>
              </Link>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleReset}
                className="w-full sm:w-auto justify-center cursor-pointer"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Analyze Another URL
              </Button>
            </div>

            {/* 8. Demo Transparency Notice (Part 14) */}
            <div className="text-center pt-2">
              <p className="text-[11px] font-mono text-slate-500">
                Demo analysis engine — evaluates URL syntax, domain spoofing heuristics, and structural characteristics. Connect production threat intelligence services for live network telemetry.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
