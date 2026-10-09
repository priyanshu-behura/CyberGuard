"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, ArrowRight, ArrowLeft, Mail, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/lib/auth/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await signIn({
        email: email.trim(),
        password: password,
      });

      if (response.success) {
        router.push(redirectTarget);
      } else {
        setErrorMessage(response.message || "Invalid credentials. Please verify your identity details.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected authentication error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="flex items-center gap-2 group text-sm font-mono text-[#9CA3B5] hover:text-[#39DCE5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to CYBERGUARD Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39DCE5] animate-pulse" />
          <span className="text-xs font-mono text-[#9CA3B5]">
            Secure Auth Gateway
          </span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-10">
        <div className="rounded-2xl p-7 sm:p-8 border border-white/[0.08] bg-[#11131B] shadow-2xl shadow-black/80">
          {/* Logo Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#171923] border border-[#39DCE5]/30 text-[#39DCE5] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Sign In to CYBERGUARD
            </h1>
            <p className="text-xs text-[#9CA3B5]">
              Access your security telemetry and incident response platform
            </p>
          </div>

          {/* Error Alert Message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* 1. Google Sign-In */}
          <div className="mb-5">
            <GoogleSignInButton disabled={isLoading} />
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-[#11131B] px-3 text-[#9CA3B5]">
                Or continue with credentials
              </span>
            </div>
          </div>

          {/* 2. Email / Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-mono text-[#F5F5FA] uppercase tracking-wider mb-2"
              >
                Security Identity / Email / Admin ID
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  placeholder="admin or analyst@domain.com"
                  autoComplete="username"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#171923] border border-white/[0.08] text-[#F5F5FA] text-sm focus:outline-none focus:border-[#39DCE5] focus:ring-1 focus:ring-[#39DCE5] transition-colors placeholder:text-[#9CA3B5]/50 font-mono text-xs sm:text-sm"
                />
                <Mail className="w-4 h-4 text-[#9CA3B5]/60 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-mono text-[#F5F5FA] uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#39DCE5] hover:underline transition-colors font-mono"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#171923] border border-white/[0.08] text-[#F5F5FA] text-sm focus:outline-none focus:border-[#39DCE5] focus:ring-1 focus:ring-[#39DCE5] transition-colors placeholder:text-[#9CA3B5]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-2.5 p-0.5 text-[#9CA3B5] hover:text-[#F5F5FA] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full justify-center mt-3 cursor-pointer"
              icon={
                isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="text-center text-xs font-mono text-slate-500 max-w-7xl mx-auto w-full">
        CYBERGUARD Security Intelligence • Enterprise Threat Platform
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 font-mono text-xs">
          Loading sign in gateway...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
