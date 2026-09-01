/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { Terminal, Search, AlertCircle, AlertTriangle, Info, CheckCircle, Bug, Filter, ArrowUp, ArrowDown } from 'lucide-react';

interface LogViewerProps {
  textContent?: string;
  filename: string;
}

type LogLevel = 'ALL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SUCCESS';

interface LogEntry {
  id: number;
  raw: string;
  level: LogLevel;
  timestamp?: string;
  message: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ textContent = '', filename }) => {
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [wrapLines, setWrapLines] = useState<boolean>(true);

  // Parse raw log lines
  const parsedLogs = useMemo(() => {
    if (!textContent) return [];
    const lines = textContent.split('\n');
    
    return lines.map((line, idx): LogEntry => {
      const upper = line.toUpperCase();
      let level: LogLevel = 'INFO';
      if (upper.includes('ERROR') || upper.includes('FATAL') || upper.includes('FAIL') || upper.includes('EXCEPTION')) {
        level = 'ERROR';
      } else if (upper.includes('WARN') || upper.includes('WARNING')) {
        level = 'WARN';
      } else if (upper.includes('DEBUG') || upper.includes('TRACE')) {
        level = 'DEBUG';
      } else if (upper.includes('SUCCESS') || upper.includes('OK') || upper.includes('PASSED')) {
        level = 'SUCCESS';
      } else {
        level = 'INFO';
      }

      // Simple regex timestamp extraction
      const timeMatch = line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d+)?|\d{2}:\d{2}:\d{2}/);
      const timestamp = timeMatch ? timeMatch[0] : undefined;

      return {
        id: idx + 1,
        raw: line,
        level,
        timestamp,
        message: line
      };
    });
  }, [textContent]);

  // Counts per level
  const counts = useMemo(() => {
    const c = { ALL: parsedLogs.length, ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, SUCCESS: 0 };
    parsedLogs.forEach(l => {
      if (l.level in c) c[l.level]++;
    });
    return c;
  }, [parsedLogs]);

  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(entry => {
      if (selectedLevel !== 'ALL' && entry.level !== selectedLevel) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return entry.raw.toLowerCase().includes(term);
      }
      return true;
    });
  }, [parsedLogs, selectedLevel, searchTerm]);

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"><AlertCircle className="w-3 h-3" /> ERR</span>;
      case 'WARN':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"><AlertTriangle className="w-3 h-3" /> WARN</span>;
      case 'DEBUG':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"><Bug className="w-3 h-3" /> DBG</span>;
      case 'SUCCESS':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3" /> OK</span>;
      default:
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-900 border-b border-slate-800 gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">{filename}</span>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {filteredLogs.length} / {parsedLogs.length} entries
          </span>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'SUCCESS'] as LogLevel[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{lvl}</span>
              <span className="opacity-70 text-[10px]">({counts[lvl]})</span>
            </button>
          ))}
        </div>

        {/* Search & Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Filter log output..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-36 text-xs font-mono"
            />
          </div>
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
              wrapLines ? 'bg-slate-800 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Wrap
          </button>
        </div>
      </div>

      {/* Log Terminal List */}
      <div className="flex-1 overflow-auto p-3 space-y-1 bg-slate-950">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No log entries match the selected filters.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`flex items-start gap-2 py-1 px-2 rounded hover:bg-slate-900/80 transition-colors ${
                log.level === 'ERROR' ? 'bg-red-500/5' : log.level === 'WARN' ? 'bg-amber-500/5' : ''
              }`}
            >
              <span className="text-slate-600 select-none w-10 shrink-0 text-right pr-2 text-[11px] font-mono">
                {log.id}
              </span>
              {getLevelBadge(log.level)}
              {log.timestamp && (
                <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
              )}
              <span className={`flex-1 min-w-0 ${wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-nowrap overflow-x-auto'} ${
                log.level === 'ERROR' ? 'text-red-300 font-semibold' : log.level === 'WARN' ? 'text-amber-300' : 'text-slate-300'
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
