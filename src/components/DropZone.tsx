/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Viewer - Clean, Uncluttered Universal Drop Target
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
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';

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
      className={`flex-1 flex flex-col items-center justify-center p-6 md:p-12 transition-colors duration-200 overflow-y-auto ${
        isDragging
          ? 'bg-primary/5'
          : 'bg-background'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload files"
      />

      <div className="w-full max-w-xl flex flex-col items-center text-center space-y-6">
        {/* Drop Card */}
        <div
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            } else {
              onOpenFilePicker();
            }
          }}
          className={`w-full p-10 sm:p-14 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-200 border-2 select-none ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-dashed border-border hover:border-primary/50 hover:bg-muted/40 bg-card shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Upload className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            Drop your files here
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
            Preview PDFs, Office documents, code, SQLite databases, media, and archives instantly.
          </p>

          {/* Primary Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5" onClick={e => e.stopPropagation()}>
            <Button
              size="sm"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
                else onOpenFilePicker();
              }}
              className="gap-2 px-4 h-8 text-xs font-medium cursor-pointer shadow-xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse Files</span>
              <kbd className="hidden sm:inline-flex items-center px-1 text-[9px] font-mono text-primary-foreground/90 bg-black/20 rounded">
                ⌘O
              </kbd>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSamples}
              className="gap-1.5 px-3.5 h-8 text-xs font-medium cursor-pointer border-border hover:text-primary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Sample Files</span>
            </Button>

            {onOpenPasteModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPasteModal}
                className="gap-1.5 px-3 h-8 text-xs font-medium cursor-pointer border-border hover:text-emerald-600 transition-colors"
                title="Paste text from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Paste</span>
              </Button>
            )}

            {onOpenUrlModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenUrlModal}
                className="gap-1.5 px-3 h-8 text-xs font-medium cursor-pointer border-border hover:text-cyan-600 transition-colors"
                title="Fetch file from URL"
              >
                <Link2 className="w-3.5 h-3.5 text-cyan-500" />
                <span className="hidden sm:inline">URL</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Scratchpads - Clean, Quiet Row */}
        {onNewScratchpad && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-medium text-foreground">New Blank Workspace</span>
              {onOpenSupportedFormats && (
                <button
                  onClick={onOpenSupportedFormats}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
                >
                  <Layers className="w-3 h-3" />
                  <span>All 60+ Formats</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onNewScratchpad('markdown')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/50 hover:border-primary/50 text-left transition-colors cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-primary">Markdown</div>
                  <div className="text-[10px] text-muted-foreground truncate">Notes & docs</div>
                </div>
              </button>

              <button
                onClick={() => onNewScratchpad('python')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/50 hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
              >
                <Terminal className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-emerald-500">Python 3.12</div>
                  <div className="text-[10px] text-muted-foreground truncate">Wasm sandbox</div>
                </div>
              </button>

              <button
                onClick={() => onNewScratchpad('sql')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/50 hover:border-purple-500/50 text-left transition-colors cursor-pointer group"
              >
                <Database className="w-4 h-4 text-purple-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-purple-500">SQLite</div>
                  <div className="text-[10px] text-muted-foreground truncate">Query tables</div>
                </div>
              </button>

              <button
                onClick={() => onNewScratchpad('ts')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/50 hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
              >
                <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-cyan-500">TypeScript</div>
                  <div className="text-[10px] text-muted-foreground truncate">AST runner</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Quiet Privacy & Local Guarantee */}
        <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>100% In-Memory & Client-Side · No files are ever sent to a server</span>
        </div>
      </div>
    </div>
  );
};
