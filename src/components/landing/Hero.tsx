"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export function Hero() {
  const { isAuthenticated } = useAuth();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-28 pb-16 lg:pt-32 lg:pb-24 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* Left Column: Editorial Headline & Narrative matching Image 1 */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8 text-left z-20">
            {/* Editorial Headline matching Image 1 exact typography & breaks */}
            <h1 className="font-editorial-serif text-5xl sm:text-6xl md:text-7xl lg:text-[82px] xl:text-[92px] font-normal text-[#0B132B] tracking-[-0.03em] leading-[1.04]">
              Not just<br />
              detection.<br />
              Real<br />
              understanding.
            </h1>

            {/* Supporting Copy matching Image 1 */}
            <p className="text-base sm:text-lg md:text-xl text-[#475569] leading-relaxed max-w-lg font-normal">
              CYBERGUARD connects the dots between digital signals, explains emerging threats, and helps you respond with confidence.
            </p>

            {/* CTAs matching Image 1 */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#1E293B] text-white text-sm font-semibold tracking-wide shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch CYBERGUARD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-transparent hover:bg-black/5 text-[#0B132B] text-sm font-medium transition-all duration-200 group"
              >
                <span className="w-8 h-8 rounded-full border border-[#0B132B]/30 flex items-center justify-center group-hover:border-[#0B132B] transition-colors">
                  <Play className="w-3.5 h-3.5 fill-[#0B132B] text-[#0B132B] translate-x-0.5" />
                </span>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          {/* Right Column: AI-Human Shattered Portrait matching Image 1 */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[540px] lg:max-w-none">
              <img
                src="/hero-portrait-clean.png"
                alt="CYBERGUARD AI Intelligence Portrait"
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Video Modal Demo */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#0B0E17] border border-white/10 rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                <h3 className="font-semibold text-lg">CYBERGUARD Overview & Capabilities</h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Play className="w-8 h-8 fill-white text-white translate-x-1" />
              </div>
              <h4 className="text-xl font-bold text-[#F5F5FA]">Interactive Intelligence Walkthrough</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Discover how CYBERGUARD correlates multi-vector alerts across email, authentication, and endpoint telemetry using Google Gemini AI.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold transition-colors"
                >
                  Explore Dashboard Live
                </Link>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-medium transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
