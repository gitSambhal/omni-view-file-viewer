/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Dynamic NPM Package Tester & Live CDN Playground
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Play,
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileCode,
  ShieldCheck,
  Zap,
  Terminal,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  loadNpmPackage,
  fetchNpmPackageMetadata,
  runJavaScript,
  ConsoleLogItem,
  NpmPackageMeta
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

const CURATED_PACKAGES: CuratedPackage[] = [
  {
    name: 'lodash',
    category: 'Utilities',
    tagline: 'Modern JavaScript utility library delivering modularity, performance & extras',
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

// Export or return result
({ chunks, website: _.get(user, 'profile.social.website') });`
  },
  {
    name: 'dayjs',
    category: 'Date & Time',
    tagline: 'Fast 2kB alternative to Moment.js with modern immutable API',
    defaultSnippet: `import dayjs from 'dayjs';

const now = dayjs();
console.log("Current ISO:", now.toISOString());
console.log("Formatted:", now.format('dddd, MMMM D, YYYY h:mm:ss A'));

const future = now.add(14, 'day').add(3, 'hour');
console.log("14 days + 3 hours from now:", future.format('YYYY-MM-DD HH:mm'));
console.log("Difference in days:", future.diff(now, 'day'));

// Relative calendar formatting
const startOfYear = dayjs().startOf('year');
console.info("Days since start of year:", now.diff(startOfYear, 'day'));

({ today: now.format('YYYY-MM-DD'), daysInMonth: now.daysInMonth() });`
  },
  {
    name: 'zod',
    category: 'Validation',
    tagline: 'TypeScript-first schema declaration and validation with static type inference',
    defaultSnippet: `import { z } from 'zod';

// Define a strict schema
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(18),
  tags: z.array(z.string()).default([])
});

console.log("Schema defined. Testing valid payload...");

const validData = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Suhail",
  email: "suhail@example.com",
  age: 28,
  tags: ["developer", "architect"]
};

const parsed = UserSchema.safeParse(validData);
if (parsed.success) {
  console.info("✅ Valid Payload successfully parsed:", parsed.data);
} else {
  console.error("❌ Validation Failed:", parsed.error);
}

// Test invalid payload
const invalid = UserSchema.safeParse({ id: "invalid", email: "not-an-email", age: 15 });
console.warn("Testing invalid data (expected errors):", invalid.error?.issues);`
  },
  {
    name: 'mathjs',
    category: 'Math & Science',
    tagline: 'Extensive math library for JavaScript and Node.js with symbolic computation',
    defaultSnippet: `import * as math from 'mathjs';

console.log("Math.js version:", math.evaluate ? "Loaded" : "Ready");

// Arithmetic and symbolic expression evaluation
console.log("12.7 cm to inch:", math.evaluate('12.7 cm to inch').toString());
console.log("sin(45 deg) ^ 2:", math.evaluate('sin(45 deg) ^ 2'));
console.log("Matrix determinant:", math.det([[-2, 2, 3], [-1, 1, 3], [2, 0, -1]]));

// Unit conversions
const speed = math.unit(100, 'km/h');
console.info("100 km/h in mph:", speed.to('mph').toString());

// Complex numbers
const c1 = math.complex('2 + 3i');
const c2 = math.complex('4 - 2i');
console.log("Complex multiplication (2+3i) * (4-2i):", math.multiply(c1, c2).toString());`
  },
  {
    name: 'uuid',
    category: 'Utilities',
    tagline: 'RFC4122 compliant UUIDs (v1, v4, v5) generator for JS / TS',
    defaultSnippet: `import { v4 as uuidv4, v1 as uuidv1, validate, version } from 'uuid';

const id1 = uuidv4();
const id2 = uuidv4();
const id3 = uuidv1();

console.log("Generated UUID v4 (Random):", id1);
console.log("Generated UUID v4 (Random 2):", id2);
console.log("Generated UUID v1 (Timestamp):", id3);

console.info("Is id1 valid UUID?", validate(id1));
console.info("id1 UUID Version:", version(id1));
console.info("id3 UUID Version:", version(id3));

const batch = Array.from({ length: 5 }, () => ({ id: uuidv4(), created: Date.now() }));
console.table(batch);`
  },
  {
    name: 'canvas-confetti',
    category: 'Visual & UI',
    tagline: 'Performant canvas-based celebratory confetti animations in-browser',
    defaultSnippet: `import confetti from 'canvas-confetti';

console.log("🎉 Triggering celebratory confetti cannon in browser!");

// Fire confetti blast
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});

console.info("Confetti blast executed successfully! Look at your screen 🎉");`
  },
  {
    name: 'chroma-js',
    category: 'Colors',
    tagline: 'JavaScript color conversion and color scale manipulation library',
    defaultSnippet: `import chroma from 'chroma-js';

// Color scales and palette generation
const scale = chroma.scale(['#2563eb', '#10b981', '#f59e0b', '#ef4444']).mode('lch').colors(6);
console.log("Generated 6-step LCH color scale:", scale);

const color = chroma('#3b82f6');
console.log("Hex:", color.hex());
console.log("RGB:", color.rgb());
console.log("HSL:", color.hsl().map(v => typeof v === 'number' ? Math.round(v) : v));
console.log("Luminance:", color.luminance().toFixed(3));
console.log("Darken 1.5:", color.darken(1.5).hex());
console.log("Contrast ratio against white:", chroma.contrast(color, 'white').toFixed(2));

scale.map(hex => ({ hex, luminance: chroma(hex).luminance().toFixed(3) }));`
  },
  {
    name: 'papaparse',
    category: 'Data & CSV',
    tagline: 'Fast and powerful in-browser CSV (comma-separated values) parser',
    defaultSnippet: `import Papa from 'papaparse';

const csvData = \`name,department,salary,status
Alice Smith,Engineering,125000,Active
Bob Johnson,Marketing,95000,Active
Charlie Brown,Design,105000,On Leave
Diana Prince,Security,140000,Active\`;

console.log("Parsing CSV stream into JSON records...");
const result = Papa.parse(csvData, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
});

console.table(result.data);
console.info("Parsed row count:", result.data.length);
console.info("Fields detected:", result.meta.fields);

result.data;`
  },
  {
    name: 'crypto-js',
    category: 'Crypto',
    tagline: 'JavaScript library of standard cryptographic algorithms (AES, SHA, MD5, HMAC)',
    defaultSnippet: `import CryptoJS from 'crypto-js';

const message = "OmniView File Studio - 100% Offline & Local Previewer";
console.log("Original Message:", message);

// Hashing
const sha256Hash = CryptoJS.SHA256(message).toString();
const md5Hash = CryptoJS.MD5(message).toString();
console.log("SHA-256 Hash:", sha256Hash);
console.log("MD5 Hash:", md5Hash);

// AES Encryption & Decryption
const secretKey = "super-secret-passphrase";
const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
console.info("AES Encrypted Ciphertext:", encrypted);

const decryptedBytes = CryptoJS.AES.decrypt(encrypted, secretKey);
const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
console.info("Decrypted Plaintext:", decryptedText);

({ original: message, sha256: sha256Hash, decryptedMatch: message === decryptedText });`
  },
  {
    name: 'nanoid',
    category: 'Utilities',
    tagline: 'Tiny, secure, URL-friendly unique string ID generator for JavaScript',
    defaultSnippet: `import { nanoid, customAlphabet } from 'nanoid';

console.log("Standard NanoID (21 chars):", nanoid());
console.log("Short NanoID (10 chars):", nanoid(10));

// Custom alphabet ID (e.g. alphanumeric only, or PIN numbers)
const numericPin = customAlphabet('0123456789', 6);
console.log("6-Digit OTP / PIN:", numericPin());

const slugId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
console.log("URL-safe slug ID:", slugId());

const ids = Array.from({ length: 5 }, () => ({ id: nanoid(), short: nanoid(8) }));
console.table(ids);`
  }
];

const CATEGORIES = ['All', 'Utilities', 'Date & Time', 'Validation', 'Math & Science', 'Colors', 'Data & CSV', 'Crypto', 'Visual & UI'];

export const NpmTesterModal: React.FC<NpmTesterModalProps> = ({
  isOpen,
  onClose,
  onInsertImport,
  onOpenAsNewTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePackageName, setActivePackageName] = useState('lodash');
  const [code, setCode] = useState(CURATED_PACKAGES[0].defaultSnippet);
  const [meta, setMeta] = useState<NpmPackageMeta | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);
  const [execStatus, setExecStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [execTime, setExecTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportedMembers, setExportedMembers] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);

  // Load package metadata and default snippet when active package changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingMeta(true);
    setExportedMembers([]);

    fetchNpmPackageMetadata(activePackageName).then(data => {
      if (isMounted) {
        setMeta(data);
        setIsLoadingMeta(false);
      }
    });

    // Escape key closes the modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePackageName, isOpen, onClose]);

  // Handle selecting a curated package
  const handleSelectCurated = (pkg: CuratedPackage) => {
    setActivePackageName(pkg.name);
    setCode(pkg.defaultSnippet);
    setLogs([]);
    setExecStatus('idle');
    setExecTime(null);
  };

  // Handle searching / loading custom package name
  const handleLoadCustomPackage = (customName: string) => {
    const clean = customName.trim();
    if (!clean) return;

    setActivePackageName(clean);
    // Find if we have a curated snippet
    const existing = CURATED_PACKAGES.find(p => p.name.toLowerCase() === clean.toLowerCase());
    if (existing) {
      setCode(existing.defaultSnippet);
    } else {
      // Generate default test template
      const varName = clean.replace(/[^a-zA-Z0-9]/g, '_').replace(/^[0-9]/, '_');
      setCode(`import * as ${varName} from '${clean}';

console.log("📦 Loaded npm package: ${clean}");
console.dir(${varName});

// Inspect all exported keys
const exportsList = Object.keys(${varName});
console.info("Exported members count:", exportsList.length);
console.log("Members:", exportsList.slice(0, 30));

${varName};`);
    }
    setLogs([]);
    setExecStatus('idle');
    setExecTime(null);
  };

  // Execute test code in the in-browser sandbox
  const handleRunTest = async () => {
    setIsRunning(true);
    setLogs([]);
    setExecStatus('idle');
    setExecTime(null);

    const startTime = performance.now();
    const collectedLogs: ConsoleLogItem[] = [];

    const addLog = (type: ConsoleLogItem['type'], content: any, tableData?: any) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      let str = '';
      if (typeof content === 'object') {
        try {
          str = JSON.stringify(content, null, 2);
        } catch (_) {
          str = String(content);
        }
      } else {
        str = String(content);
      }
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
      setExecStatus('success');
    } catch (err: any) {
      if (collectedLogs.length === 0 || collectedLogs[collectedLogs.length - 1]?.type !== 'error') {
        addLog('error', err.message || String(err));
      }
      setExecStatus('error');
    } finally {
      const endTime = performance.now();
      setExecTime(endTime - startTime);
      setIsRunning(false);
    }
  };

  // Inspect Exports directly from CDN
  const handleInspectExports = async () => {
    setIsInspecting(true);
    try {
      const mod = await loadNpmPackage(activePackageName);
      if (mod) {
        const keys = Object.keys(mod);
        setExportedMembers(keys);
      }
    } catch (err) {
      console.warn('Inspect exports error:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter curated packages
  const filteredCurated = CURATED_PACKAGES.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-rose-600 text-white rounded-2xl shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">NPM Package Live Tester & CDN Playground</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Zero Install • Browser CDN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Load, import, and test any NPM library directly in-memory via dynamic CDN streaming
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Curated Categories Carousel */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleLoadCustomPackage(searchQuery.trim());
                  }
                }}
                placeholder="Search or enter ANY npm package name (e.g. lodash, dayjs, zod, mathjs, axios, @faker-js/faker)..."
                className="w-full pl-9 pr-24 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              {searchQuery.trim() && (
                <button
                  onClick={() => handleLoadCustomPackage(searchQuery.trim())}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  Load Package
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Curated Package Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filteredCurated.map(pkg => {
              const isSelected = activePackageName.toLowerCase() === pkg.name.toLowerCase();
              return (
                <button
                  key={pkg.name}
                  onClick={() => handleSelectCurated(pkg)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Package className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{pkg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content: Split Grid between Inspector/Editor and Output */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Package Meta & Code Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Package Metadata Card */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-sm">{meta?.name || activePackageName}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    v{meta?.version || 'latest'}
                  </span>
                  {meta?.license && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      {meta.license}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <a
                    href={`https://www.npmjs.com/package/${activePackageName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    <span>npm</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleInspectExports}
                    disabled={isInspecting}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer disabled:opacity-50"
                  >
                    {isInspecting ? 'Inspecting...' : 'Inspect Exports'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isLoadingMeta ? 'Fetching metadata from NPM registry...' : meta?.description || 'NPM package available for in-browser execution.'}
              </p>

              {/* Exported Members Chips */}
              {exportedMembers.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">
                    Detected Exports ({exportedMembers.length}):
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {exportedMembers.slice(0, 40).map(m => (
                      <span
                        key={m}
                        className="text-[10px] font-mono bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-800"
                      >
                        {m}
                      </span>
                    ))}
                    {exportedMembers.length > 40 && (
                      <span className="text-[10px] text-slate-500 font-mono">+{exportedMembers.length - 40} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Test Code Editor */}
            <div className="flex-1 flex flex-col bg-[#1e2227] border border-slate-700/80 rounded-2xl overflow-hidden shadow-inner min-h-[300px]">
              {/* Editor Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-slate-300 font-semibold">{activePackageName}.test.ts</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
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
                className="flex-1 w-full p-4 bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none no-scrollbar"
                placeholder="// Write code using import ... from 'package'"
              />

              {/* Editor Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#21252b]/90 border-t border-slate-700/80">
                <button
                  onClick={handleRunTest}
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Downloading & Running...' : 'Run Test (Ctrl+Enter)'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {onInsertImport && (
                    <button
                      onClick={() => {
                        const statement = `import ${activePackageName.replace(/[^a-zA-Z0-9]/g, '_')} from '${activePackageName}';\n`;
                        onInsertImport(statement);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      title="Insert import statement into active editor"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Insert Import</span>
                    </button>
                  )}

                  {onOpenAsNewTab && (
                    <button
                      onClick={() => {
                        onOpenAsNewTab(code, `${activePackageName}.test.ts`, 'typescript');
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                      title="Open this test script in a new OmniView tab"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-200" />
                      <span>Open in New Tab</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Execution Console Output (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md min-h-[300px]">
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-bold text-slate-200">Execution Output</span>
                {execStatus === 'success' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
                {execStatus === 'error' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </div>

              {execTime !== null && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{execTime.toFixed(1)}ms</span>
                </div>
              )}
            </div>

            {/* Console Logs Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <Zap className="w-8 h-8 text-slate-600" />
                  <p className="text-xs">Click "Run Test" to load the package from CDN and execute the code in-browser.</p>
                </div>
              ) : (
                logs.map(log => {
                  let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (log.type === 'error') badgeBg = 'bg-red-950/80 text-red-300 border-red-800';
                  if (log.type === 'warn') badgeBg = 'bg-amber-950/80 text-amber-300 border-amber-800';
                  if (log.type === 'info') badgeBg = 'bg-blue-950/80 text-blue-300 border-blue-800';
                  if (log.type === 'return') badgeBg = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
                  if (log.type === 'table') badgeBg = 'bg-cyan-950/80 text-cyan-300 border-cyan-800';

                  return (
                    <div key={log.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-bold ${badgeBg}`}>
                          {log.type}
                        </span>
                        <span className="text-[10px] text-slate-600">{log.time}</span>
                      </div>

                      {log.tableData ? (
                        <div className="overflow-x-auto my-1 border border-slate-800 rounded-lg">
                          <table className="w-full text-[11px] text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900 border-b border-slate-800">
                                {log.tableData.columns.map((c, i) => (
                                  <th key={i} className="p-1.5 font-semibold text-cyan-300 border-r border-slate-800 last:border-r-0">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {log.tableData.rows.map((r, ri) => (
                                <tr key={ri} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                                  {r.map((cell, ci) => (
                                    <td key={ci} className="p-1.5 text-slate-300 border-r border-slate-800/60 last:border-r-0">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <pre className="text-slate-200 whitespace-pre-wrap break-all leading-relaxed pl-1">
                          {log.content}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Modules execute inside isolated in-browser V8 sandbox. Zero server dependencies.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
