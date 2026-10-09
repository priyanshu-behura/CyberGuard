import React from "react";
import { AuthenticityClassification, RiskLevel } from "@/lib/security/identity-media/types";
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, HelpCircle, XCircle } from "lucide-react";

interface AuthenticityBadgeProps {
  classification: AuthenticityClassification;
  className?: string;
}

export function AuthenticityBadge({ classification, className = "" }: AuthenticityBadgeProps) {
  switch (classification) {
    case "AUTHENTIC / NO STRONG MANIPULATION SIGNALS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Authentic / No Strong Signals</span>
        </span>
      );

    case "POTENTIALLY MANIPULATED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Potentially Manipulated</span>
        </span>
      );

    case "LIKELY MANIPULATED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
          <span>Likely Manipulated</span>
        </span>
      );

    case "SYNTHETIC MEDIA SUSPECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-950/50 ${className}`}
        >
          <Cpu className="w-3.5 h-3.5 text-rose-400" />
          <span>Synthetic Media Suspected</span>
        </span>
      );

    case "MODEL UNAVAILABLE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Model Unavailable</span>
        </span>
      );

    case "INSUFFICIENT EVIDENCE":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Insufficient Evidence</span>
        </span>
      );
  }
}

interface ConfidenceBadgeProps {
  confidence: number;
  confidenceType: "Heuristic confidence" | "AI Model confidence" | "Hybrid confidence";
  className?: string;
}

export function ConfidenceBadge({ confidence, confidenceType, className = "" }: ConfidenceBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-slate-400">{confidenceType}:</span>
      <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
        {confidence}%
      </span>
    </div>
  );
}
