import type { Metadata, Viewport } from "next";
import "./globals.css";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const viewport: Viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "CYBERGUARD | AI-Powered Cyber Threat Detection & Response",
  description:
    "An AI-powered cybersecurity intelligence platform for identifying, analyzing, explaining, and responding to modern cyber threats including phishing, deepfakes, digital impersonation, account takeover, and abnormal activity.",
  keywords: [
    "CYBERGUARD",
    "cybersecurity",
    "AI threat detection",
    "phishing protection",
    "deepfake verification",
    "account takeover",
    "BPUT hackathon",
  ],
  authors: [{ name: "CYBERGUARD Team" }],
};

import { AuthProvider } from "@/lib/auth/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300 flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
