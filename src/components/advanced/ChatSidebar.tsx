"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  AlertOctagon,
  Cpu,
  Shield,
  Layers,
} from "lucide-react";
import { AIConversation } from "@/lib/ai/types";
import { AIProviderStatus } from "@/lib/ai/ai-provider";

interface ChatSidebarProps {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  providerStatus: AIProviderStatus | null;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onClearAll,
  providerStatus,
}: ChatSidebarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <aside className="w-full md:w-64 lg:w-72 flex flex-col bg-[#0a0e17] border-r border-white/[0.08] shrink-0 h-full">
      {/* Header & New Chat Button */}
      <div className="p-3.5 border-b border-white/[0.08] space-y-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/40 text-cyan-300 font-medium text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>New Threat Investigation</span>
        </button>

        {/* AI Engine Status Pill */}
        <div className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                providerStatus?.isConfigured
                  ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80"
                  : "bg-cyan-400"
              }`}
            />
            <span className="text-slate-300 truncate">
              {providerStatus?.isConfigured
                ? providerStatus.modelName
                : "Heuristic Copilot"}
            </span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
              providerStatus?.isConfigured
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
            }`}
          >
            {providerStatus?.isConfigured ? "CLOUD AI" : "LOCAL"}
          </span>
        </div>
      </div>

      {/* Conversation Sessions List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
          <span>Recent Sessions</span>
          <span className="text-slate-600 font-normal">{conversations.length}</span>
        </div>

        {conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-600" />
            <p>No investigations logged yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">Start a conversation or click a suggested prompt.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                  isActive
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"
                    }`}
                  />
                  <div className="truncate">
                    <p className="truncate font-medium">{conv.title}</p>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(conv.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} • {conv.messages.length} msg{conv.messages.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all shrink-0"
                  title="Delete investigation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Clear All History */}
      {conversations.length > 0 && (
        <div className="p-3 border-t border-white/[0.08]">
          {showClearConfirm ? (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center space-y-2">
              <p className="text-[11px] text-rose-300 font-medium">Clear all chat history?</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-500 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 text-[11px] font-mono transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
