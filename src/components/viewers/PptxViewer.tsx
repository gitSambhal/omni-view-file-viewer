/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Universal Presentation Viewer (.pptx, .ppt, .odp, .pps, .ppsx, .key)
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
  FileSpreadsheet
} from 'lucide-react';
import { parsePresentation, ParsedPresentation, PresentationSlide } from '../../services/presentationParser';

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
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        if (textContent) {
          // If only text is available, render as single slide
          setPresentation({
            title: filename,
            format: 'presentation',
            formatLabel: 'Presentation Content',
            slideCount: 1,
            slides: [
              {
                id: 1,
                slideNumber: 1,
                title: filename.replace(/\.[^/.]+$/, ''),
                texts: textContent.split('\n').filter(Boolean),
                bullets: textContent.split('\n').slice(1).filter(Boolean)
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentation || presentation.slides.length === 0) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation]);

  const slides = presentation?.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Filtered slides for search
  const filteredSlides = useMemo(() => {
    if (!searchQuery.trim()) return slides;
    const q = searchQuery.toLowerCase();
    return slides.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.texts.some(t => t.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
    );
  }, [slides, searchQuery]);

  const handleCopySlideText = () => {
    if (!currentSlide) return;
    const textToCopy = `# ${currentSlide.title}\n\n` + currentSlide.bullets.map(b => `- ${b}`).join('\n');
    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllSlides = () => {
    if (!presentation) return;
    const fullText = presentation.slides
      .map(s => `## Slide ${s.slideNumber}: ${s.title}\n\n${s.bullets.map(b => `- ${b}`).join('\n')}\n`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(fullText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={stageRef}
      className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-950 text-slate-100 overflow-hidden select-none"
    >
      {/* Presentation Header Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 shrink-0">
            <Presentation className="w-3.5 h-3.5" />
            <span>{presentation?.formatLabel || 'Presentation'}</span>
          </div>

          {presentation && (
            <span className="hidden sm:inline-block text-xs text-slate-400 truncate font-mono">
              {presentation.slideCount} {presentation.slideCount === 1 ? 'slide' : 'slides'}
            </span>
          )}
        </div>

        {/* View Mode Switcher & Actions */}
        {slides.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search slides..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500 w-36 lg:w-48 transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('slide')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'slide'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Single Slide Presentation View"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Slide</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'outline'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title="Text Outline View"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Outline</span>
              </button>
            </div>

            <button
              onClick={handleCopySlideText}
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Copy current slide text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors hidden sm:flex"
              title="Full screen presentation mode"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-300">Extracting presentation slides...</p>
            <p className="text-xs text-slate-500">Decoding slides, layouts, and shapes in-memory</p>
          </div>
        ) : error || slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <Presentation className="w-12 h-12 text-amber-500/80 mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">Unable to Load Presentation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'No readable slide text records were detected in this presentation file.'}
            </p>
          </div>
        ) : viewMode === 'slide' && currentSlide ? (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-4 flex-1 justify-center min-h-0">
            {/* 16:9 Slide Stage */}
            <div className="w-full aspect-[16/9] max-h-[70vh] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden backdrop-blur-xs">
              {/* Top Gradient Banner */}
              <div
                className={`absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r ${
                  currentSlide.accentColor || 'from-amber-500 to-orange-500'
                }`}
              ></div>

              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    Slide {currentSlide.slideNumber} of {slides.length}
                  </span>
                  {presentation?.format && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {presentation.format.toUpperCase()}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h2>
              </div>

              {/* Body Text & Bullets */}
              <div className="my-auto space-y-3.5 max-h-64 overflow-y-auto pr-2">
                {currentSlide.bullets.length > 0 ? (
                  currentSlide.bullets.map((txt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-slate-200 text-sm sm:text-base leading-relaxed"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                      <span>{txt}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic text-sm">
                    {currentSlide.texts[0] || '[Empty slide content]'}
                  </div>
                )}
              </div>

              {/* Notes Drawer if present */}
              {currentSlide.notes && (
                <div className="mt-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Presenter Notes:</span> {currentSlide.notes}
                </div>
              )}

              {/* Footer Stamp */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="truncate max-w-[240px]">{filename}</span>
                <span className="font-mono">OmniView Presentation Reader</span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-lg">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                className="p-1.5 rounded-full hover:bg-slate-800 disabled:opacity-30 text-slate-200 cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Previous slide (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 px-3">
                <span className="text-xs font-mono font-semibold text-amber-400">
                  {currentSlideIndex + 1}
                </span>
                <span className="text-xs text-slate-400">/</span>
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
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View of all slides */
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">
                All Slides ({filteredSlides.length})
              </h3>
              <button
                onClick={handleCopyAllSlides}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy all slides text</span>
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
                    className={`cursor-pointer bg-slate-900 border rounded-xl p-4.5 hover:border-amber-500 transition-all transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px] ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/5'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold mb-2">
                        <span>Slide {sd.slideNumber}</span>
                        <span className="text-slate-400 font-normal">
                          {sd.bullets.length} bullets
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-100 text-sm line-clamp-2 mb-2">
                        {sd.title}
                      </h4>
                      <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                        {sd.bullets.join(' · ') || sd.texts.slice(1).join(' ') || 'Slide content'}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Click to present</span>
                      <Eye className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Outline View */
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">{presentation?.title || filename}</h3>
                <p className="text-xs text-slate-400">Extracted Presentation Outline & Text</p>
              </div>
              <button
                onClick={handleCopyAllSlides}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Full Outline</span>
              </button>
            </div>

            <div className="space-y-6">
              {slides.map(sd => (
                <div key={sd.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Slide {sd.slideNumber}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200">{sd.title}</h4>
                  </div>
                  {sd.bullets.length > 0 && (
                    <ul className="pl-6 space-y-1 list-disc text-xs text-slate-300">
                      {sd.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
