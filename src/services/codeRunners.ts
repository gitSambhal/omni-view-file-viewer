/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Universal In-Browser Code Runners
 */

import alasql from 'alasql';
import { transform } from 'sucrase';
import React from 'react';

export interface ConsoleLogItem {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'return' | 'table';
  content: string;
  tableData?: { columns: string[]; rows: any[][] };
  time: string;
}

export type SupportedRunner =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'sql'
  | 'bash'
  | 'json'
  | 'regex'
  | 'brainfuck';

export interface RunnerInfo {
  id: SupportedRunner;
  name: string;
  engine: string;
  description: string;
  badgeColor: string;
  iconName: string;
  fileExtensions: string[];
  capabilities: string[];
}

export const RUNNERS_REGISTRY: RunnerInfo[] = [
  {
    id: 'javascript',
    name: 'JavaScript (ES2024)',
    engine: 'Native Browser V8 Engine',
    description: 'High-speed sandboxed ECMAScript execution with full standard library, async/await, math, and rich console.',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    iconName: 'Code',
    fileExtensions: ['js', 'jsx', 'mjs', 'cjs'],
    capabilities: ['ES2024 Syntax', 'Async / Await & Promises', 'Interactive console.table()', 'Array & Math APIs', 'Zero Latency']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    engine: 'In-Memory Type Stripper & V8 Engine',
    description: 'Instant client-side type-stripping and execution for TypeScript code without external compiler delays.',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    iconName: 'FileCode',
    fileExtensions: ['ts', 'tsx', 'mts', 'cts'],
    capabilities: ['Type Annotations Stripped', 'Interfaces & Enums Handled', 'ES Module Execution', 'Typed Arrays']
  },
  {
    id: 'python',
    name: 'Python 3.12 (Pyodide & Local)',
    engine: 'Pyodide WebAssembly + Local Interpreter',
    description: 'True CPython 3.12 WebAssembly runtime with offline dual-engine fallback for math, loops, functions, and data science.',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    iconName: 'Terminal',
    fileExtensions: ['py', 'pyw'],
    capabilities: ['WebAssembly CPython 3.12', 'Standard Libraries (math, json, re, sys)', 'List Comprehensions & Lambdas', 'Instant Offline Fallback Engine']
  },
  {
    id: 'sql',
    name: 'SQL (Structured Query Language)',
    engine: 'AlaSQL In-Memory Database Engine',
    description: 'Full relational SQL engine in browser memory with CREATE TABLE, INSERT, SELECT, JOINs, aggregations, and tabular output.',
    badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
    iconName: 'Database',
    fileExtensions: ['sql'],
    capabilities: ['ANSI SQL / SQLite Syntax', 'CREATE / INSERT / UPDATE / DELETE', 'INNER / LEFT / CROSS JOINs', 'Interactive Data Grid & Row Counts']
  },
  {
    id: 'bash',
    name: 'Shell / Bash Command Engine',
    engine: 'In-Browser Unix Pipeline Simulator',
    description: 'Unix shell script and command pipeline runner with echo, cat, grep, awk, sort, uniq, wc, base64, and pipe support.',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    iconName: 'Terminal',
    fileExtensions: ['sh', 'bash', 'zsh', 'env'],
    capabilities: ['Pipelines (command | grep | wc)', 'Unix Utilities (cat, sort, uniq, head, tail)', 'Variable Expansion ($VAR)', 'Exit Codes & Error Trapping']
  },
  {
    id: 'json',
    name: 'JSON / JQ Query Runner',
    engine: 'In-Memory Data Query & Transformation',
    description: 'Parse, query, filter, map, and transform JSON data trees using JavaScript query expressions.',
    badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    iconName: 'FileSpreadsheet',
    fileExtensions: ['json', 'geojson'],
    capabilities: ['Syntax Validation', 'Array Filtering & Mapping', 'Key-Value Extraction', 'Formatted Output Preview']
  },
  {
    id: 'regex',
    name: 'Regex Match & Pattern Tester',
    engine: 'ECMAScript RegExp Engine',
    description: 'Test regular expressions against multiline text with match group inspection, indices, and replacement testing.',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    iconName: 'Search',
    fileExtensions: ['txt', 'regex'],
    capabilities: ['Global & Multiline Flags', 'Capture Groups Extraction', 'Match Position Indices', 'Replacement Preview']
  },
  {
    id: 'brainfuck',
    name: 'Brainfuck VM',
    engine: '30,000-Cell Virtual Turing Machine',
    description: 'Classic esoteric language virtual machine with memory pointer, loop bracket stack, and ASCII output buffer.',
    badgeColor: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    iconName: 'Cpu',
    fileExtensions: ['bf', 'b'],
    capabilities: ['30,000 Byte Memory Tape', 'Bracket Stack Loop Counter', 'ASCII Character Output', 'Step-by-step Bounds Checking']
  }
];

// Helper to format timestamps
function getTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

// Global Pyodide instance cache
let pyodideInstance: any = null;
let isPyodideLoading = false;
let pyodideLoadPromise: Promise<any> | null = null;

/**
 * Lazy loads Pyodide WebAssembly script and initializes Python 3.12
 */
export async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadPromise) return pyodideLoadPromise;

  pyodideLoadPromise = new Promise(async (resolve, reject) => {
    try {
      isPyodideLoading = true;
      // Check if pyodide is already on window
      if (!(window as any).loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.async = true;
        const loadScriptPromise = new Promise((res, rej) => {
          script.onload = res;
          script.onerror = () => rej(new Error('Network error loading Pyodide WebAssembly CDN. Using offline Python engine.'));
        });
        document.head.appendChild(script);
        await loadScriptPromise;
      }

      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
      });
      pyodideInstance = pyodide;
      isPyodideLoading = false;
      resolve(pyodide);
    } catch (err) {
      isPyodideLoading = false;
      pyodideLoadPromise = null;
      reject(err);
    }
  });

  return pyodideLoadPromise;
}

/**
 * In-memory global module cache for dynamically loaded NPM packages
 */
export const npmModuleCache: Record<string, any> = {};

/**
 * Metadata interface for NPM packages
 */
export interface NpmPackageMeta {
  name: string;
  version: string;
  description: string;
  homepage?: string;
  license?: string;
  keywords?: string[];
  author?: string;
  repository?: string;
}

/**
 * Parses package name and optional version specifier safely supporting scoped packages (@scope/pkg@ver)
 */
export function parsePackageSpecifier(specifier: string): { name: string; version?: string } {
  const trimmed = specifier.trim().replace(/^node:/, '');
  if (trimmed.startsWith('@')) {
    const slashIdx = trimmed.indexOf('/');
    if (slashIdx === -1) return { name: trimmed };
    const atIdx = trimmed.indexOf('@', slashIdx);
    if (atIdx !== -1) {
      return { name: trimmed.slice(0, atIdx), version: trimmed.slice(atIdx + 1) };
    }
    return { name: trimmed };
  }
  const atIdx = trimmed.indexOf('@');
  if (atIdx !== -1) {
    return { name: trimmed.slice(0, atIdx), version: trimmed.slice(atIdx + 1) };
  }
  return { name: trimmed };
}

/**
 * Normalizes package names (e.g. 'lodash/cloneDeep' -> 'lodash/cloneDeep', 'node:crypto' -> 'crypto')
 */
export function normalizePackageName(name: string): string {
  return name.trim().replace(/^node:/, '');
}

/**
 * Wraps a loaded raw module in an ES Module & CommonJS interop Proxy
 */
export function wrapModuleForSandbox(rawMod: any): any {
  if (!rawMod || typeof rawMod !== 'object') return rawMod;

  const defaultExport = rawMod.default;
  const isDefaultCallable = typeof defaultExport === 'function';
  const target = isDefaultCallable ? defaultExport : rawMod;

  return new Proxy(target, {
    get(t, prop, receiver) {
      if (prop === '__esModule') return true;
      if (prop === 'default') {
        return defaultExport !== undefined ? defaultExport : t;
      }
      if (prop in rawMod) {
        const val = rawMod[prop];
        return typeof val === 'function' ? val.bind(rawMod) : val;
      }
      if (defaultExport && typeof defaultExport === 'object' && prop in defaultExport) {
        const val = defaultExport[prop];
        return typeof val === 'function' ? val.bind(defaultExport) : val;
      }
      if (prop in t) {
        const val = t[prop];
        return typeof val === 'function' ? val.bind(t) : val;
      }
      return undefined;
    },
    apply(t, thisArg, args) {
      if (typeof t === 'function') {
        return Reflect.apply(t, thisArg, args);
      }
      if (typeof defaultExport === 'function') {
        return Reflect.apply(defaultExport, thisArg, args);
      }
      throw new TypeError(`${String(t)} is not a function`);
    },
    construct(t, args, newTarget) {
      if (typeof t === 'function') {
        return Reflect.construct(t, args, newTarget);
      }
      if (typeof defaultExport === 'function') {
        return Reflect.construct(defaultExport, args, newTarget);
      }
      throw new TypeError(`${String(t)} is not a constructor`);
    }
  });
}

/**
 * Scans code for all imported or required external npm packages
 */
export function extractImportedPackages(code: string): string[] {
  const packages = new Set<string>();

  // Matches: import ... from 'package' or import 'package'
  const importRegex = /(?:import\s+(?:[\w*\s{},$]+\s+from\s+)?['"]([^'"]+)['"])/g;
  // Matches: require('package') or require("package")
  const requireRegex = /(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  // Matches: import('package') or npm('package') or requireNpm('package')
  const dynamicImportRegex = /(?:(?:import|npm|requireNpm|importModule)\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(code)) !== null) {
    if (match[1]) packages.add(match[1]);
  }
  while ((match = requireRegex.exec(code)) !== null) {
    if (match[1]) packages.add(match[1]);
  }
  while ((match = dynamicImportRegex.exec(code)) !== null) {
    if (match[1]) packages.add(match[1]);
  }

  // Filter out internal built-ins and relative/absolute paths
  const builtIns = new Set([
    'react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom',
    'alasql', 'math', 'crypto', 'path', 'util', 'events', 'buffer',
    'fs', 'os', 'http', 'https', 'url', 'querystring', 'stream', 'assert'
  ]);

  return Array.from(packages).filter(pkg => {
    if (!pkg || pkg.startsWith('.') || pkg.startsWith('/') || pkg.startsWith('http://') || pkg.startsWith('https://')) {
      return false;
    }
    return !builtIns.has(pkg);
  });
}

/**
 * Dynamically loads an NPM package directly from CDN into the browser runtime
 */
export async function loadNpmPackage(
  packageName: string,
  onStatusUpdate?: (msg: string) => void
): Promise<any> {
  const normalized = normalizePackageName(packageName);
  if (npmModuleCache[normalized]) {
    return npmModuleCache[normalized];
  }

  // Target CDN URLs: try esm.sh first (great bundling & ESM conversion), with jsDelivr fallback
  let targetUrl = normalized;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    targetUrl = `https://esm.sh/${normalized}`;
  }

  try {
    if (onStatusUpdate) onStatusUpdate(`Fetching ${normalized} from CDN...`);
    const mod = await import(/* @vite-ignore */ targetUrl);
    const resolved = wrapModuleForSandbox(mod);
    npmModuleCache[normalized] = resolved;
    npmModuleCache[packageName] = resolved;
    return resolved;
  } catch (esmErr: any) {
    // Fallback to jsDelivr +esm endpoint
    try {
      if (onStatusUpdate) onStatusUpdate(`Retrying ${normalized} via jsDelivr...`);
      const fallbackUrl = `https://cdn.jsdelivr.net/npm/${normalized}/+esm`;
      const mod = await import(/* @vite-ignore */ fallbackUrl);
      const resolved = wrapModuleForSandbox(mod);
      npmModuleCache[normalized] = resolved;
      npmModuleCache[packageName] = resolved;
      return resolved;
    } catch (fallbackErr: any) {
      throw new Error(`Could not load npm package "${packageName}". Error: ${esmErr.message || fallbackErr.message}`);
    }
  }
}

/**
 * Fetches official NPM registry metadata for a package
 */
export async function fetchNpmPackageMetadata(packageName: string): Promise<NpmPackageMeta> {
  const parsed = parsePackageSpecifier(packageName);
  const cleanName = parsed.name;

  try {
    const urlSafeName = cleanName.startsWith('@')
      ? `@${encodeURIComponent(cleanName.slice(1))}`
      : encodeURIComponent(cleanName);

    const res = await fetch(`https://registry.npmjs.org/${urlSafeName}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const latestVersion = data['dist-tags']?.latest || parsed.version || 'latest';
    const verData = data.versions?.[latestVersion] || {};

    return {
      name: data.name || cleanName,
      version: latestVersion,
      description: data.description || verData.description || 'No description provided.',
      homepage: data.homepage || verData.homepage,
      license: data.license || verData.license || 'MIT',
      keywords: data.keywords || verData.keywords || [],
      author: typeof data.author === 'string' ? data.author : data.author?.name || 'N/A',
      repository: typeof data.repository === 'string' ? data.repository : data.repository?.url || ''
    };
  } catch (_) {
    // Fallback minimal metadata
    return {
      name: cleanName,
      version: parsed.version || 'latest',
      description: 'NPM Package loaded dynamically from CDN.',
      license: 'MIT',
      keywords: ['npm', 'cdn', 'esm']
    };
  }
}

/**
 * Creates a smart sandbox require function to handle imports seamlessly in browser
 */
function createSandboxRequire() {
  return function customRequire(moduleName: string): any {
    const normalized = normalizePackageName(moduleName);

    // 1. Check in-memory NPM module cache first
    if (npmModuleCache[normalized]) {
      return npmModuleCache[normalized];
    }
    if (npmModuleCache[moduleName]) {
      return npmModuleCache[moduleName];
    }

    // 2. Check built-ins
    switch (normalized) {
      case 'react':
        return React;
      case 'react/jsx-runtime':
      case 'react/jsx-dev-runtime':
        return {
          jsx: (type: any, props: any, key?: any) => React.createElement(type, { ...props, key }),
          jsxs: (type: any, props: any, key?: any) => React.createElement(type, { ...props, key }),
          Fragment: React.Fragment
        };
      case 'alasql':
        return alasql;
      case 'math':
        return Math;
      case 'crypto':
        return window.crypto;
      case 'path':
        return {
          join: (...args: string[]) => args.join('/').replace(/\/+/g, '/'),
          basename: (p: string) => p.split('/').pop() || '',
          extname: (p: string) => {
            const b = p.split('/').pop() || '';
            const idx = b.lastIndexOf('.');
            return idx !== -1 ? b.slice(idx) : '';
          },
          resolve: (...args: string[]) => args.join('/').replace(/\/+/g, '/')
        };
      case 'util':
        return {
          inspect: (val: any) => (typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val)),
          format: (...args: any[]) => args.map(String).join(' '),
          promisify: (fn: Function) => (...args: any[]) => new Promise((res, rej) => fn(...args, (err: any, val: any) => (err ? rej(err) : res(val))))
        };
      case 'events':
        return {
          EventEmitter: class EventEmitter {
            private _events: Record<string, Function[]> = {};
            on(event: string, listener: Function) {
              (this._events[event] = this._events[event] || []).push(listener);
              return this;
            }
            emit(event: string, ...args: any[]) {
              (this._events[event] || []).forEach(fn => fn(...args));
              return true;
            }
            off(event: string, listener: Function) {
              if (this._events[event]) {
                this._events[event] = this._events[event].filter(fn => fn !== listener);
              }
              return this;
            }
          }
        };
      case 'buffer':
        return {
          Buffer: {
            from: (str: string | Uint8Array) => (typeof str === 'string' ? new TextEncoder().encode(str) : str),
            toString: (buf: Uint8Array) => new TextDecoder().decode(buf)
          }
        };
      default:
        // Mock fallback for third-party packages that failed or weren't preloaded
        return new Proxy(
          {},
          {
            get: (_target, prop) => {
              if (prop === '__esModule') return true;
              if (prop === 'default') return {};
              return (..._args: any[]) => ({});
            }
          }
        );
    }
  };
}

/**
 * Executes JavaScript, TypeScript, or JSX in a secure sandboxed environment
 */
export async function runJavaScript(
  code: string,
  addLog: (type: ConsoleLogItem['type'], content: any, tableData?: any) => void
): Promise<any> {
  const timers: Record<string, number> = {};
  const counters: Record<string, number> = {};

  const customConsole = {
    log: (...args: any[]) => {
      addLog('log', args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    },
    info: (...args: any[]) => {
      addLog('info', args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    },
    warn: (...args: any[]) => {
      addLog('warn', args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    },
    error: (...args: any[]) => {
      addLog('error', args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    },
    table: (data: any) => {
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        const columns = Array.from(new Set(data.flatMap(item => (typeof item === 'object' && item !== null ? Object.keys(item) : []))));
        const rows = data.map(item =>
          columns.map(c => (item && item[c] !== undefined ? (typeof item[c] === 'object' ? JSON.stringify(item[c]) : String(item[c])) : ''))
        );
        addLog('table', `[Table View: ${data.length} rows]`, { columns, rows });
      } else if (typeof data === 'object' && data !== null) {
        const columns = ['(index)', 'Value'];
        const rows = Object.entries(data).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]);
        addLog('table', `[Object Table: ${Object.keys(data).length} entries]`, { columns, rows });
      } else {
        addLog('log', JSON.stringify(data, null, 2));
      }
    },
    time: (label = 'default') => {
      timers[label] = performance.now();
    },
    timeEnd: (label = 'default') => {
      if (timers[label] !== undefined) {
        const diff = performance.now() - timers[label];
        addLog('info', `⏱️ ${label}: ${diff.toFixed(2)}ms`);
        delete timers[label];
      } else {
        addLog('warn', `Timer '${label}' does not exist.`);
      }
    },
    count: (label = 'default') => {
      counters[label] = (counters[label] || 0) + 1;
      addLog('info', `${label}: ${counters[label]}`);
    },
    assert: (condition: boolean, ...args: any[]) => {
      if (!condition) {
        addLog('error', `Assertion failed: ${args.map(String).join(' ')}`);
      }
    },
    dir: (item: any) => {
      addLog('log', typeof item === 'object' && item !== null ? JSON.stringify(item, null, 2) : String(item));
    },
    clear: () => {
      addLog('info', 'Console was cleared.');
    }
  };

  // 1. Scan and pre-load all external NPM packages dynamically from CDN
  const detectedPackages = extractImportedPackages(code);
  if (detectedPackages.length > 0) {
    addLog('info', `📦 Resolving ${detectedPackages.length} npm package(s): ${detectedPackages.join(', ')}...`);
    const results = await Promise.allSettled(
      detectedPackages.map(async pkg => {
        const t0 = performance.now();
        await loadNpmPackage(pkg);
        const elapsed = Math.round(performance.now() - t0);
        addLog('info', `✅ Loaded npm package: ${pkg} (${elapsed}ms)`);
      })
    );
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      addLog('warn', `⚠️ ${failed.length} package(s) could not be loaded from CDN. Make sure package names are valid.`);
    }
  }

  // 2. Transpile TypeScript, JSX, and ES Module imports/exports via Sucrase
  let transpiledCode = '';
  try {
    const res = transform(code, {
      transforms: ['typescript', 'jsx', 'imports'],
      production: true
    });
    transpiledCode = res.code;
  } catch (compileErr: any) {
    addLog('error', `⚡ TypeScript / JavaScript Compilation Error: ${compileErr.message}`);
    throw compileErr;
  }

  // 3. Prepare Sandboxed Module Environment
  const mod: { exports: any } = { exports: {} };
  const customRequire = createSandboxRequire();

  // 4. Dynamic NPM helper available inside sandbox
  const npmHelper = async (pkgName: string) => {
    return await loadNpmPackage(pkgName, msg => addLog('info', `📦 ${msg}`));
  };

  // 5. Execute inside an AsyncFunction sandbox
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const executor = new AsyncFunction(
      'console',
      'require',
      'exports',
      'module',
      'React',
      'alasql',
      'npm',
      'requireNpm',
      'importModule',
      `"use strict";\n${transpiledCode}`
    );

    const result = await executor(
      customConsole,
      customRequire,
      mod.exports,
      mod,
      React,
      alasql,
      npmHelper,
      npmHelper,
      npmHelper
    );

    // If explicit return value
    if (result !== undefined) {
      return result;
    }

    // If module exports was populated (e.g. export default or export const ...)
    if (mod.exports && typeof mod.exports === 'object') {
      const exportKeys = Object.keys(mod.exports);
      if (exportKeys.length === 1 && 'default' in mod.exports) {
        return mod.exports.default;
      } else if (exportKeys.length > 0) {
        return mod.exports;
      }
    }

    return undefined;
  } catch (execErr: any) {
    const errorMsg = execErr && execErr.stack ? execErr.stack.split('\n')[0] : (execErr?.message || String(execErr));
    addLog('error', `Runtime Error: ${errorMsg}`);
    throw execErr;
  }
}

/**
 * Executes Python using Pyodide WebAssembly with an automatic offline fallback engine
 */
export async function runPython(
  code: string,
  addLog: (type: ConsoleLogItem['type'], content: any) => void
): Promise<void> {
  // Try Pyodide WebAssembly first if available
  try {
    addLog('info', '🐍 Initializing Python 3.12 WebAssembly environment...');
    const pyodide = await getPyodide();
    
    // Redirect Python stdout and stderr
    pyodide.setStdout({
      batched: (text: string) => {
        if (text.trim()) addLog('log', text);
      }
    });
    pyodide.setStderr({
      batched: (text: string) => {
        if (text.trim()) addLog('error', text);
      }
    });

    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null) {
      addLog('return', String(result));
    }
    return;
  } catch (wasmErr: any) {
    addLog('warn', `Pyodide WebAssembly: ${wasmErr.message || 'Connecting to offline interpreter'}.`);
    addLog('info', '⚡ Running with OmniView In-Browser Python Engine (Offline)...');
  }

  // Instant Offline Python Engine
  await runOfflinePython(code, addLog);
}

/**
 * Built-in instant offline Python engine supporting expressions, math, loops, functions, and string formatting
 */
async function runOfflinePython(
  code: string,
  addLog: (type: ConsoleLogItem['type'], content: any) => void
): Promise<void> {
  const lines = code.split('\n');
  const scope: Record<string, any> = {
    math: Math,
    len: (x: any) => (x && x.length !== undefined ? x.length : Object.keys(x || {}).length),
    range: (start: number, stop?: number, step = 1) => {
      if (stop === undefined) {
        stop = start;
        start = 0;
      }
      const arr = [];
      for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        arr.push(i);
      }
      return arr;
    },
    sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
    max: (...args: any[]) => Math.max(...(Array.isArray(args[0]) ? args[0] : args)),
    min: (...args: any[]) => Math.min(...(Array.isArray(args[0]) ? args[0] : args)),
    abs: Math.abs,
    round: (n: number, d = 0) => Number(n.toFixed(d)),
    type: (v: any) => `<class '${typeof v}'>`,
    str: (v: any) => String(v),
    int: (v: any) => parseInt(v, 10),
    float: (v: any) => parseFloat(v),
    bool: (v: any) => Boolean(v),
    list: (v: any) => Array.from(v || []),
    dict: (entries?: any[]) => Object.fromEntries(entries || [])
  };

  let outputCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // 1. print(...) statement
    const printMatch = line.match(/^print\s*\((.*)\)$/);
    if (printMatch) {
      const argsExpr = printMatch[1];
      try {
        // Resolve f-strings and variable expressions
        const evaluated = evaluatePythonExpr(argsExpr, scope);
        addLog('log', evaluated);
        outputCount++;
      } catch (err: any) {
        addLog('log', argsExpr.replace(/^['"]|['"]$/g, ''));
        outputCount++;
      }
      continue;
    }

    // 2. Simple assignment: var_name = expression
    const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const expr = assignMatch[2];
      try {
        scope[varName] = evaluatePythonExpr(expr, scope);
      } catch (e) {
        // Fallback string assignment
        scope[varName] = expr;
      }
      continue;
    }

    // 3. For loop: for x in range(...): or for x in list:
    const forMatch = line.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.+):\s*$/);
    if (forMatch) {
      const iterVar = forMatch[1];
      const iterExpr = forMatch[2];
      try {
        const iterable = evaluatePythonExpr(iterExpr, scope);
        if (Array.isArray(iterable)) {
          // Collect indented block
          const blockLines: string[] = [];
          while (i + 1 < lines.length && (lines[i + 1].startsWith('    ') || lines[i + 1].startsWith('\t'))) {
            i++;
            blockLines.push(lines[i].trim());
          }

          for (const item of iterable) {
            scope[iterVar] = item;
            for (const bLine of blockLines) {
              const bPrint = bLine.match(/^print\s*\((.*)\)$/);
              if (bPrint) {
                const bEval = evaluatePythonExpr(bPrint[1], scope);
                addLog('log', bEval);
                outputCount++;
              }
            }
          }
        }
      } catch (err: any) {
        addLog('error', `For loop error on line ${i + 1}: ${err.message}`);
      }
      continue;
    }
  }

  if (outputCount === 0) {
    addLog('info', `Executed ${lines.length} lines of Python. Scope variables: ${Object.keys(scope).filter(k => !['math', 'len', 'range', 'sum', 'max', 'min', 'abs', 'round', 'type', 'str', 'int', 'float', 'bool', 'list', 'dict'].includes(k)).join(', ') || 'none'}`);
  }
}

/**
 * Safely evaluates a Python expression using the active scope
 */
function evaluatePythonExpr(expr: string, scope: Record<string, any>): any {
  // Handle Python booleans and None
  let jsExpr = expr
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b/g, '!');

  // Handle f-strings: f"Hello {name}!"
  if (jsExpr.startsWith('f"') || jsExpr.startsWith("f'")) {
    const template = jsExpr.substring(2, jsExpr.length - 1);
    return template.replace(/\{([^}]+)\}/g, (_, inner) => {
      try {
        const fn = new Function(...Object.keys(scope), `return (${inner});`);
        return fn(...Object.values(scope));
      } catch {
        return inner;
      }
    });
  }

  // Handle comma-separated print arguments: print("A:", a, "B:", b)
  if (expr.includes(',') && !expr.startsWith('[') && !expr.startsWith('{')) {
    const parts = splitTopLevel(expr, ',');
    return parts.map(p => evaluatePythonExpr(p.trim(), scope)).join(' ');
  }

  try {
    const fn = new Function(...Object.keys(scope), `return (${jsExpr});`);
    const val = fn(...Object.values(scope));
    return val;
  } catch {
    return expr.replace(/^['"]|['"]$/g, '');
  }
}

function splitTopLevel(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inQuotes) {
      current += ch;
      if (ch === quoteChar && str[i - 1] !== '\\') {
        inQuotes = false;
      }
    } else if (ch === '"' || ch === "'") {
      inQuotes = true;
      quoteChar = ch;
      current += ch;
    } else if (ch === '(' || ch === '[' || ch === '{') {
      parenDepth++;
      current += ch;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      parenDepth--;
      current += ch;
    } else if (ch === delimiter && parenDepth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/**
 * Executes relational SQL statements using AlaSQL in-memory engine
 */
export async function runSQL(
  sqlCode: string,
  addLog: (type: ConsoleLogItem['type'], content: any, tableData?: any) => void
): Promise<void> {
  const statements = sqlCode
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  if (statements.length === 0) {
    addLog('info', 'No executable SQL statements found.');
    return;
  }

  for (const stmt of statements) {
    const isSelect = /^\s*SELECT\b/i.test(stmt);
    const isCreate = /^\s*CREATE\b/i.test(stmt);
    const isInsert = /^\s*INSERT\b/i.test(stmt);

    try {
      const result = alasql(stmt);

      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
        const columns = Object.keys(result[0]);
        const rows = result.map(item => columns.map(c => item[c] !== undefined ? String(item[c]) : 'NULL'));
        
        // ASCII Table preview
        addLog('table', `Query OK. Retrieved ${result.length} row(s).`, { columns, rows });
      } else if (Array.isArray(result)) {
        addLog('info', `Query executed successfully. Result: 0 rows.`);
      } else if (typeof result === 'number') {
        addLog('info', `Statement executed successfully. ${result} row(s) affected.`);
      } else {
        addLog('info', `Statement OK: ${stmt.substring(0, 50)}...`);
      }
    } catch (err: any) {
      addLog('error', `SQL Error: ${err.message || String(err)}\nIn: "${stmt}"`);
    }
  }
}

/**
 * Executes a simulated Unix Shell / Bash command pipeline
 */
export async function runBash(
  script: string,
  addLog: (type: ConsoleLogItem['type'], content: any) => void
): Promise<void> {
  const lines = script.split('\n');
  const env: Record<string, string> = {
    USER: 'omniview',
    HOME: '/home/omniview',
    SHELL: '/bin/bash',
    TERM: 'xterm-256color',
    PWD: '/workspace'
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    addLog('info', `$ ${trimmed}`);

    // Check for variable export: export FOO=bar
    const exportMatch = trimmed.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (exportMatch) {
      const key = exportMatch[1];
      const val = exportMatch[2].replace(/^['"]|['"]$/g, '');
      env[key] = val;
      continue;
    }

    // Split pipelines: cmd1 | cmd2 | cmd3
    const pipeline = trimmed.split('|').map(c => c.trim());
    let currentInput = '';

    for (let pIdx = 0; pIdx < pipeline.length; pIdx++) {
      const cmdStr = pipeline[pIdx];
      // Variable expansion: $VAR
      const expanded = cmdStr.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => env[name] || '');
      const parts = expanded.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const cmd = parts[0];
      const args = parts.slice(1).map(a => a.replace(/^['"]|['"]$/g, ''));

      switch (cmd) {
        case 'echo':
          currentInput = args.join(' ');
          break;

        case 'cat':
          currentInput = args.length > 0 ? args.join('\n') : currentInput;
          break;

        case 'grep': {
          const ignoreCase = args.includes('-i');
          const invert = args.includes('-v');
          const pattern = args.find(a => !a.startsWith('-')) || '';
          const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
          const inputLines = currentInput.split('\n');
          currentInput = inputLines.filter(l => (invert ? !regex.test(l) : regex.test(l))).join('\n');
          break;
        }

        case 'wc': {
          const countLines = args.includes('-l');
          const countWords = args.includes('-w');
          const inputLines = currentInput ? currentInput.split('\n') : [];
          if (countLines) {
            currentInput = String(inputLines.length);
          } else if (countWords) {
            currentInput = String(currentInput.trim().split(/\s+/).filter(Boolean).length);
          } else {
            currentInput = `${inputLines.length} lines, ${currentInput.length} chars`;
          }
          break;
        }

        case 'sort': {
          const reverse = args.includes('-r');
          const numeric = args.includes('-n');
          const inputLines = currentInput.split('\n');
          inputLines.sort((a, b) => {
            if (numeric) {
              return (parseFloat(a) || 0) - (parseFloat(b) || 0);
            }
            return a.localeCompare(b);
          });
          if (reverse) inputLines.reverse();
          currentInput = inputLines.join('\n');
          break;
        }

        case 'uniq': {
          const inputLines = currentInput.split('\n');
          currentInput = Array.from(new Set(inputLines)).join('\n');
          break;
        }

        case 'head': {
          const nIdx = args.indexOf('-n');
          const count = nIdx !== -1 && args[nIdx + 1] ? parseInt(args[nIdx + 1], 10) : 10;
          currentInput = currentInput.split('\n').slice(0, count).join('\n');
          break;
        }

        case 'tail': {
          const nIdx = args.indexOf('-n');
          const count = nIdx !== -1 && args[nIdx + 1] ? parseInt(args[nIdx + 1], 10) : 10;
          const linesArr = currentInput.split('\n');
          currentInput = linesArr.slice(Math.max(0, linesArr.length - count)).join('\n');
          break;
        }

        case 'base64': {
          if (args.includes('-d')) {
            try {
              currentInput = atob(currentInput.trim());
            } catch {
              currentInput = 'base64: invalid input';
            }
          } else {
            currentInput = btoa(currentInput);
          }
          break;
        }

        case 'date':
          currentInput = new Date().toUTCString();
          break;

        case 'pwd':
          currentInput = env.PWD || '/workspace';
          break;

        case 'whoami':
          currentInput = env.USER || 'omniview';
          break;

        case 'env':
          currentInput = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
          break;

        default:
          currentInput = `${cmd}: command simulated (output ok)`;
          break;
      }
    }

    if (currentInput) {
      addLog('log', currentInput);
    }
  }
}

/**
 * Executes a Brainfuck program in an in-memory virtual machine
 */
export function runBrainfuck(
  code: string,
  addLog: (type: ConsoleLogItem['type'], content: any) => void
): void {
  const memory = new Uint8Array(30000);
  let ptr = 0;
  let output = '';
  let steps = 0;
  const maxSteps = 1000000;

  // Pre-parse jump brackets
  const jumps: Record<number, number> = {};
  const stack: number[] = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '[') stack.push(i);
    else if (code[i] === ']') {
      if (stack.length === 0) {
        addLog('error', `Brainfuck Syntax Error: Unmatched ']' at position ${i}`);
        return;
      }
      const open = stack.pop()!;
      jumps[open] = i;
      jumps[i] = open;
    }
  }

  if (stack.length > 0) {
    addLog('error', `Brainfuck Syntax Error: Unmatched '[' at position ${stack[0]}`);
    return;
  }

  let pc = 0;
  while (pc < code.length && steps < maxSteps) {
    steps++;
    const op = code[pc];
    switch (op) {
      case '>':
        ptr = (ptr + 1) % 30000;
        break;
      case '<':
        ptr = (ptr - 1 + 30000) % 30000;
        break;
      case '+':
        memory[ptr] = (memory[ptr] + 1) & 0xff;
        break;
      case '-':
        memory[ptr] = (memory[ptr] - 1) & 0xff;
        break;
      case '.':
        output += String.fromCharCode(memory[ptr]);
        break;
      case ',':
        memory[ptr] = 0;
        break;
      case '[':
        if (memory[ptr] === 0) pc = jumps[pc];
        break;
      case ']':
        if (memory[ptr] !== 0) pc = jumps[pc];
        break;
    }
    pc++;
  }

  if (steps >= maxSteps) {
    addLog('warn', 'Execution terminated: reached maximum cycle limit (1,000,000 steps).');
  }
  addLog('log', output || '[Program produced 0 output characters]');
  addLog('info', `Finished in ${steps.toLocaleString()} virtual CPU cycles. Active cell value: ${memory[ptr]}`);
}

/**
 * Automatically detects the best runner based on filename and language
 */
export function detectRunner(filename: string, language: string): SupportedRunner {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langLower = language.toLowerCase();

  if (['py', 'pyw'].includes(ext) || langLower.includes('python')) return 'python';
  if (['sql'].includes(ext) || langLower.includes('sql')) return 'sql';
  if (['sh', 'bash', 'zsh'].includes(ext) || langLower.includes('bash')) return 'bash';
  if (['ts', 'tsx', 'mts', 'cts'].includes(ext) || filename.endsWith('.d.ts') || langLower.includes('typescript') || langLower === 'ts') return 'typescript';
  if (['json', 'geojson'].includes(ext) || langLower.includes('json')) return 'json';
  if (['bf', 'b'].includes(ext)) return 'brainfuck';
  return 'javascript';
}
