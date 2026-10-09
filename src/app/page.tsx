import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { TrustSection } from "@/components/landing/TrustSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { WhyItMattersSection } from "@/components/landing/WhyItMattersSection";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { CTASection } from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1: Clean Premium Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* SECTION 2: Hero */}
        <Hero />

        {/* SECTION 3: Trust & Purpose */}
        <TrustSection />

        {/* SECTION 4: How CYBERGUARD Works (5-Step Lifecycle) */}
        <WorkflowSection />

        {/* SECTION 5: Core Capabilities (5 Pillars) */}
        <CapabilitiesSection />

        {/* SECTION 6: Why It Matters (Blended Multi-Vector Attacks) */}
        <WhyItMattersSection />

        {/* SECTION 7: Simple Product Preview */}
        <ProductPreview />

        {/* SECTION 8: Final CTA */}
        <CTASection />
      </main>

      {/* SECTION 9: Clean Footer */}
      <Footer />
    </div>
  );
}
