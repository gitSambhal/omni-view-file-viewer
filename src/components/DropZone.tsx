/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Professional Landing Page & Welcome Workspace
 */

import React, { useState } from 'react';
import {
  Upload,
  FolderOpen,
  FileText,
  Database,
  Archive,
  ImageIcon,
  ShieldCheck,
  Sparkles,
  Link2,
  Terminal,
  Code2,
  ArrowRight,
  Zap,
  Music,
  FileSpreadsheet
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
      className={`flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 transition-all duration-200 overflow-y-auto ${
        isDragging
          ? 'bg-blue-500/5 dark:bg-blue-950/20 border-2 border-dashed border-blue-500'
          : 'bg-slate-50/60 dark:bg-[#070b12]'
      }`}
    >
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-6 py-2">
        {/* Top Minimal Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>100% Offline • Zero Server Uploads</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            OmniView <span className="text-blue-600 dark:text-blue-400 font-normal">Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Universal local file reader & developer workspace. Inspect, edit, and run 
            <span className="text-slate-900 dark:text-slate-200 font-semibold"> 60+ file formats</span> — PDFs, Office docs, Code, SQLite databases, Media & Archives — completely inside your browser.
          </p>
        </div>

        {/* Primary File Drop Target */}
        <div
          onClick={onOpenFilePicker}
          className="group relative cursor-pointer flex flex-col items-center justify-center p-8 sm:p-10 w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-2xs hover:shadow-md transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all mb-3.5 group-hover:scale-105">
            <Upload className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
          </div>

          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Drop files here or click to browse
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
            All files stay strictly on your local device. Fast in-memory parsing.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <span className="flex items-center gap-1.5 bg-blue-600 group-hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-all">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse Device</span>
            </span>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onLoadSamples();
              }}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-purple-200/50 dark:border-purple-900/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Load Demos</span>
            </button>

            {onOpenUrlModal && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onOpenUrlModal();
                }}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Fetch URL</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Sandpads Row */}
        {onNewScratchpad && (
          <div className="w-full space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-left px-1">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                In-Memory Sandboxes
              </span>
              <button
                onClick={onLoadSamples}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Samples</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => onNewScratchpad('ts')}
                className="p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    TSX / NPM
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  TypeScript runner
                </p>
              </button>

              <button
                onClick={() => onNewScratchpad('python')}
                className="p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Python Wasm
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Pyodide 3.12 runtime
                </p>
              </button>

              <button
                onClick={() => onNewScratchpad('sql')}
                className="p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:border-emerald-400 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    SQLite DB
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Schema & SQL runner
                </p>
              </button>

              <button
                onClick={() => onNewScratchpad('markdown')}
                className="p-3 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 hover:border-purple-400 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Markdown
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Live GFM notes
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Clean Capabilities Bento Grid */}
        <div className="w-full space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-left px-1">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Core Engines & Readers
              </span>
            </div>
            {onOpenSupportedFormats && (
              <button
                onClick={onOpenSupportedFormats}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>60+ Formats</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Documents & Office</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                PDF reader with zoom/search, Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`), and EPUB e-books.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                <Code2 className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Code & Web Sandbox</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                50+ language syntax highlighter, live HTML/JS web preview, and in-memory CDN NPM package tester.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Databases & Media</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                SQLite database query runner, CSV sorting, EXIF image viewer, Audio studio with waveforms & video.
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="w-full pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0c121e] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px]">
            100% In-Browser Execution • Your files never leave your device.
          </span>

          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="hidden sm:inline bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Ctrl+K Spotlight</span>
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Suhail Akhtar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
