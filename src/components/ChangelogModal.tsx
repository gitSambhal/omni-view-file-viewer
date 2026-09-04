/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Changelog Modal
 */

import React from 'react';
import { X, Sparkles, ShieldCheck, Layers, ExternalLink, Command, Package, FolderTree } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">What's New in OmniView Studio</h3>
              <p className="text-xs text-slate-400">Release Version v2.2.0</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300 leading-relaxed font-sans">
          {/* v2.2.0 Highlights */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Version 2.2.0 - Unified Workspace Layout & Global Command Palette</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Workspace Explorer Sidebar (<code>Ctrl+B</code> / <code>Cmd+B</code>):</strong> Collapsible left sidebar providing real-time RAM memory consumption monitoring, active reader badges, unsaved changes tracking, and quick scratchpad creation.</li>
              <li><strong>Global Command Palette (<code>Ctrl+K</code> / <code>Cmd+K</code>):</strong> Instant fuzzy-searchable hub to switch files, launch tools, run code snippets, and toggle dark mode with full keyboard accessibility.</li>
              <li><strong>Streamlined Modern Header:</strong> Consolidated secondary utilities into a unified Tools dropdown menu while keeping essential scratchpad and file triggers front-and-center.</li>
              <li><strong>Interactive Welcome Hub:</strong> Direct scratchpad starters for TypeScript, Python 3.12, SQLite, Markdown, and HTML Canvas.</li>
            </ul>
          </div>

          {/* v2.1.0 Highlights */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Version 2.1.0 - Dynamic NPM Package Loader & Playground</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>In-Memory CDN Package Resolution:</strong> Load and run any NPM package on demand in JS/TS sandboxes via <code>esm.sh</code> and <code>jsdelivr</code> without <code>npm install</code>.</li>
              <li><strong>NPM Package Playground Modal:</strong> Search packages, inspect live module exports with type badges, and test code snippets with 10+ curated presets (Lodash, Zod, Dayjs, Mathjs, etc.).</li>
              <li><strong>1-Click Code Editor Integration:</strong> Directly insert import statements into active tabs or open ready-to-run files.</li>
            </ul>
          </div>

          {/* v2.0.0 Highlights */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Version 2.0.0 - Universal Code Runners & Python 3.12 Wasm</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Python 3.12 Pyodide:</strong> Full client-side CPython WebAssembly runtime for algorithms and mathematics.</li>
              <li><strong>TypeScript Sucrase AST Engine:</strong> Fast in-memory transpiler with type-safe execution and JSX support.</li>
              <li><strong>AlaSQL SQLite Engine:</strong> Relational SQL runner with live interactive result tables.</li>
              <li><strong>Universal URL Fetcher:</strong> Open any remote asset directly with GitHub raw normalization and CORS proxy fallback.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Developer Attribution</span>
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Created by Suhail Akhtar <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
