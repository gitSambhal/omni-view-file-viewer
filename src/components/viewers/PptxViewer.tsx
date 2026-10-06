/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Universal Presentation Stage (.pptx, .ppt, .odp, .pps, .ppsx, .key)
 * Features High-Fidelity Slide Canvas, Thumbnail Sidebar, Presenter Mode, Grid Sorter, and Speaker Notes.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid,
  Search,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  FileText,
  Download,
  Sparkles,
  Info,
  ListOrdered,
  Layers,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
  Clock,
  Play,
  Pause,
  MessageSquare,
  Image as ImageIcon,
  Table as TableIcon,
  Columns,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  Share2
} from 'lucide-react';
import {
  parsePresentation,
  ParsedPresentation,
  PresentationSlide,
  SlideParagraph,
  SlideShape
} from '../../services/presentationParser';

interface PptxViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

export const PptxViewer: React.FC<PptxViewerProps> = ({ arrayBuffer, textContent, filename }) => {
  const [presentation, setPresentation] = useState<ParsedPresentation | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'slide' | 'grid' | 'outline'>('slide');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailListRef = useRef<HTMLDivElement>(null);

  // Load and parse presentation
  useEffect(() => {
    async function load() {
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        if (textContent) {
          const lines = textContent.split('\n').filter(Boolean);
          setPresentation({
            title: filename,
            format: 'presentation',
            formatLabel: 'Presentation Content',
            slideCount: 1,
            aspectRatio: '16:9',
            dimensions: { width: 1920, height: 1080 },
            slides: [
              {
                id: 1,
                slideNumber: 1,
                layout: 'title',
                title: filename.replace(/\.[^/.]+$/, ''),
                paragraphs: lines.map(l => ({ runs: [{ text: l }], text: l })),
                bullets: lines.slice(1),
                shapes: [],
                images: [],
                rawText: lines
              }
            ]
          });
          setLoading(false);
          return;
        }
        setError('No presentation file data available.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const parsed = await parsePresentation(arrayBuffer, filename);
        setPresentation(parsed);
        setCurrentSlideIndex(0);
      } catch (err: any) {
        console.error('Error parsing presentation:', err);
        setError(err.message || 'Could not parse presentation file.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [arrayBuffer, textContent, filename]);

  // Slideshow auto-advance timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && presentation && presentation.slides.length > 0) {
      interval = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (prev >= presentation.slides.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, presentation]);

  // Presentation session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentation || presentation.slides.length === 0) return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(presentation.slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNotesOpen(prev => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation, isFullscreen]);

  // Auto-scroll thumbnail sidebar when slide changes
  useEffect(() => {
    if (thumbnailListRef.current) {
      const activeEl = thumbnailListRef.current.querySelector(`[data-slide-idx="${currentSlideIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentSlideIndex]);

  const slides = presentation?.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Filtered slides for search
  const filteredSlides = useMemo(() => {
    if (!searchQuery.trim()) return slides;
    const q = searchQuery.toLowerCase();
    return slides.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
        s.rawText.some(t => t.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
    );
  }, [slides, searchQuery]);

  const handleCopySlideText = () => {
    if (!currentSlide) return;
    const textToCopy =
      `# Slide ${currentSlide.slideNumber}: ${currentSlide.title}\n\n` +
      (currentSlide.subtitle ? `*${currentSlide.subtitle}*\n\n` : '') +
      currentSlide.bullets.map(b => `- ${b}`).join('\n') +
      (currentSlide.notes ? `\n\n> Speaker Notes: ${currentSlide.notes}` : '');

    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllSlides = () => {
    if (!presentation) return;
    const fullText = presentation.slides
      .map(
        s =>
          `## Slide ${s.slideNumber}: ${s.title}\n` +
          (s.subtitle ? `*${s.subtitle}*\n\n` : '\n') +
          s.bullets.map(b => `- ${b}`).join('\n') +
          (s.notes ? `\n\n> Speaker Notes: ${s.notes}` : '')
      )
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(fullText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-950 text-slate-100 overflow-hidden select-none"
    >
      {/* Top Application Toolbar */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 gap-2 shrink-0 z-10 shadow-xs">
        {/* Left Info Cluster */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:flex cursor-pointer"
            title={isSidebarOpen ? 'Hide thumbnail sidebar' : 'Show thumbnail sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 shrink-0">
            <Presentation className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {presentation?.formatLabel || 'PowerPoint Presentation'}
            </span>
          </div>

          {presentation && (
            <span className="text-xs text-slate-400 truncate hidden lg:inline font-mono">
              {presentation.slideCount} {presentation.slideCount === 1 ? 'slide' : 'slides'} · {presentation.aspectRatio}
            </span>
          )}
        </div>

        {/* Center Search Bar */}
        <div className="relative hidden md:block max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search slides, text, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-800/80 border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 transition-all"
          />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('slide')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'slide'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Slide Presentation View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slide</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Grid Sorter View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid ({slides.length})</span>
            </button>

            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'outline'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Outline Document View"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Outline</span>
            </button>
          </div>

          {/* Auto-Play Slideshow Toggle */}
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer hidden sm:flex ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
            }`}
            title={isPlaying ? 'Pause slideshow' : 'Auto-play slideshow (5s per slide)'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setIsNotesOpen(prev => !prev)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isNotesOpen
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
            }`}
            title="Toggle speaker notes (Press N)"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Copy Slide */}
          <button
            onClick={handleCopySlideText}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            title="Copy current slide text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Mode */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            title="Fullscreen presentation mode (Press F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* Left Thumbnails Sidebar */}
        {isSidebarOpen && viewMode === 'slide' && slides.length > 0 && (
          <aside className="w-48 sm:w-56 lg:w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col min-h-0 shrink-0 z-5">
            <div className="p-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Slide Navigator</span>
              <span className="font-mono text-[11px]">{slides.length} slides</span>
            </div>

            <div
              ref={thumbnailListRef}
              className="flex-1 overflow-y-auto p-2.5 space-y-2.5"
            >
              {filteredSlides.map((sd, idx) => {
                const actualIndex = slides.findIndex(s => s.id === sd.id);
                const isSelected = actualIndex === currentSlideIndex;

                return (
                  <div
                    key={sd.id}
                    data-slide-idx={actualIndex}
                    onClick={() => setCurrentSlideIndex(actualIndex >= 0 ? actualIndex : idx)}
                    className={`cursor-pointer rounded-xl p-2.5 border transition-all transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1.5 text-slate-400">
                      <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        {sd.slideNumber}
                      </span>
                      <span className="truncate max-w-[90px] text-slate-500">{sd.layout}</span>
                    </div>

                    {/* Mini Aspect Ratio Card Preview */}
                    <div className="aspect-[16/9] w-full bg-slate-900 rounded-md border border-slate-800/80 p-2 flex flex-col justify-between overflow-hidden relative">
                      <div className="w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-1"></div>
                      <div className="text-[10px] font-bold text-slate-200 line-clamp-1 leading-tight">
                        {sd.title}
                      </div>
                      <div className="text-[8px] text-slate-400 line-clamp-2 leading-tight">
                        {sd.bullets.join(' · ') || sd.rawText[1] || 'Slide content'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Center Presentation Stage */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto bg-slate-950 items-center justify-center p-3 sm:p-6 lg:p-8 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-200">Rendering Presentation Deck...</p>
              <p className="text-xs text-slate-500">Parsing shapes, layouts, images, and slides in-memory</p>
            </div>
          ) : error || slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
              <Presentation className="w-12 h-12 text-amber-500/80 mb-3" />
              <h3 className="text-base font-semibold text-slate-200 mb-1">Unable to Load Presentation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {error || 'No readable slide records were found in this presentation.'}
              </p>
            </div>
          ) : viewMode === 'slide' && currentSlide ? (
            <div className="w-full max-w-5xl flex flex-col items-center space-y-4 flex-1 justify-center min-h-0">
              {/* High-Fidelity Slide Canvas Container */}
              <div
                className={`w-full ${
                  presentation?.aspectRatio === '4:3' ? 'aspect-[4/3] max-w-3xl' : 'aspect-[16/9]'
                } max-h-[75vh] bg-slate-900 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col justify-between relative overflow-hidden group backdrop-blur-xs transition-all`}
                style={{
                  transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                  transformOrigin: 'center center'
                }}
              >
                {/* Top Theme Accent Bar */}
                <div
                  className={`absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r ${
                    currentSlide.accentColor || 'from-amber-500 via-orange-500 to-red-500'
                  }`}
                ></div>

                {/* Top Slide Header */}
                <div className="p-6 sm:p-10 pb-0 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        Slide {currentSlide.slideNumber} of {slides.length}
                      </span>
                      {currentSlide.layout && (
                        <span className="text-[10px] text-slate-400 font-mono uppercase px-2 py-0.5 rounded bg-slate-800">
                          {currentSlide.layout}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      {presentation?.format?.toUpperCase()}
                    </div>
                  </div>

                  {/* Slide Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {currentSlide.title}
                  </h1>

                  {/* Slide Subtitle */}
                  {currentSlide.subtitle && (
                    <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium mt-2 leading-relaxed">
                      {currentSlide.subtitle}
                    </p>
                  )}
                </div>

                {/* Slide Body Content Rendering Engine */}
                <div className="flex-1 px-6 sm:px-10 py-4 overflow-y-auto flex flex-col justify-center min-h-0">
                  {/* Layout 1: Table Slide */}
                  {currentSlide.table ? (
                    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 my-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        {currentSlide.table.headers.length > 0 && (
                          <thead className="bg-slate-800/90 text-slate-200 border-b border-slate-700">
                            <tr>
                              {currentSlide.table.headers.map((h, i) => (
                                <th key={i} className="p-3 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody className="divide-y divide-slate-800/60">
                          {currentSlide.table.rows.map((r, ri) => (
                            <tr key={ri} className="hover:bg-slate-800/40">
                              {r.map((c, ci) => (
                                <td key={ci} className="p-3 text-slate-300">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : currentSlide.images.length > 0 ? (
                    /* Layout 2: Image / Picture Slide */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto">
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center max-h-64 shadow-lg">
                        <img
                          src={currentSlide.images[0].url}
                          alt={currentSlide.title}
                          className="max-h-64 w-full object-contain"
                        />
                      </div>
                      <div className="space-y-3">
                        {currentSlide.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-slate-200 text-sm leading-relaxed">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : currentSlide.layout === 'two-column' && currentSlide.bullets.length >= 4 ? (
                    /* Layout 3: Two-Column Side-by-Side */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
                      <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                        {currentSlide.bullets.slice(0, Math.ceil(currentSlide.bullets.length / 2)).map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-slate-200 text-sm leading-relaxed">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                        {currentSlide.bullets.slice(Math.ceil(currentSlide.bullets.length / 2)).map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-slate-200 text-sm leading-relaxed">
                            <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Layout 4: Standard Bullet List / Text Content */
                    <div className="space-y-3.5 my-auto">
                      {currentSlide.bullets.length > 0 ? (
                        currentSlide.bullets.map((txt, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3.5 text-slate-100 text-sm sm:text-base md:text-lg leading-relaxed group"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-xs"></span>
                            <span>{txt}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic text-base">
                          {currentSlide.rawText[0] || '[Empty slide content]'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Slide Footer */}
                <div className="px-6 sm:px-10 py-3.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400 shrink-0">
                  <span className="truncate max-w-[280px] font-medium text-slate-300">
                    {filename}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">
                      {currentSlide.slideNumber} / {slides.length}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-slate-400">OmniView Presentation Engine</span>
                  </div>
                </div>
              </div>

              {/* Bottom Floating Navigation Toolbar */}
              <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-800 shadow-xl backdrop-blur-xs">
                <button
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                  className="p-1.5 rounded-full hover:bg-slate-800 disabled:opacity-30 text-slate-200 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  title="Previous slide (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5 px-3 border-x border-slate-800">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {currentSlideIndex + 1}
                  </span>
                  <span className="text-xs text-slate-500">/</span>
                  <span className="text-xs font-mono text-slate-300">{slides.length}</span>
                </div>

                <button
                  disabled={currentSlideIndex >= slides.length - 1}
                  onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                  className="p-1.5 rounded-full hover:bg-slate-800 disabled:opacity-30 text-slate-200 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  title="Next slide (Right Arrow / Space)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Session Elapsed Timer */}
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 pl-2 border-l border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Sorter View */
            <div className="w-full max-w-6xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    All Slides ({filteredSlides.length})
                  </h3>
                  <p className="text-xs text-slate-400">Click any slide to jump into presentation view</p>
                </div>

                <button
                  onClick={handleCopyAllSlides}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy full deck outline</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSlides.map((sd, idx) => {
                  const actualIndex = slides.findIndex(s => s.id === sd.id);
                  const isSelected = actualIndex === currentSlideIndex;

                  return (
                    <div
                      key={sd.id}
                      onClick={() => {
                        setCurrentSlideIndex(actualIndex >= 0 ? actualIndex : idx);
                        setViewMode('slide');
                      }}
                      className={`cursor-pointer bg-slate-900 border rounded-2xl p-4.5 hover:border-amber-500 transition-all transform hover:-translate-y-1 flex flex-col justify-between min-h-[200px] shadow-sm ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/5'
                          : 'border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold mb-2">
                          <span className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Slide {sd.slideNumber}
                          </span>
                          <span className="text-slate-400 font-normal">
                            {sd.bullets.length} items
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-100 text-sm line-clamp-2 mb-2 leading-snug">
                          {sd.title}
                        </h4>

                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                          {sd.bullets.join(' · ') || sd.rawText.slice(1).join(' ') || 'Slide content'}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Click to view</span>
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Outline Document View */
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    {presentation?.title || filename}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Extracted Presentation Outline & Slide Text ({slides.length} slides)
                  </p>
                </div>

                <button
                  onClick={handleCopyAllSlides}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Full Outline</span>
                </button>
              </div>

              <div className="space-y-6 divide-y divide-slate-800/80">
                {slides.map(sd => (
                  <div key={sd.id} className="pt-6 first:pt-0 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Slide {sd.slideNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-100">{sd.title}</h3>
                    </div>

                    {sd.subtitle && (
                      <p className="text-xs text-slate-400 italic pl-2 border-l-2 border-slate-700">
                        {sd.subtitle}
                      </p>
                    )}

                    {sd.bullets.length > 0 && (
                      <ul className="pl-6 space-y-1.5 list-disc text-sm text-slate-200">
                        {sd.bullets.map((b, i) => (
                          <li key={i} className="leading-relaxed">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sd.notes && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                        <span className="font-semibold text-amber-400/90">Notes:</span> {sd.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Speaker Notes Drawer */}
          {isNotesOpen && currentSlide && (
            <div className="w-full max-w-4xl mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Speaker Notes (Slide {currentSlide.slideNumber})
                </span>
                <button
                  onClick={() => setIsNotesOpen(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentSlide.notes || 'No speaker notes recorded for this slide.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
