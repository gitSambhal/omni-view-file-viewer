/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { Code, Copy, Check, Search, WrapText, ZoomIn, ZoomOut, Globe, Eye, Database, Play } from 'lucide-react';
import { getFileExtension } from '../../services/fileDetector';

interface CodeViewerProps {
  textContent?: string;
  filename: string;
  onSwitchToLivePreview?: () => void;
  onSwitchToDatabase?: () => void;
}

const EXT_LANG_MAP: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  html: 'xml', css: 'css', scss: 'scss', py: 'python', java: 'java',
  cpp: 'cpp', c: 'c', cs: 'csharp', php: 'php', rb: 'ruby', rs: 'rust',
  go: 'go', sql: 'sql', sh: 'bash', bash: 'bash', zsh: 'bash', env: 'bash',
  json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml', md: 'markdown',
  dockerfile: 'dockerfile', makefile: 'makefile', toml: 'ini', ini: 'ini',
  properties: 'ini', conf: 'ini', config: 'ini', prisma: 'graphql'
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
  textContent = '',
  filename,
  onSwitchToLivePreview,
  onSwitchToDatabase
}) => {
  const ext = getFileExtension(filename);
  const defaultLang = EXT_LANG_MAP[ext] || 'plaintext';
  const isHtmlCapable = ['html', 'htm', 'xhtml', 'svg', 'xml'].includes(ext) ||
                        Boolean(textContent && (textContent.includes('<html') || textContent.includes('<!DOCTYPE') || textContent.includes('<svg')));
  const isSqlCapable = ext === 'sql' || defaultLang === 'sql' || Boolean(textContent && textContent.includes('CREATE TABLE'));

  const [language, setLanguage] = useState<string>(defaultLang);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(13);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const lines = useMemo(() => textContent.split('\n'), [textContent]);

  const highlightedCode = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(textContent, { language }).value;
      }
      return hljs.highlightAuto(textContent).value;
    } catch (e) {
      return textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [textContent, language]);

  const highlightedLines = useMemo(() => {
    return highlightedCode.split('\n');
  }, [highlightedCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-50 dark:bg-[#282c34] text-slate-800 dark:text-slate-100 font-mono overflow-hidden transition-colors">
      {/* Code Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white dark:bg-[#21252b] border-b border-slate-200 dark:border-slate-700/60 gap-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            <Code className="w-3.5 h-3.5" />
            Code Viewer ({lines.length.toLocaleString()} lines)
          </div>

          {isHtmlCapable && onSwitchToLivePreview && (
            <button
              onClick={onSwitchToLivePreview}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Open in Live HTML Sandbox Preview"
            >
              <Globe className="w-3.5 h-3.5 text-blue-200" />
              <span>Live Preview</span>
            </button>
          )}

          {isSqlCapable && onSwitchToDatabase && (
            <button
              onClick={onSwitchToDatabase}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Execute SQL queries in interactive Database Studio"
            >
              <Database className="w-3.5 h-3.5 text-emerald-200" />
              <span>Run SQL Studio</span>
            </button>
          )}

          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded focus:outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="java">Java</option>
            <option value="cpp">C / C++</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="bash">Bash / Shell</option>
            <option value="xml">XML</option>
            <option value="yaml">YAML</option>
            <option value="plaintext">Plain Text</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Find in code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-28 md:w-36 text-xs"
            />
          </div>

          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              wordWrap ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-4 h-4" />
          </button>

          <button
            onClick={() => setFontSize(f => Math.max(10, f - 1))}
            className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 cursor-pointer"
            title="Decrease Font Size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(f => Math.min(22, f + 1))}
            className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 cursor-pointer"
            title="Increase Font Size"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto bg-slate-900 dark:bg-[#282c34] text-slate-100 p-4 flex min-h-0 min-w-0">
        <div className="table w-full" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>
          {highlightedLines.map((lineHtml, idx) => {
            const lineNumber = idx + 1;
            const lineRaw = lines[idx] || '';
            const isMatch = searchTerm && lineRaw.toLowerCase().includes(searchTerm.toLowerCase());

            return (
              <div
                key={idx}
                className={`table-row hover:bg-slate-800/60 transition-colors ${
                  isMatch ? 'bg-amber-500/20 ring-1 ring-amber-500/40' : ''
                }`}
              >
                {/* Line number */}
                <div className="table-cell select-none text-right pr-4 text-slate-500 dark:text-slate-600 border-r border-slate-700/50 font-mono w-12 sticky left-0 bg-slate-900 dark:bg-[#282c34]">
                  {lineNumber}
                </div>
                {/* Line content */}
                <div
                  className={`table-cell pl-4 font-mono ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}
                  dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
