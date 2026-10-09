import React from "react";
import { ShieldCheck, ShieldAlert, ArrowRight, PhoneCall, AlertOctagon, CheckSquare } from "lucide-react";
import { RiskLevel } from "@/lib/security/identity-media/types";

interface RecommendationCardProps {
  recommendations: string[];
  riskLevel: RiskLevel;
}

export function RecommendationCard({ recommendations, riskLevel }: RecommendationCardProps) {
  const isHighOrCrit = riskLevel === "HIGH" || riskLevel === "CRITICAL";

  return (
    <div
      className={`glass-panel rounded-xl p-6 border transition-all ${
        isHighOrCrit
          ? "border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900/80 to-slate-900/90"
          : "border-cyan-500/30 bg-slate-900/80"
      } space-y-4`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          {isHighOrCrit ? (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          )}
          <h3 className="text-sm font-mono uppercase tracking-wider text-white font-semibold">
            RECOMMENDED RESPONSE & CONTAINMENT PLAYBOOK
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
            isHighOrCrit
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
          }`}
        >
          {isHighOrCrit ? "ACTION REQUIRED" : "STANDARD HYGIENE"}
        </span>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((action, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/[0.05]"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold ${
                isHighOrCrit
                  ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                  : "bg-cyan-950 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {idx + 1}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {action}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center gap-2">
        <span>Response Guidance:</span>
        <span className="text-slate-300">
          CYBERGUARD security policies advise zero single-factor trust on flagged digital assets.
        </span>
      </div>
    </div>
  );
}
