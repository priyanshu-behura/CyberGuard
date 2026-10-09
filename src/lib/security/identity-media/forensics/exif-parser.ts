/**
 * Zero-dependency Binary EXIF & Metadata Forensic Parser
 * Safely inspects JPEG, PNG, and WebP byte streams for camera provenance,
 * editing software traces, and AI generation metadata.
 */

export interface ExtractedMetadata {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  hasGps?: boolean;
  width?: number;
  height?: number;
  aiGeneratorHints?: string[];
  editingToolsFound?: string[];
  rawChunksFound?: string[];
  isCorrupted?: boolean;
}

export function parseImageBuffer(buffer: Uint8Array): ExtractedMetadata {
  const result: ExtractedMetadata = {
    aiGeneratorHints: [],
    editingToolsFound: [],
    rawChunksFound: [],
  };

  if (!buffer || buffer.length < 8) {
    result.isCorrupted = true;
    return result;
  }

  // 1. JPEG Detection (0xFFD8)
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    parseJpeg(buffer, result);
    return result;
  }

  // 2. PNG Detection (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    parsePng(buffer, result);
    return result;
  }

  // 3. WebP Detection (RIFF .... WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    parseWebP(buffer, result);
    return result;
  }

  return result;
}

function parseJpeg(buf: Uint8Array, meta: ExtractedMetadata) {
  let offset = 2;
  const len = buf.length;

  while (offset < len - 4) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buf[offset + 1];
    offset += 2;

    // Standalone markers
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }

    if (offset + 2 > len) break;
    const segmentLength = (buf[offset] << 8) | buf[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > len) break;

    const segmentData = buf.subarray(offset + 2, offset + segmentLength);

    // SOF0 / SOF2 (Baseline / Progressive DCT - Dimensions)
    if (marker === 0xc0 || marker === 0xc2) {
      if (segmentData.length >= 5) {
        meta.height = (segmentData[1] << 8) | segmentData[2];
        meta.width = (segmentData[3] << 8) | segmentData[4];
      }
    }

    // APP1 (EXIF or XMP)
    if (marker === 0xe1) {
      parseApp1(segmentData, meta);
    }

    // APP13 (Photoshop IPTC)
    if (marker === 0xed) {
      meta.editingToolsFound?.push("Photoshop IPTC Profile");
    }

    // COM (Comment)
    if (marker === 0xfe) {
      const commentStr = decodeAscii(segmentData);
      checkAiAndEditorStrings(commentStr, meta);
    }

    offset += segmentLength;
  }
}

function parseApp1(data: Uint8Array, meta: ExtractedMetadata) {
  const header = decodeAscii(data.subarray(0, 6));
  if (header.startsWith("Exif\0\0")) {
    const tiffStart = 6;
    if (data.length < tiffStart + 8) return;

    const isLittleEndian = data[tiffStart] === 0x49 && data[tiffStart + 1] === 0x49;
    const read16 = (pos: number) =>
      isLittleEndian
        ? data[pos] | (data[pos + 1] << 8)
        : (data[pos] << 8) | data[pos + 1];
    const read32 = (pos: number) =>
      isLittleEndian
        ? (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0
        : ((data[pos] << 24) | (data[pos + 1] << 16) | (data[pos + 2] << 8) | data[pos + 3]) >>> 0;

    const firstIfdOffset = read32(tiffStart + 4);
    if (tiffStart + firstIfdOffset + 2 > data.length) return;

    const entryCount = read16(tiffStart + firstIfdOffset);
    let entryOffset = tiffStart + firstIfdOffset + 2;

    for (let i = 0; i < entryCount && entryOffset + 12 <= data.length; i++) {
      const tag = read16(entryOffset);
      const count = read32(entryOffset + 4);
      const valOffset = read32(entryOffset + 8);

      if (tag === 0x010f) {
        // Make
        meta.make = extractTiffString(data, tiffStart, count, valOffset);
      } else if (tag === 0x0110) {
        // Model
        meta.model = extractTiffString(data, tiffStart, count, valOffset);
      } else if (tag === 0x0131) {
        // Software
        const sw = extractTiffString(data, tiffStart, count, valOffset);
        meta.software = sw;
        checkAiAndEditorStrings(sw, meta);
      } else if (tag === 0x0132) {
        // DateTime
        meta.dateTime = extractTiffString(data, tiffStart, count, valOffset);
      } else if (tag === 0x8825) {
        // GPS IFD
        meta.hasGps = true;
      }

      entryOffset += 12;
    }
  } else {
    // Possibly XMP string
    const xmpStr = decodeAscii(data);
    checkAiAndEditorStrings(xmpStr, meta);
  }
}

function extractTiffString(
  data: Uint8Array,
  tiffStart: number,
  count: number,
  valOffset: number
): string {
  if (count <= 4) {
    return decodeAscii(
      new Uint8Array([
        valOffset & 0xff,
        (valOffset >> 8) & 0xff,
        (valOffset >> 16) & 0xff,
        (valOffset >> 24) & 0xff,
      ]).subarray(0, count)
    ).replace(/\0/g, "");
  }
  const realPos = tiffStart + valOffset;
  if (realPos + count <= data.length) {
    return decodeAscii(data.subarray(realPos, realPos + count)).replace(/\0/g, "");
  }
  return "";
}

function parsePng(buf: Uint8Array, meta: ExtractedMetadata) {
  let offset = 8;
  const len = buf.length;

  while (offset + 8 <= len) {
    const chunkLen =
      (buf[offset] << 24) |
      (buf[offset + 1] << 16) |
      (buf[offset + 2] << 8) |
      buf[offset + 3];
    const chunkType = decodeAscii(buf.subarray(offset + 4, offset + 8));
    meta.rawChunksFound?.push(chunkType);

    if (chunkType === "IHDR" && chunkLen >= 8) {
      const dataPos = offset + 8;
      meta.width =
        (buf[dataPos] << 24) |
        (buf[dataPos + 1] << 16) |
        (buf[dataPos + 2] << 8) |
        buf[dataPos + 3];
      meta.height =
        (buf[dataPos + 4] << 24) |
        (buf[dataPos + 5] << 16) |
        (buf[dataPos + 6] << 8) |
        buf[dataPos + 7];
    }

    if (chunkType === "tEXt" || chunkType === "iTXt" || chunkType === "zTXt") {
      const dataPos = offset + 8;
      if (dataPos + chunkLen <= len) {
        const textPayload = decodeAscii(buf.subarray(dataPos, dataPos + chunkLen));
        checkAiAndEditorStrings(textPayload, meta);
      }
    }

    offset += 8 + chunkLen + 4; // Length + Type + Data + CRC
  }
}

function parseWebP(buf: Uint8Array, meta: ExtractedMetadata) {
  let offset = 12;
  const len = buf.length;

  while (offset + 8 <= len) {
    const fourCC = decodeAscii(buf.subarray(offset, offset + 4));
    const size =
      buf[offset + 4] |
      (buf[offset + 5] << 8) |
      (buf[offset + 6] << 16) |
      (buf[offset + 7] << 24);

    meta.rawChunksFound?.push(fourCC);

    if (fourCC === "VP8 " && size >= 10) {
      const dataPos = offset + 8;
      // Keyframe code
      if (buf[dataPos + 3] === 0x9d && buf[dataPos + 4] === 0x01 && buf[dataPos + 5] === 0x2a) {
        meta.width = (buf[dataPos + 6] | (buf[dataPos + 7] << 8)) & 0x3fff;
        meta.height = (buf[dataPos + 8] | (buf[dataPos + 9] << 8)) & 0x3fff;
      }
    } else if (fourCC === "VP8L" && size >= 5) {
      const dataPos = offset + 8;
      if (buf[dataPos] === 0x2f) {
        const b1 = buf[dataPos + 1];
        const b2 = buf[dataPos + 2];
        const b3 = buf[dataPos + 3];
        const b4 = buf[dataPos + 4];
        meta.width = 1 + (((b2 & 0x3f) << 8) | b1);
        meta.height = 1 + ((((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)));
      }
    } else if (fourCC === "EXIF") {
      const exifData = buf.subarray(offset + 8, offset + 8 + size);
      parseApp1(exifData, meta);
    }

    offset += 8 + size + (size % 2); // WebP chunks are padded to 2 bytes
  }
}

function checkAiAndEditorStrings(text: string, meta: ExtractedMetadata) {
  if (!text) return;
  const lower = text.toLowerCase();

  const aiKeywords = [
    "stable diffusion",
    "midjourney",
    "dall-e",
    "novelai",
    "comfyui",
    "automatic1111",
    "invokeai",
    "civitai",
    "flux.1",
    "negative prompt",
    "steps: ",
    "sampler: ",
    "cfg scale: ",
  ];

  for (const kw of aiKeywords) {
    if (lower.includes(kw) && !meta.aiGeneratorHints?.includes(kw)) {
      meta.aiGeneratorHints?.push(kw);
    }
  }

  const editorKeywords = [
    "photoshop",
    "adobe",
    "gimp",
    "canva",
    "lightroom",
    "picsart",
    "snapseed",
    "procreate",
    "paint.net",
  ];

  for (const ed of editorKeywords) {
    if (lower.includes(ed) && !meta.editingToolsFound?.includes(ed)) {
      meta.editingToolsFound?.push(ed);
    }
  }
}

function decodeAscii(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if (c >= 32 && c <= 126) {
      str += String.fromCharCode(c);
    } else if (c === 0x0a || c === 0x0d || c === 0x09) {
      str += " ";
    }
  }
  return str;
}
