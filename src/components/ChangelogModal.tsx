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
                Release Version v2.6.0 with shadcn/ui Design System
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] p-5">
          <div className="space-y-4 text-sm leading-relaxed">
            {/* v2.6.0 Highlights */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Version 2.6.0 - shadcn/ui Redesign & Theme Tokens</span>
                </div>
                <Badge variant="default">Latest</Badge>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li><strong>shadcn/ui Component System:</strong> Integrated Radix UI primitives, standard Buttons, Badges, Tabs, Dropdowns, Dialogs, Tooltips, Sliders, and Sonner alerts.</li>
                <li><strong>Refined Enterprise Theme Tokens:</strong> Clean CSS variables with light and dark contrast modes, smooth animations, and accessibility compliance.</li>
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
