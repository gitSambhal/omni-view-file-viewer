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
  ArrowRight,
  SlidersHorizontal,
  KeyRound
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col items-center justify-center p-6 md:p-12 transition-all duration-200 overflow-y-auto ${
        isDragging
          ? 'bg-blue-500/5 dark:bg-blue-950/20 border-2 border-dashed border-blue-500'
          : 'bg-slate-50/50 dark:bg-[#090d16]'
      }`}
    >
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-8 py-6">
        {/* Modern Minimal Drop Target Hero */}
        <div
          onClick={onOpenFilePicker}
          className="group relative cursor-pointer flex flex-col items-center justify-center p-8 w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 flex items-center justify-center transition-all mb-3.5">
            <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Drop files here or browse local storage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Zero cloud uploads. All inspection runs locally in high-speed browser memory.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
              <span>Choose Files</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-4 py-2 rounded-lg font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Select Files</span>
          </button>

          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-1.5 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-lg font-medium text-xs border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Open with Live Sync</span>
          </button>

          <button
            onClick={onLoadSamples}
            className="flex items-center gap-1.5 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-lg font-medium text-xs border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Load Demos</span>
          </button>

          {onOpenSupportedFormats && (
            <button
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-1.5 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-lg font-medium text-xs border border-slate-200 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Format Directory</span>
            </button>
          )}
        </div>

        {/* Supported Formats Grid with Clean Enterprise Cards */}
        <div className="w-full pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>Supported Formats & Native Capabilities</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                60+ Extensions
              </span>
            </span>

            {onOpenSupportedFormats && (
              <button
                onClick={onOpenSupportedFormats}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>Browse All</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* HTTP / REST */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">HTTP & REST</div>
                <div className="text-[10px] font-mono text-slate-400">.http, .rest</div>
              </div>
            </div>

            {/* Binary & PE/DLL */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Cpu className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">PE / DLL Binaries</div>
                <div className="text-[10px] font-mono text-slate-400">.dll, .exe, .wasm</div>
              </div>
            </div>

            {/* Typography & Fonts */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Type className="w-4 h-4 text-pink-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">Font Specimen</div>
                <div className="text-[10px] font-mono text-slate-400">.ttf, .otf, .woff</div>
              </div>
            </div>

            {/* Databases & SQL */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Database className="w-4 h-4 text-teal-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">Databases & SQL</div>
                <div className="text-[10px] font-mono text-slate-400">.sqlite, .db, .sql</div>
              </div>
            </div>

            {/* Documents & Office */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <FileText className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">Documents</div>
                <div className="text-[10px] font-mono text-slate-400">.pdf, .docx, .epub</div>
              </div>
            </div>

            {/* Spreadsheets */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Table className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">Spreadsheets</div>
                <div className="text-[10px] font-mono text-slate-400">.xlsx, .csv, .tsv</div>
              </div>
            </div>

            {/* Code & Config */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Code className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">Code & Config</div>
                <div className="text-[10px] font-mono text-slate-400">.json, .yaml, .ts, .py</div>
              </div>
            </div>

            {/* Media & Archives */}
            <div
              onClick={onOpenSupportedFormats}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all cursor-pointer text-left"
            >
              <Archive className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">Media & Archives</div>
                <div className="text-[10px] font-mono text-slate-400">.mp4, .zip, .geojson</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0f172a] px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Privacy Guaranteed: Files remain entirely in local browser memory and never contact remote servers.</span>
        </div>
      </div>
    </div>
  );
};

