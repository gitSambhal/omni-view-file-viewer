/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { TabFile } from '../types/file';

export const SAMPLE_MARKDOWN = `# 🚀 OmniView File Studio Overview

Welcome to **OmniView**, the 100% offline local browser file previewer created by **[Suhail Akhtar](https://suhail.top)**.

---

## Key Capabilities
- **Zero Server Uploads**: 100% local client-side parsing for maximum privacy.
- **Multi-Tab Workspace**: Open and switch between dozens of files instantly.
- **Live File Sync**: Monitor local disk files for live changes with visual indicators.
- **Universal Format Parser**:
  1. 📄 **PDF Documents**: Clean rendering with page nav & zoom.
  2. 📊 **Office & Spreadsheets**: Word (.docx), Excel (.xlsx), CSV, PowerPoint (.pptx).
  3. 💻 **Code & Text**: 50+ languages with syntax highlighting & search.
  4. 🗄️ **Databases**: SQLite (.db), SQL scripts, CSV, ACCDB schema analysis.
  5. 🎨 **Media**: Images with EXIF, Audio with waveform visualizer, Video.
  6. 📦 **Archives**: Inspect ZIP, TAR, GZ without extracting.
  7. 🔢 **Hex Byte Inspector**: Binary file inspection for any unknown format.

---

## Sample Code Snippet

\`\`\`typescript
// Client-side file processor
export async function processLocalFile(file: File) {
  const buffer = await file.arrayBuffer();
  console.log(\`[OmniView] Loaded \${file.name} (\${buffer.byteLength} bytes) locally.\`);
  return { status: 'secure', offline: true };
}
\`\`\`

## Quick Task List
- [x] High-contrast dark mode support
- [x] Multi-tab dragging & shortcuts
- [x] Live Sync indicator badge
- [x] Universal Hex Byte Inspection fallback

> *"Privacy is not an option; it is the core foundation of local software."* — Suhail Akhtar
`;

export const SAMPLE_CODE = `/**
 * OmniView Core Live Sync Engine
 * @author Suhail Akhtar (https://suhail.top)
 */

import { useState, useEffect } from 'react';

interface SyncConfig {
  intervalMs: number;
  autoReload: boolean;
}

export class LiveSyncEngine {
  private fileHandle: FileSystemFileHandle | null = null;
  private lastModified: number = 0;

  constructor(handle: FileSystemFileHandle, initialModified: number) {
    this.fileHandle = handle;
    this.lastModified = initialModified;
  }

  public async pollForChanges(): Promise<boolean> {
    if (!this.fileHandle) return false;
    try {
      const file = await this.fileHandle.getFile();
      if (file.lastModified > this.lastModified) {
        this.lastModified = file.lastModified;
        return true; // File changed!
      }
    } catch (err) {
      console.warn('Sync permission denied or file moved:', err);
    }
    return false;
  }
}
`;

export const SAMPLE_CSV = `ID,Product Name,Category,Price ($),Stock,Rating,Region
101,OmniPad Pro 13",Electronics,999.00,45,4.9,North America
102,CyberDesk Standing Converter,Furniture,349.50,120,4.7,Europe
103,Acoustic Wave Headphones,Audio,199.99,88,4.8,Asia Pacific
104,Mechanical Ergonomic Keyboard,Peripherals,129.00,210,4.9,North America
105,UltraWide 34" Curved Monitor,Displays,699.00,32,4.6,Europe
106,Smart Ambient Light Strip,Smart Home,49.99,500,4.5,Asia Pacific
107,Wireless Fast Charger Stand,Accessories,29.99,340,4.4,North America
108,Noise-Canceling Earbuds,Audio,149.00,175,4.8,Europe
`;

export const SAMPLE_SQL = `-- SQLite Database Schema & Sample Data
-- Generated for OmniView Local Database Viewer

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    user_id INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    budget DECIMAL(10,2),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO users (username, email, role) VALUES 
('suhail_akhtar', 'suhailak786@gmail.com', 'admin'),
('alex_dev', 'alex@example.com', 'developer'),
('sarah_design', 'sarah@example.com', 'designer');

INSERT INTO projects (title, user_id, status, budget) VALUES
('OmniView File Studio v1.0', 1, 'completed', 15000.00),
('Cloud Native Dashboard', 2, 'active', 8500.00),
('Mobile Design System', 3, 'review', 12000.00);

SELECT p.id, p.title, u.username, p.status, p.budget 
FROM projects p 
JOIN users u ON p.user_id = u.id;
`;

export const SAMPLE_JSON = `{
  "appName": "OmniView File Studio",
  "version": "1.0.0",
  "author": {
    "name": "Suhail Akhtar",
    "website": "https://suhail.top"
  },
  "privacy": {
    "localProcessing": true,
    "cloudUploads": false,
    "telemetry": false
  },
  "supportedCategories": [
    "pdf",
    "docx",
    "excel",
    "pptx",
    "code",
    "markdown",
    "database",
    "image",
    "audio",
    "video",
    "archive",
    "json",
    "hex"
  ],
  "systemRequirements": {
    "browser": "Modern Evergreen Browser (Chrome, Firefox, Safari, Edge)",
    "offlineCapable": true,
    "webAssembly": true
  }
}`;

export function getSampleTabFiles(): TabFile[] {
  const now = Date.now();

  const sampleMd: TabFile = {
    id: 'sample-md',
    name: 'README_OmniView.md',
    size: SAMPLE_MARKDOWN.length,
    type: 'text/markdown',
    lastModified: now,
    extension: 'md',
    category: 'markdown',
    textContent: SAMPLE_MARKDOWN,
    liveSyncActive: true,
    lastSyncedAt: now,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  const sampleCode: TabFile = {
    id: 'sample-code',
    name: 'LiveSyncEngine.ts',
    size: SAMPLE_CODE.length,
    type: 'text/typescript',
    lastModified: now - 3600000,
    extension: 'ts',
    category: 'code',
    textContent: SAMPLE_CODE,
    liveSyncActive: false,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  const sampleCsv: TabFile = {
    id: 'sample-csv',
    name: 'Q3_Sales_Report.csv',
    size: SAMPLE_CSV.length,
    type: 'text/csv',
    lastModified: now - 7200000,
    extension: 'csv',
    category: 'excel',
    textContent: SAMPLE_CSV,
    liveSyncActive: false,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  const sampleSql: TabFile = {
    id: 'sample-sql',
    name: 'schema_dump.sql',
    size: SAMPLE_SQL.length,
    type: 'application/sql',
    lastModified: now - 10800000,
    extension: 'sql',
    category: 'database',
    textContent: SAMPLE_SQL,
    liveSyncActive: false,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  const sampleJson: TabFile = {
    id: 'sample-json',
    name: 'manifest_config.json',
    size: SAMPLE_JSON.length,
    type: 'application/json',
    lastModified: now - 14400000,
    extension: 'json',
    category: 'json',
    textContent: SAMPLE_JSON,
    liveSyncActive: false,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  return [sampleMd, sampleCode, sampleCsv, sampleSql, sampleJson];
}
