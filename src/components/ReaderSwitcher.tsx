/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Reader Switcher (shadcn/ui)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Code,
  FileText,
  Binary,
  Layers,
  ChevronDown,
  Table,
  MapPin,
  Captions,
  BookOpen,
  Database,
  Video,
  Music,
  Image as ImageIcon,
  Archive,
  Terminal,
  FileCheck,
  Globe,
  Cpu,
  Type,
  ShieldCheck,
  Search,
  X,
  Presentation
} from 'lucide-react';
import { FileCategory, TabFile } from '../types/file';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface ReaderSwitcherProps {
  activeTab: TabFile;
  onSelectReader: (reader: FileCategory) => void;
}

export interface ReaderOption {
  id: FileCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  categoryGroup: 'Code & Web' | 'Structured & Data' | 'Documents & Media' | 'Low-Level & System';
  supportedExtensions?: string[];
  keywords?: string[];
}

export const READER_OPTIONS: ReaderOption[] = [
  // 1. Code & Web
  {
    id: 'code',
    label: 'Code / Syntax Highlighter',
    description: 'Interactive editor with syntax coloring, line height, Prettier formatting & ligatures',
    icon: Code,
    color: 'text-indigo-500',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'cpp', 'c', 'h', 'cs', 'java', 'html', 'css', 'scss', 'json', 'yaml', 'yml', 'toml', 'sh', 'sql', 'md', 'env'],
    keywords: ['editor', 'syntax', 'programming', 'developer', 'source', 'script', 'highlight']
  },
  {
    id: 'html',
    label: 'Live HTML & Web Preview',
    description: 'Interactive sandbox iframe with DOM tree inspector, mobile viewport & live console',
    icon: Globe,
    color: 'text-blue-500',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['html', 'htm', 'xhtml', 'svg', 'xml'],
    keywords: ['web', 'browser', 'dom', 'iframe', 'sandbox', 'render', 'website']
  },
  {
    id: 'markdown',
    label: 'Markdown Formatter',
    description: 'Formatted Markdown with headings, tables, task lists, code blocks & typography',
    icon: FileText,
    color: 'text-emerald-500',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx'],
    keywords: ['readme', 'documentation', 'notes', 'gfm', 'formatted']
  },
  {
    id: 'http',
    label: 'HTTP & REST Studio',
    description: 'Interactive API request runner, headers, payload, response tabs & cURL generator',
    icon: Globe,
    color: 'text-teal-500',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['http', 'rest'],
    keywords: ['api', 'request', 'postman', 'curl', 'endpoint', 'fetch']
  },

  // 2. Structured & Data
  {
    id: 'json',
    label: 'JSON / Data Tree Inspector',
    description: 'Interactive expandable key-value node tree, path breadcrumbs & formatted output',
    icon: Layers,
    color: 'text-blue-500',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['json', 'jsonc', 'json5', 'xml', 'yaml', 'yml', 'toml', 'geojson'],
    keywords: ['tree', 'object', 'array', 'nodes', 'properties', 'parse', 'schema']
  },
  {
    id: 'excel',
    label: 'Spreadsheet / Table Grid',
    description: 'Interactive tabular dataset grid with sorting, filtering, columns, and CSV export',
    icon: Table,
    color: 'text-emerald-500',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['csv', 'tsv', 'xlsx', 'xls', 'ods'],
    keywords: ['table', 'spreadsheet', 'grid', 'rows', 'columns', 'excel', 'data']
  },
  {
    id: 'database',
    label: 'Database & SQL Console',
    description: 'Execute live SQLite/DBF/MDB/SQL queries, inspect table schema definitions & query results',
    icon: Database,
    color: 'text-teal-500',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['sql', 'sqlite', 'sqlite3', 'db', 'dbf', 'mdb', 'accdb', 'fdb'],
    keywords: ['sql', 'sqlite', 'dbf', 'foxpro', 'mdb', 'access', 'query', 'tables', 'database', 'relational']
  },
  {
    id: 'geojson',
    label: 'GeoJSON / Spatial Map',
    description: 'Spatial coordinate properties, interactive feature map, and geometry inspector',
    icon: MapPin,
    color: 'text-rose-500',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['geojson', 'topojson', 'kml'],
    keywords: ['map', 'coordinates', 'gis', 'spatial', 'latitude', 'longitude', 'features']
  },

  // 3. Documents & Media
  {
    id: 'pdf',
    label: 'PDF Document Reader',
    description: 'Vector-sharp PDF page viewer with zoom, thumbnail sidebar, and text search',
    icon: FileText,
    color: 'text-rose-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['pdf'],
    keywords: ['pdf', 'document', 'pages', 'acrobat', 'print', 'vector']
  },
  {
    id: 'docx',
    label: 'Word Document Reader',
    description: 'Formatted DOCX document preview with styles, tables, headings, and images',
    icon: FileText,
    color: 'text-blue-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['docx', 'doc'],
    keywords: ['word', 'document', 'office', 'text', 'microsoft']
  },
  {
    id: 'pptx',
    label: 'PowerPoint Presentation',
    description: 'Slide-by-slide presentation deck carousel with presenter notes and layout',
    icon: Presentation,
    color: 'text-amber-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['pptx', 'ppt'],
    keywords: ['slides', 'presentation', 'powerpoint', 'deck', 'office']
  },
  {
    id: 'ebook',
    label: 'Document & E-Book Reader',
    description: 'Comfortable typography reader with font scaling, chapters, and reading stats',
    icon: BookOpen,
    color: 'text-indigo-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['epub', 'rtf'],
    keywords: ['book', 'reading', 'epub', 'novel', 'literature']
  },
  {
    id: 'image',
    label: 'Image & EXIF Inspector',
    description: 'Zoom, pan, rotation, metadata, dimensions, and color palette inspection',
    icon: ImageIcon,
    color: 'text-pink-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg', 'tiff', 'avif'],
    keywords: ['picture', 'photo', 'graphic', 'exif', 'dimensions', 'pixels']
  },
  {
    id: 'video',
    label: 'Cinema Video Player Studio',
    description: 'Hardware-accelerated cinema player with full-screen edge-to-edge mode, stream inspector & speeds',
    icon: Video,
    color: 'text-purple-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'm4v', '3gp', 'ts', 'mts', 'ogv', 'vob'],
    keywords: ['movie', 'clip', 'video', 'player', 'media', 'mp4', 'mkv', 'matroska', 'cinema', 'stream']
  },
  {
    id: 'audio',
    label: 'Studio Audio Player & Turntable',
    description: 'Interactive vinyl turntable, waveform visualizer, 24-bit lossless FLAC inspector, and timeline scrubber',
    icon: Music,
    color: 'text-violet-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'opus', 'wma', 'aiff', 'alac', 'ac3', 'ape', 'mid', 'midi'],
    keywords: ['sound', 'song', 'music', 'track', 'audio', 'waveform', 'lossless', 'flac', 'opus', 'hi-res', 'turntable']
  },
  {
    id: 'subtitle',
    label: 'Subtitles & Captions',
    description: 'SRT / VTT timestamped dialogue cue list, search, and jump-to-time view',
    icon: Captions,
    color: 'text-cyan-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['srt', 'vtt', 'sub', 'ass'],
    keywords: ['subtitles', 'captions', 'dialogue', 'timing', 'cues', 'transcription']
  },
  {
    id: 'archive',
    label: 'Archive / Zip Explorer',
    description: 'Browse compressed archive file trees, folder directories, and extract entries',
    icon: Archive,
    color: 'text-amber-500',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['zip', 'jar', 'tar', 'gz', '7z', 'rar'],
    keywords: ['zip', 'compressed', 'tar', 'folder', 'unzip', 'directory']
  },

  // 4. Low-Level & System
  {
    id: 'hex',
    label: 'Hex / Byte Inspector',
    description: 'Raw memory byte inspector with 16-column grid, ASCII pane and offset navigation',
    icon: Binary,
    color: 'text-purple-500',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['*'],
    keywords: ['raw', 'bytes', 'memory', 'binary', 'dump', 'offset', 'ascii', 'low-level']
  },
  {
    id: 'binary',
    label: 'Binary & DLL PE Inspector',
    description: 'Deep header analysis, PE sections, architecture (x86/x64), and symbol scanner',
    icon: Cpu,
    color: 'text-purple-500',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['exe', 'dll', 'so', 'dylib', 'wasm', 'bin', 'class', 'elf', 'sys', 'o', 'obj'],
    keywords: ['executable', 'pe', 'coff', 'elf', 'mach-o', 'headers', 'sections', 'symbols']
  },
  {
    id: 'font',
    label: 'Font & Glyph Specimen',
    description: 'Interactive font specimen waterfall, full Unicode glyph grid, and size controls',
    icon: Type,
    color: 'text-pink-500',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['ttf', 'otf', 'woff', 'woff2'],
    keywords: ['font', 'typeface', 'glyphs', 'unicode', 'typography', 'waterfall']
  },
  {
    id: 'certificate',
    label: 'Certificate & Key Inspector',
    description: 'X.509 certificates, RSA/ECC public/private keys, and PEM block validation',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['crt', 'pem', 'cer', 'key', 'pub', 'csr'],
    keywords: ['crypto', 'ssl', 'tls', 'x509', 'rsa', 'publickey', 'privatekey', 'pem']
  },
  {
    id: 'log',
    label: 'Log & Diagnostics Analyzer',
    description: 'Log severity pills (ERROR, WARN, INFO, DEBUG), timestamps, and filter search',
    icon: Terminal,
    color: 'text-amber-500',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['log', 'out', 'err', 'diag'],
    keywords: ['logs', 'errors', 'debug', 'console', 'timestamps', 'traces']
  },
  {
    id: 'text',
    label: 'Plain Text Viewer',
    description: 'Clean line-numbered text reader with line wrapping, word count and quick search',
    icon: FileCheck,
    color: 'text-slate-400',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['txt', 'text', 'env', 'ini', 'conf', 'cfg'],
    keywords: ['raw', 'text', 'plain', 'lines', 'notes', 'ascii']
  }
];

interface QuickChip {
  id: FileCategory;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function getIntelligentQuickReaders(tab: TabFile): QuickChip[] {
  const ext = (tab.extension || '').toLowerCase();
  const cat = tab.category;
  const text = tab.textContent;

  const chipTree: QuickChip = { id: 'json', label: 'Tree', tooltip: 'View as Interactive Data / Node Tree', icon: Layers, color: 'text-blue-500' };
  const chipCode: QuickChip = { id: 'code', label: 'Code', tooltip: 'View in Interactive Code Editor & Syntax Highlighter', icon: Code, color: 'text-indigo-500' };
  const chipText: QuickChip = { id: 'text', label: 'Text', tooltip: 'View as Plain Text', icon: FileCheck, color: 'text-slate-400' };
  const chipHex: QuickChip = { id: 'hex', label: 'Hex', tooltip: 'Inspect Raw Memory Bytes & Offsets', icon: Binary, color: 'text-purple-500' };
  const chipPreview: QuickChip = { id: 'html', label: 'Preview', tooltip: 'Live HTML & Web Sandbox Preview', icon: Globe, color: 'text-blue-500' };
  const chipMarkdown: QuickChip = { id: 'markdown', label: 'Markdown', tooltip: 'Rendered Markdown Formatter', icon: FileText, color: 'text-emerald-500' };
  const chipMap: QuickChip = { id: 'geojson', label: 'Map', tooltip: 'Interactive Spatial GeoJSON Map', icon: MapPin, color: 'text-rose-500' };
  const chipTable: QuickChip = { id: 'excel', label: 'Table', tooltip: 'Interactive Tabular Grid', icon: Table, color: 'text-emerald-500' };
  const chipDatabase: QuickChip = { id: 'database', label: 'Database', tooltip: 'SQL Database Console', icon: Database, color: 'text-teal-500' };
  const chipHttp: QuickChip = { id: 'http', label: 'HTTP Studio', tooltip: 'Interactive REST API Runner', icon: Globe, color: 'text-teal-500' };
  const chipLog: QuickChip = { id: 'log', label: 'Log Analyzer', tooltip: 'Log Severity & Timestamp Analyzer', icon: Terminal, color: 'text-amber-500' };
  const chipCaptions: QuickChip = { id: 'subtitle', label: 'Captions', tooltip: 'Dialogue Cues & Subtitles', icon: Captions, color: 'text-cyan-500' };
  const chipCertificate: QuickChip = { id: 'certificate', label: 'Certificate', tooltip: 'X.509 Certificate Inspector', icon: ShieldCheck, color: 'text-emerald-500' };
  const chipBinary: QuickChip = { id: 'binary', label: 'PE Inspector', tooltip: 'Executable Headers & Sections Inspector', icon: Cpu, color: 'text-purple-500' };
  const chipFont: QuickChip = { id: 'font', label: 'Specimen', tooltip: 'Font Specimen & Glyphs Waterfall', icon: Type, color: 'text-pink-500' };
  const chipImage: QuickChip = { id: 'image', label: 'Image', tooltip: 'Image & EXIF Inspector', icon: ImageIcon, color: 'text-pink-500' };
  const chipMedia: QuickChip = { id: 'video', label: 'Media', tooltip: 'Audio / Video Studio Player', icon: Video, color: 'text-purple-500' };
  const chipArchive: QuickChip = { id: 'archive', label: 'Archive', tooltip: 'Compressed Zip Directory Explorer', icon: Archive, color: 'text-amber-500' };
  const chipDocx: QuickChip = { id: 'docx', label: 'Document', tooltip: 'Word Document Reader', icon: FileText, color: 'text-blue-500' };
  const chipPptx: QuickChip = { id: 'pptx', label: 'Slides', tooltip: 'Slide Deck Presentation', icon: Presentation, color: 'text-amber-500' };
  const chipPdf: QuickChip = { id: 'pdf', label: 'PDF', tooltip: 'Vector PDF Document Reader', icon: FileText, color: 'text-rose-500' };
  const chipEbook: QuickChip = { id: 'ebook', label: 'E-Book', tooltip: 'Typography E-Book Reader', icon: BookOpen, color: 'text-indigo-500' };

  if (['geojson', 'topojson'].includes(ext) || cat === 'geojson') {
    return [chipMap, chipTree, chipCode, chipText, chipHex];
  }

  if (['json', 'jsonc', 'json5', 'xml', 'yaml', 'yml', 'toml'].includes(ext) || cat === 'json') {
    if (ext === 'xml' || (text && text.trim().startsWith('<?xml'))) {
      return [chipTree, chipPreview, chipCode, chipText, chipHex];
    }
    return [chipTree, chipCode, chipText, chipHex];
  }

  const isHtml = ['html', 'htm', 'xhtml', 'svg'].includes(ext) || cat === 'html' ||
    (text && (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('<svg')));
  if (isHtml) {
    return [chipPreview, chipCode, chipTree, chipText, chipHex];
  }

  if (['md', 'markdown', 'mdown', 'mkd', 'mdx'].includes(ext) || cat === 'markdown') {
    return [chipMarkdown, chipCode, chipText, chipHex];
  }

  if (['http', 'rest'].includes(ext) || cat === 'http') {
    return [chipHttp, chipCode, chipText, chipHex];
  }

  if (['log', 'out', 'err', 'diag'].includes(ext) || cat === 'log') {
    return [chipLog, chipText, chipCode, chipHex];
  }

  if (ext === 'sql') {
    return [chipDatabase, chipCode, chipText, chipHex];
  }
  if (['db', 'sqlite', 'sqlite3', 'dbf', 'mdb', 'accdb'].includes(ext) || cat === 'database') {
    return [chipDatabase, chipBinary, chipHex];
  }

  if (['csv', 'tsv'].includes(ext)) {
    return [chipTable, chipText, chipCode, chipHex];
  }
  if (['xlsx', 'xls', 'ods'].includes(ext) || cat === 'excel') {
    return [chipTable, chipHex];
  }

  if (['srt', 'vtt', 'sub', 'ass'].includes(ext) || cat === 'subtitle') {
    return [chipCaptions, chipText, chipCode, chipHex];
  }

  if (['crt', 'pem', 'cer', 'key', 'pub', 'csr'].includes(ext) || cat === 'certificate') {
    return [chipCertificate, chipText, chipCode, chipHex];
  }

  if (cat === 'pdf' || ext === 'pdf') {
    return [chipPdf, chipHex];
  }
  if (['docx', 'doc'].includes(ext) || cat === 'docx') {
    return [chipDocx, chipArchive, chipHex];
  }
  if (['pptx', 'ppt'].includes(ext) || cat === 'pptx') {
    return [chipPptx, chipArchive, chipHex];
  }
  if (ext === 'epub' || cat === 'ebook') {
    return [chipEbook, chipArchive, chipHex];
  }

  if (['exe', 'dll', 'so', 'dylib', 'wasm', 'bin', 'class', 'elf', 'sys', 'drv', 'o', 'obj'].includes(ext) || cat === 'binary') {
    return [chipBinary, chipHex];
  }

  if (['ttf', 'otf', 'woff', 'woff2'].includes(ext) || cat === 'font') {
    return [chipFont, chipHex];
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tiff', 'avif'].includes(ext) || cat === 'image') {
    return [chipImage, chipHex];
  }

  if (cat === 'video' || cat === 'audio' || ['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return [chipMedia, chipHex];
  }

  if (['zip', 'jar', 'tar', 'gz', '7z', 'rar'].includes(ext) || cat === 'archive') {
    return [chipArchive, chipHex];
  }

  const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'cpp', 'c', 'h', 'cs', 'java', 'php', 'rb', 'sh', 'bash', 'zsh', 'css', 'scss', 'less', 'vue', 'svelte', 'dart', 'lua', 'r', 'proto', 'graphql'].includes(ext) || cat === 'code';
  if (isCode) {
    return [chipCode, chipText, chipHex];
  }

  if (text !== undefined || cat === 'text' || ['txt', 'env', 'ini', 'conf', 'cfg', 'properties'].includes(ext)) {
    return [chipText, chipCode, chipHex];
  }

  return [chipHex];
}

export const ReaderSwitcher: React.FC<ReaderSwitcherProps> = ({ activeTab, onSelectReader }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const currentCategory = activeTab.activeReader || activeTab.category;
  const activeOption = READER_OPTIONS.find(o => o.id === currentCategory) || READER_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const quickChips = useMemo(() => getIntelligentQuickReaders(activeTab), [activeTab]);

  const filteredReaders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return READER_OPTIONS;

    return READER_OPTIONS.filter(opt => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchDesc = opt.description.toLowerCase().includes(q);
      const matchId = opt.id.toLowerCase().includes(q);
      const matchGroup = opt.categoryGroup.toLowerCase().includes(q);
      const matchExt = opt.supportedExtensions?.some(e => e.toLowerCase().includes(q) || q.includes(e.toLowerCase()));
      const matchKeyword = opt.keywords?.some(k => k.toLowerCase().includes(q));

      return matchLabel || matchDesc || matchId || matchGroup || matchExt || matchKeyword;
    });
  }, [searchQuery]);

  const recommendedIds = useMemo(() => new Set(quickChips.map(c => c.id)), [quickChips]);

  return (
    <div className="flex items-center gap-1.5 relative select-none" ref={dropdownRef}>
      {/* Intelligent Quick Switcher Chips */}
      {quickChips.length > 1 && (
        <div
          className="hidden sm:inline-flex items-center bg-muted p-0.5 rounded-lg text-xs border border-border"
          role="group"
          aria-label="Supported file views"
        >
          {quickChips.map(chip => {
            const ChipIcon = chip.icon;
            const isSelected = currentCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onSelectReader(chip.id)}
                title={chip.tooltip}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ChipIcon className={`w-3.5 h-3.5 ${chip.color}`} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main View Dropdown Trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 h-8 text-xs font-medium border-border"
        title="Browse & switch rendering engine for this document"
        aria-expanded={isOpen}
      >
        <span className="text-muted-foreground text-[11px] hidden xs:inline">Engine:</span>
        <ActiveIcon className={`w-3.5 h-3.5 ${activeOption.color}`} />
        <span className="font-medium max-w-[100px] truncate">{activeOption.label.split('/')[0].trim()}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Search-Enabled Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-80 max-h-[460px] flex flex-col bg-popover text-popover-foreground border border-border rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ zIndex: 9999 }}
        >
          {/* Header & Active File Tag */}
          <div className="px-3 py-2 border-b border-border flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span>Rendering Engines</span>
            </span>
            <Badge variant="secondary" className="font-mono text-[10px] uppercase">
              .{activeTab.extension || 'file'}
            </Badge>
          </div>

          {/* Integrated Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reader engines (JSON, Hex, DBF, SQL...)"
                className="w-full bg-muted/60 border border-input text-foreground text-xs pl-8 pr-7 py-1.5 rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Readers List */}
          <ScrollArea className="max-h-72 p-1">
            <div className="space-y-1">
              {filteredReaders.length === 0 ? (
                <div className="text-center py-6 px-3 text-muted-foreground space-y-2">
                  <Search className="w-6 h-6 mx-auto opacity-50" />
                  <p className="text-xs">No reader matches &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredReaders.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = currentCategory === opt.id;
                  const isRecommended = recommendedIds.has(opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectReader(opt.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`w-4 h-4 ${opt.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-xs truncate ${isSelected ? 'font-bold text-foreground' : 'font-medium'}`}>
                            {opt.label}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isRecommended && !isSelected && (
                              <Badge variant="success" className="text-[9px] py-0 px-1.5">
                                Suggested
                              </Badge>
                            )}
                            {isSelected && (
                              <Badge variant="default" className="text-[9px] py-0 px-1.5 font-bold">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer note with keyboard shortcut */}
          <div className="px-3 py-1.5 bg-muted/40 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-background rounded border border-border font-mono text-[9px]">Esc</kbd> to close</span>
            <span className="font-medium text-foreground">{filteredReaders.length} results</span>
          </div>
        </div>
      )}
    </div>
  );
};
