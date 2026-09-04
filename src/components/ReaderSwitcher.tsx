/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
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
  SlidersHorizontal,
  Globe,
  Cpu,
  Type,
  ShieldCheck,
  Search,
  X,
  Sparkles,
  Presentation
} from 'lucide-react';
import { FileCategory, TabFile } from '../types/file';

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
    color: 'text-indigo-400',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'cpp', 'c', 'h', 'cs', 'java', 'html', 'css', 'scss', 'json', 'yaml', 'yml', 'toml', 'sh', 'sql', 'md', 'env'],
    keywords: ['editor', 'syntax', 'programming', 'developer', 'source', 'script', 'highlight']
  },
  {
    id: 'html',
    label: 'Live HTML & Web Preview',
    description: 'Interactive sandbox iframe with DOM tree inspector, mobile viewport & live console',
    icon: Globe,
    color: 'text-blue-400',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['html', 'htm', 'xhtml', 'svg', 'xml'],
    keywords: ['web', 'browser', 'dom', 'iframe', 'sandbox', 'render', 'website']
  },
  {
    id: 'markdown',
    label: 'Markdown Formatter',
    description: 'Formatted Markdown with headings, tables, task lists, code blocks & typography',
    icon: FileText,
    color: 'text-emerald-400',
    categoryGroup: 'Code & Web',
    supportedExtensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx'],
    keywords: ['readme', 'documentation', 'notes', 'gfm', 'formatted']
  },
  {
    id: 'http',
    label: 'HTTP & REST Studio',
    description: 'Interactive API request runner, headers, payload, response tabs & cURL generator',
    icon: Globe,
    color: 'text-teal-400',
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
    color: 'text-blue-400',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['json', 'jsonc', 'json5', 'xml', 'yaml', 'yml', 'toml', 'geojson'],
    keywords: ['tree', 'object', 'array', 'nodes', 'properties', 'parse', 'schema']
  },
  {
    id: 'excel',
    label: 'Spreadsheet / Table Grid',
    description: 'Interactive tabular dataset grid with sorting, filtering, columns, and CSV export',
    icon: Table,
    color: 'text-emerald-400',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['csv', 'tsv', 'xlsx', 'xls', 'ods'],
    keywords: ['table', 'spreadsheet', 'grid', 'rows', 'columns', 'excel', 'data']
  },
  {
    id: 'database',
    label: 'Database & SQL Console',
    description: 'Execute live SQLite/SQL queries, inspect table schema definitions & query results',
    icon: Database,
    color: 'text-teal-400',
    categoryGroup: 'Structured & Data',
    supportedExtensions: ['sql', 'sqlite', 'sqlite3', 'db'],
    keywords: ['sql', 'sqlite', 'query', 'tables', 'database', 'relational']
  },
  {
    id: 'geojson',
    label: 'GeoJSON / Spatial Map',
    description: 'Spatial coordinate properties, interactive feature map, and geometry inspector',
    icon: MapPin,
    color: 'text-rose-400',
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
    color: 'text-rose-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['pdf'],
    keywords: ['pdf', 'document', 'pages', 'acrobat', 'print', 'vector']
  },
  {
    id: 'docx',
    label: 'Word Document Reader',
    description: 'Formatted DOCX document preview with styles, tables, headings, and images',
    icon: FileText,
    color: 'text-blue-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['docx', 'doc'],
    keywords: ['word', 'document', 'office', 'text', 'microsoft']
  },
  {
    id: 'pptx',
    label: 'PowerPoint Presentation',
    description: 'Slide-by-slide presentation deck carousel with presenter notes and layout',
    icon: Presentation,
    color: 'text-amber-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['pptx', 'ppt'],
    keywords: ['slides', 'presentation', 'powerpoint', 'deck', 'office']
  },
  {
    id: 'ebook',
    label: 'Document & E-Book Reader',
    description: 'Comfortable typography reader with font scaling, chapters, and reading stats',
    icon: BookOpen,
    color: 'text-indigo-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['epub', 'rtf'],
    keywords: ['book', 'reading', 'epub', 'novel', 'literature']
  },
  {
    id: 'image',
    label: 'Image & EXIF Inspector',
    description: 'Zoom, pan, rotation, metadata, dimensions, and color palette inspection',
    icon: ImageIcon,
    color: 'text-pink-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg', 'tiff', 'avif'],
    keywords: ['picture', 'photo', 'graphic', 'exif', 'dimensions', 'pixels']
  },
  {
    id: 'video',
    label: 'Cinema Video Player Studio',
    description: 'Hardware-accelerated cinema player with full-screen edge-to-edge mode, aspect fit/fill, stream inspector & speeds',
    icon: Video,
    color: 'text-purple-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'm4v', '3gp', 'ts', 'mts', 'ogv', 'vob'],
    keywords: ['movie', 'clip', 'video', 'player', 'media', 'mp4', 'mkv', 'matroska', 'cinema', 'stream']
  },
  {
    id: 'audio',
    label: 'Studio Audio Player & Turntable',
    description: 'Interactive vinyl turntable, waveform visualizer, 24-bit lossless FLAC inspector, and timeline scrubber',
    icon: Music,
    color: 'text-violet-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'opus', 'wma', 'aiff', 'alac', 'ac3', 'ape', 'mid', 'midi'],
    keywords: ['sound', 'song', 'music', 'track', 'audio', 'waveform', 'lossless', 'flac', 'opus', 'hi-res', 'turntable']
  },
  {
    id: 'subtitle',
    label: 'Subtitles & Captions',
    description: 'SRT / VTT timestamped dialogue cue list, search, and jump-to-time view',
    icon: Captions,
    color: 'text-cyan-400',
    categoryGroup: 'Documents & Media',
    supportedExtensions: ['srt', 'vtt', 'sub', 'ass'],
    keywords: ['subtitles', 'captions', 'dialogue', 'timing', 'cues', 'transcription']
  },
  {
    id: 'archive',
    label: 'Archive / Zip Explorer',
    description: 'Browse compressed archive file trees, folder directories, and extract entries',
    icon: Archive,
    color: 'text-amber-400',
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
    color: 'text-purple-400',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['*'],
    keywords: ['raw', 'bytes', 'memory', 'binary', 'dump', 'offset', 'ascii', 'low-level']
  },
  {
    id: 'binary',
    label: 'Binary & DLL PE Inspector',
    description: 'Deep header analysis, PE sections, architecture (x86/x64), and symbol scanner',
    icon: Cpu,
    color: 'text-purple-400',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['exe', 'dll', 'so', 'dylib', 'wasm', 'bin', 'class', 'elf', 'sys', 'o', 'obj'],
    keywords: ['executable', 'pe', 'coff', 'elf', 'mach-o', 'headers', 'sections', 'symbols']
  },
  {
    id: 'font',
    label: 'Font & Glyph Specimen',
    description: 'Interactive font specimen waterfall, full Unicode glyph grid, and size controls',
    icon: Type,
    color: 'text-pink-400',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['ttf', 'otf', 'woff', 'woff2'],
    keywords: ['font', 'typeface', 'glyphs', 'unicode', 'typography', 'waterfall']
  },
  {
    id: 'certificate',
    label: 'Certificate & Key Inspector',
    description: 'X.509 certificates, RSA/ECC public/private keys, and PEM block validation',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['crt', 'pem', 'cer', 'key', 'pub', 'csr'],
    keywords: ['crypto', 'ssl', 'tls', 'x509', 'rsa', 'publickey', 'privatekey', 'pem']
  },
  {
    id: 'log',
    label: 'Log & Diagnostics Analyzer',
    description: 'Log severity pills (ERROR, WARN, INFO, DEBUG), timestamps, and filter search',
    icon: Terminal,
    color: 'text-amber-400',
    categoryGroup: 'Low-Level & System',
    supportedExtensions: ['log', 'out', 'err', 'diag'],
    keywords: ['logs', 'errors', 'debug', 'console', 'timestamps', 'traces']
  },
  {
    id: 'text',
    label: 'Plain Text Viewer',
    description: 'Clean line-numbered text reader with line wrapping, word count and quick search',
    icon: FileCheck,
    color: 'text-slate-300',
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

/**
 * Intelligently computes which quick switch chips are truly supported and relevant for a given file.
 * Prevents showing irrelevant chips (e.g. Tree view for Python/C++ code or plain text).
 */
export function getIntelligentQuickReaders(tab: TabFile): QuickChip[] {
  const ext = (tab.extension || '').toLowerCase();
  const cat = tab.category;
  const text = tab.textContent;

  // Helper chip constructors
  const chipTree: QuickChip = { id: 'json', label: 'Tree', tooltip: 'View as Interactive Data / Node Tree', icon: Layers, color: 'text-blue-400' };
  const chipCode: QuickChip = { id: 'code', label: 'Code', tooltip: 'View in Interactive Code Editor & Syntax Highlighter', icon: Code, color: 'text-indigo-400' };
  const chipText: QuickChip = { id: 'text', label: 'Text', tooltip: 'View as Plain Text', icon: FileCheck, color: 'text-slate-300' };
  const chipHex: QuickChip = { id: 'hex', label: 'Hex', tooltip: 'Inspect Raw Memory Bytes & Offsets', icon: Binary, color: 'text-purple-400' };
  const chipPreview: QuickChip = { id: 'html', label: 'Preview', tooltip: 'Live HTML & Web Sandbox Preview', icon: Globe, color: 'text-blue-400' };
  const chipMarkdown: QuickChip = { id: 'markdown', label: 'Markdown', tooltip: 'Rendered Markdown Formatter', icon: FileText, color: 'text-emerald-400' };
  const chipMap: QuickChip = { id: 'geojson', label: 'Map', tooltip: 'Interactive Spatial GeoJSON Map', icon: MapPin, color: 'text-rose-400' };
  const chipTable: QuickChip = { id: 'excel', label: 'Table', tooltip: 'Interactive Tabular Grid', icon: Table, color: 'text-emerald-400' };
  const chipDatabase: QuickChip = { id: 'database', label: 'Database', tooltip: 'SQL Database Console', icon: Database, color: 'text-teal-400' };
  const chipHttp: QuickChip = { id: 'http', label: 'HTTP Studio', tooltip: 'Interactive REST API Runner', icon: Globe, color: 'text-teal-400' };
  const chipLog: QuickChip = { id: 'log', label: 'Log Analyzer', tooltip: 'Log Severity & Timestamp Analyzer', icon: Terminal, color: 'text-amber-400' };
  const chipCaptions: QuickChip = { id: 'subtitle', label: 'Captions', tooltip: 'Dialogue Cues & Subtitles', icon: Captions, color: 'text-cyan-400' };
  const chipCertificate: QuickChip = { id: 'certificate', label: 'Certificate', tooltip: 'X.509 Certificate Inspector', icon: ShieldCheck, color: 'text-emerald-400' };
  const chipBinary: QuickChip = { id: 'binary', label: 'PE Inspector', tooltip: 'Executable Headers & Sections Inspector', icon: Cpu, color: 'text-purple-400' };
  const chipFont: QuickChip = { id: 'font', label: 'Specimen', tooltip: 'Font Specimen & Glyphs Waterfall', icon: Type, color: 'text-pink-400' };
  const chipImage: QuickChip = { id: 'image', label: 'Image', tooltip: 'Image & EXIF Inspector', icon: ImageIcon, color: 'text-pink-400' };
  const chipMedia: QuickChip = { id: 'video', label: 'Media', tooltip: 'Audio / Video Studio Player', icon: Video, color: 'text-purple-400' };
  const chipArchive: QuickChip = { id: 'archive', label: 'Archive', tooltip: 'Compressed Zip Directory Explorer', icon: Archive, color: 'text-amber-400' };
  const chipDocx: QuickChip = { id: 'docx', label: 'Document', tooltip: 'Word Document Reader', icon: FileText, color: 'text-blue-400' };
  const chipPptx: QuickChip = { id: 'pptx', label: 'Slides', tooltip: 'Slide Deck Presentation', icon: Presentation, color: 'text-amber-400' };
  const chipPdf: QuickChip = { id: 'pdf', label: 'PDF', tooltip: 'Vector PDF Document Reader', icon: FileText, color: 'text-rose-400' };
  const chipEbook: QuickChip = { id: 'ebook', label: 'E-Book', tooltip: 'Typography E-Book Reader', icon: BookOpen, color: 'text-indigo-400' };

  // 1. GeoJSON
  if (['geojson', 'topojson'].includes(ext) || cat === 'geojson') {
    return [chipMap, chipTree, chipCode, chipText, chipHex];
  }

  // 2. Structured JSON / XML / YAML / TOML
  if (['json', 'jsonc', 'json5', 'xml', 'yaml', 'yml', 'toml'].includes(ext) || cat === 'json') {
    if (ext === 'xml' || (text && text.trim().startsWith('<?xml'))) {
      return [chipTree, chipPreview, chipCode, chipText, chipHex];
    }
    return [chipTree, chipCode, chipText, chipHex];
  }

  // 3. HTML / Web / SVG
  const isHtml = ['html', 'htm', 'xhtml', 'svg'].includes(ext) || cat === 'html' ||
    (text && (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('<svg')));
  if (isHtml) {
    return [chipPreview, chipCode, chipTree, chipText, chipHex];
  }

  // 4. Markdown
  if (['md', 'markdown', 'mdown', 'mkd', 'mdx'].includes(ext) || cat === 'markdown') {
    return [chipMarkdown, chipCode, chipText, chipHex];
  }

  // 5. HTTP / REST API files
  if (['http', 'rest'].includes(ext) || cat === 'http') {
    return [chipHttp, chipCode, chipText, chipHex];
  }

  // 6. Log files
  if (['log', 'out', 'err', 'diag'].includes(ext) || cat === 'log') {
    return [chipLog, chipText, chipCode, chipHex];
  }

  // 7. Database / SQL files
  if (ext === 'sql') {
    return [chipDatabase, chipCode, chipText, chipHex];
  }
  if (['db', 'sqlite', 'sqlite3'].includes(ext) || cat === 'database') {
    return [chipDatabase, chipBinary, chipHex];
  }

  // 8. Tabular / Spreadsheet
  if (['csv', 'tsv'].includes(ext)) {
    return [chipTable, chipText, chipCode, chipHex];
  }
  if (['xlsx', 'xls', 'ods'].includes(ext) || cat === 'excel') {
    return [chipTable, chipHex];
  }

  // 9. Subtitles
  if (['srt', 'vtt', 'sub', 'ass'].includes(ext) || cat === 'subtitle') {
    return [chipCaptions, chipText, chipCode, chipHex];
  }

  // 10. Certificates
  if (['crt', 'pem', 'cer', 'key', 'pub', 'csr'].includes(ext) || cat === 'certificate') {
    return [chipCertificate, chipText, chipCode, chipHex];
  }

  // 11. Documents
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

  // 12. Binaries & Executables
  if (['exe', 'dll', 'so', 'dylib', 'wasm', 'bin', 'class', 'elf', 'sys', 'drv', 'o', 'obj'].includes(ext) || cat === 'binary') {
    return [chipBinary, chipHex];
  }

  // 13. Fonts
  if (['ttf', 'otf', 'woff', 'woff2'].includes(ext) || cat === 'font') {
    return [chipFont, chipHex];
  }

  // 14. Images
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tiff', 'avif'].includes(ext) || cat === 'image') {
    return [chipImage, chipHex];
  }

  // 15. Media
  if (cat === 'video' || cat === 'audio' || ['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return [chipMedia, chipHex];
  }

  // 16. Archives
  if (['zip', 'jar', 'tar', 'gz', '7z', 'rar'].includes(ext) || cat === 'archive') {
    return [chipArchive, chipHex];
  }

  // 17. Source code files (NO Tree view unless structured)
  const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'cpp', 'c', 'h', 'cs', 'java', 'php', 'rb', 'sh', 'bash', 'zsh', 'css', 'scss', 'less', 'vue', 'svelte', 'dart', 'lua', 'r', 'proto', 'graphql'].includes(ext) || cat === 'code';
  if (isCode) {
    return [chipCode, chipText, chipHex];
  }

  // 18. Plain text fallback
  if (text !== undefined || cat === 'text' || ['txt', 'env', 'ini', 'conf', 'cfg', 'properties'].includes(ext)) {
    return [chipText, chipCode, chipHex];
  }

  // Default fallback
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside and Escape key handler
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

  // Intelligent quick switcher chips specifically for the active file
  const quickChips = useMemo(() => getIntelligentQuickReaders(activeTab), [activeTab]);

  // Filtered readers based on search query
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

  // Highlighted recommended options
  const recommendedIds = useMemo(() => new Set(quickChips.map(c => c.id)), [quickChips]);

  return (
    <div className="flex items-center gap-1.5 relative select-none" ref={dropdownRef}>
      {/* Intelligent Quick Switcher Chips */}
      {quickChips.length > 1 && (
        <div
          className="hidden sm:flex items-center bg-slate-200/70 dark:bg-slate-800/70 p-0.5 rounded-lg text-[11px] border border-slate-300/60 dark:border-slate-700/60 shadow-2xs"
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
                className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ChipIcon className={`w-3 h-3 ${isSelected ? 'text-blue-500 dark:text-cyan-400' : chip.color}`} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main View Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        title="Browse & switch rendering engine for this document"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400 dark:text-slate-500 text-[11px] hidden xs:inline">View:</span>
        <ActiveIcon className={`w-3.5 h-3.5 ${activeOption.color}`} />
        <span className="font-semibold max-w-[100px] truncate">{activeOption.label.split('/')[0].trim()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Search-Enabled Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-80 max-h-[460px] flex flex-col bg-white/98 dark:bg-[#0f172a]/98 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100"
          style={{ zIndex: 9999 }}
        >
          {/* Header & Active File Tag */}
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Reader Modes ({READER_OPTIONS.length})</span>
            </span>
            <span className="font-mono text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              .{activeTab.extension || 'file'}
            </span>
          </div>

          {/* Integrated Search Input */}
          <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search readers (e.g. JSON, Hex, SQL, Tree...)"
                className="w-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs pl-8 pr-7 py-1.5 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Readers List */}
          <div className="flex-1 overflow-y-auto space-y-1 p-1 max-h-72 custom-scrollbar">
            {filteredReaders.length === 0 ? (
              <div className="text-center py-6 px-3 text-slate-400 space-y-2">
                <Search className="w-6 h-6 mx-auto text-slate-500 opacity-50" />
                <p className="text-xs">No reader matches &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-blue-500 hover:underline cursor-pointer"
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
                        ? 'bg-blue-50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 border border-blue-200 dark:border-cyan-800/60 shadow-2xs'
                        : 'hover:bg-slate-100/90 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${isSelected ? 'bg-blue-500/10 dark:bg-cyan-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Icon className={`w-4 h-4 ${opt.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-xs truncate ${isSelected ? 'font-bold text-blue-600 dark:text-cyan-400' : 'font-medium'}`}>
                          {opt.label}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isRecommended && !isSelected && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">
                              Suggested
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded font-bold">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note with keyboard shortcut */}
          <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[9px]">Esc</kbd> to close</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">{filteredReaders.length} results</span>
          </div>
        </div>
      )}
    </div>
  );
};

