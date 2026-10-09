import React, { useState } from "react";
import { UserCheck, ShieldAlert, Send, Sparkles, Link as LinkIcon, Building2, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface IdentityFormData {
  claimedIdentity: string;
  claimedOrganization: string;
  claimCategory: string;
  communicationText: string;
  destinationUrl: string;
}

interface IdentityFormProps {
  onSubmit: (data: IdentityFormData) => void;
  isAnalyzing: boolean;
}

const PRESET_SCENARIOS: {
  title: string;
  claimedIdentity: string;
  claimedOrganization: string;
  claimCategory: string;
  communicationText: string;
  destinationUrl: string;
}[] = [
  {
    title: "University Scholarship Hold (GIFT College / Accounts)",
    claimedIdentity: "University Accounts Department",
    claimedOrganization: "GIFT Autonomous College",
    claimCategory: "university_teacher",
    communicationText:
      "Hello, this is the accounts department.\n\nYour university scholarship payment is currently on hold.\nPlease verify your bank account immediately using the link below:\n\nhttps://example.com/verify\n\nFailure to complete verification within 30 minutes will result in cancellation.",
    destinationUrl: "https://example.com/verify",
  },
  {
    title: "BPUT Exam Debarment Threat (Academic Coercion)",
    claimedIdentity: "Vice Chancellor / Examination Controller",
    claimedOrganization: "BPUT University",
    claimCategory: "university_teacher",
    communicationText:
      "URGENT NOTICE TO ALL STUDENTS: Your semester registration fee payment failed. You will be debarred from the upcoming semester examination unless you complete immediate clearance through the emergency portal within 2 hours. Do not delay.",
    destinationUrl: "https://bput-exam-clearance-support.example.com/pay",
  },
  {
    title: "CEO Wire Transfer (Business Email Compromise)",
    claimedIdentity: "Chief Executive Officer (CEO)",
    claimedOrganization: "Enterprise Headquarters",
    claimCategory: "executive",
    communicationText:
      "Hi, I am currently locked in an unannounced executive board meeting and cannot take phone calls. We have an urgent confidential acquisition closing today. Please initiate a wire transfer of $45,000 to the attached vendor account immediately. Keep this between us.",
    destinationUrl: "",
  },
];

export function IdentityForm({ onSubmit, isAnalyzing }: IdentityFormProps) {
  const [claimedIdentity, setClaimedIdentity] = useState("");
  const [claimedOrganization, setClaimedOrganization] = useState("");
  const [claimCategory, setClaimCategory] = useState("auto");
  const [communicationText, setCommunicationText] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const textTrimmed = communicationText.trim();
    if (!textTrimmed) {
      setValidationError("Please paste or type the suspicious communication text.");
      return;
    }

    onSubmit({
      claimedIdentity: claimedIdentity.trim(),
      claimedOrganization: claimedOrganization.trim(),
      claimCategory: claimCategory.trim(),
      communicationText: textTrimmed,
      destinationUrl: destinationUrl.trim(),
    });
  };

  const handleSelectPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setClaimedIdentity(preset.claimedIdentity);
    setClaimedOrganization(preset.claimedOrganization);
    setClaimCategory(preset.claimCategory);
    setCommunicationText(preset.communicationText);
    setDestinationUrl(preset.destinationUrl);
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Scenario Presets:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-3 rounded-xl glass-panel border border-white/[0.06] hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all text-xs"
            >
              <div className="font-semibold text-white truncate">{preset.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {preset.claimedIdentity} • {preset.claimedOrganization}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Claimed Identity */}
          <div className="space-y-1.5">
            <label
              htmlFor="claimedIdentity"
              className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Claimed Persona / Role</span>
            </label>
            <input
              id="claimedIdentity"
              name="claimedIdentity"
              type="text"
              value={claimedIdentity}
              onChange={(e) => setClaimedIdentity(e.target.value)}
              placeholder="e.g. University Accounts Department, CEO, Dean"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Claimed Organization */}
          <div className="space-y-1.5">
            <label
              htmlFor="claimedOrganization"
              className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Claimed Organization</span>
            </label>
            <input
              id="claimedOrganization"
              name="claimedOrganization"
              type="text"
              value={claimedOrganization}
              onChange={(e) => setClaimedOrganization(e.target.value)}
              placeholder="e.g. GIFT Autonomous College, BPUT, SBI"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Claim Category */}
          <div className="space-y-1.5">
            <label
              htmlFor="claimCategory"
              className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Persona Category</span>
            </label>
            <select
              id="claimCategory"
              name="claimCategory"
              value={claimCategory}
              onChange={(e) => setClaimCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.1] text-white text-sm focus:outline-none focus:border-cyan-400"
            >
              <option value="auto">Auto Detect Context</option>
              <option value="university_teacher">University / Academic</option>
              <option value="executive">Corporate / Executive</option>
              <option value="financial_institution">Bank / Financial Institution</option>
              <option value="authority">Law Enforcement / Authority</option>
              <option value="support_agent">IT / Support Desk</option>
              <option value="friend_family">Friend / Family</option>
              <option value="general_unknown">Other / Unspecified</option>
            </select>
          </div>
        </div>

        {/* Communication Body */}
        <div className="space-y-1.5">
          <label
            htmlFor="communicationText"
            className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Suspicious Communication Text (Email / SMS / Chat)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Required</span>
          </label>
          <textarea
            id="communicationText"
            name="communicationText"
            rows={5}
            value={communicationText}
            onChange={(e) => setCommunicationText(e.target.value)}
            placeholder="Paste the received message, email, or transcript verbatim..."
            className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
          />
        </div>

        {/* Destination URL */}
        <div className="space-y-1.5">
          <label
            htmlFor="destinationUrl"
            className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Destination Link / Target URL (Optional)</span>
          </label>
          <input
            id="destinationUrl"
            name="destinationUrl"
            type="text"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://example.com/verify (if omitted, extracted automatically from text)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 font-mono text-xs"
          />
        </div>

        {validationError && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
            {validationError}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isAnalyzing}
            className="px-6 py-2.5 text-sm font-semibold shadow-lg shadow-cyan-950/50"
          >
            {isAnalyzing ? "Evaluating Impersonation Vectors..." : "Verify Identity Consistency"}
          </Button>
        </div>
      </form>
    </div>
  );
}
