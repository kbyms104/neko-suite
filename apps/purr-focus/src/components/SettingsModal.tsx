import React from 'react';
import { Settings, X, Check } from 'lucide-react';
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

  if (!isOpen) return null;

  const presets = [
    { label: t.settings.presetStandard, focus: 25, breakTime: 5 },
    { label: t.settings.presetLong, focus: 50, breakTime: 10 },
    { label: t.settings.presetShort, focus: 15, breakTime: 3 },
  ];

  const handleSelectPreset = (focus: number, breakTime: number) => {
    sounds.playPop();
    onUpdateSettings({
      ...settings,
      focusMinutes: focus,
      breakMinutes: breakTime,
    });
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-2xl z-40 p-4 flex flex-col justify-between select-none text-xs text-gray-200">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Settings className="w-3.5 h-3.5 text-cat-primary" />
            <span>{t.settings.title}</span>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] font-semibold text-gray-400">{t.settings.presetLabel}</span>
          {presets.map((p) => {
            const isSelected = settings.focusMinutes === p.focus && settings.breakMinutes === p.breakTime;
            return (
              <button
                key={p.focus}
                onClick={() => handleSelectPreset(p.focus, p.breakTime)}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 font-bold'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{p.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            );
          })}
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
            <span>{t.settings.purrSound}</span>
            <input
              type="checkbox"
              checked={settings.enablePurr}
              onChange={(e) => {
                sounds.playPop();
                onUpdateSettings({ ...settings, enablePurr: e.target.checked });
              }}
              className="accent-purple-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
            <span>{t.settings.chimeSound}</span>
            <input
              type="checkbox"
              checked={settings.enableChime}
              onChange={(e) => {
                sounds.playPop();
                onUpdateSettings({ ...settings, enableChime: e.target.checked });
              }}
              className="accent-purple-500 rounded"
            />
          </label>
        </div>
      </div>

      <button
        onClick={() => {
          sounds.playPop();
          onClose();
        }}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-cat-primary to-cat-accent text-gray-950 font-bold text-center active:scale-95 shadow-md"
      >
        {t.settings.close}
      </button>
    </div>
  );
};
