/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Minimal & Clean Welcome Workspace (shadcn/ui)
 */

import React, { useState } from 'react';
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
  FileSpreadsheet,
  FileCode2
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
  onNewScratchpad
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-6 my-auto py-4">
        {/* Clean Hero Header */}
        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5 text-xs font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Private & In-Memory • Zero Cloud Uploads</span>
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Universal File Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Inspect, edit, preview, and run 60+ formats directly in your browser.
          </p>
        </div>

        {/* Primary Drop Target Card */}
        <Card
          onClick={onOpenFilePicker}
          className="w-full p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-dashed border-2 hover:border-primary/60 bg-card hover:bg-muted/30 shadow-2xs group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
            <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </div>

          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Drop files here or click to browse
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
            Fast, client-side in-memory parsing. Your data never leaves your device.
          </p>

          {/* Quick Action Buttons inside Drop Zone */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFilePicker();
              }}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse Local</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSamples();
              }}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Sample Files</span>
            </Button>

            {onOpenPasteModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPasteModal();
                }}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paste</span>
              </Button>
            )}

            {onOpenUrlModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenUrlModal();
                }}
                className="gap-1.5 h-8 text-xs font-medium"
              >
                <Link2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>From URL</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Minimal Instant Scratchpads Row */}
        {onNewScratchpad && (
          <div className="w-full space-y-2 text-left">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
                Quick Scratchpads
              </span>
              {onOpenSupportedFormats && (
                <button
                  onClick={onOpenSupportedFormats}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
                >
                  <span>60+ Supported Formats</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Card
                onClick={() => onNewScratchpad('ts')}
                className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-muted/40 shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    TypeScript
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">In-browser NPM runner</p>
              </Card>

              <Card
                onClick={() => onNewScratchpad('python')}
                className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-muted/40 shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Python
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Pyodide 3.12 runtime</p>
              </Card>

              <Card
                onClick={() => onNewScratchpad('sql')}
                className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-muted/40 shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    SQLite / SQL
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Interactive query console</p>
              </Card>

              <Card
                onClick={() => onNewScratchpad('markdown')}
                className="p-3 cursor-pointer hover:border-primary/50 transition-all hover:bg-muted/40 shadow-2xs group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Markdown
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Live GFM document notes</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
