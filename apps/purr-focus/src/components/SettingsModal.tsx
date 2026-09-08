import React, { useState } from 'react';
import { Settings, X, Plus, Minus, Check, Clock, Coffee, Target, Volume2, Bell } from 'lucide-react';
import { TimerSettings } from '../types';
import { Language, translations } from '../i18n';
import { sounds } from '../sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onUpdateSettings: (newSettings: TimerSettings) => void;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  lang,
}) => {
  const t = translations[lang];

  const [focusMin, setFocusMin] = useState<number>(settings.focusMinutes);
  const [breakMin, setBreakMin] = useState<number>(settings.breakMinutes);
  const [purrEnabled, setPurrEnabled] = useState<boolean>(settings.enablePurr);
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(settings.enableChime);

  if (!isOpen) return null;

  const presets = [
    { label: '25m / 5m', focus: 25, breakTime: 5, desc: '표준' },
    { label: '50m / 10m', focus: 50, breakTime: 10, desc: '몰입' },
    { label: '15m / 3m', focus: 15, breakTime: 3, desc: '숏' },
    { label: '45m / 15m', focus: 45, breakTime: 15, desc: '집중' },
  ];

  const handleSelectPreset = (focus: number, breakTime: number) => {
    sounds.playPop();
    setFocusMin(focus);
    setBreakMin(breakTime);
  };

  const handleSaveAndApply = () => {
    sounds.playPop();
    const validFocus = Math.max(1, Math.min(180, Number(focusMin) || 25));
    const validBreak = Math.max(1, Math.min(60, Number(breakMin) || 5));
    onUpdateSettings({
      ...settings,
      focusMinutes: validFocus,
      breakMinutes: validBreak,
      enablePurr: purrEnabled,
      enableChime: chimeEnabled,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-[#0f1016]/90 backdrop-blur-lg rounded-2xl z-50 p-4 flex flex-col justify-between select-none text-xs text-gray-200 border border-white/10 shadow-2xl">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-1.5 font-bold text-white text-sm">
            <Settings className="w-4 h-4 text-cat-primary" />
            <span>{t.settings.title}</span>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Custom Time Controls */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-cat-primary flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{t.settings.customTimeTitle}</span>
          </span>

          {/* Focus Minutes Adjuster */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-gray-200 text-xs truncate">{t.settings.focusMinutes}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setFocusMin((prev) => Math.max(1, prev - (prev > 10 ? 5 : 1)));
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-black/40 px-2 py-0.5 rounded-lg border border-white/10 font-mono">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={focusMin}
                  onChange={(e) => setFocusMin(Math.max(1, Math.min(180, parseInt(e.target.value) || 1)))}
                  className="w-8 text-center bg-transparent font-bold text-amber-300 outline-none text-xs"
                />
                <span className="text-[10px] text-gray-400 ml-0.5">{t.settings.minutesUnit}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setFocusMin((prev) => Math.min(180, prev + 5));
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Break Minutes Adjuster */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Coffee className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="font-semibold text-gray-200 text-xs truncate">{t.settings.breakMinutes}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setBreakMin((prev) => Math.max(1, prev - 1));
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-black/40 px-2 py-0.5 rounded-lg border border-white/10 font-mono">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMin}
                  onChange={(e) => setBreakMin(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  className="w-8 text-center bg-transparent font-bold text-pink-300 outline-none text-xs"
                />
                <span className="text-[10px] text-gray-400 ml-0.5">{t.settings.minutesUnit}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setBreakMin((prev) => Math.min(60, prev + 1));
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Quick Presets Chips */}
        <div>
          <span className="text-[10px] font-semibold text-gray-400 block mb-1.5">{t.settings.presetLabel}</span>
          <div className="grid grid-cols-4 gap-1.5">
            {presets.map((p) => {
              const isSelected = focusMin === p.focus && breakMin === p.breakTime;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.focus, p.breakTime)}
                  className={`py-1.5 px-1 rounded-xl text-center border text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-tr from-pink-500/30 to-amber-500/30 border-cat-primary text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="block leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Audio Toggles */}
        <div className="space-y-1 pt-0.5">
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Volume2 className="w-3 h-3 text-pink-400" />
              <span>{t.settings.purrSound}</span>
            </span>
            <input
              type="checkbox"
              checked={purrEnabled}
              onChange={(e) => {
                sounds.playPop();
                setPurrEnabled(e.target.checked);
              }}
              className="accent-pink-500 w-3.5 h-3.5 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Bell className="w-3 h-3 text-amber-400" />
              <span>{t.settings.chimeSound}</span>
            </span>
            <input
              type="checkbox"
              checked={chimeEnabled}
              onChange={(e) => {
                sounds.playPop();
                setChimeEnabled(e.target.checked);
              }}
              className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSaveAndApply}
        className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-cat-primary to-cat-accent text-gray-950 font-bold text-center active:scale-95 shadow-lg shadow-cat-primary/20 hover:shadow-cat-primary/30 transition-all text-xs flex items-center justify-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{t.settings.saveAndApply}</span>
      </button>
    </div>
  );
};
