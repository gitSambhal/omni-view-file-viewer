/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Comprehensive Landing Page & Welcome Hub
 */

import React, { useState } from 'react';
import {
  Upload,
  FolderOpen,
  FileText,
  Table,
  Presentation,
  Code,
  Database,
  Archive,
  ImageIcon,
  ShieldCheck,
  Sparkles,
  Link2,
  Package,
  Terminal,
  Code2,
  ArrowRight,
  Zap,
  Layers,
  Video,
  Music,
  BookOpen,
  Binary,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Key,
  Command,
  HardDrive
} from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onOpenFilePicker: () => void;
  onLoadSamples: () => void;
  onOpenSupportedFormats?: () => void;
  onOpenUrlModal?: () => void;
  onOpenRunnersGuide?: () => void;
  onOpenNpmTester?: () => void;
  onNewScratchpad?: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onOpenFilePicker,
  onLoadSamples,
  onOpenSupportedFormats,
  onOpenUrlModal,
  onOpenRunnersGuide,
  onOpenNpmTester,
  onNewScratchpad
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10 transition-all duration-200 overflow-y-auto ${
        isDragging
          ? 'bg-blue-500/10 dark:bg-blue-950/30 border-2 border-dashed border-blue-500'
          : 'bg-slate-50 dark:bg-[#080d1a]'
      }`}
    >
      <div className="w-full max-w-5xl flex flex-col items-center text-center space-y-8 py-2">
        {/* Top Hero Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side Privacy • Zero Server Uploads</span>
        </div>

        {/* Main App Title & Subtitle */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            OmniView <span className="text-blue-600 dark:text-blue-400">File Studio</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Universal offline file reader, inspector & developer playground. Instantly preview, edit, and run 
            <strong className="text-slate-900 dark:text-slate-100 font-semibold"> 60+ file formats</strong> — 
            PDFs, Office docs, Code, SQLite databases, Media, Archives, and WebAssembly sandboxes — completely in your browser.
          </p>
        </div>

        {/* Drop Target Box */}
        <div
          onClick={onOpenFilePicker}
          className="group relative cursor-pointer flex flex-col items-center justify-center p-8 sm:p-10 w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0f172a] border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all mb-4 group-hover:scale-110 shadow-inner">
            <Upload className="w-7 h-7 transition-transform group-hover:-translate-y-0.5" />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Drop your files here, or click to browse
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
            Drag and drop any file to view it instantly. All parsing, rendering, and code execution runs locally inside browser memory.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-2 bg-blue-600 group-hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
              <FolderOpen className="w-4 h-4" />
              <span>Browse Local Device</span>
            </span>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onLoadSamples();
              }}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span>Load Interactive Samples</span>
            </button>

            {onOpenUrlModal && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onOpenUrlModal();
                }}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Link2 className="w-4 h-4 text-blue-500" />
                <span>Fetch URL</span>
              </button>
            )}
          </div>
        </div>

        {/* "What is OmniView About?" Capabilities Grid */}
        <div className="w-full space-y-4 pt-4">
          <div className="flex items-center justify-between text-left border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                Supported Applications & File Engines
              </h2>
            </div>
            {onOpenSupportedFormats && (
              <button
                onClick={onOpenSupportedFormats}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>60+ Formats Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
            {/* Feature 1: Office & Docs */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Office & Documents</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                PDF, Word, Excel, PPTX & EPUB
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full document viewing with page navigation, text search, spreadsheet sheet tabs, PowerPoint slide previews, and customizable e-book typography.
              </p>
            </div>

            {/* Feature 2: Code Studio */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-2">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                <Code2 className="w-4 h-4" />
                <span>Developer Code Studio</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                50+ Syntax Highlighting & Runners
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Source code editor with line numbers, search/replace, live HTML/JS web preview, and in-memory CDN NPM package tester.
              </p>
            </div>

            {/* Feature 3: Database & SQL */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <Database className="w-4 h-4" />
                <span>Databases & Structured Data</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                SQLite, CSV, JSON, XML & GeoJSON
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspect SQLite database files with real-time SQL querying, CSV data sorting, JSON interactive tree expansion, and GeoJSON map visualizer.
              </p>
            </div>

            {/* Feature 4: Media Studio */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                <Music className="w-4 h-4" />
                <span>Media & Audio Studio</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Images, Audio, Video & EXIF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Image zoom & EXIF inspection, audio studio with waveforms & playback rate controls, and full video playback with stream specs.
              </p>
            </div>

            {/* Feature 5: Archives & Binary */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                <Archive className="w-4 h-4" />
                <span>Archives & Hex Inspection</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                ZIP, TAR, GZ & Raw Hex Bytes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspect archive contents without unzipping to disk, and examine raw binary hex bytes for unknown or corrupted file analysis.
              </p>
            </div>

            {/* Feature 6: WebAssembly Sandboxes */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                <Terminal className="w-4 h-4" />
                <span>WebAssembly Code Sandboxes</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Python Pyodide, TSX & SQL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Run Python 3.12 scripts locally via WebAssembly, execute TypeScript snippets, and build SQLite tables in-memory.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Scratchpads (TS, Python, SQLite, Markdown) */}
        {onNewScratchpad && (
          <div className="w-full space-y-3 pt-2">
            <div className="flex items-center justify-between text-left border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                Instant In-Memory Code Scratchpads
              </span>
              <button
                onClick={onLoadSamples}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Files</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => onNewScratchpad('ts')}
                className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    TypeScript & NPM
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  TSX code execution with dynamic CDN package imports
                </p>
              </button>

              <button
                onClick={() => onNewScratchpad('python')}
                className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Python 3.12 (Wasm)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pyodide WebAssembly runtime for algorithms & math
                </p>
              </button>

              <button
                onClick={() => onNewScratchpad('sql')}
                className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    SQLite Database
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Interactive schema creator & query executor
                </p>
              </button>

              <button
                onClick={() => onNewScratchpad('markdown')}
                className="flex flex-col p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Markdown Notes
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Live GFM notes with formatted preview
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Footer & Privacy Guarantee */}
        <div className="w-full pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">100% Offline & Private:</strong> Your files never leave your browser memory.
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Ctrl+K: Spotlight</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Ctrl+B: Sidebar</span>
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Suhail Akhtar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
