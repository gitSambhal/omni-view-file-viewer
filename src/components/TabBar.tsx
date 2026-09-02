/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
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

  // Scroll active tab to center whenever activeTabId changes or tabs update
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTabId, tabs.length]);

  // Close context menu on click outside or escape key
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

    // Clamp coordinates so menu doesn't overflow screen
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
        return <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const targetTab = contextMenu ? tabs.find(t => t.id === contextMenu.tabId) : null;

  return (
    <div className="flex items-center bg-slate-100/70 dark:bg-[#070b12] border-b border-slate-200/80 dark:border-slate-800/80 px-2 overflow-x-auto select-none no-scrollbar transition-colors">
      <div className="flex items-center gap-1 py-1 flex-1 min-w-0">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={e => handleContextMenu(e, tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono cursor-pointer transition-all max-w-[220px] shrink-0 border ${
                isActive
                  ? 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
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
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin relative z-10 font-bold" />
                    </span>
                  ) : (
                    <span className="relative flex items-center justify-center">
                      <RefreshCw className="w-3 h-3 text-emerald-500 dark:text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={e => onCloseTab(tab.id, e)}
                className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Close Tab (Right click for context menu)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Open New File Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && targetTab && (
        <div
          ref={menuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-56 bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 text-xs text-slate-700 dark:text-slate-200 font-sans backdrop-blur-md animate-in fade-in duration-100 select-none"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate">
            {targetTab.name}
          </div>

          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                onCloseTab(targetTab.id);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-red-500" />
              <span>Close Tab</span>
            </button>

            {onCloseOtherTabs && (
              <button
                onClick={() => {
                  onCloseOtherTabs(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowRightCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Close Tabs to the Right</span>
              </button>
            )}

            {onCloseAllTabs && (
              <button
                onClick={() => {
                  onCloseAllTabs();
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Close All Tabs</span>
              </button>
            )}
          </div>

          <div className="my-0.5 border-t border-slate-100 dark:border-slate-800/80" />

          <div className="py-0.5 space-y-0.5">
            {onDuplicateTab && (
              <button
                onClick={() => {
                  onDuplicateTab(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                <span>Live Sync Telemetry</span>
              </button>
            )}

            {onToggleHexViewTab && (
              <button
                onClick={() => {
                  onToggleHexViewTab(targetTab.id);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-pink-500" />
                <span>Download File</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
