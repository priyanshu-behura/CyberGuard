"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/auth-context";

const navLinks = [
  { name: "Product", href: "/#product-preview" },
  { name: "Capabilities", href: "/#capabilities" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF7F2]/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm py-4"
          : "bg-transparent border-b border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark matching Image 1 */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="CYBERGUARD Home"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 fill-white/20 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-wider text-[#0B132B]">
              CYBERGUARD
            </span>
          </Link>

          {/* Desktop Navigation Links matching Image 1 */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#1E293B] hover:text-[#6366F1] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right CTA matching Image 1 */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B132B] hover:bg-[#1E293B] text-white text-xs font-semibold tracking-wide shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch CYBERGUARD</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="px-4 py-2 rounded-full bg-[#0B132B] text-white text-xs font-medium"
            >
              Launch
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0B132B] hover:bg-black/5 focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 bg-[#FAF7F2]/98 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#1E293B] hover:bg-black/5 hover:text-[#0B132B] transition-colors"
              >
                <span>{link.name}</span>
                <span className="text-xs font-mono text-slate-400">→</span>
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200/80 flex flex-col gap-2.5">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#0B132B] text-white text-sm font-semibold tracking-wide shadow-md"
            >
              <span>Launch CYBERGUARD</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
