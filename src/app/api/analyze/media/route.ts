import { NextRequest, NextResponse } from "next/server";
import { unifiedMediaAnalyzer } from "@/lib/security/identity-media/media-analyzer";
import { MediaType } from "@/lib/security/identity-media/types";

// Maximum upload limits
const MAX_SIZES: Record<MediaType, number> = {
  image: 15 * 1024 * 1024, // 15MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 25 * 1024 * 1024, // 25MB
  identity: 5 * 1024 * 1024,
};

const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  video: ["video/mp4", "video/quicktime", "video/webm"],
  audio: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/webm"],
  identity: [],
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = (formData.get("type") as MediaType) || "image";

    if (!file) {
      return NextResponse.json(
        { error: "No media file provided in request." },
        { status: 400 }
      );
    }

    // 1. Sanitize filename
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // 2. Validate File Size
    const maxSize = MAX_SIZES[mediaType] || 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds allowable maximum (${Math.round(maxSize / (1024 * 1024))}MB) for ${mediaType} inspection.`,
        },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File payload is empty (0 bytes)." },
        { status: 400 }
      );
    }

    // 3. MIME validation
    const allowedMimes = ALLOWED_MIME_TYPES[mediaType] || [];
    const clientMime = file.type.toLowerCase();
    const isMimeAllowed = allowedMimes.some((m) => clientMime.includes(m) || m.includes(clientMime));

    if (!isMimeAllowed && clientMime !== "application/octet-stream") {
      return NextResponse.json(
        {
          error: `Unsupported MIME type "${file.type}". Allowed formats for ${mediaType}: ${allowedMimes.join(", ")}`,
        },
        { status: 415 }
      );
    }

    // 4. Read into memory buffer (no disk write, no execution risk)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 5. Execute Forensics Pipeline
    let result;
    if (mediaType === "image") {
      result = await unifiedMediaAnalyzer.analyzeImage(buffer, safeFilename, clientMime || "image/jpeg");
    } else if (mediaType === "video") {
      result = await unifiedMediaAnalyzer.analyzeVideo(buffer, safeFilename, clientMime || "video/mp4");
    } else if (mediaType === "audio") {
      result = await unifiedMediaAnalyzer.analyzeAudio(buffer, safeFilename, clientMime || "audio/mpeg");
    } else {
      return NextResponse.json({ error: "Unsupported media type." }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Media analysis server error:", error);
    return NextResponse.json(
      {
        error: "Media analysis failed due to server processing error.",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
