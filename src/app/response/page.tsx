"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import {
  ShieldAlert,
  Filter,
  Search,
  Inbox,
  AlertTriangle,
  RotateCcw,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { responseStore } from "@/lib/security/response/response-store";
import {
  ResponseAction,
  ResponseMetrics,
  ResponseAuditLog,
  ResponseScenarioId,
} from "@/lib/security/response/types";
import { ResponseMetricsRibbon } from "@/components/response/ResponseMetricsRibbon";
import { ResponseQueueCard } from "@/components/response/ResponseQueueCard";
import { ResponseDetailModal } from "@/components/response/ResponseDetailModal";
import { ResponseScenarioRunner } from "@/components/response/ResponseScenarioRunner";
import { ResponseAuditTable } from "@/components/response/ResponseAuditTable";
import { Button } from "@/components/ui/Button";

function ResponsePageContent() {
  const searchParams = useSearchParams();
  const urlIncidentId = searchParams.get("incidentId");

  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [metrics, setMetrics] = useState<ResponseMetrics>({
    totalActions: 0,
    pendingApproval: 0,
    approvalRequired: 0,
    inProgress: 0,
    completed: 0,
    simulated: 0,
    failed: 0,
    rejected: 0,
    highRiskAwaitingAction: 0,
  });
  const [auditLogs, setAuditLogs] = useState<ResponseAuditLog[]>([]);

  // Filtering state
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>(urlIncidentId || "");
  const [selectedAction, setSelectedAction] = useState<ResponseAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshData = () => {
    setActions(
      responseStore.getActions({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        search: searchQuery.trim() || undefined,
      })
    );
    setMetrics(responseStore.getMetrics());
    setAuditLogs(responseStore.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
  }, [statusFilter, priorityFilter, searchQuery]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = async (action: ResponseAction, note?: string) => {
    setIsProcessing(true);
    try {
      const { execution } = await responseStore.approveAction(
        action.id,
        "Security Analyst (Active Console)",
        note
      );
      refreshData();
      showToast(`Action approved: ${execution.message}`);
    } catch (err: any) {
      alert(`Approval error: ${err?.message || "Execution failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (action: ResponseAction, reason: string) => {
    setIsProcessing(true);
    try {
      responseStore.rejectAction(
        action.id,
        "Security Analyst (Active Console)",
        reason
      );
      refreshData();
      showToast(`Action rejected with note: ${reason}`);
    } catch (err: any) {
      alert(`Rejection error: ${err?.message || "Rejection failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInjectScenario = async (scenarioId: ResponseScenarioId) => {
    setIsProcessing(true);
    try {
      const result = await responseStore.injectScenario(scenarioId);
      refreshData();
      if (result.actions.length > 0) {
        showToast(
          `Injected ${scenarioId}: Generated ${result.actions.length} response action(s) for incident ${result.incident?.id}`
        );
      } else {
        showToast(`Safe Event injected: 0 response actions generated (Baseline normal).`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    responseStore.resetStore();
    refreshData();
    showToast("Response store reset to baseline state.");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-cyan-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTELLIGENT REMEDIATION ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Response Center
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Review, approve and track security response actions. Converts correlated detections
            from Phishing, Account Takeovers, and Deepfakes into governed defensive playbooks
            with mandatory human-in-the-loop oversight.
          </p>
        </div>
      </div>

      {/* Demo Scenario Runner */}
      <ResponseScenarioRunner
        onInjectScenario={handleInjectScenario}
        onReset={handleReset}
        isLoading={isProcessing}
      />

      {/* Metrics Ribbon */}
      <ResponseMetricsRibbon metrics={metrics} />

      {/* Controls & Filters */}
      <div className="glass-panel rounded-xl p-4 border border-white/[0.08] bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, incident ID (INC-xxx), target or category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Status:</span>
            {["ALL", "PENDING_APPROVAL", "SIMULATED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-black/40 text-slate-400 border border-white/[0.06] hover:text-white"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Priority:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                  priorityFilter === pr
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-black/40 text-slate-400 border border-white/[0.06] hover:text-white"
                }`}
              >
                {pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response Action Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Action Queue ({actions.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {metrics.approvalRequired} High-Impact Action(s) Require Approval
          </span>
        </div>

        {actions.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/[0.08] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/[0.08] text-slate-500 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-emerald-400/80" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">
                No response actions currently require attention.
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                CYBERGUARD has no security response actions requiring attention.
                Run a scenario above or inject threat telemetry from Monitor, Identity, or Phishing modules.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInjectScenario("account-takeover")}
                className="text-xs font-mono text-rose-300 border-rose-500/40"
              >
                Simulate Account Takeover
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInjectScenario("phishing")}
                className="text-xs font-mono text-orange-300 border-orange-500/40"
              >
                Simulate Phishing Threat
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {actions.map((act) => (
              <ResponseQueueCard
                key={act.id}
                action={act}
                onOpenDetail={(a) => setSelectedAction(a)}
                onApprove={(a) => handleApprove(a)}
                onReject={(a) => setSelectedAction(a)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>

      {/* Decision Audit Trail */}
      <ResponseAuditTable logs={auditLogs} />

      {/* Detail & Approval Modal */}
      {selectedAction && (
        <ResponseDetailModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default function ResponsePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-cyan-400 font-mono text-sm">Loading Response Center...</div>}>
        <ResponsePageContent />
      </Suspense>
    </AppShell>
  );
}
