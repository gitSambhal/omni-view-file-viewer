/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * File Format SEO & Structured Data Inspector Dialog
 */

import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
  Tag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FormatSeoRecord, generateFormatJsonLd } from '../data/formatSeoData';

interface FormatSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatRecord: FormatSeoRecord | null;
  onOpenFormat?: (record: FormatSeoRecord) => void;
}

export const FormatSeoModal: React.FC<FormatSeoModalProps> = ({
  isOpen,
  onClose,
  formatRecord,
  onOpenFormat
}) => {
  const [copiedType, setCopiedType] = useState<'jsonld' | 'url' | 'title' | null>(null);

  if (!formatRecord) return null;

  const currentUrl = `https://file.suhail.top/?format=${formatRecord.id}`;
  const jsonLdData = generateFormatJsonLd(formatRecord, currentUrl);
  const jsonLdString = JSON.stringify(jsonLdData, null, 2);

  const handleCopy = (text: string, type: 'jsonld' | 'url' | 'title') => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold truncate">
                  {formatRecord.name}
                </DialogTitle>
                <span className="font-mono text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {formatRecord.extension}
                </span>
              </div>
              <DialogDescription className="text-xs mt-0.5">
                Search Engine Optimization, OpenGraph Card & Schema.org Structured Data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable SEO Body */}
        <ScrollArea className="max-h-[70vh] p-5">
          <div className="space-y-5 text-left">
            {/* 1. Google Search Snippet Simulation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Search Engine Snippet Preview</span>
                </span>
                <button
                  onClick={() => handleCopy(currentUrl, 'url')}
                  className="text-[11px] text-primary hover:underline font-normal cursor-pointer flex items-center gap-1"
                >
                  {copiedType === 'url' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied URL!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>Copy Canonical Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  <span>https://file.suhail.top</span>
                  <span className="text-muted-foreground">›</span>
                  <span>format={formatRecord.id}</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-tight">
                  {formatRecord.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                  {formatRecord.metaDescription}
                </p>
              </div>
            </div>

            {/* 2. Technical File Specs & IANA MIME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border/80 bg-secondary/30 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Official MIME Type
                </span>
                <p className="font-mono font-medium text-foreground text-[11px] truncate">
                  {formatRecord.mimeType}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border/80 bg-secondary/30 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  File Magic Bytes / Signature
                </span>
                <p className="font-mono font-medium text-foreground text-[11px] truncate">
                  {formatRecord.magicBytes || 'ASCII / Unicode text stream'}
                </p>
              </div>
            </div>

            {/* 3. Indexed Keywords & Search Queries */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                <span>Target Search Queries & Keywords</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formatRecord.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Structured Data Schema.org (JSON-LD) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Schema.org Structured Data (application/ld+json)</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(jsonLdString, 'jsonld')}
                  className="h-7 text-xs gap-1.5"
                >
                  {copiedType === 'jsonld' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Schema</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON-LD</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-muted/60 border border-border overflow-x-auto max-h-48 text-[11px] font-mono text-muted-foreground leading-relaxed">
                <pre>{jsonLdString}</pre>
              </div>
            </div>

            {/* 5. Frequently Asked Questions (FAQPage) */}
            {formatRecord.faqs.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Search Engine FAQPage Schema Entities</span>
                </span>
                <div className="space-y-2">
                  {formatRecord.faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="p-3 rounded-xl border border-border bg-card/60 space-y-1">
                      <p className="text-xs font-semibold text-foreground">{faq.question}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-3.5 border-t border-border bg-muted/40">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% In-Memory Local Verification</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Close
            </Button>
            {onOpenFormat && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenFormat(formatRecord);
                  onClose();
                }}
                className="h-8 text-xs gap-1.5 font-semibold"
              >
                <span>Launch / Open {formatRecord.extension}</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
