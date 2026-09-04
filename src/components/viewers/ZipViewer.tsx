/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Archive, File, Download, Search, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import { formatFileSize } from '../../services/fileDetector';

interface ZipFileItem {
  name: string;
  size: number;
  uncompressedSize: number;
  isFolder: boolean;
  date: Date;
  fileObj: JSZip.JSZipObject;
}

interface ZipViewerProps {
  arrayBuffer?: ArrayBuffer;
  filename: string;
  onPreviewExtractedFile?: (name: string, content: string | ArrayBuffer) => void;
}

export const ZipViewer: React.FC<ZipViewerProps> = ({ arrayBuffer, filename, onPreviewExtractedFile }) => {
  const [zipItems, setZipItems] = useState<ZipFileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<{ name: string; text?: string; isImage?: boolean; url?: string } | null>(null);

  useEffect(() => {
    async function parseZip() {
      if (!arrayBuffer) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const zip = await JSZip.loadAsync(arrayBuffer);
        const items: ZipFileItem[] = [];

        zip.forEach((relativePath, fileObj) => {
          items.push({
            name: relativePath,
            size: (fileObj as any)._data?.compressedSize || 0,
            uncompressedSize: (fileObj as any)._data?.uncompressedSize || 0,
            isFolder: fileObj.dir,
            date: fileObj.date || new Date(),
            fileObj
          });
        });

        items.sort((a, b) => (a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : a.isFolder ? -1 : 1));
        setZipItems(items);
      } catch (err) {
        console.error('Error parsing Zip archive:', err);
      } finally {
        setLoading(false);
      }
    }
    parseZip();
  }, [arrayBuffer]);

  const filteredItems = zipItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleInspectFile = async (item: ZipFileItem) => {
    if (item.isFolder) return;
    try {
      const ext = item.name.split('.').pop()?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) {
        const blob = await item.fileObj.async('blob');
        const url = URL.createObjectURL(blob);
        setPreviewContent({ name: item.name, isImage: true, url });
      } else {
        const text = await item.fileObj.async('text');
        setPreviewContent({ name: item.name, text });
      }
    } catch (e) {
      console.error('Failed to extract file from zip', e);
    }
  };

  const handleDownloadFile = async (item: ZipFileItem) => {
    const blob = await item.fileObj.async('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name.split('/').pop() || item.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-500/20">
          <Archive className="w-3.5 h-3.5" />
          Archive Explorer ({zipItems.length} files)
        </div>

        <div className="flex items-center bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <input
            type="text"
            placeholder="Search files inside archive..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-44 text-xs"
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        {/* Zip Files Table */}
        <div className="flex-1 min-h-0 min-w-0 overflow-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Reading archive directory...
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300">
                  <th className="p-2.5 border-b border-slate-700">File Name</th>
                  <th className="p-2.5 border-b border-slate-700">Size</th>
                  <th className="p-2.5 border-b border-slate-700">Uncompressed</th>
                  <th className="p-2.5 border-b border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                {filteredItems.map(item => (
                  <tr key={item.name} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-2.5 text-slate-200 flex items-center gap-2">
                      {item.isFolder ? (
                        <Archive className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className={item.isFolder ? 'font-semibold text-amber-300' : ''}>{item.name}</span>
                    </td>
                    <td className="p-2.5 text-slate-400">{formatFileSize(item.size)}</td>
                    <td className="p-2.5 text-slate-400">{formatFileSize(item.uncompressedSize)}</td>
                    <td className="p-2.5 text-right space-x-2">
                      {!item.isFolder && (
                        <>
                          <button
                            onClick={() => handleInspectFile(item)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                          <button
                            onClick={() => handleDownloadFile(item)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Save
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* File Preview Sidebar */}
        {previewContent && (
          <div className="w-1/2 bg-slate-950 border-l border-slate-800 flex flex-col h-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-300 truncate">{previewContent.name}</span>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 rounded p-3 border border-slate-800">
              {previewContent.isImage ? (
                <img src={previewContent.url || undefined} alt="Zip File preview" className="max-w-full max-h-full object-contain mx-auto" />
              ) : (
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">{previewContent.text}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
