"use client";

import React from "react";
import { ResponseAction, ResponseCategory } from "@/lib/security/response/types";
import {
  ShieldAlert,
  LogOut,
  Globe,
  Mail,
  Key,
  Smartphone,
  ScanFace,
  AlertTriangle,
  Radio,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResponseQueueCardProps {
  action: ResponseAction;
  onOpenDetail: (action: ResponseAction) => void;
  onApprove: (action: ResponseAction) => void;
  onReject: (action: ResponseAction) => void;
  isProcessing?: boolean;
}

export function ResponseQueueCard({
  action,
  onOpenDetail,
  onApprove,
  onReject,
  isProcessing = false,
}: ResponseQueueCardProps) {
  const getCategoryIcon = (category: ResponseCategory) => {
    switch (category) {
      case "REVOKE_SESSION":
        return <LogOut className="w-4 h-4 text-rose-400" />;
      case "BLOCK_IP":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case "BLOCK_URL":
        return <Globe className="w-4 h-4 text-orange-400" />;
      case "QUARANTINE_EMAIL":
        return <Mail className="w-4 h-4 text-amber-400" />;
      case "RESET_CREDENTIAL":
        return <Key className="w-4 h-4 text-yellow-400" />;
      case "REQUIRE_MFA":
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case "FLAG_MEDIA":
        return <ScanFace className="w-4 h-4 text-purple-400" />;
      case "WARN_USER":
        return <AlertTriangle className="w-4 h-4 text-amber-300" />;
      case "NOTIFY_SOC":
      case "NOTIFY_ADMIN":
        return <Radio className="w-4 h-4 text-blue-400" />;
      case "ESCALATE_INCIDENT":
        return <Layers className="w-4 h-4 text-violet-400" />;
      case "MONITOR":
      default:
        return <Activity className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getPriorityBadgeClass = (priority: ResponseAction["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "HIGH":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "LOW":
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  const getStatusBadge = (status: ResponseAction["status"]) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            PENDING APPROVAL
          </span>
        );
      case "APPROVED":
      case "EXECUTING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Activity className="w-3 h-3 text-cyan-400 animate-spin" />
            EXECUTING
          </span>
        );
      case "SIMULATED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            SIMULATED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3 text-rose-400" />
            REJECTED
          </span>
        );
      case "RECOMMENDED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <FileCheck2 className="w-3 h-3 text-blue-400" />
            RECOMMENDED
          </span>
        );
    }
  };

  const isPending = action.status === "PENDING_APPROVAL" || action.status === "RECOMMENDED";
  const isExecuted = action.status === "SIMULATED" || action.status === "COMPLETED";

  return (
    <div
      className={`rounded-xl p-5 border transition-all space-y-4 shadow-xl ${
        action.priority === "CRITICAL"
          ? "border-rose-500/30 bg-[#11131B] hover:border-rose-500/50"
          : action.priority === "HIGH"
          ? "border-amber-500/30 bg-[#11131B] hover:border-amber-500/50"
          : "border-white/[0.08] bg-[#11131B] hover:border-[#39DCE5]/40"
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-[#171923] border border-white/[0.08] flex items-center justify-center shrink-0">
            {getCategoryIcon(action.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171923] border border-white/[0.08] text-[#9CA3B5]">
                {action.incidentId}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getPriorityBadgeClass(
                  action.priority
                )}`}
              >
                {action.priority} PRIORITY
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#39DCE5]/10 text-[#39DCE5] border border-[#39DCE5]/20">
                {action.category.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#F5F5FA] tracking-tight mt-1">
              {action.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(action.status)}
          {action.requiresApproval && isPending && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
              APPROVAL REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* Description & Target */}
      <div className="space-y-2 text-xs">
        <p className="text-[#9CA3B5] leading-relaxed font-normal">
          {action.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[#9CA3B5] font-mono text-[11px]">TARGET:</span>
          <span className="font-mono px-2 py-0.5 rounded bg-[#171923] border border-white/[0.08] text-[#39DCE5] text-[11px] truncate max-w-md">
            [{action.target.type}] {action.target.value}
          </span>
          {action.target.label && (
            <span className="text-[#9CA3B5] text-[11px] font-mono">
              ({action.target.label})
            </span>
          )}
        </div>
      </div>

      {/* Correlated Evidence Pills */}
      {action.evidence.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-mono uppercase text-[#9CA3B5] font-semibold">
            Correlated Evidence Basis:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {action.evidence.slice(0, 2).map((ev, i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 rounded bg-[#171923] border border-white/[0.05] text-[11px] font-mono text-[#F5F5FA] truncate"
              >
                • {ev}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potential Impact Callout */}
      <div className="p-2.5 rounded-lg bg-[#171923]/60 border border-white/[0.04] text-[11px] text-[#9CA3B5] flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-[#39DCE5] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#F5F5FA]">Expected Impact: </strong>
          {action.potentialImpact}
        </span>
      </div>

      {/* Rejection / Completed note if present */}
      {action.status === "REJECTED" && action.rejectionReason && (
        <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 space-y-0.5">
          <span className="font-bold text-[11px] font-mono block">REJECTION NOTE:</span>
          <p>{action.rejectionReason}</p>
        </div>
      )}

      {isExecuted && action.result && (
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SIMULATION OUTCOME:</span>
          </div>
          <p>{action.result}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Mode:</span>
          <span className="text-emerald-300 font-semibold">{action.executionMode}</span>
          <span>•</span>
          <span>Source:</span>
          <span className="text-slate-300">{action.source}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenDetail(action)}
            className="text-xs font-mono"
          >
            Review Forensic Dossier
          </Button>

          {isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(action)}
                disabled={isProcessing}
                className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(action)}
                disabled={isProcessing}
                className="text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {action.requiresApproval ? "Approve & Simulate" : "Simulate Action"}
              </Button>
            </>
          )}

          {isExecuted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetail(action)}
              className="text-xs font-mono text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              Inspect Simulation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
