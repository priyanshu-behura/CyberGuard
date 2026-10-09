"use client";

import React, { useState } from "react";
import { ResponseAction } from "@/lib/security/response/types";
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  FileText,
  Terminal,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResponseDetailModalProps {
  action: ResponseAction | null;
  onClose: () => void;
  onApprove: (action: ResponseAction, note?: string) => Promise<void>;
  onReject: (action: ResponseAction, reason: string) => Promise<void>;
}

export function ResponseDetailModal({
  action,
  onClose,
  onApprove,
  onReject,
}: ResponseDetailModalProps) {
  const [analystNote, setAnalystNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!action) return null;

  const isPending = action.status === "PENDING_APPROVAL" || action.status === "RECOMMENDED";
  const isSimulated = action.status === "SIMULATED" || action.status === "COMPLETED";

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(action, analystNote);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejecting this response action.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject(action, rejectionReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-white/[0.1] bg-[#0a0f1d] shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/[0.06] text-cyan-300 border border-white/[0.08]">
                  {action.incidentId}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  {action.priority} PRIORITY
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {action.category}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                {action.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Target & Scope Dossier */}
          <div className="glass-panel rounded-xl p-4 border border-white/[0.06] bg-black/30 space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Asset & Containment Scope</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">TARGET ENTITY</span>
                <span className="font-mono font-bold text-white text-sm">
                  [{action.target.type}] {action.target.value}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">EXECUTION MODE</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {action.executionMode} (Safely Isolated)
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Evidence Bullets */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Correlated Forensic Evidence</span>
            </div>
            <div className="space-y-1.5">
              {action.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] font-mono text-slate-300"
                >
                  • {ev}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Plain-English Breakdown */}
          <div className="glass-panel rounded-xl p-4 border border-white/[0.06] bg-black/20 space-y-3">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Response Decision Analysis</span>
            </div>

            <div className="space-y-2.5 text-slate-300">
              <div>
                <strong className="text-white block font-mono text-[11px]">1. What happened?</strong>
                <p className="text-slate-400 mt-0.5">{action.whyExplanation.whatHappened}</p>
              </div>

              <div>
                <strong className="text-white block font-mono text-[11px]">2. Why is it risky?</strong>
                <p className="text-slate-400 mt-0.5">{action.whyExplanation.whyRisky}</p>
              </div>

              <div>
                <strong className="text-white block font-mono text-[11px]">3. What should be done?</strong>
                <p className="text-slate-400 mt-0.5">{action.whyExplanation.whatShouldBeDone}</p>
              </div>

              <div>
                <strong className="text-white block font-mono text-[11px]">4. Potential impact if approved:</strong>
                <p className="text-amber-300 mt-0.5">{action.whyExplanation.whatHappensIfApproved}</p>
              </div>
            </div>
          </div>

          {/* Simulated Execution / Real Disclaimer */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-slate-300 space-y-1">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-cyan-300">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>PRODUCTION INTEGRATION NOTICE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              CYBERGUARD operates in prototype simulation mode. Approving this response executes a verified mock
              containment procedure and updates the incident state. In a connected production environment,
              API hooks to firewalls (Palo Alto, Cloudflare), IdP providers (Okta, Azure AD), or mail gateways would enforce this action.
            </p>
          </div>

          {/* If already simulated */}
          {isSimulated && action.result && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SIMULATED CONTAINMENT COMPLETED</span>
              </div>
              <p className="text-slate-300 font-mono text-xs">{action.result}</p>
              <div className="text-[10px] font-mono text-slate-400">
                Executed at: {action.completedAt || action.executedAt} • Performed by: {action.approvedBy || "Security Analyst"}
              </div>
            </div>
          )}

          {/* If rejected */}
          {action.status === "REJECTED" && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>RESPONSE ACTION REJECTED</span>
              </div>
              <p className="text-slate-300 text-xs font-mono">
                Reason: {action.rejectionReason || "No explicit reason provided"}
              </p>
              <div className="text-[10px] font-mono text-slate-400">
                Rejected by: {action.rejectedBy}
              </div>
            </div>
          )}

          {/* Approval Action Form (Only if Pending) */}
          {isPending && (
            <div className="pt-2 border-t border-white/[0.08] space-y-3">
              {!showRejectForm ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Analyst Decision Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={analystNote}
                      onChange={(e) => setAnalystNote(e.target.value)}
                      placeholder="e.g. Confirmed anomaly with affected user. Approving containment."
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectForm(true)}
                      className="text-xs font-mono text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      Reject Action
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      {action.requiresApproval ? "Approve & Execute (Simulated)" : "Execute Response"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <div className="text-xs font-mono font-bold text-rose-300">
                    Reject Response Action
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. False positive: legitimate executive travel verified via phone call."
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRejectForm(false)}
                      className="text-xs font-mono text-slate-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      disabled={isSubmitting || !rejectionReason.trim()}
                      className="text-xs font-mono bg-rose-600 hover:bg-rose-500 text-white border-rose-500"
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
