import React, { useState, useEffect } from 'react';
import { Download, Sparkles, ShieldCheck, Zap, Cpu, ArrowRight } from 'lucide-react';
import { sounds } from '../sound';
import { useLanguage } from '../context/LanguageContext';
import catSitImg from '../assets/cat_sit.png';

const TOTAL_FRAMES = 87;

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [frameIdx, setFrameIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [meowCount, setMeowCount] = useState(0);

  // 프레임 프리로딩
  useEffect(() => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `./cat_walk_frames/f_${String(i).padStart(3, '0')}.png`;
    }
  }, []);

  // 12fps 걷기 루프
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % TOTAL_FRAMES);
    }, 83);
    return () => clearInterval(interval);
  }, []);

  const handleCatClick = () => {
    sounds.playMeow();
    setMeowCount((prev) => prev + 1);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cat-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-cat-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[300px] bg-cat-violet/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-12">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cat-card border border-cat-border/80 text-xs font-semibold text-cat-primary mb-6 shadow-sm hover:border-cat-primary/40 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-cat-fur" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-tight mb-6">
            <span className="block">{t.hero.titleLine1}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cat-primary via-orange-400 to-cat-accent block mt-1 sm:mt-2">
              {t.hero.titleLine2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-8 whitespace-pre-line">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="./downloads/Neko Drop.exe"
              download="Neko Drop.exe"
              onClick={() => sounds.playSuccess()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cat-primary via-orange-500 to-cat-accent text-gray-950 font-bold text-base shadow-xl shadow-cat-primary/25 hover:shadow-cat-primary/40 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <Download className="w-5 h-5 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
              <span>{t.hero.downloadCta}</span>
              <span className="text-xs bg-black/20 text-gray-900 px-2 py-0.5 rounded-md font-mono">
                .exe
              </span>
            </a>

            <a
              href="#apps"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-cat-card hover:bg-cat-cardHover border border-cat-border hover:border-cat-primary/50 text-gray-200 font-semibold text-base transition-all"
            >
              <span>{t.hero.browseApps}</span>
              <ArrowRight className="w-4 h-4 text-cat-primary" />
            </a>
          </div>

          {/* 4 Core Function Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cat-card/60 border border-cat-border/60">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[11px] text-gray-400 truncate">{t.hero.cards.convert.title}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-100 truncate">{t.hero.cards.convert.desc}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cat-card/60 border border-cat-border/60">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[11px] text-gray-400 truncate">{t.hero.cards.process.title}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-100 truncate">{t.hero.cards.process.desc}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cat-card/60 border border-cat-border/60">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[11px] text-gray-400 truncate">{t.hero.cards.format.title}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-100 truncate">{t.hero.cards.format.desc}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cat-card/60 border border-cat-border/60">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-[11px] text-gray-400 truncate">{t.hero.cards.offline.title}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-100 truncate">{t.hero.cards.offline.desc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Cat Showcase Banner */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl glass-panel-glow p-6 sm:p-8 overflow-hidden">
            {/* Header bar of the mock app */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-gray-400">Neko Suite Preview</span>
              </div>
              <div className="text-xs text-cat-primary font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Ready</span>
              </div>
            </div>

            {/* Interactive Stage */}
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div 
                onClick={handleCatClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative cursor-pointer select-none group"
                title="Click cat to meow!"
              >
                {/* Speech Bubble */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-cat-card border border-cat-primary/40 text-cat-fur text-xs font-bold whitespace-nowrap shadow-lg animate-bounce-gentle">
                  {meowCount === 0 ? t.hero.preview.speechBubble : `${t.hero.preview.speechClicked} x${meowCount}`}
                </div>

                {/* Smooth Loop Cat Walking Animation */}
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                  <img
                    src={`./cat_walk_frames/f_${String(frameIdx).padStart(3, '0')}.png`}
                    alt="Walking Neko"
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    onError={(e) => {
                      e.currentTarget.src = catSitImg;
                    }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <span>{t.hero.preview.title}</span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {t.hero.preview.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
