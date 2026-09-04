/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * Supported File Formats & Reader Capabilities Registry
 */

import {
  FileText,
  Table,
  Presentation,
  Code,
  Database,
  Archive,
  ImageIcon,
  Video,
  Music,
  MapPin,
  Subtitles,
  BookOpen,
  Globe,
  Cpu,
  Type,
  ShieldCheck,
  Binary,
  Layers
} from 'lucide-react';
import { FileCategory } from '../types/file';

export interface FormatDefinition {
  extension: string;
  name: string;
  category: FileCategory;
  categoryName: string;
  mimeType: string;
  description: string;
  capabilities: string[];
  icon: any;
  color: string;
  badgeBg: string;
}

export const SUPPORTED_CATEGORIES = [
  { id: 'all', label: 'All Formats' },
  { id: 'html', label: 'HTML & Live Web' },
  { id: 'http', label: 'HTTP & REST APIs' },
  { id: 'binary', label: 'Binaries & DLLs' },
  { id: 'font', label: 'Fonts & Glyphs' },
  { id: 'certificate', label: 'Certificates & Keys' },
  { id: 'database', label: 'Databases & SQL' },
  { id: 'pdf', label: 'Documents & PDFs' },
  { id: 'excel', label: 'Spreadsheets' },
  { id: 'code', label: 'Code & Scripts' },
  { id: 'json', label: 'Config & JSON' },
  { id: 'geojson', label: 'Geospatial Maps' },
  { id: 'subtitle', label: 'Subtitles & Cues' },
  { id: 'video', label: 'Media & Video' },
  { id: 'archive', label: 'Archives (ZIP/TAR)' },
  { id: 'hex', label: 'Hex & Low-level' }
] as const;

export const SUPPORTED_FORMATS: FormatDefinition[] = [
  // 0. HTML & Live Web
  {
    extension: '.html',
    name: 'HTML Web Document',
    category: 'html',
    categoryName: 'HTML & Live Web',
    mimeType: 'text/html',
    description: 'HyperText Markup Language file with live sandbox preview, split code/preview mode, DOM tree hierarchy inspector, responsive viewport switch, and live console logs.',
    capabilities: ['Live Sandbox Preview', 'Split View Mode', 'DOM Tree Hierarchy', 'Mobile/Tablet Viewport', 'Live Console Inspector'],
    icon: Globe,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    extension: '.htm',
    name: 'HTM Web Page',
    category: 'html',
    categoryName: 'HTML & Live Web',
    mimeType: 'text/html',
    description: 'Legacy web page format supported with isolated sandbox execution and full DOM inspection.',
    capabilities: ['Live Iframe Preview', 'Responsive Frame', 'DOM Inspector', 'Console Bridge'],
    icon: Globe,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    extension: '.xhtml',
    name: 'Extensible HTML Document',
    category: 'html',
    categoryName: 'HTML & Live Web',
    mimeType: 'application/xhtml+xml',
    description: 'Strict XML-based HTML web document with live rendering, syntax highlighting, and element hierarchy.',
    capabilities: ['Live Sandbox Preview', 'DOM Tree Navigation', 'Source Code Split', 'Export HTML'],
    icon: Globe,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },

  // 1. HTTP & REST API Client
  {
    extension: '.http',
    name: 'HTTP Request File',
    category: 'http',
    categoryName: 'HTTP & REST APIs',
    mimeType: 'text/plain',
    description: 'JetBrains / VS Code REST Client files with interactive runner, environment variables, and headers.',
    capabilities: ['Live In-Browser Fetch', 'Localhost Permission Gateway', 'Variable Interpolation', 'cURL Exporter', 'Response Timing'],
    icon: Globe,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.rest',
    name: 'REST Client File',
    category: 'http',
    categoryName: 'HTTP & REST APIs',
    mimeType: 'text/plain',
    description: 'REST API specification and test requests with query parameters and JSON/form payloads.',
    capabilities: ['Request Runner', 'Headers Inspector', 'Status Badges', 'cURL Exporter', 'Localhost Gateway'],
    icon: Globe,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },

  // 2. Binary & Executables
  {
    extension: '.dll',
    name: 'Windows Dynamic Link Library',
    category: 'binary',
    categoryName: 'Binaries & DLLs',
    mimeType: 'application/x-msdownload',
    description: 'Deep PE/COFF header introspection, section table explorer (.text, .rdata, .data), and symbol string scanner.',
    capabilities: ['PE/COFF Headers', 'Section Table', 'API & URL Scanner', 'Architecture (x86/x64)', 'Hex Inspector'],
    icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.exe',
    name: 'Windows Executable',
    category: 'binary',
    categoryName: 'Binaries & DLLs',
    mimeType: 'application/x-msdownload',
    description: 'Portable Executable binary header, EntryPoint RVA, image base, and embedded printable strings.',
    capabilities: ['PE Headers', 'Subsystem Detection', 'Printable ASCII Scanner', 'Hex Offset View'],
    icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.wasm',
    name: 'WebAssembly Binary',
    category: 'binary',
    categoryName: 'Binaries & DLLs',
    mimeType: 'application/wasm',
    description: 'WebAssembly bytecode module headers, magic bytes verification, and section introspection.',
    capabilities: ['WASM Magic Bytes', 'Section Scanner', 'Exported Symbols', 'Hex Offset View'],
    icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.so',
    name: 'Shared Object (Linux ELF)',
    category: 'binary',
    categoryName: 'Binaries & DLLs',
    mimeType: 'application/octet-stream',
    description: 'Linux ELF shared library binary inspector and symbol table parser.',
    capabilities: ['ELF Magic Bytes', 'Symbol Extraction', 'URL Scanner', 'Hex Inspection'],
    icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.dylib',
    name: 'Mach-O Dynamic Library (macOS)',
    category: 'binary',
    categoryName: 'Binaries & DLLs',
    mimeType: 'application/octet-stream',
    description: 'macOS Mach-O binary introspection and embedded string discovery.',
    capabilities: ['Mach-O Headers', 'Symbol Scanner', 'Hex Offset Inspection'],
    icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.class',
    name: 'Java Bytecode Class',
    category: 'binary',
    categoryName: 'Binaries & DLLs',
    mimeType: 'application/java-vm',
    description: 'Java Virtual Machine compiled bytecode (CAFEBABE) header parser.',
    capabilities: ['Magic Byte Verification', 'Constant Pool Strings', 'Hex Inspection'],
    icon: Cpu,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },

  // 3. Fonts & Typography
  {
    extension: '.ttf',
    name: 'TrueType Font',
    category: 'font',
    categoryName: 'Fonts & Glyphs',
    mimeType: 'font/ttf',
    description: 'Dynamic browser font registration, waterfall size specimen (12-72px), and glyph character grid.',
    capabilities: ['Dynamic Font Loading', 'Specimen Waterfall', 'Glyph Grid (Unicode Copy)', 'Interactive Canvas'],
    icon: Type,
    color: 'text-pink-500 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
  },
  {
    extension: '.otf',
    name: 'OpenType Font',
    category: 'font',
    categoryName: 'Fonts & Glyphs',
    mimeType: 'font/otf',
    description: 'OpenType typographic specimen with customizable letter spacing, font size, and line height.',
    capabilities: ['OpenType Rendering', 'Glyph Inspector', 'Live Customizer', 'Unicode Codepoints'],
    icon: Type,
    color: 'text-pink-500 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
  },
  {
    extension: '.woff',
    name: 'Web Open Font Format',
    category: 'font',
    categoryName: 'Fonts & Glyphs',
    mimeType: 'font/woff',
    description: 'Web font specimen viewer and glyph character map with real-time test sentences.',
    capabilities: ['WOFF Web Registration', 'Waterfall Specimen', 'Glyph Map', 'Custom Editor'],
    icon: Type,
    color: 'text-pink-500 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
  },
  {
    extension: '.woff2',
    name: 'Web Open Font Format 2.0',
    category: 'font',
    categoryName: 'Fonts & Glyphs',
    mimeType: 'font/woff2',
    description: 'High-compression WOFF2 web font inspection and dynamic specimen playground.',
    capabilities: ['Brotli WOFF2 Loading', 'Interactive Specimen', 'Glyph Grid', 'Pangram Presets'],
    icon: Type,
    color: 'text-pink-500 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
  },

  // 4. Certificates & Keys
  {
    extension: '.pem',
    name: 'Privacy Enhanced Mail Certificate',
    category: 'certificate',
    categoryName: 'Certificates & Keys',
    mimeType: 'application/x-pem-file',
    description: 'X.509 certificate and RSA/ECC private key structure analyzer with bit length estimation.',
    capabilities: ['PEM Object Identification', 'Key Category Detection', 'Bit Length Estimation', 'Formatted Export'],
    icon: ShieldCheck,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.crt',
    name: 'SSL/TLS Public Certificate',
    category: 'certificate',
    categoryName: 'Certificates & Keys',
    mimeType: 'application/x-x509-ca-cert',
    description: 'SSL/TLS public certificate parser and cryptographic parameter inspection.',
    capabilities: ['X.509 Parsing', 'Security Cards View', 'Raw Base64 Export'],
    icon: ShieldCheck,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.key',
    name: 'Cryptographic Private Key',
    category: 'certificate',
    categoryName: 'Certificates & Keys',
    mimeType: 'application/pkcs8',
    description: 'RSA, ECC, and Ed25519 private key block inspector with confidential markings.',
    capabilities: ['Private Key Detection', 'Payload Length Calc', 'Copy PEM Block'],
    icon: ShieldCheck,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },

  // 5. Databases & SQL
  {
    extension: '.sqlite',
    name: 'SQLite Database',
    category: 'database',
    categoryName: 'Databases & SQL',
    mimeType: 'application/x-sqlite3',
    description: 'In-browser client-side WebAssembly SQL query runner, schema table tree, and pagination table grid.',
    capabilities: ['In-Browser SQL Engine', 'Interactive Query Console', 'Schema Tree', 'Export to CSV/JSON'],
    icon: Database,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.db',
    name: 'Database File (.db / SQLite)',
    category: 'database',
    categoryName: 'Databases & SQL',
    mimeType: 'application/x-sqlite3',
    description: 'SQLite and relational database file reader with table inspection.',
    capabilities: ['Table Browser', 'SQL Syntax Queries', 'Column Types', 'Result Paging'],
    icon: Database,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.sql',
    name: 'SQL Script & Relational Database',
    category: 'database',
    categoryName: 'Databases & SQL',
    mimeType: 'text/x-sql',
    description: 'SQL DDL/DML script viewer with syntax highlighting and 100% in-browser real-time SQL execution engine with table browser, result grid, presets, and CSV/JSON export.',
    capabilities: ['In-Memory SQL Runner', 'SELECT / JOIN / GROUP BY', 'Table Browser & Paging', 'CSV & JSON Data Export', 'Schema DDL Inspector'],
    icon: Database,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.accdb',
    name: 'Microsoft Access Database',
    category: 'database',
    categoryName: 'Databases & SQL',
    mimeType: 'application/msaccess',
    description: 'Microsoft Access database file inspection and table schema viewer.',
    capabilities: ['Access Schema Inspector', 'Table Metadata', 'Hex Byte View'],
    icon: Database,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },

  // 6. Documents & Office
  {
    extension: '.pdf',
    name: 'Portable Document Format',
    category: 'pdf',
    categoryName: 'Documents & PDFs',
    mimeType: 'application/pdf',
    description: 'Native PDF.js rendering with thumbnail sidebar, text search, zoom presets, page rotation, and print.',
    capabilities: ['Thumbnails Bar', 'Full-Text Search', 'Page Rotation', 'Fit-to-Width / Fit-to-Page', 'Print & Export'],
    icon: FileText,
    color: 'text-red-500 dark:text-red-400',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
  },
  {
    extension: '.docx',
    name: 'Microsoft Word Document',
    category: 'docx',
    categoryName: 'Documents & PDFs',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'High-fidelity DOCX rendering preserving typography, tables, headings, styles, and image attachments.',
    capabilities: ['Native Document Flow', 'Table Styling', 'Embedded Images', 'Typography Scaling'],
    icon: FileText,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    extension: '.pptx',
    name: 'Microsoft PowerPoint Presentation',
    category: 'pptx',
    categoryName: 'Documents & PDFs',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    description: 'Slide-by-slide presentation viewer with thumbnail sidebar, navigation controls, and fullscreen slideshow.',
    capabilities: ['Slide Thumbnails', 'Slideshow Mode', 'Text Content Extraction', 'Shape Layout'],
    icon: Presentation,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  {
    extension: '.epub',
    name: 'Electronic Publication E-Book',
    category: 'ebook',
    categoryName: 'Documents & PDFs',
    mimeType: 'application/epub+zip',
    description: 'E-Book reader with table of contents chapter navigation, font size adjustment, and dark reading theme.',
    capabilities: ['Chapter Navigation', 'TOC Sidebar', 'Font Scaling', 'Night Mode Reader'],
    icon: BookOpen,
    color: 'text-indigo-500 dark:text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
  },

  // 7. Spreadsheets & Tabular Data
  {
    extension: '.xlsx',
    name: 'Microsoft Excel Spreadsheet',
    category: 'excel',
    categoryName: 'Spreadsheets',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Multi-sheet workbook explorer, cell formatting, column sorting, search filter, and CSV export.',
    capabilities: ['Multi-Sheet Tabs', 'Column Sort & Filter', 'Cell Grid', 'Row Search', 'Export Options'],
    icon: Table,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.csv',
    name: 'Comma-Separated Values',
    category: 'excel',
    categoryName: 'Spreadsheets',
    mimeType: 'text/csv',
    description: 'Fast tabular parser with instant column sort, text filtering, pagination, and raw data switch.',
    capabilities: ['Column Sorting', 'Instant Filter', 'Pagination', 'Export to JSON/XLSX'],
    icon: Table,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.tsv',
    name: 'Tab-Separated Values',
    category: 'excel',
    categoryName: 'Spreadsheets',
    mimeType: 'text/tab-separated-values',
    description: 'Tab-delimited dataset table view with delimiter auto-detection and statistical column summary.',
    capabilities: ['Auto Delimiter', 'Sortable Table', 'Fast Large File Paging'],
    icon: Table,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },

  // 8. Code & Scripts (50+ Languages)
  {
    extension: '.ts / .tsx',
    name: 'TypeScript & TSX Component',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/typescript',
    description: 'Monaco-grade syntax highlighting, line numbering, token coloring, and copyable snippet tools.',
    capabilities: ['Syntax Highlighting', 'Line Numbers', 'Token Search', 'Foldable Blocks'],
    icon: Code,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    extension: '.js / .jsx',
    name: 'JavaScript & React JSX',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/javascript',
    description: 'ECMAScript syntax rendering with function signatures and keyword formatting.',
    capabilities: ['Syntax Highlighting', 'Line Counters', 'Search & Replace'],
    icon: Code,
    color: 'text-yellow-500 dark:text-yellow-400',
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
  },
  {
    extension: '.py',
    name: 'Python Script',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/x-python',
    description: 'Python source code viewer with indentation guides and docstring formatting.',
    capabilities: ['Python Syntax', 'Indentation Guides', 'Dark/Light Theme'],
    icon: Code,
    color: 'text-cyan-500 dark:text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
  },
  {
    extension: '.rs / .go',
    name: 'Rust & Go Source Files',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/x-rust',
    description: 'Systems programming languages with keyword highlighting and struct/trait parsing.',
    capabilities: ['Syntax Coloring', 'Quick Search', 'Code Navigation'],
    icon: Code,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  {
    extension: '.cpp / .c / .h',
    name: 'C and C++ Source & Headers',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/x-c',
    description: 'Low-level C/C++ source code viewer with preprocessor directive highlights.',
    capabilities: ['Preprocessor Highlighting', 'Line Numbers', 'Header Matching'],
    icon: Code,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    extension: '.java / .kt',
    name: 'Java & Kotlin Source',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/x-java',
    description: 'JVM language code viewer with package declarations, annotations, and generic types.',
    capabilities: ['Annotation Highlighting', 'Syntax Coloring', 'Search In File'],
    icon: Code,
    color: 'text-orange-500 dark:text-orange-400',
    badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
  },
  {
    extension: '.sh / .bash',
    name: 'Shell & Bash Scripts',
    category: 'code',
    categoryName: 'Code & Scripts',
    mimeType: 'text/x-sh',
    description: 'Linux shell script runner preview with syntax coloring and parameter variables.',
    capabilities: ['CLI Highlighting', 'Shebang Detection', 'Fast Copy'],
    icon: Code,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },

  // 9. Config, Serialization & Markdown
  {
    extension: '.json',
    name: 'JavaScript Object Notation',
    category: 'json',
    categoryName: 'Config & JSON',
    mimeType: 'application/json',
    description: 'Interactive expandable/collapsible JSON tree node inspector and formatted code view.',
    capabilities: ['Interactive Node Tree', 'Expand / Collapse All', 'JSON Formatter', 'Key Search'],
    icon: Layers,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  {
    extension: '.yaml / .yml',
    name: 'YAML Configuration File',
    category: 'code',
    categoryName: 'Config & JSON',
    mimeType: 'text/yaml',
    description: 'Docker compose, Kubernetes, and application YAML configuration viewer with syntax colors.',
    capabilities: ['Syntax Highlighting', 'Tree Switcher', 'Line Numbers'],
    icon: Code,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.env',
    name: 'Environment Variables File',
    category: 'code',
    categoryName: 'Config & JSON',
    mimeType: 'text/plain',
    description: 'Secure local environment variables viewer with syntax highlighting and key-value clarity.',
    capabilities: ['Local Only Security', 'Key-Value Highlight', 'Copy Variable'],
    icon: Code,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },
  {
    extension: '.toml / .ini',
    name: 'TOML & INI Configuration',
    category: 'code',
    categoryName: 'Config & JSON',
    mimeType: 'text/plain',
    description: 'Cargo, Rust, Python pyproject, and Windows INI configuration files.',
    capabilities: ['Section Highlighting', 'Key-Value Pairs', 'Syntax Coloring'],
    icon: Code,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },
  {
    extension: '.md / .markdown',
    name: 'Markdown Document',
    category: 'markdown',
    categoryName: 'Config & JSON',
    mimeType: 'text/markdown',
    description: 'Rich GitHub-Flavored Markdown preview with tables, checklists, code blocks, and math formulas.',
    capabilities: ['GFM Rendering', 'Syntax Code Blocks', 'Task Checklists', 'Table Styling'],
    icon: FileText,
    color: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
  },

  // 10. Geospatial Maps
  {
    extension: '.geojson',
    name: 'GeoJSON Feature Collection',
    category: 'geojson',
    categoryName: 'Geospatial Maps',
    mimeType: 'application/geo+json',
    description: 'Interactive map viewer with marker clustering, polygon geometries, and feature property inspector.',
    capabilities: ['Interactive Map', 'Geometry Polygons & Pins', 'Property Inspector', 'Raw JSON Switch'],
    icon: MapPin,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.kml',
    name: 'Keyhole Markup Language',
    category: 'geojson',
    categoryName: 'Geospatial Maps',
    mimeType: 'application/vnd.google-earth.kml+xml',
    description: 'Google Earth geospatial markup parser and vector overlay visualizer.',
    capabilities: ['Map Overlays', 'Placemark List', 'Coordinate Inspector'],
    icon: MapPin,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },

  // 11. Subtitles & Captions
  {
    extension: '.srt',
    name: 'SubRip Subtitle File',
    category: 'subtitle',
    categoryName: 'Subtitles & Cues',
    mimeType: 'text/plain',
    description: 'Timed subtitle cue viewer with timecode list, search filter, and instant jump-to-time.',
    capabilities: ['Timecode List', 'Cue Search Filter', 'Video Player Sync', 'Timestamp Copy'],
    icon: Subtitles,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.vtt',
    name: 'Web Video Text Tracks',
    category: 'subtitle',
    categoryName: 'Subtitles & Cues',
    mimeType: 'text/vtt',
    description: 'HTML5 WebVTT caption tracks with styling tags and chronological cue browser.',
    capabilities: ['WebVTT Tags', 'Cue Timeline', 'Search Filter'],
    icon: Subtitles,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },

  // 12. Media (Video & Audio Studio Pro)
  {
    extension: '.mkv',
    name: 'Matroska Media Container (MKV)',
    category: 'video',
    categoryName: 'Media & Video',
    mimeType: 'video/x-matroska',
    description: 'Extensible Matroska container with EBML header parsing, multi-track audio/video stream inspection, subtitle detection, WebM compatibility profile, and zero-copy streaming.',
    capabilities: ['EBML Header Inspector', 'Multi-Track Audio/Video', 'Subtitle Stream Extraction', 'WebM Compatibility Mode', 'Zero-Copy Streaming'],
    icon: Video,
    color: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  },
  {
    extension: '.mp4 / .webm / .m4v',
    name: 'High-Definition & 4K Video',
    category: 'video',
    categoryName: 'Media & Video',
    mimeType: 'video/mp4',
    description: 'Hardware-accelerated edge-to-edge cinema video player supporting 4K UHD, theater mode, aspect fit/fill zoom, speed scaling (0.5x-2x), and PiP.',
    capabilities: ['Zero-Copy Blob Streaming', 'Edge-to-Edge Cinema Mode', 'Aspect Ratio Fit/Fill (No Black Bars)', 'Speed Controls (0.5x-2x)', 'Picture-in-Picture'],
    icon: Video,
    color: 'text-rose-500 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
  },
  {
    extension: '.mov / .avi / .wmv / .flv / .3gp / .ts',
    name: 'Expanded Video Containers',
    category: 'video',
    categoryName: 'Media & Video',
    mimeType: 'video/quicktime',
    description: 'Universal video container support with RIFF/AVI chunk parsing, Apple QuickTime box parsing, MPEG transport stream detection, and stream spec analyzer.',
    capabilities: ['Container Header Inspector', 'Codec FourCC Extraction', 'Native Stream Fallback', 'VLC/MPV Export'],
    icon: Video,
    color: 'text-indigo-500 dark:text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
  },
  {
    extension: '.flac / .alac / .wav / .aiff',
    name: 'Lossless Hi-Res Studio Audio',
    category: 'audio',
    categoryName: 'Media & Video',
    mimeType: 'audio/flac',
    description: 'High-resolution lossless master audio with 24-bit/32-bit sample depth inspector, stereo/multichannel analysis, live frequency waveform visualizer, and vinyl record turntable HUD.',
    capabilities: ['24-Bit Studio Master Support', 'Lossless Header Inspector', 'Frequency Visualizer Canvas', 'Vinyl Record Studio Player'],
    icon: Music,
    color: 'text-emerald-500 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
  },
  {
    extension: '.mp3 / .m4a / .aac / .ogg / .opus / .wma',
    name: 'Universal Audio Formats',
    category: 'audio',
    categoryName: 'Media & Video',
    mimeType: 'audio/mpeg',
    description: 'Standard lossy audio playback supporting MP3, AAC, Apple M4A, Opus, and Ogg Vorbis with interactive scrubber, volume boost, and playback specs.',
    capabilities: ['Audio Playback', 'Timeline Scrubber', 'Volume Controls', 'Bitrate & Sample Rate Inspector'],
    icon: Music,
    color: 'text-cyan-500 dark:text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
  },

  // 13. Images & Visuals
  {
    extension: '.png / .jpg / .svg / .webp',
    name: 'Raster & Vector Graphics',
    category: 'image',
    categoryName: 'Media & Video',
    mimeType: 'image/png',
    description: 'High-resolution image viewer with EXIF metadata inspector, smooth zoom, pan, and rotation.',
    capabilities: ['EXIF Metadata', 'Smooth Zoom & Pan', 'Rotate 90°', 'Pixel Dimensions'],
    icon: ImageIcon,
    color: 'text-pink-500 dark:text-pink-400',
    badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
  },

  // 14. Archives (ZIP, TAR, GZ)
  {
    extension: '.zip / .tar / .gz',
    name: 'Compressed Archive',
    category: 'archive',
    categoryName: 'Archives (ZIP/TAR)',
    mimeType: 'application/zip',
    description: 'In-browser archive decompression, folder hierarchy explorer, and 1-click nested file extraction.',
    capabilities: ['Folder Tree Hierarchy', 'File Size Analysis', 'Extract Nested Files', 'Instant Preview'],
    icon: Archive,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  },

  // 15. Hex & Low-level Inspection
  {
    extension: 'Any Binary File',
    name: 'Raw Binary Byte Stream',
    category: 'hex',
    categoryName: 'Hex & Low-level',
    mimeType: 'application/octet-stream',
    description: '16-column memory offset hex byte inspector with ASCII decoding, search, and byte statistics.',
    capabilities: ['16-Column Hex Grid', 'ASCII Translation', 'Memory Offsets (0x0000)', 'Byte Value Telemetry'],
    icon: Binary,
    color: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  }
];
