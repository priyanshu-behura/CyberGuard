"use client";

import React from "react";
import {
  ShieldAlert,
  Search,
  Activity,
  FileText,
  KeyRound,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  const suggestions = [
    {
      label: "Security Posture",
      prompt: "Summarize our current security posture.",
      icon: Activity,
      color: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 text-cyan-300",
    },
    {
      label: "Highest-Risk Incident",
      prompt: "Investigate our highest-risk open incident.",
      icon: AlertTriangle,
      color: "border-rose-500/30 hover:border-rose-400 bg-rose-950/20 text-rose-300",
    },
    {
      label: "Account Takeover",
      prompt: "Explain the latest account takeover alert.",
      icon: KeyRound,
      color: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20 text-amber-300",
    },
    {
      label: "Login Patterns",
      prompt: "Show me suspicious login patterns.",
      icon: Search,
      color: "border-blue-500/30 hover:border-blue-400 bg-blue-950/20 text-blue-300",
    },
    {
      label: "Phishing Target",
      prompt: "Help me investigate this phishing URL.",
      icon: ShieldAlert,
      color: "border-purple-500/30 hover:border-purple-400 bg-purple-950/20 text-purple-300",
    },
    {
      label: "Executive Report",
      prompt: "Prepare a report for the security team.",
      icon: FileText,
      color: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300",
    },
  ];

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
