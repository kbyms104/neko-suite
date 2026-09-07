import { DetectedFormat, FormatType } from '../types';

export function detectFormat(text: string): DetectedFormat {
  const trimmed = text.trim();
  if (!trimmed) {
    return { type: 'text', confidence: 1.0, summary: 'Empty' };
  }

  // 1. JWT Check: 3 parts separated by dots, each base64url characters
  const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (jwtRegex.test(trimmed)) {
    try {
      const parts = trimmed.split('.');
      const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const parsedHeader = JSON.parse(headerStr);
      if (parsedHeader && (parsedHeader.typ === 'JWT' || parsedHeader.alg)) {
        return { type: 'jwt', confidence: 0.98, summary: 'JWT Token' };
      }
    } catch {
      // not valid jwt payload
    }
  }

  // 2. JSON Check: starts with { or [
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      const isArray = Array.isArray(parsed);
      return {
        type: 'json',
        confidence: 0.99,
        summary: isArray ? `JSON Array (${parsed.length} items)` : 'JSON Object',
      };
    } catch {
      // Even if invalid, if it clearly looks like broken JSON, treat as JSON so the viewer highlights the error
      return { type: 'json', confidence: 0.85, summary: 'JSON (Syntax Error)' };
    }
  }

  // 3. SQL Check
  const sqlKeywords = [
    /\bSELECT\b/i,
    /\bINSERT\s+INTO\b/i,
    /\bUPDATE\b.*\bSET\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bCREATE\s+(TABLE|VIEW|INDEX|DATABASE)\b/i,
    /\bALTER\s+TABLE\b/i,
    /\bDROP\s+TABLE\b/i,
    /\bWITH\s+[a-zA-Z0-9_]+\s+AS\b/i,
    /\bFROM\s+[a-zA-Z0-9_.]+/i,
    /\bWHERE\b/i,
    /\bGROUP\s+BY\b/i,
    /\bORDER\s+BY\b/i,
  ];

  let sqlScore = 0;
  for (const regex of sqlKeywords) {
    if (regex.test(trimmed)) {
      sqlScore++;
    }
  }
  if (sqlScore >= 2 || (sqlScore >= 1 && (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH')))) {
    return { type: 'sql', confidence: 0.9, summary: 'SQL Query' };
  }

  // 4. CSV / TSV Check
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length >= 2) {
    const delimiters = [',', '\t', ';', '|'];
    for (const delim of delimiters) {
      const firstCount = (lines[0].match(new RegExp(`\\${delim}`, 'g')) || []).length;
      if (firstCount >= 1) {
        // check if subsequent lines have roughly the same delimiter count
        const matchingLines = lines.slice(1, 6).filter((line) => {
          const count = (line.match(new RegExp(`\\${delim}`, 'g')) || []).length;
          return count === firstCount;
        });
        if (matchingLines.length === Math.min(lines.length - 1, 5)) {
          const delimName = delim === '\t' ? 'TSV' : `CSV (${delim})`;
          return { type: 'csv', confidence: 0.88, summary: delimName };
        }
      }
    }
  }

  // 5. Default Plain Text
  return { type: 'text', confidence: 0.6, summary: 'Plain Text' };
}
