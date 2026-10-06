/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import {
  FileText,
  Eye,
  Code,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Copy,
  Printer,
  Sparkles,
  Search,
  Check
} from 'lucide-react';

interface DocxViewerProps {
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
}

export const DocxViewer: React.FC<DocxViewerProps> = ({ arrayBuffer, textContent, filename }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function parseDocx() {
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        if (textContent) {
          setRawText(textContent);
          setHtmlContent(`<pre class="whitespace-pre-wrap font-sans text-sm">${textContent}</pre>`);
        } else {
          setError('No document data available to display.');
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert DOCX to HTML using mammoth with custom style mappings
        const result = await mammoth.convertToHtml(
          { arrayBuffer: arrayBuffer.slice(0) },
          {
            styleMap: [
              "p[style-name='Title'] => h1.docx-title:fresh",
              "p[style-name='Subtitle'] => p.docx-subtitle:fresh",
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Quote'] => blockquote:fresh",
              "p[style-name='Intense Quote'] => blockquote.intense-quote:fresh"
            ],
            convertImage: ((element: any) => {
              return element.read("base64").then((imageBuffer: string) => {
                return {
                  src: "data:" + element.contentType + ";base64," + imageBuffer
                };
              });
            }) as any
          }
        );

        const textResult = await mammoth.extractRawText({ arrayBuffer });
        setHtmlContent(result.value);
        setRawText(textResult.value);
      } catch (err: any) {
        console.error('Error parsing docx:', err);
        setError('Could not render DOCX layout. Displaying raw text fallback.');
        if (textContent) {
          setRawText(textContent);
        }
      } finally {
        setLoading(false);
      }
    }

    parseDocx();
  }, [arrayBuffer, textContent]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.6; }
              h1, h2, h3 { color: #1e293b; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const wordCount = rawText ? rawText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = rawText ? rawText.length : 0;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-[#F8F9FA] dark:bg-[#1F1F1F] text-foreground overflow-hidden font-sans">
      {/* Document Sub-bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-card border-b border-border/80 gap-2 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Document</span>
          </span>
          <span aria-hidden="true" className="text-border">·</span>
          <span className="hidden sm:inline"><strong className="font-mono text-foreground font-normal">{wordCount}</strong> words</span>
          <span aria-hidden="true" className="text-border hidden sm:inline">·</span>
          <span className="hidden sm:inline"><strong className="font-mono text-foreground font-normal">{charCount}</strong> chars</span>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 flex-1 max-w-xs mx-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-secondary/60 text-xs text-foreground placeholder:text-muted-foreground rounded-md border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Mode switch & Search */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center p-0.5 bg-secondary/80 rounded-md border border-border/60">
            <button
              onClick={() => setViewMode('formatted')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'formatted'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formatted</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-card text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Plain Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document View Stage: QuickLook & Notion Clean Canvas */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto p-4 md:p-8 bg-muted/30 dark:bg-background flex justify-center items-start">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium">Parsing document layout & embedded media...</p>
          </div>
        ) : error ? (
          <div className="max-w-xl p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-300 mb-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
            <pre className="mt-3 p-3 bg-card rounded-lg text-foreground whitespace-pre-wrap font-mono text-xs max-h-96 overflow-auto border border-border">
              {rawText}
            </pre>
          </div>
        ) : viewMode === 'formatted' ? (
          /* Elevated Document Sheet */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[850px] bg-card text-card-foreground p-10 md:p-14 rounded-xl shadow-md border border-border/70 transition-all min-h-[1056px] my-4"
          >
            {/* Embedded CSS rules for Word DOCX styling */}
            <style>{`
              .docx-container h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; line-height: 1.25; }
              .docx-container h1.docx-title { font-size: 2.5rem; color: #1e3a8a; border-bottom: none; text-align: center; }
              .docx-container p.docx-subtitle { font-size: 1.125rem; color: #64748b; text-align: center; margin-bottom: 2rem; }
              .docx-container h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 1.25rem; margin-bottom: 0.5rem; }
              .docx-container h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1rem; margin-bottom: 0.5rem; }
              .docx-container h4 { font-size: 1rem; font-weight: 600; color: #475569; margin-top: 0.75rem; margin-bottom: 0.25rem; }
              .docx-container p { font-size: 0.975rem; line-height: 1.7; color: #334155; margin-bottom: 1rem; text-align: justify; }
              .docx-container ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
              .docx-container ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
              .docx-container li { font-size: 0.975rem; line-height: 1.6; color: #334155; margin-bottom: 0.35rem; }
              .docx-container table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
              .docx-container th { background-color: #f1f5f9; color: #0f172a; font-weight: 700; border: 1px solid #cbd5e1; padding: 0.625rem 0.875rem; text-align: left; }
              .docx-container td { border: 1px solid #e2e8f0; padding: 0.5rem 0.875rem; color: #334155; }
              .docx-container tr:nth-child(even) td { background-color: #f8fafc; }
              .docx-container blockquote { border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 0.75rem 1.25rem; margin: 1.25rem 0; font-style: italic; color: #1e40af; border-radius: 0 0.5rem 0.5rem 0; }
              .docx-container blockquote.intense-quote { border-left: 4px solid #8b5cf6; background-color: #f5f3ff; color: #5b21b6; }
              .docx-container img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 1rem auto; display: block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
              .docx-container a { color: #2563eb; text-decoration: underline; text-underline-offset: 2px; }
              .docx-container strong { font-weight: 700; color: #0f172a; }
              .docx-container em { font-style: italic; }
              .docx-container u { text-decoration: underline; }
            `}</style>

            <div
              className="docx-container font-sans"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap overflow-auto max-h-full shadow-lg">
            {rawText}
          </div>
        )}
      </div>
    </div>
  );
};
