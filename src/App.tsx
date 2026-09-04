/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - 100% Offline & Local File Previewer
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useLiveSync } from './hooks/useLiveSync';
import { TabFile, FileCategory } from './types/file';
import { detectFileCategory, getFileExtension } from './services/fileDetector';
import { getSampleTabFiles } from './services/sampleFiles';
import { generateSampleEpubBuffer } from './services/sampleEpub';
import { generateSampleWavBlob, generateSampleVideoBlob } from './services/sampleMedia';

import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { DropZone } from './components/DropZone';
import { Footer } from './components/Footer';
import { ChangelogModal } from './components/ChangelogModal';
import { LiveSyncModal } from './components/LiveSyncModal';
import { SupportedFormatsModal } from './components/SupportedFormatsModal';
import { ToastContainer } from './components/Toast';
import { HexViewer } from './components/HexViewer';
import { ReaderSwitcher } from './components/ReaderSwitcher';

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
import { LogViewer } from './components/viewers/LogViewer';
import { SubtitleViewer } from './components/viewers/SubtitleViewer';
import { GeoJsonViewer } from './components/viewers/GeoJsonViewer';
import { EbookViewer } from './components/viewers/EbookViewer';
import { HttpRestViewer } from './components/viewers/HttpRestViewer';
import { BinaryInspectorViewer } from './components/viewers/BinaryInspectorViewer';
import { FontViewer } from './components/viewers/FontViewer';
import { CertificateViewer } from './components/viewers/CertificateViewer';
import { HtmlPreviewViewer } from './components/viewers/HtmlPreviewViewer';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  const [tabs, setTabs] = useState<TabFile[]>(() => getSampleTabFiles());
  const [activeTabId, setActiveTabId] = useState<string | null>('sample-md');

  // Lazily populate sample EPUB ArrayBuffer and sample media Blobs on initial mount
  useEffect(() => {
    const epubTab = tabs.find(t => t.id === 'sample-epub');
    if (epubTab && !epubTab.arrayBuffer) {
      generateSampleEpubBuffer().then(buf => {
        setTabs(prev =>
          prev.map(t =>
            t.id === 'sample-epub' ? { ...t, arrayBuffer: buf, size: buf.byteLength } : t
          )
        );
      });
    }

    const audioTab = tabs.find(t => t.id === 'sample-audio');
    if (audioTab && !audioTab.objectUrl) {
      try {
        const wavBlob = generateSampleWavBlob();
        const url = URL.createObjectURL(wavBlob);
        setTabs(prev =>
          prev.map(t =>
            t.id === 'sample-audio' ? { ...t, objectUrl: url, size: wavBlob.size } : t
          )
        );
      } catch (err) {
        console.warn('Could not generate sample audio:', err);
      }
    }

    const videoTab = tabs.find(t => t.id === 'sample-video');
    if (videoTab && !videoTab.objectUrl) {
      generateSampleVideoBlob().then(vidBlob => {
        if (vidBlob && vidBlob.size > 0) {
          const url = URL.createObjectURL(vidBlob);
          setTabs(prev =>
            prev.map(t =>
              t.id === 'sample-video' ? { ...t, objectUrl: url, size: vidBlob.size } : t
            )
          );
        }
      }).catch(err => {
        console.warn('Could not generate sample video:', err);
      });
    }
  }, []);
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);
  const [isLiveSyncDashboardOpen, setIsLiveSyncDashboardOpen] = useState<boolean>(false);
  const [isSupportedFormatsModalOpen, setIsSupportedFormatsModalOpen] = useState<boolean>(false);
  const [isDraggingOverApp, setIsDraggingOverApp] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

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

    // 1. Instant zero-copy streaming object URL for media / documents / preview
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (_) {}

    // 2. Read text content for text-based formats (safe buffer size up to 15MB)
    const isBinaryEbook = ['epub', 'mobi', 'azw', 'azw3', 'odt', 'pages', 'key', 'numbers', 'odp'].includes(ext);
    const isTextFormat = (!isBinaryEbook && [
      'code', 'markdown', 'text', 'json', 'log', 'subtitle', 'geojson', 'database', 'http', 'certificate'
    ].includes(category)) || (!isBinaryEbook && file.type.startsWith('text/')) || ['sql', 'csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'env', 'ini', 'toml', 'log', 'srt', 'vtt', 'properties', 'http', 'rest', 'pem', 'crt', 'cer', 'key', 'pub', 'csr', 'rtf'].includes(ext);

    if (isTextFormat && file.size < 15 * 1024 * 1024) {
      try {
        textContent = await file.text();
      } catch (_) {}
    }

    // 3. Read ArrayBuffer only when needed for binary parsing (E-Book, DLL, Binary, Font, Excel, Docx, Zip, PDF, small files < 35MB)
    // NOTE: Avoid reading huge contiguous ArrayBuffer for video/audio (> 30MB) since they stream directly from objectUrl
    if (category !== 'video' && category !== 'audio' && file.size < 35 * 1024 * 1024) {
      try {
        arrayBuffer = await file.arrayBuffer();
      } catch (_) {}
    } else if (file.size < 5 * 1024 * 1024) {
      try {
        arrayBuffer = await file.arrayBuffer();
      } catch (_) {}
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

  // Global App-Level Drag and Drop Handlers
  const handleAppDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOverApp(true);
    }
  };

  const handleAppDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDraggingOverApp(false);
    }
  };

  const handleAppDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAppDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDraggingOverApp(false);

    const newTabs: TabFile[] = [];

    // Modern browser File System Access API: extract file handles from items if available
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          try {
            if ('getAsFileSystemHandle' in item) {
              const handle = await (item as any).getAsFileSystemHandle();
              if (handle && handle.kind === 'file') {
                const file = await handle.getFile();
                const tab = await processFile(file, handle);
                newTabs.push(tab);
                continue;
              }
            }
          } catch (_) {}

          const file = item.getAsFile();
          if (file) {
            try {
              const tab = await processFile(file);
              newTabs.push(tab);
            } catch (err: any) {
              addToast('error', 'Error opening file', `Could not read "${file.name}": ${err.message}`);
            }
          }
        }
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        try {
          const tab = await processFile(file);
          newTabs.push(tab);
        } catch (err: any) {
          addToast('error', 'Error opening file', `Could not read "${file.name}": ${err.message}`);
        }
      }
    }

    if (newTabs.length > 0) {
      setTabs(prev => [...prev, ...newTabs]);
      setActiveTabId(newTabs[0].id);
      const withLiveSync = newTabs.filter(t => t.liveSyncActive).length;
      if (withLiveSync > 0) {
        addToast('success', 'Live Sync Active', `Opened ${newTabs.length} file(s) with ${withLiveSync} in live real-time sync.`);
      } else {
        addToast('success', 'Files Opened', `Successfully loaded ${newTabs.length} file(s).`);
      }
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

  const handleSetTabReader = (id: string, reader: FileCategory) => {
    setTabs(prev =>
      prev.map(t => (t.id === id ? { ...t, activeReader: reader, viewMode: reader === 'hex' ? 'hex' : 'preview' } : t))
    );
    addToast('info', 'Reader Mode Changed', `Switched reader mode for active file.`);
  };

  const handleTabContentChange = (id: string, newContent: string) => {
    setTabs(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              textContent: newContent,
              hasUnsavedChanges: true
            }
          : t
      )
    );
  };

  const handleSaveTabToDisk = async (id: string, contentToSave?: string): Promise<boolean> => {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return false;

    const content = contentToSave !== undefined ? contentToSave : tab.textContent;
    if (content === undefined) return false;

    // Case 1: Tab already has a linked FileSystemFileHandle
    if (tab.fileHandle) {
      try {
        const writable = await (tab.fileHandle as any).createWritable();
        await writable.write(content);
        await writable.close();

        const updatedFile = await tab.fileHandle.getFile();
        setTabs(prev =>
          prev.map(t =>
            t.id === id
              ? {
                  ...t,
                  textContent: content,
                  lastModified: updatedFile.lastModified,
                  size: updatedFile.size,
                  lastSyncedAt: Date.now(),
                  syncStatus: 'synced',
                  hasUnsavedChanges: false
                }
              : t
          )
        );
        addToast('success', 'File Saved & Synced', `"${tab.name}" saved directly to disk.`);
        return true;
      } catch (err: any) {
        console.warn('Direct fileHandle write failed, attempting save picker fallback:', err);
      }
    }

    // Case 2: No fileHandle or permission requires picker
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: tab.name
        });
        if (handle) {
          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();

          const newFile = await handle.getFile();
          setTabs(prev =>
            prev.map(t =>
              t.id === id
                ? {
                    ...t,
                    name: newFile.name,
                    fileHandle: handle,
                    liveSyncActive: true,
                    textContent: content,
                    lastModified: newFile.lastModified,
                    size: newFile.size,
                    lastSyncedAt: Date.now(),
                    syncStatus: 'synced',
                    hasUnsavedChanges: false
                  }
                : t
            )
          );
          addToast('success', 'Saved & Live Sync Linked', `Saved "${newFile.name}" and linked real-time live sync.`);
          return true;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleDownloadTabFile(id);
        }
      }
    } else {
      handleDownloadTabFile(id);
    }
    return false;
  };

  const handleReloadTabFromDisk = async (id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !tab.fileHandle) {
      addToast('info', 'Live Sync', 'File is not linked to a local disk handle.');
      return;
    }

    try {
      const file = await tab.fileHandle.getFile();
      let textContent: string | undefined;
      const isTextCategory = ['code', 'markdown', 'text', 'json', 'log', 'subtitle', 'geojson', 'database', 'http', 'certificate', 'html'].includes(tab.category) || file.type.startsWith('text/');
      if (isTextCategory) {
        textContent = await file.text();
      }
      const arrayBuffer = await file.arrayBuffer();
      const objectUrl = URL.createObjectURL(file);

      setTabs(prev =>
        prev.map(t =>
          t.id === id
            ? {
                ...t,
                textContent: textContent !== undefined ? textContent : t.textContent,
                arrayBuffer,
                objectUrl,
                lastModified: file.lastModified,
                size: file.size,
                lastSyncedAt: Date.now(),
                syncStatus: 'synced',
                hasUnsavedChanges: false,
                syncCount: (t.syncCount || 0) + 1
              }
            : t
        )
      );
      addToast('success', 'Reloaded from Disk', `"${tab.name}" refreshed with latest disk state.`);
    } catch (err: any) {
      addToast('error', 'Reload Failed', `Could not read "${tab.name}" from disk: ${err.message}`);
    }
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
    <div
      onDragEnter={handleAppDragEnter}
      onDragOver={handleAppDragOver}
      onDragLeave={handleAppDragLeave}
      onDrop={handleAppDrop}
      className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200 relative"
    >
      {/* App-Level Fullscreen Drag & Drop Overlay */}
      {isDraggingOverApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 border-4 border-dashed border-blue-500 animate-in fade-in duration-150 pointer-events-none">
          <div className="bg-slate-900/95 border border-blue-500/40 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-md space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center animate-bounce">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Drop files to open in OmniView</h3>
              <p className="text-xs text-slate-300">
                Release anywhere to open in dedicated tabs with 100% offline privacy.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
              <span>MP4, MKV, Code, ENV, YAML, Logs, PDF & 50+ formats</span>
            </div>
          </div>
        </div>
      )}

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
        onOpenLiveSyncDashboard={() => setIsLiveSyncDashboardOpen(true)}
        onOpenSupportedFormats={() => setIsSupportedFormatsModalOpen(true)}
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
          onOpenLiveSyncDashboard={() => setIsLiveSyncDashboardOpen(true)}
          onNewTab={handleOpenFilePicker}
        />
      )}

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">
        {tabs.length === 0 || !activeTab ? (
          <DropZone
            onFilesSelected={handleFilesSelected}
            onOpenFilePicker={handleOpenFilePicker}
            onLoadSamples={() => {
              setTabs(getSampleTabFiles());
              setActiveTabId('sample-md');
            }}
            onOpenSupportedFormats={() => setIsSupportedFormatsModalOpen(true)}
          />
        ) : activeTab.viewMode === 'hex' ? (
          <div className="w-full flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">
            {/* Top Reader Subheader Bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 select-none shrink-0 relative z-30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{activeTab.name}</span>
                <span className="text-[11px] font-mono text-slate-400">({(activeTab.size / 1024).toFixed(1)} KB)</span>
              </div>
              <ReaderSwitcher
                activeTab={activeTab}
                onSelectReader={(reader) => handleSetTabReader(activeTab.id, reader)}
              />
            </div>
            <HexViewer
              arrayBuffer={activeTab.arrayBuffer}
              textContent={activeTab.textContent}
              filename={activeTab.name}
            />
          </div>
        ) : (
          /* Render category specific viewer with dynamic Reader Switcher */
          <div className="w-full flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">
            {/* Top Reader Subheader Bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 select-none shrink-0 relative z-30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{activeTab.name}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeTab.size > 1024 * 1024
                    ? `${(activeTab.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(activeTab.size / 1024).toFixed(1)} KB`}
                </span>
                {activeTab.liveSyncActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync
                  </span>
                )}
              </div>
              <ReaderSwitcher
                activeTab={activeTab}
                onSelectReader={(reader) => handleSetTabReader(activeTab.id, reader)}
              />
            </div>

            {/* Dynamic Viewer Render */}
            {(() => {
              const currentCategory = activeTab.activeReader || activeTab.category;

              if (currentCategory === 'pdf') {
                return (
                  <PdfViewer
                    objectUrl={activeTab.objectUrl}
                    arrayBuffer={activeTab.arrayBuffer}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'docx') {
                return (
                  <DocxViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'excel') {
                return (
                  <ExcelViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'pptx') {
                return (
                  <PptxViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'html') {
                return (
                  <HtmlPreviewViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                    onSwitchToCode={() => handleSetTabReader(activeTab.id, 'code')}
                  />
                );
              }
              if (currentCategory === 'code') {
                return (
                  <CodeViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                    fileHandle={activeTab.fileHandle}
                    liveSyncActive={activeTab.liveSyncActive}
                    syncStatus={activeTab.syncStatus}
                    lastSyncedAt={activeTab.lastSyncedAt}
                    hasUnsavedChanges={activeTab.hasUnsavedChanges}
                    onContentChange={(newContent) => handleTabContentChange(activeTab.id, newContent)}
                    onSaveToDisk={(content) => handleSaveTabToDisk(activeTab.id, content)}
                    onReloadFromDisk={() => handleReloadTabFromDisk(activeTab.id)}
                    onToggleLiveSync={() => handleToggleLiveSyncTab(activeTab.id)}
                    onSwitchToLivePreview={() => handleSetTabReader(activeTab.id, 'html')}
                    onSwitchToDatabase={() => handleSetTabReader(activeTab.id, 'database')}
                  />
                );
              }
              if (currentCategory === 'markdown') {
                return (
                  <MarkdownViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'database') {
                return (
                  <DatabaseViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'image') {
                return (
                  <ImageViewer
                    objectUrl={activeTab.objectUrl}
                    dataUrl={activeTab.dataUrl}
                    arrayBuffer={activeTab.arrayBuffer}
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                    size={activeTab.size}
                  />
                );
              }
              if (currentCategory === 'video' || currentCategory === 'audio') {
                return (
                  <MediaViewer
                    objectUrl={activeTab.objectUrl}
                    dataUrl={activeTab.dataUrl}
                    arrayBuffer={activeTab.arrayBuffer}
                    fileRaw={activeTab.fileRaw}
                    filename={activeTab.name}
                    isAudio={currentCategory === 'audio'}
                  />
                );
              }
              if (currentCategory === 'archive') {
                return (
                  <ZipViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'json') {
                return (
                  <JsonXmlViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'text') {
                return (
                  <TextViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'log') {
                return (
                  <LogViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'subtitle') {
                return (
                  <SubtitleViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'geojson') {
                return (
                  <GeoJsonViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'http') {
                return (
                  <HttpRestViewer
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'binary') {
                return (
                  <BinaryInspectorViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'font') {
                return (
                  <FontViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'certificate') {
                return (
                  <CertificateViewer
                    textContent={activeTab.textContent}
                    arrayBuffer={activeTab.arrayBuffer}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'ebook') {
                return (
                  <EbookViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              if (currentCategory === 'hex') {
                return (
                  <HexViewer
                    arrayBuffer={activeTab.arrayBuffer}
                    textContent={activeTab.textContent}
                    filename={activeTab.name}
                  />
                );
              }
              return (
                <TextViewer
                  textContent={activeTab.textContent}
                  filename={activeTab.name}
                />
              );
            })()}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        activeTab={activeTab}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onToggleViewMode={handleToggleHexView}
        onOpenLiveSyncDashboard={() => setIsLiveSyncDashboardOpen(true)}
      />

      {/* Live Sync Dashboard Modal */}
      <LiveSyncModal
        isOpen={isLiveSyncDashboardOpen}
        onClose={() => setIsLiveSyncDashboardOpen(false)}
        tabs={tabs}
        onToggleLiveSyncTab={handleToggleLiveSyncTab}
        isSyncing={isSyncing}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* Supported Formats Directory Modal */}
      <SupportedFormatsModal
        isOpen={isSupportedFormatsModalOpen}
        onClose={() => setIsSupportedFormatsModalOpen(false)}
        onLoadSamples={() => {
          setTabs(getSampleTabFiles());
          setActiveTabId('sample-md');
          addToast('info', 'Demos Loaded', 'Loaded interactive sample files.');
        }}
      />

      {/* Non-blocking Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
