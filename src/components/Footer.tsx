/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { TabFile } from '../types/file';
import { formatFileSize } from '../services/fileDetector';
import { RefreshCw, FileText, ShieldCheck, Sparkles } from 'lucide-react';

interface FooterProps {
  activeTab: TabFile | null;
  onOpenChangelog: () => void;
  onToggleViewMode: () => void;
  onOpenLiveSyncDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onOpenChangelog,
  onToggleViewMode,
  onOpenLiveSyncDashboard
}) => {
  return (
    <footer className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-mono select-none gap-2 transition-colors z-20">
      {/* Active Tab File Details */}
      <div className="flex items-center gap-2.5 min-w-0">
        {activeTab ? (
          <>
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-sans font-medium text-[11px] truncate">
              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate max-w-[180px]">{activeTab.name}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">/</span>

            <span className="text-[11px]"><strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatFileSize(activeTab.size)}</strong></span>

            <span className="text-slate-300 dark:text-slate-700">/</span>

            <span className="text-[11px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">{activeTab.extension || activeTab.category}</span>

            {activeTab.liveSyncActive && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <button
                  onClick={onOpenLiveSyncDashboard}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium border border-emerald-500/20 transition-colors cursor-pointer text-[11px]"
                  title="Click to view Live Sync telemetry"
                >
                  <RefreshCw className={`w-3 h-3 ${activeTab.syncStatus === 'syncing' ? 'animate-spin text-emerald-500' : 'text-emerald-500'}`} />
                  <span>{activeTab.syncStatus === 'syncing' ? 'Syncing...' : 'Live Sync'}</span>
                  <span className="text-[10px] opacity-75">
                    ({activeTab.lastSyncedAt ? new Date(activeTab.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Now'})
                  </span>
                </button>
              </>
            )}
          </>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">No active workspace tab</span>
        )}
      </div>

      {/* Center / Right Attribution & Version */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-[11px] font-sans text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Created by <a
            href="https://suhail.top"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Suhail Akhtar
          </a></span>
        </div>

        <button
          onClick={onOpenChangelog}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title="View Changelog & Release Notes"
        >
          v2.2.0
        </button>
      </div>
    </footer>
  );
};

