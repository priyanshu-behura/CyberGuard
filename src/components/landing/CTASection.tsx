import React from "react";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 relative border-t border-white/[0.06] bg-[#05080f] overflow-hidden cyber-grid-lines">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] ambient-glow-cyan blur-[130px] pointer-events-none opacity-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Shield Icon Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6 shadow-lg shadow-cyan-950/40">
          <ShieldCheck className="w-7 h-7" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
          Your Next Security Decision Starts Here.
        </h2>

        {/* Supporting text */}
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
          Analyze suspicious activity, understand the risk, and take the right
          action before modern threats compromise your operations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            href="/signup"
            size="lg"
            variant="primary"
            className="w-full sm:w-auto"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Get Started
          </Button>
          <Button
            href="/login"
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto"
            icon={<Lock className="w-4 h-4 text-cyan-400" />}
          >
            Sign In to Console
          </Button>
        </div>

        {/* Safe, non-invasive note */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs font-mono text-slate-500">
          <span>• Zero Agent Installation</span>
          <span>• Privacy-First Architecture</span>
          <span>• BPUT 2026 Initiative</span>
        </div>
      </div>
    </section>
  );
}
