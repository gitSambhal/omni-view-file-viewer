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

export const SAMPLE_LOG = `2026-09-01T10:15:02.102Z [INFO] OmniView Engine initialized successfully.
2026-09-01T10:15:05.412Z [INFO] ServiceWorker registered scope: /
2026-09-01T10:15:10.880Z [DEBUG] LiveSyncWatcher attached handle for README_OmniView.md.
2026-09-01T10:18:22.015Z [WARN] External file change detected: schema_dump.sql modified on disk.
2026-09-01T10:18:22.150Z [INFO] Auto-reloaded file buffer for tab id: sample-sql (Sync Count: 1).
2026-09-01T10:22:45.990Z [ERROR] Failed to load remote URL asset: NetworkTimeout (3000ms). Retrying with offline cache fallback.
2026-09-01T10:22:46.120Z [SUCCESS] Fallback completed. Rendered local buffer smoothly.
2026-09-01T10:30:00.000Z [INFO] Telemetry summary: 0 bytes uploaded to remote servers. 100% offline local privacy verified.
`;

export const SAMPLE_GEOJSON = `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "OmniView HQ Studio",
        "city": "San Francisco",
        "author": "Suhail Akhtar",
        "category": "Tech HQ"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Silicon Valley Tech Corridor",
        "category": "Innovation Hub"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.084, 37.422],
            [-122.084, 37.388],
            [-121.97, 37.388],
            [-121.97, 37.422],
            [-122.084, 37.422]
          ]
        ]
      }
    }
  ]
}`;

export const SAMPLE_HTTP = `### OmniView REST API Client Suite
# Author: Suhail Akhtar (https://suhail.top)

@baseUrl = https://jsonplaceholder.typicode.com
@apiKey = live_sec_omniview_2026_99x
@contentType = application/json

### 1. Get All Public Posts
# @name getPosts
GET {{baseUrl}}/posts?_limit=5
Accept: application/json
User-Agent: OmniView-Studio/1.3.0

### 2. Create New User Post
# @name createPost
POST {{baseUrl}}/posts
Content-Type: {{contentType}}
Authorization: Bearer {{apiKey}}

{
  "title": "Universal Offline File Studio Announcement",
  "body": "OmniView v1.3 now natively executes .http and .rest files with deep PE / DLL binary introspection!",
  "userId": 1,
  "tags": ["offline", "security", "rest-client", "pe-inspector"]
}

### 3. Update User Profile Settings
# @name updateUser
PUT {{baseUrl}}/users/1
Content-Type: {{contentType}}
X-Client-Platform: WebBrowser-Local

{
  "name": "Suhail Akhtar",
  "username": "suhail_akhtar",
  "website": "https://suhail.top",
  "preferences": {
    "theme": "dark",
    "offlineSync": true
  }
}

### 4. Delete Resource
# @name deletePost
DELETE {{baseUrl}}/posts/1
Authorization: Bearer {{apiKey}}
`;

export const SAMPLE_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIUQz+rL/XnL0xXW3r19P3Hk9d9XbMwDQYJKoZIhvcNAQEL
BQAwPzELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFzAVBgNVBAoM
Dk9tbmlWaWV3IFRlY2gwHhcNMjYwOTAxMTIwMDAwWhcNMjgwOTAxMTIwMDAwWjA/
MQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEXMBUGA1UECgwOT21u
aVZpZXcgVGVjaDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALzK89pX
Q+OmniViewLocalClientCertificateSignatureVerificationOffline992k
a8FkP1zW9xM2v7bX5N0kLk1qPo8nMn2yZvTqWx10Lk9m8n7vXq6wLp3kQm2vXw==
-----END CERTIFICATE-----
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvMrz2ldD46a5X50...OmniView2048BitPrivateKeyPayload
cKqP+8L0xXW3r19P3Hk9d9XbMwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
-----END RSA PRIVATE KEY-----`;

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

  const sampleHttp: TabFile = {
    id: 'sample-http',
    name: 'api_endpoints.http',
    size: SAMPLE_HTTP.length,
    type: 'text/plain',
    lastModified: now - 1800000,
    extension: 'http',
    category: 'http',
    textContent: SAMPLE_HTTP,
    liveSyncActive: false,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  // Generate mock PE DLL ArrayBuffer for sample binary inspection
  const dllBufferSize = 1024;
  const dllBuffer = new ArrayBuffer(dllBufferSize);
  const dllBytes = new Uint8Array(dllBuffer);
  const dllView = new DataView(dllBuffer);

  // MZ Header
  dllBytes[0] = 0x4D;
  dllBytes[1] = 0x5A; // MZ
  dllView.setUint32(0x3C, 0x80, true); // e_lfanew -> 0x80

  // PE Signature at 0x80
  dllBytes[0x80] = 0x50; // P
  dllBytes[0x81] = 0x45; // E
  dllBytes[0x82] = 0x00;
  dllBytes[0x83] = 0x00;

  // COFF Header (at 0x84)
  dllView.setUint16(0x84, 0x8664, true); // x64 AMD64
  dllView.setUint16(0x86, 4, true); // 4 sections
  dllView.setUint32(0x88, Math.floor(now / 1000), true); // timestamp
  dllView.setUint16(0x96, 0x2002, true); // Executable DLL characteristics

  // Optional Header (at 0x98)
  dllView.setUint16(0x98, 0x020B, true); // PE32+ 64-bit
  dllView.setUint32(0x98 + 16, 0x1000, true); // EntryPoint (0x1000)
  dllView.setUint32(0x98 + 24, 0x400000, true); // ImageBase

  // Embed sample printable strings into binary buffer
  const sampleStrings = [
    'DllMain',
    'GetProcAddress',
    'Kernel32.dll',
    'OmniViewEngine_v13.dll',
    'https://api.omniview.internal/v1',
    'C:\\Build\\src\\core_engine.cpp'
  ];
  let strOffset = 0x200;
  sampleStrings.forEach(str => {
    for (let c = 0; c < str.length; c++) {
      dllBytes[strOffset + c] = str.charCodeAt(c);
    }
    strOffset += str.length + 4;
  });

  const sampleDll: TabFile = {
    id: 'sample-dll',
    name: 'OmniCore_x64.dll',
    size: dllBufferSize,
    type: 'application/x-msdownload',
    lastModified: now - 3000000,
    extension: 'dll',
    category: 'binary',
    arrayBuffer: dllBuffer,
    liveSyncActive: false,
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

  const sampleLog: TabFile = {
    id: 'sample-log',
    name: 'system_server.log',
    size: SAMPLE_LOG.length,
    type: 'text/plain',
    lastModified: now - 5400000,
    extension: 'log',
    category: 'log',
    textContent: SAMPLE_LOG,
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

  const sampleGeoJson: TabFile = {
    id: 'sample-geojson',
    name: 'tech_hubs.geojson',
    size: SAMPLE_GEOJSON.length,
    type: 'application/geo+json',
    lastModified: now - 12000000,
    extension: 'geojson',
    category: 'geojson',
    textContent: SAMPLE_GEOJSON,
    liveSyncActive: false,
    syncStatus: 'synced',
    viewMode: 'preview',
    zoomLevel: 100
  };

  const sampleCert: TabFile = {
    id: 'sample-cert',
    name: 'server_identity.pem',
    size: SAMPLE_CERTIFICATE.length,
    type: 'application/x-pem-file',
    lastModified: now - 13000000,
    extension: 'pem',
    category: 'certificate',
    textContent: SAMPLE_CERTIFICATE,
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

  return [sampleMd, sampleHttp, sampleDll, sampleCode, sampleLog, sampleCsv, sampleSql, sampleGeoJson, sampleCert, sampleJson];
}
