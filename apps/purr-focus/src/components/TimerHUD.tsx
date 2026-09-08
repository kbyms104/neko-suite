import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Sparkles, Target, Settings } from 'lucide-react';
import { SessionMode } from '../types';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';

interface TimerHUDProps {
  mode: SessionMode;
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  onToggleTimer: () => void;
  onSkipSession: () => void;
  onResetTimer: () => void;
  onOpenSettings?: () => void;
  lang: Language;
}

export const TimerHUD: React.FC<TimerHUDProps> = ({
  mode,
  timeLeft,
  totalDuration,
  isRunning,
  onToggleTimer,
  onSkipSession,
  onResetTimer,
  onOpenSettings,
  lang,
}) => {
  const t = translations[lang];
  const isBreak = mode === 'break';

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

  const handleToggle = () => {
    sounds.playPop();
    onToggleTimer();
  };

  const handleSkip = () => {
    sounds.playPop();
    onSkipSession();
  };

  const handleReset = () => {
    sounds.playPop();
    onResetTimer();
  };

  return (
    <div className="w-full flex flex-col items-center select-none px-2">
      {/* Floating Glass Pill HUD */}
      <div className="rounded-2xl bg-[#171822]/90 backdrop-blur-md border border-white/10 shadow-xl px-4 py-2.5 flex items-center justify-between gap-3 w-full max-w-[280px]">
        {/* Left: Mode Badge & Time */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
              isBreak
                ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            {isBreak ? <Sparkles className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
          </div>

          <div
            onClick={() => {
              if (onOpenSettings) {
                sounds.playPop();
                onOpenSettings();
              }
            }}
            className={onOpenSettings ? "cursor-pointer group/timer" : ""}
            title={onOpenSettings ? "클릭하여 집중/휴식 시간 설정 ⚙️" : undefined}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-extrabold text-base text-white tracking-wider group-hover/timer:text-cat-primary transition-colors">
                {timeFormatted}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                  isBreak
                    ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {isBreak ? t.app.breakMode : t.app.focusMode}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${
                  isBreak ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1">
          {/* Play / Pause Toggle */}
          <button
            onClick={handleToggle}
            className={`p-2 rounded-xl text-white font-bold transition-all active:scale-90 shadow-md ${
              isBreak
                ? 'bg-pink-500 hover:bg-pink-400 shadow-pink-500/25'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-amber-500/25'
            }`}
            title={isRunning ? t.timer.pauseBtn : t.timer.startBtn}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
            title={t.timer.skipBtn}
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
            title={t.timer.resetBtn}
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenSettings();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-amber-300 transition-all active:scale-90"
              title="시간 및 타이머 설정 ⚙️"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
