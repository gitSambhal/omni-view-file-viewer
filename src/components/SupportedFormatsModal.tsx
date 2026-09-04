/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Comprehensive Supported Formats & Reader Capabilities Directory Modal
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  X,
  FolderOpen,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { SUPPORTED_FORMATS, SUPPORTED_CATEGORIES, FormatDefinition } from '../data/supportedFormats';

interface SupportedFormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSamples?: () => void;
}

export const SupportedFormatsModal: React.FC<SupportedFormatsModalProps> = ({
  isOpen,
  onClose,
  onLoadSamples
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFormats = useMemo(() => {
    return SUPPORTED_FORMATS.filter(fmt => {
      const matchCat =
        selectedCategory === 'all' ||
        fmt.category === selectedCategory ||
        (selectedCategory === 'code' && fmt.category === 'code') ||
        (selectedCategory === 'json' && (fmt.category === 'json' || fmt.category === 'markdown'));

      const matchSearch =
        searchQuery === '' ||
        fmt.extension.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fmt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fmt.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fmt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fmt.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <span>Supported File Formats & Capabilities</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {SUPPORTED_FORMATS.length}+ Native Formats
                </span>
              </h3>
              <p className="text-xs text-slate-400">100% Offline & Private Local Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by extension (e.g. .http, .dll, .pdf, .sqlite, .ttf), format name, or reader features..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {SUPPORTED_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formats Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormats.map((fmt, idx) => {
              const IconComp = fmt.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4.5 space-y-3 transition-all group shadow-sm hover:shadow-md"
                >
                  {/* Card Title & Ext Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${fmt.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-blue-300 transition-colors">
                          {fmt.name}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">{fmt.categoryName}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${fmt.badgeBg}`}>
                      {fmt.extension}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed">{fmt.description}</p>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fmt.capabilities.map((cap, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 font-mono"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFormats.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-slate-400 text-sm">No formats match your search criteria "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>All formats parse in-memory inside your browser with Zero Server Transmission.</span>
          </div>

          <div className="flex items-center gap-3">
            {onLoadSamples && (
              <button
                onClick={() => {
                  onLoadSamples();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/30 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Interactive Samples</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
