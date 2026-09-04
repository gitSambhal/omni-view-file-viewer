/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Sun,
  Sliders,
  Info,
  Download,
  Move
} from 'lucide-react';
import { formatFileSize } from '../../services/fileDetector';

interface ImageViewerProps {
  objectUrl?: string;
  dataUrl?: string;
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  filename: string;
  size: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  objectUrl,
  dataUrl,
  arrayBuffer,
  textContent,
  filename,
  size
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [background, setBackground] = useState<'checker' | 'dark' | 'light'>('checker');
  const [inverted, setInverted] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  // Drag Panning state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (objectUrl) {
      setImgSrc(objectUrl);
    } else if (dataUrl) {
      setImgSrc(dataUrl);
    } else if (textContent && textContent.trim().startsWith('<svg')) {
      const blob = new Blob([textContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
      return () => URL.revokeObjectURL(url);
    } else if (arrayBuffer) {
      const blob = new Blob([arrayBuffer]);
      const url = URL.createObjectURL(blob);
      setImgSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [objectUrl, dataUrl, textContent, arrayBuffer]);

  // Handle Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom(prevZoom => {
      const newZoom = Math.min(1000, Math.max(10, Math.round(prevZoom * zoomFactor)));
      return newZoom;
    });
  };

  // Mouse Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setInverted(false);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-900 dark:bg-slate-950 text-slate-100 overflow-hidden select-none transition-colors">
      {/* Image Header Controls */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">
            <ImageIcon className="w-3.5 h-3.5" />
            Image Studio
          </div>
          {dimensions && (
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {dimensions.width} × {dimensions.height} px
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(10, z - 25))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono text-slate-800 dark:text-slate-200 w-12 text-center">
              {zoom}%
            </span>

            <button
              onClick={() => setZoom(z => Math.min(1000, z + 25))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Canvas Background toggle */}
          <button
            onClick={() => setBackground(b => (b === 'checker' ? 'dark' : b === 'dark' ? 'light' : 'checker'))}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
            title="Change Canvas Background (Checkerboard / Dark / Light)"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Invert */}
          <button
            onClick={() => setInverted(!inverted)}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              inverted
                ? 'bg-pink-600 text-white border-pink-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
            }`}
            title="Invert Colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Metadata */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              showMetadata
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
            }`}
            title="Toggle Metadata Inspector"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
            title="Reset Zoom & Pan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={imgSrc}
            download={filename}
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Main Image Interactive Stage */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden relative">
        <div
          ref={stageRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 flex items-center justify-center p-6 overflow-hidden cursor-grab active:cursor-grabbing relative ${
            background === 'checker'
              ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-950'
              : background === 'light'
              ? 'bg-white'
              : 'bg-slate-950'
          }`}
        >
          {imgSrc ? (
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                filter: inverted ? 'invert(1)' : 'none',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              className="inline-block transform-gpu"
            >
              <img
                src={imgSrc || undefined}
                alt={filename}
                onLoad={handleImageLoad}
                draggable={false}
                className="max-w-none rounded shadow-2xl pointer-events-none select-none"
              />
            </div>
          ) : (
            <div className="text-slate-500 text-xs">Loading image asset...</div>
          )}

          {/* Mouse Wheel Zoom Guide overlay badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 text-slate-300 text-[11px] font-mono px-3 py-1.5 rounded-full backdrop-blur border border-slate-700 flex items-center gap-1.5 pointer-events-none">
            <Move className="w-3 h-3 text-pink-400" /> Scroll wheel to Zoom | Click & Drag to Pan
          </div>
        </div>

        {/* Metadata Inspector Sidebar */}
        {showMetadata && (
          <div className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4 overflow-auto font-mono text-xs text-slate-700 dark:text-slate-300 shadow-xl">
            <h4 className="font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Image Metadata
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">File Name:</span>
                <span className="truncate max-w-[120px] font-semibold text-slate-800 dark:text-slate-200">{filename}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">Dimensions:</span>
                <span className="text-slate-800 dark:text-slate-200">{dimensions ? `${dimensions.width} × ${dimensions.height}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">Aspect Ratio:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {dimensions ? (dimensions.width / dimensions.height).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">File Size:</span>
                <span className="text-slate-800 dark:text-slate-200">{formatFileSize(size)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">Current Zoom:</span>
                <span className="text-slate-800 dark:text-slate-200">{zoom}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">Rotation:</span>
                <span className="text-slate-800 dark:text-slate-200">{rotation}°</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <span className="text-slate-400">Color Filter:</span>
                <span className="text-slate-800 dark:text-slate-200">{inverted ? 'Inverted' : 'Normal'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
