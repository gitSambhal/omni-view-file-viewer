/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useMemo } from 'react';
import { MapPin, Layers, Globe, Info, Code, Search, Database } from 'lucide-react';

interface GeoJsonViewerProps {
  textContent?: string;
  filename: string;
}

export const GeoJsonViewer: React.FC<GeoJsonViewerProps> = ({ textContent = '', filename }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'map' | 'raw'>('features');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const parsedGeoJson = useMemo(() => {
    if (!textContent) return null;
    try {
      return JSON.parse(textContent);
    } catch {
      return null;
    }
  }, [textContent]);

  const features = useMemo(() => {
    if (!parsedGeoJson) return [];
    if (parsedGeoJson.type === 'FeatureCollection' && Array.isArray(parsedGeoJson.features)) {
      return parsedGeoJson.features;
    }
    if (parsedGeoJson.type === 'Feature') {
      return [parsedGeoJson];
    }
    return [];
  }, [parsedGeoJson]);

  const filteredFeatures = useMemo(() => {
    if (!searchTerm) return features;
    const term = searchTerm.toLowerCase();
    return features.filter((f: any) => {
      const propsStr = JSON.stringify(f.properties || {}).toLowerCase();
      const geomType = String(f.geometry?.type || '').toLowerCase();
      return propsStr.includes(term) || geomType.includes(term);
    });
  }, [features, searchTerm]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 min-w-0 bg-slate-900 text-slate-100 font-sans text-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800 gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-slate-200">{filename}</span>
          <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {features.length} Geo Features
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'features' ? 'bg-rose-600 text-white font-medium shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Feature List
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'map' ? 'bg-rose-600 text-white font-medium shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Spatial Preview
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'raw' ? 'bg-rose-600 text-white font-medium shadow' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Raw JSON
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950">
        {activeTab === 'features' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-slate-400 font-mono">Parsed Map Properties & Coordinates</span>
              <div className="flex items-center bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <input
                  type="text"
                  placeholder="Filter feature properties..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none w-44 text-xs font-mono"
                />
              </div>
            </div>

            {filteredFeatures.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No GeoJSON features found or invalid format.
              </div>
            ) : (
              filteredFeatures.map((feat: any, idx: number) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-400 font-bold">Feature #{idx + 1}</span>
                    <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {feat.geometry?.type || 'Unknown Geometry'}
                    </span>
                  </div>

                  {/* Properties table */}
                  {feat.properties && Object.keys(feat.properties).length > 0 && (
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Properties</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                        {Object.entries(feat.properties).map(([k, v]) => (
                          <div key={k} className="bg-slate-900 p-1.5 rounded">
                            <span className="text-slate-400 block text-[10px]">{k}</span>
                            <span className="text-slate-200 font-semibold truncate block">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coordinates string preview */}
                  <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-400 overflow-x-auto">
                    <span className="text-slate-500">Coordinates: </span>
                    {JSON.stringify(feat.geometry?.coordinates || []).substring(0, 150)}...
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <Globe className="w-12 h-12 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-200">Interactive Spatial Map Preview</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Parsed {features.length} vector features from {filename}. Coordinates and properties extracted cleanly for offline GIS analysis.
            </p>
          </div>
        )}

        {activeTab === 'raw' && (
          <pre className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 overflow-auto whitespace-pre-wrap">
            {textContent}
          </pre>
        )}
      </div>
    </div>
  );
};
