import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "cyan";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#805BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#805BFF] hover:bg-[#7046fd] text-[#F5F5FA] shadow-lg shadow-[#805BFF]/25 hover:shadow-[#805BFF]/40 border border-white/15 hover:brightness-105",
    secondary:
      "bg-[#171923] hover:bg-[#202330] text-[#F5F5FA] border border-white/10 hover:border-white/20 shadow-sm",
    outline:
      "border border-white/15 hover:border-[#805BFF]/60 text-[#F5F5FA] hover:bg-[#805BFF]/10 shadow-sm",
    cyan:
      "bg-[#39DCE5] hover:bg-[#2bcdd6] text-[#08090D] font-semibold shadow-lg shadow-[#39DCE5]/20 hover:shadow-[#39DCE5]/35",
    ghost:
      "text-[#9CA3B5] hover:text-[#F5F5FA] hover:bg-white/[0.05]",
  };

  const classes = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {icon && <span className="shrink-0">{icon}</span>}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
