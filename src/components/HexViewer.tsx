/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Download, Eye, FileText } from 'lucide-react';
import { formatFileSize } from '../services/fileDetector';

interface HexViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

export const HexViewer: React.FC<HexViewerProps> = ({ arrayBuffer, textContent, filename }) => {
  const [pageSize, setPageSize] = useState<number>(256); // bytes per page view
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedByteIndex, setSelectedByteIndex] = useState<number | null>(null);

  const bytes = useMemo(() => {
    if (arrayBuffer) {
      return new Uint8Array(arrayBuffer);
    }
    if (textContent) {
      const encoder = new TextEncoder();
      return encoder.encode(textContent);
    }
    return new Uint8Array(0);
  }, [arrayBuffer, textContent]);

  const totalPages = Math.ceil(bytes.length / pageSize) || 1;

  const currentBytes = useMemo(() => {
    const start = currentPage * pageSize;
    const end = Math.min(start + pageSize, bytes.length);
    return bytes.slice(start, end);
  }, [bytes, currentPage, pageSize]);

  // Group into 16 bytes per row
  const rows = useMemo(() => {
    const r: { offset: number; hex: string[]; ascii: string[] }[] = [];
    const baseOffset = currentPage * pageSize;

    for (let i = 0; i < currentBytes.length; i += 16) {
      const slice = currentBytes.slice(i, i + 16);
      const hex: string[] = [];
      const ascii: string[] = [];

      slice.forEach(byte => {
        hex.push(byte.toString(16).padStart(2, '0').toUpperCase());
        // Printable ASCII (32-126)
        if (byte >= 32 && byte <= 126) {
          ascii.push(String.fromCharCode(byte));
        } else {
          ascii.push('.');
        }
      });

      r.push({
        offset: baseOffset + i,
        hex,
        ascii
      });
    }

    return r;
  }, [currentBytes, currentPage, pageSize]);

  const handleExportHex = () => {
    let output = `Hex Dump of ${filename} (${bytes.length} bytes)\n`;
    output += `Offset   00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  |ASCII|\n`;
    output += `-------------------------------------------------------------------\n`;

    for (let i = 0; i < Math.min(bytes.length, 4096); i += 16) {
      const slice = bytes.slice(i, i + 16);
      const hex = Array.from(slice).map(b => b.toString(16).padStart(2, '0').toUpperCase());
      while (hex.length < 16) hex.push('  ');
      
      const ascii = Array.from(slice).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
      
      const offsetHex = i.toString(16).padStart(8, '0').toUpperCase();
      const first8 = hex.slice(0, 8).join(' ');
      const last8 = hex.slice(8, 16).join(' ');
      output += `${offsetHex}  ${first8}  ${last8}  |${ascii}|\n`;
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.hex.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-900 text-slate-100 font-mono text-sm overflow-hidden select-text">
      {/* Hex Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-800/80 border-b border-slate-700 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
            <Eye className="w-3.5 h-3.5" />
            Hex Byte Inspector
          </div>
          <span className="text-xs text-slate-400">
            Size: <strong className="text-slate-200">{formatFileSize(bytes.length)}</strong> ({bytes.length.toLocaleString()} bytes)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 px-2 py-1 rounded border border-slate-700 text-xs gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hex/ASCII..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-28 md:w-36 text-xs"
            />
          </div>

          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs px-2 py-1 rounded"
          >
            <option value={256}>256 B / page</option>
            <option value={512}>512 B / page</option>
            <option value={1024}>1 KB / page</option>
            <option value={4096}>4 KB / page</option>
          </select>

          <button
            onClick={handleExportHex}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors"
            title="Export Hex Dump text"
          >
            <Download className="w-3.5 h-3.5" />
            Export Hex
          </button>
        </div>
      </div>

      {/* Hex Grid Content */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto p-4 space-y-1">
        <div className="grid grid-cols-[100px_1fr_200px] gap-4 font-bold border-b border-slate-800 pb-2 text-xs text-slate-400">
          <div>OFFSET</div>
          <div className="grid grid-cols-16 gap-1 text-center">
            {['00','01','02','03','04','05','06','07','08','09','0A','0B','0C','0D','0E','0F'].map((h, i) => (
              <span key={i} className={i === 8 ? 'pl-1 border-l border-slate-700' : ''}>{h}</span>
            ))}
          </div>
          <div>ASCII DECODE</div>
        </div>

        {rows.map((row) => (
          <div key={row.offset} className="grid grid-cols-[100px_1fr_200px] gap-4 items-center py-1 hover:bg-slate-800/50 rounded px-1 transition-colors">
            {/* Offset */}
            <div className="text-blue-400 text-xs font-mono">
              {row.offset.toString(16).padStart(8, '0').toUpperCase()}
            </div>

            {/* Hex Bytes */}
            <div className="grid grid-cols-16 gap-1 text-center text-xs">
              {row.hex.map((h, i) => {
                const byteIdx = row.offset + i;
                const isSelected = selectedByteIndex === byteIdx;
                const isMatch = searchTerm && (h.toLowerCase().includes(searchTerm.toLowerCase()) || row.ascii[i]?.toLowerCase().includes(searchTerm.toLowerCase()));

                return (
                  <span
                    key={i}
                    onClick={() => setSelectedByteIndex(byteIdx)}
                    className={`cursor-pointer rounded px-0.5 transition-colors ${
                      i === 8 ? 'border-l border-slate-700 pl-1' : ''
                    } ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : isMatch
                        ? 'bg-amber-500/30 text-amber-300 font-bold ring-1 ring-amber-500'
                        : h === '00'
                        ? 'text-slate-600'
                        : 'text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {h}
                  </span>
                );
              })}
              {/* Fill remaining empty columns if row < 16 */}
              {Array.from({ length: 16 - row.hex.length }).map((_, idx) => (
                <span key={idx} className="text-slate-700">..</span>
              ))}
            </div>

            {/* ASCII Column */}
            <div className="text-xs text-emerald-400 font-mono tracking-widest bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/50 truncate">
              {row.ascii.map((char, i) => {
                const byteIdx = row.offset + i;
                const isSelected = selectedByteIndex === byteIdx;
                return (
                  <span
                    key={i}
                    onClick={() => setSelectedByteIndex(byteIdx)}
                    className={`cursor-pointer ${
                      isSelected ? 'bg-blue-600 text-white font-bold px-0.5 rounded' : char === '.' ? 'text-slate-600' : 'text-emerald-300'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination & Selected Byte Info Footer */}
      <div className="flex items-center justify-between p-2.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
        <div>
          {selectedByteIndex !== null ? (
            <span className="text-blue-300">
              Selected Byte Offset: <strong>0x{selectedByteIndex.toString(16).toUpperCase()}</strong> ({selectedByteIndex}) | Val: <strong>{bytes[selectedByteIndex]}</strong> (0x{bytes[selectedByteIndex]?.toString(16).padStart(2,'0').toUpperCase()})
            </span>
          ) : (
            <span>Click any byte to view decimal value & character code</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200"
          >
            Prev
          </button>
          <span>
            Page <strong className="text-slate-200">{currentPage + 1}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
