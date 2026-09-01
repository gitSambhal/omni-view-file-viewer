/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ZoomIn, ZoomOut, FileText, Info, Layers } from 'lucide-react';

interface EbookViewerProps {
  textContent?: string;
  filename: string;
}

export const EbookViewer: React.FC<EbookViewerProps> = ({ textContent = '', filename }) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract sections/chapters
  const chapters = useMemo(() => {
    if (!textContent) return ['Document Content'];
    const lines = textContent.split('\n');
    const chapterHeaders = lines.filter(l => l.trim().toLowerCase().startsWith('chapter') || l.trim().startsWith('#'));
    if (chapterHeaders.length > 0) {
      return chapterHeaders.map(c => c.replace(/^#+\s*/, '').trim());
    }
    return ['Document Content'];
  }, [textContent]);

  const wordCount = useMemo(() => {
    if (!textContent) return 0;
    return textContent.trim().split(/\s+/).length;
  }, [textContent]);

  const readingTimeMin = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-950 text-slate-100 font-sans text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800 gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">{filename}</span>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {wordCount.toLocaleString()} words (~{readingTimeMin} min read)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search document..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-36 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-slate-700">
            <button
              onClick={() => setFontSize(prev => Math.max(10, prev - 2))}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 transition-colors cursor-pointer"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 transition-colors cursor-pointer"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-auto p-6 md:p-12 bg-slate-950 flex justify-center">
        <div
          className="w-full max-w-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-xl shadow-xl text-slate-200 leading-relaxed font-sans"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-800 text-indigo-400 font-mono text-xs">
            <FileText className="w-4 h-4" />
            <span>Document Preview • {filename}</span>
          </div>

          <article className="whitespace-pre-wrap break-words font-sans">
            {textContent || 'Binary or compressed document file. Parsing text content...'}
          </article>
        </div>
      </div>
    </div>
  );
};
