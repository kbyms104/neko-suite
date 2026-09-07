import React, { useState, useEffect } from 'react';
import { Sparkles, Play, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';

interface BongoCatHeaderProps {
  lang: Language;
  isFormatting: boolean;
  isFormatted: boolean;
  onRunFormat: () => void;
  bongoPaw: 'left' | 'right' | 'idle';
  onManualTap?: () => void;
}

export const BongoCatHeader: React.FC<BongoCatHeaderProps> = ({
  lang,
  isFormatting,
  isFormatted,
  onRunFormat,
  bongoPaw,
  onManualTap,
}) => {
  const t = translations[lang];
  const [localPaw, setLocalPaw] = useState<'left' | 'right' | 'idle'>(bongoPaw);
  const [clickCount, setClickCount] = useState<number>(0);
  const [showHeart, setShowHeart] = useState<boolean>(false);

  useEffect(() => {
    setLocalPaw(bongoPaw);
  }, [bongoPaw]);

  const handleCatClick = () => {
    const nextPaw = localPaw === 'left' ? 'right' : 'left';
    setLocalPaw(nextPaw);
    sounds.playKeyClick();
    if (Math.random() > 0.6) {
      sounds.playMeow();
    }
    setClickCount((prev) => prev + 1);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
    if (onManualTap) onManualTap();
  };

  return (
    <div className="bg-gradient-to-r from-[#171824] via-[#1a1b28] to-[#171824] border-b border-cat-border/80 px-4 py-3 select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Bongo Cat Visual Character Avatar */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={handleCatClick}
            title={t.bongo.hint}
            className="w-20 h-16 rounded-2xl bg-[#1f212f] border border-purple-500/30 shadow-inner flex items-center justify-center relative cursor-pointer group hover:border-purple-400 transition-all active:scale-95"
          >
            {/* Pop Heart on Click */}
            {showHeart && (
              <span className="absolute -top-3 text-sm animate-bounce select-none pointer-events-none z-20">
                💖
              </span>
            )}

            {/* SVG Bongo Cat */}
            <svg viewBox="0 0 100 80" className="w-full h-full p-1 drop-shadow-md">
              <defs>
                <linearGradient id="catBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f3f0e8" />
                </linearGradient>
                <linearGradient id="kbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2c2d3d" />
                  <stop offset="100%" stopColor="#1e1f2b" />
                </linearGradient>
              </defs>

              {/* Ears */}
              <polygon points="26,24 16,6 36,14" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2.5" />
              <polygon points="25,21 19,10 33,16" fill="#ffb4c2" />

              <polygon points="74,24 84,6 64,14" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2.5" />
              <polygon points="75,21 81,10 67,16" fill="#ffb4c2" />

              {/* Head */}
              <ellipse cx="50" cy="34" rx="30" ry="24" fill="url(#catBodyGrad)" stroke="#2b2d3b" strokeWidth="2.5" />

              {/* Eyes */}
              {isFormatting ? (
                // Happy/Focus Closed Eyes (> < style)
                <>
                  <path d="M 36 30 Q 41 26 46 30" fill="none" stroke="#2b2d3b" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 64 30 Q 59 26 54 30" fill="none" stroke="#2b2d3b" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                // Round Alert Eyes
                <>
                  <ellipse cx="38" cy="30" rx="3.5" ry="4.5" fill="#2b2d3b" />
                  <circle cx="37" cy="28.5" r="1.2" fill="#ffffff" />
                  <ellipse cx="62" cy="30" rx="3.5" ry="4.5" fill="#2b2d3b" />
                  <circle cx="61" cy="28.5" r="1.2" fill="#ffffff" />
                </>
              )}

              {/* Pink Nose & Cute Mouth */}
              <polygon points="50,35 48,37 52,37" fill="#ff9fb2" />
              <path d="M 46 39 Q 50 43 50 38 Q 50 43 54 39" fill="none" stroke="#2b2d3b" strokeWidth="1.8" strokeLinecap="round" />

              {/* Blush Cheek Circles */}
              <circle cx="31" cy="36" r="3.5" fill="#ffb4c2" opacity="0.6" />
              <circle cx="69" cy="36" r="3.5" fill="#ffb4c2" opacity="0.6" />

              {/* Whiskers */}
              <line x1="22" y1="33" x2="10" y2="31" stroke="#2b2d3b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="37" x2="11" y2="39" stroke="#2b2d3b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="78" y1="33" x2="90" y2="31" stroke="#2b2d3b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="78" y1="37" x2="89" y2="39" stroke="#2b2d3b" strokeWidth="1.5" strokeLinecap="round" />

              {/* Keyboard on Desk */}
              <rect x="20" y="58" width="60" height="18" rx="4" fill="url(#kbGrad)" stroke="#43465d" strokeWidth="1.5" />
              {/* Keycaps */}
              <line x1="26" y1="64" x2="74" y2="64" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="3 2" strokeLinecap="round" />
              <line x1="28" y1="70" x2="72" y2="70" stroke="#f6a354" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />

              {/* Left Paw */}
              <g
                transform={
                  localPaw === 'left'
                    ? 'translate(0, 7)'
                    : 'translate(0, 0)'
                }
                className="transition-transform duration-75"
              >
                <ellipse cx="32" cy="56" rx="6.5" ry="5.5" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2" />
                <ellipse cx="32" cy="57" rx="3.5" ry="2.5" fill="#ffb4c2" />
              </g>

              {/* Right Paw */}
              <g
                transform={
                  localPaw === 'right'
                    ? 'translate(0, 7)'
                    : 'translate(0, 0)'
                }
                className="transition-transform duration-75"
              >
                <ellipse cx="68" cy="56" rx="6.5" ry="5.5" fill="#ffffff" stroke="#2b2d3b" strokeWidth="2" />
                <ellipse cx="68" cy="57" rx="3.5" ry="2.5" fill="#ffb4c2" />
              </g>
            </svg>

            {/* Click Count Badge */}
            {clickCount > 0 && (
              <span className="absolute -bottom-1.5 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-purple-500/80 text-white font-bold shadow">
                {clickCount}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Bongo Cat</span>
                <span className="text-xs font-normal text-purple-300">Formatter</span>
              </h1>

              {isFormatting ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  <span>{t.bongo.typing}</span>
                </span>
              ) : isFormatted ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.bongo.done}</span>
                </span>
              ) : (
                <span className="text-[11px] text-gray-400">
                  {t.bongo.idle}
                </span>
              )}
            </div>

            <p className="text-[11px] text-gray-400 mt-0.5 max-w-sm leading-tight">
              {t.bongo.hint}
            </p>
          </div>
        </div>

        {/* Right: Quick Run Format Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunFormat}
            disabled={isFormatting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:via-indigo-400 hover:to-purple-500 active:scale-95 shadow-lg shadow-purple-500/25 border border-purple-400/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isFormatting ? 'animate-spin' : ''}`} />
            <span>{t.toolbar.format}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
