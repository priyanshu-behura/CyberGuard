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
      <div className="space-y-6 pb-12 select-none max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#6366F1] border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>MULTIVECTOR THREAT INSPECTION</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
            Analyze a Threat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Check suspicious messages, phishing lures, malicious URLs, websites, and forensic payloads with explainable AI reasoning.
          </p>
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
                  className="group relative rounded-2xl p-6 border border-slate-200/90 bg-white hover:border-[#6366F1]/50 hover:shadow-lg transition-all flex flex-col justify-between space-y-6 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-[#6366F1] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Tool
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-[#0B132B] group-hover:text-[#6366F1] transition-colors">
                        {opt.title}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#6366F1] group-hover:translate-x-1 transition-transform pt-3 border-t border-slate-100">
                    <span>{opt.actionLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={opt.id}
                className="rounded-2xl p-6 border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-6 opacity-70"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 text-slate-500 border border-slate-200">
                      {opt.statusLabel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-500">
                      {opt.title}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 pt-3 border-t border-slate-200">
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
