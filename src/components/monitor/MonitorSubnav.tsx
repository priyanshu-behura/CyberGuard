"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ShieldCheck, KeyRound, LineChart } from "lucide-react";

export function MonitorSubnav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/monitor",
      icon: Activity,
      description: "Real-time threat status & active alerts",
    },
    {
      name: "Account Security",
      href: "/monitor/account",
      icon: ShieldCheck,
      description: "Devices, locations & active sessions",
    },
    {
      name: "Login Events",
      href: "/monitor/login",
      icon: KeyRound,
      description: "Authentication logs & event injector",
    },
    {
      name: "Behavior Baseline",
      href: "/monitor/behavior",
      icon: LineChart,
      description: "Activity profiles & anomaly models",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4 mb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/monitor"
            ? pathname === "/monitor"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/40"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
