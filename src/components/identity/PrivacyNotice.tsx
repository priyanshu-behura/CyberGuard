import React, { useState } from "react";
import { Lock, Shield, EyeOff, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-slate-950/40 p-4 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Privacy & Evidence Handling Notice
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
          <span>{isOpen ? "Hide Policy" : "Read Policy"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="pt-3 mt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <EyeOff className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-medium block">Zero Raw Persistence:</span>
              Media files are inspected directly in-memory. Binary buffers are cleared upon completion.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-medium block">Metadata Isolation:</span>
              Only technical forensic metrics (EXIF, resolution, sample rate) and risk scores are recorded.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Trash2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-medium block">Confidential Processing:</span>
              No uploads are shared with public training datasets or arbitrary third parties.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
