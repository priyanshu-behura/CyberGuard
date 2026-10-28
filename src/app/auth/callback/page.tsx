"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, CheckCircle2, AlertCircle, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { authService } from "@/lib/auth/auth-service";
import { Button } from "@/components/ui/Button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error" | "info">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    // If OAuth provider returned an explicit error
    if (error) {
      setStatus("error");
      setErrorMessage(errorDescription || `OAuth provider returned: ${error}`);
      return;
    }

    // If an authorization code is present, exchange it
    if (code) {
      setStatus("processing");
      authService
        .handleOAuthCallback(code, state || undefined)
        .then((res) => {
          if (res.success) {
            setStatus("success");
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1000);
          } else {
            setStatus("error");
            setErrorMessage(res.message || "Failed to finalize OAuth session.");
          }
        })
        .catch((err) => {
          setStatus("error");
          setErrorMessage(err?.message || "An unexpected error occurred during token exchange.");
        });
      return;
    }

    // Direct access without parameters
    setStatus("info");
  }, [code, state, error, errorDescription, router]);

  const googleConfig = authService.getGoogleOAuthConfig();

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
          <span className="text-xs font-mono text-slate-400">OAuth Gateway</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="glass-panel rounded-2xl p-8 border border-white/[0.1] shadow-2xl shadow-cyan-950/30 text-center">
          {/* Status Icon */}
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-950/40">
            {status === "processing" && <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />}
            {status === "success" && <CheckCircle2 className="w-7 h-7 text-emerald-400" />}
            {status === "error" && <AlertCircle className="w-7 h-7 text-rose-400" />}
            {status === "info" && <KeyRound className="w-7 h-7 text-cyan-400" />}
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            {status === "processing" && "Verifying Security Identity"}
            {status === "success" && "Identity Confirmed"}
            {status === "error" && "Authentication Interrupted"}
            {status === "info" && "OAuth Callback Endpoint"}
          </h1>

          <p className="text-xs text-slate-400 mb-6">
            {status === "processing" && "Securing cryptographic session exchange with Google OAuth..."}
            {status === "success" && "Session established. Directing you to the Security Command Center..."}
            {status === "error" && (errorMessage || "Unable to establish verified session.")}
            {status === "info" && "Designated redirect URI handler for enterprise Google authentication."}
          </p>

          {/* Additional details for info mode */}
          {status === "info" && (
            <div className="bg-slate-900/80 rounded-xl p-4 border border-white/[0.08] text-left text-xs font-mono space-y-2.5 mb-6">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Config Status:</span>
                <span className={googleConfig.isConfigured ? "text-emerald-400" : "text-amber-400"}>
                  {googleConfig.isConfigured ? "● Credentials Present" : "○ Pending Credentials"}
                </span>
              </div>
              <div className="text-slate-400">
                <span className="block text-[10px] uppercase text-slate-500">Redirect URI:</span>
                <span className="text-slate-300 break-all text-[11px]">{googleConfig.redirectUri}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                Configure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local` to enable live Google authentication.
              </p>
            </div>
          )}

          {/* Action buttons */}
          {(status === "error" || status === "info") && (
            <Button
              href="/login"
              variant="primary"
              size="md"
              className="w-full justify-center"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Sign In
            </Button>
          )}

          {status === "success" && (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Redirecting to /dashboard...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-mono text-slate-500 max-w-7xl mx-auto w-full">
        CYBERGUARD Security Intelligence • OAuth Gateway
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 font-mono text-xs">
          Loading authentication gateway...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
