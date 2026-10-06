/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Clean Footer & Status Bar
 */

import React from 'react';
import { TabFile } from '../types/file';
import { formatFileSize } from '../services/fileDetector';
import { RefreshCw, FileText, Binary, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';

interface FooterProps {
  activeTab: TabFile | null;
  onOpenChangelog: () => void;
  onToggleViewMode?: () => void;
  onOpenLiveSyncDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onOpenChangelog,
  onToggleViewMode,
  onOpenLiveSyncDashboard
}) => {
  return (
    <footer className="flex flex-wrap items-center justify-between px-3 py-1 bg-card border-t border-border text-xs text-muted-foreground select-none gap-2 transition-colors z-20 shrink-0 font-sans">
      {/* Active Tab Details */}
      <div className="flex items-center gap-2 min-w-0">
        {activeTab ? (
          <>
            <div className="flex items-center gap-1.5 text-foreground font-medium text-xs truncate">
              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[180px]">{activeTab.name}</span>
            </div>

            <span className="text-border">·</span>

            <span className="text-[11px] font-mono tabular-nums text-foreground">
              {formatFileSize(activeTab.size)}
            </span>

            <span className="text-border">·</span>

            <span className="text-[10px] font-mono uppercase bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
              {activeTab.extension || activeTab.category}
            </span>

            {onToggleViewMode && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={onToggleViewMode}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer text-[10px] font-mono ${
                    activeTab.viewMode === 'hex'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  title={activeTab.viewMode === 'hex' ? 'Return to standard preview' : 'Inspect binary hex bytes'}
                >
                  <Binary className="w-3 h-3" />
                  <span>{activeTab.viewMode === 'hex' ? 'HEX' : 'Hex'}</span>
                </button>
              </>
            )}

            {activeTab.liveSyncActive && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={onOpenLiveSyncDashboard}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium transition-colors cursor-pointer text-[10px] font-mono"
                  title="Live Disk Sync"
                >
                  <RefreshCw className={`w-3 h-3 ${activeTab.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>Synced</span>
                </button>
              </>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-xs">Ready</span>
        )}
      </div>

      {/* Developer Attribution & Version */}
      <div className="flex items-center gap-2.5 shrink-0 font-sans">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            Created by{' '}
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              Suhail Akhtar
            </a>
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenChangelog}
          className="h-5 px-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground rounded border-border cursor-pointer shadow-2xs"
          title="Release Notes & Changelog"
        >
          v4.3.1
        </Button>
      </div>
    </footer>
  );
};
