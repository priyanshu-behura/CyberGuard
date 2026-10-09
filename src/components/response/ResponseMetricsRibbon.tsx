"use client";

import React from "react";
import { ResponseMetrics } from "@/lib/security/response/types";
import { ShieldAlert, AlertTriangle, Play, CheckCircle2, XCircle, Shield } from "lucide-react";

interface ResponseMetricsRibbonProps {
  metrics: ResponseMetrics;
}

export function ResponseMetricsRibbon({ metrics }: ResponseMetricsRibbonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Response Actions */}
      <div className="rounded-xl p-3.5 border border-white/[0.08] bg-[#11131B] shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-[#9CA3B5]">Total Actions</span>
          <Shield className="w-3.5 h-3.5 text-[#39DCE5]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5F5FA] mt-1">
          {metrics.totalActions}
        </div>
        <div className="text-[10px] font-mono text-[#9CA3B5] mt-0.5">
          in response registry
        </div>
      </div>

      {/* 2. Approval Required */}
      <div className="rounded-xl p-3.5 border border-amber-500/30 bg-[#11131B] shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-amber-300">Approval Required</span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1">
          {metrics.approvalRequired}
        </div>
        <div className="text-[10px] font-mono text-amber-300/80 mt-0.5">
          high-impact actions
        </div>
      </div>

      {/* 3. In Progress */}
      <div className="rounded-xl p-3.5 border border-[#39DCE5]/30 bg-[#11131B] shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-[#39DCE5]">Executing</span>
          <Play className="w-3.5 h-3.5 text-[#39DCE5]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-[#39DCE5] mt-1">
          {metrics.inProgress}
        </div>
        <div className="text-[10px] font-mono text-[#9CA3B5] mt-0.5">
          in pipeline
        </div>
      </div>

      {/* 4. Simulated Executions */}
      <div className="rounded-xl p-3.5 border border-emerald-500/30 bg-[#11131B] shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-emerald-300">Simulated</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
          {metrics.simulated}
        </div>
        <div className="text-[10px] font-mono text-[#9CA3B5] mt-0.5">
          safely validated
        </div>
      </div>

      {/* 5. High-Risk Awaiting Action */}
      <div className="rounded-xl p-3.5 border border-rose-500/30 bg-[#11131B] shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-rose-300">Critical / High</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 mt-1">
          {metrics.highRiskAwaitingAction}
        </div>
        <div className="text-[10px] font-mono text-rose-300/80 mt-0.5">
          awaiting triage
        </div>
      </div>

      {/* 6. Rejected / Cancelled */}
      <div className="rounded-xl p-3.5 border border-white/[0.08] bg-[#11131B] shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-[#9CA3B5]">Rejected</span>
          <XCircle className="w-3.5 h-3.5 text-[#9CA3B5]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-[#9CA3B5] mt-1">
          {metrics.rejected}
        </div>
        <div className="text-[10px] font-mono text-[#9CA3B5] mt-0.5">
          with analyst reason
        </div>
      </div>
    </div>
  );
}
