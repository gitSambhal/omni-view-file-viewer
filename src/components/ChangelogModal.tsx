/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { X, Sparkles, ShieldCheck, Layers, ExternalLink } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">What's New in OmniView Studio</h3>
              <p className="text-xs text-slate-400">Release Version v1.8.0</p>
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
          {/* v1.8.0 Highlights */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Version 1.8.0 - Intelligent Quick Switcher & Search-Enabled View Menu</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Intelligent Quick Switcher Chips:</strong> View modes (Tree, Code, Text, Hex, Preview, Table, Captions, Map) are now dynamically computed for supported files only. Plain code files cleanly show Code/Text/Hex without invalid Tree views, while JSON/XML/YAML files display full Tree inspectors.</li>
              <li><strong>Search-Enabled View Dropdown:</strong> Real-time search filter across all 23+ viewers by name, description, category, and file extensions with instant keyboard navigation (<kbd className="px-1 py-0.2 bg-slate-800 rounded font-mono text-[10px]">Esc</kbd>).</li>
              <li><strong>Suggested Readers:</strong> Automatic badges identifying the most relevant rendering engines for the active file.</li>
              <li><strong>Stacking & Z-Index Protection:</strong> High-elevation dropdown rendering ensuring options are never trapped behind iframes, canvases, or viewer layers.</li>
            </ul>
          </div>

          {/* v1.7.0 Highlights */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Version 1.7.0 - Interactive Code Editor, Prettier Formatter & Live Sync v2</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Multi-Language Code Formatter:</strong> 1-Click code formatting powered by Prettier standalone and specialized formatters for JS, TS, HTML, CSS, Markdown, YAML, SQL, and JSON with keyboard shortcut (<code>Shift + Alt + F</code> / <code>Ctrl + Shift + I</code>).</li>
              <li><strong>Typography & Line Height Controls:</strong> Customizable line-height spacing (Compact 1.35x, Normal 1.6x, Relaxed 1.85x, Spacious 2.1x), font scaling (10px - 26px), and monospace typeface selector (JetBrains Mono, Fira Code, Cascadia, Consolas, System).</li>
              <li><strong>Interactive Code Editing & Indentation:</strong> Smart multi-line Tab indentation, Enter key auto-indentation with brace expansion, and auto-closing bracket pairs.</li>
              <li><strong>Integrated Search & Replace:</strong> Real-time match navigation, case-sensitivity toggle, replace, and replace all.</li>
              <li><strong>Live Sync v2 with Bidirectional Disk Save:</strong> Real-time disk watching, direct disk save (<code>Ctrl + S</code>) via File System Access API, and automatic FileSystemFileHandle extraction on file drop.</li>
            </ul>
          </div>

          {/* v1.6.0 Highlights */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Version 1.6.0 - Interactive E-Book (EPUB) Engine & Universal Code Sandbox</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Interactive E-Book Engine (.epub):</strong> True client-side ZIP decompression parsing OPF spine, metadata, and NCX table of contents with 4 reading themes (Paper, Sepia, Midnight, OLED), font scaling, line height controls, book search, and Web Speech API Read Aloud audio reader.</li>
              <li><strong>Universal Code Sandbox & Script Runner:</strong> In-browser interactive script runner for JavaScript, TypeScript, Python, and Bash scripts with live console output drawer.</li>
              <li><strong>Enlarged Manual SQL Studio:</strong> Spacious, full-featured SQL editor with AlaSQL in-memory engine, multi-tab results, and keyboard execution.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">
              Key Capabilities & Formats
            </h4>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-100">100% Offline & Local Processing Engine:</strong> Files stay entirely in browser memory; zero cloud uploads for maximum security & privacy.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-100">Live File Sync:</strong> Monitors local disk files for modification changes using File System Access handles and periodic polling with live badges.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-100">Multi-Tab Workspace:</strong> Open and switch between dozens of files simultaneously with tab close/reorder controls.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-100">Universal Format Viewers:</strong> PDF, Word (.docx), Excel (.xlsx, .csv), PowerPoint (.pptx), Code syntax highlighting for 50+ languages, Markdown, SQLite databases, EXIF image inspector, Media waveform visualizer, and ZIP archives.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-slate-100">Universal Hex Byte Inspector:</strong> Fallback 16-column Hex & ASCII raw byte viewer for binary or unhandled file types.
                </div>
              </li>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
