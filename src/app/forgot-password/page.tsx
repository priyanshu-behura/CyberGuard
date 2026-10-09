"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowRight, ArrowLeft, Mail, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your registered security identity email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestPasswordReset(email.trim());
      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(response.message || "Failed to process recovery request.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] cyber-grid-lines flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/login"
          className="flex items-center gap-2 group text-sm font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Sign In</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-400">
            Account Recovery
          </span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="glass-panel rounded-2xl p-7 sm:p-8 border border-white/[0.1] shadow-2xl shadow-cyan-950/30">
          {!isSuccess ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-950/40">
                <KeyRound className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5 mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Forgot your password?
                </h1>
                <p className="text-xs text-slate-400">
                  Enter your verified security email to receive recovery instructions
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Security Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      disabled={isLoading}
                      placeholder="analyst@domain.com"
                      autoComplete="email"
                      required
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-slate-900/80 border border-white/[0.1] text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder:text-slate-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  className="w-full justify-center mt-2 cursor-pointer"
                  icon={
                    isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )
                  }
                >
                  {isLoading ? "Generating Request..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Reset Link Request Queued
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  If an account exists for <span className="text-cyan-300 font-mono">{email}</span>, a cryptographic password reset token has been registered.
                </p>
              </div>

              {/* Clear Staging Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.08] text-left text-xs font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Phase 2 Security Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Password reset architecture is in place. External SMTP / transactional email delivery (e.g. Resend, SendGrid) will dispatch actual emails once configured in production.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  href="/login"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Return to Sign In
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors font-mono py-1 block w-full text-center cursor-pointer"
                >
                  Try another email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-xs font-mono text-slate-500 max-w-7xl mx-auto w-full">
        CYBERGUARD Security Intelligence • Account Recovery
      </div>
    </div>
  );
}
