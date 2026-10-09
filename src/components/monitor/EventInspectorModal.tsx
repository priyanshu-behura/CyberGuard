"use client";

import React from "react";
import {
  X,
  Shield,
  Laptop,
  Globe2,
  Calendar,
  Lock,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AuthenticationEvent } from "@/lib/security/monitor/types";

interface EventInspectorModalProps {
  event: AuthenticationEvent | null;
  onClose: () => void;
}

export function EventInspectorModal({ event, onClose }: EventInspectorModalProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-white/[0.1] bg-[#0c121e] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                event.success
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
              }`}
            >
              {event.success ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">
                  {event.eventType}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    event.success
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {event.success ? "SUCCESS" : "FAILURE"}
                </span>
                {event.isDemo && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    DEMO DATA
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                ID: {event.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Identity & Origin Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" /> Account Target
              </span>
              <p className="text-xs font-semibold text-white font-mono">
                {event.userEmail}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                UID: {event.userId}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-cyan-400" /> Recorded Timestamp
              </span>
              <p className="text-xs font-semibold text-white font-mono">
                {new Date(event.timestamp).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Auth Method: {event.authenticationMethod.toUpperCase()}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                <Globe2 className="w-3 h-3 text-cyan-400" /> Network & Origin
              </span>
              <p className="text-xs font-semibold text-white font-mono">
                {event.ipAddress}
              </p>
              <p className="text-[11px] text-slate-300">
                {event.location.city}, {event.location.country}
                {event.location.latitude &&
                  ` (${event.location.latitude.toFixed(2)}, ${event.location.longitude?.toFixed(2)})`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                <Laptop className="w-3 h-3 text-cyan-400" /> Hardware & Client
              </span>
              <p className="text-xs font-semibold text-white">
                {event.deviceName} ({event.deviceType})
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {event.browser} • {event.os}
              </p>
            </div>
          </div>

          {/* Session & Resource Metadata */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Session & Context Telemetry
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-400">Session ID:</span>{" "}
                <span className="text-slate-200">{event.sessionId || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400">Resource Target:</span>{" "}
                <span className="text-cyan-300">{event.resource || "/"}</span>
              </div>
              {event.failureReason && (
                <div className="col-span-2 text-rose-300">
                  <span className="text-slate-400">Failure Reason:</span>{" "}
                  {event.failureReason}
                </div>
              )}
            </div>
          </div>

          {/* Raw JSON Payload */}
          <div className="rounded-xl bg-slate-950 p-3.5 border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Raw Telemetry Object (Sanitized)
            </span>
            <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto p-2 bg-slate-900/40 rounded-lg">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
