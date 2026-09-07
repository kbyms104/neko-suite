import React, { useState, useMemo } from 'react';
import { Table, Search, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CsvData } from '../../types';
import { Language, translations } from '../../i18n';
import { sounds } from '../../sound';

interface CsvViewerProps {
  csvData: CsvData | null;
  rawCsv: string;
  lang: Language;
  onDelimiterChange: (delim: string) => void;
  onTextChange: (text: string) => void;
}

export const CsvViewer: React.FC<CsvViewerProps> = ({
  csvData,
  rawCsv,
  lang,
  onDelimiterChange,
  onTextChange,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isRawView, setIsRawView] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const handleSort = (colIdx: number) => {
    sounds.playPop();
    if (sortCol === colIdx) {
      if (sortAsc) {
        setSortAsc(false);
      } else {
        setSortCol(null);
        setSortAsc(true);
      }
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  };

  // Filtered and sorted rows
  const displayRows = useMemo(() => {
    if (!csvData) return [];
    let rows = csvData.rows;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => r.some((cell) => cell.toLowerCase().includes(q)));
    }

    if (sortCol !== null && sortCol < csvData.headers.length) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortCol] || '';
        const valB = b[sortCol] || '';
        const numA = Number(valA);
        const numB = Number(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return rows;
  }, [csvData, searchQuery, sortCol, sortAsc]);

  const handleExportJson = () => {
    if (!csvData) return;
    const jsonArray = csvData.rows.map((row) => {
      const obj: Record<string, string> = {};
      csvData.headers.forEach((h, idx) => {
        obj[h] = row[idx] || '';
      });
      return obj;
    });

    navigator.clipboard.writeText(JSON.stringify(jsonArray, null, 2));
    sounds.playSuccess();
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12131a]">
      {/* Sub-toolbar */}
      <div className="bg-[#161722] border-b border-cat-border/70 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Table className="w-3.5 h-3.5" />
            <span>CSV / TSV Table</span>
          </span>

          {csvData && (
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>{t.csv.totalRows} <strong className="text-white">{csvData.total_rows}</strong></span>
              <span>•</span>
              <span>{t.csv.totalCols} <strong className="text-white">{csvData.total_cols}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Delimiter selector */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="text-[11px]">{t.csv.delimiter}</span>
            <select
              value={csvData?.delimiter || ','}
              onChange={(e) => onDelimiterChange(e.target.value)}
              className="bg-[#101118] border border-cat-border/80 rounded px-1.5 py-0.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500/60"
            >
              <option value=",">Comma (,)</option>
              <option value="&#9;">Tab (\t)</option>
              <option value=";">Semicolon (;)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {/* Search Filter */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-gray-500 absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.csv.searchPlaceholder}
              className="pl-7 pr-2 py-0.5 text-xs bg-[#101118] border border-cat-border/80 rounded-md text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/60 w-36"
            />
          </div>

          {/* Copy as JSON Array button */}
          <button
            onClick={handleExportJson}
            disabled={!csvData || csvData.rows.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300 transition-all disabled:opacity-40"
            title={t.csv.exportJson}
          >
            {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
            <span>{t.csv.exportJson}</span>
          </button>

          {/* Raw Toggle */}
          <button
            onClick={() => setIsRawView(!isRawView)}
            className="px-2 py-1 rounded-md hover:bg-white/5 text-[11px] text-gray-400 hover:text-white"
          >
            {isRawView ? 'Table View' : 'Raw Text'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {isRawView ? (
          <textarea
            value={rawCsv}
            onChange={(e) => onTextChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-transparent font-mono text-xs text-emerald-300 leading-relaxed outline-none resize-none"
          />
        ) : csvData && csvData.headers.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-lg border border-cat-border/80">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#1a1c27] text-purple-300 border-b border-cat-border">
                  <th className="py-2 px-3 w-12 text-gray-500 text-center select-none">#</th>
                  {csvData.headers.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => handleSort(idx)}
                      className="py-2 px-3 font-semibold truncate border-r border-cat-border/40 cursor-pointer hover:bg-white/5 select-none transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate">{col}</span>
                        {sortCol === idx ? (
                          sortAsc ? (
                            <ArrowUp className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-emerald-400 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-40 shrink-0" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-cat-border/40 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-1.5 px-3 text-gray-500 text-center select-none text-[11px]">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="py-1.5 px-3 text-gray-300 truncate max-w-xs border-r border-cat-border/30"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            No CSV data parsed
          </div>
        )}
      </div>
    </div>
  );
};
