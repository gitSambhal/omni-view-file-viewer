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

  // PDF
  if (ext === 'pdf' || mimeType.includes('pdf')) {
    return 'pdf';
  }

  // Word (.docx, .doc)
  if (['docx', 'doc'].includes(ext) || mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
    return 'docx';
  }

  // Excel (.xlsx, .xls, .ods, .csv, .tsv)
  if (['xlsx', 'xls', 'ods', 'csv', 'tsv'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
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

  // Database files (.db, .sqlite, .sqlite3, .sql, .accdb, .mdb)
  if (['db', 'sqlite', 'sqlite3', 'sql', 'accdb', 'mdb'].includes(ext)) {
    return 'database';
  }

  // JSON / XML / YAML
  if (['json', 'xml', 'yaml', 'yml'].includes(ext)) {
    return 'json';
  }

  // Image files
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'heic', 'avif'].includes(ext) ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }

  // Audio files
  if (
    ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'opus', 'mid'].includes(ext) ||
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
  if (['zip', 'tar', 'gz', 'tgz', 'rar', '7z'].includes(ext) || mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) {
    return 'archive';
  }

  // Code files
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less', 'py', 'java', 'c', 'cpp', 'h', 'hpp',
    'cs', 'php', 'rb', 'rs', 'go', 'swift', 'kt', 'dart', 'sh', 'bash', 'zsh', 'ps1', 'r', 'lua',
    'dockerfile', 'makefile', 'graphql', 'proto', 'toml', 'env', 'conf', 'ini', 'vue', 'svelte'
  ];
  if (codeExtensions.includes(ext) || filename.toLowerCase() === 'dockerfile' || filename.toLowerCase() === 'makefile') {
    return 'code';
  }

  // Text files
  if (
    ['txt', 'log', 'rtf', 'properties'].includes(ext) ||
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
