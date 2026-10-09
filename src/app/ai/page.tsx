"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Shield,
  Send,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  Mail,
  Fingerprint,
  AlertTriangle,
  GitFork,
  CheckCircle2,
} from "lucide-react";
import {
  AIMessage,
  AIConversation,
  AIAssistantMode,
  AIProviderStatus,
} from "@/lib/ai/types";
import { AIChatStorage } from "@/lib/ai/chat-storage";
import { ChatMessageItem } from "@/components/ai/ChatMessageItem";
import { IntelligenceSidebar } from "@/components/ai/IntelligenceSidebar";
import { ReportModal } from "@/components/ai/ReportModal";
import { incidentStore, SecurityIncident } from "@/lib/security/incident-store";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { responseStore } from "@/lib/security/response/response-store";
import { AccountSecurityPosture } from "@/lib/security/monitor/types";
import { ResponseMetrics } from "@/lib/security/response/types";

const STARTER_PROMPTS = [
  {
    id: "email",
    title: "Analyze a suspicious email",
    desc: "Check for phishing, malware and social engineering",
    icon: Mail,
    prompt: "Analyze a suspicious email containing an urgent wire transfer request and lookalike domain link.",
  },
  {
    id: "login",
    title: "Investigate unusual login activity",
    desc: "Detect account takeover and suspicious access",
    icon: Fingerprint,
    prompt: "Investigate unusual concurrent login activity from unrecognized VPN IPs and evaluate ATO risk.",
  },
  {
    id: "ato",
    title: "Explain a possible account takeover",
    desc: "Analyze patterns and explain the attack chain",
    icon: AlertTriangle,
    prompt: "Explain a possible account takeover attack chain starting from credential harvesting to session hijacking.",
  },
  {
    id: "correlate",
    title: "Correlate related security events",
    desc: "Find connections across multiple signals",
    icon: GitFork,
    prompt: "Correlate related security events across our recent phishing alert, failed logins, and data exfiltration signals.",
  },
];

function AICenterContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const sessionParam = searchParams.get("session");

  const [mode, setMode] = useState<AIAssistantMode>(
    modeParam === "general" ? "general" : "cybersecurity"
  );
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<AIProviderStatus | null>(null);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [activeReportIncidentId, setActiveReportIncidentId] = useState<string | null>(null);

  // Live telemetry states
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [posture, setPosture] = useState<AccountSecurityPosture | null>(null);
  const [responseMetrics, setResponseMetrics] = useState<ResponseMetrics | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Initial hydration from client stores & status check
  useEffect(() => {
    const storedConvs = AIChatStorage.getConversations();
    setConversations(storedConvs);

    const activeId = AIChatStorage.getActiveConversationId();
    if (activeId && storedConvs.some((c) => c.id === activeId)) {
      setActiveConversationId(activeId);
      const conv = storedConvs.find((c) => c.id === activeId);
      if (conv) setMode(conv.mode);
    } else if (storedConvs.length > 0) {
      setActiveConversationId(storedConvs[0].id);
      setMode(storedConvs[0].mode);
    } else {
      const newConv = AIChatStorage.createNewConversation(undefined, mode);
      setConversations([newConv]);
      setActiveConversationId(newConv.id);
    }

    // Fetch AI provider diagnostic status
    async function checkStatus() {
      try {
        const res = await fetch("/api/ai/status");
        const data = await res.json();
        if (data.success && data.status) {
          setProviderStatus(data.status);
        }
      } catch (err) {
        console.error("Failed to fetch AI status:", err);
      }
    }
    checkStatus();

    // Hydrate local platform telemetry
    try {
      setIncidents(incidentStore.getIncidents());
      setPosture(monitorStore.getPosture());
      setResponseMetrics(responseStore.getMetrics());
    } catch (e) {
      console.warn("Failed to read local security metrics:", e);
    }
  }, []);

  // Update mode if query param changes
  useEffect(() => {
    if (modeParam === "general" && mode !== "general") {
      setMode("general");
    } else if (modeParam === "cybersecurity" && mode !== "cybersecurity") {
      setMode("cybersecurity");
    }
  }, [modeParam]);

  // Handle session query param (e.g. ?session=email)
  useEffect(() => {
    if (sessionParam) {
      const match = STARTER_PROMPTS.find((p) => p.id === sessionParam);
      if (match) {
        setInputMessage(match.prompt);
      }
    }
  }, [sessionParam]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle New Chat
  const handleNewChat = (newMode?: AIAssistantMode) => {
    const targetMode = newMode || mode;
    const newConv = AIChatStorage.createNewConversation(undefined, targetMode);
    setConversations(AIChatStorage.getConversations());
    setActiveConversationId(newConv.id);
    setMode(targetMode);
    setInputMessage("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Send Message using Gemini API
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    let convId = activeConversationId;
    if (!convId || !conversations.some((c) => c.id === convId)) {
      const created = AIChatStorage.createNewConversation(text, mode);
      convId = created.id;
      setActiveConversationId(created.id);
      setConversations(AIChatStorage.getConversations());
    }

    const userMsg: AIMessage = {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      role: "user",
      mode,
      content: text,
      timestamp: new Date().toISOString(),
    };

    AIChatStorage.appendMessage(convId, userMsg);
    setConversations(AIChatStorage.getConversations());
    setInputMessage("");
    setIsLoading(true);

    try {
      const currentConv = AIChatStorage.getConversations().find((c) => c.id === convId);
      const history = (currentConv?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: history,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        AIChatStorage.appendMessage(convId, data.message);
        setConversations(AIChatStorage.getConversations());
      } else {
        const errorMsg: AIMessage = {
          id: `msg-err-${Date.now().toString(36)}`,
          role: "assistant",
          mode,
          content: `> [!WARNING]\n> **Execution Error**: ${data.error || "Failed to process completion."}\n\nPlease try again or check provider connectivity in Settings.`,
          timestamp: new Date().toISOString(),
          executionMode: "DEMO_FALLBACK",
        };
        AIChatStorage.appendMessage(convId, errorMsg);
        setConversations(AIChatStorage.getConversations());
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg-err-${Date.now().toString(36)}`,
        role: "assistant",
        mode,
        content: `> [!WARNING]\n> **Network Error**: ${err?.message || "Failed to communicate with AI endpoint."}\n\nPlease verify that the dev server is active and connectivity is available.`,
        timestamp: new Date().toISOString(),
        executionMode: "DEMO_FALLBACK",
      };
      AIChatStorage.appendMessage(convId, errorMsg);
      setConversations(AIChatStorage.getConversations());
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative select-none">
      
      {/* Top Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-[#0B132B] tracking-tight">
            AI Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your AI-powered security assistant
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Gemini Connected Status Badge matching Image 2 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini Connected</span>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("cybersecurity")}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === "cybersecurity"
                  ? "bg-white text-[#0B132B] shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Cybersecurity
            </button>
            <button
              type="button"
              onClick={() => setMode("general")}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === "general"
                  ? "bg-white text-[#0B132B] shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              General AI
            </button>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => handleNewChat()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0B132B] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex pt-6 pb-28 min-h-[500px]">
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
          
          {/* EMPTY STATE matching Image 2 */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center space-y-10 py-6 animate-in fade-in duration-300">
              
              {/* Editorial Hero Visual Banner matching Image 2 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/70 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="md:col-span-8 space-y-4">
                  <h2 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0B132B] tracking-tight leading-[1.12]">
                    Intelligence that<br />
                    sees the bigger picture.
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-lg">
                    Connect security signals. Understand the attack.<br />
                    Decide your next move.
                  </p>
                </div>

                <div className="md:col-span-4 flex justify-center md:justify-end">
                  <img
                    src="/ai-crystal-clean.png"
                    alt="AI Intelligence Core"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-lg select-none"
                    loading="eager"
                  />
                </div>
              </div>

              {/* 4 Starter Prompts matching Image 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STARTER_PROMPTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt)}
                      className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#6366F1]/50 text-left transition-all duration-200 flex flex-col justify-between space-y-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 text-[#6366F1] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0B132B] group-hover:text-[#6366F1] transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            /* CONVERSATION MESSAGE LIST */
            <div className="space-y-4 pb-8">
              {messages.map((msg, index) => (
                <ChatMessageItem
                  key={msg.id || index}
                  message={msg}
                  onRetry={() => {
                    const userMsg = messages
                      .filter((m) => m.role === "user")
                      .slice(-1)[0]?.content;
                    if (userMsg) handleSendMessage(userMsg);
                  }}
                  onOpenReport={(incId) =>
                    setActiveReportIncidentId(
                      incId || msg.associatedIncidentId || incidents[0]?.id || "INC-001"
                    )
                  }
                  onSelectPrompt={(p) => handleSendMessage(p)}
                />
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-[#6366F1] shadow-sm animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#6366F1]" />
                  <span>
                    {mode === "general"
                      ? "Generating response with Google Gemini..."
                      : "Correlating security telemetry and synthesizing analysis..."}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Optional Right Telemetry Drawer for Cybersecurity Mode */}
        {mode === "cybersecurity" && showTelemetryDrawer && (
          <div className="hidden xl:block w-80 ml-6 shrink-0">
            <IntelligenceSidebar
              incidents={incidents}
              posture={posture}
              responseMetrics={responseMetrics}
              onSelectIncident={(incId) => {
                handleSendMessage(`Investigate incident ${incId} and correlate all evidence.`);
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Bottom Composer matching Image 2 */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC]/95 to-transparent z-20">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative flex items-center bg-white border border-slate-300/80 rounded-2xl sm:rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all">
            
            {/* Attachment Icons */}
            <div className="flex items-center gap-1.5 text-slate-400 mr-2 shrink-0">
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Attach log or file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Attach screenshot or media"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your security events, threats, or analysis..."
              rows={1}
              className="w-full bg-transparent resize-none text-xs sm:text-sm text-[#0B132B] placeholder:text-slate-400 focus:outline-none py-1.5 px-1 leading-normal"
            />

            {/* Circular Purple Send Button matching Image 2 */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${
                inputMessage.trim() && !isLoading
                  ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-indigo-500/30 cursor-pointer hover:scale-105 active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-center text-[11px] text-slate-400 gap-2 font-mono">
            <span>Shift + Enter for new line</span>
            <span>•</span>
            <span>Enter to send</span>
          </div>
        </div>
      </div>

      {/* Incident Report Modal */}
      {activeReportIncidentId && (
        <ReportModal
          incidentId={activeReportIncidentId}
          onClose={() => setActiveReportIncidentId(null)}
        />
      )}

    </div>
  );
}

export default function AICenterPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-500">Loading AI Center...</div>}>
      <AICenterContent />
    </React.Suspense>
  );
}
