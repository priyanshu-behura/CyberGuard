"use client";

import React from "react";
import { Sparkles, Shield, Cpu } from "lucide-react";
import { AIAssistantMode, AIProviderStatus } from "@/lib/ai/types";

interface ModeSelectorProps {
  currentMode: AIAssistantMode;
  onSelectMode: (mode: AIAssistantMode) => void;
  providerStatus: AIProviderStatus | null;
}

export function ModeSelector({
  currentMode,
  onSelectMode,
  providerStatus,
}: ModeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#11131B] border border-white/10 shadow-xl shadow-black/60 backdrop-blur-md">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-[#08090D] border border-white/[0.08] gap-1">
        <button
          type="button"
          onClick={() => onSelectMode("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentMode === "general"
              ? "bg-[#805BFF] text-white shadow-md shadow-[#805BFF]/30 border border-white/20"
              : "text-[#9CA3B5] hover:text-[#F5F5FA] hover:bg-white/[0.04]"
          }`}
        >
          <Sparkles
            className={`w-4 h-4 ${
              currentMode === "general" ? "text-white" : "text-[#805BFF]"
            }`}
          />
          <div className="flex flex-col text-left">
            <span className="leading-tight">General AI</span>
            <span className="text-[10px] font-normal text-white/80 hidden md:inline">
              Conversational & Reasoning
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("cybersecurity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            currentMode === "cybersecurity"
              ? "bg-[#39DCE5] text-[#08090D] shadow-md shadow-[#39DCE5]/30 border border-white/20 font-bold"
              : "text-[#9CA3B5] hover:text-[#F5F5FA] hover:bg-white/[0.04]"
          }`}
        >
          <Shield
            className={`w-4 h-4 ${
              currentMode === "cybersecurity" ? "text-[#08090D]" : "text-[#39DCE5]"
            }`}
          />
          <div className="flex flex-col text-left">
            <span className="leading-tight">Cybersecurity Intelligence</span>
            <span className="text-[10px] font-normal text-[#08090D]/80 hidden md:inline">
              Telemetry Grounded SOC
            </span>
          </div>
        </button>
      </div>

      {/* Model & Provider Badge */}
      <div className="flex items-center gap-2 self-end sm:self-auto px-3 py-1.5 rounded-xl bg-[#08090D] border border-white/10 text-[11px] font-mono">
        <span
          className={`w-2 h-2 rounded-full ${
            providerStatus?.isConfigured
              ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80"
              : "bg-[#39DCE5]"
          }`}
        />
        <span className="text-[#F5F5FA] font-medium">
          {providerStatus?.isConfigured ? providerStatus.modelName : "Local Heuristic Engine"}
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
            providerStatus?.isConfigured
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "bg-[#39DCE5]/15 text-[#39DCE5] border border-[#39DCE5]/30"
          }`}
        >
          {providerStatus?.isConfigured ? "GOOGLE GEMINI" : "OFFLINE READY"}
        </span>
      </div>
    </div>
  );
}
