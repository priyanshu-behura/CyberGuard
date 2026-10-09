import React from "react";
import { UnifiedMediaAnalysisResult } from "@/lib/security/identity-media/types";
import { AuthenticityBadge, ConfidenceBadge } from "./AuthenticityBadge";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon, Info } from "lucide-react";

interface RiskAssessmentProps {
  result: UnifiedMediaAnalysisResult;
}

export function RiskAssessment({ result }: RiskAssessmentProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return {
          bg: "from-rose-950/40 via-slate-900/90 to-slate-900",
          border: "border-rose-500/50",
          text: "text-rose-400",
          bar: "bg-rose-500",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        };
      case "HIGH":
        return {
          bg: "from-orange-950/40 via-slate-900/90 to-slate-900",
          border: "border-orange-500/40",
          text: "text-orange-400",
          bar: "bg-orange-500",
          badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        };
      case "MEDIUM":
        return {
          bg: "from-amber-950/40 via-slate-900/90 to-slate-900",
          border: "border-amber-500/40",
          text: "text-amber-400",
          bar: "bg-amber-500",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "LOW":
        return {
          bg: "from-blue-950/30 via-slate-900/90 to-slate-900",
          border: "border-blue-500/30",
          text: "text-blue-400",
          bar: "bg-blue-500",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        };
      case "SAFE":
      default:
        return {
          bg: "from-emerald-950/30 via-slate-900/90 to-slate-900",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          bar: "bg-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
    }
  };

  const colors = getRiskColor(result.riskLevel);

  return (
    <div
      className={`glass-panel rounded-2xl p-6 sm:p-8 border ${colors.border} bg-gradient-to-br ${colors.bg} shadow-2xl relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1">
            MEDIA SECURITY ASSESSMENT
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {result.filename}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AuthenticityBadge classification={result.classification} />
          <ConfidenceBadge
            confidence={result.confidence}
            confidenceType={result.confidenceType}
          />
        </div>
      </div>

      {/* Main Score & Risk Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 items-center">
        {/* Risk Gauge */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
              Threat Score
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {result.riskScore}
              <span className="text-lg font-normal text-slate-500"> / 100</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-950 border border-white/[0.08] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full ${colors.bar} transition-all duration-1000 ease-out`}
              style={{ width: `${Math.max(5, result.riskScore)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 SAFE</span>
            <span>40 MED</span>
            <span>70 HIGH</span>
            <span>100 CRIT</span>
          </div>
        </div>

        {/* Risk Level Badge & Classification */}
        <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/[0.08] py-4 md:py-0 md:px-6">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Threat Severity
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-extrabold uppercase tracking-wide border ${colors.badge}`}
            >
              {result.riskLevel} RISK
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {result.riskScore < 20
              ? "No overt tampering indicators flagged."
              : result.riskScore < 40
              ? "Low risk. Basic digital export metadata variances."
              : result.riskScore < 70
              ? "Moderate risk. Anomalous editing traces detected."
              : "High to critical risk. Synthetic media markers or coercion patterns confirmed."}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Executive Verdict
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Identity Assessment Context Strip */}
      {result.identityAssessment && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Claimed Identity</span>
            <span className="font-semibold text-white block truncate">
              {result.identityAssessment.claimedIdentity || "Unspecified"}
            </span>
            {result.identityAssessment.claimedOrganization && (
              <span className="text-[11px] text-cyan-300 block truncate">
                {result.identityAssessment.claimedOrganization}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Consistency Verdict</span>
            <span
              className={`font-semibold font-mono block ${
                result.identityAssessment.consistencyVerdict === "LIKELY IMPERSONATION" ||
                result.identityAssessment.consistencyVerdict === "HIGH_CONFIDENCE_IMPERSONATION"
                  ? "text-rose-400"
                  : result.identityAssessment.consistencyVerdict === "POTENTIAL_IMPERSONATION" ||
                    result.identityAssessment.consistencyVerdict === "POTENTIALLY INCONSISTENT"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {result.identityAssessment.consistencyVerdict.replace(/_/g, " ")}
            </span>
            <span className="text-[10px] text-slate-400 capitalize block">
              Profile: {result.identityAssessment.claimCategory.replace(/_/g, " ")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Destination URL</span>
            <span className="font-mono text-[11px] text-slate-200 block truncate">
              {result.identityAssessment.destinationUrl || "None Provided"}
            </span>
            <span
              className={`text-[10px] block font-mono ${
                result.identityAssessment.domainDiscrepancyDetected ? "text-rose-400" : "text-slate-400"
              }`}
            >
              {result.identityAssessment.domainDiscrepancyDetected
                ? "⚠ Domain Mismatch Detected"
                : "No Domain Mismatch"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Key Vectors</span>
            <div className="flex flex-wrap gap-1 text-[10px] font-mono">
              {result.identityAssessment.urgencyDetected && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Urgency</span>
              )}
              {result.identityAssessment.financialRequestDetected && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Financial</span>
              )}
              {result.identityAssessment.credentialRequestDetected && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Credentials</span>
              )}
              {!result.identityAssessment.urgencyDetected &&
                !result.identityAssessment.financialRequestDetected &&
                !result.identityAssessment.credentialRequestDetected && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Neutral Style</span>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Associated Incident Banner if created */}
      {result.associatedIncidentId && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Incident Dispatched: {result.associatedIncidentId}</span>
          </div>
          <span className="text-slate-400">Available in Incident Triage</span>
        </div>
      )}
    </div>
  );
}
