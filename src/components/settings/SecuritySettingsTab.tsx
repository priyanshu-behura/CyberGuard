"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Clock,
  Laptop,
  Smartphone,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { SecurityAuthSettings, SessionTimeoutMinutes } from "@/lib/settings/types";
import { useAuth } from "@/lib/auth/auth-context";
import { monitorStore } from "@/lib/security/monitor/monitor-store";

interface SecuritySettingsTabProps {
  security: SecurityAuthSettings;
  onSave: (data: Partial<SecurityAuthSettings>) => void;
}

export function SecuritySettingsTab({ security, onSave }: SecuritySettingsTabProps) {
  const { session } = useAuth();
  const [enforceMfa, setEnforceMfa] = useState(security.enforceMfaPrompt);
  const [timeout, setTimeoutVal] = useState<SessionTimeoutMinutes>(security.sessionTimeoutMinutes);
  const [highImpactConfirm, setHighImpactConfirm] = useState(security.requireHighImpactConfirmation);
  const [rememberDevices, setRememberDevices] = useState(security.rememberDeviceTokens);
  const [isSaved, setIsSaved] = useState(false);
  const [sessionsRevokedMessage, setSessionsRevokedMessage] = useState<string | null>(null);

  const activeSessions = monitorStore.getActiveSessions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      enforceMfaPrompt: enforceMfa,
      sessionTimeoutMinutes: timeout,
      requireHighImpactConfirmation: highImpactConfirm,
      rememberDeviceTokens: rememberDevices,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRevokeOtherSessions = () => {
    let count = 0;
    for (const s of activeSessions) {
      if (s.sessionId !== "sess-primary-mac" && !s.isRevoked) {
        monitorStore.revokeSession(s.sessionId);
        count++;
      }
    }
    setSessionsRevokedMessage(
      count > 0
        ? `Successfully terminated ${count} remote session(s).`
        : "All other remote sessions already revoked."
    );
    setTimeout(() => setSessionsRevokedMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Session Security Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-5">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Session Lifespan & Authorization Controls
        </h3>

        <div className="space-y-4">
          {/* Timeout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Session Inactivity Timeout
              </span>
              <span className="text-[11px] text-slate-400">
                Automatically disconnect security console after idle duration.
              </span>
            </div>
            <select
              value={timeout}
              onChange={(e) => setTimeoutVal(Number(e.target.value) as SessionTimeoutMinutes)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes (Standard)</option>
              <option value={240}>4 Hours (Extended)</option>
            </select>
          </div>

          {/* MFA Prompt */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Mandatory Step-Up MFA on Anomalous Sign-In
              </span>
              <span className="text-[11px] text-slate-400">
                Prompt for hardware token or authenticator app when location or device drifts from baseline.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enforceMfa}
              onChange={(e) => setEnforceMfa(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
            />
          </div>

          {/* High Impact Confirmation */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Response Action Confirmation Barrier
              </span>
              <span className="text-[11px] text-slate-400">
                Require secondary confirmation dialog before executing IP bans, session revokes, or domain blocks.
              </span>
            </div>
            <input
              type="checkbox"
              checked={highImpactConfirm}
              onChange={(e) => setHighImpactConfirm(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
            />
          </div>

          {/* Remember Trusted Devices */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Remember Fingerprinted Trusted Hardware
              </span>
              <span className="text-[11px] text-slate-400">
                Store device telemetry in local baseline to reduce redundant false alerts.
              </span>
            </div>
            <input
              type="checkbox"
              checked={rememberDevices}
              onChange={(e) => setRememberDevices(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-slate-500">
            Authorization preferences enforced across active modules
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Preferences Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Security Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Session Telemetry */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-white">
              Active Security Console Sessions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current authenticated instances recorded in telemetry.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRevokeOtherSessions}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium transition-colors"
          >
            Revoke All Other Sessions
          </button>
        </div>

        {sessionsRevokedMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            {sessionsRevokedMessage}
          </div>
        )}

        <div className="space-y-2">
          {activeSessions.map((s) => (
            <div
              key={s.sessionId}
              className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white font-mono flex items-center gap-2">
                    <span>{s.deviceName}</span>
                    {s.sessionId === "sess-primary-mac" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {s.sessionId}
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    s.isRevoked
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {s.isRevoked ? "REVOKED" : "ACTIVE"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
