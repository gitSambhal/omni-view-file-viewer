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
  pollIntervalMs = 1500
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
            // Trigger temporary spinning indicator when disk changes are found
            setIsSyncing(true);
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
              setIsSyncing(false);
            }, 1800);

            let textContent: string | undefined;
            let arrayBuffer: ArrayBuffer | undefined;
            let objectUrl: string | undefined;

            if (tab.category === 'code' || tab.category === 'markdown' || tab.category === 'text' || tab.category === 'json') {
              textContent = await newFile.text();
            } else if (tab.category === 'image' || tab.category === 'pdf' || tab.category === 'video' || tab.category === 'audio') {
              arrayBuffer = await newFile.arrayBuffer();
              objectUrl = URL.createObjectURL(newFile);
            } else {
              arrayBuffer = await newFile.arrayBuffer();
              if (tab.category === 'excel' || tab.category === 'docx') {
                try {
                  textContent = await newFile.text();
                } catch (_) {}
              }
            }

            onFileUpdated({
              id: tab.id,
              lastModified: newFile.lastModified,
              size: newFile.size,
              fileRaw: newFile,
              textContent,
              arrayBuffer,
              objectUrl: objectUrl || tab.objectUrl,
              lastSyncedAt: Date.now(),
              syncStatus: 'synced'
            });

            onNotify(
              'info',
              'Live File Sync',
              `"${newFile.name}" changed on disk and was automatically reloaded.`
            );
          }
        } catch (err) {
          onFileUpdated({
            id: tab.id,
            syncStatus: 'paused'
          });
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
