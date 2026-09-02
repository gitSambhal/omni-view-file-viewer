/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import {
  Code,
  Copy,
  Check,
  Search,
  WrapText,
  ZoomIn,
  ZoomOut,
  Globe,
  Database,
  Play,
  Terminal,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
  Save,
  RefreshCw,
  Sliders,
  Settings2,
  FileCode,
  ArrowDown,
  ArrowUp,
  X,
  Replace,
  Type,
  AlignLeft,
  Eye,
  Edit3,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { getFileExtension } from '../../services/fileDetector';
import { formatCode } from '../../services/codeFormatter';

export interface CodeViewerProps {
  textContent?: string;
  filename: string;
  fileHandle?: FileSystemFileHandle;
  liveSyncActive?: boolean;
  syncStatus?: 'synced' | 'syncing' | 'modified_external' | 'paused' | 'error';
  lastSyncedAt?: number;
  hasUnsavedChanges?: boolean;
  onContentChange?: (newContent: string) => void;
  onSaveToDisk?: (contentToSave?: string) => Promise<boolean>;
  onReloadFromDisk?: () => Promise<void>;
  onToggleLiveSync?: () => void;
  onSwitchToLivePreview?: () => void;
  onSwitchToDatabase?: () => void;
}

interface ConsoleLogItem {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'return';
  content: string;
  time: string;
}

type LineHeightOption = 'compact' | 'normal' | 'relaxed' | 'spacious';
export type FontFamilyOption =
  | 'jetbrains'
  | 'fira'
  | 'sourcecode'
  | 'robotomono'
  | 'ibmplex'
  | 'inconsolata'
  | 'spacemono'
  | 'cascadia'
  | 'consolas'
  | 'system';

const EXT_LANG_MAP: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  mjs: 'javascript', cjs: 'javascript',
  html: 'html', htm: 'html', svg: 'xml', xml: 'xml', css: 'css', scss: 'scss',
  py: 'python', pyw: 'python', java: 'java',
  cpp: 'cpp', c: 'c', h: 'c', cs: 'csharp', php: 'php', rb: 'ruby', rs: 'rust',
  go: 'go', sql: 'sql', sh: 'bash', bash: 'bash', zsh: 'bash', env: 'bash',
  json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown',
  dockerfile: 'dockerfile', makefile: 'makefile', toml: 'ini', ini: 'ini'
};

const LINE_HEIGHT_VALUES: Record<LineHeightOption, number> = {
  compact: 1.35,
  normal: 1.6,
  relaxed: 1.85,
  spacious: 2.1
};

export const FONT_FAMILY_CLASSES: Record<FontFamilyOption, string> = {
  jetbrains: "'JetBrains Mono', monospace",
  fira: "'Fira Code', monospace",
  sourcecode: "'Source Code Pro', monospace",
  robotomono: "'Roboto Mono', monospace",
  ibmplex: "'IBM Plex Mono', monospace",
  inconsolata: "'Inconsolata', monospace",
  spacemono: "'Space Mono', monospace",
  cascadia: "'Cascadia Code', 'Cascadia Mono', 'Consolas', monospace",
  consolas: "'Consolas', 'Monaco', 'Courier New', monospace",
  system: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace"
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
  textContent = '',
  filename,
  fileHandle,
  liveSyncActive = false,
  syncStatus = 'synced',
  lastSyncedAt,
  hasUnsavedChanges = false,
  onContentChange,
  onSaveToDisk,
  onReloadFromDisk,
  onToggleLiveSync,
  onSwitchToLivePreview,
  onSwitchToDatabase
}) => {
  const ext = getFileExtension(filename);
  const defaultLang = EXT_LANG_MAP[ext] || 'plaintext';

  // State: Code Content & History
  const [code, setCode] = useState<string>(textContent);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [formatMessage, setFormatMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Sync internal state when external textContent updates (e.g. from disk live sync)
  useEffect(() => {
    setCode(textContent);
  }, [textContent]);

  // Code Editor Preferences (stored locally)
  const [language, setLanguage] = useState<string>(defaultLang);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('omni_editor_fontsize');
    return saved ? parseInt(saved, 10) : 13;
  });
  const [lineHeight, setLineHeight] = useState<LineHeightOption>(() => {
    return (localStorage.getItem('omni_editor_lineheight') as LineHeightOption) || 'normal';
  });
  const [fontFamily, setFontFamily] = useState<FontFamilyOption>(() => {
    return (localStorage.getItem('omni_editor_font') as FontFamilyOption) || 'jetbrains';
  });
  const [tabWidth, setTabWidth] = useState<number>(2);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [fontLigatures, setFontLigatures] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Search and Replace State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [replaceTerm, setReplaceTerm] = useState<string>('');
  const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  // Cursor & Selection stats
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number; selectionLength: number }>({
    line: 1,
    col: 1,
    selectionLength: 0
  });

  // Code Execution Runner State
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogItem[]>([]);

  const [copied, setCopied] = useState<boolean>(false);

  // DOM Refs for synchronized scrolling
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightLayerRef = useRef<HTMLDivElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const formatMsgTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Capabilities
  const isHtmlCapable = ['html', 'htm', 'xhtml', 'svg', 'xml'].includes(ext) ||
                        Boolean(code && (code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<svg')));
  const isSqlCapable = ext === 'sql' || defaultLang === 'sql' || Boolean(code && code.includes('CREATE TABLE'));
  const isRunnable = ['js', 'jsx', 'ts', 'tsx', 'mjs', 'py', 'sh', 'bash', 'json', 'sql'].includes(ext) ||
                     ['javascript', 'typescript', 'python', 'bash', 'sql', 'json'].includes(language);

  // Split lines
  const lines = useMemo(() => code.split('\n'), [code]);
  const totalLines = lines.length;

  // Search Matches calculation
  const searchMatches = useMemo(() => {
    if (!searchTerm) return [];
    const matches: { index: number; line: number; col: number; length: number }[] = [];
    const term = isCaseSensitive ? searchTerm : searchTerm.toLowerCase();
    const source = isCaseSensitive ? code : code.toLowerCase();

    let pos = 0;
    while ((pos = source.indexOf(term, pos)) !== -1) {
      // Calculate line and col
      const prevText = code.substring(0, pos);
      const lineNum = prevText.split('\n').length;
      const lastNewLine = prevText.lastIndexOf('\n');
      const colNum = lastNewLine === -1 ? pos + 1 : pos - lastNewLine;

      matches.push({
        index: pos,
        line: lineNum,
        col: colNum,
        length: term.length
      });
      pos += term.length || 1;
    }
    return matches;
  }, [code, searchTerm, isCaseSensitive]);

  // Syntax highlighting
  const highlightedCode = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch (e) {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [code, language]);

  // Synchronized scroll handler
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = target.scrollTop;
      highlightLayerRef.current.scrollLeft = target.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = target.scrollTop;
    }
  };

  // Cursor position tracking
  const updateCursorStats = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const textBefore = el.value.substring(0, pos);
    const line = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const col = lastNewline === -1 ? pos + 1 : pos - lastNewline;
    setCursorPos({
      line,
      col,
      selectionLength: Math.abs(end - pos)
    });
  }, []);

  // Update code content handler
  const handleCodeChange = (newText: string) => {
    setCode(newText);
    if (onContentChange) {
      onContentChange(newText);
    }
    updateCursorStats();
  };

  // Keyboard Shortcuts (Tab indentation, auto-close, save, format, run)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart, selectionEnd, value } = el;

    // 1. Format Code Shortcut: Shift+Alt+F or Ctrl+Shift+I or Cmd+Shift+I
    if ((e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
      e.preventDefault();
      handleFormatCode();
      return;
    }

    // 2. Save to Disk Shortcut: Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSaveCode();
      return;
    }

    // 3. Search Shortcut: Ctrl+F / Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }

    // 4. Run Code Shortcut: Ctrl+Enter / Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
      return;
    }

    // 5. Tab key handling (Insert spaces or indent selection)
    if (e.key === 'Tab') {
      e.preventDefault();
      const indentStr = ' '.repeat(tabWidth);

      if (selectionStart === selectionEnd) {
        // Single cursor insert indent
        if (!e.shiftKey) {
          const nextVal = value.substring(0, selectionStart) + indentStr + value.substring(selectionEnd);
          handleCodeChange(nextVal);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = selectionStart + tabWidth;
            updateCursorStats();
          });
        }
      } else {
        // Multi-line block indent/outdent
        const startLineIdx = value.substring(0, selectionStart).lastIndexOf('\n') + 1;
        const endLineIdx = value.indexOf('\n', selectionEnd);
        const actualEndIdx = endLineIdx === -1 ? value.length : endLineIdx;
        const block = value.substring(startLineIdx, actualEndIdx);
        const blockLines = block.split('\n');

        let modifiedBlock = '';
        let diffStart = 0;
        let diffTotal = 0;

        if (!e.shiftKey) {
          // Indent all lines
          modifiedBlock = blockLines.map((line, i) => {
            if (i === 0) diffStart = tabWidth;
            diffTotal += tabWidth;
            return indentStr + line;
          }).join('\n');
        } else {
          // Outdent all lines
          modifiedBlock = blockLines.map((line, i) => {
            let removed = 0;
            if (line.startsWith(indentStr)) {
              removed = tabWidth;
            } else if (line.startsWith(' ')) {
              removed = line.match(/^ +/)![0].length;
              removed = Math.min(removed, tabWidth);
            }
            if (i === 0) diffStart = -removed;
            diffTotal -= removed;
            return line.substring(removed);
          }).join('\n');
        }

        const nextVal = value.substring(0, startLineIdx) + modifiedBlock + value.substring(actualEndIdx);
        handleCodeChange(nextVal);
        requestAnimationFrame(() => {
          el.selectionStart = Math.max(0, selectionStart + diffStart);
          el.selectionEnd = Math.max(0, selectionEnd + diffTotal);
          updateCursorStats();
        });
      }
      return;
    }

    // 6. Enter key auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const textBefore = value.substring(0, selectionStart);
      const currentLine = textBefore.substring(textBefore.lastIndexOf('\n') + 1);
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';

      // Increase indent after opening bracket or colon
      const trimmedLine = currentLine.trim();
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(') || trimmedLine.endsWith(':') || trimmedLine.endsWith('=>')) {
        indent += ' '.repeat(tabWidth);
      }

      const nextVal = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      handleCodeChange(nextVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 1 + indent.length;
        updateCursorStats();
      });
      return;
    }

    // 7. Auto-closing brackets and quotes
    const pairMap: Record<string, string> = {
      '(': ')',
      '{': '}',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    if (pairMap[e.key]) {
      const closing = pairMap[e.key];
      // If text selected, wrap it
      if (selectionStart !== selectionEnd) {
        e.preventDefault();
        const selected = value.substring(selectionStart, selectionEnd);
        const nextVal = value.substring(0, selectionStart) + e.key + selected + closing + value.substring(selectionEnd);
        handleCodeChange(nextVal);
        requestAnimationFrame(() => {
          el.selectionStart = selectionStart + 1;
          el.selectionEnd = selectionEnd + 1;
          updateCursorStats();
        });
        return;
      }
    }
  };

  // Format Code handler
  const handleFormatCode = async () => {
    setIsFormatting(true);
    setFormatMessage(null);

    try {
      const result = await formatCode(code, language, {
        tabWidth,
        useTabs: false,
        printWidth: 95
      });

      if (result.success && result.formatted !== code) {
        handleCodeChange(result.formatted);
        showFormatNotice(`✨ Code formatted cleanly (${language})`);
      } else if (result.success) {
        showFormatNotice('✓ Code is already cleanly formatted');
      } else {
        showFormatNotice(`Warning: ${result.error || 'Formatting adjusted'}`, true);
      }
    } catch (err: any) {
      showFormatNotice(`Format failed: ${err.message}`, true);
    } finally {
      setIsFormatting(false);
    }
  };

  const showFormatNotice = (text: string, isError = false) => {
    if (formatMsgTimeoutRef.current) clearTimeout(formatMsgTimeoutRef.current);
    setFormatMessage({ text, isError });
    formatMsgTimeoutRef.current = setTimeout(() => {
      setFormatMessage(null);
    }, 3500);
  };

  // Save Code to Disk / Trigger Live Sync Save
  const handleSaveCode = async () => {
    setIsSaving(true);
    try {
      if (onSaveToDisk) {
        await onSaveToDisk(code);
      } else {
        // Fallback file download if no disk handler
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      showFormatNotice('💾 Saved successfully to disk.');
    } catch (err: any) {
      showFormatNotice(`Save error: ${err.message}`, true);
    } finally {
      setIsSaving(false);
    }
  };

  // Reload from Disk
  const handleReload = async () => {
    if (!onReloadFromDisk) return;
    setIsReloading(true);
    try {
      await onReloadFromDisk();
      showFormatNotice('🔄 Reloaded fresh from disk.');
    } catch (err: any) {
      showFormatNotice(`Reload error: ${err.message}`, true);
    } finally {
      setIsReloading(false);
    }
  };

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find & Replace Handlers
  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % searchMatches.length;
    setActiveMatchIndex(nextIdx);
    scrollToMatch(searchMatches[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setActiveMatchIndex(prevIdx);
    scrollToMatch(searchMatches[prevIdx]);
  };

  const scrollToMatch = (match: { index: number; length: number }) => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(match.index, match.index + match.length);
    updateCursorStats();
  };

  const handleReplaceOne = () => {
    if (searchMatches.length === 0) return;
    const match = searchMatches[activeMatchIndex] || searchMatches[0];
    const nextVal = code.substring(0, match.index) + replaceTerm + code.substring(match.index + match.length);
    handleCodeChange(nextVal);
  };

  const handleReplaceAll = () => {
    if (!searchTerm) return;
    const regex = new RegExp(
      searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      isCaseSensitive ? 'g' : 'gi'
    );
    const count = (code.match(regex) || []).length;
    const nextVal = code.replace(regex, replaceTerm);
    handleCodeChange(nextVal);
    showFormatNotice(`Replaced ${count} occurrence(s).`);
  };

  // Safe Code Execution Runner
  const handleRunCode = () => {
    if (isHtmlCapable && onSwitchToLivePreview) {
      onSwitchToLivePreview();
      return;
    }
    if (isSqlCapable && onSwitchToDatabase) {
      onSwitchToDatabase();
      return;
    }

    setIsConsoleOpen(true);
    setIsRunning(true);
    setConsoleLogs([]);
    setExecutionStatus('idle');

    const startTime = performance.now();
    const logs: ConsoleLogItem[] = [];

    const addLog = (type: ConsoleLogItem['type'], content: any) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      let str = '';
      if (typeof content === 'object') {
        try {
          str = JSON.stringify(content, null, 2);
        } catch (_) {
          str = String(content);
        }
      } else {
        str = String(content);
      }
      logs.push({
        id: Math.random().toString(36).substring(2, 9),
        type,
        content: str,
        time: timeStr
      });
    };

    setTimeout(() => {
      try {
        const langLower = language.toLowerCase();

        if (langLower.includes('javascript') || langLower.includes('typescript') || ['js', 'ts', 'jsx', 'tsx'].includes(ext)) {
          // Clean TypeScript type annotations
          const codeToRun = code
            .replace(/:\s*[A-Za-z0-9_<>\[\]|&\s]+(?=[=,\)\{;])/g, '')
            .replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, '')
            .replace(/type\s+[A-Za-z0-9_]+\s*=[^;]+;/g, '');

          // Sandbox custom console
          const sandboxedConsole = {
            log: (...args: any[]) => addLog('log', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            info: (...args: any[]) => addLog('info', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            warn: (...args: any[]) => addLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            error: (...args: any[]) => addLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            table: (data: any) => addLog('log', `[TABLE Output]\n${JSON.stringify(data, null, 2)}`)
          };

          const runner = new Function('console', 'require', 'window', 'document', `
            try {
              ${codeToRun}
            } catch (err) {
              console.error(err.stack || err.message || String(err));
              throw err;
            }
          `);

          const result = runner(sandboxedConsole, () => ({}), undefined, undefined);
          if (result !== undefined) {
            addLog('return', result);
          }
          if (logs.length === 0) {
            addLog('info', 'Code executed successfully with 0 console logs.');
          }
          setExecutionStatus('success');
        } else if (langLower.includes('python') || ext === 'py') {
          // Python execution emulator
          const pyLines = code.split('\n');
          let outputCount = 0;
          pyLines.forEach(line => {
            const printMatch = line.match(/^\s*print\s*\((.*)\)\s*$/);
            if (printMatch) {
              try {
                const rawArgs = printMatch[1];
                const evaluated = rawArgs.replace(/f"([^"]*)"/g, (_, inner) => inner).replace(/f'([^']*)'/g, (_, inner) => inner);
                addLog('log', evaluated.replace(/^['"]|['"]$/g, ''));
                outputCount++;
              } catch (_) {
                addLog('log', printMatch[1]);
                outputCount++;
              }
            }
          });
          if (outputCount === 0) {
            addLog('info', `Python script parsed (${pyLines.length} lines). Execution environment ready.`);
          }
          setExecutionStatus('success');
        } else if (langLower.includes('bash') || ['sh', 'bash', 'zsh'].includes(ext)) {
          // Shell script output
          const shLines = code.split('\n');
          shLines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('echo ')) {
              addLog('log', trimmed.substring(5).replace(/^['"]|['"]$/g, ''));
            } else if (trimmed && !trimmed.startsWith('#')) {
              addLog('info', `$ ${trimmed}`);
            }
          });
          setExecutionStatus('success');
        } else if (langLower.includes('json') || ext === 'json') {
          const parsed = JSON.parse(code);
          addLog('info', `Valid JSON Document (${Object.keys(parsed).length} top-level keys).`);
          addLog('return', parsed);
          setExecutionStatus('success');
        } else {
          addLog('info', `Preview ready for ${filename} (${language}).`);
          setExecutionStatus('success');
        }
      } catch (err: any) {
        addLog('error', err.message || String(err));
        setExecutionStatus('error');
      } finally {
        const endTime = performance.now();
        setExecutionTime(endTime - startTime);
        setConsoleLogs([...logs]);
        setIsRunning(false);
      }
    }, 40);
  };

  const currentLineHeight = LINE_HEIGHT_VALUES[lineHeight];
  const currentFontFamily = FONT_FAMILY_CLASSES[fontFamily];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-[#1e2227] text-slate-100 font-mono overflow-hidden transition-colors relative select-text">
      {/* 1. Editor Main Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#21252b] border-b border-slate-700/80 gap-2 z-20 shrink-0 select-none shadow-2xs">
        {/* Left: Language, Format, Run, Live View */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* File Badge */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">{filename}</span>
            <span className="text-[10px] text-cyan-300/75">({totalLines.toLocaleString()} lines)</span>
          </div>

          {/* Live Sync Status Pill */}
          <div className="flex items-center gap-1">
            {fileHandle ? (
              <button
                onClick={onToggleLiveSync}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                  liveSyncActive
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-2xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={liveSyncActive ? 'Live Sync Active: Watching disk changes in real-time. Click to toggle.' : 'Live Sync Paused. Click to resume.'}
              >
                <span className={`w-2 h-2 rounded-full ${liveSyncActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{liveSyncActive ? 'Live Sync' : 'Sync Paused'}</span>
              </button>
            ) : (
              <button
                onClick={handleSaveCode}
                className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                title="Connect this file to local disk for automatic real-time sync"
              >
                <HardDrive className="w-3 h-3 text-slate-400" />
                <span>Link Disk</span>
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveCode}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Save Changes to Disk (Ctrl+S / Cmd+S)"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save *' : 'Save'}</span>
            </button>

            {/* Reload from Disk */}
            {fileHandle && onReloadFromDisk && (
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs cursor-pointer"
                title="Force Reload from Disk"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Format Code Button */}
          <button
            onClick={handleFormatCode}
            disabled={isFormatting || isReadOnly}
            className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-40"
            title="Format Code with Prettier (Shift+Alt+F or Ctrl+Shift+I)"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-200 ${isFormatting ? 'animate-spin' : ''}`} />
            <span>{isFormatting ? 'Formatting...' : 'Format'}</span>
          </button>

          {/* Run Code Sandbox Button */}
          {isRunnable && (
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-40"
              title="Run Code in In-Browser Sandbox (Ctrl+Enter)"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>
          )}

          {/* Live Preview Switchers */}
          {isHtmlCapable && onSwitchToLivePreview && (
            <button
              onClick={onSwitchToLivePreview}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Open in Live HTML Sandbox Preview"
            >
              <Globe className="w-3.5 h-3.5 text-blue-200" />
              <span>Live Preview</span>
            </button>
          )}

          {isSqlCapable && onSwitchToDatabase && (
            <button
              onClick={onSwitchToDatabase}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Execute SQL queries in interactive Database Studio"
            >
              <Database className="w-3.5 h-3.5 text-teal-200" />
              <span>SQL Studio</span>
            </button>
          )}
        </div>

        {/* Right: Search, Language Picker, Settings & Copy */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Format Notification Toast Banner */}
          {formatMessage && (
            <div
              className={`animate-in fade-in slide-in-from-top-1 px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1 border ${
                formatMessage.isError
                  ? 'bg-red-950/80 text-red-300 border-red-800'
                  : 'bg-indigo-950/80 text-indigo-200 border-indigo-700'
              }`}
            >
              <span>{formatMessage.text}</span>
            </div>
          )}

          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isSearchOpen ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title="Find and Replace (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
            title="Syntax Language"
          >
            <option value="javascript">JavaScript (JS/JSX)</option>
            <option value="typescript">TypeScript (TS/TSX)</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="scss">SCSS</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash / Shell</option>
            <option value="markdown">Markdown</option>
            <option value="xml">XML / SVG</option>
            <option value="yaml">YAML</option>
            <option value="java">Java</option>
            <option value="cpp">C / C++</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="ini">INI / TOML</option>
            <option value="plaintext">Plain Text</option>
          </select>

          {/* Editor Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                isSettingsOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
              title="Editor & Typography Settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>

            {/* Settings Modal Popover */}
            {isSettingsOpen && (
              <div className="absolute right-0 top-9 w-72 bg-[#21252b] border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3.5 text-slate-200 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="font-semibold text-xs flex items-center gap-1.5 text-white">
                    <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                    Editor & Format Settings
                  </span>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Height Option */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Line Height / Spacing</span>
                    <span className="font-mono text-cyan-400">{currentLineHeight}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['compact', 'normal', 'relaxed', 'spacious'] as LineHeightOption[]).map(lh => (
                      <button
                        key={lh}
                        onClick={() => {
                          setLineHeight(lh);
                          localStorage.setItem('omni_editor_lineheight', lh);
                        }}
                        className={`py-1 rounded-md text-[10px] text-center border capitalize cursor-pointer transition-all ${
                          lineHeight === lh
                            ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                            : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Option */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Font Size</span>
                    <span className="font-mono text-cyan-400">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = Math.max(10, fontSize - 1);
                        setFontSize(next);
                        localStorage.setItem('omni_editor_fontsize', next.toString());
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        setFontSize(val);
                        localStorage.setItem('omni_editor_fontsize', val.toString());
                      }}
                      className="flex-1 accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        const next = Math.min(26, fontSize + 1);
                        setFontSize(next);
                        localStorage.setItem('omni_editor_fontsize', next.toString());
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Font Family Option */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <label>Monospace Font</label>
                    <span className="text-[10px] text-cyan-400 font-mono capitalize">{fontFamily}</span>
                  </div>
                  <select
                    value={fontFamily}
                    onChange={e => {
                      const f = e.target.value as FontFamilyOption;
                      setFontFamily(f);
                      localStorage.setItem('omni_editor_font', f);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-cyan-500"
                  >
                    <option value="jetbrains">JetBrains Mono (Default)</option>
                    <option value="fira">Fira Code (Ligatures)</option>
                    <option value="sourcecode">Source Code Pro</option>
                    <option value="robotomono">Roboto Mono</option>
                    <option value="ibmplex">IBM Plex Mono</option>
                    <option value="inconsolata">Inconsolata</option>
                    <option value="spacemono">Space Mono</option>
                    <option value="cascadia">Cascadia Code</option>
                    <option value="consolas">Consolas / Monaco</option>
                    <option value="system">System Monospace</option>
                  </select>

                  {/* Live Font Preview Box */}
                  <div
                    className="mt-1 px-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-cyan-300 overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{
                      fontFamily: currentFontFamily,
                      fontSize: `${Math.min(14, fontSize)}px`,
                      fontVariantLigatures: fontLigatures ? 'normal' : 'none'
                    }}
                  >
                    const render = () =&gt; &#123; return true; &#125;;
                  </div>
                </div>

                {/* Tab Width & Features */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Tab Indent</span>
                    <select
                      value={tabWidth}
                      onChange={e => setTabWidth(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg cursor-pointer"
                    >
                      <option value={2}>2 Spaces</option>
                      <option value={4}>4 Spaces</option>
                      <option value={8}>8 Spaces</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Ligatures</span>
                    <button
                      onClick={() => setFontLigatures(!fontLigatures)}
                      className={`w-full py-1 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                        fontLigatures
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {fontLigatures ? 'On' : 'Off'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Word Wrap</span>
                    <button
                      onClick={() => setWordWrap(!wordWrap)}
                      className={`w-full py-1 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                        wordWrap
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {wordWrap ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                {/* Read-Only mode toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <span className="text-[11px] text-slate-400">Read-Only View</span>
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    onChange={e => setIsReadOnly(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Copy all code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 2. Floating / Docked Find & Replace Bar */}
      {isSearchOpen && (
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#282c34] border-b border-slate-700 z-20 text-xs gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Find Input */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Find in file..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setActiveMatchIndex(0);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) handlePrevMatch();
                    else handleNextMatch();
                  }
                  if (e.key === 'Escape') setIsSearchOpen(false);
                }}
                className="bg-transparent text-slate-100 focus:outline-none w-36 md:w-52"
                autoFocus
              />
              <span className="text-[10px] text-slate-400 font-mono ml-1">
                {searchMatches.length > 0 ? `${activeMatchIndex + 1}/${searchMatches.length}` : '0 results'}
              </span>
            </div>

            {/* Replace Input */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Replace className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceTerm}
                onChange={e => setReplaceTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleReplaceOne();
                }}
                className="bg-transparent text-slate-100 focus:outline-none w-36 md:w-52"
              />
            </div>

            {/* Match Navigators */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMatch}
                disabled={searchMatches.length === 0}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 cursor-pointer disabled:opacity-30"
                title="Previous Match (Shift+Enter)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={searchMatches.length === 0}
                className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 cursor-pointer disabled:opacity-30"
                title="Next Match (Enter)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                  isCaseSensitive ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Match Case (Aa)"
              >
                Aa
              </button>
            </div>

            {/* Replace Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleReplaceOne}
                disabled={searchMatches.length === 0 || isReadOnly}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] cursor-pointer disabled:opacity-30"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={searchMatches.length === 0 || isReadOnly}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] cursor-pointer disabled:opacity-30"
              >
                Replace All
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Synchronized Code Editor Area */}
      <div className="flex-1 flex min-h-0 min-w-0 relative overflow-hidden bg-[#282c34]">
        {/* Line Numbers Gutter */}
        {showLineNumbers && (
          <div
            ref={gutterRef}
            className="select-none text-right pr-3 pl-2 py-3 text-slate-500 border-r border-slate-700/60 font-mono overflow-hidden shrink-0 bg-[#21252b] z-10"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: currentLineHeight,
              fontFamily: currentFontFamily,
              width: `${Math.max(48, (totalLines.toString().length + 2) * 10)}px`
            }}
          >
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const isCurrentLine = cursorPos.line === lineNum;
              const isMatchLine = searchMatches.some(m => m.line === lineNum);

              return (
                <div
                  key={idx}
                  className={`transition-colors ${
                    isCurrentLine ? 'text-cyan-400 font-bold' : isMatchLine ? 'text-amber-400 font-semibold' : ''
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
        )}

        {/* Code Canvas Stack */}
        <div className="flex-1 relative min-h-0 min-w-0 overflow-hidden">
          {/* Syntax Highlight Visual Layer (Background) */}
          <div
            ref={highlightLayerRef}
            className={`absolute inset-0 p-3 overflow-hidden pointer-events-none ${
              wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: currentLineHeight,
              fontFamily: currentFontFamily,
              fontVariantLigatures: fontLigatures ? 'normal' : 'none',
              tabSize: tabWidth
            }}
          >
            <pre
              className="m-0 p-0 bg-transparent"
              style={{
                fontFamily: currentFontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: currentLineHeight,
                fontVariantLigatures: fontLigatures ? 'normal' : 'none',
                tabSize: tabWidth
              }}
              dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
            />
          </div>

          {/* Interactive Editable Code Textarea (Foreground with transparent text) */}
          <textarea
            ref={textareaRef}
            value={code}
            readOnly={isReadOnly}
            onChange={e => handleCodeChange(e.target.value)}
            onScroll={handleScroll}
            onClick={updateCursorStats}
            onKeyUp={updateCursorStats}
            onSelect={updateCursorStats}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={`absolute inset-0 w-full h-full p-3 bg-transparent text-transparent caret-cyan-400 selection:bg-cyan-600/30 selection:text-white resize-none focus:outline-none ${
              wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-auto'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: currentLineHeight,
              fontFamily: currentFontFamily,
              fontVariantLigatures: fontLigatures ? 'normal' : 'none',
              tabSize: tabWidth
            }}
          />
        </div>
      </div>

      {/* 4. Interactive Sandbox Execution Console Drawer */}
      {isConsoleOpen && (
        <div className="border-t border-slate-700 bg-slate-950 text-slate-200 flex flex-col shrink-0 max-h-72 z-30 shadow-2xl transition-all">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs font-mono select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">Execution Output</span>

              {executionTime !== null && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {executionTime.toFixed(1)} ms
                </span>
              )}

              {executionStatus === 'success' && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              )}
              {executionStatus === 'error' && (
                <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Error
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleRunCode}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 cursor-pointer"
                title="Re-run code (Ctrl+Enter)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setConsoleLogs([])}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Clear console output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Close console"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 overflow-y-auto max-h-56 font-mono text-xs space-y-1.5 select-text">
            {consoleLogs.length === 0 ? (
              <div className="text-slate-500 italic">No output. Press "Run Code" to execute.</div>
            ) : (
              consoleLogs.map(log => {
                const badgeColor = {
                  log: 'bg-slate-800 text-slate-300 border-slate-700',
                  info: 'bg-blue-900/40 text-blue-300 border-blue-700',
                  warn: 'bg-amber-900/40 text-amber-300 border-amber-700',
                  error: 'bg-red-900/40 text-red-300 border-red-700',
                  return: 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
                }[log.type];

                return (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[10px] text-slate-500 shrink-0 select-none pt-0.5">{log.time}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-semibold shrink-0 select-none ${badgeColor}`}>
                      {log.type}
                    </span>
                    <pre className="text-slate-200 whitespace-pre-wrap break-all flex-1 font-mono text-xs m-0">
                      {log.content}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Status Bar Footer */}
      <footer className="flex items-center justify-between px-3 py-1 bg-[#1e2227] border-t border-slate-700/80 text-[11px] text-slate-400 select-none shrink-0 font-mono z-20">
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          {cursorPos.selectionLength > 0 && (
            <span className="text-cyan-400 font-semibold">({cursorPos.selectionLength} chars selected)</span>
          )}
          <span className="hidden md:inline">{code.length.toLocaleString()} chars</span>
          <span className="hidden md:inline">{totalLines.toLocaleString()} lines</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Spaces: {tabWidth}</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">{lineHeight} spacing</span>
          <span className="capitalize text-slate-300 font-semibold">{language}</span>
          {isReadOnly && (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Eye className="w-3 h-3" /> Read-Only
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};
