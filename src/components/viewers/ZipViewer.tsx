/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Universal Archive & Virtual Disk Viewer
 * Supports ZIP, TAR, GZ, 7Z, RAR, VHD, VHDX, ISO, DMG, CAB, AR, DEB, CPIO
 * Direct in-memory previewing without disk extraction!
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Archive,
  HardDrive,
  Disc,
  File,
  Download,
  Search,
  FileText,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Binary,
  Folder,
  FolderOpen,
  Music,
  Video,
  Table as TableIcon,
  Code2,
  Database,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ArrowRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import {
  parseArchive,
  ArchiveEntry,
  ParsedArchive,
  DiskPartitionInfo
} from '../../services/archiveParser';
import { formatFileSize, detectFileCategory, getFileExtension } from '../../services/fileDetector';
import { FileCategory, TabFile } from '../../types/file';
import JSZip from 'jszip';
import { PdfViewer } from './PdfViewer';
import { DocxViewer } from './DocxViewer';
import { ExcelViewer } from './ExcelViewer';
import { MarkdownViewer } from './MarkdownViewer';
import { CodeViewer } from './CodeViewer';
import { DatabaseViewer } from './DatabaseViewer';

interface ZipViewerProps {
  arrayBuffer?: ArrayBuffer;
  filename: string;
  onOpenFileInNewTab?: (extracted: {
    name: string;
    arrayBuffer?: ArrayBuffer;
    textContent?: string;
    category?: FileCategory;
  }) => void;
}

type CategoryFilter = 'all' | 'documents' | 'code' | 'images' | 'data';

export const ZipViewer: React.FC<ZipViewerProps> = ({
  arrayBuffer,
  filename,
  onOpenFileInNewTab
}) => {
  const [parsedArchive, setParsedArchive] = useState<ParsedArchive | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showDiskInfo, setShowDiskInfo] = useState<boolean>(true);

  // Active preview state
  const [activeEntry, setActiveEntry] = useState<ArchiveEntry | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<{
    text?: string;
    bytes?: Uint8Array;
    arrayBuffer?: ArrayBuffer;
    blobUrl?: string;
    isImage?: boolean;
    isAudio?: boolean;
    isVideo?: boolean;
    isPdf?: boolean;
    isDocx?: boolean;
    isExcel?: boolean;
    isDatabase?: boolean;
    isMarkdown?: boolean;
    isCode?: boolean;
    isCsv?: boolean;
    csvRows?: string[][];
    isHex?: boolean;
    error?: string;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [imageZoom, setImageZoom] = useState<number>(100);
  const [isExportingAll, setIsExportingAll] = useState<boolean>(false);

  // Parse archive or virtual disk whenever arrayBuffer changes
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!arrayBuffer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await parseArchive(arrayBuffer, filename);
        if (isMounted) {
          setParsedArchive(result);
          // Auto-select first readable file if available for immediate direct preview
          const firstFile = result.entries.find(e => !e.isFolder);
          if (firstFile) {
            handleSelectEntry(firstFile);
          }
        }
      } catch (err: any) {
        console.error('Failed to parse archive/disk image:', err);
        if (isMounted) {
          setError(err.message || 'Failed to read container structure');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
      if (previewData?.blobUrl) {
        URL.revokeObjectURL(previewData.blobUrl);
      }
    };
  }, [arrayBuffer, filename]);

  // Clean up object URLs when preview changes
  useEffect(() => {
    return () => {
      if (previewData?.blobUrl) {
        URL.revokeObjectURL(previewData.blobUrl);
      }
    };
  }, [previewData]);

  // Handle direct in-memory extraction and inspection of a file entry
  const handleSelectEntry = async (entry: ArchiveEntry) => {
    if (entry.isFolder) return;
    setActiveEntry(entry);
    setExtracting(true);
    setImageZoom(100);

    try {
      const bytes = await entry.extract();
      const cleanBuffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer;
      const ext = getFileExtension(entry.name).toLowerCase();
      const cat = entry.category || detectFileCategory(entry.name);

      // Check for image
      if (
        ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext) ||
        cat === 'image'
      ) {
        const mime =
          ext === 'svg'
            ? 'image/svg+xml'
            : ext === 'png'
            ? 'image/png'
            : ext === 'gif'
            ? 'image/gif'
            : 'image/jpeg';
        const blob = new Blob([cleanBuffer], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isImage: true, blobUrl });
      }
      // Check for PDF
      else if (ext === 'pdf' || cat === 'pdf') {
        const blob = new Blob([cleanBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isPdf: true, blobUrl });
      }
      // Check for Word / DOCX
      else if (['docx', 'doc'].includes(ext) || cat === 'docx') {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isDocx: true });
      }
      // Check for Excel / Spreadsheet
      else if (['xlsx', 'xls', 'ods'].includes(ext) || cat === 'excel') {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isExcel: true });
      }
      // Check for Database
      else if (['sqlite', 'db', 'sqlite3', 'dbf', 'sql', 'dump'].includes(ext) || cat === 'database') {
        let text: string | undefined;
        if (ext === 'sql' || ext === 'dump') {
          text = new TextDecoder('utf-8').decode(bytes);
        }
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isDatabase: true });
      }
      // Check for Markdown
      else if (['md', 'markdown'].includes(ext) || cat === 'markdown') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, text, isMarkdown: true });
      }
      // Check for Audio
      else if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) || cat === 'audio') {
        const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : 'audio/ogg';
        const blob = new Blob([cleanBuffer], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isAudio: true, blobUrl });
      }
      // Check for Video
      else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext) || cat === 'video') {
        const blob = new Blob([cleanBuffer], { type: 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isVideo: true, blobUrl });
      }
      // Check for CSV / TSV
      else if (ext === 'csv' || ext === 'tsv') {
        const text = new TextDecoder('utf-8').decode(bytes);
        const delimiter = ext === 'tsv' ? '\t' : ',';
        const rows = text
          .split(/\r?\n/)
          .filter(r => r.trim().length > 0)
          .slice(0, 100)
          .map(r => r.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '')));
        setPreviewData({ bytes, text, isCsv: true, csvRows: rows });
      }
      // Text / Code / JSON / Config / Scripts
      else if (
        [
          'txt', 'ts', 'js', 'jsx', 'tsx', 'py', 'json', 'yaml', 'yml',
          'html', 'htm', 'css', 'scss', 'sh', 'bash', 'ini', 'conf', 'xml', 'log',
          'toml', 'env', 'rs', 'go', 'c', 'cpp', 'h', 'java', 'php', 'rb'
        ].includes(ext) ||
        ['code', 'text', 'json', 'log', 'html'].includes(cat)
      ) {
        const text = new TextDecoder('utf-8').decode(bytes);
        const isCodeCategory = ['code', 'html'].includes(cat) || ['ts', 'js', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'scss', 'sh', 'bash', 'rs', 'go', 'c', 'cpp', 'java', 'php', 'rb'].includes(ext);
        setPreviewData({ bytes, text, isCode: isCodeCategory });
      }
      // Binary / Hex / Executable fallback
      else {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isHex: true });
      }
    } catch (e: any) {
      console.error('Failed to preview archive file entry in-memory:', e);
      setPreviewData({ error: e?.message || 'Error previewing this file in-memory.' });
    } finally {
      setExtracting(false);
    }
  };

  // Direct download of selected file
  const handleDownloadActiveFile = async () => {
    if (!activeEntry) return;
    try {
      const bytes = await activeEntry.extract();
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeEntry.displayName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  // Direct copy text content
  const handleCopyText = () => {
    if (previewData?.text) {
      navigator.clipboard.writeText(previewData.text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open active in-memory extracted file in new OmniView workspace tab
  const handleOpenInWorkspaceTab = async () => {
    if (!activeEntry || !onOpenFileInNewTab) return;
    try {
      const bytes = await activeEntry.extract();
      onOpenFileInNewTab({
        name: activeEntry.name,
        arrayBuffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        textContent: previewData?.text,
        category: activeEntry.category
      });
    } catch (e) {
      console.error('Could not promote file to new workspace tab:', e);
    }
  };

  // Export all entries as a single standard ZIP file
  const handleExportAllAsZip = async () => {
    if (!parsedArchive) return;
    try {
      setIsExportingAll(true);
      const exportZip = new JSZip();

      for (const entry of parsedArchive.entries) {
        if (!entry.isFolder) {
          const data = await entry.extract();
          exportZip.file(entry.name, data);
        }
      }

      const zipBlob = await exportZip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const cleanBase = filename.replace(/\.[^/.]+$/, '');
      a.download = `${cleanBase}_extracted.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export all files:', e);
    } finally {
      setIsExportingAll(false);
    }
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!parsedArchive) return [];
    return parsedArchive.entries.filter(entry => {
      // Search match
      const matchesSearch =
        !searchTerm ||
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.displayName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (categoryFilter === 'all') return true;
      if (entry.isFolder) return true;

      const cat = entry.category;
      if (categoryFilter === 'documents') {
        return ['pdf', 'docx', 'pptx', 'text', 'markdown', 'ebook'].includes(cat);
      }
      if (categoryFilter === 'code') {
        return ['code', 'html', 'json', 'log', 'http'].includes(cat);
      }
      if (categoryFilter === 'images') {
        return cat === 'image';
      }
      if (categoryFilter === 'data') {
        return ['database', 'excel', 'geojson'].includes(cat);
      }
      return true;
    });
  }, [parsedArchive, searchTerm, categoryFilter]);

  const getFormatIcon = (format?: string) => {
    switch (format) {
      case 'vhd':
      case 'vhdx':
      case 'dmg':
        return <HardDrive className="w-4 h-4 text-primary" />;
      case 'iso':
        return <Disc className="w-4 h-4 text-amber-500" />;
      default:
        return <Archive className="w-4 h-4 text-primary" />;
    }
  };

  const getEntryIcon = (entry: ArchiveEntry) => {
    if (entry.isFolder) {
      return <Folder className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    switch (entry.category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />;
      case 'code':
      case 'html':
        return <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />;
      case 'markdown':
      case 'text':
      case 'docx':
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'database':
        return <Database className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'excel':
        return <TableIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background text-foreground select-none font-sans">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Mounting container & parsing file structure...</p>
        <p className="text-xs text-muted-foreground mt-1">Reading in-memory sector allocations without extraction</p>
      </div>
    );
  }

  if (error || !parsedArchive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background text-foreground font-sans">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-3">
          <Archive className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold">Unable to Parse Container</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md text-center">
          {error || 'This archive or disk image could not be decoded.'}
        </p>
      </div>
    );
  }

  const { metadata } = parsedArchive;
  const isDiskImage = ['vhd', 'vhdx', 'iso', 'dmg'].includes(metadata.format);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-background text-foreground select-none overflow-hidden font-sans">
      {/* Top Archive Information Header */}
      <div className="px-3.5 py-2 bg-card border-b border-border flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            {getFormatIcon(metadata.format)}
            <span className="font-semibold truncate">{metadata.formatLabel}</span>
          </div>

          <span aria-hidden="true" className="text-border">·</span>

          <span className="text-xs text-muted-foreground">
            <strong className="text-foreground font-mono font-medium">{metadata.totalFiles}</strong> files
            {metadata.totalFolders > 0 && (
              <>
                {' '}· <strong className="text-foreground font-mono font-medium">{metadata.totalFolders}</strong> folders
              </>
            )}
          </span>

          <span aria-hidden="true" className="text-border">·</span>

          <span className="text-xs text-muted-foreground hidden sm:inline">
            Size: <strong className="text-foreground font-mono font-medium">{formatFileSize(metadata.totalUncompressedSize)}</strong>
          </span>

          {metadata.compressionRatio > 0 && (
            <>
              <span aria-hidden="true" className="text-border hidden sm:inline">·</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium hidden sm:inline">
                {metadata.compressionRatio}% compressed
              </span>
            </>
          )}

          {isDiskImage && metadata.diskInfo && (
            <button
              onClick={() => setShowDiskInfo(prev => !prev)}
              className="text-[11px] text-primary hover:underline ml-1 cursor-pointer font-medium flex items-center gap-0.5"
            >
              <span>{showDiskInfo ? 'Hide Disk Specs' : 'View Disk Specs'}</span>
            </button>
          )}
        </div>

        {/* Global Export All Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportAllAsZip}
            disabled={isExportingAll || metadata.totalFiles === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/80 hover:bg-secondary text-foreground text-xs font-medium rounded-md border border-border/80 transition-colors cursor-pointer disabled:opacity-50"
            title="Download entire archive contents as a standard ZIP"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{isExportingAll ? 'Packaging...' : 'Export All as ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Virtual Disk & Partition HUD (for VHD / VHDX / ISO) */}
      {isDiskImage && showDiskInfo && metadata.diskInfo && (
        <div className="px-3.5 py-2 bg-secondary/30 border-b border-border/80 text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 shrink-0 font-sans">
          {metadata.diskInfo.diskType && (
            <div className="flex items-center gap-1">
              <span className="text-foreground font-medium">Type:</span>
              <span>{metadata.diskInfo.diskType}</span>
            </div>
          )}
          {metadata.diskInfo.virtualSize && (
            <div className="flex items-center gap-1">
              <span className="text-foreground font-medium">Virtual Capacity:</span>
              <span className="font-mono text-foreground">{formatFileSize(metadata.diskInfo.virtualSize)}</span>
            </div>
          )}
          {metadata.diskInfo.geometry && (
            <div className="flex items-center gap-1 hidden md:flex">
              <span className="text-foreground font-medium">CHS Geometry:</span>
              <span className="font-mono">{metadata.diskInfo.geometry.cylinders}c / {metadata.diskInfo.geometry.heads}h / {metadata.diskInfo.geometry.sectorsPerTrack}s</span>
            </div>
          )}
          {metadata.diskInfo.partitions && metadata.diskInfo.partitions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-foreground font-medium">Partitions:</span>
              <div className="flex items-center gap-1">
                {metadata.diskInfo.partitions.map(p => (
                  <span
                    key={p.index}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-mono text-foreground"
                    title={`Partition ${p.index}: ${p.type} (${formatFileSize(p.sizeBytes)}), Start LBA: ${p.startLba}`}
                  >
                    {p.bootable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    <span>P{p.index}: {p.type}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Dual-Pane Container */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Archive Files List & Directory Explorer */}
        <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col min-h-0 border-r border-border bg-card/40 shrink-0">
          {/* Search & Category Filter Toolbar */}
          <div className="p-2.5 border-b border-border/80 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search archive files..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-7.5 pl-8 pr-7 bg-secondary/50 text-xs text-foreground placeholder:text-muted-foreground rounded-md border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-md text-[11px]">
              {(['all', 'documents', 'code', 'images', 'data'] as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-1 text-center py-0.5 font-medium rounded capitalize cursor-pointer transition-colors ${
                    categoryFilter === cat
                      ? 'bg-card text-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat === 'documents' ? 'docs' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files Table List */}
          <div className="flex-1 min-h-0 overflow-auto divide-y divide-border/60">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No matching files found in this container.
              </div>
            ) : (
              filteredEntries.map(entry => {
                const isSelected = activeEntry?.id === entry.id;

                return (
                  <div
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-primary/10 border-l-2 border-primary text-foreground'
                        : 'hover:bg-secondary/60 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {getEntryIcon(entry)}
                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-1.5">
                          <span className={entry.isFolder ? 'font-semibold text-primary' : ''}>
                            {entry.name}
                          </span>
                        </div>
                        {entry.path && (
                          <div className="text-[10px] text-muted-foreground truncate">
                            in {entry.path}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {entry.isFolder ? 'Folder' : formatFileSize(entry.uncompressedSize || entry.size)}
                      </span>

                      {!entry.isFolder && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleSelectEntry(entry);
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Direct Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {onOpenFileInNewTab && (
                            <button
                              onClick={async e => {
                                e.stopPropagation();
                                const bytes = await entry.extract();
                                onOpenFileInNewTab({
                                  name: entry.name,
                                  arrayBuffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
                                  category: entry.category
                                });
                              }}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary"
                              title="Open in Workspace Tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Direct In-Memory Content Previewer (Without Extraction) */}
        <div className="flex-1 min-h-0 flex flex-col bg-background overflow-hidden">
          {activeEntry ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Preview Action Header */}
              <div className="px-3.5 py-2 bg-card border-b border-border/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground truncate">
                    {getEntryIcon(activeEntry)}
                    <span className="truncate">{activeEntry.name}</span>
                  </div>

                  <span aria-hidden="true" className="text-border">·</span>

                  <span className="text-xs text-muted-foreground font-mono">
                    {formatFileSize(activeEntry.uncompressedSize || activeEntry.size)}
                  </span>
                </div>

                {/* Direct File Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenFileInNewTab && (
                    <button
                      onClick={handleOpenInWorkspaceTab}
                      className="flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                      title="Promote this file to a full workspace tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Tab</span>
                    </button>
                  )}

                  {previewData?.text && (
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-1 px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium rounded-md border border-border/70 transition-colors cursor-pointer"
                      title="Copy text content"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleDownloadActiveFile}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium rounded-md border border-border/70 transition-colors cursor-pointer"
                    title="Download extracted file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </button>

                  <button
                    onClick={() => setActiveEntry(null)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Close preview"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Direct Render Stage */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-background">
                {extracting ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Extracting file stream in-memory...</span>
                  </div>
                ) : previewData?.error ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <h4 className="text-sm font-semibold text-foreground">Preview Error</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">{previewData.error}</p>
                  </div>
                ) : previewData?.isPdf && previewData.arrayBuffer ? (
                  /* PDF Direct In-Memory Preview using native PDF.js canvas engine */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <PdfViewer
                      arrayBuffer={previewData.arrayBuffer}
                      objectUrl={previewData.blobUrl}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isDocx && previewData.arrayBuffer ? (
                  /* Word DOCX Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <DocxViewer
                      arrayBuffer={previewData.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isExcel && previewData.arrayBuffer ? (
                  /* Excel Spreadsheet Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <ExcelViewer
                      arrayBuffer={previewData.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isDatabase && previewData.arrayBuffer ? (
                  /* Database Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <DatabaseViewer
                      arrayBuffer={previewData.arrayBuffer}
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isMarkdown && previewData.text !== undefined ? (
                  /* Markdown Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <MarkdownViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isCode && previewData.text !== undefined ? (
                  /* Code Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <CodeViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isImage ? (
                  /* Image Direct Preview */
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-3 overflow-auto">
                    <div className="flex items-center gap-1 bg-card border border-border px-2 py-1 rounded-md text-xs shrink-0">
                      <button
                        onClick={() => setImageZoom(z => Math.max(25, z - 25))}
                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono tabular-nums px-1.5">{imageZoom}%</span>
                      <button
                        onClick={() => setImageZoom(z => Math.min(300, z + 25))}
                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto p-4 bg-muted/20 rounded-xl border border-border/60">
                      <img
                        src={previewData.blobUrl}
                        alt={activeEntry.displayName}
                        style={{ transform: `scale(${imageZoom / 100})`, transformOrigin: 'center center' }}
                        className="max-w-full max-h-full object-contain shadow-md rounded transition-transform"
                      />
                    </div>
                  </div>
                ) : previewData?.isAudio ? (
                  /* Audio Direct Preview */
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-xs text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Music className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold truncate">{activeEntry.displayName}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Direct in-memory audio playback</p>
                      </div>
                      <audio controls src={previewData.blobUrl} className="w-full" />
                    </div>
                  </div>
                ) : previewData?.isVideo ? (
                  /* Video Direct Preview */
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <video
                      controls
                      src={previewData.blobUrl}
                      className="max-w-full max-h-full rounded-lg shadow-md border border-border"
                    />
                  </div>
                ) : previewData?.isCsv && previewData.csvRows ? (
                  /* Tabular CSV / Spreadsheet Direct Preview */
                  <div className="w-full h-full flex flex-col min-h-0 overflow-auto p-4">
                    <div className="w-full h-full flex flex-col min-h-0 overflow-auto bg-card rounded-lg border border-border">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="bg-secondary/70 text-foreground border-b border-border">
                            {previewData.csvRows[0]?.map((col, idx) => (
                              <th key={idx} className="p-2.5 font-semibold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {previewData.csvRows.slice(1).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 text-muted-foreground whitespace-nowrap">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : previewData?.text !== undefined ? (
                  /* Text Direct Preview */
                  <div className="w-full h-full flex flex-col min-h-0 p-4">
                    <div className="w-full h-full flex flex-col min-h-0 bg-card rounded-lg border border-border overflow-hidden">
                      <div className="px-3 py-1.5 bg-secondary/50 border-b border-border flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{activeEntry.name.split('.').pop()?.toUpperCase() || 'TEXT'} Source Stream</span>
                        <span className="font-mono">
                          {previewData.text.split('\n').length} lines · {previewData.text.length} chars
                        </span>
                      </div>
                      <pre className="flex-1 p-3.5 text-xs font-mono text-foreground whitespace-pre-wrap overflow-auto leading-relaxed select-text">
                        {previewData.text}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Hex Byte Inspector Preview */
                  <div className="w-full h-full flex flex-col min-h-0 p-4">
                    <div className="w-full h-full flex flex-col min-h-0 bg-card rounded-lg border border-border overflow-hidden">
                      <div className="px-3 py-1.5 bg-secondary/50 border-b border-border text-[11px] font-mono text-muted-foreground">
                        Memory Byte Stream ({previewData?.bytes?.length || 0} bytes)
                      </div>
                      <div className="flex-1 p-3 overflow-auto font-mono text-[11px] leading-tight select-text text-foreground">
                        {previewData?.bytes ? (
                          Array.from(previewData.bytes.slice(0, 1024)).reduce<string[]>((acc, byte, idx) => {
                            const lineIdx = Math.floor(idx / 16);
                            if (!acc[lineIdx]) {
                              const offsetStr = (lineIdx * 16).toString(16).padStart(6, '0');
                              acc[lineIdx] = `${offsetStr}:  `;
                            }
                            acc[lineIdx] += byte.toString(16).padStart(2, '0') + ' ';
                            return acc;
                          }, []).map((line, lIdx) => (
                            <div key={lIdx} className="hover:bg-muted/30 px-1 rounded">
                              {line}
                            </div>
                          ))
                        ) : (
                          <span>No binary data</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty selection placeholder */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Direct In-Memory Preview</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Click any file from the explorer on the left to preview documents, images, code, SQLite tables, or media directly in-memory without extraction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
