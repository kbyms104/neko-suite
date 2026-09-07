import React from 'react';
import { Volume2, VolumeX, Pin, Minus, X, Sparkles } from 'lucide-react';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';

interface TitleBarProps {
  lang: Language;
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  lang,
  onToggleLang,
  isMuted,
  onToggleSound,
  alwaysOnTop,
  onToggleAlwaysOnTop,
}) => {
  const t = translations[lang];

  const handleDragStart = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }
    if (e.button === 0) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('start_drag_window');
      } catch (err) {
        // browser fallback
      }
    }
  };

  const handleMinimize = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('minimize_window');
    } catch (e) {
      // browser fallback
    }
  };

  const handleClose = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('close_window');
    } catch (e) {
      // browser fallback
    }
  };

  const handleLogoClick = () => {
    sounds.playMeow();
  };

  return (
    <header
      onMouseDown={handleDragStart}
      data-tauri-drag-region
      className="h-11 bg-[#15161f] border-b border-cat-border/80 flex items-center justify-between px-3 select-none shrink-0 z-30"
    >
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none">
        <button
          onClick={handleLogoClick}
          title="야옹! 🐾"
          className="pointer-events-auto w-7 h-7 rounded-lg bg-[#222433] border border-white/10 flex items-center justify-center p-0.5 shadow-sm hover:scale-110 active:scale-95 transition-transform"
        >
          <span className="text-base select-none">🐱</span>
        </button>
        <div className="flex items-center gap-1.5 pointer-events-none">
          <span className="font-bold text-sm text-white tracking-wide">Bongo Format</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {t.app.version}
          </span>
        </div>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-1 pointer-events-auto">
        {/* Always on Top Pin Toggle */}
        <button
          onClick={onToggleAlwaysOnTop}
          title={alwaysOnTop ? t.app.unpinAlwaysOnTop : t.app.alwaysOnTop}
          className={`p-1.5 rounded-lg border transition-all ${
            alwaysOnTop
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/20'
              : 'border-transparent hover:bg-cat-card text-gray-400 hover:text-white'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${alwaysOnTop ? 'rotate-45 text-purple-300 fill-purple-300/30' : ''}`} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? t.app.soundOff : t.app.soundOn}
          className="p-1.5 rounded-lg hover:bg-cat-card text-gray-400 hover:text-white transition-all"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-purple-300" />
          )}
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-1.5 py-0.5 rounded-lg text-[11px] font-bold bg-cat-card hover:bg-cat-cardHover border border-cat-border text-gray-300 hover:text-white transition-all"
          title="Switch Language"
        >
          {lang === 'ko' ? 'ENG' : 'KR'}
        </button>

        <div className="w-[1px] h-3 bg-cat-border/80 mx-1" />

        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          title={t.app.minimize}
          className="p-1.5 rounded-lg hover:bg-cat-card text-gray-400 hover:text-white transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          title={t.app.quit}
          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
