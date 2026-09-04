/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Presentation, ChevronLeft, ChevronRight, Eye, Grid } from 'lucide-react';

interface SlideData {
  id: number;
  title: string;
  texts: string[];
}

interface PptxViewerProps {
  arrayBuffer?: ArrayBuffer;
  filename: string;
}

export const PptxViewer: React.FC<PptxViewerProps> = ({ arrayBuffer, filename }) => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function parsePptx() {
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        setError('No presentation file data available.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slideFiles: { name: string; file: JSZip.JSZipObject }[] = [];

        zip.folder('ppt/slides')?.forEach((relativePath, file) => {
          if (relativePath.startsWith('slide') && relativePath.endsWith('.xml')) {
            slideFiles.push({ name: relativePath, file });
          }
        });

        // Sort slide files numerically
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.name.replace(/[^0-9]/g, ''), 10) || 0;
          const numB = parseInt(b.name.replace(/[^0-9]/g, ''), 10) || 0;
          return numA - numB;
        });

        const parsedSlides: SlideData[] = [];

        for (let i = 0; i < slideFiles.length; i++) {
          const xmlText = await slideFiles[i].file.async('text');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          const textNodes = xmlDoc.getElementsByTagName('a:t');
          const texts: string[] = [];
          for (let j = 0; j < textNodes.length; j++) {
            const val = textNodes[j].textContent?.trim();
            if (val) texts.push(val);
          }

          const title = texts[0] || `Slide ${i + 1}`;
          parsedSlides.push({
            id: i + 1,
            title,
            texts: texts.length > 0 ? texts : ['[Empty slide content]']
          });
        }

        if (parsedSlides.length === 0) {
          parsedSlides.push({
            id: 1,
            title: filename,
            texts: ['Presentation file loaded. Click slide items to explore extracted textual content.']
          });
        }

        setSlides(parsedSlides);
      } catch (err: any) {
        console.error('Error parsing PPTX presentation:', err);
        setError(err.message || 'Could not parse PPTX archive. Ensure the presentation is a valid PowerPoint file.');
      } finally {
        setLoading(false);
      }
    }

    parsePptx();
  }, [arrayBuffer, filename]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-900 text-slate-100 overflow-hidden">
      {/* PPTX Header Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
          <Presentation className="w-3.5 h-3.5" />
          PowerPoint Presentation (.pptx)
        </div>

        {slides.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('slide')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'slide' ? 'bg-amber-600 text-white font-medium' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Slide View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-amber-600 text-white font-medium' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              All Slides ({slides.length})
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-slate-950 p-6 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Extracting presentation slides...</p>
          </div>
        ) : error || slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md bg-slate-900 border border-slate-800 rounded-2xl">
            <Presentation className="w-12 h-12 text-amber-500/80 mb-3" />
            <h3 className="text-base font-semibold text-slate-200 mb-1">Unable to Load Slides</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'No readable XML slides were detected inside this PPTX archive.'}
            </p>
          </div>
        ) : viewMode === 'slide' && currentSlide ? (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-4">
            {/* Slide Stage */}
            <div className="w-full aspect-[16/9] bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>

              <div>
                <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  Slide {currentSlide.id} of {slides.length}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 tracking-tight">
                  {currentSlide.title}
                </h2>
              </div>

              <div className="my-auto space-y-3 max-h-60 overflow-auto pr-2">
                {currentSlide.texts.slice(1).map((txt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-200 text-sm md:text-base leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
                <span>{filename}</span>
                <span>OmniView Presentation Reader</span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                className="p-1.5 rounded-full hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono text-slate-300">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <button
                disabled={currentSlideIndex >= slides.length - 1}
                onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                className="p-1.5 rounded-full hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Grid View of all slides */
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((sd, idx) => (
              <div
                key={sd.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setViewMode('slide');
                }}
                className={`cursor-pointer bg-slate-900 border rounded-xl p-5 hover:border-amber-500 transition-all transform hover:-translate-y-1 ${
                  idx === currentSlideIndex ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
                  <span>Slide {sd.id}</span>
                  <span className="text-slate-500 font-normal">{sd.texts.length} elements</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm truncate mb-3">{sd.title}</h4>
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                  {sd.texts.slice(1).join(' ') || 'Slide content preview'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
