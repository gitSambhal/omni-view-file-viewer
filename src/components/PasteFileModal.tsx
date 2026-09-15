/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Open File From Copy-Pasting Dialog (shadcn/ui + Radix UI)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ClipboardPaste,
  FileCode,
  FileText,
  Table,
  Image as ImageIcon,
  Check,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCreateFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, content, filename, selectedExt, pastedImageBlob, decodeBase64Image]);

  const detectedFormat = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('data:image/') && trimmed.includes(';base64,')) {
      const match = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
      const ext = match ? match[1] : 'png';
      return { name: `Base64 ${ext.toUpperCase()} Image`, ext, category: 'image' as FileCategory, isBase64: true };
    }

    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return { name: 'JSON Document', ext: 'json', category: 'json' as FileCategory };
      } catch (_) {}
    }

    if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
      if (trimmed.includes('<svg')) {
        return { name: 'SVG Vector Graphic', ext: 'svg', category: 'image' as FileCategory };
      }
      if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE html')) {
        return { name: 'HTML Web Page', ext: 'html', category: 'html' as FileCategory };
      }
      return { name: 'XML Document', ext: 'xml', category: 'code' as FileCategory };
    }

    if (/^#{1,6}\s+|^\*\s+|^\-\s+|\[.*\]\(.*\)/m.test(trimmed)) {
      return { name: 'Markdown Document', ext: 'md', category: 'markdown' as FileCategory };
    }

    if (/\b(SELECT|INSERT INTO|CREATE TABLE|UPDATE|DELETE FROM|ALTER TABLE)\b/i.test(trimmed)) {
      return { name: 'SQL Query Script', ext: 'sql', category: 'database' as FileCategory };
    }

    if (/\b(def\s+[a-zA-Z_]|import\s+[a-zA-Z_]|from\s+[a-zA-Z_]+\s+import|print\()/m.test(trimmed) && !trimmed.includes('{')) {
      return { name: 'Python Script', ext: 'py', category: 'code' as FileCategory };
    }

    if (/\b(import\s+.*from|export\s+(default|const|function|class)|interface\s+[A-Z]|const\s+[a-zA-Z_]+\s*:\s*[A-Z]|console\.log)/m.test(trimmed)) {
      return { name: 'TypeScript / JavaScript', ext: 'ts', category: 'code' as FileCategory };
    }

    const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2 && (lines[0].match(/,/g) || []).length >= 2) {
      return { name: 'CSV Data Sheet', ext: 'csv', category: 'excel' as FileCategory };
    }

    return null;
  }, [content]);

  const detectAndApplyFormat = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('data:image/') && trimmed.includes(';base64,')) {
      setDecodeBase64Image(true);
      const match = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
      const ext = match ? match[1] : 'png';
      setSelectedExt(ext);
      setFilename(`decoded-image-${Date.now().toString().slice(-4)}.${ext}`);
      return;
    }

    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        setSelectedExt('json');
        setFilename(`data-${Date.now().toString().slice(-4)}.json`);
        return;
      } catch (_) {}
    }

    if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
      if (trimmed.includes('<svg')) {
        setSelectedExt('svg');
        setFilename(`vector-${Date.now().toString().slice(-4)}.svg`);
        return;
      }
      if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE html')) {
        setSelectedExt('html');
        setFilename(`page-${Date.now().toString().slice(-4)}.html`);
        return;
      }
      setSelectedExt('xml');
      setFilename(`document-${Date.now().toString().slice(-4)}.xml`);
      return;
    }

    if (/^#{1,6}\s+|^\*\s+|^\-\s+|\[.*\]\(.*\)/m.test(trimmed)) {
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

  const handleSelectPreset = (preset: FormatPreset) => {
    setSelectedExt(preset.ext);
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    setFilename(`${baseName}.${preset.ext}`);
  };

  const handlePasteFromClipboard = async () => {
    try {
      setIsReadingClipboard(true);
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
        } catch (_) {}
      }

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

  const handleModalPaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const url = URL.createObjectURL(file);
        const ext = file.name.split('.').pop() || file.type.replace('image/', '') || 'png';
        setPastedImageBlob({ blob: file, url, ext });
        setSelectedExt(ext);
        setFilename(`pasted-screenshot-${Date.now().toString().slice(-4)}.${ext}`);
        onShowToast?.('success', 'Image Pasted', `Loaded clipboard image (${formatFileSize(file.size)})`);
      }
    }
  };

  const handleLoadSample = (key: keyof typeof SAMPLE_SNIPPETS, ext: string) => {
    const snippet = SAMPLE_SNIPPETS[key];
    if (snippet) {
      setContent(snippet);
      setSelectedExt(ext);
      setFilename(`sample-${key}-${Date.now().toString().slice(-4)}.${ext}`);
      setPastedImageBlob(null);
    }
  };

  const handleCreateFile = async () => {
    if (pastedImageBlob) {
      const tabId = `pasted-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const file = new File([pastedImageBlob.blob], filename, { type: pastedImageBlob.blob.type });
      const arrayBuffer = await pastedImageBlob.blob.arrayBuffer();

      const newTab: TabFile = {
        id: tabId,
        name: filename,
        size: pastedImageBlob.blob.size,
        type: pastedImageBlob.blob.type,
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
      onShowToast?.('success', 'Image Tab Created', `Opened image "${filename}" (${formatFileSize(pastedImageBlob.blob.size)}).`);
      onClose();
      return;
    }

    if (decodeBase64Image && content.startsWith('data:image/')) {
      try {
        const res = await fetch(content);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const tabId = `base64-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const objectUrl = URL.createObjectURL(blob);
        const file = new File([blob], filename, { type: blob.type });

        const newTab: TabFile = {
          id: tabId,
          name: filename,
          size: blob.size,
          type: blob.type,
          lastModified: Date.now(),
          extension: selectedExt || 'png',
          category: 'image',
          fileRaw: file,
          arrayBuffer,
          objectUrl,
          liveSyncActive: false,
          syncStatus: 'synced',
          viewMode: 'preview',
          zoomLevel: 100
        };

        onFileCreated(newTab);
        onShowToast?.('success', 'Image Decoded', `Decoded Base64 string to image tab (${formatFileSize(blob.size)}).`);
        onClose();
        return;
      } catch (err: any) {
        onShowToast?.('error', 'Base64 Error', 'Failed to decode Base64 image. Will open as plain text file.');
      }
    }

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

  const charCount = content.length;
  const lineCount = content ? content.split('\n').length : 0;
  const approxBytes = new Blob([content]).size;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden" onPaste={handleModalPaste}>
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <ClipboardPaste className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold">Open File from Clipboard / Text</DialogTitle>
                  <Badge variant="secondary" className="font-mono text-[10px]">Ctrl+V</Badge>
                </div>
                <DialogDescription className="text-xs mt-0.5">
                  Paste JSON, Code, SQL, Markdown, CSV, or Images directly into the workspace
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handlePasteFromClipboard}
              disabled={isReadingClipboard}
              className="gap-1.5 h-8 text-xs shrink-0"
              title="Read directly from system clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{isReadingClipboard ? 'Reading...' : 'Paste Clipboard'}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Body Content */}
        <ScrollArea className="max-h-[65vh] p-4 sm:p-5 space-y-4 text-xs">
          {/* Filename & Format Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>File Name</span>
                {detectedFormat && !pastedImageBlob && (
                  <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-detected: <strong>{detectedFormat.name}</strong></span>
                  </span>
                )}
              </label>
              <Input
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="e.g. data.json, query.sql, script.py"
                className="font-mono text-xs bg-background h-8"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
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
                className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-ring text-foreground font-medium cursor-pointer h-8"
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
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">
              Presets:
            </span>
            {FORMAT_PRESETS.slice(0, 8).map(preset => (
              <button
                key={preset.ext}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                  selectedExt === preset.ext
                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                    : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                .{preset.ext}
              </button>
            ))}
          </div>

          {/* Pasted Image Preview Banner */}
          {pastedImageBlob && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={pastedImageBlob.url}
                  alt="Pasted clipboard thumbnail"
                  className="w-12 h-12 rounded-lg object-cover border border-primary/30 bg-background"
                />
                <div>
                  <h4 className="text-xs font-bold text-primary">
                    Clipboard Image Detected
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format: {pastedImageBlob.ext.toUpperCase()} • Size: {formatFileSize(pastedImageBlob.blob.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  URL.revokeObjectURL(pastedImageBlob.url);
                  setPastedImageBlob(null);
                  setSelectedExt('txt');
                  setFilename('pasted-snippet.txt');
                }}
                className="text-xs text-destructive hover:bg-destructive/10 h-7"
              >
                Clear Image
              </Button>
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
                <label className="text-xs font-semibold text-foreground">
                  Pasted Content
                </label>
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span>{lineCount} lines</span>
                  <span>•</span>
                  <span>{charCount.toLocaleString()} chars</span>
                  <span>•</span>
                  <span>{formatFileSize(approxBytes)}</span>
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  detectAndApplyFormat(e.target.value);
                }}
                placeholder="Paste your code, JSON, SQL, text, markdown, CSV, or HTML here... (Ctrl+V / Cmd+V)"
                rows={10}
                className="font-mono text-xs leading-relaxed bg-background resize-y"
                spellCheck={false}
              />
            </div>
          )}

          {/* Quick Demo Templates */}
          {!pastedImageBlob && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Load Template:
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadSample('json', 'json')}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-primary font-mono transition-colors cursor-pointer"
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('sql', 'sql')}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-purple-500 font-mono transition-colors cursor-pointer"
                >
                  SQL
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('markdown', 'md')}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-emerald-500 font-mono transition-colors cursor-pointer"
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('python', 'py')}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-amber-500 font-mono transition-colors cursor-pointer"
                >
                  Python
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('csv', 'csv')}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-cyan-500 font-mono transition-colors cursor-pointer"
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
                  className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Clear content
                </button>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Opens directly in OmniView studio with zero server uploads</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              Cancel
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleCreateFile}
              disabled={!content.trim() && !pastedImageBlob}
              className="gap-1.5 text-xs h-8"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Open in Studio (Ctrl+Enter)</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
