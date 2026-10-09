import React from "react";
import { Loader2, CheckCircle2, Cpu } from "lucide-react";
import { MediaType } from "@/lib/security/identity-media/types";

interface AnalysisProgressProps {
  type: MediaType;
  currentStepIndex: number;
}

export function AnalysisProgress({ type, currentStepIndex }: AnalysisProgressProps) {
  const getSteps = (mediaType: MediaType): string[] => {
    switch (mediaType) {
      case "image":
        return [
          "Validating file integrity & payload bounds...",
          "Extracting binary EXIF tags, GPS, and camera provenance...",
          "Evaluating pixel dimensions & generative canvas matrices...",
          "Checking software signatures & manipulation traces...",
          "Correlating evidence & determining risk level...",
        ];
      case "video":
        return [
          "Parsing container atoms (ftyp, moov, trak)...",
          "Sampling representative keyframes at regular intervals...",
          "Evaluating temporal boundary stability...",
          "Checking audio/video track synchronicity...",
          "Correlating multi-frame evidence & generating assessment...",
        ];
      case "audio":
        return [
          "Parsing audio container & ID3 headers...",
          "Extracting sampling rate, bit depth, and spectral channels...",
          "Checking synthetic vocoder hallmarks (22.05kHz/24kHz)...",
          "Inspecting acoustic envelope & voice-cloning markers...",
          "Correlating acoustic evidence & calculating risk...",
        ];
      case "identity":
      default:
        return [
          "Parsing claimed persona & organizational context...",
          "Analyzing communication pressure, urgency & psychological coercion...",
          "Checking for credential or wire transfer solicitations...",
          "Correlating attached media & embedded destination domains...",
          "Calculating multi-vector impersonation risk score...",
        ];
    }
  };

  const steps = getSteps(type);

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/30 bg-slate-900/90 shadow-2xl space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Forensic Inspection in Progress
          </h3>
          <p className="text-xs text-slate-400">
            Running real-time binary heuristics and provenance verification
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs sm:text-sm p-3 rounded-lg border transition-all ${
                isCurrent
                  ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-200 font-semibold shadow-sm"
                  : isDone
                  ? "bg-slate-900/60 border-white/[0.05] text-slate-300"
                  : "bg-slate-950/30 border-transparent text-slate-600"
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                )}
              </div>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
