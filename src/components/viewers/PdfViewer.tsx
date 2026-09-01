/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  AlertTriangle,
  Sidebar
} from 'lucide-react';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  objectUrl?: string;
  arrayBuffer?: ArrayBuffer;
  filename: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ objectUrl, arrayBuffer, filename }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Set download Blob URL
  useEffect(() => {
    if (objectUrl) {
      setPdfBlobUrl(objectUrl);
    } else if (arrayBuffer && arrayBuffer.byteLength > 0) {
      try {
        const blob = new Blob([arrayBuffer.slice(0)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Error creating pdf blob url:', e);
      }
    }
  }, [objectUrl, arrayBuffer]);

  // Load PDF Document
  useEffect(() => {
    let active = true;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        let data: ArrayBuffer | undefined;

        if (objectUrl) {
          const res = await fetch(objectUrl);
          data = await res.arrayBuffer();
        } else if (arrayBuffer && arrayBuffer.byteLength > 0) {
          data = arrayBuffer.slice(0);
        }

        if (!data || data.byteLength === 0) {
          throw new Error('No valid PDF data available.');
        }

        // Pass a copy so worker transfer doesn't detach any persistent buffer
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data.slice(0)) });
        const doc = await loadingTask.promise;

        if (active) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
        }
      } catch (err: any) {
        console.error('Error loading PDF with PDF.js:', err);
        if (active) {
          setError(err.message || 'Could not parse PDF file format.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      active = false;
    };
  }, [objectUrl, arrayBuffer]);

  // Render active page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let active = true;

    async function renderPage() {
      try {
        // Cancel ongoing render task if any
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        if (!active || !canvasRef.current) return;

        const scale = (zoom / 100) * 1.5;
        const viewport = page.getViewport({ scale, rotation });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.warn('PDF Page render warning:', err);
        }
      }
    }

    renderPage();

    return () => {
      active = false;
    };
  }, [pdfDoc, currentPage, zoom, rotation]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* PDF Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
            <FileText className="w-3.5 h-3.5" />
            PDF Reader Studio
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              showSidebar
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
            }`}
            title="Toggle Sidebar Page Directory"
          >
            <Sidebar className="w-4 h-4" />
          </button>
        </div>

        {/* Page Navigation Controls */}
        {numPages > 0 && (
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-slate-800 dark:text-slate-200">
              Page <strong>{currentPage}</strong> of <strong>{numPages}</strong>
            </span>

            <button
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom & Download */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(50, z - 25))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs text-slate-800 dark:text-slate-200 font-mono w-12 text-center">{zoom}%</span>

            <button
              onClick={() => setZoom(z => Math.min(250, z + 25))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <a
            href={pdfBlobUrl}
            download={filename}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        {/* Page Thumbnail Sidebar */}
        {showSidebar && numPages > 0 && (
          <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 overflow-auto space-y-2 font-mono text-xs">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Page Directory</span>
            {Array.from({ length: numPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-full py-2 px-3 rounded text-left flex items-center justify-between transition-colors ${
                  currentPage === i + 1
                    ? 'bg-red-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>Page {i + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* Canvas Stage */}
        <div className="flex-1 min-h-0 min-w-0 bg-slate-200 dark:bg-slate-950 flex justify-center items-start overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-mono">Parsing PDF document pages...</p>
            </div>
          ) : error ? (
            <div className="max-w-md p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-4 my-auto">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">PDF Preview Fallback</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{error}</p>
              </div>

              {pdfBlobUrl && (
                <div className="pt-2">
                  <iframe
                    src={pdfBlobUrl}
                    title={filename}
                    className="w-full h-64 rounded border border-slate-300 dark:border-slate-800 mb-3"
                  />
                  <a
                    href={pdfBlobUrl}
                    download={filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Document</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-2xl rounded p-2 border border-slate-300 dark:border-slate-800 inline-block transition-transform">
              <canvas ref={canvasRef} className="max-w-full h-auto block rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
