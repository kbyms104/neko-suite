import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { BongoCatHeader } from './components/BongoCatHeader';
import { ModeSelector } from './components/ModeSelector';
import { JsonViewer } from './components/viewers/JsonViewer';
import { SqlViewer } from './components/viewers/SqlViewer';
import { CsvViewer } from './components/viewers/CsvViewer';
import { JwtViewer } from './components/viewers/JwtViewer';
import { TextViewer } from './components/viewers/TextViewer';
import { FormatType, CsvData, JsonFormatResult, HistoryItem } from './types';
import { detectFormat } from './utils/formatDetector';
import { Language, translations } from './i18n';
import { sounds } from './sound';
import { History, Trash2, X } from 'lucide-react';

// Sample datasets
const SAMPLES: Record<Exclude<FormatType, 'auto'>, string> = {
  json: `[{"id":1,"name":"Neko Drop","category":"converter","speed_ms":0.18,"active":true,"tags":["polars","rust"]},{"id":2,"name":"Neko Punch","category":"process_killer","speed_ms":0.05,"active":true,"tags":["sysinfo","windows"]},{"id":3,"name":"Bongo Format","category":"clipboard_formatter","speed_ms":0.08,"active":true,"tags":["arboard","sqlformat"]}]`,
  sql: `select u.id, u.username, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at >= '2026-01-01' and u.status in ('active', 'vip') group by u.id, u.username having count(o.id) > 5 order by total_spent desc limit 100;`,
  csv: `id,product_name,category,price,stock,rating\n101,Bongo Mechanical Keyboard,Hardware,149.99,42,4.9\n102,Cat Paw Silicone Keycap,Accessories,18.50,120,4.8\n103,Neko Marshmallow Deskmat,Desk,29.90,75,4.95\n104,Ultra-lightweight Mouse,Hardware,79.00,34,4.7\n105,Cat Ear Headphones,Audio,99.99,18,4.6`,
  jwt: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJvbmdvIENhdCIsInJvbGUiOiJwb3J0YWJsZS1kZXYiLCJpYXQiOjE3NzI4NTYwMDAsImV4cCI6MTgwNDM5MjAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
  text: `   === Neko Suite System Report ===\n\nApp 1: Neko Drop (Data file eater & converter)\nApp 2: Neko Punch (Port conflict killer)\nApp 3: Bongo Format (Clipboard data viewer)\n\nRAM Idle: < 20MB\nStartup: < 200ms\nOffline: 100% Local\n`,
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('bongo_format_lang');
      if (saved === 'en' || saved === 'ko') return saved;
    } catch {}
    return 'ko';
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bongo_format_muted') === 'true';
      sounds.setMuted(saved);
      return saved;
    } catch {
      return false;
    }
  });
  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(false);
  const [autoClip, setAutoClip] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bongo_format_autoclip');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('bongo_format_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Formatting states
  const [activeType, setActiveType] = useState<FormatType>('auto');
  const [rawText, setRawText] = useState<string>(SAMPLES.json);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [isFormatted, setIsFormatted] = useState<boolean>(false);
  const [bongoPaw, setBongoPaw] = useState<'left' | 'right' | 'idle'>('idle');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const lastAutoClipRef = useRef<string>('');
  const rawTextRef = useRef<string>(rawText);
  rawTextRef.current = rawText;

  const t = translations[lang];

  // Formatted representations
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [jsonValid, setJsonValid] = useState<boolean>(true);
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);
  const [jsonLine, setJsonLine] = useState<number | undefined>(undefined);
  const [jsonCol, setJsonCol] = useState<number | undefined>(undefined);
  const [jsonIsArray, setJsonIsArray] = useState<boolean>(false);

  const [formattedSql, setFormattedSql] = useState<string>('');
  const [csvData, setCsvData] = useState<CsvData | null>(null);

  // Format detection
  const detected = useMemo(() => detectFormat(rawText), [rawText]);
  const effectiveType: FormatType = activeType === 'auto' ? detected.type : activeType;

  // Persist preferences & history
  useEffect(() => {
    try {
      localStorage.setItem('bongo_format_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const pushHistory = useCallback((content: string, type: FormatType) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const resolvedType: Exclude<FormatType, 'auto'> =
      type === 'auto' ? (detectFormat(trimmed).type as Exclude<FormatType, 'auto'>) : type;
    const preview = trimmed.replace(/\s+/g, ' ').slice(0, 72);
    setHistory((prev) => {
      if (prev.length > 0 && prev[0].content === content) return prev;
      const filtered = prev.filter((item) => item.content !== content);
      const next: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: resolvedType,
        preview,
        content,
        timestamp: Date.now(),
      };
      return [next, ...filtered].slice(0, 10);
    });
  }, []);

  // Run initial formatting once on mount
  useEffect(() => {
    runFormat(rawText, 'json', false);
  }, []);

  // Format execution routine
  const runFormat = async (textToFormat: string, targetType: FormatType, playAnimation: boolean = true) => {
    if (!textToFormat.trim()) return;

    if (playAnimation) {
      setIsFormatting(true);
      let tapCount = 0;
      const interval = setInterval(() => {
        setBongoPaw((prev) => (prev === 'left' ? 'right' : 'left'));
        sounds.playKeyClick();
        tapCount++;
        if (tapCount >= 8) {
          clearInterval(interval);
          setBongoPaw('idle');
          setIsFormatting(false);
          setIsFormatted(true);
          sounds.playSuccess();
        }
      }, 65);
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');

      if (targetType === 'json') {
        const res = await invoke<JsonFormatResult>('format_json_cmd', {
          rawJson: textToFormat,
          indentSpaces: 2,
          minify: false,
        });
        setFormattedJson(res.formatted);
        setJsonValid(res.is_valid);
        setJsonError(res.error_message);
        setJsonLine(res.line);
        setJsonCol(res.column);
        setJsonIsArray(res.is_array);
      } else if (targetType === 'sql') {
        const res = await invoke<string>('format_sql_cmd', {
          query: textToFormat,
          indentSpaces: 2,
          uppercase: true,
        });
        setFormattedSql(res);
      } else if (targetType === 'csv') {
        const res = await invoke<CsvData>('parse_csv_cmd', {
          rawCsv: textToFormat,
          delimiter: null,
        });
        setCsvData(res);
      }
    } catch (err) {
      // Browser fallback if Tauri is not available
      if (targetType === 'json') {
        try {
          const parsed = JSON.parse(textToFormat);
          setFormattedJson(JSON.stringify(parsed, null, 2));
          setJsonValid(true);
          setJsonError(undefined);
          setJsonIsArray(Array.isArray(parsed));
        } catch (e: any) {
          setFormattedJson(textToFormat);
          setJsonValid(false);
          setJsonError(e.message);
        }
      } else if (targetType === 'sql') {
        setFormattedSql(textToFormat);
      } else if (targetType === 'csv') {
        const lines = textToFormat.trim().split('\n');
        const headers = (lines[0] || '').split(',').map((s) => s.trim());
        const rows = lines.slice(1).map((l) => l.split(',').map((s) => s.trim()));
        setCsvData({
          headers,
          rows,
          delimiter: ',',
          total_rows: rows.length,
          total_cols: headers.length,
        });
      }
    }
  };

  // Read clipboard helper
  const readClipboardText = async (): Promise<string> => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string>('read_clipboard');
    } catch {
      try {
        return await navigator.clipboard.readText();
      } catch {
        return '';
      }
    }
  };

  // Auto-paste on window focus when Auto-Clip is enabled
  useEffect(() => {
    if (!autoClip) return;
    const handleFocus = async () => {
      const clipText = await readClipboardText();
      if (!clipText || !clipText.trim()) return;
      if (clipText === lastAutoClipRef.current || clipText === rawTextRef.current) return;
      lastAutoClipRef.current = clipText;
      setRawText(clipText);
      const newDetected = detectFormat(clipText);
      const typeToUse = activeType === 'auto' ? newDetected.type : activeType;
      pushHistory(clipText, typeToUse);
      runFormat(clipText, typeToUse, true);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [autoClip, activeType, pushHistory]);

  // Paste from clipboard handler
  const handlePasteClipboard = async () => {
    const clipText = await readClipboardText();

    if (!clipText || !clipText.trim()) {
      sounds.playPop();
      return;
    }

    lastAutoClipRef.current = clipText;
    setRawText(clipText);
    const newDetected = detectFormat(clipText);
    const typeToUse = activeType === 'auto' ? newDetected.type : activeType;
    pushHistory(clipText, typeToUse);
    runFormat(clipText, typeToUse, true);
  };

  // Get active formatted string for Copy / Save
  const getActiveOutputContent = () => {
    if (effectiveType === 'json') return formattedJson || rawText;
    if (effectiveType === 'sql') return formattedSql || rawText;
    if (effectiveType === 'csv' && csvData) {
      return [
        csvData.headers.join(csvData.delimiter),
        ...csvData.rows.map((r) => r.join(csvData.delimiter)),
      ].join('\n');
    }
    return rawText;
  };

  // Copy result handler
  const handleCopyResult = async () => {
    const contentToCopy = getActiveOutputContent();

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('write_clipboard', { text: contentToCopy });
    } catch {
      await navigator.clipboard.writeText(contentToCopy);
    }

    sounds.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Save result to file handler
  const handleSaveFile = async () => {
    const content = getActiveOutputContent();
    if (!content.trim()) return;
    const extMap: Record<FormatType, string> = {
      auto: 'txt',
      json: 'json',
      sql: 'sql',
      csv: 'csv',
      jwt: 'txt',
      text: 'txt',
    };
    const extension = extMap[effectiveType] || 'txt';

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke<string>('save_formatted_file', { content, extension });
      sounds.playSuccess();
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      // Browser Blob download fallback
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bongo_export.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      sounds.playSuccess();
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  // Load sample handler
  const handleLoadSample = () => {
    sounds.playPop();
    const target = effectiveType === 'text' ? 'text' : (effectiveType as Exclude<FormatType, 'auto'>);
    const sample = SAMPLES[target] || SAMPLES.json;
    setRawText(sample);
    runFormat(sample, effectiveType, true);
  };

  // Clear handler
  const handleClear = () => {
    sounds.playPop();
    setRawText('');
    setFormattedJson('');
    setFormattedSql('');
    setCsvData(null);
    setIsFormatted(false);
  };

  // Always on top toggle
  const handleToggleAlwaysOnTop = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const next = await invoke<boolean>('toggle_always_on_top');
      setAlwaysOnTop(next);
    } catch {
      setAlwaysOnTop(!alwaysOnTop);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    try {
      localStorage.setItem('bongo_format_muted', String(next));
    } catch {}
    if (!next) {
      sounds.playPop();
    }
  };

  // Language toggle
  const handleToggleLang = () => {
    sounds.playPop();
    setLang((prev) => {
      const next = prev === 'ko' ? 'en' : 'ko';
      try {
        localStorage.setItem('bongo_format_lang', next);
      } catch {}
      return next;
    });
  };

  // Auto-Clip toggle
  const handleToggleAutoClip = () => {
    sounds.playPop();
    setAutoClip((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bongo_format_autoclip', String(next));
      } catch {}
      return next;
    });
  };

  // Minify JSON
  const handleMinifyJson = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<JsonFormatResult>('format_json_cmd', {
        rawJson: rawText,
        indentSpaces: 0,
        minify: true,
      });
      setFormattedJson(res.formatted);
    } catch {
      try {
        setFormattedJson(JSON.stringify(JSON.parse(rawText)));
      } catch {}
    }
  };

  // Prettify JSON
  const handlePrettifyJson = async (spaces: number) => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<JsonFormatResult>('format_json_cmd', {
        rawJson: rawText,
        indentSpaces: spaces,
        minify: false,
      });
      setFormattedJson(res.formatted);
    } catch {
      try {
        setFormattedJson(JSON.stringify(JSON.parse(rawText), null, spaces));
      } catch {}
    }
  };

  // Minify SQL
  const handleMinifySql = () => {
    sounds.playPop();
    const minified = formattedSql.replace(/\s+/g, ' ').trim();
    setFormattedSql(minified);
  };

  // Format SQL
  const handleFormatSql = async () => {
    runFormat(rawText, 'sql', true);
  };

  // Delimiter change for CSV
  const handleCsvDelimiterChange = async (delim: string) => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const res = await invoke<CsvData>('parse_csv_cmd', {
        rawCsv: rawText,
        delimiter: delim,
      });
      setCsvData(res);
    } catch {}
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#121319] text-gray-100 overflow-hidden border border-cat-border/90 rounded-xl shadow-2xl">
      {/* 1. Window TitleBar */}
      <TitleBar
        lang={lang}
        onToggleLang={handleToggleLang}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
      />

      {/* 2. Interactive Bongo Cat Header */}
      <BongoCatHeader
        lang={lang}
        isFormatting={isFormatting}
        isFormatted={isFormatted}
        onRunFormat={() => {
          pushHistory(rawText, effectiveType);
          runFormat(rawText, effectiveType, true);
        }}
        bongoPaw={bongoPaw}
      />

      {/* 3. Format Mode Selector & Action Toolbar */}
      <ModeSelector
        lang={lang}
        activeType={activeType}
        onSelectType={(type) => {
          setActiveType(type);
          const target = type === 'auto' ? detected.type : type;
          runFormat(rawText, target, false);
        }}
        detected={detected}
        onPasteClipboard={handlePasteClipboard}
        onCopyResult={handleCopyResult}
        onSaveFile={handleSaveFile}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        copied={copied}
        saved={saved}
        autoClip={autoClip}
        onToggleAutoClip={handleToggleAutoClip}
        historyCount={history.length}
        historyOpen={historyOpen}
        onToggleHistory={() => {
          sounds.playPop();
          setHistoryOpen((prev) => !prev);
        }}
        rawLength={rawText.length}
      />

      {/* History Drawer */}
      {historyOpen && (
        <div className="bg-[#151621] border-b border-cat-border/80 px-3 py-2 max-h-44 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> {t.toolbar.history} ({history.length})
            </span>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playPop();
                    setHistory([]);
                  }}
                  className="text-[10px] text-gray-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> {t.toolbar.clearHistory}
                </button>
              )}
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-[11px] text-gray-500 py-2 text-center">
              {t.toolbar.historyEmpty}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playPop();
                    setRawText(item.content);
                    const target = activeType === 'auto' ? item.type : activeType;
                    runFormat(item.content, target, true);
                    setHistoryOpen(false);
                  }}
                  className="text-left p-2 rounded-lg bg-[#1d1f2e] hover:bg-[#26293d] border border-cat-border/70 flex items-center gap-2 transition"
                >
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase font-bold shrink-0">
                    {item.type}
                  </span>
                  <span className="text-[11px] font-mono text-gray-300 truncate">
                    {item.preview}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Main Viewer Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {effectiveType === 'json' && (
          <JsonViewer
            rawJson={rawText}
            formattedJson={formattedJson || rawText}
            isValid={jsonValid}
            errorMessage={jsonError}
            errorLine={jsonLine}
            errorColumn={jsonCol}
            isArray={jsonIsArray}
            lang={lang}
            onMinify={handleMinifyJson}
            onPrettify={handlePrettifyJson}
            onTextChange={(val) => {
              setRawText(val);
              setFormattedJson(val);
            }}
          />
        )}

        {effectiveType === 'sql' && (
          <SqlViewer
            sqlText={formattedSql || rawText}
            lang={lang}
            onFormat={handleFormatSql}
            onMinify={handleMinifySql}
            onTextChange={(val) => {
              setRawText(val);
              setFormattedSql(val);
            }}
          />
        )}

        {effectiveType === 'csv' && (
          <CsvViewer
            csvData={csvData}
            rawCsv={rawText}
            lang={lang}
            onDelimiterChange={handleCsvDelimiterChange}
            onTextChange={(val) => {
              setRawText(val);
              runFormat(val, 'csv', false);
            }}
          />
        )}

        {effectiveType === 'jwt' && (
          <JwtViewer
            jwtText={rawText}
            lang={lang}
            onTextChange={(val) => setRawText(val)}
          />
        )}

        {effectiveType === 'text' && (
          <TextViewer
            text={rawText}
            lang={lang}
            onTextChange={(val) => setRawText(val)}
          />
        )}
      </main>
    </div>
  );
}
