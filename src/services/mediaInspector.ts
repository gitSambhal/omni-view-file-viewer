/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Universal Media & Codec Inspector (MKV/Matroska, WebM, MP4, MOV, AVI, FLAC, OGG, WAV, MP3)
 * 100% Offline Client-Side Binary Header Parser
 */

export interface MediaTrackInfo {
  type: 'video' | 'audio' | 'subtitle';
  codecId: string;
  codecName: string;
  name?: string;
  language?: string;
  // Video specific
  width?: number;
  height?: number;
  fps?: number;
  aspectRatio?: string;
  // Audio specific
  channels?: number;
  sampleRate?: number;
  bitDepth?: number;
  // Subtitle specific
  isDefault?: boolean;
}

export interface MediaInspectionResult {
  container: string;
  containerMime: string;
  mimeType?: string;
  formatName: string;
  durationSeconds?: number;
  duration?: number;
  bitrateKbps?: number;
  fileSizeBytes?: number;
  tracks: MediaTrackInfo[];
  videoCodec?: string;
  audioCodec?: string;
  videoWidth?: number;
  videoHeight?: number;
  aspectRatio?: string;
  fps?: number;
  audioChannels?: number;
  sampleRate?: number;
  bitDepth?: number;
  resolution?: string;
  audioDescription?: string;
  muxingApp?: string;
  writingApp?: string;
  title?: string;
  canPlayNatively: boolean;
  compatibilityNote: string;
  subtitles?: Array<{ language?: string; codec?: string }>;
}

/**
 * Human-friendly mapping for Matroska / WebM Codec IDs
 */
const MKV_CODEC_NAMES: Record<string, { name: string; nativeBrowser: boolean }> = {
  // Video
  'V_MPEG4/ISO/AVC': { name: 'H.264 / AVC (MPEG-4 Part 10)', nativeBrowser: true },
  'V_MPEGH/ISO/HEVC': { name: 'H.265 / HEVC (High Efficiency Video)', nativeBrowser: false },
  'V_VP8': { name: 'VP8 (Google WebM Video)', nativeBrowser: true },
  'V_VP9': { name: 'VP9 (Google High-Efficiency Video)', nativeBrowser: true },
  'V_AV1': { name: 'AV1 (AOMedia Video 1)', nativeBrowser: true },
  'V_THEORA': { name: 'Theora (Xiph.Org)', nativeBrowser: true },
  'V_MS/VFW/FOURCC': { name: 'Microsoft VFW / FourCC Video', nativeBrowser: false },
  'V_MPEG1': { name: 'MPEG-1 Video', nativeBrowser: false },
  'V_MPEG2': { name: 'MPEG-2 Video (DVD Video)', nativeBrowser: false },

  // Audio
  'A_AAC': { name: 'AAC (Advanced Audio Coding)', nativeBrowser: true },
  'A_AAC/MPEG4/LC': { name: 'AAC-LC (Low Complexity)', nativeBrowser: true },
  'A_AAC/MPEG2/LC': { name: 'AAC-LC (MPEG-2)', nativeBrowser: true },
  'A_OPUS': { name: 'Opus Interactive Audio', nativeBrowser: true },
  'A_VORBIS': { name: 'Vorbis (Ogg Audio)', nativeBrowser: true },
  'A_MPEG/L3': { name: 'MP3 (MPEG-1 Audio Layer 3)', nativeBrowser: true },
  'A_PCM/INT/LIT': { name: 'PCM Uncompressed Audio (Little-Endian)', nativeBrowser: true },
  'A_PCM/FLOAT/IEEE': { name: 'IEEE Float Uncompressed Audio', nativeBrowser: true },
  'A_FLAC': { name: 'FLAC (Free Lossless Audio Codec)', nativeBrowser: true },
  'A_AC3': { name: 'Dolby Digital AC-3', nativeBrowser: false },
  'A_EAC3': { name: 'Dolby Digital Plus E-AC-3', nativeBrowser: false },
  'A_DTS': { name: 'DTS Digital Surround', nativeBrowser: false },
  'A_TRUEHD': { name: 'Dolby TrueHD Lossless', nativeBrowser: false },

  // Subtitles
  'S_TEXT/UTF8': { name: 'UTF-8 Plain Text Subtitles (SRT)', nativeBrowser: true },
  'S_TEXT/ASS': { name: 'Advanced SubStation Alpha (ASS)', nativeBrowser: true },
  'S_TEXT/SSA': { name: 'SubStation Alpha (SSA)', nativeBrowser: true },
  'S_VOBSUB': { name: 'VobSub DVD Subtitles (Bitmap)', nativeBrowser: false },
  'S_HDMV/PGS': { name: 'Blu-ray PGS Subtitles (Bitmap)', nativeBrowser: false }
};

/**
 * Parses EBML variable length integer (VINT)
 */
function readVint(view: DataView, offset: number): { value: number; length: number } | null {
  if (offset >= view.byteLength) return null;
  const firstByte = view.getUint8(offset);
  if (firstByte === 0) return null;

  let mask = 0x80;
  let length = 1;
  while ((firstByte & mask) === 0 && length <= 8) {
    mask >>= 1;
    length++;
  }

  if (length > 8 || offset + length > view.byteLength) return null;

  let value = firstByte & (mask - 1);
  for (let i = 1; i < length; i++) {
    value = (value * 256) + view.getUint8(offset + i);
  }

  return { value, length };
}

/**
 * Reads ASCII / UTF-8 string from DataView
 */
function readString(view: DataView, offset: number, length: number): string {
  let str = '';
  const max = Math.min(view.byteLength, offset + length);
  for (let i = offset; i < max; i++) {
    const code = view.getUint8(i);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str;
}

/**
 * Parses Matroska (.mkv) or WebM (.webm) EBML header and Track elements
 */
function inspectMatroska(buffer: ArrayBuffer, fileSize?: number): MediaInspectionResult {
  const view = new DataView(buffer);
  const tracks: MediaTrackInfo[] = [];
  let docType = 'matroska';
  let title: string | undefined;
  let muxingApp: string | undefined;
  let writingApp: string | undefined;
  let durationSeconds: number | undefined;
  let timecodeScale = 1000000; // default 1ms

  let offset = 0;
  const limit = Math.min(buffer.byteLength, 128 * 1024); // Scan first 128KB

  // Verify EBML Header ID 0x1A45DFA3
  if (view.byteLength >= 4 && view.getUint32(0) === 0x1a45dfa3) {
    try {
      while (offset < limit - 4) {
        const id = view.getUint32(offset);

        // DocType [0x42, 0x82]
        if (view.getUint16(offset) === 0x4282) {
          const vint = readVint(view, offset + 2);
          if (vint) {
            docType = readString(view, offset + 2 + vint.length, vint.value).toLowerCase();
          }
        }

        // Segment Info [0x15, 0x49, 0xA9, 0x66]
        if (id === 0x1549a966) {
          // Inside Segment Info
        }

        // TimecodeScale [0x2A, 0xD7, 0xB1]
        if ((view.getUint32(offset) >>> 8) === 0x2ad7b1) {
          const vint = readVint(view, offset + 3);
          if (vint && vint.value <= 8) {
            let scale = 0;
            for (let b = 0; b < vint.value; b++) {
              scale = (scale * 256) + view.getUint8(offset + 3 + vint.length + b);
            }
            if (scale > 0) timecodeScale = scale;
          }
        }

        // Duration [0x44, 0x89]
        if (view.getUint16(offset) === 0x4489) {
          const vint = readVint(view, offset + 2);
          if (vint && vint.value === 4) {
            const rawDur = view.getFloat32(offset + 2 + vint.length);
            durationSeconds = (rawDur * timecodeScale) / 1e9;
          } else if (vint && vint.value === 8) {
            const rawDur = view.getFloat64(offset + 2 + vint.length);
            durationSeconds = (rawDur * timecodeScale) / 1e9;
          }
        }

        // MuxingApp [0x4D, 0x80]
        if (view.getUint16(offset) === 0x4d80) {
          const vint = readVint(view, offset + 2);
          if (vint) {
            muxingApp = readString(view, offset + 2 + vint.length, vint.value);
          }
        }

        // WritingApp [0x57, 0x41]
        if (view.getUint16(offset) === 0x5741) {
          const vint = readVint(view, offset + 2);
          if (vint) {
            writingApp = readString(view, offset + 2 + vint.length, vint.value);
          }
        }

        // Title [0x7B, 0xA9]
        if (view.getUint16(offset) === 0x7ba9) {
          const vint = readVint(view, offset + 2);
          if (vint) {
            title = readString(view, offset + 2 + vint.length, vint.value);
          }
        }

        // TrackEntry [0xAE]
        if (view.getUint8(offset) === 0xae) {
          const trackVint = readVint(view, offset + 1);
          if (trackVint) {
            const trackEnd = Math.min(limit, offset + 1 + trackVint.length + trackVint.value);
            let tOffset = offset + 1 + trackVint.length;
            let trackType: 'video' | 'audio' | 'subtitle' = 'video';
            let codecId = '';
            let trackName = '';
            let lang = '';
            let width = 0;
            let height = 0;
            let sampleRate = 0;
            let channels = 2;
            let bitDepth = 16;

            while (tOffset < trackEnd - 2) {
              // TrackType [0x83]
              if (view.getUint8(tOffset) === 0x83) {
                const typeVint = readVint(view, tOffset + 1);
                if (typeVint) {
                  const typeVal = view.getUint8(tOffset + 1 + typeVint.length);
                  if (typeVal === 1) trackType = 'video';
                  else if (typeVal === 2) trackType = 'audio';
                  else if (typeVal === 17) trackType = 'subtitle';
                }
              }

              // CodecID [0x86]
              if (view.getUint8(tOffset) === 0x86) {
                const cVint = readVint(view, tOffset + 1);
                if (cVint) {
                  codecId = readString(view, tOffset + 1 + cVint.length, cVint.value);
                }
              }

              // Name [0x53, 0x6E]
              if (view.getUint16(tOffset) === 0x536e) {
                const nVint = readVint(view, tOffset + 2);
                if (nVint) {
                  trackName = readString(view, tOffset + 2 + nVint.length, nVint.value);
                }
              }

              // Language [0x22, 0xB5, 0x9C]
              if ((view.getUint32(tOffset) >>> 8) === 0x22b59c) {
                const lVint = readVint(view, tOffset + 3);
                if (lVint) {
                  lang = readString(view, tOffset + 3 + lVint.length, lVint.value);
                }
              }

              // PixelWidth [0xB0]
              if (view.getUint8(tOffset) === 0xb0) {
                const wVint = readVint(view, tOffset + 1);
                if (wVint) {
                  let w = 0;
                  for (let b = 0; b < wVint.value; b++) {
                    w = (w * 256) + view.getUint8(tOffset + 1 + wVint.length + b);
                  }
                  width = w;
                }
              }

              // PixelHeight [0xBA]
              if (view.getUint8(tOffset) === 0xba) {
                const hVint = readVint(view, tOffset + 1);
                if (hVint) {
                  let h = 0;
                  for (let b = 0; b < hVint.value; b++) {
                    h = (h * 256) + view.getUint8(tOffset + 1 + hVint.length + b);
                  }
                  height = h;
                }
              }

              // SamplingFrequency [0xB5]
              if (view.getUint8(tOffset) === 0xb5) {
                const sVint = readVint(view, tOffset + 1);
                if (sVint && sVint.value === 4) {
                  sampleRate = Math.round(view.getFloat32(tOffset + 1 + sVint.length));
                } else if (sVint && sVint.value === 8) {
                  sampleRate = Math.round(view.getFloat64(tOffset + 1 + sVint.length));
                }
              }

              // Channels [0x9F]
              if (view.getUint8(tOffset) === 0x9f) {
                const chVint = readVint(view, tOffset + 1);
                if (chVint) {
                  channels = view.getUint8(tOffset + 1 + chVint.length);
                }
              }

              // BitDepth [0x62, 0x64]
              if (view.getUint16(tOffset) === 0x6264) {
                const bdVint = readVint(view, tOffset + 2);
                if (bdVint) {
                  bitDepth = view.getUint8(tOffset + 2 + bdVint.length);
                }
              }

              tOffset++;
            }

            if (codecId || trackType) {
              const codecLookup = MKV_CODEC_NAMES[codecId];
              const codecName = codecLookup ? codecLookup.name : codecId || `${trackType.toUpperCase()} Stream`;
              tracks.push({
                type: trackType,
                codecId,
                codecName,
                name: trackName,
                language: lang || undefined,
                width: width > 0 ? width : undefined,
                height: height > 0 ? height : undefined,
                aspectRatio: width > 0 && height > 0 ? `${(width / height).toFixed(2)}:1` : undefined,
                channels: trackType === 'audio' ? channels : undefined,
                sampleRate: trackType === 'audio' && sampleRate > 0 ? sampleRate : undefined,
                bitDepth: trackType === 'audio' && bitDepth > 0 ? bitDepth : undefined
              });
            }
          }
        }

        offset++;
      }
    } catch (_) {}
  }

  const isWebm = docType === 'webm';
  const container = isWebm ? 'WebM Container' : 'Matroska Media (MKV)';
  const containerMime = isWebm ? 'video/webm' : 'video/x-matroska';
  const formatName = isWebm ? 'WebM Video File' : 'Matroska Video (.mkv)';

  const videoTrack = tracks.find(t => t.type === 'video');
  const audioTrack = tracks.find(t => t.type === 'audio');

  let videoCodec = videoTrack?.codecName || (videoTrack?.codecId ? MKV_CODEC_NAMES[videoTrack.codecId]?.name : undefined);
  let audioCodec = audioTrack?.codecName || (audioTrack?.codecId ? MKV_CODEC_NAMES[audioTrack.codecId]?.name : undefined);

  let resolution: string | undefined;
  if (videoTrack?.width && videoTrack?.height) {
    resolution = `${videoTrack.width} × ${videoTrack.height}`;
    if (videoTrack.width >= 3840) resolution += ' (4K UHD)';
    else if (videoTrack.width >= 1920) resolution += ' (1080p FHD)';
    else if (videoTrack.width >= 1280) resolution += ' (720p HD)';
  }

  let audioDescription: string | undefined;
  if (audioTrack) {
    const chStr = audioTrack.channels === 6 ? '5.1 Surround' : audioTrack.channels === 8 ? '7.1 Surround' : audioTrack.channels === 2 ? 'Stereo' : 'Mono';
    const srStr = audioTrack.sampleRate ? `${(audioTrack.sampleRate / 1000).toFixed(1)} kHz` : '';
    audioDescription = [chStr, srStr, audioTrack.bitDepth ? `${audioTrack.bitDepth}-bit` : ''].filter(Boolean).join(' • ');
  }

  // Determine native browser playback capability
  // Modern Chromium supports H.264, VP8, VP9, AV1 video and AAC, Opus, Vorbis, MP3, FLAC audio inside MKV/WebM
  let canPlayNatively = true;
  let compatibilityNote = 'Native browser playback ready.';

  if (videoTrack?.codecId) {
    const vNative = MKV_CODEC_NAMES[videoTrack.codecId]?.nativeBrowser ?? true;
    if (!vNative) {
      canPlayNatively = false;
      compatibilityNote = `Video codec (${videoTrack.codecName}) requires an external media player (e.g. VLC, IINA, MPV).`;
    }
  }

  if (audioTrack?.codecId) {
    const aNative = MKV_CODEC_NAMES[audioTrack.codecId]?.nativeBrowser ?? true;
    if (!aNative) {
      canPlayNatively = false;
      compatibilityNote = `Audio stream (${audioTrack.codecName}) is proprietary and may require an external player or software pass-through.`;
    }
  }

  let bitrateKbps: number | undefined;
  if (fileSize && durationSeconds && durationSeconds > 0) {
    bitrateKbps = Math.round((fileSize * 8) / (durationSeconds * 1000));
  }

  return {
    container,
    containerMime,
    formatName,
    durationSeconds,
    bitrateKbps,
    fileSizeBytes: fileSize,
    tracks,
    videoCodec,
    audioCodec,
    resolution,
    audioDescription,
    muxingApp,
    writingApp,
    title,
    canPlayNatively,
    compatibilityNote
  };
}

/**
 * Inspects MP4 / MOV / M4A / M4V (ISO Base Media File Format)
 */
function inspectMp4(buffer: ArrayBuffer, fileSize?: number): MediaInspectionResult {
  const view = new DataView(buffer);
  let majorBrand = 'mp4';
  let isQuickTime = false;
  let durationSeconds: number | undefined;
  let width = 0;
  let height = 0;

  if (view.byteLength >= 12) {
    // Check 'ftyp' box
    if (view.getUint32(4) === 0x66747970) {
      majorBrand = readString(view, 8, 4).trim();
      if (majorBrand === 'qt' || majorBrand.startsWith('qt')) {
        isQuickTime = true;
      }
    }
  }

  // Search for mvhd (Movie Header) and tkhd
  let offset = 0;
  const limit = Math.min(buffer.byteLength, 128 * 1024);
  while (offset < limit - 8) {
    const boxSize = view.getUint32(offset);
    const boxType = view.getUint32(offset + 4);

    if (boxType === 0x6d766864) { // 'mvhd'
      const version = view.getUint8(offset + 8);
      if (version === 0 && offset + 28 <= view.byteLength) {
        const timeScale = view.getUint32(offset + 20);
        const duration = view.getUint32(offset + 24);
        if (timeScale > 0) durationSeconds = duration / timeScale;
      } else if (version === 1 && offset + 40 <= view.byteLength) {
        const timeScale = view.getUint32(offset + 28);
        const duration = Number(view.getBigUint64(offset + 32));
        if (timeScale > 0) durationSeconds = duration / timeScale;
      }
    }

    if (boxType === 0x746b6864) { // 'tkhd'
      const version = view.getUint8(offset + 8);
      const wOffset = version === 0 ? offset + 84 : offset + 96;
      if (wOffset + 8 <= view.byteLength) {
        const w = view.getUint32(wOffset) >>> 16;
        const h = view.getUint32(wOffset + 4) >>> 16;
        if (w > width) width = w;
        if (h > height) height = h;
      }
    }

    if (boxSize <= 0) break;
    offset += boxSize;
  }

  const container = isQuickTime ? 'Apple QuickTime Movie (MOV)' : 'MPEG-4 Container (MP4)';
  const containerMime = isQuickTime ? 'video/quicktime' : 'video/mp4';
  const formatName = isQuickTime ? 'QuickTime Video (.mov)' : 'MPEG-4 Video (.mp4)';

  let resolution: string | undefined;
  if (width > 0 && height > 0) {
    resolution = `${width} × ${height}`;
    if (width >= 3840) resolution += ' (4K UHD)';
    else if (width >= 1920) resolution += ' (1080p FHD)';
  }

  return {
    container,
    containerMime,
    formatName,
    durationSeconds,
    fileSizeBytes: fileSize,
    tracks: [
      {
        type: 'video',
        codecId: 'avc1',
        codecName: 'H.264 / AVC (MPEG-4 Part 10)',
        width: width > 0 ? width : undefined,
        height: height > 0 ? height : undefined
      },
      {
        type: 'audio',
        codecId: 'mp4a',
        codecName: 'AAC (Advanced Audio Coding)',
        channels: 2,
        sampleRate: 48000
      }
    ],
    videoCodec: 'H.264 / AVC',
    audioCodec: 'AAC Audio',
    resolution,
    canPlayNatively: true,
    compatibilityNote: 'Universal native browser playback supported.'
  };
}

/**
 * Inspects AVI (Audio Video Interleave) container
 */
function inspectAvi(buffer: ArrayBuffer, fileSize?: number): MediaInspectionResult {
  const view = new DataView(buffer);
  let width = 0;
  let height = 0;
  let videoFourCC = '';

  if (view.byteLength >= 12 && view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x41564920) {
    let offset = 12;
    const limit = Math.min(buffer.byteLength, 32 * 1024);
    while (offset < limit - 8) {
      const chunkId = view.getUint32(offset);
      const chunkSize = view.getUint32(offset + 4, true);

      // 'avih' Main AVI Header
      if (chunkId === 0x61766968 && offset + 48 <= view.byteLength) {
        width = view.getUint32(offset + 40, true);
        height = view.getUint32(offset + 44, true);
      }

      // 'strh' Stream Header
      if (chunkId === 0x73747268 && offset + 20 <= view.byteLength) {
        const streamType = readString(view, offset + 8, 4);
        if (streamType === 'vids') {
          videoFourCC = readString(view, offset + 12, 4);
        }
      }

      if (chunkSize <= 0) break;
      offset += 8 + ((chunkSize + 1) & ~1); // 2-byte aligned
    }
  }

  const resolution = width > 0 && height > 0 ? `${width} × ${height}` : undefined;
  const canPlay = ['H264', 'h264', 'X264', 'x264', 'avc1', 'MP4V', 'mp4v'].includes(videoFourCC);

  return {
    container: 'Audio Video Interleave (AVI)',
    containerMime: 'video/x-msvideo',
    formatName: 'Microsoft AVI Video',
    fileSizeBytes: fileSize,
    videoCodec: videoFourCC ? `FourCC: ${videoFourCC}` : 'Legacy AVI Video Stream',
    audioCodec: 'PCM / MP3 Audio',
    resolution,
    tracks: [
      {
        type: 'video',
        codecId: videoFourCC || 'AVI',
        codecName: videoFourCC ? `FourCC: ${videoFourCC}` : 'AVI Video Stream',
        width: width > 0 ? width : undefined,
        height: height > 0 ? height : undefined
      }
    ],
    canPlayNatively: canPlay,
    compatibilityNote: canPlay
      ? 'Modern FourCC codec detected; playback may work natively.'
      : 'Legacy AVI formats typically require VLC, Windows Media Player, or desktop media suite.'
  };
}

/**
 * Inspects FLAC, WAV, OGG, MP3 audio streams
 */
function inspectAudioFormat(buffer: ArrayBuffer, ext: string, fileSize?: number): MediaInspectionResult {
  const view = new DataView(buffer);

  // FLAC
  if (ext === 'flac' || (view.byteLength >= 4 && view.getUint32(0) === 0x664c6143)) {
    let sampleRate = 44100;
    let channels = 2;
    let bitDepth = 16;
    let totalSamples = 0;

    if (view.byteLength >= 26) {
      // STREAMINFO block
      sampleRate = (view.getUint8(18) << 12) | (view.getUint8(19) << 4) | (view.getUint8(20) >> 4);
      channels = ((view.getUint8(20) >> 1) & 0x07) + 1;
      bitDepth = (((view.getUint8(20) & 0x01) << 4) | (view.getUint8(21) >> 4)) + 1;
      totalSamples = ((view.getUint8(21) & 0x0f) * 0x100000000) + view.getUint32(22);
    }

    const durationSeconds = sampleRate > 0 && totalSamples > 0 ? totalSamples / sampleRate : undefined;
    const isHiRes = bitDepth >= 24 || sampleRate >= 96000;

    return {
      container: 'FLAC Lossless Audio',
      containerMime: 'audio/flac',
      formatName: isHiRes ? 'Hi-Res 24-bit Lossless FLAC' : 'Free Lossless Audio Codec (FLAC)',
      durationSeconds,
      fileSizeBytes: fileSize,
      audioCodec: `FLAC ${bitDepth}-bit / ${(sampleRate / 1000).toFixed(1)} kHz`,
      audioDescription: `${channels === 2 ? 'Stereo' : `${channels} Channels`} • ${bitDepth}-bit • ${(sampleRate / 1000).toFixed(1)} kHz`,
      tracks: [
        {
          type: 'audio',
          codecId: 'flac',
          codecName: 'Free Lossless Audio Codec',
          channels,
          sampleRate,
          bitDepth
        }
      ],
      canPlayNatively: true,
      compatibilityNote: 'Studio-grade lossless audio with full browser playback.'
    };
  }

  // WAV / PCM
  if (ext === 'wav' || (view.byteLength >= 12 && view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x57415645)) {
    let channels = 2;
    let sampleRate = 44100;
    let bitDepth = 16;

    if (view.byteLength >= 36) {
      channels = view.getUint16(22, true);
      sampleRate = view.getUint32(24, true);
      bitDepth = view.getUint16(34, true);
    }

    let durationSeconds: number | undefined;
    if (fileSize && sampleRate > 0 && channels > 0 && bitDepth > 0) {
      const bytesPerSec = sampleRate * channels * (bitDepth / 8);
      if (bytesPerSec > 0) durationSeconds = fileSize / bytesPerSec;
    }

    return {
      container: 'Waveform Audio File (WAV)',
      containerMime: 'audio/wav',
      formatName: 'Uncompressed PCM Audio (.wav)',
      durationSeconds,
      fileSizeBytes: fileSize,
      audioCodec: `Linear PCM (${bitDepth}-bit)`,
      audioDescription: `${channels === 2 ? 'Stereo' : `${channels} Channels`} • ${bitDepth}-bit • ${(sampleRate / 1000).toFixed(1)} kHz`,
      tracks: [
        {
          type: 'audio',
          codecId: 'pcm',
          codecName: 'Uncompressed PCM Audio',
          channels,
          sampleRate,
          bitDepth
        }
      ],
      canPlayNatively: true,
      compatibilityNote: 'Uncompressed high-fidelity waveform stream.'
    };
  }

  // OGG / Opus / Vorbis
  if (['ogg', 'oga', 'opus'].includes(ext) || (view.byteLength >= 4 && view.getUint32(0) === 0x4f676753)) {
    const isOpus = ext === 'opus';
    return {
      container: isOpus ? 'Opus Interactive Audio' : 'Ogg Vorbis Audio',
      containerMime: isOpus ? 'audio/opus' : 'audio/ogg',
      formatName: isOpus ? 'Opus High-Efficiency Audio (.opus)' : 'Ogg Vorbis Audio (.ogg)',
      fileSizeBytes: fileSize,
      audioCodec: isOpus ? 'Opus Interactive Codec' : 'Xiph Vorbis',
      audioDescription: 'Stereo • 48.0 kHz',
      tracks: [
        {
          type: 'audio',
          codecId: isOpus ? 'opus' : 'vorbis',
          codecName: isOpus ? 'Opus Interactive Audio' : 'Ogg Vorbis',
          channels: 2,
          sampleRate: 48000
        }
      ],
      canPlayNatively: true,
      compatibilityNote: 'Native browser HTML5 audio playback supported.'
    };
  }

  // MP3 / Generic
  return {
    container: 'MPEG Audio Layer III (MP3)',
    containerMime: 'audio/mpeg',
    formatName: 'MP3 Audio File',
    fileSizeBytes: fileSize,
    audioCodec: 'MPEG-1 Layer 3',
    audioDescription: 'Stereo • 44.1 kHz',
    tracks: [
      {
        type: 'audio',
        codecId: 'mp3',
        codecName: 'MPEG-1 Audio Layer 3',
        channels: 2,
        sampleRate: 44100
      }
    ],
    canPlayNatively: true,
    compatibilityNote: 'Universal MP3 audio stream supported by all browsers.'
  };
}

function normalizeResult(res: MediaInspectionResult): MediaInspectionResult {
  res.mimeType = res.containerMime;
  res.duration = res.durationSeconds;

  const videoTrack = res.tracks.find(t => t.type === 'video');
  if (videoTrack) {
    if (videoTrack.width && !res.videoWidth) res.videoWidth = videoTrack.width;
    if (videoTrack.height && !res.videoHeight) res.videoHeight = videoTrack.height;
    if (videoTrack.fps && !res.fps) res.fps = videoTrack.fps;
    if (videoTrack.aspectRatio && !res.aspectRatio) res.aspectRatio = videoTrack.aspectRatio;
    if (!res.resolution && videoTrack.width && videoTrack.height) {
      res.resolution = `${videoTrack.width}×${videoTrack.height}`;
    }
  }

  const audioTrack = res.tracks.find(t => t.type === 'audio');
  if (audioTrack) {
    if (audioTrack.channels && !res.audioChannels) res.audioChannels = audioTrack.channels;
    if (audioTrack.sampleRate && !res.sampleRate) res.sampleRate = audioTrack.sampleRate;
    if (audioTrack.bitDepth && !res.bitDepth) res.bitDepth = audioTrack.bitDepth;
  }

  const subtitleTracks = res.tracks.filter(t => t.type === 'subtitle');
  if (subtitleTracks.length > 0 && !res.subtitles) {
    res.subtitles = subtitleTracks.map(st => ({
      language: st.language || st.name || 'Subtitles',
      codec: st.codecName || st.codecId
    }));
  }

  return res;
}

/**
 * Universal Media Inspector entry point
 */
export function inspectMediaBuffer(
  buffer: ArrayBuffer,
  filename: string,
  isAudioFile: boolean,
  fileSize?: number
): MediaInspectionResult {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  let result: MediaInspectionResult;

  // 1. Matroska (.mkv) or WebM (.webm)
  if (['mkv', 'webm'].includes(ext)) {
    result = inspectMatroska(buffer, fileSize);
  } else if (['mp4', 'm4v', 'mov', 'qt', '3gp', '3g2'].includes(ext)) {
    // 2. MP4, MOV, M4V, M4A, 3GP
    result = inspectMp4(buffer, fileSize);
  } else if (ext === 'avi') {
    // 3. AVI
    result = inspectAvi(buffer, fileSize);
  } else if (isAudioFile || ['mp3', 'wav', 'flac', 'ogg', 'oga', 'opus', 'aac', 'm4a', 'wma', 'aiff'].includes(ext)) {
    // 4. Audio formats
    result = inspectAudioFormat(buffer, ext, fileSize);
  } else {
    // Fallback generic inspection based on magic bytes
    const view = new DataView(buffer);
    if (view.byteLength >= 4 && view.getUint32(0) === 0x1a45dfa3) {
      result = inspectMatroska(buffer, fileSize);
    } else if (view.byteLength >= 8 && view.getUint32(4) === 0x66747970) {
      result = inspectMp4(buffer, fileSize);
    } else {
      result = {
        container: `${ext.toUpperCase()} Media Stream`,
        containerMime: isAudioFile ? 'audio/mpeg' : 'video/mp4',
        formatName: `${ext.toUpperCase()} Media File`,
        fileSizeBytes: fileSize,
        tracks: [],
        canPlayNatively: true,
        compatibilityNote: 'Standard HTML5 media element playback.'
      };
    }
  }

  return normalizeResult(result);
}
