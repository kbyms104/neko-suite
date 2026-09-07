import React from 'react';
import { Volume2, VolumeX, RefreshCw, Minus, X } from 'lucide-react';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';
import catBoxerImg from '../assets/cat_boxer.png';

interface TitleBarProps {
  lang: Language;
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  isScanning: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  lang,
  onToggleLang,
  isMuted,
  onToggleSound,
  onRefresh,
  isScanning,
}) => {
  const t = translations[lang];

  // Rust 백엔드 커맨드로 권한 제약 없이 100% 창 드래그
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
        console.log('start_drag_window fallback');
      }
    }
  };

  // Rust 백엔드 커맨드로 창 최소화
  const handleMinimize = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('minimize_window');
    } catch (e) {
      console.log('minimize fallback');
    }
  };

  // Rust 백엔드 커맨드로 창 닫기 및 앱 종료
  const handleExitApp = async () => {
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('close_window');
    } catch (e) {
      console.log('close fallback');
    }
  };

  const handleLogoClick = () => {
    sounds.playMeow();
  };

  return (
    <header
      onMouseDown={handleDragStart}
      data-tauri-drag-region
      className="h-11 bg-[#161720] border-b border-cat-border/80 flex items-center justify-between px-3 select-none shrink-0 z-30"
    >
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-2 pointer-events-none">
        <button
          onClick={handleLogoClick}
          title="야옹! 🐾"
          className="pointer-events-auto w-7 h-7 rounded-lg bg-[#252736] border border-cat-border/80 flex items-center justify-center p-0.5 shadow-sm hover:rotate-6 active:scale-90 transition-transform"
        >
          <img src={catBoxerImg} alt="Boxer Cat" className="w-full h-full object-contain" />
        </button>
        <div className="flex items-center gap-1.5 pointer-events-none">
          <span className="font-bold text-sm text-white tracking-wide">Neko Punch</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            v0.2
          </span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1 pointer-events-auto">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isScanning}
          title={t.app.refreshBtn}
          className="p-1.5 rounded-lg hover:bg-cat-card text-gray-400 hover:text-cat-primary transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cat-primary' : ''}`} />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isMuted ? t.app.soundOn : t.app.soundOff}
          className="p-1.5 rounded-lg hover:bg-cat-card text-gray-400 hover:text-white transition-all"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-cat-primary" />
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

        {/* Close (Exit App) Button */}
        <button
          onClick={handleExitApp}
          title={t.app.quit}
          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
