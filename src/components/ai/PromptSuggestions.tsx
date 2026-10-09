"use client";

import React from "react";
import {
  ShieldAlert,
  Search,
  Activity,
  FileText,
  KeyRound,
  AlertTriangle,
  Code2,
  BookOpen,
  Sparkles,
  Layers,
  Lightbulb,
  Cpu,
} from "lucide-react";
import { AIAssistantMode } from "@/lib/ai/types";

interface PromptSuggestionsProps {
  mode: AIAssistantMode;
  onSelectPrompt: (prompt: string) => void;
}

export function PromptSuggestions({
  mode,
  onSelectPrompt,
}: PromptSuggestionsProps) {
  const generalSuggestions = [
    {
      label: "Code Debugging",
      prompt: "Help me debug a TypeScript error with asynchronous promises in Next.js.",
      icon: Code2,
      color: "border-violet-500/30 hover:border-violet-400 bg-violet-950/20 text-violet-300",
    },
    {
      label: "Concept Explanation",
      prompt: "Explain how public-key cryptography and RSA signatures work step by step.",
      icon: BookOpen,
      color: "border-purple-500/30 hover:border-purple-400 bg-purple-950/20 text-purple-300",
    },
    {
      label: "Technical Writing",
      prompt: "Draft a clear, professional security advisory notification for our employees.",
      icon: FileText,
      color: "border-blue-500/30 hover:border-blue-400 bg-blue-950/20 text-blue-300",
    },
    {
      label: "Architecture Advice",
      prompt: "Compare event-driven architecture vs REST polling for high-throughput security logging.",
      icon: Layers,
      color: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300",
    },
    {
      label: "Algorithm Design",
      prompt: "How does a sliding window rate limiter work, and what is its time complexity?",
      icon: Cpu,
      color: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20 text-amber-300",
    },
    {
      label: "Creative Problem Solving",
      prompt: "Give me 4 effective strategies to conduct an engaging cybersecurity awareness workshop.",
      icon: Lightbulb,
      color: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 text-cyan-300",
    },
  ];

  const cyberSuggestions = [
    {
      label: "Security Posture",
      prompt: "Summarize our current security posture and open threat metrics.",
      icon: Activity,
      color: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 text-cyan-300",
    },
    {
      label: "Highest-Risk Incident",
      prompt: "Investigate our highest-risk open incident and correlate evidence.",
      icon: AlertTriangle,
      color: "border-rose-500/30 hover:border-rose-400 bg-rose-950/20 text-rose-300",
    },
    {
      label: "Account Takeover",
      prompt: "Explain the indicators behind MFA fatigue push storms and credential spraying.",
      icon: KeyRound,
      color: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20 text-amber-300",
    },
    {
      label: "Monitor Telemetry",
      prompt: "Audit active authentication sessions and impossible travel anomalies.",
      icon: Search,
      color: "border-blue-500/30 hover:border-blue-400 bg-blue-950/20 text-blue-300",
    },
    {
      label: "Phishing Target",
      prompt: "Analyze suspicious URL: https://login.cybergu-ard.com/oauth/authorize",
      icon: ShieldAlert,
      color: "border-purple-500/30 hover:border-purple-400 bg-purple-950/20 text-purple-300",
    },
    {
      label: "Executive Dossier",
      prompt: "Compile an incident report dossier for the security incident response team.",
      icon: FileText,
      color: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300",
    },
  ];

  const suggestions =
    mode === "general" ? generalSuggestions : cyberSuggestions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-4xl mx-auto">
      {suggestions.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm flex items-start gap-2.5 ${item.color}`}
          >
            <div className="p-1.5 rounded-lg bg-black/40 shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-80 mb-0.5">
                {item.label}
              </div>
              <div className="text-xs text-slate-200 group-hover:text-white font-medium line-clamp-1">
                {item.prompt}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
