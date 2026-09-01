/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { TabFile } from '../types/file';
import { formatFileSize } from '../services/fileDetector';
import { RefreshCw, FileText, Lock } from 'lucide-react';

interface FooterProps {
  activeTab: TabFile | null;
  onOpenChangelog: () => void;
  onToggleViewMode: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onOpenChangelog,
  onToggleViewMode
}) => {
  return (
    <footer className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono select-none gap-2 transition-colors">
      {/* Active Tab File Details */}
      <div className="flex items-center gap-3">
        {activeTab ? (
          <>
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
              <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="truncate max-w-[180px]">{activeTab.name}</span>
            </div>

            <span className="text-slate-400 dark:text-slate-600">|</span>

            <span>Size: <strong className="text-slate-800 dark:text-slate-200">{formatFileSize(activeTab.size)}</strong></span>

            <span className="text-slate-400 dark:text-slate-600">|</span>

            <span>Format: <strong className="text-slate-800 dark:text-slate-200 uppercase">{activeTab.extension || activeTab.category}</strong></span>

            {activeTab.liveSyncActive && (
              <>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Live Syncing
                </span>
              </>
            )}
          </>
        ) : (
          <span className="text-slate-500">No active file tab</span>
        )}
      </div>

      {/* Center / Right Attribution & Version */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Created by{' '}
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium underline-offset-2 transition-colors"
            >
              Suhail Akhtar
            </a>
          </span>
        </div>

        <button
          onClick={onOpenChangelog}
          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-300 dark:border-slate-700 font-semibold transition-colors cursor-pointer"
          title="View Changelog & Release Notes"
        >
          v1.0.0
        </button>
      </div>
    </footer>
  );
};
