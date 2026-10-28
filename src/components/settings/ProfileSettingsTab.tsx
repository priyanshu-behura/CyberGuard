"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Briefcase,
  Mail,
  LogOut,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { UserProfileSettings } from "@/lib/settings/types";
import { useAuth } from "@/lib/auth/auth-context";

interface ProfileSettingsTabProps {
  profile: UserProfileSettings;
  onSave: (data: Partial<UserProfileSettings>) => void;
}

export function ProfileSettingsTab({ profile, onSave }: ProfileSettingsTabProps) {
  const { user, signOut, googleOAuthConfig } = useAuth();

  const [displayName, setDisplayName] = useState(
    profile.displayName || user?.name || "Security Analyst"
  );
  const [department, setDepartment] = useState(profile.department);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [securityClearance, setSecurityClearance] = useState(profile.securityClearance);
  const [isSaved, setIsSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName,
      department,
      jobTitle,
      securityClearance,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Identity Card Overview */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xl font-mono shadow-md shadow-cyan-950/40">
            {(user?.name || displayName || "A").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {displayName || user?.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {user?.role || "analyst"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user?.email || "analyst@cyberguard.security"}</span>
            </p>
          </div>
        </div>

        {/* Security Clearance Badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.06] text-right font-mono">
          <span className="text-[10px] uppercase text-slate-500 block">Clearance</span>
          <span className="text-xs font-bold text-cyan-300">{securityClearance}</span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          Operator Metadata & Profile Attributes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Department / Unit
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Duty Role / Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Assigned Security Clearance
            </label>
            <select
              value={securityClearance}
              onChange={(e) => setSecurityClearance(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Level 1 (Analyst)">Level 1 (Analyst)</option>
              <option value="Level 2 (Lead SOC)">Level 2 (Lead SOC)</option>
              <option value="Level 3 (SecOps Admin)">Level 3 (SecOps Admin)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-slate-500">
            Changes persist directly to local platform session
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Google OAuth & Enterprise SSO Status */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
            Enterprise Single-Sign-On (SSO) Status
          </h3>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
              googleOAuthConfig?.isConfigured
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}
          >
            {googleOAuthConfig?.isConfigured ? "GOOGLE SSO CONFIGURED" : "GOOGLE SSO UNCONFIGURED"}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {googleOAuthConfig?.isConfigured
            ? `Google Workspace OAuth is enabled with Client ID ${googleOAuthConfig.clientId?.slice(0, 16)}...`
            : "Google OAuth credentials are not present in server environment (.env.local missing NEXT_PUBLIC_GOOGLE_CLIENT_ID). Standard local session authentication is active."}
        </p>
      </div>

      {/* Logout Control */}
      <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-rose-300 font-mono uppercase">
            Terminate Active Console Session
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Safely log out of CYBERGUARD security console.
          </p>
        </div>

        {showLogoutConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/login";
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Confirm Log Out
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}
