/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Professional PDF Reader & Security Decryption Engine
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  AlertTriangle,
  Sidebar,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Printer,
  Search,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  Bookmark,
  Check,
  RefreshCw,
  X,
  ChevronFirst,
  ChevronLast,
  ShieldCheck
} from 'lucide-react';

// Configure PDF.js worker with Vite asset bundle and CDN fallback
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfWorkerUrl || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  objectUrl?: string;
  arrayBuffer?: ArrayBuffer;
  filename: string;
}

interface DocMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  pdfFormatVersion?: string;
  isEncrypted?: boolean;
}

interface OutlineItem {
  title: string;
  dest?: any;
  items?: OutlineItem[];
}

interface SearchMatch {
  pageIndex: number;
  matchCount: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ objectUrl, arrayBuffer, filename }) => {
  // Document State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInputVal, setPageInputVal] = useState<string>('1');
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Decryption & Security State
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const savedPasswordRef = useRef<string>('');

  // HiDPI Quality Rendering State
  const [qualityMode, setQualityMode] = useState<'ultra' | 'high' | 'standard'>('ultra');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  // Sidebar & Navigation Panels
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'pages' | 'outline' | 'info'>('pages');
  const [docOutline, setDocOutline] = useState<OutlineItem[]>([]);
  const [metadata, setMetadata] = useState<DocMetadata | null>(null);

  // In-Document Search State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [currentSearchMatchIndex, setCurrentSearchMatchIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Viewer Layout & Blob URLs
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const renderInProgressRef = useRef<boolean>(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  // Track rendered page dimensions for stable DOM container sizing
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Sync page input display when currentPage changes
  useEffect(() => {
    setPageInputVal(String(currentPage));
  }, [currentPage]);

  // Manage Blob URL for export and print
  useEffect(() => {
    let createdUrl: string | null = null;
    if (objectUrl) {
      setPdfBlobUrl(objectUrl);
    } else if (arrayBuffer && arrayBuffer.byteLength > 0) {
      try {
        const blob = new Blob([arrayBuffer.slice(0)], { type: 'application/pdf' });
        createdUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(createdUrl);
      } catch (e) {
        console.warn('Error generating pdf blob url:', e);
      }
    }
    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [objectUrl, arrayBuffer]);

  // Load and Decrypt PDF Document
  const loadPdf = useCallback(
    async (passwordToTry?: string) => {
      try {
        setLoading(true);
        setError(null);
        setPasswordError(null);

        let rawBuffer: ArrayBuffer | undefined;

        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          rawBuffer = arrayBuffer.slice(0);
        } else if (objectUrl) {
          const res = await fetch(objectUrl);
          rawBuffer = await res.arrayBuffer();
        }

        if (!rawBuffer || rawBuffer.byteLength === 0) {
          throw new Error('No PDF byte data accessible.');
        }

        const effectivePassword =
          passwordToTry !== undefined
            ? passwordToTry
            : savedPasswordRef.current
            ? savedPasswordRef.current
            : undefined;

        // Configure loading task with standard fonts, CMap paths, and password
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(rawBuffer.slice(0)),
          password: effectivePassword,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
          enableXfa: true
        });

        const doc = await loadingTask.promise;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsPasswordRequired(false);
        setPasswordError(null);
        setError(null);
        if (effectivePassword) {
          savedPasswordRef.current = effectivePassword;
          setIsEncrypted(true);
        }

        // Extract metadata & security details
        try {
          const meta = await doc.getMetadata();
          const info = (meta?.info as Record<string, any>) || {};
          setMetadata({
            title: info.Title || undefined,
            author: info.Author || undefined,
            subject: info.Subject || undefined,
            creator: info.Creator || undefined,
            producer: info.Producer || undefined,
            creationDate: info.CreationDate || undefined,
            pdfFormatVersion: info.PDFFormatVersion || undefined,
            isEncrypted: info.IsAcroFormPresent || isEncrypted || !!effectivePassword
          });
        } catch (_) {}

        // Extract outline (Table of Contents)
        try {
          const outline = await doc.getOutline();
          if (outline && outline.length > 0) {
            setDocOutline(outline);
          } else {
            setDocOutline([]);
          }
        } catch (_) {
          setDocOutline([]);
        }
      } catch (err: any) {
        console.warn('PDF Loading status:', err);

        // Check if error is due to password requirement or incorrect password
        const isPwException =
          err.name === 'PasswordException' ||
          err.code === 1 ||
          err.code === 2 ||
          err.message?.toLowerCase().includes('password');

        if (isPwException) {
          setIsEncrypted(true);
          setIsPasswordRequired(true);
          if (err.code === 2 || err.message?.toLowerCase().includes('incorrect')) {
            setPasswordError('Incorrect password. Please verify and try again.');
          } else {
            setPasswordError(null);
          }
          setTimeout(() => passwordInputRef.current?.focus(), 100);
        } else {
          setError(err.message || 'Could not parse PDF document.');
        }
      } finally {
        setLoading(false);
        setIsDecrypting(false);
      }
    },
    [arrayBuffer, objectUrl]
  );

  // Initial load
  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  // Handle password submission to decrypt document
  const handleUnlockSubmit = async (e?: React.FormEvent, directPassword?: string) => {
    if (e) e.preventDefault();
    const pw = directPassword !== undefined ? directPassword : passwordInput;
    if (!pw.trim() && pw.length === 0) {
      setPasswordError('Please enter a password.');
      return;
    }
    setIsDecrypting(true);
    setPasswordError(null);
    savedPasswordRef.current = pw;
    await loadPdf(pw);
  };

  // Re-lock document
  const handleRelockDocument = () => {
    savedPasswordRef.current = '';
    setPasswordInput('');
    setIsPasswordRequired(true);
    setPdfDoc(null);
    setPasswordError(null);
  };

  // High-Quality HiDPI Page Rendering
  useEffect(() => {
    if (!pdfDoc || isPasswordRequired) return;

    let isCancelled = false;

    async function renderPage() {
      // Small frame delay to ensure canvas DOM element is attached after decrypt unlock transition
      await new Promise(r => requestAnimationFrame(r));
      if (isCancelled) return;

      if (!canvasRef.current) {
        await new Promise(r => requestAnimationFrame(r));
        if (isCancelled || !canvasRef.current) return;
      }

      // Cancel previous render task safely
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }

      try {
        renderInProgressRef.current = true;
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        // HiDPI Device Pixel Ratio calculations for razor-sharp text & line work
        const dpr = Math.max(window.devicePixelRatio || 1, 1);
        let effectiveDpr = 1;
        if (qualityMode === 'ultra') {
          // Ultra HD: matches retina display (2.0x to 3.0x physical pixels)
          effectiveDpr = Math.max(dpr, 2.0);
        } else if (qualityMode === 'high') {
          effectiveDpr = Math.max(dpr, 1.5);
        } else {
          effectiveDpr = 1.0;
        }

        // Base display viewport based on zoom level and rotation
        const baseScale = (zoom / 100) * 1.5;
        const viewport = page.getViewport({ scale: baseScale, rotation });

        const displayWidth = Math.floor(viewport.width);
        const displayHeight = Math.floor(viewport.height);
        setPageDimensions({ width: displayWidth, height: displayHeight });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        // Set high density physical pixels
        canvas.width = Math.floor(viewport.width * effectiveDpr);
        canvas.height = Math.floor(viewport.height * effectiveDpr);

        // Set CSS display pixels
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        // Configure graphics context for high quality rendering
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // Render with hardware transformation matrix
        const transform =
          effectiveDpr !== 1 ? [effectiveDpr, 0, 0, effectiveDpr, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          viewport,
          transform,
          intent: 'display'
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.warn('PDF Page rendering note:', err);
        }
      } finally {
        renderInProgressRef.current = false;
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }
    };
  }, [pdfDoc, currentPage, zoom, rotation, qualityMode, isPasswordRequired]);

  // Fit to Width calculation
  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(currentPage).then((page: any) => {
      const containerWidth = containerRef.current!.clientWidth - 64; // container padding
      const pageViewport = page.getViewport({ scale: 1.5, rotation });
      if (pageViewport.width > 0) {
        const calculatedZoom = Math.round((containerWidth / pageViewport.width) * 100);
        setZoom(Math.max(25, Math.min(300, calculatedZoom)));
      }
    });
  };

  // Fit to Page calculation
  const handleFitPage = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(currentPage).then((page: any) => {
      const containerHeight = containerRef.current!.clientHeight - 64;
      const pageViewport = page.getViewport({ scale: 1.5, rotation });
      if (pageViewport.height > 0) {
        const calculatedZoom = Math.round((containerHeight / pageViewport.height) * 100);
        setZoom(Math.max(25, Math.min(300, calculatedZoom)));
      }
    });
  };

  // Jump to specific page
  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInputVal, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInputVal(String(currentPage));
    }
  };

  // In-Document Text Search
  const handleSearchExecute = async (queryText?: string) => {
    const term = (queryText !== undefined ? queryText : searchQuery).trim().toLowerCase();
    if (!term || !pdfDoc) {
      setSearchResults([]);
      setCurrentSearchMatchIndex(-1);
      return;
    }

    try {
      setIsSearching(true);
      const matches: SearchMatch[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageString = textContent.items.map((item: any) => item.str).join(' ').toLowerCase();

        let count = 0;
        let pos = 0;
        while ((pos = pageString.indexOf(term, pos)) !== -1) {
          count++;
          pos += term.length;
        }

        if (count > 0) {
          matches.push({ pageIndex: i, matchCount: count });
        }
      }

      setSearchResults(matches);
      if (matches.length > 0) {
        setCurrentSearchMatchIndex(0);
        setCurrentPage(matches[0].pageIndex);
      } else {
        setCurrentSearchMatchIndex(-1);
      }
    } catch (err) {
      console.warn('PDF search warning:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNextSearchMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchMatchIndex + 1) % searchResults.length;
    setCurrentSearchMatchIndex(nextIdx);
    setCurrentPage(searchResults[nextIdx].pageIndex);
  };

  const handlePrevSearchMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx =
      (currentSearchMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchMatchIndex(prevIdx);
    setCurrentPage(searchResults[prevIdx].pageIndex);
  };

  // Clean Print Trigger
  const handlePrintDocument = () => {
    if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
        return;
      }
    }
    window.print();
  };

  // Quick helper for sample password autofill
  const isSampleAuditPdf = filename.toLowerCase().includes('confidential') || filename.toLowerCase().includes('audit');

  return (
    <div
      ref={containerRef}
      className={`flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-100 dark:bg-[#070c14] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* 1. PDF Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-xs shrink-0 z-10 select-none">
        {/* Left Section: Document Tag & Navigation Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/15 px-2.5 py-1 rounded border border-red-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Studio</span>
          </div>

          {/* Encryption / Decryption Security Badge */}
          {isEncrypted && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${
                isPasswordRequired
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isPasswordRequired ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Locked (Encrypted)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  <span>Decrypted</span>
                  <button
                    onClick={handleRelockDocument}
                    className="ml-1 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                    title="Lock Document"
                  >
                    Lock
                  </button>
                </>
              )}
            </div>
          )}

          {/* Sidebar Toggle */}
          {!isPasswordRequired && numPages > 0 && (
            <button
              onClick={() => setShowSidebar(s => !s)}
              className={`p-1.5 rounded text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
                showSidebar
                  ? 'bg-red-600 text-white border-red-500 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
              }`}
              title="Toggle Sidebar (Pages, Outline, Metadata)"
            >
              <Sidebar className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Toggle */}
          {!isPasswordRequired && numPages > 0 && (
            <button
              onClick={() => setIsSearchOpen(s => !s)}
              className={`p-1.5 rounded text-xs border transition-colors cursor-pointer flex items-center gap-1 ${
                isSearchOpen
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
              }`}
              title="Search in PDF"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center Section: Page Navigation */}
        {!isPasswordRequired && numPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronFirst className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1 px-1">
              <input
                type="text"
                value={pageInputVal}
                onChange={e => setPageInputVal(e.target.value)}
                onBlur={handlePageJumpSubmit}
                className="w-10 text-center font-mono text-xs py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-red-500"
                title="Type page number and press Enter"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                / {numPages}
              </span>
            </form>

            <button
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage(numPages)}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronLast className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right Section: Zoom, Quality Preset, Rotation, Actions */}
        {!isPasswordRequired && numPages > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* HiDPI Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(q => !q)}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Canvas Rendering Quality (HiDPI Retina Mode)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">
                  {qualityMode === 'ultra' ? 'Ultra HD' : qualityMode === 'high' ? 'High (2x)' : 'Standard'}
                </span>
              </button>

              {showQualityMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30 font-sans text-xs">
                  <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                    Rendering Sharpness
                  </div>
                  <button
                    onClick={() => {
                      setQualityMode('ultra');
                      setShowQualityMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      qualityMode === 'ultra' ? 'text-red-600 dark:text-red-400 font-bold' : ''
                    }`}
                  >
                    <span>Ultra HD (Retina)</span>
                    {qualityMode === 'ultra' && <Check className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setQualityMode('high');
                      setShowQualityMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      qualityMode === 'high' ? 'text-red-600 dark:text-red-400 font-bold' : ''
                    }`}
                  >
                    <span>High (1.5x)</span>
                    {qualityMode === 'high' && <Check className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setQualityMode('standard');
                      setShowQualityMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      qualityMode === 'standard' ? 'text-red-600 dark:text-red-400 font-bold' : ''
                    }`}
                  >
                    <span>Standard (1.0x)</span>
                    {qualityMode === 'standard' && <Check className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Fit Width & Fit Page Quick Actions */}
            <button
              onClick={handleFitWidth}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              title="Fit to Page Width"
            >
              Fit W
            </button>

            <button
              onClick={handleFitPage}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              title="Fit to Entire Page"
            >
              Fit H
            </button>

            {/* Zoom Stepper */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 p-0.5">
              <button
                onClick={() => setZoom(z => Math.max(25, z - 20))}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>

              <button
                onClick={() => setZoom(100)}
                className="text-[11px] text-slate-800 dark:text-slate-200 font-mono px-1.5 hover:text-red-600 cursor-pointer"
                title="Reset Zoom to 100%"
              >
                {zoom}%
              </button>

              <button
                onClick={() => setZoom(z => Math.min(300, z + 20))}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            {/* Rotation */}
            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              title="Rotate Page 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrintDocument}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer hidden md:flex"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Download */}
            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                download={filename}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-xs"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* 2. In-Document Search Bar (Expandable) */}
      {isSearchOpen && !isPasswordRequired && (
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search text in document..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearchExecute();
              }}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={() => handleSearchExecute()}
              disabled={isSearching}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium cursor-pointer"
            >
              {isSearching ? 'Searching...' : 'Find'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {searchResults.length > 0 ? (
              <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                <span>
                  Match {currentSearchMatchIndex + 1} of {searchResults.length} page(s)
                </span>
                <button
                  onClick={handlePrevSearchMatch}
                  className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  title="Previous match"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextSearchMatch}
                  className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                  title="Next match"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : searchQuery.trim() && !isSearching ? (
              <span className="text-slate-400">No matches found</span>
            ) : null}

            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Document Body: Sidebar + Stage */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        {/* Sidebar: Page Directory, Bookmarks / Outline, Metadata */}
        {showSidebar && !isPasswordRequired && numPages > 0 && (
          <div className="w-60 sm:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
            {/* Sidebar Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40">
              <button
                onClick={() => setSidebarTab('pages')}
                className={`flex-1 py-2 text-center transition-colors cursor-pointer border-b-2 ${
                  sidebarTab === 'pages'
                    ? 'border-red-500 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900'
                    : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Pages ({numPages})
              </button>
              {docOutline.length > 0 && (
                <button
                  onClick={() => setSidebarTab('outline')}
                  className={`flex-1 py-2 text-center transition-colors cursor-pointer border-b-2 ${
                    sidebarTab === 'outline'
                      ? 'border-red-500 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Outline
                </button>
              )}
              <button
                onClick={() => setSidebarTab('info')}
                className={`flex-1 py-2 text-center transition-colors cursor-pointer border-b-2 ${
                  sidebarTab === 'info'
                    ? 'border-red-500 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900'
                    : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Info
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sidebarTab === 'pages' && (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: numPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`p-2 rounded-lg text-center flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        currentPage === i + 1
                          ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="w-12 h-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs mb-1.5 flex items-center justify-center text-[10px] text-slate-400">
                        {i + 1}
                      </div>
                      <span className="text-[11px] font-mono">Page {i + 1}</span>
                    </button>
                  ))}
                </div>
              )}

              {sidebarTab === 'outline' && (
                <div className="space-y-1 text-xs">
                  {docOutline.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 truncate cursor-pointer flex items-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === 'info' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">Filename</span>
                    <span className="text-slate-900 dark:text-slate-100 font-mono break-all">{filename}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">Total Pages</span>
                    <span className="text-slate-900 dark:text-slate-100 font-mono">{numPages}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">Security & Encryption</span>
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isEncrypted ? 'Password Protected (Decrypted)' : 'Standard (Unencrypted)'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">HiDPI Render Quality</span>
                    <span className="text-slate-900 dark:text-slate-100 font-mono">
                      {qualityMode === 'ultra' ? 'Ultra HD Retina (~2x - 3x)' : qualityMode === 'high' ? 'High (1.5x)' : 'Standard (1.0x)'}
                    </span>
                  </div>
                  {metadata?.title && (
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">Document Title</span>
                      <span className="text-slate-900 dark:text-slate-100">{metadata.title}</span>
                    </div>
                  )}
                  {metadata?.author && (
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">Author</span>
                      <span className="text-slate-900 dark:text-slate-100">{metadata.author}</span>
                    </div>
                  )}
                  {metadata?.producer && (
                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">PDF Producer</span>
                      <span className="text-slate-900 dark:text-slate-100 font-mono text-[11px]">{metadata.producer}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Canvas Stage */}
        <div className="flex-1 min-h-0 min-w-0 bg-slate-200/75 dark:bg-[#060a10] flex justify-center items-start overflow-auto p-4 sm:p-8 transition-colors">
          {/* Decryption Required UI Prompt */}
          {isPasswordRequired ? (
            <div className="w-full max-w-md my-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Password-Protected Document
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{filename}</span> is encrypted with PDF security. Please enter the password to decrypt and view with best quality.
                </p>
              </div>

              {/* Sample Hint Pill if testing confidential sample */}
              {isSampleAuditPdf && (
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <span>Hint password for sample: <strong>omniview</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput('omniview');
                      handleUnlockSubmit(undefined, 'omniview');
                    }}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Password Input Form */}
              <form onSubmit={handleUnlockSubmit} className="space-y-3.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    ref={passwordInputRef}
                    type={showPasswordText ? 'text' : 'password'}
                    placeholder="Enter document password..."
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(t => !t)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPasswordText ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 animate-shake">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDecrypting}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDecrypting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Decrypting & Loading...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Decrypt & Open PDF</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 space-y-3 my-auto">
              <div className="w-9 h-9 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono">Rendering document pages at HiDPI quality...</p>
            </div>
          ) : error ? (
            <div className="max-w-md p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-4 my-auto">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Unable to Parse PDF</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{error}</p>
              </div>

              {pdfBlobUrl && (
                <div className="pt-2">
                  <a
                    href={pdfBlobUrl}
                    download={filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original PDF</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* HiDPI Paper Canvas Rendering */
            <div
              className="bg-white rounded-sm shadow-2xl p-0 border border-slate-300 dark:border-slate-700/80 transition-transform my-auto overflow-hidden shrink-0"
              style={{
                width: pageDimensions ? `${pageDimensions.width}px` : 'auto',
                height: pageDimensions ? `${pageDimensions.height}px` : 'auto'
              }}
            >
              <canvas
                ref={canvasRef}
                className="block select-text"
                style={{
                  width: pageDimensions ? `${pageDimensions.width}px` : '100%',
                  height: pageDimensions ? `${pageDimensions.height}px` : 'auto'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
