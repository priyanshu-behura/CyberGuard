import React from "react";
import Link from "next/link";
import { Shield, Lock, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-white/[0.08] bg-[#05070a] relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group w-fit focus:outline-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-white">
                CYBER<span className="text-cyan-400">GUARD</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An AI-powered cybersecurity platform that identifies, explains, and
              guides response against modern phishing, digital impersonation,
              account takeover, and abnormal activity.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                BPUT Hackathon Project
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900/60 text-slate-400 border border-slate-800">
                Phase 1 Prototype
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#capabilities"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Capabilities
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Security Posture
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  About CYBERGUARD
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Access Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Platform Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400/80" />
                  Sign In to Console
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Create Security Account
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  Threat Intelligence Dashboard
                  <span className="text-[10px] text-cyan-400 font-mono">(Phase 2)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze"
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  Threat Analysis Engine
                  <span className="text-[10px] text-cyan-400 font-mono">(Phase 2)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {currentYear} CYBERGUARD Security. Built for BPUT Hackathon.</p>
          <p className="text-slate-500 text-center sm:text-right">
            Designed for Explainable Threat Defense & Verification.
          </p>
        </div>
      </div>
    </footer>
  );
}
