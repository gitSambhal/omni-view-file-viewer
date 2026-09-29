/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Viewer - Landing Page & Universal File Drop Target (shadcn/ui)
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  Sparkles,
  Link2,
  ClipboardPaste,
  Code2,
  Terminal,
  Database,
  FileText,
  ShieldCheck,
  ArrowRight,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onOpenFilePicker: () => void;
  onLoadSamples: () => void;
  onOpenSupportedFormats?: () => void;
  onOpenUrlModal?: () => void;
  onOpenPasteModal?: () => void;
  onOpenRunnersGuide?: () => void;
  onOpenNpmTester?: () => void;
  onNewScratchpad?: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onOpenFilePicker,
  onLoadSamples,
  onOpenSupportedFormats,
  onOpenUrlModal,
  onOpenPasteModal,
  onOpenRunnersGuide,
  onOpenNpmTester,
  onNewScratchpad
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-10 transition-colors duration-200 overflow-y-auto ${
        isDragging
          ? 'bg-primary/5 border-2 border-dashed border-primary'
          : 'bg-background'
      }`}
    >
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-6 my-auto py-6">
        {/* Hidden Multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload files"
        />

        {/* Hero Branding & Privacy Guarantee */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>100% Client-Side</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>In-Memory Parsing</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>Zero Server Uploads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground font-sans">
            OmniView File Viewer
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Inspect, edit, preview, and run 60+ formats directly in your browser with multi-tab workspace, live file sync, and syntax-aware readers.
          </p>
        </div>

        {/* Primary Upload Drop Zone */}
        <Card
          className={`w-full p-8 sm:p-10 flex flex-col items-center justify-center transition-all duration-200 border-2 rounded-2xl ${
            isDragging
              ? 'border-primary border-dashed bg-primary/10 shadow-lg scale-[1.01]'
              : 'border-dashed border-border hover:border-primary/60 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4 shadow-2xs transition-transform group-hover:scale-105">
            <Upload className="w-7 h-7" />
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
            Drag & drop files here to get started
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
            Support for PDF, DOCX, XLSX, PPTX, Code, SQLite, Markdown, Audio, Video, Archives & more.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              size="default"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  onOpenFilePicker();
                }
              }}
              className="gap-2 h-9 px-4.5 text-xs font-semibold cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse Local Files</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-primary-foreground/90 bg-black/20 rounded ml-1">
                ⌘O
              </kbd>
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={onLoadSamples}
              className="gap-2 h-9 px-4 text-xs font-medium cursor-pointer hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Open Sample Files</span>
              <span className="text-[10px] text-muted-foreground font-mono">10+ Demos</span>
            </Button>

            {onOpenPasteModal && (
              <Button
                variant="outline"
                size="default"
                onClick={onOpenPasteModal}
                className="gap-2 h-9 px-3.5 text-xs font-medium cursor-pointer hover:border-emerald-500/40 hover:text-emerald-600 transition-colors"
                title="Create file from clipboard text (⌘V)"
              >
                <ClipboardPaste className="w-4 h-4 text-emerald-500" />
                <span>Paste Text</span>
              </Button>
            )}

            {onOpenUrlModal && (
              <Button
                variant="outline"
                size="default"
                onClick={onOpenUrlModal}
                className="gap-2 h-9 px-3.5 text-xs font-medium cursor-pointer hover:border-cyan-500/40 hover:text-cyan-600 transition-colors"
                title="Fetch file from remote URL"
              >
                <Link2 className="w-4 h-4 text-cyan-500" />
                <span>From URL</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Instant Scratchpads & Sandboxes */}
        {onNewScratchpad && (
          <div className="w-full space-y-2.5 text-left">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Or start with an in-browser sandbox</span>
              </span>
              {onOpenSupportedFormats && (
                <button
                  onClick={onOpenSupportedFormats}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View 60+ Supported Formats</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Card
                onClick={() => onNewScratchpad('ts')}
                className="p-3.5 cursor-pointer rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-blue-500/10 shrink-0">
                    <Code2 className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    TypeScript
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Live AST & NPM runner</p>
              </Card>

              <Card
                onClick={() => onNewScratchpad('python')}
                className="p-3.5 cursor-pointer rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-amber-500/10 shrink-0">
                    <Terminal className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Python 3.12
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">In-browser Pyodide Wasm</p>
              </Card>

              <Card
                onClick={() => onNewScratchpad('sql')}
                className="p-3.5 cursor-pointer rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-emerald-500/10 shrink-0">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    SQLite / SQL
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Interactive query console</p>
              </Card>

              <Card
                onClick={() => onNewScratchpad('markdown')}
                className="p-3.5 cursor-pointer rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-purple-500/10 shrink-0">
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Markdown
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Live GFM document editor</p>
              </Card>
            </div>
          </div>
        )}

        {/* Feature Guarantees Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Multi-Tab Workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Disk Live Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hex Byte Inspector</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Offline Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
