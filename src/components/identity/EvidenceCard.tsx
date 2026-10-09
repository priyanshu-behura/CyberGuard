import React, { useState } from "react";
import { MediaEvidenceItem, UnifiedMediaAnalysisResult } from "@/lib/security/identity-media/types";
import { ChevronDown, ChevronUp, FileCode, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface EvidencePanelProps {
  evidence: MediaEvidenceItem[];
  metadata: UnifiedMediaAnalysisResult["metadata"];
  type: UnifiedMediaAnalysisResult["type"];
}

export function EvidenceCard({ evidence, metadata, type }: EvidencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
            FORENSIC EVIDENCE & EXTRACTED METADATA ({evidence.length} ITEMS)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>{isExpanded ? "Collapse" : "Expand"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 pt-0 space-y-4 border-t border-white/[0.06]">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {evidence.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-1.5 ${
                  item.isSuspicious
                    ? "bg-rose-950/20 border-rose-500/30"
                    : "bg-slate-900/60 border-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400">
                    {item.label}
                  </span>
                  {item.isSuspicious ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      FLAGGED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      NORMAL
                    </span>
                  )}
                </div>

                <div className="text-sm font-mono font-semibold text-white truncate">
                  {String(item.value)}
                </div>

                {item.explanation && (
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Technical Metadata Dump */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Raw Technical Attributes:</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/[0.05] font-mono text-xs text-slate-300 space-y-1">
                {metadata.dimensions && (
                  <div>Dimensions: {metadata.dimensions.width} × {metadata.dimensions.height} px</div>
                )}
                {metadata.durationSeconds !== undefined && (
                  <div>Duration: {metadata.durationSeconds}s</div>
                )}
                {metadata.sampleRateHz && (
                  <div>Sample Rate: {metadata.sampleRateHz} Hz</div>
                )}
                {metadata.cameraMake && (
                  <div>Camera Make: {metadata.cameraMake}</div>
                )}
                {metadata.cameraModel && (
                  <div>Camera Model: {metadata.cameraModel}</div>
                )}
                {metadata.software && (
                  <div>Software: {metadata.software}</div>
                )}
                {metadata.createdDate && (
                  <div>Header Timestamp: {metadata.createdDate}</div>
                )}
                {metadata.formatSpecific && (
                  <div className="space-y-1 pt-1 border-t border-white/[0.05]">
                    {Boolean(metadata.formatSpecific.claimedIdentity) && (
                      <div>Claimed Role / Persona: {String(metadata.formatSpecific.claimedIdentity)}</div>
                    )}
                    {Boolean(metadata.formatSpecific.claimedOrganization) && (
                      <div>Claimed Organization: {String(metadata.formatSpecific.claimedOrganization)}</div>
                    )}
                    {Boolean(metadata.formatSpecific.claimCategory) && (
                      <div>Category Context: {String(metadata.formatSpecific.claimCategory).replace("_", " ")}</div>
                    )}
                    {Boolean(metadata.formatSpecific.destinationUrl) && (
                      <div>Target Destination URL: {String(metadata.formatSpecific.destinationUrl)}</div>
                    )}
                    {Boolean(metadata.formatSpecific.consistencyVerdict) && (
                      <div>Consistency Verdict: {String(metadata.formatSpecific.consistencyVerdict)}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
