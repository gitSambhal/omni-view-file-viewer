/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Typographic Font & Glyph Specimen Studio (.ttf, .otf, .woff, .woff2)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Type,
  Sliders,
  Grid,
  List,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface FontViewerProps {
  arrayBuffer?: ArrayBuffer;
  filename?: string;
}

const SAMPLE_TEXT_OPTIONS = [
  'The quick brown fox jumps over the lazy dog',
  'Sphinx of black quartz, judge my vow',
  'Pack my box with five dozen liquor jugs',
  'How razorback-jumping frogs can level six piqued gymnasts!',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%^&*()',
  'Jackdaws love my big sphinx of quartz'
];

export const FontViewer: React.FC<FontViewerProps> = ({
  arrayBuffer,
  filename = 'custom_font.ttf'
}) => {
  const [fontFamilyName, setFontFamilyName] = useState<string>('CustomPreviewFont');
  const [customText, setCustomText] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [activeTab, setActiveTab] = useState<'waterfall' | 'glyphs' | 'specimen'>('waterfall');
  const [fontSize, setFontSize] = useState<number>(36);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [copiedGlyph, setCopiedGlyph] = useState<string | null>(null);

  // Dynamic Font Registration via FontFace API
  useEffect(() => {
    if (!arrayBuffer) return;
    const fontId = `OmniViewFont_${Date.now()}`;
    setFontFamilyName(fontId);

    try {
      const font = new FontFace(fontId, arrayBuffer);
      font.load().then(loadedFont => {
        document.fonts.add(loadedFont);
      }).catch(err => {
        console.warn('FontFace load error:', err);
      });
    } catch (e) {
      console.warn('FontFace API error:', e);
    }
  }, [arrayBuffer]);

  // Standard Glyph Sets (Latin, Numbers, Symbols)
  const glyphs = useMemo(() => {
    const chars: string[] = [];
    // Uppercase
    for (let i = 65; i <= 90; i++) chars.push(String.fromCharCode(i));
    // Lowercase
    for (let i = 97; i <= 122; i++) chars.push(String.fromCharCode(i));
    // Numbers
    for (let i = 48; i <= 57; i++) chars.push(String.fromCharCode(i));
    // Punctuation & Symbols
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\§±©®™€£¥₹';
    for (const s of symbols) chars.push(s);
    return chars;
  }, []);

  const handleCopyChar = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopiedGlyph(char);
    setTimeout(() => setCopiedGlyph(null), 1500);
  };

  const waterfallSizes = [12, 16, 20, 24, 32, 40, 48, 64, 72];

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-pink-400" />
            <span className="font-bold text-sm text-slate-200">Typography & Font Studio</span>
          </div>
          <span className="text-xs font-mono text-slate-400 truncate max-w-xs">{filename}</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('waterfall')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'waterfall' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Waterfall
          </button>
          <button
            onClick={() => setActiveTab('glyphs')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'glyphs' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Glyphs ({glyphs.length})
          </button>
          <button
            onClick={() => setActiveTab('specimen')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specimen' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Interactive Specimen
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex-1 min-w-[280px]">
          <input
            type="text"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="Type sample sentence..."
            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Quick presets */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 font-semibold">Presets:</span>
          {SAMPLE_TEXT_OPTIONS.slice(0, 2).map((opt, i) => (
            <button
              key={i}
              onClick={() => setCustomText(opt)}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 truncate max-w-[140px] cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {/* 1. Waterfall View */}
        {activeTab === 'waterfall' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {waterfallSizes.map(sz => (
              <div key={sz} className="space-y-2 border-b border-slate-800/60 pb-6">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{sz}px</span>
                  <span>{sz * 0.75}pt</span>
                </div>
                <div
                  style={{
                    fontFamily: fontFamilyName,
                    fontSize: `${sz}px`,
                    lineHeight: 1.3
                  }}
                  className="text-slate-100 break-words select-text"
                >
                  {customText || 'The quick brown fox jumps over the lazy dog'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Glyph Character Grid View */}
        {activeTab === 'glyphs' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Standard Character Set ({glyphs.length} glyphs)</span>
              <span>Click any glyph to copy character</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2.5">
              {glyphs.map((char, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyChar(char)}
                  className="p-3 bg-slate-950 hover:bg-pink-900/30 border border-slate-800 hover:border-pink-500/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-sm"
                >
                  <span
                    style={{ fontFamily: fontFamilyName }}
                    className="text-2xl text-slate-100 group-hover:text-pink-300 group-hover:scale-110 transition-transform"
                  >
                    {char}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-pink-400">
                    {char.charCodeAt(0).toString(16).toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Interactive Specimen Customizer */}
        {activeTab === 'specimen' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Font Size</span>
                  <span className="font-mono font-bold text-pink-400">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Letter Spacing</span>
                  <span className="font-mono font-bold text-pink-400">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="20"
                  value={letterSpacing}
                  onChange={e => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Line Height</span>
                  <span className="font-mono font-bold text-pink-400">{lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={e => setLineHeight(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Editable Canvas */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 min-h-[360px] shadow-2xl">
              <div
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontFamily: fontFamilyName,
                  fontSize: `${fontSize}px`,
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: lineHeight
                }}
                className="outline-none text-slate-100 select-text break-words"
              >
                {customText}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
