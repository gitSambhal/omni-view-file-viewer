/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - 100% Offline & Local File Previewer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useLiveSync } from './hooks/useLiveSync';
import { TabFile, FileCategory } from './types/file';
import { detectFileCategory, getFileExtension } from './services/fileDetector';
import { getSampleTabFiles } from './services/sampleFiles';

import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { DropZone } from './components/DropZone';
import { Footer } from './components/Footer';
import { ChangelogModal } from './components/ChangelogModal';
import { ToastContainer } from './components/Toast';
import { HexViewer } from './components/HexViewer';

import { PdfViewer } from './components/viewers/PdfViewer';
import { DocxViewer } from './components/viewers/DocxViewer';
import { ExcelViewer } from './components/viewers/ExcelViewer';
import { PptxViewer } from './components/viewers/PptxViewer';
import { CodeViewer } from './components/viewers/CodeViewer';
import { MarkdownViewer } from './components/viewers/MarkdownViewer';
import { DatabaseViewer } from './components/viewers/DatabaseViewer';
import { ImageViewer } from './components/viewers/ImageViewer';
import { MediaViewer } from './components/viewers/MediaViewer';
import { ZipViewer } from './components/viewers/ZipViewer';
import { JsonXmlViewer } from './components/viewers/JsonXmlViewer';
import { TextViewer } from './components/viewers/TextViewer';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  const [tabs, setTabs] = useState<TabFile[]>(() => getSampleTabFiles());
  const [activeTabId, setActiveTabId] = useState<string | null>('sample-md');
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || null;

  // File Live Sync Callback
  const handleFileUpdated = useCallback((updated: Partial<TabFile> & { id: string }) => {
    setTabs(prev =>
      prev.map(t => (t.id === updated.id ? { ...t, ...updated } : t))
    );
  }, []);

  const handleNotify = useCallback((type: 'info' | 'success' | 'warning', title: string, message: string) => {
    addToast(type, title, message);
  }, [addToast]);

  // Connect Live Sync hook to all active tabs
  const { isSyncing } = useLiveSync({
    tabs,
    onFileUpdated: handleFileUpdated,
    onNotify: handleNotify
  });

  // Process raw File object into TabFile
  const processFile = async (file: File, handle?: FileSystemFileHandle): Promise<TabFile> => {
    const category = detectFileCategory(file.name, file.type);
    const ext = getFileExtension(file.name);
    const tabId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let textContent: string | undefined;
    let arrayBuffer: ArrayBuffer | undefined;
    let objectUrl: string | undefined;

    if (category === 'code' || category === 'markdown' || category === 'text' || category === 'json') {
      textContent = await file.text();
    } else if (category === 'image' || category === 'pdf' || category === 'video' || category === 'audio') {
      arrayBuffer = await file.arrayBuffer();
      objectUrl = URL.createObjectURL(file);
    } else {
      arrayBuffer = await file.arrayBuffer();
      if (category === 'excel' || category === 'docx') {
        try {
          textContent = await file.text();
        } catch (_) {}
      }
    }

    return {
      id: tabId,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      extension: ext,
      category,
      fileRaw: file,
      fileHandle: handle,
      arrayBuffer,
      textContent,
      objectUrl,
      liveSyncActive: !!handle,
      lastSyncedAt: Date.now(),
      syncStatus: 'synced',
      viewMode: 'preview',
      zoomLevel: 100
    };
  };

  // Handle drag & drop or input file list
  const handleFilesSelected = async (files: FileList | File[]) => {
    const newTabs: TabFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const tab = await processFile(file);
        newTabs.push(tab);
      } catch (err: any) {
        addToast('error', 'Error opening file', `Could not read "${file.name}": ${err.message}`);
      }
    }

    if (newTabs.length > 0) {
      setTabs(prev => [...prev, ...newTabs]);
      setActiveTabId(newTabs[0].id);
      addToast('success', 'File Opened', `Successfully loaded ${newTabs.length} file(s) locally.`);
    }
  };

  // Open Native File Picker with File System Access API
  const handleOpenFilePicker = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const handles = await (window as any).showOpenFilePicker({
          multiple: true
        });

        const newTabs: TabFile[] = [];
        for (const handle of handles) {
          const file = await handle.getFile();
          const tab = await processFile(file, handle);
          newTabs.push(tab);
        }

        if (newTabs.length > 0) {
          setTabs(prev => [...prev, ...newTabs]);
          setActiveTabId(newTabs[0].id);
          addToast('success', 'Live Sync Active', `Opened ${newTabs.length} local file(s) with live update monitoring.`);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          addToast('info', 'Live Sync', 'File picker was cancelled.');
        } else {
          // SecurityError / NotAllowedError when inside iframe -> fallback to file input
          triggerFallbackFileInput();
        }
      }
    } else {
      triggerFallbackFileInput();
    }
  };

  const triggerFallbackFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: any) => {
      if (e.target.files) {
        handleFilesSelected(e.target.files);
      }
    };
    input.click();
  };

  // Tab management actions
  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);

    if (activeTabId === id) {
      setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const handleCloseOtherTabs = (id: string) => {
    const remaining = tabs.filter(t => t.id === id);
    setTabs(remaining);
    setActiveTabId(id);
    addToast('info', 'Tabs Closed', 'Closed all other tabs.');
  };

  const handleCloseTabsToRight = (id: string) => {
    const index = tabs.findIndex(t => t.id === id);
    if (index !== -1) {
      const remaining = tabs.slice(0, index + 1);
      setTabs(remaining);
      if (!remaining.some(t => t.id === activeTabId)) {
        setActiveTabId(id);
      }
      addToast('info', 'Tabs Closed', 'Closed tabs to the right.');
    }
  };

  const handleCloseAllTabs = () => {
    setTabs([]);
    setActiveTabId(null);
    addToast('info', 'All Tabs Closed', 'Workspace cleared.');
  };

  const handleDuplicateTab = (id: string) => {
    const tabToDup = tabs.find(t => t.id === id);
    if (!tabToDup) return;
    const newTab: TabFile = {
      ...tabToDup,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${tabToDup.name} (Copy)`
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    addToast('success', 'Tab Duplicated', `Created copy of "${tabToDup.name}".`);
  };

  const handleToggleLiveSyncTab = async (id: string) => {
    const target = tabs.find(t => t.id === id);
    if (!target) return;

    // If currently active, turn it off
    if (target.liveSyncActive) {
      setTabs(prev =>
        prev.map(t => (t.id === id ? { ...t, liveSyncActive: false } : t))
      );
      addToast('info', 'Live Sync', `Disabled live sync for "${target.name}".`);
      return;
    }

    // If target has a fileHandle already, turn it back on
    if (target.fileHandle) {
      setTabs(prev =>
        prev.map(t => (t.id === id ? { ...t, liveSyncActive: true, syncStatus: 'synced' } : t))
      );
      addToast('success', 'Live Sync Active', `Re-enabled real-time live sync for "${target.name}".`);
      return;
    }

    // If target does NOT have a fileHandle (e.g. opened via standard file input or sample)
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          multiple: false
        });
        if (handle) {
          const file = await handle.getFile();
          const updated = await processFile(file, handle);
          setTabs(prev =>
            prev.map(t => (t.id === id ? { ...updated, id: t.id } : t))
          );
          addToast('success', 'Live File Sync Active', `Linked "${file.name}" for real-time live sync.`);
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          addToast('info', 'Live Sync', 'File picker was cancelled.');
        } else {
          // Inside iframe or security restricted environment
          setTabs(prev =>
            prev.map(t => (t.id === id ? { ...t, liveSyncActive: true } : t))
          );
          addToast('warning', 'Live Sync Note', 'Iframe security restricts direct disk access. Open app in a new tab for native File System API access.');
        }
        return;
      }
    } else {
      setTabs(prev =>
        prev.map(t => (t.id === id ? { ...t, liveSyncActive: true } : t))
      );
      addToast('info', 'Live Sync Enabled', `Enabled live sync for "${target.name}".`);
    }
  };

  const handleToggleHexViewTab = (id: string) => {
    setTabs(prev =>
      prev.map(t =>
        t.id === id ? { ...t, viewMode: t.viewMode === 'hex' ? 'preview' : 'hex' } : t
      )
    );
  };

  const handleDownloadTabFile = (id: string) => {
    const target = tabs.find(t => t.id === id);
    if (!target) return;

    if (target.objectUrl) {
      const a = document.createElement('a');
      a.href = target.objectUrl;
      a.download = target.name;
      a.click();
    } else if (target.textContent) {
      const blob = new Blob([target.textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = target.name;
      a.click();
      URL.revokeObjectURL(url);
    } else if (target.arrayBuffer) {
      const blob = new Blob([target.arrayBuffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = target.name;
      a.click();
      URL.revokeObjectURL(url);
    }
    addToast('success', 'File Downloaded', `Initiated download for "${target.name}".`);
  };

  const handleToggleHexView = () => {
    if (!activeTabId) return;
    handleToggleHexViewTab(activeTabId);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFilePicker();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          setTabs(prev => {
            const rem = prev.filter(t => t.id !== activeTabId);
            if (rem.length > 0) setActiveTabId(rem[rem.length - 1].id);
            else setActiveTabId(null);
            return rem;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId]);

  const liveSyncCount = tabs.filter(t => t.liveSyncActive).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenFilePicker={handleOpenFilePicker}
        onLoadSampleFiles={() => {
          setTabs(getSampleTabFiles());
          setActiveTabId('sample-md');
          addToast('info', 'Demos Loaded', 'Loaded sample interactive files.');
        }}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenHexForCurrentTab={handleToggleHexView}
        liveSyncCount={liveSyncCount}
        isSyncing={isSyncing}
      />

      {/* Tab Bar */}
      {tabs.length > 0 && (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onCloseOtherTabs={handleCloseOtherTabs}
          onCloseTabsToRight={handleCloseTabsToRight}
          onCloseAllTabs={handleCloseAllTabs}
          onDuplicateTab={handleDuplicateTab}
          onToggleLiveSyncTab={handleToggleLiveSyncTab}
          onToggleHexViewTab={handleToggleHexViewTab}
          onDownloadTabFile={handleDownloadTabFile}
          onNewTab={handleOpenFilePicker}
        />
      )}

      {/* Main Workspace Stage */}
      <main className="flex-1 flex overflow-hidden relative">
        {tabs.length === 0 || !activeTab ? (
          <DropZone
            onFilesSelected={handleFilesSelected}
            onOpenFilePicker={handleOpenFilePicker}
            onLoadSamples={() => {
              setTabs(getSampleTabFiles());
              setActiveTabId('sample-md');
            }}
          />
        ) : activeTab.viewMode === 'hex' ? (
          <HexViewer
            arrayBuffer={activeTab.arrayBuffer}
            textContent={activeTab.textContent}
            filename={activeTab.name}
          />
        ) : (
          /* Render category specific viewer */
          <div className="w-full h-full flex flex-col overflow-hidden">
            {activeTab.category === 'pdf' && (
              <PdfViewer
                objectUrl={activeTab.objectUrl}
                arrayBuffer={activeTab.arrayBuffer}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'docx' && (
              <DocxViewer
                arrayBuffer={activeTab.arrayBuffer}
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'excel' && (
              <ExcelViewer
                arrayBuffer={activeTab.arrayBuffer}
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'pptx' && (
              <PptxViewer
                arrayBuffer={activeTab.arrayBuffer}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'code' && (
              <CodeViewer
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'markdown' && (
              <MarkdownViewer
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'database' && (
              <DatabaseViewer
                arrayBuffer={activeTab.arrayBuffer}
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'image' && (
              <ImageViewer
                objectUrl={activeTab.objectUrl}
                dataUrl={activeTab.dataUrl}
                arrayBuffer={activeTab.arrayBuffer}
                textContent={activeTab.textContent}
                filename={activeTab.name}
                size={activeTab.size}
              />
            )}

            {(activeTab.category === 'video' || activeTab.category === 'audio') && (
              <MediaViewer
                objectUrl={activeTab.objectUrl}
                dataUrl={activeTab.dataUrl}
                arrayBuffer={activeTab.arrayBuffer}
                filename={activeTab.name}
                isAudio={activeTab.category === 'audio'}
              />
            )}

            {activeTab.category === 'archive' && (
              <ZipViewer
                arrayBuffer={activeTab.arrayBuffer}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'json' && (
              <JsonXmlViewer
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'text' && (
              <TextViewer
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}

            {activeTab.category === 'hex' && (
              <HexViewer
                arrayBuffer={activeTab.arrayBuffer}
                textContent={activeTab.textContent}
                filename={activeTab.name}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        activeTab={activeTab}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onToggleViewMode={handleToggleHexView}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* Non-blocking Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
