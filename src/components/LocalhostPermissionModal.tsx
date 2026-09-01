/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Localhost & Private Network Access Permission Gateway Modal
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe,
  Lock,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  Info,
  Server,
  Code2,
  ChevronDown,
  ChevronUp,
  X,
  Play
} from 'lucide-react';

interface LocalhostPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantPermission: (rememberSession: boolean) => void;
  targetUrl: string;
  method: string;
  curlCommand: string;
}

export const LocalhostPermissionModal: React.FC<LocalhostPermissionModalProps> = ({
  isOpen,
  onClose,
  onGrantPermission,
  targetUrl,
  method,
  curlCommand
}) => {
  const [rememberSession, setRememberSession] = useState<boolean>(true);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [showCorsGuide, setShowCorsGuide] = useState<boolean>(false);
  const [selectedGuideLang, setSelectedGuideLang] = useState<'express' | 'python' | 'go'>('express');

  if (!isOpen) return null;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleGrant = () => {
    onGrantPermission(rememberSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <span>Localhost Network Request</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Permission Required
                </span>
              </h3>
              <p className="text-xs text-slate-400">Target host: Private / Localhost Gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-300 leading-relaxed font-sans">
          {/* Target URL Banner */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                Target Local Endpoint
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-400">{method}</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 break-all select-all">
              {targetUrl}
            </div>
          </div>

          {/* Explanation info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Why is permission required?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Modern web browsers enforce <strong>Private Network Access (PNA)</strong> and <strong>Cross-Origin Resource Sharing (CORS)</strong> specifications when a web app communicates with your computer&apos;s local daemon (<code>localhost</code>, <code>127.0.0.1</code>, or <code>192.168.x.x</code>).
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Your local service must permit CORS headers (<code>Access-Control-Allow-Origin: *</code>).</li>
              <li>Requests run strictly from your browser to your machine without any external telemetry.</li>
            </ul>
          </div>

          {/* Remember option */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <input
              type="checkbox"
              id="remember-session"
              checked={rememberSession}
              onChange={e => setRememberSession(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 accent-blue-500 cursor-pointer"
            />
            <label htmlFor="remember-session" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
              Remember my permission for localhost requests during this session
            </label>
          </div>

          {/* Collapsible Local CORS Guide */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <button
              onClick={() => setShowCorsGuide(!showCorsGuide)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-300 hover:bg-slate-900/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Need help configuring CORS on your local server?</span>
              </div>
              {showCorsGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCorsGuide && (
              <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/50">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setSelectedGuideLang('express')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedGuideLang === 'express' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Node.js Express
                  </button>
                  <button
                    onClick={() => setSelectedGuideLang('python')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedGuideLang === 'python' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Python FastAPI
                  </button>
                  <button
                    onClick={() => setSelectedGuideLang('go')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedGuideLang === 'go' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Go (net/http)
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  {selectedGuideLang === 'express' && (
                    <pre>{`// In your local Express server:
const cors = require('cors');
app.use(cors({ origin: '*', credentials: true }));`}</pre>
                  )}
                  {selectedGuideLang === 'python' && (
                    <pre>{`# In FastAPI:
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)`}</pre>
                  )}
                  {selectedGuideLang === 'go' && (
                    <pre>{`// In Go handler:
w.Header().Set("Access-Control-Allow-Origin", "*")
w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")`}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <button
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Copy command to run in your Terminal / Command Prompt"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? 'cURL Copied!' : 'Copy cURL Command'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleGrant}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Allow & Run Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
