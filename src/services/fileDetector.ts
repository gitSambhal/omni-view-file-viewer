/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { FileCategory } from '../types/file';

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()!.toLowerCase();
}

export function detectFileCategory(filename: string, mimeType: string = ''): FileCategory {
  const ext = getFileExtension(filename);
  const lowerName = filename.toLowerCase();

  // PDF
  if (ext === 'pdf' || mimeType.includes('pdf')) {
    return 'pdf';
  }

  // HTTP & REST Request files (.http, .rest)
  if (['http', 'rest'].includes(ext)) {
    return 'http';
  }

  // Binary, Executables, DLLs & Libraries (.dll, .exe, .so, .dylib, .bin, .sys, .class, .pyc, .o, .obj, .wasm, .dex, .elf, .msi, .drv, .ocx, .ax, .cpl, .scr, .ko)
  if (
    ['dll', 'exe', 'so', 'dylib', 'bin', 'sys', 'class', 'pyc', 'o', 'obj', 'wasm', 'dex', 'elf', 'msi', 'drv', 'ocx', 'ax', 'cpl', 'scr', 'ko', 'dat'].includes(ext) ||
    mimeType.includes('application/x-msdownload') ||
    mimeType.includes('application/x-sharedlib') ||
    mimeType.includes('application/x-executable')
  ) {
    return 'binary';
  }

  // Fonts & Typographic Specimen files (.ttf, .otf, .woff, .woff2, .eot)
  if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext) || mimeType.startsWith('font/')) {
    return 'font';
  }

  // Certificates, Keys & Security Credentials (.pem, .crt, .cer, .key, .pub, .pfx, .p12, .csr, .der)
  if (['pem', 'crt', 'cer', 'key', 'pub', 'pfx', 'p12', 'csr', 'der'].includes(ext)) {
    return 'certificate';
  }

  // E-books & OpenDocument / iWork (.epub, .mobi, .azw, .odt, .rtf, .pages, .key, .numbers, .odp)
  if (
    ['epub', 'mobi', 'azw', 'azw3', 'odt', 'rtf', 'pages', 'key', 'numbers', 'odp'].includes(ext) ||
    mimeType.includes('epub') ||
    mimeType.includes('opendocument')
  ) {
    return 'ebook';
  }

  // GeoJSON & Spatial map files (.geojson, .gpx, .kml, .topojson)
  if (['geojson', 'gpx', 'kml', 'topojson'].includes(ext)) {
    return 'geojson';
  }

  // Subtitles & Captions (.srt, .vtt, .ass, .ssa, .sub, .sbv)
  if (['srt', 'vtt', 'ass', 'ssa', 'sub', 'sbv'].includes(ext)) {
    return 'subtitle';
  }

  // Logs & Diagnostics (.log, .out, .err, access.log, error.log, syslog)
  if (
    ['log', 'out', 'err', 'syslog', 'journal'].includes(ext) ||
    lowerName.endsWith('.log') ||
    lowerName.includes('access_log') ||
    lowerName.includes('error_log')
  ) {
    return 'log';
  }

  // HTML & Web Documents (.html, .htm, .xhtml)
  if (['html', 'htm', 'xhtml'].includes(ext) || mimeType === 'text/html') {
    return 'html';
  }

  // Word (.docx, .doc)
  if (['docx', 'doc'].includes(ext) || mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
    return 'docx';
  }

  // Excel (.xlsx, .xls, .ods, .csv, .tsv, .parquet, .feather)
  if (['xlsx', 'xls', 'ods', 'csv', 'tsv', 'parquet', 'feather'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'excel';
  }

  // PowerPoint (.pptx, .ppt)
  if (['pptx', 'ppt'].includes(ext) || mimeType.includes('presentationml') || mimeType.includes('powerpoint')) {
    return 'pptx';
  }

  // Markdown
  if (['md', 'markdown', 'mdown', 'mkd'].includes(ext)) {
    return 'markdown';
  }

  // Database files (.db, .sqlite, .sqlite3, .sql, .accdb, .mdb, .ndjson)
  if (['db', 'sqlite', 'sqlite3', 'sql', 'accdb', 'mdb'].includes(ext)) {
    return 'database';
  }

  // JSON / Config formats that are strictly JSON
  if (['json', 'json5', 'jsonl', 'ndjson'].includes(ext)) {
    return 'json';
  }

  // Image files
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'heic', 'avif', 'psd', 'ai', 'eps', 'raw'].includes(ext) ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }

  // Audio files
  if (
    ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'opus', 'mid', 'midi'].includes(ext) ||
    mimeType.startsWith('audio/')
  ) {
    return 'audio';
  }

  // Video files
  if (
    ['mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'm4v', '3gp'].includes(ext) ||
    mimeType.startsWith('video/')
  ) {
    return 'video';
  }

  // Archive files
  if (['zip', 'tar', 'gz', 'tgz', 'rar', '7z', 'bz2', 'xz', 'iso'].includes(ext) || mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) {
    return 'archive';
  }

  // Code & Config files (50+ programming & scripting languages, including yaml, toml, env, ini)
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less', 'py', 'java', 'c', 'cpp', 'h', 'hpp',
    'cs', 'php', 'rb', 'rs', 'go', 'swift', 'kt', 'kotlin', 'dart', 'sh', 'bash', 'zsh', 'fish', 'ps1',
    'r', 'lua', 'scala', 'elixir', 'ex', 'exs', 'erl', 'clj', 'hs', 'ocaml', 'fs', 'f90', 'asm', 's',
    'pas', 'zig', 'nim', 'v', 'astro', 'vue', 'svelte', 'prisma', 'proto', 'graphql', 'dockerfile',
    'makefile', 'cmake', 'tf', 'terraform', 'sol', 'verilog', 'vhdl', 'wgsl', 'glsl', 'wat', 'wasm',
    'yaml', 'yml', 'toml', 'env', 'ini', 'conf', 'config', 'properties', 'plist', 'xml'
  ];
  if (
    codeExtensions.includes(ext) ||
    lowerName === 'dockerfile' ||
    lowerName === 'makefile' ||
    lowerName === 'cmakelists.txt' ||
    lowerName.startsWith('.env') ||
    lowerName.endsWith('.env')
  ) {
    return 'code';
  }

  // Text files
  if (
    ['txt', 'rtf', 'readme', 'license', 'changelog'].includes(ext) ||
    mimeType.startsWith('text/')
  ) {
    return 'text';
  }

  // Default fallback for unknown binary/other files -> Hex viewer
  return 'hex';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
