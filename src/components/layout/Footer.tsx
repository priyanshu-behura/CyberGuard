"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-slate-200/80 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 group w-fit focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 fill-white/20 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-[#0B132B]">
                CYBERGUARD
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              An AI-first cybersecurity platform that identifies, explains, and
              guides response against modern phishing, digital impersonation,
              account takeover, and abnormal activity.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-indigo-50 text-[#4F46E5] font-medium border border-indigo-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                Live Architecture
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white text-slate-600 border border-slate-200 font-medium">
                2026 Production Edition
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0B132B]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/#product-preview"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors"
                >
                  Product Preview
                </Link>
              </li>
              <li>
                <Link
                  href="/#capabilities"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors"
                >
                  Capabilities
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors"
                >
                  Security Framework
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors"
                >
                  About CYBERGUARD
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Console Access */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0B132B]">
              Platform Console
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
                >
                  Security Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/ai"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
                >
                  AI Center
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
                >
                  Threat Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/monitor"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
                >
                  Threat Monitor
                </Link>
              </li>
              <li>
                <Link
                  href="/response"
                  className="text-slate-600 hover:text-[#4F46E5] transition-colors flex items-center gap-1.5"
                >
                  Response Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} CYBERGUARD Security Platform.</p>
          <p className="text-slate-500 text-center sm:text-right">
            Connected Intelligence • Governed Defense • Explainable Threat Story.
          </p>
        </div>
      </div>
    </footer>
  );
}
