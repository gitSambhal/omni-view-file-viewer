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
import { PptxViewer } from './PptxViewer';
import { MarkdownViewer } from './MarkdownViewer';
import { CodeViewer } from './CodeViewer';
import { DatabaseViewer } from './DatabaseViewer';
import { ImageViewer } from './ImageViewer';
import { MediaViewer } from './MediaViewer';
import { HtmlPreviewViewer } from './HtmlPreviewViewer';
import { JsonXmlViewer } from './JsonXmlViewer';
import { LogViewer } from './LogViewer';
import { FontViewer } from './FontViewer';
import { CertificateViewer } from './CertificateViewer';
import { EbookViewer } from './EbookViewer';
import { GeoJsonViewer } from './GeoJsonViewer';
import { SubtitleViewer } from './SubtitleViewer';
import { HttpRestViewer } from './HttpRestViewer';
import { TextViewer } from './TextViewer';
import { BinaryInspectorViewer } from './BinaryInspectorViewer';

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
    category?: FileCategory;
    isImage?: boolean;
    isAudio?: boolean;
    isVideo?: boolean;
    isPdf?: boolean;
    isDocx?: boolean;
    isExcel?: boolean;
    isPptx?: boolean;
    isDatabase?: boolean;
    isMarkdown?: boolean;
    isHtml?: boolean;
    isCode?: boolean;
    isJson?: boolean;
    isLog?: boolean;
    isSubtitle?: boolean;
    isGeoJson?: boolean;
    isEbook?: boolean;
    isFont?: boolean;
    isCertificate?: boolean;
    isHttp?: boolean;
    isArchive?: boolean;
    isText?: boolean;
    isBinary?: boolean;
    isCsv?: boolean;
    csvRows?: string[][];
    error?: string;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [imageZoom, setImageZoom] = useState<number>(100);
  const [isExportingAll, setIsExportingAll] = useState<boolean>(false);

  // Helper to detect if byte array is printable text
  const isAsciiOrText = (buffer: Uint8Array): boolean => {
    if (buffer.length === 0) return true;
    const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
    let nonPrintable = 0;
    for (let i = 0; i < sample.length; i++) {
      const b = sample[i];
      if (b === 0) return false;
      if (b < 32 && b !== 9 && b !== 10 && b !== 13) {
        nonPrintable++;
      }
    }
    return nonPrintable / sample.length < 0.05;
  };

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
          // Auto-select first readable file if available and <= 15MB for immediate preview
          const firstFile = result.entries.find(e => !e.isFolder && (e.size || 0) <= 15 * 1024 * 1024);
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
      let cleanBuffer: ArrayBuffer;
      try {
        cleanBuffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        ) as ArrayBuffer;
      } catch {
        const copy = new Uint8Array(bytes.length);
        copy.set(bytes);
        cleanBuffer = copy.buffer;
      }
      const ext = getFileExtension(entry.name).toLowerCase();
      const cat = entry.category || detectFileCategory(entry.name);

      // 1. PDF Documents
      if (ext === 'pdf' || cat === 'pdf') {
        const blob = new Blob([cleanBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isPdf: true, blobUrl, category: 'pdf' });
      }
      // 2. Word / DOCX
      else if (['docx', 'doc'].includes(ext) || cat === 'docx') {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isDocx: true, category: 'docx' });
      }
      // 3. PowerPoint & Presentations (PPTX, PPT, ODP, KEY, PPS, PPSX)
      else if (['pptx', 'ppt', 'odp', 'key', 'pps', 'ppsx', 'pot', 'potx'].includes(ext) || cat === 'pptx') {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isPptx: true, category: 'pptx' });
      }
      // 4. Excel / Spreadsheets (XLSX, XLS, ODS, CSV, TSV)
      else if (['xlsx', 'xls', 'ods', 'csv', 'tsv'].includes(ext) || cat === 'excel') {
        let text: string | undefined;
        let rows: string[][] | undefined;
        if (ext === 'csv' || ext === 'tsv') {
          try {
            text = new TextDecoder('utf-8').decode(bytes);
            const delimiter = ext === 'tsv' ? '\t' : ',';
            rows = text
              .split(/\r?\n/)
              .filter(r => r.trim().length > 0)
              .slice(0, 100)
              .map(r => r.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '')));
          } catch {}
        }
        setPreviewData({
          bytes,
          arrayBuffer: cleanBuffer,
          text,
          isExcel: true,
          isCsv: ext === 'csv' || ext === 'tsv',
          csvRows: rows,
          category: 'excel'
        });
      }
      // 5. Database (SQLite, DBF, SQL dumps)
      else if (['sqlite', 'db', 'sqlite3', 'dbf', 'sql', 'dump', 'ddl', 'accdb', 'mdb'].includes(ext) || cat === 'database') {
        let text: string | undefined;
        if (['sql', 'dump', 'ddl'].includes(ext)) {
          text = new TextDecoder('utf-8').decode(bytes);
        }
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isDatabase: true, category: 'database' });
      }
      // 6. Markdown
      else if (['md', 'markdown', 'mdown'].includes(ext) || cat === 'markdown') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isMarkdown: true, category: 'markdown' });
      }
      // 7. HTML Web Pages
      else if (['html', 'htm', 'xhtml'].includes(ext) || cat === 'html') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isHtml: true, category: 'html' });
      }
      // 8. JSON / XML / YAML
      else if (['json', 'xml', 'yaml', 'yml'].includes(ext) || cat === 'json') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isJson: true, category: 'json' });
      }
      // 9. Logs
      else if (['log', 'out', 'err', 'syslog'].includes(ext) || cat === 'log' || entry.name.toLowerCase().endsWith('.log')) {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isLog: true, category: 'log' });
      }
      // 10. Subtitles
      else if (['srt', 'vtt', 'ass', 'ssa', 'sub'].includes(ext) || cat === 'subtitle') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isSubtitle: true, category: 'subtitle' });
      }
      // 11. GeoJSON / Maps
      else if (['geojson', 'gpx', 'kml', 'topojson'].includes(ext) || cat === 'geojson') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isGeoJson: true, category: 'geojson' });
      }
      // 12. E-Books
      else if (['epub', 'mobi', 'azw', 'azw3'].includes(ext) || cat === 'ebook') {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isEbook: true, category: 'ebook' });
      }
      // 13. Fonts
      else if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext) || cat === 'font') {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isFont: true, category: 'font' });
      }
      // 14. Certificates & Keys
      else if (['pem', 'crt', 'cer', 'key', 'pub', 'pfx', 'p12', 'csr'].includes(ext) || cat === 'certificate') {
        let text: string | undefined;
        try { text = new TextDecoder('utf-8').decode(bytes); } catch {}
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isCertificate: true, category: 'certificate' });
      }
      // 15. HTTP / REST Requests
      else if (['http', 'rest'].includes(ext) || cat === 'http') {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isHttp: true, category: 'http' });
      }
      // 16. Images (PNG, JPG, SVG, WEBP, GIF, BMP, ICO)
      else if (
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
            : ext === 'webp'
            ? 'image/webp'
            : ext === 'bmp'
            ? 'image/bmp'
            : 'image/jpeg';
        const blob = new Blob([cleanBuffer], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        let text: string | undefined;
        if (ext === 'svg') {
          try { text = new TextDecoder('utf-8').decode(bytes); } catch {}
        }
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isImage: true, blobUrl, category: 'image' });
      }
      // 17. Audio
      else if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) || cat === 'audio') {
        const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mp4';
        const blob = new Blob([cleanBuffer], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isAudio: true, blobUrl, category: 'audio' });
      }
      // 18. Video
      else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext) || cat === 'video') {
        const blob = new Blob([cleanBuffer], { type: ext === 'webm' ? 'video/webm' : 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isVideo: true, blobUrl, category: 'video' });
      }
      // 19. Nested Archive / Disk Images
      else if (
        ['zip', 'tar', 'gz', 'tgz', 'bz2', '7z', 'rar', 'iso', 'vhd', 'vhdx', 'dmg', 'cab', 'deb', 'ar', 'cpio'].includes(ext) ||
        cat === 'archive'
      ) {
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, isArchive: true, category: 'archive' });
      }
      // 20. Code / Programming
      else if (
        [
          'ts', 'js', 'jsx', 'tsx', 'py', 'sh', 'bash', 'css', 'scss', 'rs', 'go',
          'c', 'cpp', 'h', 'java', 'php', 'rb', 'lua', 'dart', 'swift', 'kt', 'sql'
        ].includes(ext) ||
        cat === 'code'
      ) {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isCode: true, category: 'code' });
      }
      // 21. Plain Text / Config Files
      else if (
        ['txt', 'ini', 'conf', 'env', 'toml', 'cfg', 'properties', 'inf'].includes(ext) ||
        cat === 'text'
      ) {
        const text = new TextDecoder('utf-8').decode(bytes);
        setPreviewData({ bytes, arrayBuffer: cleanBuffer, text, isText: true, category: 'text' });
      }
      // 22. Binary / System / Fallback
      else {
        let text: string | undefined;
        let isTextReadable = false;
        if (isAsciiOrText(bytes)) {
          try {
            text = new TextDecoder('utf-8').decode(bytes);
            isTextReadable = true;
          } catch {}
        }
        setPreviewData({
          bytes,
          arrayBuffer: cleanBuffer,
          text,
          isBinary: true,
          isText: isTextReadable,
          category: isTextReadable ? 'text' : 'binary'
        });
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
      const cleanBuffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer;
      const cat = previewData?.category || activeEntry.category || detectFileCategory(activeEntry.name);
      onOpenFileInNewTab({
        name: activeEntry.displayName || activeEntry.name,
        arrayBuffer: cleanBuffer,
        textContent: previewData?.text,
        category: cat
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
      case 'pptx':
        return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'database':
        return <Database className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'excel':
        return <TableIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'binary':
        return <Binary className="w-4 h-4 text-orange-500 shrink-0" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-indigo-500 shrink-0" />;
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
                                const cleanBuffer = bytes.buffer.slice(
                                  bytes.byteOffset,
                                  bytes.byteOffset + bytes.byteLength
                                ) as ArrayBuffer;
                                const cat = entry.category || detectFileCategory(entry.name);
                                let textContent: string | undefined;
                                if ([
                                  'code', 'html', 'markdown', 'json', 'text', 'log', 'subtitle', 'geojson', 'http', 'certificate'
                                ].includes(cat) || isAsciiOrText(bytes)) {
                                  try {
                                    textContent = new TextDecoder('utf-8').decode(bytes);
                                  } catch {}
                                }
                                onOpenFileInNewTab({
                                  name: entry.displayName || entry.name,
                                  arrayBuffer: cleanBuffer,
                                  textContent,
                                  category: cat
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
                ) : previewData?.isPptx && previewData.arrayBuffer ? (
                  /* PowerPoint PPTX Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <PptxViewer
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
                ) : previewData?.isHtml && previewData.text !== undefined ? (
                  /* HTML Web Page Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <HtmlPreviewViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isJson && previewData.text !== undefined ? (
                  /* JSON / XML / YAML Direct Tree Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <JsonXmlViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isLog && previewData.text !== undefined ? (
                  /* Log Diagnostics Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <LogViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isSubtitle && previewData.text !== undefined ? (
                  /* Subtitle / Caption Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <SubtitleViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isGeoJson && previewData.text !== undefined ? (
                  /* GeoJSON Spatial Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <GeoJsonViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isFont && previewData.arrayBuffer ? (
                  /* Typographic Font Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <FontViewer
                      arrayBuffer={previewData.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isCertificate ? (
                  /* Certificate & Key Inspector Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <CertificateViewer
                      textContent={previewData.text}
                      arrayBuffer={previewData.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isEbook ? (
                  /* E-Book EPUB Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <EbookViewer
                      arrayBuffer={previewData.arrayBuffer}
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isHttp && previewData.text !== undefined ? (
                  /* HTTP & REST Request Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <HttpRestViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isCode && previewData.text !== undefined ? (
                  /* Source Code Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <CodeViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : previewData?.isImage ? (
                  /* Image Studio Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <ImageViewer
                      objectUrl={previewData.blobUrl}
                      arrayBuffer={previewData.arrayBuffer}
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                      size={activeEntry.size}
                    />
                  </div>
                ) : previewData?.isAudio || previewData?.isVideo ? (
                  /* Media Audio / Video Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <MediaViewer
                      objectUrl={previewData.blobUrl}
                      arrayBuffer={previewData.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                      isAudio={Boolean(previewData.isAudio)}
                    />
                  </div>
                ) : previewData?.isArchive && previewData.arrayBuffer ? (
                  /* Nested Archive / Disk Direct In-Memory Recursive Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <ZipViewer
                      arrayBuffer={previewData.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                      onOpenFileInNewTab={onOpenFileInNewTab}
                    />
                  </div>
                ) : previewData?.isText && previewData.text !== undefined ? (
                  /* Text Direct Preview */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <TextViewer
                      textContent={previewData.text}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
                  </div>
                ) : (
                  /* Binary Deep PE/ELF/Mach-O Inspector & Hex Viewer */
                  <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
                    <BinaryInspectorViewer
                      arrayBuffer={previewData?.arrayBuffer}
                      filename={activeEntry.displayName || activeEntry.name}
                    />
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
