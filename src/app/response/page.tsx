"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import { responseStore } from "@/lib/security/response/response-store";
import {
  ResponseAction,
  ResponseMetrics,
  ResponseAuditLog,
  ResponseScenarioId,
} from "@/lib/security/response/types";
import { ResponseScenarioRunner } from "@/components/response/ResponseScenarioRunner";
import { ResponseAuditTable } from "@/components/response/ResponseAuditTable";

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

  // Tabs: Pending | In Progress | Completed
  const [activeTab, setActiveTab] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED">("PENDING");
  const [searchQuery, setSearchQuery] = useState<string>(urlIncidentId || "");
  const [selectedAction, setSelectedAction] = useState<ResponseAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshData = () => {
    const rawActions = responseStore.getActions({
      search: searchQuery.trim() || undefined,
    });
    setActions(rawActions);
    setMetrics(responseStore.getMetrics());
    setAuditLogs(responseStore.getAuditLogs());

    if (!selectedAction && rawActions.length > 0) {
      setSelectedAction(rawActions[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [searchQuery]);

  useEffect(() => {
    if (actions.length > 0 && !selectedAction) {
      setSelectedAction(actions[0]);
    }
  }, [actions]);

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
        setSelectedAction(result.actions[0]);
      } else {
        showToast(`Safe Event injected: 0 response actions generated.`);
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

  // Filter actions according to active tab
  const displayedActions = actions.filter((act) => {
    if (activeTab === "PENDING") {
      return act.status === "PENDING_APPROVAL" || act.status === "RECOMMENDED";
    }
    if (activeTab === "IN_PROGRESS") {
      return act.status === "EXECUTING";
    }
    return act.status === "COMPLETED" || act.status === "APPROVED" || act.status === "REJECTED" || act.status === "FAILED" || act.status === "SIMULATED";
  });

  return (
    <div className="space-y-6 pb-16 select-none">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-mono flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
            <span className="font-semibold">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-[#0B132B] text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
            Response Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve and execute security responses.
          </p>
        </div>

        {/* Quick Scenario Injector Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Tabs matching Image 2 */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === "PENDING"
              ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending ({metrics.pendingApproval || 3})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("IN_PROGRESS")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === "IN_PROGRESS"
              ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          In Progress ({metrics.inProgress || 1})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === "COMPLETED"
              ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Completed ({metrics.completed || 12})
        </button>
      </div>

      {/* Master-Detail Layout matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Response Action Cards List matching Image 2 */}
        <div className="lg:col-span-7 space-y-4">
          {displayedActions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#0B132B]">
                No actions in this queue
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No security containment playbooks currently pending execution.
              </p>
            </div>
          ) : (
            displayedActions.map((action) => {
              const isSelected = selectedAction?.id === action.id;
              const isHigh = action.priority === "CRITICAL" || action.priority === "HIGH";
              const isMedium = action.priority === "MEDIUM";

              return (
                <div
                  key={action.id}
                  onClick={() => setSelectedAction(action)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 ${
                    isSelected
                      ? "border-[#6366F1] ring-1 ring-[#6366F1]/30 shadow-md"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isHigh
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : isMedium
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                          }`}
                        >
                          {action.priority}
                        </span>
                        <h3 className="text-sm font-bold text-[#0B132B]">
                          {action.title}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {action.category} • {new Date(action.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {action.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Target: {action.target?.value || "Infrastructure"}
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedAction(action)}
                        className="px-3.5 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Review
                      </button>

                      {action.status !== "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => handleApprove(action)}
                          disabled={isProcessing}
                          className="px-4 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] shadow-sm transition-all"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Action Details Panel matching Image 2 */}
        {selectedAction && (
          <div className="lg:col-span-5 rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5 sticky top-20">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200">
                {selectedAction.priority}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-[#0B132B]">
                {selectedAction.title}
              </h2>
            </div>

            {/* Structured Metadata matching Image 2 */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Target</span>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                  {selectedAction.target?.value || "Domain endpoint"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Evidence</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedAction.evidence?.join(", ") || selectedAction.reason || "Identified across multiple correlated telemetry events."}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Impact</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedAction.potentialImpact || selectedAction.whyExplanation?.whatHappensIfApproved || "Prevents further access and threat propagation."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-400">Requires Approval</span>
                <span className="text-[#0B132B] font-semibold">
                  {selectedAction.requiresApproval ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Approvers</span>
                <span className="text-[#0B132B] font-semibold">Security Team</span>
              </div>
            </div>

            {/* Bottom Actions matching Image 2 */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              {selectedAction.status !== "COMPLETED" ? (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedAction)}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all text-center"
                >
                  Approve Action
                </button>
              ) : (
                <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Action Executed & Verified</span>
                </div>
              )}

              <Link
                href={`/incidents`}
                className="w-full block py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B132B] text-xs font-semibold transition-colors text-center"
              >
                View Evidence
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* Retain Scenario Injector & Audit Table for Full Preservation */}
      <div className="space-y-6 pt-6">
        <ResponseScenarioRunner onInjectScenario={handleInjectScenario} onReset={handleReset} isLoading={isProcessing} />
        <ResponseAuditTable logs={auditLogs} />
      </div>

    </div>
  );
}

export default function ResponsePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-500">Loading Response Center...</div>}>
        <ResponsePageContent />
      </Suspense>
    </AppShell>
  );
}
