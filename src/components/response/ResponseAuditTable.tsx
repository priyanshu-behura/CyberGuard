"use client";

import React, { useState } from "react";
import { ResponseAuditLog } from "@/lib/security/response/types";
import { Shield, Clock, CheckCircle2, XCircle, FileText, Filter } from "lucide-react";

interface ResponseAuditTableProps {
  logs: ResponseAuditLog[];
}

export function ResponseAuditTable({ logs }: ResponseAuditTableProps) {
  const [filterDecision, setFilterDecision] = useState<string>("ALL");

  const filtered = logs.filter((log) => {
    if (filterDecision === "ALL") return true;
    return log.decision === filterDecision;
  });

  if (logs.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 border border-white/[0.06] text-center space-y-2">
        <Clock className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">No Audit Log Records</h4>
        <p className="text-xs text-slate-400">
          Decisions to approve, reject, or simulate containment actions will be recorded in this tamper-evident trail.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl border border-white/[0.08] bg-slate-900/60 overflow-hidden space-y-3 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white font-mono uppercase">
            Analyst Decision & Simulation Audit Trail
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-400">Filter:</span>
          {["ALL", "EXECUTED_SIMULATION", "REJECTED"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDecision(d)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all ${
                filterDecision === d
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-black/40 text-slate-400 border border-white/[0.06] hover:text-white"
              }`}
            >
              {d.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 text-[10px] uppercase">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Incident</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Decision</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Result / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleTimeString();
              const isExec = log.decision === "EXECUTED_SIMULATION" || log.decision === "EXECUTED_REAL";
              const isRej = log.decision === "REJECTED";

              return (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {dateStr}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold whitespace-nowrap">
                    {log.incidentId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-semibold max-w-xs truncate">
                    {log.actionTitle}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {isExec && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        SIMULATED
                      </span>
                    )}
                    {isRej && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        REJECTED
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-sm truncate">
                    {log.reason || log.result}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
