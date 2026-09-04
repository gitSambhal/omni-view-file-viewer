/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Command Palette & Quick Search
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  FolderOpen,
  Link2,
  Package,
  Zap,
  RefreshCw,
  Code2,
  Layers,
  Sparkles,
  Sun,
  Moon,
  FileCode,
  Database,
  Terminal,
  FileText,
  Trash2,
  Download,
  X,
  Keyboard,
  ArrowRight,
  Plus
} from 'lucide-react';
import { TabFile, FileCategory } from '../types/file';
import { Theme } from '../hooks/useTheme';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
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
  onOpenSupportedFormats: () => void;
  onLoadSampleFiles: () => void;
  onOpenHexForCurrentTab: () => void;
  onNewScratchpad: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
  theme: Theme;
  onToggleTheme: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Open Files' | 'Scratchpads & Sandboxes' | 'Tools & Utilities' | 'Actions';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onOpenFilePicker,
  onOpenUrlModal,
  onOpenNpmTester,
  onOpenRunnersGuide,
  onOpenLiveSyncDashboard,
  onOpenSupportedFormats,
  onLoadSampleFiles,
  onOpenHexForCurrentTab,
  onNewScratchpad,
  theme,
  onToggleTheme
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build command items dynamically
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // 1. Open Tabs
    tabs.forEach(tab => {
      list.push({
        id: `tab-${tab.id}`,
        title: tab.name,
        description: `Switch to open tab (${(tab.size / 1024).toFixed(1)} KB, ${tab.category.toUpperCase()})`,
        category: 'Open Files',
        icon: <FileCode className="w-4 h-4 text-blue-500" />,
        shortcut: tab.id === activeTabId ? 'Active' : undefined,
        action: () => {
          onSelectTab(tab.id);
          onClose();
        }
      });
    });

    // 2. New Scratchpads
    list.push(
      {
        id: 'scratchpad-ts',
        title: 'New TypeScript & NPM Scratchpad',
        description: 'Instant in-memory TS sandbox with live AST execution and CDN packages',
        category: 'Scratchpads & Sandboxes',
        icon: <Code2 className="w-4 h-4 text-blue-500" />,
        action: () => {
          onNewScratchpad('ts');
          onClose();
        }
      },
      {
        id: 'scratchpad-python',
        title: 'New Python 3.12 Sandbox',
        description: 'Run Python code and data science algorithms via in-browser Pyodide',
        category: 'Scratchpads & Sandboxes',
        icon: <Terminal className="w-4 h-4 text-amber-500" />,
        action: () => {
          onNewScratchpad('python');
          onClose();
        }
      },
      {
        id: 'scratchpad-sql',
        title: 'New SQLite & SQL Query Console',
        description: 'Run relational queries, table schemas, and aggregations in-memory',
        category: 'Scratchpads & Sandboxes',
        icon: <Database className="w-4 h-4 text-emerald-500" />,
        action: () => {
          onNewScratchpad('sql');
          onClose();
        }
      },
      {
        id: 'scratchpad-md',
        title: 'New Markdown Notes Document',
        description: 'Formatted document with GFM tables, syntax blocks, and live preview',
        category: 'Scratchpads & Sandboxes',
        icon: <FileText className="w-4 h-4 text-purple-500" />,
        action: () => {
          onNewScratchpad('markdown');
          onClose();
        }
      },
      {
        id: 'scratchpad-html',
        title: 'New HTML5 & Canvas Sandbox',
        description: 'Live interactive web document with JS script runner and preview',
        category: 'Scratchpads & Sandboxes',
        icon: <Layers className="w-4 h-4 text-rose-500" />,
        action: () => {
          onNewScratchpad('html');
          onClose();
        }
      }
    );

    // 3. Tools & Utilities
    list.push(
      {
        id: 'tool-npm',
        title: 'NPM Package Tester & Live CDN Playground',
        description: 'Search, import, and test any arbitrary npm package directly in browser',
        category: 'Tools & Utilities',
        icon: <Package className="w-4 h-4 text-amber-500" />,
        shortcut: 'NPM',
        action: () => {
          onOpenNpmTester();
          onClose();
        }
      },
      {
        id: 'tool-url',
        title: 'Open File from Direct URL / GitHub',
        description: 'Fetch and view remote files, APIs, or GitHub raw links via client CORS',
        category: 'Tools & Utilities',
        icon: <Link2 className="w-4 h-4 text-blue-500" />,
        shortcut: 'URL',
        action: () => {
          onOpenUrlModal();
          onClose();
        }
      },
      {
        id: 'tool-open-file',
        title: 'Open Local Files from Storage',
        description: 'Select files from your computer (PDF, Excel, SQLite, Code, Media, Archives)',
        category: 'Tools & Utilities',
        icon: <FolderOpen className="w-4 h-4 text-blue-600" />,
        shortcut: 'Ctrl+O',
        action: () => {
          onOpenFilePicker();
          onClose();
        }
      },
      {
        id: 'tool-runners',
        title: 'Code Runners & Execution Guide',
        description: 'View supported runtimes (Python 3.12, TypeScript, SQLite, Bash, HTML)',
        category: 'Tools & Utilities',
        icon: <Zap className="w-4 h-4 text-emerald-500" />,
        action: () => {
          onOpenRunnersGuide();
          onClose();
        }
      },
      {
        id: 'tool-livesync',
        title: 'Live Sync File Watcher Dashboard',
        description: 'Manage auto-reloading local files connected via File System Access API',
        category: 'Tools & Utilities',
        icon: <RefreshCw className="w-4 h-4 text-emerald-500" />,
        action: () => {
          onOpenLiveSyncDashboard();
          onClose();
        }
      },
      {
        id: 'tool-hex',
        title: 'Toggle Hex Byte Inspector',
        description: 'Inspect raw binary bytes, offsets, and ASCII representation for active file',
        category: 'Tools & Utilities',
        icon: <Code2 className="w-4 h-4 text-cyan-500" />,
        action: () => {
          onOpenHexForCurrentTab();
          onClose();
        }
      },
      {
        id: 'tool-formats',
        title: 'Supported Formats Directory (60+ Types)',
        description: 'View document, data, media, and archive format compatibility list',
        category: 'Tools & Utilities',
        icon: <Layers className="w-4 h-4 text-indigo-500" />,
        action: () => {
          onOpenSupportedFormats();
          onClose();
        }
      },
      {
        id: 'tool-demos',
        title: 'Load Interactive Demo Files',
        description: 'Load sample PDF, Markdown, Excel, SQLite, Python, Audio, and Video files',
        category: 'Tools & Utilities',
        icon: <Sparkles className="w-4 h-4 text-purple-500" />,
        action: () => {
          onLoadSampleFiles();
          onClose();
        }
      },
      {
        id: 'tool-theme',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        description: 'Toggle application color scheme',
        category: 'Actions',
        icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />,
        shortcut: 'Theme',
        action: () => {
          onToggleTheme();
          onClose();
        }
      }
    );

    if (tabs.length > 0) {
      list.push({
        id: 'action-close-all',
        title: 'Close All Open Tabs',
        description: `Close all ${tabs.length} open workspace files`,
        category: 'Actions',
        icon: <Trash2 className="w-4 h-4 text-rose-500" />,
        action: () => {
          onCloseAllTabs();
          onClose();
        }
      });
    }

    return list;
  }, [
    tabs,
    activeTabId,
    theme,
    onSelectTab,
    onClose,
    onNewScratchpad,
    onOpenNpmTester,
    onOpenUrlModal,
    onOpenFilePicker,
    onOpenRunnersGuide,
    onOpenLiveSyncDashboard,
    onOpenHexForCurrentTab,
    onOpenSupportedFormats,
    onLoadSampleFiles,
    onToggleTheme,
    onCloseAllTabs
  ]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase().trim();
    return commands.filter(
      cmd =>
        cmd.title.toLowerCase().includes(lower) ||
        cmd.description.toLowerCase().includes(lower) ||
        cmd.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Keep selected item visible in list
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-[100000] bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-[10vh] p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="command-palette-modal"
        className="w-full max-w-2xl bg-white dark:bg-[#0c121e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, tool name, or search open files..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No matching commands or files found</p>
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
                Try searching for "NPM", "Python", "SQL", "Open", "Theme", or file extensions.
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{cmd.title}</span>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  {cmd.shortcut ? (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                        isSelected
                          ? 'bg-blue-200/60 dark:bg-blue-800/80 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cmd.shortcut}
                    </span>
                  ) : (
                    isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span className="text-[10px]">OmniView Command Hub</span>
        </div>
      </div>
    </div>
  );
};
