import React, { useState } from 'react';
import { Sparkles, Copy, Check, Download, Table, Database, FileText, KeyRound } from 'lucide-react';
import { sounds } from '../../sound';
import { useLanguage } from '../../context/LanguageContext';

type DemoMode = 'json' | 'sql' | 'csv' | 'jwt';

const SAMPLES = {
  json: {
    raw: `{"user":{"id":42,"name":"Neko Master","tags":["rust","tauri","polars"],"stats":{"commits":1042,"speed_ms":0.18},"active":true}}`,
    formatted: `{\n  "user": {\n    "id": 42,\n    "name": "Neko Master",\n    "tags": [\n      "rust",\n      "tauri",\n      "polars"\n    ],\n    "stats": {\n      "commits": 1042,\n      "speed_ms": 0.18\n    },\n    "active": true\n  }\n}`,
  },
  sql: {
    raw: `select u.id, u.name, count(o.id) as orders, sum(o.total) as spent from users u left join orders o on u.id = o.user_id where u.active = 1 and o.status = 'completed' group by u.id, u.name order by spent desc limit 10;`,
    formatted: `SELECT\n  u.id,\n  u.name,\n  COUNT(o.id) AS orders,\n  SUM(o.total) AS spent\nFROM users u\nLEFT JOIN orders o\n  ON u.id = o.user_id\nWHERE\n  u.active = 1\n  AND o.status = 'completed'\nGROUP BY\n  u.id,\n  u.name\nORDER BY spent DESC\nLIMIT 10;`,
  },
  csv: {
    raw: `id,product_name,category,price,stock\n101,Bongo Mechanical Keyboard,Hardware,149.99,42\n102,Cat Paw Silicone Keycap,Accessories,18.50,120\n103,Neko Marshmallow Deskmat,Desk,29.90,75\n104,Ultra-lightweight Mouse,Hardware,79.00,34`,
    headers: ['id', 'product_name', 'category', 'price', 'stock'],
    rows: [
      ['101', 'Bongo Mechanical Keyboard', 'Hardware', '149.99', '42'],
      ['102', 'Cat Paw Silicone Keycap', 'Accessories', '18.50', '120'],
      ['103', 'Neko Marshmallow Deskmat', 'Desk', '29.90', '75'],
      ['104', 'Ultra-lightweight Mouse', 'Hardware', '79.00', '34'],
    ],
  },
  jwt: {
    raw: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkJvbmdvIENhdCIsInJvbGUiOiJkZXYiLCJleHAiOjE4MDQzOTIwMDB9.sample_signature`,
    header: `{\n  "alg": "HS256",\n  "typ": "JWT"\n}`,
    payload: `{\n  "sub": "1234567890",\n  "name": "Bongo Cat",\n  "role": "dev",\n  "exp": 1804392000 (Valid 🟢)\n}`,
  },
};

export const BongoFormatDemo: React.FC = () => {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<DemoMode>('json');
  const [isFormatted, setIsFormatted] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [bongoPaw, setBongoPaw] = useState<'left' | 'right' | 'idle'>('idle');
  const [showHeart, setShowHeart] = useState<boolean>(false);

  const runBongoFormat = () => {
    if (isTyping) return;
    setIsTyping(true);

    let count = 0;
    const interval = setInterval(() => {
      setBongoPaw((prev) => (prev === 'left' ? 'right' : 'left'));
      sounds.playBongoTap();
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setBongoPaw('idle');
        setIsTyping(false);
        setIsFormatted(true);
        sounds.playSuccess();
      }
    }, 65);
  };

  const handleModeChange = (newMode: DemoMode) => {
    sounds.playPop();
    setMode(newMode);
    setIsFormatted(false);
  };

  const handleCatClick = () => {
    const nextPaw = bongoPaw === 'left' ? 'right' : 'left';
    setBongoPaw(nextPaw);
    sounds.playBongoTap();
    sounds.playMeow();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleCopy = () => {
    let copyText = '';
    if (mode === 'json') copyText = isFormatted ? SAMPLES.json.formatted : SAMPLES.json.raw;
    if (mode === 'sql') copyText = isFormatted ? SAMPLES.sql.formatted : SAMPLES.sql.raw;
    if (mode === 'csv') copyText = SAMPLES.csv.raw;
    if (mode === 'jwt') copyText = isFormatted ? `${SAMPLES.jwt.header}\n${SAMPLES.jwt.payload}` : SAMPLES.jwt.raw;

    navigator.clipboard.writeText(copyText);
    setCopied(true);
    sounds.playPop();
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-cat-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white font-brand">{t.bongoFormat.title}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {t.bongoFormat.badge}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {t.bongoFormat.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Download Button */}
          <a
            href="/downloads/Bongo Format.exe"
            download="Bongo Format.exe"
            onClick={() => sounds.playSuccess()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === 'ko' ? 'Bongo Format.exe (4.4MB)' : 'Download .exe (4.4MB)'}</span>
          </a>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cat-card hover:bg-cat-cardHover border border-cat-border text-xs text-gray-300 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.bongoFormat.copiedBtn : t.bongoFormat.copyBtn}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Bongo Box */}
        <div className="lg:col-span-8 rounded-2xl bg-cat-bg border border-cat-border p-5 space-y-4">
          {/* Format Mode Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
            <div className="flex items-center gap-1 bg-cat-card/60 p-1 rounded-xl border border-cat-border">
              <button
                onClick={() => handleModeChange('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'json'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-mono text-xs">{'{ }'}</span>
                <span>JSON</span>
              </button>

              <button
                onClick={() => handleModeChange('sql')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'sql'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Database className="w-3 h-3 text-blue-400" />
                <span>SQL</span>
              </button>

              <button
                onClick={() => handleModeChange('csv')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'csv'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Table className="w-3 h-3 text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => handleModeChange('jwt')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === 'jwt'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>JWT</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-gray-500">
              {isFormatted ? '✨ Clean Formatted' : '⚡ Raw Clipboard Input'}
            </span>
          </div>

          {/* Bongo Cat Interactive Visualizer Bar */}
          <div className="rounded-xl bg-cat-card/60 border border-cat-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Animated SVG Bongo Cat Character Avatar */}
              <div
                onClick={handleCatClick}
                title="클릭하면 솜방망이를 두드립니다!"
                className="w-16 h-16 rounded-2xl bg-[#1f212f] border border-purple-500/30 shadow-inner flex items-center justify-center relative cursor-pointer group hover:border-purple-400 transition-all active:scale-95 overflow-hidden"
              >
                {showHeart && (
                  <span className="absolute -top-1 text-xs animate-bounce select-none pointer-events-none z-20">
                    💖
                  </span>
                )}

                <svg viewBox="0 0 100 80" className="w-full h-full p-1 drop-shadow-md">
                  <polygon points="26,24 16,6 36,14" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2.5" />
                  <polygon points="25,21 19,10 33,16" fill="#ffb4c2" />
                  <polygon points="74,24 84,6 64,14" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2.5" />
                  <polygon points="75,21 81,10 67,16" fill="#ffb4c2" />
                  <ellipse cx="50" cy="34" rx="30" ry="24" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2.5" />

                  {isTyping ? (
                    <>
                      <path d="M 36 30 Q 41 26 46 30" fill="none" stroke="#2b2d3b" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 64 30 Q 59 26 54 30" fill="none" stroke="#2b2d3b" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <ellipse cx="38" cy="30" rx="3.5" ry="4.5" fill="#2b2d3b" />
                      <circle cx="37" cy="28.5" r="1.2" fill="#ffffff" />
                      <ellipse cx="62" cy="30" rx="3.5" ry="4.5" fill="#2b2d3b" />
                      <circle cx="61" cy="28.5" r="1.2" fill="#ffffff" />
                    </>
                  )}

                  <polygon points="50,35 48,37 52,37" fill="#ff9fb2" />
                  <path d="M 46 39 Q 50 43 50 38 Q 50 43 54 39" fill="none" stroke="#2b2d3b" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="31" cy="36" r="3.5" fill="#ffb4c2" opacity="0.6" />
                  <circle cx="69" cy="36" r="3.5" fill="#ffb4c2" opacity="0.6" />

                  <rect x="20" y="58" width="60" height="18" rx="4" fill="#2c2d3d" stroke="#43465d" strokeWidth="1.5" />
                  <line x1="26" y1="64" x2="74" y2="64" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="3 2" strokeLinecap="round" />

                  {/* Left Paw */}
                  <g transform={bongoPaw === 'left' ? 'translate(0, 6)' : 'translate(0, 0)'} className="transition-transform duration-75">
                    <ellipse cx="32" cy="56" rx="6.5" ry="5.5" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2" />
                    <ellipse cx="32" cy="57" rx="3.5" ry="2.5" fill="#ffb4c2" />
                  </g>

                  {/* Right Paw */}
                  <g transform={bongoPaw === 'right' ? 'translate(0, 6)' : 'translate(0, 0)'} className="transition-transform duration-75">
                    <ellipse cx="68" cy="56" rx="6.5" ry="5.5" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2" />
                    <ellipse cx="68" cy="57" rx="3.5" ry="2.5" fill="#ffb4c2" />
                  </g>
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{t.bongoFormat.bongoTitle}</span>
                  {isTyping && (
                    <span className="text-[11px] text-purple-400 font-mono animate-pulse font-bold">
                      {t.bongoFormat.typingIndicator}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {t.bongoFormat.bongoDesc}
                </p>
              </div>
            </div>

            <button
              onClick={runBongoFormat}
              disabled={isTyping}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isFormatted ? t.bongoFormat.reformatBtn : t.bongoFormat.runFormatBtn}
            </button>
          </div>

          {/* Code/Table Viewer Box */}
          <div className="relative rounded-xl bg-[#0d0e12] border border-cat-border p-4 font-mono text-xs overflow-x-auto min-h-[220px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="uppercase font-semibold text-purple-300">{mode} Mode</span>
              </div>
              {isFormatted && (
                <button onClick={() => setIsFormatted(false)} className="text-gray-400 hover:text-white underline">
                  {t.bongoFormat.showRawBtn}
                </button>
              )}
            </div>

            {mode === 'json' && (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {isFormatted ? SAMPLES.json.formatted : SAMPLES.json.raw}
              </pre>
            )}

            {mode === 'sql' && (
              <pre className="text-blue-300 whitespace-pre-wrap leading-relaxed">
                {isFormatted ? SAMPLES.sql.formatted : SAMPLES.sql.raw}
              </pre>
            )}

            {mode === 'csv' && (
              isFormatted ? (
                <div className="overflow-x-auto rounded border border-cat-border/60">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-cat-card text-purple-300 border-b border-cat-border">
                        <th className="py-1 px-2 text-gray-500 text-center">#</th>
                        {SAMPLES.csv.headers.map((h) => (
                          <th key={h} className="py-1.5 px-3 font-semibold border-r border-cat-border/40">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLES.csv.rows.map((row, idx) => (
                        <tr key={idx} className="border-b border-cat-border/30 hover:bg-white/5">
                          <td className="py-1 px-2 text-gray-500 text-center">{idx + 1}</td>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 text-gray-300 border-r border-cat-border/20">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {SAMPLES.csv.raw}
                </pre>
              )
            )}

            {mode === 'jwt' && (
              isFormatted ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-purple-300 font-bold block mb-1">Header:</span>
                    <pre className="text-purple-300/90 bg-white/5 p-2 rounded">{SAMPLES.jwt.header}</pre>
                  </div>
                  <div>
                    <span className="text-emerald-300 font-bold block mb-1">Payload:</span>
                    <pre className="text-emerald-300/90 bg-white/5 p-2 rounded">{SAMPLES.jwt.payload}</pre>
                  </div>
                </div>
              ) : (
                <pre className="text-amber-400 whitespace-pre-wrap leading-relaxed break-all">
                  {SAMPLES.jwt.raw}
                </pre>
              )
            )}
          </div>
        </div>

        {/* Right: Spec Box */}
        <div className="lg:col-span-4 rounded-2xl bg-cat-bg border border-cat-border p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.bongoFormat.featuresTitle}</span>
          </h4>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
              <strong className="text-purple-300 block mb-1">{t.bongoFormat.f1Title}</strong>
              {t.bongoFormat.f1Desc}
            </div>

            <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
              <strong className="text-purple-300 block mb-1">{t.bongoFormat.f2Title}</strong>
              {t.bongoFormat.f2Desc}
            </div>

            <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
              <strong className="text-purple-300 block mb-1">{t.bongoFormat.f3Title}</strong>
              {t.bongoFormat.f3Desc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
