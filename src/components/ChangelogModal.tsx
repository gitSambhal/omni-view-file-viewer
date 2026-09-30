/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Changelog Modal (shadcn/ui)
 */

import React from 'react';
import { Sparkles, Layers, ExternalLink, Package, FolderTree, Database } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">What's New in OmniView File Studio</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Release Version v3.3.0 with Comprehensive Per-Format SEO & Schema.org Structured Data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] p-5">
          <div className="space-y-4 text-sm leading-relaxed">
            {/* v3.3.0 Highlights */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 3.3.0 - Per-Format SEO & Schema.org Structured Data</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-primary">Latest</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Dynamic Head SEO & OpenGraph Synchronizer:</strong> Automatic page title, description, and social graph synchronization based on the active tab or format deep link (<code>?format=...</code>).</li>
                <li><strong>Format SEO & Schema Inspector:</strong> 1-click modal to preview Google search snippets, copy Schema.org JSON-LD (<code>@type: WebApplication</code> and <code>FAQPage</code>), and inspect target search keywords.</li>
                <li><strong>Comprehensive Root Crawling Metadata:</strong> Complete MIME <code>fileFormat</code> directory, <code>ItemList</code> of 60+ formats, and rich FAQ structured data in <code>index.html</code>.</li>
              </ul>
            </div>

            {/* v3.2.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 3.2.0 - Interactive Supported Formats & Readers Dashboard</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v3.2.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Dashboard Format Cards:</strong> Direct visual catalog of supported formats featuring authentic category icons, extension tags, and capability highlights right on the home landing page.</li>
                <li><strong>Interactive Categories & Search:</strong> Quickly toggle between Documents, Code & Web, Data & SQL, Media & Assets, and System & Security, or search in real-time.</li>
                <li><strong>1-Click Launch:</strong> Click any format card to launch its in-browser sandbox or open the file picker filtered for that specific file type.</li>
              </ul>
            </div>

            {/* v3.1.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 3.1.0 - Electric Indigo Primary & Dynamic Accent Engine</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v3.1.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Fresh Primary Identity:</strong> Modern Electric Indigo (<code>#4F46E5</code> / <code>#6366F1</code>) replaced legacy blue, giving the studio a bold, high-contrast, professional developer aesthetic.</li>
                <li><strong>Interactive Accent Switcher:</strong> Instant header dropdown to switch between 6 vibrant themes: Electric Indigo, Electric Violet, Cyber Emerald, Ocean Cyan, Sunset Amber, and Neon Rose.</li>
                <li><strong>Refined Slate & Obsidian Surfaces:</strong> Crisp Slate White canvas (<code>#F8F9FC</code>) and Obsidian dark canvas (<code>#0B0C10</code>) with razor-sharp borders and zero glass blur.</li>
                <li><strong>Docked Active Tab Indicators:</strong> TabBar active tab now sports a top accent line docking seamlessly into the viewport.</li>
              </ul>
            </div>

            {/* v3.0.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Version 3.0.0 - Modern Studio Redesign & Best Practices UI Components</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v3.0.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Modern Workspace Architecture:</strong> Single-elevation depth, responsive 1440px desktop layout integrity, and 60-30-10 color distribution with zero glass blur.</li>
                <li><strong>Universal Zero-Pill Compliance:</strong> Replaced static candy pill tags and bordered chips with clean unboxed text and typographic bullet separators.</li>
                <li><strong>High-Fidelity Radix Components:</strong> Polished accessible Dialogs, Dropdown Menus, Context Menus, and Scroll Areas with tactile physics (<code>active:scale-[0.98]</code>).</li>
                <li><strong>Strict Tabular Figures:</strong> Enforced <code>font-mono tabular-nums</code> across all numeric displays, file sizes, offsets, and counters.</li>
              </ul>
            </div>

            {/* v2.9.6 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Version 2.9.6 - Dependency Optimizer & Stale Chunk Resolution</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v2.9.6</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Vite Pre-bundler Compatibility:</strong> Configured <code>optimizeDeps.exclude</code> for <code>pdfjs-dist</code> with modern ES module execution.</li>
                <li><strong>Native ESNext Build Target:</strong> Guaranteed modern top-level await and Web Worker threading support across all document viewers.</li>
              </ul>
            </div>

            {/* v2.9.5 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Version 2.9.5 - Apple HIG UI/UX Redesign (Zero Glass UI)</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v2.9.5</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Apple Human Interface Guidelines (HIG):</strong> Re-engineered design system with San Francisco typography hierarchy, Apple squircle radii (10px), authentic macOS traffic light window controls, and solid Apple palettes (#F5F5F7 canvas, #FFFFFF cards, #0071E3 accent blue).</li>
                <li><strong>Strict Zero Glass UI Discipline:</strong> Completely eliminated frosted glass, translucent blurs, and backdrop filters in favor of crisp, opaque, physical surfaces with high-clarity contrast.</li>
                <li><strong>Apple Segmented Controls:</strong> Integrated physical segmented slider controls across workspace category filters, engine selectors, and format toggles.</li>
                <li><strong>Spotlight Command Palette:</strong> Revamped keyboard command palette (⌘K) to mirror macOS Spotlight with refined keyboard navigation, clean list hierarchy, and instant search.</li>
                <li><strong>macOS Safari & Finder Tabs:</strong> Restyled tab bar with physical tab docking, seamless content integration, and refined close affordances.</li>
              </ul>
            </div>

            {/* v2.9.4 Highlights */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <Database className="w-4 h-4" />
                <span>Version 2.9.4 - Case-Insensitive SQL Column & Identifier Matching</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>In-Memory Query Engine:</strong> Configured case-insensitive identifier resolution across table names and columns for seamless querying regardless of schema casing.</li>
                <li><strong>Identifier Quoting Support:</strong> Supported double-quoted and bracketed column and table identifiers in SQLite and AlaSQL statements.</li>
              </ul>
            </div>

            {/* v2.5.0 Highlights */}
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-teal-600 dark:text-teal-400">
                <Database className="w-4 h-4" />
                <span>Version 2.5.0 - Universal DBF, MDB & Database Engine</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>dBASE & FoxPro (.dbf):</strong> Binary parser for legacy dBase III/IV and Visual FoxPro tables with field descriptors and schema extraction.</li>
                <li><strong>Microsoft Access Jet/ACE (.mdb, .accdb):</strong> System catalog, page allocation, and column parser.</li>
                <li><strong>In-Memory AlaSQL Sandbox:</strong> Live interactive SQL query engine with table search, pagination, and multi-format exports.</li>
              </ul>
            </div>

            {/* v2.4.1 Highlights */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>Version 2.4.1 - Encrypted PDF Rendering Hotfix</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Post-Decryption Rendering Fix:</strong> Resolved an issue where decrypted PDFs did not appear on canvas after password validation; added layout synchronization.</li>
                <li><strong>Vite Worker Asset Pipeline:</strong> Bundled dedicated PDF worker asset for rock-solid document parsing.</li>
              </ul>
            </div>

            {/* v2.4.0 Highlights */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
                <Sparkles className="w-4 h-4" />
                <span>Version 2.4.0 - Encrypted PDF Decryption & Ultra HD HiDPI Studio</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Password-Protected PDF Decryption:</strong> Native document decryption screen with automatic error feedback and credential retention.</li>
                <li><strong>Ultra HD HiDPI Retina Rendering:</strong> Hardware-accelerated canvas bitmap scaling for razor-sharp vector typography.</li>
              </ul>
            </div>

            {/* v2.3.0 Highlights */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Version 2.3.0 - Open File from Copy-Pasting</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Clipboard File Ingestion:</strong> Ingest copied text, JSON, SQL queries, Python scripts, or image screenshots directly into active workspace tabs.</li>
                <li><strong>Heuristic Detection:</strong> Automatic syntax detection and starter templates.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Developer Attribution</span>
              <a
                href="https://suhail.top"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                Created by Suhail Akhtar <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </ScrollArea>

        <div className="p-3 bg-muted/40 border-t border-border flex justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Got it, Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
