/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Google Sheets Inspired Spreadsheet Viewer (Material Design 3)
 */

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Table,
  Search,
  Download,
  Copy,
  BarChart2,
  Check,
  ArrowUpDown,
  Plus,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
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
    } catch (err: any) {
      console.error('Error loading spreadsheet:', err);
      setError(err?.message || 'Unable to parse spreadsheet contents. The file may be corrupt or encrypted.');
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
      setSelectedCell({ r: 0, c: 0 });
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

  // Statistics for numeric columns
  const stats = useMemo(() => {
    if (rows.length === 0 || headers.length === 0) return [];

    const result: { header: string; sum: number; avg: number; colIndex: number }[] = [];

    headers.forEach((h, colIndex) => {
      let numericCount = 0;
      let sum = 0;

      rows.forEach(row => {
        const val = Number(row[colIndex]);
        if (!isNaN(val) && row[colIndex] !== '' && row[colIndex] !== null) {
          sum += val;
          numericCount++;
        }
      });

      if (numericCount > 0 && numericCount >= rows.length * 0.4) {
        result.push({
          header: String(h || `Col ${colIndex + 1}`),
          sum,
          avg: sum / numericCount,
          colIndex
        });
      }
    });

    return result;
  }, [rows, headers]);

  const handleCopyTable = () => {
    if (tableData.length === 0) return;
    const tsv = tableData.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tsv).catch(() => {});
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

  // Convert column index to Excel column name (0 -> A, 1 -> B, 26 -> AA)
  const getColLetter = (colIndex: number) => {
    let temp = colIndex;
    let letter = '';
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const activeCellCoord = `${getColLetter(selectedCell.c)}${selectedCell.r + 1}`;
  const activeCellValue =
    selectedCell.r === 0
      ? headers[selectedCell.c] ?? ''
      : rows[selectedCell.r - 1]?.[selectedCell.c] ?? '';

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-background text-foreground select-none overflow-hidden transition-colors font-sans">
      {/* Spreadsheet Action Sub-bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-card border-b border-border/80 gap-2 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sheet</span>
          </span>
          <span aria-hidden="true" className="text-border">·</span>
          <span>Rows: <strong className="text-foreground tabular-nums font-mono font-normal">{rows.length.toLocaleString()}</strong></span>
          <span aria-hidden="true" className="text-border">·</span>
          <span>Cols: <strong className="text-foreground tabular-nums font-mono font-normal">{headers.length}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Table Input */}
          <div className="flex items-center bg-secondary/80 px-2.5 py-1 rounded-md text-xs text-foreground border border-border/60">
            <Search className="w-3 h-3 text-muted-foreground mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search sheet..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none w-28 sm:w-36 text-xs"
            />
          </div>

          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary text-foreground px-2.5 py-1 rounded-md text-xs font-medium border border-border/60 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-primary hover:opacity-90 text-primary-foreground px-3 py-1 rounded-md text-xs font-medium transition-opacity cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Signature Formula Bar */}
      <div className="flex items-center px-3 py-1 bg-card border-b border-border/80 text-xs text-foreground gap-2 shrink-0">
        {/* Cell Coordinate Box (e.g. A1) */}
        <div className="w-14 px-2 py-0.5 rounded bg-secondary/60 text-center font-mono font-semibold text-foreground text-xs border border-border/60 shrink-0">
          {activeCellCoord}
        </div>

        {/* fx Glyph */}
        <div className="font-serif italic font-bold text-muted-foreground text-xs select-none shrink-0 px-1">
          fx
        </div>

        <div className="h-4 w-px bg-border/80 shrink-0" />

        {/* Formula / Cell Value Display Input */}
        <div className="flex-1 px-2 py-0.5 rounded bg-background border border-border/60 text-xs font-mono text-foreground truncate min-h-[24px] flex items-center">
          {String(activeCellValue)}
        </div>
      </div>

      {/* Numerical Stats Summary Bar (If numeric columns present) */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#188038]/5 dark:bg-[#188038]/10 border-b border-[#188038]/20 text-xs text-foreground overflow-x-auto shrink-0 no-scrollbar">
          <div className="flex items-center gap-1 text-[#188038] dark:text-[#81C995] font-semibold text-xs shrink-0">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Metrics:</span>
          </div>
          {stats.slice(0, 4).map(st => (
            <div
              key={st.colIndex}
              className="bg-card px-2.5 py-0.5 rounded-full border border-border/80 flex items-center gap-2 whitespace-nowrap shadow-2xs text-[11px]"
            >
              <span className="font-semibold text-[#188038] dark:text-[#81C995]">{st.header}:</span>
              <span>Sum: <strong className="font-mono tabular-nums">{st.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
              <span className="text-border">|</span>
              <span>Avg: <strong className="font-mono tabular-nums">{st.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
            </div>
          ))}
        </div>
      )}

      {/* Google Sheets Grid Canvas */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-card relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs gap-2">
            <div className="w-5 h-5 border-2 border-[#188038] border-t-transparent rounded-full animate-spin" />
            <span>Rendering Google Sheets grid...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <div className="text-destructive font-semibold text-sm">Unable to parse spreadsheet</div>
            <div className="text-xs text-muted-foreground max-w-md">{error}</div>
          </div>
        ) : headers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Empty or unreadable spreadsheet worksheet.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-sans border-r border-b border-[#DADCE0] dark:border-[#3C4043]">
            {/* Google Sheets Column Letters (A, B, C, D...) */}
            <thead className="sticky top-0 z-20 bg-[#F8F9FA] dark:bg-[#28292A]">
              <tr className="border-b border-[#DADCE0] dark:border-[#3C4043] text-muted-foreground text-[11px]">
                {/* Top-left corner box */}
                <th className="p-1.5 w-12 text-center border-r border-[#DADCE0] dark:border-[#3C4043] font-normal select-none bg-[#F1F3F4] dark:bg-[#202124]">
                  ⌗
                </th>
                {headers.map((_, i) => (
                  <th
                    key={i}
                    className="p-1 text-center font-mono font-semibold text-muted-foreground border-r border-[#DADCE0] dark:border-[#3C4043] select-none min-w-[120px]"
                  >
                    {getColLetter(i)}
                  </th>
                ))}
              </tr>

              {/* Real Header Row with Sorting */}
              <tr className="border-b border-[#DADCE0] dark:border-[#3C4043] bg-card text-foreground font-semibold">
                <th className="p-2 w-12 text-center border-r border-[#DADCE0] dark:border-[#3C4043] font-mono text-muted-foreground select-none bg-[#F8F9FA] dark:bg-[#28292A]">
                  1
                </th>
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
                      setSelectedCell({ r: 0, c: i });
                    }}
                    className={`p-2 border-r border-[#DADCE0] dark:border-[#3C4043] cursor-pointer hover:bg-muted/70 transition-colors whitespace-nowrap min-w-[120px] ${
                      selectedCell.r === 0 && selectedCell.c === i
                        ? 'ring-2 ring-[#188038] ring-inset bg-[#188038]/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate">{String(h || `Col ${i + 1}`)}</span>
                      <ArrowUpDown
                        className={`w-3 h-3 shrink-0 ${
                          sortCol === i ? 'text-[#188038] font-bold' : 'text-muted-foreground/50'
                        }`}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Row Data */}
            <tbody className="divide-y divide-[#DADCE0] dark:divide-[#3C4043] bg-card">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                  {/* Row index number (Google Sheets row gutter) */}
                  <td className="p-1.5 w-12 border-r border-[#DADCE0] dark:border-[#3C4043] text-center text-muted-foreground select-none bg-[#F8F9FA] dark:bg-[#28292A] font-mono text-[11px] tabular-nums">
                    {rIdx + 2}
                  </td>
                  {headers.map((_, cIdx) => {
                    const isSelected = selectedCell.r === rIdx + 1 && selectedCell.c === cIdx;
                    return (
                      <td
                        key={cIdx}
                        onClick={() => setSelectedCell({ r: rIdx + 1, c: cIdx })}
                        className={`p-2 border-r border-[#DADCE0] dark:border-[#3C4043] text-foreground whitespace-nowrap truncate max-w-xs cursor-cell transition-all font-mono text-xs tabular-nums ${
                          isSelected
                            ? 'ring-2 ring-[#188038] ring-inset bg-[#188038]/10'
                            : ''
                        }`}
                      >
                        {String(row[cIdx] ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Google Sheets Bottom Sheet Tabs Bar */}
      {sheetNames.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#F1F3F4] dark:bg-[#1E1F20] border-t border-border/80 text-xs shrink-0 select-none overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1">
            {sheetNames.map(sheet => (
              <button
                key={sheet}
                onClick={() => setActiveSheet(sheet)}
                className={`px-3.5 py-1 text-xs font-sans font-medium transition-all whitespace-nowrap rounded-t cursor-pointer ${
                  activeSheet === sheet
                    ? 'bg-card text-[#188038] dark:text-[#81C995] font-bold border-b-2 border-b-[#188038] shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[#E8EAED] dark:hover:bg-[#282A2C]'
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-sans">
            <span>{sheetNames.length} sheet{sheetNames.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};
