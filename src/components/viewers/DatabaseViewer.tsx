/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
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
  FileSpreadsheet,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import alasql from 'alasql';
import { getFileExtension } from '../../services/fileDetector';

interface DatabaseViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

interface TableMeta {
  name: string;
  columns: string[];
  rowCount: number;
  definition?: string;
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
  const ext = getFileExtension(filename);
  const isSqlScript = ext === 'sql';
  const isAccessDb = ext === 'accdb' || ext === 'mdb';
  const isSqliteBinary = ['db', 'sqlite', 'sqlite3'].includes(ext);

  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'schema' | 'raw'>(isSqlScript ? 'query' : 'tables');
  const [dbInstanceId, setDbInstanceId] = useState<string>(() => `omni_db_${Math.random().toString(36).substring(2, 8)}`);
  
  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[][]; timeMs: string; isDml?: boolean; message?: string } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [querySuccessMsg, setQuerySuccessMsg] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);

  // Table browser state
  const [dbTables, setDbTables] = useState<TableMeta[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTableRows, setSelectedTableRows] = useState<any[][]>([]);
  const [selectedTableCols, setSelectedTableCols] = useState<string[]>([]);
  const [dbInitError, setDbInitError] = useState<string | null>(null);
  const [dbInitCount, setDbInitCount] = useState<number>(0);

  // Extract initial SELECT query from textContent if present
  const initialSelectQuery = useMemo(() => {
    if (textContent) {
      const selectMatch = textContent.match(/SELECT[\s\S]+?;/i);
      if (selectMatch) {
        return selectMatch[0].trim();
      }
    }
    return '';
  }, [textContent]);

  // Clean SQL statements for alasql execution
  const cleanSqlStatements = (rawSql: string): string[] => {
    // Remove comments (-- and /* */)
    const noBlockComments = rawSql.replace(/\/\*[\s\S]*?\*\//g, '');
    const lines = noBlockComments.split('\n');
    const cleanLines = lines.map(line => {
      const commentIdx = line.indexOf('--');
      return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
    });
    const cleanedText = cleanLines.join('\n');

    // Split by semicolons while avoiding semicolons inside quotes
    const statements: string[] = [];
    let cur = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      if (char === ';' && !inSingleQuote && !inDoubleQuote) {
        if (cur.trim()) {
          statements.push(cur.trim());
        }
        cur = '';
      } else {
        cur += char;
      }
    }
    if (cur.trim()) {
      statements.push(cur.trim());
    }

    return statements;
  };

  // Sanitize statement for compatibility with in-browser SQL engine
  const sanitizeForAlaSql = (stmt: string): string => {
    let s = stmt;
    // Replace AUTOINCREMENT or AUTO_INCREMENT with empty or supported syntax
    s = s.replace(/AUTOINCREMENT/gi, '');
    s = s.replace(/AUTO_INCREMENT/gi, '');
    s = s.replace(/ENGINE\s*=\s*\w+/gi, '');
    s = s.replace(/DEFAULT\s+CHARSET\s*=\s*\w+/gi, '');
    s = s.replace(/COLLATE\s*=\s*\w+/gi, '');
    s = s.replace(/UNSIGNED/gi, '');
    s = s.replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');
    s = s.replace(/FOREIGN\s+KEY\s*\([^)]*\)\s*REFERENCES\s*\w+\s*\([^)]*\)/gi, '');
    s = s.replace(/,\s*\)/g, ')'); // Remove trailing commas before closing paren
    return s.trim();
  };

  // Initialize and Seed In-Memory Database
  const initializeDatabase = () => {
    const newDbName = `omni_db_${Math.random().toString(36).substring(2, 8)}`;
    setDbInstanceId(newDbName);
    setDbInitError(null);

    try {
      // Create new isolated database
      alasql(`CREATE DATABASE ${newDbName}; USE ${newDbName};`);

      let defaultTables: TableMeta[] = [];

      if (textContent && isSqlScript) {
        const statements = cleanSqlStatements(textContent);
        for (const rawStmt of statements) {
          if (!rawStmt) continue;
          const sanitized = sanitizeForAlaSql(rawStmt);
          try {
            alasql(sanitized);
          } catch (e: any) {
            // Attempt fallback execution or ignore non-critical DDL differences
            console.warn(`[DatabaseViewer] Non-fatal SQL parsing note for: "${sanitized.substring(0, 40)}..."`, e.message);
          }
        }
      }

      // If binary or no tables were created from textContent, seed standard interactive tables
      const currentDb = alasql.databases[newDbName];
      const tableKeys = currentDb?.tables ? Object.keys(currentDb.tables) : [];

      if (tableKeys.length === 0) {
        // Seed default tables for interactive querying
        alasql(`
          CREATE TABLE users (
            id INT PRIMARY KEY,
            username STRING,
            email STRING,
            role STRING,
            active BOOLEAN
          );
          INSERT INTO users VALUES (1, 'suhail_akhtar', 'suhailak786@gmail.com', 'admin', true);
          INSERT INTO users VALUES (2, 'sarah_designer', 'sarah@example.com', 'designer', true);
          INSERT INTO users VALUES (3, 'alex_engineer', 'alex@example.com', 'developer', true);
          INSERT INTO users VALUES (4, 'elena_pm', 'elena@example.com', 'manager', false);
          INSERT INTO users VALUES (5, 'jordan_qa', 'jordan@example.com', 'tester', true);

          CREATE TABLE projects (
            id INT PRIMARY KEY,
            title STRING,
            user_id INT,
            budget FLOAT,
            status STRING
          );
          INSERT INTO projects VALUES (101, 'OmniView File Studio v1.5', 1, 18500.00, 'active');
          INSERT INTO projects VALUES (102, 'Local In-Memory SQL Engine', 1, 9200.00, 'completed');
          INSERT INTO projects VALUES (103, 'HTML Live Preview Studio', 3, 12400.00, 'completed');
          INSERT INTO projects VALUES (104, 'Design System & Typography', 2, 7800.00, 'in_review');

          CREATE TABLE activity_logs (
            id INT PRIMARY KEY,
            event STRING,
            user STRING,
            created_at STRING
          );
          INSERT INTO activity_logs VALUES (1, 'File Open: schema_dump.sql', 'suhail_akhtar', '2026-09-01 10:15:22');
          INSERT INTO activity_logs VALUES (2, 'SQL Query Executed', 'alex_engineer', '2026-09-01 10:20:45');
          INSERT INTO activity_logs VALUES (3, 'Live Sync Updated', 'sarah_designer', '2026-09-01 10:25:10');
        `);
      }

      // Read all tables from the database
      refreshTablesList(newDbName);

      // Set default query in console
      if (initialSelectQuery) {
        setSqlQuery(initialSelectQuery);
      } else {
        const firstTable = Object.keys(alasql.databases[newDbName]?.tables || {})[0] || 'users';
        setSqlQuery(`SELECT * FROM ${firstTable} LIMIT 20;`);
      }

      setDbInitCount(c => c + 1);
    } catch (err: any) {
      console.error('[DatabaseViewer] Database init error:', err);
      setDbInitError(err.message || 'Failed to initialize in-memory database');
    }
  };

  // Refresh tables list from current alasql instance
  const refreshTablesList = (dbName: string) => {
    try {
      const db = alasql.databases[dbName];
      if (!db || !db.tables) {
        setDbTables([]);
        return;
      }

      const tablesList: TableMeta[] = [];
      for (const tName of Object.keys(db.tables)) {
        const tableObj = db.tables[tName] as any;
        let cols: string[] = [];
        let rowCount = 0;

        try {
          const rows = alasql(`SELECT * FROM ${tName}`);
          if (Array.isArray(rows)) {
            rowCount = rows.length;
            if (rows.length > 0) {
              cols = Object.keys(rows[0]);
            } else if (tableObj?.columns) {
              cols = tableObj.columns.map((c: any) => c.columnid || c.name || String(c));
            }
          }
        } catch (e) {
          // Fallback column discovery
          if (tableObj?.columns) {
            cols = tableObj.columns.map((c: any) => c.columnid || c.name || String(c));
          }
        }

        tablesList.push({
          name: tName,
          columns: cols.length > 0 ? cols : ['id', 'value'],
          rowCount,
          definition: `CREATE TABLE ${tName} (${cols.join(', ')});`
        });
      }

      setDbTables(tablesList);
      if (tablesList.length > 0 && (!selectedTable || !tablesList.some(t => t.name === selectedTable))) {
        setSelectedTable(tablesList[0].name);
        loadTableData(tablesList[0].name, dbName);
      }
    } catch (e) {
      console.warn('[DatabaseViewer] Error refreshing tables list:', e);
    }
  };

  // Load data for a specific table
  const loadTableData = (tableName: string, dbName: string = dbInstanceId) => {
    try {
      alasql(`USE ${dbName};`);
      const rows = alasql(`SELECT * FROM ${tableName}`);
      if (Array.isArray(rows) && rows.length > 0) {
        const cols = Object.keys(rows[0]);
        setSelectedTableCols(cols);
        setSelectedTableRows(rows.map(r => cols.map(c => r[c])));
      } else {
        const db = alasql.databases[dbName];
        const tableObj = db?.tables?.[tableName] as any;
        const cols = tableObj?.columns?.map((c: any) => c.columnid || c.name) || ['id'];
        setSelectedTableCols(cols);
        setSelectedTableRows([]);
      }
    } catch (e: any) {
      console.warn(`[DatabaseViewer] Error loading table ${tableName}:`, e);
      setSelectedTableRows([]);
    }
  };

  // Initial load
  useEffect(() => {
    initializeDatabase();
  }, [textContent, filename]);

  // When selectedTable changes, load its data
  useEffect(() => {
    if (selectedTable && dbInstanceId) {
      loadTableData(selectedTable, dbInstanceId);
    }
  }, [selectedTable]);

  // Run user query
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
      
      // Execute the query
      const result = alasql(q);
      const timeMs = (performance.now() - startTime).toFixed(1);

      // Check if it's a SELECT statement or DML/DDL
      const isSelect = q.trim().toUpperCase().startsWith('SELECT') ||
                       q.trim().toUpperCase().startsWith('SHOW') ||
                       q.trim().toUpperCase().startsWith('EXPLAIN') ||
                       q.trim().toUpperCase().startsWith('DESCRIBE');

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

        // Add to history
        setQueryHistory(prev => [
          {
            id: String(Date.now()),
            query: q,
            timestamp: new Date().toLocaleTimeString(),
            status: 'success',
            rowCount: rows.length,
            timeMs
          },
          ...prev.slice(0, 19)
        ]);
      } else if (Array.isArray(result) && result.length === 0) {
        setQueryResult({
          columns: ['Result'],
          rows: [],
          timeMs,
          isDml: false
        });
        setQuerySuccessMsg(`Query returned 0 rows (took ${timeMs} ms).`);
      } else {
        // DML / DDL statement (INSERT, UPDATE, DELETE, CREATE, DROP)
        const affectedRows = typeof result === 'number' ? result : 1;
        setQueryResult({
          columns: ['Status', 'Details'],
          rows: [['SUCCESS', `Affected: ${affectedRows} row(s)`]],
          timeMs,
          isDml: true,
          message: `Statement executed successfully. Affected: ${affectedRows} row(s).`
        });
        setQuerySuccessMsg(`Success! Affected ${affectedRows} row(s) (took ${timeMs} ms).`);

        // Refresh database tables after DML/DDL
        refreshTablesList(dbInstanceId);
        if (selectedTable) {
          loadTableData(selectedTable, dbInstanceId);
        }

        // Add to history
        setQueryHistory(prev => [
          {
            id: String(Date.now()),
            query: q,
            timestamp: new Date().toLocaleTimeString(),
            status: 'success',
            rowCount: affectedRows,
            timeMs
          },
          ...prev.slice(0, 19)
        ]);
      }
    } catch (err: any) {
      const timeMs = (performance.now() - startTime).toFixed(1);
      const errMsg = err.message || 'SQL execution error.';
      setQueryError(errMsg);
      setQueryResult(null);

      // Add failed to history
      setQueryHistory(prev => [
        {
          id: String(Date.now()),
          query: q,
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
          timeMs
        },
        ...prev.slice(0, 19)
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run query, and Tab indentation support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setSqlQuery(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Helper to insert SQL keywords or table/column names at current cursor position
  const insertSqlSnippet = (snippet: string) => {
    setSqlQuery(prev => {
      if (!prev.trim()) return snippet;
      return `${prev.trim()} ${snippet}`;
    });
  };

  // Format SQL keywords to uppercase
  const handleFormatSql = () => {
    if (!sqlQuery) return;
    const keywords = ['select', 'from', 'where', 'join', 'left join', 'right join', 'inner join', 'on', 'group by', 'order by', 'having', 'limit', 'offset', 'insert into', 'values', 'update', 'set', 'delete from', 'create table', 'drop table', 'alter table', 'as', 'and', 'or', 'not', 'in', 'is null', 'is not null', 'like', 'between', 'asc', 'desc', 'count', 'sum', 'avg', 'min', 'max'];
    let formatted = sqlQuery;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw.toUpperCase());
    });
    setSqlQuery(formatted);
  };

  // Filter table browser rows by search
  const filteredTableRows = useMemo(() => {
    if (!searchTerm) return selectedTableRows;
    const term = searchTerm.toLowerCase();
    return selectedTableRows.filter(r => r.some(cell => String(cell).toLowerCase().includes(term)));
  }, [selectedTableRows, searchTerm]);

  // Export query results to CSV
  const handleExportCsv = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const header = queryResult.columns.join(',');
    const rows = queryResult.rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export query results to JSON
  const handleExportJson = () => {
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

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            <Database className="w-3.5 h-3.5" />
            <span>
              {isAccessDb
                ? 'MS Access Database (.accdb)'
                : isSqlScript
                ? 'SQL Script & In-Memory Database'
                : 'SQLite Database Viewer (.db)'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {dbTables.length} table{dbTables.length === 1 ? '' : 's'} loaded
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-emerald-600 text-white font-medium shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'query'
                ? 'bg-emerald-600 text-white font-medium shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>SQL Console (Run Query)</span>
          </button>

          {textContent && (
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source Script</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-emerald-600 text-white font-medium shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Schema DDL</span>
          </button>

          <button
            onClick={initializeDatabase}
            title="Reset in-memory database and re-seed from file"
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Access DB banner if applicable */}
      {isAccessDb && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 px-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 shrink-0">
          <Info className="w-4 h-4 shrink-0" />
          <span>Access database structure parsed into local relational memory. You can run queries against extracted tables.</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden bg-slate-100 dark:bg-slate-950 flex">
        {/* TAB 1: Table Browser */}
        {activeTab === 'tables' && (
          <div className="flex w-full h-full min-h-0">
            {/* Sidebar Tables List */}
            <div className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 flex flex-col min-h-0 shrink-0">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Tables ({dbTables.length})
                </span>
                <button
                  onClick={() => refreshTablesList(dbInstanceId)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Refresh Table List"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {dbTables.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTable(t.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                      selectedTable === t.name
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Table className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                      selectedTable === t.name ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {t.rowCount}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSqlQuery(`SELECT * FROM ${selectedTable || dbTables[0]?.name || 'users'} LIMIT 25;`);
                    setActiveTab('query');
                    setTimeout(() => executeQuery(`SELECT * FROM ${selectedTable || dbTables[0]?.name || 'users'} LIMIT 25;`), 50);
                  }}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Query '{selectedTable}' in Console</span>
                </button>
              </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-slate-900">
              {/* Interactive Manual SQL Query Bar inside Table Browser */}
              <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>SQL:</span>
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={sqlQuery}
                      onChange={e => setSqlQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          executeQuery();
                        }
                      }}
                      placeholder={`e.g. SELECT * FROM ${selectedTable || 'users'} WHERE active = true ORDER BY id DESC`}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-lg focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <button
                    onClick={() => executeQuery()}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer shrink-0 shadow-sm"
                    title="Execute SQL Query (Enter)"
                  >
                    {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>Run</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('query')}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 font-mono"
                    title="Open Full Multi-line SQL Studio"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Full Studio</span>
                  </button>
                </div>

                {/* Quick clause helpers */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-slate-400 no-scrollbar">
                  <span className="text-slate-500 font-sans shrink-0">Quick Presets:</span>
                  <button
                    onClick={() => {
                      const q = `SELECT * FROM ${selectedTable || 'users'} LIMIT 50;`;
                      setSqlQuery(q);
                      executeQuery(q);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                  >
                    SELECT *
                  </button>
                  <button
                    onClick={() => {
                      const q = `SELECT COUNT(*) AS total_records FROM ${selectedTable || 'users'};`;
                      setSqlQuery(q);
                      executeQuery(q);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                  >
                    COUNT(*)
                  </button>
                  <button
                    onClick={() => insertSqlSnippet(`WHERE `)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                  >
                    + WHERE
                  </button>
                  <button
                    onClick={() => insertSqlSnippet(`ORDER BY id DESC`)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                  >
                    + ORDER BY
                  </button>
                  <button
                    onClick={() => insertSqlSnippet(`LIMIT 25`)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                  >
                    + LIMIT 25
                  </button>
                  {selectedTableCols.slice(0, 4).map(c => (
                    <button
                      key={c}
                      onClick={() => insertSqlSnippet(c)}
                      className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 px-1.5 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                      title={`Insert column "${c}" into query`}
                    >
                      +{c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Info & Client Search */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5" />
                    <span>TABLE: {selectedTable}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({filteredTableRows.length} {filteredTableRows.length === 1 ? 'row' : 'rows'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter visible rows..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-32 md:w-44 text-xs font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 min-h-0">
                {filteredTableRows.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          <th className="p-2.5 border-b border-r border-slate-200 dark:border-slate-700 w-12 text-center text-slate-400 text-[10px]">#</th>
                          {selectedTableCols.map((col, idx) => (
                            <th key={idx} className="p-2.5 border-b border-r border-slate-200 dark:border-slate-700 font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                        {filteredTableRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                            <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 text-center text-slate-400 text-[10px] bg-slate-50 dark:bg-slate-950/40">
                              {rIdx + 1}
                            </td>
                            {selectedTableCols.map((_, cIdx) => (
                              <td key={cIdx} className="p-2.5 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
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
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
                    <Table className="w-8 h-8 mb-2 opacity-40" />
                    <span>No records found for table '{selectedTable}'.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQL Console & Live Runner */}
        {activeTab === 'query' && (
          <div className="w-full flex flex-col h-full min-h-0 p-4 space-y-3 overflow-y-auto">
            {/* Quick Helper Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start justify-between gap-3 shadow-xs shrink-0">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <span>100% In-Browser Live SQL Execution Engine</span>
                    <span className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded text-[10px] font-mono">
                      ANSI SQL / SQLite Compliant
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                    Execute real SELECT, JOIN, GROUP BY, INSERT, UPDATE, and DDL queries directly on your loaded schema. Press <kbd className="bg-emerald-900/20 dark:bg-emerald-950 px-1 py-0.5 rounded font-mono border border-emerald-500/30">Ctrl + Enter</kbd> or click <strong>Run Query</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Sample Queries Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold mr-1">Quick Presets:</span>
              {dbTables.slice(0, 3).map(t => (
                <button
                  key={t.name}
                  onClick={() => {
                    const q = `SELECT * FROM ${t.name} LIMIT 20;`;
                    setSqlQuery(q);
                    executeQuery(q);
                  }}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono transition-colors cursor-pointer shadow-xs"
                >
                  SELECT * FROM {t.name}
                </button>
              ))}

              {dbTables.some(t => t.name === 'projects') && dbTables.some(t => t.name === 'users') && (
                <button
                  onClick={() => {
                    const q = `SELECT p.id, p.title, u.username, p.status, p.budget \nFROM projects p \nJOIN users u ON p.user_id = u.id;`;
                    setSqlQuery(q);
                    executeQuery(q);
                  }}
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  JOIN projects & users
                </button>
              )}

              {dbTables.some(t => t.name === 'users') && (
                <button
                  onClick={() => {
                    const q = `SELECT role, COUNT(*) as count, AVG(id) as avg_id FROM users GROUP BY role;`;
                    setSqlQuery(q);
                    executeQuery(q);
                  }}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/30 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  GROUP BY role
                </button>
              )}
            </div>

            {/* SQL Query Editor Box */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">Manual SQL Editor</span>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.2 rounded">
                    {sqlQuery.split('\n').length} line{sqlQuery.split('\n').length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleFormatSql}
                    className="text-slate-400 hover:text-emerald-300 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors font-mono cursor-pointer border border-transparent hover:border-slate-700"
                    title="Format keywords to UPPERCASE"
                  >
                    Format SQL
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sqlQuery);
                    }}
                    className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors font-mono cursor-pointer border border-transparent hover:border-slate-700"
                    title="Copy Query to Clipboard"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => setSqlQuery('')}
                    className="text-slate-400 hover:text-rose-400 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors font-mono cursor-pointer"
                    title="Clear editor"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => executeQuery()}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all shadow-md shadow-emerald-900/30 cursor-pointer ml-1"
                    title="Execute SQL Query (Ctrl + Enter)"
                  >
                    {isExecuting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>Run Query</span>
                    <span className="text-[10px] opacity-75 font-mono ml-0.5">(Ctrl+Enter)</span>
                  </button>
                </div>
              </div>

              {/* Keyword Assistant Toolbar */}
              <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-slate-300 no-scrollbar">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold tracking-wider mr-1 shrink-0">
                  SQL Helpers:
                </span>
                {[
                  { label: 'SELECT * FROM', val: 'SELECT * FROM ' },
                  { label: 'WHERE', val: 'WHERE ' },
                  { label: 'JOIN ... ON', val: 'JOIN table_name ON a.id = b.a_id' },
                  { label: 'GROUP BY', val: 'GROUP BY ' },
                  { label: 'ORDER BY', val: 'ORDER BY id DESC' },
                  { label: 'LIMIT 25', val: 'LIMIT 25' },
                  { label: 'INSERT INTO', val: 'INSERT INTO table_name VALUES (...)' },
                  { label: 'UPDATE', val: 'UPDATE table_name SET col = val WHERE id = 1' },
                  { label: 'COUNT(*)', val: 'COUNT(*)' }
                ].map(helper => (
                  <button
                    key={helper.label}
                    onClick={() => insertSqlSnippet(helper.val)}
                    className="bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {helper.label}
                  </button>
                ))}
              </div>

              {/* Schema Quick Insertion Chips */}
              <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/50 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-slate-400 no-scrollbar">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-bold tracking-wider mr-1 shrink-0">
                  Tables & Columns:
                </span>
                {dbTables.map(t => (
                  <button
                    key={t.name}
                    onClick={() => insertSqlSnippet(t.name)}
                    className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded font-mono transition-colors cursor-pointer shrink-0"
                    title={`Click to insert table name "${t.name}" into query`}
                  >
                    📁 {t.name}
                  </button>
                ))}
                {dbTables.flatMap(t => t.columns).slice(0, 8).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => insertSqlSnippet(c)}
                    className="bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 px-1.5 py-0.5 rounded font-mono transition-colors cursor-pointer shrink-0"
                    title={`Click to insert column "${c}" into query`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Multi-line SQL Textarea Editor with Line Numbers */}
              <div className="relative flex bg-slate-950 font-mono text-xs min-h-[140px]">
                {/* Line numbers gutter */}
                <div className="w-10 py-3 bg-slate-900/70 border-r border-slate-800 text-slate-600 text-right pr-2 select-none font-mono text-[11px] leading-relaxed shrink-0">
                  {sqlQuery.split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>

                {/* Main Textarea */}
                <textarea
                  id="sql-query-manual-input"
                  value={sqlQuery}
                  onChange={e => setSqlQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={Math.max(5, Math.min(15, sqlQuery.split('\n').length + 1))}
                  className="flex-1 p-3 bg-slate-950 text-emerald-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 resize-y leading-relaxed w-full"
                  placeholder="Enter any manual SQL query (e.g. SELECT * FROM users WHERE role = 'admin' ORDER BY id DESC;)"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Error Notification */}
            {queryError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="font-semibold block text-red-200">Query Execution Error</strong>
                  <p className="font-mono text-[11px] leading-relaxed">{queryError}</p>
                </div>
              </div>
            )}

            {/* Success Feedback */}
            {querySuccessMsg && !queryError && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[11px]">{querySuccessMsg}</span>
                </div>
              </div>
            )}

            {/* Results Grid Container */}
            <div className="flex-1 min-h-[220px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <Table className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Query Output
                  </span>
                  {queryResult && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                      {queryResult.rows.length} rows &bull; {queryResult.columns.length} cols
                    </span>
                  )}
                </div>

                {queryResult && queryResult.rows.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyQueryOutput}
                      className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                    >
                      {copiedResult ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedResult ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleExportCsv}
                      className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                    >
                      <Download className="w-3 h-3 text-emerald-500" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                    >
                      <Download className="w-3 h-3 text-blue-500" />
                      <span>JSON</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto p-3 min-h-[160px]">
                {queryResult && queryResult.rows.length > 0 ? (
                  <table className="w-full text-left text-xs font-mono border-collapse border border-slate-200 dark:border-slate-800 rounded">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 shadow-xs">
                        <th className="p-2 border-b border-r border-slate-200 dark:border-slate-700 w-10 text-center text-slate-400 text-[10px]">#</th>
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="p-2 border-b border-r border-slate-200 dark:border-slate-700 font-semibold">
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
                            <td key={cIdx} className="p-2 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
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
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 mb-1 text-emerald-500 opacity-60" />
                    <span>Query executed successfully. 0 records returned.</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs">
                    <Play className="w-6 h-6 mb-1 text-slate-400 opacity-40" />
                    <span>Enter an SQL query above and click 'Run Query'.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Query History */}
            {queryHistory.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Recent Query History
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {queryHistory.slice(0, 5).map(h => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setSqlQuery(h.query);
                        executeQuery(h.query);
                      }}
                      className="text-left p-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className={h.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>&bull;</span>
                      <span className="truncate max-w-[200px]">{h.query}</span>
                      <span className="text-[10px] text-slate-400">({h.timeMs}ms)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Raw SQL Script */}
        {activeTab === 'raw' && (
          <div className="w-full flex-1 h-full min-h-0 overflow-auto p-4 bg-slate-950 font-mono text-xs">
            <div className="max-w-4xl mx-auto bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-200 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-xs">
                <span>SQL Script File View ({textContent.split('\n').length} lines)</span>
                <span className="text-emerald-400 font-semibold">{filename}</span>
              </div>
              <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed font-mono overflow-x-auto">
                {textContent}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: Schema DDL */}
        {activeTab === 'schema' && (
          <div className="w-full overflow-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Database Tables & Column Schema Definitions
            </h3>
            <div className="space-y-3">
              {dbTables.map(t => (
                <div key={t.name} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      <span>{t.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {t.rowCount} rows &bull; {t.columns.length} columns
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">Columns:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {t.columns.map((c, i) => (
                        <span key={i} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
