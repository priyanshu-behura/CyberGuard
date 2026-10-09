import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ConnectedIntelligenceSection } from "@/components/landing/ConnectedIntelligenceSection";
import { AttackStorySection } from "@/components/landing/AttackStorySection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { CTASection } from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#0B132B] selection:bg-[#4F46E5]/20 selection:text-[#0B132B]">
      {/* SECTION 1: Minimal Warm Editorial Navbar matching Image 1 */}
      <Navbar />

      <main className="flex-1">
        {/* SECTION 2: Hero with Shattered AI-Human Portrait matching Image 1 */}
        <Hero />

        {/* SECTION A: The Problem — Fragmented Signals */}
        <ProblemSection />

        {/* SECTION B: Connected Intelligence — Signal Fusion */}
        <ConnectedIntelligenceSection />

        {/* SECTION C: The Attack Story — Signal to Explanation */}
        <AttackStorySection />

        {/* SECTION D: Workflow — Detection to Governed Response */}
        <WorkflowSection />

        {/* SECTION E: Verified Core Capabilities */}
        <CapabilitiesSection />

        {/* SECTION F: Console Interface Preview */}
        <ProductPreview />

        {/* SECTION G: Final CTA — Make Every Signal Count */}
        <CTASection />
      </main>

      {/* SECTION 9: Editorial Footer */}
      <Footer />
    </div>
  );
}
