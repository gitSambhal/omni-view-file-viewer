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
              <p className="text-xs text-slate-400">Release Version v1.0.0</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-slate-300 leading-relaxed font-sans">
          {/* Release Highlights */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Version 1.0.0 - Production Launch</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              OmniView Studio is designed from the ground up to provide seamless offline file previewing for any file type directly within your browser interface.
            </p>
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
