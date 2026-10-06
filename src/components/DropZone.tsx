/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Universal Launch Page - Focused on Popular File Formats (Docs, Office, PDF, Images, Media)
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
  Table,
  Presentation,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2
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

  // The Curated Most Popular Format Categories
  const POPULAR_FORMAT_GROUPS = [
    {
      id: 'pdf-docs',
      title: 'Docs & PDF',
      badge: 'PDF · Word · ODT',
      icon: FileText,
      iconColor: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      formats: ['.pdf', '.docx', '.doc', '.odt', '.rtf', '.txt']
    },
    {
      id: 'spreadsheets',
      title: 'Spreadsheets',
      badge: 'Excel · ODS · CSV',
      icon: Table,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      formats: ['.xlsx', '.xls', '.ods', '.csv', '.tsv', '.numbers']
    },
    {
      id: 'presentations',
      title: 'Presentations',
      badge: 'PowerPoint · ODP',
      icon: Presentation,
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      formats: ['.pptx', '.ppt', '.odp', '.key', '.ppsx']
    },
    {
      id: 'images',
      title: 'Images & Photos',
      badge: 'PNG · JPG · SVG',
      icon: ImageIcon,
      iconColor: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      formats: ['.png', '.jpg', '.webp', '.svg', '.gif', '.psd']
    },
    {
      id: 'media',
      title: 'Audio & Video',
      badge: 'MP4 · MP3 · WAV',
      icon: Film,
      iconColor: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      formats: ['.mp4', '.webm', '.mkv', '.mp3', '.wav', '.flac']
    },
    {
      id: 'code-archives',
      title: 'Code & Archives',
      badge: 'ZIP · Code · JSON',
      icon: Archive,
      iconColor: 'text-cyan-500 dark:text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      formats: ['.zip', '.rar', '.7z', '.ts', '.py', '.json']
    }
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 transition-colors duration-200 overflow-y-auto ${
        isDragging ? 'bg-primary/5' : 'bg-background'
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

      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-6">
        {/* Main Hero Drop Target */}
        <div
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            } else {
              onOpenFilePicker();
            }
          }}
          className={`w-full p-8 sm:p-12 flex flex-col items-center justify-center rounded-3xl cursor-pointer transition-all duration-200 border-2 select-none ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-dashed border-border hover:border-primary/50 hover:bg-muted/40 bg-card shadow-sm'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Drop your files here to view
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
            Fast, 100% private in-memory viewer for PDF, Office docs, spreadsheets, presentations, images, audio, video, code, and archives.
          </p>

          {/* Primary Action Buttons */}
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
            onClick={e => e.stopPropagation()}
          >
            <Button
              size="sm"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
                else onOpenFilePicker();
              }}
              className="gap-2 px-4 h-9 text-xs font-medium cursor-pointer shadow-xs"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse Files</span>
              <kbd className="hidden sm:inline-flex items-center px-1 text-[9px] font-mono text-primary-foreground/90 bg-black/20 rounded">
                ⌘O
              </kbd>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSamples}
              className="gap-1.5 px-4 h-9 text-xs font-medium cursor-pointer border-border hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Try Sample Files</span>
            </Button>

            {onOpenPasteModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPasteModal}
                className="gap-1.5 px-3.5 h-9 text-xs font-medium cursor-pointer border-border hover:text-emerald-600 transition-colors"
                title="Paste text from clipboard"
              >
                <ClipboardPaste className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Paste</span>
              </Button>
            )}

            {onOpenUrlModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenUrlModal}
                className="gap-1.5 px-3.5 h-9 text-xs font-medium cursor-pointer border-border hover:text-cyan-600 transition-colors"
                title="Fetch file from URL"
              >
                <Link2 className="w-4 h-4 text-cyan-500" />
                <span className="hidden sm:inline">URL</span>
              </Button>
            )}
          </div>
        </div>

        {/* Most Popular Formats Showcase */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Popular File Formats
            </span>
            {onOpenSupportedFormats && (
              <button
                onClick={onOpenSupportedFormats}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All 150+ Formats</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {POPULAR_FORMAT_GROUPS.map(group => {
              const Icon = group.icon;
              return (
                <div
                  key={group.id}
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                    else onOpenFilePicker();
                  }}
                  className="flex flex-col p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/40 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${group.bgColor} ${group.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                      {group.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {group.title}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {group.formats.map(fmt => (
                      <span
                        key={fmt}
                        className="text-[10px] font-mono text-muted-foreground/90 bg-muted/40 px-1 rounded"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Blank Scratchpads */}
        {onNewScratchpad && (
          <div className="w-full space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span className="font-medium text-muted-foreground text-[11px]">
                Or start with a blank scratchpad
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onNewScratchpad('markdown')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-muted/50 hover:border-primary/40 text-left transition-colors cursor-pointer group"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                    Markdown
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">Notes & docs</div>
                </div>
              </button>

              <button
                onClick={() => onNewScratchpad('python')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-muted/50 hover:border-emerald-500/40 text-left transition-colors cursor-pointer group"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-emerald-500">
                    Python
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">Wasm sandbox</div>
                </div>
              </button>

              <button
                onClick={() => onNewScratchpad('sql')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-muted/50 hover:border-purple-500/40 text-left transition-colors cursor-pointer group"
              >
                <Database className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-purple-500">
                    SQLite
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">Database query</div>
                </div>
              </button>

              <button
                onClick={() => onNewScratchpad('ts')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-card/60 hover:bg-muted/50 hover:border-cyan-500/40 text-left transition-colors cursor-pointer group"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground truncate group-hover:text-cyan-500">
                    TypeScript
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">Script editor</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Quiet Privacy & Local Guarantee */}
        <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>100% In-Memory & Client-Side · No files are ever uploaded or transmitted</span>
        </div>
      </div>
    </div>
  );
};
