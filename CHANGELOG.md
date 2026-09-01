# Changelog

All notable changes to **OmniView File Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
