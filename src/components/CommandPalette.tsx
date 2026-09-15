/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Command Palette & Quick Search (shadcn/ui)
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
  ArrowRight,
  ClipboardPaste,
  X
} from 'lucide-react';
import { TabFile } from '../types/file';
import { Theme } from '../hooks/useTheme';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

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
  onOpenPasteModal?: () => void;
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
  onCloseAllTabs,
  onOpenFilePicker,
  onOpenUrlModal,
  onOpenPasteModal,
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

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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
        description: 'Select files from your computer (PDF, Excel, SQLite, DBF, Code, Media, Archives)',
        category: 'Tools & Utilities',
        icon: <FolderOpen className="w-4 h-4 text-blue-600" />,
        shortcut: 'Ctrl+O',
        action: () => {
          onOpenFilePicker();
          onClose();
        }
      },
      {
        id: 'tool-paste-file',
        title: 'Paste & Open File from Clipboard',
        description: 'Create and open a new file tab from clipboard text, code, JSON, or images',
        category: 'Tools & Utilities',
        icon: <ClipboardPaste className="w-4 h-4 text-emerald-500" />,
        shortcut: 'Ctrl+V',
        action: () => {
          if (onOpenPasteModal) onOpenPasteModal();
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
        title: 'Supported Formats Directory (65+ Types)',
        description: 'View document, data, media, database, and archive format compatibility list',
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
        description: 'Load sample PDF, DBF, MDB, Markdown, Excel, SQLite, Python, Audio, and Video files',
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
    onOpenPasteModal,
    onOpenRunnersGuide,
    onOpenLiveSyncDashboard,
    onOpenHexForCurrentTab,
    onOpenSupportedFormats,
    onLoadSampleFiles,
    onToggleTheme,
    onCloseAllTabs
  ]);

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

  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden border bg-background shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>

        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, tool name, or search open files..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <ScrollArea className="max-h-[60vh]">
          <div ref={listRef} className="p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-sm font-medium">No matching commands or files found</p>
                <p className="text-xs mt-1 opacity-70">
                  Try searching for "NPM", "Python", "SQL", "DBF", "Theme", or file names.
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
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {cmd.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate">{cmd.title}</span>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground shrink-0">
                            {cmd.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {cmd.description}
                        </p>
                      </div>
                    </div>

                    {cmd.shortcut ? (
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        {cmd.shortcut}
                      </Badge>
                    ) : (
                      isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-background rounded border border-border font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-background rounded border border-border font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span className="text-[10px]">OmniView Command Hub</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
