/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Workspace Sidebar & File Explorer
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  FileCode,
  FileText,
  Table,
  Presentation,
  Code,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Database,
  Terminal,
  Captions,
  MapPin,
  BookOpen,
  Binary,
  Layers,
  X,
  Download,
  RefreshCw,
  Sparkles,
  Link2,
  FolderOpen,
  ChevronLeft,
  HardDrive,
  Code2
} from 'lucide-react';
import { TabFile, FileCategory } from '../types/file';

export interface SidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  tabs: TabFile[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseAllTabs: () => void;
  onOpenFilePicker: () => void;
  onOpenUrlModal: () => void;
  onOpenNpmTester: () => void;
  onOpenRunnersGuide: () => void;
  onOpenLiveSyncDashboard: () => void;
  onOpenHexForCurrentTab: () => void;
  onNewScratchpad: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
  onDownloadTabFile?: (id: string) => void;
  liveSyncCount: number;
}

type CategoryFilter = 'all' | 'documents' | 'code' | 'data' | 'media';

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggleOpen,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onOpenFilePicker,
  onOpenUrlModal,
  onNewScratchpad,
  onDownloadTabFile,
  liveSyncCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // Close new menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute total memory footprint of open files
  const totalMemoryBytes = useMemo(() => {
    return tabs.reduce((acc, tab) => acc + (tab.size || 0), 0);
  }, [tabs]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'docx':
        return <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'excel':
        return <Table className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'pptx':
        return <Presentation className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'code':
        return <Code className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case 'markdown':
        return <FileCode className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'archive':
        return <Archive className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'json':
        return <Code className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'log':
        return <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'subtitle':
        return <Captions className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case 'geojson':
        return <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'ebook':
        return <BookOpen className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
      case 'binary':
      case 'hex':
        return <Binary className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  // Filter tabs
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tab.name.toLowerCase().includes(q);
        const matchesExt = tab.extension.toLowerCase().includes(q);
        const matchesCat = tab.category.toLowerCase().includes(q);
        if (!matchesName && !matchesExt && !matchesCat) return false;
      }

      // Category filter
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'documents') {
        return ['pdf', 'docx', 'pptx', 'text', 'markdown', 'ebook'].includes(tab.category);
      }
      if (categoryFilter === 'code') {
        return ['code', 'html', 'json', 'log', 'http', 'subtitle'].includes(tab.category);
      }
      if (categoryFilter === 'data') {
        return ['database', 'excel', 'geojson'].includes(tab.category);
      }
      if (categoryFilter === 'media') {
        return ['image', 'video', 'audio', 'font', 'archive', 'binary'].includes(tab.category);
      }
      return true;
    });
  }, [tabs, searchQuery, categoryFilter]);

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      id="workspace-sidebar"
      className="w-64 sm:w-72 bg-slate-50/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col shrink-0 h-full select-none z-10 transition-all text-slate-800 dark:text-slate-200"
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
            Workspace
          </h2>
          <span className="text-[10px] font-mono bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded-full font-medium">
            {tabs.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* New Item Dropdown */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              className="p-1 rounded-md text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Add New File or Scratchpad"
            >
              <Plus className="w-4 h-4" />
            </button>

            {isNewMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#0c121e] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-[9999] text-xs animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    onOpenFilePicker();
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Open Local File</span>
                </button>

                <button
                  onClick={() => {
                    onOpenUrlModal();
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>Open from URL</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  New Scratchpad
                </div>

                <button
                  onClick={() => {
                    onNewScratchpad('ts');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>TypeScript & NPM</span>
                </button>

                <button
                  onClick={() => {
                    onNewScratchpad('python');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Python 3.12 (Wasm)</span>
                </button>

                <button
                  onClick={() => {
                    onNewScratchpad('sql');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>SQLite Query</span>
                </button>

                <button
                  onClick={() => {
                    onNewScratchpad('markdown');
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Markdown Notes</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="p-2 space-y-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter open files..."
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {(['all', 'documents', 'code', 'data', 'media'] as CategoryFilter[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-[10px] font-medium capitalize px-2 py-0.5 rounded-md shrink-0 transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <button
          onClick={() => onSelectTab('welcome')}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTabId === 'welcome' || activeTabId === null
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>App Overview & Landing</span>
        </button>

        {filteredTabs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
            {searchQuery ? 'No matching files' : 'No open files in workspace'}
          </div>
        ) : (
          filteredTabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800/60 shadow-2xs'
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {getCategoryIcon(tab.category)}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{tab.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <span className="font-mono">{formatFileSize(tab.size)}</span>
                      {tab.liveSyncActive && (
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Sync</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onDownloadTabFile && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDownloadTabFile(tab.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Download file"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Close file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Storage / Memory Usage */}
      <div className="p-2.5 bg-slate-100/80 dark:bg-[#090d16] border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-slate-400" />
            <span>RAM Footprint:</span>
          </span>
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            {formatFileSize(totalMemoryBytes)}
          </span>
        </div>

        {tabs.length > 0 && (
          <button
            onClick={onCloseAllTabs}
            className="w-full text-center py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-[10px] font-medium transition-colors cursor-pointer"
          >
            Close All Files
          </button>
        )}
      </div>
    </aside>
  );
};
