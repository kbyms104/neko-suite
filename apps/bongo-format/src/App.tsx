import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { BongoCatHeader } from './components/BongoCatHeader';
import { ModeSelector } from './components/ModeSelector';
import { JsonViewer } from './components/viewers/JsonViewer';
import { SqlViewer } from './components/viewers/SqlViewer';
import { CsvViewer } from './components/viewers/CsvViewer';
import { JwtViewer } from './components/viewers/JwtViewer';
import { TextViewer } from './components/viewers/TextViewer';
import { FormatType, CsvData, JsonFormatResult } from './types';
import { detectFormat } from './utils/formatDetector';
import { Language, translations } from './i18n';
import { sounds } from './sound';

// Sample datasets
const SAMPLES: Record<Exclude<FormatType, 'auto'>, string> = {
  json: `[{"id":1,"name":"Neko Drop","category":"converter","speed_ms":0.18,"active":true,"tags":["polars","rust"]},{"id":2,"name":"Neko Punch","category":"process_killer","speed_ms":0.05,"active":true,"tags":["sysinfo","windows"]},{"id":3,"name":"Bongo Format","category":"clipboard_formatter","speed_ms":0.08,"active":true,"tags":["arboard","sqlformat"]}]`,
  sql: `select u.id, u.username, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at >= '2026-01-01' and u.status in ('active', 'vip') group by u.id, u.username having count(o.id) > 5 order by total_spent desc limit 100;`,
  csv: `id,product_name,category,price,stock,rating\n101,Bongo Mechanical Keyboard,Hardware,149.99,42,4.9\n102,Cat Paw Silicone Keycap,Accessories,18.50,120,4.8\n103,Neko Marshmallow Deskmat,Desk,29.90,75,4.95\n104,Ultra-lightweight Mouse,Hardware,79.00,34,4.7\n105,Cat Ear Headphones,Audio,99.99,18,4.6`,
  jwt: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJvbmdvIENhdCIsInJvbGUiOiJwb3J0YWJsZS1kZXYiLCJpYXQiOjE3NzI4NTYwMDAsImV4cCI6MTgwNDM5MjAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
  text: `   === Neko Suite System Report ===\n\nApp 1: Neko Drop (Data file eater & converter)\nApp 2: Neko Punch (Port conflict killer)\nApp 3: Bongo Format (Clipboard data viewer)\n\nRAM Idle: < 20MB\nStartup: < 200ms\nOffline: 100% Local\n`,
};

export default function App() {
  const [lang, setLang] = useState<Language>('ko');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(false);

  // Formatting states
  const [activeType, setActiveType] = useState<FormatType>('auto');
  const [rawText, setRawText] = useState<string>(SAMPLES.json);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [isFormatted, setIsFormatted] = useState<boolean>(false);
  const [bongoPaw, setBongoPaw] = useState<'left' | 'right' | 'idle'>('idle');
  const [copied, setCopied] = useState<boolean>(false);

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

  // Paste from clipboard handler
  const handlePasteClipboard = async () => {
    let clipText = '';
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      clipText = await invoke<string>('read_clipboard');
    } catch {
      try {
        clipText = await navigator.clipboard.readText();
      } catch {
        // clipboard access blocked
      }
    }

    if (!clipText || !clipText.trim()) {
      sounds.playPop();
      return;
    }

    setRawText(clipText);
    const newDetected = detectFormat(clipText);
    const typeToUse = activeType === 'auto' ? newDetected.type : activeType;
    runFormat(clipText, typeToUse, true);
  };

  // Copy result handler
  const handleCopyResult = async () => {
    let contentToCopy = rawText;
    if (effectiveType === 'json') {
      contentToCopy = formattedJson || rawText;
    } else if (effectiveType === 'sql') {
      contentToCopy = formattedSql || rawText;
    } else if (effectiveType === 'csv' && csvData) {
      contentToCopy = [csvData.headers.join(csvData.delimiter), ...csvData.rows.map((r) => r.join(csvData.delimiter))].join('\n');
    }

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
    if (!next) {
      sounds.playPop();
    }
  };

  // Language toggle
  const handleToggleLang = () => {
    sounds.playPop();
    setLang((prev) => (prev === 'ko' ? 'en' : 'ko'));
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
        onRunFormat={() => runFormat(rawText, effectiveType, true)}
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
        onLoadSample={handleLoadSample}
        onClear={handleClear}
        copied={copied}
        rawLength={rawText.length}
      />

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
