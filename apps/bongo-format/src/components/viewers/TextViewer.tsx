import React, { useState } from 'react';
import { FileText, Wand2 } from 'lucide-react';
import { Language, translations } from '../../i18n';
import { sounds } from '../../sound';

interface TextViewerProps {
  text: string;
  lang: Language;
  onTextChange: (text: string) => void;
}

export const TextViewer: React.FC<TextViewerProps> = ({
  text,
  lang,
  onTextChange,
}) => {
  const t = translations[lang];
  const [codecError, setCodecError] = useState<string | null>(null);

  // Text statistics
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  const byteCount = new TextEncoder().encode(text).length;

  const showError = (msg: string) => {
    setCodecError(msg);
    setTimeout(() => setCodecError(null), 2000);
  };

  const handleToUpper = () => {
    sounds.playPop();
    onTextChange(text.toUpperCase());
  };

  const handleToLower = () => {
    sounds.playPop();
    onTextChange(text.toLowerCase());
  };

  const handleToCamel = () => {
    sounds.playPop();
    const converted = text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return '';
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
    onTextChange(converted);
  };

  const handleToSnake = () => {
    sounds.playPop();
    const converted = text
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/_+/g, '_')
      .toLowerCase();
    onTextChange(converted);
  };

  const handleTrimClean = () => {
    sounds.playSuccess();
    const cleaned = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n');
    onTextChange(cleaned);
  };

  const handleBase64Encode = () => {
    sounds.playPop();
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    onTextChange(btoa(binary));
  };

  const handleBase64Decode = () => {
    try {
      const binary = atob(text.trim());
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      sounds.playSuccess();
      onTextChange(decoded);
    } catch {
      showError(lang === 'ko' ? '유효한 Base64가 아닙니다' : 'Invalid Base64');
    }
  };

  const handleUrlEncode = () => {
    sounds.playPop();
    onTextChange(encodeURIComponent(text));
  };

  const handleUrlDecode = () => {
    try {
      const decoded = decodeURIComponent(text);
      sounds.playSuccess();
      onTextChange(decoded);
    } catch {
      showError(lang === 'ko' ? '유효한 URL 인코딩이 아닙니다' : 'Invalid URL encoding');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12131a]">
      {/* Sub-toolbar: Stats and Helpers */}
      <div className="bg-[#161722] border-b border-cat-border/70 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FileText className="w-3.5 h-3.5 text-gray-500" />
          <span>{t.text.chars} <strong className="text-white">{charCount}</strong></span>
          <span>•</span>
          <span>{t.text.words} <strong className="text-white">{wordCount}</strong></span>
          <span>•</span>
          <span>{t.text.lines} <strong className="text-white">{lineCount}</strong></span>
          <span>•</span>
          <span>{t.text.bytes} <strong className="text-white">{byteCount}</strong></span>
          {codecError && (
            <span className="ml-2 text-[11px] font-bold text-rose-400">{codecError}</span>
          )}
        </div>

        {/* Transforms & Codecs */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            onClick={handleToUpper}
            className="px-2 py-1 rounded bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300"
          >
            {t.text.toUpper}
          </button>
          <button
            onClick={handleToLower}
            className="px-2 py-1 rounded bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300"
          >
            {t.text.toLower}
          </button>
          <button
            onClick={handleToCamel}
            className="px-2 py-1 rounded bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300"
          >
            {t.text.toCamel}
          </button>
          <button
            onClick={handleToSnake}
            className="px-2 py-1 rounded bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300"
          >
            {t.text.toSnake}
          </button>
          <button
            onClick={handleBase64Encode}
            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] text-amber-300"
          >
            {t.text.b64Encode}
          </button>
          <button
            onClick={handleBase64Decode}
            className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] text-amber-300"
          >
            {t.text.b64Decode}
          </button>
          <button
            onClick={handleUrlEncode}
            className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-[11px] text-sky-300"
          >
            {t.text.urlEncode}
          </button>
          <button
            onClick={handleUrlDecode}
            className="px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-[11px] text-sky-300"
          >
            {t.text.urlDecode}
          </button>
          <button
            onClick={handleTrimClean}
            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[11px] text-purple-300 font-medium"
          >
            <Wand2 className="w-3 h-3" />
            <span>{t.text.trimLines}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        spellCheck={false}
        placeholder="Type or paste plain text here..."
        className="flex-1 p-3 bg-transparent font-mono text-xs text-gray-200 leading-relaxed outline-none resize-none selection:bg-purple-500/30 selection:text-white"
      />
    </div>
  );
};
