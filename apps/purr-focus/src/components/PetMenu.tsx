import React from 'react';
import { Volume2, VolumeX, Settings, Move, MousePointerClick, Minus, X } from 'lucide-react';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';

interface PetMenuProps {
  lang: Language;
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  clickThrough: boolean;
  onToggleClickThrough: () => void;
  onOpenSettings: () => void;
}

export const PetMenu: React.FC<PetMenuProps> = ({
  lang,
  onToggleLang,
  isMuted,
  onToggleSound,
  clickThrough,
  onToggleClickThrough,
  onOpenSettings,
}) => {
  const t = translations[lang];

  const handleDragStart = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (e.button === 0) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_drag_window');
      } catch {}
    }
  };

  const handleMinimize = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('minimize_window');
    } catch {}
  };

  const handleClose = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('close_window');
    } catch {}
  };

  return (
    <div
      onMouseDown={handleDragStart}
      data-tauri-drag-region
      className="w-full flex items-center justify-between px-3 py-1.5 rounded-2xl bg-[#14151e]/80 backdrop-blur-md border border-white/10 shadow-md select-none transition-opacity duration-200 cursor-move"
    >
      {/* Left: Drag Handle Indicator & Brand */}
      <div className="flex items-center gap-1.5 text-gray-400 pointer-events-none">
        <Move className="w-3.5 h-3.5 text-cat-primary" />
        <span className="text-[11px] font-bold text-white tracking-wide">Purr Focus</span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1 pointer-events-auto">
        {/* Click-Through Toggle */}
        <button
          onClick={onToggleClickThrough}
          title={clickThrough ? t.app.clickThroughOn : t.app.clickThroughOff}
          className={`p-1 rounded-lg border transition-all ${
            clickThrough
              ? 'bg-purple-500/25 border-purple-500/50 text-purple-300'
              : 'border-transparent hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? t.app.soundOff : t.app.soundOn}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title={t.app.settings}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-1 py-0.5 rounded text-[10px] font-bold bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          {lang === 'ko' ? 'ENG' : 'KR'}
        </button>

        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          title={t.app.minimize}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          title={t.app.quit}
          className="p-1 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
