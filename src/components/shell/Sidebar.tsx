"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Plus,
  Bot,
  BrainCircuit,
  ShieldCheck,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Settings,
  Mail,
  Fingerprint,
  Search,
  ScanFace,
  X,
  FileCode,
  GitFork,
  Radio,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user?.name || "Priyanshu Behura";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B0E17] text-white w-64 select-none border-r border-[#171B26]">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 fill-white/20 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-widest text-[#F5F5FA]">
            CYBERGUARD
          </span>
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
        {/* + New Chat Button matching Image 2 */}
        <Link
          href="/ai"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E6] hover:to-[#7C4EE8] text-white text-xs font-semibold tracking-wide shadow-md shadow-indigo-500/25 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Chat</span>
        </Link>

        {/* AI Group matching Image 2 */}
        <div className="space-y-1">
          <Link
            href="/ai"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              pathname === "/ai"
                ? "bg-[#1E2235] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Bot className="w-4 h-4 text-[#8B5CF6]" />
            <span>AI Center</span>
          </Link>

          <Link
            href="/ai?mode=general"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-[#6366F1]" />
            <span>General AI</span>
          </Link>

          <Link
            href="/ai?mode=cybersecurity"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            <span>Cybersecurity Intelligence</span>
          </Link>
        </div>

        {/* Security Group matching Image 2 */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Security
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname === "/dashboard"
                  ? "bg-[#1E2235] text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/monitor"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith("/monitor")
                  ? "bg-[#1E2235] text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Threat Monitor</span>
            </Link>

            <Link
              href="/response"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname === "/response"
                  ? "bg-[#1E2235] text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>Response Center</span>
            </Link>

            <Link
              href="/settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname === "/settings"
                  ? "bg-[#1E2235] text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Saved Sessions matching Image 2 */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Saved Sessions
          </div>
          <div className="space-y-1">
            <Link
              href="/ai?session=email"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">Email Analysis</span>
            </Link>

            <Link
              href="/ai?session=login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
            >
              <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">Login Investigation</span>
            </Link>

            <Link
              href="/ai?session=threat"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">Threat Research</span>
            </Link>

            <Link
              href="/ai?session=deepfake"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
            >
              <ScanFace className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">Deepfake Check</span>
            </Link>
          </div>
        </div>

        {/* Existing Modules Preservation Links */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Deep Modules
          </div>
          <div className="space-y-1">
            <Link
              href="/analyze"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith("/analyze")
                  ? "bg-[#1E2235] text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Threat Analysis</span>
            </Link>

            <Link
              href="/identity"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith("/identity")
                  ? "bg-[#1E2235] text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <ScanFace className="w-3.5 h-3.5 text-slate-500" />
              <span>Identity & Media</span>
            </Link>

            <Link
              href="/attack-chains"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith("/attack-chains")
                  ? "bg-[#1E2235] text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-slate-500" />
              <span>Attack Chains</span>
            </Link>

            <Link
              href="/incidents"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith("/incidents")
                  ? "bg-[#1E2235] text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-slate-500" />
              <span>Incident Triage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User Profile Footer matching Image 2 */}
      <div className="p-3 border-t border-white/[0.06] bg-[#090C14]">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
            {userInitials || "P"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {displayName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-[10px] text-slate-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B0E17] shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
