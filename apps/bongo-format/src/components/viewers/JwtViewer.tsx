import React, { useMemo } from 'react';
import { KeyRound, ShieldAlert, ShieldCheck, Clock, Copy, Check } from 'lucide-react';
import { Language, translations } from '../../i18n';
import { sounds } from '../../sound';

interface JwtViewerProps {
  jwtText: string;
  lang: Language;
  onTextChange: (text: string) => void;
}

export const JwtViewer: React.FC<JwtViewerProps> = ({
  jwtText,
  lang,
  onTextChange,
}) => {
  const t = translations[lang];

  const parsed = useMemo(() => {
    const trimmed = jwtText.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return { isValid: false, header: null, payload: null, signature: '' };
    }

    try {
      const decodeBase64Url = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        return decodeURIComponent(
          atob(padded)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      const signature = parts[2];

      // Expiry calculation
      let isExpired = false;
      let expiresAtFormatted = '';
      let issuedAtFormatted = '';

      if (payload.exp && typeof payload.exp === 'number') {
        const expDate = new Date(payload.exp * 1000);
        isExpired = Date.now() > payload.exp * 1000;
        expiresAtFormatted = expDate.toLocaleString();
      }

      if (payload.iat && typeof payload.iat === 'number') {
        const iatDate = new Date(payload.iat * 1000);
        issuedAtFormatted = iatDate.toLocaleString();
      }

      return {
        isValid: true,
        header,
        payload,
        signature,
        isExpired,
        hasExp: !!payload.exp,
        expiresAtFormatted,
        issuedAtFormatted,
      };
    } catch (e) {
      return { isValid: false, header: null, payload: null, signature: '' };
    }
  }, [jwtText]);

  const copyChunk = (content: string) => {
    navigator.clipboard.writeText(content);
    sounds.playPop();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#12131a]">
      {/* Sub-toolbar */}
      <div className="bg-[#161722] border-b border-cat-border/70 px-3 py-1.5 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>JWT Token Decoder</span>
          </span>

          {parsed.isValid && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                parsed.hasExp
                  ? parsed.isExpired
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {parsed.hasExp ? (
                parsed.isExpired ? (
                  <>
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>{t.jwt.expired}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{t.jwt.valid}</span>
                  </>
                )
              ) : (
                <span>{t.jwt.noExp}</span>
              )}
            </span>
          )}
        </div>

        {parsed.isValid && parsed.hasExp && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{t.jwt.expiresAt} <strong className="text-white">{parsed.expiresAtFormatted}</strong></span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-3 font-mono text-xs">
        {!parsed.isValid ? (
          <div className="space-y-2">
            <div className="text-rose-400 text-xs bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {t.jwt.invalidJwt}
            </div>
            <textarea
              value={jwtText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Paste raw JWT here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              className="w-full h-48 bg-[#151620] border border-cat-border/80 rounded-xl p-3 text-gray-300 outline-none resize-none"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Header Box */}
            <div className="rounded-xl bg-[#161722] border border-cat-border/80 p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-cat-border/50 pb-1.5 text-purple-300 font-bold">
                <span>{t.jwt.header}</span>
                <button
                  onClick={() => copyChunk(JSON.stringify(parsed.header, null, 2))}
                  className="hover:text-white"
                  title="Copy Header"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <pre className="text-purple-300/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {JSON.stringify(parsed.header, null, 2)}
              </pre>
            </div>

            {/* Payload Box */}
            <div className="rounded-xl bg-[#161722] border border-cat-border/80 p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-cat-border/50 pb-1.5 text-emerald-300 font-bold">
                <span>{t.jwt.payload}</span>
                <button
                  onClick={() => copyChunk(JSON.stringify(parsed.payload, null, 2))}
                  className="hover:text-white"
                  title="Copy Payload"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {JSON.stringify(parsed.payload, null, 2)}
              </pre>
            </div>

            {/* Signature Box */}
            <div className="col-span-full rounded-xl bg-[#161722] border border-cat-border/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between border-b border-cat-border/50 pb-1.5 text-blue-300 font-bold">
                <span>{t.jwt.signature}</span>
                <button
                  onClick={() => copyChunk(parsed.signature)}
                  className="hover:text-white"
                  title="Copy Signature"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-gray-400 break-all">{parsed.signature}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
