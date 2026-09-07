import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PetMenu } from './components/PetMenu';
import { DesktopPet } from './components/DesktopPet';
import { TimerHUD } from './components/TimerHUD';
import { SpeechBubble } from './components/SpeechBubble';
import { SettingsModal } from './components/SettingsModal';
import { SessionMode, CatMotion, TimerSettings } from './types';
import { Language, translations } from './i18n';
import { sounds } from './sound';

export default function App() {
  const [lang, setLang] = useState<Language>('ko');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<TimerSettings>({
    focusMinutes: 25,
    breakMinutes: 5,
    enablePurr: true,
    enableChime: true,
    clickThrough: false,
  });

  // Pomodoro timer states
  const [mode, setMode] = useState<SessionMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [motion, setMotion] = useState<CatMotion>('loafing');
  const [adviceIndex, setAdviceIndex] = useState<number>(0);

  const t = translations[lang];
  const isBreak = mode === 'break';
  const totalDuration = isBreak ? settings.breakMinutes * 60 : settings.focusMinutes * 60;

  // Active advice message
  const speechMessage = useMemo(() => {
    if (isBreak) {
      return t.advice[adviceIndex % t.advice.length];
    } else {
      return t.focusQuotes[adviceIndex % t.focusQuotes.length];
    }
  }, [isBreak, adviceIndex, lang, t]);

  // Timer countdown loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch session
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, settings]);

  // Switch session on timer complete
  const handleSessionComplete = () => {
    if (mode === 'focus') {
      // Transition to Break
      setMode('break');
      setTimeLeft(settings.breakMinutes * 60);
      setMotion('kneading');
      setAdviceIndex((prev) => prev + 1);

      if (settings.enableChime) {
        sounds.playChime(true);
      }
      if (settings.enablePurr && !isMuted) {
        sounds.startPurrLoop();
      }
    } else {
      // Transition to Focus
      setMode('focus');
      setTimeLeft(settings.focusMinutes * 60);
      setMotion('loafing');
      setAdviceIndex((prev) => prev + 1);
      sounds.stopPurrLoop();

      if (settings.enableChime) {
        sounds.playChime(false);
      }
    }
  };

  // Toggle Timer Play/Pause
  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      if (isBreak && settings.enablePurr && !isMuted) {
        sounds.startPurrLoop();
      }
    } else {
      sounds.stopPurrLoop();
    }
  };

  // Skip Session
  const handleSkipSession = () => {
    handleSessionComplete();
  };

  // Reset Timer
  const handleResetTimer = () => {
    setTimeLeft(isBreak ? settings.breakMinutes * 60 : settings.focusMinutes * 60);
  };

  // Pet the cat
  const handlePetCat = () => {
    setMotion('alert');
    setTimeout(() => {
      setMotion(isBreak ? 'kneading' : 'loafing');
    }, 2500);
  };

  // Click-Through toggle
  const handleToggleClickThrough = async () => {
    const next = !settings.clickThrough;
    setSettings({ ...settings, clickThrough: next });
    sounds.playPop();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_click_through', { enable: next });
    } catch {}
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (!next) {
      sounds.playPop();
      if (isBreak && settings.enablePurr) {
        sounds.startPurrLoop();
      }
    } else {
      sounds.stopPurrLoop();
    }
  };

  // Language toggle
  const handleToggleLang = () => {
    sounds.playPop();
    setLang((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  return (
    <div className="w-screen h-screen relative flex flex-col items-center justify-between p-3 select-none overflow-hidden bg-transparent">
      {/* 1. Top Mini Control Bar (Drag Handle, Settings, Mute) */}
      <PetMenu
        lang={lang}
        onToggleLang={handleToggleLang}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        clickThrough={settings.clickThrough}
        onToggleClickThrough={handleToggleClickThrough}
        onOpenSettings={() => {
          sounds.playPop();
          setIsSettingsOpen(true);
        }}
      />

      {/* 2. Middle: Speech Bubble & Interactive Cat */}
      <div className="flex flex-col items-center justify-center my-auto">
        <SpeechBubble message={speechMessage} mode={mode} />
        <DesktopPet
          mode={mode}
          motion={motion}
          isPaused={!isRunning}
          onPet={handlePetCat}
        />
      </div>

      {/* 3. Bottom: Floating Timer HUD */}
      <TimerHUD
        mode={mode}
        timeLeft={timeLeft}
        totalDuration={totalDuration}
        isRunning={isRunning}
        onToggleTimer={handleToggleTimer}
        onSkipSession={handleSkipSession}
        onResetTimer={handleResetTimer}
        lang={lang}
      />

      {/* 4. Settings Modal Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          setTimeLeft(
            mode === 'focus' ? newSettings.focusMinutes * 60 : newSettings.breakMinutes * 60
          );
        }}
        lang={lang}
      />
    </div>
  );
}
