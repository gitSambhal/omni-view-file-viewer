/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import {
  FolderOpen,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  Layers,
  Code2,
  Database,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenFilePicker: () => void;
  onLoadSampleFiles: () => void;
  onOpenChangelog: () => void;
  onOpenHexForCurrentTab: () => void;
  onOpenLiveSyncDashboard?: () => void;
  onOpenSupportedFormats?: () => void;
  liveSyncCount: number;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenFilePicker,
  onLoadSampleFiles,
  onOpenChangelog,
  onOpenHexForCurrentTab,
  onOpenLiveSyncDashboard,
  onOpenSupportedFormats,
  liveSyncCount,
  isSyncing = false
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 select-none shadow-xs dark:shadow-sm gap-3 transition-colors z-20">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                OmniView <span className="font-normal text-slate-500 dark:text-slate-400">Studio</span>
              </h1>
              <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/80">
                OFFLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              By{' '}
              <a
                href="https://suhail.top"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Suhail Akhtar
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Main Operational Controls */}
      <div className="flex items-center gap-2">
        {/* Primary: Open Local File */}
        <button
          onClick={onOpenFilePicker}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-all cursor-pointer"
          title="Open files directly from your computer"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Open File</span>
        </button>

        {/* Live Sync File Control */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={onOpenFilePicker}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
            title="Open local files with automatic real-time disk sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'text-emerald-500 animate-spin' : liveSyncCount > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>Live Sync</span>
          </button>
          {liveSyncCount > 0 && (
            <button
              onClick={onOpenLiveSyncDashboard}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-emerald-500/20"
              title="Open Live Sync Dashboard"
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`} />
              {liveSyncCount}
            </button>
          )}
        </div>

        {/* Sample Files / Demos */}
        <button
          onClick={onLoadSampleFiles}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
          title="Load sample interactive documents (PDF, Excel, SQLite, Code, Markdown)"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Demos</span>
        </button>

        {/* Hex Inspector Toggle */}
        <button
          onClick={onOpenHexForCurrentTab}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
          title="Toggle Hex Byte Inspection for active file"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Hex</span>
        </button>

        {/* Supported Formats Info Directory */}
        {onOpenSupportedFormats && (
          <button
            onClick={onOpenSupportedFormats}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
            title="Browse all 60+ supported file formats and reader capabilities"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">Formats</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

        {/* Privacy Badge */}
        <div
          className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700/60 cursor-default"
          title="100% Client-side. Your files never leave your device."
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] font-medium">Local Memory Only</span>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};

