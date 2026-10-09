"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map route to human title
  const getPageMeta = (path: string) => {
    switch (path) {
      case "/dashboard":
        return { title: "Command Dashboard", section: "Overview" };
      case "/analyze":
        return { title: "Analyze a Threat", section: "Threat Analysis" };
      case "/analyze/url":
        return { title: "Analyze a URL", section: "Threat Analysis" };
      case "/analyze/message":
        return { title: "Analyze a Message", section: "Threat Analysis" };
      case "/identity":
        return { title: "Identity & Media Verification", section: "Synthetic Defense" };
      case "/identity/image":
        return { title: "Image Authenticity & EXIF Forensics", section: "Identity & Media" };
      case "/identity/video":
        return { title: "Video Authenticity & Deepfake Analysis", section: "Identity & Media" };
      case "/identity/audio":
        return { title: "Audio & Synthetic Voice Forensics", section: "Identity & Media" };
      case "/monitor":
        return { title: "Account & Behavioral Surveillance", section: "Real-time Telemetry" };
      case "/monitor/account":
        return { title: "Account Security Posture", section: "Account Security" };
      case "/monitor/login":
        return { title: "Authentication Event Logs", section: "Telemetry Ingestion" };
      case "/monitor/behavior":
        return { title: "Behavioral Baseline & Anomalies", section: "Behavioral Defense" };
      case "/attack-chains":
        return { title: "Attack Chain Correlation", section: "Threat Modeling" };
      case "/incidents":
        return { title: "Incident Triage", section: "Operations" };
      case "/response":
        return { title: "Response Playbooks", section: "Containment" };
      case "/ai":
        return { title: "AI Center — Dual Intelligent Assistants", section: "Artificial Intelligence" };
      case "/advanced":
        return { title: "AI Center", section: "Artificial Intelligence" };
      case "/settings":
        return { title: "Platform Settings", section: "Administration" };
      default:
        return { title: "Security Workspace", section: "Platform" };
    }
  };

  const pageMeta = getPageMeta(pathname);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    router.push("/login");
  };

  const displayName = user?.name || "Security Analyst";
  const displayEmail = user?.email || "analyst@cyberguard.internal";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Left Section: Mobile toggle + Breadcrumb & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-[#0B132B] hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Link href="/dashboard" className="hover:text-[#0B132B] transition-colors">
                CYBERGUARD
              </Link>
              <span>/</span>
              <span className="text-[#6366F1] font-semibold">{pageMeta.section}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#0B132B] tracking-tight leading-none mt-0.5">
              {pageMeta.title}
            </h1>
          </div>
        </div>

        {/* Right Section: System Indicator, Notifications & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Guard Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Active Guard</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-500 hover:text-[#0B132B] hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Security notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6366F1] ring-2 ring-white" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-4 space-y-3 animate-in fade-in duration-150 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Security Alerts
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-200 font-semibold">
                    0 Unread
                  </span>
                </div>

                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-slate-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-[#0B132B] font-semibold">
                    No active threat alerts
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                    Real-time anomalous telemetry triggers will stream to this console.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all focus:outline-none"
              aria-label="User account menu"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white font-mono text-xs font-bold flex items-center justify-center shadow-sm">
                {userInitials || "CG"}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-[#0B132B] max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 space-y-1 animate-in fade-in duration-150 z-50">
                {/* User Details Header */}
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#0B132B] truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {displayEmail}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-50 text-[#6366F1] border border-indigo-200 font-medium">
                      {user?.role || "Security Analyst"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {user?.authProvider === "google" ? "Google OAuth" : "Local Session"}
                    </span>
                  </div>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-[#0B132B] hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile</span>
                </button>

                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-[#0B132B] hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </Link>

                <div className="pt-1 border-t border-slate-100" />

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Details Modal */}
      {profileModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="rounded-3xl max-w-md w-full p-6 bg-[#11131B] border border-white/10 shadow-2xl shadow-black/90 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#171923] border border-[#805BFF]/30 text-[#805BFF] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5FA]">Security Identity</h3>
                  <p className="text-[11px] font-mono text-[#9CA3B5]">CYBERGUARD Role Badge</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="text-[#9CA3B5] hover:text-[#F5F5FA] p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-[#08090D] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Identity Name:</span>
                  <span className="text-[#F5F5FA] font-sans font-medium">{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Email:</span>
                  <span className="text-[#F5F5FA]">{displayEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Access Level:</span>
                  <span className="text-[#39DCE5] uppercase font-semibold">Tier 1 Analyst</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authentication Source:</span>
                  <span className="text-[#9CA3B5]">
                    {user?.authProvider === "google" ? "Google OAuth 2.0" : "Encrypted Credentials"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-[#171923] hover:bg-[#202330] text-[#F5F5FA] border border-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
