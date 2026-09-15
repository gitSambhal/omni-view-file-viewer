/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Tab Bar (shadcn/ui)
 */

import React, { useState, useEffect, useRef } from 'react';
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

interface ContextMenuState {
  x: number;
  y: number;
  tabId: string;
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
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 220;
    const menuHeight = 280;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ x, y, tabId });
  };

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

  const targetTab = contextMenu ? tabs.find(t => t.id === contextMenu.tabId) : null;

  return (
    <div className="flex items-center bg-muted/40 border-b border-border px-2 overflow-x-auto select-none no-scrollbar transition-colors">
      <div className="flex items-center gap-1 py-1 flex-1 min-w-0">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={e => handleContextMenu(e, tab.id)}
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
                  title={`Live Sync Active: ${tab.name}\n• Status: ${tab.syncStatus === 'syncing' ? 'Syncing changes...' : 'Watching disk'}\n• Last Synced: ${tab.lastSyncedAt ? new Date(tab.lastSyncedAt).toLocaleTimeString() : 'Just now'}\n• Reloads: ${tab.syncCount || 0} auto-reloads`}
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
                title="Close Tab (Right-click for options)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNewTab}
          className="text-muted-foreground hover:text-foreground"
          title="Open New File Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && targetTab && (
        <div
          ref={menuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-[99999] w-56 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-1 text-xs font-sans backdrop-blur-md animate-in fade-in duration-100 select-none"
        >
          <div className="px-2.5 py-1.5 border-b border-border font-mono text-[11px] font-medium text-muted-foreground truncate">
            {targetTab.name}
          </div>

          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                onCloseTab(targetTab.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-destructive" />
                <span>Close Tab</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Ctrl+W</span>
            </button>

            {onCloseOtherTabs && (
              <button
                onClick={() => {
                  onCloseOtherTabs(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Close Other Tabs</span>
              </button>
            )}

            {onCloseTabsToRight && (
              <button
                onClick={() => {
                  onCloseTabsToRight(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <ArrowRightCircle className="w-3.5 h-3.5 text-primary" />
                <span>Close Tabs to the Right</span>
              </button>
            )}

            {onCloseAllTabs && (
              <button
                onClick={() => {
                  onCloseAllTabs();
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Close All Tabs</span>
              </button>
            )}
          </div>

          <div className="my-0.5 border-t border-border" />

          <div className="py-0.5 space-y-0.5">
            {onDuplicateTab && (
              <button
                onClick={() => {
                  onDuplicateTab(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-purple-500" />
                <span>Duplicate Tab</span>
              </button>
            )}

            {onToggleLiveSyncTab && (
              <button
                onClick={() => {
                  onToggleLiveSyncTab(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>{targetTab.liveSyncActive ? 'Disable Live Sync' : 'Enable Live Sync'}</span>
              </button>
            )}

            {onOpenLiveSyncDashboard && (
              <button
                onClick={() => {
                  onOpenLiveSyncDashboard();
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>Live Sync Telemetry</span>
              </button>
            )}

            {onToggleHexViewTab && (
              <button
                onClick={() => {
                  onToggleHexViewTab(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <Binary className="w-3.5 h-3.5 text-cyan-500" />
                <span>{targetTab.viewMode === 'hex' ? 'Standard Preview' : 'Hex Byte Mode'}</span>
              </button>
            )}

            {onDownloadTabFile && (
              <button
                onClick={() => {
                  onDownloadTabFile(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Download File</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
