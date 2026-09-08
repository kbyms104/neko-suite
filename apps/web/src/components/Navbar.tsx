import React from 'react';
import { Volume2, VolumeX, Download, Github, Globe } from 'lucide-react';
import { sounds } from '../sound';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMuted, onToggleSound }) => {
  const { lang, setLang, t } = useLanguage();

  const handleMeow = () => {
    sounds.playMeow();
  };

  const handleToggleLang = (nextLang: 'ko' | 'en') => {
    sounds.playPop();
    setLang(nextLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 bg-[#121319]/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a 
          href="#" 
          onClick={handleMeow}
          className="flex items-center gap-3 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cat-primary to-cat-accent flex items-center justify-center shadow-lg shadow-cat-primary/20 group-hover:rotate-6 transition-transform">
            <span className="text-xl">🐾</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-bold text-xl text-white tracking-wide">Neko Suite</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cat-primary/20 text-cat-primary border border-cat-primary/30">
                {t.nav.releasedBadge}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">{t.nav.tagline}</p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#apps" className="hover:text-cat-primary transition-colors">
            {t.nav.appsLink}
          </a>
          <a href="#download" className="hover:text-cat-primary transition-colors">
            {t.nav.downloadLink}
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher (KR / ENG) */}
          <div className="flex items-center p-1 rounded-xl bg-cat-card border border-cat-border text-xs font-semibold">
            <button
              onClick={() => handleToggleLang('ko')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === 'ko'
                  ? 'bg-cat-primary text-gray-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              KR
            </button>
            <button
              onClick={() => handleToggleLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-cat-primary text-gray-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ENG
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isMuted ? t.nav.soundToggleOn : t.nav.soundToggleOff}
            className="p-2.5 rounded-xl bg-cat-card border border-cat-border text-gray-300 hover:text-cat-primary hover:border-cat-primary/50 transition-all flex items-center justify-center"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cat-primary animate-pulse" />
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/kbyms104/neko-suite"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-cat-card border border-cat-border text-gray-300 hover:text-white hover:border-white/30 transition-all hidden sm:flex items-center justify-center"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Quick Download Button */}
          <a
            href="./downloads/Neko Drop.exe"
            download="Neko Drop.exe"
            onClick={() => sounds.playSuccess()}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cat-primary to-orange-500 hover:from-cat-primaryHover hover:to-orange-400 text-gray-950 font-bold text-sm shadow-lg shadow-cat-primary/25 hover:shadow-cat-primary/40 transition-all transform active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.nav.quickDownload}</span>
            <span className="sm:hidden">.exe</span>
          </a>
        </div>
      </div>
    </header>
  );
};
