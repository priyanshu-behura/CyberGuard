"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { useAuth } from "@/lib/auth/auth-context";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  KeyRound,
  Lock,
  Activity,
  UserCheck,
  AlertTriangle,
  Terminal,
  Settings,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  FileText,
  Sliders,
  Radio,
  Eye,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "analyst" | "sensor";
  status: "Active" | "MFA Enforced" | "Suspended";
  lastLogin: string;
  ip: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  identity: string;
  ip: string;
  severity: "INFO" | "AUDIT" | "HIGH";
  traceHash: string;
}

export default function AdminPage() {
  const { user, signIn } = useAuth();
  const isAdmin = user?.role === "admin";

  // Policy toggles
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [tenantRestricted, setTenantRestricted] = useState(false);
  const [lockdownMode, setLockdownMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Managed Users Mock Directory
  const [usersList, setUsersList] = useState<AdminUser[]>([
    {
      id: "usr_admin_master",
      name: "System Administrator",
      email: "admin@cyberguard.security",
      role: "admin",
      status: "Active",
      lastLogin: "Just now",
      ip: "127.0.0.1 (Localhost)",
    },
    {
      id: "usr_analyst_01",
      name: "Alex Mercer",
      email: "alex.mercer@cyberguard.internal",
      role: "analyst",
      status: "MFA Enforced",
      lastLogin: "24 mins ago",
      ip: "192.168.1.149",
    },
    {
      id: "usr_analyst_02",
      name: "Dr. Elena Rostova",
      email: "e.rostova@cyberguard.internal",
      role: "analyst",
      status: "Active",
      lastLogin: "3 hours ago",
      ip: "10.0.4.88",
    },
    {
      id: "usr_sensor_ai",
      name: "Sentinel Telemetry Ingest",
      email: "daemon-sentinel@node.internal",
      role: "sensor",
      status: "Active",
      lastLogin: "Continuous",
      ip: "127.0.0.1 (Internal Bus)",
    },
  ]);

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: "log_001",
      timestamp: "Today, 18:28:10",
      event: "ADMIN_CONSOLE_ACCESS",
      identity: user?.email || "admin@cyberguard.security",
      ip: "127.0.0.1",
      severity: "AUDIT",
      traceHash: "sha256:7f83b1657ff1...9a0c",
    },
    {
      id: "log_002",
      timestamp: "Today, 17:35:42",
      event: "SESSION_TOKEN_MINTED",
      identity: user?.email || "admin@cyberguard.security",
      ip: "127.0.0.1",
      severity: "INFO",
      traceHash: "sha256:4d617474...2e63",
    },
    {
      id: "log_003",
      timestamp: "Today, 17:31:05",
      event: "OAUTH_GATEWAY_PROBE",
      identity: "Google OAuth Gateway",
      ip: "127.0.0.1",
      severity: "INFO",
      traceHash: "sha256:3b82f6...a109",
    },
    {
      id: "log_004",
      timestamp: "Today, 17:15:20",
      event: "ROUTE_GUARD_INTERCEPT",
      identity: "Unauthenticated Guest",
      ip: "127.0.0.1",
      severity: "HIGH",
      traceHash: "sha256:e1a9...c4b2",
    },
  ];

  const handleElevateToAdmin = async () => {
    const res = await signIn({
      email: "admin@cyberguard.security",
      password: "CyberGuard@Admin2026",
    });
    if (res.success) {
      window.location.reload();
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Admin Header Banner */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-[11px] font-mono font-bold text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ADMIN PRIVILEGE ACCESS</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  SECURITY TIER: ROOT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-white/[0.08]">
                  SOC2 / ISO 27001 AUDITING ACTIVE
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                CYBERGUARD Administration & Governance
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Centralized control plane for managing security analyst credentials, role-based access control (RBAC), authentication policies, and cryptographic session telemetry.
              </p>
            </div>

            {/* Current Admin Account Badge */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-white/[0.08] text-xs font-mono shrink-0 space-y-1.5">
              <div className="text-slate-400 text-[10px] uppercase">Active Root Admin:</div>
              <div className="text-cyan-400 font-semibold">{user?.email || "admin@cyberguard.security"}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Status: Authenticated ({user?.role?.toUpperCase() || "ADMIN"})</span>
              </div>
            </div>
          </div>
        </div>

        {/* If user is not yet logged in as Admin, show elevation banner */}
        {!isAdmin && (
          <div className="glass-panel rounded-xl p-5 border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-white">Elevated Admin Session Required</h2>
                <p className="text-xs text-slate-300">
                  You are currently authenticated as <span className="font-mono text-cyan-300">{user?.email}</span> (role: {user?.role}). Click below to switch to the Root Administrator session.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleElevateToAdmin}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shrink-0 transition-colors"
            >
              Elevate to Root Admin
            </button>
          </div>
        )}

        {/* Master Admin Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Managed Identities</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {usersList.length}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              1 Admin • 2 Analysts • 1 Sensor
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Sessions</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              2 Active
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Cryptographically signed tokens
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Auth Policy Status</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-300 mt-2 font-mono">
              Enforced
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              MFA Active • 15m Timeout
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Audit Trail Integrity</span>
              <Lock className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-xl font-bold text-violet-300 mt-2 font-mono">
              Immutable
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              SHA-256 Event Chain
            </div>
          </div>
        </div>

        {/* Section: User & Identity Directory */}
        <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="p-5 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Managed Security Identities (RBAC)
                </h2>
                <p className="text-xs text-slate-400">
                  Provision, monitor, and revoke credential access across SOC personnel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.08] text-[11px] font-mono text-slate-300">
                Total: {usersList.length} Users
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="px-5 py-3">Analyst / System</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">MFA & Status</th>
                  <th className="px-5 py-3">Origin / IP</th>
                  <th className="px-5 py-3">Last Active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-sans font-medium text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          u.role === "admin"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : u.role === "sensor"
                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{u.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{u.ip}</td>
                    <td className="px-5 py-3.5 text-slate-400">{u.lastLogin}</td>
                    <td className="px-5 py-3.5 text-right">
                      {u.role === "admin" ? (
                        <span className="text-[10px] text-slate-500">Root Protected</span>
                      ) : (
                        <button
                          type="button"
                          className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                          onClick={() => alert(`Session revoked for ${u.name}`)}
                        >
                          Revoke Session
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Platform Policy Enforcement & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Authentication & Access Policies
                </h2>
                <p className="text-xs text-slate-400">
                  Configure real-time security thresholds for all connected clients
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Policy 1: MFA */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-white/[0.06]">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-sans font-medium">
                    Mandatory Multi-Factor Authentication (MFA)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Requires hardware token or TOTP for analysts accessing command tools
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaEnforced(!mfaEnforced)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    mfaEnforced ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Policy 2: Session Timeout */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-white/[0.06]">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-sans font-medium">
                    Idle Session Invalidation Window
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Terminates analyst cookie after period of inactivity
                  </div>
                </div>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="bg-slate-950 border border-white/[0.1] rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="480">8 Hours</option>
                </select>
              </div>

              {/* Policy 3: Google Workspace Restriction */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-white/[0.06]">
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-sans font-medium">
                    OAuth Domain Whitelist Lock
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Restricts Google logins strictly to verified organizational emails
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTenantRestricted(!tenantRestricted)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    tenantRestricted ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Policy 4: Emergency Defense Lockdown */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <div className="space-y-0.5">
                  <div className="text-rose-300 font-sans font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Emergency SOC Lockdown</span>
                  </div>
                  <div className="text-rose-300/80 text-[11px]">
                    Invalidates non-admin sessions and restricts public ingress
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLockdownMode(!lockdownMode)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    lockdownMode ? "bg-rose-500 justify-end" : "bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: OAuth & API Secret Configuration Overview */}
          <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  OAuth & Cryptographic Secrets
                </h2>
                <p className="text-xs text-slate-400">
                  Environment variables status for production authentication
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">NEXT_PUBLIC_GOOGLE_CLIENT_ID:</span>
                  <span className="text-amber-400 font-semibold">Pending (.env.local)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Used by the frontend to redirect to Google accounts sign-in
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GOOGLE_CLIENT_SECRET:</span>
                  <span className="text-amber-400 font-semibold">Protected / Server Only</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Exchanged on callback route for access token verification
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CYBERGUARD_SESSION_SECRET:</span>
                  <span className="text-emerald-400 font-semibold">Configured (Default)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Signs `cyberguard_session` cookie verified by Next.js middleware
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Configure real credentials:</span>
                <Link
                  href="/settings"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Open Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Live Security & Authentication Audit Trail */}
        <div className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Platform Authentication & Security Audit Trail
                </h2>
                <p className="text-xs text-slate-400">
                  Cryptographically hashed chronological log of authentication events and permission escalations
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ● Streaming
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Event Signature</th>
                  <th className="px-5 py-3">Security Identity</th>
                  <th className="px-5 py-3">Source IP</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Cryptographic Trace Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-5 py-3 font-semibold text-white">{log.event}</td>
                    <td className="px-5 py-3 text-cyan-300">{log.identity}</td>
                    <td className="px-5 py-3 text-slate-400">{log.ip}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === "HIGH"
                            ? "bg-rose-500/20 text-rose-300"
                            : log.severity === "AUDIT"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">{log.traceHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
