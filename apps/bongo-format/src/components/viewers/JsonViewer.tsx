import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, Table, Code2, FolderTree, Minimize2, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { JsonViewMode } from '../../types';
import { Language, translations } from '../../i18n';
import { sounds } from '../../sound';

interface JsonViewerProps {
  rawJson: string;
  formattedJson: string;
  isValid: boolean;
  errorMessage?: string;
  errorLine?: number;
  errorColumn?: number;
  isArray: boolean;
  lang: Language;
  onMinify: () => void;
  onPrettify: (spaces: number) => void;
  onTextChange?: (text: string) => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  rawJson,
  formattedJson,
  isValid,
  errorMessage,
  errorLine,
  errorColumn,
  isArray,
  lang,
  onMinify,
  onPrettify,
  onTextChange,
}) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<JsonViewMode>('code');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse JSON data for tree and table view
  const parsedData = useMemo(() => {
    if (!isValid || !formattedJson.trim()) return null;
    try {
      return JSON.parse(formattedJson);
    } catch {
      return null;
    }
  }, [formattedJson, isValid]);

  // Check if data is array of objects (suitable for 2D table view)
  const isTableEligible = useMemo(() => {
    if (!Array.isArray(parsedData) || parsedData.length === 0) return false;
    return typeof parsedData[0] === 'object' && parsedData[0] !== null && !Array.isArray(parsedData[0]);
  }, [parsedData]);

  // Extract table columns
  const tableColumns = useMemo(() => {
    if (!isTableEligible || !Array.isArray(parsedData)) return [];
    const colSet = new Set<string>();
    parsedData.slice(0, 50).forEach((item) => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach((k) => colSet.add(k));
      }
    });
    return Array.from(colSet);
  }, [parsedData, isTableEligible]);

  // Filtered table rows
  const filteredTableRows = useMemo(() => {
    if (!isTableEligible || !Array.isArray(parsedData)) return [];
    if (!searchQuery.trim()) return parsedData;
    const q = searchQuery.toLowerCase();
    return parsedData.filter((row) => {
      return Object.values(row).some((val) => String(val).toLowerCase().includes(q));
    });
  }, [parsedData, isTableEligible, searchQuery]);

  const toggleNode = (path: string) => {
    sounds.playPop();
    setExpandedNodes((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleExpandAll = () => {
    sounds.playPop();
    const newExpanded: Record<string, boolean> = { root: true };
    const traverse = (obj: any, path: string) => {
      if (typeof obj === 'object' && obj !== null) {
        newExpanded[path] = true;
        Object.entries(obj).forEach(([key, val]) => {
          traverse(val, `${path}.${key}`);
        });
      }
    };
    if (parsedData) traverse(parsedData, 'root');
    setExpandedNodes(newExpanded);
  };

  const handleCollapseAll = () => {
    sounds.playPop();
    setExpandedNodes({});
  };

  const copyVal = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    sounds.playPop();
    setTimeout(() => setCopiedKey(null), 1200);
  };

  // Render Tree Node recursively
  const renderTreeNode = (data: any, keyName: string, path: string, depth: number = 0) => {
    const isObject = typeof data === 'object' && data !== null;
    const isNodeArray = Array.isArray(data);
    const isExpanded = expandedNodes[path] ?? (depth < 2);

    if (isObject) {
      const entries = Object.entries(data);
      const isMatch =
        searchQuery &&
        (keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          JSON.stringify(data).toLowerCase().includes(searchQuery.toLowerCase()));

      return (
        <div key={path} className="font-mono text-xs leading-relaxed">
          <div
            onClick={() => toggleNode(path)}
            className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded hover:bg-white/5 cursor-pointer select-none group ${
              isMatch ? 'bg-purple-500/10' : ''
            }`}
            style={{ paddingLeft: `${depth * 14 + 4}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-300 transition-colors" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-300 transition-colors" />
            )}
            <span className="text-purple-300 font-semibold">{keyName}</span>
            <span className="text-gray-500 text-[11px]">
              {isNodeArray ? `[${entries.length}]` : `{${entries.length}}`}
            </span>
          </div>

          {isExpanded && (
            <div>
              {entries.map(([childKey, childVal]) =>
                renderTreeNode(childVal, childKey, `${path}.${childKey}`, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    // Primitive value
    const strVal = JSON.stringify(data);
    const isMatch =
      searchQuery &&
      (keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(data).toLowerCase().includes(searchQuery.toLowerCase()));

    let valColor = 'text-emerald-400';
    if (typeof data === 'number') valColor = 'text-amber-400';
    if (typeof data === 'boolean') valColor = 'text-rose-400';
    if (data === null) valColor = 'text-gray-400 italic';

    return (
      <div
        key={path}
        className={`flex items-center justify-between py-0.5 px-1.5 rounded font-mono text-xs hover:bg-white/5 group ${
          isMatch ? 'bg-purple-500/20' : ''
        }`}
        style={{ paddingLeft: `${depth * 14 + 18}px` }}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="text-gray-400 shrink-0">{keyName}:</span>
          <span className={`${valColor} truncate`}>{strVal}</span>
        </div>

        <button
          onClick={() => copyVal(String(data), path)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-opacity"
          title="값 복사"
        >
          {copiedKey === path ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12131a]">
      {/* Sub-toolbar: View Modes & Formatter options */}
      <div className="bg-[#161722] border-b border-cat-border/70 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#101118] p-0.5 rounded-lg border border-cat-border/60">
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'code'
                ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.json.viewCode}</span>
          </button>

          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'tree'
                ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>{t.json.viewTree}</span>
          </button>

          {isTableEligible && (
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{t.json.viewTable}</span>
            </button>
          )}
        </div>

        {/* Quick Format Modifiers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMinify}
            className="px-2 py-1 rounded-md bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300 flex items-center gap-1 transition-all"
            title={t.json.minify}
          >
            <Minimize2 className="w-3 h-3 text-purple-400" />
            <span>{t.json.minify}</span>
          </button>

          <button
            onClick={() => onPrettify(2)}
            className="px-2 py-1 rounded-md bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300 flex items-center gap-1 transition-all"
            title={t.json.prettify2}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{t.json.prettify2}</span>
          </button>

          {viewMode === 'tree' && (
            <>
              <div className="w-[1px] h-3 bg-cat-border/80 mx-0.5" />
              <button
                onClick={handleExpandAll}
                className="px-2 py-1 rounded-md hover:bg-white/5 text-[11px] text-gray-400 hover:text-gray-200"
              >
                {t.json.expandAll}
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2 py-1 rounded-md hover:bg-white/5 text-[11px] text-gray-400 hover:text-gray-200"
              >
                {t.json.collapseAll}
              </button>
            </>
          )}

          {/* Search Bar for Tree / Table */}
          {(viewMode === 'tree' || viewMode === 'table') && (
            <div className="relative flex items-center ml-1">
              <Search className="w-3 h-3 text-gray-500 absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.json.searchPlaceholder}
                className="pl-7 pr-2 py-0.5 text-xs bg-[#101118] border border-cat-border/80 rounded-md text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/60 w-36"
              />
            </div>
          )}
        </div>
      </div>

      {/* Syntax Error Alert Banner */}
      {!isValid && errorMessage && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-3 py-2 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <div className="flex-1 overflow-hidden truncate">
            <strong className="font-semibold">{t.json.invalidJson}</strong>{' '}
            <span className="font-mono">{errorMessage}</span>
            {errorLine && (
              <span className="ml-2 px-1.5 py-0.2 rounded bg-rose-500/30 text-white font-mono text-[10px]">
                {t.json.line} {errorLine}, {t.json.column} {errorColumn}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'code' && (
          <textarea
            value={formattedJson}
            onChange={(e) => onTextChange && onTextChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-transparent font-mono text-xs text-emerald-400/90 leading-relaxed outline-none resize-none selection:bg-purple-500/30 selection:text-white"
          />
        )}

        {viewMode === 'tree' && parsedData && (
          <div className="space-y-0.5">
            {renderTreeNode(parsedData, isArray ? 'root [Array]' : 'root {Object}', 'root', 0)}
          </div>
        )}

        {viewMode === 'table' && isTableEligible && (
          <div className="w-full overflow-x-auto rounded-lg border border-cat-border/80">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#1a1c27] text-purple-300 border-b border-cat-border">
                  <th className="py-2 px-3 w-12 text-gray-500 text-center">#</th>
                  {tableColumns.map((col) => (
                    <th key={col} className="py-2 px-3 font-semibold truncate border-r border-cat-border/40">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTableRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-cat-border/40 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-1.5 px-3 text-gray-500 text-center select-none text-[11px]">
                      {rowIdx + 1}
                    </td>
                    {tableColumns.map((col) => {
                      const val = (row as any)[col];
                      const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                      return (
                        <td key={col} className="py-1.5 px-3 text-gray-300 truncate max-w-xs border-r border-cat-border/30">
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
