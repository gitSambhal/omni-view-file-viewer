/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Open File From URL Dialog
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Link2,
  FileCode,
  FileText,
  Music,
  Video,
  Table,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Copy
} from 'lucide-react';

export interface OpenFileFromUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileLoaded: (file: File, sourceUrl: string) => void;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

interface PresetUrl {
  name: string;
  category: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PRESET_URLS: PresetUrl[] = [
  {
    name: 'Python Data Script',
    category: 'Code (Python)',
    url: 'https://raw.githubusercontent.com/numpy/numpy/main/numpy/version.py',
    icon: FileCode,
    description: 'NumPy version & release script from GitHub'
  },
  {
    name: 'JSON REST Document',
    category: 'Data (JSON)',
    url: 'https://jsonplaceholder.typicode.com/users',
    icon: Table,
    description: 'REST API mock user database'
  },
  {
    name: 'React Markdown README',
    category: 'Docs (Markdown)',
    url: 'https://raw.githubusercontent.com/facebook/react/main/README.md',
    icon: FileText,
    description: 'Official React documentation & architecture'
  },
  {
    name: 'World GDP Dataset',
    category: 'Spreadsheet (CSV)',
    url: 'https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv',
    icon: Table,
    description: 'Historical global GDP indicators'
  },
  {
    name: 'W3C Vector Graphics (SVG)',
    category: 'Image (SVG)',
    url: 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/star.svg',
    icon: ImageIcon,
    description: 'W3C geometric SVG illustration'
  },
  {
    name: 'Standard HTML5 Audio (MP3)',
    category: 'Media (Audio)',
    url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg',
    icon: Music,
    description: 'Google Actions audio test stream'
  }
];

// Helper to convert GitHub blob URLs to direct raw links
export function normalizeFileUrl(url: string): { normalizedUrl: string; wasConverted: boolean } {
  let trimmed = url.trim();
  let wasConverted = false;

  // GitHub: https://github.com/{owner}/{repo}/blob/{branch}/{path} -> https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
  const ghMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
  if (ghMatch) {
    trimmed = `https://raw.githubusercontent.com/${ghMatch[1]}/${ghMatch[2]}/${ghMatch[3]}/${ghMatch[4]}`;
    wasConverted = true;
  }

  // GitLab: https://gitlab.com/{owner}/{repo}/-/blob/{branch}/{path} -> https://gitlab.com/{owner}/{repo}/-/raw/{branch}/{path}
  const glMatch = trimmed.match(/^https?:\/\/gitlab\.com\/([^/]+)\/([^/]+)\/-\/blob\/([^/]+)\/(.+)$/i);
  if (glMatch) {
    trimmed = `https://gitlab.com/${glMatch[1]}/${glMatch[2]}/-/raw/${glMatch[3]}/${glMatch[4]}`;
    wasConverted = true;
  }

  return { normalizedUrl: trimmed, wasConverted };
}

// Map content types to extensions
const MIME_EXT_MAP: Record<string, string> = {
  'application/json': '.json',
  'application/pdf': '.pdf',
  'text/html': '.html',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'application/javascript': '.js',
  'text/javascript': '.js',
  'text/x-python': '.py',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'application/zip': '.zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

export const OpenFileFromUrlModal: React.FC<OpenFileFromUrlModalProps> = ({
  isOpen,
  onClose,
  onFileLoaded,
  onNotify
}) => {
  const [url, setUrl] = useState<string>('');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [useCorsProxy, setUseCorsProxy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedConversion, setDetectedConversion] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setStatusMessage('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setErrorMessage(null);
    const { wasConverted } = normalizeFileUrl(val);
    setDetectedConversion(wasConverted);
  };

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid HTTP or HTTPS URL.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMessage('URL must start with http:// or https://');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Connecting to remote host...');

    const { normalizedUrl } = normalizeFileUrl(trimmed);

    try {
      let response: Response | null = null;
      let usedProxy = false;

      // 1. First attempt: Direct fetch
      try {
        setStatusMessage(`Fetching: ${normalizedUrl.substring(0, 60)}...`);
        response = await fetch(normalizedUrl, {
          headers: {
            'Accept': '*/*'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (directErr: any) {
        // If direct fetch fails and CORS proxy is allowed, try fallback
        if (useCorsProxy) {
          setStatusMessage('Direct fetch blocked by CORS. Retrying via secure CORS proxy...');
          usedProxy = true;
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
          response = await fetch(proxyUrl);
          if (!response.ok) {
            // Second proxy attempt
            const fallbackProxy = `https://corsproxy.io/?url=${encodeURIComponent(normalizedUrl)}`;
            response = await fetch(fallbackProxy);
          }
        } else {
          throw directErr;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Could not fetch file (${response ? response.status : 'Network error'}). Ensure the URL is publicly accessible.`);
      }

      setStatusMessage('Downloading stream into local memory...');
      const blob = await response.blob();

      // Extract filename from:
      // 1. Custom input if provided
      // 2. Content-Disposition header
      // 3. URL pathname
      // 4. Content-Type extension
      let filename = customFilename.trim();

      if (!filename) {
        const disposition = response.headers.get('content-disposition');
        if (disposition) {
          const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
          if (match && match[1]) {
            filename = decodeURIComponent(match[1]);
          }
        }
      }

      if (!filename) {
        try {
          const urlObj = new URL(normalizedUrl);
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          const lastSeg = pathSegments[pathSegments.length - 1];
          if (lastSeg && lastSeg.includes('.')) {
            filename = decodeURIComponent(lastSeg);
          } else if (lastSeg) {
            filename = decodeURIComponent(lastSeg);
          }
        } catch (_) {}
      }

      // Check extension & fallback from MIME
      const contentType = (response.headers.get('content-type') || blob.type || '').split(';')[0].trim().toLowerCase();
      if (!filename) {
        const ext = MIME_EXT_MAP[contentType] || '.bin';
        filename = `remote-file-${Date.now()}${ext}`;
      } else if (!filename.includes('.')) {
        const ext = MIME_EXT_MAP[contentType] || '';
        if (ext) filename += ext;
      }

      setStatusMessage('Instantiating file in local studio workspace...');
      const file = new File([blob], filename, {
        type: blob.type || contentType || 'application/octet-stream',
        lastModified: Date.now()
      });

      onFileLoaded(file, normalizedUrl);
      if (onNotify) {
        onNotify('success', 'Remote File Loaded', `Successfully opened "${filename}" (${(blob.size / 1024).toFixed(1)} KB)${usedProxy ? ' via CORS proxy' : ''}.`);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? 'Network / CORS error: The remote server prohibits cross-origin browser downloads. Ensure "Use CORS Proxy" is checked to bypass origin restrictions.'
          : err.message || 'Unknown network error occurred.'
      );
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleApplyPreset = (preset: PresetUrl) => {
    setUrl(preset.url);
    handleUrlChange(preset.url);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Open File from URL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  HTTP / HTTPS
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly stream code, documents, media, or datasets into OmniView.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* URL Input Form */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Web Address / Direct File URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleFetch();
                  }
                }}
                placeholder="https://raw.githubusercontent.com/... or https://api.example.com/data.json"
                className="w-full pl-9 pr-24 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 font-mono transition-all"
              />
              <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                {url && (
                  <button
                    onClick={() => {
                      setUrl('');
                      setDetectedConversion(false);
                      setErrorMessage(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={async () => {
                    try {
                      const clip = await navigator.clipboard.readText();
                      if (clip) {
                        setUrl(clip);
                        handleUrlChange(clip);
                      }
                    } catch (_) {}
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg cursor-pointer transition-colors"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Smart GitHub Converter Notice */}
            {detectedConversion && (
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center gap-2 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Detected GitHub / GitLab web link! Automatically converted to raw direct stream URL.</span>
              </div>
            )}
          </div>

          {/* Optional Custom Filename */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Custom Tab Name <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">Leave blank to auto-detect from headers</span>
            </div>
            <input
              type="text"
              value={customFilename}
              onChange={e => setCustomFilename(e.target.value)}
              placeholder="e.g. script.py or dataset.json"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
          </div>

          {/* Options: CORS Proxy */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                  Automatic CORS Proxy Fallback
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Bypasses browser cross-origin limits if host server blocks direct browser fetch
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useCorsProxy}
                onChange={e => setUseCorsProxy(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-xs block">Fetch Notice</span>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Loading Progress State */}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              <span className="text-xs font-medium">{statusMessage || 'Loading remote file...'}</span>
            </div>
          )}

          {/* Preset Quick Samples */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Or Try Live Sample Datasets & Code</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_URLS.map(preset => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 transition-colors shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate flex-1">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {preset.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Files stream safely into client browser memory only</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleFetch}
              disabled={isLoading || !url.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Fetch & Open File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
