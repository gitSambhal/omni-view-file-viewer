/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Header & Application Navigation (shadcn/ui)
 */

import React from 'react';
import {
  FolderOpen,
  RefreshCw,
  Sun,
  Moon,
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
  ClipboardPaste,
  FileCode,
  FileText,
  Palette,
  Check
} from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { useAccentColor } from '../hooks/useAccentColor';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
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
  onOpenPasteModal,
  isSidebarOpen = true,
  onToggleSidebar,
  onNewScratchpad,
  liveSyncCount,
  isSyncing = false
}) => {
  const { accent, setAccent, accentOptions, activeOption } = useAccentColor();

  return (
    <header className="flex items-center justify-between px-3 md:px-4 py-2 bg-card border-b border-border text-foreground select-none gap-3 transition-colors z-40 shrink-0">
      {/* Left: Sidebar Toggle, Brand & Attribution */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <Button
            variant={isSidebarOpen ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={onToggleSidebar}
            title="Toggle Explorer Sidebar (⌘B)"
            aria-label="Toggle Workspace Sidebar"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </Button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6.5 h-6.5 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0 font-bold">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-semibold text-xs tracking-tight text-foreground font-sans truncate">
                OmniView
              </span>
              <span className="text-[11px] font-normal text-muted-foreground hidden sm:inline">
                Studio
              </span>
            </div>

            <span className="text-muted-foreground/60 text-xs hidden sm:inline">·</span>

            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
              by{' '}
              <a
                href="https://suhail.top"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary font-medium transition-colors"
              >
                Suhail Akhtar
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Center: Apple Spotlight Search Trigger (No Glass Blur) */}
      {onOpenCommandPalette && (
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer min-w-[260px] lg:min-w-[340px] shadow-2xs group"
          title="Search files, actions & tools (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          <span className="text-xs text-muted-foreground font-normal truncate">
            Search files, tools & commands...
          </span>
          <kbd className="ml-auto inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-card rounded border border-border shadow-2xs">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Right Controls: Open Menu + Tools Menu + Theme Toggle */}
      <div className="flex items-center gap-1.5">
        {/* Unified "Open" Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="h-7.5 gap-1.5 px-3 text-xs">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onOpenFilePicker}>
              <FolderOpen className="w-4 h-4 text-blue-500 mr-2" />
              <div>
                <p className="font-medium text-xs">Local Files</p>
                <p className="text-[10px] text-muted-foreground">Browse disk (⌘O)</p>
              </div>
            </DropdownMenuItem>
            {onOpenUrlModal && (
              <DropdownMenuItem onClick={onOpenUrlModal}>
                <Link2 className="w-4 h-4 text-cyan-500 mr-2" />
                <div>
                  <p className="font-medium text-xs">Fetch from URL</p>
                  <p className="text-[10px] text-muted-foreground">Remote file or GitHub raw</p>
                </div>
              </DropdownMenuItem>
            )}
            {onOpenPasteModal && (
              <DropdownMenuItem onClick={onOpenPasteModal}>
                <ClipboardPaste className="w-4 h-4 text-emerald-500 mr-2" />
                <div>
                  <p className="font-medium text-xs">Paste from Clipboard</p>
                  <p className="text-[10px] text-muted-foreground">Text, code or images (⌘V)</p>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onLoadSampleFiles}>
              <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
              <div>
                <p className="font-medium text-xs">Load Sample Files</p>
                <p className="text-[10px] text-muted-foreground">PDF, Excel, DB, Python</p>
              </div>
            </DropdownMenuItem>

            {onNewScratchpad && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Instant Scratchpads</DropdownMenuLabel>
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
                  <span>SQLite & AlaSQL</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNewScratchpad('markdown')}>
                  <FileText className="w-3.5 h-3.5 text-purple-500 mr-2" />
                  <span>Markdown Notes</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Unified "Tools" Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7.5 gap-1.5 px-3 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Tools</span>
              {liveSyncCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`} />
                  <span>{liveSyncCount}</span>
                </span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {onOpenNpmTester && (
              <DropdownMenuItem onClick={onOpenNpmTester}>
                <Package className="w-4 h-4 text-amber-500 mr-2" />
                <div>
                  <p className="font-medium text-xs">NPM Package Tester</p>
                  <p className="text-[10px] text-muted-foreground">Dynamic in-memory CDN</p>
                </div>
              </DropdownMenuItem>
            )}
            {onOpenRunnersGuide && (
              <DropdownMenuItem onClick={onOpenRunnersGuide}>
                <Zap className="w-4 h-4 text-emerald-500 mr-2" />
                <div>
                  <p className="font-medium text-xs">Code Runners Guide</p>
                  <p className="text-[10px] text-muted-foreground">Python, TSX, SQLite</p>
                </div>
              </DropdownMenuItem>
            )}
            {onOpenLiveSyncDashboard && (
              <DropdownMenuItem onClick={onOpenLiveSyncDashboard}>
                <RefreshCw className={`w-4 h-4 text-blue-500 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                <div>
                  <p className="font-medium text-xs">Live Sync Telemetry</p>
                  <p className="text-[10px] text-muted-foreground">Watch local disk files</p>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onOpenHexForCurrentTab}>
              <Code2 className="w-4 h-4 text-cyan-500 mr-2" />
              <div>
                <p className="font-medium text-xs">Hex Byte Inspector</p>
                <p className="text-[10px] text-muted-foreground">Raw offsets & bytes</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onOpenSupportedFormats && (
              <DropdownMenuItem onClick={onOpenSupportedFormats}>
                <Layers className="w-3.5 h-3.5 text-blue-500 mr-2" />
                <span>Supported Formats (60+)</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onOpenChangelog}>
              <Info className="w-3.5 h-3.5 text-primary mr-2" />
              <span>Release Notes (v3.3.0)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-4 mx-0.5" />

        {/* Dynamic Primary Accent Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground relative rounded-full"
              title={`Accent Color: ${activeOption.label}`}
              aria-label="Change Accent Color"
            >
              <Palette className="w-3.5 h-3.5 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
              Primary Accent Color
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {accentOptions.map(opt => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => setAccent(opt.id)}
                className="flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                    style={{ backgroundColor: theme === 'dark' ? opt.darkHex : opt.lightHex }}
                  />
                  <span className={accent === opt.id ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                    {opt.label}
                  </span>
                </div>
                {accent === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark / Light Mode Toggle */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle color theme"
          className="rounded-full"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-600" />}
        </Button>
      </div>
    </header>
  );
};
