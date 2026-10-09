"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { MonitorSubnav } from "@/components/monitor/MonitorSubnav";
import { AccountStatusBadge } from "@/components/monitor/AccountStatusBadge";
import {
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Laptop,
  Smartphone,
  Globe2,
  Lock,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  LogOut,
  Loader2,
  Radio,
  ExternalLink,
} from "lucide-react";
import {
  AccountSecurityPosture,
  AuthenticationEvent,
  BehaviorBaseline,
  DeviceProfile,
  LocationProfile,
  MonitorAlert,
} from "@/lib/security/monitor/types";

export default function AccountSecurityPage() {
  const [posture, setPosture] = useState<AccountSecurityPosture | null>(null);
  const [baseline, setBaseline] = useState<BehaviorBaseline | null>(null);
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [revokedMessage, setRevokedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/monitor/events");
      const json = await res.json();
      if (json.success && json.data) {
        setPosture(json.data.posture);
        setBaseline(json.data.baseline);
        setEvents(json.data.events);
        setAlerts(json.data.alerts);
      }
    } catch (err) {
      console.error("Failed to load account security posture:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingSessionId(sessionId);
      const res = await fetch("/api/monitor/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", sessionId }),
      });
      const json = await res.json();
      if (json.success) {
        setRevokedMessage(`Session ${sessionId} successfully terminated.`);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to revoke session:", err);
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Derive sessions from recent successful logins vs session revocations
  const revokedSessionIds = new Set(
    events
      .filter((e) => e.eventType === "SESSION_REVOKED" && e.sessionId)
      .map((e) => e.sessionId as string)
  );

  // Synthesize active sessions: Primary local session + any active login sessions not yet revoked
  const activeSessions = [
    {
      id: "sess-primary-mac",
      deviceName: "Apple MacBook Pro (M2)",
      browser: "Chrome 128.0",
      ipAddress: "103.24.182.10",
      location: "Bhubaneswar, India",
      startedAt: "Active now (Current device)",
      isCurrent: true,
      isSuspicious: false,
    },
  ];

  // Add foreign sessions from recent successful events if not revoked
  const recentSuccessfulEvents = events.filter(
    (e) => (e.eventType === "LOGIN" || e.eventType === "SESSION_CREATED") && e.success && e.sessionId
  );

  for (const ev of recentSuccessfulEvents) {
    if (ev.sessionId && !revokedSessionIds.has(ev.sessionId) && ev.sessionId !== "sess-primary-mac") {
      // Check if this session was from an unrecognized location or device
      const isKnownDevice = baseline?.knownDevices.some((d) => d.deviceId === ev.deviceId);
      const isKnownLoc = baseline?.knownLocations.some((l) => l.city === ev.location.city);
      const isSuspicious = !isKnownDevice || !isKnownLoc;

      if (!activeSessions.some((s) => s.id === ev.sessionId)) {
        activeSessions.push({
          id: ev.sessionId,
          deviceName: ev.deviceName,
          browser: ev.browser,
          ipAddress: ev.ipAddress,
          location: `${ev.location.city}, ${ev.location.country}`,
          startedAt: new Date(ev.timestamp).toLocaleTimeString(),
          isCurrent: false,
          isSuspicious,
        });
      }
    }
  }

  // Find any foreign devices from recent events
  const foreignDevices = events
    .filter((e) => {
      const isKnown = baseline?.knownDevices.some((d) => d.deviceId === e.deviceId);
      return !isKnown;
    })
    .map((e) => ({
      deviceId: e.deviceId,
      deviceName: e.deviceName,
      deviceType: e.deviceType,
      browser: e.browser,
      os: e.os,
      firstSeen: e.timestamp,
      lastSeen: e.timestamp,
      isTrusted: false,
      totalLogins: 1,
    }))
    .filter(
      (v, i, a) => a.findIndex((t) => t.deviceId === v.deviceId) === i
    );

  // Find any foreign locations from recent events
  const foreignLocations = events
    .filter((e) => {
      const isKnown = baseline?.knownLocations.some((l) => l.city === e.location.city);
      return !isKnown;
    })
    .map((e) => ({
      city: e.location.city,
      country: e.location.country,
      firstSeen: e.timestamp,
      lastSeen: e.timestamp,
      loginCount: 1,
    }))
    .filter(
      (v, i, a) => a.findIndex((t) => t.city === v.city) === i
    );

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Navigation */}
        <MonitorSubnav />

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                Identity & Access Governance
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Account Security Posture
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl font-normal">
                Cryptographic device fingerprints, geographic baselines, and active session
                invalidation controls for analyst credentials.
              </p>
            </div>

            {posture && (
              <div className="flex flex-col items-start md:items-end gap-2">
                <AccountStatusBadge status={posture.status} size="lg" />
                <span className="text-xs font-mono text-slate-400">
                  Last Evaluated: {new Date(posture.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Revocation Success Banner */}
        {revokedMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{revokedMessage}</span>
            </div>
            <button
              onClick={() => setRevokedMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section: Active Sessions & Immediate Invalidation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Active Authenticated Sessions
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activeSessions.length} active session(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                className={`rounded-2xl p-5 border transition-all ${
                  sess.isSuspicious
                    ? "bg-gradient-to-br from-rose-950/25 via-slate-900/90 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/20"
                    : "glass-panel border-white/[0.08]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        sess.isSuspicious
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      }`}
                    >
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {sess.deviceName}
                        </span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                            THIS DEVICE
                          </span>
                        )}
                        {sess.isSuspicious && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            UNRECOGNIZED / FOREIGN
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {sess.browser}
                      </span>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      disabled={revokingSessionId === sess.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {revokingSessionId === sess.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      <span>Revoke Session</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">
                      Origin IP
                    </span>
                    <span className="text-slate-200">{sess.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">
                      Location
                    </span>
                    <span className="text-slate-200">{sess.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">
                      Session ID
                    </span>
                    <span className="text-slate-400 truncate block">{sess.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">
                      Activity Time
                    </span>
                    <span className="text-slate-300">{sess.startedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Known & Trusted Hardware Fingerprints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Hardware Device Context
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {(baseline?.knownDevices.length || 0) + foreignDevices.length} observed devices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Trusted Baseline Devices */}
            {baseline?.knownDevices.map((dev) => (
              <div
                key={dev.deviceId}
                className="rounded-2xl glass-panel p-4 border border-emerald-500/20 bg-slate-900/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      {dev.deviceType === "Mobile" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white">{dev.deviceName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    TRUSTED
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>OS: {dev.os} • {dev.browser}</div>
                  <div>Total Logins: {dev.totalLogins} events</div>
                  <div className="text-[10px] text-slate-500">
                    First seen: {new Date(dev.firstSeen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Foreign / Unrecognized Devices */}
            {foreignDevices.map((dev) => (
              <div
                key={dev.deviceId}
                className="rounded-2xl p-4 border border-rose-500/40 bg-rose-950/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{dev.deviceName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                    UNRECOGNIZED
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                  <div>OS: {dev.os} • {dev.browser}</div>
                  <div className="text-rose-300 font-bold">
                    First observed: {new Date(dev.firstSeen).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Geographic Access Footprint */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                Geographic Access Footprint
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {(baseline?.knownLocations.length || 0) + foreignLocations.length} locations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Known Locations */}
            {baseline?.knownLocations.map((loc) => (
              <div
                key={loc.city}
                className="rounded-2xl glass-panel p-4 border border-cyan-500/20 bg-slate-900/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      {loc.city}, {loc.country}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                    BASELINE
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  <div>Frequency: {loc.loginCount} successful sign-ins</div>
                  <div className="text-[10px] text-slate-500">
                    Primary operational hub for this account
                  </div>
                </div>
              </div>
            ))}

            {/* Foreign Locations */}
            {foreignLocations.map((loc) => (
              <div
                key={loc.city}
                className="rounded-2xl p-4 border border-amber-500/40 bg-amber-950/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {loc.city}, {loc.country}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                    UNUSUAL GEO
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300">
                  <div>New origin outside historical baseline</div>
                  <div className="text-[10px] text-amber-300">
                    Observed: {new Date(loc.firstSeen).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Defensive Response Recommendations */}
        {posture && posture.recommendedResponse.length > 0 && (
          <div className="rounded-2xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/80 to-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                Defensive Hardening Playbook
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {posture.recommendedResponse.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] text-xs text-slate-200 font-mono flex items-start gap-2"
                >
                  <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
