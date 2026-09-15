/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Open File From Copy-Pasting Dialog
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ClipboardPaste,
  FileCode,
  FileText,
  Table,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Zap,
  Code2,
  Binary,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers
} from 'lucide-react';
import { TabFile, FileCategory } from '../types/file';
import { detectFileCategory, formatFileSize } from '../services/fileDetector';

export interface PasteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileCreated: (tab: TabFile) => void;
  initialText?: string;
  onShowToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

interface FormatPreset {
  ext: string;
  name: string;
  category: FileCategory;
  mime: string;
}

const FORMAT_PRESETS: FormatPreset[] = [
  { ext: 'json', name: 'JSON', category: 'json', mime: 'application/json' },
  { ext: 'ts', name: 'TypeScript', category: 'code', mime: 'application/typescript' },
  { ext: 'py', name: 'Python', category: 'code', mime: 'text/x-python' },
  { ext: 'sql', name: 'SQL', category: 'database', mime: 'application/sql' },
  { ext: 'md', name: 'Markdown', category: 'markdown', mime: 'text/markdown' },
  { ext: 'html', name: 'HTML', category: 'html', mime: 'text/html' },
  { ext: 'csv', name: 'CSV', category: 'excel', mime: 'text/csv' },
  { ext: 'xml', name: 'XML', category: 'code', mime: 'application/xml' },
  { ext: 'svg', name: 'SVG', category: 'image', mime: 'image/svg+xml' },
  { ext: 'yaml', name: 'YAML', category: 'code', mime: 'text/yaml' },
  { ext: 'txt', name: 'Plain Text', category: 'text', mime: 'text/plain' },
  { ext: 'log', name: 'Log File', category: 'log', mime: 'text/plain' }
];

const SAMPLE_SNIPPETS = {
  json: `{
  "status": "success",
  "data": {
    "project": "OmniView File Studio",
    "domain": "file.suhail.top",
    "developer": "Suhail Akhtar",
    "features": [
      "100% Offline & Private",
      "60+ Formats Supported",
      "In-Browser Python 3.12 & TypeScript Sandboxes",
      "Dynamic NPM Package Playground"
    ],
    "metrics": {
      "executionSpeedMs": 14,
      "memoryAllocatedMb": 28.5
    }
  }
}`,
  sql: `-- Interactive In-Browser SQLite Query
CREATE TABLE IF NOT EXISTS developers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  role TEXT DEFAULT 'Full-Stack Engineer'
);

INSERT INTO developers (name, domain) 
VALUES ('Suhail Akhtar', 'https://suhail.top');

SELECT * FROM developers;`,
  markdown: `# OmniView File Studio
> Universal 100% Offline File Reader & Developer Workspace

### Key Highlights
- **Privacy First**: Zero server uploads, completely local parsing.
- **In-Browser Code Runners**: Python 3.12 (Pyodide), TypeScript, SQLite.
- **Live Disk Sync**: Bidirectional sync using File System Access API.

*Visit [file.suhail.top](https://file.suhail.top)*`,
  python: `# In-Browser Python 3.12 Execution Script
import sys
import math

def calculate_stats(data):
    total = sum(data)
    mean = total / len(data)
    variance = sum((x - mean) ** 2 for x in data) / len(data)
    return mean, math.sqrt(variance)

values = [12, 45, 67, 89, 34, 56, 78, 90, 23]
avg, std_dev = calculate_stats(values)

print(f"Data samples count: {len(values)}")
print(f"Average: {avg:.2f}")
print(f"Std Dev: {std_dev:.2f}")
`,
  csv: `id,first_name,last_name,email,city,status
1,Suhail,Akhtar,contact@suhail.top,Dubai,Active
2,Elena,Rostova,elena@example.com,Berlin,Active
3,Marcus,Vance,marcus@example.com,San Francisco,Pending
4,Aoi,Takahashi,aoi@example.com,Tokyo,Active`
};

export const PasteFileModal: React.FC<PasteFileModalProps> = ({
  isOpen,
  onClose,
  onFileCreated,
  initialText = '',
  onShowToast
}) => {
  const [content, setContent] = useState<string>(initialText);
  const [filename, setFilename] = useState<string>('pasted-snippet.txt');
  const [selectedExt, setSelectedExt] = useState<string>('txt');
  const [pastedImageBlob, setPastedImageBlob] = useState<{ blob: Blob; url: string; ext: string } | null>(null);
  const [decodeBase64Image, setDecodeBase64Image] = useState<boolean>(false);
  const [isReadingClipboard, setIsReadingClipboard] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialText when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialText) {
        setContent(initialText);
        detectAndApplyFormat(initialText);
      } else {
        setContent('');
        setFilename('pasted-file.txt');
        setSelectedExt('txt');
        setPastedImageBlob(null);
      }
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialText]);

  // Handle keyboard shortcuts (Escape to close, Ctrl/Cmd+Enter to create)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCreateFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, content, filename, selectedExt, pastedImageBlob, decodeBase64Image]);

  // Intelligent format detection from text content
  const detectedFormat = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return null;

    // Check for Base64 Data URL
    if (trimmed.startsWith('data:image/') && trimmed.includes(';base64,')) {
      const mime = trimmed.split(';')[0].replace('data:', '');
      const ext = mime.split('/')[1]?.toLowerCase() || 'png';
      return { ext, name: 'Base64 Image', category: 'image' as FileCategory, isBase64: true };
    }

    // JSON detection
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return { ext: 'json', name: 'JSON Document', category: 'json' as FileCategory };
      } catch (_) {
        // May be malformed JSON or other C-like object
      }
    }

    // HTML detection
    if (/<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed) || /<\/div>|<\/p>|<\/body>/i.test(trimmed)) {
      return { ext: 'html', name: 'HTML Document', category: 'html' as FileCategory };
    }

    // SVG detection
    if (/<svg[\s>]/i.test(trimmed) && /<\/svg>/i.test(trimmed)) {
      return { ext: 'svg', name: 'SVG Vector Graphic', category: 'image' as FileCategory };
    }

    // XML detection
    if (trimmed.startsWith('<?xml') || /<[a-z0-9_\-]+(\s+[^>]+)?>.*<\/[a-z0-9_\-]+>/is.test(trimmed)) {
      return { ext: 'xml', name: 'XML Document', category: 'code' as FileCategory };
    }

    // Markdown detection
    if (
      trimmed.startsWith('# ') ||
      trimmed.startsWith('## ') ||
      trimmed.startsWith('---') ||
      trimmed.includes('\n# ') ||
      trimmed.includes('\n## ') ||
      trimmed.includes('```')
    ) {
      return { ext: 'md', name: 'Markdown Document', category: 'markdown' as FileCategory };
    }

    // SQL detection
    if (/\b(SELECT|INSERT INTO|CREATE TABLE|UPDATE|DELETE FROM|ALTER TABLE|DROP TABLE)\b/i.test(trimmed)) {
      return { ext: 'sql', name: 'SQL Query / Schema', category: 'database' as FileCategory };
    }

    // Python detection
    if (
      /\b(def\s+[a-zA-Z_]\w*\s*\(|import\s+[a-zA-Z_]|from\s+[a-zA-Z_].*import|print\(|class\s+[a-zA-Z_]\w*[:\(])/m.test(trimmed) &&
      !trimmed.includes('{') &&
      !trimmed.includes(';')
    ) {
      return { ext: 'py', name: 'Python Script', category: 'code' as FileCategory };
    }

    // TypeScript / JavaScript detection
    if (
      /\b(import\s+.*\s+from|export\s+(const|function|class|default)|interface\s+[A-Z]|type\s+[A-Z]\w*\s*=|console\.log\()/m.test(trimmed)
    ) {
      return { ext: 'ts', name: 'TypeScript / JavaScript', category: 'code' as FileCategory };
    }

    // CSV detection
    const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2) {
      const commasInFirst = (lines[0].match(/,/g) || []).length;
      const commasInSecond = (lines[1].match(/,/g) || []).length;
      if (commasInFirst >= 2 && commasInFirst === commasInSecond) {
        return { ext: 'csv', name: 'CSV Spreadsheet', category: 'excel' as FileCategory };
      }
    }

    // YAML detection
    if (/^[a-zA-Z0-9_\-]+:\s*.+$/m.test(trimmed) && !trimmed.includes('{') && !trimmed.includes(';')) {
      return { ext: 'yaml', name: 'YAML Document', category: 'code' as FileCategory };
    }

    return { ext: 'txt', name: 'Plain Text', category: 'text' as FileCategory };
  }, [content]);

  // Auto-detect and suggest file extension & name
  const detectAndApplyFormat = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('data:image/') && trimmed.includes(';base64,')) {
      const mime = trimmed.split(';')[0].replace('data:', '');
      const ext = mime.split('/')[1]?.toLowerCase() || 'png';
      setSelectedExt(ext);
      setFilename(`pasted-image-${Date.now().toString().slice(-4)}.${ext}`);
      setDecodeBase64Image(true);
      return;
    }

    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        setSelectedExt('json');
        setFilename(`pasted-data-${Date.now().toString().slice(-4)}.json`);
        return;
      } catch (_) {}
    }

    if (/<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
      setSelectedExt('html');
      setFilename(`pasted-page-${Date.now().toString().slice(-4)}.html`);
      return;
    }

    if (/<svg[\s>]/i.test(trimmed) && /<\/svg>/i.test(trimmed)) {
      setSelectedExt('svg');
      setFilename(`pasted-vector-${Date.now().toString().slice(-4)}.svg`);
      return;
    }

    if (
      trimmed.startsWith('# ') ||
      trimmed.startsWith('## ') ||
      trimmed.startsWith('---') ||
      trimmed.includes('\n# ')
    ) {
      setSelectedExt('md');
      setFilename(`pasted-note-${Date.now().toString().slice(-4)}.md`);
      return;
    }

    if (/\b(SELECT|INSERT INTO|CREATE TABLE)\b/i.test(trimmed)) {
      setSelectedExt('sql');
      setFilename(`query-${Date.now().toString().slice(-4)}.sql`);
      return;
    }

    if (/\b(def\s+|import\s+[a-zA-Z_]|print\()/m.test(trimmed) && !trimmed.includes('{')) {
      setSelectedExt('py');
      setFilename(`script-${Date.now().toString().slice(-4)}.py`);
      return;
    }

    if (/\b(import\s+.*from|export\s+|interface\s+[A-Z]|console\.log)/m.test(trimmed)) {
      setSelectedExt('ts');
      setFilename(`snippet-${Date.now().toString().slice(-4)}.ts`);
      return;
    }

    const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2 && (lines[0].match(/,/g) || []).length >= 2) {
      setSelectedExt('csv');
      setFilename(`dataset-${Date.now().toString().slice(-4)}.csv`);
      return;
    }
  };

  // Change preset manually
  const handleSelectPreset = (preset: FormatPreset) => {
    setSelectedExt(preset.ext);
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    setFilename(`${baseName}.${preset.ext}`);
  };

  // Read from system clipboard
  const handlePasteFromClipboard = async () => {
    try {
      setIsReadingClipboard(true);

      // Check for image or rich data in clipboard first
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                const url = URL.createObjectURL(blob);
                const ext = type.replace('image/', '') || 'png';
                setPastedImageBlob({ blob, url, ext });
                setSelectedExt(ext);
                setFilename(`pasted-screenshot-${Date.now().toString().slice(-4)}.${ext}`);
                onShowToast?.('success', 'Image Pasted', `Loaded clipboard image (${type}, ${formatFileSize(blob.size)})`);
                setIsReadingClipboard(false);
                return;
              }
            }
          }
        } catch (_) {
          // Fall back to readText
        }
      }

      // Read text
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setContent(text);
          setPastedImageBlob(null);
          detectAndApplyFormat(text);
          onShowToast?.('success', 'Clipboard Pasted', `Loaded ${text.length.toLocaleString()} characters from clipboard.`);
        } else {
          onShowToast?.('warning', 'Clipboard Empty', 'No text or image content found in system clipboard.');
        }
      } else {
        textareaRef.current?.focus();
        onShowToast?.('info', 'Press Ctrl+V', 'Please press Ctrl+V / Cmd+V in the text box below to paste.');
      }
    } catch (err: any) {
      textareaRef.current?.focus();
      onShowToast?.('info', 'Paste Manually', 'Clipboard access denied or unavailable. Press Ctrl+V / Cmd+V to paste into the editor.');
    } finally {
      setIsReadingClipboard(false);
    }
  };

  // Handle native paste inside modal
  const handleModalPaste = (e: React.ClipboardEvent) => {
    // Check if pasted files/images are attached
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const url = URL.createObjectURL(file);
        const ext = file.name.split('.').pop() || file.type.replace('image/', '') || 'png';
        setPastedImageBlob({ blob: file, url, ext });
        setSelectedExt(ext);
        setFilename(file.name || `pasted-image-${Date.now().toString().slice(-4)}.${ext}`);
        onShowToast?.('success', 'Image Pasted', `Loaded image file (${formatFileSize(file.size)})`);
        return;
      }
    }

    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      detectAndApplyFormat(pastedText);
    }
  };

  // Load a pre-configured sample
  const handleLoadSample = (key: keyof typeof SAMPLE_SNIPPETS, ext: string) => {
    const text = SAMPLE_SNIPPETS[key];
    setContent(text);
    setPastedImageBlob(null);
    setSelectedExt(ext);
    setFilename(`sample-${key}.${ext}`);
  };

  // Final Action: Create TabFile and open in workspace
  const handleCreateFile = async () => {
    // Case 1: Pasted Image Blob
    if (pastedImageBlob) {
      const tabId = `pasted-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const file = new File([pastedImageBlob.blob], filename, { type: pastedImageBlob.blob.type });
      let arrayBuffer: ArrayBuffer | undefined;
      try {
        arrayBuffer = await pastedImageBlob.blob.arrayBuffer();
      } catch (_) {}

      const newTab: TabFile = {
        id: tabId,
        name: filename,
        size: pastedImageBlob.blob.size,
        type: pastedImageBlob.blob.type || 'image/png',
        lastModified: Date.now(),
        extension: pastedImageBlob.ext,
        category: 'image',
        fileRaw: file,
        arrayBuffer,
        objectUrl: pastedImageBlob.url,
        liveSyncActive: false,
        syncStatus: 'synced',
        viewMode: 'preview',
        zoomLevel: 100
      };

      onFileCreated(newTab);
      onShowToast?.('success', 'Image File Opened', `Created and opened "${filename}" (${formatFileSize(newTab.size)}).`);
      onClose();
      return;
    }

    // Case 2: Base64 Image Decoded
    if (decodeBase64Image && content.trim().startsWith('data:image/')) {
      try {
        const parts = content.trim().split(';base64,');
        const mime = parts[0].replace('data:', '');
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mime });
        const objectUrl = URL.createObjectURL(blob);
        const ext = selectedExt || mime.split('/')[1] || 'png';
        const finalName = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
        const file = new File([blob], finalName, { type: mime });

        const tabId = `pasted-b64-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newTab: TabFile = {
          id: tabId,
          name: finalName,
          size: blob.size,
          type: mime,
          lastModified: Date.now(),
          extension: ext,
          category: 'image',
          fileRaw: file,
          arrayBuffer: ab,
          objectUrl,
          liveSyncActive: false,
          syncStatus: 'synced',
          viewMode: 'preview',
          zoomLevel: 100
        };

        onFileCreated(newTab);
        onShowToast?.('success', 'Base64 Image Decoded', `Decoded & created image file "${finalName}".`);
        onClose();
        return;
      } catch (err: any) {
        onShowToast?.('error', 'Base64 Decode Error', 'Failed to decode Base64 image. Will open as raw text.');
      }
    }

    // Case 3: Text Content
    const textToSave = content;
    if (!textToSave.trim() && !pastedImageBlob) {
      onShowToast?.('warning', 'Content Empty', 'Please paste or enter some text before creating the file.');
      return;
    }

    const encoder = new TextEncoder();
    const bytes = encoder.encode(textToSave);
    const arrayBuffer = bytes.buffer;
    const ext = selectedExt || filename.split('.').pop() || 'txt';
    const finalFilename = filename.includes('.') ? filename : `${filename}.${ext}`;
    const category = detectFileCategory(finalFilename, '');

    const tabId = `pasted-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const file = new File([bytes], finalFilename, { type: 'text/plain' });

    const newTab: TabFile = {
      id: tabId,
      name: finalFilename,
      size: bytes.byteLength,
      type: 'text/plain',
      lastModified: Date.now(),
      extension: ext,
      category,
      fileRaw: file,
      arrayBuffer,
      textContent: textToSave,
      liveSyncActive: false,
      syncStatus: 'synced',
      viewMode: 'preview',
      zoomLevel: 100
    };

    onFileCreated(newTab);
    onShowToast?.('success', 'File Created', `Opened "${finalFilename}" (${formatFileSize(newTab.size)}).`);
    onClose();
  };

  if (!isOpen) return null;

  const charCount = content.length;
  const lineCount = content ? content.split('\n').length : 0;
  const approxBytes = new Blob([content]).size;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto select-none"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onPaste={handleModalPaste}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60 shadow-xs">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Open File from Clipboard / Text
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                  Ctrl+V
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste JSON, Code, SQL, Markdown, CSV, or Images directly into the workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePasteFromClipboard}
              disabled={isReadingClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Read directly from device clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{isReadingClipboard ? 'Reading...' : 'Paste from Clipboard'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Filename & Format Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>File Name</span>
                {detectedFormat && !pastedImageBlob && (
                  <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-detected: <strong>{detectedFormat.name}</strong></span>
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  placeholder="e.g. data.json, query.sql, script.py"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Format / Extension
              </label>
              <select
                value={selectedExt}
                onChange={e => {
                  const ext = e.target.value;
                  setSelectedExt(ext);
                  const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
                  setFilename(`${baseName}.${ext}`);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
              >
                {FORMAT_PRESETS.map(p => (
                  <option key={p.ext} value={p.ext}>
                    {p.name} (.{p.ext})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Format Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mr-1">
              Presets:
            </span>
            {FORMAT_PRESETS.slice(0, 8).map(preset => (
              <button
                key={preset.ext}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2 py-0.8 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                  selectedExt === preset.ext
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                .{preset.ext}
              </button>
            ))}
          </div>

          {/* Pasted Image Preview Banner (if image was pasted) */}
          {pastedImageBlob && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={pastedImageBlob.url}
                  alt="Pasted clipboard thumbnail"
                  className="w-12 h-12 rounded-lg object-cover border border-blue-500/30 bg-slate-900"
                />
                <div>
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Clipboard Image Detected
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Format: {pastedImageBlob.ext.toUpperCase()} • Size: {formatFileSize(pastedImageBlob.blob.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  URL.revokeObjectURL(pastedImageBlob.url);
                  setPastedImageBlob(null);
                  setSelectedExt('txt');
                  setFilename('pasted-snippet.txt');
                }}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-2 py-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Clear Image
              </button>
            </div>
          )}

          {/* Base64 Image Notification */}
          {detectedFormat?.isBase64 && !pastedImageBlob && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
                <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Base64 Image URL detected. Decode directly to an image viewer tab?</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-amber-800 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={decodeBase64Image}
                  onChange={e => setDecodeBase64Image(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span>Decode to Image</span>
              </label>
            </div>
          )}

          {/* Textarea Editor */}
          {!pastedImageBlob && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pasted Content
                </label>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{lineCount} lines</span>
                  <span>•</span>
                  <span>{charCount.toLocaleString()} chars</span>
                  <span>•</span>
                  <span>{formatFileSize(approxBytes)}</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => {
                    setContent(e.target.value);
                    detectAndApplyFormat(e.target.value);
                  }}
                  placeholder="Paste your code, JSON, SQL, text, markdown, CSV, or HTML here... (Ctrl+V / Cmd+V)"
                  rows={12}
                  className="w-full p-3 font-mono text-xs leading-relaxed rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 resize-y"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* Quick Demo Templates */}
          {!pastedImageBlob && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Load Template:
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadSample('json', 'json')}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-mono transition-colors cursor-pointer"
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('sql', 'sql')}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 font-mono transition-colors cursor-pointer"
                >
                  SQL
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('markdown', 'md')}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-mono transition-colors cursor-pointer"
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('python', 'py')}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-mono transition-colors cursor-pointer"
                >
                  Python
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('csv', 'csv')}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 font-mono transition-colors cursor-pointer"
                >
                  CSV
                </button>
              </div>

              {content && (
                <button
                  type="button"
                  onClick={() => {
                    setContent('');
                    setPastedImageBlob(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Clear content
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Opens directly in OmniView studio workspace with zero server uploads</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateFile}
              disabled={!content.trim() && !pastedImageBlob}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Open in Studio (Ctrl+Enter)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
