/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { useEffect, useRef, useState } from 'react';
import { TabFile } from '../types/file';

interface UseLiveSyncOptions {
  tabs: TabFile[];
  onFileUpdated: (updatedTab: Partial<TabFile> & { id: string }) => void;
  onNotify: (type: 'info' | 'success' | 'warning', title: string, message: string) => void;
  enabled?: boolean;
  pollIntervalMs?: number;
}

export function useLiveSync({
  tabs,
  onFileUpdated,
  onNotify,
  enabled = true,
  pollIntervalMs = 1200
}: UseLiveSyncOptions) {
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;

    const checkFileStatus = async () => {
      const currentTabs = tabsRef.current;
      const liveTabs = currentTabs.filter(t => t.liveSyncActive && t.fileHandle);

      if (liveTabs.length === 0) return;

      for (const tab of liveTabs) {
        if (isCancelled || !tab.fileHandle) continue;

        try {
          const newFile = await tab.fileHandle.getFile();
          if (newFile.lastModified > tab.lastModified) {
            // Trigger visual live sync indicator
            setIsSyncing(true);
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
              setIsSyncing(false);
            }, 1800);

            let textContent: string | undefined;
            let arrayBuffer: ArrayBuffer | undefined;
            let objectUrl: string | undefined;

            const isTextCategory = [
              'code', 'markdown', 'text', 'json', 'log', 'subtitle', 'geojson', 'database', 'http', 'certificate', 'html'
            ].includes(tab.category) || newFile.type.startsWith('text/');

            if (isTextCategory && newFile.size < 15 * 1024 * 1024) {
              textContent = await newFile.text();
            }

            if (tab.category === 'image' || tab.category === 'pdf' || tab.category === 'video' || tab.category === 'audio') {
              arrayBuffer = await newFile.arrayBuffer();
              objectUrl = URL.createObjectURL(newFile);
            } else if (!textContent && newFile.size < 35 * 1024 * 1024) {
              arrayBuffer = await newFile.arrayBuffer();
            }

            const now = Date.now();
            const nextSyncCount = (tab.syncCount || 0) + 1;

            onFileUpdated({
              id: tab.id,
              lastModified: newFile.lastModified,
              size: newFile.size,
              fileRaw: newFile,
              textContent: textContent !== undefined ? textContent : tab.textContent,
              arrayBuffer: arrayBuffer || tab.arrayBuffer,
              objectUrl: objectUrl || tab.objectUrl,
              lastSyncedAt: now,
              syncCount: nextSyncCount,
              syncStatus: 'synced',
              hasUnsavedChanges: false
            });

            onNotify(
              'info',
              'Live File Sync',
              `"${newFile.name}" updated from disk and reloaded.`
            );
          }
        } catch (err: any) {
          console.warn(`Live sync check skipped for ${tab.name}:`, err);
        }
      }
    };

    const intervalId = setInterval(checkFileStatus, pollIntervalMs);

    const handleFocus = () => {
      checkFileStatus();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [enabled, pollIntervalMs, onFileUpdated, onNotify]);

  return { isSyncing };
}
