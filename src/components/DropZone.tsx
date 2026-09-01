/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
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
  RefreshCw,
  Globe,
  Cpu,
  Type,
  Layers,
  HelpCircle,
  Play,
  Lock
} from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onOpenFilePicker: () => void;
  onLoadSamples: () => void;
  onOpenSupportedFormats?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onOpenFilePicker,
  onLoadSamples,
  onOpenSupportedFormats
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
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col items-center justify-center p-6 md:p-10 transition-all duration-300 overflow-y-auto ${
        isDragging
          ? 'bg-blue-600/10 border-4 border-dashed border-blue-500 scale-[0.99]'
          : 'bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800'
      }`}
    >
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-7 py-4">
        {/* Animated Upload Hero Icon */}
        <div className="relative group cursor-pointer" onClick={onOpenFilePicker}>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative p-5 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center">
            <Upload className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Drop files anywhere to preview instantly
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            100% offline & local processing. Deeply inspect HTTP/REST requests, PE/DLL binaries, fonts, SQLite databases, PDFs, Office docs, code, and media in your browser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-95 text-sm cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Select Local Files</span>
          </button>

          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium border border-slate-300 dark:border-slate-800 shadow-sm transition-all active:scale-95 text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Open with Live Sync</span>
          </button>

          <button
            onClick={onLoadSamples}
            className="flex items-center gap-2 bg-purple-600/10 dark:bg-purple-600/20 hover:bg-purple-600/20 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 px-4 py-2.5 rounded-xl font-medium border border-purple-500/30 transition-all active:scale-95 text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Load Demos</span>
          </button>

          {onOpenSupportedFormats && (
            <button
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-medium border border-slate-300 dark:border-slate-700 transition-all active:scale-95 text-sm cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Supported Formats List</span>
            </button>
          )}
        </div>

        {/* Supported Formats Grid with Rich Visual Categories */}
        <div className="w-full pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span>Supported Formats & Native Capabilities</span>
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20">
                60+ Extensions
              </span>
            </span>

            {onOpenSupportedFormats && (
              <button
                onClick={onOpenSupportedFormats}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>Browse Full Directory</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
            {/* HTTP / REST */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors cursor-pointer text-left"
            >
              <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">HTTP & REST</div>
                <div className="text-[10px] font-mono text-slate-400">.http, .rest</div>
              </div>
            </div>

            {/* Binary & PE/DLL */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors cursor-pointer text-left"
            >
              <Cpu className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">PE / DLL Binaries</div>
                <div className="text-[10px] font-mono text-slate-400">.dll, .exe, .wasm, .so</div>
              </div>
            </div>

            {/* Typography & Fonts */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-pink-500/40 hover:bg-pink-500/5 transition-colors cursor-pointer text-left"
            >
              <Type className="w-4 h-4 text-pink-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">Font Typography</div>
                <div className="text-[10px] font-mono text-slate-400">.ttf, .otf, .woff, .woff2</div>
              </div>
            </div>

            {/* Databases & SQL */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors cursor-pointer text-left"
            >
              <Database className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">Databases & SQL</div>
                <div className="text-[10px] font-mono text-slate-400">.sqlite, .db, .sql, .accdb</div>
              </div>
            </div>

            {/* Documents & Office */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-red-500/40 hover:bg-red-500/5 transition-colors cursor-pointer text-left"
            >
              <FileText className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">Documents</div>
                <div className="text-[10px] font-mono text-slate-400">.pdf, .docx, .pptx, .epub</div>
              </div>
            </div>

            {/* Spreadsheets */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors cursor-pointer text-left"
            >
              <Table className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">Spreadsheets</div>
                <div className="text-[10px] font-mono text-slate-400">.xlsx, .csv, .tsv</div>
              </div>
            </div>

            {/* Code & Config */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors cursor-pointer text-left"
            >
              <Code className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">Code & Config</div>
                <div className="text-[10px] font-mono text-slate-400">.json, .yaml, .env, .ts, .py</div>
              </div>
            </div>

            {/* Media & Archives */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors cursor-pointer text-left"
            >
              <Archive className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">Media & Archives</div>
                <div className="text-[10px] font-mono text-slate-400">.mp4, .zip, .tar, .geojson</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Maximum Privacy: Files stay on your device memory and are never uploaded to any cloud server.</span>
        </div>
      </div>
    </div>
  );
};
