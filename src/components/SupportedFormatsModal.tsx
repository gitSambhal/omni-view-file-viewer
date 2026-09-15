/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Comprehensive Supported Formats & Reader Capabilities Directory Modal (shadcn/ui)
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { SUPPORTED_FORMATS, SUPPORTED_CATEGORIES } from '../data/supportedFormats';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

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

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">Supported File Formats & Capabilities</DialogTitle>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {SUPPORTED_FORMATS.length}+ Native Formats
                </Badge>
              </div>
              <DialogDescription className="text-xs mt-0.5">
                100% Offline & Private Local Engine with In-Browser Sandboxes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-muted/20 border-b border-border space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by extension (e.g. .dbf, .mdb, .http, .pdf, .sqlite), format name, or reader features..."
              className="pl-8 text-xs h-8 bg-background"
            />
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            {SUPPORTED_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="h-7 text-xs px-2.5 rounded-lg"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Formats Grid */}
        <ScrollArea className="max-h-[60vh] p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFormats.map((fmt, idx) => {
              const IconComp = fmt.icon;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-xl p-3.5 space-y-2.5 transition-all group shadow-2xs hover:border-primary/40"
                >
                  {/* Card Title & Ext Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg bg-muted border border-border ${fmt.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {fmt.name}
                        </h4>
                        <span className="text-[10px] font-mono text-muted-foreground">{fmt.categoryName}</span>
                      </div>
                    </div>

                    <Badge variant="outline" className="font-mono font-bold text-[10px] shrink-0">
                      {fmt.extension}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{fmt.description}</p>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {fmt.capabilities.map((cap, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-1.5 py-0.5 rounded bg-muted text-[9px] text-muted-foreground font-mono"
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
              <p className="text-muted-foreground text-xs">No formats match your search criteria "{searchQuery}".</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px]">All formats parse in-memory inside your browser with Zero Server Transmission.</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onLoadSamples && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoadSamples();
                  onClose();
                }}
                className="h-8 gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Load Samples</span>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
