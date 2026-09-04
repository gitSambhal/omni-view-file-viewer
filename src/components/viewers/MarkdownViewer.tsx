/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Code, Split, Copy, Check, FileText } from 'lucide-react';

interface MarkdownViewerProps {
  textContent?: string;
  filename: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ textContent = '', filename }) => {
  const [content, setContent] = useState<string>(textContent);
  const [mode, setMode] = useState<'preview' | 'split' | 'raw'>('preview');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Markdown Header Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 gap-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-500/20">
          <FileText className="w-3.5 h-3.5" />
          Markdown Document (.md)
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Rendered
            </button>
            <button
              onClick={() => setMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'split' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Split Mode
            </button>
            <button
              onClick={() => setMode('raw')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'raw' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Raw Markdown
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Markdown Body */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950 flex">
        {/* Raw Editor Column */}
        {(mode === 'raw' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2 border-r border-slate-200 dark:border-slate-800' : 'w-full'} flex flex-col h-full min-h-0 min-w-0 bg-white dark:bg-slate-900`}>
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
              Raw Source Editor
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-full p-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              placeholder="Type Markdown content here..."
            />
          </div>
        )}

        {/* Rendered Markdown Column */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} h-full min-h-0 min-w-0 overflow-auto p-6 md:p-10 bg-slate-50 dark:bg-slate-950 flex justify-center items-start`}>
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-xl text-slate-800 dark:text-slate-100 min-w-0 my-auto sm:my-0">
              <div className="markdown-body prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 break-words overflow-x-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
