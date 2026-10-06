/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Clean Workspace Toolbar
 */

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Copy,
  Binary,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Check,
  ChevronDown
} from 'lucide-react';
import { TabFile, FileCategory } from '../types/file';
import { ReaderSwitcher } from './ReaderSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface WorkspaceToolbarProps {
  activeTab: TabFile;
  onSelectReader: (reader: FileCategory) => void;
  onToggleHexView: () => void;
  onDownloadFile?: () => void;
  onCopyContent?: () => void;
  onPrint?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onSetZoom?: (zoom: number) => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  activeTab,
  onSelectReader,
  onToggleHexView,
  onDownloadFile,
  onCopyContent,
  onPrint,
  isFullscreen = false,
  onToggleFullscreen,
  zoomLevel = 100,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSetZoom
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopyContent) {
      onCopyContent();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (activeTab.textContent) {
      navigator.clipboard.writeText(activeTab.textContent).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const zoomPresets = [50, 75, 90, 100, 125, 150, 200];

  return (
    <div className="h-8.5 px-3 bg-secondary/30 border-b border-border/80 text-muted-foreground select-none shrink-0 relative z-30 flex items-center justify-between gap-2 transition-colors font-sans text-xs">
      {/* Left: Reader mode selector + Hex toggle + Zoom */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar py-0.5">
        <ReaderSwitcher
          activeTab={activeTab}
          onSelectReader={onSelectReader}
        />

        <button
          onClick={onToggleHexView}
          className={`flex items-center gap-1 px-2 h-6 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab.viewMode === 'hex'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle Hex View"
        >
          <Binary className="w-3.5 h-3.5" />
          <span>Hex</span>
        </button>

        <div className="h-3.5 w-px bg-border mx-0.5 shrink-0" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-muted/60 rounded px-1 h-6 shrink-0">
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="w-4.5 h-4.5 rounded hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="px-1 text-[11px] font-mono tabular-nums text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-0.5"
                title="Zoom Presets"
              >
                <span>{zoomLevel}%</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-24 font-sans text-xs">
              {zoomPresets.map(preset => (
                <DropdownMenuItem
                  key={preset}
                  onClick={() => {
                    if (onSetZoom) {
                      onSetZoom(preset);
                    } else if (preset === 100 && onResetZoom) {
                      onResetZoom();
                    }
                  }}
                  className="flex items-center justify-between py-1 cursor-pointer"
                >
                  <span className="font-mono tabular-nums">{preset}%</span>
                  {zoomLevel === preset && <Check className="w-3 h-3 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="w-4.5 h-4.5 rounded hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0 font-sans">
        <span className="hidden sm:inline text-[11px] font-mono text-muted-foreground tabular-nums mr-1">
          {formatSize(activeTab.size)}
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer shrink-0"
          title="Copy content"
          aria-label="Copy"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {onDownloadFile && (
          <button
            onClick={onDownloadFile}
            className="flex items-center gap-1 px-2 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Download file"
            aria-label="Download"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>
        )}

        <button
          onClick={handlePrint}
          className="w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Print document"
          aria-label="Print"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
