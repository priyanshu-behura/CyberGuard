"use client";

import React, { useState } from "react";
import {
  Shield,
  User,
  Copy,
  Check,
  RotateCcw,
  Wrench,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { AIMessage } from "@/lib/ai/types";

interface ChatMessageItemProps {
  message: AIMessage;
  onRetry?: () => void;
  onOpenReport?: (incidentId?: string) => void;
}

export function ChatMessageItem({
  message,
  onRetry,
  onOpenReport,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // Format markdown-like blocks: headings, bolding, bullet points, callouts
  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Main Headings (###)
      if (line.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="text-sm font-bold text-cyan-300 mt-3 mb-1.5 font-mono tracking-wide flex items-center gap-2"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      // Subheadings (####)
      if (line.startsWith("#### ")) {
        return (
          <h4
            key={idx}
            className="text-xs font-semibold text-white mt-2.5 mb-1 tracking-wide"
          >
            {line.replace("#### ", "")}
          </h4>
        );
      }
      // Mini headings (#####)
      if (line.startsWith("##### ")) {
        return (
          <h5
            key={idx}
            className="text-xs font-bold text-amber-300 mt-2 mb-0.5 font-mono"
          >
            {line.replace("##### ", "")}
          </h5>
        );
      }
      // Alert Callouts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING])
      if (line.startsWith("> [!")) {
        const type = line.match(/> \[!(\w+)\]/)?.[1] || "NOTE";
        const colorClass =
          type === "WARNING"
            ? "border-rose-500/50 bg-rose-950/30 text-rose-200"
            : type === "IMPORTANT"
            ? "border-amber-500/50 bg-amber-950/30 text-amber-200"
            : "border-cyan-500/50 bg-cyan-950/30 text-cyan-200";
        return (
          <div
            key={idx}
            className={`my-2 p-2.5 rounded-lg border text-xs font-mono ${colorClass}`}
          >
            <span className="font-bold uppercase tracking-wider block text-[10px]">
              {type}:
            </span>
          </div>
        );
      }
      if (line.startsWith("> ")) {
        return (
          <p key={idx} className="text-xs text-slate-300 italic pl-3 border-l-2 border-cyan-500/40 my-1">
            {line.replace("> ", "")}
          </p>
        );
      }
      // Horizontal Rule (---)
      if (line.trim() === "---") {
        return <hr key={idx} className="my-2.5 border-white/[0.08]" />;
      }
      // Bullet list item
      if (line.startsWith("- ")) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-0.5 pl-1 leading-relaxed">
            <span className="text-cyan-400 mt-1 shrink-0">•</span>
            <span>{renderInlineFormatting(line.replace("- ", ""))}</span>
          </div>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-0.5 pl-1 leading-relaxed">
            <span className="text-cyan-400 font-mono text-[11px] shrink-0 font-bold">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span>{renderInlineFormatting(line.replace(/^\d+\.\s/, ""))}</span>
          </div>
        );
      }
      // Regular paragraph or blank line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-300 my-1 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  // Inline formatting for **bold**, `code`, and [links](url)
  const renderInlineFormatting = (text: string) => {
    // Process markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(processBoldAndCode(text.substring(lastIndex, match.index)));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
        >
          {linkText}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(processBoldAndCode(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : processBoldAndCode(text);
  };

  const processBoldAndCode = (text: string): React.ReactNode => {
    // Handle inline code `code`
    const codeParts = text.split(/(`[^`]+`)/);
    return codeParts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-black/50 border border-white/[0.1] text-cyan-300 text-[11px] font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      // Handle **bold**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith("**") && bPart.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold text-white">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  return (
    <div
      className={`group relative flex gap-3 p-4 rounded-2xl transition-all ${
        isUser
          ? "bg-slate-900/50 border border-white/[0.06] ml-6 sm:ml-12"
          : "glass-panel border-white/[0.08] mr-2 sm:mr-8 shadow-lg shadow-black/20"
      }`}
    >
      {/* Avatar Icon */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
            <User className="w-4 h-4 text-slate-300" />
          </div>
        ) : (
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-sm shadow-cyan-950/40">
            <Shield className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Top Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider text-white">
              {isUser ? "Security Analyst" : "CYBERGUARD AI COPILOT"}
            </span>

            {/* Mode Tag */}
            {!isUser && message.executionMode && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                  message.executionMode.startsWith("REAL_AI")
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                }`}
              >
                {message.executionMode.startsWith("REAL_AI")
                  ? "CLOUD AI INFERENCE"
                  : "HEURISTIC COPILOT"}
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Tool Invocations Badge / Accordion */}
        {!isUser && message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden text-xs">
            <button
              onClick={() => setShowTools(!showTools)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Executed {message.toolInvocations.length} security tool{message.toolInvocations.length !== 1 ? "s" : ""}
                </span>
              </div>
              {showTools ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {showTools && (
              <div className="p-2.5 border-t border-white/[0.06] space-y-2 bg-slate-950/60 font-mono text-[11px]">
                {message.toolInvocations.map((tool) => (
                  <div key={tool.id} className="p-2 rounded bg-black/60 border border-white/[0.04]">
                    <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                      <span>tool: {tool.toolName}</span>
                      <span className="text-[10px] text-emerald-400 uppercase">
                        [{tool.status}]
                      </span>
                    </div>
                    {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                      <div className="text-slate-400 text-[10px] truncate">
                        params: {JSON.stringify(tool.parameters)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formatted Content */}
        <div className="text-slate-200">
          {renderFormattedContent(message.content)}
        </div>

        {/* Bottom Actions Bar */}
        {!isUser && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
            {/* Contextual Action: Open Report */}
            <div className="flex items-center gap-2">
              {message.associatedIncidentId && (
                <button
                  type="button"
                  onClick={() => onOpenReport && onOpenReport(message.associatedIncidentId)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Generate Report Dossier ({message.associatedIncidentId})</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] text-[11px] font-mono transition-colors"
                title="Copy response to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] text-[11px] font-mono transition-colors"
                  title="Retry prompt"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
