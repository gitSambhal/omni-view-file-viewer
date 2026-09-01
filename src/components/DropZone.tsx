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
  RefreshCw
} from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onOpenFilePicker: () => void;
  onLoadSamples: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onOpenFilePicker,
  onLoadSamples
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
      className={`flex-1 flex flex-col items-center justify-center p-6 md:p-12 transition-all duration-300 ${
        isDragging
          ? 'bg-blue-600/10 border-4 border-dashed border-blue-500 scale-[0.99]'
          : 'bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800'
      }`}
    >
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        {/* Animated Upload Hero Icon */}
        <div className="relative group cursor-pointer" onClick={onOpenFilePicker}>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
          <div className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center">
            <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Drop files anywhere to preview instantly
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            100% offline & local processing. Open PDFs, Office documents, spreadsheets, code, SQLite databases, media, and archives directly in your browser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-95 text-sm cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Select Local Files</span>
          </button>

          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-5 py-3 rounded-xl font-medium border border-slate-300 dark:border-slate-800 shadow-sm transition-all active:scale-95 text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Open File with Live Sync</span>
          </button>

          <button
            onClick={onLoadSamples}
            className="flex items-center gap-2 bg-purple-600/10 dark:bg-purple-600/20 hover:bg-purple-600/20 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 px-5 py-3 rounded-xl font-medium border border-purple-500/30 transition-all active:scale-95 text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Try Interactive Demos</span>
          </button>
        </div>

        {/* Format Tags Grid */}
        <div className="w-full pt-6 border-t border-slate-200 dark:border-slate-900 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
            Supported Local Formats
          </span>

          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <FileText className="w-3.5 h-3.5 text-red-500" /> PDF Documents
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> Word (.docx)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <Table className="w-3.5 h-3.5 text-emerald-500" /> Excel (.xlsx, .csv)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <Presentation className="w-3.5 h-3.5 text-amber-500" /> PowerPoint (.pptx)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <Code className="w-3.5 h-3.5 text-cyan-500" /> Code (50+ languages)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <Database className="w-3.5 h-3.5 text-emerald-500" /> SQLite, SQL, ACCDB, MDB
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <ImageIcon className="w-3.5 h-3.5 text-pink-500" /> Images & EXIF
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-sm">
              <Archive className="w-3.5 h-3.5 text-amber-500" /> Archives (ZIP, TAR, GZ)
            </span>
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
