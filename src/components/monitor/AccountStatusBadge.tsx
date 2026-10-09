import React from "react";
import { AccountSecurityStatus } from "@/lib/security/monitor/types";
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, Activity } from "lucide-react";

interface AccountStatusBadgeProps {
  status: AccountSecurityStatus;
  size?: "sm" | "md" | "lg";
}

export function AccountStatusBadge({ status, size = "md" }: AccountStatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case "COMPROMISED / POSSIBLE TAKEOVER":
        return {
          icon: AlertOctagon,
          bgColor: "bg-rose-500/15 border-rose-500/40 text-rose-300",
          dotColor: "bg-rose-500",
          shadow: "shadow-rose-950/40",
          label: "COMPROMISED / POSSIBLE TAKEOVER",
        };
      case "HIGH RISK":
        return {
          icon: ShieldAlert,
          bgColor: "bg-orange-500/15 border-orange-500/40 text-orange-300",
          dotColor: "bg-orange-500",
          shadow: "shadow-orange-950/40",
          label: "HIGH RISK",
        };
      case "AT RISK":
        return {
          icon: AlertTriangle,
          bgColor: "bg-amber-500/15 border-amber-500/40 text-amber-300",
          dotColor: "bg-amber-500",
          shadow: "shadow-amber-950/40",
          label: "AT RISK",
        };
      case "MONITORED":
        return {
          icon: Activity,
          bgColor: "bg-blue-500/15 border-blue-500/40 text-blue-300",
          dotColor: "bg-blue-400",
          shadow: "shadow-blue-950/40",
          label: "MONITORED",
        };
      case "SECURE":
      default:
        return {
          icon: ShieldCheck,
          bgColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
          dotColor: "bg-emerald-400",
          shadow: "shadow-emerald-950/40",
          label: "SECURE",
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px] gap-1.5",
    md: "px-3.5 py-1.5 text-xs gap-2",
    lg: "px-4 py-2 text-sm gap-2.5 font-bold tracking-wide",
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl border font-mono font-medium shadow-sm ${config.bgColor} ${sizeClasses[size]} ${config.shadow}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </div>
  );
}
