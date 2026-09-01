/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { Captions, Search, Clock, Play, FileText, ChevronRight } from 'lucide-react';

interface SubtitleViewerProps {
  textContent?: string;
  filename: string;
}

interface SubtitleCue {
  id: number;
  timeframe: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export const SubtitleViewer: React.FC<SubtitleViewerProps> = ({ textContent = '', filename }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCueId, setSelectedCueId] = useState<number | null>(null);

  // Simple SRT/VTT parser
  const parsedCues = useMemo(() => {
    if (!textContent) return [];
    const cues: SubtitleCue[] = [];
    const blocks = textContent.replace(/\r/g, '').split('\n\n');

    let cueIndex = 1;
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      // Find timeframe line (e.g. 00:00:01,000 --> 00:00:04,000)
      const timeLineIdx = lines.findIndex(l => l.includes('-->'));
      if (timeLineIdx === -1) continue;

      const timeframe = lines[timeLineIdx];
      const textLines = lines.slice(timeLineIdx + 1).join('\n');

      cues.push({
        id: cueIndex++,
        timeframe,
        startSeconds: 0,
        endSeconds: 0,
        text: textLines
      });
    }

    return cues;
  }, [textContent]);

  const filteredCues = useMemo(() => {
    if (!searchTerm) return parsedCues;
    const term = searchTerm.toLowerCase();
    return parsedCues.filter(c => c.text.toLowerCase().includes(term) || c.timeframe.toLowerCase().includes(term));
  }, [parsedCues, searchTerm]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-900 text-slate-100 font-sans text-xs overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800 gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Captions className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">{filename}</span>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {parsedCues.length} Cues Parsed
          </span>
        </div>

        <div className="flex items-center bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <input
            type="text"
            placeholder="Search dialogue cues..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none w-44 text-xs font-mono"
          />
        </div>
      </div>

      {/* Cues List */}
      <div className="flex-1 overflow-auto p-4 space-y-2 bg-slate-950">
        {filteredCues.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No dialogue cues matched your search.
          </div>
        ) : (
          filteredCues.map(cue => (
            <div
              key={cue.id}
              onClick={() => setSelectedCueId(cue.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedCueId === cue.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>#{cue.id}</span>
                  <Clock className="w-3 h-3 text-slate-400 ml-1" />
                  <span className="text-slate-300">{cue.timeframe}</span>
                </div>
              </div>
              <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                {cue.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
