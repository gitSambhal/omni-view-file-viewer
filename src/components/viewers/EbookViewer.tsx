/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Type,
  Sun,
  Moon,
  Coffee,
  Sparkles,
  ListOrdered,
  FileText,
  Clock,
  BookMarked,
  Share2,
  Check,
  ScrollText,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { parseEpub, EpubBook, EpubChapter } from '../../services/epubParser';

interface EbookViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

type ReadingTheme = 'paper' | 'sepia' | 'dark' | 'night';
type FontFamily = 'serif' | 'sans' | 'mono' | 'dyslexic';
type LineHeight = 'compact' | 'normal' | 'relaxed';
type MaxWidth = 'narrow' | 'medium' | 'wide' | 'full';

export const EbookViewer: React.FC<EbookViewerProps> = ({ arrayBuffer, textContent, filename }) => {
  const [book, setBook] = useState<EpubBook | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation & Reading State
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Reader Preferences (Persisted locally per user)
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('omniview_epub_fontSize');
    return saved ? parseInt(saved, 10) : 16;
  });
  const [theme, setTheme] = useState<ReadingTheme>(() => {
    const saved = localStorage.getItem('omniview_epub_theme');
    return (saved as ReadingTheme) || 'paper';
  });
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    const saved = localStorage.getItem('omniview_epub_fontFamily');
    return (saved as FontFamily) || 'serif';
  });
  const [lineHeight, setLineHeight] = useState<LineHeight>('normal');
  const [maxWidth, setMaxWidth] = useState<MaxWidth>('medium');
  const [isContinuousScroll, setIsContinuousScroll] = useState<boolean>(false);

  // Audio Text-to-Speech
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`omniview_bookmarks_${filename}`);
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const contentContainerRef = useRef<HTMLDivElement | null>(null);
  const rootContainerRef = useRef<HTMLDivElement | null>(null);

  // Parse EPUB on mount or when data changes
  useEffect(() => {
    let isCancelled = false;

    async function loadBook() {
      setLoading(true);
      setError(null);
      try {
        let parsed: EpubBook;
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          parsed = await parseEpub(arrayBuffer);
        } else if (textContent) {
          parsed = await parseEpub(textContent);
        } else {
          throw new Error('No readable data available for this e-book.');
        }

        if (!isCancelled) {
          setBook(parsed);
          // Restore last read position
          const savedPos = localStorage.getItem(`omniview_lastChapter_${filename}`);
          if (savedPos) {
            const idx = parseInt(savedPos, 10);
            if (!isNaN(idx) && idx >= 0 && idx < parsed.chapters.length) {
              setCurrentChapterIndex(idx);
            }
          }
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to parse e-book:', err);
        if (!isCancelled) {
          setError(err.message || 'Failed to parse EPUB archive structure.');
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      isCancelled = true;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [arrayBuffer, textContent, filename]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('omniview_epub_fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('omniview_epub_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('omniview_epub_fontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    if (book) {
      localStorage.setItem(`omniview_lastChapter_${filename}`, currentChapterIndex.toString());
    }
  }, [currentChapterIndex, book, filename]);

  // Save Bookmarks
  const toggleBookmark = (idx: number) => {
    setBookmarks(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx].sort((a, b) => a - b);
      localStorage.setItem(`omniview_bookmarks_${filename}`, JSON.stringify(next));
      return next;
    });
  };

  // Scroll to top when chapter changes in chapter mode
  useEffect(() => {
    if (!isContinuousScroll && contentContainerRef.current) {
      contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapterIndex, isContinuousScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in search input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'PageUp') {
        handlePrevChapter();
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'PageDown') {
        handleNextChapter();
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, currentChapterIndex]);

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      stopAudio();
    }
  };

  const handleNextChapter = () => {
    if (book && currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      stopAudio();
    }
  };

  // Text-To-Speech
  const toggleAudio = () => {
    if (!('speechSynthesis' in window) || !book) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const currentChapter = book.chapters[currentChapterIndex];
      if (!currentChapter) return;

      const utterance = new SpeechSynthesisUtterance(currentChapter.rawText.substring(0, 8000));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis && isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  // Search Results across chapters
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || !book) return [];
    const query = searchTerm.toLowerCase().trim();
    return book.chapters
      .map((ch, idx) => {
        const matches = (ch.rawText.toLowerCase().match(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        return { chapterIndex: idx, title: ch.title, count: matches };
      })
      .filter(item => item.count > 0);
  }, [searchTerm, book]);

  // Current Active Chapter
  const currentChapter: EpubChapter | undefined = book?.chapters[currentChapterIndex];

  // Theme Styles Configuration
  const themeStyles = {
    paper: {
      wrapperBg: 'bg-stone-100 dark:bg-stone-900',
      canvasBg: 'bg-white',
      textColor: 'text-stone-900',
      headingColor: 'text-stone-950',
      borderColor: 'border-stone-200',
      mutedText: 'text-stone-500',
      headerBg: 'bg-white/95 border-b border-stone-200 text-stone-800',
      sidebarBg: 'bg-stone-50 border-r border-stone-200 text-stone-800',
      activeChapterBg: 'bg-stone-200/80 text-stone-900 font-semibold'
    },
    sepia: {
      wrapperBg: 'bg-[#f4ebd0]',
      canvasBg: 'bg-[#fcf5e5]',
      textColor: 'text-[#433422]',
      headingColor: 'text-[#2e2213]',
      borderColor: 'border-[#ebd9b3]',
      mutedText: 'text-[#876e4b]',
      headerBg: 'bg-[#fcf5e5]/95 border-b border-[#ebd9b3] text-[#433422]',
      sidebarBg: 'bg-[#f4ebd0] border-r border-[#ebd9b3] text-[#433422]',
      activeChapterBg: 'bg-[#ebd9b3] text-[#2e2213] font-semibold'
    },
    dark: {
      wrapperBg: 'bg-[#0f172a]',
      canvasBg: 'bg-[#1e293b]',
      textColor: 'text-[#cbd5e1]',
      headingColor: 'text-[#f8fafc]',
      borderColor: 'border-slate-700',
      mutedText: 'text-slate-400',
      headerBg: 'bg-[#1e293b]/95 border-b border-slate-700 text-slate-200',
      sidebarBg: 'bg-[#0f172a] border-r border-slate-800 text-slate-300',
      activeChapterBg: 'bg-slate-800 text-white font-semibold'
    },
    night: {
      wrapperBg: 'bg-[#000000]',
      canvasBg: 'bg-[#09090b]',
      textColor: 'text-[#d4d4d8]',
      headingColor: 'text-[#fafafa]',
      borderColor: 'border-zinc-800',
      mutedText: 'text-zinc-500',
      headerBg: 'bg-[#09090b]/95 border-b border-zinc-800 text-zinc-200',
      sidebarBg: 'bg-[#000000] border-r border-zinc-800 text-zinc-300',
      activeChapterBg: 'bg-zinc-800 text-white font-semibold'
    }
  }[theme];

  // Font family css class
  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
    dyslexic: 'font-sans tracking-wide'
  }[fontFamily];

  // Max width constraint class
  const maxWidthClass = {
    narrow: 'max-w-xl',
    medium: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'max-w-none'
  }[maxWidth];

  // Line height styling
  const lineHeightVal = {
    compact: 1.5,
    normal: 1.8,
    relaxed: 2.1
  }[lineHeight];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-0 min-w-0 transition-colors">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Decompressing E-Book Container...</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Parsing OPF spine, manifest, chapter XHTML, and TOC structure</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-center min-h-0 min-w-0 transition-colors">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Could Not Open E-Book</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          {error || 'This file could not be parsed as a valid EPUB or document archive.'}
        </p>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(currentChapterIndex);
  const totalChapters = book.chapters.length;
  const progressPercent = Math.round(((currentChapterIndex + 1) / totalChapters) * 100);

  return (
    <div
      ref={rootContainerRef}
      className={`flex flex-col flex-1 h-full min-h-0 min-w-0 ${themeStyles.wrapperBg} transition-colors duration-150 overflow-hidden relative select-text ${
        isFullscreen ? 'fixed inset-0 z-[99999]' : ''
      }`}
    >
      {/* Scoped CSS styling for EPUB Chapter Content */}
      <style>{`
        .epub-rendered-content {
          width: 100%;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .epub-rendered-content img, .epub-rendered-content svg, .epub-rendered-content image {
          max-width: 100% !important;
          height: auto !important;
          display: block;
          margin: 1.5rem auto;
          border-radius: 0.5rem;
        }
        .epub-rendered-content pre {
          max-width: 100%;
          overflow-x: auto;
          padding: 1rem;
          border-radius: 0.5rem;
          background-color: rgba(0, 0, 0, 0.06);
          font-family: ui-monospace, monospace;
          margin: 1.25rem 0;
        }
        .epub-rendered-content code {
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          background-color: rgba(0, 0, 0, 0.06);
        }
        .epub-rendered-content table {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          display: block;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .epub-rendered-content th, .epub-rendered-content td {
          border: 1px solid rgba(128, 128, 128, 0.2);
          padding: 0.5rem 0.75rem;
        }
        .epub-rendered-content p {
          margin-bottom: 1.25em;
          line-height: inherit;
        }
        .epub-rendered-content h1, .epub-rendered-content h2, .epub-rendered-content h3, .epub-rendered-content h4, .epub-rendered-content h5, .epub-rendered-content h6 {
          font-weight: 700;
          margin-top: 1.75em;
          margin-bottom: 0.75em;
          line-height: 1.3;
        }
        .epub-rendered-content blockquote {
          border-left: 4px solid #3b82f6;
          margin: 1.5rem 0;
          padding: 0.5rem 1rem;
          font-style: italic;
          opacity: 0.9;
        }
        .epub-rendered-content ul, .epub-rendered-content ol {
          margin: 1em 0;
          padding-left: 1.75em;
        }
        .epub-rendered-content ul {
          list-style-type: disc;
        }
        .epub-rendered-content ol {
          list-style-type: decimal;
        }
        .epub-rendered-content li {
          margin-bottom: 0.5em;
        }
      `}</style>

      {/* 1. Header Toolbar */}
      <header className={`flex items-center justify-between px-3 py-2 ${themeStyles.headerBg} backdrop-blur-md shadow-2xs z-30 shrink-0 gap-2`}>
        {/* Left: Table of Contents & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              isSidebarOpen ? 'bg-black/10 dark:bg-white/15 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="Toggle Table of Contents (TOC)"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xs md:text-sm font-semibold truncate max-w-xs md:max-w-md">
              {book.metadata.title}
            </h1>
            <p className={`text-[10px] ${themeStyles.mutedText} truncate`}>
              {book.metadata.creator} • {isContinuousScroll ? 'Full Book Scroll' : `Chapter ${currentChapterIndex + 1} of ${totalChapters}`} ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Right: Search, Audio, Appearance, Mode, Fullscreen, Bookmarks */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Continuous Scroll Toggle */}
          <button
            onClick={() => setIsContinuousScroll(!isContinuousScroll)}
            className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isContinuousScroll
                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={isContinuousScroll ? 'Switch to Chapter by Chapter Mode' : 'Switch to Continuous Full Book Mode'}
          >
            {isContinuousScroll ? <ScrollText className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isContinuousScroll ? 'Full Book' : 'By Chapter'}</span>
          </button>

          {/* Chapter Quick Switcher (when in chapter mode) */}
          {!isContinuousScroll && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIndex === 0}
                className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Previous Chapter (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1">
                {currentChapterIndex + 1} / {totalChapters}
              </span>
              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === totalChapters - 1}
                className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Next Chapter (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(currentChapterIndex)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-500 bg-amber-500/10'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-500'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this chapter'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Audio Read Aloud */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isPlayingAudio
                ? 'bg-blue-600 text-white animate-pulse'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-500'
            }`}
            title={isPlayingAudio ? 'Stop Read Aloud' : 'Read Aloud (Text-to-Speech)'}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Appearance Settings Popover Toggle */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              isSettingsOpen ? 'bg-black/10 dark:bg-white/15 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="Typography & Appearance Settings"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-500"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader Mode (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Reading Settings Dropdown Popover */}
      {isSettingsOpen && (
        <div className="absolute right-3 top-13 w-84 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-4 space-y-4 animate-in fade-in zoom-in-95 text-xs text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-500" />
              Reader Appearance
            </span>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Color Palette</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setTheme('paper')}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer bg-white text-slate-900 ${
                  theme === 'paper' ? 'border-blue-500 ring-2 ring-blue-500/20 font-bold' : 'border-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 mx-auto mb-1 text-amber-500" />
                <span className="text-[10px]">Paper</span>
              </button>

              <button
                onClick={() => setTheme('sepia')}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer bg-[#fcf5e5] text-[#433422] ${
                  theme === 'sepia' ? 'border-amber-600 ring-2 ring-amber-600/20 font-bold' : 'border-[#ebd9b3]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 mx-auto mb-1 text-amber-700" />
                <span className="text-[10px]">Sepia</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer bg-[#1e293b] text-slate-200 ${
                  theme === 'dark' ? 'border-blue-500 ring-2 ring-blue-500/20 font-bold' : 'border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5 mx-auto mb-1 text-blue-400" />
                <span className="text-[10px]">Slate</span>
              </button>

              <button
                onClick={() => setTheme('night')}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer bg-black text-zinc-200 ${
                  theme === 'night' ? 'border-zinc-500 ring-2 ring-zinc-500/20 font-bold' : 'border-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-400" />
                <span className="text-[10px]">OLED</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Font Size</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize(s => Math.max(12, s - 1))}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="12"
                max="28"
                value={fontSize}
                onChange={e => setFontSize(parseInt(e.target.value, 10))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <button
                onClick={() => setFontSize(s => Math.min(28, s + 1))}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Typeface</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['serif', 'sans', 'mono', 'dyslexic'] as FontFamily[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f)}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer capitalize ${
                    fontFamily === f
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={f === 'serif' ? 'font-serif' : f === 'mono' ? 'font-mono' : 'font-sans'}>
                    {f}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Column Width */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Reading Width</label>
            <div className="grid grid-cols-4 gap-1">
              {(['narrow', 'medium', 'wide', 'full'] as MaxWidth[]).map(w => (
                <button
                  key={w}
                  onClick={() => setMaxWidth(w)}
                  className={`py-1 px-1 rounded-md text-[10px] text-center border capitalize cursor-pointer ${
                    maxWidth === w
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {w === 'full' ? 'Full Page' : w}
                </button>
              ))}
            </div>
          </div>

          {/* Line Height Spacing */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Line Spacing</label>
            <div className="grid grid-cols-3 gap-1">
              {(['compact', 'normal', 'relaxed'] as LineHeight[]).map(lh => (
                <button
                  key={lh}
                  onClick={() => setLineHeight(lh)}
                  className={`py-1 px-1 rounded-md text-[10px] text-center border capitalize cursor-pointer ${
                    lineHeight === lh
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace: Sidebar + Reader Body */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* Left Drawer: Table of Contents, Bookmarks, Metadata */}
        {isSidebarOpen && (
          <aside className={`w-80 md:w-88 ${themeStyles.sidebarBg} flex flex-col shrink-0 z-20 shadow-xl overflow-hidden animate-in slide-in-from-left duration-200`}>
            {/* Sidebar Header */}
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-500" />
                Table of Contents
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Book Info Header */}
            <div className="p-3 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-2">
              <div className="flex items-start gap-2.5">
                {book.metadata.coverUrl ? (
                  <img
                    src={book.metadata.coverUrl || undefined}
                    alt="Cover"
                    className="w-12 h-16 object-cover rounded-md shadow-xs border border-black/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-16 bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-bold text-xs truncate leading-snug">{book.metadata.title}</h2>
                  <p className="text-[11px] opacity-75 truncate">{book.metadata.creator}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] opacity-60 font-mono">
                    <span>{book.metadata.totalWords.toLocaleString()} words</span>
                    <span>•</span>
                    <span>~{book.metadata.readingTimeMin} min</span>
                  </div>
                </div>
              </div>

              {/* Search Inside Book */}
              <div className="relative pt-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-3.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search in book..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* TOC Items or Search Results */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {searchTerm ? (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold opacity-60">
                    Search Results ({searchResults.reduce((acc, r) => acc + r.count, 0)} matches)
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs opacity-60 italic">No matches found.</div>
                  ) : (
                    searchResults.map(res => (
                      <button
                        key={res.chapterIndex}
                        onClick={() => {
                          setCurrentChapterIndex(res.chapterIndex);
                          setIsSidebarOpen(false);
                          if (isContinuousScroll) {
                            const el = document.getElementById(`chapter-section-${res.chapterIndex}`);
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-xs flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate pr-2">{res.title}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-mono shrink-0">
                          {res.count} {res.count === 1 ? 'match' : 'matches'}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <>
                  {/* Bookmarked Chapters */}
                  {bookmarks.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-black/10 dark:border-white/10">
                      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider opacity-60 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-amber-500" />
                        <span>Bookmarks ({bookmarks.length})</span>
                      </div>
                      {bookmarks.map(bmIdx => (
                        <button
                          key={`bm-${bmIdx}`}
                          onClick={() => {
                            setCurrentChapterIndex(bmIdx);
                            setIsSidebarOpen(false);
                            if (isContinuousScroll) {
                              const el = document.getElementById(`chapter-section-${bmIdx}`);
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate text-amber-600 dark:text-amber-400 font-medium">
                            {book.chapters[bmIdx]?.title || `Chapter ${bmIdx + 1}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chapter List */}
                  {book.chapters.map((chapter, idx) => {
                    const isActive = idx === currentChapterIndex;
                    return (
                      <button
                        key={chapter.id || idx}
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setIsSidebarOpen(false);
                          stopAudio();
                          if (isContinuousScroll) {
                            const el = document.getElementById(`chapter-section-${idx}`);
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? themeStyles.activeChapterBg
                            : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium truncate">{chapter.title}</div>
                          <div className="text-[10px] opacity-60 font-mono mt-0.5">
                            {chapter.wordCount.toLocaleString()} words
                          </div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </aside>
        )}

        {/* Main Content Canvas Container */}
        <main
          ref={contentContainerRef}
          className={`flex-1 overflow-y-auto px-2 py-4 sm:px-6 sm:py-8 md:px-10 md:py-10 min-h-0 min-w-0 ${themeStyles.wrapperBg}`}
        >
          <div
            className={`w-full ${maxWidthClass} mx-auto ${themeStyles.canvasBg} ${themeStyles.borderColor} border rounded-2xl shadow-sm p-5 sm:p-8 md:p-12 transition-all duration-150 relative min-h-fit box-border`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeightVal
            }}
          >
            {isContinuousScroll ? (
              /* Continuous Full Book Reading Mode */
              <div className="space-y-16">
                {book.chapters.map((ch, idx) => (
                  <section key={ch.id || idx} id={`chapter-section-${idx}`} className="space-y-6">
                    <div className={`pb-4 border-b ${themeStyles.borderColor} flex items-center justify-between`}>
                      <div>
                        <span className={`text-xs font-mono uppercase tracking-wider ${themeStyles.mutedText}`}>
                          Chapter {idx + 1} of {totalChapters}
                        </span>
                        <h2 className={`text-xl md:text-2xl font-bold mt-1 ${themeStyles.headingColor} ${fontClass}`}>
                          {ch.title}
                        </h2>
                      </div>
                      <span className={`text-xs ${themeStyles.mutedText} font-mono hidden sm:inline`}>
                        {ch.wordCount.toLocaleString()} words
                      </span>
                    </div>

                    <article
                      className={`epub-rendered-content ${themeStyles.textColor} ${fontClass}`}
                      dangerouslySetInnerHTML={{ __html: ch.contentHtml }}
                    />
                  </section>
                ))}
              </div>
            ) : (
              /* Chapter by Chapter Reading Mode */
              <div className="flex flex-col min-h-full justify-between">
                <div>
                  {/* Chapter Header */}
                  {currentChapter && (
                    <div className={`pb-6 mb-8 border-b ${themeStyles.borderColor} flex items-center justify-between`}>
                      <div>
                        <span className={`text-xs font-mono uppercase tracking-wider ${themeStyles.mutedText}`}>
                          Chapter {currentChapterIndex + 1} of {totalChapters}
                        </span>
                        <h1 className={`text-xl md:text-2xl font-bold mt-1 ${themeStyles.headingColor} ${fontClass}`}>
                          {currentChapter.title}
                        </h1>
                      </div>

                      <div className={`text-right text-xs ${themeStyles.mutedText} font-mono hidden sm:block`}>
                        <div>{currentChapter.wordCount.toLocaleString()} words</div>
                        <div>~{Math.max(1, Math.ceil(currentChapter.wordCount / 220))} min read</div>
                      </div>
                    </div>
                  )}

                  {/* Chapter XHTML Rendered Body */}
                  {currentChapter && (
                    <article
                      className={`epub-rendered-content ${themeStyles.textColor} ${fontClass}`}
                      dangerouslySetInnerHTML={{ __html: currentChapter.contentHtml }}
                    />
                  )}
                </div>

                {/* Chapter Footer Navigation */}
                <div className={`mt-12 pt-8 border-t ${themeStyles.borderColor} flex flex-col sm:flex-row items-center justify-between gap-4 select-none`}>
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapterIndex === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ${themeStyles.borderColor} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Chapter</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs font-mono opacity-70">
                    <span>{progressPercent}% completed</span>
                  </div>

                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === totalChapters - 1}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs`}
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
