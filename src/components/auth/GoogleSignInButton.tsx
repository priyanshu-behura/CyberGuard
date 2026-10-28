"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { KeyRound, Copy, Check, X, Sparkles, Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  className?: string;
  disabled?: boolean;
}

export function GoogleSignInButton({ className = "", disabled = false }: GoogleSignInButtonProps) {
  const { googleOAuthConfig, signInWithGoogleDemo } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleClick = () => {
    if (googleOAuthConfig.isConfigured && googleOAuthConfig.authUrl) {
      window.location.href = googleOAuthConfig.authUrl;
    } else {
      setShowConfigModal(true);
    }
  };

  const handleDemoSignIn = async () => {
    setIsDemoLoading(true);
    try {
      const res = await signInWithGoogleDemo();
      if (res.success) {
        window.location.href = "/dashboard";
      }
    } finally {
      setIsDemoLoading(false);
    }
  };

  const copyEnvSnippet = () => {
    const snippet = `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=your-google-client-secret\nNEXT_PUBLIC_APP_URL=http://localhost:3000`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isDemoLoading}
        aria-label="Continue with Google"
        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/[0.12] hover:border-cyan-500/40 text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#07090e] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {/* Google Multicolor SVG Icon */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Google OAuth Modal with One-Click Demo Mode Option */}
      {showConfigModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="oauth-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="oauth-dialog-title" className="text-base font-bold text-white">
                    Google Sign-In Options
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Instant Demo or Production Setup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant Demo Google Sign In */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Instant Demo Google Account</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in immediately with a pre-configured Google Analyst identity without needing external Google Cloud Console credentials.
              </p>
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={isDemoLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDemoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In as Demo Google Analyst</span>
                )}
              </button>
            </div>

            {/* Production Setup Instructions */}
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-white/[0.08] text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-white/[0.06]">
                <span className="text-[11px] uppercase text-slate-400">Production OAuth Setup (.env.local):</span>
                <button
                  type="button"
                  onClick={copyEnvSnippet}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Snippet"}</span>
                </button>
              </div>
              <div className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                <div>NEXT_PUBLIC_GOOGLE_CLIENT_ID=&lt;client_id&gt;</div>
                <div>GOOGLE_CLIENT_SECRET=&lt;client_secret&gt;</div>
                <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
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
