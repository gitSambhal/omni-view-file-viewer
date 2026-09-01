# Changelog

All notable changes to **OmniView File Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.0] - 2026-09-01

### Added
- **100% In-Memory Real-Time SQL Query Execution Engine**:
  - Integrated full client-side relational SQL execution engine (`alasql`) supporting `SELECT`, `JOIN`, `GROUP BY`, `INSERT`, `UPDATE`, `CREATE TABLE`, and DDL/DML statements.
  - Real-time SQL console with keyboard shortcut (`Ctrl + Enter`), query execution timer in milliseconds, success/error feedback badges, and query history carousel.
  - Interactive table browser with record filtering, row numbers, NULL value formatting, and table switching.
  - 1-Click CSV and JSON query results exporter.
- **HTML Live Preview Studio (`.html`, `.htm`, `.xhtml`)**:
  - Interactive live sandbox iframe with client-side JavaScript execution and embedded console log capturing (`console.log`, `console.warn`, `console.error`, and uncaught runtime errors).
  - View modes: **Live Preview**, **Split View** (Source code on left, Live rendering on right), **Source Code**, and **DOM Tree Hierarchy** inspector with element tag, ID, and class filtering.
  - Responsive viewport controls with device presets: Responsive Desktop, Tablet (768px), and Mobile (375px).
  - Quick action toolbar to reload iframe, open in external browser tab, copy source, or download file.
  - Seamless 1-click **Live Preview** button in Code Viewer and Reader Switcher for all HTML, SVG, and web files.

---

## [1.4.0] - 2026-09-01

### Added
- **Localhost & Private Network Permission Gateway**:
  - Interactive popup modal triggered whenever an HTTP/REST request targets `localhost`, `127.0.0.1`, or local private network endpoints.
  - Transparent Private Network Access (PNA) & CORS security rationale explanation.
  - "Allow & Execute Request" with session preference retention.
  - 1-Click "Copy cURL Command" for terminal execution without browser sandbox restrictions.
  - Interactive Local CORS Configuration Guide with copyable snippets for Node.js Express, Python FastAPI, and Go.
- **Comprehensive Supported Formats & Capabilities Directory (`SupportedFormatsModal`)**:
  - Searchable directory of 60+ supported file extensions across 15 format categories with capability badges.
  - Fast search by extension, category, or feature keywords.
  - Direct trigger from Header and Landing Page.
- **Redesigned Landing Page & Format Showcase**:
  - Category showcase cards (HTTP/REST, PE/DLL Binaries, Fonts, SQL Databases, Documents, Spreadsheets, Code & Config, Media & Archives).
  - Quick action to explore full directory and load interactive demos.

---

## [1.3.0] - 2026-09-01

### Added
- **HTTP & REST Client Studio (`.http`, `.rest`)**:
  - Interactive multi-request parser for JetBrains / VS Code REST Client files.
  - Variable definition (`@var = value`) and substitution (`{{var}}`).
  - Request execution via client-side `fetch` with status pill, response timing, headers inspector, and formatted JSON/Text body.
  - 1-Click cURL command generator for CLI and terminal testing.
- **Binary & DLL PE Header Inspector (`.dll`, `.exe`, `.so`, `.dylib`, `.wasm`, `.class`, `.pyc`)**:
  - Deep binary analysis parsing PE/COFF architecture (x86, x64, ARM64), subsystem, entry point RVA, image base, and timestamp.
  - Section table explorer inspecting `.text`, `.rdata`, `.data`, `.pdata`, `.reloc` sizes and memory offsets.
  - Extracted symbol/ASCII string scanner with specialized filters for Win32/System APIs, HTTP/HTTPS URLs, file paths, and GUIDs.
  - Direct integration with Hex Byte Inspector.
- **Typographic Font & Glyph Specimen Studio (`.ttf`, `.otf`, `.woff`, `.woff2`)**:
  - Dynamic in-browser font loading and rendering.
  - Specimen waterfall viewer with standard font scales (12px to 72px).
  - Standard character glyph grid with unicode hex points and 1-click clipboard copy.
  - Interactive customizer with font size, letter-spacing, and line-height controls.
- **Cryptographic Certificate & Key Inspector (`.pem`, `.crt`, `.cer`, `.key`, `.pub`, `.csr`)**:
  - PEM block detection for X.509 certificates, RSA private keys, and public keys.
  - Payload length calculation, estimated bit length (2048-bit, 4096-bit, ECC), and raw encoded structure viewer.

---

## [1.2.0] - 2026-09-01

### Added
- **Dynamic Reader Switcher ("View As / Reader Mode")**: Switch the active view for any file dynamically between Code/Syntax Highlighter, JSON/Data Tree, Markdown Formatter, Plain Text, Log Analyzer, Hex Byte Inspector, Table Grid, GeoJSON Map, Subtitles, E-Book Reader, and Database SQL Console.
- **App-Level Global Drag-and-Drop**: Drop files anywhere across the entire browser viewport with a responsive full-screen drop overlay and instantaneous tab opening.
- **Resilient Large Media & MP4 Streaming**: Re-architected media loading to use zero-copy `URL.createObjectURL` streaming, eliminating browser ArrayBuffer memory allocation limits and permission errors when opening large video files (e.g. multi-gigabyte `.mp4`, `.mkv`, `.webm`).
- **Enhanced Configuration & Code Detection**: Config and environment files (`.env`, `.yaml`, `.yml`, `.toml`, `.ini`, `.conf`, `.properties`) now default cleanly to Code View with syntax coloring, with 1-click dynamic switching to structured Tree or Text views.

---

## [1.1.0] - 2026-09-01

### Added
- **Log Viewer**: Live filter severity pills (ERROR, WARN, INFO, DEBUG, SUCCESS), timestamp extraction, and keyword filtering for `.log`, `.out`, `.err`, and `syslog`.
- **GeoJSON & Spatial Map Viewer**: Feature count, geometry type badges, properties inspection tables, and coordinate viewers for `.geojson`, `.gpx`, `.kml`, and `.topojson`.
- **Subtitle & Caption Reader**: Formatted dialogue cue cards and timestamp ranges for `.srt`, `.vtt`, `.ass`, `.sub`.
- **E-Book & OpenDocument Viewer**: Word count analytics, estimated reading time, and typography controls for `.epub`, `.odt`, `.rtf`, `.pages`.

---

## [1.0.0] - 2026-09-01

### Added
- **100% Offline & Local Processing Engine**: Zero server uploads, guaranteeing complete privacy & security.
- **Multi-Tab Workspace**: Tab management with drag/drop upload, close tabs, pin tabs, duplicate tabs, and keyboard shortcuts.
- **Live Sync Engine**: File System Access API & polling sync detector with real-time status indicators (Live Syncing, Updated, Modified timestamp).
- **Universal Format Support**:
  - **PDF Documents**: Clean PDF renderer with page controls, zoom, and text extraction.
  - **Office Files**: Word (`.docx`), Excel (`.xlsx`, `.xls`, `.ods`), PowerPoint (`.pptx` slide parser), CSV/TSV data grid.
  - **Code & Text**: Syntax highlighting for 50+ languages with line numbers, copy code, word wrap toggle, search within code.
  - **Markdown (`.md`)**: Rendered rich preview & raw code split view with GitHub-flavored markdown support.
  - **Databases (`.db`, `.sqlite`, `.sql`, `.accdb`, `.mdb`, `.csv`)**: Interactive table grid, schema inspector, custom SQL query console for SQLite, and binary hex schema analyzer for `.accdb` / `.mdb`.
  - **Media Viewer**: Image viewer with zoom, pan, rotation, EXIF/metadata inspection; Video & Audio player with visualizer & speed control.
  - **Archive Explorer (`.zip`, `.tar`, `.gz`)**: Unpack and browse files directly inside ZIP archives without extracting to disk.
  - **JSON / XML / YAML**: Tree inspector with expandable/collapsible nodes and search filter.
  - **Universal Hex & Byte Inspector**: Fallback hex viewer for any unknown or binary file with byte offsets, ASCII decode, and file type detection.
- **Dark / Light Theme Engine**: Smooth dark mode toggle with system preference detection and localStorage persistence.
- **Sample Files & Demo Preloads**: Built-in interactive sample files for quick exploration (Sample PDF, Code, Markdown, Excel, SQLite DB, Image, etc.).
- **Developer Attribution**: Authored by Suhail Akhtar (https://suhail.top).
