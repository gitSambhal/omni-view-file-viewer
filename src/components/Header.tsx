/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Clean, Serene Executive Top Bar
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Code2,
  Database,
  Terminal,
  Link2,
  Package,
  Search,
  PanelLeft,
  ChevronDown,
  Info,
  ClipboardPaste,
  FileCode,
  FileText,
  Check,
  MoreVertical,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { useAccentColor } from '../hooks/useAccentColor';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
  onOpenPasteModal?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onNewScratchpad?: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
  liveSyncCount: number;
  isSyncing?: boolean;
  activeFileName?: string | null;
  activeFileCategory?: string | null;
  onDownloadCurrentFile?: () => void;
  onRenameCurrentFile?: (newName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenFilePicker,
  onLoadSampleFiles,
  onOpenChangelog,
  onOpenLiveSyncDashboard,
  onOpenSupportedFormats,
  onOpenUrlModal,
  onOpenRunnersGuide,
  onOpenNpmTester,
  onOpenCommandPalette,
  onOpenPasteModal,
  onToggleSidebar,
  onNewScratchpad,
  liveSyncCount,
  activeFileName,
  onRenameCurrentFile
}) => {
  const { accent, setAccent, accentOptions, activeOption } = useAccentColor();
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleDraft, setTitleDraft] = useState<string>('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(activeFileName || '');
  }, [activeFileName]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== activeFileName && onRenameCurrentFile) {
      onRenameCurrentFile(trimmed);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitleDraft(activeFileName || '');
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="h-11 px-3 md:px-4 bg-card border-b border-border/80 text-foreground flex items-center justify-between gap-3 select-none transition-colors z-40 shrink-0 font-sans">
      {/* Left: Sidebar Toggle + Brand Logo + Active File */}
      <div className="flex items-center gap-2 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
            title="Toggle Sidebar (⌘B)"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Clean Logo */}
        <a
          href="/"
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          title="OmniView File Studio"
        >
          <div className="w-5.5 h-5.5 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs shadow-2xs">
            <Layers className="w-3 h-3" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            OmniView
          </span>
        </a>

        {/* Active Document Breadcrumb */}
        {activeFileName && (
          <div className="flex items-center gap-1.5 min-w-0 pl-1 text-sm">
            <span className="text-border">/</span>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                className="font-medium text-xs text-foreground bg-muted px-1.5 py-0.5 rounded outline-none border border-primary max-w-[200px] truncate"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group/name flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted/70 cursor-pointer transition-colors max-w-[180px] sm:max-w-xs truncate"
                title="Click to rename"
              >
                <span className="font-medium text-xs text-foreground truncate">
                  {activeFileName}
                </span>
                <Edit2 className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0" />
              </div>
            )}

            {/* Live sync pulse */}
            {liveSyncCount > 0 && (
              <span
                onClick={onOpenLiveSyncDashboard}
                className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-emerald-500/20"
                title={`${liveSyncCount} file(s) synchronized`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Syncing</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Calm Command Search Bar */}
      <div className="hidden sm:flex items-center">
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-sans transition-colors cursor-pointer border border-border/60 hover:border-border min-w-[200px] lg:min-w-[260px]"
            title="Search files, formats & commands (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">Search commands or files...</span>
            <kbd className="ml-auto inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground bg-card rounded border border-border/80">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Controls & Primary Action */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Accent Color Picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={`Accent: ${activeOption.label}`}
              aria-label="Theme Accent Color"
            >
              <span className={`w-3 h-3 rounded-full ${activeOption.previewClass}`} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 font-sans text-xs">
            <DropdownMenuLabel className="text-xs font-semibold">Theme Accent</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {accentOptions.map(opt => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => setAccent(opt.id)}
                className="flex items-center justify-between cursor-pointer py-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.previewClass}`} />
                  <span>{opt.label}</span>
                </div>
                {accent === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="More options"
              aria-label="More"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 font-sans text-xs">
            <DropdownMenuItem onClick={onLoadSampleFiles}>
              <Sparkles className="w-3.5 h-3.5 text-purple-500 mr-2" />
              <span>Load Sample Files</span>
            </DropdownMenuItem>

            {onOpenSupportedFormats && (
              <DropdownMenuItem onClick={onOpenSupportedFormats}>
                <Layers className="w-3.5 h-3.5 text-primary mr-2" />
                <span>Supported Formats (60+)</span>
              </DropdownMenuItem>
            )}

            {onNewScratchpad && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] text-muted-foreground">New Scratchpad</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onNewScratchpad('markdown')}>
                  <FileText className="w-3.5 h-3.5 text-blue-500 mr-2" />
                  <span>Blank Document</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewScratchpad('ts')}>
                  <Code2 className="w-3.5 h-3.5 text-cyan-500 mr-2" />
                  <span>TypeScript Sandbox</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewScratchpad('python')}>
                  <Terminal className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                  <span>Python 3.12 (Wasm)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewScratchpad('sql')}>
                  <Database className="w-3.5 h-3.5 text-purple-500 mr-2" />
                  <span>SQLite Query Table</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            {onOpenUrlModal && (
              <DropdownMenuItem onClick={onOpenUrlModal}>
                <Link2 className="w-3.5 h-3.5 text-cyan-500 mr-2" />
                <span>Fetch from URL</span>
              </DropdownMenuItem>
            )}

            {onOpenPasteModal && (
              <DropdownMenuItem onClick={onOpenPasteModal}>
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                <span>Paste from Clipboard</span>
              </DropdownMenuItem>
            )}

            {onOpenNpmTester && (
              <DropdownMenuItem onClick={onOpenNpmTester}>
                <Package className="w-3.5 h-3.5 text-red-500 mr-2" />
                <span>NPM Package Tester</span>
              </DropdownMenuItem>
            )}

            {onOpenRunnersGuide && (
              <DropdownMenuItem onClick={onOpenRunnersGuide}>
                <Terminal className="w-3.5 h-3.5 text-amber-500 mr-2" />
                <span>Wasm Guide</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onOpenChangelog}>
              <Info className="w-3.5 h-3.5 text-primary mr-2" />
              <span>Release Notes (v4.3.0)</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a
                href="https://suhail.top"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                <span>Created by Suhail Akhtar</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Primary Action Button */}
        <Button
          onClick={onOpenFilePicker}
          size="sm"
          className="h-7 px-2.5 rounded-md text-xs font-medium gap-1.5 shadow-2xs cursor-pointer font-sans"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Open</span>
        </Button>
      </div>
    </header>
  );
};
