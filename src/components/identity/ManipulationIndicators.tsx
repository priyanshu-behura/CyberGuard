import React from "react";
import { ManipulationIndicator } from "@/lib/security/identity-media/types";
import { AlertCircle, AlertTriangle, ShieldAlert, Cpu, CheckCircle2, ChevronRight } from "lucide-react";

interface ManipulationIndicatorsProps {
  indicators: ManipulationIndicator[];
}

export function ManipulationIndicators({ indicators }: ManipulationIndicatorsProps) {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 border border-white/[0.08] text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
        <h4 className="text-sm font-semibold text-white">No Manipulation Indicators Detected</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The forensic pipeline did not detect generative software markers, aspect-ratio signatures, or coercive communication anomalies.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: ManipulationIndicator["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500/15 text-rose-300 border-rose-500/40";
      case "high":
        return "bg-orange-500/15 text-orange-300 border-orange-500/30";
      case "medium":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "low":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "info":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
            WHY CYBERGUARD FLAGGED THIS ({indicators.length} EVIDENCE SIGNALS)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Forensic Correlation</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {indicators.map((ind) => (
          <div
            key={ind.id}
            className="glass-panel rounded-xl p-5 border border-white/[0.08] bg-slate-900/70 hover:border-cyan-500/30 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(
                      ind.severity
                    )}`}
                  >
                    {ind.severity}
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {ind.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {ind.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-semibold text-rose-400">
                  +{ind.scoreImpact} pts
                </span>
                <div className="text-[10px] font-mono text-slate-500">
                  {ind.confidence}% conf
                </div>
              </div>
            </div>

            {ind.technicalDetails && (
              <div className="pt-2 border-t border-white/[0.05] text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="text-cyan-400/80 font-semibold">Technical Detail:</span>
                <span>{ind.technicalDetails}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
