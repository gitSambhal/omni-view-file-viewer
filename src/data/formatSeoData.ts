/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Comprehensive SEO & Structured Data Registry for Supported File Formats
 */

export interface FormatFaqItem {
  question: string;
  answer: string;
}

export interface FormatSeoRecord {
  id: string;
  extension: string;
  aliases: string[];
  name: string;
  category: string;
  mimeType: string;
  magicBytes?: string;
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string[];
  capabilities: string[];
  schemaCategory: string;
  faqs: FormatFaqItem[];
}

export const FORMAT_SEO_REGISTRY: Record<string, FormatSeoRecord> = {
  pdf: {
    id: 'pdf',
    extension: '.pdf',
    aliases: ['pdf', 'application/pdf'],
    name: 'Portable Document Format (PDF)',
    category: 'Documents & PDFs',
    mimeType: 'application/pdf',
    magicBytes: '%PDF- (0x25 0x50 0x44 0x46)',
    title: 'Offline PDF Viewer & Password Decryptor | OmniView',
    metaDescription: 'Inspect and read PDF documents 100% offline in your browser. Supports password decryption, HiDPI Retina zoom, page thumbnails, and text selection with zero uploads.',
    ogTitle: 'OmniView - High-Performance Offline PDF Viewer & Decryptor',
    ogDescription: 'Read, zoom, and unlock encrypted PDFs directly in your browser. 100% client-side with zero server uploads.',
    keywords: ['pdf viewer', 'offline pdf viewer', 'pdf password decryptor', 'private pdf reader', 'browser pdf viewer', 'no upload pdf reader'],
    capabilities: ['Client-Side PDF Rendering', 'Password Decryption', 'Retina HiDPI Zoom', 'Page Navigation & Thumbnails', 'Text Search & Copy'],
    schemaCategory: 'BusinessApplication',
    faqs: [
      {
        question: 'Can I view password-protected PDFs without uploading them to a server?',
        answer: 'Yes. OmniView decrypts password-protected PDF files entirely in client-side memory using WebAssembly. Your file and password never leave your device.'
      },
      {
        question: 'Does this PDF viewer work completely offline?',
        answer: 'Yes, OmniView is a Progressive Web App (PWA) with full offline support. Once loaded, you can open and read PDFs without any internet connection.'
      }
    ]
  },

  docx: {
    id: 'docx',
    extension: '.docx',
    aliases: ['docx', 'doc', 'word', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    name: 'Microsoft Word Document (DOCX)',
    category: 'Documents & PDFs',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    magicBytes: 'PK\\x03\\x04 (ZIP container)',
    title: 'Offline Word DOCX Viewer & Document Inspector | OmniView',
    metaDescription: 'Preview Microsoft Word (.docx) files privately in your browser. Renders typography, tables, embedded images, and styles 100% locally with zero server uploads.',
    ogTitle: 'OmniView - Private Offline DOCX Document Viewer',
    ogDescription: 'Instant in-browser preview of Microsoft Word .docx documents with accurate styling, tables, and images.',
    keywords: ['docx viewer', 'view docx online without word', 'offline docx reader', 'word document previewer', 'private docx viewer'],
    capabilities: ['OpenXML DOCX Parsing', 'Embedded Image Extraction', 'Table & Grid Layout', 'Typography Preservation', 'Print & Export'],
    schemaCategory: 'BusinessApplication',
    faqs: [
      {
        question: 'Do I need Microsoft Office installed to view DOCX files?',
        answer: 'No. OmniView parses and renders Microsoft Word DOCX files natively in your browser using local JavaScript OpenXML parsers.'
      }
    ]
  },

  xlsx: {
    id: 'xlsx',
    extension: '.xlsx',
    aliases: ['xlsx', 'xls', 'ods', 'csv', 'tsv', 'spreadsheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet'],
    name: 'Spreadsheets (Excel XLSX / ODS / CSV)',
    category: 'Spreadsheets & Data',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    magicBytes: 'PK\\x03\\x04 (ZIP container) or ODS container',
    title: 'Offline Excel XLSX, ODS & CSV Spreadsheet Viewer | OmniView',
    metaDescription: 'Open, sort, and search Excel (.xlsx, .xls), OpenDocument (.ods) and CSV sheets directly in your browser. Multi-sheet navigation, column filtering, and formula grid with zero uploads.',
    ogTitle: 'OmniView - In-Browser Excel & ODS Spreadsheet Viewer',
    ogDescription: 'High-speed spreadsheet viewer with multi-sheet tabs, column search, and instant sorting for XLSX, ODS, and CSV. 100% private and offline.',
    keywords: ['excel viewer', 'ods viewer online', 'xlsx viewer online', 'csv viewer', 'opendocument spreadsheet reader', 'offline excel reader', 'private data grid'],
    capabilities: ['Multi-Sheet Workbook Tabs', 'OpenDocument ODS Support', 'Instant Column Sorting & Filtering', 'Search Across Thousands of Rows', 'Formula Display', 'Export to CSV'],
    schemaCategory: 'BusinessApplication',
    faqs: [
      {
        question: 'Can I view OpenDocument .ods and large Excel files without sharing my private data?',
        answer: 'Yes. OmniView parses both Excel (.xlsx/.xls) and OpenDocument (.ods) spreadsheets in client-side memory using SheetJS. No telemetry or spreadsheet contents are ever uploaded to any cloud server.'
      }
    ]
  },

  pptx: {
    id: 'pptx',
    extension: '.pptx',
    aliases: ['pptx', 'ppt', 'odp', 'pps', 'ppsx', 'presentation', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation'],
    name: 'PowerPoint & Presentations (PPTX / PPT / ODP)',
    category: 'Documents & PDFs',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    magicBytes: 'PK\\x03\\x04 (ZIP) or 0xD0CF11E0 (OLE2 Compound File)',
    title: 'Offline PowerPoint PPTX, PPT & ODP Slide Deck Viewer | OmniView',
    metaDescription: 'Preview Microsoft PowerPoint presentations (.pptx, .ppt) and OpenDocument (.odp) slide by slide in your browser. Inspect slide layouts, shapes, text, and graphics offline with zero uploads.',
    ogTitle: 'OmniView - In-Browser PPTX & PPT Slide Deck Viewer',
    ogDescription: 'Interactive PowerPoint and presentation slide viewer with slide thumbnails, keyboard arrow navigation, grid sorter, and fullscreen presentation mode.',
    keywords: ['pptx viewer', 'ppt viewer online', 'odp presentation viewer', 'powerpoint online viewer', 'offline pptx reader', 'view presentation without powerpoint', 'slide deck previewer'],
    capabilities: ['Slide Deck Thumbnail Strip', 'Legacy PPT & Modern PPTX Support', 'OpenDocument ODP Slides', 'Slide Navigation & Zoom', 'Embedded Text & Shape Rendering', 'Zero Cloud Uploads'],
    schemaCategory: 'BusinessApplication',
    faqs: [
      {
        question: 'Can I preview legacy .ppt and modern .pptx presentations on Linux or Chromebooks?',
        answer: 'Yes, OmniView runs in any modern browser on Windows, macOS, Linux, ChromeOS, and mobile devices without requiring Microsoft Office or any server conversion.'
      }
    ]
  },

  epub: {
    id: 'epub',
    extension: '.epub',
    aliases: ['epub', 'application/epub+zip'],
    name: 'Electronic Publication (EPUB)',
    category: 'Documents & PDFs',
    mimeType: 'application/epub+zip',
    magicBytes: 'PK\\x03\\x04 (mimetype file)',
    title: 'Offline EPUB E-Book Reader & TOC Inspector | OmniView',
    metaDescription: 'Read EPUB e-books in your browser with table of contents navigation, customizable typography, and chapter pagination. 100% offline with zero server tracking.',
    ogTitle: 'OmniView - Client-Side EPUB E-Book Reader',
    ogDescription: 'Clean, distraction-free in-browser EPUB reader with chapter outline, font resizing, and dark reading mode.',
    keywords: ['epub reader', 'online epub viewer', 'offline epub reader', 'in-browser ebook reader', 'private epub reader'],
    capabilities: ['Table of Contents (NCX/Nav)', 'Chapter Pagination', 'Font Resizing & Line Height', 'Dark & Light Reading Themes'],
    schemaCategory: 'LifestyleApplication',
    faqs: [
      {
        question: 'Are my e-books saved on external servers?',
        answer: 'Never. OmniView extracts and displays EPUB archives completely within your local browser sandbox.'
      }
    ]
  },

  sqlite: {
    id: 'sqlite',
    extension: '.sqlite',
    aliases: ['sqlite', 'db', 'sqlite3', 'db3', 'application/x-sqlite3', 'database'],
    name: 'SQLite Database (.sqlite / .db)',
    category: 'Databases & SQL',
    mimeType: 'application/x-sqlite3',
    magicBytes: 'SQLite format 3\\0',
    title: 'In-Browser SQLite Database Viewer & SQL Console | OmniView',
    metaDescription: 'Inspect SQLite database files (.sqlite, .db) and run custom SQL queries in your browser. Explore table schemas, indexes, and row data 100% locally with zero uploads.',
    ogTitle: 'OmniView - Local SQLite Database Viewer & Query Console',
    ogDescription: 'Explore SQLite schemas, table rows, and execute live SQL queries in client-side WebAssembly with zero server uploads.',
    keywords: ['sqlite viewer', 'sqlite online reader', 'open sqlite file', 'in-browser sql console', 'offline sqlite browser', 'inspect db file'],
    capabilities: ['Schema & Table Introspection', 'Interactive SQL Query Console', 'Pagination & Row Filtering', 'Table Row Count Statistics', 'CSV Export'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'How does OmniView run SQL queries without a backend server?',
        answer: 'OmniView embeds SQLite compiled directly to WebAssembly (Wasm). It reads the raw binary byte stream of your .sqlite file and executes queries locally in your browser.'
      },
      {
        question: 'Is it safe to inspect sensitive production database files?',
        answer: 'Yes. Since OmniView operates 100% client-side with zero network requests for file contents, your database records remain strictly confidential on your machine.'
      }
    ]
  },

  dbf: {
    id: 'dbf',
    extension: '.dbf',
    aliases: ['dbf', 'dbase', 'foxpro', 'application/x-dbf'],
    name: 'FoxPro / dBASE Table File (.dbf)',
    category: 'Databases & SQL',
    mimeType: 'application/x-dbf',
    magicBytes: '0x03, 0x30, 0x31, 0xF5 (dBASE Header)',
    title: 'Offline DBF / FoxPro Database Table Viewer | OmniView',
    metaDescription: 'Inspect legacy dBASE III, IV, and Visual FoxPro (.dbf) database tables directly in your browser. View field headers, record grids, and export to CSV.',
    ogTitle: 'OmniView - FoxPro & dBASE (.dbf) Table Viewer',
    ogDescription: 'Decode legacy .dbf database tables in your browser with field schema analysis, deleted record markers, and instant search.',
    keywords: ['dbf viewer', 'foxpro viewer', 'dbase reader', 'open dbf file online', 'legacy database viewer'],
    capabilities: ['dBASE III/IV/FoxPro Decoding', 'Field Type Definition Table', 'Deleted Flag Handling', 'Quick Search & CSV Export'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I view Visual FoxPro and Clipper DBF files without installing legacy software?',
        answer: 'Yes. OmniView parses binary dBASE headers, field descriptors, and records directly in JavaScript with encoding detection.'
      }
    ]
  },

  mdb: {
    id: 'mdb',
    extension: '.mdb',
    aliases: ['mdb', 'accdb', 'access', 'application/x-msaccess'],
    name: 'Microsoft Access Database (.mdb / .accdb)',
    category: 'Databases & SQL',
    mimeType: 'application/x-msaccess',
    magicBytes: 'Jet DB Header / ACE engine bytes',
    title: 'In-Browser Microsoft Access MDB Database Viewer | OmniView',
    metaDescription: 'Inspect Microsoft Access (.mdb, .accdb) database schemas and table records in your browser. 100% offline parsing with zero server uploads.',
    ogTitle: 'OmniView - Access (.mdb) Database Schema Viewer',
    ogDescription: 'Analyze Microsoft Access database catalogs, table schemas, and data records in client-side memory.',
    keywords: ['mdb viewer', 'access database viewer', 'accdb reader online', 'view mdb without access', 'microsoft access parser'],
    capabilities: ['Jet Database Header Parser', 'System Catalog & User Tables', 'Column Type Definitions', 'Zero Server Transfer'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Do I need Microsoft Access installed to view .mdb files?',
        answer: 'No. OmniView decodes Microsoft Jet / Access binary page structures directly in client-side WebAssembly and JavaScript.'
      }
    ]
  },

  python: {
    id: 'python',
    extension: '.py',
    aliases: ['py', 'python', 'text/x-python'],
    name: 'Python Source Code & Sandbox (.py)',
    category: 'Code & Scripts',
    mimeType: 'text/x-python',
    title: 'In-Browser Python 3.12 Runner & Wasm Sandbox | OmniView',
    metaDescription: 'Run Python 3.12 code directly in your browser powered by Pyodide WebAssembly. Syntax-highlighted code editor, stdout console, and standard library execution with zero server setup.',
    ogTitle: 'OmniView - Python 3.12 In-Browser Wasm Sandbox',
    ogDescription: 'Execute Python scripts in your browser using Pyodide WebAssembly. Live stdout terminal, execution timer, and syntax editing.',
    keywords: ['python runner online', 'in-browser python', 'pyodide python 3.12', 'run python in browser', 'offline python runner'],
    capabilities: ['Python 3.12 Wasm Engine (Pyodide)', 'Real-time Standard Output Terminal', 'Execution Timing & Error Traces', 'Syntax Highlighting & Line Numbers'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Does running Python code send my scripts to a remote backend?',
        answer: 'No! Python 3.12 executes directly in your browser using Pyodide (CPython compiled to WebAssembly). Your code never touches an external server.'
      }
    ]
  },

  typescript: {
    id: 'typescript',
    extension: '.ts',
    aliases: ['ts', 'tsx', 'js', 'jsx', 'javascript', 'application/typescript', 'text/javascript'],
    name: 'TypeScript & JavaScript Playground (.ts / .tsx / .js)',
    category: 'Code & Scripts',
    mimeType: 'application/typescript',
    title: 'In-Browser TypeScript AST & Live NPM Sandbox | OmniView',
    metaDescription: 'Inspect TypeScript and JavaScript code with live syntax AST tokens, in-memory transpilation, and live NPM package execution via CDN. 100% in-browser.',
    ogTitle: 'OmniView - TypeScript AST & Live NPM Playground',
    ogDescription: 'Live in-browser TypeScript editor with token inspector, JS compilation output, and instant NPM package importing.',
    keywords: ['typescript playground', 'in-browser ts runner', 'npm package tester', 'typescript ast viewer', 'javascript runner online'],
    capabilities: ['Live TypeScript Transpilation', 'AST Token Inspector', 'Dynamic NPM Package CDN Loader', 'Console Output Stream'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I test NPM packages in OmniView?',
        answer: 'Yes! OmniView includes an interactive NPM Package Playground that dynamically loads packages via ESM CDNs directly into your browser console.'
      }
    ]
  },

  html: {
    id: 'html',
    extension: '.html',
    aliases: ['html', 'htm', 'xhtml', 'text/html'],
    name: 'HTML & Live Web Document (.html / .htm)',
    category: 'HTML & Live Web',
    mimeType: 'text/html',
    title: 'Live HTML Sandbox Preview & DOM Inspector | OmniView',
    metaDescription: 'Preview HTML files with live split code/preview mode, DOM tree hierarchy navigation, responsive viewport simulation, and console logging. 100% offline.',
    ogTitle: 'OmniView - Live HTML Sandbox & DOM Inspector',
    ogDescription: 'Safe isolated iframe sandbox preview for HTML documents with DOM tree explorer and mobile/tablet viewport toggles.',
    keywords: ['html viewer', 'live html preview', 'html dom inspector', 'open html file', 'split view html editor'],
    capabilities: ['Isolated Iframe Sandbox', 'Split Code & Live Preview', 'DOM Element Hierarchy Tree', 'Responsive Viewport Switcher', 'Live Console Bridge'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Is it safe to preview untrusted HTML files?',
        answer: 'Yes. OmniView executes HTML inside a strictly sandboxed iframe with restricted permissions, preventing malicious cookie access or frame breakouts.'
      }
    ]
  },

  http: {
    id: 'http',
    extension: '.http',
    aliases: ['http', 'rest', 'text/plain'],
    name: 'HTTP / REST Client File (.http / .rest)',
    category: 'HTTP & REST APIs',
    mimeType: 'text/plain',
    title: 'In-Browser HTTP & REST API Client Runner | OmniView',
    metaDescription: 'Execute .http and .rest request files directly from your browser. Test REST endpoints, inspect response headers and JSON, and generate cURL commands with zero install.',
    ogTitle: 'OmniView - In-Browser REST API Client & HTTP Runner',
    ogDescription: 'Interactive HTTP request executor with variable interpolation, response status badges, and cURL export.',
    keywords: ['http file runner', 'rest client online', 'test http file in browser', 'curl generator', 'api tester'],
    capabilities: ['In-Browser Fetch Runner', 'Response Header & Body Formatting', 'cURL Command Exporter', 'Localhost Gateway Support', 'Execution Timing'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I test localhost APIs using OmniView?',
        answer: 'Yes! Because OmniView runs in your browser, it can send requests to your local development servers on localhost, 127.0.0.1, or local networks.'
      }
    ]
  },

  markdown: {
    id: 'markdown',
    extension: '.md',
    aliases: ['md', 'markdown', 'mdown', 'text/markdown'],
    name: 'GitHub Flavored Markdown (.md)',
    category: 'Code & Scripts',
    mimeType: 'text/markdown',
    title: 'Live GFM Markdown Editor & KaTeX Math Viewer | OmniView',
    metaDescription: 'Render and edit GitHub Flavored Markdown (.md) with split-screen preview, table formatting, syntax-highlighted code blocks, and KaTeX math formulas. 100% offline.',
    ogTitle: 'OmniView - Live GFM Markdown Editor & Math Renderer',
    ogDescription: 'Split-view Markdown editor with live HTML preview, task lists, tables, and KaTeX LaTeX math support.',
    keywords: ['markdown viewer', 'gfm markdown editor', 'offline markdown previewer', 'katex math markdown', 'in-browser markdown'],
    capabilities: ['GitHub Flavored Markdown (GFM)', 'Live Split View Synchronized Scroll', 'KaTeX Math Equation Rendering', 'Syntax Highlighted Code Fences', 'HTML & PDF Export'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Does this Markdown viewer support LaTeX math equations?',
        answer: 'Yes. OmniView includes KaTeX rendering for inline ($...$) and block ($$...$$) mathematical expressions.'
      }
    ]
  },

  json: {
    id: 'json',
    extension: '.json',
    aliases: ['json', 'yaml', 'yml', 'toml', 'application/json', 'text/yaml'],
    name: 'JSON & Config Tree (.json / .yaml)',
    category: 'Config & JSON',
    mimeType: 'application/json',
    title: 'Interactive JSON & YAML Tree Viewer & Validator | OmniView',
    metaDescription: 'Inspect, validate, and format JSON and YAML configuration files with interactive collapsible tree views, path breadcrumbs, search, and syntax highlighting.',
    ogTitle: 'OmniView - Interactive JSON & YAML Tree Inspector',
    ogDescription: 'Explore large JSON structures with collapsible nodes, key search, path copying, and schema validation. 100% offline.',
    keywords: ['json viewer', 'json tree viewer', 'yaml viewer', 'json formatter offline', 'validate json in browser'],
    capabilities: ['Collapsible JSON Tree Navigation', 'Deep Key & Value Search', 'JSON Path Copying (dot notation)', 'Auto-Format & Minify', 'YAML to JSON Conversion'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I inspect large multi-megabyte JSON files without freezing?',
        answer: 'Yes. OmniView uses virtualized tree rendering to handle large JSON documents with low memory consumption.'
      }
    ]
  },

  geojson: {
    id: 'geojson',
    extension: '.geojson',
    aliases: ['geojson', 'kml', 'gpx', 'application/geo+json'],
    name: 'Geospatial Vector Map (.geojson / .kml)',
    category: 'Geospatial Maps',
    mimeType: 'application/geo+json',
    title: 'In-Browser GeoJSON & KML Vector Map Viewer | OmniView',
    metaDescription: 'Render GeoJSON, KML, and GPX spatial coordinates on interactive OpenStreetMap and Leaflet vector maps. Inspect feature properties, bounding boxes, and geometry coordinates.',
    ogTitle: 'OmniView - In-Browser GeoJSON & KML Map Viewer',
    ogDescription: 'Interactive spatial map visualizer for GeoJSON, KML, and GPX features with property inspectors and coordinate bounds.',
    keywords: ['geojson viewer', 'kml map viewer', 'view geojson online', 'interactive spatial map', 'leaflet geojson reader'],
    capabilities: ['Interactive Vector Map Rendering', 'Point, LineString & Polygon Support', 'Feature Property Inspector', 'Auto-Fit Coordinate Bounding Box'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I view GeoJSON files without sending coordinates to third parties?',
        answer: 'Yes. The geometry parsing happens locally in your browser, rendering vector layers directly on open map tiles.'
      }
    ]
  },

  image: {
    id: 'image',
    extension: '.png',
    aliases: ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'ico', 'image/png', 'image/jpeg', 'image/svg+xml'],
    name: 'High-Resolution Images & Vectors (.png / .jpg / .svg)',
    category: 'Media & Video',
    mimeType: 'image/png',
    title: 'High-Resolution Image Inspector & EXIF Viewer | OmniView',
    metaDescription: 'Inspect raster and vector images (.png, .jpg, .webp, .svg, .gif) with deep pixel zoom, transparent checkerboard background, EXIF metadata extraction, and color picker.',
    ogTitle: 'OmniView - High-Res Image Inspector & EXIF Reader',
    ogDescription: 'Pixel-level image viewer with zoom, pan, EXIF metadata, SVG source code inspection, and RGB color sampler.',
    keywords: ['image viewer', 'exif viewer online', 'svg inspector', 'pixel zoom tool', 'offline image viewer'],
    capabilities: ['Deep Pixel Zoom & Pan', 'EXIF Camera & GPS Metadata', 'SVG Code & Preview Switcher', 'Transparent Alpha Checkerboard', 'Dimension & Aspect Ratio Stats'],
    schemaCategory: 'DesignApplication',
    faqs: [
      {
        question: 'Can I view EXIF metadata without uploading my photos?',
        answer: 'Yes! OmniView parses EXIF headers (camera model, shutter speed, ISO, GPS coordinates) 100% locally in your browser.'
      }
    ]
  },

  media: {
    id: 'media',
    extension: '.mp4',
    aliases: ['mp4', 'webm', 'mp3', 'wav', 'ogg', 'flac', 'm4a', 'video/mp4', 'audio/mpeg'],
    name: 'Audio & Video Player (.mp4 / .mp3 / .wav)',
    category: 'Media & Video',
    mimeType: 'video/mp4',
    title: 'In-Browser Audio Waveform & Video Frame Stepper | OmniView',
    metaDescription: 'Play audio and video files (.mp4, .webm, .mp3, .wav, .flac) with audio waveform visualization, precision frame-by-frame stepping, and playback speed controls. 100% offline.',
    ogTitle: 'OmniView - In-Browser Audio Waveform & Video Stepper',
    ogDescription: 'Play media files locally with precision frame stepping, audio waveforms, volume boost, and playback speed control.',
    keywords: ['video player in browser', 'audio waveform visualizer', 'frame by frame video player', 'offline media player', 'private video viewer'],
    capabilities: ['Real-time Audio Waveform Visualizer', 'Precision Video Frame Stepper', '0.25x to 4x Playback Speed', 'Keyboard Scrubbing (Arrow keys)', 'Zero Network Buffering'],
    schemaCategory: 'MultimediaApplication',
    faqs: [
      {
        question: 'Can I play private video and audio files without uploading them?',
        answer: 'Yes! Files are played directly from local blob URLs in your browser using hardware-accelerated HTML5 video and Web Audio APIs.'
      }
    ]
  },

  binary: {
    id: 'binary',
    extension: '.dll',
    aliases: ['dll', 'exe', 'wasm', 'so', 'dylib', 'class', 'application/x-msdownload'],
    name: 'Executable & Binary Inspector (.dll / .exe / .wasm)',
    category: 'Binaries & DLLs',
    mimeType: 'application/x-msdownload',
    magicBytes: 'MZ (PE/COFF) / \\0asm (Wasm) / \\x7fELF (Linux) / CAFEBABE (Java)',
    title: 'PE/COFF Header & Binary Executable Inspector | OmniView',
    metaDescription: 'Inspect Windows PE/COFF (.dll, .exe), Linux ELF (.so), macOS Mach-O (.dylib), and WebAssembly (.wasm) binary headers, section tables, and embedded printable strings.',
    ogTitle: 'OmniView - Binary Executable & PE Header Inspector',
    ogDescription: 'Low-level introspection for PE, ELF, Mach-O, and WASM binaries with section tables, symbol string scanner, and entry point detection.',
    keywords: ['pe header viewer', 'inspect dll online', 'wasm binary inspector', 'elf header reader', 'reverse engineering tools'],
    capabilities: ['PE/COFF & ELF Header Parser', 'Section Table Analysis (.text, .rdata, .data)', 'Embedded ASCII/Unicode String Scanner', 'Architecture (x86, x64, ARM) Detection', 'Magic Byte Verification'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'What binaries can I inspect in OmniView?',
        answer: 'OmniView supports Windows PE (.exe, .dll), WebAssembly (.wasm), Linux ELF (.so), macOS Mach-O (.dylib), and Java class files (.class).'
      }
    ]
  },

  vhd: {
    id: 'vhd',
    extension: '.vhd',
    aliases: ['vhd', 'vhdx', 'virtual-disk', 'application/x-vhd'],
    name: 'Microsoft Virtual Hard Disk (VHD / VHDX)',
    category: 'Archives & Virtual Disks',
    mimeType: 'application/x-vhd',
    magicBytes: 'conectix (0x63 0x6f 0x6e 0x65 0x63 0x74 0x69 0x78)',
    title: 'Offline Virtual Hard Disk (VHD & VHDX) Mount & File Explorer | OmniView',
    metaDescription: 'Mount Microsoft VHD & VHDX virtual hard disks in your browser 100% offline. Parses MBR & GPT partition tables, FAT filesystems, and previews all files without extraction.',
    ogTitle: 'OmniView - Client-Side Virtual Hard Disk (VHD) Mounter',
    ogDescription: 'Direct in-memory mounting and file browsing for Microsoft VHD & VHDX disk images with zero installation or extraction required.',
    keywords: ['vhd viewer', 'open vhd online', 'mount vhd in browser', 'vhdx reader', 'offline vhd explorer', 'vhd fat16 fat32 partition viewer'],
    capabilities: ['In-Memory VHD/VHDX Footer Parser', 'Fixed & Dynamic (BAT) Disk Support', 'MBR & GPT Partition Table Detection', 'FAT12/16/32 Volume Mounter', 'Direct File Previews Across 21 Categories', 'Export All Files as ZIP'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I view files inside a VHD without installing Hyper-V or 7-Zip?',
        answer: 'Yes! OmniView parses the VHD sector layout and FAT filesystem structure entirely in client memory, letting you preview documents, images, code, and PDFs instantly.'
      },
      {
        question: 'Does OmniView extract the whole virtual disk to my local drive?',
        answer: 'No. OmniView uses lazy cluster chain streaming in RAM so files are extracted and rendered on-demand with zero physical disk writes.'
      }
    ]
  },

  iso: {
    id: 'iso',
    extension: '.iso',
    aliases: ['iso', 'img', 'dmg', 'application/x-iso9660-image', 'application/x-apple-diskimage'],
    name: 'ISO 9660 Optical Disc Image & Apple DMG',
    category: 'Archives & Virtual Disks',
    mimeType: 'application/x-iso9660-image',
    magicBytes: 'CD001 (ISO 9660) / koly (Apple DMG)',
    title: 'Offline ISO 9660 & Apple DMG Disc Image Explorer | OmniView',
    metaDescription: 'Inspect and browse ISO 9660 optical disc images and Apple DMG containers 100% in your browser. Traverses Joliet directory records and previews files without burning or mounting.',
    ogTitle: 'OmniView - Optical ISO & Apple DMG Disc Image Explorer',
    ogDescription: 'Instant in-memory exploration of ISO and Apple DMG disk images with zero uploads and direct file previews.',
    keywords: ['iso viewer', 'open iso online', 'extract iso in browser', 'apple dmg reader', 'offline iso reader'],
    capabilities: ['ISO 9660 Primary Volume Descriptor Parser', 'Joliet Unicode Filename Support', 'Apple UDIF DMG Trailer Reader', 'Recursive Directory Tree Navigation', '1-Click File Download & Tab Promotion'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I browse ISO files on mobile devices or Chromebooks?',
        answer: 'Yes. OmniView runs anywhere a modern web browser is available, allowing you to open and explore ISO files without any third-party disk mounting tools.'
      }
    ]
  },

  archive: {
    id: 'archive',
    extension: '.zip',
    aliases: ['zip', 'tar', 'gz', 'tgz', '7z', 'rar', 'cab', 'deb', 'ar', 'cpio', 'bz2', 'application/zip', 'application/x-tar', 'application/x-7z-compressed', 'application/vnd.rar'],
    name: 'Universal Archive Suite (ZIP, TAR, 7Z, RAR, CAB, DEB)',
    category: 'Archives & Virtual Disks',
    mimeType: 'application/zip',
    magicBytes: 'PK\\x03\\x04 (ZIP) / 7z\\xBC\\xAF\\x27\\x1C (7Z) / Rar! (RAR) / MSCF (CAB)',
    title: 'Offline Multi-Format Archive Decompressor & Viewer | OmniView',
    metaDescription: 'Extract and preview ZIP, TAR, GZ, 7-Zip, RAR, CAB, DEB, AR, and CPIO archives in your browser without uploading. Directly preview PDFs, images, code, and tables in-memory.',
    ogTitle: 'OmniView - Universal Offline Archive Decompressor',
    ogDescription: 'Instant client-side decompression for ZIP, 7Z, RAR, TAR, and CAB archives with direct multi-format file previewing.',
    keywords: ['zip viewer', '7z reader online', 'rar extractor in browser', 'open tar gz online', 'private archive reader'],
    capabilities: ['Multi-Archive Format Engine', 'Direct In-Memory Preview Without Extraction', 'Recursive Nested Archive Navigation', 'Single File Extract & Download', 'Export Entire Container as ZIP'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Are my archive contents protected when uncompressing?',
        answer: 'Yes. All decompression happens strictly inside your local browser memory. No files or folder lists are ever sent to any remote server.'
      }
    ]
  },

  font: {
    id: 'font',
    extension: '.ttf',
    aliases: ['ttf', 'otf', 'woff', 'woff2', 'eot', 'font/ttf', 'font/woff2'],
    name: 'Typographic Font & Glyph Specimen (.ttf, .otf, .woff2)',
    category: 'Fonts & Glyphs',
    mimeType: 'font/ttf',
    title: 'Offline Font Viewer & Glyph Specimen Studio | OmniView',
    metaDescription: 'Preview TrueType (.ttf), OpenType (.otf), and WOFF/WOFF2 font specimens in your browser. Test custom pangrams, inspect glyph tables, and test font weights 100% locally.',
    ogTitle: 'OmniView - Typographic Font Specimen Studio',
    ogDescription: 'Inspect typographic font files with interactive pangram testing, glyph tables, and font metric previews.',
    keywords: ['font viewer', 'ttf viewer', 'otf inspector', 'woff2 previewer', 'glyph table viewer'],
    capabilities: ['In-Browser @font-face Registration', 'Custom Pangram Studio', 'Glyph Table Matrix', 'Font Weight & Size Sliders', 'Font Metadata Inspector'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I test my custom font before installing it on my operating system?',
        answer: 'Yes! OmniView dynamically registers your font in the browser runtime so you can test typography, pangrams, and glyph rendering instantly without installing it to your system.'
      }
    ]
  },

  certificate: {
    id: 'certificate',
    extension: '.pem',
    aliases: ['pem', 'crt', 'cer', 'key', 'pub', 'pfx', 'p12', 'csr', 'der'],
    name: 'SSL/TLS Certificate & Cryptographic Key Inspector',
    category: 'Certificates & Keys',
    mimeType: 'application/x-x509-ca-cert',
    title: 'Offline X.509 Certificate & Private Key Inspector | OmniView',
    metaDescription: 'Inspect SSL/TLS certificates (.crt, .pem, .cer), CSR requests, and public/private keys 100% locally. View subject, issuer, validity period, fingerprints, and SAN extensions.',
    ogTitle: 'OmniView - Secure Offline Certificate & Key Inspector',
    ogDescription: 'Analyze X.509 SSL certificates, validity dates, subject alternative names, and fingerprints with complete cryptographic privacy.',
    keywords: ['certificate viewer', 'inspect x509 cert online', 'pem key viewer', 'ssl certificate decoder', 'offline cert reader'],
    capabilities: ['X.509 ASN.1 Parser', 'Validity Date Range & Expiry Alerts', 'Issuer & Subject DN Hierarchy', 'SHA-256 Fingerprint Generator', 'Subject Alternative Names (SAN) Explorer'],
    schemaCategory: 'SecurityApplication',
    faqs: [
      {
        question: 'Is it safe to inspect private keys and corporate certificates?',
        answer: 'Yes! Because OmniView runs 100% on your local machine with zero network traffic, your private keys, certificates, and credentials never touch a remote server.'
      }
    ]
  },

  hex: {
    id: 'hex',
    extension: 'Any Binary File',
    aliases: ['hex', 'bin', 'raw', 'dat', 'application/octet-stream'],
    name: 'Raw Binary Byte Stream & Hex Inspector',
    category: 'Hex & Low-level',
    mimeType: 'application/octet-stream',
    title: '16-Column Hex Byte Inspector & ASCII Decoder | OmniView',
    metaDescription: 'Inspect any binary or corrupted file with an authentic 16-column memory offset hex editor view. Decodes ASCII characters, highlights byte ranges, and displays frequency statistics.',
    ogTitle: 'OmniView - 16-Column Memory Offset Hex Byte Inspector',
    ogDescription: 'Universal 16-column hex byte inspector with memory offsets (0x0000), ASCII translation, byte search, and entropy statistics.',
    keywords: ['hex viewer online', 'hex editor in browser', 'inspect binary file', 'memory offset hex grid', 'raw byte inspector'],
    capabilities: ['16-Column Hex Byte Grid', 'Memory Offset Addresses (0x00000000)', 'Side-by-side ASCII Translation', 'Byte Frequency & Value Distribution', 'Fast Hex Value Search'],
    schemaCategory: 'DeveloperApplication',
    faqs: [
      {
        question: 'Can I inspect unknown or corrupted files with the Hex Inspector?',
        answer: 'Yes! The Hex Inspector acts as a universal fallback for any file format, allowing you to inspect the raw binary byte stream and identify magic headers.'
      }
    ]
  }
};

/**
 * Resolves SEO record by file extension, mime type, or file name
 */
export function getFormatSeo(identifier: string): FormatSeoRecord {
  if (!identifier) return FORMAT_SEO_REGISTRY.pdf;

  const clean = identifier.toLowerCase().trim();
  // Strip leading dot if present
  const ext = clean.startsWith('.') ? clean.slice(1) : clean;
  // If filename, get extension
  const fileExt = ext.includes('.') ? ext.split('.').pop() || ext : ext;

  // Direct match
  if (FORMAT_SEO_REGISTRY[fileExt]) {
    return FORMAT_SEO_REGISTRY[fileExt];
  }

  // Alias match
  for (const record of Object.values(FORMAT_SEO_REGISTRY)) {
    if (
      record.id === fileExt ||
      record.extension.toLowerCase().includes(fileExt) ||
      record.aliases.some(a => a.toLowerCase() === fileExt || a.toLowerCase() === clean)
    ) {
      return record;
    }
  }

  // Fallback to hex/binary inspector
  return FORMAT_SEO_REGISTRY.hex;
}

/**
 * Generates Schema.org JSON-LD structured data for a specific format
 */
export function generateFormatJsonLd(seo: FormatSeoRecord, currentUrl = 'https://file.suhail.top') {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${currentUrl}#software`,
        name: `OmniView - ${seo.name}`,
        url: currentUrl,
        applicationCategory: seo.schemaCategory,
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description: seo.metaDescription,
        fileFormat: [seo.mimeType, seo.extension],
        featureList: seo.capabilities,
        author: {
          '@type': 'Person',
          name: 'Suhail Akhtar',
          url: 'https://suhail.top'
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      },
      {
        '@type': 'FAQPage',
        '@id': `${currentUrl}#faq`,
        mainEntity: seo.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  };
}
