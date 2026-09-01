/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Table, Search, Download, Copy, BarChart2, Check, ArrowUpDown } from 'lucide-react';

interface ExcelViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({ arrayBuffer, textContent, filename }) => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [tableData, setTableData] = useState<any[][]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      setLoading(true);
      let wb: XLSX.WorkBook;

      if (arrayBuffer) {
        wb = XLSX.read(arrayBuffer, { type: 'array' });
      } else if (textContent) {
        wb = XLSX.read(textContent, { type: 'string' });
      } else {
        setLoading(false);
        return;
      }

      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      if (wb.SheetNames.length > 0) {
        setActiveSheet(wb.SheetNames[0]);
      }
    } catch (err) {
      console.error('Error loading spreadsheet:', err);
    } finally {
      setLoading(false);
    }
  }, [arrayBuffer, textContent]);

  useEffect(() => {
    if (!workbook || !activeSheet) return;
    const worksheet = workbook.Sheets[activeSheet];
    if (worksheet) {
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      setTableData(json);
      setSortCol(null);
    }
  }, [workbook, activeSheet]);

  const headers = useMemo(() => {
    if (tableData.length === 0) return [];
    return tableData[0] || [];
  }, [tableData]);

  const rows = useMemo(() => {
    if (tableData.length <= 1) return [];
    let r = tableData.slice(1);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      r = r.filter(row => row.some(cell => String(cell).toLowerCase().includes(term)));
    }

    if (sortCol !== null) {
      r = [...r].sort((a, b) => {
        const valA = a[sortCol] ?? '';
        const valB = b[sortCol] ?? '';
        const numA = Number(valA);
        const numB = Number(valB);

        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return r;
  }, [tableData, searchTerm, sortCol, sortAsc]);

  // Statistics calculation for numeric columns
  const stats = useMemo(() => {
    if (rows.length === 0 || headers.length === 0) return null;
    const colStats: { colIndex: number; header: string; sum: number; avg: number; count: number }[] = [];

    headers.forEach((h, colIdx) => {
      let sum = 0;
      let count = 0;
      rows.forEach(r => {
        const val = Number(r[colIdx]);
        if (!isNaN(val) && r[colIdx] !== '' && r[colIdx] !== null) {
          sum += val;
          count++;
        }
      });
      if (count > 0) {
        colStats.push({ colIndex: colIdx, header: String(h), sum, avg: sum / count, count });
      }
    });

    return colStats;
  }, [headers, rows]);

  const handleCopyTable = () => {
    const text = tableData.map(r => r.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!workbook || !activeSheet) return;
    const worksheet = workbook.Sheets[activeSheet];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${activeSheet}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            <Table className="w-3.5 h-3.5" />
            Excel Data Grid Viewer
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Rows: <strong className="text-slate-800 dark:text-slate-200">{rows.length.toLocaleString()}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-32 md:w-44 text-xs"
            />
          </div>

          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded text-xs border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Data'}
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Sheet Tabs Header */}
      {sheetNames.length > 1 && (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-200/60 dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium mr-2">Worksheets:</span>
          {sheetNames.map(sheet => (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeSheet === sheet
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {sheet}
            </button>
          ))}
        </div>
      )}

      {/* Numerical Stats Bar */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <BarChart2 className="w-3.5 h-3.5" />
            Column Metrics:
          </div>
          {stats.slice(0, 4).map(st => (
            <div key={st.colIndex} className="bg-white dark:bg-slate-800/80 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700/60 flex items-center gap-2 whitespace-nowrap shadow-sm">
              <span className="font-semibold text-emerald-600 dark:text-emerald-300">{st.header}:</span>
              <span>Sum: <strong className="text-slate-900 dark:text-white">{st.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
              <span className="text-slate-400">|</span>
              <span>Avg: <strong className="text-slate-700 dark:text-slate-200">{st.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
            </div>
          ))}
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Rendering spreadsheet grid...
          </div>
        ) : headers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Empty or unreadable spreadsheet worksheet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2 border-r border-slate-200 dark:border-slate-700 w-12 text-center text-slate-400 font-normal">#</th>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      onClick={() => {
                        if (sortCol === i) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortCol(i);
                          setSortAsc(true);
                        }
                      }}
                      className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/70 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{String(h || `Col ${i + 1}`)}</span>
                        <ArrowUpDown className={`w-3 h-3 ${sortCol === i ? 'text-emerald-500 dark:text-emerald-400 font-bold' : 'text-slate-400'}`} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/40">
                      {rIdx + 1}
                    </td>
                    {headers.map((_, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-r border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 whitespace-nowrap truncate max-w-xs">
                        {String(row[cIdx] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
