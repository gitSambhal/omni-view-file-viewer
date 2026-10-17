/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Dedicated Media Gallery & Lightbox Studio
 * Supports seamless Arrow Key (← / →) navigation, Slideshow, Filmstrip Carousel,
 * Grid Gallery View, and unified Image/Video/Audio playback.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Grid,
  Sliders,
  Download,
  Info,
  X,
  Sparkles,
  Move,
  Volume2,
  VolumeX,
  Clock,
  Layers,
  RefreshCw,
  Sun,
  Eye,
  Film,
  Music
} from 'lucide-react';
import { TabFile } from '../../types/file';
import { formatFileSize } from '../../services/fileDetector';

interface MediaGalleryViewerProps {
  mediaFiles: TabFile[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDownloadFile?: (id: string) => void;
}

export const MediaGalleryViewer: React.FC<MediaGalleryViewerProps> = ({
  mediaFiles,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  onNavigate,
  onDownloadFile
}) => {
  const currentFile = mediaFiles[currentIndex] || null;

  // View & Lightbox Mode States
  const [viewMode, setViewMode] = useState<'stage' | 'grid'>('stage');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [showFilmstrip, setShowFilmstrip] = useState<boolean>(true);

  // Image Specific States
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [background, setBackground] = useState<'checker' | 'dark' | 'light'>('dark');
  const [inverted, setInverted] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  // Slideshow States
  const [isSlideshowActive, setIsSlideshowActive] = useState<boolean>(false);
  const [slideshowInterval, setSlideshowInterval] = useState<number>(3); // seconds
  const [slideshowProgress, setSlideshowProgress] = useState<number>(0);
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Media (Video / Audio) States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);

  // Reset transforms whenever active image changes
  useEffect(() => {
    setZoom(100);
    setRotation(0);
    setInverted(false);
    setPan({ x: 0, y: 0 });
    setImgDimensions(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [currentIndex]);

  // Scroll active filmstrip item into view
  useEffect(() => {
    if (filmstripRef.current && showFilmstrip) {
      const activeEl = filmstripRef.current.children[currentIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex, showFilmstrip]);

  // Handle Keyboard Navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (currentFile?.category === 'image') {
          setIsSlideshowActive(prev => !prev);
        } else if (mediaRef.current) {
          if (mediaRef.current.paused) {
            mediaRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else {
            mediaRef.current.pause();
            setIsPlaying(false);
          }
        }
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      } else if (e.key.toLowerCase() === 'r' && currentFile?.category === 'image') {
        e.preventDefault();
        setRotation(r => (r + 90) % 360);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(1000, z + 25));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(10, z - 25));
      }
    },
    [isOpen, onNavigate, onClose, isFullscreen, currentFile]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Slideshow Logic
  useEffect(() => {
    if (!isSlideshowActive || !isOpen || mediaFiles.length <= 1) {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setSlideshowProgress(0);
      return;
    }

    setSlideshowProgress(0);
    const stepMs = 50;
    const totalMs = slideshowInterval * 1000;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
      elapsed += stepMs;
      setSlideshowProgress(Math.min(100, (elapsed / totalMs) * 100));
    }, stepMs);

    slideshowTimerRef.current = setInterval(() => {
      onNavigate('next');
      elapsed = 0;
    }, totalMs);

    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isSlideshowActive, isOpen, slideshowInterval, mediaFiles.length, currentIndex, onNavigate]);

  if (!isOpen || !currentFile) return null;

  // Resolve Image/Media Source URL
  const getMediaSource = (file: TabFile) => {
    if (file.objectUrl) return file.objectUrl;
    if (file.dataUrl) return file.dataUrl;
    if (file.textContent && file.textContent.trim().startsWith('<svg')) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(file.textContent)}`;
    }
    return '';
  };

  const currentSource = getMediaSource(currentFile);
  const isImage = currentFile.category === 'image';
  const isVideo = currentFile.category === 'video';
  const isAudio = currentFile.category === 'audio';

  // Mouse Drag Panning for Images
  const handleWheel = (e: React.WheelEvent) => {
    if (!isImage) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom(prev => Math.min(1000, Math.max(10, Math.round(prev * zoomFactor))));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImage || e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl text-slate-100 font-sans select-none overflow-hidden animate-in fade-in duration-200 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800/80 rounded-xl shadow-2xl shrink-0 gap-3 z-30">
        {/* Left: Category Badge & Media File Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold shrink-0">
            {isImage && <ImageIcon className="w-4 h-4" />}
            {isVideo && <VideoIcon className="w-4 h-4 text-purple-400" />}
            {isAudio && <MusicIcon className="w-4 h-4 text-emerald-400" />}
            <span className="capitalize">{currentFile.category} Studio</span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-md">
              {currentFile.name}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{formatFileSize(currentFile.size)}</span>
              <span>•</span>
              <span className="text-pink-400 font-semibold">
                Item {currentIndex + 1} of {mediaFiles.length}
              </span>
              {imgDimensions && (
                <>
                  <span>•</span>
                  <span>{imgDimensions.width}×{imgDimensions.height} px</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Quick Prev / Next Arrow Switcher & Counter */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onNavigate('prev')}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Previous Media File (Left Arrow ←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-medium px-2 text-slate-300">
            {currentIndex + 1} / {mediaFiles.length}
          </span>

          <button
            onClick={() => onNavigate('next')}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Next Media File (Right Arrow →)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Studio Controls (Grid View, Slideshow, Zoom, Fullscreen, Close) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle (Stage / Grid) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('stage')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'stage'
                  ? 'bg-pink-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Lightbox Stage View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Stage</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-pink-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Gallery Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Grid</span>
            </button>
          </div>

          {/* Slideshow Toggle for Images */}
          {isImage && (
            <button
              onClick={() => setIsSlideshowActive(!isSlideshowActive)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                isSlideshowActive
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
              }`}
              title="Auto-Play Media Slideshow (Spacebar)"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSlideshowActive ? 'Playing' : 'Slideshow'}</span>
            </button>
          )}

          {/* Filmstrip Toggle */}
          <button
            onClick={() => setShowFilmstrip(!showFilmstrip)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showFilmstrip
                ? 'bg-slate-800 text-pink-400 border-pink-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Filmstrip Carousel"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Metadata Inspector Toggle */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showMetadata
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Media Metadata"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Download File */}
          <button
            onClick={() => onDownloadFile && onDownloadFile(currentFile.id)}
            className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Download Media File"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Toggle Fullscreen Cinema Mode (Key F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            className="p-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slideshow Progress Bar */}
      {isSlideshowActive && (
        <div className="w-full bg-slate-900 h-1 overflow-hidden shrink-0 mt-1 rounded-full">
          <div
            className="bg-emerald-400 h-full transition-all duration-75 ease-linear"
            style={{ width: `${slideshowProgress}%` }}
          />
        </div>
      )}

      {/* Main Interactive Stage Body */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden relative my-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-2xl">
        {viewMode === 'grid' ? (
          /* Thumbnail Grid View */
          <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 custom-scrollbar">
            {mediaFiles.map((item, idx) => {
              const src = getMediaSource(item);
              const isActive = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectIndex(idx);
                    setViewMode('stage');
                  }}
                  className={`group relative flex flex-col bg-slate-900 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-2xl ${
                    isActive
                      ? 'border-pink-500 ring-4 ring-pink-500/20 shadow-pink-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                    {item.category === 'image' && src ? (
                      <img src={src} alt={item.name} className="w-full h-full object-cover" />
                    ) : item.category === 'video' && src ? (
                      <video src={src} className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        {item.category === 'audio' ? (
                          <MusicIcon className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <Film className="w-8 h-8 text-purple-400" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white flex items-center gap-1 border border-white/10">
                      {item.category === 'image' && <ImageIcon className="w-3 h-3 text-pink-400" />}
                      {item.category === 'video' && <VideoIcon className="w-3 h-3 text-purple-400" />}
                      {item.category === 'audio' && <MusicIcon className="w-3 h-3 text-emerald-400" />}
                      <span>#{idx + 1}</span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col bg-slate-900/90">
                    <span className="text-xs font-semibold text-slate-200 truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatFileSize(item.size)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Item Stage View */
          <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
            {/* Left Chevron Button Overlay */}
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-pink-600 text-slate-200 hover:text-white border border-slate-700 shadow-2xl transition-all transform hover:scale-110 cursor-pointer group"
              title="Previous Media File (← Arrow Left)"
            >
              <ChevronLeft className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Center Media Canvas */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`flex-1 flex items-center justify-center p-4 overflow-hidden relative select-none ${
                isImage
                  ? background === 'checker'
                    ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950'
                    : background === 'light'
                    ? 'bg-slate-100'
                    : 'bg-slate-950'
                  : 'bg-slate-950'
              }`}
            >
              {isImage && currentSource ? (
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                    filter: inverted ? 'invert(1)' : 'none',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  className="inline-block transform-gpu cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={currentSource}
                    alt={currentFile.name}
                    onLoad={e => {
                      const img = e.currentTarget;
                      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                    }}
                    draggable={false}
                    className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl pointer-events-none"
                  />
                </div>
              ) : isVideo && currentSource ? (
                <div className="w-full h-full max-w-5xl flex items-center justify-center p-2">
                  <video
                    ref={el => { mediaRef.current = el; }}
                    src={currentSource}
                    controls
                    autoPlay
                    onTimeUpdate={() => {
                      if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                      if (mediaRef.current) setDuration(mediaRef.current.duration);
                    }}
                    className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-slate-800"
                  />
                </div>
              ) : isAudio && currentSource ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-3xl border border-slate-800 max-w-lg w-full space-y-6 shadow-2xl">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                    <MusicIcon className="w-12 h-12" />
                  </div>
                  <div className="text-center space-y-1 w-full">
                    <h3 className="text-lg font-bold text-slate-100 truncate px-4">{currentFile.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">Audio Track • {formatFileSize(currentFile.size)}</p>
                  </div>
                  <audio
                    ref={el => { mediaRef.current = el; }}
                    src={currentSource}
                    controls
                    autoPlay
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="text-slate-500 text-sm">Loading media asset...</div>
              )}

              {/* Arrow Key Visual Cues Badge */}
              <div className="absolute bottom-3 left-4 bg-slate-900/90 text-slate-300 text-[11px] font-mono px-3 py-1.5 rounded-full border border-slate-800 shadow-xl flex items-center gap-2 pointer-events-none">
                <span className="text-pink-400 font-bold">← / →</span> Arrow Keys to Navigate • <span className="text-emerald-400 font-bold">Space</span> Play/Slideshow • <span className="text-purple-400 font-bold">Esc</span> Exit
              </div>
            </div>

            {/* Right Chevron Button Overlay */}
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-pink-600 text-slate-200 hover:text-white border border-slate-700 shadow-2xl transition-all transform hover:scale-110 cursor-pointer group"
              title="Next Media File (→ Arrow Right)"
            >
              <ChevronRight className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Optional Metadata Inspector Panel */}
            {showMetadata && (
              <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 space-y-4 overflow-y-auto text-xs font-mono text-slate-300 shadow-2xl shrink-0">
                <h4 className="font-bold text-pink-400 flex items-center gap-2 text-sm border-b border-slate-800 pb-2">
                  <Info className="w-4 h-4" /> File Metadata
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">File Name:</span>
                    <span className="font-semibold text-slate-100 truncate max-w-[130px]" title={currentFile.name}>
                      {currentFile.name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Category:</span>
                    <span className="capitalize text-pink-400 font-semibold">{currentFile.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Size:</span>
                    <span className="text-slate-200">{formatFileSize(currentFile.size)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-500">Extension:</span>
                    <span className="uppercase text-slate-200">{currentFile.extension || 'N/A'}</span>
                  </div>
                  {imgDimensions && (
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-500">Resolution:</span>
                      <span className="text-slate-200">{imgDimensions.width}×{imgDimensions.height}</span>
                    </div>
                  )}
                  {duration > 0 && (
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-500">Duration:</span>
                      <span className="text-slate-200">{formatTime(duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Interactive Filmstrip Carousel */}
      {showFilmstrip && mediaFiles.length > 1 && (
        <div
          ref={filmstripRef}
          className="flex items-center gap-2.5 p-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-x-auto custom-scrollbar shrink-0 z-30 max-h-24"
        >
          {mediaFiles.map((item, idx) => {
            const src = getMediaSource(item);
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.id}
                onClick={() => onSelectIndex(idx)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg ring-2 ring-pink-500/30'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {item.category === 'image' && src ? (
                    <img src={src} alt={item.name} className="w-full h-full object-cover" />
                  ) : item.category === 'video' ? (
                    <VideoIcon className="w-4 h-4 text-purple-400" />
                  ) : (
                    <MusicIcon className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex flex-col text-left max-w-[100px] min-w-0">
                  <span className="text-xs font-medium truncate">{item.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
