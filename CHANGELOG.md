# Changelog

All notable changes to **OmniView File Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-09-04

### Added & Improved
- **Unified Workspace Layout & Collapsible Explorer Sidebar (`Sidebar.tsx`)**:
  - **Workspace File Drawer**: Integrated a collapsible sidebar (`Ctrl+B` / `Cmd+B`) showing all open workspace files with category icons, file size badges, active reader indicators, and unsaved changes dots.
  - **Memory & Storage Monitor**: Real-time aggregation of total files in memory, cumulative RAM footprint, and active live sync count.
  - **Quick Scratchpad Generator**: One-click creation of in-memory scratchpads for TypeScript, Python 3.12, SQLite, Markdown, HTML5 canvas, and JSON.
  - **Quick Tool Launchers**: Direct access to NPM Playground, Code Runners Guide, Live Sync Dashboard, Remote URL Fetcher, and Format Directory.
- **Global Command Palette (`CommandPalette.tsx`)**:
  - **Instant Keyboard Navigation (`Ctrl+K` / `Cmd+K`)**: Fast access to all open files, tools, and actions from anywhere in the app.
  - **Fuzzy Search & Grouping**: Smart filtering across Open Files, Quick Actions, Code Runners, and Workspace Tools.
  - **Full Keyboard Accessibility**: Up/Down arrow navigation, Enter to execute, Escape to dismiss, and instant action execution.
- **Streamlined Modern Header & Tools Hub (`Header.tsx`)**:
  - **Consolidated Navigation**: Organized top bar with Sidebar toggle, Command Palette launcher button with keyboard shortcut hint (`⌘K`), and a consolidated "Tools" dropdown menu.
  - **Quick Action Triggers**: Dedicated buttons for File Picker, In-Memory Scratchpads, and NPM Playground.
- **Enhanced Welcome & Feature Hub (`DropZone.tsx`)**:
  - **Instant Starter Scratchpads**: Interactive cards to quickly launch TypeScript, Python, SQL, or Markdown playgrounds when starting fresh or when all tabs are closed.
  - **Organized Format Categories**: Clear, high-contrast capability cards showcasing support for 60+ extensions without visual clutter.

## [2.1.0] - 2026-09-04

### Added
- **Dynamic NPM Package Loader & In-Browser Testing Engine (`codeRunners.ts`)**:
  - **Dynamic In-Memory CDN Package Resolution**: Load and execute any arbitrary NPM package directly in JavaScript/TypeScript sandboxes in real time via high-speed browser-compatible CDNs (`esm.sh` with automatic fallback to `cdn.jsdelivr.net`).
  - **Zero Local Installs**: Completely bypasses local `npm install` and Node.js dependencies — packages are loaded and cached in-memory client-side on demand.
  - **Smart Static & Dynamic Import Scanner**: Scans user code before execution for standard ES module `import ... from 'pkg'`, CommonJS `require('pkg')`, dynamic `import('pkg')`, and `npm('pkg')` statements, resolving all dependencies before running.
  - **Direct Sandbox Injection**: Injected `npm()`, `requireNpm()`, and `importModule()` helpers directly into the sandboxed execution scope for ad-hoc runtime module imports (e.g., `const _ = await npm('lodash')`).
  - **Multi-Level Module Cache**: In-memory module cache preventing duplicate network roundtrips for previously loaded NPM libraries.
- **Interactive NPM Package Tester & Live CDN Playground (`NpmTesterModal`)**:
  - **Instant Package Search & Test**: Search for any NPM package by name or scoped package (e.g. `@faker-js/faker`, `dayjs`, `mathjs`, `zod`, `lodash`), load its live exports, and run test code in an in-browser sandbox.
  - **Live Package Exports Inspector**: Automatically analyzes loaded module keys and functions with type badges (`Function`, `Object`, `Number`, `String`).
  - **Curated Package Presets**: 10+ popular pre-configured library playgrounds with ready-to-run interactive code examples:
    - *lodash* (Deep grouping & math aggregations)
    - *zod* (Schema validation & error handling)
    - *dayjs* (Date parsing, formatting & relative times)
    - *mathjs* (Complex math expressions, calculus & matrix arithmetic)
    - *canvas-confetti* (Direct DOM visual FX celebration animation)
    - *papaparse* (In-browser CSV parsing & transformation)
    - *chroma-js* (Color scales, conversions & palette generation)
    - *uuid* (Cryptographic v4 & v5 UUID generation)
    - *marked* (Markdown to HTML compilation)
    - *qs* (URL querystring serialization & parsing)
  - **One-Click Code Editor Actions**:
    - **Insert Import**: Directly inserts the corresponding ES6 import statement at the top of the currently active code tab.
    - **Open in New Tab**: Spawns a dedicated `.ts` / `.js` playground file with full syntax highlighting, editor status bar, and code runner integration.
    - **Copy Snippet**: Copies ready-to-use code with CDN import headers directly to clipboard.
- **Unified Navigation & Code Viewer Toolbar**:
  - Added dedicated **NPM** launcher buttons in the application Header and in the CodeViewer toolbar.

---

## [2.0.0] - 2026-09-04

### Fixed & Improved
- **Intelligent TypeScript vs MPEG-TS Video Disambiguation (`fileDetector.ts` & `App.tsx`)**:
  - **Resolution for Default Browser MIME Misidentification**: Web browsers and operating system file pickers assign `file.type = "video/mp2t"` to `.ts` files by default. OmniView now prioritizes TypeScript (`code`) for `.ts`, `.tsx`, `.mts`, `.cts`, and `.d.ts` files.
  - **Binary Header Content Sniffing (`probeAmbiguousCategory`)**: Probes the leading 2KB slice of ambiguous `.ts` / `.mts` files to detect true binary MPEG-2 Transport Stream sync packet sequences (`0x47` repeating at 188/376 byte intervals) and null byte density.
  - **Seamless Code Viewer Integration**: TypeScript files automatically open in the interactive Code Viewer with TypeScript syntax highlighting, type-safe execution, formatting, and font ligatures, while actual MPEG-2 video transport streams route to the Cinema Video Player.
  - **Universal URL Fetcher**: Open any remote file directly by pasting its URL (documents, code, spreadsheets, images, audio, video, databases).
  - **Intelligent URL Normalization**: Automatically converts standard GitHub (`github.com/.../blob/...`) and GitLab web links into raw downloadable streaming endpoints (`raw.githubusercontent.com/...`).
  - **CORS Proxy Fallback Engine**: If standard direct `fetch()` is blocked by target server CORS headers, OmniView offers a transparent 1-click CORS proxy fallback (`corsproxy.io`) so users can open remote assets without local server requirements.
  - **Sample Remote Presets**: Quick 1-click loading of popular remote files (GitHub Python algorithms, remote GeoJSON maps, NASA datasets, SQLite demo databases, remote Markdown READMEs).
- **Universal In-Browser Code Runners & Execution Engines (`codeRunners.ts` & `CodeRunnersModal`)**:
  - **JavaScript & Modern ES2024 / ES Modules**: Full in-memory AST compiler and sandbox with top-level `await`, `import`/`export` resolution, custom console interceptors, return-value capture, and async execution.
  - **TypeScript & TSX Engine (Sucrase AST Compiler)**: Replaced naive regex stripping with the high-performance Sucrase compiler. Accurately compiles TypeScript interfaces, type aliases, enums, generic functions, type assertions, class properties, and JSX/TSX syntax.
  - **Safe Require & Module Resolver**: Custom browser-side `require` proxy supporting `react`, `alasql`, `math`, `crypto`, `path`, `util`, `events`, and `buffer` built-ins with fail-safe mock proxies for external libraries.
  - **Python 3.12 (Pyodide & Local Engine)**: Integrated CPython 3.12 WebAssembly via Pyodide with fallback offline execution engine for algorithms, math, and data processing.
  - **SQL Relational Database Engine (AlaSQL)**: In-memory relational database runner supporting `CREATE TABLE`, `INSERT`, `SELECT`, `JOIN`, and aggregations with interactive results data tables.
  - **Bash / Unix Shell Pipeline Simulator**: In-browser command pipeline execution supporting pipes (`|`), standard Unix utilities (`echo`, `grep`, `sort`, `uniq`, `wc`, `head`, `tail`, `base64`, `date`, `cat`), and environment variables.
  - **JSON & Data Transformation**: Live syntax validator and data structure return-value inspector.
  - **Regular Expression Pattern Matcher**: Real-time RegExp tester parsing `/pattern/flags` against target text with matches counter and capture groups table.
  - **Brainfuck Turing Machine VM**: Complete 30,000-cell memory tape emulator.
  - **Rich Output Console**: Interactive execution drawer with color-coded log badges (`LOG`, `INFO`, `WARN`, `ERROR`, `RETURN`, `TABLE`), interactive tabular data grids, milliseconds execution timer, and copy output buttons.
  - **Code Runners Directory Guide**: Interactive modal detailing all engine specs, capabilities, security isolation sandbox, and "Try in Editor" sample code snippets.

---

## [1.9.0] - 2026-09-04

### Added
- **True Fullscreen Video Cinema Studio Player (`MediaViewer`)**:
  - **Full-Viewport Cinema Mode**: Edge-to-edge video canvas eliminating fixed max-width constraints, outer container borders, and padding.
  - **Black Bar Eliminator / Aspect Fit Controls**: Instant toggle between *Fit Screen* (`object-contain`), *Fill / No Bars* (`object-cover` with smooth centered crop), and *Stretch* (`object-fill`).
  - **Auto-Hiding Floating Overlay Controls**: Controls float over the video stream with subtle radial/linear gradients and smoothly auto-hide after 2.5s of inactivity while playing. The cursor is hidden when controls are dismissed for a clean cinematic view.
  - **Dual Fullscreen Engine**: Native Fullscreen API with graceful fallback to In-Window Theater Mode (`fixed inset-0 z-[99999]`) ensuring full-screen playback works flawlessly even within restricted iframe containers.
  - **Interactive Scrubbing & Time Tooltip**: Responsive timeline scrubber displaying live hover timestamp tooltips and remaining/elapsed time display.
  - **Keyboard Shortcuts**: Complete desktop hotkeys (`Space`/`K` to play/pause, `F` for fullscreen, `T` for theater mode, `M` for mute, `J`/`L` or `Left`/`Right` for 5s jumps, and `Up`/`Down` for volume).
  - **Animated Splash Feedback**: Visual pulse indicator on play/pause clicks directly on the video.
- **Offline Video & Audio Synthesis Engine (`sampleMedia.ts`)**:
  - Built-in canvas and WebM/MP4 generator creating offline video loops with animated geometry, real-time timecodes, and dynamic visualizer bars.
  - Synthesized 16-bit stereo PCM WAV generator creating smooth ambient chords for offline audio testing without network dependencies.

### Fixed
- **DocxViewer Infinite Loading**: Resolved bug where files without binary ArrayBuffer or text fallback remained locked in an infinite loading spinner.
- **PptxViewer Error Handling**: Added dedicated error boundary state and empty slide fallback preventing silent failures on corrupted or non-standard PPTX archives.
- **MediaViewer Prop Synchronization**: Connected `fileRaw` direct object URL fallback to prevent broken media src issues.

---

## [1.8.0] - 2026-09-02

### Added
- **Search-Enabled View / Reader Switcher**:
  - Integrated real-time reader search bar across all 23+ viewers by name, description keywords, category group, and supported file extensions.
  - Interactive "Suggested for this file" badge highlighting recommended reader modes.
  - Fast keyboard navigation (`Esc` to dismiss) and auto-focused search input.
- **Intelligent Quick Switcher Chips Engine**:
  - Dynamically calculates valid view modes tailored strictly to the active file's genuine capabilities:
    - **JSON / XML / YAML / TOML**: `Tree` + `Code` + `Text` + `Hex` (and `Preview` for XML/SVG)
    - **GeoJSON**: `Map` + `Tree` + `Code` + `Text` + `Hex`
    - **Live Web / HTML / SVG**: `Preview` + `Code` + `Tree` + `Text` + `Hex`
    - **Markdown**: `Markdown` + `Code` + `Text` + `Hex`
    - **Source Code (TS, JS, Python, C++, Rust, Go, CSS, etc.)**: `Code` + `Text` + `Hex` (omits invalid Tree inspector)
    - **HTTP / REST API**: `HTTP Studio` + `Code` + `Text` + `Hex`
    - **Database / SQL**: `Database` + `Code` + `Text` + `Hex`
    - **Spreadsheet / CSV / Excel**: `Table` + `Text` + `Code` + `Hex`
    - **Binaries (EXE, DLL, ELF, WASM)**: `PE Inspector` + `Hex`
    - **Documents (PDF, DOCX, PPTX)**: `Document Viewer` + `Archive` (for Zip-based office docs) + `Hex`
    - **Images, Audio & Video**: Native viewer + `Hex`
- **Dropdown Z-Index & Stacking Protection**:
  - Elevated subheader bars with `relative z-30` and dropdown container with elevated stacking `z-50` / `9999` to eliminate rendering behind iframes, canvases, and split panes.

---

## [1.7.0] - 2026-09-02

### Added
- **Full-Featured Interactive Code Editor & Typography Engine (`CodeViewer`)**:
  - **Multi-Language Code Formatter**: 1-Click Code Formatting engine with Prettier standalone (`Shift + Alt + F` / `Ctrl + Shift + I` / `Cmd + Shift + I`) with specialized formatters for JavaScript, TypeScript, JSX, HTML, CSS, SCSS, Markdown, YAML, SQL (keyword capitalization and clause breaking), and JSON.
  - **Granular Line Height & Spacing Controls**: Adjustable line heights for code reading (*Compact 1.35x*, *Normal 1.6x*, *Relaxed 1.85x*, *Spacious 2.1x*).
  - **Monospace Font Family Selection**: Selectable high-legibility developer typefaces including *JetBrains Mono*, *Fira Code*, *Cascadia Code*, *Consolas / Monaco*, and *System Monospace* with ligatures support.
  - **Font Scale & Zoom**: 10px to 26px font-size range with responsive gutter line numbers synchronization.
  - **Enhanced Code Editing & Indentation**: Smart `Tab` / `Shift + Tab` multi-line indentation without focus loss, Enter key auto-indentation with brace expansion, and auto-closing brackets/quotes.
  - **Search & Replace Bar (`Ctrl + F` / `Cmd + F`)**: Integrated find & replace with match counter (`1 of 12`), Next/Previous navigation, Case Sensitive mode (`Aa`), Replace, and Replace All.
  - **Real-Time Editor Status Bar**: Live Line & Column indicator, selection character counter, total lines, character count, tab width, and UTF-8 encoding.
- **Enhanced Live Sync Engine v2 (`useLiveSync`)**:
  - **Bidirectional Disk Sync**: Direct save to disk (`Ctrl + S` / `Cmd + S` or Save button) using the File System Access API (`fileHandle.createWritable()`) with fallback Save As picker.
  - **Drag-and-Drop Handle Detection**: Dropping files onto the application automatically extracts `FileSystemFileHandle` from modern browser dataTransfer items for instant continuous live synchronization.
  - **Manual Disk Reload & Live Status**: 1-Click "Reload from Disk" and real-time live sync indicators showing active disk watch status and unsaved edits state.

---

## [1.6.0] - 2026-09-01

### Added
- **Full Interactive E-Book (.epub) Engine**:
  - Direct client-side decompression and parsing of `.epub` zip archives into full multi-chapter books using `JSZip`.
  - Parses `META-INF/container.xml`, OPF packages, manifest metadata, spine reading order, and NCX/Nav table of contents.
  - Resolves and renders embedded illustrations, cover art, and diagrams as data URLs.
  - **Reading Modes & Appearance Controls**:
    - 4 Reading Themes: *Paper Light*, *Warm Sepia*, *Slate Midnight*, and *OLED Pure Dark*.
    - Typefaces: Serif (Georgia/Playfair), Sans-Serif (System), Monospace, and Dyslexic.
    - Font scale slider (12px to 28px), line-height spacing (Compact, Normal, Relaxed), and column width options.
    - Table of Contents sidebar with reading progress counters and chapter word counts.
    - Real-time book search across all chapters with instant chapter jumping.
    - Web Speech API **Read Aloud** Text-to-Speech audio reader.
    - Chapter bookmarks with local persistence.
- **Universal Code Sandbox & Script Runner (`CodeViewer`)**:
  - In-browser safe execution sandbox for **JavaScript**, **TypeScript**, **Python**, and **Shell / Bash** scripts.
  - Interactive bottom drawer terminal capturing execution time in milliseconds, return values, and real-time logs (`console.log`, `console.info`, `console.warn`, `console.error`).
  - Seamless 1-click **Live HTML Preview** and **SQL Studio** runner integration.
  - Demo EPUB book (*"The Art of Offline Computing"* by Suhail Akhtar) included in sample files.

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
