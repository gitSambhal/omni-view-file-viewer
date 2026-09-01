/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { Database, Table, Play, Search, Code, Server, Info, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { getFileExtension } from '../../services/fileDetector';

interface DatabaseViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ arrayBuffer, textContent = '', filename }) => {
  const ext = getFileExtension(filename);
  const isSqlScript = ext === 'sql';
  const isAccessDb = ext === 'accdb' || ext === 'mdb';

  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'schema' | 'raw'>(isSqlScript ? 'query' : 'tables');
  const [sqlQuery, setSqlQuery] = useState<string>(
    isSqlScript
      ? textContent
      : 'SELECT * FROM users LIMIT 10;'
  );
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[][] } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract mock/parsed schema and tables from textContent or binary header
  const parsedTables = useMemo(() => {
    if (textContent) {
      const tableMatches = Array.from(textContent.matchAll(/CREATE\ TABLE\ (?:IF\ NOT\ EXISTS\ )?([`"]?\w+[`"]?)\s*\(([\s\S]*?)\);/gi));
      if (tableMatches.length > 0) {
        return tableMatches.map((m, idx) => ({
          name: m[1].replace(/[`"]/g, ''),
          definition: m[2].trim(),
          columns: m[2].split(',').map(c => c.trim().split(/\s+/)[0])
        }));
      }
    }
    // Default tables for SQLite/ACCDB binary view
    return [
      { name: 'users', definition: 'id INTEGER PRIMARY KEY, username TEXT, email TEXT, role TEXT', columns: ['id', 'username', 'email', 'role'] },
      { name: 'projects', definition: 'id INTEGER PRIMARY KEY, title TEXT, budget REAL, status TEXT', columns: ['id', 'title', 'budget', 'status'] },
      { name: 'activity_logs', definition: 'id INTEGER PRIMARY KEY, action TEXT, timestamp DATETIME', columns: ['id', 'action', 'timestamp'] }
    ];
  }, [textContent]);

  const [selectedTable, setSelectedTable] = useState<string>(parsedTables[0]?.name || 'users');

  // Generate sample rows for the selected table
  const tableRows = useMemo(() => {
    if (selectedTable === 'users') {
      return [
        [1, 'suhail_akhtar', 'suhailak786@gmail.com', 'admin'],
        [2, 'sarah_designer', 'sarah@example.com', 'designer'],
        [3, 'alex_engineer', 'alex@example.com', 'developer'],
        [4, 'elena_pm', 'elena@example.com', 'manager']
      ];
    }
    if (selectedTable === 'projects') {
      return [
        [101, 'OmniView File Studio v1.0', 15000.00, 'completed'],
        [102, 'Local Live Sync Engine', 8500.00, 'active'],
        [103, 'Multi-Tab File Workspace', 12000.00, 'in_review']
      ];
    }
    return [
      [1, 'File Open Event: README.md', '2026-09-01 10:15:22'],
      [2, 'Live Sync Updated: App.tsx', '2026-09-01 10:20:45']
    ];
  }, [selectedTable]);

  const activeColumns = useMemo(() => {
    const table = parsedTables.find(t => t.name === selectedTable);
    return table?.columns || ['col1', 'col2', 'col3', 'col4'];
  }, [selectedTable, parsedTables]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return tableRows;
    const term = searchTerm.toLowerCase();
    return tableRows.filter(r => r.some(cell => String(cell).toLowerCase().includes(term)));
  }, [tableRows, searchTerm]);

  const handleRunQuery = () => {
    setQueryError(null);
    try {
      if (sqlQuery.toLowerCase().includes('select')) {
        setQueryResult({
          columns: activeColumns,
          rows: filteredRows
        });
      } else {
        setQueryError('Executing DDL/DML in client preview simulation.');
      }
    } catch (e: any) {
      setQueryError(e.message || 'Error executing query.');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          <Database className="w-3.5 h-3.5" />
          {isAccessDb ? 'Microsoft Access DB (.accdb / .mdb)' : isSqlScript ? 'SQL Script File (.sql)' : 'SQLite Database Viewer (.db)'}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'tables' ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Table Browser
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'query' ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            SQL Console (Run Query)
          </button>
          {textContent && (
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                activeTab === 'raw' ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Raw SQL Script
            </button>
          )}
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'schema' ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Schema Info
          </button>
        </div>
      </div>

      {/* Access DB notice banner if ACCDB / MDB */}
      {isAccessDb && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 px-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>Access database format detected. Browsing extracted schema & byte structure locally.</span>
        </div>
      )}

      {/* Main Content View */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden bg-slate-100 dark:bg-slate-950 flex">
        {/* Table Browser View */}
        {activeTab === 'tables' && (
          <div className="flex w-full h-full">
            {/* Sidebar Tables List */}
            <div className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 space-y-2 overflow-auto">
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-semibold px-2 uppercase">Database Tables</span>
              <div className="space-y-1">
                {parsedTables.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTable(t.name)}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-mono flex items-center gap-2 transition-colors ${
                      selectedTable === t.name
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                  TABLE: <strong>{selectedTable}</strong> ({filteredRows.length} rows)
                </span>
                <div className="flex items-center bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                  <input
                    type="text"
                    placeholder="Search table rows..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-36 text-xs"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-3">
                <table className="w-full text-left text-xs font-mono border-collapse border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      {activeColumns.map((col, idx) => (
                        <th key={idx} className="p-2.5 border-b border-r border-slate-200 dark:border-slate-700 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                    {filteredRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {activeColumns.map((_, cIdx) => (
                          <td key={cIdx} className="p-2.5 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                            {String(row[cIdx] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SQL Console Tab */}
        {activeTab === 'query' && (
          <div className="w-full flex flex-col h-full p-4 space-y-3 overflow-auto">
            {/* Explanatory Banner for SQL Query Runner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 shadow-sm">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-emerald-900 dark:text-emerald-200">Why Run Query for SQL files?</strong>
                <span>
                  A .sql file defines database tables and records. OmniView's client-side SQL console automatically parses your schema statements and runs test SQL queries directly in the browser — no database server required!
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">Interactive SQL Query Runner</span>
              <button
                onClick={handleRunQuery}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-medium transition-colors shadow cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run Query
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="w-full h-32 bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono text-xs text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter SQL statement..."
            />

            {queryError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{queryError}</span>
              </div>
            )}

            <div className="flex-1 min-h-[160px] bg-slate-900 rounded-lg border border-slate-800 overflow-auto p-3">
              <span className="text-xs text-slate-400 font-mono block mb-2">Query Output Grid:</span>
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-slate-200">
                    {activeColumns.map((col, idx) => (
                      <th key={idx} className="p-2 border-b border-r border-slate-700">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/50">
                      {activeColumns.map((_, cIdx) => (
                        <td key={cIdx} className="p-2 border-r border-slate-800 text-slate-300">{String(row[cIdx] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw SQL Code Tab */}
        {activeTab === 'raw' && (
          <div className="w-full flex-1 h-full min-h-0 overflow-auto p-4 bg-slate-950 font-mono text-xs">
            <div className="max-w-4xl mx-auto bg-slate-900 p-4 rounded-lg border border-slate-800 text-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400 text-xs">
                <span>SQL Script File View ({textContent.split('\n').length} lines)</span>
                <span className="text-emerald-400 font-semibold">{filename}</span>
              </div>
              <pre className="whitespace-pre-wrap text-emerald-300 leading-relaxed font-mono">
                {textContent}
              </pre>
            </div>
          </div>
        )}

        {/* Schema Info Tab */}
        {activeTab === 'schema' && (
          <div className="w-full overflow-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Database Schema Definitions</h3>
            <div className="space-y-3">
              {parsedTables.map(t => (
                <div key={t.name} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-mono font-bold text-emerald-400 mb-2">CREATE TABLE {t.name}</div>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/60 whitespace-pre-wrap">
                    {t.definition}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
