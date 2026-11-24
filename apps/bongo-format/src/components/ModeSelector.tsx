import React from 'react';
import { ClipboardPaste, Copy, Check, FileText, Trash2, Database, Table, KeyRound, Sparkles, Download, History, Zap } from 'lucide-react';
import { FormatType, DetectedFormat } from '../types';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';

interface ModeSelectorProps {
  lang: Language;
  activeType: FormatType;
  onSelectType: (type: FormatType) => void;
  detected: DetectedFormat;
  onPasteClipboard: () => void;
  onCopyResult: () => void;
  onSaveFile: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  copied: boolean;
  saved: boolean;
  autoClip: boolean;
  onToggleAutoClip: () => void;
  historyCount: number;
  historyOpen: boolean;
  onToggleHistory: () => void;
  rawLength: number;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  lang,
  activeType,
  onSelectType,
  detected,
  onPasteClipboard,
  onCopyResult,
  onSaveFile,
  onLoadSample,
  onClear,
  copied,
  saved,
  autoClip,
  onToggleAutoClip,
  historyCount,
  historyOpen,
  onToggleHistory,
  rawLength,
}) => {
  const t = translations[lang];

  const handleTabClick = (type: FormatType) => {
    sounds.playPop();
    onSelectType(type);
  };

  const tabs: { type: FormatType; label: string; icon: React.ReactNode }[] = [
    { type: 'auto', label: t.tabs.auto, icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
    { type: 'json', label: t.tabs.json, icon: <span className="font-mono font-bold text-xs">{'{ }'}</span> },
    { type: 'sql', label: t.tabs.sql, icon: <Database className="w-3.5 h-3.5 text-blue-400" /> },
    { type: 'csv', label: t.tabs.csv, icon: <Table className="w-3.5 h-3.5 text-emerald-400" /> },
    { type: 'jwt', label: t.tabs.jwt, icon: <KeyRound className="w-3.5 h-3.5 text-amber-400" /> },
    { type: 'text', label: t.tabs.text, icon: <FileText className="w-3.5 h-3.5 text-gray-400" /> },
  ];

  return (
    <div className="bg-[#181924] border-b border-cat-border/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Format Tabs */}
      <div className="flex items-center gap-1 bg-[#13141c] p-1 rounded-xl border border-cat-border/60">
        {tabs.map((tab) => {
          const isActive = activeType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => handleTabClick(tab.type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.type === 'auto' && detected && (
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/30 text-purple-200">
                  {detected.summary}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center flex-wrap gap-1.5">
        {/* Auto-Clip Toggle */}
        <button
          onClick={onToggleAutoClip}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            autoClip
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-cat-card/60 border-cat-border/60 text-gray-400 hover:text-gray-200'
          }`}
          title={t.toolbar.autoClip}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{t.toolbar.autoClip}</span>
        </button>

        {/* Paste Clipboard */}
        <button
          onClick={onPasteClipboard}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cat-card hover:bg-cat-cardHover border border-cat-border text-xs text-gray-200 font-medium transition-all active:scale-95 shadow-sm"
          title={t.toolbar.paste}
        >
          <ClipboardPaste className="w-3.5 h-3.5 text-purple-400" />
          <span>{t.toolbar.paste}</span>
        </button>

        {/* Copy Result */}
        <button
          onClick={onCopyResult}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cat-card hover:bg-cat-cardHover border border-cat-border text-xs text-gray-200 font-medium transition-all active:scale-95 shadow-sm"
          title={t.toolbar.copy}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cat-primary" />}
          <span className={copied ? 'text-emerald-400 font-bold' : ''}>
            {copied ? t.app.copied : t.toolbar.copy}
          </span>
        </button>

        {/* Save File */}
        {rawLength > 0 && (
          <button
            onClick={onSaveFile}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cat-card hover:bg-cat-cardHover border border-cat-border text-xs text-gray-200 font-medium transition-all active:scale-95 shadow-sm"
            title={t.toolbar.saveFile}
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-sky-400" />}
            <span className={saved ? 'text-emerald-400 font-bold' : ''}>
              {saved ? t.app.saved : t.toolbar.saveFile}
            </span>
          </button>
        )}

        {/* History Toggle */}
        <button
          onClick={onToggleHistory}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            historyOpen
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
              : 'bg-cat-card/60 hover:bg-cat-card border-cat-border/60 text-gray-300'
          }`}
          title={t.toolbar.history}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t.toolbar.history} ({historyCount})</span>
        </button>

        {/* Load Sample */}
        <button
          onClick={onLoadSample}
          className="px-2.5 py-1.5 rounded-lg bg-cat-card/60 hover:bg-cat-card border border-cat-border/60 text-xs text-gray-400 hover:text-gray-200 transition-all"
          title={t.toolbar.sample}
        >
          {t.toolbar.sample}
        </button>

        {/* Clear */}
        {rawLength > 0 && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 text-gray-500 hover:text-rose-400 transition-all"
            title={t.toolbar.clear}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
