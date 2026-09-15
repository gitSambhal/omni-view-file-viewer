/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Workspace Sidebar & File Explorer (shadcn/ui)
 */

import React, { useState, useMemo } from 'react';
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
  Code2,
  ClipboardPaste
} from 'lucide-react';
import { TabFile, FileCategory } from '../types/file';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
  onOpenPasteModal?: () => void;
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
  onOpenPasteModal,
  onNewScratchpad,
  onDownloadTabFile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

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
        return <Binary className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    }
  };

  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tab.name.toLowerCase().includes(q);
        const matchesExt = tab.extension.toLowerCase().includes(q);
        const matchesCat = tab.category.toLowerCase().includes(q);
        if (!matchesName && !matchesExt && !matchesCat) return false;
      }

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
      className="w-64 sm:w-72 bg-card border-r border-border flex flex-col shrink-0 h-full select-none z-10 transition-colors text-card-foreground"
    >
      {/* Sidebar Header */}
      <div className="h-11 px-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
          <h2 className="text-xs font-semibold tracking-wide text-foreground truncate">
            Workspace
          </h2>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-medium">
            {tabs.length}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* New Item Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                title="Add New File or Scratchpad"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onOpenFilePicker}>
                <FolderOpen className="w-3.5 h-3.5 text-blue-500 mr-2" />
                <span>Open Local File</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenUrlModal}>
                <Link2 className="w-3.5 h-3.5 text-cyan-500 mr-2" />
                <span>Open from URL</span>
              </DropdownMenuItem>
              {onOpenPasteModal && (
                <DropdownMenuItem onClick={onOpenPasteModal}>
                  <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                  <span>Paste from Clipboard</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>New Scratchpad</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onNewScratchpad('ts')}>
                <Code2 className="w-3.5 h-3.5 text-blue-500 mr-2" />
                <span>TypeScript & NPM</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewScratchpad('python')}>
                <Terminal className="w-3.5 h-3.5 text-amber-500 mr-2" />
                <span>Python 3.12 (Wasm)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewScratchpad('sql')}>
                <Database className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                <span>SQLite Query</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewScratchpad('markdown')}>
                <FileText className="w-3.5 h-3.5 text-purple-500 mr-2" />
                <span>Markdown Notes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleOpen}
            className="text-muted-foreground hover:text-foreground"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="p-2 space-y-2 border-b border-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter files..."
            className="h-8 pl-8 pr-7 text-xs bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
                  ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <ScrollArea className="flex-1 p-2">
        <button
          onClick={() => onSelectTab('welcome')}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTabId === 'welcome' || activeTabId === null
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>App Overview & Landing</span>
        </button>

        {filteredTabs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            {searchQuery ? 'No matching files' : 'No open files in workspace'}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredTabs.map(tab => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${
                    isActive
                      ? 'bg-accent text-accent-foreground border border-border shadow-2xs font-medium'
                      : 'hover:bg-muted text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    {getCategoryIcon(tab.category)}
                    <div className="min-w-0">
                      <p className="text-xs truncate leading-tight">{tab.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <span className="font-mono">{formatFileSize(tab.size)}</span>
                        {tab.liveSyncActive && (
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            <span>Sync</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onDownloadTabFile && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={e => {
                          e.stopPropagation();
                          onDownloadTabFile(tab.id);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                        title="Download file"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={e => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                      title="Close file"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Footer Storage / Memory Usage */}
      <div className="p-2.5 bg-muted/40 border-t border-border text-[11px] text-muted-foreground space-y-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-muted-foreground" />
            <span>RAM Footprint:</span>
          </span>
          <span className="font-mono font-medium text-foreground">
            {formatFileSize(totalMemoryBytes)}
          </span>
        </div>

        {tabs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseAllTabs}
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-7 text-xs font-medium"
          >
            Close All Files
          </Button>
        )}
      </div>
    </aside>
  );
};
