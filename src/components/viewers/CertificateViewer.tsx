/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * SSL/TLS Certificate & Cryptographic Key Inspector
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Key,
  Lock,
  Copy,
  Check,
  FileCheck,
  AlertTriangle,
  Fingerprint,
  Calendar,
  Layers,
  Code
} from 'lucide-react';

interface CertificateViewerProps {
  textContent?: string;
  arrayBuffer?: ArrayBuffer;
  filename?: string;
}

interface PemBlock {
  type: string;
  body: string;
  raw: string;
  lineStart: number;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  textContent = '',
  arrayBuffer,
  filename = 'certificate.pem'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual');

  // Parse PEM Blocks
  const pemBlocks = useMemo<PemBlock[]>(() => {
    const blocks: PemBlock[] = [];
    const regex = /-----BEGIN ([A-Z0-9 -]+)-----([\s\S]*?)-----END \1-----/g;
    let match;

    while ((match = regex.exec(textContent)) !== null) {
      blocks.push({
        type: match[1].trim(),
        body: match[2].replace(/\s+/g, ''),
        raw: match[0],
        lineStart: textContent.slice(0, match.index).split('\n').length
      });
    }

    return blocks;
  }, [textContent]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-slate-200">Certificate & Key Inspector</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            {pemBlocks.length > 0 ? `${pemBlocks.length} PEM Object(s)` : 'Raw Security Key / DER'}
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">{filename}</span>
        </div>

        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'visual' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security Cards
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'raw' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Raw Text
          </button>
        </div>
      </div>

      {activeTab === 'raw' ? (
        <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-slate-950 text-slate-300 leading-relaxed select-text">
          <pre>{textContent}</pre>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto min-h-0">
          {pemBlocks.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-200">Binary or DER Certificate Object</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  This file appears to be in binary DER/PKCS#12 format or contains raw keys.
                </p>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 text-left overflow-auto max-h-60">
                <pre>{textContent || 'Binary credentials stream'}</pre>
              </div>
            </div>
          ) : (
            pemBlocks.map((block, idx) => {
              const isPrivate = block.type.includes('PRIVATE');
              const isCert = block.type.includes('CERTIFICATE') && !block.type.includes('REQUEST');
              const approxBits = block.body.length * 6; // approx bit length from base64

              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                >
                  {/* Top Block Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isPrivate
                            ? 'bg-rose-500/20 text-rose-400'
                            : isCert
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {isPrivate ? <Key className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                          <span>{block.type}</span>
                          {isPrivate && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase font-mono">
                              Secret Private Key
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          PEM Object #{idx + 1} &bull; Starting on line {block.lineStart}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(block.raw, `block-${idx}`)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === `block-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === `block-${idx}` ? 'Copied PEM' : 'Copy PEM'}</span>
                    </button>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-sans">Object Category</span>
                      <p className="text-slate-200 font-bold">
                        {isPrivate ? 'Asymmetric Private Key' : isCert ? 'X.509 Certificate' : 'Public Key / Request'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-sans">Estimated Key Size</span>
                      <p className="text-emerald-400 font-bold">
                        {approxBits > 3000 ? '4096-bit RSA/ECC' : approxBits > 1500 ? '2048-bit RSA' : 'ECC / Standard Key'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-sans">Payload Length</span>
                      <p className="text-purple-400 font-bold">{block.body.length} base64 chars</p>
                    </div>
                  </div>

                  {/* Base64 & Format Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      PEM Encoded Structure
                    </span>
                    <pre className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-48 select-all leading-relaxed">
                      {block.raw}
                    </pre>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
