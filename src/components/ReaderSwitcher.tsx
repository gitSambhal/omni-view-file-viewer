/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Image as ImageIcon,
  Archive,
  Terminal,
  FileCheck,
  Eye,
  SlidersHorizontal,
  Globe,
  Cpu,
  Type,
  ShieldCheck
} from 'lucide-react';
import { FileCategory, TabFile } from '../types/file';

interface ReaderSwitcherProps {
  activeTab: TabFile;
  onSelectReader: (reader: FileCategory) => void;
}

interface ReaderOption {
  id: FileCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isTextCompatible?: boolean;
}

export const READER_OPTIONS: ReaderOption[] = [
  {
    id: 'code',
    label: 'Code / Syntax Highlighter',
    description: 'Syntax coloring for TS, JS, YAML, ENV, Python, C++, HTML, etc.',
    icon: Code,
    color: 'text-indigo-400',
    isTextCompatible: true
  },
  {
    id: 'http',
    label: 'HTTP & REST Studio',
    description: 'Interactive API request runner, headers, payload, & cURL generator',
    icon: Globe,
    color: 'text-emerald-400',
    isTextCompatible: true
  },
  {
    id: 'binary',
    label: 'Binary & DLL PE Inspector',
    description: 'Deep header analysis, PE sections, architecture, & symbol scanner',
    icon: Cpu,
    color: 'text-purple-400'
  },
  {
    id: 'font',
    label: 'Font & Glyph Specimen',
    description: 'Interactive font specimen waterfall, glyph grid, & size controls',
    icon: Type,
    color: 'text-pink-400'
  },
  {
    id: 'certificate',
    label: 'Certificate & Key Inspector',
    description: 'X.509 certificates, RSA/ECC private keys, and PEM blocks',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    isTextCompatible: true
  },
  {
    id: 'json',
    label: 'JSON / Data Tree Inspector',
    description: 'Interactive expandable key-value node tree & formatted output',
    icon: Layers,
    color: 'text-blue-400',
    isTextCompatible: true
  },
  {
    id: 'markdown',
    label: 'Markdown Formatter',
    description: 'Formatted Markdown with headings, tables, and task lists',
    icon: FileText,
    color: 'text-emerald-400',
    isTextCompatible: true
  },
  {
    id: 'text',
    label: 'Plain Text Viewer',
    description: 'Clean line-numbered text reader with line-wrap and search',
    icon: FileCheck,
    color: 'text-slate-300',
    isTextCompatible: true
  },
  {
    id: 'log',
    label: 'Log & Diagnostics Analyzer',
    description: 'Log severity pills (ERROR, WARN, INFO) and timestamps',
    icon: Terminal,
    color: 'text-amber-400',
    isTextCompatible: true
  },
  {
    id: 'hex',
    label: 'Hex / Byte Inspector',
    description: 'Raw memory byte inspector with ASCII pane and hex offsets',
    icon: Binary,
    color: 'text-purple-400',
    isTextCompatible: true
  },
  {
    id: 'excel',
    label: 'Spreadsheet / Table Grid',
    description: 'Interactive tabular dataset grid with sorting and filtering',
    icon: Table,
    color: 'text-emerald-400',
    isTextCompatible: true
  },
  {
    id: 'geojson',
    label: 'GeoJSON / Spatial Map',
    description: 'Spatial coordinate properties and geometry inspector',
    icon: MapPin,
    color: 'text-rose-400',
    isTextCompatible: true
  },
  {
    id: 'subtitle',
    label: 'Subtitles & Captions',
    description: 'SRT / VTT timestamped dialogue cue list and search',
    icon: Captions,
    color: 'text-cyan-400',
    isTextCompatible: true
  },
  {
    id: 'ebook',
    label: 'Document & E-Book Reader',
    description: 'Comfortable typography reader with font scaling and stats',
    icon: BookOpen,
    color: 'text-indigo-400',
    isTextCompatible: true
  },
  {
    id: 'database',
    label: 'Database & SQL Console',
    description: 'Execute live SQL queries and inspect schema definitions',
    icon: Database,
    color: 'text-teal-400',
    isTextCompatible: true
  },
  {
    id: 'image',
    label: 'Image & EXIF Inspector',
    description: 'Zoom, pan, rotation, and image dimension inspection',
    icon: ImageIcon,
    color: 'text-pink-400'
  },
  {
    id: 'video',
    label: 'Audio / Video Studio',
    description: 'HTML5 media player with speed controls and visualizer',
    icon: Video,
    color: 'text-purple-400'
  },
  {
    id: 'archive',
    label: 'Archive / Zip Explorer',
    description: 'Browse compressed zip file directories and extracts',
    icon: Archive,
    color: 'text-amber-400'
  }
];

export const ReaderSwitcher: React.FC<ReaderSwitcherProps> = ({ activeTab, onSelectReader }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentCategory = activeTab.activeReader || activeTab.category;
  const activeOption = READER_OPTIONS.find(o => o.id === currentCategory) || READER_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Common quick toggles for text-compatible files (e.g. .env, .json, .yaml, .md)
  const isTextual = activeTab.textContent !== undefined || ['code', 'json', 'markdown', 'text', 'log', 'subtitle', 'geojson', 'ebook', 'database'].includes(activeTab.category);

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {/* Quick Switcher Chips for fast 1-click toggles */}
      {isTextual && (
        <div className="hidden sm:flex items-center bg-slate-200/80 dark:bg-slate-800/80 p-0.5 rounded-md text-[11px] border border-slate-300/80 dark:border-slate-700/80">
          <button
            onClick={() => onSelectReader('code')}
            title="View as Syntax Highlighted Code"
            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              currentCategory === 'code'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => onSelectReader('json')}
            title="View as JSON / Data Tree"
            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              currentCategory === 'json'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            Tree
          </button>
          <button
            onClick={() => onSelectReader('text')}
            title="View as Plain Text"
            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              currentCategory === 'text'
                ? 'bg-slate-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3 h-3" />
            Text
          </button>
          <button
            onClick={() => onSelectReader('hex')}
            title="View as Raw Hex Bytes"
            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              currentCategory === 'hex'
                ? 'bg-purple-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Binary className="w-3 h-3" />
            Hex
          </button>
        </div>
      )}

      {/* Main Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
        title="Change how this file is rendered"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">View As:</span>
        <ActiveIcon className={`w-3.5 h-3.5 ${activeOption.color}`} />
        <span className="font-semibold max-w-[120px] truncate">{activeOption.label.split('/')[0].trim()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 max-h-96 overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Select Reader Mode</span>
            <span className="font-mono text-[10px] text-slate-500 uppercase">{activeTab.extension || 'file'}</span>
          </div>

          <div className="space-y-0.5 pt-1">
            {READER_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = currentCategory === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelectReader(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${opt.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isSelected ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.2 rounded font-semibold">Active</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
