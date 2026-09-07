import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { SessionMode } from '../types';

interface SpeechBubbleProps {
  message: string;
  mode: SessionMode;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ message, mode }) => {
  const isBreak = mode === 'break';

  return (
    <div className="relative animate-float-bubble mb-2 select-none px-2">
      <div
        className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 max-w-[260px] text-center leading-snug transition-all ${
          isBreak
            ? 'bg-pink-950/80 border-pink-500/40 text-pink-200 shadow-pink-500/10'
            : 'bg-[#1e202c]/90 border-white/15 text-gray-300 shadow-black/30'
        }`}
      >
        {isBreak ? (
          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
        ) : (
          <span className="text-xs shrink-0">🐾</span>
        )}
        <span>{message}</span>
      </div>

      {/* Bubble Tail */}
      <div
        className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] mx-auto -mt-[1px] ${
          isBreak ? 'border-t-pink-500/40' : 'border-t-white/15'
        }`}
      />
    </div>
  );
};
