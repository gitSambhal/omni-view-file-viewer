/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Copy, Check, Search, Code, AlignLeft } from 'lucide-react';

interface JsonXmlViewerProps {
  textContent?: string;
  filename: string;
}

const JsonNode: React.FC<{ name?: string; value: any; isLast?: boolean }> = ({ name, value, isLast = true }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  if (!isObject) {
    let valString = JSON.stringify(value);
    let valColor = 'text-emerald-400';
    if (typeof value === 'number') valColor = 'text-amber-400';
    if (typeof value === 'boolean') valColor = 'text-purple-400';
    if (value === null) valColor = 'text-slate-500';

    return (
      <div className="pl-4 font-mono text-xs py-0.5 hover:bg-slate-800/40 rounded">
        {name && <span className="text-blue-400 mr-1.5">"{name}":</span>}
        <span className={valColor}>{valString}</span>
        {!isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  const keys = isArray ? value : Object.keys(value);

  return (
    <div className="pl-4 font-mono text-xs py-0.5">
      <div
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 cursor-pointer hover:bg-slate-800/60 rounded px-1 text-slate-300 select-none"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        {name && <span className="text-blue-400 font-semibold">"{name}":</span>}
        <span className="text-slate-400 font-bold">{isArray ? '[' : '{'}</span>
        {!expanded && (
          <span className="text-slate-500 text-[10px] ml-1 bg-slate-800 px-1.5 rounded">
            {isArray ? `${value.length} items` : `${Object.keys(value).length} keys`}
          </span>
        )}
        {!expanded && <span className="text-slate-400 font-bold">{isArray ? ']' : '}'}</span>}
      </div>

      {expanded && (
        <div className="border-l border-slate-800 ml-2">
          {isArray
            ? value.map((item: any, idx: number) => (
                <JsonNode key={idx} value={item} isLast={idx === value.length - 1} />
              ))
            : Object.keys(value).map((key: string, idx: number) => (
                <JsonNode
                  key={key}
                  name={key}
                  value={value[key]}
                  isLast={idx === Object.keys(value).length - 1}
                />
              ))}
        </div>
      )}

      {expanded && (
        <div className="pl-4 text-slate-400 font-bold">
          {isArray ? ']' : '}'}
          {!isLast && <span className="text-slate-500">,</span>}
        </div>
      )}
    </div>
  );
};

export const JsonXmlViewer: React.FC<JsonXmlViewerProps> = ({ textContent = '', filename }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'formatted'>('tree');

  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(textContent);
    } catch (e) {
      return null;
    }
  }, [textContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono overflow-hidden transition-colors">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
          <Code className="w-3.5 h-3.5" />
          JSON / Data Tree Inspector
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('formatted')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'formatted' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Formatted JSON
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded text-xs border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Tree / Formatted Body */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-white dark:bg-slate-950 p-4">
        {parsedJson ? (
          viewMode === 'tree' ? (
            <JsonNode value={parsedJson} />
          ) : (
            <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(parsedJson, null, 2)}
            </pre>
          )
        ) : (
          <pre className="text-xs font-mono text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{textContent}</pre>
        )}
      </div>
    </div>
  );
};
