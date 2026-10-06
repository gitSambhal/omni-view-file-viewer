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
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-[#F8F9FA] dark:bg-[#1F1F1F] text-foreground overflow-hidden font-sans">
      {/* Markdown Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border/80 gap-2 shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1A73E8] dark:text-[#8AB4F8] bg-[#1A73E8]/10 px-2.5 py-0.5 rounded-full border border-[#1A73E8]/20">
          <FileText className="w-3.5 h-3.5" />
          <span>Google Docs Markdown</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-secondary/60 rounded-full border border-border/60">
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                mode === 'preview'
                  ? 'bg-card text-primary shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Document</span>
            </button>
            <button
              onClick={() => setMode('split')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                mode === 'split'
                  ? 'bg-card text-primary shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setMode('raw')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                mode === 'raw'
                  ? 'bg-card text-primary shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-foreground px-3 py-1 rounded-full text-xs font-medium border border-border/60 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Markdown Body */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden bg-[#F8F9FA] dark:bg-[#131314] flex">
        {/* Raw Editor Column */}
        {(mode === 'raw' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2 border-r border-border/80' : 'w-full'} flex flex-col h-full min-h-0 min-w-0 bg-card`}>
            <div className="px-3 py-1 bg-secondary/40 border-b border-border/60 text-[11px] text-muted-foreground font-mono">
              Source Editor
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-full p-4 bg-transparent text-foreground font-mono text-xs focus:outline-none resize-none leading-relaxed"
              placeholder="Type Markdown content here..."
            />
          </div>
        )}

        {/* Rendered Markdown Column: Google Docs Page Canvas */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} h-full min-h-0 min-w-0 overflow-auto p-4 md:p-8 bg-[#F8F9FA] dark:bg-[#131314] flex justify-center items-start`}>
            <div className="w-full max-w-[850px] bg-white dark:bg-[#1E1F20] border border-[#DADCE0] dark:border-[#3C4043] p-10 md:p-14 rounded-sm shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)] text-foreground min-h-[900px] my-4">
              <div className="markdown-body prose dark:prose-invert max-w-none text-foreground break-words overflow-x-auto">
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
