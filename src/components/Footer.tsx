/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Footer & System Status Bar (shadcn/ui)
 */

import React from 'react';
import { TabFile } from '../types/file';
import { formatFileSize } from '../services/fileDetector';
import { RefreshCw, FileText, ShieldCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface FooterProps {
  activeTab: TabFile | null;
  onOpenChangelog: () => void;
  onToggleViewMode: () => void;
  onOpenLiveSyncDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  onOpenChangelog,
  onOpenLiveSyncDashboard
}) => {
  return (
    <footer className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-background/95 backdrop-blur-md border-t border-border text-xs text-muted-foreground font-mono select-none gap-2 transition-colors z-20">
      {/* Active Tab File Details */}
      <div className="flex items-center gap-2 min-w-0">
        {activeTab ? (
          <>
            <div className="flex items-center gap-1.5 text-foreground font-sans font-medium text-[11px] truncate">
              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[180px]">{activeTab.name}</span>
            </div>

            <span className="text-border">/</span>

            <span className="text-[11px] font-medium text-foreground">
              {formatFileSize(activeTab.size)}
            </span>

            <span className="text-border">/</span>

            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-mono">
              {activeTab.extension || activeTab.category}
            </Badge>

            {activeTab.liveSyncActive && (
              <>
                <span className="text-border">/</span>
                <button
                  onClick={onOpenLiveSyncDashboard}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium border border-emerald-500/20 transition-colors cursor-pointer text-[11px]"
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
          <span className="text-muted-foreground text-[11px]">No active workspace tab</span>
        )}
      </div>

      {/* Center / Right Attribution & Version */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-[11px] font-sans text-muted-foreground">
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
          className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-foreground"
          title="View Changelog & Release Notes"
        >
          v2.8.0
        </Button>
      </div>
    </footer>
  );
};
