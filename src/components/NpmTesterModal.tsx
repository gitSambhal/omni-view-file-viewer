/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Dynamic NPM Package Tester & Live CDN Playground
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Package,
  Play,
  Copy,
  ExternalLink,
  Search,
  Check,
  Terminal,
  Plus,
  Layers,
  Clock,
  ShieldCheck,
  Wand2,
  Palette,
  Loader2
} from 'lucide-react';
import {
  runJavaScript,
  ConsoleLogItem
} from '../services/codeRunners';

export interface NpmTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImport?: (importStatement: string) => void;
  onOpenAsNewTab?: (code: string, filename: string, language: string) => void;
}

interface CuratedPackage {
  name: string;
  category: string;
  tagline: string;
  defaultSnippet: string;
}

export interface TokenStyles {
  keyword: string;
  string: string;
  number: string;
  function: string;
  comment: string;
  type: string;
  variable: string;
}

export interface EditorTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  textHex: string;
  border: string;
  headerBg: string;
  gutterText: string;
  caretColor: string;
  tokens: TokenStyles;
}

interface NpmSearchResult {
  name: string;
  version: string;
  description: string;
  publisher?: string;
}

const EDITOR_THEMES: EditorTheme[] = [
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    bg: 'bg-[#0d1117]',
    text: 'text-[#c9d1d9]',
    textHex: '#c9d1d9',
    border: 'border-[#30363d]',
    headerBg: 'bg-[#161b22]',
    gutterText: 'text-[#484f58]',
    caretColor: '#58a6ff',
    tokens: {
      keyword: '#ff7b72',
      string: '#a5d6ff',
      number: '#79c0ff',
      function: '#d2a8ff',
      comment: '#8b949e',
      type: '#7ee787',
      variable: '#ffa657'
    }
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    bg: 'bg-[#1e2227]',
    text: 'text-[#abb2bf]',
    textHex: '#abb2bf',
    border: 'border-[#3e4451]',
    headerBg: 'bg-[#21252b]',
    gutterText: 'text-[#5c6370]',
    caretColor: '#528bff',
    tokens: {
      keyword: '#c678dd',
      string: '#98c379',
      number: '#d19a66',
      function: '#61afef',
      comment: '#5c6370',
      type: '#e5c07b',
      variable: '#e06c75'
    }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    bg: 'bg-[#011627]',
    text: 'text-[#d6deeb]',
    textHex: '#d6deeb',
    border: 'border-[#1d3b53]',
    headerBg: 'bg-[#0b253a]',
    gutterText: 'text-[#4b6479]',
    caretColor: '#80a4c1',
    tokens: {
      keyword: '#c792ea',
      string: '#ecc48d',
      number: '#f78c6c',
      function: '#82aaff',
      comment: '#637777',
      type: '#addb67',
      variable: '#7fdbca'
    }
  },
  {
    id: 'monokai',
    name: 'Monokai',
    bg: 'bg-[#272822]',
    text: 'text-[#f8f8f2]',
    textHex: '#f8f8f2',
    border: 'border-[#3e3d32]',
    headerBg: 'bg-[#1e1f1c]',
    gutterText: 'text-[#75715e]',
    caretColor: '#f8f8f0',
    tokens: {
      keyword: '#f92672',
      string: '#e6db74',
      number: '#ae81ff',
      function: '#a6e22e',
      comment: '#75715e',
      type: '#66d9ef',
      variable: '#fd971f'
    }
  },
  {
    id: 'light',
    name: 'VS Light',
    bg: 'bg-white',
    text: 'text-[#24292e]',
    textHex: '#24292e',
    border: 'border-slate-300',
    headerBg: 'bg-slate-100',
    gutterText: 'text-slate-400',
    caretColor: '#0969da',
    tokens: {
      keyword: '#cf222e',
      string: '#0a3069',
      number: '#0550ae',
      function: '#8250df',
      comment: '#6e7781',
      type: '#116329',
      variable: '#953800'
    }
  }
];

const POPULAR_PACKAGES: CuratedPackage[] = [
  {
    name: 'lodash',
    category: 'Utilities',
    tagline: 'Modern JavaScript utility library',
    defaultSnippet: `import _ from 'lodash';

// Lodash chunk, shuffle, and object deep manipulation
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Original array:", numbers);

const chunks = _.chunk(numbers, 3);
console.log("Chunked (size 3):", chunks);

const user = {
  name: "Suhail Akhtar",
  profile: {
    skills: ["TypeScript", "React", "Rust"],
    social: { website: "https://suhail.top" }
  }
};

console.log("Deep get website:", _.get(user, 'profile.social.website'));
console.log("Shuffled array:", _.shuffle(numbers));

({ chunks, website: _.get(user, 'profile.social.website') });`
  },
  {
    name: 'dayjs',
    category: 'Date & Time',
    tagline: 'Fast 2kB alternative to Moment.js',
    defaultSnippet: `import dayjs from 'dayjs';

const now = dayjs();
console.log("Current ISO:", now.toISOString());
console.log("Formatted:", now.format('dddd, MMMM D, YYYY h:mm:ss A'));

const future = now.add(14, 'day').add(3, 'hour');
console.log("14 days + 3 hours from now:", future.format('YYYY-MM-DD HH:mm'));

({ today: now.format('YYYY-MM-DD'), daysInMonth: now.daysInMonth() });`
  },
  {
    name: 'zod',
    category: 'Validation',
    tagline: 'TypeScript-first schema validation',
    defaultSnippet: `import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(18)
});

const validData = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Suhail",
  email: "suhail@example.com",
  age: 28
};

const parsed = UserSchema.safeParse(validData);
console.info("Validation Result:", parsed.success ? "Passed" : "Failed");
console.log("Parsed Data:", parsed.data);`
  },
  {
    name: 'mathjs',
    category: 'Math & Science',
    tagline: 'Extensive math library for JS/TS',
    defaultSnippet: `import * as math from 'mathjs';

console.log("Unit conversion (12.7 cm to inch):", math.evaluate('12.7 cm to inch').toString());
console.log("Matrix determinant:", math.det([[-2, 2, 3], [-1, 1, 3], [2, 0, -1]]));

const speed = math.unit(100, 'km/h');
console.info("100 km/h in miles per hour:", speed.to('mile/h').toString());`
  },
  {
    name: 'uuid',
    category: 'Utilities',
    tagline: 'RFC4122 compliant UUID generator',
    defaultSnippet: `import { v4 as uuidv4, validate } from 'uuid';

const id = uuidv4();
console.log("Generated UUID v4:", id);
console.log("Is valid UUID:", validate(id));`
  }
];

function formatJsTsCode(input: string): string {
  const lines = input.split('\n');
  let indentLevel = 0;
  const formattedLines: string[] = [];
  let prevEmpty = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (!prevEmpty) {
        formattedLines.push('');
        prevEmpty = true;
      }
      continue;
    }
    prevEmpty = false;

    if (/^[}\]\)]/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indented = '  '.repeat(indentLevel) + line;
    formattedLines.push(indented);

    const openBrackets = (line.match(/[{[(]/g) || []).length;
    const closeBrackets = (line.match(/[}\]]/g) || []).length;
    const diff = openBrackets - closeBrackets;
    if (diff > 0) {
      indentLevel += diff;
    }
  }

  return formattedLines.join('\n');
}

/** Theme-Aware JS/TS Tokenizer */
function highlightSyntaxLine(line: string, tokens: TokenStyles): React.ReactNode[] {
  if (!line) return ['\n'];

  const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:import|from|as|export|default|const|let|var|function|return|if|else|try|catch|async|await|new|typeof|type|interface|class|of|in|extends|implements)\b|\b(?:true|false|null|undefined|NaN|Infinity)\b|\b\d+(?:\.\d+)?\b|\b[A-Z][a-zA-Z0-9_$]*\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('//') || token.startsWith('/*')) {
      parts.push(<span key={match.index} style={{ color: tokens.comment, fontStyle: 'italic' }}>{token}</span>);
    } else if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) {
      parts.push(<span key={match.index} style={{ color: tokens.string }}>{token}</span>);
    } else if (/^(import|from|as|export|default|const|let|var|function|return|if|else|try|catch|async|await|new|typeof|type|interface|class|of|in|extends|implements)$/.test(token)) {
      parts.push(<span key={match.index} style={{ color: tokens.keyword, fontWeight: 600 }}>{token}</span>);
    } else if (/^(true|false|null|undefined|NaN|Infinity)$/.test(token)) {
      parts.push(<span key={match.index} style={{ color: tokens.number, fontWeight: 500 }}>{token}</span>);
    } else if (/^\d+(?:\.\d+)?$/.test(token)) {
      parts.push(<span key={match.index} style={{ color: tokens.number }}>{token}</span>);
    } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(token)) {
      parts.push(<span key={match.index} style={{ color: tokens.type }}>{token}</span>);
    } else {
      parts.push(<span key={match.index} style={{ color: tokens.function }}>{token}</span>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }

  return parts;
}

export const NpmTesterModal: React.FC<NpmTesterModalProps> = ({
  isOpen,
  onClose,
  onInsertImport,
  onOpenAsNewTab
}) => {
  const [activePackageName, setActivePackageName] = useState<string>('lodash');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<NpmSearchResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [code, setCode] = useState<string>(POPULAR_PACKAGES[0].defaultSnippet);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('github-dark');
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [formattedMessage, setFormattedMessage] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live NPM Registry Suggestions API Search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=7`);
        if (res.ok) {
          const data = await res.json();
          const results: NpmSearchResult[] = (data.objects || []).map((obj: any) => ({
            name: obj.package.name,
            version: obj.package.version,
            description: obj.package.description || '',
            publisher: obj.package.publisher?.username || ''
          }));
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch (err) {
        console.warn('NPM search request error:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const currentTheme = EDITOR_THEMES.find(t => t.id === selectedThemeId) || EDITOR_THEMES[0];
  const lines = code.split('\n');

  const handleSelectPackage = (pkg: CuratedPackage) => {
    setActivePackageName(pkg.name);
    setCode(pkg.defaultSnippet);
    setLogs([]);
    setExecTime(null);
    setShowSuggestions(false);
  };

  const handleLoadCustomPackage = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setActivePackageName(clean);

    const existing = POPULAR_PACKAGES.find(p => p.name.toLowerCase() === clean.toLowerCase());
    if (existing) {
      setCode(existing.defaultSnippet);
    } else {
      const varName = clean.replace(/[^a-zA-Z0-9]/g, '_').replace(/^[0-9]/, '_');
      setCode(`import * as ${varName} from '${clean}';

console.log("📦 Loaded npm package: ${clean}");
console.dir(${varName});

const members = Object.keys(${varName});
console.log("Exported members count:", members.length);
console.log("Members:", members.slice(0, 20));`);
    }
    setLogs([]);
    setExecTime(null);
    setShowSuggestions(false);
  };

  const handleRunTest = async () => {
    setIsRunning(true);
    setLogs([]);
    setExecTime(null);

    const startTime = performance.now();
    const collectedLogs: ConsoleLogItem[] = [];

    const addLog = (type: ConsoleLogItem['type'], content: any, tableData?: any) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      let str = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);

      collectedLogs.push({
        id: Math.random().toString(36).substring(2, 9),
        type,
        content: str,
        tableData,
        time: timeStr
      });
      setLogs([...collectedLogs]);
    };

    try {
      const result = await runJavaScript(code, addLog);
      if (result !== undefined) {
        addLog('return', result);
      }
    } catch (err: any) {
      if (collectedLogs.length === 0 || collectedLogs[collectedLogs.length - 1]?.type !== 'error') {
        addLog('error', err.message || String(err));
      }
    } finally {
      const endTime = performance.now();
      setExecTime(endTime - startTime);
      setIsRunning(false);
    }
  };

  const handleFormatCode = () => {
    const formatted = formatJsTsCode(code);
    setCode(formatted);
    setFormattedMessage(true);
    setTimeout(() => setFormattedMessage(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-slate-800 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  NPM CDN Playground
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Zero Install
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live package search & instant in-memory TypeScript execution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Search & Package Auto-Suggest Bar */}
        <div className="p-3.5 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          <div className="relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleLoadCustomPackage(searchQuery.trim());
                  }
                }}
                placeholder="Search live NPM registry (e.g. axios, lodash, zod, three, chart.js, dayjs)..."
                className="w-full pl-9 pr-24 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              />
              {isLoadingSuggestions ? (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                </div>
              ) : searchQuery.trim() ? (
                <button
                  onClick={() => handleLoadCustomPackage(searchQuery.trim())}
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                  Load
                </button>
              ) : null}
            </div>

            {/* Floating Live NPM Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-64 overflow-y-auto animate-in fade-in duration-100 divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>Live NPM Search Results</span>
                  <span>registry.npmjs.org</span>
                </div>
                {suggestions.map(item => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSearchQuery(item.name);
                      handleLoadCustomPackage(item.name);
                    }}
                    className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:underline">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          v{item.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.description || 'NPM package'}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Load →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Popular Package Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold shrink-0">
              Popular:
            </span>
            {POPULAR_PACKAGES.map(pkg => {
              const isSelected = activePackageName.toLowerCase() === pkg.name.toLowerCase();
              return (
                <button
                  key={pkg.name}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {pkg.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
          {/* Left Column: Theme-Aware Editor & Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{activePackageName}</span>
                <a
                  href={`https://www.npmjs.com/package/${activePackageName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-0.5"
                >
                  <span>npm</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Theme & Format Toolbar */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-[10px] font-mono">
                  <Palette className="w-3 h-3 text-slate-400 ml-1" />
                  {EDITOR_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                        selectedThemeId === theme.id
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleFormatCode}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  title="Format Code"
                >
                  <Wand2 className="w-3 h-3 text-purple-500" />
                  <span>{formattedMessage ? 'Formatted!' : 'Format'}</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Synchronized Theme-Aware Pixel-Perfect Code Editor */}
            <div className={`flex-1 flex flex-col border rounded-xl overflow-hidden min-h-[260px] ${currentTheme.bg} ${currentTheme.border}`}>
              <div className="flex-1 flex min-h-0 relative">
                {/* Synchronized Line Numbers Gutter */}
                <div
                  ref={gutterRef}
                  className={`select-none py-3.5 px-2.5 text-right font-mono text-xs ${currentTheme.gutterText} border-r border-slate-800/20 shrink-0 overflow-hidden`}
                  style={{ height: '100%' }}
                >
                  {lines.map((_, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {/* Editor Container with Pixel-Perfect Syntax Highlight Backdrop */}
                <div className="relative flex-1 min-h-0 overflow-hidden font-mono text-xs leading-relaxed">
                  {/* Theme Syntax Highlight Backdrop */}
                  <div
                    ref={backdropRef}
                    className="absolute inset-0 p-3.5 font-mono text-xs leading-relaxed pointer-events-none overflow-hidden whitespace-pre"
                    style={{ color: currentTheme.textHex }}
                    aria-hidden="true"
                  >
                    {lines.map((lineText, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {highlightSyntaxLine(lineText, currentTheme.tokens)}
                      </div>
                    ))}
                  </div>

                  {/* Interactive Textarea Foreground */}
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onScroll={e => {
                      const top = e.currentTarget.scrollTop;
                      const left = e.currentTarget.scrollLeft;
                      if (gutterRef.current) gutterRef.current.scrollTop = top;
                      if (backdropRef.current) {
                        backdropRef.current.scrollTop = top;
                        backdropRef.current.scrollLeft = left;
                      }
                    }}
                    onKeyDown={e => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        if (!isRunning) handleRunTest();
                      } else if (e.key === 'Tab') {
                        e.preventDefault();
                        const target = e.currentTarget;
                        const start = target.selectionStart;
                        const end = target.selectionEnd;
                        const newCode = code.substring(0, start) + '  ' + code.substring(end);
                        setCode(newCode);
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = start + 2;
                        }, 0);
                      }
                    }}
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full p-3.5 bg-transparent font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto whitespace-pre no-scrollbar"
                    style={{
                      color: 'transparent',
                      caretColor: currentTheme.caretColor,
                      WebkitTextFillColor: 'transparent'
                    }}
                    placeholder="// Write code importing packages..."
                  />
                </div>
              </div>

              {/* Editor Footer Actions */}
              <div className={`flex items-center justify-between p-2.5 ${currentTheme.headerBg} border-t ${currentTheme.border}`}>
                <button
                  onClick={handleRunTest}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Run Code (Ctrl+Enter)'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {onInsertImport && (
                    <button
                      onClick={() => {
                        const statement = `import ${activePackageName.replace(/[^a-zA-Z0-9]/g, '_')} from '${activePackageName}';\n`;
                        onInsertImport(statement);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3 text-blue-400" />
                      <span>Import</span>
                    </button>
                  )}

                  {onOpenAsNewTab && (
                    <button
                      onClick={() => {
                        onOpenAsNewTab(code, `${activePackageName}.test.ts`, 'typescript');
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Layers className="w-3 h-3" />
                      <span>New Tab</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Console Log Output (5 cols) */}
          <div className="md:col-span-5 flex flex-col bg-[#070b12] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[260px]">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">Console Output</span>
              </div>
              {execTime !== null && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{execTime.toFixed(1)}ms</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-xs text-slate-200">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-1">
                  <Play className="w-6 h-6 text-slate-600 opacity-50" />
                  <p className="text-xs">Click "Run Code" to execute in sandbox.</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px]">
                      <span className={`px-1 rounded uppercase font-bold ${
                        log.type === 'error' ? 'bg-rose-950 text-rose-300' :
                        log.type === 'return' ? 'bg-emerald-950 text-emerald-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-slate-600">{log.time}</span>
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
                      {log.content}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Packages run locally via esm.sh CDN. Zero server code execution.</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
