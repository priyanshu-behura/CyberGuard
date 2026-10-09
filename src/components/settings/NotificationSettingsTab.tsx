"use client";

import React, { useState } from "react";
import {
  Bell,
  Mail,
  Webhook,
  ShieldAlert,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { NotificationSettings } from "@/lib/settings/types";

interface NotificationSettingsTabProps {
  notifications: NotificationSettings;
  onSave: (data: Partial<NotificationSettings>) => void;
}

export function NotificationSettingsTab({
  notifications,
  onSave,
}: NotificationSettingsTabProps) {
  const [inApp, setInApp] = useState(notifications.inAppToasts);
  const [criticalBanners, setCriticalBanners] = useState(notifications.criticalIncidentBanners);
  const [responseAlerts, setResponseAlerts] = useState(notifications.responseApprovalAlerts);
  const [browserNotifs, setBrowserNotifs] = useState(notifications.browserNotifications);
  const [webhookUrl, setWebhookUrl] = useState(notifications.slackWebhookUrl || "");
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      inAppToasts: inApp,
      criticalIncidentBanners: criticalBanners,
      responseApprovalAlerts: responseAlerts,
      browserNotifications: browserNotifs,
      slackWebhookUrl: webhookUrl.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* In-App Alerts */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          In-App Security Alert Dispatchers
        </h3>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                In-App Toast Banners
              </span>
              <span className="text-[11px] text-slate-400">
                Display immediate HUD notifications when threat analyses complete or simulations execute.
              </span>
            </div>
            <input
              type="checkbox"
              checked={inApp}
              onChange={(e) => setInApp(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Persistent Critical Incident Top Banners
              </span>
              <span className="text-[11px] text-slate-400">
                Pin persistent warning ribbon across the dashboard when an active Critical incident is unresolved.
              </span>
            </div>
            <input
              type="checkbox"
              checked={criticalBanners}
              onChange={(e) => setCriticalBanners(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                Pending Response Approval Reminders
              </span>
              <span className="text-[11px] text-slate-400">
                Notify analyst when high-impact containment actions are awaiting human authorization.
              </span>
            </div>
            <input
              type="checkbox"
              checked={responseAlerts}
              onChange={(e) => setResponseAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/[0.2] focus:ring-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* External Integration Connectors */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
          SIEM, Webhook & External Notifications
        </h3>

        {/* Webhook Input */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Webhook className="w-3.5 h-3.5 text-cyan-400" />
            <span>Slack / Discord / SIEM Alert Webhook URL</span>
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
          />
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            When specified, high/critical incident payloads are dispatched as JSON Webhook alerts.
          </p>
        </div>

        {/* Email Alerts Status Card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>External Email Broadcast (SMTP / Resend)</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              UNCONFIGURED
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Email dispatch requires <code className="text-cyan-300">RESEND_API_KEY</code> or SMTP credentials in server environment. In hackathon evaluation mode, in-app telemetry dispatch is active.
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono text-slate-500">
            Dispatch rules saved to local configuration
          </span>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Notification Rules Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Notification Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
