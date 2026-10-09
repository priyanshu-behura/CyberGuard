"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  Link as LinkIcon,
  MessageSquareText,
  Globe,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AnalyzePage() {
  const analysisOptions = [
    {
      id: "message",
      title: "Message / Phishing",
      description: "Analyze suspicious emails, SMS, and messages for social engineering.",
      icon: MessageSquareText,
      active: true,
      actionLabel: "Analyze Message",
      href: "/analyze/message",
    },
    {
      id: "url",
      title: "URL",
      description: "Check a suspicious or potentially malicious URL.",
      icon: LinkIcon,
      active: true,
      actionLabel: "Analyze URL",
      href: "/analyze/url",
    },
    {
      id: "website",
      title: "Website",
      description: "Inspect suspicious websites and login pages.",
      icon: Globe,
      active: false,
      statusLabel: "Coming next",
      href: "#",
    },
    {
      id: "file",
      title: "File",
      description: "Analyze a suspicious file or digital artifact.",
      icon: FileCode,
      active: false,
      statusLabel: "Coming next",
      href: "#",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/[0.1] shadow-xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analyze a Threat
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Check suspicious messages, URLs, websites and files for potential security threats.
            </p>
          </div>
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analysisOptions.map((opt) => {
            const Icon = opt.icon;

            if (opt.active) {
              return (
                <Link
                  key={opt.id}
                  href={opt.href}
                  className="group relative glass-panel rounded-xl p-6 border border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-slate-900/80 to-slate-900/90 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-950/40 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm shadow-cyan-950/50">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Active Tool
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {opt.title}
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform pt-2 border-t border-white/[0.06]">
                    <span>{opt.actionLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={opt.id}
                className="glass-panel rounded-xl p-6 border border-white/[0.06] bg-slate-950/40 flex flex-col justify-between space-y-6 opacity-75"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-lg bg-slate-900/80 border border-white/[0.06] text-slate-500 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-slate-400 border border-white/[0.06]">
                      {opt.statusLabel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-300">
                      {opt.title}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 pt-2 border-t border-white/[0.06]">
                  Workflow arriving in next phase
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
