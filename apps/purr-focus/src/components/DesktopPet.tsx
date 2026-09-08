import React, { useState } from 'react';
import { CatMotion, SessionMode } from '../types';
import { sounds } from '../sound';
import catSleepImg from '../assets/cat_sleep.png';
import catKneadImg from '../assets/cat_knead.png';

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
  const [bounce, setBounce] = useState(false);
  const isBreak = mode === 'break';

  const handlePetMouseDown = async (e: React.MouseEvent) => {
    sounds.playMeow();
    const newHeart = { id: Date.now(), x: e.nativeEvent.offsetX };
    setHearts((prev) => [...prev, newHeart]);
    setBounce(true);
    setTimeout(() => setBounce(false), 500);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
    onPet();

    if (e.button === 0) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_drag_window');
      } catch {
        try {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          await getCurrentWindow().startDragging();
        } catch {}
      }
    }
  };

  return (
    <div
      onMouseDown={handlePetMouseDown}
      data-tauri-drag-region
      className={`relative w-64 h-52 cursor-move select-none group flex items-center justify-center transition-transform ${
        bounce ? 'scale-105' : ''
      }`}
      title="고양이를 클릭하면 쓰다듬거나 드래그하여 이동할 수 있습니다! 🐾"
    >
      {/* Floating Hearts Particle Effects on Pet */}
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{ left: `${h.x}px` }}
          className="absolute -top-4 text-lg animate-bounce select-none pointer-events-none z-30 transition-all"
        >
          💖 🐾
        </span>
      ))}

      {/* Floating zZZ bubbles in Focus Sleeping mode */}
      {!isBreak && (
        <div className="absolute top-2 right-8 flex flex-col items-center pointer-events-none select-none z-20">
          <span className="text-xs font-mono font-bold text-pink-300 animate-pulse">z</span>
          <span className="text-sm font-mono font-bold text-pink-300/80 -mt-1 ml-3 animate-pulse delay-75">Z</span>
          <span className="text-base font-mono font-bold text-pink-300/60 -mt-1 ml-6 animate-pulse delay-150">Z</span>
        </div>
      )}

      {/* High-Quality Adorable Cat Artwork (Matches Neko Drop style 1:1) */}
      <div className="w-full h-full flex items-center justify-center p-1 pointer-events-none">
        <img
          src={isBreak ? catKneadImg : catSleepImg}
          alt="Purr Focus Companion"
          draggable={false}
          className={`w-full h-full object-contain pointer-events-none select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 ${
            isBreak ? 'animate-purr-vibrate' : 'animate-breathe'
          } group-hover:scale-105 active:scale-95`}
        />
      </div>
    </div>
  );
};
