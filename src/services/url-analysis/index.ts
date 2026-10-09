import { urlAnalyzer } from "./analyzer";
import { UrlAnalysisResult } from "./types";

export * from "./types";
export * from "./analyzer";

export interface SampleUrl {
  label: string;
  url: string;
  category: "phishing" | "suspicious" | "safe";
  description: string;
}

export const SAMPLE_URLS: SampleUrl[] = [
  {
    label: "PayPal Subdomain Spoof",
    url: "https://secure-paypal-login.example.com/verify/account",
    category: "phishing",
    description: "Brand name in subdomain resolving to example.com with credential path",
  },
  {
    label: "Direct IP Portal",
    url: "http://185.220.101.5:8080/secure/auth?dest=http://external-redirect.com",
    category: "suspicious",
    description: "Connects to a raw IP address over unencrypted HTTP with open redirect query",
  },
  {
    label: "Legitimate Service",
    url: "https://github.com/login",
    category: "safe",
    description: "Standard secure authentication endpoint on a verified trusted platform",
  },
];

class UrlAnalysisService {
  /**
   * Analyzes a URL using the CYBERGUARD heuristic detection engine.
   * Simulates realistic stepped inspection delay.
   */
  public async analyzeUrl(
    url: string,
    simulatedLatencyMs = 1200
  ): Promise<UrlAnalysisResult> {
    if (!url || !url.trim()) {
      throw new Error("Please enter a URL.");
    }

    const trimmed = url.trim();

    // Check for extremely long input
    if (trimmed.length > 2048) {
      throw new Error("URL exceeds maximum permissible length of 2048 characters.");
    }

    // Basic format test
    const testTarget =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    try {
      new URL(testTarget);
    } catch {
      throw new Error("That doesn't appear to be a valid URL.");
    }

    // Simulate inspection latency
    if (simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, simulatedLatencyMs));
    }

    return urlAnalyzer.analyze(trimmed);
  }
}

export const urlAnalysisService = new UrlAnalysisService();
