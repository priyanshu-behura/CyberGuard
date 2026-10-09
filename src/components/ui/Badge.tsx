import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "violet" | "cyan" | "blue" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "violet",
  className = "",
  icon,
}: BadgeProps) {
  const variantStyles = {
    violet: "bg-[#805BFF]/15 text-[#C4B5FD] border-[#805BFF]/30",
    cyan: "bg-[#39DCE5]/15 text-[#39DCE5] border-[#39DCE5]/30",
    blue: "bg-blue-950/60 text-blue-300 border-blue-500/30",
    emerald: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-950/60 text-amber-300 border-amber-500/30",
    rose: "bg-rose-950/60 text-rose-300 border-rose-500/30",
    slate: "bg-[#171923] text-[#9CA3B5] border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wide border uppercase ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
