"use client";

import React, { useState } from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  Cpu,
} from "lucide-react";
import {
  AuthenticationEventType,
  DeviceType,
  AuthMethod,
} from "@/lib/security/monitor/types";

interface CustomEventInjectorProps {
  onEventIngested: () => void;
}

export function CustomEventInjector({ onEventIngested }: CustomEventInjectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<{
    alertCount: number;
    postureStatus: string;
  } | null>(null);

  // Form Fields
  const [userEmail, setUserEmail] = useState("analyst@cyberguard.internal");
  const [eventType, setEventType] = useState<AuthenticationEventType>("LOGIN");
  const [success, setSuccess] = useState(true);
  const [ipAddress, setIpAddress] = useState("103.24.182.10");
  const [city, setCity] = useState("Bhubaneswar");
  const [country, setCountry] = useState("India");
  const [deviceName, setDeviceName] = useState("Apple MacBook Pro (M2)");
  const [deviceType, setDeviceType] = useState<DeviceType>("Desktop");
  const [browser, setBrowser] = useState("Chrome 128.0");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [resource, setResource] = useState("/dashboard");
  const [failureReason, setFailureReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIngestionResult(null);

    try {
      const payload = {
        userEmail,
        eventType,
        success,
        ipAddress,
        location: {
          city,
          country,
        },
        deviceName,
        deviceType,
        browser,
        authenticationMethod: authMethod,
        resource,
        failureReason: !success ? failureReason || "Bad credentials" : undefined,
        isDemo: true, // Manual injection is flagged as user-driven demo telemetry
      };

      const res = await fetch("/api/monitor/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIngestionResult({
          alertCount: data.data.newAlerts.length,
          postureStatus: data.data.posture.status,
        });
        onEventIngested();
      }
    } catch (err) {
      console.error("Failed to ingest event:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Custom Authentication Event Injector
            </h3>
            <p className="text-xs text-slate-400">
              Manually craft individual telemetry packets to test live detection rules.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
        >
          {isOpen ? "Collapse Form" : "Open Event Crafter"}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* User Email */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Account Target (Email)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as AuthenticationEventType)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="LOGIN">LOGIN</option>
                <option value="PASSWORD_FAILURE">PASSWORD_FAILURE</option>
                <option value="PASSWORD_RESET">PASSWORD_RESET</option>
                <option value="SESSION_CREATED">SESSION_CREATED</option>
                <option value="SUSPICIOUS_SESSION">SUSPICIOUS_SESSION</option>
                <option value="PRIVILEGED_ACTION">PRIVILEGED_ACTION</option>
              </select>
            </div>

            {/* Success State */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Outcome
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSuccess(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    success
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-white/[0.08]"
                  }`}
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    !success
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-slate-900 text-slate-400 border-white/[0.08]"
                  }`}
                >
                  Failure
                </button>
              </div>
            </div>

            {/* IP Address */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Source IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Origin City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Origin Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Device Name */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Device / Hardware Name
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Browser */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                User-Agent / Browser
              </label>
              <input
                type="text"
                value={browser}
                onChange={(e) => setBrowser(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Resource */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Target Endpoint / Resource
              </label>
              <input
                type="text"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-amber-400/90">
              * Manually injected telemetry is tagged as DEMO / SIMULATED DATA.
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-950/40 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Ingest & Evaluate Telemetry</span>
            </button>
          </div>
        </form>
      )}

      {/* Ingestion Result Banner */}
      {ingestionResult && (
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>
              Event successfully evaluated.{" "}
              <strong>{ingestionResult.alertCount} new alert(s)</strong> generated.
            </span>
          </div>
          <span>Updated Posture: {ingestionResult.postureStatus}</span>
        </div>
      )}
    </div>
  );
}
