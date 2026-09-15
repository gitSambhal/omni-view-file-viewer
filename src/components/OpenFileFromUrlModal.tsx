/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Open File From URL Dialog (shadcn/ui)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Download,
  AlertCircle,
  X,
  Sparkles,
  Link2,
  FileCode,
  FileText,
  Music,
  Table,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';

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

export function normalizeFileUrl(url: string): { normalizedUrl: string; wasConverted: boolean } {
  let trimmed = url.trim();
  let wasConverted = false;

  const ghMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
  if (ghMatch) {
    trimmed = `https://raw.githubusercontent.com/${ghMatch[1]}/${ghMatch[2]}/${ghMatch[3]}/${ghMatch[4]}`;
    wasConverted = true;
  }

  const glMatch = trimmed.match(/^https?:\/\/gitlab\.com\/([^/]+)\/([^/]+)\/-\/blob\/([^/]+)\/(.+)$/i);
  if (glMatch) {
    trimmed = `https://gitlab.com/${glMatch[1]}/${glMatch[2]}/-/raw/${glMatch[3]}/${glMatch[4]}`;
    wasConverted = true;
  }

  return { normalizedUrl: trimmed, wasConverted };
}

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
        if (useCorsProxy) {
          setStatusMessage('Direct fetch blocked by CORS. Retrying via secure CORS proxy...');
          usedProxy = true;
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
          response = await fetch(proxyUrl);
          if (!response.ok) {
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
          ? 'Network / CORS error: The remote server prohibits cross-origin browser downloads. Ensure "Use CORS Proxy" is enabled to bypass origin restrictions.'
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
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">Open File from URL</DialogTitle>
                <Badge variant="outline" className="font-mono text-[10px]">HTTP / HTTPS</Badge>
              </div>
              <DialogDescription className="text-xs mt-0.5">
                Directly stream code, documents, media, or datasets into OmniView.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <ScrollArea className="max-h-[60vh] p-4 sm:p-5 space-y-4 text-xs">
          {/* URL Input Form */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Web Address / Direct File URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Link2 className="w-4 h-4" />
              </div>
              <Input
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
                className="pl-9 pr-20 text-xs font-mono bg-background"
              />
              <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                {url && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setUrl('');
                      setDetectedConversion(false);
                      setErrorMessage(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      const clip = await navigator.clipboard.readText();
                      if (clip) {
                        setUrl(clip);
                        handleUrlChange(clip);
                      }
                    } catch (_) {}
                  }}
                  className="h-6 px-2 text-[11px] text-primary"
                >
                  Paste
                </Button>
              </div>
            </div>

            {detectedConversion && (
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-foreground flex items-center gap-2 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Detected GitHub / GitLab link! Converted to direct raw URL automatically.</span>
              </div>
            )}
          </div>

          {/* Optional Custom Filename */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Custom Tab Name <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Leave blank to auto-detect from headers</span>
            </div>
            <Input
              type="text"
              value={customFilename}
              onChange={e => setCustomFilename(e.target.value)}
              placeholder="e.g. script.py or dataset.json"
              className="text-xs font-mono bg-background h-8"
            />
          </div>

          {/* Options: CORS Proxy */}
          <div className="p-3 bg-card rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-medium text-xs text-foreground block">
                  Automatic CORS Proxy Fallback
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Bypasses browser cross-origin restrictions for public files
                </span>
              </div>
            </div>
            <Switch
              checked={useCorsProxy}
              onCheckedChange={setUseCorsProxy}
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-xs block">Fetch Notice</span>
                <p className="text-[11px] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Loading Progress State */}
          {isLoading && (
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span className="text-xs font-medium">{statusMessage || 'Loading remote file...'}</span>
            </div>
          )}

          {/* Preset Quick Samples */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Or Try Live Sample Datasets & Code</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_URLS.map(preset => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-muted text-left transition-all cursor-pointer group flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate flex-1">
                      <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {preset.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border bg-muted/40 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Files stream safely into local browser memory</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleFetch}
              disabled={isLoading || !url.trim()}
              className="text-xs h-8 gap-1.5"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Fetch & Open</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
