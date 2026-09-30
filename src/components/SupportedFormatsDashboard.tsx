/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Dashboard Supported File Types & Capabilities Showcase
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Table,
  Presentation,
  Code2,
  Database,
  Archive,
  Image as ImageIcon,
  Video,
  Music,
  MapPin,
  Subtitles,
  BookOpen,
  Globe,
  Cpu,
  Type,
  ShieldCheck,
  Binary,
  Layers,
  Search,
  ArrowRight,
  FolderOpen,
  Sparkles,
  Zap,
  Terminal,
  X
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getFormatSeo, FormatSeoRecord } from '../data/formatSeoData';
import { FormatSeoModal } from './FormatSeoModal';

export interface SupportedFormatItem {
  id: string;
  extension: string;
  name: string;
  category: 'document' | 'code' | 'data' | 'media' | 'system';
  categoryLabel: string;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  scratchpadType?: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json';
}

export const FEATURED_FORMATS: SupportedFormatItem[] = [
  // Documents & Office
  {
    id: 'pdf',
    extension: '.pdf',
    name: 'PDF Document',
    category: 'document',
    categoryLabel: 'Documents',
    highlight: 'Password unlock · HiDPI Retina · Page nav',
    icon: FileText,
    iconColor: 'text-red-500 dark:text-red-400',
    iconBg: 'bg-red-500/10'
  },
  {
    id: 'docx',
    extension: '.docx',
    name: 'Word Document',
    category: 'document',
    categoryLabel: 'Documents',
    highlight: 'Full layout parser · Tables & image preview',
    icon: FileText,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-500/10'
  },
  {
    id: 'xlsx',
    extension: '.xlsx / .csv',
    name: 'Excel & Data Sheet',
    category: 'document',
    categoryLabel: 'Documents',
    highlight: 'Multi-sheet tabs · Column sorting & search',
    icon: Table,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10'
  },
  {
    id: 'pptx',
    extension: '.pptx',
    name: 'PowerPoint Deck',
    category: 'document',
    categoryLabel: 'Documents',
    highlight: 'Slide deck navigator · Text & shape renderer',
    icon: Presentation,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10'
  },
  {
    id: 'epub',
    extension: '.epub',
    name: 'E-Book Document',
    category: 'document',
    categoryLabel: 'Documents',
    highlight: 'Chapter table of contents · Reader font scaling',
    icon: BookOpen,
    iconColor: 'text-purple-500 dark:text-purple-400',
    iconBg: 'bg-purple-500/10'
  },

  // Code & Web
  {
    id: 'ts',
    extension: '.ts / .tsx / .js',
    name: 'TypeScript & JavaScript',
    category: 'code',
    categoryLabel: 'Code & Web',
    highlight: 'AST token tree · NPM CDN playground runtime',
    icon: Code2,
    iconColor: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-500/10',
    scratchpadType: 'ts'
  },
  {
    id: 'python',
    extension: '.py',
    name: 'Python Script',
    category: 'code',
    categoryLabel: 'Code & Web',
    highlight: 'Python 3.12 sandbox · Pyodide WebAssembly',
    icon: Terminal,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10',
    scratchpadType: 'python'
  },
  {
    id: 'html',
    extension: '.html / .htm',
    name: 'HTML & Live Web',
    category: 'code',
    categoryLabel: 'Code & Web',
    highlight: 'Isolated iframe sandbox · DOM tree inspector',
    icon: Globe,
    iconColor: 'text-orange-500 dark:text-orange-400',
    iconBg: 'bg-orange-500/10',
    scratchpadType: 'html'
  },
  {
    id: 'markdown',
    extension: '.md / .markdown',
    name: 'GFM Markdown',
    category: 'code',
    categoryLabel: 'Code & Web',
    highlight: 'Live split-view editor · MathKaTeX & syntax',
    icon: FileText,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    scratchpadType: 'markdown'
  },
  {
    id: 'http',
    extension: '.http / .rest',
    name: 'REST API Client',
    category: 'code',
    categoryLabel: 'Code & Web',
    highlight: 'In-browser HTTP runner · Headers & cURL generator',
    icon: Zap,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10'
  },

  // Data & Databases
  {
    id: 'sqlite',
    extension: '.sqlite / .db',
    name: 'SQLite Database',
    category: 'data',
    categoryLabel: 'Data & SQL',
    highlight: 'Schema analysis · SQL query engine · Export CSV',
    icon: Database,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    scratchpadType: 'sql'
  },
  {
    id: 'dbf',
    extension: '.dbf / .mdb',
    name: 'FoxPro & Access MDB',
    category: 'data',
    categoryLabel: 'Data & SQL',
    highlight: 'Legacy DBF field parser · Jet/Access schema tables',
    icon: Database,
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    iconBg: 'bg-cyan-500/10'
  },
  {
    id: 'json',
    extension: '.json / .yaml',
    name: 'JSON & Config Tree',
    category: 'data',
    categoryLabel: 'Data & SQL',
    highlight: 'Interactive JSON tree · Collapsible node paths',
    icon: Code2,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10',
    scratchpadType: 'json'
  },
  {
    id: 'geojson',
    extension: '.geojson / .kml',
    name: 'Geospatial Maps',
    category: 'data',
    categoryLabel: 'Data & SQL',
    highlight: 'Interactive Leaflet vector map · Geo coordinate bounds',
    icon: MapPin,
    iconColor: 'text-teal-500 dark:text-teal-400',
    iconBg: 'bg-teal-500/10'
  },

  // Media & Assets
  {
    id: 'image',
    extension: '.png / .jpg / .webp / .svg',
    name: 'Images & Vectors',
    category: 'media',
    categoryLabel: 'Media & Assets',
    highlight: 'Deep pixel zoom · EXIF metadata · Color picker',
    icon: ImageIcon,
    iconColor: 'text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-500/10'
  },
  {
    id: 'media',
    extension: '.mp4 / .webm / .mp3 / .wav',
    name: 'Audio & Video Player',
    category: 'media',
    categoryLabel: 'Media & Assets',
    highlight: 'Frame stepper · Audio waveform · Loop & speed control',
    icon: Video,
    iconColor: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-500/10'
  },
  {
    id: 'font',
    extension: '.ttf / .otf / .woff2',
    name: 'Typography Fonts',
    category: 'media',
    categoryLabel: 'Media & Assets',
    highlight: 'Live waterfall preview · Glyph unicode inspector',
    icon: Type,
    iconColor: 'text-pink-500 dark:text-pink-400',
    iconBg: 'bg-pink-500/10'
  },

  // System & Security
  {
    id: 'archive',
    extension: '.zip / .tar / .gz',
    name: 'Compressed Archives',
    category: 'system',
    categoryLabel: 'System & Security',
    highlight: 'In-browser decompression · File tree & single extract',
    icon: Archive,
    iconColor: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10'
  },
  {
    id: 'cert',
    extension: '.pem / .crt / .cer',
    name: 'X.509 Certificates',
    category: 'system',
    categoryLabel: 'System & Security',
    highlight: 'SAN domains · Validity dates · Public key fingerprint',
    icon: ShieldCheck,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10'
  },
  {
    id: 'binary',
    extension: '.dll / .exe / .wasm / .so',
    name: 'Executables & Binaries',
    category: 'system',
    categoryLabel: 'System & Security',
    highlight: 'PE/COFF headers · Section tables · String scanner',
    icon: Cpu,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/10'
  },
  {
    id: 'hex',
    extension: 'Any File Format',
    name: 'Hex Byte Stream',
    category: 'system',
    categoryLabel: 'System & Security',
    highlight: '16-column memory offset · ASCII decoder · Raw byte stats',
    icon: Binary,
    iconColor: 'text-slate-500 dark:text-slate-400',
    iconBg: 'bg-slate-500/10'
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Formats' },
  { id: 'document', label: 'Documents' },
  { id: 'code', label: 'Code & Web' },
  { id: 'data', label: 'Data & SQL' },
  { id: 'media', label: 'Media & Assets' },
  { id: 'system', label: 'System & Hex' }
] as const;

interface SupportedFormatsDashboardProps {
  onOpenFileWithExtension?: (extension: string) => void;
  onOpenSupportedFormatsModal?: () => void;
  onNewScratchpad?: (type: 'ts' | 'python' | 'sql' | 'markdown' | 'html' | 'json') => void;
  onLoadSamples?: () => void;
}

export const SupportedFormatsDashboard: React.FC<SupportedFormatsDashboardProps> = ({
  onOpenFileWithExtension,
  onOpenSupportedFormatsModal,
  onNewScratchpad,
  onLoadSamples
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeoRecord, setSelectedSeoRecord] = useState<FormatSeoRecord | null>(null);

  const filteredFormats = useMemo(() => {
    return FEATURED_FORMATS.filter(item => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.extension.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.highlight.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleFormatClick = (item: SupportedFormatItem) => {
    if (item.scratchpadType && onNewScratchpad) {
      onNewScratchpad(item.scratchpadType);
      return;
    }

    if (onOpenFileWithExtension) {
      // Pick first extension clean without slashes or spaces
      const firstExt = item.extension.split('/')[0].trim();
      onOpenFileWithExtension(firstExt);
    } else if (onOpenSupportedFormatsModal) {
      onOpenSupportedFormatsModal();
    }
  };

  return (
    <div className="w-full space-y-4 pt-4 text-left">
      {/* Header bar with title, search input & all formats link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Supported Formats & Native Readers
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">
              (60+ In-Browser Engines)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Processed 100% locally in-memory with syntax analysis, sandboxed runtimes, and low-level hex inspection.
          </p>
        </div>

        {/* Search & All Formats Modal Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search formats..."
              className="h-8 pl-8 pr-7 text-xs bg-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {onOpenSupportedFormatsModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSupportedFormatsModal}
              className="h-8 text-xs shrink-0 gap-1.5"
            >
              <span>View All 60+</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter Chips / Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === tab.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Supported Format Cards */}
      {filteredFormats.length === 0 ? (
        <div className="p-8 text-center bg-card border border-dashed border-border rounded-xl">
          <p className="text-xs text-muted-foreground">No formats match "{searchQuery}"</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs text-primary"
          >
            Reset search filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredFormats.map(item => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                onClick={() => handleFormatClick(item)}
                className="p-3.5 cursor-pointer rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  {/* Format Category Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.extension}
                      </span>
                      <span className="text-[10px] font-sans text-muted-foreground shrink-0">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-foreground/90 leading-snug">
                      {item.name}
                    </h4>

                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {item.highlight}
                    </p>
                  </div>
                </div>

                {/* Subdued action hint on hover */}
                <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSeoRecord(getFormatSeo(item.id));
                    }}
                    className="inline-flex items-center gap-1 font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    title="View Google Search Snippet, Target Keywords & Schema.org JSON-LD"
                  >
                    <Globe className="w-3 h-3 text-primary" />
                    <span>SEO Specs</span>
                  </button>
                  <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{item.scratchpadType ? 'Launch Sandbox' : 'Open / Browse'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Format SEO & Structured Data Inspector Dialog */}
      <FormatSeoModal
        isOpen={!!selectedSeoRecord}
        onClose={() => setSelectedSeoRecord(null)}
        formatRecord={selectedSeoRecord}
        onOpenFormat={(rec) => {
          const matchItem = FEATURED_FORMATS.find(f => f.id === rec.id);
          if (matchItem) handleFormatClick(matchItem);
        }}
      />

      {/* Footer summary banner with quick samples and privacy guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>All 60+ formats are parsed 100% locally in browser memory without sending a single byte to external servers.</span>
        </div>
        {onLoadSamples && (
          <button
            onClick={onLoadSamples}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline cursor-pointer shrink-0 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Interactive Sample Pack</span>
          </button>
        )}
      </div>
    </div>
  );
};
