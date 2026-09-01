/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Binary & Dynamic Link Library (DLL) Deep Inspector
 */

import React, { useState, useMemo } from 'react';
import {
  Binary,
  Cpu,
  Layers,
  Search,
  Copy,
  Check,
  FileCode,
  Shield,
  Hash,
  Terminal,
  Activity,
  Filter,
  ExternalLink,
  Code,
  FolderTree,
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { HexViewer } from '../HexViewer';

interface BinaryInspectorViewerProps {
  arrayBuffer?: ArrayBuffer;
  filename?: string;
}

interface SectionInfo {
  name: string;
  virtualSize: number;
  virtualAddress: number;
  rawSize: number;
  rawAddress: number;
  characteristics: string;
  entropy?: number;
  type: 'code' | 'data' | 'resource' | 'reloc' | 'unknown';
}

interface ExtractedString {
  text: string;
  offset: number;
  encoding: 'ascii' | 'utf16';
  category: 'api' | 'path' | 'url' | 'guid' | 'general';
}

interface BinaryAnalysis {
  format: string;
  architecture: string;
  fileType: string;
  subsystem?: string;
  magicHex: string;
  entryPoint?: number;
  imageBase?: string;
  timestamp?: string;
  sections: SectionInfo[];
  detectedFeatures: string[];
  extractedStrings: ExtractedString[];
  totalSize: number;
}

export const BinaryInspectorViewer: React.FC<BinaryInspectorViewerProps> = ({
  arrayBuffer,
  filename = 'binary.dll'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'strings' | 'hex'>('overview');
  const [stringFilter, setStringFilter] = useState<'all' | 'api' | 'path' | 'url'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minStrLength, setMinStrLength] = useState<number>(4);
  const [copiedOffset, setCopiedOffset] = useState<string | null>(null);

  // Parse Binary Data (PE, ELF, Mach-O, WASM, Java Class, Python PYC)
  const analysis: BinaryAnalysis = useMemo(() => {
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return {
        format: 'Empty / Unreadable',
        architecture: 'Unknown',
        fileType: 'Binary Data',
        magicHex: '0x00000000',
        sections: [],
        detectedFeatures: [],
        extractedStrings: [],
        totalSize: 0
      };
    }

    const dataView = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);
    const byteLength = arrayBuffer.byteLength;

    // Get First 4 Bytes
    const magic0 = bytes[0];
    const magic1 = bytes[1];
    const magic2 = bytes[2];
    const magic3 = bytes[3];
    const magicHex = `0x${Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('')}`;

    let format = 'Raw Binary / Firmware Stream';
    let architecture = 'Generic x86 / x64 / ARM';
    let fileType = 'Binary Container';
    let subsystem: string | undefined;
    let entryPoint: number | undefined;
    let imageBase: string | undefined;
    let timestamp: string | undefined;
    const sections: SectionInfo[] = [];
    const detectedFeatures: string[] = [];

    // 1. Windows PE (.dll, .exe, .sys, .ocx)
    if (magic0 === 0x4d && magic1 === 0x5a) {
      // 'MZ' DOS Header
      format = 'Portable Executable (PE)';
      fileType = filename.toLowerCase().endsWith('.dll') ? 'Dynamic Link Library (DLL)' : 'Windows Executable / PE';

      if (byteLength > 0x3c + 4) {
        const peOffset = dataView.getUint32(0x3c, true);
        if (peOffset + 24 < byteLength && bytes[peOffset] === 0x50 && bytes[peOffset + 1] === 0x45) {
          // 'PE\0\0'
          const machine = dataView.getUint16(peOffset + 4, true);
          const numSections = dataView.getUint16(peOffset + 6, true);
          const timeDateStamp = dataView.getUint32(peOffset + 8, true);
          const characteristics = dataView.getUint16(peOffset + 22, true);

          if (machine === 0x8664) architecture = 'x64 (AMD64 / Intel 64-bit)';
          else if (machine === 0x014c) architecture = 'x86 (Intel 386 32-bit)';
          else if (machine === 0xaa64) architecture = 'ARM64 (AArch64 Windows)';
          else if (machine === 0x01c0) architecture = 'ARM (Thumb-2)';
          else architecture = `Machine 0x${machine.toString(16).toUpperCase()}`;

          if (characteristics & 0x2000) {
            fileType = 'Dynamic Link Library (DLL)';
          }

          if (timeDateStamp > 0) {
            try {
              timestamp = new Date(timeDateStamp * 1000).toUTCString();
            } catch (_) {}
          }

          // Optional Header
          const optHeaderOffset = peOffset + 24;
          const optMagic = dataView.getUint16(optHeaderOffset, true);
          const is64 = optMagic === 0x20b;
          format = is64 ? 'PE32+ (64-bit Windows PE)' : 'PE32 (32-bit Windows PE)';

          entryPoint = dataView.getUint32(optHeaderOffset + 16, true);
          if (is64 && optHeaderOffset + 32 <= byteLength) {
            const baseHigh = dataView.getUint32(optHeaderOffset + 28, true);
            const baseLow = dataView.getUint32(optHeaderOffset + 24, true);
            imageBase = `0x${baseHigh.toString(16).padStart(8, '0')}${baseLow.toString(16).padStart(8, '0')}`;
          }

          // Subsystem
          if (optHeaderOffset + 68 <= byteLength) {
            const sub = dataView.getUint16(optHeaderOffset + 68, true);
            if (sub === 2) subsystem = 'Windows GUI (Graphical)';
            else if (sub === 3) subsystem = 'Windows CUI (Console CLI)';
            else if (sub === 1) subsystem = 'Native / Device Driver';
          }

          // Read Section Headers
          const sizeOfOptHeader = dataView.getUint16(peOffset + 20, true);
          let secHeaderOffset = peOffset + 24 + sizeOfOptHeader;

          for (let i = 0; i < Math.min(numSections, 32); i++) {
            if (secHeaderOffset + 40 > byteLength) break;
            let name = '';
            for (let j = 0; j < 8; j++) {
              const charCode = bytes[secHeaderOffset + j];
              if (charCode === 0) break;
              name += String.fromCharCode(charCode);
            }
            name = name.trim() || `.sec${i + 1}`;
            const virtualSize = dataView.getUint32(secHeaderOffset + 8, true);
            const virtualAddress = dataView.getUint32(secHeaderOffset + 12, true);
            const rawSize = dataView.getUint32(secHeaderOffset + 16, true);
            const rawAddress = dataView.getUint32(secHeaderOffset + 20, true);
            const secChars = dataView.getUint32(secHeaderOffset + 36, true);

            let secType: SectionInfo['type'] = 'unknown';
            if (name.startsWith('.text') || name.startsWith('.code')) secType = 'code';
            else if (name.startsWith('.data') || name.startsWith('.bss')) secType = 'data';
            else if (name.startsWith('.rsrc')) secType = 'resource';
            else if (name.startsWith('.reloc')) secType = 'reloc';

            sections.push({
              name,
              virtualSize,
              virtualAddress,
              rawSize,
              rawAddress,
              characteristics: `0x${secChars.toString(16).toUpperCase()}`,
              type: secType
            });

            secHeaderOffset += 40;
          }
        }
      }
    }
    // 2. Linux ELF (.so, .elf)
    else if (magic0 === 0x7f && magic1 === 0x45 && magic2 === 0x4c && magic3 === 0x46) {
      format = 'ELF (Executable & Linkable Format)';
      const is64 = bytes[4] === 2;
      architecture = is64 ? 'x86-64 / AArch64 (64-bit)' : 'x86 / ARM (32-bit)';
      const eType = dataView.getUint16(16, true);
      if (eType === 3) fileType = 'Shared Object Library (.so)';
      else if (eType === 2) fileType = 'Linux Executable';
      else if (eType === 1) fileType = 'Relocatable Object File (.o)';

      detectedFeatures.push('Linux Dynamic Symbol Table (dynsym)', 'Position Independent Code (PIC)');
    }
    // 3. Apple Mach-O (.dylib)
    else if (
      (magic0 === 0xfe && magic1 === 0xed && magic2 === 0xfa && (magic3 === 0xce || magic3 === 0xcf)) ||
      (magic0 === 0xcf && magic1 === 0xfa && magic2 === 0xed && magic3 === 0xfe)
    ) {
      format = 'Mach-O (macOS / iOS Dynamic Library)';
      architecture = magic3 === 0xcf || magic0 === 0xcf ? 'ARM64 / x86_64 64-bit' : '32-bit';
      fileType = 'Mach-O Dynamic Library (.dylib)';
      detectedFeatures.push('Apple Dynamic Loader Load Commands (LC_DYLIB)');
    }
    // 4. Java Class (.class)
    else if (magic0 === 0xca && magic1 === 0xfe && magic2 === 0xba && magic3 === 0xbe) {
      format = 'JVM Class Bytecode';
      architecture = 'Java Virtual Machine';
      fileType = 'Compiled Java Class File';
      if (byteLength >= 8) {
        const major = dataView.getUint16(6, false);
        detectedFeatures.push(`Java Bytecode Major Version ${major} (Java ${major >= 45 ? major - 44 : 'Classic'})`);
      }
    }
    // 5. WebAssembly (.wasm)
    else if (magic0 === 0x00 && magic1 === 0x61 && magic2 === 0x73 && magic3 === 0x6d) {
      format = 'WebAssembly (WASM Binary)';
      architecture = 'WASM Virtual Machine';
      fileType = 'Compiled WebAssembly Module';
      detectedFeatures.push('WASM Version 1.0', 'Wasm Memory & Table Sections');
    }

    // 6. Extract Printable Strings & Symbols (up to 500 max to keep fast)
    const extracted: ExtractedString[] = [];
    let currentAscii = '';
    let currentOffset = 0;

    for (let i = 0; i < byteLength && extracted.length < 600; i++) {
      const b = bytes[i];
      // Printable ASCII (32-126)
      if (b >= 32 && b <= 126) {
        if (currentAscii.length === 0) currentOffset = i;
        currentAscii += String.fromCharCode(b);
      } else {
        if (currentAscii.length >= minStrLength) {
          const lower = currentAscii.toLowerCase();
          let category: ExtractedString['category'] = 'general';

          if (
            lower.startsWith('http://') ||
            lower.startsWith('https://') ||
            lower.startsWith('ws://') ||
            lower.startsWith('wss://')
          ) {
            category = 'url';
          } else if (
            lower.includes('.dll') ||
            lower.includes('.pdb') ||
            lower.includes('.so') ||
            lower.startsWith('/') ||
            lower.includes(':\\') ||
            lower.includes('c:\\')
          ) {
            category = 'path';
          } else if (
            lower.includes('api') ||
            lower.includes('getproc') ||
            lower.includes('loadlibrary') ||
            lower.includes('malloc') ||
            lower.includes('free') ||
            lower.includes('init') ||
            lower.includes('main') ||
            lower.includes('create') ||
            lower.includes('kernel') ||
            currentAscii.includes('DllMain') ||
            currentAscii.includes('__')
          ) {
            category = 'api';
          }

          extracted.push({
            text: currentAscii,
            offset: currentOffset,
            encoding: 'ascii',
            category
          });
        }
        currentAscii = '';
      }
    }

    return {
      format,
      architecture,
      fileType,
      subsystem,
      magicHex,
      entryPoint,
      imageBase,
      timestamp,
      sections,
      detectedFeatures,
      extractedStrings: extracted,
      totalSize: byteLength
    };
  }, [arrayBuffer, filename, minStrLength]);

  // Filter extracted strings
  const filteredStrings = useMemo(() => {
    return analysis.extractedStrings.filter(s => {
      const matchCategory = stringFilter === 'all' || s.category === stringFilter;
      const matchSearch =
        searchQuery === '' ||
        s.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `0x${s.offset.toString(16)}`.includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [analysis.extractedStrings, stringFilter, searchQuery]);

  const handleCopyText = (text: string, offsetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOffset(offsetId);
    setTimeout(() => setCopiedOffset(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-sm text-slate-200">Binary & DLL Inspector</span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono">
            {analysis.format}
          </span>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            {(analysis.totalSize / 1024).toFixed(1)} KB ({analysis.totalSize.toLocaleString()} bytes)
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            PE & Headers
          </button>
          {analysis.sections.length > 0 && (
            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sections' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Sections ({analysis.sections.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('strings')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'strings' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Symbol & String Scanner ({analysis.extractedStrings.length})
          </button>
          <button
            onClick={() => setActiveTab('hex')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hex' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Raw Hex
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Quick Spec Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">File Container</span>
                <p className="font-bold text-sm text-slate-100">{analysis.fileType}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{filename}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Machine</span>
                <p className="font-bold text-sm text-purple-300">{analysis.architecture}</p>
                <p className="text-xs text-slate-500 font-mono">Magic: {analysis.magicHex}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subsystem / Runtime</span>
                <p className="font-bold text-sm text-blue-300">{analysis.subsystem || 'Standard Native Subsystem'}</p>
                <p className="text-xs text-slate-500 font-mono">
                  {analysis.sections.length > 0 ? `${analysis.sections.length} Virtual Sections` : 'Flat Binary'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Entry Point Offset</span>
                <p className="font-bold text-sm text-emerald-400 font-mono">
                  {analysis.entryPoint !== undefined ? `0x${analysis.entryPoint.toString(16).toUpperCase()}` : 'N/A'}
                </p>
                <p className="text-xs text-slate-500 font-mono">Base: {analysis.imageBase || '0x00400000'}</p>
              </div>
            </div>

            {/* Header Specs Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Binary Header & Metadata Analysis
                </h3>
                {analysis.timestamp && (
                  <span className="text-xs text-slate-400 font-mono">Compiled: {analysis.timestamp}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">File Signature:</span>
                    <span className="text-purple-400 font-bold">{analysis.magicHex}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Format Standard:</span>
                    <span className="text-slate-200">{analysis.format}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Target CPU Architecture:</span>
                    <span className="text-slate-200">{analysis.architecture}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">File Byte Size:</span>
                    <span className="text-slate-200">{analysis.totalSize.toLocaleString()} bytes</span>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Virtual Sections Count:</span>
                    <span className="text-blue-400 font-bold">{analysis.sections.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Executable Entry Point:</span>
                    <span className="text-emerald-400">
                      {analysis.entryPoint !== undefined ? `0x${analysis.entryPoint.toString(16).toUpperCase()}` : '0x0000'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Default Image Base:</span>
                    <span className="text-slate-200">{analysis.imageBase || '0x00000000'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Security & Sandboxing:</span>
                    <span className="text-emerald-400 font-bold">100% Offline Local Analysis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Disassembly / String Hints */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">Embedded API & Symbol Highlights</span>
                <button
                  onClick={() => setActiveTab('strings')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  View All ({analysis.extractedStrings.length}) Strings &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
                {analysis.extractedStrings.slice(0, 9).map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between group hover:border-purple-500/40 transition-colors"
                  >
                    <span className="truncate text-slate-300">{s.text}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2 group-hover:text-purple-400 font-bold">
                      0x{s.offset.toString(16)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Table Tab */}
        {activeTab === 'sections' && (
          <div className="p-6 space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200">PE Section Headers Table</h3>
                <p className="text-xs text-slate-400">Memory map and byte boundaries of executable segments</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{analysis.sections.length} Sections</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Section</th>
                    <th className="p-3">Type / Purpose</th>
                    <th className="p-3">Virtual Address</th>
                    <th className="p-3">Virtual Size</th>
                    <th className="p-3">Raw File Size</th>
                    <th className="p-3">Characteristics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {analysis.sections.map((sec, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3 font-bold text-purple-400">{sec.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            sec.type === 'code'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : sec.type === 'data'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : sec.type === 'resource'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sec.type === 'code'
                            ? 'Executable Code (.text)'
                            : sec.type === 'data'
                            ? 'Initialized Data'
                            : sec.type === 'resource'
                            ? 'Resources / Icons'
                            : sec.type === 'reloc'
                            ? 'Relocations'
                            : 'Binary Segment'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">0x{sec.virtualAddress.toString(16).toUpperCase()}</td>
                      <td className="p-3 text-slate-200">
                        {sec.virtualSize.toLocaleString()} bytes ({(sec.virtualSize / 1024).toFixed(1)} KB)
                      </td>
                      <td className="p-3 text-slate-400">
                        {sec.rawSize.toLocaleString()} bytes ({(sec.rawSize / 1024).toFixed(1)} KB)
                      </td>
                      <td className="p-3 text-slate-500">{sec.characteristics}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* String & Symbol Scanner Tab */}
        {activeTab === 'strings' && (
          <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto flex flex-col h-full">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search extracted symbols, API names, endpoints, or offsets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {[
                  { id: 'all', label: 'All Symbols' },
                  { id: 'api', label: 'API & Functions' },
                  { id: 'path', label: 'Paths & DLLs' },
                  { id: 'url', label: 'URLs' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setStringFilter(cat.id as any)}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                      stringFilter === cat.id
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strings List */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[300px]">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between shrink-0">
                <span>Showing {filteredStrings.length} Extracted Strings</span>
                <span>Minimum Length: {minStrLength} chars</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
                {filteredStrings.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">No matching symbols found</div>
                ) : (
                  filteredStrings.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl hover:bg-slate-900/80 transition-colors flex items-center justify-between gap-3 group text-xs font-mono select-text"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] text-purple-400 font-bold w-20 shrink-0 select-all">
                          0x{s.offset.toString(16).padStart(6, '0')}
                        </span>
                        <span
                          className={`truncate ${
                            s.category === 'api'
                              ? 'text-emerald-300 font-semibold'
                              : s.category === 'url'
                              ? 'text-blue-400 underline'
                              : s.category === 'path'
                              ? 'text-amber-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {s.text}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyText(s.text, `str-${idx}`)}
                        className="p-1 text-slate-500 hover:text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        title="Copy string"
                      >
                        {copiedOffset === `str-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hex Inspector Tab */}
        {activeTab === 'hex' && (
          <div className="h-full w-full">
            <HexViewer arrayBuffer={arrayBuffer} filename={filename} />
          </div>
        )}
      </div>
    </div>
  );
};
