/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Video & Audio Cinema Player Studio
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  Activity,
  Music,
  Video as VideoIcon,
  Maximize2,
  Minimize2,
  Rewind,
  FastForward,
  AlertCircle,
  Download,
  Sliders,
  Settings,
  PictureInPicture2,
  Tv,
  Scan,
  Sparkles,
  Repeat,
  Info,
  Layers,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { inspectMediaBuffer, MediaInspectionResult } from '../../services/mediaInspector';

interface MediaViewerProps {
  objectUrl?: string;
  dataUrl?: string;
  arrayBuffer?: ArrayBuffer;
  fileRaw?: File;
  filename: string;
  isAudio: boolean;
}

type FitMode = 'contain' | 'cover' | 'fill';

export const MediaViewer: React.FC<MediaViewerProps> = ({
  objectUrl,
  dataUrl,
  arrayBuffer,
  fileRaw,
  filename,
  isAudio
}) => {
  const [mediaSrc, setMediaSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [useNativeControls, setUseNativeControls] = useState<boolean>(false);

  // Media Inspection and MKV Compatibility State
  const [mediaInfo, setMediaInfo] = useState<MediaInspectionResult | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [mkvProfile, setMkvProfile] = useState<'matroska' | 'webm' | 'direct'>('matroska');
  const [copiedInfo, setCopiedInfo] = useState<boolean>(false);

  // Fullscreen and Theater states
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isInWindowFullscreen, setIsInWindowFullscreen] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<FitMode>('contain'); // contain = fit, cover = fill without black bars, fill = stretch
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showTimeRemaining, setShowTimeRemaining] = useState<boolean>(false);

  // Scrubber Hover Tooltip state
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  // Auto-hide controls state
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [clickSplash, setClickSplash] = useState<'play' | 'pause' | null>(null);

  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const splashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect MIME type based on extension & MKV profile
  const getMimeType = (file: string, isAudioFile: boolean, mkvProf: 'matroska' | 'webm' | 'direct' = 'matroska'): string => {
    const ext = file.split('.').pop()?.toLowerCase() || '';
    if (isAudioFile) {
      if (['mp3', 'mp2', 'mpa'].includes(ext)) return 'audio/mpeg';
      if (ext === 'wav') return 'audio/wav';
      if (['ogg', 'oga'].includes(ext)) return 'audio/ogg';
      if (ext === 'opus') return 'audio/opus';
      if (ext === 'aac') return 'audio/aac';
      if (ext === 'flac') return 'audio/flac';
      if (['m4a', 'm4b', 'm4p', 'alac'].includes(ext)) return 'audio/mp4';
      if (ext === 'weba') return 'audio/webm';
      if (['aiff', 'aif', 'aifc'].includes(ext)) return 'audio/aiff';
      if (ext === 'wma') return 'audio/x-ms-wma';
      if (['ac3', 'eac3'].includes(ext)) return 'audio/ac3';
      if (ext === 'amr') return 'audio/amr';
      if (['mid', 'midi'].includes(ext)) return 'audio/midi';
      if (ext === 'ape') return 'audio/x-ape';
      if (ext === 'mka') return 'audio/x-matroska';
      return 'audio/mpeg';
    } else {
      if (ext === 'mkv') {
        if (mkvProf === 'webm') return 'video/webm';
        if (mkvProf === 'direct') return '';
        return 'video/x-matroska';
      }
      if (ext === 'webm') return 'video/webm';
      if (['mp4', 'm4v', 'mp4v'].includes(ext)) return 'video/mp4';
      if (['mov', 'qt'].includes(ext)) return 'video/quicktime';
      if (ext === 'ogv') return 'video/ogg';
      if (ext === 'avi') return 'video/x-msvideo';
      if (['wmv', 'asf'].includes(ext)) return 'video/x-ms-wmv';
      if (['flv', 'f4v'].includes(ext)) return 'video/x-flv';
      if (['3gp', '3g2'].includes(ext)) return 'video/3gpp';
      if (['ts', 'mts', 'm2ts'].includes(ext)) return 'video/mp2t';
      if (['vob', 'm2v', 'mpg', 'mpeg'].includes(ext)) return 'video/mpeg';
      if (['divx', 'xvid'].includes(ext)) return 'video/divx';
      return 'video/mp4';
    }
  };

  // Inspect media stream and container headers in background
  useEffect(() => {
    let isMounted = true;
    async function inspect() {
      try {
        let buf: ArrayBuffer | null = null;
        const size = fileRaw?.size;

        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          buf = arrayBuffer;
        } else if (fileRaw) {
          // Read first 128KB for header inspection without loading multi-GB video into memory
          const slice = fileRaw.slice(0, 128 * 1024);
          buf = await slice.arrayBuffer();
        }

        if (buf && isMounted) {
          const res = inspectMediaBuffer(buf, filename, isAudio, size);
          setMediaInfo(res);
        }
      } catch (err) {
        console.warn('Media header inspector error:', err);
      }
    }
    inspect();
    return () => { isMounted = false; };
  }, [arrayBuffer, fileRaw, filename, isAudio]);

  // Generate source URL with proper MIME typing
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');

    const mime = getMimeType(filename, isAudio, mkvProfile);
    let activeUrl: string | null = null;

    if (fileRaw) {
      // Create a typed Blob slice so browsers recognize MKV/WebM/MP4/FLAC container
      const blob = mime ? new Blob([fileRaw], { type: mime }) : fileRaw;
      activeUrl = URL.createObjectURL(blob);
      setMediaSrc(activeUrl);
    } else if (objectUrl) {
      setMediaSrc(objectUrl);
    } else if (dataUrl) {
      setMediaSrc(dataUrl);
    } else if (arrayBuffer && arrayBuffer.byteLength > 0) {
      const blob = new Blob([arrayBuffer], { type: mime || 'video/mp4' });
      activeUrl = URL.createObjectURL(blob);
      setMediaSrc(activeUrl);
    }

    return () => {
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [objectUrl, fileRaw, dataUrl, arrayBuffer, isAudio, filename, mkvProfile]);

  // Fullscreen event listener sync
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsNativeFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsInWindowFullscreen(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleSkip(-5);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleSkip(5);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume(Math.min(1, volume + 0.1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume(Math.max(0, volume - 0.1));
      } else if (e.key === 'Escape') {
        if (isInWindowFullscreen) {
          setIsInWindowFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isInWindowFullscreen]);

  // Reset auto-hide timer on mouse move
  const handleUserActivity = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      handleUserActivity();
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying, handleUserActivity]);

  // Audio spectrum visualizer for audio files
  useEffect(() => {
    if (!isAudio || !isPlaying || !canvasRef.current) return;

    let animationId: number;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 48;
      const barWidth = canvas.width / bars;
      phase += 0.08;

      for (let i = 0; i < bars; i++) {
        const sine = Math.sin(phase + i * 0.25);
        const height = Math.max(8, (Math.abs(sine) * 0.75 + Math.random() * 0.25) * (canvas.height * 0.7));
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#c084fc');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, height, 4);
        ctx.fill();
      }

      animationId = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isAudio, isPlaying]);

  const togglePlay = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
      triggerClickSplash('pause');
    } else {
      const playPromise = mediaRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            triggerClickSplash('play');
          })
          .catch(err => {
            console.warn('Playback error:', err);
            setIsPlaying(false);
            setHasError(true);
            setErrorMessage('Browser policy prevented automatic playback. Click play again to continue.');
          });
      }
    }
  };

  const triggerClickSplash = (type: 'play' | 'pause') => {
    setClickSplash(type);
    if (splashTimeoutRef.current) clearTimeout(splashTimeoutRef.current);
    splashTimeoutRef.current = setTimeout(() => {
      setClickSplash(null);
    }, 600);
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      if (mediaRef.current.duration && !isNaN(mediaRef.current.duration)) {
        setDuration(mediaRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current && mediaRef.current.duration) {
      setDuration(mediaRef.current.duration);
    }
  };

  const handleCopySpecs = () => {
    if (!mediaInfo) return;
    const summary = [
      `File: ${filename}`,
      `Format: ${mediaInfo.formatName} (${mediaInfo.container})`,
      `MIME: ${mediaInfo.mimeType}`,
      mediaInfo.videoCodec ? `Video Codec: ${mediaInfo.videoCodec}` : null,
      mediaInfo.videoWidth ? `Resolution: ${mediaInfo.videoWidth}x${mediaInfo.videoHeight}` : null,
      mediaInfo.audioCodec ? `Audio Codec: ${mediaInfo.audioCodec}` : null,
      mediaInfo.audioChannels ? `Audio Channels: ${mediaInfo.audioChannels}` : null,
      mediaInfo.sampleRate ? `Sample Rate: ${mediaInfo.sampleRate} Hz` : null,
      mediaInfo.bitDepth ? `Bit Depth: ${mediaInfo.bitDepth}-bit` : null,
      mediaInfo.duration ? `Duration: ${Math.round(mediaInfo.duration)}s` : null,
      mediaInfo.bitrateKbps ? `Bitrate: ~${mediaInfo.bitrateKbps} kbps` : null,
      mediaInfo.muxingApp ? `Muxing App: ${mediaInfo.muxingApp}` : null,
      mediaInfo.writingApp ? `Writing App: ${mediaInfo.writingApp}` : null,
      `Native Playback: ${mediaInfo.canPlayNatively ? 'Supported' : 'Requires external decoder / player'}`
    ].filter(Boolean).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedInfo(true);
      setTimeout(() => setCopiedInfo(false), 2000);
    }
  };

  const handleMediaError = (e: any) => {
    console.error('Media element playback error:', e);
    if (!mediaSrc) return;
    setHasError(true);

    const detected = [mediaInfo?.videoCodec, mediaInfo?.audioCodec].filter(Boolean).join(' / ');
    if (detected) {
      setErrorMessage(`The container is valid, but the browser could not decode (${detected}). Proprietary formats or codecs (e.g. HEVC/H.265 or AC-3 audio) may require specialized system codecs or external players like VLC/IINA.`);
    } else {
      setErrorMessage('Unsupported video/audio codec or media container for native browser decoding.');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  const handleSkip = (seconds: number) => {
    if (mediaRef.current) {
      const newTime = Math.min(Math.max(0, mediaRef.current.currentTime + seconds), duration);
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      triggerClickSplash(seconds > 0 ? 'play' : 'pause');
    }
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (mediaRef.current) {
      mediaRef.current.volume = v;
      mediaRef.current.muted = v === 0;
      setIsMuted(v === 0);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mediaRef.current) {
      mediaRef.current.muted = nextMuted;
      if (!nextMuted && volume === 0) {
        changeVolume(0.5);
      }
    }
  };

  const toggleFullscreen = () => {
    // If already in native fullscreen, exit it
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsNativeFullscreen(false);
      setIsInWindowFullscreen(false);
      return;
    }

    // Try native requestFullscreen on container
    if (containerRef.current) {
      const el = containerRef.current as any;
      const requestFs =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

      if (requestFs) {
        requestFs
          .call(el)
          .then(() => {
            setIsNativeFullscreen(true);
          })
          .catch(() => {
            // If native fullscreen is blocked by iframe permissions, fall back to In-Window Fullscreen seamlessly!
            setIsInWindowFullscreen(prev => !prev);
          });
      } else {
        setIsInWindowFullscreen(prev => !prev);
      }
    } else {
      setIsInWindowFullscreen(prev => !prev);
    }
  };

  const togglePictureInPicture = async () => {
    if (mediaRef.current instanceof HTMLVideoElement) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
          await mediaRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('PiP error:', err);
      }
    }
  };

  const cycleFitMode = () => {
    if (fitMode === 'contain') {
      setFitMode('cover'); // Eliminate black bars completely by zooming/cropping
    } else if (fitMode === 'cover') {
      setFitMode('fill'); // Stretch to frame
    } else {
      setFitMode('contain'); // Fit natural ratio
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFullscreenActive = isNativeFullscreen || isInWindowFullscreen;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className={`relative flex flex-col w-full h-full bg-black select-none overflow-hidden transition-all duration-200 ${
        isInWindowFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen' : 'flex-1 min-h-0 min-w-0'
      } ${!controlsVisible && isPlaying && !isAudio ? 'cursor-none' : 'cursor-auto'}`}
    >
      {/* ERROR FALLBACK */}
      {hasError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="max-w-lg w-full p-6 bg-slate-900/90 border border-amber-500/40 rounded-3xl shadow-2xl text-center space-y-5 backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 text-lg">Media Decoding Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">{errorMessage}</p>
            </div>

            {/* Detected Codec Chips */}
            {mediaInfo && (
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                  {mediaInfo.formatName}
                </span>
                {mediaInfo.videoCodec && (
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                    Video: {mediaInfo.videoCodec}
                  </span>
                )}
                {mediaInfo.audioCodec && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                    Audio: {mediaInfo.audioCodec}
                  </span>
                )}
                {mediaInfo.videoWidth && (
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">
                    {mediaInfo.videoWidth}×{mediaInfo.videoHeight}
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              {filename.toLowerCase().endsWith('.mkv') && (
                <button
                  onClick={() => {
                    setHasError(false);
                    setMkvProfile(prev => prev === 'matroska' ? 'webm' : prev === 'webm' ? 'direct' : 'matroska');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
                  title="Cycle between Matroska, WebM, and Direct stream profiles"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try {mkvProfile === 'matroska' ? 'WebM Container' : mkvProfile === 'webm' ? 'Direct Stream' : 'Matroska'} Profile</span>
                </button>
              )}

              <button
                onClick={() => setIsInspectorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-purple-400" />
                <span>Stream & Codec Specs</span>
              </button>

              <button
                onClick={() => {
                  setHasError(false);
                  setUseNativeControls(true);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Try Browser Controls
              </button>

              {mediaSrc && (
                <a
                  href={mediaSrc}
                  download={filename}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download for VLC / MPV</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ) : isAudio ? (
        /* AUDIO PLAYER STUDIO */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
          <audio
            ref={el => { mediaRef.current = el; }}
            src={mediaSrc}
            preload="auto"
            loop={isLooping}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={handleMediaError}
          />

          <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-8 flex flex-col items-center space-y-6">
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between text-xs font-mono text-purple-400">
              <div className="flex items-center gap-2 font-semibold">
                <Music className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Audio Studio Pro</span>
                {mediaInfo && (
                  <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[11px] text-purple-300">
                    {mediaInfo.formatName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="View Audio Stream & Header Specs"
                >
                  <Info className="w-3 h-3 text-purple-400" />
                  <span className="text-[11px]">Specs</span>
                </button>
                <span className="truncate max-w-[160px] text-slate-400">{filename}</span>
              </div>
            </div>

            {/* Vinyl Record / Album Centerpiece */}
            <div className="relative flex items-center justify-center w-48 h-48 my-2">
              <div
                className={`w-44 h-44 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-4 border-slate-700 shadow-2xl flex items-center justify-center transition-transform duration-700 ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                }`}
              >
                {/* Vinyl Grooves */}
                <div className="w-36 h-36 rounded-full border border-slate-700/60 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-slate-700/40 flex items-center justify-center">
                    {/* Vinyl Center Label */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-inner">
                      <div className="w-4 h-4 rounded-full bg-slate-950 border border-purple-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Waveform Canvas */}
            <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80">
              <canvas ref={canvasRef} width={500} height={70} className="w-full h-16 rounded-xl" />
            </div>

            {/* Audio Scrubber */}
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Primary Controls */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isLooping ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' : 'text-slate-400 hover:text-white'
                  }`}
                  title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}
                >
                  <Repeat className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-colors cursor-pointer"
                  title="Rewind 10s"
                >
                  <Rewind className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={togglePlay}
                className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-xl shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5 fill-white" />}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(10)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-colors cursor-pointer"
                  title="Forward 10s"
                >
                  <FastForward className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 ml-2">
                  <button onClick={toggleMute} className="text-slate-400 hover:text-white cursor-pointer">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={e => changeVolume(Number(e.target.value))}
                    className="w-16 accent-purple-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PROPER FULLSCREEN VIDEO CINEMA PLAYER */
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group">
          {/* VIDEO ELEMENT - EDGE TO EDGE */}
          {mediaSrc && (
            <video
              ref={el => { mediaRef.current = el; }}
              src={mediaSrc}
              preload="auto"
              playsInline
              loop={isLooping}
              controls={useNativeControls}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={handleMediaError}
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
              className={`w-full h-full cursor-pointer select-none ${
                fitMode === 'cover'
                  ? 'object-cover'
                  : fitMode === 'fill'
                  ? 'object-fill'
                  : 'object-contain'
              }`}
            />
          )}

          {/* CENTRAL PLAY/PAUSE SPLASH ANIMATION */}
          {!useNativeControls && clickSplash && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
              <div className="p-6 bg-black/60 rounded-full backdrop-blur-md animate-ping">
                {clickSplash === 'play' ? (
                  <Play className="w-12 h-12 text-white fill-white ml-1" />
                ) : (
                  <Pause className="w-12 h-12 text-white" />
                )}
              </div>
            </div>
          )}

          {/* FLOATING TOP OVERLAY BAR */}
          {!useNativeControls && (
            <div
              className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-30 transition-opacity duration-300 ${
                controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-md">
                  <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cinema Studio</span>
                </div>
                {mediaInfo && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded-md text-[11px] font-mono text-purple-300 backdrop-blur-md">
                    {mediaInfo.formatName}
                  </span>
                )}
                {mediaInfo?.videoWidth && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 bg-white/10 border border-white/15 rounded-md text-[11px] font-mono text-slate-300 backdrop-blur-md">
                    {mediaInfo.videoWidth}×{mediaInfo.videoHeight}
                  </span>
                )}
                <span className="text-xs text-slate-300 font-mono font-medium truncate max-w-xs sm:max-w-sm drop-shadow">
                  {filename}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Codec & Stream Info Inspector */}
                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-black/50 hover:bg-black/80 text-purple-300 hover:text-white rounded-lg border border-purple-500/30 text-xs font-mono transition-colors cursor-pointer backdrop-blur-md"
                  title="View Video & Audio Codec Specs, Streams, and Container Metadata"
                >
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Stream Specs</span>
                </button>

                {/* Aspect Ratio / Fit Toggle */}
                <button
                  onClick={cycleFitMode}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 hover:bg-black/80 text-white rounded-lg border border-white/10 text-xs font-mono transition-colors cursor-pointer backdrop-blur-md"
                  title={`Fit Mode: ${fitMode.toUpperCase()} (Click to toggle Fill/Zoom to eliminate black bars)`}
                >
                  <Scan className="w-3.5 h-3.5 text-purple-400" />
                  <span className="capitalize">{fitMode === 'contain' ? 'Fit Screen' : fitMode === 'cover' ? 'Fill (No Bars)' : 'Stretch'}</span>
                </button>

                {/* Theater / In-Window Fullscreen Toggle */}
                <button
                  onClick={() => setIsInWindowFullscreen(prev => !prev)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer backdrop-blur-md ${
                    isInWindowFullscreen
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-black/50 hover:bg-black/80 text-white border-white/10'
                  }`}
                  title={isInWindowFullscreen ? 'Exit Theater Mode (T)' : 'Enter Theater Mode (T)'}
                >
                  <Tv className="w-4 h-4" />
                </button>

                {/* Browser Native Controls Toggle */}
                <button
                  onClick={() => setUseNativeControls(true)}
                  className="p-1.5 bg-black/50 hover:bg-black/80 text-slate-300 hover:text-white rounded-lg border border-white/10 text-xs transition-colors cursor-pointer backdrop-blur-md"
                  title="Switch to Browser Native Controls"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* FLOATING BOTTOM OVERLAY CONTROLS */}
          {!useNativeControls && (
            <div
              className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-30 transition-opacity duration-300 ${
                controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* TIMELINE / SCRUBBER BAR */}
              <div
                className="relative group/bar flex items-center py-2 cursor-pointer select-none"
                onMouseMove={handleScrubberMouseMove}
                onMouseLeave={handleScrubberMouseLeave}
              >
                {/* Hover Time Tooltip */}
                {hoverTime !== null && (
                  <div
                    className="absolute -top-7 px-2 py-0.5 bg-slate-900/90 text-white text-[11px] font-mono rounded border border-slate-700 shadow-lg pointer-events-none transform -translate-x-1/2 backdrop-blur-md"
                    style={{ left: `${hoverPosition}%` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}

                {/* Base Scrubber Track */}
                <div className="w-full h-1.5 group-hover/bar:h-2.5 bg-white/20 rounded-full overflow-hidden relative transition-all duration-150">
                  {/* Progress Line */}
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* ACTION BUTTONS ROW */}
              <div className="flex items-center justify-between gap-2 text-white">
                {/* Left Controls: Play, Skips, Time, Volume */}
                <div className="flex items-center gap-3">
                  {/* Play / Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 bg-white/10 hover:bg-white/25 rounded-full transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                    title={isPlaying ? 'Pause (Space / K)' : 'Play (Space / K)'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                  </button>

                  {/* Skip Back 10s */}
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Rewind 10s (J / Left Arrow)"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  {/* Skip Forward 10s */}
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Forward 10s (L / Right Arrow)"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>

                  {/* Time Display */}
                  <button
                    onClick={() => setShowTimeRemaining(!showTimeRemaining)}
                    className="text-xs font-mono text-slate-300 hover:text-white px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    title="Click to toggle remaining time"
                  >
                    {showTimeRemaining
                      ? `-${formatTime(Math.max(0, duration - currentTime))}`
                      : `${formatTime(currentTime)} / ${formatTime(duration)}`}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol ml-1">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 text-slate-300 hover:text-white cursor-pointer transition-colors"
                      title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={e => changeVolume(Number(e.target.value))}
                      className="w-16 accent-purple-500 h-1 bg-white/20 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Controls: Speed, PiP, Fullscreen */}
                <div className="flex items-center gap-2 relative">
                  {/* Speed Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-mono font-medium text-slate-200 transition-colors cursor-pointer backdrop-blur-sm"
                      title="Playback Speed"
                    >
                      {playbackSpeed}x
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-9 right-0 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 min-w-[90px] backdrop-blur-xl">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(sp => (
                          <button
                            key={sp}
                            onClick={() => {
                              setPlaybackSpeed(sp);
                              if (mediaRef.current) mediaRef.current.playbackRate = sp;
                              setShowSpeedMenu(false);
                            }}
                            className={`px-3 py-1 text-xs font-mono rounded text-left transition-colors cursor-pointer ${
                              playbackSpeed === sp
                                ? 'bg-purple-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {sp}x {sp === 1.0 && '(Normal)'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Picture-in-Picture */}
                  <button
                    onClick={togglePictureInPicture}
                    className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Picture-in-Picture"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>

                  {/* Download Video */}
                  {mediaSrc && (
                    <a
                      href={mediaSrc}
                      download={filename}
                      className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      title="Download Video File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/10 hover:bg-white/25 text-white rounded-lg transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                    title={isFullscreenActive ? 'Exit Fullscreen (F / Esc)' : 'Enter Fullscreen (F)'}
                  >
                    {isFullscreenActive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CODEC & STREAM INSPECTOR MODAL */}
      {isInspectorOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>Stream & Codec Inspector</span>
                    {mediaInfo && (
                      <span className="px-2 py-0.5 text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                        {mediaInfo.formatName}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-sm sm:max-w-md">{filename}</p>
                </div>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Playback Compatibility Banner */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                mediaInfo?.canPlayNatively
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}>
                {mediaInfo?.canPlayNatively ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {mediaInfo?.canPlayNatively
                      ? 'Native Browser Decoding Supported'
                      : 'Proprietary Codec or Limited Browser Licensing'}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {mediaInfo?.compatibilityNote || (
                      mediaInfo?.canPlayNatively
                        ? 'This file container and codecs are supported directly by Chromium and modern browser hardware decoders.'
                        : 'If playback does not start, the media stream contains audio/video codecs that require external media players (such as VLC, IINA, or MPV).'
                    )}
                  </p>
                </div>
              </div>

              {/* Grid: Container & File Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Container Spec</span>
                  </div>
                  <div className="space-y-1 text-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Format:</span>
                      <span className="font-semibold text-white">{mediaInfo?.formatName || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Container:</span>
                      <span>{mediaInfo?.container.toUpperCase() || 'Auto'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MIME Type:</span>
                      <span className="text-purple-300">{mediaInfo?.mimeType || 'unknown'}</span>
                    </div>
                    {mediaInfo?.fileSizeBytes && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">File Size:</span>
                        <span>{(mediaInfo.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    )}
                    {mediaInfo?.bitrateKbps && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bitrate:</span>
                        <span>~{mediaInfo.bitrateKbps} kbps</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration & Authoring Tags */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Timeline & Metadata</span>
                  </div>
                  <div className="space-y-1 text-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span>
                        {duration > 0
                          ? formatTime(duration)
                          : mediaInfo?.duration
                          ? `${Math.round(mediaInfo.duration)}s`
                          : 'Stream / Variable'}
                      </span>
                    </div>
                    {mediaInfo?.title && (
                      <div className="flex justify-between truncate">
                        <span className="text-slate-400">Title:</span>
                        <span className="text-white truncate max-w-[150px]">{mediaInfo.title}</span>
                      </div>
                    )}
                    {mediaInfo?.writingApp && (
                      <div className="flex justify-between truncate">
                        <span className="text-slate-400">Writing App:</span>
                        <span className="truncate max-w-[150px]">{mediaInfo.writingApp}</span>
                      </div>
                    )}
                    {mediaInfo?.muxingApp && (
                      <div className="flex justify-between truncate">
                        <span className="text-slate-400">Muxer:</span>
                        <span className="truncate max-w-[150px]">{mediaInfo.muxingApp}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Stream Specs */}
              {mediaInfo?.videoCodec && (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <VideoIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Primary Video Stream</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Codec</span>
                      <span className="font-semibold text-blue-300">{mediaInfo.videoCodec}</span>
                    </div>
                    {mediaInfo.videoWidth && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Resolution</span>
                        <span>{mediaInfo.videoWidth} × {mediaInfo.videoHeight}</span>
                      </div>
                    )}
                    {mediaInfo.aspectRatio && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Aspect Ratio</span>
                        <span>{mediaInfo.aspectRatio}</span>
                      </div>
                    )}
                    {mediaInfo.fps && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Framerate</span>
                        <span>{mediaInfo.fps} fps</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Stream Specs */}
              {mediaInfo?.audioCodec && (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Primary Audio Stream</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Codec</span>
                      <span className="font-semibold text-emerald-300">{mediaInfo.audioCodec}</span>
                    </div>
                    {mediaInfo.audioChannels && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Channels</span>
                        <span>{mediaInfo.audioChannels} ({mediaInfo.audioChannels === 2 ? 'Stereo' : mediaInfo.audioChannels === 6 ? '5.1 Surround' : `${mediaInfo.audioChannels} ch`})</span>
                      </div>
                    )}
                    {mediaInfo.sampleRate && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Sample Rate</span>
                        <span>{(mediaInfo.sampleRate / 1000).toFixed(1)} kHz</span>
                      </div>
                    )}
                    {mediaInfo.bitDepth && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bit Depth</span>
                        <span>{mediaInfo.bitDepth}-bit</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subtitles & Additional Tracks */}
              {mediaInfo?.subtitles && mediaInfo.subtitles.length > 0 && (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Embedded Subtitle Tracks</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mediaInfo.subtitles.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 rounded-lg text-[11px] text-amber-300"
                      >
                        {sub.language || `Track ${idx + 1}`} ({sub.codec})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <button
                onClick={handleCopySpecs}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedInfo ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-purple-400" />
                    <span>Copy Stream Specs</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {filename.toLowerCase().endsWith('.mkv') && (
                  <button
                    onClick={() => {
                      setMkvProfile(prev => prev === 'matroska' ? 'webm' : prev === 'webm' ? 'direct' : 'matroska');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600/70 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Toggle container profile"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Profile: {mkvProfile.toUpperCase()}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
