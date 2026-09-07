import React from 'react';
import { Database, Minimize2, Sparkles } from 'lucide-react';
import { Language, translations } from '../../i18n';

interface SqlViewerProps {
  sqlText: string;
  lang: Language;
  onFormat: () => void;
  onMinify: () => void;
  onTextChange: (text: string) => void;
}

export const SqlViewer: React.FC<SqlViewerProps> = ({
  sqlText,
  lang,
  onFormat,
  onMinify,
  onTextChange,
}) => {
  const t = translations[lang];

  const lines = sqlText.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12131a]">
      {/* Sub-toolbar */}
      <div className="bg-[#161722] border-b border-cat-border/70 px-3 py-1.5 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <Database className="w-3.5 h-3.5" />
            <span>SQL Query Formatter</span>
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            {t.sql.lines} {lines.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onMinify}
            className="px-2 py-1 rounded-md bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300 flex items-center gap-1 transition-all"
            title={t.sql.minify}
          >
            <Minimize2 className="w-3 h-3 text-purple-400" />
            <span>{t.sql.minify}</span>
          </button>

          <button
            onClick={onFormat}
            className="px-2 py-1 rounded-md bg-cat-card hover:bg-cat-cardHover border border-cat-border text-[11px] text-gray-300 flex items-center gap-1 transition-all"
            title={t.sql.format}
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{t.sql.format}</span>
          </button>
        </div>
      </div>

      {/* Editor with line numbers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers gutter */}
        <div className="bg-[#101117] text-gray-600 font-mono text-xs py-3 px-2 text-right select-none border-r border-cat-border/40 shrink-0 min-w-[36px]">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-relaxed">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Text editor */}
        <textarea
          value={sqlText}
          onChange={(e) => onTextChange(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent font-mono text-xs text-blue-300/90 leading-relaxed outline-none resize-none selection:bg-blue-500/30 selection:text-white"
          placeholder="SELECT * FROM table_name WHERE id = 42;"
        />
      </div>
    </div>
  );
};
