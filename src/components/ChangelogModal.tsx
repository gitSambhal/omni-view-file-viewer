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
              <DialogTitle className="text-base font-bold font-sans">What's New in OmniView</DialogTitle>
              <DialogDescription className="text-xs mt-0.5 font-sans">
                Release Version v4.3.1 — Native PDF & In-Archive Direct Preview Engine
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] p-5 font-sans">
          <div className="space-y-4 text-sm leading-relaxed">
            {/* v4.3.1 Highlights */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 4.3.1 - Native In-Archive PDF Previewer</span>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">LATEST</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>PDF In-Archive Preview Fixed:</strong> Replaced the blocked iframe with the native, sandboxed PDF.js canvas engine for zero-glitch PDF reading directly inside ZIP, TAR, VHD, and ISO files.</li>
                <li><strong>Memory Alignment Slicing:</strong> Guaranteed byteOffset 0 alignment for WebAssembly / PDF binary decoders on in-memory extracted files.</li>
                <li><strong>Full PDF Controls:</strong> Multi-page navigation, zoom, rotation, search, thumbnails, and security password decryption inside archives.</li>
                <li><strong>Multi-Format In-Archive Previews:</strong> Word (.docx), Excel (.xlsx), Database (.db/.sqlite/.sql), Markdown, and Code now preview directly with full fidelity.</li>
                <li><strong>Sample Archive:</strong> Added <code>project_workspace.zip</code> with an embedded PDF specification to test instantly.</li>
              </ul>
            </div>

            {/* v4.3.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 4.3.0 - Universal Archive & Virtual Disk Suite</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v4.3.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>All Major Archives:</strong> In-memory decompression for ZIP, TAR, TAR.GZ, TGZ, GZ, BZ2, 7Z, RAR (4.x/5.0), CAB, DEB, AR, and CPIO.</li>
                <li><strong>VHD & VHDX Virtual Hard Disks:</strong> Fixed & Dynamic sparse disk parsing, MBR/GPT partition tables, and in-VHD FAT filesystem mounter.</li>
                <li><strong>ISO-9660 Disc Images:</strong> Optical disc volume descriptor and directory tree traversal without burning or extraction.</li>
                <li><strong>Direct In-Memory Previews:</strong> View nested documents, images, code, tables, and media immediately inside the container without extracting to disk.</li>
                <li><strong>Open in Workspace Tab:</strong> Promote any extracted file directly into an active OmniView tab.</li>
              </ul>
            </div>

            {/* v4.2.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 4.2.0 - Anti-Clutter UI/UX Overhaul</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v4.2.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Serene Landing Experience:</strong> Removed the massive 500-line embedded formats list from the drop zone in favor of a clean, focused, welcoming drop target.</li>
                <li><strong>Single-Toolbar Architecture:</strong> Removed duplicate zoom, print, and copy controls inside individual document viewers.</li>
                <li><strong>Zero-Pill Restraint:</strong> Converted static pill tags into clean, unboxed typography with typographic separators.</li>
              </ul>
            </div>

            {/* v4.1.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 4.1.0 - Streamlined Minimalist Studio</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v4.1.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>De-Cluttered Interface:</strong> Removed noisy pseudo-hardware brackets, fake screws, flashing indicators, and shouting uppercase labels.</li>
                <li><strong>Balanced Typography:</strong> Natural, legible sans-serif hierarchy across all controls with monospace reserved strictly for code.</li>
              </ul>
            </div>

            {/* v4.0.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 4.0.0 - Multi-Deck Core Updates</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v4.0.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li>High-performance offline multi-format workspace core.</li>
                <li>Interactive sandbox buffers and expanded 60+ codecs matrix.</li>
              </ul>
            </div>

            {/* v3.5.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 3.5.0 - Bespoke Workspace Architecture & Design Harmony</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v3.5.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Distinctive Single-Row Header:</strong> Clean 3-zone Top Bar Contract with custom OmniView branding, inline editable active document breadcrumbs, theme selector, and primary actions.</li>
                <li><strong>Rhythmic Spacing & Ergonomics:</strong> Retained calm 4px/8px rhythm, breathable padding, and hairline dividers without cloning literal office menus or search pills.</li>
                <li><strong>Streamlined Workspace Action Bar:</strong> Integrated 36px utility bar with reader mode switching, zoom controls, format metrics, and export tools.</li>
                <li><strong>Accessible Segmented Filter Bars:</strong> Swapped out static chips for interactive, zero-pill segmented controls.</li>
              </ul>
            </div>

            {/* v3.4.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 3.4.0 - Workspace Typography & Theming</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v3.4.0</span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>Typography System:</strong> Integrated Google Sans, Product Sans, and Roboto font pairings with tabular figures.</li>
                <li><strong>Dynamic Accent Theming:</strong> Customizable palette across Electric Indigo, Emerald, Amber, Violet, Cyan, and Rose.</li>
              </ul>
            </div>

            {/* v3.3.0 Highlights */}
            <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 3.3.0 - Per-Format SEO & Schema.org Structured Data</span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">v3.3.0</span>
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
