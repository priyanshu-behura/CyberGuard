import React from "react";
import { AnalysisSourceStatus, ModelProviderResult } from "@/lib/security/identity-media/types";
import { CheckCircle2, AlertTriangle, XCircle, Info, Cpu, HardDrive, Database, Globe } from "lucide-react";

interface AnalysisSourcesProps {
  sources: AnalysisSourceStatus[];
  modelResults?: ModelProviderResult;
}

export function AnalysisSourceBadge({ sources, modelResults }: AnalysisSourcesProps) {
  const getSourceIcon = (type: AnalysisSourceStatus["type"]) => {
    switch (type) {
      case "local":
        return HardDrive;
      case "metadata":
        return Info;
      case "ai_model":
        return Cpu;
      case "external":
        return Globe;
      default:
        return Database;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Analysis Provenance & Intelligence Sources
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Zero Synthetic Claims
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sources.map((src, i) => {
          const Icon = getSourceIcon(src.type);
          const isDone = src.status === "completed";
          const isUnavail = src.status === "unavailable";

          return (
            <div
              key={i}
              className={`rounded-lg p-3 border transition-colors flex flex-col justify-between space-y-2 ${
                isDone
                  ? "bg-slate-900/80 border-cyan-500/30"
                  : isUnavail
                  ? "bg-slate-950/50 border-white/[0.05] opacity-80"
                  : "bg-slate-900/50 border-white/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isDone ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-semibold text-slate-200">{src.name}</span>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isUnavail ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                {src.note}
              </p>
            </div>
          );
        })}
      </div>

      {modelResults && !modelResults.configured && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/25 text-amber-300 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Deepfake Model Not Configured: </span>
            {modelResults.explanation || "No external AI inference API key configured. Results reflect local binary forensics, EXIF structure, and acoustic/temporal heuristics without simulated scores."}
          </div>
        </div>
      )}
    </div>
  );
}
