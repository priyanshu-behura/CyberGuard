"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Shield,
  Send,
  Loader2,
  Trash2,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  AlertTriangle,
  Bot,
  RefreshCw,
} from "lucide-react";
import {
  AIMessage,
  AIConversation,
  AIAssistantMode,
  AIProviderStatus,
} from "@/lib/ai/types";
import { AIChatStorage } from "@/lib/ai/chat-storage";
import { ModeSelector } from "@/components/ai/ModeSelector";
import { ChatSidebar } from "@/components/ai/ChatSidebar";
import { ChatMessageItem } from "@/components/ai/ChatMessageItem";
import { PromptSuggestions } from "@/components/ai/PromptSuggestions";
import { IntelligenceSidebar } from "@/components/ai/IntelligenceSidebar";
import { ReportModal } from "@/components/ai/ReportModal";
import { incidentStore, SecurityIncident } from "@/lib/security/incident-store";
import { monitorStore } from "@/lib/security/monitor/monitor-store";
import { responseStore } from "@/lib/security/response/response-store";
import { AccountSecurityPosture } from "@/lib/security/monitor/types";
import { ResponseMetrics } from "@/lib/security/response/types";

export default function AICenterPage() {
  const [mode, setMode] = useState<AIAssistantMode>("cybersecurity");
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<AIProviderStatus | null>(null);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(true);
  const [activeReportIncidentId, setActiveReportIncidentId] = useState<string | null>(null);

  // Live telemetry states
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [posture, setPosture] = useState<AccountSecurityPosture | null>(null);
  const [responseMetrics, setResponseMetrics] = useState<ResponseMetrics | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Initial hydration from client stores & status check
  useEffect(() => {
    // Load conversations from local storage
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
      // Create initial conversation
      const newConv = AIChatStorage.createNewConversation(undefined, "cybersecurity");
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

  // 2. Auto-scroll on message updates
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 3. New Conversation
  const handleNewChat = (newMode?: AIAssistantMode) => {
    const targetMode = newMode || mode;
    const newConv = AIChatStorage.createNewConversation(undefined, targetMode);
    setConversations(AIChatStorage.getConversations());
    setActiveConversationId(newConv.id);
    setMode(targetMode);
    if (textareaRef.current) textareaRef.current.focus();
  };

  // 4. Select Conversation
  const handleSelectConversation = (id: string) => {
    AIChatStorage.setActiveConversationId(id);
    setActiveConversationId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv) setMode(conv.mode);
  };

  // 5. Delete Conversation
  const handleDeleteConversation = (id: string) => {
    AIChatStorage.deleteConversation(id);
    const remaining = AIChatStorage.getConversations();
    setConversations(remaining);
    if (activeConversationId === id) {
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
        setMode(remaining[0].mode);
      } else {
        handleNewChat();
      }
    }
  };

  // 6. Clear All Conversations
  const handleClearAll = () => {
    AIChatStorage.clearAll();
    const newConv = AIChatStorage.createNewConversation(undefined, mode);
    setConversations([newConv]);
    setActiveConversationId(newConv.id);
  };

  // 7. Change Mode
  const handleSelectMode = (newMode: AIAssistantMode) => {
    if (newMode === mode) return;
    setMode(newMode);

    // If current conversation has messages in different mode, start a fresh session in the selected mode
    if (activeConversation && activeConversation.messages.length > 0 && activeConversation.mode !== newMode) {
      handleNewChat(newMode);
    } else if (activeConversation) {
      // Update active conversation's mode
      activeConversation.mode = newMode;
      AIChatStorage.saveConversations(conversations);
      setConversations([...conversations]);
    }
  };

  // 8. Send Message
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
      // Extract latest conversation history (up to 12 turns)
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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#070b12] text-slate-100 overflow-hidden select-none">
      {/* Top Banner & Mode Header */}
      <div className="px-4 py-2.5 border-b border-white/[0.08] bg-[#090d16] shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                mode === "general"
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-950/50"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50"
              }`}
            >
              {mode === "general" ? (
                <Sparkles className="w-5 h-5 text-violet-400" />
              ) : (
                <Shield className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold text-white tracking-wide font-mono">
                  CYBER<span className="text-cyan-400">GUARD</span> AI Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                  Dual Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {mode === "general"
                  ? "General-purpose conversational AI for coding, writing, reasoning, and problem-solving"
                  : "Specialized SOC analyst grounded in live CYBERGUARD threat telemetry and response playbooks"}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {mode === "cybersecurity" && (
              <button
                type="button"
                onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  showTelemetryDrawer
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40"
                    : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
                title="Toggle SOC telemetry panel"
              >
                {showTelemetryDrawer ? (
                  <PanelRightClose className="w-4 h-4 text-cyan-400" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Telemetry</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNewChat()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Thread</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sessions Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          currentMode={mode}
          onSelect={handleSelectConversation}
          onNewChat={() => handleNewChat()}
          onDelete={handleDeleteConversation}
          onClearAll={handleClearAll}
          providerStatus={providerStatus}
        />

        {/* Central Chat Workspace */}
        <main className="flex-1 flex flex-col bg-[#070b12] overflow-hidden min-w-0">
          {/* Mode Selector Header Bar */}
          <div className="p-3 border-b border-white/[0.06] bg-[#090d16]/60">
            <div className="max-w-4xl mx-auto">
              <ModeSelector
                currentMode={mode}
                onSelectMode={handleSelectMode}
                providerStatus={providerStatus}
              />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
                  <div className="text-center space-y-3">
                    <div
                      className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xl ${
                        mode === "general"
                          ? "bg-violet-950/40 border-violet-500/40 text-violet-300 shadow-violet-950/50"
                          : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-cyan-950/50"
                      }`}
                    >
                      {mode === "general" ? (
                        <Sparkles className="w-7 h-7 text-violet-400" />
                      ) : (
                        <Shield className="w-7 h-7 text-cyan-400" />
                      )}
                    </div>
                    <h2 className="text-lg md:text-xl font-extrabold text-white font-mono">
                      {mode === "general"
                        ? "How can General AI assist you today?"
                        : "CYBERGUARD Security Operations Copilot"}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
                      {mode === "general"
                        ? "Ask about coding, algorithms, technical documentation, writing, or open-ended reasoning powered by CYBERGUARD AI."
                        : "Inspect verified platform incidents, audit authentication logs, verify suspicious links, and compile incident dossiers."}
                    </p>
                  </div>

                  {/* Contextual Prompt Suggestions */}
                  <div className="space-y-2">
                    <div className="text-center text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      Suggested Starting Prompts
                    </div>
                    <PromptSuggestions
                      mode={mode}
                      onSelectPrompt={(p) => handleSendMessage(p)}
                    />
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
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
                ))
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/[0.08] text-xs font-mono text-cyan-300 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>
                    {mode === "general"
                      ? "Generating response with CYBERGUARD AI..."
                      : "Correlating security telemetry and synthesizing analysis..."}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input Bar */}
          <div className="p-3.5 border-t border-white/[0.08] bg-[#090d16]/90 shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="relative flex items-end gap-2 bg-[#0d121f] border border-white/[0.12] rounded-2xl p-2.5 focus-within:border-cyan-500/60 focus-within:shadow-lg focus-within:shadow-cyan-950/30 transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CYBERGUARD AI anything about coding, writing, reasoning, problem-solving, or cybersecurity..."
                  rows={1}
                  className="w-full bg-transparent resize-none text-xs text-white placeholder-slate-500 focus:outline-none min-h-[44px] max-h-36 py-2 px-1 leading-relaxed"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className={`p-2.5 rounded-xl transition-all shrink-0 font-medium ${
                    inputMessage.trim() && !isLoading
                      ? mode === "general"
                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/40"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/40"
                      : "bg-white/[0.06] text-slate-500 cursor-not-allowed"
                  }`}
                  title="Send message (Enter)"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                <span className="hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-slate-400 border border-white/10 text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-black/60 text-slate-400 border border-white/10 text-[10px]">Shift+Enter</kbd> for newline
                </span>
                <span className="text-[10px] text-slate-500">
                  AI may produce inaccurate output. Verify critical security actions.
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Live Telemetry Drawer (for Cybersecurity Mode) */}
        {mode === "cybersecurity" && showTelemetryDrawer && (
          <IntelligenceSidebar
            incidents={incidents}
            posture={posture}
            responseMetrics={responseMetrics}
            onSelectIncident={(incId) => {
              handleSendMessage(`Investigate incident ${incId} and correlate all evidence.`);
            }}
          />
        )}
      </div>

      {/* Structured Incident Report Dossier Modal */}
      {activeReportIncidentId && (
        <ReportModal
          incidentId={activeReportIncidentId}
          onClose={() => setActiveReportIncidentId(null)}
        />
      )}
    </div>
  );
}
