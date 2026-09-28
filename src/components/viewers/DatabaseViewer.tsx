/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Universal In-Browser Database Viewer & SQL Studio
 * Supports: .dbf (dBASE / FoxPro), .mdb / .accdb (MS Access), .sqlite / .db (SQLite 3),
 * .sql / .dump (SQL scripts), .fdb / .gdb (Firebird), .myd / .ibd / .frm (MySQL), .duckdb / .sdf
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Database,
  Table,
  Play,
  Search,
  Code,
  Server,
  Info,
  AlertTriangle,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FileSpreadsheet,
  FileCode2,
  ShieldCheck,
  HardDrive,
  Maximize2,
  Minimize2,
  GripHorizontal,
  GripVertical,
  Trash2,
  ChevronsUpDown,
  Columns,
  Rows,
  History
} from 'lucide-react';
import alasql from 'alasql';
import { getFileExtension } from '../../services/fileDetector';
import { parseUniversalDatabase, ParsedDatabaseResult, ParsedDbTable } from '../../services/dbParser';

interface DatabaseViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  status: 'success' | 'error';
  rowCount?: number;
  timeMs?: string;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ arrayBuffer, textContent = '', filename }) => {
  const ext = getFileExtension(filename).toLowerCase();
  const isSqlScript = ext === 'sql' || ext === 'dump' || ext === 'ddl';
  const isDbf = ext === 'dbf';
  const isAccess = ext === 'mdb' || ext === 'accdb' || ext === 'mde' || ext === 'accde';
  const isSqlite = ['db', 'sqlite', 'sqlite3', 's3db', 'sl3', 'db3'].includes(ext);

  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'schema' | 'metadata' | 'raw'>(
    isSqlScript ? 'query' : 'tables'
  );
  const [dbInstanceId, setDbInstanceId] = useState<string>(
    () => `omni_db_${Math.random().toString(36).substring(2, 8)}`
  );

  // Parsed DB State
  const [dbParseResult, setDbParseResult] = useState<ParsedDatabaseResult | null>(null);
  const [parseLoading, setParseLoading] = useState<boolean>(true);
  const [parseError, setParseError] = useState<string | null>(null);

  // Table Browser State
  const [selectedTableName, setSelectedTableName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // SQL Console State
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: any[][];
    timeMs: string;
    isDml?: boolean;
    message?: string;
  } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [querySuccessMsg, setQuerySuccessMsg] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
  const [copiedDdl, setCopiedDdl] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // SQL Console Sizable Section & Mode State
  const [splitPercent, setSplitPercent] = useState<number>(44); // 44% for Editor, 56% for Output
  const [layoutOrientation, setLayoutOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [consoleSectionFocus, setConsoleSectionFocus] = useState<'split' | 'editor' | 'output'>('split');
  const [isDraggingResizer, setIsDraggingResizer] = useState<boolean>(false);
  const [showSnippets, setShowSnippets] = useState<boolean>(true);
  const [showQueryHistory, setShowQueryHistory] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const sqlConsoleContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Initialize and parse the database
  const initializeDatabase = () => {
    setParseLoading(true);
    setParseError(null);
    const newDbName = `omni_db_${Math.random().toString(36).substring(2, 8)}`;
    setDbInstanceId(newDbName);

    try {
      // 1. Create clean isolated in-memory AlaSQL database
      alasql(`CREATE DATABASE ${newDbName}; USE ${newDbName};`);

      // 2. Parse using universal database parser
      const result = parseUniversalDatabase(arrayBuffer, textContent, filename);
      setDbParseResult(result);

      // 3. Register and seed all extracted tables into AlaSQL
      for (const table of result.tables) {
        // Sanitize table name for SQL syntax
        const safeTableName = table.name.replace(/[^a-zA-Z0-9_]/g, '_');
        const safeCols = table.columns.map((c, i) => {
          const colSafe = c.replace(/[^a-zA-Z0-9_]/g, '_') || `col_${i + 1}`;
          return `${colSafe} STRING`;
        });

        try {
          alasql(`CREATE TABLE IF NOT EXISTS ${safeTableName} (${safeCols.join(', ')});`);

          if (table.rows && table.rows.length > 0) {
            // Bulk insert rows
            const insertObjects = table.rows.map(row => {
              const obj: Record<string, any> = {};
              table.columns.forEach((col, idx) => {
                const colSafe = col.replace(/[^a-zA-Z0-9_]/g, '_') || `col_${idx + 1}`;
                obj[colSafe] = row[idx];
              });
              return obj;
            });
            alasql.tables[safeTableName].data = insertObjects;
          }
        } catch (tblErr: any) {
          console.warn(`[DatabaseViewer] Non-fatal note registering table ${safeTableName}:`, tblErr);
        }
      }

      // 4. Set active selected table
      if (result.tables.length > 0) {
        const firstTable = result.tables[0];
        setSelectedTableName(firstTable.name);
        setSqlQuery(`SELECT * FROM ${firstTable.name.replace(/[^a-zA-Z0-9_]/g, '_')} LIMIT 50;`);
      } else {
        setSqlQuery(`SELECT 1 AS status, 'No tables found' AS message;`);
      }

      setParseLoading(false);
    } catch (err: any) {
      console.error('[DatabaseViewer] Initialization error:', err);
      setParseError(err.message || 'Failed to load and parse database file.');
      setParseLoading(false);
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, [arrayBuffer, textContent, filename]);

  // Current active table object
  const currentTable = useMemo(() => {
    if (!dbParseResult || dbParseResult.tables.length === 0) return null;
    return dbParseResult.tables.find(t => t.name === selectedTableName) || dbParseResult.tables[0];
  }, [dbParseResult, selectedTableName]);

  // Filtered and sorted table rows
  const processedTableRows = useMemo(() => {
    if (!currentTable || !currentTable.rows) return [];
    let rows = [...currentTable.rows];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        r.some(cell => String(cell ?? '').toLowerCase().includes(term))
      );
    }

    // Sort by column
    if (sortColumn) {
      const colIdx = currentTable.columns.indexOf(sortColumn);
      if (colIdx >= 0) {
        rows.sort((a, b) => {
          const valA = a[colIdx];
          const valB = b[colIdx];
          if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
          if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDirection === 'asc' ? valA - valB : valB - valA;
          }
          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
      }
    }

    return rows;
  }, [currentTable, searchTerm, sortColumn, sortDirection]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(processedTableRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedTableRows.slice(start, start + pageSize);
  }, [processedTableRows, page, pageSize]);

  // Reset page on search or table switch
  useEffect(() => {
    setPage(1);
  }, [selectedTableName, searchTerm, pageSize]);

  // Handle column header click for sorting
  const handleHeaderSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  // SQL Console Execution
  const executeQuery = (overrideQuery?: string) => {
    const q = (overrideQuery ?? sqlQuery).trim();
    if (!q) {
      setQueryError('Please enter an SQL statement to run.');
      return;
    }

    setIsExecuting(true);
    setQueryError(null);
    setQuerySuccessMsg(null);
    const startTime = performance.now();

    try {
      alasql(`USE ${dbInstanceId};`);
      const result = alasql(q);
      const timeMs = (performance.now() - startTime).toFixed(1);

      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && result[0] !== null) {
        const columns = Object.keys(result[0]);
        const rows = result.map(item => columns.map(c => item[c]));
        setQueryResult({
          columns,
          rows,
          timeMs,
          isDml: false
        });
        setQuerySuccessMsg(`Executed in ${timeMs} ms — ${rows.length} row${rows.length === 1 ? '' : 's'} returned.`);

        setQueryHistory(prev => [
          {
            id: String(Date.now()),
            query: q,
            timestamp: new Date().toLocaleTimeString(),
            status: 'success',
            rowCount: rows.length,
            timeMs
          },
          ...prev.slice(0, 14)
        ]);
      } else if (Array.isArray(result) && result.length === 0) {
        setQueryResult({
          columns: ['Result'],
          rows: [],
          timeMs,
          isDml: false
        });
        setQuerySuccessMsg(`Query returned 0 rows (${timeMs} ms).`);
      } else {
        const affectedRows = typeof result === 'number' ? result : 1;
        setQueryResult({
          columns: ['Status', 'Details'],
          rows: [['SUCCESS', `Affected: ${affectedRows} row(s)`]],
          timeMs,
          isDml: true,
          message: `Statement executed successfully. Affected: ${affectedRows} row(s).`
        });
        setQuerySuccessMsg(`Statement completed (${timeMs} ms).`);

        setQueryHistory(prev => [
          {
            id: String(Date.now()),
            query: q,
            timestamp: new Date().toLocaleTimeString(),
            status: 'success',
            rowCount: affectedRows,
            timeMs
          },
          ...prev.slice(0, 14)
        ]);
      }
    } catch (err: any) {
      const timeMs = (performance.now() - startTime).toFixed(1);
      setQueryError(err.message || 'SQL execution error.');
      setQueryResult(null);

      setQueryHistory(prev => [
        {
          id: String(Date.now()),
          query: q,
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
          timeMs
        },
        ...prev.slice(0, 14)
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      setSqlQuery(val.substring(0, start) + '  ' + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertSqlSnippet = (snippet: string) => {
    setSqlQuery(prev => {
      if (!prev.trim()) return snippet;
      return `${prev.trim()} ${snippet}`;
    });
  };

  const handleFormatSql = () => {
    if (!sqlQuery) return;
    const keywords = [
      'select', 'from', 'where', 'join', 'left join', 'right join', 'inner join',
      'on', 'group by', 'order by', 'having', 'limit', 'offset', 'insert into',
      'values', 'update', 'set', 'delete from', 'create table', 'drop table',
      'alter table', 'as', 'and', 'or', 'not', 'in', 'is null', 'is not null',
      'like', 'between', 'asc', 'desc', 'count', 'sum', 'avg', 'min', 'max'
    ];
    let formatted = sqlQuery;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw.toUpperCase());
    });
    setSqlQuery(formatted);
  };

  // SQL Console Line Count and Cursor Sync
  const queryLineCount = useMemo(() => {
    return Math.max(1, sqlQuery.split('\n').length);
  }, [sqlQuery]);

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = textareaRef.current.value.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleClearSql = () => {
    setSqlQuery('');
    setCursorPos({ line: 1, col: 1 });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopySql = () => {
    if (!sqlQuery) return;
    navigator.clipboard.writeText(sqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Interactive Sizable Section Resizer for SQL Console (Mouse & Touch)
  const handleStartResizing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDraggingResizer(true);
    setConsoleSectionFocus('split');

    const updatePosition = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || !sqlConsoleContainerRef.current) return;
      const rect = sqlConsoleContainerRef.current.getBoundingClientRect();
      if (layoutOrientation === 'vertical') {
        const relativeY = clientY - rect.top;
        const percent = (relativeY / rect.height) * 100;
        const clamped = Math.max(15, Math.min(85, percent));
        setSplitPercent(Math.round(clamped));
      } else {
        const relativeX = clientX - rect.left;
        const percent = (relativeX / rect.width) * 100;
        const clamped = Math.max(15, Math.min(85, percent));
        setSplitPercent(Math.round(clamped));
      }
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 1) {
        updatePosition(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
      setIsDraggingResizer(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = layoutOrientation === 'vertical' ? 'row-resize' : 'col-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  // Export handlers
  const handleExportTableCsv = () => {
    if (!currentTable || !currentTable.rows || currentTable.rows.length === 0) return;
    const header = currentTable.columns.join(',');
    const rows = currentTable.rows.map(r =>
      r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTableJson = () => {
    if (!currentTable || !currentTable.rows || currentTable.rows.length === 0) return;
    const jsonData = currentTable.rows.map(row => {
      const obj: Record<string, any> = {};
      currentTable.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportQueryCsv = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const header = queryResult.columns.join(',');
    const rows = queryResult.rows.map(r =>
      r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportQueryJson = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const jsonData = queryResult.rows.map(row => {
      const obj: Record<string, any> = {};
      queryResult.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyQueryOutput = () => {
    if (!queryResult) return;
    const header = queryResult.columns.join('\t');
    const rows = queryResult.rows.map(r => r.join('\t'));
    navigator.clipboard.writeText([header, ...rows].join('\n'));
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleCopyDdl = (tableName: string, ddl: string) => {
    navigator.clipboard.writeText(ddl);
    setCopiedDdl(tableName);
    setTimeout(() => setCopiedDdl(null), 2000);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-50 dark:bg-[#070c14] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-white dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800/80 gap-2 shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/20 shrink-0">
            <Database className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {dbParseResult?.formatDescription || (isDbf ? 'dBASE / FoxPro (.dbf)' : isAccess ? 'MS Access DB (.mdb)' : isSqlite ? 'SQLite DB (.db)' : 'Database Viewer')}
            </span>
          </div>
          {dbParseResult && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 hidden xs:inline-block">
              {dbParseResult.tables.length} table{dbParseResult.tables.length === 1 ? '' : 's'} &bull;{' '}
              {dbParseResult.tables.reduce((sum, t) => sum + t.rowCount, 0)} total records
            </span>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table Browser</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('query');
              if (!queryResult && !queryError) {
                executeQuery();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'query'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>SQL Console</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Schema &amp; DDL</span>
            <span className="sm:hidden">Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'metadata'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
          </button>

          {textContent && isSqlScript && (
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          )}

          <button
            onClick={initializeDatabase}
            title="Reload database and re-index tables"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {parseLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Parsing and indexing database structure...</p>
          </div>
        ) : parseError ? (
          <div className="p-6 m-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Database Parse Notice</span>
            </div>
            <p className="text-xs font-mono">{parseError}</p>
          </div>
        ) : (
          <>
            {/* TAB 1: Table Browser */}
            {activeTab === 'tables' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Tables Selection Ribbon */}
                {dbParseResult && dbParseResult.tables.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-1">
                        Tables:
                      </span>
                      {dbParseResult.tables.map(t => (
                        <button
                          key={t.name}
                          onClick={() => setSelectedTableName(t.name)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                            selectedTableName === t.name
                              ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Table className="w-3 h-3" />
                          <span>{t.name}</span>
                          <span
                            className={`text-[10px] px-1 rounded ${
                              selectedTableName === t.name
                                ? 'bg-emerald-700/60 text-emerald-100'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {t.rowCount}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Table Actions (Export / Query) */}
                    {currentTable && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setSqlQuery(`SELECT * FROM ${currentTable.name.replace(/[^a-zA-Z0-9_]/g, '_')} LIMIT 50;`);
                            setActiveTab('query');
                            setTimeout(() => executeQuery(`SELECT * FROM ${currentTable.name.replace(/[^a-zA-Z0-9_]/g, '_')} LIMIT 50;`), 50);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium transition-colors cursor-pointer border border-emerald-500/20"
                          title="Open this table in SQL console"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Query Table</span>
                        </button>
                        <button
                          onClick={handleExportTableCsv}
                          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Export table records as CSV"
                        >
                          <Download className="w-3 h-3 text-emerald-500" />
                          <span>CSV</span>
                        </button>
                        <button
                          onClick={handleExportTableJson}
                          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Export table records as JSON"
                        >
                          <Download className="w-3 h-3 text-blue-500" />
                          <span>JSON</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-white dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
                  <div className="relative flex-1 max-w-sm min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder={`Search in ${currentTable?.name || 'table'}...`}
                      className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Pagination Info & Controls */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Showing {processedTableRows.length > 0 ? (page - 1) * pageSize + 1 : 0}-
                      {Math.min(page * pageSize, processedTableRows.length)} of {processedTableRows.length} rows
                    </span>

                    <select
                      value={pageSize}
                      onChange={e => setPageSize(Number(e.target.value))}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                      <option value={500}>500 / page</option>
                    </select>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setPage(1)}
                        disabled={page <= 1}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="First Page"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1.5 py-0.5 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 rounded">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Next Page"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPage(totalPages)}
                        disabled={page >= totalPages}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Last Page"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Grid Table */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#070c14] relative">
                  {currentTable && currentTable.columns.length > 0 ? (
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead className="sticky top-0 bg-slate-100 dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800 z-10 shadow-2xs">
                        <tr>
                          <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 w-12 text-center text-slate-400 text-[10px] font-sans">
                            #
                          </th>
                          {currentTable.columns.map(col => {
                            const isSorted = sortColumn === col;
                            const typeDesc = currentTable.columnTypes?.[col];
                            return (
                              <th
                                key={col}
                                onClick={() => handleHeaderSort(col)}
                                className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors select-none group"
                                title={typeDesc ? `${col} (${typeDesc}) - Click to sort` : `${col} - Click to sort`}
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-1 truncate">
                                    <span>{col}</span>
                                    {typeDesc && (
                                      <span className="text-[9px] font-sans font-normal text-slate-400 dark:text-slate-500 uppercase">
                                        {typeDesc.split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                    {isSorted ? (
                                      sortDirection === 'asc' ? (
                                        <ArrowUp className="w-3 h-3 text-emerald-500" />
                                      ) : (
                                        <ArrowDown className="w-3 h-3 text-emerald-500" />
                                      )
                                    ) : (
                                      <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                                    )}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                        {paginatedRows.length > 0 ? (
                          paginatedRows.map((row, rIdx) => {
                            const globalRowIndex = (page - 1) * pageSize + rIdx + 1;
                            return (
                              <tr
                                key={rIdx}
                                className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                              >
                                <td className="p-2 border-r border-slate-200/70 dark:border-slate-800/70 text-center text-slate-400 text-[10px] bg-slate-50/50 dark:bg-slate-950/30 select-none">
                                  {globalRowIndex}
                                </td>
                                {currentTable.columns.map((_, cIdx) => {
                                  const val = row[cIdx];
                                  return (
                                    <td
                                      key={cIdx}
                                      className="p-2 border-r border-slate-200/70 dark:border-slate-800/70 text-slate-800 dark:text-slate-200 truncate max-w-xs"
                                      title={val !== null && val !== undefined ? String(val) : 'NULL'}
                                    >
                                      {val === null || val === undefined ? (
                                        <span className="text-slate-400/60 dark:text-slate-600 italic font-sans text-[10px]">
                                          NULL
                                        </span>
                                      ) : typeof val === 'boolean' ? (
                                        <span
                                          className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                            val
                                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                          }`}
                                        >
                                          {val ? 'TRUE' : 'FALSE'}
                                        </span>
                                      ) : (
                                        <span>{String(val)}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={currentTable.columns.length + 1}
                              className="p-8 text-center text-slate-400"
                            >
                              <p className="text-xs font-sans">
                                {searchTerm ? `No rows match the search query "${searchTerm}".` : 'This table is empty.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                      <Table className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-xs font-sans">No tables or columns loaded.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SQL Console - Sizeable Sections Architecture */}
            {activeTab === 'query' && (
              <div
                ref={sqlConsoleContainerRef}
                className={`flex-1 min-h-0 h-full p-2 sm:p-3 bg-slate-100/70 dark:bg-[#070c14] overflow-hidden flex ${
                  layoutOrientation === 'vertical' ? 'flex-col' : 'flex-col md:flex-row'
                } gap-2 relative`}
              >
                {/* Minimized Editor Dock (when Output is Maximized) */}
                {consoleSectionFocus === 'output' && (
                  <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <Code className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200 shrink-0">
                        In-Memory SQL Console (Docked)
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] truncate max-w-sm hidden sm:inline">
                        {sqlQuery.replace(/\s+/g, ' ').slice(0, 50)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => executeQuery()}
                        disabled={isExecuting}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isExecuting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>Run</span>
                      </button>
                      <button
                        onClick={() => setConsoleSectionFocus('split')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer border border-emerald-500/20"
                        title="Restore split view"
                      >
                        <Minimize2 className="w-3 h-3" />
                        <span>Restore Split</span>
                      </button>
                      <button
                        onClick={() => setConsoleSectionFocus('editor')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer border border-slate-200 dark:border-slate-700"
                        title="Expand SQL Editor"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Maximize Editor</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SQL Editor Section (Rendered in Split or Editor-Maximized mode) */}
                {consoleSectionFocus !== 'output' && (
                  <div
                    style={
                      consoleSectionFocus === 'editor'
                        ? { flex: '1 1 0%', height: '100%' }
                        : layoutOrientation === 'vertical'
                        ? { height: `calc(${splitPercent}% - 14px)` }
                        : { width: `calc(${splitPercent}% - 10px)` }
                    }
                    className={`bg-white dark:bg-[#0c121e] rounded-xl border border-slate-200 dark:border-slate-800/90 shadow-xs overflow-hidden flex flex-col transition-[height,width] duration-75 ${
                      layoutOrientation === 'vertical' ? 'w-full min-h-[140px]' : 'h-full min-w-[260px]'
                    } ${consoleSectionFocus === 'editor' ? 'ring-2 ring-emerald-500/30' : ''}`}
                  >
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-100/80 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Code className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                          In-Memory SQL Console
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                          AlaSQL Engine
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/60 px-1.5 py-0.2 rounded">
                          {queryLineCount} {queryLineCount === 1 ? 'line' : 'lines'} &bull; {sqlQuery.length} chars
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hidden md:inline">
                          Ln {cursorPos.line}, Col {cursorPos.col}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Orientation Toggle (Stacked vs Side-by-Side) */}
                        <button
                          onClick={() => setLayoutOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
                          className="hidden md:flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title={layoutOrientation === 'vertical' ? 'Switch to side-by-side horizontal split' : 'Switch to stacked vertical split'}
                        >
                          {layoutOrientation === 'vertical' ? (
                            <>
                              <Columns className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden lg:inline text-[11px]">Side-by-Side</span>
                            </>
                          ) : (
                            <>
                              <Rows className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden lg:inline text-[11px]">Stacked</span>
                            </>
                          )}
                        </button>

                        {/* Snippets Bar Toggle */}
                        <button
                          onClick={() => setShowSnippets(prev => !prev)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                            showSnippets
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                          title="Toggle SQL snippets & table name shortcuts"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden sm:inline text-[11px]">Snippets</span>
                        </button>

                        {/* Maximize / Restore Editor Section */}
                        <button
                          onClick={() => setConsoleSectionFocus(prev => prev === 'editor' ? 'split' : 'editor')}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                            consoleSectionFocus === 'editor'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                          title={consoleSectionFocus === 'editor' ? 'Restore split layout' : 'Maximize SQL editor (100% space)'}
                        >
                          {consoleSectionFocus === 'editor' ? (
                            <>
                              <Minimize2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Restore</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Maximize</span>
                            </>
                          )}
                        </button>

                        {/* Format SQL */}
                        <button
                          onClick={handleFormatSql}
                          className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Uppercase standard SQL keywords"
                        >
                          <span className="text-[11px]">Format</span>
                        </button>

                        {/* Copy SQL */}
                        <button
                          onClick={handleCopySql}
                          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Copy SQL query to clipboard"
                        >
                          {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span className="hidden sm:inline text-[11px]">{copiedSql ? 'Copied' : 'Copy'}</span>
                        </button>

                        {/* Clear SQL */}
                        <button
                          onClick={handleClearSql}
                          className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                          title="Clear query editor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Run Query */}
                        <button
                          onClick={() => executeQuery()}
                          disabled={isExecuting}
                          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isExecuting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span className="text-[11px]">Run (Ctrl+Enter)</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Syntax Snippets & Table Insertion Chips (Collapsible) */}
                    {showSnippets && (
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-mono text-slate-500 no-scrollbar shrink-0">
                        <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold mr-0.5 shrink-0">
                          Keywords:
                        </span>
                        {['SELECT * FROM', 'WHERE', 'COUNT(*)', 'GROUP BY', 'ORDER BY DESC', 'LIMIT 25', 'INNER JOIN'].map(
                          snip => (
                            <button
                              key={snip}
                              onClick={() => insertSqlSnippet(snip)}
                              className="bg-white dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer shrink-0"
                            >
                              {snip}
                            </button>
                          )
                        )}

                        {dbParseResult && dbParseResult.tables.length > 0 && (
                          <>
                            <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold ml-2 mr-0.5 shrink-0">
                              Tables:
                            </span>
                            {dbParseResult.tables.map(t => (
                              <button
                                key={t.name}
                                onClick={() => insertSqlSnippet(t.name.replace(/[^a-zA-Z0-9_]/g, '_'))}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer shrink-0"
                                title={`Insert table "${t.name}" into query`}
                              >
                                📁 {t.name}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {/* Textarea Editor with Synchronized Line Numbers */}
                    <div className="relative flex-1 min-h-0 flex bg-slate-950 font-mono text-xs sm:text-sm w-full overflow-hidden">
                      {/* Synchronized Line Numbers Gutter */}
                      <div
                        ref={lineNumbersRef}
                        className="w-12 pt-3 pb-8 bg-slate-900/90 border-r border-slate-800 text-slate-500 select-none font-mono text-xs overflow-hidden shrink-0"
                      >
                        {Array.from({ length: Math.max(queryLineCount + 15, 25) }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-5 leading-5 text-right pr-2.5 transition-colors ${
                              idx + 1 === cursorPos.line
                                ? 'text-emerald-400 font-bold bg-emerald-500/15'
                                : idx < queryLineCount
                                ? 'text-slate-500'
                                : 'text-slate-800'
                            }`}
                          >
                            {idx < queryLineCount ? idx + 1 : ''}
                          </div>
                        ))}
                      </div>

                      {/* Code Textarea */}
                      <textarea
                        ref={textareaRef}
                        value={sqlQuery}
                        onChange={e => {
                          setSqlQuery(e.target.value);
                          updateCursorPosition();
                        }}
                        onKeyDown={handleKeyDown}
                        onKeyUp={updateCursorPosition}
                        onClick={updateCursorPosition}
                        onSelect={updateCursorPosition}
                        onScroll={handleEditorScroll}
                        className="flex-1 p-3 pt-3 pb-8 bg-slate-950 text-emerald-300 font-mono text-xs sm:text-sm leading-5 focus:outline-none resize-none w-full caret-emerald-400 placeholder:text-slate-600 overflow-y-auto"
                        placeholder="-- Enter SQL query here (e.g. SELECT * FROM table_name LIMIT 25;)&#10;-- Press Ctrl+Enter to execute"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                )}

                {/* Sizable Section Divider Bar (Rendered when in Split Mode) */}
                {consoleSectionFocus === 'split' && (
                  layoutOrientation === 'vertical' ? (
                    /* Horizontal Draggable Divider for Stacked Layout */
                    <div
                      onMouseDown={handleStartResizing}
                      onTouchStart={handleStartResizing}
                      title="Drag to resize SQL Console and Results sections"
                      className={`h-7 shrink-0 bg-slate-200/90 dark:bg-slate-800/90 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/15 rounded-lg flex items-center justify-between px-3 cursor-row-resize select-none border border-slate-300/80 dark:border-slate-700/80 transition-colors group ${
                        isDraggingResizer ? 'ring-2 ring-emerald-500 bg-emerald-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <GripHorizontal className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                          Size Sections:
                        </span>
                        <span className="bg-slate-300/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
                          {splitPercent}% Editor &bull; {100 - splitPercent}% Results
                        </span>
                      </div>

                      {/* Split Presets */}
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-slate-400 mr-1 hidden md:inline">Presets:</span>
                        {[
                          { label: '25 : 75', percent: 25, title: 'Large Results (25% Editor / 75% Results)' },
                          { label: '44 : 56', percent: 44, title: 'Balanced (44% Editor / 56% Results)' },
                          { label: '70 : 30', percent: 70, title: 'Large Editor (70% Editor / 30% Results)' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSplitPercent(p.percent);
                            }}
                            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                              splitPercent === p.percent
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs'
                                : 'bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                            title={p.title}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {/* Section Maximize Buttons */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setConsoleSectionFocus('editor');
                          }}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-500 border border-slate-300 dark:border-slate-600 cursor-pointer hidden xs:inline"
                          title="Maximize SQL Editor (100% space)"
                        >
                          Full Editor
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setConsoleSectionFocus('output');
                          }}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-500 border border-slate-300 dark:border-slate-600 cursor-pointer hidden xs:inline"
                          title="Maximize Results (100% space)"
                        >
                          Full Output
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Vertical Draggable Divider for Side-by-Side Layout */
                    <div
                      onMouseDown={handleStartResizing}
                      onTouchStart={handleStartResizing}
                      title="Drag to resize SQL Console and Results sections horizontally"
                      className={`w-4 shrink-0 bg-slate-200/90 dark:bg-slate-800/90 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 rounded-lg flex flex-col items-center justify-center cursor-col-resize select-none border border-slate-300/80 dark:border-slate-700/80 transition-colors group ${
                        isDraggingResizer ? 'ring-2 ring-emerald-500 bg-emerald-500/20' : ''
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  )
                )}

                {/* Minimized Output Dock (when Editor is Maximized) */}
                {consoleSectionFocus === 'editor' && (
                  <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-slate-600 dark:text-slate-400 font-medium">
                        Query Output Docked {queryResult ? `(${queryResult.rows.length} rows, ${queryResult.timeMs}ms)` : '(no query run yet)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setConsoleSectionFocus('split')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer border border-emerald-500/20"
                        title="Restore split view"
                      >
                        <Minimize2 className="w-3 h-3" />
                        <span>Restore Split View</span>
                      </button>
                      <button
                        onClick={() => setConsoleSectionFocus('output')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer border border-slate-200 dark:border-slate-700"
                        title="Expand Query Output"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Show Full Output</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Query Output Grid Section (Rendered in Split or Output-Maximized mode) */}
                {consoleSectionFocus !== 'editor' && (
                  <div
                    style={
                      consoleSectionFocus === 'output'
                        ? { flex: '1 1 0%', height: '100%' }
                        : layoutOrientation === 'vertical'
                        ? { height: `calc(${100 - splitPercent}% - 14px)` }
                        : { width: `calc(${100 - splitPercent}% - 10px)` }
                    }
                    className={`bg-white dark:bg-[#0c121e] rounded-xl border border-slate-200 dark:border-slate-800/90 shadow-xs flex flex-col overflow-hidden transition-[height,width] duration-75 ${
                      layoutOrientation === 'vertical' ? 'w-full min-h-[140px]' : 'h-full min-w-[260px]'
                    } ${consoleSectionFocus === 'output' ? 'ring-2 ring-emerald-500/30' : ''}`}
                  >
                    {/* Output Header Toolbar */}
                    <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-100/80 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <Table className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          Query Output
                        </span>
                        {queryResult && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                            {queryResult.rows.length} rows &bull; {queryResult.columns.length} cols ({queryResult.timeMs} ms)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* History Toggle Button */}
                        {queryHistory.length > 0 && (
                          <button
                            onClick={() => setShowQueryHistory(prev => !prev)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                              showQueryHistory
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                            title="Toggle recent query history"
                          >
                            <History className="w-3 h-3 text-slate-500" />
                            <span className="hidden sm:inline">History</span>
                            <span className="text-[10px] bg-slate-300/80 dark:bg-slate-700 px-1 rounded-full">{queryHistory.length}</span>
                          </button>
                        )}

                        {queryResult && queryResult.rows.length > 0 && (
                          <>
                            <button
                              onClick={handleCopyQueryOutput}
                              className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                              title="Copy query results to clipboard (TSV format)"
                            >
                              {copiedResult ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedResult ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              onClick={handleExportQueryCsv}
                              className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                              title="Export results as CSV"
                            >
                              <Download className="w-3 h-3 text-emerald-500" />
                              <span>CSV</span>
                            </button>
                            <button
                              onClick={handleExportQueryJson}
                              className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                              title="Export results as JSON"
                            >
                              <Download className="w-3 h-3 text-blue-500" />
                              <span>JSON</span>
                            </button>
                          </>
                        )}

                        {/* Maximize / Restore Output Section */}
                        <button
                          onClick={() => setConsoleSectionFocus(prev => prev === 'output' ? 'split' : 'output')}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            consoleSectionFocus === 'output'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                          title={consoleSectionFocus === 'output' ? 'Restore split layout' : 'Maximize query output (100% space)'}
                        >
                          {consoleSectionFocus === 'output' ? (
                            <>
                              <Minimize2 className="w-3 h-3" />
                              <span>Restore</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Maximize</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error Banner */}
                    {queryError && (
                      <div className="p-2.5 mx-3 mt-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs flex items-start gap-2 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <strong className="font-semibold block">Query Execution Error</strong>
                          <p className="font-mono text-[11px] break-words">{queryError}</p>
                        </div>
                      </div>
                    )}

                    {/* Success Banner */}
                    {querySuccessMsg && !queryError && (
                      <div className="p-2 mx-3 mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 shrink-0">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="font-mono text-[11px]">{querySuccessMsg}</span>
                      </div>
                    )}

                    {/* Query History Drawer */}
                    {showQueryHistory && queryHistory.length > 0 && (
                      <div className="p-2.5 mx-3 mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs shrink-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                            Recent Query History (Click to re-run)
                          </span>
                          <button
                            onClick={() => setShowQueryHistory(false)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            Hide
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {queryHistory.slice(0, 8).map(h => (
                            <button
                              key={h.id}
                              onClick={() => {
                                setSqlQuery(h.query);
                                executeQuery(h.query);
                              }}
                              className="text-left p-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 rounded-md text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span className={h.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>&bull;</span>
                              <span className="truncate max-w-[220px]">{h.query}</span>
                              <span className="text-[10px] text-slate-400">({h.timeMs}ms)</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results Table Grid */}
                    <div className="flex-1 min-h-0 overflow-auto p-2 sm:p-3">
                      {queryResult && queryResult.rows.length > 0 ? (
                        <table className="w-full text-left text-xs font-mono border-collapse border border-slate-200 dark:border-slate-800 rounded">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 shadow-2xs z-1">
                              <th className="p-2 border-b border-r border-slate-200 dark:border-slate-700 w-10 text-center text-slate-400 text-[10px]">
                                #
                              </th>
                              {queryResult.columns.map((col, idx) => (
                                <th
                                  key={idx}
                                  className="p-2 border-b border-r border-slate-200 dark:border-slate-700 font-semibold"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                            {queryResult.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center text-slate-400 text-[10px] bg-slate-50 dark:bg-slate-950/40">
                                  {rIdx + 1}
                                </td>
                                {queryResult.columns.map((_, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="p-2 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300"
                                  >
                                    {row[cIdx] === null || row[cIdx] === undefined ? (
                                      <span className="text-slate-400 italic font-sans text-[10px]">NULL</span>
                                    ) : typeof row[cIdx] === 'boolean' ? (
                                      <span className={row[cIdx] ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                                        {String(row[cIdx])}
                                      </span>
                                    ) : (
                                      String(row[cIdx])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : queryResult && queryResult.rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-slate-400 text-xs">
                          <CheckCircle2 className="w-7 h-7 mb-1 text-emerald-500 opacity-70" />
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Statement Executed Successfully</span>
                          <span className="text-[11px] text-slate-400">0 records returned</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-slate-400 text-xs space-y-2">
                          <Play className="w-8 h-8 text-slate-400 opacity-30" />
                          <div className="text-center">
                            <span className="font-semibold text-slate-600 dark:text-slate-300 block">No Query Output Yet</span>
                            <span className="text-[11px] text-slate-400">Write an SQL query above and click 'Run (Ctrl+Enter)'</span>
                          </div>
                          {dbParseResult && dbParseResult.tables.length > 0 && (
                            <button
                              onClick={() => {
                                const tbl = dbParseResult.tables[0].name.replace(/[^a-zA-Z0-9_]/g, '_');
                                const q = `SELECT * FROM ${tbl} LIMIT 25;`;
                                setSqlQuery(q);
                                executeQuery(q);
                              }}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-mono border border-emerald-500/20 cursor-pointer transition-colors"
                            >
                              Run sample: SELECT * FROM {dbParseResult.tables[0].name} LIMIT 25;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Schema & DDL */}
            {activeTab === 'schema' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-[#070c14]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Table Schema &amp; DDL Definitions
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Inspect table structures, column definitions, data types, and copyable SQL schemas.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    {dbParseResult?.tables.length || 0} Tables Indexed
                  </span>
                </div>

                <div className="space-y-4">
                  {dbParseResult?.tables.map(t => (
                    <div
                      key={t.name}
                      className="bg-white dark:bg-[#0c121e] rounded-xl border border-slate-200 dark:border-slate-800/90 shadow-xs overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-100/80 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 gap-2">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                            {t.name}
                          </span>
                          <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                            {t.rowCount} records &bull; {t.columns.length} columns
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyDdl(t.name, t.ddl)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            {copiedDdl === t.name ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedDdl === t.name ? 'Copied DDL' : 'Copy DDL'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTableName(t.name);
                              setActiveTab('tables');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium transition-colors cursor-pointer border border-emerald-500/20"
                          >
                            <span>Browse Records</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Column Structure Grid */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {t.columns.map((c, i) => {
                            const typeDesc = t.columnTypes?.[c] || 'VARCHAR';
                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-mono"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-slate-400 text-[10px]">#{i + 1}</span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{c}</span>
                                </div>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0 ml-1">
                                  {typeDesc}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* DDL Code Block */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                          <pre className="whitespace-pre-wrap leading-relaxed">{t.ddl}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Database Info & Metadata */}
            {activeTab === 'metadata' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-[#070c14]">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="bg-white dark:bg-[#0c121e] p-5 rounded-xl border border-slate-200 dark:border-slate-800/90 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <HardDrive className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {dbParseResult?.formatDescription || filename}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {dbParseResult?.engineType || 'Local In-Browser SQL Engine'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 text-[11px] block mb-0.5">Database Format</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {dbParseResult?.formatDescription || filename}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 text-[11px] block mb-0.5">Processing Engine</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {dbParseResult?.engineType || 'AlaSQL In-Memory Engine'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 text-[11px] block mb-0.5">Total Tables</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {dbParseResult?.tables.length || 0}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 text-[11px] block mb-0.5">Total Rows</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {dbParseResult?.tables.reduce((sum, t) => sum + t.rowCount, 0) || 0}
                        </span>
                      </div>

                      {dbParseResult?.metadata &&
                        Object.entries(dbParseResult.metadata).map(([key, val]) => (
                          <div
                            key={key}
                            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs"
                          >
                            <span className="text-slate-400 text-[11px] block mb-0.5 uppercase tracking-wider font-mono">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                              {String(val)}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>100% Client-Side Local Parse &bull; Zero Server Uploads</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{filename}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Raw SQL Source Script */}
            {activeTab === 'raw' && textContent && (
              <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs">
                <div className="max-w-4xl mx-auto bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 shadow-md">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-xs">
                    <span>SQL Script File ({textContent.split('\n').length} lines)</span>
                    <span className="text-emerald-400 font-semibold">{filename}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed font-mono overflow-x-auto">
                    {textContent}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
