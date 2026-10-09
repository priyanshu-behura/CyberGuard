"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  messageAnalysisService,
  MessageAnalysisResult,
  MessageType,
  DEMO_MESSAGES,
} from "@/services/message-analysis";
import {
  MessageSquareText,
  Search,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Info,
  Mail,
  Smartphone,
  Share2,
  MessageCircle,
  FileQuestion,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const ANALYSIS_STEPS = [
  "Message structure & communication syntax analyzed",
  "Social-engineering & pressure indicators checked",
  "Embedded links & credential requests evaluated",
  "Multi-vector risk assessment calculated",
];

const MESSAGE_TYPE_OPTIONS: { id: MessageType; label: string; icon: React.ElementType }[] = [
  { id: "auto", label: "Auto Detect", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: Smartphone },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "other", label: "Other", icon: FileQuestion },
];

export default function MessageAnalysisPage() {
  const [messageContent, setMessageContent] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const [selectedType, setSelectedType] = useState<MessageType>("auto");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<MessageAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Collapsible sections
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartAnalysis = async (
    targetContent?: string,
    targetType?: MessageType,
    targetSender?: string
  ) => {
    const textToAnalyze = targetContent !== undefined ? targetContent : messageContent;
    const typeToUse = targetType !== undefined ? targetType : selectedType;
    const senderToUse = targetSender !== undefined ? targetSender : senderInfo;

    setValidationError(null);
    setAnalysisError(null);

    const trimmed = textToAnalyze.trim();
    if (!trimmed) {
      setValidationError("Please paste or type a message to analyze.");
      return;
    }

    if (trimmed.length > 10000) {
      setValidationError("Message exceeds maximum analysis limit of 10,000 characters.");
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
      const analysisResult = await messageAnalysisService.analyzeMessage(
        trimmed,
        typeToUse,
        senderToUse,
        1200
      );
      clearInterval(stepInterval);
      setResult(analysisResult);
    } catch {
      clearInterval(stepInterval);
      setAnalysisError("Unable to complete message analysis. Please verify content and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setMessageContent("");
    setSenderInfo("");
    setSelectedType("auto");
    setResult(null);
    setValidationError(null);
    setAnalysisError(null);
    setShowTechnicalDetails(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleDemoClick = (demo: typeof DEMO_MESSAGES[0]) => {
    setMessageContent(demo.content);
    setSelectedType(demo.messageType);
    setSenderInfo(demo.sender || "");
    setValidationError(null);
    handleStartAnalysis(demo.content, demo.messageType, demo.sender);
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
          <span className="text-cyan-400 font-semibold">Message Analysis</span>
        </div>

        {/* Page Header */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
              <MessageSquareText className="w-4 h-4" />
              <span>Phishing & Social-Engineering Inspection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analyze a Message
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Paste an email, SMS, social-media message, or suspicious communication. CYBERGUARD will assess it for phishing and social-engineering risks.
            </p>
          </div>
        </div>

        {/* Input Card */}
        {!result && !isAnalyzing && (
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] shadow-lg space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartAnalysis();
              }}
              noValidate
              className="space-y-5"
            >
              {/* Optional Message Type Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Message Type (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MESSAGE_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedType(opt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm shadow-cyan-950/40"
                            : "bg-slate-900/80 text-slate-400 border-white/[0.08] hover:text-slate-200 hover:border-white/[0.16]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Sender Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="sender-input"
                    className="block text-xs font-mono text-slate-300 uppercase tracking-wider"
                  >
                    Sender Email or Handle (Optional)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">e.g. security@paypa1-support.example.com</span>
                </div>
                <input
                  id="sender-input"
                  type="text"
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                  placeholder="sender@domain.com or @username"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/90 border border-white/[0.12] text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-slate-500 font-mono"
                />
              </div>

              {/* Main Message Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="message-textarea"
                    className="block text-xs font-mono text-slate-300 uppercase tracking-wider"
                  >
                    Message or Communication
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {messageContent.length} / 10,000 characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="message-textarea"
                    rows={6}
                    value={messageContent}
                    onChange={(e) => {
                      setMessageContent(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Paste the suspicious message here..."
                    autoFocus
                    className="w-full p-4 rounded-lg bg-slate-900/90 border border-white/[0.12] text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-slate-500 font-sans leading-relaxed resize-y min-h-[140px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                  <p className="text-xs text-slate-500">
                    Supported: Email • SMS • Social Message • Chat • Notification
                  </p>

                  {validationError && (
                    <div
                      role="alert"
                      className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                <p className="text-xs text-slate-400">
                  Sensitive credentials like real passwords or OTPs should never be submitted.
                </p>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleClear}
                    disabled={!messageContent && !senderInfo}
                    className="cursor-pointer text-slate-400 hover:text-white"
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1 sm:flex-initial justify-center cursor-pointer font-semibold shadow-md shadow-cyan-500/20"
                    icon={<Search className="w-4 h-4" />}
                  >
                    Analyze Message
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Demo Messages Section */}
            <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Or test with sample cases:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_MESSAGES.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleDemoClick(demo)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all text-left cursor-pointer flex items-center gap-2 font-mono"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        demo.category === "phishing"
                          ? "bg-rose-400"
                          : demo.category === "suspicious"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span>{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="glass-panel rounded-2xl p-8 border border-cyan-500/30 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              <Search className="w-7 h-7 text-cyan-400" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Analyzing Communication...
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-mono truncate px-4">
                Evaluating social-engineering tactics, urgency, and destination links
              </p>
            </div>

            {/* Stepped Progress Stages */}
            <div className="max-w-md mx-auto bg-slate-950/70 rounded-xl p-4 border border-white/[0.06] text-left space-y-2.5 text-xs font-mono">
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

        {/* Error State */}
        {analysisError && !isAnalyzing && (
          <div className="glass-panel rounded-2xl p-8 border border-rose-500/30 shadow-2xl text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Unable to complete analysis.
              </h2>
              <p className="text-xs text-slate-400">
                {analysisError}
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

        {/* Result Presentation */}
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

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-slate-400 border border-white/[0.08]">
                      {result.detectedType}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {result.classification}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed font-normal max-w-2xl">
                    {result.summary}
                  </p>
                </div>

                {/* Risk Score Gauge */}
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

                  {/* Progress Bar */}
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
                {result.riskLevel === "Safe" ? "Security Assessment Summary" : "WHY THIS MESSAGE IS SUSPICIOUS"}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* 3. Why CYBERGUARD flagged this Message */}
            <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {result.indicators.length > 0
                    ? "Why CYBERGUARD flagged this message"
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
                    No deceptive social-engineering tactics, artificial urgency pressure, or unverified credential demands were detected in this communication.
                  </span>
                </div>
              )}
            </div>

            {/* 4. Evidence & Inspected Content */}
            <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Evidence & Inspected Content
                  </span>
                </div>
                {showEvidence ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showEvidence && (
                <div className="p-6 pt-0 border-t border-white/[0.06] text-xs font-mono space-y-4">
                  {/* Raw Content Snippet */}
                  <div className="p-3.5 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-2 font-sans">
                    <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                      Evaluated Message Content:
                    </span>
                    <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap select-all">
                      {result.evidence.rawMessage}
                    </p>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-950/70 border border-white/[0.06]">
                    <div>
                      <span className="text-slate-500 block">Communication Type:</span>
                      <span className="text-cyan-300 uppercase font-semibold">{result.evidence.detectedType}</span>
                    </div>

                    {result.evidence.sender && (
                      <div>
                        <span className="text-slate-500 block">Sender Address:</span>
                        <span className="text-slate-200 break-all">{result.evidence.sender}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-500 block">Detected Phrases:</span>
                      <span className="text-slate-300">
                        {result.evidence.detectedPhrases.length > 0
                          ? result.evidence.detectedPhrases.join(", ")
                          : "None"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Analysis Timestamp:</span>
                      <span className="text-slate-400">{result.evidence.timestamp}</span>
                    </div>
                  </div>

                  {/* Extracted URLs with Inter-Module URL Analysis */}
                  {result.evidence.extractedUrls.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                        Extracted Links & Integrated URL Analysis:
                      </span>
                      <div className="space-y-2">
                        {result.evidence.extractedUrls.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-900/80 border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono"
                          >
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <span className="text-slate-200 break-all block truncate">
                                {item.url}
                              </span>
                              <span className="text-[11px] text-slate-400 block font-sans">
                                {item.analysis.summary}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                  item.analysis.riskLevel === "Critical" || item.analysis.riskLevel === "High"
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                    : item.analysis.riskLevel === "Medium"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                }`}
                              >
                                {item.analysis.riskLevel} Risk ({item.analysis.riskScore}/100)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Recommended Actions */}
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
                      <div className="text-xs text-slate-300 leading-relaxed font-normal">
                        {act.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-mono text-slate-500 pt-1">
                Advisory notice: Recommendations represent defensive security guidance. High-impact operational actions require human verification.
              </p>
            </div>

            {/* 6. Collapsible Technical Details */}
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
                      <span className="text-slate-500 block">Message Length:</span>
                      <span className="text-slate-200">{result.technicalDetails.messageLength} characters</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Classified Type:</span>
                      <span className="text-cyan-300 uppercase">{result.technicalDetails.messageType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Extracted URLs:</span>
                      <span className="text-slate-200">{result.technicalDetails.extractedUrlsCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Engine Status:</span>
                      <span className="text-emerald-400">{result.technicalDetails.engineStatus}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Inspection Engine:</span>
                    <span className="text-slate-300">{result.technicalDetails.analysisMethod}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Detection Signals:</span>
                    {result.technicalDetails.detectionSignals.length > 0 ? (
                      <ul className="space-y-1 text-slate-300">
                        {result.technicalDetails.detectionSignals.map((signal, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400">No anomalous signals detected</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Risk Calculation Breakdown:</span>
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

            {/* 7. Action Footer */}
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
                onClick={handleClear}
                className="w-full sm:w-auto justify-center cursor-pointer"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Analyze Another Message
              </Button>
            </div>

            {/* 8. Demo Transparency Notice */}
            <div className="text-center pt-2">
              <p className="text-[11px] font-mono text-slate-500">
                Demo analysis engine — evaluates message content using configured security heuristics. Connect production AI/NLP and threat-intelligence services for live detection.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
