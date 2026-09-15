/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Localhost & Private Network Access Permission Gateway Modal (shadcn/ui + Radix UI)
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Check,
  Terminal,
  Info,
  Server,
  Code2,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

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
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden font-sans">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">Localhost Network Request</DialogTitle>
                <Badge variant="secondary" className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                  Permission Required
                </Badge>
              </div>
              <DialogDescription className="text-xs mt-0.5">
                Target host: Private / Localhost Gateway
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <ScrollArea className="max-h-[60vh] p-5 space-y-4 text-xs">
          {/* Target URL Banner */}
          <Card className="p-3.5 bg-muted/40 border-border space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-primary" />
                Target Local Endpoint
              </span>
              <Badge variant="outline" className="font-mono text-[10px] font-bold text-emerald-500">
                {method}
              </Badge>
            </div>
            <div className="p-2 bg-background rounded-lg border border-border font-mono text-xs text-amber-500 break-all select-all">
              {targetUrl}
            </div>
          </Card>

          {/* Explanation info */}
          <Card className="bg-primary/5 border-primary/20 p-4 space-y-2 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>Why is permission required?</span>
            </div>
            <p className="leading-relaxed">
              Modern web browsers enforce <strong>Private Network Access (PNA)</strong> and <strong>Cross-Origin Resource Sharing (CORS)</strong> specifications when a web app communicates with your computer&apos;s local daemon (<code>localhost</code>, <code>127.0.0.1</code>, or <code>192.168.x.x</code>).
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
              <li>Your local service must permit CORS headers (<code>Access-Control-Allow-Origin: *</code>).</li>
              <li>Requests run strictly from your browser to your machine without any external telemetry.</li>
            </ul>
          </Card>

          {/* Remember option */}
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border mt-3">
            <input
              type="checkbox"
              id="remember-session"
              checked={rememberSession}
              onChange={e => setRememberSession(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
            <label htmlFor="remember-session" className="text-xs text-foreground font-medium cursor-pointer select-none">
              Remember my permission for localhost requests during this session
            </label>
          </div>

          {/* Collapsible Local CORS Guide */}
          <Card className="overflow-hidden border border-border mt-3">
            <button
              onClick={() => setShowCorsGuide(!showCorsGuide)}
              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-500" />
                <span>Need help configuring CORS on your local server?</span>
              </div>
              {showCorsGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCorsGuide && (
              <div className="p-3.5 border-t border-border space-y-3 bg-muted/20">
                <div className="flex items-center gap-2 text-xs">
                  <Button
                    variant={selectedGuideLang === 'express' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGuideLang('express')}
                    className="h-6 text-[11px]"
                  >
                    Node.js Express
                  </Button>
                  <Button
                    variant={selectedGuideLang === 'python' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGuideLang('python')}
                    className="h-6 text-[11px]"
                  >
                    Python FastAPI
                  </Button>
                  <Button
                    variant={selectedGuideLang === 'go' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGuideLang('go')}
                    className="h-6 text-[11px]"
                  >
                    Go (net/http)
                  </Button>
                </div>

                <div className="p-3 bg-background rounded-lg border border-border font-mono text-[11px] text-emerald-600 dark:text-emerald-400 overflow-x-auto">
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
          </Card>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-muted/40 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCurl}
            className="text-xs h-8 gap-1.5"
            title="Copy command to run in your Terminal / Command Prompt"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? 'cURL Copied!' : 'Copy cURL Command'}</span>
          </Button>

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
              onClick={handleGrant}
              className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Allow & Run Request</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
