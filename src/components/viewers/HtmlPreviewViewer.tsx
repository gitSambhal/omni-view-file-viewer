/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Globe,
  Code,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
  Eye,
  Columns
} from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface HtmlPreviewViewerProps {
  textContent?: string;
  filename: string;
  onSwitchToCode?: () => void;
}

interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export const HtmlPreviewViewer: React.FC<HtmlPreviewViewerProps> = ({
  textContent = '',
  filename,
  onSwitchToCode
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'split' | 'code' | 'dom'>('preview');
  const [viewport, setViewport] = useState<'responsive' | 'tablet' | 'mobile'>('responsive');
  const [copied, setCopied] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleMessage[]>([]);
  const [domSearchTerm, setDomSearchTerm] = useState<string>('');
  const [allowScripts, setAllowScripts] = useState<boolean>(true);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Injected HTML with console interceptor
  const injectedHtml = useMemo(() => {
    if (!textContent) return '';

    // If scripts are disabled, strip script tags
    let processedContent = textContent;
    if (!allowScripts) {
      processedContent = processedContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- Script disabled for static preview -->');
    }

    const consoleBridgeScript = `
      <script>
        (function() {
          function sendLog(type, args) {
            try {
              var formatted = Array.prototype.slice.call(args).map(function(item) {
                if (typeof item === 'object') {
                  try { return JSON.stringify(item); } catch(e) { return String(item); }
                }
                return String(item);
              }).join(' ');
              window.parent.postMessage({
                source: 'omniview-html-preview',
                type: type,
                message: formatted,
                timestamp: new Date().toLocaleTimeString()
              }, '*');
            } catch(err) {}
          }

          var _log = console.log;
          var _warn = console.warn;
          var _error = console.error;
          var _info = console.info;

          console.log = function() { sendLog('log', arguments); _log.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); _warn.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); _error.apply(console, arguments); };
          console.info = function() { sendLog('info', arguments); _info.apply(console, arguments); };

          window.addEventListener('error', function(e) {
            sendLog('error', [e.message + ' at line ' + e.lineno]);
          });
        })();
      </script>
    `;

    if (processedContent.includes('<head>')) {
      return processedContent.replace('<head>', '<head>' + consoleBridgeScript);
    } else if (processedContent.includes('<html>')) {
      return processedContent.replace('<html>', '<html><head>' + consoleBridgeScript + '</head>');
    } else {
      return consoleBridgeScript + processedContent;
    }
  }, [textContent, reloadKey, allowScripts]);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'omniview-html-preview') {
        setConsoleLogs(prev => [
          ...prev.slice(-99),
          {
            id: String(Date.now() + Math.random()),
            type: event.data.type || 'log',
            message: event.data.message || '',
            timestamp: event.data.timestamp || new Date().toLocaleTimeString()
          }
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Highlighted code for Code tab
  const highlightedCode = useMemo(() => {
    try {
      return hljs.highlight(textContent, { language: 'html' }).value;
    } catch {
      return textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [textContent]);

  // Parsed DOM Tree for DOM Inspector
  const parsedDomTree = useMemo(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(textContent, 'text/html');
      return doc.documentElement;
    } catch {
      return null;
    }
  }, [textContent]);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([textContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([textContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-xs shrink-0 select-none">
        {/* Left: Title & Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
            <Globe className="w-3.5 h-3.5" />
            <span>HTML Live Preview Studio</span>
          </div>

          {/* View Modes */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>

            <button
              onClick={() => setViewMode('dom')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'dom'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>DOM Tree</span>
            </button>
          </div>
        </div>

        {/* Right: Viewport, Console, Actions */}
        <div className="flex items-center gap-2">
          {/* Viewport Presets (only active when previewing) */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewport('responsive')}
                title="Desktop 100% Width"
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewport === 'responsive'
                    ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                title="Tablet 768px View"
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewport === 'tablet'
                    ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                title="Mobile 375px View"
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Console Drawer Toggle */}
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isConsoleOpen || consoleLogs.some(l => l.type === 'error')
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Live Console Log Inspector"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Console</span>
            {consoleLogs.length > 0 && (
              <span className={`text-[10px] px-1 rounded-full font-mono ${
                consoleLogs.some(l => l.type === 'error') ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {consoleLogs.length}
              </span>
            )}
          </button>

          {/* Refresh iframe button */}
          <button
            onClick={() => {
              setReloadKey(k => k + 1);
              setConsoleLogs([]);
            }}
            title="Reload Preview Frame"
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Open in isolated new browser tab */}
          <button
            onClick={handleOpenInNewTab}
            title="Open preview in full new browser tab"
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Copy HTML */}
          <button
            onClick={handleCopyHtml}
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Download HTML"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* VIEW MODE: Live Preview */}
        {viewMode === 'preview' && (
          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 min-h-0 min-w-0 overflow-auto bg-slate-200 dark:bg-slate-950">
            <div
              className={`h-full transition-all duration-300 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-800 ${
                viewport === 'mobile'
                  ? 'w-[375px] max-h-[720px]'
                  : viewport === 'tablet'
                  ? 'w-[768px] max-h-[920px]'
                  : 'w-full'
              }`}
            >
              {/* Virtual Device Title Bar for Mobile/Tablet */}
              {viewport !== 'responsive' && (
                <div className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center justify-between select-none shrink-0 border-b border-slate-700">
                  <span>{viewport === 'mobile' ? 'Mobile Viewport (375px)' : 'Tablet Viewport (768px)'}</span>
                  <span className="text-slate-400">Isolated Sandbox</span>
                </div>
              )}

              <iframe
                key={reloadKey}
                ref={iframeRef}
                title="HTML Live Preview"
                srcDoc={injectedHtml}
                sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          </div>
        )}

        {/* VIEW MODE: Split View (Code on Left, Preview on Right) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 min-w-0 overflow-hidden">
            {/* Left: Code Pane */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-auto bg-[#282c34] p-4 text-xs font-mono">
              <pre
                className="hljs whitespace-pre-wrap leading-relaxed text-slate-100"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>

            {/* Right: Live Preview Pane */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-200 dark:bg-slate-950 p-2 overflow-hidden flex flex-col">
              <div className="w-full h-full bg-white rounded-lg shadow border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col">
                <iframe
                  key={reloadKey}
                  title="HTML Split Live Preview"
                  srcDoc={injectedHtml}
                  sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
                  className="w-full flex-1 border-0 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE: Source Code View */}
        {viewMode === 'code' && (
          <div className="flex-1 h-full min-h-0 overflow-auto bg-[#282c34] p-4 text-xs font-mono text-slate-100">
            <pre
              className="hljs whitespace-pre-wrap leading-relaxed max-w-5xl mx-auto"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </div>
        )}

        {/* VIEW MODE: DOM Tree Inspector */}
        {viewMode === 'dom' && (
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                  DOM Element Hierarchy
                </span>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <input
                  type="text"
                  placeholder="Filter tag or class..."
                  value={domSearchTerm}
                  onChange={e => setDomSearchTerm(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-36 text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
              {parsedDomTree ? (
                <DomNodeItem node={parsedDomTree} searchTerm={domSearchTerm} />
              ) : (
                <div className="text-slate-400">Could not parse DOM hierarchy.</div>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Console Drawer */}
        {isConsoleOpen && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-slate-900 border-t border-slate-700 shadow-2xl flex flex-col z-30 animate-in slide-in-from-bottom duration-200 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-slate-200 text-xs">Embedded Preview Console Logs</span>
                <span className="text-[10px] text-slate-500">({consoleLogs.length} messages)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
                >
                  Clear Console
                </button>
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-900 text-slate-200">
              {consoleLogs.length > 0 ? (
                consoleLogs.map(log => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 p-1 px-2 rounded text-[11px] font-mono leading-relaxed ${
                      log.type === 'error'
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                        : log.type === 'warn'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-slate-500 text-[10px] shrink-0 font-sans">{log.timestamp}</span>
                    <span className={`text-[10px] uppercase font-bold px-1 rounded shrink-0 ${
                      log.type === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : log.type === 'warn'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {log.type}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic p-2 text-center text-xs">
                  No console messages captured yet. Run JavaScript in your HTML to see logs here.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component to render interactive recursive DOM tree
const DomNodeItem: React.FC<{ node: Element; depth?: number; searchTerm?: string }> = ({
  node,
  depth = 0,
  searchTerm = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < 3);

  const tagName = node.tagName?.toLowerCase() || '';
  if (!tagName) return null;

  const children = Array.from(node.children);
  const hasChildren = children.length > 0;
  const classNames = node.className && typeof node.className === 'string' ? node.className.trim() : '';
  const idAttr = node.id || '';

  const isMatch = searchTerm && (
    tagName.includes(searchTerm.toLowerCase()) ||
    classNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idAttr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-1 ${depth > 0 ? 'ml-4 pl-2 border-l border-slate-200 dark:border-slate-800' : ''}`}>
      <div
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded text-xs transition-colors cursor-pointer ${
          isMatch ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        {hasChildren ? (
          <span className="text-slate-400 text-[10px]">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-3" />
        )}

        <span className="text-purple-600 dark:text-purple-400 font-bold">&lt;{tagName}</span>

        {idAttr && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">#{idAttr}</span>
        )}

        {classNames && (
          <span className="text-blue-600 dark:text-blue-400 text-[11px] truncate max-w-[200px]">
            .{classNames.split(' ').join('.')}
          </span>
        )}

        <span className="text-purple-600 dark:text-purple-400 font-bold">&gt;</span>

        {!hasChildren && node.textContent && (
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[250px] text-[11px] italic ml-1">
            "{node.textContent.trim().substring(0, 40)}"
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {children.map((child, idx) => (
            <DomNodeItem key={idx} node={child} depth={depth + 1} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
};
