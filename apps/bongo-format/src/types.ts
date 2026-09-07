export type FormatType = 'auto' | 'json' | 'sql' | 'csv' | 'jwt' | 'text';

export type JsonViewMode = 'code' | 'tree' | 'table';

export interface CsvData {
  headers: string[];
  rows: string[][];
  delimiter: string;
  total_rows: number;
  total_cols: number;
}

export interface JsonFormatResult {
  formatted: string;
  is_valid: boolean;
  error_message?: string;
  line?: number;
  column?: number;
  is_array: boolean;
  item_count: number;
}

export interface DetectedFormat {
  type: FormatType;
  confidence: number;
  summary: string;
}

export interface JwtPayload {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  isExpired?: boolean;
  expiresAtFormatted?: string;
  issuedAtFormatted?: string;
}
