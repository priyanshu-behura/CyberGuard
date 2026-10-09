"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { AIConversation, AIAssistantMode, AIProviderStatus } from "@/lib/ai/types";

interface ChatSidebarProps {
  conversations: AIConversation[];
  activeId: string | null;
  currentMode: AIAssistantMode;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  providerStatus: AIProviderStatus | null;
}

export function ChatSidebar({
  conversations,
  activeId,
  currentMode,
  onSelect,
  onNewChat,
  onDelete,
  onClearAll,
}: ChatSidebarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "general" | "cybersecurity">("all");

  const filteredConversations = conversations.filter((c) => {
    if (filterMode === "all") return true;
    return c.mode === filterMode;
  });

  return (
    <aside className="w-full md:w-64 lg:w-72 flex flex-col bg-[#08090D] border-r border-white/10 shrink-0 h-full select-none">
      {/* Header & New Chat Button */}
      <div className="p-3.5 border-b border-white/10 space-y-3">
        <button
          type="button"
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all active:scale-[0.98] ${
            currentMode === "general"
              ? "bg-[#805BFF] hover:bg-[#7046fd] text-white shadow-[#805BFF]/30 border border-white/15"
              : "bg-[#39DCE5] hover:bg-[#20cbd4] text-[#08090D] shadow-[#39DCE5]/30 border border-white/15 font-bold"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>
            {currentMode === "general" ? "New General Thread" : "New Security Thread"}
          </span>
        </button>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-[#11131B] rounded-xl border border-white/[0.08] text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`flex-1 py-1 rounded-lg text-center transition-colors ${
              filterMode === "all"
                ? "bg-white/[0.1] text-white font-bold"
                : "text-[#9CA3B5] hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("general")}
            className={`flex-1 py-1 rounded-lg text-center transition-colors ${
              filterMode === "general"
                ? "bg-[#805BFF]/30 text-[#C4B5FD] font-bold"
                : "text-[#9CA3B5] hover:text-white"
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("cybersecurity")}
            className={`flex-1 py-1 rounded-lg text-center transition-colors ${
              filterMode === "cybersecurity"
                ? "bg-[#39DCE5]/30 text-[#39DCE5] font-bold"
                : "text-[#9CA3B5] hover:text-white"
            }`}
          >
            Cyber
          </button>
        </div>
      </div>

      {/* Conversation Sessions List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#9CA3B5] font-semibold flex items-center justify-between">
          <span>Saved Sessions</span>
          <span className="text-slate-600 font-normal">{filteredConversations.length}</span>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-[#9CA3B5] text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-600" />
            <p>No conversations recorded.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Start chatting or click a suggested prompt.
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isGeneralConv = conv.mode === "general";
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                  isActive
                    ? isGeneralConv
                      ? "bg-[#171923] border border-[#805BFF]/50 text-white shadow-sm shadow-[#805BFF]/20"
                      : "bg-[#171923] border border-[#39DCE5]/50 text-white shadow-sm shadow-[#39DCE5]/20"
                    : "text-[#9CA3B5] hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-6">
                  {isGeneralConv ? (
                    <Sparkles className="w-3.5 h-3.5 text-[#805BFF] shrink-0" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-[#39DCE5] shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="truncate font-medium">{conv.title}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                      <span>{conv.messages.length} msgs</span>
                      <span>•</span>
                      <span>
                        {new Date(conv.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all shrink-0"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      {conversations.length > 0 && (
        <div className="p-3 border-t border-white/10 bg-[#08090D]">
          {showClearConfirm ? (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Purge all conversations?</span>
              </div>
              <p className="text-[11px] text-slate-400">This action cannot be undone.</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-slate-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-1.5 px-3 rounded-xl text-[#9CA3B5] hover:text-rose-300 hover:bg-rose-950/20 text-xs transition-colors flex items-center justify-center gap-1.5 font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
