/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Tab Bar with Radix Context Menu (shadcn/ui)
 */

import React, { useEffect, useRef } from 'react';
import {
  FileText,
  Table,
  Presentation,
  Code,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Database,
  Eye,
  X,
  Plus,
  RefreshCw,
  FileCode,
  Copy,
  Download,
  Binary,
  ArrowRightCircle,
  XCircle,
  Layers,
  Terminal,
  Captions,
  MapPin,
  BookOpen
} from 'lucide-react';
import { TabFile, FileCategory } from '../types/file';
import { Button } from './ui/button';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuLabel
} from './ui/context-menu';

interface TabBarProps {
  tabs: TabFile[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e?: React.MouseEvent) => void;
  onCloseOtherTabs?: (id: string) => void;
  onCloseTabsToRight?: (id: string) => void;
  onCloseAllTabs?: () => void;
  onDuplicateTab?: (id: string) => void;
  onToggleLiveSyncTab?: (id: string) => void;
  onToggleHexViewTab?: (id: string) => void;
  onDownloadTabFile?: (id: string) => void;
  onOpenLiveSyncDashboard?: () => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
  onCloseAllTabs,
  onDuplicateTab,
  onToggleLiveSyncTab,
  onToggleHexViewTab,
  onDownloadTabFile,
  onOpenLiveSyncDashboard,
  onNewTab
}) => {
  const activeTabRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTabId, tabs.length]);

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'docx':
        return <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'excel':
        return <Table className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'pptx':
        return <Presentation className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'code':
        return <Code className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case 'markdown':
        return <FileCode className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'archive':
        return <Archive className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'json':
        return <Code className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'log':
        return <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'subtitle':
        return <Captions className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case 'geojson':
        return <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'ebook':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      default:
        return <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <div className="flex items-center bg-muted/40 border-b border-border px-2 overflow-x-auto select-none no-scrollbar transition-colors">
      <div className="flex items-center gap-1 py-1 flex-1 min-w-0">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;

          return (
            <ContextMenu key={tab.id}>
              <ContextMenuTrigger asChild>
                <div
                  ref={isActive ? activeTabRef : null}
                  onClick={() => onSelectTab(tab.id)}
                  data-active-tab={isActive ? "true" : "false"}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer transition-all max-w-[220px] shrink-0 ${
                    isActive
                      ? 'bg-background border-t-2 border-t-primary border-x border-b-0 border-border text-foreground font-medium shadow-2xs -mb-px z-10'
                      : 'border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {getCategoryIcon(tab.category)}
                  <span className="truncate flex-1 text-[11px] font-sans font-medium">{tab.name}</span>

                  {/* Live sync badge & icon indicator */}
                  {tab.liveSyncActive && (
                    <div
                      className="relative flex items-center justify-center shrink-0 cursor-pointer p-0.5 rounded hover:bg-emerald-500/10 transition-colors"
                      onClick={e => {
                        e.stopPropagation();
                        if (onToggleLiveSyncTab) onToggleLiveSyncTab(tab.id);
                      }}
                      title={`Live Sync Active: ${tab.name}\n• Status: ${tab.syncStatus === 'syncing' ? 'Syncing...' : 'Watching'}\n• Last Synced: ${tab.lastSyncedAt ? new Date(tab.lastSyncedAt).toLocaleTimeString() : 'Now'}`}
                    >
                      {tab.syncStatus === 'syncing' ? (
                        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <RefreshCw className="w-2.5 h-2.5 text-emerald-500 animate-spin relative z-10 font-bold" />
                        </span>
                      ) : (
                        <span className="relative flex items-center justify-center">
                          <RefreshCw className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                        </span>
                      )}
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={e => onCloseTab(tab.id, e)}
                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Close Tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent className="w-56">
                <ContextMenuLabel className="font-mono text-[11px] text-muted-foreground truncate">
                  {tab.name}
                </ContextMenuLabel>
                <ContextMenuSeparator />

                <ContextMenuItem onClick={() => onCloseTab(tab.id)}>
                  <X className="w-3.5 h-3.5 text-destructive mr-2" />
                  <span>Close Tab</span>
                  <ContextMenuShortcut>Ctrl+W</ContextMenuShortcut>
                </ContextMenuItem>

                {onCloseOtherTabs && (
                  <ContextMenuItem onClick={() => onCloseOtherTabs(tab.id)}>
                    <XCircle className="w-3.5 h-3.5 text-amber-500 mr-2" />
                    <span>Close Other Tabs</span>
                  </ContextMenuItem>
                )}

                {onCloseTabsToRight && (
                  <ContextMenuItem onClick={() => onCloseTabsToRight(tab.id)}>
                    <ArrowRightCircle className="w-3.5 h-3.5 text-primary mr-2" />
                    <span>Close Tabs to Right</span>
                  </ContextMenuItem>
                )}

                {onCloseAllTabs && (
                  <ContextMenuItem onClick={onCloseAllTabs}>
                    <Layers className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                    <span>Close All Tabs</span>
                  </ContextMenuItem>
                )}

                <ContextMenuSeparator />

                {onDuplicateTab && (
                  <ContextMenuItem onClick={() => onDuplicateTab(tab.id)}>
                    <Copy className="w-3.5 h-3.5 text-purple-500 mr-2" />
                    <span>Duplicate Tab</span>
                  </ContextMenuItem>
                )}

                {onToggleLiveSyncTab && (
                  <ContextMenuItem onClick={() => onToggleLiveSyncTab(tab.id)}>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                    <span>{tab.liveSyncActive ? 'Disable Live Sync' : 'Enable Live Sync'}</span>
                  </ContextMenuItem>
                )}

                {onOpenLiveSyncDashboard && (
                  <ContextMenuItem onClick={onOpenLiveSyncDashboard}>
                    <RefreshCw className="w-3.5 h-3.5 text-primary mr-2" />
                    <span>Live Sync Telemetry</span>
                  </ContextMenuItem>
                )}

                {onToggleHexViewTab && (
                  <ContextMenuItem onClick={() => onToggleHexViewTab(tab.id)}>
                    <Binary className="w-3.5 h-3.5 text-cyan-500 mr-2" />
                    <span>{tab.viewMode === 'hex' ? 'Standard Preview' : 'Hex Byte Inspector'}</span>
                  </ContextMenuItem>
                )}

                {onDownloadTabFile && (
                  <ContextMenuItem onClick={() => onDownloadTabFile(tab.id)}>
                    <Download className="w-3.5 h-3.5 text-primary mr-2" />
                    <span>Download File</span>
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}

        {/* New Tab Button */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNewTab}
          className="text-muted-foreground hover:text-foreground shrink-0"
          title="Open New File Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
