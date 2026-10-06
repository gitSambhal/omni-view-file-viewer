/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Universal Presentation Stage (.pptx, .ppt, .odp, .pps, .ppsx, .key)
 * High-Fidelity Slide Canvas with Exact Shape Positioning, Theme Colors, Tables, Images, Custom Geometries, and Presenter Mode.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Search,
  Grid,
  FileText,
  Clock,
  Play,
  Pause,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Layout,
  ListOrdered,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Printer
} from 'lucide-react';
import {
  parsePresentation,
  ParsedPresentation,
  PresentationSlide,
  SlideShape
} from '../../services/presentationParser';
export interface PptxViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename?: string;
  file?: {
    name?: string;
    arrayBuffer?: ArrayBuffer;
    data?: ArrayBuffer | Uint8Array;
    content?: string;
  };
}

export const PptxViewer: React.FC<PptxViewerProps> = ({ arrayBuffer, textContent, filename, file }) => {
  const activeFilename = filename || file?.name || 'Presentation.pptx';
  const [presentation, setPresentation] = useState<ParsedPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid' | 'outline'>('slide');
  const [renderMode, setRenderMode] = useState<'canvas' | 'structured'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Presenter timing state
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailListRef = useRef<HTMLDivElement>(null);

  // Load and parse presentation
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        let buffer: ArrayBuffer | null = null;
        if (arrayBuffer) {
          buffer = arrayBuffer;
        } else if (file?.arrayBuffer) {
          buffer = file.arrayBuffer;
        } else if (file?.data instanceof ArrayBuffer) {
          buffer = file.data;
        } else if (file?.data instanceof Uint8Array) {
          buffer = file.data.buffer.slice(file.data.byteOffset, file.data.byteOffset + file.data.byteLength) as ArrayBuffer;
        } else if (textContent || typeof file?.content === 'string') {
          const rawText = textContent || file?.content || '';
          const encoder = new TextEncoder();
          buffer = encoder.encode(rawText).buffer as ArrayBuffer;
        }

        if (buffer && buffer.byteLength > 0) {
          const parsed = await parsePresentation(buffer, activeFilename);
          if (isMounted) {
            setPresentation(parsed);
            setCurrentSlideIndex(0);
            setLoading(false);
          }
        } else {
          // Fallback text deck
          const textSource = textContent || file?.content || '';
          const lines = textSource.split('\n').filter(Boolean);
          if (isMounted) {
            setPresentation({
              title: activeFilename.replace(/\.[^/.]+$/, ''),
              format: 'presentation',
              formatLabel: 'Presentation',
              slideCount: 1,
              aspectRatio: '16:9',
              dimensions: { width: 1920, height: 1080, slideWidthPoints: 960, slideHeightPoints: 540 },
              slides: [
                {
                  id: 1,
                  slideNumber: 1,
                  layout: 'canvas',
                  title: activeFilename,
                  shapes: [
                    {
                      id: 'shape-1',
                      type: 'body',
                      box: {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        leftPercent: 8,
                        topPercent: 12,
                        widthPercent: 84,
                        heightPercent: 76
                      },
                      style: {},
                      paragraphs: lines.map(l => ({ runs: [{ text: l }], text: l }))
                    }
                  ],
                  images: [],
                  rawText: lines,
                  backgroundColor: '#FFFFFF',
                  isDarkBackground: false
                }
              ]
            });
            setLoading(false);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Failed to parse presentation:', err);
          setError(err instanceof Error ? err.message : 'Failed to parse presentation');
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [arrayBuffer, textContent, activeFilename, file]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerRunning) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning]);

  const slides = presentation?.slides || [];
  const currentSlide = slides[currentSlideIndex] || null;

  // Slide points for proportional font calculations
  const baseSlidePoints = presentation?.dimensions?.slideWidthPoints || (presentation?.aspectRatio === '4:3' ? 720 : 960);

  // Search filtered slides
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

  // Full presentation text copy
  const fullDeckMarkdown = useMemo(() => {
    if (!presentation) return '';
    return (
      `# ${presentation.title}\n\n` +
      presentation.slides
        .map(
          (s, idx) =>
            `## Slide ${idx + 1}: ${s.title}\n` +
            (s.subtitle ? `*${s.subtitle}*\\n\\n` : '\n') +
            s.rawText.map(b => `- ${b}`).join('\n') +
            (s.notes ? `\n\n> Speaker Notes: ${s.notes}` : '')
        )
        .join('\n\n---\n\n')
    );
  }, [presentation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(slides.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  // Auto scroll sidebar thumbnail into view
  useEffect(() => {
    if (thumbnailListRef.current && isSidebarOpen && viewMode === 'slide') {
      const activeEl = thumbnailListRef.current.querySelector(
        `[data-slide-idx="${currentSlideIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentSlideIndex, isSidebarOpen, viewMode]);

  const handleCopyOutline = async () => {
    if (!fullDeckMarkdown) return;
    try {
      await navigator.clipboard.writeText(fullDeckMarkdown);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySlideText = async () => {
    if (!currentSlide) return;
    const text = [
      `Slide ${currentSlide.slideNumber}: ${currentSlide.title}`,
      currentSlide.subtitle ? `Subtitle: ${currentSlide.subtitle}` : '',
      ...currentSlide.rawText,
      currentSlide.notes ? `Notes: ${currentSlide.notes}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to render proportional font sizes using container query width (cqw)
  const getProportionalFontSize = (pt?: number, defaultPt = 14) => {
    const points = pt || defaultPt;
    return `calc(${points} * (100cqw / ${baseSlidePoints}))`;
  };

  // Helper to render positioned shape in original canvas mode
  const renderCanvasShape = (shape: SlideShape) => {
    const box = shape.box;
    const style = shape.style;

    // Background fill styling
    let background = 'transparent';
    if (style.fillGradient && style.fillGradient.stops.length > 0) {
      const stopsStr = style.fillGradient.stops
        .map(s => `${s.color} ${s.position}%`)
        .join(', ');
      background = `linear-gradient(${style.fillGradient.angle || 90}deg, ${stopsStr})`;
    } else if (style.fillColor) {
      background = style.fillColor;
    }

    // Shadow styling
    let boxShadow: string | undefined;
    if (style.shadow) {
      boxShadow = `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`;
    }

    // Custom geometry clip-path or border-radius
    let clipPath: string | undefined;
    let borderRadius: string | undefined = style.borderRadius ? `${style.borderRadius}px` : undefined;

    if (style.geometry === 'roundRect') {
      borderRadius = '0.75rem';
    } else if (style.geometry === 'ellipse') {
      borderRadius = '9999px';
    } else if (style.geometry === 'triangle') {
      clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (style.geometry === 'diamond') {
      clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    } else if (style.geometry === 'rightArrow') {
      clipPath = 'polygon(0% 25%, 65% 25%, 65% 0%, 100% 50%, 65% 100%, 65% 75%, 0% 75%)';
    } else if (style.geometry === 'leftArrow') {
      clipPath = 'polygon(35% 0%, 35% 25%, 100% 25%, 100% 75%, 35% 75%, 35% 100%, 0% 50%)';
    }

    const posStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${box.leftPercent}%`,
      top: `${box.topPercent}%`,
      width: `${box.widthPercent}%`,
      height: `${box.heightPercent}%`,
      transform: box.rotation ? `rotate(${box.rotation}deg)` : undefined,
      background,
      borderColor: style.borderColor || 'transparent',
      borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
      borderStyle: style.borderStyle || (style.borderColor ? 'solid' : undefined),
      borderRadius,
      clipPath,
      boxShadow,
      opacity: style.opacity !== undefined ? style.opacity : 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent:
        style.verticalAlign === 'center'
          ? 'center'
          : style.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'flex-start',
      paddingLeft: style.paddingLeftPercent ? `${style.paddingLeftPercent}%` : undefined,
      paddingTop: style.paddingTopPercent ? `${style.paddingTopPercent}%` : undefined,
      boxSizing: 'border-box',
      pointerEvents: shape.isMasterOrLayoutShape ? 'none' : 'auto'
    };

    // 1. Connector / Line
    if (shape.type === 'line' || style.geometry === 'line') {
      return (
        <div
          key={shape.id}
          style={{
            ...posStyle,
            borderBottomWidth: style.borderWidth ? `${Math.max(2, style.borderWidth)}px` : '2px',
            borderBottomColor: style.borderColor || style.fillColor || '#94A3B8',
            borderBottomStyle: style.borderStyle || 'solid',
            height: '2px'
          }}
        />
      );
    }

    // 2. Picture / Image
    if (shape.type === 'image' && shape.imageUrl) {
      return (
        <div key={shape.id} style={posStyle} className="select-none overflow-hidden">
          <img
            src={shape.imageUrl}
            alt={shape.imageAlt || 'Slide visual'}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    // 3. Table Graphic Frame
    if (shape.type === 'table' && shape.table) {
      const colWidths = shape.table.colWidthsPercent;
      return (
        <div
          key={shape.id}
          style={posStyle}
          className="overflow-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-sm p-1"
        >
          <table className="w-full h-full text-xs border-collapse table-fixed">
            {colWidths && colWidths.length > 0 && (
              <colgroup>
                {colWidths.map((w, idx) => (
                  <col key={idx} style={{ width: `${w}%` }} />
                ))}
              </colgroup>
            )}
            <tbody>
              {shape.table.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={
                    rIdx === 0
                      ? 'bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-300 dark:border-slate-700'
                      : 'border-b border-slate-200 dark:border-slate-800/80'
                  }
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      colSpan={cell.colSpan}
                      rowSpan={cell.rowSpan}
                      style={{
                        backgroundColor: cell.bgColor,
                        verticalAlign: cell.verticalAlign || 'middle',
                        fontSize: getProportionalFontSize(11)
                      }}
                      className={`p-1.5 text-slate-800 dark:text-slate-200 text-${
                        cell.align || 'left'
                      } ${cell.bold ? 'font-bold' : ''}`}
                    >
                      {cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 4. Standard Text Shape / Title / Subtitle / Body / Shapes with text
    return (
      <div key={shape.id} style={posStyle} className="p-0.5 sm:p-1 box-border select-text">
        {shape.paragraphs.map((p, pIdx) => {
          const isBullet = p.isBullet;
          return (
            <div
              key={pIdx}
              className={`leading-snug my-0.5 ${
                p.align === 'center'
                  ? 'text-center'
                  : p.align === 'right'
                  ? 'text-right'
                  : p.align === 'justify'
                  ? 'text-justify'
                  : 'text-left'
              } ${isBullet ? 'flex items-start gap-1.5' : ''}`}
              style={{ paddingLeft: p.level ? `${p.level * 1.25}rem` : undefined }}
            >
              {isBullet && (
                <span
                  style={{
                    color: p.bulletColor || '#D97706',
                    fontSize: getProportionalFontSize(12)
                  }}
                  className="font-bold shrink-0 mt-0.5 select-none"
                >
                  {p.bulletChar || '•'}
                </span>
              )}
              <div className="flex-1 min-w-0">
                {p.runs.map((r, rIdx) => {
                  const defaultSize = shape.type === 'title' ? 32 : shape.type === 'subtitle' ? 20 : 14;
                  return (
                    <span
                      key={rIdx}
                      style={{
                        color: r.color,
                        fontSize: getProportionalFontSize(r.fontSize, defaultSize),
                        fontWeight: r.bold ? 700 : 400,
                        fontStyle: r.italic ? 'italic' : 'normal',
                        textDecoration: r.underline
                          ? 'underline'
                          : r.strikethrough
                          ? 'line-through'
                          : 'none',
                        verticalAlign: r.superscript ? 'super' : r.subscript ? 'sub' : undefined,
                        fontFamily: r.fontFamily ? `${r.fontFamily}, sans-serif` : undefined
                      }}
                      className={
                        shape.type === 'title' && !r.fontSize
                          ? 'font-extrabold tracking-tight'
                          : ''
                      }
                    >
                      {r.text}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
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

          <span className="text-xs text-slate-400 truncate max-w-[150px] sm:max-w-xs hidden sm:inline">
            {presentation?.title || activeFilename}
          </span>
        </div>

        {/* Center View Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('slide')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'slide'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Slide Canvas</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid Sorter</span>
          </button>

          <button
            onClick={() => setViewMode('outline')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'outline'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Outline</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Render Mode Switcher for Slide View */}
          {viewMode === 'slide' && (
            <div className="hidden lg:flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800 text-[11px]">
              <button
                onClick={() => setRenderMode('canvas')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  renderMode === 'canvas' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
                }`}
                title="True visual layout mode"
              >
                Canvas
              </button>
              <button
                onClick={() => setRenderMode('structured')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  renderMode === 'structured' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400'
                }`}
                title="Structured reading mode"
              >
                Flow
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          {viewMode === 'slide' && (
            <div className="hidden md:flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded-md border border-slate-800 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="font-mono text-[10px] text-slate-300 min-w-[32px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              {zoomLevel !== 100 && (
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setShowNotes(prev => !prev)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              showNotes
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
            }`}
            title="Toggle Speaker Notes Drawer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Copy Slide Text */}
          <button
            onClick={handleCopySlideText}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            title="Copy current slide text"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
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
                    className={`cursor-pointer rounded-xl p-2 border transition-all transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-slate-400">
                      <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        {sd.slideNumber}
                      </span>
                      <span className="truncate max-w-[90px] text-slate-500">{sd.shapes.length} shapes</span>
                    </div>

                    {/* Mini Visual Slide Canvas Preview */}
                    <div
                      className="aspect-[16/9] w-full rounded-md border border-slate-700/80 p-2 flex flex-col justify-between overflow-hidden relative shadow-inner bg-white text-slate-900"
                      style={{
                        backgroundColor: sd.backgroundColor || '#FFFFFF',
                        color: sd.isDarkBackground ? '#F8FAFC' : '#0F172A'
                      }}
                    >
                      <div className="text-[10px] font-bold line-clamp-1 leading-tight">
                        {sd.title}
                      </div>
                      <div className="text-[8px] opacity-75 line-clamp-2 leading-tight">
                        {sd.rawText.slice(1).join(' · ') || 'Slide content'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Center Presentation Stage */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto bg-slate-950 items-center justify-center p-2 sm:p-4 lg:p-6 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-200">Rendering Presentation Deck...</p>
              <p className="text-xs text-slate-500">Decoding master layouts, themes, shape matrices, and typography</p>
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
              {/* High-Fidelity Slide Canvas Container with Container Queries */}
              <div
                className={`w-full ${
                  presentation?.aspectRatio === '4:3' ? 'aspect-[4/3] max-w-3xl' : 'aspect-[16/9]'
                } max-h-[78vh] rounded-2xl border border-slate-700/80 shadow-2xl relative overflow-hidden transition-transform duration-150 [container-type:inline-size]`}
                style={{
                  backgroundColor: currentSlide.backgroundColor || '#FFFFFF',
                  backgroundImage: currentSlide.backgroundImageUrl
                    ? `url(${currentSlide.backgroundImageUrl})`
                    : currentSlide.backgroundGradient
                    ? `linear-gradient(${currentSlide.backgroundGradient.angle || 90}deg, ${currentSlide.backgroundGradient.stops
                        .map(s => `${s.color} ${s.position}%`)
                        .join(', ')})`
                    : undefined,
                  backgroundSize: 'cover',
                  transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                  transformOrigin: 'center center',
                  color: currentSlide.isDarkBackground ? '#F8FAFC' : '#0F172A'
                }}
              >
                {/* Render Mode A: Original Canvas Coordinate Layout (Edge to edge bounds) */}
                {renderMode === 'canvas' && currentSlide.shapes.length > 0 ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {/* Render all positioned shapes at their exact coordinate transforms */}
                    {currentSlide.shapes.map(shape => renderCanvasShape(shape))}

                    {/* Bottom Status Tag */}
                    <div className="absolute bottom-2.5 right-4 text-[10px] font-mono opacity-60 select-none pointer-events-none z-10">
                      {currentSlide.slideNumber} / {slides.length}
                    </div>
                  </div>
                ) : (
                  /* Render Mode B: Structured Flow Mode */
                  <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-current/20">
                          Slide {currentSlide.slideNumber} of {slides.length}
                        </span>
                        {currentSlide.subtitle && (
                          <span className="text-xs font-medium opacity-75">
                            {currentSlide.subtitle}
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-6">
                        {currentSlide.title}
                      </h2>

                      {/* Body Content Bullets & Shapes */}
                      <div className="space-y-3 max-w-3xl">
                        {currentSlide.shapes.map(sh => (
                          <div key={sh.id} className="space-y-1.5">
                            {sh.paragraphs.map((p, pIdx) => (
                              <div
                                key={pIdx}
                                className={`text-sm sm:text-base leading-relaxed ${
                                  p.isBullet ? 'flex items-start gap-2.5' : ''
                                }`}
                              >
                                {p.isBullet && (
                                  <span className="text-amber-500 font-bold shrink-0 mt-1">
                                    {p.bulletChar || '•'}
                                  </span>
                                )}
                                <span>{p.text}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Embedded Table if any */}
                      {currentSlide.table && (
                        <div className="mt-6 overflow-auto rounded-xl border border-current/20 shadow-sm">
                          <table className="w-full text-xs sm:text-sm border-collapse">
                            <tbody>
                              {currentSlide.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx === 0 ? 'font-bold border-b border-current/20' : 'border-b border-current/10'}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2.5">
                                      {cell.text}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-current/10 text-xs opacity-60">
                      <span>{presentation?.title}</span>
                      <span>Press Arrow Keys or Space to Navigate</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Presentation Control Bar */}
              <div className="flex items-center justify-between w-full max-w-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous slide (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                    disabled={currentSlideIndex >= slides.length - 1}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next slide (Right Arrow / Space)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    Slide {currentSlideIndex + 1} / {slides.length}
                  </span>
                </div>

                {/* Presenter Timer Control */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-200">{formatTimer(elapsedSeconds)}</span>
                  <button
                    onClick={() => setTimerRunning(prev => !prev)}
                    className="text-slate-400 hover:text-white cursor-pointer ml-1"
                    title={timerRunning ? 'Pause Timer' : 'Start Timer'}
                  >
                    {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => setElapsedSeconds(0)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Sorter View Mode */
            <div className="w-full max-w-6xl overflow-y-auto p-4 flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Slide Sorter Deck</h3>
                  <p className="text-xs text-slate-400">Click any slide thumbnail to inspect in full visual canvas mode</p>
                </div>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search slides..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                      className={`cursor-pointer bg-slate-900 border rounded-2xl p-4.5 hover:border-amber-500 transition-all transform hover:-translate-y-1 shadow-lg ${
                        isSelected ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-2 text-slate-400">
                        <span className="font-bold text-amber-400">Slide {sd.slideNumber}</span>
                        <span className="text-[11px] text-slate-500">{sd.shapes.length} elements</span>
                      </div>

                      <div
                        className="aspect-[16/9] w-full rounded-xl border border-slate-700/80 p-3.5 flex flex-col justify-between overflow-hidden shadow-inner mb-3 bg-white text-slate-900"
                        style={{
                          backgroundColor: sd.backgroundColor || '#FFFFFF',
                          color: sd.isDarkBackground ? '#F8FAFC' : '#0F172A'
                        }}
                      >
                        <h4 className="text-xs font-bold line-clamp-2 leading-tight">
                          {sd.title}
                        </h4>
                        <div className="text-[9px] opacity-75 line-clamp-3 leading-relaxed">
                          {sd.rawText.slice(1).join(' · ') || 'Slide details'}
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 font-medium truncate">
                        {sd.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Outline Reader Mode */
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 overflow-y-auto flex-1 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Presentation Deck Outline</h3>
                  <p className="text-xs text-slate-400">Complete extracted textual hierarchy and speaker notes</p>
                </div>
                <button
                  onClick={handleCopyOutline}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied Outline' : 'Copy All Text'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {slides.map(sd => (
                  <div key={sd.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-semibold">
                      <span>Slide {sd.slideNumber}</span>
                      {sd.subtitle && <span className="text-slate-400 italic font-sans">{sd.subtitle}</span>}
                    </div>
                    <h4 className="text-base font-bold text-slate-100">{sd.title}</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pl-2">
                      {sd.rawText.slice(1).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                    {sd.notes && (
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90">
                        <span className="font-bold block mb-0.5">Speaker Notes:</span>
                        {sd.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Right Speaker Notes Drawer */}
        {showNotes && currentSlide && viewMode === 'slide' && (
          <aside className="w-64 sm:w-72 lg:w-80 bg-slate-900/95 border-l border-slate-800 flex flex-col min-h-0 shrink-0 z-5 shadow-2xl">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Speaker Notes</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Slide {currentSlide.slideNumber}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed text-slate-300">
              {currentSlide.notes ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 whitespace-pre-wrap">
                  {currentSlide.notes}
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  No presenter notes recorded for this slide in the presentation.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
