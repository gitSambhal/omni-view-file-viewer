/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import {
  FolderOpen,
  FilePlus,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  HelpCircle,
  Code
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenFilePicker: () => void;
  onLoadSampleFiles: () => void;
  onOpenChangelog: () => void;
  onOpenHexForCurrentTab: () => void;
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
  liveSyncCount,
  isSyncing = false
}) => {
  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 select-none shadow-sm dark:shadow-md gap-3 transition-colors">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
                OmniView File Studio
              </h1>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                100% OFFLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Created by{' '}
              <a
                href="https://suhail.top"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium underline-offset-2 transition-colors"
              >
                Suhail Akhtar
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Main Operational Controls */}
      <div className="flex items-center gap-2">
        {/* Open Local File */}
        <button
          onClick={onOpenFilePicker}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          title="Open files directly from your computer"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Open Local File</span>
        </button>

        {/* Live Sync File Picker */}
        <button
          onClick={onOpenFilePicker}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
          title="Open local files with automatic real-time file live syncing"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'text-emerald-500 animate-spin' : liveSyncCount > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`} />
          <span>Live Sync File</span>
          {liveSyncCount > 0 && (
            <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {liveSyncCount} Active
            </span>
          )}
        </button>

        {/* Load Demos */}
        <button
          onClick={onLoadSampleFiles}
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          title="Load sample interactive documents (PDF, Excel, SQLite, Code, Markdown)"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Load Demos</span>
        </button>

        {/* Hex Inspector Toggle for current tab */}
        <button
          onClick={onOpenHexForCurrentTab}
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          title="Toggle Hex Byte Inspection for active file"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Hex View</span>
        </button>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 mx-1"></div>

        {/* Privacy badge */}
        <div
          className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 cursor-default"
          title="Your files never leave your browser memory. 100% Client-side."
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Zero Server Uploads</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
      </div>
    </header>
  );
};
