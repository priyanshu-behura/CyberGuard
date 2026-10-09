"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  onSelectPrompt?: (prompt: string) => void;
}

export function ChatMessageItem({
  message,
  onRetry,
  onOpenReport,
  onSelectPrompt,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null);

  const isUser = message.role === "user";
  const isGeneral = message.mode === "general";

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleCopyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(blockId);
      setTimeout(() => setCopiedCodeBlock(null), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // Inline formatting parser for bold, code, links
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#08090D] border border-white/10 font-mono text-[11px] text-[#39DCE5] font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-[#F5F5FA]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        return (
          <Link
            key={i}
            href={href}
            className="text-[#39DCE5] hover:text-white underline underline-offset-2 font-medium transition-colors"
          >
            {label}
          </Link>
        );
      }
      return part;
    });
  };

  // Structured Markdown renderer with code blocks, headings, callouts, and lists
  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = "";
    let codeBlockIndex = 0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      // Handle Code Block start/end
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          const fullCode = codeBuffer.join("\n");
          const blockId = `code-${idx}-${codeBlockIndex++}`;
          elements.push(
            <div
              key={blockId}
              className="my-3 rounded-2xl border border-white/10 bg-[#08090D] overflow-hidden shadow-xl shadow-black/60 font-mono text-xs"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[#11131B] border-b border-white/[0.08] text-[11px] text-[#9CA3B5]">
                <span className="font-semibold uppercase tracking-wider text-[#39DCE5]">
                  {codeLang || "code"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(fullCode, blockId)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#F5F5FA] transition-all text-[10px]"
                >
                  {copiedCodeBlock === blockId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[#F5F5FA] text-xs leading-relaxed font-mono">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeBuffer = [];
          codeLang = "";
        } else {
          inCodeBlock = true;
          codeLang = line.replace("```", "").trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Headings (###)
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={idx}
            className={`text-sm font-bold mt-4 mb-1.5 font-mono tracking-wide flex items-center gap-2 ${
              isUser ? "text-white" : "text-[#0B132B]"
            }`}
          >
            {renderInlineFormatting(line.replace("### ", ""))}
          </h3>
        );
        continue;
      }

      // Subheadings (####)
      if (line.startsWith("#### ")) {
        elements.push(
          <h4
            key={idx}
            className={`text-xs font-semibold mt-3 mb-1 tracking-wide ${
              isUser ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {renderInlineFormatting(line.replace("#### ", ""))}
          </h4>
        );
        continue;
      }

      // Alert Callouts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING])
      if (line.startsWith("> [!")) {
        const type = line.match(/> \[!(\w+)\]/)?.[1] || "NOTE";
        const colorClass =
          type === "WARNING"
            ? "border-rose-300 bg-rose-50 text-rose-800"
            : type === "IMPORTANT"
            ? "border-amber-300 bg-amber-50 text-amber-800"
            : type === "TIP"
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-indigo-300 bg-indigo-50 text-indigo-900";
        elements.push(
          <div
            key={idx}
            className={`my-2 p-3 rounded-xl border text-xs font-mono ${colorClass}`}
          >
            <span className="font-bold uppercase tracking-wider block text-[10px]">
              {type}:
            </span>
          </div>
        );
        continue;
      }

      // Blockquotes (> )
      if (line.startsWith("> ")) {
        elements.push(
          <p
            key={idx}
            className={`text-xs italic pl-3 border-l-2 my-1.5 ${
              isUser
                ? "text-slate-300 border-white/40"
                : "text-slate-600 border-[#6366F1]"
            }`}
          >
            {renderInlineFormatting(line.replace("> ", ""))}
          </p>
        );
        continue;
      }

      // Horizontal Rule (---)
      if (line.trim() === "---") {
        elements.push(
          <hr
            key={idx}
            className={`my-3 ${isUser ? "border-white/20" : "border-slate-200"}`}
          />
        );
        continue;
      }

      // Bulleted list item
      if (line.startsWith("- ")) {
        elements.push(
          <div
            key={idx}
            className={`flex items-start gap-2.5 text-xs my-1 pl-1 leading-relaxed ${
              isUser ? "text-white/90" : "text-slate-700"
            }`}
          >
            <span className="text-[#6366F1] mt-1 shrink-0">•</span>
            <span>{renderInlineFormatting(line.replace("- ", ""))}</span>
          </div>
        );
        continue;
      }

      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        elements.push(
          <div
            key={idx}
            className={`flex items-start gap-2.5 text-xs my-1 pl-1 leading-relaxed ${
              isUser ? "text-white/90" : "text-slate-700"
            }`}
          >
            <span className="text-[#6366F1] font-mono text-[11px] shrink-0 font-bold">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span>{renderInlineFormatting(line.replace(/^\d+\.\s/, ""))}</span>
          </div>
        );
        continue;
      }

      // Empty line spacer
      if (line.trim() === "") {
        elements.push(<div key={idx} className="h-2" />);
        continue;
      }

      // Standard text paragraph
      elements.push(
        <p
          key={idx}
          className={`text-xs sm:text-sm my-1 leading-relaxed ${
            isUser ? "text-white" : "text-[#0B132B]"
          }`}
        >
          {renderInlineFormatting(line)}
        </p>
      );
    }

    return elements;
  };

  return (
    <div
      className={`group relative flex gap-4 p-5 rounded-2xl transition-all ${
        isUser
          ? "bg-[#0B132B] text-white border border-[#171B26] shadow-md"
          : isGeneral
          ? "bg-white border border-purple-200/70 shadow-sm text-[#0B132B]"
          : "bg-white border border-slate-200/90 shadow-sm text-[#0B132B]"
      }`}
    >
      {/* Avatar Icon */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-[#171923] border border-white/20 flex items-center justify-center text-white shadow-sm">
            <User className="w-4 h-4 text-[#F5F5FA]" />
          </div>
        ) : isGeneral ? (
          <div className="w-8 h-8 rounded-xl bg-[#805BFF]/20 border border-[#805BFF]/40 flex items-center justify-center text-white shadow-md shadow-[#805BFF]/30">
            <Sparkles className="w-4 h-4 text-[#805BFF]" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-[#39DCE5]/20 border border-[#39DCE5]/40 flex items-center justify-center text-white shadow-md shadow-[#39DCE5]/30">
            <Shield className="w-4 h-4 text-[#39DCE5]" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-wider text-[#F5F5FA]">
              {isUser
                ? "Security Operator"
                : isGeneral
                ? "CYBERGUARD General AI"
                : "CYBERGUARD Intelligence"}
            </span>

            {!isUser && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider ${
                    message.executionMode === "REAL_AI_GEMINI"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : message.executionMode === "DEMO_FALLBACK"
                      ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      : "bg-[#39DCE5]/15 text-[#39DCE5] border border-[#39DCE5]/30"
                  }`}
                >
                  {message.executionMode === "REAL_AI_GEMINI"
                    ? "GOOGLE GEMINI"
                    : message.executionMode === "DEMO_FALLBACK"
                    ? "NOTICE"
                    : "LOCAL COPILOT"}
                </span>

                {message.modelIdentifier && (
                  <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-mono text-[#9CA3B5] bg-[#08090D] border border-white/[0.08]">
                    {message.modelIdentifier}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Timestamp & Action Toolbar */}
          <div className="flex items-center gap-2 text-[11px] text-[#9CA3B5]">
            <span className="font-mono text-[10px]">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="p-1 rounded-md text-[#9CA3B5] hover:text-[#F5F5FA] hover:bg-white/[0.08] transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="p-1 rounded-md text-[#9CA3B5] hover:text-[#F5F5FA] hover:bg-white/[0.08] transition-colors"
                title="Retry response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Read-Only Tools Accordion */}
        {!isUser &&
          message.toolInvocations &&
          message.toolInvocations.length > 0 && (
            <div className="my-2 rounded-xl bg-[#08090D] border border-white/[0.08] overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowTools(!showTools)}
                className="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-300 hover:bg-white/[0.03] transition-colors font-mono text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-[#39DCE5]" />
                  <span>
                    Executed {message.toolInvocations.length} Read-Only Platform Tool(s)
                  </span>
                </div>
                {showTools ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#9CA3B5]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#9CA3B5]" />
                )}
              </button>

              {showTools && (
                <div className="p-3 border-t border-white/[0.06] space-y-2 font-mono text-[11px]">
                  {message.toolInvocations.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#11131B] border border-white/[0.06]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#39DCE5]">
                          {t.toolName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                            t.status === "success"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <pre className="text-[10px] text-[#9CA3B5] overflow-x-auto p-1.5 bg-[#08090D] rounded">
                        {JSON.stringify(t.parameters, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Main Rendered Content */}
        <div className="text-[#F5F5FA]">
          {renderFormattedContent(message.content)}
        </div>

        {/* Incident Dossier Action Card */}
        {message.report && (
          <div className="mt-3.5 p-4 rounded-2xl border border-[#39DCE5]/40 bg-[#171923] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#39DCE5]/20 border border-[#39DCE5]/40 text-[#39DCE5]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F5F5FA] font-mono">
                  Structured Incident Dossier: {message.report.incidentId}
                </div>
                <div className="text-[11px] text-[#9CA3B5]">
                  {message.report.title}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenReport?.(message.report?.incidentId)}
              className="px-3.5 py-1.5 rounded-xl bg-[#39DCE5] hover:bg-[#20cbd4] text-[#08090D] font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-[#39DCE5]/25"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect & Export Dossier</span>
            </button>
          </div>
        )}

        {/* Follow-up Prompts */}
        {!isUser &&
          message.suggestedFollowUps &&
          message.suggestedFollowUps.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {message.suggestedFollowUps.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectPrompt?.(prompt)}
                  className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#805BFF]/50 text-xs text-[#9CA3B5] hover:text-[#F5F5FA] transition-all text-left flex items-center gap-1.5"
                >
                  <span className="text-[#39DCE5] font-mono text-[10px]">↳</span>
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
