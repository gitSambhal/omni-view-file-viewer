/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Activity,
  Music,
  Video as VideoIcon,
  Maximize2,
  Rewind,
  FastForward,
  AlertCircle,
  Download
} from 'lucide-react';

interface MediaViewerProps {
  objectUrl?: string;
  dataUrl?: string;
  arrayBuffer?: ArrayBuffer;
  filename: string;
  isAudio: boolean;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  objectUrl,
  dataUrl,
  arrayBuffer,
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

  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detect MIME type based on extension
  const getMimeType = (file: string, isAudioFile: boolean): string => {
    const ext = file.split('.').pop()?.toLowerCase() || '';
    if (isAudioFile) {
      if (ext === 'mp3') return 'audio/mpeg';
      if (ext === 'wav') return 'audio/wav';
      if (ext === 'ogg') return 'audio/ogg';
      if (ext === 'aac') return 'audio/aac';
      if (ext === 'flac') return 'audio/flac';
      if (ext === 'm4a') return 'audio/mp4';
      return 'audio/mpeg';
    } else {
      if (ext === 'webm') return 'video/webm';
      if (ext === 'ogv') return 'video/ogg';
      if (ext === 'mov') return 'video/quicktime';
      if (ext === 'mkv') return 'video/x-matroska';
      if (ext === 'avi') return 'video/x-msvideo';
      return 'video/mp4';
    }
  };

  useEffect(() => {
    setHasError(false);
    setErrorMessage('');

    if (objectUrl) {
      setMediaSrc(objectUrl);
    } else if (dataUrl) {
      setMediaSrc(dataUrl);
    } else if (arrayBuffer) {
      const mime = getMimeType(filename, isAudio);
      const blob = new Blob([arrayBuffer], { type: mime });
      const url = URL.createObjectURL(blob);
      setMediaSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [objectUrl, dataUrl, arrayBuffer, isAudio, filename]);

  // Audio waveform animation
  useEffect(() => {
    if (!isAudio || !isPlaying || !canvasRef.current) return;

    let animationId: number;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 48;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * (canvas.height * 0.75) + 8;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y, barWidth - 4, height);
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
    } else {
      const playPromise = mediaRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.warn('Playback error:', err);
            setIsPlaying(false);
            setHasError(true);
            setErrorMessage('Browser policy or codec restriction prevented automatic playback. Try clicking play again.');
          });
      }
    }
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

  const handleMediaError = (e: any) => {
    console.error('Media element error:', e);
    setHasError(true);
    setErrorMessage('Unsupported video/audio codec or corrupted media format for native browser playback.');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (mediaRef.current) {
      const newTime = Math.min(Math.max(0, mediaRef.current.currentTime + seconds), duration);
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(err => console.warn(err));
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 text-slate-100 overflow-hidden select-none transition-colors"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
          {isAudio ? <Music className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
          {isAudio ? 'Audio Player Studio' : 'Video Player Studio'}
        </div>

        <div className="flex items-center gap-3">
          {!isAudio && (
            <button
              onClick={() => setUseNativeControls(!useNativeControls)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline underline-offset-2 cursor-pointer"
            >
              {useNativeControls ? 'Use Custom Controls' : 'Use Browser Controls'}
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-mono">Speed:</span>
            {[0.5, 1.0, 1.25, 1.5, 2.0].map(sp => (
              <button
                key={sp}
                onClick={() => {
                  setPlaybackSpeed(sp);
                  if (mediaRef.current) mediaRef.current.playbackRate = sp;
                }}
                className={`px-2 py-0.5 rounded font-mono text-xs cursor-pointer transition-colors ${
                  playbackSpeed === sp
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Player Display Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-slate-950">
        {hasError ? (
          <div className="max-w-md p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-100 text-base">Media Playback Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
            </div>

            <a
              href={mediaSrc}
              download={filename}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Media File</span>
            </a>
          </div>
        ) : isAudio ? (
          <div className="w-full max-w-xl flex flex-col items-center space-y-6">
            {/* Audio Visualizer Card */}
            <div className="w-full h-56 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-purple-400 font-mono">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Activity className="w-4 h-4 animate-pulse" /> Live Audio Synthesizer
                </span>
                <span className="truncate max-w-[180px] text-slate-400">{filename}</span>
              </div>

              <canvas ref={canvasRef} width={600} height={140} className="w-full h-32 my-auto" />

              <audio
                ref={el => { mediaRef.current = el; }}
                src={mediaSrc}
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleMediaError}
              />
            </div>
          </div>
        ) : (
          /* Video Canvas Container */
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center relative group">
            {mediaSrc && (
              <video
                ref={el => { mediaRef.current = el; }}
                src={mediaSrc}
                preload="metadata"
                playsInline
                controls={useNativeControls}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={handleMediaError}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />
            )}

            {/* Overlay Play Icon on Hover */}
            {!useNativeControls && !isPlaying && !hasError && (
              <button
                onClick={togglePlay}
                className="absolute p-5 bg-purple-600/90 hover:bg-purple-500 text-white rounded-full shadow-2xl transform scale-100 hover:scale-110 transition-all cursor-pointer backdrop-blur-sm"
              >
                <Play className="w-8 h-8 ml-1 fill-white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Media Player Controls Bar */}
      {!useNativeControls && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          {/* Seek Progress Bar */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-purple-600 dark:accent-purple-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-10)}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full cursor-pointer transition-colors"
                title="Rewind 10s"
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full cursor-pointer transition-colors"
                title="Forward 10s"
              >
                <FastForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (mediaRef.current) mediaRef.current.currentTime = 0;
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full cursor-pointer transition-colors ml-1"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (mediaRef.current) mediaRef.current.muted = !isMuted;
                  }}
                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    if (mediaRef.current) {
                      mediaRef.current.volume = v;
                      mediaRef.current.muted = v === 0;
                      setIsMuted(v === 0);
                    }
                  }}
                  className="w-20 accent-purple-600 dark:accent-purple-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
                />
              </div>

              {!isAudio && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full cursor-pointer transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
