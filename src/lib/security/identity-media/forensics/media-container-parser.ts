/**
 * Zero-dependency Binary Video and Audio Container Forensic Parser
 * Extracts technical encoding specs, duration, tracks, and structural markers.
 */

export interface VideoForensics {
  majorBrand?: string;
  durationSeconds?: number;
  timescale?: number;
  hasVideoTrack: boolean;
  hasAudioTrack: boolean;
  width?: number;
  height?: number;
  estimatedFps?: number;
  structuralAnomalies: string[];
  isCorrupted: boolean;
}

export interface AudioForensics {
  format: "WAV" | "MP3" | "M4A" | "OGG" | "UNKNOWN";
  sampleRateHz?: number;
  channels?: number;
  bitsPerSample?: number;
  durationSeconds?: number;
  encoderSoftware?: string;
  hasUnusualSilenceOrClipping?: boolean;
  spectralAnomalies: string[];
  isCorrupted: boolean;
}

export function parseVideoBuffer(buf: Uint8Array): VideoForensics {
  const result: VideoForensics = {
    hasVideoTrack: false,
    hasAudioTrack: false,
    structuralAnomalies: [],
    isCorrupted: false,
  };

  if (!buf || buf.length < 16) {
    result.isCorrupted = true;
    result.structuralAnomalies.push("Buffer truncated or empty");
    return result;
  }

  // Check MP4 / MOV container (ftyp atom or moov atom)
  let offset = 0;
  const len = buf.length;

  while (offset + 8 <= len) {
    const size =
      (buf[offset] << 24) |
      (buf[offset + 1] << 16) |
      (buf[offset + 2] << 8) |
      buf[offset + 3];

    const type = String.fromCharCode(
      buf[offset + 4],
      buf[offset + 5],
      buf[offset + 6],
      buf[offset + 7]
    );

    if (size === 0) break; // runs to end of file
    const atomLength = size === 1 ? 16 : size; // size=1 indicates 64-bit atom size

    if (type === "ftyp" && offset + 12 <= len) {
      result.majorBrand = String.fromCharCode(
        buf[offset + 8],
        buf[offset + 9],
        buf[offset + 10],
        buf[offset + 11]
      );
    }

    if (type === "moov") {
      parseMoovAtom(buf.subarray(offset + 8, Math.min(len, offset + atomLength)), result);
    }

    if (atomLength <= 0 || offset + atomLength > len) {
      break;
    }
    offset += atomLength;
  }

  if (!result.majorBrand && !result.hasVideoTrack) {
    // Check if it might be WebM (EBML: 0x1A 0x45 0xDF 0xA3)
    if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
      result.majorBrand = "WebM / Matroska";
      result.hasVideoTrack = true;
    }
  }

  return result;
}

function parseMoovAtom(moovBuf: Uint8Array, result: VideoForensics) {
  let offset = 0;
  const len = moovBuf.length;

  while (offset + 8 <= len) {
    const size =
      (moovBuf[offset] << 24) |
      (moovBuf[offset + 1] << 16) |
      (moovBuf[offset + 2] << 8) |
      moovBuf[offset + 3];
    const type = String.fromCharCode(
      moovBuf[offset + 4],
      moovBuf[offset + 5],
      moovBuf[offset + 6],
      moovBuf[offset + 7]
    );

    if (size <= 0 || offset + size > len) break;

    if (type === "mvhd" && size >= 24) {
      const version = moovBuf[offset + 8];
      const timeOffset = version === 0 ? offset + 20 : offset + 28;
      if (timeOffset + 8 <= offset + size) {
        const timescale =
          (moovBuf[timeOffset] << 24) |
          (moovBuf[timeOffset + 1] << 16) |
          (moovBuf[timeOffset + 2] << 8) |
          moovBuf[timeOffset + 3];
        const duration =
          (moovBuf[timeOffset + 4] << 24) |
          (moovBuf[timeOffset + 5] << 16) |
          (moovBuf[timeOffset + 6] << 8) |
          moovBuf[timeOffset + 7];
        if (timescale > 0) {
          result.timescale = timescale;
          result.durationSeconds = Math.round((duration / timescale) * 100) / 100;
        }
      }
    }

    if (type === "trak") {
      // Inspect track header or handler
      const trakSlice = moovBuf.subarray(offset + 8, offset + size);
      const isVideo = containsAscii(trakSlice, "vide");
      const isAudio = containsAscii(trakSlice, "soun");
      if (isVideo) result.hasVideoTrack = true;
      if (isAudio) result.hasAudioTrack = true;
    }

    offset += size;
  }
}

function containsAscii(bytes: Uint8Array, pattern: string): boolean {
  const pBytes = Array.from(pattern).map((c) => c.charCodeAt(0));
  const pLen = pBytes.length;
  for (let i = 0; i <= bytes.length - pLen; i++) {
    let match = true;
    for (let j = 0; j < pLen; j++) {
      if (bytes[i + j] !== pBytes[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

export function parseAudioBuffer(buf: Uint8Array): AudioForensics {
  const result: AudioForensics = {
    format: "UNKNOWN",
    spectralAnomalies: [],
    isCorrupted: false,
  };

  if (!buf || buf.length < 12) {
    result.isCorrupted = true;
    return result;
  }

  // 1. WAV Detection (RIFF .... WAVE)
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x41 &&
    buf[10] === 0x56 &&
    buf[11] === 0x45
  ) {
    result.format = "WAV";
    parseWav(buf, result);
    return result;
  }

  // 2. MP3 Detection (ID3 tag or MPEG sync word)
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    result.format = "MP3";
    parseMp3Id3(buf, result);
    return result;
  }

  // Check MPEG sync (0xFF and high 3 bits set in second byte)
  for (let i = 0; i < Math.min(buf.length - 4, 1024); i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      result.format = "MP3";
      parseMpegFrame(buf, i, result);
      break;
    }
  }

  // 3. OGG Detection (OggS)
  if (buf[0] === 0x4f && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) {
    result.format = "OGG";
  }

  return result;
}

function parseWav(buf: Uint8Array, result: AudioForensics) {
  let offset = 12;
  const len = buf.length;

  while (offset + 8 <= len) {
    const chunkId = String.fromCharCode(
      buf[offset],
      buf[offset + 1],
      buf[offset + 2],
      buf[offset + 3]
    );
    const chunkSize =
      buf[offset + 4] |
      (buf[offset + 5] << 8) |
      (buf[offset + 6] << 16) |
      (buf[offset + 7] << 24);

    if (chunkId === "fmt " && chunkSize >= 16) {
      const channels = buf[offset + 10] | (buf[offset + 11] << 8);
      const sampleRate =
        buf[offset + 12] |
        (buf[offset + 13] << 8) |
        (buf[offset + 14] << 16) |
        (buf[offset + 15] << 24);
      const byteRate =
        buf[offset + 16] |
        (buf[offset + 17] << 8) |
        (buf[offset + 18] << 16) |
        (buf[offset + 19] << 24);
      const bitsPerSample = buf[offset + 22] | (buf[offset + 23] << 8);

      result.channels = channels;
      result.sampleRateHz = sampleRate;
      result.bitsPerSample = bitsPerSample;

      if (byteRate > 0) {
        // duration can be computed from data chunk size
      }
    } else if (chunkId === "data" && result.sampleRateHz && result.channels && result.bitsPerSample) {
      const bytesPerSample = result.bitsPerSample / 8;
      const totalSamples = chunkSize / (result.channels * bytesPerSample);
      result.durationSeconds = Math.round((totalSamples / result.sampleRateHz) * 100) / 100;
    }

    offset += 8 + chunkSize + (chunkSize % 2);
  }
}

function parseMp3Id3(buf: Uint8Array, result: AudioForensics) {
  // Parse ID3v2 header
  const size =
    ((buf[6] & 0x7f) << 21) |
    ((buf[7] & 0x7f) << 14) |
    ((buf[8] & 0x7f) << 7) |
    (buf[9] & 0x7f);

  if (size > 0 && size < buf.length) {
    const id3Data = buf.subarray(10, 10 + size);
    // Look for encoder software tags like "LAME", "Lavf", "ElevenLabs", "Sunno"
    if (containsAscii(id3Data, "ElevenLabs")) {
      result.encoderSoftware = "ElevenLabs Synthetic Voice Engine";
    } else if (containsAscii(id3Data, "Suno")) {
      result.encoderSoftware = "Suno AI Audio";
    } else if (containsAscii(id3Data, "Lavf")) {
      result.encoderSoftware = "FFmpeg / Lavf";
    }
  }
}

function parseMpegFrame(buf: Uint8Array, offset: number, result: AudioForensics) {
  const b1 = buf[offset + 1];
  const b2 = buf[offset + 2];

  const mpegVer = (b1 >> 3) & 0x03; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
  const sampleRatesMpeg1 = [44100, 48000, 32000];
  const sampleRatesMpeg2 = [22050, 24000, 16000];

  const srIndex = (b2 >> 2) & 0x03;
  if (mpegVer === 3 && srIndex < 3) {
    result.sampleRateHz = sampleRatesMpeg1[srIndex];
  } else if (mpegVer === 2 && srIndex < 3) {
    result.sampleRateHz = sampleRatesMpeg2[srIndex];
  }
}
