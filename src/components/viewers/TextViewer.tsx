/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState } from 'react';
import { AlignLeft, Copy, Check, Search, WrapText } from 'lucide-react';

interface TextViewerProps {
  textContent?: string;
  filename: string;
}

export const TextViewer: React.FC<TextViewerProps> = ({ textContent = '', filename }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const lines = textContent.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono overflow-hidden transition-colors">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600/40">
          <AlignLeft className="w-3.5 h-3.5" />
          Text Document Reader ({lines.length.toLocaleString()} lines, {textContent.length.toLocaleString()} chars)
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Find in text..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-36 text-xs"
            />
          </div>

          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded text-xs transition-colors ${
              wordWrap ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-white dark:bg-slate-950 p-4">
        <pre className={`text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed ${wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
          {textContent}
        </pre>
      </div>
    </div>
  );
};
