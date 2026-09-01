/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * HTTP & REST Client Request Studio
 */

import React, { useState, useMemo } from 'react';
import {
  Send,
  Copy,
  Check,
  Code,
  Terminal,
  Globe,
  Sliders,
  FileText,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Server
} from 'lucide-react';
import { LocalhostPermissionModal } from '../LocalhostPermissionModal';

interface HttpRestViewerProps {
  textContent?: string;
  filename?: string;
}

interface ParsedRequest {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  rawUrl: string;
  headers: Record<string, string>;
  queryParams: Array<{ key: string; value: string }>;
  body: string;
  comment?: string;
  lineNumber: number;
}

interface ResponseState {
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  isJson: boolean;
  sizeBytes: number;
  error?: string;
}

export function isLocalhostUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const formatted = urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `http://${urlStr}`;
    const parsed = new URL(formatted);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      host.endsWith('.local') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    );
  } catch (_) {
    return urlStr.toLowerCase().includes('localhost') || urlStr.includes('127.0.0.1');
  }
}

export const HttpRestViewer: React.FC<HttpRestViewerProps> = ({
  textContent = '',
  filename = 'request.http'
}) => {
  const [selectedReqIndex, setSelectedReqIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'curl'>('body');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});

  // Localhost permission state
  const [isLocalhostPermissionGranted, setIsLocalhostPermissionGranted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('omniview_localhost_permission') === 'granted';
    } catch (_) {
      return false;
    }
  });
  const [isLocalhostModalOpen, setIsLocalhostModalOpen] = useState<boolean>(false);
  const [pendingReqToExecute, setPendingReqToExecute] = useState<ParsedRequest | null>(null);

  // 1. Parse .http / .rest file contents
  const { variables, requests } = useMemo(() => {
    const vars: Record<string, string> = {};
    const reqList: ParsedRequest[] = [];
    const lines = textContent.split('\n');

    let currentReq: Partial<ParsedRequest> | null = null;
    let inBody = false;
    let bodyLines: string[] = [];
    let currentComment = '';

    const finalizeCurrentReq = () => {
      if (currentReq && currentReq.url && currentReq.method) {
        const bodyStr = bodyLines.join('\n').trim();
        let finalUrl = currentReq.url;

        // Resolve variables {{varName}} or @varName
        Object.entries(vars).forEach(([k, v]) => {
          finalUrl = finalUrl.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
        });

        // Parse query params from URL
        const queryParams: Array<{ key: string; value: string }> = [];
        try {
          const qIdx = finalUrl.indexOf('?');
          if (qIdx !== -1) {
            const searchParams = new URLSearchParams(finalUrl.slice(qIdx + 1));
            searchParams.forEach((value, key) => {
              queryParams.push({ key, value });
            });
          }
        } catch (_) {}

        reqList.push({
          id: `req-${reqList.length + 1}`,
          title: currentReq.title || currentComment || `${currentReq.method} ${currentReq.url.slice(0, 40)}`,
          method: (currentReq.method.toUpperCase() as any) || 'GET',
          url: finalUrl,
          rawUrl: currentReq.url,
          headers: currentReq.headers || {},
          queryParams,
          body: bodyStr,
          comment: currentComment,
          lineNumber: currentReq.lineNumber || 1
        });
      }
      currentReq = null;
      inBody = false;
      bodyLines = [];
      currentComment = '';
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for variables @baseUrl = https://...
      if (trimmed.startsWith('@')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const varName = trimmed.slice(1, eqIdx).trim();
          const varVal = trimmed.slice(eqIdx + 1).trim();
          vars[varName] = varVal;
        }
        return;
      }

      // Separator ### or ### Request Title
      if (trimmed.startsWith('###')) {
        finalizeCurrentReq();
        currentComment = trimmed.replace(/^###\s*/, '').trim();
        return;
      }

      // Comments
      if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
        if (!currentComment) {
          currentComment = trimmed.replace(/^[#/]+\s*/, '').trim();
        }
        return;
      }

      // Blank line separating headers and body
      if (trimmed === '' && currentReq && !inBody) {
        inBody = true;
        return;
      }

      if (inBody) {
        bodyLines.push(line);
        return;
      }

      // HTTP Method & URL line (e.g. GET https://api.example.com/v1/users HTTP/1.1)
      const methodMatch = line.match(/^\s*(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(https?:\/\/[^\s]+|[^\s]+)/i);
      if (methodMatch) {
        finalizeCurrentReq();
        currentReq = {
          method: methodMatch[1].toUpperCase() as any,
          url: methodMatch[2],
          headers: {},
          lineNumber: idx + 1
        };
        return;
      }

      // Header line (e.g. Content-Type: application/json)
      if (currentReq && !inBody && trimmed.includes(':')) {
        const colonIdx = trimmed.indexOf(':');
        const hKey = trimmed.slice(0, colonIdx).trim();
        let hVal = trimmed.slice(colonIdx + 1).trim();

        // Resolve header variables
        Object.entries(vars).forEach(([k, v]) => {
          hVal = hVal.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
        });

        currentReq.headers = currentReq.headers || {};
        currentReq.headers[hKey] = hVal;
      }
    });

    finalizeCurrentReq();

    return { variables: vars, requests: reqList };
  }, [textContent]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchMethod = methodFilter === 'ALL' || r.method === methodFilter;
      const matchSearch =
        searchQuery === '' ||
        r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMethod && matchSearch;
    });
  }, [requests, methodFilter, searchQuery]);

  const activeRequest = filteredRequests[selectedReqIndex] || requests[0] || null;

  // Generate cURL command
  const generatedCurl = useMemo(() => {
    if (!activeRequest) return '';
    let curl = `curl -X ${activeRequest.method} "${activeRequest.url}"`;
    Object.entries(activeRequest.headers).forEach(([k, v]) => {
      curl += ` \\\n  -H "${k}: ${v}"`;
    });
    if (activeRequest.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(activeRequest.method)) {
      curl += ` \\\n  -d '${activeRequest.body.replace(/'/g, "\\'")}'`;
    }
    return curl;
  }, [activeRequest]);

  // Actual execution routine
  const executeRequestActual = async (reqToRun: ParsedRequest) => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const fetchHeaders: Record<string, string> = { ...reqToRun.headers };

      // If localhost, hint private network access
      if (isLocalhostUrl(reqToRun.url)) {
        // Safe hint
        fetchHeaders['X-Requested-With'] = 'OmniView-Studio';
      }

      const response = await fetch(reqToRun.url, {
        method: reqToRun.method,
        headers: fetchHeaders,
        body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(reqToRun.method) && reqToRun.body
          ? reqToRun.body
          : undefined,
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      const resHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      const text = await response.text();
      let isJson = false;
      let formattedBody = text;
      try {
        const parsed = JSON.parse(text);
        formattedBody = JSON.stringify(parsed, null, 2);
        isJson = true;
      } catch (_) {}

      setResponses(prev => ({
        ...prev,
        [reqToRun.id]: {
          status: response.status,
          statusText: response.statusText || 'OK',
          durationMs,
          headers: resHeaders,
          body: formattedBody,
          isJson,
          sizeBytes: new Blob([text]).size
        }
      }));
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isLocal = isLocalhostUrl(reqToRun.url);
      setResponses(prev => ({
        ...prev,
        [reqToRun.id]: {
          status: 0,
          statusText: 'Client / Network Timeout or CORS',
          durationMs,
          headers: {},
          body: `Request Execution Note:\n${err.message || 'Network error / CORS restriction'}\n\n${
            isLocal
              ? 'Localhost Connection Tips:\n1. Verify your local backend service is running and listening on the specified port.\n2. Ensure CORS is enabled on your local server (Access-Control-Allow-Origin: *).\n3. If your browser blocks HTTPS-to-HTTP mixed content, you can copy the generated cURL command to run directly in terminal without any restrictions.'
              : 'Tips:\n- Target API must permit CORS headers for in-browser requests.\n- You can copy the generated cURL command to run directly in terminal.'
          }`,
          isJson: false,
          sizeBytes: 0,
          error: err.message
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Execute request trigger with Localhost Interceptor
  const handleExecuteRequest = () => {
    if (!activeRequest) return;

    if (isLocalhostUrl(activeRequest.url) && !isLocalhostPermissionGranted) {
      setPendingReqToExecute(activeRequest);
      setIsLocalhostModalOpen(true);
      return;
    }

    executeRequestActual(activeRequest);
  };

  const handleGrantLocalhostPermission = (rememberSession: boolean) => {
    if (rememberSession) {
      try {
        sessionStorage.setItem('omniview_localhost_permission', 'granted');
      } catch (_) {}
    }
    setIsLocalhostPermissionGranted(true);
    const target = pendingReqToExecute || activeRequest;
    if (target) {
      executeRequestActual(target);
    }
    setPendingReqToExecute(null);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const activeResponse = activeRequest ? responses[activeRequest.id] : null;

  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-slate-200">HTTP / REST Studio</span>
          </div>

          {/* Variables Badge */}
          {Object.keys(variables).length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
              <Sliders className="w-3 h-3" />
              <span>{Object.keys(variables).length} Variables</span>
            </div>
          )}

          <div className="text-xs text-slate-400 font-mono">
            {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Request Runner
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Raw .http Script
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'raw' ? (
        <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-slate-950 text-slate-300 leading-relaxed select-text">
          <pre>{textContent}</pre>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 min-w-0 overflow-hidden">
          {/* Left Sidebar: Requests List */}
          <div className="w-full md:w-80 flex flex-col bg-slate-950/80 border-r border-slate-800 shrink-0">
            {/* Search & Filter */}
            <div className="p-3 border-b border-slate-800/80 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter requests & endpoints..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Method Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
                {['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      methodFilter === m
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60 p-1.5 space-y-1">
              {filteredRequests.length === 0 ? (
                <div className="text-center p-6 text-slate-500 text-xs">No matching requests found</div>
              ) : (
                filteredRequests.map((req, idx) => {
                  const isSelected = activeRequest?.id === req.id;
                  const res = responses[req.id];
                  return (
                    <button
                      key={req.id}
                      onClick={() => setSelectedReqIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-blue-900/30 border border-blue-500/40 text-white shadow-xs'
                          : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getMethodColor(
                            req.method
                          )}`}
                        >
                          {req.method}
                        </span>
                        {res && (
                          <span
                            className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                              res.status >= 200 && res.status < 300
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {res.status || 'ERR'}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-xs text-slate-200 truncate">{req.title}</div>
                      <div className="font-mono text-[11px] text-slate-500 truncate">{req.url}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Stage: Request Runner & Response Viewer */}
          {activeRequest ? (
            <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-900 overflow-y-auto">
              {/* Active URL & Execute Bar */}
              <div className="p-4 bg-slate-950/50 border-b border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex-1 shadow-inner">
                    <span
                      className={`px-3 py-2 text-xs font-mono font-bold uppercase shrink-0 border-r border-slate-700 ${getMethodColor(
                        activeRequest.method
                      )}`}
                    >
                      {activeRequest.method}
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={activeRequest.url}
                      className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none select-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleExecuteRequest}
                      disabled={isLoading}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-900/30"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-white" />
                      )}
                      <span>Send Request</span>
                    </button>

                    <button
                      onClick={handleCopyCurl}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700 cursor-pointer"
                      title="Copy as cURL command"
                    >
                      {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copiedCurl ? 'Copied' : 'cURL'}</span>
                    </button>
                  </div>
                </div>

                {/* Query Parameters / Headers Chips & Localhost Status */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Request Specs:</span>
                  
                  {isLocalhostUrl(activeRequest.url) && (
                    <button
                      onClick={() => {
                        setPendingReqToExecute(activeRequest);
                        setIsLocalhostModalOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
                        isLocalhostPermissionGranted
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 animate-pulse'
                      }`}
                    >
                      {isLocalhostPermissionGranted ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Localhost: Permission Granted</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                          <span>Localhost Target (Click for Permission Gateway)</span>
                        </>
                      )}
                    </button>
                  )}

                  <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono">
                    {Object.keys(activeRequest.headers).length} Headers
                  </span>
                  {activeRequest.queryParams.length > 0 && (
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono">
                      {activeRequest.queryParams.length} Query Params
                    </span>
                  )}
                  {activeRequest.body && (
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                      Payload: {activeRequest.body.length} chars
                    </span>
                  )}
                </div>
              </div>

              {/* Split Sections: Request Details & Response Inspector */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 min-h-0 overflow-y-auto">
                {/* Left Col: Request Config (Headers & Body) */}
                <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-xs text-slate-300">Request Configuration</span>
                    <span className="text-[11px] font-mono text-slate-500">Line {activeRequest.lineNumber}</span>
                  </div>

                  {/* Headers Table */}
                  {Object.keys(activeRequest.headers).length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Headers</span>
                      <div className="bg-slate-900 rounded-xl border border-slate-800/80 divide-y divide-slate-800 text-xs font-mono">
                        {Object.entries(activeRequest.headers).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between p-2">
                            <span className="text-blue-400 font-medium">{k}:</span>
                            <span className="text-slate-300 truncate max-w-xs">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {activeRequest.body ? (
                    <div className="flex-1 flex flex-col space-y-1.5 min-h-[140px]">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Body Payload</span>
                      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-3 font-mono text-xs text-slate-300 overflow-auto select-text">
                        <pre>{activeRequest.body}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 text-center text-slate-500 text-xs">
                      No request body payload (Standard {activeRequest.method} request)
                    </div>
                  )}

                  {/* cURL preview box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">cURL Command</span>
                      <button
                        onClick={handleCopyCurl}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto select-all">
                      {generatedCurl}
                    </pre>
                  </div>
                </div>

                {/* Right Col: Live Response Inspector */}
                <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-300">Response</span>
                      {activeResponse && (
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                            activeResponse.status >= 200 && activeResponse.status < 300
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {activeResponse.status} {activeResponse.statusText}
                        </span>
                      )}
                    </div>

                    {activeResponse && (
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {activeResponse.durationMs}ms
                        </span>
                        {activeResponse.sizeBytes > 0 && <span>{(activeResponse.sizeBytes / 1024).toFixed(1)} KB</span>}
                      </div>
                    )}
                  </div>

                  {activeResponse ? (
                    <div className="flex-1 flex flex-col space-y-2 min-h-0">
                      {/* Response Tabs */}
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
                        <button
                          onClick={() => setResponseTab('body')}
                          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                            responseTab === 'body' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Body {activeResponse.isJson ? '(JSON)' : ''}
                        </button>
                        <button
                          onClick={() => setResponseTab('headers')}
                          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                            responseTab === 'headers' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Headers ({Object.keys(activeResponse.headers).length})
                        </button>
                      </div>

                      {/* Tab Content */}
                      {responseTab === 'body' ? (
                        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-3 font-mono text-xs text-slate-300 overflow-auto select-text">
                          <pre>{activeResponse.body}</pre>
                        </div>
                      ) : (
                        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs font-mono overflow-auto">
                          {Object.entries(activeResponse.headers).map(([k, v]) => (
                            <div key={k} className="p-2 flex items-center justify-between">
                              <span className="text-blue-400">{k}:</span>
                              <span className="text-slate-300 select-all">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <Send className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-300">Ready to execute request</p>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Click "Send Request" or copy cURL to test endpoint live.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
              No request selected
            </div>
          )}
        </div>
      )}

      {/* Localhost Permission Gateway Modal */}
      {activeRequest && (
        <LocalhostPermissionModal
          isOpen={isLocalhostModalOpen}
          onClose={() => {
            setIsLocalhostModalOpen(false);
            setPendingReqToExecute(null);
          }}
          onGrantPermission={handleGrantLocalhostPermission}
          targetUrl={activeRequest.url}
          method={activeRequest.method}
          curlCommand={generatedCurl}
        />
      )}
    </div>
  );
};
