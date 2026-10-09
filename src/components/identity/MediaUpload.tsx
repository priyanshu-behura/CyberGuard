import React, { useState, useRef } from "react";
import { MediaType } from "@/lib/security/identity-media/types";
import { Upload, X, FileCheck, AlertCircle, Image as ImageIcon, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MediaUploadProps {
  type: MediaType;
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  error: string | null;
}

const TYPE_CONFIG = {
  image: {
    label: "Image",
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    maxSizeMb: 15,
    icon: ImageIcon,
    extensions: ["JPG", "JPEG", "PNG", "WEBP"],
  },
  video: {
    label: "Video",
    accept: ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm",
    maxSizeMb: 50,
    icon: Video,
    extensions: ["MP4", "MOV", "WEBM"],
  },
  audio: {
    label: "Audio Recording",
    accept: ".mp3,.wav,.m4a,.ogg,audio/mpeg,audio/wav,audio/x-m4a,audio/ogg",
    maxSizeMb: 25,
    icon: Music,
    extensions: ["MP3", "WAV", "M4A", "OGG"],
  },
  identity: {
    label: "Supporting Media",
    accept: "*/*",
    maxSizeMb: 15,
    icon: FileCheck,
    extensions: ["JPG", "PNG", "MP3", "MP4"],
  },
};

export function MediaUpload({
  type,
  onFileSelected,
  selectedFile,
  onRemoveFile,
  isAnalyzing,
  onAnalyze,
  error,
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.image;
  const Icon = config.icon;

  const handleFileChange = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onRemoveFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 glass-panel ${
            isDragging
              ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
              : "border-white/[0.12] hover:border-cyan-500/50 hover:bg-slate-900/60"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
            accept={config.accept}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/40">
              <Icon className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Upload {config.label} for Authenticity Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Drag and drop your file here, or{" "}
                <span className="text-cyan-400 font-semibold underline underline-offset-2">
                  browse local filesystem
                </span>
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {config.extensions.map((ext) => (
                <span
                  key={ext}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-900 text-slate-400 border border-white/[0.08]"
                >
                  {ext}
                </span>
              ))}
              <span className="text-[10px] font-mono text-slate-500 ml-1">
                Max {config.maxSizeMb} MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Preview & Confirmation State */
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 bg-slate-900/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <p className="text-xs font-mono text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "binary"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isAnalyzing}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Media Preview */}
          {previewUrl && (
            <div className="rounded-xl overflow-hidden bg-black/60 border border-white/[0.08] max-h-80 flex items-center justify-center p-2">
              {type === "image" && (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-72 object-contain rounded-lg"
                />
              )}
              {type === "video" && (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-72 w-full object-contain rounded-lg"
                />
              )}
              {type === "audio" && (
                <div className="w-full py-6 px-4">
                  <audio src={previewUrl} controls className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Trigger Analysis Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400 font-mono">
              Ready for binary inspection & provenance correlation.
            </span>
            <Button
              variant="primary"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-2.5 font-semibold text-sm shadow-lg shadow-cyan-950/50"
            >
              {isAnalyzing ? "Analyzing Media..." : `Start ${config.label} Analysis`}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
