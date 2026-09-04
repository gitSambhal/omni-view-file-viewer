/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Header & Application Navigation
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Link2,
  Zap,
  Package,
  Search,
  PanelLeft,
  ChevronDown,
  SlidersHorizontal,
  Info,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';

export interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenFilePicker: () => void;
  onLoadSampleFiles: () => void;
  onOpenChangelog: () => void;
  onOpenHexForCurrentTab: () => void;
  onOpenLiveSyncDashboard?: () => void;
  onOpenSupportedFormats?: () => void;
  onOpenUrlModal?: () => void;
  onOpenRunnersGuide?: () => void;
  onOpenNpmTester?: () => void;
  onOpenCommandPalette?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onNewScratchpad?: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
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
  onOpenUrlModal,
  onOpenRunnersGuide,
  onOpenNpmTester,
  onOpenCommandPalette,
  isSidebarOpen = true,
  onToggleSidebar,
  onNewScratchpad,
  liveSyncCount,
  isSyncing = false
}) => {
  const [isOpenMenuOpen, setIsOpenMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  const openMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuRef.current && !openMenuRef.current.contains(e.target as Node)) {
        setIsOpenMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 select-none shadow-xs dark:shadow-sm gap-3 transition-colors z-40 shrink-0">
      {/* Brand, Sidebar Toggle & Attribution */}
      <div className="flex items-center gap-2 md:gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border transition-colors cursor-pointer ${
              isSidebarOpen
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                : 'border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle Workspace Explorer (Ctrl+B / Cmd+B)"
            aria-label="Toggle Workspace Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                OmniView <span className="font-normal text-slate-500 dark:text-slate-400">Studio</span>
              </h1>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">
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

      {/* Center Spotlight Command Palette Search Trigger */}
      {onOpenCommandPalette && (
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer min-w-[240px] lg:min-w-[320px] shadow-2xs"
          title="Open Command Palette & Quick Search (Ctrl+K / Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-normal truncate">Search files, scratchpads & tools...</span>
          <kbd className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      )}

      {/* Right Controls: Unified Open Menu + Tools Menu + Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Unified "Open" Dropdown Menu */}
        <div className="relative" ref={openMenuRef}>
          <div className="inline-flex rounded-lg shadow-2xs bg-blue-600 text-white">
            <button
              onClick={onOpenFilePicker}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-blue-500 active:scale-[0.98] rounded-l-lg transition-all cursor-pointer"
              title="Open local files (Ctrl+O)"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
            <button
              onClick={() => setIsOpenMenuOpen(!isOpenMenuOpen)}
              className="px-1.5 py-1.5 border-l border-blue-500 hover:bg-blue-500 rounded-r-lg transition-all cursor-pointer"
              title="More open options"
              aria-label="More open options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {isOpenMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#0c121e] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-[9999] divide-y divide-slate-100 dark:divide-slate-800 text-xs animate-in fade-in duration-100">
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    onOpenFilePicker();
                    setIsOpenMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-medium">Local Device Files</p>
                    <p className="text-[10px] text-slate-400">Browse disk (Ctrl+O)</p>
                  </div>
                </button>

                {onOpenUrlModal && (
                  <button
                    onClick={() => {
                      onOpenUrlModal();
                      setIsOpenMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <Link2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <div>
                      <p className="font-medium">From Remote URL</p>
                      <p className="text-[10px] text-slate-400">GitHub raw, API or direct link</p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    onLoadSampleFiles();
                    setIsOpenMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="font-medium">Load Interactive Demos</p>
                    <p className="text-[10px] text-slate-400">PDF, Excel, Python & SQLite</p>
                  </div>
                </button>
              </div>

              {onNewScratchpad && (
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Instant Scratchpad
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => {
                        onNewScratchpad('ts');
                        setIsOpenMenuOpen(false);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-mono text-center bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/60"
                    >
                      TS / NPM
                    </button>
                    <button
                      onClick={() => {
                        onNewScratchpad('python');
                        setIsOpenMenuOpen(false);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-mono text-center bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700/60"
                    >
                      Python
                    </button>
                    <button
                      onClick={() => {
                        onNewScratchpad('sql');
                        setIsOpenMenuOpen(false);
                      }}
                      className="px-2 py-1 rounded-md text-[11px] font-mono text-center bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/60"
                    >
                      SQLite
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Unified "Tools" Menu (NPM, Runners, LiveSync, Hex, Formats, Changelog) */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              liveSyncCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-[#0c121e] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80'
            }`}
            title="Tools, Code Runners & Utilities"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Tools</span>
            {liveSyncCount > 0 && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full bg-white ${isSyncing ? 'animate-ping' : ''}`} />
                {liveSyncCount}
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#0c121e] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-[9999] divide-y divide-slate-100 dark:divide-slate-800 text-xs animate-in fade-in duration-100">
              <div className="p-1 space-y-0.5">
                {onOpenNpmTester && (
                  <button
                    onClick={() => {
                      onOpenNpmTester();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-medium">NPM Package Tester</p>
                      <p className="text-[10px] text-slate-400">Dynamic in-memory CDN imports</p>
                    </div>
                  </button>
                )}

                {onOpenRunnersGuide && (
                  <button
                    onClick={() => {
                      onOpenRunnersGuide();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-medium">Code Runners Guide</p>
                      <p className="text-[10px] text-slate-400">Python 3.12, TSX, SQLite, Shell</p>
                    </div>
                  </button>
                )}

                {onOpenLiveSyncDashboard && (
                  <button
                    onClick={() => {
                      onOpenLiveSyncDashboard();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-blue-500 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Live Sync Telemetry</p>
                        {liveSyncCount > 0 && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-1 rounded">
                            {liveSyncCount} active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Watch local files on disk</p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenHexForCurrentTab();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div>
                    <p className="font-medium">Hex Byte Inspector</p>
                    <p className="text-[10px] text-slate-400">Raw offsets & byte stream</p>
                  </div>
                </button>
              </div>

              <div className="p-1 space-y-0.5">
                {onOpenSupportedFormats && (
                  <button
                    onClick={() => {
                      onOpenSupportedFormats();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Supported Formats (60+)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenChangelog();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Release Notes (v2.2.0)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5"></div>

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
