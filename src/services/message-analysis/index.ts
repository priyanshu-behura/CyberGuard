import { messageAnalyzer } from "./analyzer";
import { MessageAnalysisResult, MessageType, DemoMessageCase } from "./types";

export * from "./types";
export * from "./analyzer";

export const DEMO_MESSAGES: DemoMessageCase[] = [
  {
    id: "demo_safe",
    label: "Routine Meeting (Safe)",
    category: "safe",
    messageType: "chat",
    content:
      "Hi Rahul, your project meeting is scheduled for tomorrow at 10 AM. Please join through the usual college meeting link.",
    expectedOutcome: "SAFE",
  },
  {
    id: "demo_suspicious",
    label: "Account Verification (Suspicious)",
    category: "suspicious",
    messageType: "email",
    content:
      "Your account requires verification. Please review your security settings as soon as possible.",
    expectedOutcome: "LOW / MEDIUM RISK",
  },
  {
    id: "demo_phishing",
    label: "Instagram Threat (High Risk)",
    category: "phishing",
    messageType: "email",
    sender: "security-alert@verify-instagram.example.com",
    content:
      "URGENT: Your Instagram account will be suspended today. Verify your account immediately by signing in here:\nhttps://secure-instagram.example.com/login\nEnter your password to confirm your identity.",
    expectedOutcome: "HIGH RISK (Phishing)",
  },
];

class MessageAnalysisService {
  /**
   * Analyzes a message using the CYBERGUARD heuristic detection engine.
   * Simulates realistic stepped inspection delay.
   */
  public async analyzeMessage(
    message: string,
    messageType: MessageType = "auto",
    sender?: string,
    simulatedLatencyMs = 1200
  ): Promise<MessageAnalysisResult> {
    if (!message || !message.trim()) {
      throw new Error("Please enter a message to analyze.");
    }

    if (simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, simulatedLatencyMs));
    }

    return messageAnalyzer.analyze(message, messageType, sender);
  }
}

export const messageAnalysisService = new MessageAnalysisService();
