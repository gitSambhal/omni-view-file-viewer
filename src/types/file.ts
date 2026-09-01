/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

export type FileCategory =
  | 'pdf'
  | 'docx'
  | 'excel'
  | 'pptx'
  | 'code'
  | 'markdown'
  | 'database'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'json'
  | 'text'
  | 'log'
  | 'subtitle'
  | 'geojson'
  | 'ebook'
  | 'http'
  | 'binary'
  | 'font'
  | 'certificate'
  | 'hex';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
  category: FileCategory;
  dimensions?: { width: number; height: number };
  duration?: number;
  encoding?: string;
  path?: string;
}

export interface TabFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
  category: FileCategory;
  activeReader?: FileCategory; // Dynamic reader mode override
  
  // Data representations
  fileRaw?: File;
  fileHandle?: FileSystemFileHandle; // For native Live Sync via File System Access API
  arrayBuffer?: ArrayBuffer;
  textContent?: string;
  dataUrl?: string;
  objectUrl?: string;

  // Live Sync state
  liveSyncActive: boolean;
  lastSyncedAt?: number;
  syncCount?: number;
  hasUnsavedChanges?: boolean;
  syncStatus: 'synced' | 'syncing' | 'modified_external' | 'paused' | 'error';
  
  // View mode controls
  viewMode: 'preview' | 'raw' | 'hex' | 'table' | 'structure';
  zoomLevel: number;
  metadata?: Record<string, any>;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}
