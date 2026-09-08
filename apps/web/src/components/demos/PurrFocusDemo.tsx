import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Heart, Coffee, MousePointer, Play, Pause, RotateCcw, SkipForward, Download, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../sound';
import { useLanguage } from '../../context/LanguageContext';
import catSleepImg from '../../assets/purr/cat_sleep.png';
import catKneadImg from '../../assets/purr/cat_knead.png';

export const PurrFocusDemo: React.FC = () => {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<'FOCUS' | 'REST'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPurring, setIsPurring] = useState(false);
  const [kneadPaw, setKneadPaw] = useState<'left' | 'right'>('left');
  const [showHeart, setShowHeart] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const tipsKo = [
    '조용히 식빵 굽는 중... 집중하세요 zZZ',
    '목 뒤로 젖히고 승모근을 30초 풀어주라냥! 💆',
    '시원한 물 한 잔 마시고 눈 깜빡이기! 💧',
    '어깨를 활짝 펴고 깊게 심호흡 3번! 🧘',
    '손목 돌리기 10회! 터널증후군 예방하라냥! 🐾',
  ];

  const tipsEn = [
    'Cat-loafing quietly... stay in your flow zZZ',
    'Gently stretch your neck backwards for 30s! 💆',
    'Drink a glass of water and blink your eyes! 💧',
    'Roll your shoulders back and take 3 deep breaths! 🧘',
    'Circle your wrists 10 times to prevent strain! 🐾',
  ];

  const tips = lang === 'ko' ? tipsKo : tipsEn;

  // Timer Tick
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Cycle switch
      if (mode === 'FOCUS') {
        setMode('REST');
        setTimeLeft(5 * 60);
        sounds.playPurr();
        setIsPurring(true);
      } else {
        setMode('FOCUS');
        setTimeLeft(25 * 60);
        sounds.playPop();
        setIsPurring(false);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode]);

  // Knead paw animation during REST
  useEffect(() => {
    let kneadTimer: ReturnType<typeof setInterval> | null = null;
    if (mode === 'REST' || isPurring) {
      kneadTimer = setInterval(() => {
        setKneadPaw((prev) => (prev === 'left' ? 'right' : 'left'));
      }, 250);
    }
    return () => {
      if (kneadTimer) clearInterval(kneadTimer);
    };
  }, [mode, isPurring]);

  const toggleMode = (targetMode: 'FOCUS' | 'REST') => {
    setMode(targetMode);
    if (targetMode === 'REST') {
      setTimeLeft(5 * 60);
      sounds.playPurr();
      setIsPurring(true);
      setTipIndex(Math.floor(Math.random() * (tips.length - 1)) + 1);
    } else {
      setTimeLeft(25 * 60);
      sounds.playPop();
      setIsPurring(false);
      setTipIndex(0);
    }
  };

  const handlePetCat = () => {
    sounds.playMeow();
    sounds.playPurr();
    setIsPurring(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1500);
    setTimeout(() => setIsPurring(false), 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-cat-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white font-brand">{t.purrFocus.title}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
              {t.purrFocus.badge}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {t.purrFocus.subtitle}
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cat-card border border-cat-border">
          <button
            onClick={() => toggleMode('FOCUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'FOCUS'
                ? 'bg-cat-primary text-gray-950 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.purrFocus.focusModeBtn}</span>
          </button>
          <button
            onClick={() => toggleMode('REST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'REST'
                ? 'bg-cat-accent text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{t.purrFocus.restModeBtn}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Desktop Screen Simulator */}
        <div className="lg:col-span-8 rounded-2xl bg-cat-bg border border-cat-border p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
          {/* Simulated IDE / Desktop background code text */}
          <div className="absolute inset-0 p-4 opacity-15 font-mono text-[11px] leading-tight select-none pointer-events-none text-gray-400 overflow-hidden">
            <p>// Real Desktop Screen Simulation - Purr Focus Floating Overlay</p>
            <p>fn main() &#123;</p>
            <p>&nbsp;&nbsp;let app = tauri::Builder::default();</p>
            <p>&nbsp;&nbsp;app.plugin(tauri_plugin_opener::init())</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;.run(tauri::generate_context!())</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;.expect("error while running purr focus");</p>
            <p>&#125;</p>
            <p>// Transparent borderless window with click-through support</p>
          </div>

          {/* Floating Transparent Pet Mockup */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="mb-4 px-4 py-2 rounded-2xl bg-cat-card/90 backdrop-blur border border-pink-500/40 text-xs text-white shadow-xl flex items-center gap-2 animate-bounce-gentle">
              <span className="text-base">💬</span>
              <span className="font-medium text-pink-200">
                "{tips[tipIndex]}"
              </span>
            </div>

            {/* Interactive Desktop Pet Character (1:1 with DesktopPet) */}
            <div
              onClick={handlePetCat}
              className="relative w-64 h-52 cursor-pointer select-none group flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              title="고양이를 클릭하면 야옹 소리와 함께 골골송을 부릅니다!"
            >
              {/* Floating Hearts Particle Effects on Pet */}
              {showHeart && (
                <div className="absolute -top-3 text-lg animate-bounce select-none pointer-events-none z-30">
                  💖 🐾
                </div>
              )}

              {/* Floating zZZ bubbles in Focus Sleeping mode */}
              {mode === 'FOCUS' && (
                <div className="absolute top-2 right-8 flex flex-col items-center pointer-events-none select-none z-20">
                  <span className="text-xs font-mono font-bold text-pink-300 animate-pulse">z</span>
                  <span className="text-sm font-mono font-bold text-pink-300/80 -mt-1 ml-3 animate-pulse delay-75">Z</span>
                  <span className="text-base font-mono font-bold text-pink-300/60 -mt-1 ml-6 animate-pulse delay-150">Z</span>
                </div>
              )}

              {/* High-Quality Adorable Cat Artwork (Matches Neko Drop style 1:1) */}
              <div className="w-full h-full flex items-center justify-center p-1">
                <img
                  src={mode === 'REST' || isPurring ? catKneadImg : catSleepImg}
                  alt="Purr Focus Companion"
                  className={`w-full h-full object-contain filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
                    mode === 'REST' || isPurring ? 'animate-purr-vibrate' : 'animate-breathe'
                  }`}
                />
              </div>

              {/* Purr Sound Indicator */}
              {isPurring && (
                <div className="absolute -bottom-5 text-[11px] font-bold text-pink-400 animate-pulse flex items-center gap-1 bg-cat-card/90 px-2.5 py-0.5 rounded-full border border-pink-500/30 shadow-md">
                  <Heart className="w-3 h-3 fill-pink-400" />
                  <span>{t.purrFocus.purrIndicator}</span>
                </div>
              )}
            </div>

            {/* Floating Timer Pill HUD */}
            <div className="mt-5 px-4 py-2 rounded-2xl bg-cat-card/95 border border-cat-border shadow-xl flex items-center gap-3">
              <span className={`text-base font-black font-mono tracking-wider ${
                mode === 'FOCUS' ? 'text-cat-primary' : 'text-pink-400'
              }`}>
                {formatTime(timeLeft)}
              </span>

              <div className="flex items-center gap-1 border-l border-cat-border/60 pl-2">
                <button
                  onClick={() => {
                    sounds.playPop();
                    setIsRunning(!isRunning);
                  }}
                  className="p-1.5 rounded-lg bg-cat-bg hover:bg-cat-primary hover:text-gray-950 text-gray-300 transition-colors"
                  title={isRunning ? '일시정지' : '시작'}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
                    setIsRunning(false);
                  }}
                  className="p-1.5 rounded-lg bg-cat-bg hover:bg-white hover:text-gray-950 text-gray-400 transition-colors"
                  title="타이머 리셋"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    sounds.playPop();
                    toggleMode(mode === 'FOCUS' ? 'REST' : 'FOCUS');
                  }}
                  className="p-1.5 rounded-lg bg-cat-bg hover:bg-pink-500 hover:text-white text-gray-400 transition-colors"
                  title="다음 세션으로 건너뛰기"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.purrFocus.petHint}</span>
            </p>
          </div>
        </div>

        {/* Right: Spec Highlights & Download Card */}
        <div className="lg:col-span-4 rounded-2xl bg-cat-bg border border-cat-border p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.purrFocus.featuresTitle}</span>
            </h4>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
                <strong className="text-pink-300 block mb-1">{t.purrFocus.f1Title}</strong>
                {t.purrFocus.f1Desc}
              </div>

              <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
                <strong className="text-pink-300 block mb-1">{t.purrFocus.f2Title}</strong>
                {t.purrFocus.f2Desc}
              </div>

              <div className="p-3 rounded-xl bg-cat-card/50 border border-cat-border/50">
                <strong className="text-pink-300 block mb-1">{t.purrFocus.f3Title}</strong>
                {t.purrFocus.f3Desc}
              </div>
            </div>
          </div>

          {/* Direct Download Callout */}
          <div className="pt-2">
            <a
              href="./downloads/Purr Focus.exe"
              download="Purr Focus.exe"
              onClick={() => sounds.playPurr()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-500/30 hover:scale-[1.01] active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.purrFocus.downloadBtn}</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">4.5MB</span>
            </a>
            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Windows x64 · 무설치 포터블</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
