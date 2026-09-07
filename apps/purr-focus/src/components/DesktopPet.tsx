import React, { useState } from 'react';
import { CatMotion, SessionMode } from '../types';
import { sounds } from '../sound';

interface DesktopPetProps {
  mode: SessionMode;
  motion: CatMotion;
  isPaused: boolean;
  onPet: () => void;
}

export const DesktopPet: React.FC<DesktopPetProps> = ({
  mode,
  motion,
  isPaused,
  onPet,
}) => {
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const isBreak = mode === 'break';

  const handlePetClick = (e: React.MouseEvent) => {
    sounds.playMeow();
    const newHeart = { id: Date.now(), x: e.nativeEvent.offsetX };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
    onPet();
  };

  return (
    <div
      onClick={handlePetClick}
      className="relative w-56 h-48 cursor-pointer select-none group flex items-center justify-center"
      title="고양이를 클릭하면 쓰다듬을 수 있습니다!"
    >
      {/* Floating Hearts Particle Effects on Pet */}
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{ left: `${h.x}px` }}
          className="absolute -top-4 text-base animate-bounce select-none pointer-events-none z-30 transition-all"
        >
          💖
        </span>
      ))}

      {/* Floating zZZ particles in Focus Sleeping mode */}
      {!isBreak && motion === 'sleeping' && (
        <div className="absolute top-4 right-10 flex flex-col items-center pointer-events-none select-none z-20">
          <span className="text-xs font-mono font-bold text-purple-300 animate-pulse">z</span>
          <span className="text-sm font-mono font-bold text-purple-300/80 -mt-1 ml-3 animate-pulse delay-75">Z</span>
          <span className="text-base font-mono font-bold text-purple-300/60 -mt-1 ml-6 animate-pulse delay-150">Z</span>
        </div>
      )}

      {/* Cat SVG Graphics */}
      <svg
        viewBox="0 0 160 140"
        className={`w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] transition-transform ${
          isBreak ? 'animate-purr-vibrate' : 'animate-breathe'
        } group-hover:scale-105 active:scale-95`}
      >
        <defs>
          <linearGradient id="furGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f7f3ea" />
          </linearGradient>
          <linearGradient id="matGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb4c2" />
            <stop offset="100%" stopColor="#f6a354" />
          </linearGradient>
        </defs>

        {/* Soft Cushion Mat under Cat */}
        <ellipse cx="80" cy="115" rx="65" ry="16" fill="url(#matGrad)" opacity="0.35" />

        {/* Cat Tail */}
        <path
          d="M 125 95 C 145 90 150 70 140 60 C 135 55 130 65 132 75 C 130 85 120 95 110 100"
          fill="none"
          stroke="#e8e2d5"
          strokeWidth="8"
          strokeLinecap="round"
          className="transition-transform duration-500 origin-bottom"
        />

        {/* Cat Body (Round Loaf) */}
        <ellipse cx="80" cy="85" rx="46" ry="32" fill="url(#furGrad)" stroke="#3a3c4f" strokeWidth="2.5" />

        {/* Head */}
        <circle cx="80" cy="52" r="30" fill="url(#furGrad)" stroke="#3a3c4f" strokeWidth="2.5" />

        {/* Ears */}
        {/* Left Ear */}
        <polygon points="56,40 42,15 70,26" fill="#ffffff" stroke="#3a3c4f" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="56,37 46,20 67,27" fill="#ffb4c2" />

        {/* Right Ear */}
        <polygon points="104,40 118,15 90,26" fill="#ffffff" stroke="#3a3c4f" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="104,37 114,20 93,27" fill="#ffb4c2" />

        {/* Eyes */}
        {isBreak ? (
          // Happy Squinting Eyes during Kneading / Break (^ ^)
          <>
            <path d="M 64 48 Q 70 42 76 48" fill="none" stroke="#3a3c4f" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 84 48 Q 90 42 96 48" fill="none" stroke="#3a3c4f" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : motion === 'sleeping' ? (
          // Sleeping Calm Closed Eyes (- -)
          <>
            <line x1="64" y1="48" x2="76" y2="48" stroke="#3a3c4f" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="84" y1="48" x2="96" y2="48" stroke="#3a3c4f" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          // Round Alert Gentle Eyes (Loafing)
          <>
            <ellipse cx="70" cy="48" rx="3.5" ry="4.5" fill="#3a3c4f" />
            <circle cx="69" cy="46.5" r="1.2" fill="#ffffff" />
            <ellipse cx="90" cy="48" rx="3.5" ry="4.5" fill="#3a3c4f" />
            <circle cx="89" cy="46.5" r="1.2" fill="#ffffff" />
          </>
        )}

        {/* Pink Nose & Mouth */}
        <polygon points="80,56 77,59 83,59" fill="#ff9fb2" />
        <path d="M 75 62 Q 80 66 80 60 Q 80 66 85 62" fill="none" stroke="#3a3c4f" strokeWidth="2" strokeLinecap="round" />

        {/* Pink Blush Cheeks */}
        <circle cx="60" cy="56" r="4.5" fill="#ffb4c2" opacity="0.75" />
        <circle cx="100" cy="56" r="4.5" fill="#ffb4c2" opacity="0.75" />

        {/* Whiskers */}
        <line x1="52" y1="52" x2="36" y2="50" stroke="#3a3c4f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="58" x2="38" y2="60" stroke="#3a3c4f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="108" y1="52" x2="124" y2="50" stroke="#3a3c4f" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="108" y1="58" x2="122" y2="60" stroke="#3a3c4f" strokeWidth="1.5" strokeLinecap="round" />

        {/* Paws */}
        {isBreak ? (
          // Kneading Paws (꾹꾹이 애니메이션)
          <>
            {/* Left Kneading Paw */}
            <g className="animate-knead-left origin-center">
              <ellipse cx="66" cy="104" rx="8" ry="7" fill="#ffffff" stroke="#3a3c4f" strokeWidth="2" />
              <ellipse cx="66" cy="105" rx="4" ry="3" fill="#ffb4c2" />
            </g>
            {/* Right Kneading Paw */}
            <g className="animate-knead-right origin-center">
              <ellipse cx="94" cy="104" rx="8" ry="7" fill="#ffffff" stroke="#3a3c4f" strokeWidth="2" />
              <ellipse cx="94" cy="105" rx="4" ry="3" fill="#ffb4c2" />
            </g>
          </>
        ) : (
          // Loafing Tucked Paws (식빵 굽기)
          <>
            <ellipse cx="68" cy="102" rx="9" ry="6" fill="#ffffff" stroke="#3a3c4f" strokeWidth="2" />
            <ellipse cx="68" cy="103" rx="4" ry="2.5" fill="#ffb4c2" />
            <ellipse cx="92" cy="102" rx="9" ry="6" fill="#ffffff" stroke="#3a3c4f" strokeWidth="2" />
            <ellipse cx="92" cy="103" rx="4" ry="2.5" fill="#ffb4c2" />
          </>
        )}
      </svg>
    </div>
  );
};
