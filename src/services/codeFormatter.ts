/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserMarkdown from 'prettier/plugins/markdown';
import * as parserYaml from 'prettier/plugins/yaml';

export interface FormatOptions {
  tabWidth?: number;
  useTabs?: boolean;
  printWidth?: number;
  semi?: boolean;
  singleQuote?: boolean;
}

/**
 * Format SQL queries cleanly with capitalized keywords and indentation
 */
export function formatSql(sql: string, indentSpaces: number = 2): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING',
    'LIMIT', 'OFFSET', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'FULL JOIN', 'CROSS JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE',
    'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
    'CREATE INDEX', 'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE',
    'END', 'AS', 'IN', 'NOT IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'
  ];

  let cleaned = sql.trim();
  if (!cleaned) return '';

  // Capitalize SQL keywords
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    cleaned = cleaned.replace(regex, kw);
  });

  // Break lines before major clauses
  const majorClauses = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
    'HAVING', 'LIMIT', 'OFFSET', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'FULL JOIN', 'CROSS JOIN', 'JOIN', 'VALUES', 'SET'
  ];

  let formatted = cleaned;
  majorClauses.forEach(clause => {
    const regex = new RegExp(`\\s+(${clause})\\b`, 'g');
    formatted = formatted.replace(regex, `\n$1`);
  });

  // Indent lines that are not top-level clauses
  const lines = formatted.split('\n').map(l => l.trim()).filter(Boolean);
  const indent = ' '.repeat(indentSpaces);
  const result: string[] = [];

  for (let line of lines) {
    const startsWithMajor = majorClauses.some(mc => line.startsWith(mc));
    if (startsWithMajor || line.startsWith('CREATE') || line.startsWith('INSERT') || line.startsWith('UPDATE') || line.startsWith('DELETE')) {
      result.push(line);
    } else {
      result.push(indent + line);
    }
  }

  return result.join('\n');
}

/**
 * Format generic JSON/JSON5
 */
export function formatJson(jsonStr: string, indentSpaces: number = 2): string {
  try {
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, indentSpaces);
  } catch (err) {
    return jsonStr;
  }
}

/**
 * Robust Multi-language Code Formatter
 */
export async function formatCode(
  code: string,
  language: string,
  options: FormatOptions = {}
): Promise<{ formatted: string; success: boolean; error?: string }> {
  const { tabWidth = 2, useTabs = false, printWidth = 90, semi = true, singleQuote = true } = options;
  const lang = language.toLowerCase();

  // Fast path for empty or whitespace-only code
  if (!code || !code.trim()) {
    return { formatted: code, success: true };
  }

  // 1. JSON
  if (lang === 'json' || lang === 'jsonc') {
    try {
      const formatted = formatJson(code, tabWidth);
      return { formatted, success: true };
    } catch (e: any) {
      return { formatted: code, success: false, error: e.message };
    }
  }

  // 2. SQL
  if (lang === 'sql') {
    try {
      const formatted = formatSql(code, tabWidth);
      return { formatted, success: true };
    } catch (e: any) {
      return { formatted: code, success: false, error: e.message };
    }
  }

  // 3. Prettier Standalone for JS, TS, HTML, CSS, Markdown, YAML, etc.
  try {
    let parserName: string | null = null;
    const plugins = [parserBabel, parserEstree, parserHtml, parserPostcss, parserMarkdown, parserYaml];

    if (['javascript', 'js', 'jsx', 'mjs', 'cjs'].includes(lang)) {
      parserName = 'babel';
    } else if (['typescript', 'ts', 'tsx'].includes(lang)) {
      parserName = 'babel-ts';
    } else if (['html', 'htm', 'xml', 'svg', 'xhtml'].includes(lang)) {
      parserName = 'html';
    } else if (['css', 'scss', 'less'].includes(lang)) {
      parserName = 'css';
    } else if (['markdown', 'md', 'mdx'].includes(lang)) {
      parserName = 'markdown';
    } else if (['yaml', 'yml'].includes(lang)) {
      parserName = 'yaml';
    }

    if (parserName) {
      const formatted = await prettier.format(code, {
        parser: parserName,
        plugins,
        tabWidth,
        useTabs,
        printWidth,
        semi,
        singleQuote
      });
      return { formatted, success: true };
    }
  } catch (err: any) {
    console.warn('Prettier format warning, applying fallback clean:', err);
    // Fallback: clean trailing whitespace and normalize indent
    const fallback = code
      .split('\n')
      .map(l => l.trimEnd())
      .join('\n');
    return { formatted: fallback, success: false, error: err.message };
  }

  // 4. Default generic fallback (Python, Bash, C++, Rust, Go, etc.)
  const normalized = code
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');

  return { formatted: normalized, success: true };
}
